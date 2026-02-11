/*
    ============================================================
    PlaylistController.js
    Project: Smart Music Playlist Manager
    ============================================================

    ROLE:
    This file implements the Controller layer of the system.

    ARCHITECTURE POSITION:
        UI Layer  --->  PlaylistController  --->  Data Structures
                                   |
                      ----------------------------
                      |                          |
            DoublyLinkedList               Stack (Undo)
                                           Stack (Redo)

    RESPONSIBILITIES:
        - Owns the Doubly Linked List instance
        - Owns Undo and Redo stacks
        - Exposes clean public methods
        - Ensures UI never manipulates raw data structures
        - Records reversible actions for Undo/Redo

    IMPORTANT:
        This file contains NO DOM manipulation.
        This file contains NO HTML logic.
        This file contains NO audio playback code.
*/


// If using ES modules, uncomment imports:
// import DoublyLinkedList from "../structures/DoublyLinkedList.js";
// import Stack from "../structures/Stack.js";


class PlaylistController {

    constructor(doublyLinkedList, StackClass) {
        /*
            Dependency Injection is used here.
            The controller does not create the structures internally.
            This improves modularity and testability.
        */

        this.playlist = new doublyLinkedList();
        this.undoStack = new StackClass();
        this.redoStack = new StackClass();
    }


    /*
        ========================================================
        addSong(song)
        ========================================================
        Adds a song to playlist.
        Records action for Undo.
        Clears redo history.
    */
    addSong(song) {

        this.playlist.addSong(song);

        // Record reverse operation for undo
        this.undoStack.push({
            action: "ADD",
            song: song
        });

        // Once new action happens, redo history is invalid
        this.redoStack.clear();

        return this.playlist.getCurrentSong();
    }


    /*
        ========================================================
        removeSong(title)
        ========================================================
        Removes a song from playlist.
        Records action for Undo.
        Clears redo history.
    */
    removeSong(title) {

        const removedSong = this.playlist.removeSong(title);

        if (!removedSong) return null;

        this.undoStack.push({
            action: "REMOVE",
            song: removedSong
        });

        this.redoStack.clear();

        return removedSong;
    }


    /*
        ========================================================
        playNext()
        ========================================================
        Moves current pointer forward.
        O(1) pointer movement.
    */
    playNext() {
        return this.playlist.playNext();
    }


    /*
        ========================================================
        playPrevious()
        ========================================================
        Moves current pointer backward.
        O(1) pointer movement.
    */
    playPrevious() {
        return this.playlist.playPrevious();
    }


    /*
        ========================================================
        getCurrentSong()
        ========================================================
        Returns current song object.
    */
    getCurrentSong() {
        return this.playlist.getCurrentSong();
    }


    /*
        ========================================================
        getAllSongs(callback)
        ========================================================
        Traverses playlist forward.
        UI supplies callback to render.
    */
    getAllSongs(callback) {
        this.playlist.traverseForward(callback);
    }


    /*
        ========================================================
        undo()
        ========================================================
        Reverses the most recent ADD or REMOVE.
    */
    undo() {

        if (this.undoStack.isEmpty()) return null;

        const lastAction = this.undoStack.pop();

        if (lastAction.action === "ADD") {

            // Undo ADD → remove the song
            this.playlist.removeSong(lastAction.song.title);

            // Push reverse action into redo stack
            this.redoStack.push(lastAction);
        }

        else if (lastAction.action === "REMOVE") {

            // Undo REMOVE → re-add the song
            this.playlist.addSong(lastAction.song);

            this.redoStack.push(lastAction);
        }

        return this.getCurrentSong();
    }


    /*
        ========================================================
        redo()
        ========================================================
        Re-applies the last undone operation.
    */
    redo() {

        if (this.redoStack.isEmpty()) return null;

        const action = this.redoStack.pop();

        if (action.action === "ADD") {

            // Redo ADD → re-add the song
            this.playlist.addSong(action.song);
        }

        else if (action.action === "REMOVE") {

            // Redo REMOVE → remove the song again
            this.playlist.removeSong(action.song.title);
        }

        // After redo, push back into undo stack
        this.undoStack.push(action);

        return this.getCurrentSong();
    }


    /*
        ========================================================
        getSize()
        ========================================================
        Returns number of songs in playlist.
    */
    getSize() {
        return this.playlist.getSize();
    }


    /*
        ========================================================
        isEmpty()
        ========================================================
        Checks if playlist is empty.
    */
    isEmpty() {
        return this.playlist.isEmpty();
    }
}


/*
    Export class for modular use
*/

// export default PlaylistController;
