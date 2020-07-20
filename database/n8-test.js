const PoolClass = require('pg').Pool;

const pool = new PoolClass({
  user: 'ctqtjubp',
  host: 'ruby.db.elephantsql.com',
  database: 'ctqtjubp',
  port: 5432,
  password: 'dRt5l_4ywULod7uwjf7z2Kbl7uZWiL-t'
})

const allFoods = `SELECT * FROM food`

pool.query(allFoods, (err, res) => {
  console.log(res.rows)
})

pool.end();