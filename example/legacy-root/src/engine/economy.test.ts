import { describe, expect, it } from 'vitest';
import { COSTS } from '../constants';
import { BuildingType, ResourceType } from '../types';
import { applyScaledCost, canAffordScaledCost, getScaledCost } from './economy';

describe('economy helpers', () => {
  it('computes scaled costs using the project scaling rule', () => {
    expect(getScaledCost(10, 0)).toBe(10);
    expect(getScaledCost(10, 1)).toBe(13);
    expect(getScaledCost(10, 2)).toBe(16);
  });

  it('checks affordability against scaled costs', () => {
    const pumpCost = COSTS[BuildingType.PUMP];

    expect(
      canAffordScaledCost(
        {
          [ResourceType.OXYGEN]: 0,
          [ResourceType.LUMENS]: 0,
          [ResourceType.BIOMASS]: 7,
          [ResourceType.SCRAP]: 13,
          [ResourceType.EVOLUTION]: 0,
        },
        pumpCost,
        1,
      ),
    ).toBe(true);

    expect(
      canAffordScaledCost(
        {
          [ResourceType.OXYGEN]: 0,
          [ResourceType.LUMENS]: 0,
          [ResourceType.BIOMASS]: 6,
          [ResourceType.SCRAP]: 12,
          [ResourceType.EVOLUTION]: 0,
        },
        pumpCost,
        1,
      ),
    ).toBe(false);
  });

  it('applies scaled costs without mutating the source pool', () => {
    const resources = {
      [ResourceType.OXYGEN]: 0,
      [ResourceType.LUMENS]: 0,
      [ResourceType.BIOMASS]: 100,
      [ResourceType.SCRAP]: 100,
      [ResourceType.EVOLUTION]: 0,
    };

    const result = applyScaledCost(resources, COSTS[BuildingType.PUMP], 2);

    expect(result[ResourceType.SCRAP]).toBe(84);
    expect(result[ResourceType.BIOMASS]).toBe(92);
    expect(resources[ResourceType.SCRAP]).toBe(100);
    expect(resources[ResourceType.BIOMASS]).toBe(100);
  });
});
