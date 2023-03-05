# Black Scholes

## Why

- TypeScript
- Fast (interpolated) implementation
- Autotests
- No dependencies

## Getting Started

```bash
npm -i @uqee/black-scholes
```

```typescript
import { BlackScholes, Option } from '@uqee/black-scholes'

const blackScholes: BlackScholes = new BlackScholes()

// API #1
// sigma (HV) → option (price and greeks)

const option: Option = blackScholes.option({
  rate: 0.1, // risk free interest rate is 10%
  sigma: 0.8, // historical volatility is 80%
  strike: 90,
  time: 0.5, // 0.5 * 365 days
  type: 'call',
  underlying: 100,
})

console.log(option)
// {
//   delta: 0.7114016068521767, // dPrice/dUnderlying
//   gamma: 0.0060373764391397425, // dDelta/dUnderlying
//   price: 28.61494767719128,
//   rho: 21.262606504013192, // dPrice/dRate → dRate +1 means +100%
//   theta: 23.572125906049813, // dPrice/dTime → dTime +1 means +year
//   vega: 24.14950575655897 // dPrice/dSigma → dSigma +1 means +100%
// }

// API #2
// option (price) → sigma (IV)

const sigma: number = blackScholes.sigma({
  price: option.price,
  rate: 0.1,
  strike: 90,
  time: 0.5,
  type: 'call',
  underlying: 100,
})

console.log(sigma)
// 0.8000000022822183
```

## Constructor Parameters

```typescript
const blackScholes: BlackScholes = new BlackScholes({
  /*
  priceToSigmaAccuracy?: number
    acceptable sigma error
    default 0.001

  priceToSigmaBLeft?: number
    left sigma value for the 'bisection' algorithm
    default 0

  priceToSigmaBRight?: number
    right sigma value for the 'bisection' algorithm
    default 2

  priceToSigmaMethod?: 'bisection' | 'newton-raphson'
    default 'bisection'

  priceToSigmaNRIteractions?: number
    max iterations for the 'newton-raphson' algorithm
    default 10

  sigmaToPricePrecision?: 'single' | 'double'
    default 'single'
  */
})
```
