/*
 * Copyright (c) Joseph Prichard 2022.
 */

import React from 'react';

interface Props {
    boxStyle: string,
    defaultChecked: number,
    disabled: boolean,
    onChange: (() => void)[]
}

interface State {
    checked: boolean[];
}

class RadioButtonGroup extends React.Component<Props, State> {
    static defaultProps = { disabled: false };

    constructor(props: Props) {
        super(props);
        const checked: boolean[] = [];
        for (let i = 0; i < this.props.onChange.length; i++) {
            checked.push(i === this.props.defaultChecked);
        }
        this.state = { checked };
    }

    onChange(index: number) {
        const checked: boolean[] = [];
        for (let i = 0; i < this.props.onChange.length; i++) {
            checked.push(i === index);
        }
        this.setState({ checked }, () => this.props.onChange[index]());
    }

    render() {
        const children = React.Children.toArray(this.props.children);
        const radioButtons: JSX.Element[] = [];
        for (let i = 0; i < this.props.onChange.length; i++) {
            radioButtons.push(
                <div key={i}>
                    <input
                        checked={this.state.checked[i]}
                        type='radio'
                        disabled={this.props.disabled}
                        className={this.props.boxStyle}
                        onChange={() => this.onChange(i)}
                    />
                    {children[i]}
                </div>
            );
        }
        return radioButtons;
    };
}

export default RadioButtonGroup;