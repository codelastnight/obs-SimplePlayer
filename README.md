
 local music player with obs integration. Exposes a localhost webpage for OBS browser to load.
 crafted for [frogfest](https://frogfest.live), an online music festival

## how 2 use
1. launch exe (from releases page)
2. allow network access
3. in OBS, add a new Browser Source, set the url as `localhost:9990`





### Building from the repo
Clone the repository, make it your working directory, and then on your terminal run ```npm install```. 
Once all the dependencies have finished downloading, run ```npm run dev``` to test it, and ```npm run build:win``` to build it for your platform.
 
 


### Shortcuts
Next track: <kbd>🠊</kbd> | 
Previous track: <kbd>🠈</kbd> | 
Volume up: <kbd>🠉</kbd> | 
Volume down: <kbd>🠋</kbd> | 
Play/pause: <kbd>Space</kbd>

<br>

Originally Based on of Aveek Saha's [Dusk Player](https://github.com/Aveek-Saha/MusicPlayer/releases)

Toolkit updated to vite, electron code updated to modern standards

