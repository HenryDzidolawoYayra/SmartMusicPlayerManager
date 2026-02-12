/*
    ============================================================
    PlaylistController.js
    Project: Smart Music Playlist Manager
    ============================================================

    DESCRIPTION:
    Production-ready controller for managing playlist actions
    with a fully deterministic undo/redo system.

    Features:
        - Deep-cloned song objects to prevent shared references
        - Comprehensive state tracking (current pointer, indices)
        - Robust error handling and edge case management
        - Initial playlist setup excluded from undo history
        - Fully compatible with custom DoublyLinkedList and Stack

    Dependencies:
        - DoublyLinkedList.js
        - Stack.js
*/

class PlaylistController {

    constructor(DoublyLinkedListClass, StackClass) {
        this.playlist = new DoublyLinkedListClass();
        this.undoStack = new StackClass();
        this.redoStack = new StackClass();
        this.isInitializing = false;  // Flag to skip undo during initial setup
    }

    /* ============================================================
       Utility Methods
    ============================================================ */

    /**
     * Deep clone a song object to prevent shared references
     * @param {Object} song - Song object { title, artist, url, coverUrl }
     * @returns {Object} Deep cloned song
     */
    cloneSong(song) {
        if (!song) return null;
        return JSON.parse(JSON.stringify(song));
    }

    /**
     * Get the current index of the currently playing song
     * @returns {number} Index of current song, or -1 if no song is current
     */
    getCurrentIndex() {
        const current = this.playlist.getCurrentSong();
        if (!current) return -1;
        return this.playlist.getIndex(current.title);
    }

    /**
     * Safely move the current pointer to a specific index
     * Handles edge cases: negative indices, out-of-bounds indices
     * @param {number} index - Target index
     * @returns {boolean} True if move was successful, false otherwise
     */
    moveCurrentToIndex(index) {
        // Handle invalid indices
        if (this.playlist.isEmpty()) {
            return false;
        }

        // Clamp index to valid range
        const validIndex = Math.max(0, Math.min(index, this.playlist.getSize() - 1));

        // Call the playlist's moveCurrentToIndex with validated index
        this.playlist.moveCurrentToIndex(validIndex);
        return true;
    }

    /**
     * Record an action to the undo stack (respects initialization flag)
     * @param {Object} action - Action object { type, song, index, previousCurrentIndex }
     */
    recordAction(action) {
        // Skip recording during initial playlist setup
        if (this.isInitializing) return;

        this.undoStack.push(action);
        this.redoStack.clear();  // Clear redo stack on new action
    }

    /* ============================================================
       Core Operations
    ============================================================ */

    /**
     * Add a song to the end of the playlist
     * @param {Object} song - Song object { title, artist, url, coverUrl }
     * @returns {Object} Currently playing song after operation
     */
    addSong(song) {
        if (!song || !song.title || !song.artist || !song.url) {
            console.warn("Invalid song object", song);
            return this.playlist.getCurrentSong();
        }

        const previousCurrentIndex = this.getCurrentIndex();
        const newIndex = this.playlist.getSize();

        // Add song to playlist (deep cloned)
        this.playlist.addSong(this.cloneSong(song));

        // Record action (only if not initializing)
        this.recordAction({
            type: "ADD",
            song: this.cloneSong(song),
            index: newIndex,
            previousCurrentIndex: previousCurrentIndex,
            currentIndexAfterAdd: this.getCurrentIndex()
        });

        return this.playlist.getCurrentSong();
    }

    /**
     * Remove a song from the playlist by title
     * @param {string} title - Title of song to remove
     * @returns {Object|null} The removed song, or null if not found
     */
    removeSong(title) {
        if (!title || typeof title !== "string") {
            console.warn("Invalid title", title);
            return null;
        }

        const index = this.playlist.getIndex(title);
        if (index === -1) {
            console.warn(`Song not found: "${title}"`);
            return null;
        }

        const previousCurrentIndex = this.getCurrentIndex();
        const removedSong = this.playlist.removeSong(title);

        if (!removedSong) {
            console.warn(`Failed to remove song: "${title}"`);
            return null;
        }

        // Record action (only if not initializing)
        this.recordAction({
            type: "REMOVE",
            song: this.cloneSong(removedSong),
            index: index,
            previousCurrentIndex: previousCurrentIndex,
            currentIndexAfterRemove: this.getCurrentIndex()
        });

        return removedSong;
    }

    /**
     * Move to the next song in the playlist
     * @returns {Object|null} The next song, or null if at end
     */
    playNext() {
        return this.playlist.playNext();
    }

    /**
     * Move to the previous song in the playlist
     * @returns {Object|null} The previous song, or null if at start
     */
    playPrevious() {
        return this.playlist.playPrevious();
    }

    /**
     * Get the currently playing song
     * @returns {Object|null} Current song object or null
     */
    getCurrentSong() {
        return this.playlist.getCurrentSong();
    }

    /**
     * Get all songs in the playlist
     * @param {Function} callback - Function called with each song
     */
    getAllSongs(callback) {
        if (typeof callback !== "function") {
            console.warn("Callback must be a function");
            return;
        }
        this.playlist.traverseForward(callback);
    }

