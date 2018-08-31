import React from 'react'
import PropTypes from 'prop-types'
import {observer} from 'mobx-react'
import actionContext from '../../state/action-context'
import ActionsBlockView from '../shared/actions-block-view'

@observer
class ConfirmIntentView extends React.Component {
    constructor(props) {
        super(props)
    }

    static propTypes = {
        rejectOnly: PropTypes.bool
    }

    render() {
        if (this.props.rejectOnly) return <ActionsBlockView>
            <button className="button-outline" onClick={e => actionContext.rejectRequest()}>Reject</button>
        </ActionsBlockView>
        return <ActionsBlockView>
            <button onClick={e => actionContext.confirmRequest()}>Confirm</button>
            {' '}
            <button className="button-outline" onClick={e => actionContext.rejectRequest()}>Reject</button>
        </ActionsBlockView>
    }
}

export default ConfirmIntentView