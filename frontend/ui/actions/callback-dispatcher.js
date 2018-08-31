import errors from '../util/errors'

const urlSchema = 'url:'

/**
 * POST response to callback address accordingly to SEP-0007.
 * @param {String} callback - Callback endpoint.
 * @param {Object} data - Response data.
 * @return {Promise<void>}
 */
function execCallback(callback, data) {
    if (callback.indexOf(urlSchema) !== 0) return Promise.reject(new Error('Unsupported callback schema: ' + callback))
    const action = callback.substr(urlSchema.length)
    const form = document.createElement('form')
    document.body.appendChild(form)
    form.method = 'post'
    form.action = action
    for (let name in data) {
        if (data.hasOwnProperty(name)) {
            const input = document.createElement('input')
            input.type = 'hidden'
            input.name = name
            input.value = data[name]
            form.appendChild(input)
        }
    }
    form.submit()
    return Promise.resolve()
}

function postMessage(res) {
    if (!window.opener) return Promise.reject('Parent browser window was closed.')
    window.opener.postMessage(res, '*')
    return Promise.resolve()
}

function dispatchIntentResponse(res, actionContext) {
    const {callback} = actionContext.data
    return callback ? execCallback(callback, res) : postMessage(res)
}

/**
 * Reject the request.
 * @param {Error|String} [error] - Rejection reason or validation error.
 * @param {ActionContext} actionContext - Current action context.
 */
function handleIntentResponseError(error, actionContext) {
    if (!error) {
        error = errors.actionRejectedByUser()
    }
    if (actionContext.data.callback) {
        alert(error.message || error)
    } else {
        if (!window.opener) {
            return alert('Unable to process. Parent browser window was closed. ' + error.message || error || '')
        }
        if (error instanceof Error) { //prepare for the serialization before sending via postMessage
            error = {message: error.message}
        }
        window.opener.postMessage({error}, '*')
    }
}

export {dispatchIntentResponse, handleIntentResponseError}