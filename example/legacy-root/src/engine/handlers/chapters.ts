import { handleChapter2Action } from '../../chapters/chapter2/actions';
import { handleChapter3Action } from '../../chapters/chapter3/actions';
import { GameAction, GameState } from '../../types';

export function handleChapterAction(state: GameState, action: GameAction): GameState | null {
  if (action.type === 'CHAPTER2_ACTION') {
    return handleChapter2Action(state, action);
  }

  if (action.type === 'CHAPTER3_ACTION') {
    return handleChapter3Action(state, action);
  }

  return null;
}
