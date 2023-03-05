/* eslint-disable lines-between-class-members */
/* eslint-disable max-params */
/* eslint-disable sort-class-members/sort-class-members */

/**
 * JavaScript adopted from Bernt Arne Odegaard's Financial Numerical Recipes
 * http://finance.bi.no/~bernt/gcc_prog/algoritms/algoritms/algoritms.html
 * by Steve Derezinski, CXWeb, Inc. http://www.cxweb.com
 * Copyright (C) 1998  Steve Derezinski, Bernt Arne Odegaard
 */

type Delta = number
type Gamma = number
type Price = number
type Rate = number // risk free interest rate, e.g. 5.25% → (5.25/100)
type Rho = number
type Sigma = number // volatility, e.g. 40% → (40/100)
type Strike = number
type Theta = number
type Time = number // to expiration in years, e.g. 20 days → (20/365)
type TypeBoolean = boolean // true for call, false for put
type TypeUnion = 'call' | 'put'
type Underlying = Price
type Vega = number

export interface Option {
  delta: Delta
  gamma: Gamma
  price: Price
  rho: Rho
  theta: Theta
  vega: Vega
}

export class BlackScholes {
  //

  // Normal distribution function
  private static NDF(this: void, x: number): number {
    return Math.exp(-(x * x) / 2) / Math.sqrt(2 * Math.PI)
  }

  // Cumulative normal distribution function (interpolated, single precision accuracy)
  // http://stackoverflow.com/questions/5259421/cumulative-distribution-function-in-javascript
  private static CNDFs(this: void, x: number): number {
    const a1 = 0.31938153
    const a2 = -0.356563782
    const a3 = 1.781477937
    const a4 = -1.821255978
    const a5 = 1.330274429

    let k1: number
    let k2: number

    if (x < 0) return 1.0 - BlackScholes.CNDFs(-x)
    else if (x > 6) return 1.0
    else {
      k1 = 1.0 / (1.0 + 0.2316419 * x)
      k2 = ((((a5 * k1 + a4) * k1 + a3) * k1 + a2) * k1 + a1) * k1
      return 1.0 - BlackScholes.NDF(x) * k2
    }
  }

  // Cumulative normal distribution function (interpolated, double precision accuracy)
  // http://stackoverflow.com/questions/2328258/cumulative-normal-distribution-function-in-c-c
  private static CNDFd(this: void, x: number): number {
    const RT2PI = Math.sqrt(2 * Math.PI)
    const SPLIT = 7.07106781186547
    const N0 = 220.206867912376
    const N1 = 221.213596169931
    const N2 = 112.079291497871
    const N3 = 33.912866078383
    const N4 = 6.37396220353165
    const N5 = 0.700383064443688
    const N6 = 0.0352624965998911
    const M0 = 440.413735824752
    const M1 = 793.826512519948
    const M2 = 637.333633378831
    const M3 = 296.564248779674
    const M4 = 86.7807322029461
    const M5 = 16.064177579207
    const M6 = 1.75566716318264
    const M7 = 0.0883883476483184
    const z = Math.abs(x)

    let answer = 0.0
    let k1: number
    let k2: number
    let k3: number

    if (z <= 37) {
      k1 = Math.exp((-z * z) / 2)
      if (z < SPLIT) {
        k2 = (((((N6 * z + N5) * z + N4) * z + N3) * z + N2) * z + N1) * z + N0
        k3 = ((((((M7 * z + M6) * z + M5) * z + M4) * z + M3) * z + M2) * z + M1) * z + M0
        answer = (k1 * k2) / k3
      } else {
        k3 = z + 1.0 / (z + 2.0 / (z + 3.0 / (z + 4.0 / (z + 13.0 / 20.0))))
        answer = k1 / (RT2PI * k3)
      }
    }
    return x <= 0 ? answer : 1 - answer
  }

  // Calculates probability of occuring below and above target price
  protected static probability(
    this: void,
    price: Price,
    target: Underlying,
    time: Time,
    sigma: Sigma,
  ): [number, number] {
    const vt = sigma * Math.sqrt(time)
    const lnpq = Math.log(target / price)
    const d1 = lnpq / vt

    const y = Math.floor((1 / (1 + 0.2316419 * Math.abs(d1))) * 100000) / 100000
    const z = Math.floor(0.3989423 * Math.exp(-(d1 * d1) / 2) * 100000) / 100000

    const y5 = 1.330274 * Math.pow(y, 5)
    const y4 = 1.821256 * Math.pow(y, 4)
    const y3 = 1.781478 * Math.pow(y, 3)
    const y2 = 0.356538 * Math.pow(y, 2)
    const y1 = 0.3193815 * y

    let x = 1 - z * (y5 - y4 + y3 - y2 + y1)
    x = Math.floor(x * 100000) / 100000
    if (d1 < 0) x = 1 - x

    const pbelow = Math.floor(x * 1000) / 10
    const pabove = Math.floor((1 - x) * 1000) / 10

    return [pbelow, pabove]
  }

  //

  private readonly CNDF: (x: number) => number
  private readonly priceToSigmaAccuracy: number
  private readonly priceToSigmaBLeft: number
  private readonly priceToSigmaBRight: number
  private readonly priceToSigmaMethod: (
    price: Price,
    rate: Rate,
    strike: Strike,
    time: Time,
    type: TypeBoolean,
    underlying: Underlying,
  ) => Sigma
  private readonly priceToSigmaNRIterations: number

