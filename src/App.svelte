<script>
import Playlist from './Playlist.svelte';
import TrackDetails from './TrackDetails.svelte';
import PlaybackControls from './PlaybackControls.svelte';
import Settings from './Settings.svelte';
import {io} from 'socket.io-client';
 import {onMount} from 'svelte'
 import './tailwind.css'
const socket = io('http://localhost:9990');
const eAPI = window.electronAPI
//const fs = require('fs');
//const path = require('path');
//const mm = require('music-metadata');
//const chokidar = require('chokidar');
let test = 'loading...';
socket.on('onload', function(msg) {
        test = msg

        socket.emit('whoiam','sender')
 });
socket.on('whouare', function(msg) {
    test = msg
})


let trackName = '';
let trackArtist = '';
let trackAlbum = '';
let songList = null;
let songPlaying = false;
let playListVisible = false;
let loading = false;
let theme = 'dark';

let duration = '00:00';
let timer = '00:00';

let files = null;
let player = null;

let offsetWidth;

let shuffle = false;
let mute = false;
let slider = 100;



onMount(()=> {
    async function checkSettings()  {
        const settings = await eAPI.dataGet('settings')
        const getpath = await eAPI.dataGet('path')
        const theme = await eAPI.dataGet('theme')

        if (settings !== undefined && settings.type === 'ok') {
            if (settings.data.shuffle) shuffle = true;
            if (settings.data.volume) slider = settings.data.volume;
        }
        if (theme!== undefined&& theme.type === 'ok') {
            setTheme(theme.data);

        }
        if (getpath!== undefined &&getpath.type === 'ok') {
            eAPI.handleScanDir(getpath.data.path.toString());

        }
    }

    checkSettings();

})
socket.on('ask4update', function(msg) {
    if (msg === 'pls') {
        socket.emit('update', {track: trackName})
    }
})


function setTheme(data) {
    var icons = document.body.querySelectorAll('svg');
    if (data.theme == 'light') {
        theme = 'light';
        document.body.style.backgroundColor = '#F5F5F5';
        document.body.style.color = '#212529';

        icons.forEach((icon) => {
            icon.style.color = '#212529';
        });
    } else if (data.theme == 'dark') {
        theme = 'dark';
        document.body.style.backgroundColor = '#212121';
        document.body.style.color = 'azure';

        icons.forEach((icon) => {
            icon.style.color = 'azure';
        });
    } else if (data.theme == 'disco') {
        theme = 'disco';
        icons.forEach((icon) => {
            icon.style.color = 'azure';
        });
    }
}







function themeChange(data) {
    setTheme(data);
}


eAPI.handleThemeChange((event, arg) => {
    themeChange(arg);
})
function sortByTitle(arr, des = false) {
    arr.sort((a, b) => {
        let fa, fb;
        if (!des) {
            fa = a.name.toLowerCase();
            fb = b.name.toLowerCase();
        } else {
            fa = b.name.toLowerCase();
            fb = a.name.toLowerCase();
        }
        if (fa < fb) return -1;
        if (fa > fb) return 1;
        return 0;
    });
    return arr;
}

function sortByArtist(arr, des = false) {
    arr.sort((a, b) => {
        let fa, fb;
        if (!des) {
            fa = a.artist.toLowerCase();
            fb = b.artist.toLowerCase();
        } else {
            fa = b.artist.toLowerCase();
            fb = a.artist.toLowerCase();
        }
        if (fa < fb) return -1;
        if (fa > fb) return 1;
        return 0;
    });
    return arr;
}

function sortByDate(arr, des = false) {
    arr.sort((a, b) => {
        if (!des) return b.date - a.date;
        return a.date - b.date;
    });
    return arr;
}

function sortDefault(arr, des = false) {
    arr.sort((a, b) => {
        if (!des) return a.index - b.index;
        return b.index - a.index;
    });
    return arr;
}

