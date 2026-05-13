import { useState, useEffect } from 'react';
import db, { getSetting, setSetting, DEFAULT_STALE_THRESHOLD_DAYS } from './db';
import exifr from 'exifr';
import Settings from './Settings';

function App() {
  const [items, setItems] = useState([]);
  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [location, setLocation] = useState('');
  const [thumbPreview, setThumbPreview] = useState(null);
  const [lastUsedFromPhoto, setLastUsedFromPhoto] = useState(null);
  const [staleThreshold, setStaleThreshold] = useState(DEFAULT_STALE_THRESHOLD_DAYS);
  const [activeTab, setActiveTab] = useState('all');
  const [showSettings, setShowSettings] = useState(false);

  useEffect(() => {
    (async () => {
      const threshold = await getSetting('staleThreshold', DEFAULT_STALE_THRESHOLD_DAYS);
      setStaleThreshold(threshold);
      await loadItems();
    })();
  }, []);

  async function loadItems() {
    const allItems = await db.items.reverse().toArray();
    setItems(allItems);
  }

  async function handleImageChange(e) {
    const file = e.target.files[0];
    if (!file) return;

    const thumbBase64 = await createThumbnail(file);
    setThumbPreview(thumbBase64);

    exifr.parse(file).then((exif) => {
      if (exif && exif.CreateDate) {
        setLastUsedFromPhoto(exif.CreateDate.getTime());
      } else {
        setLastUsedFromPhoto(Date.now());
      }
    }).catch(() => {
      setLastUsedFromPhoto(Date.now());
    });
  }

  function resetForm() {
    setName('');
    setCategory('');
    setLocation('');
    setThumbPreview(null);
    setLastUsedFromPhoto(null);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!name.trim()) return;

    const lastUsed = lastUsedFromPhoto ?? Date.now();

    await db.items.add({
      name: name.trim(),
      category: category.trim(),
      location: location.trim(),
      addedDate: Date.now(),
      lastUsed,
      photoThumb: thumbPreview ?? '',
    });

    resetForm();
    await loadItems();
  }

  async function createThumbnail(blob) {
    if (!blob) return '';
    return new Promise((resolve) => {
      const img = new Image();
      img.src = URL.createObjectURL(blob);
      img.onload = () => {
        const MAX_SIZE = 200;
        let { width, height } = img;
        if (width > height) {
          if (width > MAX_SIZE) {
            height *= MAX_SIZE / width;
            width = MAX_SIZE;
          }
        } else {
          if (height > MAX_SIZE) {
            width *= MAX_SIZE / height;
            height = MAX_SIZE;
          }
        }
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        canvas.toBlob((blob) => {
          const reader = new FileReader();
          reader.onloadend = () => {
            const base64 = reader.result.split(',')[1];
            resolve(base64);
          };
          reader.readAsDataURL(blob);
        }, 'image/jpeg', 0.7);
      };
    });
  }

  async function markUsed(id) {
    const now = Date.now();
    await db.items.update(id, { lastUsed: now });
    await loadItems();
  }

  async function handleSaveThreshold(days) {
    await setSetting('staleThreshold', days);
    setStaleThreshold(days);
    setShowSettings(false);
  }

  function formatDate(ts) {
    return new Date(ts).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  }

  function daysSinceUse(ts) {
    return Math.floor((Date.now() - ts) / (1000 * 60 * 60 * 24));
  }

  const staleItems = items.filter((item) => daysSinceUse(item.lastUsed) > staleThreshold);
  const displayedItems = activeTab === 'stale' ? staleItems : items;

  return (
    <div className="min-h-screen p-6" style={{ backgroundColor: '#ECEFF4' }}>
      <div className="max-w-lg mx-auto">

        {/* Header */}
        <header className="mb-8 flex items-start justify-between">
          <div>
            <h1 className="text-3xl tracking-tight" style={{ fontFamily: 'Georgia, Cambria, "Times New Roman", Times, serif', color: '#2E3440' }}>
              Essentials
            </h1>
            <p className="text-sm mt-1" style={{ color: '#4C566A' }}>
              Track what you own. Know what you use.
            </p>
          </div>
          <button
            onClick={() => setShowSettings(true)}
            className="p-2 rounded-xl transition-all"
            style={{ color: '#81A1C1' }}
            onMouseEnter={(e) => { e.target.style.backgroundColor = '#E5E9F0'; e.target.style.color = '#5E81AC' }}
            onMouseLeave={(e) => { e.target.style.backgroundColor = 'transparent'; e.target.style.color = '#81A1C1' }}
            aria-label="Settings"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.573-1.066z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </button>
        </header>

        {/* Summary Banner */}
        {items.length > 0 && staleItems.length > 0 && (
          <div className="mb-5 rounded-xl px-4 py-3 flex items-start gap-2" style={{ backgroundColor: '#FDF6EC', border: '1px solid #EBCB8B' }}>
            <span style={{ color: '#D08770', fontSize: '1rem', lineHeight: 1.4 }}>⏰</span>
            <p className="text-sm" style={{ color: '#8B6914' }}>
              <strong style={{ color: '#D08770' }}>{staleItems.length}</strong>{' '}
              {staleItems.length === 1 ? 'item hasn\'t' : 'items haven\'t'} been used in{' '}
              <strong>{staleThreshold >= 365
                ? `${Math.round(staleThreshold / 30.4)} months`
                : `${staleThreshold} days`
              }</strong>
            </p>
          </div>
        )}

        {/* Add Item Form */}
        <div className="bg-white rounded-2xl p-6 mb-6" style={{ boxShadow: '0 1px 3px rgba(46,52,64,0.04), 0 1px 2px rgba(46,52,64,0.03)' }}>
          <h2 className="text-sm font-semibold uppercase tracking-wider mb-5" style={{ color: '#5E81AC' }}>
            Add Item
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium mb-1.5 uppercase tracking-wider" style={{ color: '#4C566A' }}>
                Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                placeholder="e.g. Camping Stove"
                className="w-full px-4 py-2.5 border rounded-xl text-sm transition-all focus:outline-none focus:ring-2"
                style={{ color: '#2E3440', borderColor: '#D8DEE9', backgroundColor: '#ECEFF4' }}
                onFocus={(e) => { e.target.style.borderColor = '#81A1C1'; e.target.style.boxShadow = '0 0 0 2px rgba(129,161,193,0.2)' }}
                onBlur={(e) => { e.target.style.borderColor = '#D8DEE9'; e.target.style.boxShadow = 'none' }}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium mb-1.5 uppercase tracking-wider" style={{ color: '#4C566A' }}>
                  Category
                </label>
                <input
                  type="text"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  placeholder="Category"
                  className="w-full px-4 py-2.5 border rounded-xl text-sm transition-all focus:outline-none focus:ring-2"
                  style={{ color: '#2E3440', borderColor: '#D8DEE9', backgroundColor: '#ECEFF4' }}
                  onFocus={(e) => { e.target.style.borderColor = '#81A1C1'; e.target.style.boxShadow = '0 0 0 2px rgba(129,161,193,0.2)' }}
                  onBlur={(e) => { e.target.style.borderColor = '#D8DEE9'; e.target.style.boxShadow = 'none' }}
                />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1.5 uppercase tracking-wider" style={{ color: '#4C566A' }}>
                  Location
                </label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Location"
                  className="w-full px-4 py-2.5 border rounded-xl text-sm transition-all focus:outline-none focus:ring-2"
                  style={{ color: '#2E3440', borderColor: '#D8DEE9', backgroundColor: '#ECEFF4' }}
                  onFocus={(e) => { e.target.style.borderColor = '#81A1C1'; e.target.style.boxShadow = '0 0 0 2px rgba(129,161,193,0.2)' }}
                  onBlur={(e) => { e.target.style.borderColor = '#D8DEE9'; e.target.style.boxShadow = 'none' }}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium mb-1.5 uppercase tracking-wider" style={{ color: '#4C566A' }}>
                Photo
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="w-full px-4 py-2.5 border rounded-xl text-sm cursor-pointer transition-all"
                style={{ color: '#4C566A', borderColor: '#D8DEE9', backgroundColor: '#ECEFF4' }}
              />
              {thumbPreview && (
                <div className="mt-3 flex items-center gap-3 rounded-xl p-3" style={{ backgroundColor: '#E5E9F0' }}>
                  <div
                    className="w-14 h-14 rounded-lg overflow-hidden flex-shrink-0 flex items-center justify-center"
                    style={{ backgroundColor: '#D8DEE9' }}
                  >
                    <img
                      src={`data:image/jpeg;base64,${thumbPreview}`}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium truncate" style={{ color: '#3B4252' }}>
                      Photo taken
                    </p>
                    {lastUsedFromPhoto && (
                      <p className="text-xs" style={{ color: '#4C566A' }}>
                        Use time: <span style={{ color: '#2E3440', fontWeight: 500 }}>{formatDate(lastUsedFromPhoto)}</span>
                      </p>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setThumbPreview(null);
                      setLastUsedFromPhoto(null);
                    }}
                    className="text-xs rounded-lg px-2.5 py-1.5 border transition-all"
                    style={{ color: '#4C566A', backgroundColor: 'white', borderColor: '#D8DEE9' }}
                  >
                    Remove
                  </button>
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={resetForm}
                className="px-4 py-2 text-sm rounded-xl transition-all"
                style={{ color: '#4C566A', backgroundColor: '#E5E9F0' }}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 text-sm font-medium text-white rounded-xl transition-all"
                style={{ backgroundColor: '#5E81AC' }}
                onMouseEnter={(e) => { e.target.style.backgroundColor = '#4C6F94' }}
                onMouseLeave={(e) => { e.target.style.backgroundColor = '#5E81AC' }}
              >
                Save Item
              </button>
            </div>
          </form>
        </div>

        {/* Items Section */}
        <div>
          {/* Tabs */}
          <div className="flex items-center gap-1 mb-4 bg-white rounded-xl p-1" style={{ boxShadow: '0 1px 2px rgba(46,52,64,0.04)' }}>
            <button
              onClick={() => setActiveTab('all')}
              className={`flex-1 text-sm font-medium rounded-lg px-4 py-2 transition-all ${activeTab === 'all' ? 'text-white' : ''}`}
              style={{
                backgroundColor: activeTab === 'all' ? '#5E81AC' : 'transparent',
                color: activeTab === 'all' ? 'white' : '#4C566A',
              }}
              onMouseEnter={(e) => { if (activeTab !== 'all') { e.target.style.backgroundColor = '#E5E9F0'; } }}
              onMouseLeave={(e) => { if (activeTab !== 'all') { e.target.style.backgroundColor = 'transparent'; } }}
            >
              All {items.length > 0 && `(${items.length})`}
            </button>
            <button
              onClick={() => setActiveTab('stale')}
              className={`flex-1 text-sm font-medium rounded-lg px-4 py-2 transition-all ${activeTab === 'stale' ? 'text-white' : ''}`}
              style={{
                backgroundColor: activeTab === 'stale' ? '#D08770' : 'transparent',
                color: activeTab === 'stale' ? 'white' : '#D08770',
              }}
              onMouseEnter={(e) => { if (activeTab !== 'stale') { e.target.style.backgroundColor = '#FDF6EC'; } }}
              onMouseLeave={(e) => { if (activeTab !== 'stale') { e.target.style.backgroundColor = 'transparent'; } }}
            >
              Stale {staleItems.length > 0 && `(${staleItems.length})`}
            </button>
          </div>

          {/* List */}
          {displayedItems.length === 0 ? (
            <p className="text-center py-12 text-sm" style={{ color: '#81A1C1' }}>
              {activeTab === 'stale'
                ? 'No stale items. Everything has been used recently!'
                : 'No items yet. Add your first item above.'
              }
            </p>
          ) : (
            <div className="space-y-3">
              {displayedItems.map((item) => {
                const days = daysSinceUse(item.lastUsed);
                const isStale = days > staleThreshold;
                return (
                  <div
                    key={item.id}
                    className="bg-white rounded-2xl p-4 transition-all"
                    style={{ boxShadow: '0 1px 3px rgba(46,52,64,0.04), 0 1px 2px rgba(46,52,64,0.03)' }}
                  >
                    <div className="flex items-start gap-3">
                      {item.photoThumb ? (
                        <img
                          src={`data:image/jpeg;base64,${item.photoThumb}`}
                          alt={`${item.name} thumbnail`}
                          className="w-14 h-14 rounded-xl object-cover flex-shrink-0"
                        />
                      ) : (
                        <div
                          className="w-14 h-14 rounded-xl flex-shrink-0 flex items-center justify-center text-lg"
                          style={{ backgroundColor: '#E5E9F0', color: '#4C566A' }}
                        >
                          📦
                        </div>
                      )}

                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <h3 className="font-medium text-sm" style={{ color: '#2E3440' }}>
                            {item.name}
                          </h3>
                          <span
                            className={`shrink-0 text-xs font-medium rounded-lg px-2.5 py-1`}
                            style={{
                              color: isStale ? '#D08770' : '#A3BE8C',
                              backgroundColor: isStale ? '#FDF6EC' : '#F2F7F2',
                            }}
                          >
                            {days === 0 ? 'Today' : `${days} days ago`}
                          </span>
                        </div>
                        <p className="text-xs mt-1" style={{ color: '#4C566A' }}>
                          {item.category && <span>📂 {item.category}</span>}
                          {item.category && item.location && <span> &nbsp;</span>}
                          {item.location && <span>📍 {item.location}</span>}
                          {!item.category && !item.location && <span>—</span>}
                        </p>
                        <button
                          onClick={() => markUsed(item.id)}
                          className="mt-2 text-xs font-medium rounded-lg px-3 py-1.5 transition-all"
                          style={{ color: '#5E81AC', backgroundColor: '#E5E9F0' }}
                          onMouseEnter={(e) => { e.target.style.backgroundColor = '#D8DEE9' }}
                          onMouseLeave={(e) => { e.target.style.backgroundColor = '#E5E9F0' }}
                        >
                          Mark as Used Now
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

      </div>

      {/* Settings Modal */}
      <Settings
        open={showSettings}
        currentDays={staleThreshold}
        onSave={handleSaveThreshold}
        onClose={() => setShowSettings(false)}
      />
    </div>
  );
}

export default App;