import type { IdleGameViewModel, RenderCommand } from '@benthic/idle-core/contracts';

export interface ShowcaseDefinition {
  id: string;
  kicker: string;
  title: string;
  summary: string;
  tags: string[];
  imports: string[];
}

export interface ShowcasePackMeta {
  id: string;
  title: string;
  version: string;
  description: string;
}

export interface ShowcaseDetailCard {
  id: string;
  title: string;
  lines: string[];
  code?: string;
}

export interface ShowcaseSnapshot {
  scene: ShowcaseDefinition;
  pack: ShowcasePackMeta;
  runtimeMode: 'idle-core';
  viewModel: IdleGameViewModel;
  recentCommands: RenderCommand[];
}