eAPI.handleSortChange((event, arg) => {
    if (player) {
        var index = player.playlist[player.index].index;

        if (arg.items[0].checked)
            player.playlist = sortByDate(player.playlist, arg.items[6].checked);
        else if (arg.items[1].checked)
            player.playlist = sortByTitle(
                player.playlist,
                arg.items[6].checked
            );
        else if (arg.items[2].checked)
            player.playlist = sortByArtist(
                player.playlist,
                arg.items[6].checked
            );
        else if (arg.items[3].checked)
            player.playlist = sortDefault(
                player.playlist,
                arg.items[6].checked
            );

        player.index = player.playlist.findIndex((x) => x.index == index);
    }
});
eAPI.handleSaveSetting((event, data) => {
    eAPI.dataSet({key: 'settings',value: { shuffle: shuffle, mute: mute, volume: slider } })
    eAPI.handleClosed();
})



eAPI.handleSelectedFiles((event, arg) => {    
    console.log(arg)
    startPlayer(arg);
});
eAPI.handlePlaylistAdd((event, path) => {   
 
    addSongToPlaylist(path)
});
eAPI.handlePlaylistRemove((event, path) => {    
    removeSongFromPlaylist(path)
});
async function addSongToPlaylist(path) {
    if (player) {
        const metadata = await eAPI.mmParseFile(path, { skipCovers: true });
        const stats = eAPI.fsStatSync(path);
        var data = {};
        var title = metadata.common.title;
        var artist = metadata.common.artist;
        if (title) data.title = metadata.common.title;
        else data.title = path.split(path.sep).slice(-1)[0];
        if (artist) data.artist = metadata.common.artist;
        else data.artist = '';
        data.modDate = stats.mtime;

        var len = player.playlist.length;

        player.playlist.push({
            title: path,
            file: path,
            name: data.title,
            artist: data.artist,
            date: data.modDate,
            howl: null,
            index: len
        });
    }
}

function removeSongFromPlaylist(path) {
    if (player) {
        var remIndex = player.playlist.findIndex((x) => x.file == path);
        if (remIndex != -1) {
            player.playlist.splice(remIndex, 1);
            player.randomArray = randomize(
                Array.from({ length: player.playlist.length }, (_, i) => i)
            );
        }
    }
}

async function startPlayer(arg) {
    if (songPlaying) {
        player.pause();
        songPlaying = false;
    }
    songList = arg;
    var songArr = [];

    for (let i = 0; i < songList.files.length; i++) {
        songArr.push({
            title: songList.files[i],
            file: songList.files[i],
            name: songList.names[i].title,
            artist: songList.names[i].artist,
            date: songList.names[i].modDate,
            howl: null,
            index: i
        });
    }



    const lastPlayed = await eAPI.dataGet('last-played')
    console.log(lastPlayed)
    if (lastPlayed !== undefined && lastPlayed.type === 'ok') {
        var index = arg.files.indexOf(lastPlayed.data.path);

        if (index != -1) {
            player = new Player(songArr, index);
        } else {
            player = new Player(songArr, 0);
        }

        getTags(player.playlist[player.index].file);
    } else if (lastPlayed !== undefined && lastPlayed.type === 'unsaved') {
        player = new Player(songArr, 0);
        getTags(player.playlist[player.index].file);
    }

   
}

function getTags(audioFile) {
    var titles = [];
    const metadata = eAPI.mmParseFile(audioFile, { skipCovers: false })
        .then((metadata) => {
            var title = metadata.common.title;
            var artist = metadata.common.artist;
            var album = metadata.common.album;

            if (title) trackName = title;
            else trackName = audioFile.split(eAPI.pathSep()).slice(-1)[0];
            if (artist) trackArtist = artist;
            else trackArtist = '';
            if (album) trackAlbum = album;
            else trackAlbum = '';

            socket.emit('update', {track: trackName})
            var img = document.getElementById('picture');

            if (metadata.common.picture) {
                var picture = metadata.common.picture[0];
                img.style.display = 'block';
                img.src = `data:${
                    picture.format
                };base64,${picture.data.toString('base64')}`;
                img.addEventListener('load', function () {
                    if (theme == 'disco') {
                        var vibrant = new Vibrant(img, 128, 3);
                        var swatches = vibrant.swatches();
                        if (swatches['DarkMuted'])
                            document.body.style.backgroundColor = swatches[
                                'DarkMuted'
                            ].getHex();
                        else document.body.style.backgroundColor = '#212121';
                        if (swatches['LightVibrant'])
                            document.body.style.color = swatches[
                                'LightVibrant'
                            ].getHex();
                        else document.body.style.color = 'azure';
                    }
                });
            } else {
                img.style.display = 'none';
            }
        })
        .catch((err) => {
            console.error(err.message);
        });

    return titles;
}

