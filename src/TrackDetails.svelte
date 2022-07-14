<script>
export let trackName;
export let trackArtist;
export let trackAlbum;
export let theme;
</script>

<div id="title">
    <h1 id="track" class="text-lg font-bold">{trackName}</h1>
    <h2 id="artist">
        {trackArtist}
        
   
    </h2>
    <h3>     <small
        id="album"
        class:text-muted={theme != 'disco'}
        class:text-white={theme == 'disco'}>{trackAlbum}</small></h3>
</div>
