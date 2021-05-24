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
        //fifo queue to store points we haven't yet visited
        const frontier: Node[] = [];
        //stores points we have already visited + points on frontier so we don't visit them more than once
        const visited = new HashSet();
        //add the root to the frontier and start the algorithm
        const root = new Node(grid.get(initial));
        frontier.push(root); //enqueue
        visited.add(stringify(initial));
        //continues until points have been visited
        while(frontier.length !== 0) { //not empty
            const currentNode = frontier.shift()!; //dequeue
            const currentPoint = currentNode.tile.point;
            this.addRecent(currentNode);
            //check if we're found the solution
            if(this.navigator.equals(currentPoint, goal)) {
                return reconstructPath(currentNode);
            }
            for(const neighbor of this.navigator.neighbors(currentPoint)) {
                const neighborKey = stringify(neighbor.point);
                //point hasn't been visited, we can add it to frontier
                if(!visited.has(neighborKey)) {
                    const neighborNode = new Node(neighbor);
                    currentNode.addChild(neighborNode);
                    frontier.push(neighborNode); //enqueue
                    visited.add(neighborKey);
                }
            }
        }
        //checked all possible paths: no solution was found
        return [];
    }
}

export default BFSPathfinder;