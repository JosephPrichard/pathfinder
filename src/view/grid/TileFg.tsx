import React from 'react';
import './Grid.css';
import {Point} from '../../pathfinding/core/Components';

interface TileProps {
    tileWidth: number,
    point: Point,
    color: string,
}

class TileFg extends React.Component<TileProps>
{
    shouldComponentUpdate(nextProps: Readonly<TileProps>) {
        const prevPoint = this.props.point;
        const nextPoint = nextProps.point;
        return prevPoint.y !== nextPoint.y ||
            prevPoint.x !== nextPoint.x;
    }

    render() {
        const size = this.props.tileWidth
        const top = this.props.point.y * this.props.tileWidth;
        const left = this.props.point.x * this.props.tileWidth;
        return (
            <div style={{
                position: 'absolute',
                width: size,
                height: size,
                top: top,
                left: left,
                backgroundColor: this.props.color,
                display: 'block',
                borderColor: this.props.color
            }} className={'svg-tile tile-fg'}/>
        );
    }
}

export default TileFg;