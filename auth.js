const jwt = require('jsonwebtoken')

const { accessTokenSecret } = require('./database/db')

async function validateJWT (req, res, next) {
  let authHeader = req.headers['authorization']
  let token = authHeader && authHeader.split(' ')[1]
  if (token == null) return res.sendStatus(401)

  await jwt.verify(token, accessTokenSecret, (err, user) => {
    console.log('jwt verification error: ', err)
    if (err) return res.status(403).send({ error: err })

    console.log(user)
    req["body"]
    req.body["userId"] = user.id
    next()
  })
}

module.exports.validateJWT = validateJWT;