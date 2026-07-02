import React from 'react';

// Chapter system exports
export * from './chapter1';
export * from './chapter2';
export * from './chapter3';
export * from './types';

// Chapter registry
import { Chapter1Handler } from './chapter1';
import { ChapterHandler } from './types';

export const CHAPTER_HANDLERS: ChapterHandler[] = [
  new Chapter1Handler(),
];

// Chapter manager utility
export class ChapterManager {
  private handlers: ChapterHandler[] = CHAPTER_HANDLERS;

  getHandler(state: any): ChapterHandler | null {
    return this.handlers.find(handler => handler.shouldHandle(state)) || null;
  }

  handleAction(state: any, action: any): any {
    const handler = this.getHandler(state);
    if (handler) {
      const result = handler.handleAction(state, action);
      if (result !== null) return result;
    }
    return null; // No handler processed this action
  }

  getControlPanelActions(state: any, dispatch: any): React.ReactNode[] {
    const handler = this.getHandler(state);
    return handler ? handler.getControlPanelActions(state) : [];
  }

  getResourceDisplay(state: any): React.ReactNode[] {
    const handler = this.getHandler(state);
    return handler ? handler.getResourceDisplay(state) : [];
  }
}