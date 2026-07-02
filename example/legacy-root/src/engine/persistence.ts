import { GameState } from '../types';
import { createInitialGameState } from './state';

export const GAME_SAVE_KEY = 'benthic_save';

export function loadGameState(): GameState {
  const initialState = createInitialGameState();

  if (typeof window === 'undefined') {
    return initialState;
  }

  try {
    const saved = window.localStorage?.getItem(GAME_SAVE_KEY);
    if (!saved) {
      return initialState;
    }

    const parsed = JSON.parse(saved);
    if (typeof parsed?.chapter1Stage === 'undefined') {
      return initialState;
    }

    return parsed;
  } catch (error) {
    console.error('Save file corrupted', error);
    return initialState;
  }
}

export function saveGameState(state: GameState): void {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    window.localStorage?.setItem(GAME_SAVE_KEY, JSON.stringify(state));
  } catch (error) {
    console.error('Failed to save game state', error);
  }
}
