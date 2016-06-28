import React from 'react'
import {Alert} from 'react-bootstrap'

import NotificationActions from 'trexmo/actions/NotificationActions'
import StoreConnector from 'trexmo/connectors/StoreConnector'
import NotificationStore from 'trexmo/stores/NotificationStore'


export default StoreConnector(
    class Notification extends React.Component {
        handleDismiss() {
            NotificationActions.hide()
        }

        render() {
            let className = 'trxm-notification-alert '
            className += this.props.visible
                ? 'trxm-visible'
                : 'trxm-hidden'

            return (
                <div className={className}>
                    <Alert onDismiss={this.handleDismiss} bsStyle={this.props.level}>
                        {this.props.message}
                    </Alert>
                </div>
            )
        }    
    },

    NotificationStore,
    (props) => NotificationStore.state
)
