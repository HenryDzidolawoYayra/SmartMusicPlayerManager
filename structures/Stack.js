/*
    ============================================================
    Stack.js
    Project: Smart Music Playlist Manager
    Supporting Data Structure: Stack (Undo/Redo)
    ============================================================

    DESCRIPTION:
    This file implements a Stack data structure.

    The Stack follows LIFO (Last In, First Out) principle.

    It will be used for:
        - Undo operations
        - Redo operations

    The UI must NOT directly manipulate internal storage.
    All interactions must go through Stack methods.

    This implementation uses an internal array,
    but it is fully encapsulated within the class.
*/


class Stack {
    constructor() {
        this.items = [];   // Internal storage
    }

    /*
        ==========================================
        push(item)
        ==========================================
        Adds an item to the top of the stack.
        Time Complexity: O(1)
    */
    push(item) {
        this.items[this.items.length] = item;
    }

    /*
        ==========================================
        pop()
        ==========================================
        Removes and returns the top item.
        Returns null if stack is empty.
        Time Complexity: O(1)
    */
    pop() {
        if (this.isEmpty()) {
            return null;
        }

        const topItem = this.items[this.items.length - 1];
        this.items.length = this.items.length - 1;
        return topItem;
    }

    /*
        ==========================================
        peek()
        ==========================================
        Returns top item without removing it.
        Time Complexity: O(1)
    */
    peek() {
        if (this.isEmpty()) return null;
        return this.items[this.items.length - 1];
    }

    /*
        ==========================================
        isEmpty()
        ==========================================
        Checks whether stack is empty.
        Time Complexity: O(1)
    */
    isEmpty() {
        return this.items.length === 0;
    }

    /*
        ==========================================
        clear()
        ==========================================
        Empties the stack.
        Used when new operation invalidates redo history.
        Time Complexity: O(1)
    */
    clear() {
        this.items.length = 0;
    }

    /*
        ==========================================
        size()
        ==========================================
        Returns number of elements in stack.
        Time Complexity: O(1)
    */
    size() {
        return this.items.length;
    }
}
