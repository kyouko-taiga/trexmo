import React from 'react'

import IndexView from 'trexmo/views/IndexView'
import LoginView from 'trexmo/views/LoginView'
import ScenarioView from 'trexmo/views/ScenarioView'

import AppNavbar from 'trexmo/components/AppNavbar'

import Confirm from 'trexmo/components/dialogs/Confirm'
import Notification from 'trexmo/components/dialogs/Notification'
import Prompt from 'trexmo/components/dialogs/Prompt'

import Router from './Router'


// Define a view wrapper that includes the navigation menu as well as the 
// dialog and alert components.
const LoggedWrapper = (View) => class extends React.Component {
    render() {
        return (
            <div>
                <AppNavbar />
                <Confirm />
                <Notification />
                <Prompt />
                <View {...this.props} />
            </div>
        )
    }
}


// Define the application routes.
const routes = {
    '/login': LoginView,
    '/': LoggedWrapper(IndexView),
    '/scenarii/<uid>': LoggedWrapper(ScenarioView)
}
let router = new Router(routes, document.getElementById('trxm-content'))


// Render the application.
window.onhashchange = (() => { router.render() })
router.render()
