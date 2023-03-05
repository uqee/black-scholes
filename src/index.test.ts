/* eslint-disable max-lines-per-function */

import { BlackScholes, Option } from '.'

let blackScholes: BlackScholes
let option: Option
let precision: number
let sigma: number

describe('option', () => {
  blackScholes = new BlackScholes()
  precision = 5

  describe('default', () => {
    // online calculator
    // https://www.math.drexel.edu/~pg/fin/VanillaCalculator.html

    test('call', () => {
      option = blackScholes.option({
        rate: 0.1,
        sigma: 0.8,
        strike: 90,
        time: 0.5,
        type: 'call',
        underlying: 100,
      })
      expect(option.price).toBeCloseTo(28.61495, precision)
      expect(option.delta).toBeCloseTo(0.7114, precision)
      expect(option.gamma).toBeCloseTo(0.00604, precision)
      expect(option.vega).toBeCloseTo(24.14951, precision)
      expect(option.theta).toBeCloseTo(23.57213, precision)
      expect(option.rho).toBeCloseTo(21.26261, precision)
    })

    test('put', () => {
      option = blackScholes.option({
        rate: 0.1,
        sigma: 0.8,
        strike: 90,
        time: 0.5,
        type: 'put',
        underlying: 100,
      })
      expect(option.price).toBeCloseTo(14.2256, precision)
      expect(option.delta).toBeCloseTo(-0.2886, precision)
      expect(option.gamma).toBeCloseTo(0.00604, precision)
      expect(option.vega).toBeCloseTo(24.14951, precision)
      expect(option.theta).toBeCloseTo(15.01106, precision)
      expect(option.rho).toBeCloseTo(-21.54272, precision)
    })
  })

  describe('corner cases', () => {
    // credits: https://github.com/MattL922/black-scholes/blob/master/black-scholes.js

    describe('t>0, v>0', () => {
      test('call', () => {
        option = blackScholes.option({
          rate: 0.08,
          sigma: 0.2,
          strike: 34,
          time: 0.25,
          type: 'call',
          underlying: 30,
        })
        expect(option.price).toBeCloseTo(0.23834902311961947, precision)
      })

      it('put', () => {
        option = blackScholes.option({
          rate: 0.08,
          sigma: 0.2,
          strike: 34,
          time: 0.25,
          type: 'put',
          underlying: 30,
        })
        expect(option.price).toBeCloseTo(3.5651039155492974, precision)
      })
    })

    describe('t>0, v=0, out-of-the-money', () => {
      it('call', () => {
        option = blackScholes.option({
          rate: 0.08,
          sigma: 0,
          strike: 34,
          time: 0.25,
          type: 'call',
          underlying: 30,
        })
        expect(option.price).toBe(0)
      })

      it('put', () => {
        option = blackScholes.option({
          rate: 0.08,
          sigma: 0,
          strike: 34,
          time: 0.25,
          type: 'put',
          underlying: 35,
        })
        expect(option.price).toBe(0)
      })
    })

    describe('t=0, v>0, out-of-the-money', () => {
      it('call', () => {
        option = blackScholes.option({
          rate: 0.08,
          sigma: 0.1,
          strike: 34,
          time: 0,
          type: 'call',
          underlying: 30,
        })
        expect(option.price).toBe(0)
      })

      it('put', () => {
        // underlying, strike, time, sigma, rate, type
        option = blackScholes.option({
          rate: 0.08,
          sigma: 0.1,
          strike: 34,
          time: 0,
          type: 'put',
          underlying: 35,
        })
        expect(option.price).toBe(0)
      })
    })

    describe('t=0, v=0, out-of-the-money', () => {
      it('call', () => {
        option = blackScholes.option({
          rate: 0.08,
          sigma: 0,
          strike: 34,
          time: 0,
          type: 'call',
          underlying: 30,
        })
        expect(option.price).toBe(0)
      })

      it('put', () => {
        option = blackScholes.option({
          rate: 0.08,
          sigma: 0,
          strike: 34,
          time: 0,
          type: 'put',
          underlying: 35,
        })
        expect(option.price).toBe(0)
      })
    })

    describe('t>0, v=0, in-the-money', () => {
      // It may seem odd that the call is worth significantly more than the put when
      // they are both $2 in the money. This is because the call theoretically has
      // unlimited profit potential. The put can only make money until the underlying
      // goes to zero. Therefore the call has more value.

      it('call', () => {
        option = blackScholes.option({
          rate: 0.08,
          sigma: 0,
          strike: 34,
          time: 0.25,
          type: 'call',
          underlying: 36,
        })
        expect(option.price).toBeCloseTo(2.673245107570324, precision)
      })

      it('put', () => {
        option = blackScholes.option({
          rate: 0.08,
          sigma: 0,
          strike: 34,
          time: 0.25,
          type: 'put',
          underlying: 32,
        })
        expect(option.price).toBeCloseTo(1.3267548924296761, precision)
      })
    })

    describe('t=0, v>0, in-the-money', () => {
      it('call', () => {
        option = blackScholes.option({
          rate: 0.08,
          sigma: 0.1,
          strike: 34,
          time: 0,
          type: 'call',
          underlying: 36,
        })
        expect(option.price).toBe(2)
      })

      it('put', () => {
        option = blackScholes.option({
          rate: 0.08,
          sigma: 0.1,
          strike: 34,
          time: 0,
          type: 'put',
          underlying: 32,
        })
        expect(option.price).toBe(2)
      })
    })

    describe('t=0, v=0, in-the-money', () => {
      it('call', () => {
        option = blackScholes.option({
          rate: 0.08,
          sigma: 0,
          strike: 34,
          time: 0,
          type: 'call',
          underlying: 36,
        })
        expect(option.price).toBe(2)
      })

      it('put', () => {
        option = blackScholes.option({
          rate: 0.08,
          sigma: 0,
          strike: 34,
          time: 0,
          type: 'put',
          underlying: 32,
        })
        expect(option.price).toBe(2)
      })
    })
  })
})

describe('sigma', () => {
  precision = 3

  const rate: number = 0.1
  const strike: number = 90
  const time: number = 0.5
  const type: 'call' | 'put' = 'call'
  const underlying: number = 100

  test('bisection', () => {
    blackScholes = new BlackScholes({
      priceToSigmaMethod: 'bisection',
    })

    option = blackScholes.option({ rate, sigma: 0.8, strike, time, type, underlying })
    expect(option.price).toBeCloseTo(28.61495, precision)

    sigma = blackScholes.sigma({ price: option.price, rate, strike, time, type, underlying })
    expect(sigma).toBeCloseTo(0.8, precision)
  })

  test('newton-raphson', () => {
    blackScholes = new BlackScholes({
      priceToSigmaMethod: 'newton-raphson',
    })

    option = blackScholes.option({ rate, sigma: 0.8, strike, time, type, underlying })
    expect(option.price).toBeCloseTo(28.61495, precision)

    sigma = blackScholes.sigma({ price: option.price, rate, strike, time, type, underlying })
    expect(sigma).toBeCloseTo(0.8, precision)
  })
})
