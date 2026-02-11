/*
    ============================================================
    DoublyLinkedList.js
    Project: Smart Music Playlist Manager
    Core Data Structure: Doubly Linked List (Manual Implementation)
    ============================================================

    DESCRIPTION:
    Production-ready doubly linked list implementation for managing
    a music playlist. Supports deterministic undo/redo operations
    with comprehensive state tracking and edge case handling.

    KEY FEATURES:
        - Maintain head, tail, and current pointers
        - Add/remove songs at any index
        - Navigate forward/backward in playlist
        - Preserve current song state during operations
        - Track size efficiently
        - Full traversal support
        - Deterministic behavior for undo/redo

    COMPLEXITY:
        - addSong: O(n) for insertion at arbitrary index, O(1) append
        - removeSong: O(n) for finding by title
        - playNext/playPrevious: O(1)
        - getIndex: O(n)
        - moveCurrentToIndex: O(n)
        - traversals: O(n)

    NO EXTERNAL DEPENDENCIES
    Fully encapsulated, UI-agnostic implementation
*/

class SongNode {
    /**
     * @param {Object} song - Song object { title, artist, url, [coverUrl] }
     */
    constructor(song) {
        this.song = song;      // Song data
        this.next = null;      // Pointer to next node (or null)
        this.prev = null;      // Pointer to previous node (or null)
    }
}

class DoublyLinkedList {
    constructor() {
        this.head = null;      // First node in list
        this.tail = null;      // Last node in list
        this.current = null;   // Currently selected/playing song
        this.size = 0;         // Total songs in playlist
    }

    /* ============================================================
       Core Add/Remove Operations
    ============================================================ */

    /**
     * Add a song to the playlist.
     * - If index is omitted or >= size, appends to end (O(1))
     * - If index <= 0, inserts at head (O(1))
     * - Otherwise, inserts at specific position (O(n))
     *
     * Edge cases handled:
     *   - Empty list: becomes head, tail, and current
     *   - Single node: properly links next/prev
     *   - Boundary indices: clamped to valid range
     *
     * @param {Object} song - Song object { title, artist, url, [coverUrl] }
     * @param {number} index - (Optional) Position to insert. Default: append
     * @returns {Object} The song object that was added
     */
    addSong(song, index = this.size) {
        if (!song) {
            console.warn("Cannot add null or undefined song");
            return null;
        }

        const newNode = new SongNode(song);

        // Case 1: Empty list
        if (this.size === 0) {
            this.head = this.tail = this.current = newNode;
            this.size = 1;
            return song;
        }

        // Clamp index to valid range [0, size]
        const validIndex = Math.max(0, Math.min(index, this.size));

        // Case 2: Insert at head
        if (validIndex === 0) {
            newNode.next = this.head;
            this.head.prev = newNode;
            this.head = newNode;
            this.size++;
            return song;
        }

        // Case 3: Append at tail (most common case)
        if (validIndex >= this.size) {
            newNode.prev = this.tail;
            this.tail.next = newNode;
            this.tail = newNode;
            this.size++;
            return song;
        }

        // Case 4: Insert in middle
        let temp = this.head;
        for (let i = 0; i < validIndex; i++) {
            temp = temp.next;
        }

        newNode.prev = temp.prev;
        newNode.next = temp;

        if (temp.prev) {
            temp.prev.next = newNode;
        }
        temp.prev = newNode;

        // If we inserted before head, update head
        if (newNode.prev === null) {
            this.head = newNode;
        }

        this.size++;
        return song;
    }

    /**
     * Remove a song from the playlist by title.
     * 
     * Edge cases handled:
     *   - Song not found: returns null, no changes
     *   - Only node: clears head, tail, current
     *   - Removing head: updates head and current if needed
     *   - Removing tail: updates tail and current if needed
     *   - Removing current: moves current to next or prev
     *   - Middle node: properly unlinks from neighbors
     *
     * @param {string} title - Title of song to remove
     * @returns {Object|null} The removed song object, or null if not found
     */
    removeSong(title) {
        if (!this.head || !title) {
            return null;
        }

        let temp = this.head;

        while (temp) {
            if (temp.song.title === title) {
                const removedSong = temp.song;

                // Case 1: Only one node in list
                if (this.head === this.tail) {
                    this.head = this.tail = this.current = null;
                    this.size = 0;
                    return removedSong;
                }

                // Case 2: Removing head node
                if (temp === this.head) {
                    this.head = temp.next;
                    if (this.head) {
                        this.head.prev = null;
                    }
                    // If current was this node, move to new head
                    if (this.current === temp) {
                        this.current = this.head;
                    }
                    this.size--;
                    return removedSong;
                }

                // Case 3: Removing tail node
                if (temp === this.tail) {
                    this.tail = temp.prev;
                    if (this.tail) {
                        this.tail.next = null;
                    }
                    // If current was this node, move to new tail
                    if (this.current === temp) {
                        this.current = this.tail;
                    }
                    this.size--;
                    return removedSong;
                }

                // Case 4: Removing middle node
                temp.prev.next = temp.next;
                temp.next.prev = temp.prev;

                // If current was this node, move to next node (or prev if no next)
                if (this.current === temp) {
                    this.current = temp.next || temp.prev;
                }

                this.size--;
                return removedSong;
            }

            temp = temp.next;
        }

        // Song not found
        return null;
    }

