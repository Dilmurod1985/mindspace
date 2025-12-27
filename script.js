const API_URL = 'https://mindspace-n6jh.onrender.com/api/posts';

async function loadHistory() {
    try {
        const response = await fetch(API_URL);
        const posts = await response.json();
        const container = document.getElementById('history-container');
        if (!container) return;
        container.innerHTML = ''; 

        // Новые записи будут в самом верху
        posts.reverse().forEach(post => {
            const card = document.createElement('div');
            card.className = 'history-item';

            if (post.mood.includes('Радостное')) card.classList.add('mood-joy');
            else if (post.mood.includes('Грустное')) card.classList.add('mood-sadness');
            else if (post.mood.includes('Обычное')) card.classList.add('mood-neutral');
            else card.classList.add('mood-focus'); 

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
        console.error('Ошибка:', err);
    }
}

async function deletePost(id) {
    if (confirm('Удалить эту запись?')) {
        await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
        loadHistory();
    }
}

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
    e.target.reset();
    loadHistory();
});
const audio = document.getElementById('bg-audio');
const musicBtn = document.getElementById('music-btn');

musicBtn.addEventListener('click', () => {
    if (audio.paused) {
        audio.play();
        musicBtn.innerText = '⏸️ Пауза';
    } else {
        audio.pause();
        musicBtn.innerText = '🎵 Играть музыку';
    }
});

loadHistory();