import React from 'react';
import {Point} from '../../pathfinding/core/Components';

interface SolidProps {
    tileSize: number,
    point: Point,
    doTileAnimation: boolean
}

class SolidFg extends React.Component<SolidProps>
{
    private readonly doTileAnimation: boolean;

    constructor(props: SolidProps) {
        super(props)
        this.doTileAnimation = this.props.doTileAnimation;
    }

    render() {
        return (
            <div
                style={{
                    position: 'absolute',
                    left: this.props.point.x * this.props.tileSize,
                    top: this.props.point.y * this.props.tileSize,
                    width: this.props.tileSize,
                    height: this.props.tileSize
                }}
                className={this.doTileAnimation ? 'solid-animation' : 'solid'}
            />
        );
    }
}

export default SolidFg;