import 'whatwg-fetch'

import React from 'react'
import {FormGroup, FormControl, ControlLabel, Button} from 'react-bootstrap'


export default class LoginForm extends React.Component {
    constructor(props) {
        super(props)

        this.state = {
            username: '',
            password: '',
            error: null
        }

        this.submit = this.submit.bind(this)
        this.handleUsernameChange = this.handleUsernameChange.bind(this)
        this.handlePasswordChange = this.handlePasswordChange.bind(this)
    }

    submit(e) {
        e.preventDefault()
        fetch('/auth/tokens/', {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                username: this.state.username,
                password: this.state.password,
            })
        })
        .then((resp) => {
            switch (resp.status) {
            case 201:
            case 403:
                resp.json()
                .then((json) => {
                    if (resp.status == 201) {
                        // Store the token.
                        let date = new Date()
                        date.setTime(json.expires_at * 1000)
                        document.cookie =
                            `Auth-Token=${json.token}; expires=${date.toUTCString()};`

                        // Navigate to the index.
                        window.location = '/'
                    } else {
                        // Handle a failed authentication.
                        this.setState({error: json.message})
                    }
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

    render() {
        let error_message = null
        if (this.state.error) {
            error_message = (
                <div className="form-group">
                    <div className="alert alert-danger">
                        <strong>Authentication failed</strong>
                        <br />
                        {this.state.error}
                    </div>
                </div>
            )
        }

        return (
            <form onSubmit={this.submit}>
                <FormGroup controlId="username">
                    <ControlLabel className="sr-only">Username or email</ControlLabel>
                    <FormControl
                        onChange={this.handleUsernameChange}
                        type="text"
                        placeholder="Username or email"
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
                {error_message}
                <Button type="submit" className="btn btn-primary btn-block">Sign in</Button>
            </form>
        )
    }
}
