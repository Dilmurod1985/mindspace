// 1. Константы и настройки
const API_URL = 'https://mindspace-n6jh.onrender.com/api/posts';

// 2. Инициализация элементов плеера
const audio = document.getElementById('bg-audio');
const musicBtn = document.getElementById('music-btn');
const soundSelect = document.getElementById('sound-select');
const volumeControl = document.getElementById('volume-control');
const localUpload = document.getElementById('local-upload');
const remoteUrlInput = document.getElementById('remote-url');

// 3. Функции для работы с заметками (История)
async function loadHistory() {
    try {
        const response = await fetch(API_URL);
        const posts = await response.json();
        const historyContainer = document.getElementById('history-container');
        
        if (!historyContainer) return; 

        historyContainer.innerHTML = '';

        posts.forEach(post => {
            // Определяем цвет боковой полоски в зависимости от настроения
            let moodColor = '#4ecca3'; // По умолчанию зеленый
            if (post.mood === 'Грустное') moodColor = '#ff4b5c';
            if (post.mood === 'Спокойное') moodColor = '#4592af';
            if (post.mood === 'Радостное') moodColor = '#f9d342';

            const card = document.createElement('div');
            card.className = 'history-card';
            // Добавляем стиль бордера прямо здесь, чтобы вернуть цвет настроения
            card.style.borderLeft = `10px solid ${moodColor}`;
            
            card.innerHTML = `
                <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                    <h3 style="margin: 0; color: white;">${post.title}</h3> 
                    <button onclick="deletePost('${post._id}')" style="background:none; border:none; cursor:pointer; font-size:18px;">🗑️</button>
                </div>
                <p style="font-size: 0.8em; color: #888; margin: 5px 0;">${post.mood} • ${new Date(post.createdAt).toLocaleString()}</p>
                <p style="margin-top: 10px;">${post.content}</p>
            `;
            historyContainer.appendChild(card);
        });
    } catch (error) {
        console.error('Ошибка загрузки истории:', error);
    }
}

// Функция удаления заметки
async function deletePost(id) {
    if (confirm('Удалить эту запись?')) {
        await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
        loadHistory();
    }
}

// 4. Логика Плеера
if (musicBtn && audio) {
    
    // Воспроизведение / Пауза
    musicBtn.addEventListener('click', () => {
        if (!audio.src) {
            alert("Сначала выбери звук или вставь ссылку!");
            return;
        }
        
        if (audio.paused) {
            audio.play();
            musicBtn.innerText = '⏸️ Пауза';
            musicBtn.classList.add('pulse-animation');
        } else {
            audio.pause();
            musicBtn.innerText = '🎵 Играть';
            musicBtn.classList.remove('pulse-animation');
        }
    });

    // Смена встроенных звуков
    if (soundSelect) {
        soundSelect.addEventListener('change', () => {
            audio.src = soundSelect.value;
            if (!audio.paused) audio.play();
        });
    }

    // Загрузка файла с компьютера
    if (localUpload) {
        localUpload.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                audio.src = URL.createObjectURL(file);
                audio.play();
                musicBtn.innerText = '⏸️ Пауза';
                musicBtn.classList.add('pulse-animation');
            }
        });
    }

    // Ссылка из интернета (.mp3)
    if (remoteUrlInput) {
        remoteUrlInput.addEventListener('change', (e) => {
            const url = e.target.value.trim();
            if (url) {
                audio.src = url;
                audio.play()
                    .then(() => {
                        musicBtn.innerText = '⏸️ Пауза';
                        musicBtn.classList.add('pulse-animation');
                    })
                    .catch(() => alert("Не удалось проиграть ссылку. Проверь, что это прямой путь к .mp3"));
            }
        });
    }

    // Громкость
    if (volumeControl) {
        volumeControl.addEventListener('input', (e) => {
            audio.volume = e.target.value;
        });
    }
}

// 5. Обработка формы создания записи
const diaryForm = document.getElementById('diary-form');
if (diaryForm) {
    diaryForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const postData = {
            title: document.getElementById('title').value,
            mood: document.getElementById('mood').value,
            content: document.getElementById('content').value
        };

        await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(postData)
        });

        diaryForm.reset();
        loadHistory();
    });
}

// Запуск истории при загрузке страницы
loadHistory();