//import express
const express = require('express');
//import cors
const cors = require('cors');
//import mongoDb
const port = 7777;
//creating express app
const app = express();
app.use('/api/payments', require('./Routes/paymentRoutes'))
app.use(cors());
app.use(express.json());
app.listen(port, ()=>{
    console.log(`server is running on port ${port}`);
})

