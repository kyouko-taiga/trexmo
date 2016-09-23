import React from 'react'
import {Grid, Row, Col} from 'react-bootstrap'

import SignUpForm from 'trexmo/components/SignUpForm'


export default class SignUpView extends React.Component {
    render() {
        return (
            <Grid>
                <Row>
                    <Col md={8} mdOffset={2}>
                        <h2 className="form-signin-heading">Sign up to use TREXMO</h2>
                        <SignUpForm />
                    </Col>
                </Row>
            </Grid>
        )
    }
}
