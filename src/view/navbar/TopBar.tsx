import React, {RefObject} from 'react';
import './Navbar.css'

interface IProps {
    onChangeHeight: (height: number) => void
}

class TopBar extends React.Component<IProps>
{
    private bar: RefObject<HTMLDivElement> = React.createRef();

    componentDidMount() {
        window.addEventListener('resize', () => this.props.onChangeHeight(this.bar.current!.offsetHeight));
        this.props.onChangeHeight(this.bar.current!.offsetHeight);
    }

    render() {
        return (
            <div ref={this.bar} style={{
                width: window.screen.availWidth
            }} className='top-navbar'>
                {this.props.children}
            </div>
        );
    }
}

export default TopBar;