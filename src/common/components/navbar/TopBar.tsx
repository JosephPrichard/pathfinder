import React, {RefObject} from 'react';

class TopBar extends React.Component
{
    private bar: RefObject<HTMLDivElement> = React.createRef();

    render() {
        return (
            <div
                ref={this.bar}
                style={{
                    width: window.screen.availWidth
                }}
                className='top-navbar'
            >
                {this.props.children}
            </div>
        );
    }
}

export default TopBar;