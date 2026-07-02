// Chapter 1 specific types
export type Chapter1Stage = 'boot' | 'crank' | 'rust' | 'ghost' | 'impact' | 'complete';

export interface Chapter1State {
  stage: Chapter1Stage;
  coreTemperature: number;
  power: number;
  filterWaste: number;
  crankClicks: number;
  sonarPings: number;
  hullIntegrity: number;
  damageControlTimer: number;
}

export interface Chapter1Flags {
  systemBooted: boolean;
  crankStarted: boolean;
  filtersUnlocked: boolean;
  sonarUnlocked: boolean;
  impactOccurred: boolean;
  sosReceived: boolean;
  overheated: boolean;
  lowTempWarning: boolean;
  coldWeldingDiscovered: boolean;
  damageControlActive: boolean;
}