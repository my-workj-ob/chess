'use client';

import React from 'react';
import { X, Settings, Volume2, VolumeX, Eye, Sparkles } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  boardTheme: 'classic' | 'emerald' | 'wood' | 'cyberpunk';
  onChangeBoardTheme: (theme: 'classic' | 'emerald' | 'wood' | 'cyberpunk') => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
  is3D: boolean;
  onToggle3D: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  boardTheme,
  onChangeBoardTheme,
  soundEnabled,
  onToggleSound,
  is3D,
  onToggle3D,
}) => {
  if (!isOpen) return null;

  const themes = [
    {
      id: 'classic' as const,
      label: 'Classic Slate',
      desc: 'High contrast tournament navy',
      previewLight: 'bg-[#C8CFDA]',
      previewDark: 'bg-[#627088]',
    },
    {
      id: 'emerald' as const,
      label: 'Emerald Green',
      desc: 'Traditional club style',
      previewLight: 'bg-[#eeeed2]',
      previewDark: 'bg-[#769656]',
    },
    {
      id: 'wood' as const,
      label: 'Warm Wood',
      desc: 'Classic handcrafted timber',
      previewLight: 'bg-[#f0d9b5]',
      previewDark: 'bg-[#b58863]',
    },
    {
      id: 'cyberpunk' as const,
      label: 'Cyberpunk Neon',
      desc: 'Vibrant neon purple theme',
      previewLight: 'bg-[#1e1b4b]',
      previewDark: 'bg-[#4c1d95]',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-md bg-[#0F1424] border border-[#20293E] rounded-3xl p-6 shadow-2xl space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h2 className="text-base font-black text-white flex items-center gap-2">
            <Settings className="text-violet-400" size={18} />
            Game Settings
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-[#182034] transition"
          >
            <X size={18} />
          </button>
        </div>

        {/* Board Theme Selection */}
        <div className="space-y-2">
          <label className="text-[11px] font-black text-slate-400 uppercase tracking-wider block">
            Board Theme
          </label>
          <div className="grid grid-cols-2 gap-2">
            {themes.map((t) => {
              const active = boardTheme === t.id;
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => onChangeBoardTheme(t.id)}
                  className={`p-3 rounded-2xl border text-left transition flex items-center gap-3 ${
                    active
                      ? 'bg-[#5B4DF6]/15 border-[#5B4DF6] text-white shadow-md'
                      : 'bg-[#141B30] border-[#1E2844] text-slate-300 hover:border-slate-600'
                  }`}
                >
                  <div className="w-8 h-8 rounded-lg overflow-hidden grid grid-cols-2 grid-rows-2 shrink-0 border border-black/30 shadow-sm">
                    <div className={t.previewLight} />
                    <div className={t.previewDark} />
                    <div className={t.previewDark} />
                    <div className={t.previewLight} />
                  </div>
                  <div>
                    <span className="text-xs font-bold block">{t.label}</span>
                    <span className="text-[9px] text-slate-400 block">{t.desc}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Sound FX Toggle */}
        <div className="flex items-center justify-between p-3 rounded-2xl bg-[#141B30] border border-[#1E2844]">
          <div className="flex items-center gap-2.5">
            {soundEnabled ? (
              <Volume2 className="text-violet-400" size={18} />
            ) : (
              <VolumeX className="text-slate-500" size={18} />
            )}
            <div>
              <span className="text-xs font-bold text-white block">Sound Effects</span>
              <span className="text-[10px] text-slate-400">Move, capture, and check audio</span>
            </div>
          </div>
          <button
            type="button"
            onClick={onToggleSound}
            className={`w-11 h-6 rounded-full transition-colors relative p-0.5 ${
              soundEnabled ? 'bg-[#5B4DF6]' : 'bg-slate-800'
            }`}
          >
            <div
              className={`w-5 h-5 rounded-full bg-white transition-transform ${
                soundEnabled ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        {/* 3D View Toggle */}
        <div className="flex items-center justify-between p-3 rounded-2xl bg-[#141B30] border border-[#1E2844]">
          <div className="flex items-center gap-2.5">
            <Sparkles className="text-violet-400" size={18} />
            <div>
              <span className="text-xs font-bold text-white block">3D Perspective View</span>
              <span className="text-[10px] text-slate-400">WebGL 3D rendered board</span>
            </div>
          </div>
          <button
            type="button"
            onClick={onToggle3D}
            className={`w-11 h-6 rounded-full transition-colors relative p-0.5 ${
              is3D ? 'bg-[#5B4DF6]' : 'bg-slate-800'
            }`}
          >
            <div
              className={`w-5 h-5 rounded-full bg-white transition-transform ${
                is3D ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>
      </div>
    </div>
  );
};
