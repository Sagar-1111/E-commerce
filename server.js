const express = require('express');
const morgan = require('morgan');
const mongoose = require('mongoose');

const app = express();

mongoose.connect('mongodb://user:root@ds147274.mlab.com:47274/ecommerce', err => {
  if(err){
    console.log('err', err);
  }
  console.log('Connected to Database');
})

app.use(morgan('dev'));

app.listen(3050, err => {
  if(err) throw err;
  console.log("listening on 3050");
});
