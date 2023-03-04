/* eslint-disable max-lines-per-function */

import { BlackScholes, Option } from '.'

const blackScholes: BlackScholes = new BlackScholes()
let option: Option | undefined
const PRECISION: number = 5

// online calculator
// https://www.math.drexel.edu/~pg/fin/VanillaCalculator.html
describe('happy cases', () => {
  test('call', () => {
    option = blackScholes.option({
      rate: 0.1,
      sigma: 0.8,
      strike: 90,
      time: 0.5,
      type: 'call',
      underlying: 100,
    })
    expect(option.price).toBeCloseTo(28.61495, PRECISION)
    expect(option.delta).toBeCloseTo(0.7114, PRECISION)
    expect(option.gamma).toBeCloseTo(0.00604, PRECISION)
    expect(option.vega).toBeCloseTo(24.14951, PRECISION)
    expect(option.theta).toBeCloseTo(23.57213, PRECISION)
    expect(option.rho).toBeCloseTo(21.26261, PRECISION)
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
    expect(option.price).toBeCloseTo(14.2256, PRECISION)
    expect(option.delta).toBeCloseTo(-0.2886, PRECISION)
    expect(option.gamma).toBeCloseTo(0.00604, PRECISION)
    expect(option.vega).toBeCloseTo(24.14951, PRECISION)
    expect(option.theta).toBeCloseTo(15.01106, PRECISION)
    expect(option.rho).toBeCloseTo(-21.54272, PRECISION)
  })
})

// credits
// https://github.com/MattL922/black-scholes/blob/master/black-scholes.js
describe('corner cases', () => {
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
      expect(option.price).toBeCloseTo(0.23834902311961947, PRECISION)
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
      expect(option.price).toBeCloseTo(3.5651039155492974, PRECISION)
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
      expect(option.price).toBeCloseTo(2.673245107570324, PRECISION)
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
      expect(option.price).toBeCloseTo(1.3267548924296761, PRECISION)
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
