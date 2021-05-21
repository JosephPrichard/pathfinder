import React from 'react';
import Checkbox from './Checkbox';
import RadioButtonGroup from './RadioButtonGroup';
import SteppedButtonRange from './SteppedButtonRange';

interface VisualProps {
    defaultShowArrows: boolean,
    onChangeShowArrows: () => void,
    disabledTree: boolean,
    disabledScore: boolean
}

interface SpeedProps {
    onChange: (value: number) => void,
    initialSpeed: number
}

interface AlgorithmProps {
    defaultAlg: boolean,
    onChangeBidirectional: (checked: boolean) => void,
    disabled: boolean
}

interface HeuristicProps {
    defaultHeuristic: string
    onClickManhattan: () => void,
    onClickEuclidean: () => void,
    onClickChebyshev: () => void,
    onClickOctile: () => void,
    disabled: boolean
}

const SPEED_STEP = 5;
const SPEED_MIN = 15;
const SPEED_MAX = 200;

export class VisualSettings extends React.Component<VisualProps>
{
    render() {
        return (
            <div>
                <div className='draggable-content-title'>Visualization</div>
                <Checkbox
                    defaultChecked={this.props.defaultShowArrows}
                    boxStyle='box'
                    onChange={this.props.onChangeShowArrows}
                    disabled={this.props.disabledTree}
                >
                    Show Tree
                </Checkbox>
            </div>
        );
    }
}

export class SpeedSettings extends React.Component<SpeedProps>
{
    constructor(props: SpeedProps) {
        super(props);
        this.state = {
            speedText: String(this.props.initialSpeed)
        }
    }

    /**
     * Callback function to be called when slider is changed
     * Call another callback and change text
     * @param value
     */
    onChangeSpeed(value: number) {
        this.props.onChange(value);
    }

    render() {
        return (
            <div className='slider-container'>
                <div className='slider-text'>
                    Period
                </div>
                <SteppedButtonRange
                    min={SPEED_MIN}
                    max={SPEED_MAX}
                    step={SPEED_STEP}
                    default={this.props.initialSpeed}
                    sliderStyle='slider speed-slider'
                    onChange={(value: number) => this.onChangeSpeed(value)}
                />
            </div>
        );
    }
}

export class AlgorithmSettings extends React.Component<AlgorithmProps>
{
    constructor(props: AlgorithmProps) {
        super(props);
        this.state = {
            disabled: false
        }
    }

    render() {
        return (
            <div>
                <div className='draggable-content-title'>Algorithm</div>
                <Checkbox
                    defaultChecked={this.props.defaultAlg}
                    boxStyle='box'
                    disabled={this.props.disabled}
                    onChange={this.props.onChangeBidirectional}
                >
                    Bidirectional
                </Checkbox>
            </div>
        );
    }
}

export class HeuristicSettings extends React.Component<HeuristicProps>
{
    constructor(props: HeuristicProps) {
        super(props);
        this.state = {
            disabled: false
        }
    }

    disable() {
        this.setState({
            disabled: true
        })
    }

    enable() {
        this.setState({
            disabled: false
        })
    }

    getIndex(heuristic: string) {
        const mapping: {[key: string]: number} = {
            'manhattan': 0,
            'euclidean': 1,
            'chebyshev': 2,
            'octile': 3
        }
        return mapping[heuristic];
    }

    render() {
        return (
            <div>
                <div className='draggable-content-title'>Heuristic</div>
                <RadioButtonGroup
                    boxStyle='box'
                    defaultChecked={this.getIndex(this.props.defaultHeuristic)}
                    disabled={this.props.disabled}
                    onChange={[
                        this.props.onClickManhattan, this.props.onClickEuclidean,
                        this.props.onClickChebyshev, this.props.onClickOctile
                    ]}
                >
                    <span key='Manhattan'>Manhattan</span>
                    <span key='Euclidean'>Euclidean</span>
                    <span key='Chebyshev'>Chebyshev</span>
                    <span key='Octile<'>Octile</span>
                </RadioButtonGroup>
            </div>
        )
    }
}