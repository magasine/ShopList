# 🛒 Shop List

> Shopping list with home inventory control — offline-first PWA, no backend, no account, no tracking.

---

## ✨ Features

### Three integrated tabs

| Tab | Function |
|-----|--------|
| **All** | Manages the complete pantry item catalog |
| **Stock** | Controls minimum and current quantities with steppers |
| **Refill** | Lists missing items for the next shopping trip |

### Mobile-first experience

- **Swipe actions** — swipe an item left to delete, right to enable/disable stock tracking
- **Tap the name** — opens the edit modal directly
- **Tactile stepper** — quantity control with `−` and `+` buttons in all contexts
- **Light/Dark theme** — persisted between sessions

### Organization and filters

- **Categories via `#hashtag`** in the item description (example: `#dairy · 500g`)
- **Favorites** — accessible star in all tabs, synced in real time without re-rendering
- **Cyclic sorting** — A·Z → #·Z (by category) → ★↕ (favorites first)
- **Quick ⭐ filter** — shows only favorites with toast counter
- **Text and `#category` search** with autocomplete

### Data and security

- **Local persistence** via `localStorage` — no data leaves the device
- **Base timestamp** — when opening the app, a dialog displays when the data was last saved and asks whether to import a newer database
- **Export/Import** in `.json` for backup and transfer between devices
- **Backup banner** after 10 consecutive changes

---

## 🗂 File structure

```text
/
├── index.html           # Main app — HTML, CSS, and JS in a single file
├── manifest.json        # PWA manifest (name, icons, colors, shortcuts)
├── sw.js                # Service Worker (offline cache)
├── icon-192.png         # Default icon (Android, favicon)
├── icon-512.png         # Splash/store icon
└── icon-maskable.png    # Adaptive Android icon (80% safe zone)
```

All files must be in the **same folder** on the server.

---

## 🚀 Deployment

The app must be served over HTTPS for the Service Worker to work. Choose any static hosting provider:

### GitHub Pages

1. Create a public repository and upload the 6 files to the root directory
2. Go to **Settings → Pages → Source**: `main / root`
3. Access `https://<user>.github.io/<repository>/index.html`

### Netlify (drag and drop)

1. Go to `netlify.com` → **Sites → Add new → Deploy manually**
2. Drag the folder containing the 6 files
3. URL generated automatically

### Vercel (CLI)

```bash
npx vercel --prod
```

### Any HTTP server

```bash
# Python (local development)
python3 -m http.server 8080
# Open http://localhost:8080/index.html
```

> ⚠️ `file://` does not work for PWAs — always use an HTTP server, even locally.

---

## 📲 Device installation

### Android (Chrome / Edge)

The installation banner appears automatically on the first visit. Tap **Install** on the green banner or use the browser menu → *Install app*.

### iPhone / iPad (Safari)

1. Tap the **Share** icon (square with upward arrow ↑)
2. Scroll down and tap **"Add to Home Screen"**
3. Confirm the name and tap **Add**

### Home screen shortcuts

The manifest registers two shortcuts accessible by long-pressing the icon (Android):

| Shortcut | URL |
|--------|-----|
| Add item | `index.html?action=add` |
| Shopping list | `index.html?tab=2` |

---

## ⚙️ Service Worker

Dual cache strategy for maximum reliability:

| Request type | Strategy | Behavior |
|--------------------|------------|---------------|
| Main HTML | **Network-First** | Fetches the latest version from the network; falls back to cache if offline |
| Local assets (icons, manifest) | **Cache-First** | Instant cache response; updates in background |
| Google Fonts | **Cache-First** | Cached on first visit; offline without delay |

**Automatic update:** when a new SW version is available, a purple banner appears with an "Update" button. The app reloads automatically after applying the update.

To publish a new version, increment `CACHE_VERSION` in `sw.js`:

```js
const CACHE_VERSION = 'shoplist-v2'; // previously v1
```

---

## 🗄 Data format

Data is stored in `localStorage` under the key `Shop_List_v20260510`:

```json
{
  "savedAt": "2026-05-11T14:32:00.000Z",
  "data": [
    {
      "id": "id-abc123",
      "name": "Butter",
      "desc": "#dairy · 200g",
      "inStock": true,
      "min": 2,
      "qty": 1,
      "fav": false
    }
  ]
}
```

The `_done` field (checkbox in the Refill tab) is **session state** — it is not persisted between app launches.

The exported `.json` file is compatible with the format above and also with the legacy format (plain array) for backward compatibility.

---

## 🛠 Development

No dependencies, no build step. Edit `index.html` directly.

```bash
# Clone and serve locally
git clone https://github.com/<user>/<repository>.git
cd <repository>
python3 -m http.server 8080
```

To test the Service Worker and manifest, use Chrome DevTools:
- **Application → Service Workers** — status, force update
- **Application → Manifest** — manifest validation
- **Application → Storage** — inspect localStorage
- **Lighthouse** — full PWA audit (installability score)

---

## 🔒 Privacy

- No data is necessarily sent to external servers. (This is optional)
- No cookies, no analytics, no tracking
- Fonts loaded from Google Fonts on first visit (then cached)
- Fully functional offline after the first launch

---

## 📄 License

MIT — freely use, modify, and distribute.
