import React, { useState } from 'react';
import {
  UserFitProfile,
  DigitalTwin,
} from '../types/schema';
import {
  Sparkles,
  Ruler,
  MapPin,
  Check,
  Camera,
  RotateCcw,
  Sliders,
  User,
  ShieldCheck,
  Info,
} from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  profile: UserFitProfile;
  digitalTwin: DigitalTwin;
  onSaveProfile: (updatedProfile: UserFitProfile, updatedTwin: DigitalTwin) => void;
}

const PRESET_AVATARS = [
  {
    name: 'Claire (Warm Sand, Bob)',
    photoUrl: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=800&q=85',
    skinTone: 'Warm Sand',
    hairStyle: 'Textured Bob',
    gender: 'women' as const,
  },
  {
    name: 'Amara (Deep Bronze, Braids)',
    photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=85',
    skinTone: 'Deep Bronze',
    hairStyle: 'Micro Braids',
    gender: 'women' as const,
  },
  {
    name: 'Soren (Fair Nordic, Wavy)',
    photoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=800&q=85',
    skinTone: 'Fair Nordic',
    hairStyle: 'Short Taper',
    gender: 'men' as const,
  },
  {
    name: 'Kai (Golden Tan, Long Waves)',
    photoUrl: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=800&q=85',
    skinTone: 'Golden Olive',
    hairStyle: 'Shoulder Waves',
    gender: 'unisex' as const,
  },
];

