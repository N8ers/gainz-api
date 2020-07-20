const express = require('express')
const jwt = require('jsonwebtoken')

const db = require('../database/db')
const { accessTokenSecret } = require('../database/db')
const router = express.Router()

router.get('/', (req, res) => {
  res.json({"route": "CONSUMPTION"})
})

async function validateJWT (req, res, next) {
  console.log('VALIDATE JWT FIRED')
  console.log(req.body)
  let authHeader = req.headers['authorization']
  let token = authHeader && authHeader.split(' ')[1]
  if (token == null) return res.sendStatus(401)

  await jwt.verify(token, accessTokenSecret, (err, user) => {
    if (err) console.log('err ', err)
    if (user) console.log('USER ', user)
  })

  next()
}

router.get('/:date', validateJWT, (req, res) => {

  // let authHeader = req.headers['authorization']
  // let token = authHeader && authHeader.split(' ')[1]
  // if (token == null) return res.sendStatus(401)

  let userId;
  jwt.verify(token, accessTokenSecret, (err, user) => {
    if (err) console.log(err)
    userId = user.id
  })

  console.log('user id ', userId)

  let consumed = `SELECT 
  food_consumption.id, food.name, food.calories, food.protein, food_consumption.servings, food_consumption.sort_order 
  FROM food_consumption
  INNER JOIN food ON food_consumption.food_id=food.id
  WHERE person_id = ($1) AND consumed_at = ($2)
  ORDER BY food_consumption.sort_order `

  db.query(consumed, [userId, req.params.date], (error, dbResponse) => {
    if (error) { 
      res.status(error.status).json({ message: error.message })
    } else {
      res.status(200).json(dbResponse.rows)
    }
  })
})

router.delete('/remove', validateJWT, (req, res) => {
  let id = req.body.consumed_id

  const removeFood = `DELETE FROM food_consumption WHERE id = ($1)`
  db.query(removeFood, [id], (error, dbResponse) => {
    if (error) { 
      res.status(error.status).json({ message: error.message })
    } else {
      res.status(200).json({ message: 'success!' })
    }
  })
})

router.post('/add', validateJWT, (req, res) => {
  let { id, servings, user_id, date, sort_order  } = req.body.payload
  console.log('add')

  const addFood = `INSERT 
  INTO food_consumption (person_id, food_id, consumed_at, servings, sort_order) 
  VALUES ($1, $2, $3, $4, $5)`
  db.query(addFood, [user_id, id, date, servings, sort_order], (error, dbResponse) => {
    if (error) { 
      res.status(error.status).json({ message: error.message })
    } else {
      res.status(200).json({ message: 'success!' })
    }
  })
})

router.put('/consumed_at_reorder', validateJWT, async (req, res) => {
  console.log('re order')
  let {foods} = req.body.payload
  const reorderFoods = `UPDATE food_consumption SET sort_order = ($1) WHERE id = ($2)`

  // The HTTP ERROR HAS TO BE HERE I THINK, I don't think you can loop over a query

  for (let i = 0; i < foods.length; i++) {
    await db.query(reorderFoods, [foods[i].sort_order, foods[i].id], (error, dbResponse) => {
      if (error) { 
        console.log('error')
        res.status(error.status).json({ message: error.message })
      }
      console.log('no error')
    })
  }

  res.status(200).json({ message: 'success!' })
  
  // for (let i = 0; i < foods.length; i++) {
  //   db.query(reorderFoods, [foods[i].sort_order, foods[i].id], (error, dbResponse) => {
  //     console.log('okay cool')
  //     if (error) { 
  //       res.status(error.status).json({ message: error.message })
  //     }
  //   })
  // }
  // res.status(200).json({ message: 'success!' })
})



module.exports = router;