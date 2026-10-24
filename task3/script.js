
let todos = [];

let currentFilter = 'all';

const todoForm = document.getElementById('todo-form');
const todoInput = document.getElementById('todo-input');
const todoList = document.getElementById('todo-list');
const errorMessage = document.getElementById('error-message');
const activeCountEl = document.getElementById('active-count');
const completedCountEl = document.getElementById('completed-count');
const filterBtns = document.querySelectorAll('.filter-btn');

todoForm.addEventListener('submit', handleAddTodo);

filterBtns.forEach((btn) => {
    btn.addEventListener('click', (e) => {
        filterBtns.forEach((b) => b.classList.remove('active'));
        e.target.classList.add('active');
        currentFilter = e.target.dataset.filter;
        render();
    });
});

function handleAddTodo(event) {
    event.preventDefault();
    
    const text = todoInput.value.trim();

    if (!text) {
        errorMessage.classList.remove('hidden');
        return;
    }

    errorMessage.classList.add('hidden');

    const newTodo = {
        id: Date.now(),
        text: text,
        completed: false
    };

    todos.push(newTodo);
    todoInput.value = '';
    render();
}

function toggleTodo(id) {
    todos = todos.map((todo) => {
        if (todo.id === id) {
            return { ...todo, completed: !todo.completed };
        }
        return todo;
    });
    render();
}

function deleteTodo(id) {
    todos = todos.filter((todo) => todo.id !== id);
    render();
}

function render() {

    todoList.innerHTML = '';

    const filteredTodos = todos.filter((todo) => {
        if (currentFilter === 'active') return !todo.completed;
        if (currentFilter === 'completed') return todo.completed;
        return true; // 'all'
    });

    filteredTodos.map((todo) => {
        const li = document.createElement('li');
        li.className = 'todo-item';

        const contentDiv = document.createElement('div');
        contentDiv.className = 'todo-item-content';

        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.className = 'todo-checkbox';
        checkbox.checked = todo.completed;
        checkbox.addEventListener('change', () => toggleTodo(todo.id));

        const textSpan = document.createElement('span');
        textSpan.className = 'todo-text';
        if (todo.completed) {
            textSpan.classList.add('completed');
        }
        textSpan.textContent = todo.text;

        contentDiv.appendChild(checkbox);
        contentDiv.appendChild(textSpan);

        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'delete-btn';
        deleteBtn.textContent = 'Удалить';
        deleteBtn.addEventListener('click', () => deleteTodo(todo.id));

        li.appendChild(contentDiv);
        li.appendChild(deleteBtn);

        return li;
    }).forEach((liElement) => {
        todoList.appendChild(liElement);
    });

    const activeCount = todos.filter((t) => !t.completed).length;
    const completedCount = todos.filter((t) => t.completed).length;

    activeCountEl.textContent = activeCount;
    completedCountEl.textContent = completedCount;
}

render();