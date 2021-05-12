import React from 'react';
import {Point} from '../../pathfinding/core/Components';

interface TileProps {
    tileWidth: number,
    point: Point,
    color: string,
}

class TileFg extends React.Component<TileProps>
{
    render() {
        const size = this.props.tileWidth
        const top = this.props.point.y * this.props.tileWidth;
        const left = this.props.point.x * this.props.tileWidth;
        return (
            <div
                style={{
                    position: 'absolute',
                    width: size,
                    height: size,
                    top: top,
                    left: left,
                    backgroundColor: this.props.color,
                    display: 'block',
                    borderColor: this.props.color
                }}
                className={'svg-tile tile-fg'}
            />
        );
    }
}

export default TileFg;