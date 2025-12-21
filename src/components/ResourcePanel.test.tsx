import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ResourcePanel } from '../components/ResourcePanel';
import { GameState, ResourceType, BuildingType } from '../types';

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
    systemBooted: false,
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
  hullIntegrity: 98,
  damageControlTimer: 0,
  ...overrides,
});

describe('ResourcePanel - Chapter 1 Display Tests', () => {
  describe('Chapter 1 Specific Metrics', () => {
    it('should display oxygen concentration in Chapter 1', () => {
      const state = createMockState({
        phase: 1,
        resources: { ...createMockState().resources, [ResourceType.OXYGEN]: 75 }
      });

      render(<ResourcePanel state={state} />);
      
      expect(screen.getByText('氧气浓度')).toBeInTheDocument();
      expect(screen.getByText('75%')).toBeInTheDocument();
    });

    it('should display core temperature in Chapter 1 after boot stage', () => {
      const state = createMockState({
        phase: 1,
        chapter1Stage: 'rust',
        coreTemperature: 15
      });

      render(<ResourcePanel state={state} />);
      
      expect(screen.getByText('核心温度')).toBeInTheDocument();
      expect(screen.getByText('15°C')).toBeInTheDocument();
    });

    it('should display hull integrity during impact stage', () => {
      const state = createMockState({
        chapter1Stage: 'impact',
        hullIntegrity: 85
      });

      render(<ResourcePanel state={state} />);
      
      expect(screen.getByText('外壳完整性')).toBeInTheDocument();
      expect(screen.getByText('85%')).toBeInTheDocument();
    });

    it('should not display hull integrity in boot stage', () => {
      const state = createMockState({
        chapter1Stage: 'boot',
        hullIntegrity: 98
      });

      render(<ResourcePanel state={state} />);
      
      expect(screen.queryByText('外壳完整性')).not.toBeInTheDocument();
    });
  });

  describe('Oxygen Crisis Display', () => {
    it('should show CRITICAL oxygen status during crisis', () => {
      const state = createMockState({
        resources: { ...createMockState().resources, [ResourceType.OXYGEN]: 4 }
      });

      render(<ResourcePanel state={state} />);
      
      expect(screen.getByText('CRITICAL')).toBeInTheDocument();
      // Should have red/flashing styling
      const criticalElement = screen.getByText('CRITICAL');
      expect(criticalElement).toHaveClass('text-red-500');
    });

    it('should show normal oxygen status when not in crisis', () => {
      const state = createMockState({
        resources: { ...createMockState().resources, [ResourceType.OXYGEN]: 75 }
      });

      render(<ResourcePanel state={state} />);
      
      expect(screen.getByText('75%')).toBeInTheDocument();
      expect(screen.queryByText('CRITICAL')).not.toBeInTheDocument();
    });
  });

  describe('Resource Visibility by Phase', () => {
    it('should show basic resources in boot stage', () => {
      const state = createMockState({
        chapter1Stage: 'boot',
        resources: {
          ...createMockState().resources,
          [ResourceType.OXYGEN]: 25
        }
      });

      render(<ResourcePanel state={state} />);
      
      // Oxygen should be visible
      expect(screen.getByText('25%')).toBeInTheDocument();
      
      // Other resources should not be visible yet without light
      expect(screen.queryByText('有机废料')).not.toBeInTheDocument();
      expect(screen.queryByText('流明')).not.toBeInTheDocument();
    });

    it('should show biomass when light is available', () => {
      const state = createMockState({
        chapter1Stage: 'rust',
        flags: { ...createMockState().flags, hasLight: true },
        resources: {
          ...createMockState().resources,
          [ResourceType.BIOMASS]: 8
        }
      });

      render(<ResourcePanel state={state} />);
      
      expect(screen.getByText('有机废料')).toBeInTheDocument();
      expect(screen.getByText('8')).toBeInTheDocument();
    });

    it('should show lumens when light is available', () => {
      const state = createMockState({
        chapter1Stage: 'rust',
        flags: { ...createMockState().flags, hasLight: true },
        resources: {
          ...createMockState().resources,
          [ResourceType.LUMENS]: 15
        }
      });

      render(<ResourcePanel state={state} />);
      
      expect(screen.getByText('流明')).toBeInTheDocument();
      expect(screen.getByText('15')).toBeInTheDocument();
    });

    it('should show evolution resource in phase 2+', () => {
      const state = createMockState({
        phase: 2,
        resources: {
          ...createMockState().resources,
          [ResourceType.EVOLUTION]: 1
        }
      });

      render(<ResourcePanel state={state} />);
      
      expect(screen.getByText('进化')).toBeInTheDocument();
      expect(screen.getByText('1')).toBeInTheDocument();
    });
  });

  describe('Hull Integrity Warning States', () => {
    it('should show warning styling for compromised hull integrity', () => {
      const state = createMockState({
        chapter1Stage: 'impact',
        hullIntegrity: 45
      });

      render(<ResourcePanel state={state} />);
      
      const hullElement = screen.getByText('45%');
      expect(hullElement).toHaveClass('text-red-500');
    });

    it('should show normal styling for healthy hull integrity', () => {
      const state = createMockState({
        chapter1Stage: 'impact',
        hullIntegrity: 85
      });

      render(<ResourcePanel state={state} />);
      
      const hullElement = screen.getByText('85%');
      expect(hullElement).not.toHaveClass('text-red-500');
    });
  });

  describe('Phase 3 Visual Changes', () => {
    it('should apply horror theme styling in phase 3', () => {
      const state = createMockState({
        phase: 3
      });

      const { container } = render(<ResourcePanel state={state} />);
      
      // Should have horror-specific styling
      expect(container.querySelector('.text-flesh-pink')).toBeInTheDocument();
    });

    it('should show critical hull integrity during impact', () => {
      const state = createMockState({
        chapter1Stage: 'impact',
        hullIntegrity: 40
      });

      render(<ResourcePanel state={state} />);
      
      expect(screen.getByText('40%')).toBeInTheDocument();
      const hullElement = screen.getByText('40%');
      expect(hullElement).toHaveClass('text-red-500');
    });
  });

  describe('Resource Formatting', () => {
    it('should format filter waste with kg unit', () => {
      const state = createMockState({
        chapter1Stage: 'rust',
        filterWaste: 12.5
      });

      render(<ResourcePanel state={state} />);
      
      expect(screen.getByText('12 kg')).toBeInTheDocument();
    });

    it('should format core temperature with °C unit', () => {
      const state = createMockState({
        chapter1Stage: 'rust',
        coreTemperature: 18
      });

      render(<ResourcePanel state={state} />);
      
      expect(screen.getByText('18°C')).toBeInTheDocument();
    });

    it('should format percentages correctly', () => {
      const state = createMockState({
        chapter1Stage: 'impact',
        resources: { ...createMockState().resources, [ResourceType.OXYGEN]: 87 },
        hullIntegrity: 92
      });

      render(<ResourcePanel state={state} />);
      
      expect(screen.getByText('87%')).toBeInTheDocument();
      expect(screen.getByText('92%')).toBeInTheDocument();
    });
  });
});