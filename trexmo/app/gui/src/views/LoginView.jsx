import React from 'react'
import {Grid, Row, Col} from 'react-bootstrap'

import LoginForm from 'trexmo/components/LoginForm'


export default class LoginView extends React.Component {
    render() {
        return (
            <Grid>
                <Row>
                    <Col md={8} mdOffset={2}>
                        <h2 className="form-signin-heading">Please sign in</h2>
                        <LoginForm />
                    </Col>
                </Row>
            </Grid>
        )
    }
}