var seekToTime = function (event) {
    player.seek(event.offsetX / offsetWidth);
};
var playPlaylistSong = function (index) {
    player.skipTo(index);
};
var nextSong = function () {
    if (shuffle) {
        player.skip('random-next');
    } else {
        player.skip('next');
    }
    songPlaying = true;
};
var prevSong = function () {
    if (shuffle) {
        player.skip('random-prev');
    } else {
        player.skip('prev');
    }
    songPlaying = true;
};

var showPlaylist = function () {
    if (playListVisible) {
        playListVisible = false;
    } else {
        playListVisible = true;
    }
};

var playMusic = function () {
    if (songPlaying) {
        player.pause();
        songPlaying = false;
    } else {
        player.play();
        songPlaying = true;
    }
};

var toggleShuffle = function () {
    shuffle = !shuffle;
    eAPI.dataSet({key: 'settings',value:  { shuffle: shuffle, volume: slider } })


};

var togglemute = function () {
    if (mute) {
        mute = false;
        player.volume(slider / 100);
    } else {
        mute = true;
        player.volume(0);
    }
    eAPI.dataSet({key: 'settings',value:   { mute: mute, volume: slider } })

    
};

function randomize(array) {
    for (let i = array.length - 1; i > 0; i--) {
        let j = Math.floor(Math.random() * (i + 1));

        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

var Player = function (playlist, index) {
    this.playlist = playlist;
    this.index = index;
    this.randomIndex = index;
    this.randomArray = randomize(
        Array.from({ length: playlist.length }, (_, i) => i)
    );
};

Player.prototype = {
    play: function (index) {
        var self = this;
        var sound;

        index = typeof index === 'number' ? index : self.index;
        var data = self.playlist[index];

        if (data.howl) {
            sound = data.howl;
        } else {
            sound = data.howl = new Howl({
                src: [data.file],
                html5: true,
                onplay: function () {
                    duration = self.formatTime(Math.round(sound.duration()));
                    requestAnimationFrame(self.step.bind(self));
                },
                onend: function () {
                    if (shuffle) {
                        self.skip('random');
                    } else {
                        self.skip('right');
                    }
                }
            });
        }
    
        eAPI.dataSet({key: 'last-played',value: { path: data.file } })

        sound.play();
        getTags(data.file);

        self.index = index;
    },

    pause: function () {
        var self = this;

        var sound = self.playlist[self.index].howl;

        sound.pause();
    },

    skip: function (direction) {
        var self = this;

        var index = 0;
        if (direction === 'prev') {
            index = self.index - 1;
            if (index < 0) {
                index = self.playlist.length - 1;
            }
        } else if (direction === 'random-next') {
            self.randomIndex += 1;
            if (self.randomIndex >= self.randomArray.length) {
                self.randomIndex = 0;
            }
            index = self.randomArray[self.randomIndex];
        } else if (direction === 'random-prev') {
            self.randomIndex -= 1;
            if (self.randomIndex < 0) {
                self.randomIndex = self.randomArray.length - 1;
            }
            index = self.randomArray[self.randomIndex];
        } else {
            index = self.index + 1;
            if (index >= self.playlist.length) {
                index = 0;
            }
        }

        self.skipTo(this.playlist[index].index);
    },

    skipTo: function (index) {
        var self = this;

        if (self.playlist[self.index].howl) {
            self.playlist[self.index].howl.stop();
        }
        var data = self.playlist[index];
        index = this.playlist.findIndex((x) => x.index == index);

        if (!songPlaying) {
            songPlaying = true;
            self.play(index);
        } else self.play(index);
    },

    step: function () {
        var self = this;

        var sound = self.playlist[self.index].howl;

        var seek = sound.seek() || 0;
        timer = self.formatTime(Math.round(seek));
        progress.style.width = ((seek / sound.duration()) * 100 || 0) + '%';

        if (sound.playing()) {
            requestAnimationFrame(self.step.bind(self));
        }
    },
    formatTime: function (secs) {
        var minutes = Math.floor(secs / 60) || 0;
        var seconds = secs - minutes * 60 || 0;

        return minutes + ':' + (seconds < 10 ? '0' : '') + seconds;
    },
    volume: function (val) {
        Howler.volume(val);
    },
    seek: function (time) {
        var self = this;

        var sound = self.playlist[self.index].howl;

        if (sound.playing() || true) {
            sound.seek(sound.duration() * time);
            requestAnimationFrame(self.step.bind(self));
        }
    }
};

var volumnUp = function () {
    if (slider !== 100) {
        slider = slider + 2;
        player.volume(slider / 100);
    }
};

var volumnDown = function () {
    if (slider !== 0) {
        slider = slider - 2;
        player.volume(slider / 100);
    }
};

var handleKeyboardPress = function (keycode) {
    switch (keycode) {
        case 'MediaPlayPause':
        case ' ':
            playMusic();
            break;
        case 'ArrowRight':
        case 'MediaTrackNext':
            nextSong();
            break;
        case 'ArrowLeft':
        case 'MediaTrackPrevious':
            prevSong();
            break;
        case 'ArrowUp':
            volumnUp();
            break;
        case 'ArrowDown':
            volumnDown();
            break;
        default:
            break;
    }
};

$: if (player) {
    player.volume(slider / 100);
    mute = false;
}
</script>
<style global>
	@tailwind base;
	@tailwind components;
	@tailwind utilities;

    .progress .progress-bar {
    -webkit-transition: none;
    -o-transition: none;
    transition: none;
}
  </style>

<svelte:window
    on:keyup={(e) => {
        if (!playListVisible) handleKeyboardPress(e.key);
    }} />

<main class="grid grid-cols-2 py-3 px-3 w-full h-full">
  
    
        <section class="w-full overflow-y-scroll pr-[10px]">
            {#if loading}
                <div
                    class="spinner-border text-danger centerBlock"
                    style="width: 5rem; height: 5rem;"
                    role="status">
                    <span class="sr-only">Loading...</span>
                </div>
            {:else} 
            <p class="p-2">  {test}</p>
          

             <Playlist
            {player}
            on:changeSong={(event) => playPlaylistSong(event.detail.index)} />{/if}
            </section>

        <section class="flex justify-center items-center">
            <div class="h-full flex flex-col py-8 px-4 justify-between min-w-full">
                <div class="col-md-12 text-center">
                    <TrackDetails
                        {trackName}
                        {trackArtist}
                        {trackAlbum}
                        {theme} />
                </div>
                <div>
                    <div class="col-md-12 text-center">
                        <PlaybackControls
                            on:prevSong={prevSong}
                            on:nextSong={nextSong}
                            on:playMusic={playMusic}
                            {songPlaying} />
                    </div>
    
                    <div class="col-md-12 text-center">
                        <div id="timer">{timer}</div>
                        <div id="duration">{duration}</div><br />
    
                        <div
                            class="progress bg-slate-500 overflow-hidden rounded-full"
                            id="seek"
                            bind:clientWidth={offsetWidth}
                            on:click={(e) => seekToTime(e)}>
                            <div
                                class="progress-bar bg-danger bg-emerald-300 h-full rounded-full"
                                role="progressbar"
                                id="progress"
                                aria-valuemin="0"
                                aria-valuemax="100" />
                        </div>
                    </div>
                </div>
               
                <div class="col-md-12" id="outerCtrl">
                    <Settings
                        on:showPlaylist={showPlaylist}
                        on:toggleShuffle={toggleShuffle}
                        {shuffle}
                        on:togglemute={togglemute}
                        bind:slider
                        {mute} />
                </div>
            </div>
        </section>
    </main>
