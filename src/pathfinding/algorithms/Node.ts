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
}
