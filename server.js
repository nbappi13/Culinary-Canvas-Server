const express = require('express');
const cors = require('cors');
require('dotenv').config();
const connectDB = require('./config/db');
const routes = require('./routes/index');

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.send('This Is Project-11');
});

app.use('/api', routes);

app.listen(port, () => {
  console.log(`Project-11 is connecting at: ${port}`);
  connectDB().catch(console.dir);
});