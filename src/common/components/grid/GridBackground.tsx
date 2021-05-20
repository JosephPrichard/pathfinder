import React from 'react';
import {Point} from '../../pathfinding/core/Components';

interface IProps {
    tileWidth: number,
    width: number,
    height: number
}

/**
 * A component for a grid with specific width and height proportions
 */
class GridBackground extends React.Component<IProps>
{
    private readonly tileWidth: number;

    /**
     * Constructs a GridVisualization with immutable height and width
     * @param props
     */
    constructor(props: IProps) {
        super(props);
        this.tileWidth = this.props.tileWidth;
    }

    componentDidUpdate(prevProps: IProps) {
        return this.props.width !== prevProps.width ||
            this.props.height !== prevProps.height;
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
        for(let y = 0; y < this.props.height; y++) {
            const row: JSX.Element[] = [];
            for(let x = 0; x < this.props.width; x++) {
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

export default GridBackground;