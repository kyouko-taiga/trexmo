import React from 'react'
import {Grid, Row, Col} from 'react-bootstrap'

import LoginForm from 'trexmo/components/LoginForm'


export default class LoginView extends React.Component {
    render() {
        return (
            <Grid>
                <Row>
                    <Col xs={4} xsOffset={4}>
                        <img width="100%" src="/static/img/logo-trexmo.png" />
                    </Col>
                    <Col md={8} mdOffset={2}>
                        <h2 className="form-signin-heading">Please sign in</h2>
                        <LoginForm />
                        <Row>
                            <Col xs={12}>
                                Please be aware that you will be using a development version that may include some bugs and performance issues.
                            </Col>
                        </Row>
                        <Row className="trxm-logo-container">
                            <Col xs={4}><img src="/static/img/logo-ch.jpg" /></Col>
                            <Col xs={4}><img src="/static/img/logo-unige.jpg" /></Col>
                            <Col xs={4}><img src="/static/img/logo-unil.png" /></Col>
                            <Col xs={4}><img src="/static/img/logo-ist.png" /></Col>
                            <Col xs={4}><img src="/static/img/logo-scaht.png" /></Col>
                        </Row>
                    </Col>
                </Row>
            </Grid>
        )
    }
}
