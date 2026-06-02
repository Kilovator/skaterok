# Iris Neo

Next.js port of **Iris — Specimen Dossier**: cinematic 3D iris (Three.js), sci‑fi HUD, palette switcher, and live tweaks panel.

## Run

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Structure

| Path | Role |
|------|------|
| `app/` | Next.js App Router entry, global styles |
| `components/IrisDossier.tsx` | Main experience (canvas + HUD) |
| `components/IrisTweaks.tsx` | Tweaks panel wiring |
| `components/tweaks-panel.tsx` | Reusable tweaks UI kit |
| `lib/iris-scene.ts` | Three.js scene (from `iris-scene-v2.js`) |
| `lib/iris-hud.ts` | HUD charts, counters, info panel |
| `lib/iris-config.ts` | Shared scene config |
| `legacy/` | Original static HTML/JS sources |

## Build

```bash
npm run build
npm start
```
