import Pathfinder, {reconstructPath} from './Pathfinder';
import {Point, Tile} from '../core/Components';
import {HashSet, stringify} from '../structures/Hash';
import {Node} from './Node';
import Stack from '../structures/Stack';

class DFSPathfinder extends Pathfinder
{
    /**
     * Calls DFS between a start and goal point, will typically not find the 'Best' path,
     * and will instead find the best path capable for the algorithm
     * As this algorithm is non optimal it should only be used for educational purposes
     * @param initial
     * @param goal
     */
    findPath(initial: Point, goal: Point): Tile[] {
        this.clearRecentSearch();
        let grid = this.navigator.getGrid();
        let root = new Node(grid.get(initial));
        const stack = new Stack<Node>();
        stack.push(root);
        const visited = new HashSet();
        visited.add(stringify(initial));
        while(!stack.isEmpty()) {
            const currentNode = stack.pop()!;
            this.addRecent(currentNode);
            const currentPoint = currentNode.tile.point;
            if(this.navigator.equals(currentPoint, goal)) {
                return reconstructPath(currentNode);
            }
            let neighbors = this.navigator.neighbors(currentPoint).reverse();
            for(const neighbor of neighbors){
                let neighborKey = stringify(neighbor.point);
                if(!visited.has(neighborKey)) {
                    const neighborNode = new Node(neighbor);
                    currentNode.addChild(neighborNode);
                    stack.push(neighborNode);
                    visited.add(neighborKey);
                }
            }
        }
        return [];
    }
}

export default DFSPathfinder;
