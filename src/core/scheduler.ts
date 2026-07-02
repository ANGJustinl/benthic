import type {
  ContentCommand,
  ScheduleCommandInput,
  ScheduledCommand,
  ScheduledCommandMatcher,
} from './contracts';

export interface ScheduleQueueResult<TCommand extends ContentCommand = ContentCommand> {
  queue: ScheduledCommand<TCommand>[];
  scheduled: ScheduledCommand<TCommand> | null;
}

export interface ScheduleQueueContext {
  now: number;
  nextSequence: number;
  firedAutomationKeys?: Readonly<Record<string, true>>;
}

export function sortScheduledCommands<TCommand extends ContentCommand>(
  queue: readonly ScheduledCommand<TCommand>[],
): ScheduledCommand<TCommand>[] {
  return [...queue].sort((left, right) => {
    return left.dueAt - right.dueAt || left.createdAt - right.createdAt || left.id.localeCompare(right.id);
  });
}

export function enqueueScheduledCommand<TCommand extends ContentCommand>(
  queue: readonly ScheduledCommand<TCommand>[],
  input: ScheduleCommandInput<TCommand>,
  context: ScheduleQueueContext,
): ScheduleQueueResult<TCommand> {
  if (input.onceKey) {
    if (context.firedAutomationKeys?.[input.onceKey]) {
      return {
        queue: sortScheduledCommands(queue),
        scheduled: null,
      };
    }

    const hasQueuedDuplicate = queue.some((scheduled) => scheduled.onceKey === input.onceKey);

    if (hasQueuedDuplicate) {
      return {
        queue: sortScheduledCommands(queue),
        scheduled: null,
      };
    }
  }

  const scheduled: ScheduledCommand<TCommand> = {
    id: input.id ?? `scheduled-${context.nextSequence}`,
    createdAt: context.now,
    dueAt: input.dueAt,
    command: input.command,
    onceKey: input.onceKey,
    tags: input.tags ? [...input.tags] : undefined,
  };

  return {
    queue: sortScheduledCommands([...queue, scheduled]),
    scheduled,
  };
}

export function matchesScheduledCommand<TCommand extends ContentCommand>(
  scheduled: ScheduledCommand<TCommand>,
  matcher: ScheduledCommandMatcher<TCommand>,
): boolean {
  if (matcher.id && scheduled.id !== matcher.id) {
    return false;
  }

  if (matcher.onceKey && scheduled.onceKey !== matcher.onceKey) {
    return false;
  }

  if (matcher.commandId && scheduled.command.id !== matcher.commandId) {
    return false;
  }

  if (matcher.tag && !scheduled.tags?.includes(matcher.tag)) {
    return false;
  }

  return true;
}

export function cancelScheduledCommands<TCommand extends ContentCommand>(
  queue: readonly ScheduledCommand<TCommand>[],
  matcher: ScheduledCommandMatcher<TCommand>,
): ScheduledCommand<TCommand>[] {
  return sortScheduledCommands(queue.filter((scheduled) => !matchesScheduledCommand(scheduled, matcher)));
}

export function splitDueScheduledCommands<TCommand extends ContentCommand>(
  queue: readonly ScheduledCommand<TCommand>[],
  now: number,
): {
  due: ScheduledCommand<TCommand>[];
  pending: ScheduledCommand<TCommand>[];
} {
  const due: ScheduledCommand<TCommand>[] = [];
  const pending: ScheduledCommand<TCommand>[] = [];

  for (const scheduled of queue) {
    if (scheduled.dueAt <= now) {
      due.push(scheduled);
    } else {
      pending.push(scheduled);
    }
  }

  return {
    due: sortScheduledCommands(due),
    pending: sortScheduledCommands(pending),
  };
}
