import TerrainGenerator from './TerrainGenerator';
import {Point, TileData} from '../core/Components';
import RectGrid from '../core/Grid';

class TerrainRandomGenerator extends TerrainGenerator
{
    // eslint-disable-next-line @typescript-eslint/no-useless-constructor
    constructor(width: number, height: number, tileData?: TileData, ignore?: Point[]) {
        super(width, height, tileData, ignore);
    }

    /**
     * Performs a random terrain generation algorithm where each tile has a 1/4
     * chance of being solid
     * @param topLeft optional parameter to specify what point the terrain should start from
     *  This should not be further up/left than (1,1)
     * @param bottomRight optional parameter to specify how far down and right the terrain will go
     *  This should not be further right/down than (width-2,height-2)
     */
    generateTerrain(topLeft?: Point, bottomRight?: Point) {
        const grid = new RectGrid(this.width, this.height);
        if(topLeft === undefined) {
            topLeft = {
                x: 1, y: 1
            }
        }
        if(bottomRight === undefined) {
            bottomRight = {
                x: grid.getWidth()-2,
                y: grid.getHeight()-2
            }
        }
        for(let x = topLeft.x - 1; x <= bottomRight.x + 1; x++) {
            for(let y = topLeft.y - 1; y <= bottomRight.y + 1; y++) {
                if(getRand(0, 3) === 0) {
                    this.draw(grid,{
                        point: {
                            x: x, y: y
                        },
                        data: this.getTerrain()
                    });
                }
            }
        }
        return grid;
    }
}

/**
 * Generate a random number between min and max, inclusive for min and max
 * @param min
 * @param max
 */
function getRand(min: number, max: number) {
    return Math.floor(Math.random() * (max+1-min) + min);
}

export default TerrainRandomGenerator;