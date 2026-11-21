
// ==========================================
// 1. ПОЛУЧАЕМ ЭЛЕМЕНТЫ HTML
// ==========================================

const guessForm = document.getElementById('guess-form');
const guessInput = document.getElementById('guess-input');

const inputMessage = document.getElementById('input-message');

const attemptCount = document.getElementById('attempt-count');
const historyCount = document.getElementById('history-count');

const historyList = document.getElementById('history-list');

const gameStatus = document.getElementById('game-status');

const newGameButton = document.getElementById('new-game-button');


// ==========================================
// 2. СОСТОЯНИЕ ИГРЫ
// ==========================================

let secretNumber = '';

let attempts = [];

let gameFinished = false;


// ==========================================
// 3. ГЕНЕРАЦИЯ СЛУЧАЙНОГО ЧИСЛА
// ==========================================

function generateSecretNumber() {

    const digits = [];

    // Первая цифра не может быть нулём.
    digits.push(String(Math.floor(Math.random() * 9) + 1));

    // Добавляем остальные цифры.
    while (digits.length < 4) {

        const digit = String(Math.floor(Math.random() * 10));

        // Проверяем, что такой цифры ещё нет.
        if (!digits.includes(digit)) {
            digits.push(digit);
        }
    }

    return digits.join('');
}


// ==========================================
// 4. ПРОВЕРКА ВВЕДЁННОГО ЧИСЛА
// ==========================================

function validateGuess(value) {

    // Проверяем, что введено ровно четыре цифры.
    if (!/^[0-9]{4}$/.test(value)) {

        return {
            isValid: false,
            error: 'Введите ровно четыре цифры от 0 до 9.'
        };
    }

    // Проверяем отсутствие повторяющихся цифр.
    if (new Set(value).size !== 4) {

        return {
            isValid: false,
            error: 'Цифры не должны повторяться!'
        };
    }

    return {
        isValid: true,
        error: ''
    };
}


// ==========================================
// 5. ПОДСЧЁТ БЫКОВ И КОРОВ
// ==========================================

function countBullsAndCows(secret, guess) {

    let bulls = 0;
    let cows = 0;

    for (let i = 0; i < 4; i++) {

        // Бык: цифра совпадает и по значению, и по позиции.
        if (secret[i] === guess[i]) {

            bulls++;

        }

        // Корова: цифра есть в числе, но позиция другая.
        else if (secret.includes(guess[i])) {

            cows++;

        }
    }

    return {
        bulls,
        cows
    };
}


// ==========================================
// 6. ПРАВИЛЬНОЕ СКЛОНЕНИЕ СЛОВ
// ==========================================

function getBullsWord(number) {

    if (number === 1) return 'бык';

    if (number >= 2 && number <= 4) return 'быка';

    return 'быков';
}


function getCowsWord(number) {

    if (number === 1) return 'корова';

    if (number >= 2 && number <= 4) return 'коровы';

    return 'коров';
}


function getAttemptsWord(number) {

    const lastTwo = number % 100;
    const lastDigit = number % 10;

    if (lastTwo >= 11 && lastTwo <= 14) {
        return 'попыток';
    }

    if (lastDigit === 1) return 'попытку';

    if (lastDigit >= 2 && lastDigit <= 4) {
        return 'попытки';
    }

    return 'попыток';
}


function getRecordsWord(number) {

    const lastTwo = number % 100;
    const lastDigit = number % 10;

    if (lastTwo >= 11 && lastTwo <= 14) {
        return 'записей';
    }

    if (lastDigit === 1) return 'запись';

    if (lastDigit >= 2 && lastDigit <= 4) {
        return 'записи';
    }

    return 'записей';
}


// ==========================================
// 7. ОТОБРАЖЕНИЕ ИСТОРИИ ПОПЫТОК
// ==========================================

