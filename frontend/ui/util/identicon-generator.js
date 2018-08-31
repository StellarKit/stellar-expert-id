import shajs from 'sha.js'
import Identicon from 'identicon.js'

export default function generateIdenticon(src) {
    let code = shajs('sha256').update(src).digest(),
        hex = new Buffer(code).toString('hex')

    let icon = new Identicon(hex, {
        format: 'svg',
        margin: 0.18,
        size: 32
    })

    return icon.toString()
}