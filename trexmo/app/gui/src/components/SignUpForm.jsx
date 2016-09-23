import 'whatwg-fetch'

import React from 'react'
import {FormGroup, FormControl, ControlLabel, Button} from 'react-bootstrap'


export default class LoginForm extends React.Component {
    constructor(props) {
        super(props)

        this.state = {
            username: '',
            password: '',
            confirm: '',
            error: null
        }

        this.submit = this.submit.bind(this)
        this.handleUsernameChange = this.handleUsernameChange.bind(this)
        this.handlePasswordChange = this.handlePasswordChange.bind(this)
        this.handleConfirmChange = this.handleConfirmChange.bind(this)
    }

    submit(e) {
        e.preventDefault()
        fetch('/auth/users/', {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                username: this.state.username,
                password: this.state.password,
                confirm: this.state.confirm
            })
        })
        .then((resp) => {
            switch (resp.status) {
            case 201:
                window.location = '/login'
                break;

            case 400:
                resp.json()
                .then((json) => {
                    // Handle a failed request.
                    this.setState({error: json.message})
                })
                .catch((err) => {
                    console.error(err)
                    this.setState({error: `Unable to read the server resp (${resp.status}).`})
                })
                break;

            default:
                // Any other resp status is a misbehaviour.
                this.setState({error: 'The server answered with an unexpected status.'})
            }
        })
        .catch((err) => {
            console.error(err)
            this.setState({error: 'An error occured while contacting the server.'})
        })
    }

    handleUsernameChange(e) {
        this.setState({username: e.target.value})
    }

    handlePasswordChange(e) {
        this.setState({password: e.target.value})
    }

    handleConfirmChange(e) {
        this.setState({confirm: e.target.value})
    }

    render() {
        let error_message = null
        if (this.state.error) {
            error_message = (
                <div className="form-group">
                    <div className="alert alert-danger">
                        <strong>Request failed</strong>
                        <br />
                        {this.state.error}
                    </div>
                </div>
            )
        }

        return (
            <form onSubmit={this.submit}>
                <FormGroup controlId="username">
                    <ControlLabel className="sr-only">Email address</ControlLabel>
                    <FormControl
                        onChange={this.handleUsernameChange}
                        type="email"
                        placeholder="Email address"
                        value={this.state.username}
                        required autofocus
                    />
                </FormGroup>
                <FormGroup controlId="password">
                    <ControlLabel className="sr-only">Password</ControlLabel>
                    <FormControl
                        onChange={this.handlePasswordChange}
                        type="password"
                        placeholder="Password"
                        value={this.state.password}
                        required
                    />
                </FormGroup>
                <FormGroup controlId="confirm">
                    <ControlLabel className="sr-only">Password confirmation</ControlLabel>
                    <FormControl
                        onChange={this.handleConfirmChange}
                        type="password"
                        placeholder="Password confirmation"
                        value={this.state.confirm}
                        required
                    />
                </FormGroup>
                {error_message}
                <FormGroup>
                    <Button type="submit" className="btn btn-success btn-block">Sign up</Button>
                </FormGroup>
            </form>
        )
    }
}
