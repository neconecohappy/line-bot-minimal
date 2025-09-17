// ---------- 必要なライブラリ ----------
const express = require('express');
const line = require('@line/bot-sdk');
const OpenAI = require('openai');

// ---------- 設定 ----------
const config = {
  channelAccessToken: process.env.CHANNEL_ACCESS_TOKEN, // Renderの環境変数
  channelSecret: process.env.CHANNEL_SECRET,            // Renderの環境変数
};
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY }); // ★OpenAIのキーもRenderに設定

// ---------- LINE & Express ----------
const app = express();
app.use(line.middleware(config));
const client = new line.Client(config);

// ヘルスチェック用
app.get('/', (req, res) => res.send('OK'));

// Webhook
app.post('/webhook', async (req, res) => {
  try {
    await Promise.all(req.body.events.map(handleEvent));
    res.status(200).end();
  } catch (err) {
    console.error(err);
    res.status(500).end();
  }
});

// ---------- ひかり占い師のプロンプト ----------
function buildLoveReadingPrompt(userInput) {
  return `
あなたは優しいAI恋愛特化占い師「ひかり」です。
ユーザーから「相手の名前（ニックネーム可）/ 関係 / 悩み」が送られたら、占い師っぽい文体で前向きに答えてください。
決して後ろ向きなことは言わないでください。絵文字は全体で2つ程度。

必ず次の見出しと順序で、140〜200字にまとめてください。

【今の流れ】（絵文字はここで最大2つ）
【今日の一歩】
【ラッキーカラー】
【応援メッセージ】

ユーザー入力：
「${userInput}」
`;
}

// ---------- イベント処理 ----------
async function handleEvent(event) {
  if (event.type !== 'message' || event.message.type !== 'text') return;

  const userText = event.message.text.trim();
  let replyText;

  try {
    const prompt = buildLoveReadingPrompt(userText);
    const completion = await openai.responses.create({
      model: 'gpt-4.1-mini',
      input: prompt,
    });

    replyText =
      completion?.output?.[0]?.content?.[0]?.text?.trim() ||
      '🔮ひかりです。もう一度「名前/関係/悩み」を送ってくださいね。';
  } catch (e) {
    console.error('OpenAI error:', e);
    replyText = '🔮ひかりです。今日は通信が少し混んでいるみたい。また占わせてくださいね✨';
  }

  return client.replyMessage(event.replyToken, { type: 'text', text: replyText });
}

// ---------- サーバ起動 ----------
const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Listening on ${port}`));


