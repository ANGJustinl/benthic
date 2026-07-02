import {
  type AutomationCause,
  type ContentCommand,
  type EngineAction,
  type EngineLogEntry,
  type EngineLogInput,
  type EngineState,
  type IdlePack,
  type IdleRuntime,
  type RuntimeExecutionOptions,
  type RuntimeServices,
  type ScheduleCommandInput,
  type ScheduledCommand,
  type ScheduledCommandMatcher,
} from './contracts';
import {
  applyPassiveProduction,
  applyResourceChanges,
  canAffordCosts,
  clampResourceValue,
  getBuildingCosts,
  spendCosts,
} from './economy';
import {
  cancelScheduledCommands as cancelScheduledCommandsInQueue,
  enqueueScheduledCommand,
  splitDueScheduledCommands,
} from './scheduler';
import { createSaveEnvelope } from './save';
import { cloneEngineState, createEmptyEngineState, normalizeEngineState } from './state';
import { restoreFromSave } from './save';

const MAX_SCHEDULED_EXECUTIONS_PER_CYCLE = 1000;

type MutableDraft<
  TContent,
  TCommand extends ContentCommand,
  TResourceId extends string,
  TBuildingId extends string,
> = EngineState<TContent, TResourceId, TBuildingId, TCommand>;

function cloneState<
  TContent,
  TCommand extends ContentCommand,
  TResourceId extends string,
  TBuildingId extends string,
>(
  state: EngineState<TContent, TResourceId, TBuildingId, TCommand>,
): MutableDraft<TContent, TCommand, TResourceId, TBuildingId> {
  return cloneEngineState(state);
}

function snapshotState<
  TContent,
  TCommand extends ContentCommand,
  TResourceId extends string,
  TBuildingId extends string,
>(
  draft: MutableDraft<TContent, TCommand, TResourceId, TBuildingId>,
): Readonly<EngineState<TContent, TResourceId, TBuildingId, TCommand>> {
  return draft;
}

function createRuntimeServices<
  TContent,
  TCommand extends ContentCommand,
  TResourceId extends string,
  TBuildingId extends string,
>(
  pack: IdlePack<TContent, TCommand, TResourceId, TBuildingId>,
  draft: MutableDraft<TContent, TCommand, TResourceId, TBuildingId>,
  now: number,
  random: () => number,
): RuntimeServices<TContent, TCommand, TResourceId, TBuildingId> {
  const resourceDefinitions = pack.manifest?.resources;

  const appendLog = (entry: EngineLogInput): EngineLogEntry => {
    draft.runtime.nextLogSequence += 1;

    const logEntry: EngineLogEntry = {
      id: entry.id ?? `log-${draft.runtime.nextLogSequence}`,
      timestamp: entry.timestamp ?? now,
      message: entry.message,
      level: entry.level,
      source: entry.source,
      tags: entry.tags ? [...entry.tags] : undefined,
      data: entry.data ? { ...entry.data } : undefined,
    };

    draft.logs.push(logEntry);
    return logEntry;
  };

  const setResourceValue = (resourceId: TResourceId, value: number): number => {
    const nextValue = clampResourceValue(value, resourceDefinitions?.[resourceId]);
    draft.resources[resourceId] = nextValue;
    return nextValue;
  };

  return {
    now,
    random,
    appendLog,
    addResource(resourceId, amount) {
      const nextValue = (draft.resources[resourceId] ?? 0) + amount;
      return setResourceValue(resourceId, nextValue);
    },
    setResource(resourceId, amount) {
      return setResourceValue(resourceId, amount);
    },
    addBuilding(buildingId, amount = 1) {
      const nextValue = Math.max(0, (draft.buildings[buildingId] ?? 0) + amount);
      draft.buildings[buildingId] = nextValue;
      return nextValue;
    },
    setBuilding(buildingId, amount) {
      const nextValue = Math.max(0, amount);
      draft.buildings[buildingId] = nextValue;
      return nextValue;
    },
    setCooldown(id, readyAt) {
      draft.cooldowns[id] = readyAt;
    },
    clearCooldown(id) {
      delete draft.cooldowns[id];
    },
    scheduleCommand(input: ScheduleCommandInput<TCommand>) {
      const result = enqueueScheduledCommand(draft.scheduledCommands, input, {
        now,
        nextSequence: draft.runtime.nextScheduledSequence + 1,
        firedAutomationKeys: draft.firedAutomationKeys,
      });

      draft.scheduledCommands = result.queue;

      if (result.scheduled) {
        draft.runtime.nextScheduledSequence += 1;
      }

      return result.scheduled;
    },
    cancelScheduledCommands(matcher: ScheduledCommandMatcher<TCommand>) {
      const previousLength = draft.scheduledCommands.length;
      draft.scheduledCommands = cancelScheduledCommandsInQueue(draft.scheduledCommands, matcher);
      return previousLength - draft.scheduledCommands.length;
    },
    markAutomationFired(key: string) {
      draft.firedAutomationKeys[key] = true;
    },
    hasAutomationFired(key: string) {
      return Boolean(draft.firedAutomationKeys[key]);
    },
  };
}

