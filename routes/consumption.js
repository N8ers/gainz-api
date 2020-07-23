const express = require('express')

const db = require('../database/db')
const auth = require('../auth')
const router = express.Router()

router.get('/', (req, res) => {
  res.json({"route": "CONSUMPTION"})
})

router.get('/:date', auth.validateJWT, (req, res) => {

  let userId = req.body.userId

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
      console.log(dbResponse.rows)
      res.status(200).json(dbResponse.rows)
    }
  })
})

router.delete('/remove', auth.validateJWT, (req, res) => {
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

router.post('/add', auth.validateJWT, (req, res) => {
  let { id, servings, date, sort_order  } = req.body.payload
  let userId = req.body.userId

  const addFood = `INSERT 
  INTO food_consumption (person_id, food_id, consumed_at, servings, sort_order) 
  VALUES ($1, $2, $3, $4, $5)`
  db.query(addFood, [userId, id, date, servings, sort_order], (error, dbResponse) => {
    if (error) { 
      res.status(error.status).json({ message: error.message })
    } else {
      res.status(200).json({ message: 'success!' })
    }
  })
})

router.put('/consumed_at_reorder', auth.validateJWT, async (req, res) => {
  console.log('re order')
  let {foods} = req.body.payload
  const reorderFoods = `UPDATE food_consumption SET sort_order = ($1) WHERE id = ($2)`

  for (let i = 0; i < foods.length; i++) {
    await db.query(reorderFoods, [foods[i].sort_order, foods[i].id], (error, dbResponse) => {
      if (error) { 
        res.status(error.status).json({ message: error.message })
      }
    })
  }

  res.status(200).json({ message: 'success!' })
})



module.exports = router;