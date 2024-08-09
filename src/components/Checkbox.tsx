/*
 * Copyright (c) Joseph Prichard 2022.
 */

import React from "react";

interface Props {
    boxStyle: string;
    defaultChecked: boolean;
    disabled?: boolean;
    onChange: (checked: boolean) => void;
}

interface State {
    checked: boolean;
}

class Checkbox extends React.Component<Props, State> {
    public static defaultProps = {
        disabled: false,
    };

    constructor(props: Props) {
        super(props);
        this.state = {
            checked: this.props.defaultChecked,
        };
    }

    onChange() {
        this.setState(
            (prevState) => ({ checked: !prevState.checked }),
            () => this.props.onChange(this.state.checked)
        );
    }

    render() {
        return (
            <div>
                <input
                    checked={this.state.checked}
                    type="checkbox"
                    disabled={this.props.disabled}
                    className={this.props.boxStyle}
                    onKeyPress={() => this.onChange()}
                    onChange={() => this.onChange()}
                />
                {this.props.children}
            </div>
        );
    }
}

export default Checkbox;
