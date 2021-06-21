/*
 * Copyright (c) Joseph Prichard 2022.
 */

import Pathfinder, {reconstructPath, reconstructPathReversed} from './Pathfinder';
import {Node} from './Node';
import {Point} from '../core/Components';
import {PointTable} from '../structures/Hash';

interface ControlStructures {
    frontier: Node[],
    visited: PointTable<Node>
}

class BiBFSPathfinder extends Pathfinder
{
    getAlgorithmName() {
        return 'Bidirectional Breadth First Search';
    }

    /**
     * Implementation of Bidirectional BFS to find the shortest path from initial to point
     *  One frontier is expanded starting from initial node until it reaches goal frontier
     *  Other frontier is expanded starting from goal node until it reaches initial frontier
     * Doesn't always return the shortest path, and performs poorly on larger grids
     * @param initial
     * @param goal
     */
    findPath(initial: Point, goal: Point) {
        this.clearRecentSearch();
        const grid = this.navigator.getGrid();
        //store the nodes visited from start direction + nodes on the start frontier, allows for fast retrieval of node (for reconstruction)
        const startVisited = new PointTable<Node>(grid.getWidth(), grid.getHeight());
        //store the nodes visited from end direction + nodes on the end frontier, allows for fast retrieval of node (for reconstruction)
        const endVisited = new PointTable<Node>(grid.getWidth(), grid.getHeight());
        //fifo queue starting from initial point to store points we haven't yet visited
        const startFrontier: Node[] = [];
        //fifo queue starting from goal point to store points we haven't yet visited
        const endFrontier: Node[] = [];
        //add the root to both frontiers and start the algorithm from both directions
        const initialRoot = new Node(grid.get(initial));
        startFrontier.push(initialRoot);
        startVisited.add(initial, initialRoot);
        const goalRoot = new Node(grid.get(goal));
        endFrontier.push(goalRoot);
        endVisited.add(goal, goalRoot);
        //continues until points have been visited
        while(startFrontier.length !== 0 && endFrontier.length !== 0) {
            //expand startQueue
            const startCurrentNode = startFrontier.shift()!;
            const startCurrentPoint = startCurrentNode.tile.point;
            this.addRecent(startCurrentNode);
            //check if the end frontier and the start frontier have collided
            if(endVisited.has(startCurrentPoint)) {
                //path from start to collision + path from collision to goal
                //path from goal to collision needs to be reversed (wrong direction)
                if(startCurrentNode.parent != null) {
                    return reconstructPath(startCurrentNode.parent)
                        .concat(reconstructPathReversed(endVisited.get(startCurrentPoint)!))
                        //must be added because goal is excluded from reconstructReversed algorithm
                        .concat(grid.get(goal));
                } else {
                    return [grid.get(goal)];
                }
            }
            this.doBFSExpansion({ frontier: startFrontier, visited: startVisited }, startCurrentNode);
            //expand endQueue
            const endCurrentNode = endFrontier.shift()!;
            const endCurrentPoint = endCurrentNode.tile.point;
            this.addRecent(endCurrentNode);
            //check if the end frontier and the start frontier have collided
            if(startVisited.has(endCurrentPoint)) {
                //path from start to collision + path from collision to goal
                //path from goal to collision needs to be reversed (wrong direction)
                if(endCurrentNode.parent != null) {
                    return reconstructPath(startVisited.get(endCurrentPoint)!)
                        .concat(reconstructPathReversed(endCurrentNode.parent))
                        //must be added because goal is excluded from reconstructReversed algorithm
                        .concat(grid.get(goal));
                } else {
                    return [grid.get(goal)];
                }
            }
            this.doBFSExpansion({ frontier: endFrontier, visited: endVisited }, endCurrentNode);
        }
        return [];
    }

    private doBFSExpansion(structures: ControlStructures, currentNode: Node) {
        const currentPoint = currentNode.tile.point;
        for(const neighbor of this.navigator.neighbors(currentPoint)) {
            //point hasn't been visited, we can add it to frontier
            if(!structures.visited.has(neighbor.point)) {
                const neighborNode = new Node(neighbor);
                currentNode.addChild(neighborNode);
                structures.frontier.push(neighborNode);
                structures.visited.add(neighbor.point, neighborNode);
            }
        }
    }
}

export default BiBFSPathfinder;