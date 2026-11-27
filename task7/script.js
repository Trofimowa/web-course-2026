
const postsContainer = document.getElementById('posts');
const searchInput = document.getElementById('search');

const loadingElement = document.getElementById('loading');
const errorElement = document.getElementById('error');
const endMessage = document.getElementById('end-message');

const limit = 10;
let currentPage = 1;

let allPosts = [];
let isLoading = false;
let hasMore = true;
let searchTimer;

async function loadPosts() {
    if (isLoading || !hasMore) return;

    isLoading = true;
    showLoading(true);
    showError('');

    try {
        const response = await fetch(
            `https://jsonplaceholder.typicode.com/posts?_page=${currentPage}&_limit=${limit}`
        );

        if (!response.ok) {
            throw new Error('Не удалось загрузить посты');
        }

        const posts = await response.json();

        allPosts = allPosts.concat(posts);

        currentPage++;

        if (posts.length < limit || allPosts.length >= 100) {
            hasMore = false;
        }

        renderPosts();

    } catch (error) {
        showError('Не удалось загрузить посты. Проверьте подключение к интернету.');
    }

    isLoading = false;
    showLoading(false);

    if (!hasMore) {
        endMessage.classList.remove('hidden');
    }
}

function renderPosts() {
    const searchText = searchInput.value.toLowerCase().trim();

    const filteredPosts = allPosts.filter(post =>
        post.title.toLowerCase().includes(searchText)
    );

    postsContainer.innerHTML = '';

    if (filteredPosts.length === 0 && allPosts.length > 0) {
        postsContainer.innerHTML =
            '<p class="message">Посты не найдены 🌸</p>';
        return;
    }

    filteredPosts.forEach(post => {
        const card = document.createElement('article');
        card.className = 'post';

        card.innerHTML = `
            <div class="post-header">
                <span class="post-id">Пост №${post.id}</span>
                <span class="author">Автор ${post.userId}</span>
            </div>

            <h2>${post.title}</h2>
            <p>${post.body}</p>
        `;

        postsContainer.appendChild(card);
    });
}

function showLoading(show) {
    loadingElement.classList.toggle('hidden', !show);
}

function showError(message) {
    errorElement.textContent = message;
    errorElement.classList.toggle('hidden', !message);
}

function handleSearch() {
    clearTimeout(searchTimer);

    searchTimer = setTimeout(() => {
        renderPosts();
    }, 300);
}

function checkScroll() {
    const scrollPosition =
        window.scrollY + window.innerHeight;

    const pageHeight =
        document.documentElement.scrollHeight;

    if (scrollPosition >= pageHeight - 200) {
        loadPosts();
    }
}

searchInput.addEventListener('input', handleSearch);

window.addEventListener('scroll', checkScroll);

loadPosts();
