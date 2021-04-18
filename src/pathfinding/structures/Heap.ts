/**
 * A compare function to determine if a is 'better' (deserves a higher position) than b
 */
export type Comparator<E> = (a: E, b: E) => boolean

/**
 * Minimalist Implementation of the heap data structure as an array
 */
class Heap<E>
{
    private elements: E[] = [];
    readonly compare: Comparator<E>;

    constructor(compare: Comparator<E>) {
        this.compare = compare;
    }

    /**
     * Returns the size of the heap
     */
    getSize() {
        return this.elements.length;
    }

    /**
     * Checks if heap is empty
     */
    isEmpty() {
        return this.elements.length === 0;
    }

    /**
     * Add a new element to the heap
     * @param e
     */
    push(e: E) {
        this.elements.push(e);
        this.siftUp(this.elements.length-1); //last element
    }

    /**
     * Returns the top of the heap without removing it
     * Fails if heap is empty
     */
    peek() {
        return this.elements[0];
    }

    /**
     * Returns the top of the heap and removes it
     * Fails if heap is empty
     */
    pop() {
        const val = this.peek();
        this.move(this.elements.length - 1, 0);
        this.elements.pop();
        this.siftDown(0);
        return val;
    }

    /**
     * Clear the heap
     */
    clear() {
        this.elements = [];
    }

    /**
     * Sifts a new element that is out of order up to the right position
     * @param pos of new element
     */
    private siftUp(pos: number) {
        let parent = ((pos - 1) / 2) >> 0; //integer division
        while(parent >= 0) {
            //if the current position is better than parent
            if(this.compare(this.elements[pos], this.elements[parent])) {
                //then current position with parent and move to next
                this.swap(pos, parent);
                pos = parent;
                parent = ((pos - 1) / 2) >> 0;
            } else {
                //otherwise stop
                parent = -1;
            }
        }
    }

    /**
     * Sifts a new element that is out of order down to the right position
     * @param pos of new element
     */
    private siftDown(pos: number) {
        const left = 2 * pos + 1;
        const right = 2 * pos + 2;
        //stop if the children are out of bounds
        if(left >= this.elements.length) {
            return;
        }
        //find the better child
        const child = (right >= this.elements.length || this.compare(this.elements[left], this.elements[right]))
            ? left : right;
        //continues to sift down if the child is better than the current position
        if(this.compare(this.elements[child], this.elements[pos])) {
            this.swap(child, pos);
            this.siftDown(child);
        }
    }

    /**
     * Internal move function
     * @param from
     * @param to
     */
    private move(from: number, to: number) {
        this.elements[to] = this.elements[from];
    }

    /**
     * Internal swap function
     * @param a
     * @param b
     */
    private swap(a: number, b: number) {
        let val = this.elements[a];
        this.elements[a] = this.elements[b];
        this.elements[b] = val;
    }
}

export default Heap;