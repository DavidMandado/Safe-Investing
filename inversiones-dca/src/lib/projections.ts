import { ProjectionAssumption, PlanMonth } from '@prisma/client';

/**
 * Calcula el valor futuro de una serie de aportaciones periódicas con interés compuesto mensual.
 *
 * @param monthlyContribution Cantidad aportada mensualmente
 * @param monthlyRate Tasa de interés mensual (ej. 0.06/12)
 * @param months Número de meses
 */
export function futureValueSeries(monthlyContribution: number, monthlyRate: number, months: number): number {
  if (monthlyRate === 0) return monthlyContribution * months;
  return monthlyContribution * ((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate);
}

/**
 * Proyección determinista del patrimonio futuro dado un conjunto de supuestos y aportaciones planificadas.
 * Devuelve la evolución mensual del valor futuro acumulado.
 */
export function deterministicProjection(
  assumptions: ProjectionAssumption,
  plans: PlanMonth[],
  years = 30
) {
  const months = years * 12;
  const monthlyRate = assumptions.expectedReturn / 12 - assumptions.feeDrag / 12 - assumptions.inflation / 12;
  const contributions: Record<number, number> = {};
  plans.forEach((plan) => {
    const idx = (plan.year - new Date().getUTCFullYear()) * 12 + (plan.month - (new Date().getUTCMonth() + 1));
    contributions[idx] = (contributions[idx] || 0) + plan.amountPlanned;
  });
  const values: number[] = [];
  let balance = 0;
  for (let i = 0; i < months; i++) {
    // Aporta si existe plan en este mes
    balance += contributions[i] || 0;
    // Aplica interés compuesto mensual
    balance = balance * (1 + monthlyRate);
    values.push(balance);
  }
  return values;
}

/**
 * Simulación Monte Carlo con n corridas para estimar percentiles de evolución.
 * Retorna un objeto con percentiles p10, p50, p90 de valor final.
 */
export function monteCarlo(
  assumptions: ProjectionAssumption,
  plans: PlanMonth[],
  runs = 1000,
  years = 30
) {
  const months = years * 12;
  const monthlyMean = assumptions.expectedReturn / 12 - assumptions.feeDrag / 12 - assumptions.inflation / 12;
  const monthlyVol = assumptions.volatility / Math.sqrt(12);
  const contributions: Record<number, number> = {};
  plans.forEach((plan) => {
    const idx = (plan.year - new Date().getUTCFullYear()) * 12 + (plan.month - (new Date().getUTCMonth() + 1));
    contributions[idx] = (contributions[idx] || 0) + plan.amountPlanned;
  });
  const results: number[] = [];
  for (let r = 0; r < runs; r++) {
    let balance = 0;
    for (let i = 0; i < months; i++) {
      balance += contributions[i] || 0;
      // Simula retorno mensual ~ N(mu, sigma)
      const random = randn_bm();
      const rate = monthlyMean + monthlyVol * random;
      balance = balance * (1 + rate);
    }
    results.push(balance);
  }
  results.sort((a, b) => a - b);
  const p = (perc: number) => results[Math.floor((results.length - 1) * perc)];
  return {
    p10: p(0.1),
    p50: p(0.5),
    p90: p(0.9),
  };
}

// Generador de números aleatorios con distribución normal estándar mediante el método Box-Muller
function randn_bm() {
  let u = 0,
    v = 0;
  while (u === 0) u = Math.random();
  while (v === 0) v = Math.random();
  return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
}