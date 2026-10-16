const exerciseDatabase = {
    "Klatka piersiowa": ["Wyciskanie sztangi na ławce poziomej", "Wyciskanie hantli na ławce skośnej", "Rozpiętki na maszynie"],
    "Plecy": ["Podciąganie na drążku", "Wiosłowanie sztangą", "Martwy ciąg"],
    "Barki": ["Wyciskanie hantli nad głową", "Unoszenie hantli bokiem", "Unoszenie hantli w opadzie tułowia"],
    "Nogi": ["Przysiady ze sztangą", "Wykroki z hantlami", "Prostowanie nóg na maszynie"],
    "Biceps": ["Uginanie ramion ze sztangą", "Uginanie ramion z hantlami", "Uginanie ramion na modlitewniku"],
    "Triceps": ["Prostowanie ramion na wyciągu", "Pompki na poręczach", "Francuskie wyciskanie sztangi leżąc"]
};

let currentCategory = null;
let currentExercise = null;

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

    if (screenId === 'workout' && !currentCategory) {
        startNewWorkout();
    }

    if (screenId === 'history') {
        loadHistory();
    }

    localStorage.setItem('activeScreen', screenId);
}

function addSet() {
    const setsContainer = document.getElementById('sets-container');
    if (!setsContainer) return;

    const newCard = document.createElement('div');
    newCard.className = 'card';
    newCard.style.background = '#f9fbf9';
    newCard.style.padding = '12px';
    newCard.innerHTML = `
        <div class="set-row">
            <input type="number" placeholder="Waga (kg)" class="weight-input set-input" />
            <input type="number" placeholder="Powtórzenia" class="reps-input set-input" />
            <button class="delete-btn" onclick="removeSet(this)">Usuń serię</button>
            <button class="btn" onclick="saveSingleSet(this)">Zapisz serię</button>
        </div>
    `;
    setsContainer.appendChild(newCard);
}

function saveSingleSet(button) {
    const card = button.closest('.card');
    const weightInput = card.querySelector('.weight-input');
    const repsInput = card.querySelector('.reps-input');
    
    const weight = parseFloat(weightInput.value);
    const reps = parseInt(repsInput.value);

    if (!weight || !reps || isNaN(weight) || isNaN(reps)) {
        alert('Wypełnij poprawnie wagę i powtórzenia!');
        return;
    }

    let workoutHistory = getStorageData('workoutHistory');
    const today = new Date().toISOString().split('T')[0];

    let lastWorkout = workoutHistory[workoutHistory.length - 1];

    if (!lastWorkout || lastWorkout.date !== today || lastWorkout.category !== currentCategory || lastWorkout.exercise !== currentExercise) {
        lastWorkout = { date: today, category: currentCategory, exercise: currentExercise, sets: [] };
        workoutHistory.push(lastWorkout);
    }

    if (!Array.isArray(lastWorkout.sets)) {
        lastWorkout.sets = [];
    }

    lastWorkout.sets.push({ weight, reps });
    setStorageData('workoutHistory', workoutHistory);

    loadDashboardStats();
    loadHistory();
    updateTotalWeightToday();
    
    alert('Seria została zapisana!');
    weightInput.value = '';
    repsInput.value = '';
}

