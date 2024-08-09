import { createTileData, Grid, Point, RectGrid, Tile, TileData } from "./Core";
import { PointSet } from "./Structures";

const LIMIT = 2;

export const NO_SKEW = 0;
export const VERTICAL_SKEW = 1;
export const HORIZONTAL_SKEW = 2;

export abstract class TerrainGenerator {
    protected readonly width: number;
    protected readonly height: number;
    protected readonly ignore: PointSet;
    protected readonly data: TileData;

    protected constructor(width: number, height: number, data?: TileData, ignore?: Point[]) {
        this.width = width;
        this.height = height;
        this.ignore = new PointSet(width, height);
        if (data !== undefined) {
            this.data = data;
        } else {
            this.data = createTileData(true);
        }
        if (ignore !== undefined) {
            for (const i of ignore) {
                this.ignore.add(i);
            }
        }
    }

    abstract generateTerrain(topLeft?: Point, bottomRight?: Point): Grid;

    protected draw(grid: Grid, tile: Tile) {
        if (!this.shouldIgnore(tile.point)) {
            grid.mutateTile(tile);
        }
    }

    protected getTerrain() {
        return this.data;
    }

    protected getSolid() {
        return {
            pathCost: 1,
            isSolid: true,
        };
    }

    protected shouldIgnore(point: Point) {
        return this.ignore.has(point);
    }
}

interface Chamber {
    topLeft: Point; // min
    bottomRight: Point; // max
}

export class TerrainMazeGenerator extends TerrainGenerator {
    private readonly divideWidth: (width: number, height: number) => boolean;

    constructor(width: number, height: number, tileData?: TileData, ignore?: Point[], slant?: number) {
        super(width, height, tileData, ignore);
        if (slant === undefined || slant === NO_SKEW) {
            this.divideWidth = (width: number, height: number) => width >= height;
        } else if (slant === VERTICAL_SKEW) {
            this.divideWidth = (width: number, height: number) => width * 2 >= height;
        } else if (slant === HORIZONTAL_SKEW) {
            this.divideWidth = (width: number, height: number) => width >= height * 2;
        } else {
            throw new Error("Invalid recursive maze division skew type");
        }
    }

    static widthOf(chamber: Chamber) {
        return chamber.bottomRight.x - chamber.topLeft.x + 1;
    }

    static heightOf(chamber: Chamber) {
        return chamber.bottomRight.y - chamber.topLeft.y + 1;
    }

    static canDrawHole(tile: Tile) {
        return tile.data.pathCost === 1 && !tile.data.isSolid;
    }

    generateTerrain(topLeft?: Point, bottomRight?: Point) {
        const grid = new RectGrid(this.width, this.height);

        if (topLeft === undefined) {
            topLeft = { x: 1, y: 1 };
        }
        if (bottomRight === undefined) {
            bottomRight = { x: grid.getWidth() - 2, y: grid.getHeight() - 2 };
        }

        for (let x = topLeft.x - 1; x <= bottomRight.x + 1; x++) {
            this.draw(grid, {
                point: { x: x, y: topLeft.y - 1 },
                data: this.getSolid(),
            });
            this.draw(grid, {
                point: { x: x, y: bottomRight.y + 1 },
                data: this.getSolid(),
            });
        }

        for (let y = topLeft.y - 1; y <= bottomRight.y + 1; y++) {
            this.draw(grid, {
                point: { x: topLeft.x - 1, y: y },
                data: this.getSolid(),
            });
            this.draw(grid, {
                point: { x: bottomRight.x + 1, y: y },
                data: this.getSolid(),
            });
        }

        this.divide(grid, { topLeft, bottomRight });
        return grid;
    }

