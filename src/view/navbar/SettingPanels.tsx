import React from 'react';
import Checkbox from '../elements/Checkbox';
import SteppedRangeSlider from '../elements/SteppedRangeSlider';
import RadioButtonGroup from '../elements/RadioButtonGroup';

interface VisualProps {
    onChangeViz: () => void;
}

export class VisualSettings extends React.Component<VisualProps>
{
    render() {
        return (
            <div>
                <div className='draggable-content-title'>Algorithm Visualization</div>
                <Checkbox defaultChecked={true} boxStyle='box'
                          onChange={this.props.onChangeViz}>
                    Show Visualization
                </Checkbox>
            </div>
        );
    }
}

interface SpeedProps {
    onChange: (value: number) => void
}

interface SpeedState {
    speedText: string
}

export class SpeedSettings extends React.Component<SpeedProps, SpeedState>
{
    constructor(props: SpeedProps) {
        super(props);
        this.state = {
            speedText: 'Medium'
        }
    }

    /**
     * Callback function to be called when slider is changed
     * Call another callback and change text
     * @param value
     */
    onChangeSpeed = (value: number) => {
        const speedTexts = ['Slowest', 'Slower', 'Medium', 'Faster', 'Fastest'];
        this.setState({
            speedText: speedTexts[value-1]
        })
        this.props.onChange(value);
    }

    render() {
        return (
            <div className='slider-container'>
                <div className='slider-text'>
                    Speed: <div className='speed-text'> {this.state.speedText} </div>
                </div>
                <SteppedRangeSlider min={1} max={5} step={1} default={3}
                                    sliderStyle='slider speed-slider'
                                    onChange={this.onChangeSpeed}
                />
                <datalist id='step-list'>
                    <option>1</option>
                    <option>2</option>
                    <option>3</option>
                    <option>4</option>
                    <option>5</option>
                </datalist>
            </div>
        );
    }
}

interface AlgorithmProps {
    onChangeDiagonals: (checked: boolean) => void,
    onChangeBidirectional: (checked: boolean) => void
    disabled: boolean
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
                <Checkbox defaultChecked={true} boxStyle='box'
                          onChange={this.props.onChangeDiagonals}>
                    Allow Diagonals
                </Checkbox>
                <Checkbox defaultChecked={false} boxStyle='box'
                          disabled={this.props.disabled}
                          onChange={this.props.onChangeBidirectional}>
                    Bidirectional
                </Checkbox>
            </div>
        );
    }
}

interface HeuristicProps {
    onClickManhattan: () => void,
    onClickEuclidean: () => void,
    onClickChebyshev: () => void,
    onClickOctile: () => void
    disabled: boolean
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