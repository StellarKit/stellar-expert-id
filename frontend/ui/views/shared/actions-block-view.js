import React from 'react'
import PropTypes from 'prop-types'

function ActionsBlockView({children}) {
    return <div className="actions space">
        <hr/>
        <div className="space">
            {children}
        </div>
    </div>
}

ActionsBlockView.propTypes = {
    children: PropTypes.any.isRequired
}

export default ActionsBlockView