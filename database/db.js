const { Pool } = require('pg');

const pool = new Pool({
  user: process.env.USER,
  host: process.env.HOST,
  database: process.env.DATABASE,
  port: 5432,
  password: process.env.PASSWORD,
  max: 20
})

const accessTokenSecret = process.env.ACCESS_TOKEN_SECRET

module.exports = {
  query: (queryText, params, callback) => {
    return pool.query(queryText, params, callback)
  },
  accessTokenSecret
}