function renderHistory() {

    // Очищаем старую историю на странице.
    historyList.replaceChildren();

    // Если попыток пока нет.
    if (attempts.length === 0) {

        const emptyItem = document.createElement('li');

        emptyItem.className = 'empty-history';

        emptyItem.textContent = 'Здесь появятся твои попытки 🐄';

        historyList.append(emptyItem);

    } else {

        // Показываем последние попытки сверху.
        [...attempts].reverse().forEach((attempt, index) => {

            const item = document.createElement('li');

            // Сохраняем правильную нумерацию попыток.
            const number = document.createElement('span');

            number.className = 'guess-number';

            number.textContent =
                `${attempts.length - index}. ${attempt.guess}`;

            // Результат проверки.
            const result = document.createElement('span');

            result.className = 'result';

            const bulls = document.createElement('strong');

            bulls.textContent =
                `${attempt.bulls} ${getBullsWord(attempt.bulls)}`;

            const cows = document.createElement('strong');

            cows.textContent =
                `${attempt.cows} ${getCowsWord(attempt.cows)}`;

            // Добавляем результат в строку истории.
            result.append(
                bulls,
                document.createTextNode(' · '),
                cows
            );

            item.append(number, result);

            historyList.append(item);

        });

    }

    // Автоматически прокручиваем историю к самой новой попытке.
    historyList.scrollTop = 0;

    // Обновляем счётчики.
    attemptCount.textContent = attempts.length;

    historyCount.textContent =
        `${attempts.length} ${getRecordsWord(attempts.length)}`;
}


// ==========================================
// 8. СООБЩЕНИЯ ДЛЯ ИГРОКА
// ==========================================

function showInputMessage(message, isError = false) {

    inputMessage.textContent = message;

    inputMessage.classList.toggle('error', isError);
}


function setGameStatus(message, isWon = false) {

    gameStatus.classList.toggle('won', isWon);

    // Меняем текст сообщения, сохраняя кружочек-индикатор.
    gameStatus.lastChild.textContent = message;
}


// ==========================================
// 9. ОБРАБОТКА ПОПЫТКИ ИГРОКА
// ==========================================

function handleGuess(event) {

    // Не перезагружаем страницу при отправке формы.
    event.preventDefault();

    // Если игра уже закончилась, ничего не делаем.
    if (gameFinished) return;

    const guess = guessInput.value;

    // Проверяем введённое значение.
    const validation = validateGuess(guess);

    // Если ввод неправильный.
    if (!validation.isValid) {

        showInputMessage(validation.error, true);

        guessInput.focus();

        return;
    }

    showInputMessage('Отлично! Попытка принята 🐮');

    // Считаем количество быков и коров.
    const result = countBullsAndCows(secretNumber, guess);

    // Сохраняем результат в массиве.
    attempts.push({
        guess: guess,
        bulls: result.bulls,
        cows: result.cows
    });

    // Обновляем историю на странице.
    renderHistory();

    // Очищаем поле ввода.
    guessInput.value = '';

    // Проверяем победу.
    if (result.bulls === 4) {

        gameFinished = true;

        // Блокируем поле и кнопку проверки.
        guessInput.disabled = true;

        guessForm.querySelector('button[type="submit"]').disabled = true;

        // Поздравляем игрока!
        setGameStatus(
            `🎉 Победа! Загадано число ${secretNumber}. Угадано за ${attempts.length} ${getAttemptsWord(attempts.length)}!`,
            true
        );

        showInputMessage(
            'Нажми «Начать новую игру», чтобы сыграть ещё раз.'
        );

    } else {

        // Показываем результат текущей попытки.
        setGameStatus(
            `🐮 ${result.bulls} ${getBullsWord(result.bulls)} и ${result.cows} ${getCowsWord(result.cows)}.`
        );

    }

    guessInput.focus();
}


// ==========================================
// 10. НАЧАЛО НОВОЙ ИГРЫ
// ==========================================

function startNewGame() {

    // Генерируем новое загаданное число.
    secretNumber = generateSecretNumber();

    // Очищаем массив попыток.
    attempts = [];

    // Сбрасываем состояние игры.
    gameFinished = false;

    // Разблокируем поле ввода.
    guessInput.disabled = false;

    // Разблокируем кнопку проверки.
    guessForm.querySelector('button[type="submit"]').disabled = false;

    // Очищаем поле.
    guessInput.value = '';

    // Возвращаем начальные сообщения.
    showInputMessage('Цифры не должны повторяться.');

    setGameStatus('🐮 Игра началась. Удачи!');

    // Обновляем историю и счётчики.
    renderHistory();

    // Устанавливаем курсор в поле ввода.
    guessInput.focus();

    // Для отладки можно временно убрать комментарий:
    // console.log('Загаданное число:', secretNumber);
}


// ==========================================
// 11. ОБРАБОТЧИКИ СОБЫТИЙ
// ==========================================

// Нажатие кнопки «Проверить».
guessForm.addEventListener('submit', handleGuess);

// Нажатие кнопки «Начать новую игру».
newGameButton.addEventListener('click', startNewGame);


// ==========================================
// 12. ЗАПУСК ИГРЫ ПРИ ЗАГРУЗКЕ СТРАНИЦЫ
// ==========================================

startNewGame();