  public constructor(args?: {
    priceToSigmaAccuracy?: number
    priceToSigmaBLeft?: number
    priceToSigmaBRight?: number
    priceToSigmaMethod?: 'bisection' | 'newton-raphson'
    priceToSigmaNRIteractions?: number
    sigmaToPricePrecision?: 'single' | 'double'
  }) {
    this.CNDF =
      args?.sigmaToPricePrecision === 'double'
        ? BlackScholes.CNDFd //
        : BlackScholes.CNDFs // default
    this.priceToSigmaAccuracy = args?.priceToSigmaAccuracy ?? 0.001
    this.priceToSigmaBLeft = args?.priceToSigmaBLeft ?? 0
    this.priceToSigmaBRight = args?.priceToSigmaBRight ?? 10
    this.priceToSigmaMethod =
      args?.priceToSigmaMethod === 'bisection'
        ? this.priceToSigmaB.bind(this)
        : this.priceToSigmaNR.bind(this) // default
    this.priceToSigmaNRIterations = args?.priceToSigmaNRIteractions ?? 10
  }

  public option(args: {
    rate: Rate
    sigma: Sigma
    strike: Strike
    time: Time
    type: TypeUnion
    underlying: Underlying
  }): Option {
    const { rate, sigma, strike, time, type, underlying } = args
    return this.sigmaToPrice(rate, sigma, strike, time, type === 'call', underlying)
  }

  public sigma(args: {
    price: Price
    rate: Rate
    strike: Strike
    time: Time
    type: TypeUnion
    underlying: Underlying
  }): Sigma {
    const { price, rate, strike, time, type, underlying } = args
    return this.priceToSigma(price, rate, strike, time, type === 'call', underlying)
  }

  //

  // Calculates option params by given historical volatility
  private sigmaToPrice(
    rate: Rate,
    sigma: Sigma,
    strike: Strike,
    time: Time,
    type: TypeBoolean,
    underlying: Underlying,
  ): Option {
    const sqrt_t = Math.sqrt(time)
    const exp_rt = Math.exp(-rate * time)

    const d1 =
      (Math.log(underlying / strike) + rate * time) / (sigma * sqrt_t) + 0.5 * (sigma * sqrt_t)
    const d2 = d1 - sigma * sqrt_t

    const CNDF_d1 = type ? this.CNDF(d1) : -this.CNDF(-d1)
    const CNDF_d2 = type ? this.CNDF(d2) : -this.CNDF(-d2)
    const NDF_d1 = BlackScholes.NDF(d1)

    return {
      delta: CNDF_d1,
      gamma: NDF_d1 / (underlying * sigma * sqrt_t),
      price: underlying * CNDF_d1 - strike * exp_rt * CNDF_d2,
      rho: strike * time * exp_rt * CNDF_d2,
      theta: (underlying * sigma * NDF_d1) / (2 * sqrt_t) + rate * strike * exp_rt * CNDF_d2,
      vega: underlying * sqrt_t * NDF_d1,
    }
  }

  // Calculates option implied volatility by given price
  // (my own method, including "negative" values)
  private priceToSigma(
    price: Price,
    rate: Rate,
    strike: Strike,
    time: Time,
    type: TypeBoolean,
    underlying: Underlying,
  ): Sigma {
    const intrinsic: Price = this.sigmaToPrice(rate, 0, strike, time, type, underlying).price
    if (price === intrinsic) return 0
    else if (price > intrinsic) {
      return this.priceToSigmaMethod(price, rate, strike, time, type, underlying)
    } else {
      return -this.priceToSigmaMethod(
        intrinsic + (intrinsic - price),
        rate,
        strike,
        time,
        type,
        underlying,
      )
    }
  }

  // Calculates option implied volatility by given price (Bisection algorithm)
  // http://sfb649.wiwi.hu-berlin.de/fedc_homepage/xplore/tutorials/xlghtmlnode65.html
  private priceToSigmaB(
    price: Price,
    rate: Rate,
    strike: Strike,
    time: Time,
    type: TypeBoolean,
    underlying: Underlying,
  ): Sigma {
    const ACCURACY = this.priceToSigmaAccuracy

    // initial guess

    let sigmaLeft: Sigma = this.priceToSigmaBLeft
    let sigmaRight: Sigma = this.priceToSigmaBRight
    const ITERATIONS = Math.round(Math.log((sigmaRight - sigmaLeft) / ACCURACY) / Math.LN2) + 10

    // iterate

    let sigma: Sigma
    let option: Option
    let dprice: Price

    for (let i = 0; i < ITERATIONS; i++) {
      sigma = (sigmaLeft + sigmaRight) / 2
      option = this.sigmaToPrice(rate, sigma, strike, time, type, underlying)
      dprice = option.price - price

      if (Math.abs(dprice) < ACCURACY) return sigma
      else if (dprice > 0) sigmaRight = sigma
      else sigmaLeft = sigma
    }

    // failed

    return 0
  }

  // Calculates option implied volatility by given price (Newton-Raphson algorithm)
  // http://quant.stackexchange.com/questions/7761/how-to-compute-implied-volatility-calculation
  private priceToSigmaNR(
    price: Price,
    rate: Rate,
    strike: Strike,
    time: Time,
    type: TypeBoolean,
    underlying: Underlying,
  ): Sigma {
    const ACCURACY = this.priceToSigmaAccuracy
    const ITERATIONS = this.priceToSigmaNRIterations

    // initial guess

    let sigma: Sigma = (Math.sqrt((2 * Math.PI) / time) * price) / underlying

    // iterate

    let option: Option
    let dprice: Price

    for (let i = 0; i < ITERATIONS; i++) {
      option = this.sigmaToPrice(rate, sigma, strike, time, type, underlying)
      dprice = option.price - price

      if (Math.abs(dprice) < ACCURACY) return sigma
      else sigma -= dprice / option.vega
    }

    // failed

    return 0
  }
}
