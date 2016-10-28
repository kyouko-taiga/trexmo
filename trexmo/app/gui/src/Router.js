import React from 'react'
import ReactDom from 'react-dom'


export default class Router {
    constructor(routes, render_to) {
        this.routes = this._buildRoutePatterns(routes)
        this.renderTo = render_to
    }

    _buildRoutePatterns(routes) {
        const route_arg = /(<[a-zA-Z]+>)/
        let patterns = {}
        for (let route in routes) {
            const slash = RegExp('\/', 'g')

            // If the route is completely static, then we simply transform it into a
            // regular expression.
            if (route.indexOf('<') == -1) {
                patterns[route] = {
                    re: RegExp('^' + route.replace(slash, '\\/') + '$'),
                    arglist: [],
                    view: routes[route]
                }
                continue
            }

            let subroute = route
            let re = ''
            let opening_index
            let arglist = []

            while ((opening_index = subroute.indexOf('<')) != -1) {
                // Append the fixed sub-part.
                re += subroute.substr(0, opening_index).replace(slash, '\\/')

                // Create a matching group for the argument.
                let closing_index = subroute.indexOf('>')
                let arg = subroute.substr(opening_index + 1, closing_index - opening_index - 1)

                re += `([^\\/]+)`
                arglist.push(arg)

                // Remove the part of the route that was just processed.
                subroute = subroute.substr(closing_index + 1)
            }

            patterns[route] = {
                re: RegExp('^' + re + '$'),
                arglist: arglist,
                view: routes[route]
            }
        }

        return patterns
    }

    findRoute() {
        let location
        if (window.location.pathname == '/login') {
            // Because the login view lives on another page, we should treat
            // it as a special case.
            location = '/login'
        } else if (window.location.pathname == '/sign-up') {
            // Because the sign-up view lives on another page, we should treat
            // it as a special case.
            location = '/sign-up'
        } else {
            // Read the anchor value.
            location = window.location.hash.substring(1)
            if ((location.length == 0) || (location[0] != '/')) {
                location = '/' + location
            }
        }

        // Find the first route that matches.
        let match
        for (let route_def in this.routes) {
            const route = this.routes[route_def]
            if ((match = route.re.exec(location)) !== null) {
                // Extract the route arguments
                let args = {}
                for (let i = 0; i < route.arglist.length; ++i) {
                    args[route.arglist[i]] = match[i + 1]
                }

                // Return the route and its arguments.
                return {
                    route: route_def,
                    args: args,
                    view: route.view
                }
            }
        }

        // No matching route.
        return null
    }


    // Render the view corresponding the the current window location.
    render() {
        let route = this.findRoute()
        if (route !== null) {
            ReactDom.render(
                React.createElement(route.view, route.args), this.renderTo)
        } else {
            console.error('No view for the current location.')
        }
    }
}
