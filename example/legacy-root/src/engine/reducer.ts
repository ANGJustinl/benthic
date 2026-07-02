import { GameAction, GameState } from '../types';
import { handleChapter1Action } from './handlers/chapter1';
import { handleChapterAction } from './handlers/chapters';
import { handleCoreAction } from './handlers/core';
import { handleTick } from './handlers/tick';

export function gameReducer(state: GameState, action: GameAction): GameState {
  const chapterState = handleChapterAction(state, action);
  if (chapterState) {
    return chapterState;
  }

  if (action.type === 'TICK') {
    return handleTick(state, action.payload.now);
  }

  const chapter1State = handleChapter1Action(state, action);
  if (chapter1State) {
    return chapter1State;
  }

  return handleCoreAction(state, action) ?? state;
}
