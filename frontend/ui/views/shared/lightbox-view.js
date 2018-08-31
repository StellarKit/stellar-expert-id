import React from 'react'
import PropTypes from 'prop-types'

function LightboxView({children, className, ...otherProps}) {
    let innerClassName = 'lightbox-inner'
    if (className) {
        innerClassName += ' ' + className
    }
    return <div className="lightbox">
        <div className={innerClassName} {...otherProps}>
            {children}
        </div>
    </div>
}

LightboxView.propTypes = {
    children: PropTypes.any.isRequired
}

export default LightboxView