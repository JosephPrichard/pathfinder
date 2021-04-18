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
     * Always returns the shortest path, but performs poorly on larger grids
     * @param initial
     * @param goal
     */
    findPath(initial: Point, goal: Point): Tile[] {
        this.clearRecentSearch();
        const grid = this.navigator.getGrid();
        const startVisited = new HashTable<Node>();
        const endVisited = new HashTable<Node>();
        const startQueue: Node[] = [];
        const endQueue: Node[] = [];
        const initialRoot = new Node(grid.get(initial));
        startQueue.push(initialRoot);
        startVisited.add(stringify(initial), initialRoot);
        const goalRoot = new Node(grid.get(goal));
        endQueue.push(goalRoot);
        endVisited.add(stringify(goal), goalRoot);
        while(startQueue.length !== 0 && endQueue.length !== 0) {
            //expand startQueue
            const startCurrentNode = startQueue.shift()!;
            this.addRecent(startCurrentNode);
            const startCurrentPoint = startCurrentNode.tile.point;
            const startCurrentPointKey = stringify(startCurrentPoint);
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
                    startQueue.push(neighborNode);
                    startVisited.add(neighborKey, neighborNode);
                }
            }
            //expand endQueue
            const endCurrentNode = endQueue.shift()!;
            this.addRecent(endCurrentNode);
            const endCurrentPoint = endCurrentNode.tile.point;
            const endCurrentPointKey = stringify(endCurrentPoint);
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
                    endQueue.push(neighborNode);
                    endVisited.add(neighborKey, neighborNode);
                }
            }
        }
        return [];
    }
}

export default BiBFSPathfinder;