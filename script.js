// URL твоего бэкенда на Render
const API_URL = 'https://mindspace-n6jh.onrender.com/api/posts';

// 1. Функция загрузки истории записей
async function loadHistory() {
    try {
        const response = await fetch(API_URL);
        const posts = await response.json();
        const container = document.getElementById('history-container');
        
        if (!container) return;
        container.innerHTML = ''; 

        // Сортируем: новые записи сверху
        posts.reverse().forEach(post => {
            const card = document.createElement('div');
            card.className = 'history-item';

            // Присвоение класса цвета в зависимости от настроения
            if (post.mood.includes('Радостное')) card.classList.add('mood-joy');
            else if (post.mood.includes('Грустное')) card.classList.add('mood-sadness');
            else if (post.mood.includes('Обычное')) card.classList.add('mood-neutral');
            else card.classList.add('mood-focus'); 

            // Форматирование даты: если сервер прислал дату, показываем её, иначе "Сегодня"
            const dateDisplay = post.createdAt 
                ? new Date(post.createdAt).toLocaleDateString('ru-RU') 
                : 'Сегодня';

            card.innerHTML = `
                <div class="item-text">
                    <h3>${post.title || 'Без названия'}</h3>
                    <small>${post.mood} • ${dateDisplay}</small>
                    <p>${post.content}</p>
                </div>
                <button class="delete-btn" onclick="deletePost('${post._id}')">🗑️</button>
            `;
            container.appendChild(card);
        });
    } catch (err) {
        console.error('Ошибка при загрузке данных:', err);
    }
}

// 2. Функция удаления записи
async function deletePost(id) {
    if (confirm('Удалить эту запись навсегда?')) {
        try {
            const res = await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
            if (res.ok) {
                loadHistory(); 
            }
        } catch (err) {
            console.error('Ошибка при удалении:', err);
        }
    }
}

// 3. Обработка отправки формы
const diaryForm = document.getElementById('diary-form');
if (diaryForm) {
    diaryForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const data = {
            title: document.getElementById('title').value,
            mood: document.getElementById('mood').value,
            content: document.getElementById('content').value
        };

        try {
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });

            if (response.ok) {
                e.target.reset(); 
                loadHistory();    
            }
        } catch (err) {
            console.error('Ошибка при сохранении:', err);
        }
    });
}

// Запуск загрузки при открытии страницы
loadHistory();