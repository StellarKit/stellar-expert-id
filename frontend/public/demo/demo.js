(function (window, hljs, undefined) {
    //use current domain as fronted origin for demo script
    window.stellarExpertIdFrontend = window.location.origin

    var appProperties = {
            app_name: 'Demo',
            app_description: 'Demo application - for testing purpose only'
        },
        intentDispatcher = new window.intentIdStellarExpert(appProperties)

    function $(querySelector) {
        if (typeof querySelector === 'function') {
            return document.addEventListener('DOMContentLoaded', querySelector, false)
        }
        return document.querySelector(querySelector)
    }

    function getParameters(intent) {
        var res = {
            intent: intent
        }
        document.querySelectorAll('#' + intent + ' input')
            .forEach(function (input) {
                res[input.name] = input.value
            })
        return res
    }

    function getOptions(intent) {
        const options = {
            network: 'testnet',
            demo_mode: 1
        }
        if (intent === 'tx') {
            options.prepare = 1 //do not submit the tx, only sign it
        }
        return options
    }

    function invokeIntent(intent) {
        return intentDispatcher.request(getParameters(intent), getOptions(intent))
    }

    function bindSep0007Link(intent) {
        var encodedLink = $('#' + intent + ' .request-encoded')
        if (encodedLink) {
            var params = Object.assign(getParameters(intent), getOptions(intent), appProperties)
            params.callback = 'url:' + location.href
            var query = Object.keys(params).map(key => encodeURIComponent(key) + '=' + encodeURIComponent(params[key]))
            encodedLink.href = location.origin + '/confirm?encoded=' + encodeURIComponent(query.join('&'))
        }
    }

    function bindHandlers(intent, cb) {
        $('#' + intent + ' .request')
            .addEventListener('click', function () {
                $('#' + intent + ' .result').innerText = ''
                invokeIntent(intent)
                    .then(function (data) {
                        showResult(intent, data)
                        cb && cb(data)
                    })
                    .catch(function (err) {
                        showResult(intent, err, true)
                    })
            }, false)
        bindSep0007Link(intent)
    }

    function showResult(intent, data, error) {
        var target = $('#' + intent + ' .result')
        target.className = 'result json'
        target.innerText = JSON.stringify(data, null, '  ')
        hljs.highlightBlock(target)
        if (error) {
            target.className += ' error'
            console.error(data)
        } else {
            console.log(data)
        }
    }

    document.addEventListener('DOMContentLoaded', function () {
        //generate unique asset code
        var asset_code = 'U' + Math.random().toFixed(5).split('.').pop() + (new Date().getTime() % 1000000)
        $('#trust .asset-code').innerText = asset_code
        $('#trust input[name=asset_code]').value = asset_code

        $('#authenticate input[name=token]').value = intentDispatcher.generateAuthenticationToken()

        bindHandlers('public_key')
        bindHandlers('basic_info')
        bindHandlers('sign_msg', function (res) {
            $('#verify_msg button').disabled = false
            $('#verify_msg input[name=message_signature]').value = res.message_signature
            $('#verify_msg input[name=message]').value = $('#sign_msg input[name=message]').value
        })
        bindHandlers('verify_msg')
        bindHandlers('tx')
        bindHandlers('inflation_vote')
        bindHandlers('authenticate')
        bindHandlers('trust')

        if (location.search) { //try to parse information passed in callback
            var query = location.search.substr(1).split('&').reduce(function (query, part) {
                var kv = part.split('=').map(function (v) {
                    return decodeURIComponent(v)
                })
                query[kv[0]] = kv[1]
                return query
            }, {})
            if (query.intent) {
                var block = document.getElementById(query.intent)
                if (block) {
                    showResult(query.intent, query)
                    setTimeout(() => {
                        location.hash = query.intent
                        block.scrollIntoView(true)
                    }, 200)
                }
            }
        }
    }, false)

    //setup syntax highlighter
    hljs.getLanguage('js').k.built_in += ' intent'
    hljs.initHighlightingOnLoad()
})(window, hljs)