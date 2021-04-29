import Pathfinder, {reconstructPath} from './Pathfinder';
import {Point, Tile} from '../core/Components';
import {HashSet, stringify} from '../structures/Hash';
import {Node} from './Node';
import Stack from '../structures/Stack';

class DFSPathfinder extends Pathfinder
{
    getAlgorithmName(): string {
        return 'Depth First Search';
    }

    /**
     * Calls DFS between a start and goal point, will typically not find the 'Best' path,
     * and will instead find the best path capable for the algorithm
     * As this algorithm is non optimal it should only be used for educational purposes
     * @param initial
     * @param goal
     */
    findPath(initial: Point, goal: Point): Tile[] {
        this.clearRecentSearch();
        const grid = this.navigator.getGrid();
        const root = new Node(grid.get(initial));
        const frontier = new Stack<Node>();
        frontier.push(root);
        const visited = new HashSet();
        while(!frontier.isEmpty()) {
            const currentNode = frontier.pop()!;
            const currentPoint = currentNode.tile.point;
            visited.add(stringify(currentPoint));
            this.addRecent(currentNode);
            if(this.navigator.equals(currentPoint, goal)) {
                return reconstructPath(currentNode);
            }
            const neighbors = this.navigator.neighbors(currentPoint).reverse();
            for(const neighbor of neighbors){
                const neighborKey = stringify(neighbor.point);
                if(!visited.has(neighborKey)) {
                    const neighborNode = new Node(neighbor);
                    currentNode.addChild(neighborNode);
                    frontier.push(neighborNode);
                }
            }
        }
        return [];
    }
}

export default DFSPathfinder;
