const telegram = require('../telegram/index')
const {response} = require('../common/helper')

const accountList = []
const account =  {
    account: async(req, res)=>{
    },
    add: async (req, res) => {
        if (req.query?.account) {
            const add = new telegram({account: req.query?.account})
            accountList.push(add)
            response.ok(res)
        } else {
            response.error(res, '账户必填')
        }
    },
    delete: async (req, res) => {},
    login: async () => {},
    logout: async (req, res) => {},
}

module.exports = account;