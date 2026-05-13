import { useState } from 'react';

export default function Settings({ open, currentDays, onSave, onClose }) {
  const [days, setDays] = useState(currentDays);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(46,52,64,0.5)' }}>
      <div className="bg-white rounded-2xl w-full max-w-sm p-6" style={{ boxShadow: '0 8px 32px rgba(46,52,64,0.12)' }}>
        <h2 className="text-sm font-semibold uppercase tracking-wider mb-5" style={{ color: '#5E81AC' }}>
          Settings
        </h2>

        <div className="mb-6">
          <label className="block text-xs font-medium mb-1.5 uppercase tracking-wider" style={{ color: '#4C566A' }}>
            Stale after (days)
          </label>
          <div className="flex items-center gap-3">
            <input
              type="range"
              min={30}
              max={730}
              step={10}
              value={days}
              onChange={(e) => setDays(Number(e.target.value))}
              className="flex-1 accent-[#5E81AC]"
              style={{ accentColor: '#5E81AC' }}
            />
            <span className="text-sm font-medium w-16 text-right" style={{ color: '#2E3440' }}>
              {days}d
            </span>
          </div>
          <p className="text-xs mt-2" style={{ color: '#81A1C1' }}>
            {days >= 365
              ? `≈ ${Math.round(days / 30.4)} months (${(days / 365).toFixed(1)} years)`
              : `≈ ${Math.round(days / 30.4)} months`
            }
          </p>
        </div>

        <div className="flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm rounded-xl transition-all"
            style={{ color: '#4C566A', backgroundColor: '#E5E9F0' }}
          >
            Cancel
          </button>
          <button
            onClick={() => onSave(days)}
            className="px-5 py-2 text-sm font-medium text-white rounded-xl transition-all"
            style={{ backgroundColor: '#5E81AC' }}
            onMouseEnter={(e) => { e.target.style.backgroundColor = '#4C6F94' }}
            onMouseLeave={(e) => { e.target.style.backgroundColor = '#5E81AC' }}
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
