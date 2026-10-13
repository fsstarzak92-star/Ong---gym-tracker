function getStorageData(key) {
    return JSON.parse(localStorage.getItem(key)) || [];
}

function setStorageData(key, data) {
    localStorage.setItem(key, JSON.stringify(data));
}

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

    const correspondingBtn = document.querySelector(`.nav-btn[onclick*="${screenId}"]`);
    if (correspondingBtn) {
        correspondingBtn.classList.add('active');
    }

    if (screenId === 'history') {
        loadHistory();
    }

    localStorage.setItem('activeScreen', screenId);
}

function addSet() {
    const newCard = document.createElement('div');
    newCard.className = 'card';
    newCard.innerHTML = `
        <div class="set-row">
            <input type="number" placeholder="Waga (kg)" class="weight-input set-input" />
            <input type="number" placeholder="Powtórzenia" class="reps-input set-input" />
            <button class="delete-btn" onclick="removeSet(this)">Usuń serię</button>
            <button class="btn" onclick="saveSingleSet(this)">Zapisz serię</button>
        </div>
    `;
    document.getElementById('add-btn').insertAdjacentElement('beforebegin', newCard);
}

function saveSingleSet(button) {
    const card = button.closest('.card');
    const weight = card.querySelector('.weight-input').value;
    const reps = card.querySelector('.reps-input').value;

    if (!weight || !reps) {
        alert('Wypełnij wagę i powtórzenia!');
        return;
    }

    let workoutHistory = getStorageData('workoutHistory');
    const today = new Date().toISOString().split('T')[0];

    let lastWorkout = workoutHistory[workoutHistory.length - 1];

    if (!lastWorkout || lastWorkout.date !== today) {
        lastWorkout = { date: today, sets: [] };
        workoutHistory.push(lastWorkout);
    }

    if (!Array.isArray(lastWorkout.sets)) {
        lastWorkout.sets = [];
    }

    lastWorkout.sets.push({ weight, reps });
    setStorageData('workoutHistory', workoutHistory);

    loadDashboardStats();
    loadHistory();
    alert('Seria została zapisana!');
}

function loadHistory() {
    const historyList = document.getElementById('history-list');
    if (!historyList) return;

    let workoutHistory = getStorageData('workoutHistory');

    if (workoutHistory.length === 0) {
        historyList.innerHTML = '<div class="card"><p>Brak zapisanych treningów.</p></div>';
        return;
    }

    historyList.innerHTML = '';
    workoutHistory.slice().reverse().forEach((workout, index) => {
        const realIndex = workoutHistory.length - 1 - index;

        let setsDetails = '';
        if (Array.isArray(workout.sets)) {
            workout.sets.forEach((set, setIndex) => {
                setsDetails += `<p>Seria ${setIndex + 1}: ${set.weight || 0} kg x ${set.reps || 0} powtórzeń</p>`;
            });
        } else {
            setsDetails = `<p>Liczba serii: ${workout.sets}</p>`;
        }

        const card = document.createElement('div');
        card.className = 'history-card';
        card.innerHTML = `
            <div>
                <p><strong>Data:</strong> ${workout.date}</p>
                <p><strong>Szczegóły:</strong> ${setsDetails}</p>
            </div>
            <button class="delete-btn" onclick="deleteWorkout(${realIndex})">Usuń</button>
        `;
        historyList.appendChild(card);
    });
}

function deleteWorkout(index) {
    let workoutHistory = getStorageData('workoutHistory');
    workoutHistory.splice(index, 1);
    setStorageData('workoutHistory', workoutHistory);

    loadDashboardStats();
    loadHistory();
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

window.onload = function () {
    loadDashboardStats();
    loadHistory();

    const savedScreen = localStorage.getItem('activeScreen');
    if (savedScreen) {
        showScreen(savedScreen);
    }
}

function removeSet(button) {
    const card = button.closest('.card');
    if (card) {
        card.remove();
    }
}

function loadDashboardStats() {
    let workoutHistory = getStorageData('workoutHistory');
    const totalWorkouts = workoutHistory.length;

    const streakElement = document.getElementById('stat-streak');
    if (streakElement) {
        streakElement.textContent = `Zapisane treningi łącznie: ${totalWorkouts}`;
    }
}