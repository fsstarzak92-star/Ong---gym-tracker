const exerciseDatabase = {
    "Klatka piersiowa": [
        "Wyciskanie sztangi na ławce poziomej",
        "Wyciskanie hantli na ławce skośnej",
        "Rozpiętki na maszynie",
        "Wyciskanie na maszynie",
        "Pompki na poręczach",
        "Wyciskanie sztangi na ławce skośnej ujemnej",
        "Rozpiętki z hantlami na ławce poziomej",
        "Wyciskanie hantli na ławce poziomej",
        "Przenoszenie hantla w leżeniu",
        "Wyciskanie na maszynie typu Hammer"
    ],
    "Plecy": [
        "Podciąganie na drążku",
        "Wiosłowanie sztangą",
        "Martwy ciąg",
        "Ściąganie drążka wyciągu do klatki",
        "Wiosłowanie hantlem w oparciu",
        "Wiosłowanie na maszynie siedząc",
        "Ściąganie drążka wyciągu wąskim chwytem",
        "Przyciąganie uchwytu do brzucha na wyciągu",
        "Ściąganie ramion prostych na wyciągu",
        "Wznosy tułowia na ławce rzymskiej"
    ],
    "Barki": [
        "Wyciskanie hantli nad głową",
        "Unoszenie hantli bokiem",
        "Unoszenie hantli w opadzie tułowia",
        "Wyciskanie żołnierskie",
        "Wznosy ramion w przód z hantlami",
        "Wyciskanie sztangi zza głowy",
        "Unoszenie ramion bokiem na wyciągu",
        "Wyciskanie hantli na maszynie siedząc",
        "Wznosy w leżeniu na ławce skośnej",
        "Odwrotne rozpiętki na maszynie"
    ],
    "Nogi": [
        "Przysiady ze sztangą",
        "Wykroki z hantlami",
        "Prostowanie nóg na maszynie",
        "Uginanie nóg leżąc",
        "Wypychanie ciężaru na suwnicy",
        "Przysiady bułgarskie z hantlami",
        "Martwy ciąg na prostych nogach",
        "Wspięcia na palce stojąc",
        "Przysiady frontowe ze sztangą",
        "Wypychanie bioder ze sztangą"
    ],
    "Biceps": [
        "Uginanie ramion ze sztangą",
        "Uginanie ramion z hantlami",
        "Uginanie ramion na modlitewniku",
        "Uginanie młotkowe z hantlami",
        "Uginanie ramion na wyciągu dolnym",
        "Uginanie hantli z supinacją",
        "Koncentryczne uginanie ramienia",
        "Uginanie ramion na wyciągu górnym",
        "Uginanie ramion ze sztangą łamaną",
        "Uginanie na ławce skośnej z hantlami"
    ],
    "Triceps": [
        "Prostowanie ramion na wyciągu",
        "Pompki na poręczach",
        "Francuskie wyciskanie sztangi leżąc",
        "Wyciskanie francuskie hantlem",
        "Wyciskanie w wąskim chwycie",
        "Prostowanie ramienia w opadzie",
        "Prostowanie ramion na wyciągu podchwytem",
        "Wyciskanie na maszynie siedząc",
        "Francuskie wyciskanie stojąc",
        "Wyciskanie hantli w wąskim chwycie"
    ]
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

    if (screenId === 'profile') {
        loadPersonalRecords();
    }

    if (screenId === 'dashboard') {
        loadWeeklyStats();
        loadDashboardStats();
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
            <div class="input-step-group">
                <button type="button" class="btn-step" onclick="adjustInputValue(this, -2.5, 'weight')">-2.5</button>
                <input type="number" placeholder="Waga (kg)" class="weight-input set-input" step="0.5" />
                <button type="button" class="btn-step" onclick="adjustInputValue(this, 2.5, 'weight')">+2.5</button>
            </div>
            <div class="input-step-group">
                <button type="button" class="btn-step" onclick="adjustInputValue(this, -1, 'reps')">-1</button>
                <input type="number" placeholder="Powtórzenia" class="reps-input set-input" step="1" />
                <button type="button" class="btn-step" onclick="adjustInputValue(this, 1, 'reps')">+1</button>
            </div>
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

    if (isNaN(weight) || isNaN(reps) || weight <= 0 || reps <= 0) {
        showToast('Wypełnij poprawnie wagę i powtórzenia!', true);
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
    loadPersonalRecords();
    updateTotalWeightToday();
    loadWeeklyStats();

    showToast('Seria została zapisana!');
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
    loadPersonalRecords();
    updateTotalWeightToday();
    loadWeeklyStats();
}

let seconds = 0;
let minutes = 0;
let hours = 0;
let timerInterval = null;

function startTimer() {
    if (timerInterval !== null) return;

    const timerEl = document.getElementById('timer');
    const statusEl = document.getElementById('timer-status');
    if (timerEl) timerEl.classList.add('running');
    if (statusEl) statusEl.classList.add('active');

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

        if (timerEl) timerEl.textContent = formattedTime;
    }, 1000);
}

