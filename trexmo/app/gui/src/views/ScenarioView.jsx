import React from 'react'
import {Grid, Row, Col, PageHeader, Alert, Button, ButtonToolbar} from 'react-bootstrap'

import StoreConnector from 'trexmo/connectors/StoreConnector'

import ScenarioActions from 'trexmo/actions/ScenarioActions'
import ScenarioStore from 'trexmo/stores/ScenarioStore'

import Scenario from 'trexmo/components/Scenario'
import ScenarioToolbar from 'trexmo/components/ScenarioToolbar'


export default StoreConnector(
    class ScenarioViewContainer extends React.Component {
        constructor() {
            super()

            this.state = {
                loading: true,
                error: null
            }
        }

        componentDidMount() {
            // Fetch the scenario if we don't have it in props yet.
            if (!this.props.scenario) {
                ScenarioActions.get(this.props.uid)
                    .then(() => {
                        this.setState({loading: false})
                    })
                    .catch((error) => {
                        this.setState({error: error.message})
                    })
            } else {
                this.setState({loading: false})
            }
        }

        render() {
            // Show the error that occured if we failed fetching the scenario.
            if (this.state.error !== null) {
                return <ErrorView error={this.state.error} />
            }

            // Show a loading page if the we are still fetching the scenario.
            if (this.state.loading) {
                return <LoadingView />
            }

            return <DefaultView scenario={this.props.scenario} />
        }
    },

    ScenarioStore,
    (props) => ({scenario: ScenarioStore.all()[props.uid]})
)


class LoadingView extends React.Component {
    render() {
        return (
            <Grid>
                <Row>
                    <PageHeader>Loading ...</PageHeader>
                </Row>
            </Grid>
        )
    }
}


class ErrorView extends React.Component {
    render() {
        return (
            <Grid>
                <Row>
                    <PageHeader>
                        <i className="fa fa-fw fa-warning" /> Error
                    </PageHeader>
                    <Alert bsStyle="danger">
                        <strong>Unable to load the scenario</strong>
                        <p>{this.props.error}</p>
                    </Alert>
                </Row>
            </Grid>
        )
    }
}


class DefaultView extends React.Component {
    render() {
        const title = (this.props.scenario.__modified__ === true)
            ? this.props.scenario.name + '*'
            : this.props.scenario.name

        return (
            <Grid>
                <Row>
                    <PageHeader>
                        <div className="clearfix">
                            <div className="pull-left">
                                {title}
                            </div>
                            <div className="pull-right">
                                <ScenarioToolbar
                                    uid={this.props.scenario.uid}
                                    modified={this.props.scenario.__modified__}
                                />
                            </div>
                        </div>
                    </PageHeader>
                    <Scenario scenario={this.props.scenario} />
                </Row>
            </Grid>
        )
    }
}
