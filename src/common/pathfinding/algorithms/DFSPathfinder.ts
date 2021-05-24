import Pathfinder, {reconstructPath} from './Pathfinder';
import {Node} from './Node';
import {Point} from '../core/Components';
import {HashSet, stringify} from '../structures/Hash';
import Stack from '../structures/Stack';

class DFSPathfinder extends Pathfinder
{
    getAlgorithmName() {
        return 'Depth First Search';
    }

    /**
     * Calls DFS between a start and goal point, will typically not find the 'Best' path,
     * and will instead find the best path capable for the algorithm
     * As this algorithm is non optimal it should only be used for educational purposes
     * @param initial
     * @param goal
     */
    findPath(initial: Point, goal: Point) {
        this.clearRecentSearch();
        const grid = this.navigator.getGrid();
        const root = new Node(grid.get(initial));
        //lifo stack as control structure for frontier
        const frontier = new Stack<Node>();
        //stores points we have already visited so we don't visit them again
        const visited = new HashSet();
        //add the root to the frontier and start the algorithm
        frontier.push(root);
        while(!frontier.isEmpty()) {
            const currentNode = frontier.pop()!;
            const currentPoint = currentNode.tile.point;
            visited.add(stringify(currentPoint));
            this.addRecent(currentNode);
            //check if we're found the solution
            if(this.navigator.equals(currentPoint, goal)) {
                return reconstructPath(currentNode);
            }
            //neighbors are added in reverse order for a more coherent visualization
            for(const neighbor of this.navigator.neighbors(currentPoint).reverse()) {
                const neighborKey = stringify(neighbor.point);
                //point hasn't been visited, we can add it to frontier
                if(!visited.has(neighborKey)) {
                    const neighborNode = new Node(neighbor);
                    currentNode.addChild(neighborNode);
                    frontier.push(neighborNode);
                }
            }
        }
        //checked all possible paths: no solution was found
        return [];
    }
}

export default DFSPathfinder;
