// index.js
const express = require('express');
const cors = require('cors'); // Import cors
const bodyParser = require('body-parser');

const { Client, GatewayIntentBits } = require('discord.js');
require('dotenv').config();

// Load environment variables
const TOKEN = process.env.DISCORD_TOKEN;

// Set up the Express app
const app = express();
app.use(express.json()); // For parsing application/json
// Use CORS middleware
app.use(cors());
// Middleware to parse JSON bodies
app.use(bodyParser.json());

app.get('/', async (req, res) => {
  try {
    const channel = client.channels.cache.find(ch => ch.name === 'general');
    if (channel) {
      await channel.send('Welcome from Express!');
      res.json({ running: true });
    } else {
      res.status(404).json({ error: 'Channel not found' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET route to read messages from a specific channel
app.get('/read', async (req, res) => {
  const { channelName, limit = 10 } = req.query;

  if (!channelName) {
    return res.status(400).json({ error: 'Channel name is required.' });
  }

  try {
    const channel = client.channels.cache.find(ch => ch.name === channelName);

    if (!channel) {
      return res.status(404).json({ error: 'Channel not found.' });
    }

    const messages = await channel.messages.fetch({ limit: parseInt(limit) });

    const messageContents = messages.map(msg => ({ content: msg.content, author: msg.author.tag}));

    res.json({ messages: messageContents });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch messages.' });
  }
});

// POST route to handle blog posts
app.post('/send', async (req, res) => {
  const { title, content, date, channelName } = req.body;

  if (!title || !content || !date) {
    return res.status(400).json({ error: 'Title, content, and date are required.' });
  }

  try {
    // Here you can handle the blog post data (e.g., save to database)
    console.log('Received blog post:', { title, content, date });

    const channel = client.channels.cache.find(ch => ch.name === channelName);
    if (channel) {
      await channel.send(JSON.stringify({title, content, date}));
      res.json({ success: 'Blog post received.' });
    } else {
      res.status(404).json({ error: 'Channel not found' });
    }

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to process blog post.' });
  }
});

app.listen(8000, () => {
  console.log('Express server running on http://localhost:8000');
});

// Set up the Discord client
const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent]
});

client.once('ready', () => {
  console.log(`Logged in as ${client.user.tag}`);
  const channel = client.channels.cache.find(ch => ch.name === 'general');
  if (channel) {
    channel.send('Bot is online!');
  }
});

// Login to Discord
client.login(TOKEN);
