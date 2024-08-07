const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// MongoDB connection
mongoose.connect('mongodb+srv://mariaab:zbAbCaEnD7aVLERS@cluster0.27uaqyf.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => {
  console.log('Connected to MongoDB');
}).catch((error) => {
  console.error('Connection error:', error.message);
});

// Models
const User = require('./models/User');
const Reminder = require('./models/Reminder');

// Routes
const userRoutes = require('./routes/users');
const reminderRoutes = require('./routes/reminders');

app.use('/api/users', userRoutes);
app.use('/api/reminders', reminderRoutes);

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
