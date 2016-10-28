import React from 'react'


export default class Link extends React.Component {
    constructor() {
        super()

        this.handleClick = this.handleClick.bind(this)
    }

    handleClick(e) {
        e.preventDefault()
        if (typeof this.props.onClick === 'function') {
            this.onClick(e)
        } else {
            window.location.href = '#' + this.props.href
        }
    }

    render() {
        const Component = this.props.componentClass || 'a'
        const {onClick, handleClick, href, ...props} = this.props

        return (
            <Component onClick={this.handleClick} href={href} {...props}>
                {this.props.children}
            </Component>
        )
    }
}
