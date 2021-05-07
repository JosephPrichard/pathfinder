import {Point} from '../../pathfinding/core/Components';
import React from 'react';
import Weight from '../web-content/weight.svg';

interface WeightProps {
    tileSize: number,
    point: Point,
    doTileAnimation: boolean,
    weightOpacity: number
}

class WeightFg extends React.Component<WeightProps>
{
    private readonly doTileAnimation: boolean;

    constructor(props: WeightProps) {
        super(props)
        this.doTileAnimation = this.props.doTileAnimation;
    }

    render() {
        return (
            <div style={{
                left: this.props.point.x * this.props.tileSize,
                top: this.props.point.y * this.props.tileSize,
                width: this.props.tileSize,
                height: this.props.tileSize,
                backgroundImage: `url(${Weight})`,
                opacity: this.props.weightOpacity,
                position: 'absolute'
            }}
                 className={this.doTileAnimation ? 'weight-animation' : 'weight'}
            />
        );
    }
}

export default WeightFg;