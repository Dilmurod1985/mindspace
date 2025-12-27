// script.js

const API_URL = 'https://mindspace-n6jh.onrender.com/api/posts';
const form = document.getElementById('diary-form');
const historyContainer = document.getElementById('history-container');

// Сопоставление настроения из формы с классами CSS
const moodMap = {
    'Радостное': 'joy',       // жёлтый
    'Спокойное': 'focus',     // зелёный
    'Грустное': 'sadness',    // синий
    'Тревожное': 'neutral'    // серый (можно потом заменить на отдельный цвет)
};

// Загрузка всех записей с сервера
async function loadHistory() {
    historyContainer.innerHTML = '<p>Загрузка записей...</p>';
    
    try {
        const response = await fetch(API_URL);
        if (!response.ok) throw new Error('Не удалось загрузить записи');

        let entries = await response.json();

        // Сортируем по дате (от новых к старым)
        entries.sort((a, b) => new Date(b.date) - new Date(a.date));

        historyContainer.innerHTML = '';

        if (entries.length === 0) {
            historyContainer.innerHTML = '<p>Пока нет записей. Создай первую! 🌱</p>';
            return;
        }

        entries.forEach(entry => {
            const item = document.createElement('div');
            item.classList.add('history-item', `mood-${moodMap[entry.mood] || 'neutral'}`);

            item.innerHTML = `
                <div>
                    <h3>${escapeHtml(entry.title)}</h3>
                    <p class="date">${formatDate(entry.date)}</p>
                    <p>${escapeHtml(entry.content).replace(/\n/g, '<br>')}</p>
                </div>
                <button class="delete-btn" data-id="${entry._id}" title="Удалить запись">✕</button>
            `;

            historyContainer.appendChild(item);
        });

        // Обработчики на кнопки удаления
        document.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', deleteEntry);
        });

    } catch (error) {
        console.error(error);
        historyContainer.innerHTML = '<p style="color: #e94560;">Ошибка загрузки записей 😔</p>';
    }
}

// Добавление новой записи
async function addEntry(title, content, mood) {
    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                title,
                content,
                mood,           // отправляем текст настроения (Радостное и т.д.)
                date: new Date().toISOString()
            })
        });

        if (!response.ok) throw new Error('Не удалось сохранить запись');

        form.reset();
        loadHistory(); // обновляем список

    } catch (error) {
        console.error(error);
        alert('Не удалось сохранить запись. Проверь интернет или попробуй позже.');
    }
}
// Ежедневное напоминание в 20:00 (даже если сайт закрыт — через push)
function scheduleDailyPush() {
  const now = new Date();
  const target = new Date();
  target.setHours(20, 0, 0, 0);

  if (now > target) target.setDate(target.getDate() + 1);

  const delayMs = target - now;

  setTimeout(() => {
    // Здесь можно отправить push через бэкенд, но для простоты — локальное уведомление
    if (Notification.permission === 'granted') {
      showNotification('MindSpace', 'Не забудь записать мысли сегодня! 🧠');
    }
    scheduleDailyPush(); // на завтра
  }, delayMs);
}

scheduleDailyPush();

// Удаление записи по _id
async function deleteEntry(event) {
    const id = event.target.dataset.id;

    if (!confirm('Ты уверен, что хочешь удалить эту запись?')) return;

    try {
        const response = await fetch(`${API_URL}/${id}`, {
            method: 'DELETE'
        });

        if (!response.ok) throw new Error('Не удалось удалить');

        loadHistory(); // обновляем список

    } catch (error) {
        console.error(error);
        alert('Ошибка при удалении записи.');
    }
}

// Утилиты
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function formatDate(isoString) {
    const date = new Date(isoString);
    const options = { 
        day: 'numeric', 
        month: 'long', 
        year: 'numeric', 
        hour: '2-digit', 
        minute: '2-digit' 
    };
    return date.toLocaleDateString('ru-RU', options);
}

// Обработка формы
form.addEventListener('submit', (e) => {
    e.preventDefault();

    const title = document.getElementById('title').value.trim();
    const content = document.getElementById('content').value.trim();
    const mood = document.getElementById('mood').value;

    if (title && content) {
        addEntry(title, content, mood);
    }
});
// Уведомления: запрос разрешения при загрузке
async function requestNotificationPermission() {
    if ('Notification' in window && Notification.permission === 'default') {
        const permission = await Notification.requestPermission();
        if (permission === 'granted') {
            console.log('Разрешение на уведомления получено');
        }
    }
}

// Показать уведомление
function showNotification(title, body = '') {
    if (Notification.permission === 'granted') {
        new Notification(title, {
            body: body,
            icon: '/icons/icon-192.png',  // твоя иконка с мозгом
            badge: '/icons/icon-192.png'
        });
    }
}

// Вызываем при загрузке
requestNotificationPermission();
function scheduleDailyReminder() {
    const now = new Date();
    const reminderTime = new Date();
    reminderTime.setHours(20, 0, 0, 0);  // 20:00

    if (now > reminderTime) {
        reminderTime.setDate(reminderTime.getDate() + 1);  // если уже прошло — на завтра
    }

    const delay = reminderTime - now;

    setTimeout(() => {
        // Проверяем, была ли запись сегодня
        checkIfEntryToday().then(hasEntry => {
            if (!hasEntry) {
                showNotification('Пора в MindSpace! 🧠', 'Как прошёл твой день? Зафиксируй мысли прямо сейчас.');
            }
        });
        scheduleDailyReminder();  // планируем следующее
    }, delay);
}

// Проверка, была ли запись сегодня (запрос к API)
async function checkIfEntryToday() {
    try {
        const response = await fetch(API_URL);
        const entries = await response.json();
        const today = new Date().toISOString().split('T')[0];
        return entries.some(entry => entry.date.startsWith(today));
    } catch {
        return false;
    }
}

// Запускаем напоминание при загрузке страницы
if (Notification.permission === 'granted') {
    scheduleDailyReminder();
}// Регистрация Service Worker для PWA и push-уведомлений
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then(reg => {
        console.log('Service Worker зарегистрирован:', reg.scope);
      })
      .catch(err => {
        console.log('Ошибка регистрации SW:', err);
      });
  });
}
// Загружаем записи при открытии страницы
loadHistory();