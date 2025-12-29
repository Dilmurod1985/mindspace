// script.js — основной скрипт MindSpace (обновлённая версия 2025)

const API_URL = '/api/posts'; // Для Vercel serverless API

const titleInput = document.getElementById('title');
const moodSelect = document.getElementById('mood');
const contentInput = document.getElementById('content');
const addBtn = document.getElementById('add-btn');
const historyList = document.getElementById('history-list');

let entries = [];

// Безопасный вывод текста (защита от XSS)
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Надёжное форматирование даты (работает с createdAt и старым date)
function formatDate(isoString) {
    if (!isoString) return '';

    const date = new Date(isoString);
    if (isNaN(date.getTime())) return '';

    const options = {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    };

    return date.toLocaleDateString('ru-RU', options);
}

// Загрузка записей с сервера
async function loadHistory() {
    historyList.innerHTML = '<p>Загрузка...</p>';
    try {
        const response = await fetch(API_URL);
        if (!response.ok) throw new Error('Ошибка сети');
        entries = await response.json();

        if (entries.length === 0) {
            historyList.innerHTML = '<p>Пока нет записей. Начни прямо сейчас!</p>';
            return;
        }

        historyList.innerHTML = '';
        entries.forEach(entry => {
            const item = document.createElement('div');
            item.className = 'entry-item';
            item.innerHTML = `
                <div class="entry-header">
                    <h3>${escapeHtml(entry.title)}</h3>
                    <button class="delete-btn" data-id="${entry._id}">×</button>
                </div>
                <p class="date">${formatDate(entry.createdAt || entry.date || '')}</p>
                <p class="content">${escapeHtml(entry.content).replace(/\n/g, '<br>')}</p>
                <div class="mood-indicator mood-${entry.mood.toLowerCase()}"></div>
            `;
            historyList.appendChild(item);
        });

        // Добавляем обработчики удаления
        document.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', deleteEntry);
        });
    } catch (error) {
        historyList.innerHTML = '<p>Ошибка загрузки. Проверь интернет.</p>';
        console.error(error);
    }
}

// Добавление новой записи
async function addEntry() {
    const title = titleInput.value.trim();
    const content = contentInput.value.trim();
    const mood = moodSelect.value;

    if (!title || !content) {
        alert('Заполни заголовок и текст!');
        return;
    }

    const newEntry = {
        title,
        content,
        mood,
        createdAt: new Date().toISOString()
    };

    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newEntry)
        });

        if (!response.ok) throw new Error('Ошибка сохранения');

        const savedEntry = await response.json();
        entries.unshift(savedEntry);
        renderEntries();

        // Очистка формы
        titleInput.value = '';
        contentInput.value = '';
        moodSelect.value = 'радостное';

        // Уведомление
        showNotification('Запись сохранена! 🧠', 'Твои мысли теперь в MindSpace навсегда.');

    } catch (error) {
        alert('Не удалось сохранить. Проверь интернет.');
        console.error(error);
    }
}

// Удаление записи
async function deleteEntry(event) {
    const id = event.target.dataset.id;
    if (!id || !confirm('Удалить эту запись?')) return;

    try {
        const response = await fetch(`${API_URL}?id=${id}`, {
            method: 'DELETE'
        });

        if (!response.ok) throw new Error('Ошибка удаления');

        entries = entries.filter(entry => entry._id !== id);
        renderEntries();
    } catch (error) {
        alert('Не удалось удалить.');
        console.error(error);
    }
}

// Перерисовка списка (для обновления после удаления/добавления)
function renderEntries() {
    historyList.innerHTML = '';
    if (entries.length === 0) {
        historyList.innerHTML = '<p>Пока нет записей.</p>';
        return;
    }

    entries.forEach(entry => {
        const item = document.createElement('div');
        item.className = 'entry-item';
        item.innerHTML = `
            <div class="entry-header">
                <h3>${escapeHtml(entry.title)}</h3>
                <button class="delete-btn" data-id="${entry._id}">×</button>
            </div>
            <p class="date">${formatDate(entry.createdAt || entry.date || '')}</p>
            <p class="content">${escapeHtml(entry.content).replace(/\n/g, '<br>')}</p>
            <div class="mood-indicator mood-${entry.mood.toLowerCase()}"></div>
        `;
        historyList.appendChild(item);
    });

    document.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', deleteEntry);
    });
}

// Уведомления
function showNotification(title, body = '') {
    if (Notification.permission === 'granted') {
        new Notification(title, {
            body,
            icon: '/icons/icon-192.png'
        });
    }
}

async function requestNotificationPermission() {
    if ('Notification' in window && Notification.permission === 'default') {
        await Notification.requestPermission();
    }
}

// Регистрация Service Worker для PWA
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then(reg => console.log('SW зарегистрирован:', reg))
            .catch(err => console.log('SW ошибка:', err));
    });
}

// Запуск
document.addEventListener('DOMContentLoaded', () => {
    requestNotificationPermission();
    loadHistory();
    addBtn.addEventListener('click', addEntry);
});