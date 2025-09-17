const express = require('express');
const line = require('@line/bot-sdk');

const config = {
  channelAccessToken: process.env.CHANNEL_ACCESS_TOKEN, // Renderの環境変数に設定
  channelSecret: process.env.CHANNEL_SECRET,            // Renderの環境変数に設定
};

const app = express();
app.use(line.middleware(config));           // 署名検証＆bodyパース
const client = new line.Client(config);

// ヘルスチェック用（任意）
app.get('/', (req, res) => res.send('OK'));

app.post('/webhook', async (req, res) => {
  try {
    await Promise.all(req.body.events.map(handleEvent));
    res.status(200).end();
  } catch (e) {
    console.error(e);
    res.status(500).end();
  }
});

async function handleEvent(event) {
  if (event.type !== 'message' || event.message.type !== 'text') return;
  const text = event.message.text;
  const reply = { type: 'text', text: `🔮「${text}」はきっと良い方向に進むよ✨` };
  return client.replyMessage(event.replyToken, reply);
}

const port = process.env.PORT || 3000;    // RenderはPORTを環境変数で渡す
app.listen(port, () => console.log(`Listening on ${port}`));

