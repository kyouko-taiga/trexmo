import moment from 'moment'

import React from 'react'
import {Alert, ListGroup, ListGroupItem} from 'react-bootstrap'

import StoreConnector from 'trexmo/connectors/StoreConnector'

import ScenarioActions from 'trexmo/actions/ScenarioActions'
import ScenarioStore from 'trexmo/stores/ScenarioStore'

import ModelActions from 'trexmo/actions/ModelActions'
import ModelStore from 'trexmo/stores/ModelStore'


export default StoreConnector(
    class ScenarioListContainer extends React.Component {
        constructor() {
            super()

            this.state = {
                loading: true
            }
        }

        componentDidMount() {
            // Request the list of scenarii.
            ScenarioActions.list()
                .then(() => {
                    this.setState({loading: false})
                })
                .catch((error) => {
                    console.error(error)
                })
        }

        render() {
            return <ScenarioList loading={this.state.loading} items={this.props.scenarii} />
        }    
    },

    ScenarioStore,
    (props) => ({scenarii: ScenarioStore.all()})
)


class ScenarioList extends React.Component {
    render() {
        if (this.props.loading) {
            return <Alert bsStyle="info">Loading ...</Alert>
        } else {
            // Create the list of items.
            let items = Object.keys(this.props.items).map((uid) => {
                const it = this.props.items[uid]

                return (
                    <ScenarioItem key={uid} scenario={it} />
                )
            })

            // Display a message if the list is empty.
            if (items.length == 0) {
                return <Alert bsStyle="info">{"You don't have any exposure situations."}</Alert>
            } else {
                return (
                    <div>
                        <p className="text-muted">
                            Click on an exposure situation to edit or execute it.
                        </p>
                        <ListGroup>{items}</ListGroup>
                    </div>
                )
            }
        }
    }
}


const ScenarioItem = StoreConnector(
    class extends React.Component {
        componentDidMount() {
            // Request the list of available exposure models.
            ModelActions.list()
                .catch((error) => {
                    console.error(error)
                })
        }

        render() {
            const scenario = this.props.scenario

            let model = scenario.model
            try {
                model = ModelStore.one(model).label
            } catch(e) {
            }

            let substance = !scenario.substance
                ? <i>{'undefined substance'}</i>
                : scenario.substance + (scenario.cas ? ' (' + scenario.cas + ')' : '')

            return (
                <ListGroupItem href={`#scenarii/${scenario.uid}`}>
                    <h4>{scenario.name}</h4>
                    <ul className="fa-ul">
                        <li>
                            <i className="fa fa-li fa-calendar-o" />
                            {moment.unix(scenario.created_at).format('LLL')}
                        </li>
                        <li>
                            <i className="fa fa-li fa-list" />
                            {model}
                        </li>
                        <li>
                            <i className="fa fa-li fa-flask" />
                            {substance}
                        </li>
                    </ul>
                </ListGroupItem>
            )
        }
    },

    ModelStore,
    (props) => ({})
)
