// Workout App Logic
const screens = {
  bodyPart: document.getElementById('body-part-screen'),
  exerciseList: document.getElementById('exercise-list-screen'),
  exerciseDetail: document.getElementById('exercise-detail-screen'),
  rest: document.getElementById('rest-screen'),
  complete: document.getElementById('complete-screen'),
};

const exerciseData = {
  bicep: [
    { name: 'Bicep Curl', gif: 'gifs/bicep-curl.gif' },
    { name: 'Bicep Incline Curl', gif : 'gifs/bicep-incline.gif'},
    { name: 'Preacher Hammer Curl', gif: 'gifs/preacher-hammer-curl.gif' },
    {name : 'Concentrated Bicep Curl', gif: 'gifs/concentration_curls_dumbbell.gif'}
  ],
  tricep: [
    { name: 'One Arm Tricep Extension', gif: 'gifs/one-arm-tricep-extension.gif' },
    { name: 'Standing Tricep Kickback', gif: 'gifs/tricep-kick-back-tricep.gif' },
    {name: 'Bent-Tricep Kickback', gif: 'gifs/Dumbbell-Kickback.gif'},
    {name : 'Dumbbell Skull Crusher', gif: 'gifs/skull-crusher-dumbbell.gif'}
  ],
  back: [
    { name: 'Chest Supported Dumbbell Rows', gif: 'gifs/Chest-Supported-Dumbbell-Rows.gif' },
    { name: 'Bent Over Lateral Raise', gif: 'gifs/bent-over-lateral-raise.gif' },
    {name : 'Rowing', gif: 'gifs/rowing.gif'}
  ],
  shoulder: [
    { name: 'Shoulder Press', gif: 'gifs/shoulder-press-seated.gif' },
    { name: 'Lateral Raise', gif: 'gifs/DB_LAT_RAISE.gif' },
    {name: 'Inclined One Arm Raise', gif : 'gifs/incline-leaned-one-arm-raise.gif'},
    {name : 'Front Raise', gif: 'gifs/front-raise.gif'}
  ],
};

let selectedExercises = [];
let currentExerciseIdx = 0;
let restInterval = null;
let restRemaining = 60;


function showScreen(key) {
  Object.values(screens).forEach((s) => s.classList.remove('active'));
  screens[key].classList.add('active');
}

const bodyPartBtns = document.querySelectorAll('.body-part');
bodyPartBtns.forEach((btn) => {
  btn.addEventListener('click', () => {
    const part = btn.dataset.part;
    selectedExercises = exerciseData[part];
    currentExerciseIdx = 0;
    populateExerciseList(part);
    showScreen('exerciseList');
  });
});

function populateExerciseList(part) {
  document.getElementById('exercise-list-title').textContent = `${part.charAt(0).toUpperCase() + part.slice(1)} Exercises`;
  const listEl = document.getElementById('exercise-list');
  listEl.innerHTML = '';
  selectedExercises.forEach((ex, idx) => {
    const li = document.createElement('li');
    li.textContent = ex.name;
    li.addEventListener('click', () => {
      currentExerciseIdx = idx;
      startExercise();
    });
    listEl.appendChild(li);
  });
}

function startExercise() {
  const exercise = selectedExercises[currentExerciseIdx];
  document.getElementById('exercise-name').textContent = exercise.name;
  document.getElementById('exercise-gif').src = exercise.gif;
  showScreen('exerciseDetail');
}

document.getElementById('next-exercise').addEventListener('click', startRest);

function startRest() {
  restRemaining = 60;
  updateRestTimer();
  showScreen('rest');
  restInterval = setInterval(() => {
    restRemaining--;
    updateRestTimer();
    if (restRemaining <= 0) {
      clearInterval(restInterval);
      moveToNext();
    }
  }, 1000);
}

function updateRestTimer() {
  document.getElementById('rest-timer').textContent = restRemaining;
}

function moveToNext() {
  currentExerciseIdx++;
  if (currentExerciseIdx < selectedExercises.length) {
    startExercise();
  } else {
    celebrateCompletion();
  }
}

document.getElementById('skip-rest').addEventListener('click', () => {
  clearInterval(restInterval);
  moveToNext();
});

document.getElementById('add-30s').addEventListener('click', () => {
  restRemaining += 30;
  updateRestTimer();
});

document.getElementById('back-to-body-parts').addEventListener('click', () => {
  showScreen('bodyPart');
});

// Home button on completion screen
const homeBtn = document.getElementById('home-btn');
if (homeBtn) {
  homeBtn?.addEventListener('click', () => {
    stopCelebration();
    showScreen('bodyPart');
  });
}

function celebrateCompletion() {
  document.getElementById('complete-gif').src = 'gifs/dance.gif';
  showScreen('complete');
  const audio = document.getElementById('celebration-audio');
  if (audio) {
    audio.currentTime = 0;
    audio.play().catch(() => {});
  }
}

function stopCelebration() {
  const audio = document.getElementById('celebration-audio');
  if (audio) audio.pause();
}
