# Reality World Simulator — Modular V1

## Upload structure
Keep this folder structure exactly as shown:
- `index.html` — routes returning players to Home, new players to Character Creator
- `character.html` — 3D character creator; Confirm Player saves and moves to Home
- `home.html` — player overview
- `school.html` — education, jobs and tasks
- `relationships.html` — character profiles and connections
- `news.html` — fictional world bulletins and practical tips
- `achievements.html` — milestone tracking
- `assets/game.css` — shared styling
- `assets/game.js` — shared navigation and player state helpers

## Publish on GitHub Pages
Upload the files and the `assets` folder to the repository root. Do not upload the ZIP itself as the only file. Keep all filenames and folder names unchanged. Commit to the Pages branch. The existing live version should be backed up before replacing it.

## Notes
This is a first modular prototype. Player state, tasks and connections are stored in browser localStorage on that device/browser. The 3D character creator loads Three.js from a CDN, so the character preview requires internet access. News items and NPCs are fictional game content. This version does not yet include a server, real-time AI NPCs, multiplayer, or cross-device save sync.
