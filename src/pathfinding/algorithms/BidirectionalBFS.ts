import Pathfinder, {reconstructPath, reconstructPathReversed} from './Pathfinder';
import {Point, Tile} from '../core/Components';
import {HashTable, stringify} from '../structures/Hash';
import {Node} from './Node';

class BiBFSPathfinder extends Pathfinder
{
    getAlgorithmName(): string {
        return 'Bidirectional Breadth First Search';
    }

    /**
     * Implementation of BFS to find the shortest path from initial to point
     * Doesn't always return the shortest path, and performs poorly on larger grids
     * @param initial
     * @param goal
     */
    findPath(initial: Point, goal: Point): Tile[] {
        this.clearRecentSearch();
        const grid = this.navigator.getGrid();
        const startVisited = new HashTable<Node>();
        const endVisited = new HashTable<Node>();
        const startFrontier: Node[] = [];
        const endFrontier: Node[] = [];
        const initialRoot = new Node(grid.get(initial));
        startFrontier.push(initialRoot);
        startVisited.add(stringify(initial), initialRoot);
        const goalRoot = new Node(grid.get(goal));
        endFrontier.push(goalRoot);
        endVisited.add(stringify(goal), goalRoot);
        while(startFrontier.length !== 0 && endFrontier.length !== 0) {
            //expand startQueue
            const startCurrentNode = startFrontier.shift()!;
            const startCurrentPoint = startCurrentNode.tile.point;
            const startCurrentPointKey = stringify(startCurrentPoint);
            this.addRecent(startCurrentNode);
            if(endVisited.has(startCurrentPointKey)) {
                if(startCurrentNode.parent != null) {
                    return reconstructPath(
                        startCurrentNode.parent
                    ).concat(reconstructPathReversed(
                        endVisited.get(startCurrentPointKey)!
                    )).concat(
                        grid.get(goal)
                    );
                } else {
                    return [grid.get(goal)];
                }
            }
            for(const neighbor of this.navigator.neighbors(startCurrentPoint)) {
                const neighborKey = stringify(neighbor.point);
                if(!startVisited.has(neighborKey)) {
                    const neighborNode = new Node(neighbor);
                    startCurrentNode.addChild(neighborNode);
                    startFrontier.push(neighborNode);
                    startVisited.add(neighborKey, neighborNode);
                }
            }
            //expand endQueue
            const endCurrentNode = endFrontier.shift()!;
            const endCurrentPoint = endCurrentNode.tile.point;
            const endCurrentPointKey = stringify(endCurrentPoint);
            this.addRecent(endCurrentNode);
            if(startVisited.has(endCurrentPointKey)) {
                if(endCurrentNode.parent != null) {
                    return reconstructPath(
                        startVisited.get(endCurrentPointKey)!
                    ).concat(reconstructPathReversed(
                        endCurrentNode.parent
                    )).concat(
                        grid.get(goal)
                    );
                } else {
                    return [grid.get(goal)];
                }
            }
            for(const neighbor of this.navigator.neighbors(endCurrentPoint)) {
                const neighborKey = stringify(neighbor.point);
                if(!endVisited.has(neighborKey)) {
                    const neighborNode = new Node(neighbor);
                    endCurrentNode.addChild(neighborNode);
                    endFrontier.push(neighborNode);
                    endVisited.add(neighborKey, neighborNode);
                }
            }
        }
        return [];
    }
}

export default BiBFSPathfinder;