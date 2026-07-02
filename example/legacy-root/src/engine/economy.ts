import { SCALING_FACTOR } from '../constants';
import { ResourceType } from '../types';

type ResourcePool = Record<ResourceType, number>;
type ResourceCost = Partial<Record<ResourceType, number>>;

export function getScaledCost(baseCost: number, currentCount: number): number {
  return Math.floor(baseCost * Math.pow(SCALING_FACTOR, currentCount));
}

export function canAffordScaledCost(
  resources: ResourcePool,
  costConfig: ResourceCost,
  currentCount: number,
): boolean {
  return Object.entries(costConfig).every(([resourceType, amount]) => {
    return resources[resourceType as ResourceType] >= getScaledCost(amount as number, currentCount);
  });
}

export function applyScaledCost(
  resources: ResourcePool,
  costConfig: ResourceCost,
  currentCount: number,
): ResourcePool {
  const nextResources = { ...resources };

  Object.entries(costConfig).forEach(([resourceType, amount]) => {
    nextResources[resourceType as ResourceType] -= getScaledCost(amount as number, currentCount);
  });

  return nextResources;
}
