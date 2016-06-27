import React from 'react'
import {render} from 'react-dom'

import LoginView from 'trexmo/views/LoginView'


const routes = {
    '/login': LoginView
}


// Render the view corresponding the the current window location.
let loc = window.location.pathname
if (routes.hasOwnProperty(loc)) {
    let view = routes[loc]
    render(React.createElement(view, null), document.getElementById('trxm-content'))
} else {
    console.error(`There isn't any view associated with the current location: "${loc}"`)
}