function stopTimer() {
    clearInterval(timerInterval);
    timerInterval = null;

    const timerEl = document.getElementById('timer');
    const statusEl = document.getElementById('timer-status');
    if (timerEl) timerEl.classList.remove('running');
    if (statusEl) statusEl.classList.remove('active');
}

function resetTimer() {
    stopTimer();
    seconds = 0;
    minutes = 0;
    hours = 0;

    const timerEl = document.getElementById('timer');
    const statusEl = document.getElementById('timer-status');

    if (timerEl) {
        timerEl.textContent = '00:00:00';
        timerEl.classList.remove('running');
    }
    if (statusEl) {
        statusEl.classList.remove('active');
    }
}

window.onload = function () {
    loadDashboardStats();
    loadHistory();
    loadPersonalRecords();
    updateTotalWeightToday();
    loadWeeklyStats();

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
    
    loadWeeklyStats();
}

function loadPersonalRecords() {
    const prContainer = document.getElementById('pr-container');
    if (!prContainer) return;

    let workoutHistory = getStorageData('workoutHistory');
    let maxWeights = {};

    workoutHistory.forEach(workout => {
        if (workout.exercise && Array.isArray(workout.sets)) {
            workout.sets.forEach(set => {
                const w = parseFloat(set.weight) || 0;
                if (!maxWeights[workout.exercise] || w > maxWeights[workout.exercise]) {
                    maxWeights[workout.exercise] = w;
                }
            });
        }
    });

    const exercises = Object.keys(maxWeights);
    if (exercises.length === 0) {
        prContainer.innerHTML = '<p style="font-size: 13px; color: #6b7c70;">Brak rekordów. Zapisz pierwsze serie!</p>';
        return;
    }

    prContainer.innerHTML = '';
    exercises.forEach(exercise => {
        prContainer.innerHTML += `
            <div style="display: flex; justify-content: space-between; font-size: 13px; padding: 2px 0;">
                <span style="color: #6b7c70; max-width: 65%; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${exercise}</span>
                <strong style="color: #2e7d32;">${maxWeights[exercise]} kg</strong>
            </div>
        `;
    });
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
                totalWeight += w * r;
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
            <span class="card-label"><span id="timer-status" class="timer-status"></span>Czas przerw / treningu</span>
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

            <input type="text" id="exercise-search" placeholder="Szukaj ćwiczenia..." class="set-input" style="margin-bottom: 10px;" oninput="filterExercises()" />

            <div id="exercises-list-container" style="display: flex; flex-direction: column; gap: 8px; max-height: 260px; overflow-y: auto; padding-right: 4px;">
    `;

    exercises.forEach(exercise => {
        exercisesHTML += `<button class="btn exercise-btn" style="background: #f4f7f5; color: #1a2e22; border: 1px solid #d1ded4; text-align: left;" onclick="selectExercise('${exercise}')">${exercise}</button>`;
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

    const lastSet = getLastExerciseSet(exercise);
    const lastHint = lastSet
        ? `<p style="font-size: 12px; color: #2e7d32; margin-bottom: 8px;"> Ostatnio: <strong>${lastSet.weight} kg × ${lastSet.reps} powt.</strong></p>`
        : `<p style="font-size: 12px; color: #6b7c70; margin-bottom: 8px;"> Brak historii dla tego ćwiczenia</p>`;

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
            <h3 style="margin: 4px 0 4px 0; font-size: 16px;">${currentExercise}</h3>
            ${lastHint}
            
            <div id="sets-container" style="display: flex; flex-direction: column; gap: 10px; margin-bottom: 12px;">
                <div class="card" style="background: #f9fbf9; padding: 12px;">
                    <div class="set-row">
                        <div class="input-step-group">
                            <button type="button" class="btn-step" onclick="adjustInputValue(this, -2.5, 'weight')">-2.5</button>       
                            <input type="number" placeholder="Waga (kg)" class="weight-input set-input" step="0.5" /> 
                            <button type="button" class="btn-step" onclick="adjustInputValue(this, 2.5, 'weight')">+2.5</button>
                        </div>
                        <div class="input-step-group">
                            <button type="button" class="btn-step" onclick="adjustInputValue(this, -1, 'reps')">-1</button>       
                            <input type="number" placeholder="Powtórzenia" class="reps-input set-input" step="1" />
                            <button type="button" class="btn-step" onclick="adjustInputValue(this, 1, 'reps')">+1</button>
                        </div>
                        <button class="delete-btn" onclick="removeSet(this)">Usuń serię</button>
                        <button class="btn" onclick="saveSingleSet(this)">Zapisz serię</button>
                    </div>
                </div>
            </div>
            
            <div style="display: flex; gap: 8px;">
                <button class="btn" style="background: #6b7c70; flex: 1;" onclick="selectCategory('${currentCategory}')">← Ćwiczenia</button>
                <button class="btn" style="background: #2e7d32; flex: 1;" onclick="finishWorkout()">✔ Zakończ</button>
            </div>
        </div>
    `;
}

