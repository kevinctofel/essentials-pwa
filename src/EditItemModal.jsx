import { useState } from 'react';
import exifr from 'exifr';

export default function EditItemModal({ item, open, onSave, onClose }) {
  const [name, setName] = useState(item?.name ?? '');
  const [category, setCategory] = useState(item?.category ?? '');
  const [location, setLocation] = useState(item?.location ?? '');
  const [thumbPreview, setThumbPreview] = useState(null);
  const [lastUsedFromPhoto, setLastUsedFromPhoto] = useState(null);

  if (!open || !item) return null;

  function resetForm() {
    setName(item.name);
    setCategory(item.category ?? '');
    setLocation(item.location ?? '');
    setThumbPreview(null);
    setLastUsedFromPhoto(null);
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (!name.trim()) return;

    const updates = {
      name: name.trim(),
      category: category.trim(),
      location: location.trim(),
    };

    if (thumbPreview) {
      updates.photoThumb = thumbPreview;
    }

    if (lastUsedFromPhoto) {
      updates.lastUsed = lastUsedFromPhoto;
    }

    onSave(item.id, updates);
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

  const displayPhoto = thumbPreview ?? item.photoThumb;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(46,52,64,0.5)' }}>
      <div className="bg-white rounded-2xl w-full max-w-sm p-6" style={{ boxShadow: '0 8px 32px rgba(46,52,64,0.12)' }}>
        <h2 className="text-sm font-semibold uppercase tracking-wider mb-5" style={{ color: '#5E81AC' }}>
          Edit Item
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
            {displayPhoto && (
              <div className="mt-3 flex items-center gap-3 rounded-xl p-3" style={{ backgroundColor: '#E5E9F0' }}>
                <div
                  className="w-14 h-14 rounded-lg overflow-hidden flex-shrink-0 flex items-center justify-center"
                  style={{ backgroundColor: '#D8DEE9' }}
                >
                  <img
                    src={`data:image/jpeg;base64,${displayPhoto}`}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium truncate" style={{ color: '#3B4252' }}>
                    {thumbPreview ? 'New photo taken' : 'Current photo'}
                  </p>
                  {lastUsedFromPhoto && (
                    <p className="text-xs" style={{ color: '#4C566A' }}>
                      Use time will update from photo
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
              onClick={() => { resetForm(); onClose(); }}
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
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