export const DigitalTwinOnboardingModal: React.FC<Props> = ({
  isOpen,
  onClose,
  profile,
  digitalTwin,
  onSaveProfile,
}) => {
  const [formData, setFormData] = useState<UserFitProfile>({ ...profile });
  const [twinData, setTwinData] = useState<DigitalTwin>({ ...digitalTwin });
  const [activeTab, setActiveTab] = useState<'measurements' | 'avatar' | 'location'>('measurements');
  const [isAiEstimating, setIsAiEstimating] = useState(false);

  if (!isOpen) return null;

  const handleMeasurementChange = (field: keyof UserFitProfile, val: number | string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: val,
    }));
  };

  const simulateAiBodyScan = () => {
    setIsAiEstimating(true);
    setTimeout(() => {
      setIsAiEstimating(false);
      // Determine body shape
      const waistToHip = formData.waistInches / formData.hipsInches;
      let bodyType: DigitalTwin['bodyType'] = 'hourglass';
      if (waistToHip > 0.85) bodyType = 'rectangle';
      else if (formData.chestInches > formData.hipsInches + 2) bodyType = 'inverted-triangle';
      else if (formData.hipsInches > formData.chestInches + 3) bodyType = 'pear';

      setTwinData((prev) => ({
        ...prev,
        bodyType,
        createdWithAi: true,
      }));
    }, 700);
  };

  const handleSave = () => {
    onSaveProfile(formData, twinData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="relative w-full max-w-3xl max-h-[92vh] overflow-y-auto bg-[#12141a] border border-white/10 rounded-2xl shadow-2xl text-zinc-100 p-6 md:p-8">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-white/10 pb-5">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-medium tracking-wide mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Exact Fit Digital Twin Engine</span>
            </div>
            <h2 className="text-2xl font-serif-editorial text-white tracking-tight">
              Anatomical Body Twin & Zero-Miss Discovery
            </h2>
            <p className="text-xs text-zinc-400 mt-1 max-w-xl">
              Virdrobe's strict zero-miss rule guarantees every magazine item fits your exact body measurements. Never see out-of-stock or non-fitting sizes.
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-white p-2 rounded-lg hover:bg-white/5 transition"
          >
            ✕
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-2 border-b border-white/10 mt-4 mb-6">
          <button
            onClick={() => setActiveTab('measurements')}
            className={`pb-3 text-xs font-semibold tracking-wider uppercase transition border-b-2 flex items-center gap-1.5 ${
              activeTab === 'measurements'
                ? 'border-rose-400 text-rose-300'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Ruler className="w-4 h-4" />
            Exact Measurements
          </button>
          <button
            onClick={() => setActiveTab('avatar')}
            className={`pb-3 text-xs font-semibold tracking-wider uppercase transition border-b-2 flex items-center gap-1.5 ${
              activeTab === 'avatar'
                ? 'border-rose-400 text-rose-300'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <User className="w-4 h-4" />
            Digital Twin Photo
          </button>
          <button
            onClick={() => setActiveTab('location')}
            className={`pb-3 text-xs font-semibold tracking-wider uppercase transition border-b-2 flex items-center gap-1.5 ${
              activeTab === 'location'
                ? 'border-rose-400 text-rose-300'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <MapPin className="w-4 h-4" />
            Local Radius
          </button>
        </div>

        {/* Tab 1: Measurements */}
        {activeTab === 'measurements' && (
          <div className="space-y-6">
            <div className="bg-zinc-900/60 border border-white/5 p-4 rounded-xl flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center font-bold">
                  {twinData.bodyType.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <p className="text-xs text-zinc-400 uppercase tracking-widest font-mono">
                    Silhouette Shape
                  </p>
                  <p className="text-sm font-semibold text-white capitalize">
                    {twinData.bodyType} Body Archetype
                  </p>
                </div>
              </div>
              <button
                onClick={simulateAiBodyScan}
                disabled={isAiEstimating}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-xs font-medium text-white transition disabled:opacity-50"
              >
                <Sparkles className="w-3.5 h-3.5 text-rose-400" />
                {isAiEstimating ? 'Analyzing...' : 'Recalibrate Silhouette'}
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Height */}
              <div className="p-3.5 bg-black/40 border border-white/5 rounded-xl">
                <div className="flex justify-between items-center mb-1.5">
                  <label className="text-xs font-mono text-zinc-400 uppercase tracking-wider">
                    Height
                  </label>
                  <span className="text-sm font-bold text-rose-300">
                    {Math.floor(formData.heightInches / 12)}'{formData.heightInches % 12}" ({formData.heightInches}")
                  </span>
                </div>
                <input
                  type="range"
                  min="58"
                  max="78"
                  value={formData.heightInches}
                  onChange={(e) => handleMeasurementChange('heightInches', Number(e.target.value))}
                  className="w-full accent-rose-400 cursor-pointer"
                />
              </div>

              {/* Chest */}
              <div className="p-3.5 bg-black/40 border border-white/5 rounded-xl">
                <div className="flex justify-between items-center mb-1.5">
                  <label className="text-xs font-mono text-zinc-400 uppercase tracking-wider">
                    Chest / Bust
                  </label>
                  <span className="text-sm font-bold text-rose-300">
                    {formData.chestInches}"
                  </span>
                </div>
                <input
                  type="range"
                  min="30"
                  max="48"
                  step="0.5"
                  value={formData.chestInches}
                  onChange={(e) => handleMeasurementChange('chestInches', Number(e.target.value))}
                  className="w-full accent-rose-400 cursor-pointer"
                />
              </div>

              {/* Waist */}
              <div className="p-3.5 bg-black/40 border border-white/5 rounded-xl">
                <div className="flex justify-between items-center mb-1.5">
                  <label className="text-xs font-mono text-zinc-400 uppercase tracking-wider">
                    Waist (Exact)
                  </label>
                  <span className="text-sm font-bold text-rose-300">
                    {formData.waistInches}"
                  </span>
                </div>
                <input
                  type="range"
                  min="22"
                  max="44"
                  step="0.5"
                  value={formData.waistInches}
                  onChange={(e) => handleMeasurementChange('waistInches', Number(e.target.value))}
                  className="w-full accent-rose-400 cursor-pointer"
                />
              </div>

              {/* Hips */}
              <div className="p-3.5 bg-black/40 border border-white/5 rounded-xl">
                <div className="flex justify-between items-center mb-1.5">
                  <label className="text-xs font-mono text-zinc-400 uppercase tracking-wider">
                    Hips
                  </label>
                  <span className="text-sm font-bold text-rose-300">
                    {formData.hipsInches}"
                  </span>
                </div>
                <input
                  type="range"
                  min="30"
                  max="52"
                  step="0.5"
                  value={formData.hipsInches}
                  onChange={(e) => handleMeasurementChange('hipsInches', Number(e.target.value))}
                  className="w-full accent-rose-400 cursor-pointer"
                />
              </div>

              {/* Inseam */}
              <div className="p-3.5 bg-black/40 border border-white/5 rounded-xl">
                <div className="flex justify-between items-center mb-1.5">
                  <label className="text-xs font-mono text-zinc-400 uppercase tracking-wider">
                    Inseam
                  </label>
                  <span className="text-sm font-bold text-rose-300">
                    {formData.inseamInches}"
                  </span>
                </div>
                <input
                  type="range"
                  min="26"
                  max="36"
                  step="0.5"
                  value={formData.inseamInches}
                  onChange={(e) => handleMeasurementChange('inseamInches', Number(e.target.value))}
                  className="w-full accent-rose-400 cursor-pointer"
                />
              </div>

              {/* Shoe Size */}
              <div className="p-3.5 bg-black/40 border border-white/5 rounded-xl">
                <div className="flex justify-between items-center mb-1.5">
                  <label className="text-xs font-mono text-zinc-400 uppercase tracking-wider">
                    Shoe Size (US)
                  </label>
                  <span className="text-sm font-bold text-rose-300">
                    {formData.shoeSizeUS} US
                  </span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="13"
                  step="0.5"
                  value={formData.shoeSizeUS}
                  onChange={(e) => handleMeasurementChange('shoeSizeUS', Number(e.target.value))}
                  className="w-full accent-rose-400 cursor-pointer"
                />
              </div>
            </div>

            {/* Fit Preference */}
            <div>
              <label className="text-xs font-mono text-zinc-400 uppercase tracking-wider block mb-2">
                Drape & Fit Preference
              </label>
              <div className="grid grid-cols-4 gap-2">
                {(['fitted', 'tailored', 'relaxed', 'oversized'] as const).map((pref) => (
                  <button
                    key={pref}
                    type="button"
                    onClick={() => handleMeasurementChange('fitPreference', pref)}
                    className={`py-2 px-3 rounded-lg text-xs font-semibold capitalize border transition ${
                      formData.fitPreference === pref
                        ? 'bg-rose-500/20 border-rose-500 text-rose-300'
                        : 'bg-zinc-900 border-white/5 text-zinc-400 hover:text-white'
                    }`}
                  >
                    {pref}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Avatar & Photos */}
        {activeTab === 'avatar' && (
          <div className="space-y-6">
            <div>
              <label className="text-xs font-mono text-zinc-400 uppercase tracking-wider block mb-2">
                Choose Twin Avatar Persona or Upload Full-Body Scan
              </label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {PRESET_AVATARS.map((preset) => (
                  <button
                    key={preset.name}
                    type="button"
                    onClick={() =>
                      setTwinData((prev) => ({
                        ...prev,
                        photoUrl: preset.photoUrl,
                        skinTone: preset.skinTone,
                        hairStyle: preset.hairStyle,
                      }))
                    }
                    className={`group relative rounded-xl overflow-hidden border transition text-left ${
                      twinData.photoUrl === preset.photoUrl
                        ? 'border-rose-400 ring-2 ring-rose-500/50'
                        : 'border-white/10 hover:border-white/30'
                    }`}
                  >
                    <div className="aspect-[3/4] w-full overflow-hidden bg-zinc-900">
                      <img
                        src={preset.photoUrl}
                        alt={preset.name}
                        className="w-full h-full object-cover object-top group-hover:scale-105 transition duration-300"
                      />
                    </div>
                    <div className="p-2 bg-zinc-900/90 text-[11px]">
                      <p className="font-semibold text-white truncate">{preset.name}</p>
                      <p className="text-zinc-400 text-[10px]">{preset.skinTone}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Custom URL or upload simulation */}
            <div className="p-4 bg-zinc-900/50 rounded-xl border border-white/5">
              <label className="text-xs font-mono text-zinc-400 uppercase tracking-wider block mb-2">
                Custom Reference Image URL (Full Body)
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={twinData.photoUrl}
                  onChange={(e) => setTwinData((prev) => ({ ...prev, photoUrl: e.target.value }))}
                  placeholder="https://..."
                  className="flex-1 bg-black/60 border border-white/10 rounded-lg px-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-rose-400"
                />
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Location */}
        {activeTab === 'location' && (
          <div className="space-y-6">
            <div className="p-4 bg-zinc-900/50 rounded-xl border border-white/5 space-y-4">
              <div>
                <label className="text-xs font-mono text-zinc-400 uppercase tracking-wider block mb-1.5">
                  Home City & Neighborhood
                </label>
                <input
                  type="text"
                  value={formData.location.city}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      location: { ...prev.location, city: e.target.value },
                    }))
                  }
                  className="w-full bg-black/60 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-rose-400"
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="text-xs font-mono text-zinc-400 uppercase tracking-wider">
                    Discovery Geofence Radius
                  </label>
                  <span className="text-sm font-bold text-rose-300">
                    Within {formData.radiusMiles} miles
                  </span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="100"
                  step="5"
                  value={formData.radiusMiles}
                  onChange={(e) => handleMeasurementChange('radiusMiles', Number(e.target.value))}
                  className="w-full accent-rose-400 cursor-pointer"
                />
                <p className="text-[11px] text-zinc-400 mt-1">
                  Filters local vintage boutiques, consignment shops, and independent designers nearby for instant same-day pickup or local courier fitting.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Strict Filtering Notice */}
        <div className="mt-6 p-3.5 bg-rose-950/20 border border-rose-500/20 rounded-xl flex items-start gap-3">
          <ShieldCheck className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
          <div className="text-xs text-zinc-300 leading-relaxed">
            <strong className="text-white font-semibold">Zero-Miss Exact Fit Enforced:</strong>{' '}
            Items outside your measurements ({formData.chestInches}" chest, {formData.waistInches}" waist, {formData.hipsInches}" hips) will be completely hidden from your Discover Feed.
          </div>
        </div>

        {/* Footer Actions */}
        <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-zinc-400 hover:text-white transition"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-rose-500 to-amber-500 text-white font-semibold text-xs tracking-wide shadow-lg shadow-rose-500/20 hover:opacity-95 transition"
          >
            Save Digital Twin & Update Feed
          </button>
        </div>
      </div>
    </div>
  );
};
