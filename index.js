const  connectToMongo = require('./db');
const express = require('express')


connectToMongo();

const app = express()
const port = 5000

//Available Routes
app.use('/api/auth',require('./routes/auth'))


app.listen(port, () => {
    console.log(`Backend listening at http://localhost:${port}`)
  })