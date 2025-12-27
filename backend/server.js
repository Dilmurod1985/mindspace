const express = require('express');
const cors = require('cors');
require('dotenv').config();
const mongoose = require('mongoose');

const app = express();

// Настройки
app.use(cors());                    // Разрешаем запросы с фронтенда
app.use(express.json());            // Парсим JSON в body

// Подключение к MongoDB
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('MindSpace подключен к MongoDB'))
    .catch(err => console.error('Ошибка подключения:', err));

// Схема данных
const postSchema = new mongoose.Schema({
    title: String,
    content: String,
    mood: String,
    createdAt: { type: Date, default: Date.now }
});

const Post = mongoose.model('Post', postSchema);

// === МАРШРУТЫ API ===

// GET — получить все записи (от новых к старым)
app.get('/api/posts', async (req, res) => {
    try {
        const posts = await Post.find().sort({ createdAt: -1 });
        res.json(posts);
    } catch (err) {
        res.status(500).json({ error: 'Ошибка сервера' });
    }
});

// POST — создать новую запись
app.post('/api/posts', async (req, res) => {
    try {
        const { title, content, mood, date } = req.body;

        const newPost = new Post({
            title,
            content,
            mood,
            createdAt: date ? new Date(date) : Date.now()  // используем дату из фронтенда или текущую
        });

        await newPost.save();
        res.status(201).json(newPost);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Не удалось сохранить запись' });
    }
});

// DELETE — удалить запись по ID
app.delete('/api/posts/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const deleted = await Post.findByIdAndDelete(id);

        if (!deleted) {
            return res.status(404).json({ error: 'Запись не найдена' });
        }

        res.json({ message: 'Запись удалена' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Ошибка при удалении' });
    }
});

// Запуск сервера
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Сервер MindSpace запущен на порту ${PORT}`);
});