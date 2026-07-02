import { useEffect, useReducer } from 'react';
import { TICK_RATE_MS } from '../constants';
import { loadGameState, saveGameState } from '../engine/persistence';
import { gameReducer } from '../engine/reducer';

export function useGameEngine() {
  const [state, dispatch] = useReducer(gameReducer, undefined, loadGameState);

  useEffect(() => {
    const timer = setInterval(() => {
      dispatch({ type: 'TICK', payload: { now: Date.now() } });
    }, TICK_RATE_MS);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    saveGameState(state);
  }, [state]);

  return { state, dispatch };
}
