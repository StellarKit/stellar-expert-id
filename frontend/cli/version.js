const fs = require('fs'),
    {version} = require('../package')

/**
 * Process the contents of file using regex-based search-replace.
 * @param {String} filePath - File to process.
 * @param {RegExp} search - Regex search pattern.
 * @param {String} replace - Replacement string.
 */
function replaceInFile(filePath, search, replace) {
    let tmp = filePath + `.tmp`,
        //read and replace file contents
        content = fs.readFileSync(filePath, 'utf8').replace(search, replace)
    //write temp file contents
    fs.writeFileSync(tmp, content, 'utf8')
    //replace the original file with temp file
    fs.renameSync(tmp, filePath)
}

//bump version
const [major, minor, build] = version.split('.'),
    currentVersion = [major, minor, parseInt(build) + 1].join('.')
//bump package.json version
replaceInFile('./package.json', /"version":\s?"[\d.]+"/, `"version": "${currentVersion}"`)

//update version in index.html
replaceInFile('./public/index.html', /\?v=[\d.]+/gi, '?v=' + currentVersion)