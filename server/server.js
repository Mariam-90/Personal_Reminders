const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
app.use(cors());
app.use(bodyParser.json());

let reminders = [];
let id = 1;

app.get('/reminders', (req, res) => {
  res.json(reminders);
});

app.post('/reminders', (req, res) => {
  const { text, date } = req.body;
  const reminder = { id: id++, text, date };
  reminders.push(reminder);
  res.json(reminder);
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
