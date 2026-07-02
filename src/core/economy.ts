import {
  DEFAULT_BUILD_COST_SCALE,
  type BuildingRecord,
  type EngineBuildingDefinition,
  type EngineManifest,
  type EngineResourceDefinition,
  type ResourceRecord,
} from './contracts';

export function clampResourceValue(
  value: number,
  definition?: EngineResourceDefinition,
): number {
  let nextValue = value;

  if (definition?.min !== undefined) {
    nextValue = Math.max(definition.min, nextValue);
  }

  if (definition?.max !== undefined) {
    nextValue = Math.min(definition.max, nextValue);
  }

  return nextValue;
}

export function applyResourceChanges<TResourceId extends string>(
  resources: Readonly<ResourceRecord<TResourceId>>,
  changes: Partial<Record<TResourceId, number>>,
  definitions?: Record<TResourceId, EngineResourceDefinition>,
): ResourceRecord<TResourceId> {
  const nextResources = { ...resources } as ResourceRecord<TResourceId>;

  for (const [resourceId, delta] of Object.entries(changes) as [TResourceId, number][]) {
    const currentValue = nextResources[resourceId] ?? 0;
    nextResources[resourceId] = clampResourceValue(
      currentValue + delta,
      definitions?.[resourceId],
    );
  }

  return nextResources;
}

export function getScaledCost(
  baseCost: number,
  currentCount: number,
  scale = DEFAULT_BUILD_COST_SCALE,
): number {
  return Math.floor(baseCost * Math.pow(scale, currentCount));
}

export function getScaledCosts<TResourceId extends string>(
  baseCosts: Partial<Record<TResourceId, number>> | undefined,
  currentCount: number,
  scale = DEFAULT_BUILD_COST_SCALE,
): Partial<Record<TResourceId, number>> {
  if (!baseCosts) {
    return {};
  }

  const nextCosts: Partial<Record<TResourceId, number>> = {};

  for (const [resourceId, baseCost] of Object.entries(baseCosts) as [TResourceId, number][]) {
    nextCosts[resourceId] = getScaledCost(baseCost, currentCount, scale);
  }

  return nextCosts;
}

export function canAffordCosts<TResourceId extends string>(
  resources: Readonly<ResourceRecord<TResourceId>>,
  costs: Partial<Record<TResourceId, number>>,
): boolean {
  return (Object.entries(costs) as [TResourceId, number][])
    .every(([resourceId, amount]) => {
    return (resources[resourceId as TResourceId] ?? 0) >= (amount ?? 0);
  });
}

export function spendCosts<TResourceId extends string>(
  resources: Readonly<ResourceRecord<TResourceId>>,
  costs: Partial<Record<TResourceId, number>>,
  definitions?: Record<TResourceId, EngineResourceDefinition>,
): ResourceRecord<TResourceId> {
  const negativeChanges = Object.fromEntries(
    Object.entries(costs).map(([resourceId, amount]) => [resourceId, -(amount ?? 0)]),
  ) as Partial<Record<TResourceId, number>>;

  return applyResourceChanges(resources, negativeChanges, definitions);
}

export function getBuildingCosts<
  TResourceId extends string,
  TBuildingId extends string,
>(
  manifest: EngineManifest<TResourceId, TBuildingId> | undefined,
  buildingId: TBuildingId,
  currentCount: number,
): Partial<Record<TResourceId, number>> {
  const definition = manifest?.buildings?.[buildingId];

  if (!definition) {
    return {};
  }

  return getScaledCosts(
    definition.baseCost,
    currentCount,
    definition.costScale ?? DEFAULT_BUILD_COST_SCALE,
  );
}

export function applyPassiveProduction<
  TResourceId extends string,
  TBuildingId extends string,
>(
  resources: Readonly<ResourceRecord<TResourceId>>,
  buildings: Readonly<BuildingRecord<TBuildingId>>,
  manifest: EngineManifest<TResourceId, TBuildingId> | undefined,
  deltaMs: number,
): ResourceRecord<TResourceId> {
  if (deltaMs <= 0 || !manifest?.buildings) {
    return { ...resources } as ResourceRecord<TResourceId>;
  }

  const totalChanges: Partial<Record<TResourceId, number>> = {};

  for (const [buildingId, definition] of Object.entries(
    manifest.buildings,
  ) as [TBuildingId, EngineBuildingDefinition<TResourceId>][]) {
    const count = buildings[buildingId] ?? 0;

    if (!count || !definition.passiveProduction) {
      continue;
    }

    const tickSeconds = deltaMs / 1000;

    for (const [resourceId, ratePerSecond] of Object.entries(
      definition.passiveProduction,
    ) as [TResourceId, number][]) {
      totalChanges[resourceId] = (totalChanges[resourceId] ?? 0) + ratePerSecond * count * tickSeconds;
    }
  }

  return applyResourceChanges(resources, totalChanges, manifest.resources);
}