function applyReturnedContent<
  TContent,
  TCommand extends ContentCommand,
  TResourceId extends string,
  TBuildingId extends string,
>(
  draft: MutableDraft<TContent, TCommand, TResourceId, TBuildingId>,
  nextContent: TContent | void,
): void {
  if (nextContent !== undefined) {
    draft.content = nextContent as TContent;
  }
}

function syncAutomation<
  TContent,
  TCommand extends ContentCommand,
  TResourceId extends string,
  TBuildingId extends string,
>(
  pack: IdlePack<TContent, TCommand, TResourceId, TBuildingId>,
  draft: MutableDraft<TContent, TCommand, TResourceId, TBuildingId>,
  cause: AutomationCause<TCommand, TBuildingId>,
  options: RuntimeExecutionOptions,
): void {
  if (!pack.syncAutomation) {
    return;
  }

  const services = createRuntimeServices(
    pack,
    draft,
    options.now,
    options.random ?? Math.random,
  );
  pack.syncAutomation(snapshotState(draft), cause, services);
}

function runContentCommand<
  TContent,
  TCommand extends ContentCommand,
  TResourceId extends string,
  TBuildingId extends string,
>(
  pack: IdlePack<TContent, TCommand, TResourceId, TBuildingId>,
  draft: MutableDraft<TContent, TCommand, TResourceId, TBuildingId>,
  command: TCommand,
  cause: AutomationCause<TCommand, TBuildingId>,
  options: RuntimeExecutionOptions,
): void {
  const services = createRuntimeServices(
    pack,
    draft,
    options.now,
    options.random ?? Math.random,
  );
  applyReturnedContent(draft, pack.handleCommand?.(snapshotState(draft), command, services));
  syncAutomation(pack, draft, cause, options);
}

function drainDueScheduledCommands<
  TContent,
  TCommand extends ContentCommand,
  TResourceId extends string,
  TBuildingId extends string,
>(
  pack: IdlePack<TContent, TCommand, TResourceId, TBuildingId>,
  draft: MutableDraft<TContent, TCommand, TResourceId, TBuildingId>,
  options: RuntimeExecutionOptions,
): void {
  let executedCount = 0;

  while (executedCount < MAX_SCHEDULED_EXECUTIONS_PER_CYCLE) {
    const { due, pending } = splitDueScheduledCommands(draft.scheduledCommands, options.now);

    if (due.length === 0) {
      draft.scheduledCommands = pending;
      return;
    }

    draft.scheduledCommands = pending;

    for (const scheduled of due) {
      if (scheduled.onceKey && draft.firedAutomationKeys[scheduled.onceKey]) {
        continue;
      }

      runContentCommand(
        pack,
        draft,
        scheduled.command,
        { type: 'scheduled-command', scheduled },
        options,
      );

      if (scheduled.onceKey) {
        draft.firedAutomationKeys[scheduled.onceKey] = true;
      }

      executedCount += 1;

      if (executedCount >= MAX_SCHEDULED_EXECUTIONS_PER_CYCLE) {
        throw new Error(
          'Scheduled command execution limit exceeded. Check automation dedupe and dueAt values.',
        );
      }
    }
  }
}

function finalizeState<
  TContent,
  TCommand extends ContentCommand,
  TResourceId extends string,
  TBuildingId extends string,
>(
  pack: IdlePack<TContent, TCommand, TResourceId, TBuildingId>,
  draft: MutableDraft<TContent, TCommand, TResourceId, TBuildingId>,
  options: RuntimeExecutionOptions,
): EngineState<TContent, TResourceId, TBuildingId, TCommand> {
  drainDueScheduledCommands(pack, draft, options);
  return normalizeEngineState(pack, draft);
}

export function createInitialEngineState<
  TContent,
  TCommand extends ContentCommand = ContentCommand,
  TResourceId extends string = string,
  TBuildingId extends string = string,
>(
  pack: IdlePack<TContent, TCommand, TResourceId, TBuildingId>,
  now = 0,
): EngineState<TContent, TResourceId, TBuildingId, TCommand> {
  const draft = createEmptyEngineState(pack, now);
  syncAutomation(pack, draft, { type: 'reset' }, { now });
  return finalizeState(pack, draft, { now });
}