function finishWorkout() {
    stopTimer();
    resetTimer();
    currentCategory = null;
    currentExercise = null;
    showToast('Trening został zakończony!');
    showScreen('history');
}

function showToast(message, isError = false) {
    let container = document.getElementById('toast-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'toast-container';
        container.className = 'toast-container';
        document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = `toast ${isError ? 'toast-error' : ''}`;
    toast.textContent = message;

    container.appendChild(toast);

    setTimeout(() => {
        toast.remove();
    }, 2000);
}

function adjustInputValue(btn, adjustment, inputType) {
    const group = btn.closest('.input-step-group');
    if (!group) return;
    const input = group.querySelector(inputType === 'weight' ? '.weight-input' : '.reps-input');
    if (!input) return;

    let currentValue = parseFloat(input.value) || 0;
    let newValue = currentValue + adjustment;
    if (newValue < 0) newValue = 0;

    input.value = inputType === 'reps' ? Math.round(newValue) : newValue;
}

function getLastExerciseSet(exerciseName) {
    let workoutHistory = getStorageData('workoutHistory');

    for (let i = workoutHistory.length - 1; i >= 0; i--) {
        let workout = workoutHistory[i];
        if (workout.exercise === exerciseName && workout.sets && workout.sets.length > 0) {
            return workout.sets[workout.sets.length - 1];
        }
    }
    return null;
}

function filterExercises() {
    const searchInput = document.getElementById('exercise-search');
    if (!searchInput) return;

    const query = searchInput.value.toLowerCase();
    const buttons = document.querySelectorAll('.exercise-btn');
    
    buttons.forEach(button => {
        const text = button.textContent.toLowerCase();
        if (text.includes(query)) {
            button.style.display = ''; 
        } else {
            button.style.display = 'none'; 
        }
    });
}

function loadWeeklyStats() {
    const container = document.getElementById('weekly-stats-container');
    if (!container) return;

    let workoutHistory = getStorageData('workoutHistory');

    // Pobieramy daty z ostatnich 7 dni
    const days = [];
    for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        days.push(d.toISOString().split('T')[0]);
    }

    let html = '<div style="display: flex; justify-content: space-between; align-items: flex-end; height: 80px; gap: 4px; padding-top: 10px;">';

    days.forEach(dayDate => {
        let setsCount = 0;
        workoutHistory.forEach(workout => {
            if (workout.date === dayDate && Array.isArray(workout.sets)) {
                setsCount += workout.sets.length;
            }
        });

        const dayName = new Date(dayDate).toLocaleDateString('pl-PL', { weekday: 'narrow' });
        const barHeight = setsCount > 0 ? Math.min(setsCount * 12, 60) : 4;
        const barColor = setsCount > 0 ? '#2e7d32' : '#e1e9e3';

        html += '<div style="display: flex; flex-direction: column; align-items: center; flex: 1;"><span style="font-size: 10px; color: #6b7c70; margin-bottom: 2px;">' + (setsCount > 0 ? setsCount : '') + '</span><div style="width: 100%; max-width: 16px; height: ' + barHeight + 'px; background: ' + barColor + '; border-radius: 4px;"></div><span style="font-size: 11px; font-weight: 600; color: #1a2e22; margin-top: 4px;">' + dayName + '</span></div>';
    });

    html += '</div>';
    container.innerHTML = html;
}