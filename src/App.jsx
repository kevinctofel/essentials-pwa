import { useState, useEffect } from 'react';
import db from './db';
import exifr from 'exifr';

const STALE_THRESHOLD_DAYS = 30;

function App() {
  const [items, setItems] = useState([]);
  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [location, setLocation] = useState('');
  const [thumbPreview, setThumbPreview] = useState(null); // base64 for UI
  const [lastUsedFromPhoto, setLastUsedFromPhoto] = useState(null);

  // Load items from DB on mount
  useEffect(() => {
    loadItems();
  }, []);

  async function loadItems() {
    const allItems = await db.items.reverse().toArray(); // newest first
    setItems(allItems);
  }

  // Handle file selection (camera or gallery)
  // Generates thumbnail IMMEDIATELY — no full-size image ever touches the DOM
  async function handleImageChange(e) {
    const file = e.target.files[0];
    if (!file) return;

    // Generate thumbnail right away
    const thumbBase64 = await createThumbnail(file);
    setThumbPreview(thumbBase64);

    // Extract EXIF timestamp
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

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Essentials – Minimalist Tracker</h1>
        <p className="text-gray-600">Track your possessions and know when you last used them.</p>
      </header>

      {/* Add Item Form */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-lg font-semibold mb-4">Add New Item</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Item Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Category (e.g., Clothing, Electronics)
            </label>
            <input
              type="text"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Location (e.g., Bedroom, Kitchen)
            </label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Photo (optional – captures use time)
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
            {thumbPreview && (
              <div className="mt-2 flex items-center space-x-3">
                <img
                  src={`data:image/jpeg;base64,${thumbPreview}`}
                  alt="Preview"
                  className="max-w-xs w-auto h-48 object-contain rounded border shadow"
                />
                <button
                  type="button"
                  onClick={() => {
                    setThumbPreview(null);
                    setLastUsedFromPhoto(null);
                  }}
                  className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded hover:bg-red-200"
                >
                  ×
                </button>
              </div>
            )}
            {lastUsedFromPhoto && (
              <p className="text-xs text-gray-500 mt-1">
                Use time from photo: {formatDate(lastUsedFromPhoto)}
              </p>
            )}
          </div>

          <div className="flex items-center justify-end">
            <button
              type="button"
              onClick={resetForm}
              className="mr-3 px-3 py-1 text-xs bg-gray-200 rounded hover:bg-gray-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
            >
              Save Item
            </button>
          </div>
        </form>
      </div>

      {/* Items List */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-lg font-semibold mb-4">
          Your Items {items.length > 0 && (
            <span className="text-sm text-gray-500">({items.length})</span>
          )}
        </h2>

        {items.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No items yet. Add your first item above!</p>
        ) : (
          <div className="space-y-4">
            {items.map((item) => {
              const days = daysSinceUse(item.lastUsed);
              const isStale = days > STALE_THRESHOLD_DAYS;
              return (
                <div
                  key={item.id}
                  className={`flex items-start p-4 border rounded-lg ${
                    isStale ? 'bg-orange-50 border-orange-200' : 'bg-gray-50 border-gray-200'
                  }`}
                >
                  {/* Thumbnail */}
                  {item.photoThumb ? (
                    <img
                      src={`data:image/jpeg;base64,${item.photoThumb}`}
                      alt={`${item.name} thumbnail`}
                      className="w-16 h-16 object-cover rounded mr-4"
                    />
                  ) : (
                    <div className="w-16 h-16 bg-gray-200 rounded flex items-center justify-center mr-4 text-sm text-gray-500">
                      No Photo
                    </div>
                  )}
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <h3 className="font-semibold text-gray-800">{item.name}</h3>
                      <span className={`px-2 py-1 text-xs rounded ${
                        isStale ? 'bg-orange-100 text-orange-800' : 'bg-gray-100 text-gray-700'
                      }`}>
                        {days} days ago
                      </span>
                    </div>
                    <div className="text-sm text-gray-600 mt-1">
                      <span className="mr-3">📂 {item.category || '–'}</span>
                      <span>📍 {item.location || '–'}</span>
                    </div>
                    <div className="mt-2">
                      <button
                        onClick={() => markUsed(item.id)}
                        className="px-3 py-1 text-xs bg-indigo-100 text-indigo-800 rounded hover:bg-indigo-200"
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
  );
}

export default App;
