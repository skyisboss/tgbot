const Telegram = require('./telegram/index')
const express = require('express')
const account = require('./handler/account')

const app = express()
    app.get('/', (req, res) => res.send('Hello World!'))
    app.get('/test', async (req, res) => {
        res.send('done')
    })
    app.get('/account/add', async (req, res) => await account.add(req, res))
    app.get('/account', async (req, res) => await account.account(req, res))

app.listen(3000, () => {
    console.log('Example app listening on port 3000!')
})