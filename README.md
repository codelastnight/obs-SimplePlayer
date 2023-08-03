currently in ALPHA testing funniness status
![image](https://github.com/studioartsandcrafts/frogPlayer/assets/9895341/9441adc8-6705-4f79-ab64-a62950e62676)

 local music player with obs integration. Exposes a localhost webpage for OBS browser to load.
 
 crafted for [frogfest](https://frogfest.live), an online music festival

## how 2 use
1. launch exe (from releases page)
2. allow network access
3. in OBS, add a new Browser Source, set the url as `localhost:9990`


### Building from the repo
1. Clone the repository
2. run ```pnpm install``` in terminal of choice. install pnpm if u dont alrdy its just better.
3. ```pnpm run dev``` to run devlopment (hot-reload only for renderer is enabled), ```pnpm run dev:watch``` to hot-reload on main and preload changes.
4. ```pnpm run build:win``` to build it (currently windows only).

<br>

Originally Based on of Aveek Saha's [Dusk Player](https://github.com/Aveek-Saha/MusicPlayer/releases)

Toolkit updated to electron-vite, electron code updated to modern standards