    /* ============================================================
       Navigation Operations
    ============================================================ */

    /**
     * Move current pointer to the next song.
     * Safe: does nothing if already at end or list is empty.
     *
     * @returns {Object|null} The next song, or null if at end or list empty
     */
    playNext() {
        if (this.current && this.current.next) {
            this.current = this.current.next;
            return this.current.song;
        }
        return this.current ? this.current.song : null;
    }

    /**
     * Move current pointer to the previous song.
     * Safe: does nothing if already at head or list is empty.
     *
     * @returns {Object|null} The previous song, or null if at start or list empty
     */
    playPrevious() {
        if (this.current && this.current.prev) {
            this.current = this.current.prev;
            return this.current.song;
        }
        return this.current ? this.current.song : null;
    }

    /* ============================================================
       Query Operations
    ============================================================ */

    /**
     * Get the currently selected/playing song.
     *
     * @returns {Object|null} Current song object, or null if no song selected
     */
    getCurrentSong() {
        return this.current ? this.current.song : null;
    }

    /**
     * Get the total number of songs in the playlist.
     * Maintained in O(1) time via size counter.
     *
     * @returns {number} Number of songs (0 if empty)
     */
    getSize() {
        return this.size;
    }

    /**
     * Check if the playlist is empty.
     *
     * @returns {boolean} True if no songs, false otherwise
     */
    isEmpty() {
        return this.size === 0;
    }

    /**
     * Find the index (0-based) of a song by title.
     * Returns first match only.
     *
     * @param {string} title - Title to search for
     * @returns {number} Index of song (0-based), or -1 if not found
     */
    getIndex(title) {
        if (!title) return -1;

        let index = 0;
        let temp = this.head;

        while (temp) {
            if (temp.song.title === title) {
                return index;
            }
            temp = temp.next;
            index++;
        }

        return -1;
    }

    /**
     * Move the current pointer to a specific index.
     * Safe: validates index bounds before moving.
     *
     * Edge cases:
     *   - index < 0: does nothing
     *   - index >= size: does nothing
     *   - Empty list: does nothing
     *   - Valid index: current pointer moves to that node
     *
     * @param {number} index - 0-based position to move to
     * @returns {boolean} True if move succeeded, false if index invalid
     */
    moveCurrentToIndex(index) {
        // Validate bounds
        if (index < 0 || index >= this.size || this.isEmpty()) {
            return false;
        }

        // Quick optimization: if moving to head
        if (index === 0) {
            this.current = this.head;
            return true;
        }

        // Quick optimization: if moving to tail
        if (index === this.size - 1) {
            this.current = this.tail;
            return true;
        }

        // General case: traverse to index
        let temp = this.head;
        for (let i = 0; i < index; i++) {
            if (!temp) return false;
            temp = temp.next;
        }

        if (temp) {
            this.current = temp;
            return true;
        }

        return false;
    }

    /* ============================================================
       Traversal Operations
    ============================================================ */

    /**
     * Iterate through all songs from head to tail.
     * Callback receives each song object.
     *
     * Usage:
     *   list.traverseForward(song => console.log(song.title))
     *
     * @param {Function} callback - Function(song) called for each song
     */
    traverseForward(callback) {
        if (typeof callback !== "function") {
            console.warn("Callback must be a function");
            return;
        }

        let temp = this.head;
        while (temp) {
            callback(temp.song);
            temp = temp.next;
        }
    }

    /**
     * Iterate through all songs from tail to head.
     * Callback receives each song object.
     *
     * Usage:
     *   list.traverseBackward(song => console.log(song.title))
     *
     * @param {Function} callback - Function(song) called for each song
     */
    traverseBackward(callback) {
        if (typeof callback !== "function") {
            console.warn("Callback must be a function");
            return;
        }

        let temp = this.tail;
        while (temp) {
            callback(temp.song);
            temp = temp.prev;
        }
    }

    /* ============================================================
       Debugging / Inspection
    ============================================================ */

    /**
     * Get a summary of the list state (for debugging only).
     * 
     * @returns {Object} { size, head, tail, current, isEmpty }
     */
    getState() {
        return {
            size: this.size,
            head: this.head ? this.head.song.title : null,
            tail: this.tail ? this.tail.song.title : null,
            current: this.current ? this.current.song.title : null,
            isEmpty: this.isEmpty()
        };
    }

    /**
     * Get all songs as an array (for debugging, not for normal use).
     *
     * @returns {Array} Array of song objects
     */
    toArray() {
        const result = [];
        this.traverseForward(song => result.push(song));
        return result;
    }
}

// export default DoublyLinkedList;
