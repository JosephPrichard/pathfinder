/*
 * Copyright (c) Joseph Prichard 2022.
 */

import React from 'react';
import { Point } from '../pathfinding/Core';

interface Props {
    tileWidth: number,
    width: number,
    height: number
}

class GridBackground extends React.Component<Props>
{
    private readonly tileWidth: number;

    constructor(props: Props) {
        super(props);
        this.tileWidth = this.props.tileWidth;
    }

    componentDidUpdate(prevProps: Props) {
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