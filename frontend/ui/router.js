import React from 'react'
import PropTypes from 'prop-types'
import {Switch, Router, Route} from 'react-router'

import Layout from './views/layout-view'

import CreateAccount from './views/account-settings/create-account-view'
import Intro from './views/pages/intro-view'
import NotFound from './views/pages/not-found-view'
import Intent from './views/intent/intent-view'

function AppRouter({history}) {
    return <Router history={history}>
        <Layout>
            <Switch>
                <Route path="/create-account" component={CreateAccount}/>
                <Route path="/confirm" component={Intent}/>
                <Route path="/" exact component={Intro}/>
                <Route component={NotFound}/>
            </Switch>
        </Layout>
    </Router>
}

AppRouter.propTypes = {
    history: PropTypes.object.isRequired
}

export default AppRouter