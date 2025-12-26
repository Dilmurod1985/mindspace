const API_URL = 'http://localhost:5000/api/posts';

// Функция для загрузки записей из MongoDB
async function loadHistory() {
    try {
        const response = await fetch(API_URL);
        const posts = await response.json();
        const container = document.getElementById('history-container');
        container.innerHTML = ''; // Очищаем перед обновлением

        posts.forEach(post => {
            const card = document.createElement('div');
            card.className = 'history-item';
            card.innerHTML = `
                <h3>${post.title}</h3>
                <small>${post.mood} • ${new Date(post.createdAt).toLocaleDateString()}</small>
                <p>${post.content}</p>
            `;
            container.appendChild(card);
        });
    } catch (err) {
        console.error('Ошибка загрузки данных:', err);
    }
}

// Сохранение новой записи
document.getElementById('diary-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const data = {
        title: document.getElementById('title').value,
        mood: document.getElementById('mood').value,
        content: document.getElementById('content').value
    };

    await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    });

    e.target.reset(); // Очистить форму
    loadHistory(); // Обновить список
});

// Загружаем при старте
loadHistory();