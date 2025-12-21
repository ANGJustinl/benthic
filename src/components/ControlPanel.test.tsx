import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ControlPanel } from './ControlPanel';
import { GameState, ResourceType, BuildingType } from '../types';

const mockDispatch = vi.fn();

const createMockState = (overrides: Partial<GameState> = {}): GameState => ({
  resources: {
    [ResourceType.OXYGEN]: 50,
    [ResourceType.LUMENS]: 10,
    [ResourceType.BIOMASS]: 5,
    [ResourceType.SCRAP]: 0,
    [ResourceType.EVOLUTION]: 0,
  },
  buildings: {
    [BuildingType.PUMP]: 0,
    [BuildingType.BIO_FILTER]: 0,
    [BuildingType.NODE]: 0,
    [BuildingType.NEURAL_LINK]: 0,
    [BuildingType.COMMS_ARRAY]: 0,
  },
  flags: {
    gameStarted: false,
    hasLight: false,
    hasScavenged: false,
    inspectedJam: false,
    commsRepaired: false,
    oxygenCrisis: false,
    revealedTruth: false,
    systemBooted: true,
    crankStarted: false,
    filtersUnlocked: false,
    sonarUnlocked: false,
    impactOccurred: false,
    sosReceived: false,
    overheated: false,
    lowTempWarning: false,
    coldWeldingDiscovered: false,
    damageControlActive: false,
  },
  phase: 1,
  chapter1Stage: 'boot',
  logs: [],
  lastTick: Date.now(),
  totalClicks: 0,
  lastCrankTime: 0,
  maxOxygen: 100,
  coreTemperature: 20,
  power: 100,
  filterWaste: 0,
  crankClicks: 0,
  sonarPings: 0,
  hullIntegrity: 100,
  damageControlTimer: 0,
  ...overrides,
});

describe('ControlPanel - Chapter 1 UI Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Stage I: Boot', () => {
    it('should show MANUAL CRANK button in boot stage', () => {
      const state = createMockState({
        chapter1Stage: 'boot',
        flags: { ...createMockState().flags, systemBooted: true }
      });

      render(<ControlPanel state={state} dispatch={mockDispatch} />);
      
      expect(screen.getByText(/手动摇柄：应急进气阀/)).toBeInTheDocument();
    });

    it('should dispatch MANUAL_CRANK when clicking crank button', () => {
      const state = createMockState({
        chapter1Stage: 'boot',
        flags: { ...createMockState().flags, systemBooted: true }
      });

      render(<ControlPanel state={state} dispatch={mockDispatch} />);
      
      fireEvent.click(screen.getByText(/手动摇柄：应急进气阀/));
      
      expect(mockDispatch).toHaveBeenCalledWith({ type: 'MANUAL_CRANK' });
    });
  });

  describe('Stage II: Rust', () => {
    it('should show filter scrubbing controls in rust stage', () => {
      const state = createMockState({
        chapter1Stage: 'rust',
        flags: { ...createMockState().flags, filtersUnlocked: true }
      });

      render(<ControlPanel state={state} dispatch={mockDispatch} />);
      
      expect(screen.getByText(/清理滤芯/)).toBeInTheDocument();
    });

    it('should show furnace controls when available', () => {
      const state = createMockState({
        chapter1Stage: 'rust',
        filterWaste: 5
      });

      render(<ControlPanel state={state} dispatch={mockDispatch} />);
      
      expect(screen.getByText(/填装燃烧室/)).toBeInTheDocument();
    });

    it('should dispatch SCRUB_FILTERS when clicking scrub button', () => {
      const state = createMockState({
        chapter1Stage: 'rust',
        flags: { ...createMockState().flags, filtersUnlocked: true }
      });

      render(<ControlPanel state={state} dispatch={mockDispatch} />);
      
      fireEvent.click(screen.getByText(/清理滤芯/));
      
      expect(mockDispatch).toHaveBeenCalledWith({ type: 'SCRUB_FILTERS' });
    });
  });

  describe('Stage III: Ghost', () => {
    it('should show sonar controls in ghost stage', () => {
      const state = createMockState({
        chapter1Stage: 'ghost',
        flags: { ...createMockState().flags, sonarUnlocked: true },
        power: 25
      });

      render(<ControlPanel state={state} dispatch={mockDispatch} />);
      
      expect(screen.getByText(/发送主动脉冲/)).toBeInTheDocument();
    });

    it('should show diagnostics button', () => {
      const state = createMockState({
        chapter1Stage: 'ghost',
        sonarPings: 3
      });

      render(<ControlPanel state={state} dispatch={mockDispatch} />);
      
      expect(screen.getByText(/全船诊断/)).toBeInTheDocument();
    });
  });

  describe('Stage IV: Impact', () => {
    it('should show damage control buttons in impact stage', () => {
      const state = createMockState({
        chapter1Stage: 'impact',
        flags: { ...createMockState().flags, damageControlActive: true }
      });

      render(<ControlPanel state={state} dispatch={mockDispatch} />);
      
      expect(screen.getByText(/封闭隔舱 A/)).toBeInTheDocument();
      expect(screen.getByText(/封闭隔舱 B/)).toBeInTheDocument();
    });
  });
});