function loadHistory() {
    const historyList = document.getElementById('history-list');
    if (!historyList) return;

    let workoutHistory = getStorageData('workoutHistory');

    if (!Array.isArray(workoutHistory) || workoutHistory.length === 0) {
        historyList.innerHTML = `
            <div class="card" style="text-align: center; padding: 24px;">
                <p style="color: #6b7c70; font-size: 14px;">Brak zapisanych treningów.</p>
                <p style="color: #2e7d32; font-size: 12px; margin-top: 6px;">Rozpocznij trening, aby zapełnić historię!</p>
            </div>
        `;
        return;
    }

    historyList.innerHTML = '';
    workoutHistory.slice().reverse().forEach((workout, index) => {
        const realIndex = workoutHistory.length - 1 - index;

        let setsDetails = '';
        if (workout.sets && Array.isArray(workout.sets)) {
            workout.sets.forEach((set, setIndex) => {
                setsDetails += `
                    <div style="display: flex; justify-content: space-between; font-size: 13px; padding: 4px 0; border-bottom: 1px solid #f1f4f1;">
                        <span style="color: #6b7c70;">Seria ${setIndex + 1}</span>
                        <strong style="color: #1a2e22;">${set.weight} kg × ${set.reps} powt.</strong>
                    </div>
                `;
            });
        } else {
            setsDetails = `<p style="font-size: 13px; color: #6b7c70;">Brak szczegółów serii.</p>`;
        }

        const card = document.createElement('div');
        card.className = 'card';
        card.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 8px;">
                <div>
                    <span class="card-label">${workout.date}</span>
                    <h3 style="font-size: 15px; color: #1b5e20; margin: 4px 0;">${workout.category || 'Trening'}</h3>
                    <p style="font-size: 13px; font-weight: 600; color: #1a2e22;">${workout.exercise || 'Ćwiczenie ogólne'}</p>
                </div>
                <button class="delete-btn" style="width: auto; padding: 6px 10px; font-size: 11px;" onclick="deleteWorkout(${realIndex})">Usuń</button>
            </div>
            <div style="margin-top: 10px; background: #f9fbf9; padding: 8px 12px; border-radius: 10px;">
                ${setsDetails}
            </div>
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
    updateTotalWeightToday();
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

        const timerEl = document.getElementById('timer');
        if (timerEl) timerEl.textContent = formattedTime;
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
    const timerEl = document.getElementById('timer');
    if (timerEl) timerEl.textContent = '00:00:00';
}

window.onload = function () {
    loadDashboardStats();
    loadHistory();
    updateTotalWeightToday();

    const savedScreen = localStorage.getItem('activeScreen');
    if (savedScreen) {
        showScreen(savedScreen);
    } else {
        showScreen('dashboard');
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

function updateTotalWeightToday() {
    let workoutHistory = getStorageData('workoutHistory');
    const today = new Date().toISOString().split('T')[0];
    let totalWeight = 0;

    workoutHistory.forEach(workout => {
        if (workout.date === today && Array.isArray(workout.sets)) {
            workout.sets.forEach(set => {
                const w = parseFloat(set.weight) || 0;
                const r = parseInt(set.reps) || 0;
                totalWeight += w * r; // Łączny tonaż (waga * powtórzenia) lub sama suma wag wg uznania
            });
        }
    });

    const totalWeightEl = document.getElementById('total-weight-today');
    if (totalWeightEl) {
        totalWeightEl.textContent = `${totalWeight} kg`;
    }
}

function startNewWorkout() {
    currentCategory = null;
    currentExercise = null;
    const workoutscreen = document.getElementById('screen-workout');
    if (!workoutscreen) return;

    workoutscreen.innerHTML = `
        <div class="dashboard-header">
            <div>
                <h1>Aktywny Trening</h1>
                <p class="subtitle">Wybierz partie mięśniowe i ćwiczenia</p>
            </div>
            <div class="header-icon" onclick="startNewWorkout()">🔄</div>
        </div>

        <div class="card">
            <span class="card-label">Krok 1</span>
            <h3 style="margin: 6px 0 12px 0; font-size: 16px;">Wybierz partię mięśniową</h3>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
                <button class="btn" onclick="selectCategory('Klatka piersiowa')">Klatka</button>
                <button class="btn" onclick="selectCategory('Plecy')">Plecy</button>
                <button class="btn" onclick="selectCategory('Barki')">Barki</button>
                <button class="btn" onclick="selectCategory('Nogi')">Nogi</button>
                <button class="btn" onclick="selectCategory('Biceps')">Biceps</button>
                <button class="btn" onclick="selectCategory('Triceps')">Triceps</button>
            </div>
        </div>

        <div class="card" style="text-align: center; background: linear-gradient(135deg, #f1f8f2 0%, #ffffff 100%);">
            <span class="card-label">Czas przerw / treningu</span>
            <div id="timer" class="timer">00:00:00</div>
            <div style="display: flex; gap: 8px; justify-content: center;">
                <button class="btn" style="padding: 8px 14px; font-size: 12px;" onclick="startTimer()">Start</button>
                <button class="btn" style="padding: 8px 14px; font-size: 12px; background: #6b7c70;" onclick="stopTimer()">Pauza</button>
                <button class="btn" style="padding: 8px 14px; font-size: 12px; background: #e53935;" onclick="resetTimer()">Reset</button>
            </div>
        </div>

        <div class="card">
            <span class="card-label">Statystyka sesji</span>
            <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 4px;">
                <span style="font-size: 14px; color: #6b7c70;">Łączny ciężar dzisiaj:</span>
                <strong id="total-weight-today" style="font-size: 16px; color: #2e7d32;">0 kg</strong>
            </div>
        </div>
    `;
    updateTotalWeightToday();
}

function selectCategory(category) {
    currentCategory = category;
    const workoutscreen = document.getElementById('screen-workout');
    if (!workoutscreen) return;

    const exercises = exerciseDatabase[category] || [];
    let exercisesHTML = `
        <div class="dashboard-header">
            <div>
                <h1>Aktywny Trening</h1>
                <p class="subtitle">${category}</p>
            </div>
            <div class="header-icon" onclick="startNewWorkout()">🔄</div>
        </div>

        <div class="card">
            <span class="card-label">Krok 2 (${category})</span>
            <h3 style="margin: 6px 0 12px 0; font-size: 16px;">Wybierz ćwiczenie</h3>
            <div style="display: flex; flex-direction: column; gap: 8px;">
    `;
    
    exercises.forEach(exercise => {
        exercisesHTML += `<button class="btn" style="background: #f4f7f5; color: #1a2e22; border: 1px solid #d1ded4; text-align: left;" onclick="selectExercise('${exercise}')">🏋️‍♂️ ${exercise}</button>`;
    });
    
    exercisesHTML += `</div>
            <button class="btn" style="margin-top: 12px; background: #6b7c70;" onclick="startNewWorkout()">← Wróć do kategorii</button>
        </div>
    `;

    workoutscreen.innerHTML = exercisesHTML;
}

function selectExercise(exercise) {
    currentExercise = exercise;

    const workoutscreen = document.getElementById('screen-workout');
    if (!workoutscreen) return;

    workoutscreen.innerHTML = `
        <div class="dashboard-header">
            <div>
                <h1>Aktywny Trening</h1>
                <p class="subtitle">${currentCategory} / ${currentExercise}</p>
            </div>
            <div class="header-icon" onclick="startNewWorkout()">🔄</div>
        </div>

        <div class="card">
            <span class="card-label">${currentCategory}</span>
            <h3 style="margin: 4px 0 12px 0; font-size: 16px;">${currentExercise}</h3>
            
            <div id="sets-container" style="display: flex; flex-direction: column; gap: 10px; margin-bottom: 12px;">
                <div class="card" style="background: #f9fbf9; padding: 12px;">
                    <div class="set-row">
                        <input type="number" placeholder="Waga (kg)" class="weight-input set-input" />
                        <input type="number" placeholder="Powtórzenia" class="reps-input set-input" />
                        <button class="delete-btn" onclick="removeSet(this)">Usuń serię</button>
                        <button class="btn" onclick="saveSingleSet(this)">Zapisz serię</button>
                    </div>
                </div>
            </div>
            
            <button class="btn" style="background: #f4f7f5; color: #2e7d32; border: 1px dashed #2e7d32; margin-bottom: 8px;" onclick="addSet()">+ Dodaj kolejną serię</button>
            <button class="btn" style="background: #6b7c70;" onclick="selectCategory('${currentCategory}')">← Wróć do ćwiczeń</button>
        </div>
    `;
}