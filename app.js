// Пиксельный фон
const canvas = document.getElementById('pixelCanvas');
const ctx = canvas.getContext('2d');

let pixels = [];
const pixelSize = 20;
let mouseX = -1000;
let mouseY = -1000;

function initCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const cols = Math.ceil(canvas.width / pixelSize);
    const rows = Math.ceil(canvas.height / pixelSize);

    pixels = [];
    for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
            pixels.push({
                x: x * pixelSize,
                y: y * pixelSize,
                baseOpacity: Math.random() * 0.3,
                opacity: Math.random() * 0.3,
                pulseSpeed: 0.5 + Math.random() * 1.5,
                pulseOffset: Math.random() * Math.PI * 2
            });
        }
    }
}

function drawPixels() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    pixels.forEach(pixel => {
        const dx = mouseX - (pixel.x + pixelSize / 2);
        const dy = mouseY - (pixel.y + pixelSize / 2);
        const distance = Math.sqrt(dx * dx + dy * dy);
        const maxDistance = 200;

        let targetOpacity;

        if (distance < maxDistance) {
            const influence = 1 - (distance / maxDistance);
            targetOpacity = pixel.baseOpacity * (1 - influence * 0.8);
        } else {
            targetOpacity = pixel.baseOpacity;
        }

        pixel.opacity += (targetOpacity - pixel.opacity) * 0.1;

        ctx.fillStyle = `rgba(80, 80, 80, ${pixel.opacity})`;
        ctx.fillRect(pixel.x, pixel.y, pixelSize - 1, pixelSize - 1);
    });

    requestAnimationFrame(drawPixels);
}

document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
});

window.addEventListener('resize', initCanvas);

initCanvas();
drawPixels();

// Хранилище сниппетов
let snippets = JSON.parse(localStorage.getItem('codeSnippets')) || [];

// Элементы DOM
const addBtn = document.getElementById('addBtn');
const modal = document.getElementById('modal');
const viewModal = document.getElementById('viewModal');
const closeModal = document.getElementById('closeModal');
const closeViewModal = document.getElementById('closeViewModal');
const saveBtn = document.getElementById('saveBtn');
const snippetsList = document.getElementById('snippetsList');
const snippetName = document.getElementById('snippetName');
const codeInput = document.getElementById('codeInput');
const viewTitle = document.getElementById('viewTitle');
const viewCode = document.getElementById('viewCode');
const copyBtn = document.getElementById('copyBtn');
const shareBtn = document.getElementById('shareBtn');
const shareLink = document.getElementById('shareLink');
const shareLinkInput = document.getElementById('shareLinkInput');
const copyLinkBtn = document.getElementById('copyLinkBtn');
const editBtn = document.getElementById('editBtn');
const deleteBtn = document.getElementById('deleteBtn');

let currentSnippetId = null;
let isEditMode = false;

// Инициализация
init();

function init() {
    renderSnippets();
    checkUrlForSnippet();
}

// Проверка URL на наличие ID сниппета
function checkUrlForSnippet() {
    const urlParams = new URLSearchParams(window.location.search);
    const snippetId = urlParams.get('id');

    if (snippetId) {
        const snippet = snippets.find(s => s.id === snippetId);
        if (snippet) {
            openViewModal(snippet);
        }
    }
}

// Генерация уникального ID
function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// Открытие модального окна для добавления
addBtn.addEventListener('click', () => {
    modal.style.display = 'block';
    snippetName.value = '';
    codeInput.value = '';
    currentSnippetId = null;
    isEditMode = false;
    document.getElementById('modalTitle').textContent = 'Новый код';
});

// Закрытие модальных окон
closeModal.addEventListener('click', () => {
    modal.style.display = 'none';
});

closeViewModal.addEventListener('click', () => {
    viewModal.style.display = 'none';
    // Убираем ID из URL при закрытии
    window.history.pushState({}, '', window.location.pathname);
});

window.addEventListener('click', (e) => {
    if (e.target === modal) {
        modal.style.display = 'none';
    }
    if (e.target === viewModal) {
        viewModal.style.display = 'none';
        window.history.pushState({}, '', window.location.pathname);
    }
});

