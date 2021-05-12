import Pathfinder, {reconstructPath} from './Pathfinder';
import {Node} from './Node';
import {Point} from '../core/Components';
import {HashSet, stringify} from '../structures/Hash';

class BFSPathfinder extends Pathfinder
{
    getAlgorithmName() {
        return 'Breadth First Search';
    }

    /**
     * Implementation of BFS to find the shortest path from initial to point
     * Doesn't always return the shortest path, and performs poorly on larger grids
     * @param initial
     * @param goal
     */
    findPath(initial: Point, goal: Point) {
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