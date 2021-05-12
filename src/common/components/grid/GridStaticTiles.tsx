import React from 'react';
import {Point} from '../../pathfinding/core/Components';

interface IProps {
    tileWidth: number,
    tilesX: number,
    tilesY: number
}

/**
 * A component for a grid with specific width and height proportions
 */
class GridStaticTiles extends React.Component<IProps>
{
    private readonly width: number;
    private readonly height: number;
    private readonly tileWidth: number;

    /**
     * Constructs a GridBackground with immutable height and width
     * @param props
     */
    constructor(props: IProps) {
        super(props);
        this.width = this.props.tilesX;
        this.height = this.props.tilesY;
        this.tileWidth = this.props.tileWidth;
    }

    //should only render once, and never again
    componentDidUpdate() {
        return false;
    }

    render() {
        return (
            <div>
                <div className='bg'>
                    {this.renderTiles()}
                </div>
            </div>
        );
    }

    renderTiles() {
        const tiles: JSX.Element[][] = [];
        for(let y = 0; y < this.height; y++) {
            const row: JSX.Element[] = [];
            for(let x = 0; x < this.width; x++) {
                const point = {
                    x: x, y: y
                };
                row.push(
                    this.renderTile(point)
                );
            }
            tiles.push(row);
        }
        return tiles;
    }

    renderTile(point: Point) {
        const width = this.tileWidth;
        const top = point.y * this.tileWidth;
        const left = point.x * this.tileWidth;
        const style = {
            backgroundColor: 'white',
            width: width + 'px',
            height: width + 'px',
            top: top,
            left: left
        };
        return (
            <div
                key={point.x + ',' + point.y}
                style={style}
                className='tile'
            />
        );
    }
}

export default GridStaticTiles;