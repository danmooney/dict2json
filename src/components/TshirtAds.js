import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';

// TODO: Replace with your actual Fourthwall product URL
const FOURTHWALL_URL = 'https://raisin-pains-shop.fourthwall.com/products/raisin-pains-supersoft-sycophancy-tee';

const DISMISS_KEY = 'tshirt-ad-dismissed-at';
const DISMISS_TTL_MS = 7 * 24 * 60 * 60 * 1000;
const TSHIRT_ALT = "Programmer's dict-to-JSON t-shirt — Shop on Fourthwall";

// Pools of images per ad size. Add more filenames here as you produce them.
// On each page load, a random non-overlapping selection is made for each size.
const IMAGE_POOLS = {
  '160x600': [
    'unisex-staple-t-shirt-black-front-6a0df0764472a.png',
    'unisex-staple-t-shirt-black-left-front-6a0df07642e27.png',
    'unisex-staple-t-shirt-black-right-front-6a0df0763f3d0.png',
    'unisex-staple-t-shirt-black-right-front-6a0df07641fa5.png',
  ],
  '728x90': [
    'horizontal.jpg',
  ],
  '320x50': [
    'horizontal-mobile.jpg',
  ],
};

const SIZES = {
  '160x600': { width: 160, height: 600 },
  '728x90': { width: 728, height: 90 },
  '320x50': { width: 320, height: 50 },
};

const SLOTS = [
  { position: 'left', size: '160x600' },
  { position: 'right', size: '160x600' },
  { position: 'bottom', size: '728x90' },
  { position: 'bottom-mobile', size: '320x50' },
];

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// For each ad size, shuffle the pool and assign distinct images to each slot.
// If the pool is smaller than the number of slots for that size, the assignment
// wraps around (duplicates allowed only as a fallback).
function assignImages() {
  const shuffled = {};
  const cursor = {};
  for (const size of Object.keys(IMAGE_POOLS)) {
    shuffled[size] = shuffle(IMAGE_POOLS[size]);
    cursor[size] = 0;
  }
  return SLOTS.map((slot) => {
    const pool = shuffled[slot.size];
    const filename = pool[cursor[slot.size] % pool.length];
    cursor[slot.size] += 1;
    return { ...slot, ...SIZES[slot.size], filename };
  });
}

function fireEvent(name, position) {
  if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
    window.gtag('event', name, { ad_position: position });
  }
}

function TshirtAds() {
  // null = checking storage, true = hidden, false = visible
  const [dismissed, setDismissed] = useState(null);
  const [assignedSlots] = useState(assignImages);

  useEffect(() => {
    let hidden = false;
    try {
      const raw = window.localStorage.getItem(DISMISS_KEY);
      const ts = raw ? parseInt(raw, 10) : 0;
      if (ts && Date.now() - ts < DISMISS_TTL_MS) {
        hidden = true;
      }
    } catch (e) {
      // localStorage unavailable (private mode, blocked) — fall through and show ads
    }
    setDismissed(hidden);
  }, []);

  const handleDismiss = (position) => {
    try {
      window.localStorage.setItem(DISMISS_KEY, String(Date.now()));
    } catch (e) {
      // ignore — still dismiss in-session
    }
    fireEvent('tshirt_ad_dismissed', position);
    setDismissed(true);
  };

  if (dismissed !== false) return null;

  return createPortal(
    <>
      {assignedSlots.map((slot) => (
        <div key={slot.position} className={`tshirt-ad tshirt-ad--${slot.position}`}>
          <a
            href={FOURTHWALL_URL}
            target="_blank"
            rel="noopener sponsored"
            onClick={() => fireEvent('tshirt_ad_click', slot.position)}
            aria-label={TSHIRT_ALT}
          >
            <img
              className="tshirt-ad__image"
              src={`/ads/${slot.filename}`}
              alt={TSHIRT_ALT}
              width={slot.width}
              height={slot.height}
            />
          </a>
          <button
            type="button"
            className="tshirt-ad__dismiss"
            onClick={() => handleDismiss(slot.position)}
            aria-label="Dismiss ad"
          >
            ×
          </button>
          <span className="tshirt-ad__label">Ad</span>
        </div>
      ))}
    </>,
    document.body
  );
}

export default TshirtAds;
