function showScreen(screenId) {
    const screens = document.querySelectorAll('.screen');
    screens.forEach(screen => {
        screen.classList.remove('active');
    });

    const navButtons = document.querySelectorAll('.nav-btn');
    navButtons.forEach(button => {
        button.classList.remove('active');
    });

    const targetScreen = document.getElementById('screen-' + screenId);
    if (targetScreen) {
        targetScreen.classList.add('active');
    }

    event.target.classList.add('active');
}

function addSet() {
    const workoutScreen = document.querySelector('#screen-workout');
    const newCard = document.createElement('div');
    newCard.className = 'card';
    newCard.innerHTML = '<p>Seria: 120 kg x 10 powtórzeń</p>';
    document.getElementById('add-btn').insertAdjacentElement('beforebegin', newCard);
}

function saveWorkout() {
    const workoutScreen = document.querySelector('#screen-workout');
    const sets = workoutScreen.querySelectorAll('.card p');
    localStorage.setItem('workoutSetsCount', sets.length);
}

let seconds = 0;
let minutes = 0;
let hours = 0;
let timerInterval = null;

function startTimer() {
    if (timerInterval !== null) return;

    timerInterval = setInterval(() => {
        seconds++;
        if (seconds === 60) {
            seconds = 0;
            minutes++;
        }
        if (minutes === 60) {
            minutes = 0;
            hours++;
        }

        const formattedTime =
            String(hours).padStart(2, '0') + ':' +
            String(minutes).padStart(2, '0') + ':' +
            String(seconds).padStart(2, '0');

        document.getElementById('timer').textContent = formattedTime;
    }, 1000);
}

function stopTimer() {
    clearInterval(timerInterval);
    timerInterval = null;
}

function resetTimer() {
    stopTimer();
    seconds = 0;
    minutes = 0;
    hours = 0;
    document.getElementById('timer').textContent = '00:00:00';
}

function loadWorkoutData() {
    const savedCount = localStorage.getItem('workoutSetsCount');

    if (savedCount && savedCount > 2) {
        const workoutScreen = document.querySelector('#screen-workout');
        const btnElement = document.getElementById('add-btn');

        for (let i = 2; i < savedCount; i++) {
            const newCard = document.createElement('div');
            newCard.className = 'card';
            newCard.innerHTML = '<p>Seria: 120 kg x 10 powtórzeń</p>';
            workoutScreen.insertBefore(newCard, btnElement);
        }
    }
}

window.onload = function() {
    loadWorkoutData();
}