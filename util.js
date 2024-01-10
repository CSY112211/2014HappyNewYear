
const fs = require('fs')

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getComplete() {
    const content = fs.readFileSync('./complete.json', 'utf-8');
    if (content.length === 0) {
        return {}

    }
    return JSON.parse(content);
}

module.exports = {
    getRandomInt,
    getComplete
}
