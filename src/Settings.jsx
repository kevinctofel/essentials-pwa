import { useState } from 'react';

const VERIFY_URL = 'https://minimally-landing.pages.dev/api/verify';

export default function Settings({ open, currentDays, onSave, onClose, licenseKey, onLicenseUpdate }) {
  const [days, setDays] = useState(currentDays);
  const [keyInput, setKeyInput] = useState(licenseKey ?? '');
  const [verifying, setVerifying] = useState(false);
  const [message, setMessage] = useState(null);

  if (!open) return null;

  async function handleVerify() {
    if (!keyInput.trim()) return;
    setVerifying(true);
    setMessage(null);
    try {
      const res = await fetch(VERIFY_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ licenseKey: keyInput.trim() }),
      });
      const data = await res.json();
      if (data.valid) {
        setMessage({ type: 'success', text: 'License verified! Unlimited unlocked.' });
        onLicenseUpdate(keyInput.trim());
      } else {
        setMessage({ type: 'error', text: 'Invalid or expired license key.' });
      }
    } catch {
      setMessage({ type: 'error', text: 'Could not reach verification server. Check your connection.' });
    }
    setVerifying(false);
  }

  function handleRemoveLicense() {
    setKeyInput('');
    setMessage(null);
    onLicenseUpdate(null);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(46,52,64,0.5)' }}>
      <div className="bg-white rounded-2xl w-full max-w-sm p-6" style={{ boxShadow: '0 8px 32px rgba(46,52,64,0.12)' }}>
        <h2 className="text-sm font-semibold uppercase tracking-wider mb-5" style={{ color: '#5E81AC' }}>
          Settings
        </h2>

        {/* Stale Threshold */}
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

        {/* License Key */}
        <div className="mb-6 pt-4" style={{ borderTop: '1px solid #D8DEE9' }}>
          <label className="block text-xs font-medium mb-1.5 uppercase tracking-wider" style={{ color: '#4C566A' }}>
            License Key
          </label>
          {licenseKey ? (
            <div className="rounded-xl p-3" style={{ backgroundColor: '#F2F7F2' }}>
              <p className="text-xs font-medium" style={{ color: '#A3BE8C' }}>
                ✅ Unlimited license active
              </p>
              <p className="text-xs mt-1" style={{ color: '#4C566A', wordBreak: 'break-all' }}>
                {licenseKey}
              </p>
              <button
                onClick={handleRemoveLicense}
                className="mt-2 text-xs rounded-lg px-2.5 py-1 border transition-all"
                style={{ color: '#BF616A', backgroundColor: 'white', borderColor: '#D8DEE9' }}
              >
                Remove License
              </button>
            </div>
          ) : (
            <div>
              <input
                type="text"
                value={keyInput}
                onChange={(e) => setKeyInput(e.target.value)}
                placeholder="Enter your license key"
                className="w-full px-4 py-2.5 border rounded-xl text-sm transition-all focus:outline-none focus:ring-2"
                style={{ color: '#2E3440', borderColor: '#D8DEE9', backgroundColor: '#ECEFF4' }}
                onFocus={(e) => { e.target.style.borderColor = '#81A1C1'; e.target.style.boxShadow = '0 0 0 2px rgba(129,161,193,0.2)' }}
                onBlur={(e) => { e.target.style.borderColor = '#D8DEE9'; e.target.style.boxShadow = 'none' }}
              />
              <div className="flex items-center gap-3 mt-2">
                <button
                  onClick={handleVerify}
                  disabled={verifying || !keyInput.trim()}
                  className="px-4 py-2 text-xs font-medium text-white rounded-xl transition-all disabled:opacity-50"
                  style={{ backgroundColor: '#5E81AC' }}
                  onMouseEnter={(e) => { if (!verifying) e.target.style.backgroundColor = '#4C6F94' }}
                  onMouseLeave={(e) => { e.target.style.backgroundColor = '#5E81AC' }}
                >
                  {verifying ? 'Verifying...' : 'Verify'}
                </button>
                <a
                  href="https://minimally-landing.pages.dev/#pricing"
                  target="_blank"
                  rel="noopener"
                  className="text-xs font-medium transition-all"
                  style={{ color: '#5E81AC' }}
                >
                  Purchase Unlimited →
                </a>
              </div>
              {message && (
                <p className="text-xs mt-2" style={{ color: message.type === 'success' ? '#A3BE8C' : '#BF616A' }}>
                  {message.text}
                </p>
              )}
            </div>
          )}
        </div>

        <div className="flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm rounded-xl transition-all"
            style={{ color: '#4C566A', backgroundColor: '#E5E9F0' }}
          >
            Close
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