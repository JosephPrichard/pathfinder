/**
 * Represents a point in 2d space
 * Immutable
 */
export interface Point
{
    readonly x: number;
    readonly y: number;
}

/**
 * Represents the data inside a tile
 * Solid tiles cannot be passed while non solid ones can
 * pathCost stores how expensive it is to travel to the tile if it isn't solid
 * Immutable
 */
export interface TileData
{
    readonly pathCost: number;
    readonly isSolid: boolean;
}

/**
 * Represents a tile on the Grid
 */
export interface Tile
{
    data: TileData;
    readonly point: Point;
}

/**
 * Simple function to create a solid tile with path cost of 1
 * @param isSolid
 */
export function createTileData(isSolid: boolean): TileData {
    return {
        pathCost: 1,
        isSolid: isSolid
    }
}

