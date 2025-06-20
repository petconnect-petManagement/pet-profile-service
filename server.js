require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const petRoutes = require('./routes/petRoutes');

const app = express();
const PORT = process.env.PORT || 4000;

// Middlewares
app.use(bodyParser.json());

// Routes
app.use('/pets', petRoutes);

// DB Connection
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  console.log('MongoDB connected');
  app.listen(PORT, () => {
    console.log(`Pet Profile Service running on port ${PORT}`);
  });
}).catch((err) => {
  console.error('MongoDB connection error:', err);
});
