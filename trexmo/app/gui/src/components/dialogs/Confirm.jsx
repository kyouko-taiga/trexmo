import React from 'react'
import {Modal, Button, ButtonToolbar} from 'react-bootstrap'

import ConfirmActions from 'trexmo/actions/ConfirmActions'
import StoreConnector from 'trexmo/connectors/StoreConnector'
import ConfirmStore from 'trexmo/stores/ConfirmStore'


export default StoreConnector(
    class Confirm extends React.Component {
        constructor() {
            super()

            this.handleCancel = this.handleCancel.bind(this)
            this.handleConfirm = this.handleConfirm.bind(this)
        }

        handleCancel() {
            this.props.resolve(false)
        }

        handleConfirm() {
            this.props.resolve(true)
        }

        render() {
            return (
                <Modal show={this.props.showModal} onHide={this.handleCancel}>
                    <Modal.Body>
                        {this.props.message}
                    </Modal.Body>
                    <Modal.Footer>
                        <ButtonToolbar>
                            <Button onClick={this.handleCancel}>Cancel</Button>
                            <Button onClick={this.handleConfirm} bsStyle="primary">Confirm</Button>
                        </ButtonToolbar>
                    </Modal.Footer>
                </Modal>
            )
        }    
    },

    ConfirmStore,
    (props) => (ConfirmStore.state)
)
