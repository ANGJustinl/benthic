let logIdCounter = 0;

export function generateLogId(now = Date.now(), prefix?: string): string {
  return prefix ? `${prefix}-${now}-${++logIdCounter}` : `${now}-${++logIdCounter}`;
}

export function createScopedLogIdGenerator(prefix: string): () => string {
  return () => generateLogId(Date.now(), prefix);
}
