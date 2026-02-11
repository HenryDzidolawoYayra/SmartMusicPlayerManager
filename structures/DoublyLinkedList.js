/*
    ============================================================
    DoublyLinkedList.js
    Project: Smart Music Playlist Manager
    Core Data Structure: Doubly Linked List (Manual Implementation)
    Author: [Your Name / Group Name]
    ============================================================

    DESCRIPTION:
    This file implements a Doubly Linked List data structure.
    Each node represents a Song in the playlist.

    The list maintains:
        - head pointer (first song)
        - tail pointer (last song)
        - current pointer (currently playing song)

    No UI or DOM manipulation is included in this file.
    This strictly contains data structure logic only.
*/


/*
    ============================
    Node Class
    ============================

    Each node represents a Song in the playlist.
    A node contains:
        - song data
        - pointer to next node
        - pointer to previous node
*/

class SongNode {
    constructor(song) {
        this.song = song;     // Object containing song details
        this.next = null;     // Pointer to next node
        this.prev = null;     // Pointer to previous node
    }
}


/*
    ============================
    Doubly Linked List Class
    ============================

    Maintains:
        - head pointer
        - tail pointer
        - current pointer
        - size of the list
*/

class DoublyLinkedList {
    constructor() {
        this.head = null;      // First song
        this.tail = null;      // Last song
        this.current = null;   // Currently selected/playing song
        this.size = 0;         // Number of songs in playlist
    }

    /*
        ==========================================
        addSong(song)
        ==========================================
        Adds a new song to the end of the playlist.
        Time Complexity: O(1)
    */
    addSong(song) {
        const newNode = new SongNode(song);

        // If list is empty
        if (!this.head) {
            this.head = newNode;
            this.tail = newNode;
            this.current = newNode; // First song becomes current
        } else {
            // Attach new node after tail
            newNode.prev = this.tail;
            this.tail.next = newNode;
            this.tail = newNode;
        }

        this.size++;
    }


    /*
       ==========================================
       removeSong(title)
       ==========================================
       Removes a song by title.
   
       Explicitly handles:
           1. Removing the only node
           2. Removing the head
           3. Removing the tail
           4. Removing a middle node
   
       Time Complexity: O(n)
   */
    removeSong(title) {
        if (!this.head) return null;

        let temp = this.head;

        while (temp) {
            if (temp.song.title === title) {

                // CASE 1: Only one node in the list
                if (this.head === this.tail) {
                    this.head = null;
                    this.tail = null;
                    this.current = null;
                }

                // CASE 2: Removing head (but not the only node)
                else if (temp === this.head) {
                    this.head = temp.next;
                    this.head.prev = null;

                    if (this.current === temp) {
                        this.current = this.head;
                    }
                }

                // CASE 3: Removing tail
                else if (temp === this.tail) {
                    this.tail = temp.prev;
                    this.tail.next = null;

                    if (this.current === temp) {
                        this.current = this.tail;
                    }
                }

                // CASE 4: Removing middle node
                else {
                    temp.prev.next = temp.next;
                    temp.next.prev = temp.prev;

                    if (this.current === temp) {
                        this.current = temp.next;
                    }
                }

                this.size--;
                return temp.song;
            }

            temp = temp.next;
        }

        return null; // Song not found
    }



    /*
        ==========================================
        playNext()
        ==========================================
        Moves current pointer to next node.
        Time Complexity: O(1)
    */
    playNext() {
        if (this.current && this.current.next) {
            this.current = this.current.next;
        }
        return this.getCurrentSong();
    }


    /*
        ==========================================
        playPrevious()
        ==========================================
        Moves current pointer to previous node.
        Time Complexity: O(1)
    */
    playPrevious() {
        if (this.current && this.current.prev) {
            this.current = this.current.prev;
        }
        return this.getCurrentSong();
    }


    /*
        ==========================================
        getCurrentSong()
        ==========================================
        Returns the currently selected song.
        Time Complexity: O(1)
    */
    getCurrentSong() {
        return this.current ? this.current.song : null;
    }


    /*
        ==========================================
        isEmpty()
        ==========================================
        Checks if playlist is empty.
        Time Complexity: O(1)
    */
    isEmpty() {
        return this.size === 0;
    }


    /*
        ==========================================
        getSize()
        ==========================================
        Returns number of songs in playlist.
        Time Complexity: O(1)
    */
    getSize() {
        return this.size;
    }


    /*
        ==========================================
        traverseForward(callback)
        ==========================================
        Traverses playlist from head to tail.
        Used by UI layer to render playlist.
        No DOM code here — callback provided externally.
        Time Complexity: O(n)
    */
    traverseForward(callback) {
        let temp = this.head;

        while (temp) {
            callback(temp.song);
            temp = temp.next;
        }
    }


    /*
        ==========================================
        traverseBackward(callback)
        ==========================================
        Traverses playlist from tail to head.
        Time Complexity: O(n)
    */
    traverseBackward(callback) {
        let temp = this.tail;

        while (temp) {
            callback(temp.song);
            temp = temp.prev;
        }
    }
}


/*
    Exporting class (for modular usage)
    If using ES Modules, uncomment export line.
*/

// export default DoublyLinkedList;
