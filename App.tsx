import React from 'react';
import { useGameEngine } from './src/hooks/useGameEngine';
import { LogViewer } from './src/components/LogViewer';
import { ResourcePanel } from './src/components/ResourcePanel';
import { ControlPanel } from './src/components/ControlPanel';

export default function App() {
  const { state, dispatch } = useGameEngine();
  const isHorror = state.phase === 3;
  const isAbyss = state.phase === 1 && state.flags.hasLight;
  const isImpact = state.phase === 1 && state.chapter1Stage === 'impact';

  return (
    <div className={`w-screen h-screen flex overflow-hidden font-sans selection:bg-red-900 selection:text-white transition-colors duration-2000 
      ${isHorror ? 'flesh-theme bg-flesh-bg' : (isAbyss ? 'bg-abyss-blue' : 'bg-abyss-black')}
      ${isImpact ? 'impact-theme' : ''}
    `}>
      
      {/* Left Column: Narrative (30%) */}
      <div className="w-[30%] min-w-[300px] h-full">
        <LogViewer logs={state.logs} phase={state.phase} />
      </div>

      {/* Center Column: Action (50%) */}
      <div className="flex-1 h-full relative">
        <ControlPanel state={state} dispatch={dispatch} />
        
        {/* Overlay Vignette for atmosphere */}
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.8)_100%)]" />
        
        {/* Oxygen Crisis Red Flash */}
        {state.flags.oxygenCrisis && (
             <div className="pointer-events-none absolute inset-0 bg-red-900/20 animate-pulse z-50" />
        )}

        {/* Impact Phase Red Overlay */}
        {isImpact && (
             <div className="pointer-events-none absolute inset-0 bg-red-900/30 animate-pulse z-40" />
        )}
      </div>

      {/* Right Column: Status (20%) */}
      <div className="w-[20%] min-w-[200px] h-full hidden md:block">
        <ResourcePanel state={state} />
      </div>

      {/* Mobile view adjustments could go here, strictly sticking to 3-col desktop focus for this prompt */}
    </div>
  );
}