const jwt = require('jsonwebtoken')

const { accessTokenSecret } = require('./database/db')

async function validateJWT (req, res, next) {
  let authHeader = req.headers['authorization']
  let token = authHeader && authHeader.split(' ')[1]
  if (token == null) return res.sendStatus(401)

  await jwt.verify(token, accessTokenSecret, (err, user) => {
    if (err) console.log('err ', err)
    req["body"]
    req.body["userId"] = user.id
  })

  next()
}

module.exports.validateJWT = validateJWT;