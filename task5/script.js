
const buttons = document.querySelectorAll('.color-button');
const startButton = document.getElementById('start-button');
const message = document.getElementById('message');
const level = document.getElementById('level');

let sequence = [];
let inputIndex = 0;
let locked = true;
let timer = null;
let gameId = 0;

const audioContext = new (window.AudioContext || window.webkitAudioContext)();
const frequencies = [330, 392, 440, 523];

function playSound(color) {
    if (audioContext.state === 'suspended') {
        audioContext.resume();
    }

    const oscillator = audioContext.createOscillator();
    const gain = audioContext.createGain();

    oscillator.type = 'sine';
    oscillator.frequency.value = frequencies[color];

    gain.gain.setValueAtTime(0.2, audioContext.currentTime);
    gain.gain.exponentialRampToValueAtTime(
        0.001,
        audioContext.currentTime + 0.3
    );

    oscillator.connect(gain);
    gain.connect(audioContext.destination);

    oscillator.start();
    oscillator.stop(audioContext.currentTime + 0.3);
}

function lockButtons(value) {
    buttons.forEach(button => button.disabled = value);
}

function clearHighlights() {
    buttons.forEach(button => {
        button.classList.remove('active', 'player-active');
    });
}

function randomColor() {
    return Math.floor(Math.random() * 4);
}

function showStep(index, id) {
    if (id !== gameId) return;

    if (index === sequence.length) {
        locked = false;
        inputIndex = 0;
        lockButtons(false);
        return;
    }

    const color = sequence[index];
    const button = buttons[color];

    button.classList.add('active');
    playSound(color);

    timer = setTimeout(() => {
        if (id !== gameId) return;

        button.classList.remove('active');

        timer = setTimeout(() => {
            showStep(index + 1, id);
        }, 250);

    }, 500);
}

function playSequence() {
    locked = true;
    lockButtons(true);
    clearHighlights();

    showStep(0, gameId);
}

function startGame() {
    clearTimeout(timer);
    gameId++;

    clearHighlights();

    sequence = [randomColor()];
    inputIndex = 0;

    level.textContent = 1;
    message.textContent = '';
    startButton.textContent = 'НАЧАТЬ ЗАНОВО';

    playSequence();
}

function checkAnswer(color) {
    if (locked) return;

    if (color !== sequence[inputIndex]) {
        endGame();
        return;
    }

    inputIndex++;

    if (inputIndex === sequence.length) {
        locked = true;
        lockButtons(true);

        sequence.push(randomColor());
        level.textContent = sequence.length;

        const id = gameId;

        timer = setTimeout(() => {
            if (id === gameId) playSequence();
        }, 700);
    }
}

function endGame() {
    clearTimeout(timer);
    gameId++;

    locked = true;
    lockButtons(true);
    clearHighlights();

    message.textContent = 'Вы дошли до уровня ' + sequence.length;
    message.style.display = 'block';

    startButton.textContent = 'ИГРАТЬ СНОВА';
}

buttons.forEach(button => {
    button.addEventListener('click', () => {
        const color = Number(button.dataset.color);

        if (locked) return;

        button.classList.add('player-active');
        playSound(color);

        checkAnswer(color);

        setTimeout(() => {
            button.classList.remove('player-active');
        }, 200);
    });
});

startButton.addEventListener('click', startGame);

lockButtons(true);