    /**
     * Get the total number of songs in the playlist
     * @returns {number} Size of playlist
     */
    getSize() {
        return this.playlist.getSize();
    }

    /**
     * Check if the playlist is empty
     * @returns {boolean} True if no songs
     */
    isEmpty() {
        return this.playlist.isEmpty();
    }

    /* ============================================================
       Undo / Redo Operations
    ============================================================ */

    /**
     * Undo the last action (add or remove)
     * Restores the playlist to its previous state including current pointer
     * @returns {Object|null} Current song after undo, or null if nothing to undo
     */
    undo() {
        if (this.undoStack.isEmpty()) {
            console.log("Nothing to undo");
            return null;
        }

        const action = this.undoStack.pop();
        if (!action) return null;

        try {
            if (action.type === "ADD") {
                // Undo add → remove the song that was added
                const removed = this.playlist.removeSong(action.song.title);
                if (!removed) {
                    console.warn(`Cannot undo ADD: song "${action.song.title}" not found`);
                    this.undoStack.push(action);  // Restore action to stack
                    return this.playlist.getCurrentSong();
                }

                // Restore the previous current pointer
                if (action.previousCurrentIndex >= 0) {
                    this.moveCurrentToIndex(action.previousCurrentIndex);
                }
            }
            else if (action.type === "REMOVE") {
                // Undo remove → reinsert song at original index
                const inserted = this.playlist.addSong(this.cloneSong(action.song), action.index);
                if (!inserted) {
                    console.warn(`Cannot undo REMOVE: failed to reinsert "${action.song.title}"`);
                    this.undoStack.push(action);  // Restore action to stack
                    return this.playlist.getCurrentSong();
                }

                // Restore the previous current pointer
                if (action.previousCurrentIndex >= 0) {
                    this.moveCurrentToIndex(action.previousCurrentIndex);
                }
            }

            // Move action to redo stack
            this.redoStack.push(action);
            return this.playlist.getCurrentSong();

        } catch (error) {
            console.error("Error during undo:", error);
            this.undoStack.push(action);  // Restore action on error
            return this.playlist.getCurrentSong();
        }
    }

    /**
     * Redo the last undone action (add or remove)
     * Restores the playlist to its post-action state
     * @returns {Object|null} Current song after redo, or null if nothing to redo
     */
    redo() {
        if (this.redoStack.isEmpty()) {
            console.log("Nothing to redo");
            return null;
        }

        const action = this.redoStack.pop();
        if (!action) return null;

        try {
            if (action.type === "ADD") {
                // Redo add → reinsert song at original index
                const inserted = this.playlist.addSong(this.cloneSong(action.song), action.index);
                if (!inserted) {
                    console.warn(`Cannot redo ADD: failed to reinsert "${action.song.title}"`);
                    this.redoStack.push(action);  // Restore action to stack
                    return this.playlist.getCurrentSong();
                }

                // Restore the current pointer to what it was after the original add
                if (action.currentIndexAfterAdd !== undefined && action.currentIndexAfterAdd >= 0) {
                    this.moveCurrentToIndex(action.currentIndexAfterAdd);
                }
            }
            else if (action.type === "REMOVE") {
                // Redo remove → remove song again
                const removed = this.playlist.removeSong(action.song.title);
                if (!removed) {
                    console.warn(`Cannot redo REMOVE: song "${action.song.title}" not found`);
                    this.redoStack.push(action);  // Restore action to stack
                    return this.playlist.getCurrentSong();
                }

                // Restore the current pointer to what it was after the original remove
                if (action.currentIndexAfterRemove !== undefined && action.currentIndexAfterRemove >= 0) {
                    this.moveCurrentToIndex(action.currentIndexAfterRemove);
                }
            }

            // Move action back to undo stack
            this.undoStack.push(action);
            return this.playlist.getCurrentSong();

        } catch (error) {
            console.error("Error during redo:", error);
            this.redoStack.push(action);  // Restore action on error
            return this.playlist.getCurrentSong();
        }
    }

    /**
     * Check if undo is available
     * @returns {boolean} True if there are actions to undo
     */
    canUndo() {
        return !this.undoStack.isEmpty();
    }

    /**
     * Check if redo is available
     * @returns {boolean} True if there are actions to redo
     */
    canRedo() {
        return !this.redoStack.isEmpty();
    }

    /* ============================================================
       Initialization Helper
    ============================================================ */

    /**
     * Initialize playlist with songs without adding to undo history
     * Use this for loading initial songs at startup
     * @param {Array} songs - Array of song objects
     */
    initializePlaylist(songs) {
        if (!Array.isArray(songs)) {
            console.warn("Songs must be an array");
            return;
        }

        this.isInitializing = true;

        try {
            songs.forEach(song => {
                if (song && song.title && song.artist && song.url) {
                    this.addSong(song);
                }
            });
        } finally {
            this.isInitializing = false;
            // Clear any stacks just to be safe
            this.undoStack.clear();
            this.redoStack.clear();
        }
    }
}
