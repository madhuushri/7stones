import React from 'react';
import { Canvas } from '@react-three/fiber';
import { useGameStore } from '../../state/useGameStore';
import { RobloxAvatar } from '../character/RobloxAvatar';
import { CharacterCustomization } from '../../types/game';
import { X, Sparkles, Check } from 'lucide-react';

interface CharacterCustomizerProps {
  onClose: () => void;
}

const SKIN_TONES = [
  { label: 'Fair Gold', val: '#FCD34D' },
  { label: 'Warm Amber', val: '#FBBF24' },
  { label: 'Sun Bronze', val: '#F59E0B' },
  { label: 'Deep Caramel', val: '#D97706' },
  { label: 'Rich Terracotta', val: '#B45309' },
  { label: 'Mocha', val: '#78350F' },
];

const HAIR_STYLES: { id: CharacterCustomization['hairStyle']; label: string }[] = [
  { id: 'spiky', label: 'Spiky Cut' },
  { id: 'curly', label: 'Afro Curls' },
  { id: 'cap', label: 'Sports Cap' },
  { id: 'headband', label: 'Athlete Headband' },
  { id: 'bald', label: 'Clean Shaved' },
];

const HAIR_COLORS = [
  { label: 'Jet Black', val: '#111827' },
  { label: 'Dark Brown', val: '#451A03' },
  { label: 'Chestnut', val: '#78350F' },
  { label: 'Golden Blonde', val: '#FBBF24' },
  { label: 'Neon Blue', val: '#0284C7' },
  { label: 'Fiery Crimson', val: '#DC2626' },
];

const SHIRT_COLORS = [
  { label: 'Saffron Gold (Runners)', val: '#F59E0B' },
  { label: 'Royal Teal (Seekers)', val: '#0284C7' },
  { label: 'Crimson Red', val: '#EF4444' },
  { label: 'Emerald Green', val: '#10B981' },
  { label: 'Amethyst Purple', val: '#8B5CF6' },
  { label: 'Midnight Black', val: '#1E293B' },
];

const PANTS_COLORS = [
  { label: 'Dark Slate', val: '#1E293B' },
  { label: 'Deep Denim', val: '#0F172A' },
  { label: 'Khaki Beige', val: '#D97706' },
  { label: 'Snow White', val: '#F8FAFC' },
  { label: 'Sport Grey', val: '#475569' },
];

const FACIAL_EXPRESSIONS: { id: CharacterCustomization['faceExpression']; label: string }[] = [
  { id: 'smile', label: 'Friendly Smile' },
  { id: 'determined', label: 'Determined Focus' },
  { id: 'excited', label: 'Excited Champ' },
  { id: 'cool', label: 'Cool Shades' },
];

const ACCESSORIES: { id: CharacterCustomization['accessory']; label: string }[] = [
  { id: 'none', label: 'None' },
  { id: 'wristband', label: 'Athlete Wristbands' },
  { id: 'badge', label: 'Golden Crest' },
];

