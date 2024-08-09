/*
 * Copyright (c) Joseph Prichard 2022.
 */

import React from "react";
import Checkbox from "./Checkbox";
import RadioButtonGroup from "./RadioButtonGroup";
import SteppedButtonRange from "./SteppedButtonRange";

interface VisualProps {
    defaultShowArrows: boolean;
    onChangeShowArrows: () => void;
    disabledTree: boolean;
    disabledScore: boolean;
}

interface SpeedProps {
    onChange: (value: number) => void;
    initialSpeed: number;
}

interface AlgorithmProps {
    defaultAlg: boolean;
    onChangeBidirectional: (checked: boolean) => void;
    disabled: boolean;
}

interface HeuristicProps {
    defaultHeuristic: string;
    onClickManhattan: () => void;
    onClickEuclidean: () => void;
    onClickChebyshev: () => void;
    onClickOctile: () => void;
    disabled: boolean;
}

export const SPEED_STEP = 5;
export const SPEED_MIN = 5;
export const SPEED_MAX = 200;

export function VisualSettings(props: VisualProps) {
    return (
        <div>
            <div className="draggable-content-title">Visualization</div>
            <Checkbox defaultChecked={props.defaultShowArrows} boxStyle="box" onChange={props.onChangeShowArrows} disabled={props.disabledTree}>
                Show Tree
            </Checkbox>
        </div>
    );
}

export class SpeedSettings extends React.Component<SpeedProps> {
    constructor(props: SpeedProps) {
        super(props);
        this.state = {
            speedText: String(this.props.initialSpeed),
        };
    }

    onChangeSpeed(value: number) {
        this.props.onChange(value);
    }

    render() {
        return (
            <div className="slider-container">
                <div className="slider-text">Period</div>
                <SteppedButtonRange
                    min={SPEED_MIN}
                    max={SPEED_MAX}
                    step={SPEED_STEP}
                    default={this.props.initialSpeed}
                    sliderStyle="slider speed-slider"
                    onChange={(value: number) => this.onChangeSpeed(value)}
                />
                <div className="slider-text slider-text-after">ms</div>
            </div>
        );
    }
}

export function AlgorithmSettings(props: AlgorithmProps) {
    return (
        <div>
            <div className="draggable-content-title">Algorithm</div>
            <Checkbox defaultChecked={props.defaultAlg} boxStyle="box" disabled={props.disabled} onChange={props.onChangeBidirectional}>
                Bidirectional
            </Checkbox>
        </div>
    );
}

function getIndex(key: string) {
    switch (key) {
        case "manhattan":
            return 0;
        case "euclidean":
            return 1;
        case "chebyshev":
            return 2;
        case "octile":
            return 3;
        default:
            return 0;
    }
}

export function HeuristicSettings(props: HeuristicProps) {
    const index = getIndex(props.defaultHeuristic);
    return (
        <div>
            <div className="draggable-content-title">Heuristic</div>
            <RadioButtonGroup
                boxStyle="box"
                defaultChecked={index}
                disabled={props.disabled}
                onChange={[props.onClickManhattan, props.onClickEuclidean, props.onClickChebyshev, props.onClickOctile]}
            >
                <span key="Manhattan">Manhattan</span>
                <span key="Euclidean">Euclidean</span>
                <span key="Chebyshev">Chebyshev</span>
                <span key="Octile<">Octile</span>
            </RadioButtonGroup>
        </div>
    );
}
