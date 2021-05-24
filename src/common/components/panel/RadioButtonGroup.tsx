import React from 'react';

interface IProps {
    boxStyle: string,
    defaultChecked: number,
    disabled: boolean,
    onChange: (() => void)[]
}

interface IState {
    checked: boolean[];
}

class RadioButtonGroup extends React.Component<IProps, IState>
{
    static defaultProps = {
        disabled: false
    };

    constructor(props: IProps) {
        super(props);
        const checked: boolean[] = [];
        for(let i = 0; i < this.props.onChange.length; i++) {
            checked.push(i === this.props.defaultChecked);
        }
        this.state = {
            checked: checked
        }
    }

    /**
     * Set all radio buttons to checked aside from the index
     * of the one that was changed
     * Trigger callback
     * @param index
     */
    onChange(index: number) {
        const checked: boolean[] = [];
        for(let i = 0; i < this.props.onChange.length; i++) {
            checked.push(i === index);
        }
        this.setState({
            checked: checked
        }, () => this.props.onChange[index]());
    }

    /**
     * Render a radio button for each child
     */
    render() {
        const children = React.Children.toArray(this.props.children);
        const radioButtons: JSX.Element[] = [];
        for(let i = 0; i < this.props.onChange.length; i++) {
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