/*
 * Copyright (c) Joseph Prichard 2022.
 */

import React from 'react';
import Weight from '../assets/weight.svg';
import { Point } from '../pathfinding/Core';

interface Props {
    tileSize: number,
    point: Point,
    doTileAnimation: boolean
}

class WeightFg extends React.Component<Props>
{
    private readonly doTileAnimation: boolean;

    constructor(props: Props) {
        super(props)
        this.doTileAnimation = this.props.doTileAnimation;
    }

    render() {
        return (
            <div
                style={{
                    left: this.props.point.x * this.props.tileSize,
                    top: this.props.point.y * this.props.tileSize,
                    width: this.props.tileSize,
                    height: this.props.tileSize,
                    backgroundImage: `url(${Weight})`,
                    position: 'absolute'
                }}
                className={this.doTileAnimation ? 'weight-animation' : 'weight'}
            />
        );
    }
}

export default WeightFg;