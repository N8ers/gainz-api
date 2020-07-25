const express = require('express')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken');
const router = express.Router()

const db = require('../database/db')

const saltRounds = 10;

router.put('/login', (req, res) => {
  let { email, password } = req.body.payload;

  const login = `SELECT * FROM persons WHERE email = ($1)`

  let dbUser;

  db.query(login, [email], async (error, dbResponse) => {
    if (error) {
      res.status(error.status).json({ message: error.message })
      return
    } 

    console.log('dbResp', dbResponse.rows[0])

    dbUser = {
      id: dbResponse.rows[0].id,
      name: dbResponse.rows[0].name,
      email: dbResponse.rows[0].email,
    }

    if (dbUser === dbResponse.rows[0]) {
      res.json({ message: 'email not registered' })
      return
    } 
    
    let passwordCheck = await bcrypt.compare(password, dbResponse.rows[0].password)
    if (passwordCheck) {
      
      let myJWT = jwt.sign({ 
        email: dbUser.email,
        id: dbUser.id,
        name: dbUser.name 
      }, db.accessTokenSecret)

      res.status(200).json({ 
        userData: dbUser,
        jwt: myJWT
      })
    } else {
      res.json({ message: 'email or password might be wrong' })
    }
  })
})

router.put('/signup', async (req, res) => {
  let { email, userName, password } = req.body.payload;

  let checkEmail = `SELECT * FROM persons WHERE email = ($1)`
  db.query(checkEmail, [email], async (error, dbResponse) => {
    console.log('ERROR: ', error)
    if (dbResponse.rows) {
      res.json({ message: 'email already in use' })
      return
    }
  })

  let setNewUser = `INSERT INTO persons (email, name, password) VALUES ($1, $2, $3)`
  let hashedPW = await bcrypt.hash(password, saltRounds)
  db.query(setNewUser, [email, userName, hashedPW], (error, dbResponse) => {
    console.log('second query')
    if (error) {
      console.log('error ', error)
      res.status(error.status).json({ message: error.message })
    } else {
      res.status(200)
    }
  })
})

router.get('/checkJWT', async (req, res) => {
  try {
    let authHeader = req.headers['authorization']
    let token = authHeader && authHeader.split(' ')[1]
    if (token == null) return res.sendStatus(401)
  
    await jwt.verify(token, db.accessTokenSecret, (err, user) => {
      if (err) console.log('err ', err)
      if (user) res.json({ user })
    })
  }
  catch {
    console.log("catch! - jk it isn't something good")
  }
})

module.exports = router;