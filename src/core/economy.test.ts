import { describe, expect, it } from 'vitest';

import {
  applyPassiveProduction,
  applyResourceChanges,
  canAffordCosts,
  getBuildingCosts,
  getScaledCost,
  spendCosts,
} from './economy';

describe('core/economy', () => {
  it('scales build costs deterministically', () => {
    expect(getScaledCost(10, 0, 1.5)).toBe(10);
    expect(getScaledCost(10, 2, 1.5)).toBe(22);
  });

  it('computes building costs from a generic manifest', () => {
    const costs = getBuildingCosts(
      {
        buildings: {
          drill: {
            baseCost: {
              ore: 8,
              power: 3,
            },
            costScale: 2,
          },
        },
      },
      'drill',
      2,
    );

    expect(costs).toEqual({
      ore: 32,
      power: 12,
    });
  });

  it('applies resource deltas with clamping and spending helpers', () => {
    const resources = applyResourceChanges(
      { ore: 1, power: 4 },
      { ore: -5, power: 20 },
      {
        ore: { min: 0 },
        power: { max: 10 },
      },
    );

    expect(resources).toEqual({
      ore: 0,
      power: 10,
    });

    expect(canAffordCosts(resources, { power: 8 })).toBe(true);
    expect(canAffordCosts(resources, { power: 12 })).toBe(false);
    expect(
      spendCosts(resources, { power: 4 }, { power: { min: 0 }, ore: { min: 0 } }),
    ).toEqual({
      ore: 0,
      power: 6,
    });
  });

  it('applies passive production without pack-specific knowledge', () => {
    const resources = applyPassiveProduction(
      { ore: 3, power: 0 },
      { drill: 2, reactor: 1 },
      {
        resources: {
          ore: { min: 0 },
          power: { min: 0, max: 10 },
        },
        buildings: {
          drill: {
            passiveProduction: {
              ore: 0.5,
            },
          },
          reactor: {
            passiveProduction: {
              power: 8,
            },
          },
        },
      },
      2_000,
    );

    expect(resources).toEqual({
      ore: 5,
      power: 10,
    });
  });
});
