import Pathfinder, {reconstructPath} from './Pathfinder';
import {Point, Tile} from '../core/Components';
import {HashSet, stringify} from '../structures/Hash';
import {Node} from './Node';

class BFSPathfinder extends Pathfinder
{
    getAlgorithmName(): string {
        return 'Breadth First Search';
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
        const queue: Node[] = []; //fifo, stores nodes on the frontier
        const visited = new HashSet();
        const root = new Node(grid.get(initial));
        queue.push(root); //enqueue
        visited.add(stringify(initial));
        while(queue.length !== 0) { //not empty
            const currentNode = queue.shift()!; //dequeue
            this.addRecent(currentNode);
            const currentPoint = currentNode.tile.point;
            if(this.navigator.equals(currentPoint, goal)) {
                return reconstructPath(currentNode);
            }
            for(const neighbor of this.navigator.neighbors(currentPoint)) {
                const neighborKey = stringify(neighbor.point);
                if(!visited.has(neighborKey)) {
                    const neighborNode = new Node(neighbor);
                    currentNode.addChild(neighborNode);
                    queue.push(neighborNode); //enqueue
                    visited.add(neighborKey);
                }
            }
        }
        return [];
    }
}

export default BFSPathfinder;