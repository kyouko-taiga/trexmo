import React from 'react'
import {Navbar, Nav, NavItem} from 'react-bootstrap'


export default class AppNavbar extends React.Component {
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
                    </Nav>
                </Navbar.Collapse>
            </Navbar>
        )
    }
}
