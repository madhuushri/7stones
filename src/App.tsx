import React, { useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { useGameStore } from './state/useGameStore';
import { GameScene } from './components/gameplay/GameScene';
import { HUD } from './components/ui/HUD';
import { MainMenu } from './components/ui/MainMenu';
import { CharacterCustomizer } from './components/ui/CharacterCustomizer';
import { SettingsModal } from './components/ui/SettingsModal';
import { TutorialModal } from './components/ui/TutorialModal';
import { PauseModal } from './components/ui/PauseModal';
import { GameOverModal } from './components/ui/GameOverModal';
import { MobileControls } from './components/ui/MobileControls';

export const App: React.FC = () => {
  const { phase, settings } = useGameStore();

  const [isCustomizerOpen, setIsCustomizerOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isTutorialOpen, setIsTutorialOpen] = useState(false);

  return (
    <div style={{ position: 'relative', width: '100vw', height: '100vh', overflow: 'hidden' }}>
      {/* 3D WebGL Canvas */}
      <div className="canvas-container">
        <Canvas
          shadows={settings.shadows}
          camera={{ position: [0, 5, 14], fov: 50, near: 0.1, far: 200 }}
          gl={{
            antialias: true,
            powerPreference: 'high-performance',
          }}
          dpr={[1, 2]}
        >
          <GameScene />
        </Canvas>
      </div>

      {/* Main Menu UI */}
      {phase === 'menu' && (
        <MainMenu
          onOpenCustomizer={() => setIsCustomizerOpen(true)}
          onOpenSettings={() => setIsSettingsOpen(true)}
          onOpenTutorial={() => setIsTutorialOpen(true)}
        />
      )}

      {/* In-Game HUD & Mobile Controls */}
      {phase !== 'menu' && (
        <>
          <HUD />
          <MobileControls />
        </>
      )}

      {/* Pause Modal */}
      {phase === 'paused' && (
        <PauseModal onOpenTutorial={() => setIsTutorialOpen(true)} />
      )}

      {/* Round Game Over / Victory Modal */}
      <GameOverModal />

      {/* Modals */}
      {isCustomizerOpen && (
        <CharacterCustomizer onClose={() => setIsCustomizerOpen(false)} />
      )}

      {isSettingsOpen && (
        <SettingsModal onClose={() => setIsSettingsOpen(false)} />
      )}

      {isTutorialOpen && (
        <TutorialModal onClose={() => setIsTutorialOpen(false)} />
      )}
    </div>
  );
};

export default App;
