const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Настройки
app.use(cors());
app.use(express.json());

// Подключение к MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ MindSpace подключен к MongoDB'))
  .catch(err => console.error('❌ Ошибка подключения:', err));

// Схема данных (как выглядит запись)
const postSchema = new mongoose.Schema({
  title: String,
  mood: String,
  content: String,
  createdAt: { type: Date, default: Date.now }
});

const Post = mongoose.model('Post', postSchema);

// Маршрут (API) для получения всех записей
app.get('/api/posts', async (req, res) => {
  const posts = await Post.find().sort({ createdAt: -1 });
  res.json(posts);
});

// Маршрут для создания новой записи
app.post('/api/posts', async (req, res) => {
  const newPost = new Post(req.body);
  await newPost.save();
  res.json(newPost);
});

const PORT = 5000;
app.listen(PORT, () => console.log(`🚀 Сервер MindSpace на порту ${PORT}`));