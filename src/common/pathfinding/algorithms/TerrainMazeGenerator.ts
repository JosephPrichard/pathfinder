import TerrainGenerator from './TerrainGenerator';
import RectGrid, {Grid} from '../core/Grid';
import {createTileData, Point, Tile, TileData} from '../core/Components';

const LIMIT = 2;

export const NO_SKEW = 0;
export const VERTICAL_SKEW = 1;
export const HORIZONTAL_SKEW = 2;

interface Chamber {
    topLeft: Point; //min
    bottomRight: Point; //max
}

class TerrainMazeGenerator extends TerrainGenerator
{
    private readonly divideWidth: (width: number, height: number) => boolean;

    constructor(width: number, height: number, tileData?: TileData, ignore?: Point[], slant?: number) {
        super(width, height, tileData, ignore);
        if(slant === undefined || slant === NO_SKEW) {
            this.divideWidth = divideWidthNoSkew;
        } else if(slant === VERTICAL_SKEW) {
            this.divideWidth = divideWidthVSkew;
        } else if(slant === HORIZONTAL_SKEW) {
            this.divideWidth = divideWidthHSkew;
        } else {
            throw new Error("Invalid recursive maze division skew type");
        }
    }

    /**
     * Performs the recursive division maze generation algorithm on a new empty grid
     * by bisecting parts until the maze can no longer be bisected
     * Params must be within bounds and create a chamber
     * @param topLeft optional parameter to specify what point the maze should start from
     *  This should not be further up/left than (1,1)
     * @param bottomRight optional parameter to specify how far down and right the maze will go
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
            this.draw(grid,{
                point: {
                    x: x, y: topLeft.y - 1
                },
                data: this.getSolid()
            });
            this.draw(grid,{
                point: {
                    x: x, y: bottomRight.y + 1
                },
                data: this.getSolid()
            });
        }
        for(let y = topLeft.y - 1; y <= bottomRight.y + 1; y++) {
            this.draw(grid,{
                point: {
                    x: topLeft.x - 1, y: y
                },
                data: this.getSolid()
            });
            this.draw(grid,{
                point: {
                    x: bottomRight.x + 1, y: y
                },
                data: this.getSolid()
            });
        }
        this.divide(grid,{
            topLeft: topLeft,
            bottomRight: bottomRight,
        });
        return grid;
    }

    /**
     * Draws a list of tiles to the grid
     * @param grid
     * @param tiles
     */
    private drawArr(grid: Grid, tiles: Tile[]) {
        for(const tile of tiles) {
            this.draw(grid, tile);
        }
    }

    /**
     * Create a line between a region, with an open hole, in a chamber,
     * and call bisection algorithm on it, and call division algorithms on
     * its split chambers until no chambers can be bisected
     * @param grid
     * @param chamber
     */
    divide(grid: Grid, chamber: Chamber) {
        const width = widthOf(chamber);
        const height = heightOf(chamber);
        const min = chamber.topLeft;
        const max = chamber.bottomRight;
        if(this.divideWidth(width,height)) {
            if(width > LIMIT) {
                //calculate axis
                const randX = getMidPoint(
                    min.x, max.x
                );
                //create axis wall
                const toDraw: Tile[] = [];
                for(let y = min.y; y <= max.y; y++) {
                    toDraw.push({
                        point: {
                            x: randX, y: y
                        },
                        data: this.getTerrain()
                    });
                }
                //create holes in axis wall
                let edgeBlocked = false;
                if(canDrawHole(grid.get({
                    x: randX, y: min.y-1
                }))) {
                    toDraw.push({
                        point: {
                            x: randX, y: min.y
                        },
                        data: createTileData(false)
                    });
                    edgeBlocked = true;
                }
                if(canDrawHole(grid.get({
                    x: randX, y: max.y+1
                }))) {
                    toDraw.push({
                        point: {
                            x: randX, y: max.y
                        },
                        data: createTileData(false)
                    });
                    edgeBlocked = true;
                }
                if(!edgeBlocked) {
                    const randY = getRand(
                        min.y, max.y,
                    );
                    toDraw.push({
                        point: {
                            x: randX, y: randY
                        },
                        data: createTileData(false)
                    });
                }
                this.drawArr(grid, toDraw);
                //create children chambers and recurse
                const leftChamber = {
                    topLeft: chamber.topLeft,
                    bottomRight: {
                        x: randX-1,
                        y: chamber.bottomRight.y
                    },
                };
                const rightChamber = {
                    topLeft: {
                        x: randX+1,
                        y: chamber.topLeft.y
                    },
                    bottomRight: chamber.bottomRight,
                };
                this.divide(grid, leftChamber);
                this.divide(grid, rightChamber);
            }
        } else {
            if(height > LIMIT) {
                //calculate axis
                const randY = getMidPoint(
                    min.y, max.y
                );
                //draw axis wall
                const toDraw: Tile[] = [];
                for(let x = min.x; x <= max.x; x++) {
                    toDraw.push({
                        point: {
                            x: x, y: randY
                        },
                        data: this.getTerrain()
                    });
                }
                //create holes in axis wall
                let edgeBlocked = false;
                if(canDrawHole(grid.get({
                    x: min.x-1, y: randY
                }))) {
                    toDraw.push({
                        point: {
                            x: min.x, y: randY
                        },
                        data: createTileData(false)
                    });
                    edgeBlocked = true;
                }
                if(canDrawHole(grid.get({
                    x: max.x+1, y: randY
                }))) {
                    toDraw.push({
                        point: {
                            x: max.x, y: randY
                        },
                        data: createTileData(false)
                    });
                    edgeBlocked = true;
                }
                if(!edgeBlocked) {
                    const randX = getRand(
                        min.x, max.x,
                    );
                    toDraw.push({
                        point: {
                            x: randX, y: randY
                        },
                        data: createTileData(false)
                    });
                }
                this.drawArr(grid, toDraw);
                //create children chambers and recurse
                const topChamber = {
                    topLeft: chamber.topLeft,
                    bottomRight: {
                        x: chamber.bottomRight.x,
                        y: randY-1
                    },
                };
                const bottomChamber = {
                    topLeft: {
                        x: chamber.topLeft.x,
                        y: randY+1
                    },
                    bottomRight: chamber.bottomRight,
                };
                this.divide(grid, topChamber);
                this.divide(grid, bottomChamber);
            }
        }
    }
}

function divideWidthNoSkew(width: number, height: number) {
    return width >= height;
}

function divideWidthHSkew(width: number, height: number) {
    return width >= height * 2;
}

function divideWidthVSkew(width: number, height: number) {
    return width * 2 >= height;
}

function widthOf(chamber: Chamber) {
    return chamber.bottomRight.x - chamber.topLeft.x + 1;
}

function heightOf(chamber: Chamber) {
    return chamber.bottomRight.y - chamber.topLeft.y + 1;
}

function canDrawHole(tile: Tile) {
    return tile.data.pathCost === 1 && !tile.data.isSolid;
}

/**
 * Returns the 'midpoint' to be used
 * @param min
 * @param max
 */
function getMidPoint(min: number, max: number) {
    const range = max - min;
    if(range >= 20) {
        return ((min+max)/2) >> 0;
    } else if(range > 5) {
        const mid = ((min+max)/2) >> 0;
        const points = [mid, mid+1];
        return points[getRand(0,points.length-1)];
    } else {
        return getRand(min+1,max-1);
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

export default TerrainMazeGenerator;