require('dotenv').config();
const express = require('express');
const app = express();
const morgan = require('morgan');
const cors = require('cors');
const { addRecord, updateRecord, deleteRecord } = require('./routes');

const {json, urlencoded } = express
app.use(urlencoded({ extended: false }));
app.use(json());


app.use(morgan('dev'));
app.use(cors());

app.use('/api/create', addRecord)
app.use('/api/update/:farmerId', updateRecord)
app.use('/api/delete/:farmerId', deleteRecord)

app.use((req, res, next) => {
  const error = new Error('Not Found');
  error.status = 404;
  next(error);
});

// eslint-disable-next-line no-unused-vars
app.use((error, req, res, next) => {
  res.status(error.status || 500);
  res.json({
    error: {
      message: error.message,
    },
  });
});

app.listen(4444, () => console.log('Server is running on port', 4444));


