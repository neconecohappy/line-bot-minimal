const express = require('express');
const app = express();
app.use(express.json());

app.post('/webhook', (req, res) => {
  const events = req.body.events;
  if (!events || events.length === 0) {
    return res.status(200).send('No events');
  }
  const event = events[0];
  console.log('Received:', event);
  res.status(200).send('OK');
});

app.listen(3000, () => console.log('Bot is running'));
const express = require('express');
const bodyParser = require('body-parser');
const app = express();

app.use(bodyParser.json());

app.post('/webhook', (req, res) => {
  console.log(req.body.events);
  res.status(200).send('OK');
});

app.listen(3000, () => {
  console.log('LINE bot is running on port 3000');
});