    divide(grid: Grid, chamber: Chamber) {
        const width = TerrainMazeGenerator.widthOf(chamber);
        const height = TerrainMazeGenerator.heightOf(chamber);
        const min = chamber.topLeft;
        const max = chamber.bottomRight;

        if (this.divideWidth(width, height)) {
            if (width > LIMIT) {
                const randX = getMidPoint(min.x, max.x);

                const toDraw: Tile[] = [];
                for (let y = min.y; y <= max.y; y++) {
                    toDraw.push({
                        point: { x: randX, y: y },
                        data: this.getTerrain(),
                    });
                }

                let edgeBlocked = false;

                let tile = grid.get({ x: randX, y: min.y - 1 });
                if (TerrainMazeGenerator.canDrawHole(tile)) {
                    toDraw.push({
                        point: { x: randX, y: min.y },
                        data: createTileData(false),
                    });
                    edgeBlocked = true;
                }

                tile = grid.get({ x: randX, y: max.y + 1 });
                if (TerrainMazeGenerator.canDrawHole(tile)) {
                    toDraw.push({
                        point: { x: randX, y: max.y },
                        data: createTileData(false),
                    });
                    edgeBlocked = true;
                }

                if (!edgeBlocked) {
                    const randY = getRand(min.y, max.y);
                    toDraw.push({
                        point: { x: randX, y: randY },
                        data: createTileData(false),
                    });
                }
                this.drawArr(grid, toDraw);

                const leftChamber = {
                    topLeft: chamber.topLeft,
                    bottomRight: { x: randX - 1, y: chamber.bottomRight.y },
                };
                const rightChamber = {
                    topLeft: { x: randX + 1, y: chamber.topLeft.y },
                    bottomRight: chamber.bottomRight,
                };
                this.divide(grid, leftChamber);
                this.divide(grid, rightChamber);
            }
        } else {
            if (height > LIMIT) {
                const randY = getMidPoint(min.y, max.y);

                const toDraw: Tile[] = [];
                for (let x = min.x; x <= max.x; x++) {
                    toDraw.push({
                        point: { x: x, y: randY },
                        data: this.getTerrain(),
                    });
                }

                let edgeBlocked = false;

                let tile = grid.get({ x: min.x - 1, y: randY });
                if (TerrainMazeGenerator.canDrawHole(tile)) {
                    toDraw.push({
                        point: { x: min.x, y: randY },
                        data: createTileData(false),
                    });
                    edgeBlocked = true;
                }

                tile = grid.get({ x: max.x + 1, y: randY });
                if (TerrainMazeGenerator.canDrawHole(tile)) {
                    toDraw.push({
                        point: { x: max.x, y: randY },
                        data: createTileData(false),
                    });
                    edgeBlocked = true;
                }

                if (!edgeBlocked) {
                    const randX = getRand(min.x, max.x);
                    toDraw.push({
                        point: { x: randX, y: randY },
                        data: createTileData(false),
                    });
                }

                this.drawArr(grid, toDraw);

                const topChamber = {
                    topLeft: chamber.topLeft,
                    bottomRight: { x: chamber.bottomRight.x, y: randY - 1 },
                };
                const bottomChamber = {
                    topLeft: { x: chamber.topLeft.x, y: randY + 1 },
                    bottomRight: chamber.bottomRight,
                };

                this.divide(grid, topChamber);
                this.divide(grid, bottomChamber);
            }
        }
    }

    private drawArr(grid: Grid, tiles: Tile[]) {
        for (const tile of tiles) this.draw(grid, tile);
    }
}

function getRand(min: number, max: number) {
    return Math.floor(Math.random() * (max + 1 - min) + min);
}

function getMidPoint(min: number, max: number) {
    const range = max - min;
    if (range >= 20) {
        return ((min + max) / 2) >> 0;
    } else if (range > 5) {
        const mid = ((min + max) / 2) >> 0;
        const points = [mid, mid + 1];
        return points[getRand(0, points.length - 1)];
    } else {
        return getRand(min + 1, max - 1);
    }
}

export class TerrainRandomGenerator extends TerrainGenerator {
    // eslint-disable-next-line @typescript-eslint/no-useless-constructor
    constructor(width: number, height: number, tileData?: TileData, ignore?: Point[]) {
        super(width, height, tileData, ignore);
    }

    generateTerrain(topLeft?: Point, bottomRight?: Point) {
        const grid = new RectGrid(this.width, this.height);
        if (topLeft === undefined) {
            topLeft = { x: 1, y: 1 };
        }
        if (bottomRight === undefined) {
            bottomRight = {
                x: grid.getWidth() - 2,
                y: grid.getHeight() - 2,
            };
        }
        for (let x = topLeft.x - 1; x <= bottomRight.x + 1; x++) {
            for (let y = topLeft.y - 1; y <= bottomRight.y + 1; y++) {
                if (getRand(0, 3) === 0) {
                    this.draw(grid, {
                        point: { x: x, y: y },
                        data: this.getTerrain(),
                    });
                }
            }
        }
        return grid;
    }
}
