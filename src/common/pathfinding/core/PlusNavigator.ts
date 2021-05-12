import {Point, Tile} from './Components';
import Navigator, {UNIT} from './Navigator';

/**
 * Concretion of a Plus Navigator for a grid
 * Allows movement akin to a 'plus' symbol
 */
class PlusNavigator extends Navigator
{
    /**
     * Adds the neighbors of a point to the left, right, top and down
     * @param point
     */
    neighbors(point: Point) {
        const tiles: Tile[] = [];
        if(point.x + UNIT < this.grid.getWidth()) {
            const tile = this.grid.get({
                x: point.x + UNIT,
                y: point.y
            })
            if(!tile.data.isSolid) {
                tiles.push(tile);
            }
        }
        if(point.y + UNIT < this.grid.getHeight()) {
            const tile = this.grid.get({
                x: point.x,
                y: point.y + UNIT
            });
            if(!tile.data.isSolid) {
                tiles.push(tile);
            }
        }
        if(point.x - UNIT >= 0) {
            const tile = this.grid.get({
                x: point.x - UNIT,
                y: point.y
            });
            if(!tile.data.isSolid) {
                tiles.push(tile);
            }
        }
        if(point.y - UNIT >= 0) {
            const tile = this.grid.get({
                x: point.x,
                y: point.y - UNIT
            });
            if(!tile.data.isSolid) {
                tiles.push(tile);
            }
        }
        return tiles;
    }

    /**
     * Step cost function that works by getting the pathCost stored in the grid
     * from one point a to b
     * @param a
     * @param b to point to travel to
     */
    cost(a: Point, b: Point) {
        return this.grid.get(b).data.pathCost;
    }

    getType() {
        return 'plus';
    }
}

export default PlusNavigator;