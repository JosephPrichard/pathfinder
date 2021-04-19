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
        const frontier: Node[] = []; //fifo, stores nodes on the frontier
        const visited = new HashSet();
        const root = new Node(grid.get(initial));
        frontier.push(root); //enqueue
        visited.add(stringify(initial));
        while(frontier.length !== 0) { //not empty
            const currentNode = frontier.shift()!; //dequeue
            const currentPoint = currentNode.tile.point;
            this.addRecent(currentNode);
            if(this.navigator.equals(currentPoint, goal)) {
                return reconstructPath(currentNode);
            }
            for(const neighbor of this.navigator.neighbors(currentPoint)) {
                const neighborKey = stringify(neighbor.point);
                if(!visited.has(neighborKey)) {
                    const neighborNode = new Node(neighbor);
                    currentNode.addChild(neighborNode);
                    frontier.push(neighborNode); //enqueue
                    visited.add(neighborKey);
                }
            }
        }
        return [];
    }
}

export default BFSPathfinder;