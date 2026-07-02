import type {
  ContentCommand,
  EngineBuildingDefinition,
  EngineManifest,
  EngineResourceDefinition,
  EngineState,
  IdlePack,
} from './contracts';

function createResourceRecord<TResourceId extends string>(
  definitions: Record<TResourceId, EngineResourceDefinition> | undefined,
  useInitialValues: boolean,
): Record<TResourceId, number> {
  const nextResources = {} as Record<TResourceId, number>;

  if (!definitions) {
    return nextResources;
  }

  for (const [resourceId, definition] of Object.entries(definitions) as [
    TResourceId,
    EngineResourceDefinition,
  ][]) {
    nextResources[resourceId] = useInitialValues ? definition.initialAmount ?? 0 : 0;
  }

  return nextResources;
}

function createBuildingRecord<TBuildingId extends string>(
  definitions: Record<TBuildingId, EngineBuildingDefinition<string>> | undefined,
  useInitialValues: boolean,
): Record<TBuildingId, number> {
  const nextBuildings = {} as Record<TBuildingId, number>;

  if (!definitions) {
    return nextBuildings;
  }

  for (const [buildingId, definition] of Object.entries(definitions) as [
    TBuildingId,
    EngineBuildingDefinition<string>,
  ][]) {
    nextBuildings[buildingId] = useInitialValues ? definition.initialCount ?? 0 : 0;
  }

  return nextBuildings;
}

function ensureRuntimeMeta(
  runtime: Partial<EngineState<unknown>['runtime']> | undefined,
): EngineState<unknown>['runtime'] {
  return {
    nextLogSequence: runtime?.nextLogSequence ?? 0,
    nextScheduledSequence: runtime?.nextScheduledSequence ?? 0,
  };
}

function clonePlainDataFallback<T>(value: T): T {
  if (Array.isArray(value)) {
    return value.map((item) => clonePlainDataFallback(item)) as T;
  }

  if (value && typeof value === 'object') {
    const nextRecord: Record<string, unknown> = {};

    for (const [key, nestedValue] of Object.entries(value as Record<string, unknown>)) {
      nextRecord[key] = clonePlainDataFallback(nestedValue);
    }

    return nextRecord as T;
  }

  return value;
}

export function clonePlainData<T>(value: T): T {
  if (typeof globalThis.structuredClone === 'function') {
    return globalThis.structuredClone(value);
  }

  return clonePlainDataFallback(value);
}

export function createEmptyEngineState<
  TContent,
  TCommand extends ContentCommand = ContentCommand,
  TResourceId extends string = string,
  TBuildingId extends string = string,
>(
  pack: IdlePack<TContent, TCommand, TResourceId, TBuildingId>,
  now = 0,
): EngineState<TContent, TResourceId, TBuildingId, TCommand> {
  return {
    resources: createResourceRecord(pack.manifest?.resources, true),
    buildings: createBuildingRecord(
      pack.manifest?.buildings as Record<TBuildingId, EngineBuildingDefinition<string>> | undefined,
      true,
    ),
    cooldowns: {},
    logs: [],
    scheduledCommands: [],
    firedAutomationKeys: {},
    lastTick: now,
    runtime: {
      nextLogSequence: 0,
      nextScheduledSequence: 0,
    },
    content: clonePlainData(pack.createInitialContentState()),
  };
}

export function cloneEngineState<
  TContent,
  TCommand extends ContentCommand = ContentCommand,
  TResourceId extends string = string,
  TBuildingId extends string = string,
>(
  snapshot: EngineState<TContent, TResourceId, TBuildingId, TCommand>,
): EngineState<TContent, TResourceId, TBuildingId, TCommand> {
  return {
    resources: { ...snapshot.resources },
    buildings: { ...snapshot.buildings },
    cooldowns: { ...snapshot.cooldowns },
    logs: clonePlainData(snapshot.logs),
    scheduledCommands: clonePlainData(snapshot.scheduledCommands),
    firedAutomationKeys: { ...snapshot.firedAutomationKeys },
    lastTick: snapshot.lastTick,
    runtime: ensureRuntimeMeta(snapshot.runtime),
    content: clonePlainData(snapshot.content),
  };
}

export function normalizeEngineState<
  TContent,
  TCommand extends ContentCommand = ContentCommand,
  TResourceId extends string = string,
  TBuildingId extends string = string,
>(
  pack: IdlePack<TContent, TCommand, TResourceId, TBuildingId>,
  snapshot: EngineState<TContent, TResourceId, TBuildingId, TCommand>,
): EngineState<TContent, TResourceId, TBuildingId, TCommand> {
  const manifest = pack.manifest as EngineManifest<TResourceId, TBuildingId> | undefined;

  return {
    resources: {
      ...createResourceRecord(manifest?.resources, false),
      ...(snapshot.resources ?? {}),
    } as Record<TResourceId, number>,
    buildings: {
      ...createBuildingRecord(
        manifest?.buildings as Record<TBuildingId, EngineBuildingDefinition<string>> | undefined,
        false,
      ),
      ...(snapshot.buildings ?? {}),
    } as Record<TBuildingId, number>,
    cooldowns: { ...(snapshot.cooldowns ?? {}) },
    logs: clonePlainData(snapshot.logs ?? []),
    scheduledCommands: clonePlainData(snapshot.scheduledCommands ?? []).sort((left, right) => {
      return left.dueAt - right.dueAt || left.createdAt - right.createdAt || left.id.localeCompare(right.id);
    }),
    firedAutomationKeys: { ...(snapshot.firedAutomationKeys ?? {}) },
    lastTick: snapshot.lastTick ?? 0,
    runtime: ensureRuntimeMeta(snapshot.runtime),
    content: clonePlainData(snapshot.content),
  };
}