export const CharacterCustomizer: React.FC<CharacterCustomizerProps> = ({ onClose }) => {
  const { customization, updateCustomization, humanTeam } = useGameStore();

  return (
    <div className="absolute inset-0 z-30 flex items-center justify-center bg-slate-950/85 p-4 backdrop-blur-md">
      <div className="flex h-full max-h-[92vh] w-full max-w-4xl flex-col md:flex-row overflow-hidden rounded-3xl bg-slate-900 border border-slate-700/80 shadow-2xl">
        {/* Left: 3D Real-time Interactive Avatar Preview */}
        <div className="relative flex flex-1 flex-col items-center justify-center bg-gradient-to-b from-slate-800 to-slate-950 p-4">
          <div className="absolute top-4 left-4 flex items-center gap-2 rounded-full bg-slate-900/80 px-3.5 py-1 text-xs font-bold text-amber-400 border border-slate-700">
            <Sparkles className="h-3.5 w-3.5" />
            <span>3D Live Avatar Preview</span>
          </div>

          <div className="h-72 w-full md:h-full">
            <Canvas shadows camera={{ position: [0, 1.5, 3.2], fov: 45 }}>
              <ambientLight intensity={0.7} />
              <directionalLight position={[3, 5, 4]} intensity={1.5} castShadow />
              <pointLight position={[-2, 2, -2]} intensity={0.5} />
              {/* Floor circle */}
              <mesh position={[0, -0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                <circleGeometry args={[1.2, 32]} />
                <meshStandardMaterial color="#0F172A" />
              </mesh>
              <RobloxAvatar
                customization={customization}
                team={humanTeam}
                animation="dance"
                isHuman={true}
                position={[0, 0, 0]}
                rotation={0}
                name={customization.avatarName}
              />
            </Canvas>
          </div>

          <div className="mt-2 text-center text-xs text-slate-400">
            Previewing victory celebration dance!
          </div>
        </div>

        {/* Right: Customization Controls & Options */}
        <div className="flex flex-1 flex-col overflow-y-auto p-6 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div>
              <h2 className="text-xl font-black text-white">Customize Avatar</h2>
              <p className="text-xs text-slate-400">Style your Seven Stones champion</p>
            </div>
            <button
              onClick={onClose}
              className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white transition-all"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Player Name */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-300">
              Player Name
            </label>
            <input
              type="text"
              value={customization.avatarName}
              maxLength={15}
              onChange={(e) => updateCustomization({ avatarName: e.target.value })}
              className="w-full rounded-xl bg-slate-950 px-3.5 py-2.5 text-sm text-white border border-slate-700 focus:border-amber-400 focus:outline-none"
              placeholder="Enter name..."
            />
          </div>

          {/* Skin Tone */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-300">
              Skin Tone
            </label>
            <div className="grid grid-cols-6 gap-2">
              {SKIN_TONES.map((s) => (
                <button
                  key={s.val}
                  onClick={() => updateCustomization({ skinTone: s.val })}
                  style={{ backgroundColor: s.val }}
                  className={`h-9 rounded-xl transition-all ${
                    customization.skinTone === s.val
                      ? 'ring-4 ring-amber-400 scale-105'
                      : 'hover:scale-105'
                  }`}
                  title={s.label}
                />
              ))}
            </div>
          </div>

          {/* Hair Style */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-300">
              Hair Style
            </label>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {HAIR_STYLES.map((h) => (
                <button
                  key={h.id}
                  onClick={() => updateCustomization({ hairStyle: h.id })}
                  className={`rounded-xl px-3 py-2 text-xs font-bold transition-all border ${
                    customization.hairStyle === h.id
                      ? 'bg-amber-500/20 text-amber-300 border-amber-400'
                      : 'bg-slate-950/80 text-slate-300 border-slate-800 hover:bg-slate-800'
                  }`}
                >
                  {h.label}
                </button>
              ))}
            </div>
          </div>

          {/* Hair Color */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-300">
              Hair Color
            </label>
            <div className="grid grid-cols-6 gap-2">
              {HAIR_COLORS.map((hc) => (
                <button
                  key={hc.val}
                  onClick={() => updateCustomization({ hairColor: hc.val })}
                  style={{ backgroundColor: hc.val }}
                  className={`h-9 rounded-xl transition-all ${
                    customization.hairColor === hc.val
                      ? 'ring-4 ring-amber-400 scale-105'
                      : 'hover:scale-105'
                  }`}
                  title={hc.label}
                />
              ))}
            </div>
          </div>

          {/* Jersey / Shirt Color */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-300">
              Jersey Shirt Color
            </label>
            <div className="grid grid-cols-6 gap-2">
              {SHIRT_COLORS.map((sc) => (
                <button
                  key={sc.val}
                  onClick={() => updateCustomization({ shirtColor: sc.val })}
                  style={{ backgroundColor: sc.val }}
                  className={`h-9 rounded-xl transition-all ${
                    customization.shirtColor === sc.val
                      ? 'ring-4 ring-amber-400 scale-105'
                      : 'hover:scale-105'
                  }`}
                  title={sc.label}
                />
              ))}
            </div>
          </div>

          {/* Pants Color */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-300">
              Pants / Shorts Color
            </label>
            <div className="grid grid-cols-5 gap-2">
              {PANTS_COLORS.map((pc) => (
                <button
                  key={pc.val}
                  onClick={() => updateCustomization({ pantsColor: pc.val })}
                  style={{ backgroundColor: pc.val }}
                  className={`h-9 rounded-xl transition-all ${
                    customization.pantsColor === pc.val
                      ? 'ring-4 ring-amber-400 scale-105'
                      : 'hover:scale-105'
                  }`}
                  title={pc.label}
                />
              ))}
            </div>
          </div>

          {/* Facial Expression */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-300">
              Facial Expression
            </label>
            <div className="grid grid-cols-2 gap-2">
              {FACIAL_EXPRESSIONS.map((f) => (
                <button
                  key={f.id}
                  onClick={() => updateCustomization({ faceExpression: f.id })}
                  className={`rounded-xl px-3 py-2 text-xs font-bold transition-all border ${
                    customization.faceExpression === f.id
                      ? 'bg-amber-500/20 text-amber-300 border-amber-400'
                      : 'bg-slate-950/80 text-slate-300 border-slate-800 hover:bg-slate-800'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {/* Accessories */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-300">
              Sports Accessory
            </label>
            <div className="grid grid-cols-3 gap-2">
              {ACCESSORIES.map((acc) => (
                <button
                  key={acc.id}
                  onClick={() => updateCustomization({ accessory: acc.id })}
                  className={`rounded-xl px-3 py-2 text-xs font-bold transition-all border ${
                    customization.accessory === acc.id
                      ? 'bg-amber-500/20 text-amber-300 border-amber-400'
                      : 'bg-slate-950/80 text-slate-300 border-slate-800 hover:bg-slate-800'
                  }`}
                >
                  {acc.label}
                </button>
              ))}
            </div>
          </div>

          {/* Done Button */}
          <button
            onClick={onClose}
            className="w-full flex items-center justify-center gap-2 rounded-2xl bg-amber-500 py-3 font-black text-slate-950 hover:bg-amber-400 active:scale-95 transition-all shadow-lg"
          >
            <Check className="h-5 w-5" />
            <span>SAVE & RETURN</span>
          </button>
        </div>
      </div>
    </div>
  );
};
