import React from 'react'

import LoginForm from 'trexmo/components/LoginForm'


export default class LoginView extends React.Component {
    render() {
        return (
            <div className="container">
                <div className="row">
                    <div className="col-md-offset-2 col-md-8">
                        <h2 className="form-signin-heading">Please sign in</h2>
                        <LoginForm />
                    </div>
                </div>
            </div>
        )
    }
}