export function stepEngine<
  TContent,
  TCommand extends ContentCommand = ContentCommand,
  TResourceId extends string = string,
  TBuildingId extends string = string,
>(
  pack: IdlePack<TContent, TCommand, TResourceId, TBuildingId>,
  state: EngineState<TContent, TResourceId, TBuildingId, TCommand>,
  action: EngineAction<TContent, TCommand, TResourceId, TBuildingId>,
  options: RuntimeExecutionOptions,
): EngineState<TContent, TResourceId, TBuildingId, TCommand> {
  if (action.type === 'ENGINE_TICK') {
    return advanceEngine(pack, state, options);
  }

  if (action.type === 'ENGINE_RESET') {
    const draft = createEmptyEngineState(pack, options.now);
    syncAutomation(pack, draft, { type: 'reset' }, options);
    return finalizeState(pack, draft, options);
  }

  if (action.type === 'ENGINE_LOAD_SNAPSHOT') {
    const draft = cloneState(normalizeEngineState(pack, action.snapshot));
    syncAutomation(pack, draft, { type: 'load' }, options);
    return finalizeState(pack, draft, options);
  }

  const draft = cloneState(state);

  if (action.type === 'ENGINE_BUILD') {
    const quantity = Math.max(1, Math.floor(action.quantity ?? 1));
    const definition = pack.manifest?.buildings?.[action.buildingId];

    if (!definition) {
      return normalizeEngineState(pack, draft);
    }

    let purchasedCount = 0;

    for (let index = 0; index < quantity; index += 1) {
      const currentCount = draft.buildings[action.buildingId] ?? 0;
      const buildingCosts = getBuildingCosts(pack.manifest, action.buildingId, currentCount);

      if (!canAffordCosts(draft.resources, buildingCosts)) {
        break;
      }

      draft.resources = spendCosts(
        draft.resources,
        buildingCosts,
        pack.manifest?.resources,
      );
      draft.buildings[action.buildingId] = currentCount + 1;
      purchasedCount += 1;
    }

    if (!purchasedCount) {
      return normalizeEngineState(pack, draft);
    }

    syncAutomation(
      pack,
      draft,
      { type: 'build', buildingId: action.buildingId, quantity: purchasedCount },
      options,
    );
    return finalizeState(pack, draft, options);
  }

  runContentCommand(pack, draft, action.command, { type: 'content-command', command: action.command }, options);
  return finalizeState(pack, draft, options);
}

export function advanceEngine<
  TContent,
  TCommand extends ContentCommand = ContentCommand,
  TResourceId extends string = string,
  TBuildingId extends string = string,
>(
  pack: IdlePack<TContent, TCommand, TResourceId, TBuildingId>,
  state: EngineState<TContent, TResourceId, TBuildingId, TCommand>,
  options: RuntimeExecutionOptions,
): EngineState<TContent, TResourceId, TBuildingId, TCommand> {
  const draft = cloneState(state);
  const deltaMs = Math.max(0, options.now - draft.lastTick);

  draft.resources = applyPassiveProduction(
    draft.resources,
    draft.buildings,
    pack.manifest,
    deltaMs,
  );

  if (pack.handleTick) {
    const services = createRuntimeServices(
      pack,
      draft,
      options.now,
      options.random ?? Math.random,
    );
    applyReturnedContent(draft, pack.handleTick(snapshotState(draft), deltaMs, services));
  }

  draft.lastTick = options.now;
  syncAutomation(pack, draft, { type: 'tick', now: options.now, deltaMs }, options);

  return finalizeState(pack, draft, options);
}

export function createIdleRuntime<
  TContent,
  TCommand extends ContentCommand = ContentCommand,
  TResourceId extends string = string,
  TBuildingId extends string = string,
>(
  pack: IdlePack<TContent, TCommand, TResourceId, TBuildingId>,
): IdleRuntime<TContent, TCommand, TResourceId, TBuildingId> {
  return {
    pack,
    createInitialState(now = 0) {
      return createInitialEngineState(pack, now);
    },
    step(state, action, options) {
      return stepEngine(pack, state, action, options);
    },
    advance(state, options) {
      return advanceEngine(pack, state, options);
    },
    buildViewModel(state, options) {
      if (!pack.buildViewModel) {
        return null;
      }

      return pack.buildViewModel(state, options);
    },
    save(state) {
      return createSaveEnvelope(pack, state);
    },
    restore(envelope) {
      return restoreFromSave(pack, envelope);
    },
  };
}
