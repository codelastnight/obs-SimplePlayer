

export function sortByTitle(arr, des = false) {
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

export function sortByArtist(arr, des = false) {
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
export function sortByDate(arr, des = false) {
    arr.sort((a, b) => {
        if (!des) return b.date - a.date;
        return a.date - b.date;
    });
    return arr;
}

export function sortDefault(arr, des = false) {
    arr.sort((a, b) => {
        if (!des) return a.index - b.index;
        return b.index - a.index;
    });
    return arr;
}



export function randomize(array) {
    for (let i = array.length - 1; i > 0; i--) {
        let j = Math.floor(Math.random() * (i + 1));

        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}
