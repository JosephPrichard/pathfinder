import {Tile} from '../core/Components';

/**
 * Represents a search Tree Node
 */
export class Node
{
    parent: Node | null = null; //parent node
    readonly children: Node[] = [];
    readonly tile: Tile; //stores a graph node

    constructor(tile: Tile) {
        this.tile = tile;
    }

    addChild(child: Node) {
        child.parent = this;
        this.children.push(child);
    }

    /**
     * Some nodes don't have scores. returns -1 if the node is un-scored
     */
    score() {
        return {
            f: -1,
            g: -1,
            h: -1
        }
    }
}

/**
 * Represents an heuristic weighted aStar search tree node
 */
export class AStarNode extends Node
{
    readonly g: number; //path cost
    readonly fScore: number; //heuristic

    constructor(tile: Tile, g: number, fScore: number) {
        super(tile);
        this.g = g;
        this.fScore = fScore;
    }

    f() {
        return this.fScore;
    }

    /**
     * Gets scores for the node in a readable format
     */
    score() {
        return {
            f: Math.round(this.f()),
            g: Math.round(this.g),
            h: Math.round(this.f() - this.g)
        }
    }
}
