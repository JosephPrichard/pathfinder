import React from 'react';

interface IProps {
    min: number,
    max: number,
    default: number,
    step: number,
    sliderStyle: string,
    onChange: (val: number) => void
}

class SteppedRangeSlider extends React.Component<IProps>
{
    /**
     * Trigger callback when slider value is changed
     * @param e
     */
    onChange = (e: React.FormEvent<HTMLInputElement>) => {
        this.props.onChange(Number(e.currentTarget.value));
    }

    render() {
        return (
            <input type='range' list='step-list'
                   defaultValue={this.props.default}
                   min={this.props.min} max={this.props.max}
                   step={this.props.step} className={this.props.sliderStyle}
                   onChange={this.onChange}
            >
            </input>
        );
    }
}

export default SteppedRangeSlider;