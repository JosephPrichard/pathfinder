import React from 'react';
import './Navbar.css'
import Checkbox from '../utility/Checkbox';
import SteppedRangeSlider from '../utility/SteppedRangeSlider';
import RadioButtonGroup from '../utility/RadioButtonGroup';

interface VisualProps {
    onChangeViz: () => void,
    onChangeShowArrows: () => void,
    disabled: boolean
}

interface SpeedProps {
    onChange: (value: number) => void,
    initialSpeed: number
}

interface SpeedState {
    speedText: string
}

interface AlgorithmProps {
    onChangeBidirectional: (checked: boolean) => void,
    disabled: boolean
}

interface HeuristicProps {
    onClickManhattan: () => void,
    onClickEuclidean: () => void,
    onClickChebyshev: () => void,
    onClickOctile: () => void,
    disabled: boolean
}

const SPEED_STEP = 2;
const SPEED_INITIAL = 2;
const MAX = 19;

export class VisualSettings extends React.Component<VisualProps>
{
    render() {
        return (
            <div>
                <div className='draggable-content-title'>Visualization</div>
                <Checkbox defaultChecked={true} boxStyle='box'
                          onChange={this.props.onChangeViz}>
                    Show Frontier
                </Checkbox>
                <Checkbox defaultChecked={true} boxStyle='box'
                          onChange={this.props.onChangeShowArrows}
                          disabled={this.props.disabled}>
                    Show Tree
                </Checkbox>
            </div>
        );
    }
}

export class SpeedSettings extends React.Component<SpeedProps, SpeedState>
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
    onChangeSpeed = (value: number) => {
        const speed = SPEED_INITIAL + SPEED_STEP * value;
        this.setState({
            speedText: String(speed)
        })
        this.props.onChange(speed);
    }

    render() {
        const options: JSX.Element[] = [];
        for(let i = 1; i <= MAX; i++) {
            options.push(<option key={'option ' + i}>{i}</option>);
        }
        return (
            <div className='slider-container'>
                <div className='slider-text'>
                    Speed: <div className='speed-text'> {this.state.speedText} </div>
                </div>
                    <SteppedRangeSlider min={1} max={MAX} step={1}
                                        default={(this.props.initialSpeed - SPEED_INITIAL) / SPEED_STEP}
                                        sliderStyle='slider speed-slider'
                                        onChange={this.onChangeSpeed}
                />
                <datalist id='step-list'>
                    {options}
                </datalist>
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
                <Checkbox defaultChecked={false} boxStyle='box'
                          disabled={this.props.disabled}
                          onChange={this.props.onChangeBidirectional}>
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

    disable = () => {
        this.setState({
            disabled: true
        })
    }

    enable = () => {
        this.setState({
            disabled: false
        })
    }

    render() {
        return (
            <div>
                <div className='draggable-content-title'>Heuristic</div>
                <RadioButtonGroup boxStyle='box'
                                  defaultChecked={1}
                                  disabled={this.props.disabled}
                                  onChange={[
                                      this.props.onClickManhattan, this.props.onClickEuclidean,
                                      this.props.onClickChebyshev, this.props.onClickOctile
                                  ]}
                >
                    {[<span key='Manhattan'>Manhattan</span>, <span key='Euclidean'>Euclidean</span>,
                        <span key='Chebyshev'>Chebyshev</span>, <span key='Octile<'>Octile</span>]}
                </RadioButtonGroup>
            </div>
        )
    }
}