// Сохранение сниппета
saveBtn.addEventListener('click', () => {
    const name = snippetName.value.trim();
    const code = codeInput.value;

    if (!name) {
        alert('Введи название кода!');
        return;
    }

    if (!code) {
        alert('Вставь код!');
        return;
    }

    const snippet = {
        id: currentSnippetId || generateId(),
        name: name,
        code: code,
        createdAt: new Date().toISOString()
    };

    if (currentSnippetId) {
        const index = snippets.findIndex(s => s.id === currentSnippetId);
        snippets[index] = snippet;
    } else {
        snippets.unshift(snippet);
    }

    localStorage.setItem('codeSnippets', JSON.stringify(snippets));
    renderSnippets();
    modal.style.display = 'none';
});

// Отображение списка сниппетов
function renderSnippets() {
    snippetsList.innerHTML = '';

    if (snippets.length === 0) {
        snippetsList.innerHTML = '<p style="text-align: center; color: #666; grid-column: 1/-1;">Пока нет сохраненного кода. Нажми "+" чтобы добавить!</p>';
        return;
    }

    snippets.forEach(snippet => {
        const card = document.createElement('div');
        card.className = 'snippet-card';
        card.innerHTML = `
            <h3>${escapeHtml(snippet.name)}</h3>
            <div class="snippet-preview">${escapeHtml(snippet.code.substring(0, 150))}</div>
        `;

        card.addEventListener('click', () => openViewModal(snippet));
        snippetsList.appendChild(card);
    });
}

// Открытие модального окна просмотра
function openViewModal(snippet) {
    viewTitle.textContent = snippet.name;

    // Сбрасываем предыдущую подсветку
    viewCode.className = '';
    viewCode.removeAttribute('data-highlighted');
    viewCode.textContent = snippet.code;
    currentSnippetId = snippet.id;

    // Применяем подсветку синтаксиса
    if (typeof hljs !== 'undefined') {
        hljs.highlightElement(viewCode);
    }

    // Обновляем URL
    const url = `${window.location.origin}${window.location.pathname}?id=${snippet.id}`;
    window.history.pushState({}, '', url);
    shareLinkInput.value = url;

    viewModal.style.display = 'block';
    shareLink.style.display = 'none';
}

// Копирование кода
copyBtn.addEventListener('click', () => {
    const code = viewCode.textContent;
    navigator.clipboard.writeText(code).then(() => {
        const originalText = copyBtn.textContent;
        copyBtn.textContent = 'Скопировано!';
        setTimeout(() => {
            copyBtn.textContent = originalText;
        }, 2000);
    });
});

// Показать ссылку для шаринга
shareBtn.addEventListener('click', () => {
    shareLink.style.display = shareLink.style.display === 'none' ? 'flex' : 'none';
});

// Копирование ссылки
copyLinkBtn.addEventListener('click', () => {
    shareLinkInput.select();
    navigator.clipboard.writeText(shareLinkInput.value).then(() => {
        const originalText = copyLinkBtn.textContent;
        copyLinkBtn.textContent = 'Скопировано!';
        setTimeout(() => {
            copyLinkBtn.textContent = originalText;
        }, 2000);
    });
});

// Экранирование HTML
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Кнопка изменить
editBtn.addEventListener('click', () => {
    const snippet = snippets.find(s => s.id === currentSnippetId);
    if (snippet) {
        viewModal.style.display = 'none';
        modal.style.display = 'block';
        snippetName.value = snippet.name;
        codeInput.value = snippet.code;
        isEditMode = true;
        document.getElementById('modalTitle').textContent = 'Изменить код';
    }
});

// Кнопка удалить
deleteBtn.addEventListener('click', () => {
    if (confirm('Точно удалить этот код?')) {
        snippets = snippets.filter(s => s.id !== currentSnippetId);
        localStorage.setItem('codeSnippets', JSON.stringify(snippets));
        renderSnippets();
        viewModal.style.display = 'none';
        window.history.pushState({}, '', window.location.pathname);
    }
});

// Обработка навигации браузера
window.addEventListener('popstate', () => {
    checkUrlForSnippet();
});
