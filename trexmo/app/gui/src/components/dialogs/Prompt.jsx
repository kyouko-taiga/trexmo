import React from 'react'
import {Modal, FormControl, FormGroup, ControlLabel, Button, ButtonToolbar} from 'react-bootstrap'

import PromptActions from 'trexmo/actions/PromptActions'
import StoreConnector from 'trexmo/connectors/StoreConnector'
import PromptStore from 'trexmo/stores/PromptStore'


export default StoreConnector(
    class Notification extends React.Component {
        constructor() {
            super()

            this.state = {answer: ''}

            this.handleCancel = this.handleCancel.bind(this)
            this.handleSubmit = this.handleSubmit.bind(this)
            this.handleAnswerChange = this.handleAnswerChange.bind(this)
        }

        handleCancel() {
            this.props.resolve(null)
        }

        handleSubmit(e) {
            e.preventDefault()
            this.props.resolve(this.state.answer)
        }

        handleAnswerChange(e) {
            this.setState({answer: e.target.value})
        }

        render() {
            return (
                <Modal show={this.props.showModal} onHide={this.handleCancel}>
                    <form onSubmit={this.handleSubmit}>
                        <Modal.Body>
                            <FormGroup controlId="prompt">
                                <ControlLabel>
                                    <h4>{this.props.question}</h4>
                                </ControlLabel>
                                <FormControl
                                    onChange={this.handleAnswerChange}
                                    type="text"
                                    value={this.state.answer}
                                />
                            </FormGroup>
                        </Modal.Body>
                        <Modal.Footer>
                            <ButtonToolbar>
                                <Button onClick={this.handleCancel}>Cancel</Button>
                                <Button type="submit" bsStyle="primary">Submit</Button>
                            </ButtonToolbar>
                        </Modal.Footer>
                    </form>
                </Modal>
            )
        }    
    },

    PromptStore,
    (props) => (PromptStore.state)
)
