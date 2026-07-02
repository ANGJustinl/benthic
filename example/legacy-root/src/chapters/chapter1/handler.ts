import { GameState, GameAction } from '../../types';
import { ChapterHandler } from '../types';
import { Chapter1Actions } from './actions';
import { Chapter1UI } from './ui';

export class Chapter1Handler implements ChapterHandler {
  shouldHandle(state: GameState): boolean {
    return state.phase === 1;
  }

  handleAction(state: GameState, action: GameAction): GameState | null {
    if (!this.shouldHandle(state)) return null;

    switch (action.type) {
      case 'MANUAL_CRANK':
        return Chapter1Actions.handleManualCrank(state);
      
      case 'SCRUB_FILTERS':
        return Chapter1Actions.handleScrubFilters(state);
      
      case 'FEED_FURNACE':
        return Chapter1Actions.handleFeedFurnace(state);
      
      case 'SONAR_PING':
        return Chapter1Actions.handleSonarPing(state);
      
      case 'FULL_DIAGNOSTICS':
        return Chapter1Actions.handleFullDiagnostics(state);
      
      case 'DAMAGE_CONTROL':
        return Chapter1Actions.handleDamageControl(state, action.payload.action);
      
      case 'REPAIR_COMMS':
        return Chapter1Actions.handleRepairComms(state);
      
      default:
        return null; // Let other handlers process this action
    }
  }

  getControlPanelActions(state: GameState): React.ReactNode[] {
    if (!this.shouldHandle(state)) return [];
    return Chapter1UI.renderControlPanelActions(state, () => {});
  }

  getResourceDisplay(state: GameState): React.ReactNode[] {
    if (!this.shouldHandle(state)) return [];
    return Chapter1UI.renderResourceDisplay(state);
  }
}