const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const routes = require('./routes');
const connectDB = require('./config/db');
require('dotenv').config();

const app = express();

app.use(cors({
  origin: 'http://localhost:5173', 
  credentials: true
}));
app.use(cookieParser());
app.use(bodyParser.json());

app.use('/api', routes);

app.get('/', (req, res) => {
  res.send('Welcome to the API');
});

const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}).catch(err => {
  console.error('Failed to connect to the database', err);
});