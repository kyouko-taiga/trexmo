import React from 'react'
import {Grid, Row, Col, PageHeader} from 'react-bootstrap'

import ScenarioCreator from 'trexmo/components/ScenarioCreator'
import ScenarioList from 'trexmo/components/ScenarioList'


export default class IndexView extends React.Component {
    render() {
        return (
            <Grid>
                <Row>
                    <PageHeader>My exposure situations</PageHeader>
                    <ScenarioList />
                    <hr />
                    <ScenarioCreator />
                </Row>
            </Grid>
        )
    }
}
