import { describe, expect, it } from 'vitest';
import { deterministicProjection } from '../src/lib/projections';

describe('deterministicProjection', () => {
  it('calculates future values with zero rate', () => {
    const assumptions = {
      expectedReturn: 0,
      volatility: 0,
      inflation: 0,
      feeDrag: 0,
      id: '',
      userId: '',
      createdAt: new Date(),
      updatedAt: new Date(),
    } as any;
    const plans = [
      { userId: '', id: '', year: new Date().getUTCFullYear(), month: new Date().getUTCMonth() + 1, amountPlanned: 100, status: 'PLANNED', notes: null, createdAt: new Date(), updatedAt: new Date() },
    ] as any;
    const result = deterministicProjection(assumptions, plans, 1);
    expect(result.length).toBe(12);
    // The first month: 100, second: 100 + 100, etc.
    expect(result[0]).toBeCloseTo(100);
    expect(result[1]).toBeCloseTo(200);
  });
});