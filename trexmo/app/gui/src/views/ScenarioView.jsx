import React from 'react'
import {Grid, Row, Col, PageHeader, Alert, Button, ButtonToolbar} from 'react-bootstrap'

import StoreConnector from 'trexmo/connectors/StoreConnector'

import ScenarioActions from 'trexmo/actions/ScenarioActions'
import ScenarioStore from 'trexmo/stores/ScenarioStore'

import Link from 'trexmo/components/Link'
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
                    .catch((error) => {
                        this.setState({error: error})
                    })
                    .then(() => {
                        this.setState({loading: false})
                    })
            } else {
                this.setState({loading: false})
            }
        }

        render() {
            // Show the loading view if the we are still loading the scenario.
            if (this.state.loading) {
                return <LoadingView />
            }

            // Show the error view if we failed to load the scenario.
            if (this.state.error !== null) {
                return (
                    <ErrorView>
                        <p>{this.state.error.message}</p>
                    </ErrorView>
                )
            }

            // She the error view if the scenario couldn't be found.
            if (typeof this.props.scenario === 'undefined') {
                return (
                    <ErrorView>
                        <p>The exposure situation does not exist or was deleted.</p>
                    </ErrorView>
                )
            }

            // Show the default view if we could get the scenario.
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
                        <i className="fa fa-fw fa-warning" />
                        Unable to load the exposure situation
                    </PageHeader>
                    <Alert bsStyle="danger">
                        {this.props.children}
                    </Alert>
                    <Link href="/">Click here</Link> to come back to the list of exposure situations.
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
                                <ScenarioToolbar scenario={this.props.scenario} />
                            </div>
                        </div>
                    </PageHeader>
                    <Scenario scenario={this.props.scenario} />
                </Row>
            </Grid>
        )
    }
}
