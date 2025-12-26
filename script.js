const API_URL = 'https://mindspace-n6jh.onrender.com/api/posts';

// Функция для загрузки записей
async function loadHistory() {
    try {
        const response = await fetch(API_URL);
        const posts = await response.json();
        const container = document.getElementById('history-container');
        container.innerHTML = ''; 

        posts.forEach(post => {
            const card = document.createElement('div');
            card.className = 'history-item';

            // Логика выбора цвета по тексту настроения
            if (post.mood.includes('Радостное')) card.classList.add('mood-joy');
            else if (post.mood.includes('Грустное')) card.classList.add('mood-sadness');
            else if (post.mood.includes('Обычное')) card.classList.add('mood-neutral');
            else card.classList.add('mood-focus'); // Для "Спокойного"

            card.innerHTML = `
                <div class="item-text">
                    <h3>${post.title}</h3>
                    <small>${post.mood} • ${new Date(post.createdAt).toLocaleDateString()}</small>
                    <p>${post.content}</p>
                </div>
                <button class="delete-btn" onclick="deletePost('${post._id}')">🗑️</button>
            `;
            container.appendChild(card);
        });
    } catch (err) {
        console.error('Ошибка загрузки данных:', err);
    }
}

// Функция удаления
async function deletePost(id) {
    if (confirm('Удалить эту запись?')) {
        try {
            await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
            loadHistory();
        } catch (err) {
            console.error('Ошибка при удалении:', err);
        }
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

    try {
        await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        e.target.reset();
        loadHistory();
    } catch (err) {
        console.error('Ошибка при сохранении:', err);
    }
});

// Запуск при загрузке страницы
loadHistory();