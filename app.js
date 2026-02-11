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
const albumArtContainer = document.querySelector(".album-art-container");
const albumArtImage = albumArtContainer ? albumArtContainer.querySelector("img") : null;

const addSongForm = document.getElementById("add-song-form");
const removeBtn = document.getElementById("remove-btn");

const playBtn = document.getElementById("play-btn");
const pauseBtn = document.getElementById("pause-btn");
const nextBtn = document.getElementById("next-btn");
const prevBtn = document.getElementById("prev-btn");
const undoBtn = document.getElementById("undo-btn");
const redoBtn = document.getElementById("redo-btn");


/* ============================================================
   Default Album Art Configuration
============================================================ */

const DEFAULT_ALBUM_ART_URL = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 200'%3E%3Crect width='200' height='200' fill='%23667eea'/%3E%3Ctext x='100' y='100' font-size='60' fill='white' text-anchor='middle' dominant-baseline='middle'%3E♪%3C/text%3E%3C/svg%3E";


/* ============================================================
   Royalty-Free Preloaded Songs
   (Public domain / free music sample sources)
============================================================ */

const initialSongs = [
    {
        title: "SoundHelix Song 1",
        artist: "SoundHelix",
        url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
        cover: "./assets/cover/cover.jpeg"
    },
    {
        title: "SoundHelix Song 2",
        artist: "SoundHelix",
        url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
        cover: "https://i.pinimg.com/originals/20/d8/4d/20d84d6d218c5963f36ac880fd329723.png"
    },
    {
        title: "SoundHelix Song 3",
        artist: "SoundHelix",
        url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3",
        cover: "https://i.pinimg.com/1200x/e6/0c/ea/e60cea3fd7eb0872f479ec65b47055eb.jpg"
    },
    {
        title: "SoundHelix Song 4",
        artist: "SoundHelix",
        url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3",
        cover: "https://i.pinimg.com/736x/a8/fc/fe/a8fcfed28db21e54c795737afbbbeff2.jpg"
    },
    {
        title: "SoundHelix Song 5",
        artist: "SoundHelix",
        url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3",
        cover: "https://i.pinimg.com/736x/89/d8/04/89d804b5aac2690755030c98ac03fb6e.jpg"
    },
    {
        title: "Robots Vs. Music Song 6",
        artist: "Nigel Stanford",
        url: "./assets/mp3/AUTOMATICA - Robots Vs. Music - Nigel Stanford [bAdqazixuRY].mp3",
        cover: "https://i.pinimg.com/originals/52/84/a5/5284a541f87e2e89b5dc9816f1741145.png"
    }
];


/* ============================================================
   Initialization
============================================================ */

function initializePlaylist() {
    // Use the new initializePlaylist method to load songs
    // without adding them to the undo stack
    controller.initializePlaylist(initialSongs);

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

        // Create album art thumbnail container
        const albumArtDiv = document.createElement("div");
        albumArtDiv.className = "playlist-album-art";

        const img = document.createElement("img");
        img.alt = "cover";

        // Always load album art with fallback to default image
        loadAlbumArtImage(img, song.cover || "", albumArtDiv);

        albumArtDiv.appendChild(img);

        // Create playlist item info container
        const infoDiv = document.createElement("div");
        infoDiv.className = "playlist-item-info";

        const titleDiv = document.createElement("div");
        titleDiv.className = "playlist-item-title";
        titleDiv.textContent = song.title;

        const artistDiv = document.createElement("div");
        artistDiv.className = "playlist-item-artist";
        artistDiv.textContent = song.artist;

        infoDiv.appendChild(titleDiv);
        infoDiv.appendChild(artistDiv);

        li.appendChild(albumArtDiv);
        li.appendChild(infoDiv);

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

        if (albumArtImage) {
            albumArtImage.style.display = "none";
            albumArtImage.src = "";
        }

        if (albumArtContainer) {
            albumArtContainer.classList.remove("has-image");
        }

        return;
    }

    currentTitle.textContent = currentSong.title;
    currentArtist.textContent = currentSong.artist;

    // Load album art for now playing (always attempt, with fallback to default image)
    if (albumArtImage) {
        loadAlbumArtImage(albumArtImage, currentSong.cover || "", albumArtContainer);
    }

    syncAudioSource(currentSong);
}


function syncAudioSource(song) {
    if (!song) return;

    if (audioPlayer.src !== song.url) {
        audioPlayer.src = song.url;
    }
}


/* ============================================================
   Album Art Loading & Validation
============================================================ */

/**
 * Load and validate album art image from URL
 * @param {HTMLImageElement} imgElement - The image element to update
 * @param {string} imageUrl - The URL of the album art image
 * @param {HTMLElement} container - Optional container element to update classes
 */
function loadAlbumArtImage(imgElement, imageUrl, container) {
    if (!imgElement) return;

    // If no URL provided, use default album art
    const urlToLoad = (imageUrl && imageUrl.trim()) ? imageUrl : DEFAULT_ALBUM_ART_URL;

    // Add loading state
    imgElement.classList.add("loading");
    imgElement.style.display = "block";

    // Create a temporary image to validate the URL
    const tempImg = new Image();

    tempImg.onload = function () {
        // Image loaded successfully
        imgElement.src = urlToLoad;
        imgElement.classList.remove("loading");
        imgElement.classList.add("loaded");
        imgElement.style.display = "block";
        imgElement.alt = "Album Art";

        if (container) {
            container.classList.add("has-image");
        }
    };

    tempImg.onerror = function () {
        // Image failed to load - use default fallback only if the failed URL wasn't already the default
        if (urlToLoad === DEFAULT_ALBUM_ART_URL) {
            // Default image failed, just hide the image
            imgElement.classList.remove("loading");
            imgElement.classList.add("error");
            imgElement.style.display = "none";
            if (container) {
                container.classList.remove("has-image");
            }
            console.warn(`Failed to load album art from URL: ${imageUrl}`);
        } else {
            // Custom URL failed, try the default
            console.warn(`Failed to load album art from URL: ${imageUrl}, using default image.`);
            loadAlbumArtImage(imgElement, DEFAULT_ALBUM_ART_URL, container);
        }
    };

    // Attempt to load the image
    tempImg.src = urlToLoad;
}



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
        const cover = document.getElementById("song-cover").value.trim();

        if (!title || !artist || !url) return;

        // Create song object with optional cover URL
        const songData = { title, artist, url };
        if (cover) {
            songData.cover = cover;
        }

        controller.addSong(songData);

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
