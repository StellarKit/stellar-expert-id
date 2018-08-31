import React from 'react'
import PropTypes from 'prop-types'
import {withRouter} from 'react-router'
import {observer} from 'mobx-react'
import actionContext from '../../state/action-context'
import IntentDescription from './intent-description-view'
import ConfirmIntentView from './confirm-intent-view'
import AccountSelector from '../authentication/account-selector-view'

function IntentView() {
    if (!actionContext.confirmed) {
        actionContext.setContext(location.search)
    }
    if (actionContext.intentErrors) {
        return <div>
            <IntentDescription expanded={false}/>
            <ConfirmIntentView rejectOnly/>
        </div>
    }
    if (!actionContext.confirmed) {
        actionContext.setContext(location.search)
        return <div>
            <IntentDescription expanded={true}/>
            <ConfirmIntentView/>
        </div>
    }
    if (!actionContext.selectedKeypair) {
        return <div>
            <IntentDescription expanded={false}/>
            <AccountSelector title="Choose Account"/>
        </div>
    }
    return <div>
        <IntentDescription expanded={false}/>
        <div className="loader"/>
    </div>
}


export default withRouter(observer(IntentView))