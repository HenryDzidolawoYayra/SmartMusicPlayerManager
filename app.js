/*
    ============================================================
    app.js
    Smart Music Playlist Manager
    ============================================================

    ROLE:
    This is the UI wiring layer.

    It:
        - Instantiates PlaylistController
        - Handles DOM interactions
        - Updates UI
        - Syncs <audio> with controller state

    IMPORTANT RULE:
        app.js NEVER interacts directly with:
            - DoublyLinkedList
            - Stack

        It ONLY talks to PlaylistController.

    FLOW RULE:
        1. Call controller method
        2. Re-render playlist
        3. Update Now Playing section
        4. Sync audio source
*/


/* ============================================================
   Controller Initialization
============================================================ */

const controller = new PlaylistController(DoublyLinkedList, Stack);


/* ============================================================
   DOM References
============================================================ */

const playlistUI = document.getElementById("playlist");
const currentTitle = document.getElementById("current-title");
const currentArtist = document.getElementById("current-artist");
const audioPlayer = document.getElementById("audio-player");

const addSongForm = document.getElementById("add-song-form");
const removeBtn = document.getElementById("remove-btn");

const playBtn = document.getElementById("play-btn");
const pauseBtn = document.getElementById("pause-btn");
const nextBtn = document.getElementById("next-btn");
const prevBtn = document.getElementById("prev-btn");
const undoBtn = document.getElementById("undo-btn");
const redoBtn = document.getElementById("redo-btn");


/* ============================================================
   Royalty-Free Preloaded Songs
   (Public domain / free music sample sources)
============================================================ */

const initialSongs = [
    {
        title: "SoundHelix Song 1",
        artist: "SoundHelix",
        url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3"
    },
    {
        title: "SoundHelix Song 2",
        artist: "SoundHelix",
        url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3"
    },
    {
        title: "SoundHelix Song 3",
        artist: "SoundHelix",
        url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3"
    },
    {
        title: "SoundHelix Song 4",
        artist: "SoundHelix",
        url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3"
    },
    {
        title: "SoundHelix Song 5",
        artist: "SoundHelix",
        url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3"
    },
    {
        title: "Robots Vs. Music Song 6",
        artist: "Nigel Stanford",
        url: "./assets/mp3/AUTOMATICA - Robots Vs. Music - Nigel Stanford [bAdqazixuRY].mp3"
    }
];


/* ============================================================
   Initialization
============================================================ */

function initializePlaylist() {
    initialSongs.forEach(song => {
        controller.addSong(song);
    });

    renderPlaylist();
    updateNowPlaying();
}


/* ============================================================
   Rendering Functions
============================================================ */

function renderPlaylist() {
    playlistUI.innerHTML = "";

    const currentSong = controller.getCurrentSong();

    controller.getAllSongs(song => {
        const li = document.createElement("li");
        li.textContent = `${song.title} - ${song.artist}`;

        // Highlight currently playing song
        if (currentSong && song.title === currentSong.title && song.artist === currentSong.artist) {
            li.classList.add("current");
        }

        playlistUI.appendChild(li);
    });
}



function updateNowPlaying() {
    const currentSong = controller.getCurrentSong();

    if (!currentSong) {
        currentTitle.textContent = "No song selected";
        currentArtist.textContent = "";
        audioPlayer.pause();
        audioPlayer.src = "";
        return;
    }

    currentTitle.textContent = currentSong.title;
    currentArtist.textContent = currentSong.artist;

    syncAudioSource(currentSong);
}


function syncAudioSource(song) {
    if (!song) return;

    if (audioPlayer.src !== song.url) {
        audioPlayer.src = song.url;
    }
}


/* ============================================================
   Event Listeners Setup
============================================================ */

function setupEventListeners() {

    /* ---------- Play ---------- */
    playBtn.addEventListener("click", () => {
        const currentSong = controller.getCurrentSong();
        if (!currentSong) return;

        audioPlayer.play();
    });

    /* ---------- Pause ---------- */
    pauseBtn.addEventListener("click", () => {
        audioPlayer.pause();
    });

    /* ---------- Next ---------- */
    nextBtn.addEventListener("click", () => {
        controller.playNext();
        renderPlaylist();
        updateNowPlaying();
        audioPlayer.play();
    });

    /* ---------- Previous ---------- */
    prevBtn.addEventListener("click", () => {
        controller.playPrevious();
        renderPlaylist();
        updateNowPlaying();
        audioPlayer.play();
    });

    /* ---------- Add Song ---------- */
    addSongForm.addEventListener("submit", (e) => {
        e.preventDefault();

        const title = document.getElementById("song-title").value.trim();
        const artist = document.getElementById("song-artist").value.trim();
        const url = document.getElementById("song-url").value.trim();

        if (!title || !artist || !url) return;

        controller.addSong({ title, artist, url });

        renderPlaylist();
        updateNowPlaying();

        addSongForm.reset();
    });

    /* ---------- Remove Song ---------- */
    removeBtn.addEventListener("click", () => {
        const title = document.getElementById("remove-title").value.trim();
        if (!title) return;

        controller.removeSong(title);

        renderPlaylist();
        updateNowPlaying();

        document.getElementById("remove-title").value = "";
    });

    /* ---------- Undo ---------- */
    undoBtn.addEventListener("click", () => {
        controller.undo();

        renderPlaylist();
        updateNowPlaying();
    });

    /* ---------- Redo ---------- */
    redoBtn.addEventListener("click", () => {
        controller.redo();

        renderPlaylist();
        updateNowPlaying();
    });

    /* ---------- Auto Play Next When Song Ends ---------- */
    audioPlayer.addEventListener("ended", () => {
        controller.playNext();
        renderPlaylist();
        updateNowPlaying();

        if (!controller.isEmpty()) {
            audioPlayer.play();
        }
    });
}


/* ============================================================
   Start Application
============================================================ */

initializePlaylist();
setupEventListeners();
