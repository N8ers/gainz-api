const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')
require('dotenv').config()

const indexRouter = require('./routes/index')
const foodRouter = require('./routes/food')
const personRouter = require('./routes/person')
const consumedRouter = require('./routes/consumption')

const app = express()

app.use(cors())
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))

app.use('/', indexRouter)
app.use('/food', foodRouter)
app.use('/person', personRouter)
app.use('/consumed', consumedRouter)

app.use((req, res, next) => {
  const error = new Error('Not found')
  error.status = 404;
  next(error);
})

app.use((error, req, res, next) => {
  res.status(error.status || 500)
  res.json({ 
    error: { 
      message: error.message
    } 
  })
})

app.listen(3000, () => console.log('server running 3000'))