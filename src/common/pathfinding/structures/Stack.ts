/**
 * Stack node
 */
class Node<E>
{
    next: Node<E> | null = null;
    data: E;

    constructor(data: E) {
        this.data = data;
    }
}

/**
 * Minimalist Implementation of the stack data structure
 */
class Stack<E>
{
    private top: Node<E> | null = null;
    private size: number = 0;

    peek() {
        return this.top != null ? this.top.data : undefined;
    }

    push(e: E) {
        const node = new Node(e);
        node.next = this.top;
        this.top = node;
        this.size++;
    }

    pop() {
        const top = this.peek();
        if(this.top != null) {
            this.top = this.top.next;
            this.size--;
        }
        return top;
    }

    isEmpty() {
        return this.size === 0;
    }

    getSize() {
        return this.size;
    }
}

export default Stack;