import 'whatwg-fetch'
import React from 'react'
import {render} from 'react-dom'
import Router from './router'
import {Network} from 'stellar-base'
import createBrowserHistory from 'history/createBrowserHistory'

Network.usePublicNetwork()

const history = createBrowserHistory()
const appContainer = document.createElement('div')

window.__history = history

appContainer.addEventListener('click', e => {
    //ignore ctrl+click
    if (e.ctrlKey) return
    let link = e.target
    while (link && link.tagName.toLowerCase() !== 'a') {
        link = link.parentElement
    }
    if (link) {
        const href = link.getAttribute('href')
        // Skip empty links
        if (href === '#') return e.preventDefault()
        // Sometimes links don't have href (null received)
        if (!href) return
        //Skip external links
        if (link.target === '_blank') return
        if (link.classList.contains('external-link')) return
        if (/^(mailto:|tel:|(https?):\/\/)/.test(href)) return

        let currentLocation = window.location
        // When history works internal links sometimes should not trigger page refresh
        if ((currentLocation.pathname + currentLocation.search) === href) return e.preventDefault()
        __history.push(href)
        e.preventDefault()
    }
})

render(<Router history={history}/>, appContainer)

document.body.appendChild(appContainer)