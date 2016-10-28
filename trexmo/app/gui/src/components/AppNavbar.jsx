import React from 'react'
import {Navbar, Nav, NavItem} from 'react-bootstrap'


export default class AppNavbar extends React.Component {
    constructor() {
        super()
        this.handleSignOut = this.handleSignOut.bind(this)
    }

    render() {
        return (
            <Navbar fixedTop>
                <Navbar.Header>
                    <Navbar.Brand>
                        <a href="/">TREXMO</a>
                    </Navbar.Brand>
                    <Navbar.Toggle />
                </Navbar.Header>
                <Navbar.Collapse>
                    <Nav pullRight>
                        <NavItem eventKey={1} href="/">Exposure situations</NavItem>
                        <NavItem eventKey={2} href="static/docs/TREXMO-webtr.pdf">Docs</NavItem>
                        <NavItem onClick={this.handleSignOut} eventKey={3} href="#">Sign out</NavItem>
                    </Nav>
                </Navbar.Collapse>
            </Navbar>
        )
    }

    handleSignOut(e) {
        e.preventDefault()
        document.cookie = `Auth-Token=; expires=Thu, 01 Jan 1970 00:00:00 GMT;`
        window.location = '/login'
    }
}
