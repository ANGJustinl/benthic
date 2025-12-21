import { GameState, GameAction, ResourceType, BuildingType, LogEntry } from '../types';

// Chapter-specific types
export interface ChapterHandler {
  // Handle chapter-specific actions
  handleAction(state: GameState, action: GameAction): GameState | null;
  
  // Get chapter-specific UI components - we'll pass dispatch separately
  getControlPanelActions(state: GameState): React.ReactNode[];
  
  // Get chapter-specific resource display
  getResourceDisplay(state: GameState): React.ReactNode[];
  
  // Check if this chapter should handle the current state
  shouldHandle(state: GameState): boolean;
}

export interface ChapterConfig {
  id: string;
  name: string;
  phase: number;
  stages?: string[];
}