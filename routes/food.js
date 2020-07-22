const express = require('express')
const router = express.Router()

const db = require('../database/db')

function validateJWT (req, res, next) {
  console.log('VALIDATE JWT FIRED')
  let authHeader = req.headers['authorization']
  let token = authHeader && authHeader.split(' ')[1]
  if (token == null) return res.sendStatus(401)

  jwt.verify(token, accessTokenSecret, (err, user) => {
    if (err) console.log('err ', err)
    if (user) console.log('USER ', user)
  })

  next()
}

router.get('/all', (req, res) => {
  const allFoods = `SELECT * FROM food`
  db.query(allFoods, (error, dbResponse) => {
    res.status(200).json(dbResponse.rows)
  })
})

router.delete('/remove', validateJWT, (req, res) => {
  let foodId = req.body.id

  const removeFood = `DELETE FROM food WHERE id = ($1)`
  db.query(removeFood, [foodId], (error, dbResponse) => {
    if (error) { 
      res.status(error.status).json({ message: error.message })
    } else {
      res.status(200).json({ message: 'success!' })
    }
  })
})

router.post('/add', validateJWT, (req, res) => {
  let { name, calories, protein } = req.body.body.food

  const allFoods = `INSERT INTO food (name, calories, protein) VALUES ($1, $2, $3)`
  db.query(allFoods, [name, calories, protein], (error, dbResponse) => {
    if (error) { 
      res.status(error.status).json({ message: error.message })
    } else {
      res.status(200).json({ message: 'success!' })
    }
  })
})

module.exports = router;