import React from 'react';

interface IProps {
    boxStyle: string,
    defaultChecked: boolean,
    disabled?: boolean,
    onChange: (checked: boolean) => void
}

interface IState {
    checked: boolean
}

class Checkbox extends React.Component<IProps,IState>
{
    public static defaultProps = {
        disabled: false
    };

    constructor(props: IProps) {
        super(props);
        this.state = {
            checked: this.props.defaultChecked
        }
    }

    /**
     * Trigger callback and toggle checkbox checked state
     */
    onChange() {
        this.setState(prevState => ({
            checked: !prevState.checked
        }), () => this.props.onChange(this.state.checked));
    }

    render() {
        return(
            <div>
                <input
                    checked={this.state.checked}
                    type='checkbox'
                    disabled={this.props.disabled}
                    className={this.props.boxStyle}
                    onKeyPress={() => this.onChange()}
                    onChange={() => this.onChange()}
                />
                {this.props.children}
            </div>
        );
    };
}

export default Checkbox;