const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
const port = process.env.PORT || 5001;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));


// בדיקה אם תיקיית 'uploads' קיימת, ואם לא, ליצור אותה
const uploadPath = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadPath)) {
  fs.mkdirSync(uploadPath);
  console.log(`Created uploads directory at ${uploadPath}`);
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const filename = `${Date.now()}_${file.originalname}`;
    console.log(`Saving file as ${filename}`);
    cb(null, filename);
  },
});

const upload = multer({ storage });

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
const reminderRoutes = require('./routes/reminders')(upload);

app.use('/api/users', userRoutes);
app.use('/api/reminders', reminderRoutes);

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
