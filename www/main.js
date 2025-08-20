const screens = {
  home: document.getElementById('home-screen'),
  exerciseList: document.getElementById('exercise-list-screen'),
  exerciseDetail: document.getElementById('exercise-detail-screen'),
  rest: document.getElementById('rest-screen'),
  complete: document.getElementById('complete-screen'),
};

const themeToggle = document.getElementById('theme-toggle');
const prefersDarkScheme = window.matchMedia('(prefers-color-scheme: dark)');
const currentTheme = localStorage.getItem('theme');
let isMuted = false;

if (currentTheme === 'dark' || (!currentTheme && prefersDarkScheme.matches)) {
  document.documentElement.setAttribute('data-theme', 'dark');
}

if (themeToggle) {
  themeToggle.addEventListener('click', () => {
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    document.documentElement.setAttribute('data-theme', isDark ? 'light' : 'dark');
    localStorage.setItem('theme', isDark ? 'light' : 'dark');
  });
}

const muteButton = document.getElementById('mute-button');

muteButton.addEventListener('click', toggleMute);

function toggleMute() {
  isMuted = !isMuted;
  
  if (isMuted) {
    // If muting, stop any current speech
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    muteButton.textContent = '🔊 Unmute';
    muteButton.classList.add('muted');
  } else {
    muteButton.textContent = '🔇 Mute';
    muteButton.classList.remove('muted');
    
    // If unmuting and on exercise screen, replay the current exercise instructions
    const currentScreen = document.querySelector('.screen.active').id;
    if (currentScreen === 'exercise-detail-screen' && currentExerciseIdx >= 0) {
      const exercise = selectedExercises[currentExerciseIdx];
      if (exercise) {
        instructionsVoice(exercise.name);
      }
    }
  }
}

// Body part selection from home screen
document.querySelectorAll('.body-card').forEach(card => {
  card.addEventListener('click', () => {
    const bodyPart = card.getAttribute('data-part');
    showExerciseList(bodyPart);
  });
});

// Show exercise list for selected body part
function showExerciseList(bodyPart) {
  const exerciseList = document.getElementById('exercise-list');
  const title = document.getElementById('exercise-list-title');
  
  selectedExercises = [...exerciseData[bodyPart]];
  currentExerciseIdx = 0;
  
  title.textContent = `${bodyPart.charAt(0).toUpperCase() + bodyPart.slice(1)} Exercises`;
  
  // Clear previous exercises
  exerciseList.innerHTML = '';
  
  // Add exercises to the list
  selectedExercises.forEach((exercise, index) => {
    const li = document.createElement('li');
    li.textContent = exercise.name;
    li.style.cursor = 'pointer';
    li.addEventListener('click', (e) => {
      e.stopPropagation();
      currentExerciseIdx = index;
      startExercise();
    });
    exerciseList.appendChild(li);
  });

  showScreen('exerciseList');
}

const exerciseData = {
  bicep: [
    { name: 'Bicep Curl', gif: './resources/gifs/bicep-curl.gif' },
    { name: 'Bicep Incline Curl', gif: './resources/gifs/bicep-incline.gif'},
    { name: 'Preacher Hammer Curl', gif: './resources/gifs/preacher-hammer-curl.gif' },
    {name : 'Concentrated Bicep Curl', gif: './resources/gifs/concentration_curls_dumbbell.gif'}
  ],
  tricep: [
    { name: 'One Arm Tricep Extension', gif: './resources/gifs/one-arm-tricep-extension.gif' },
    { name: 'Standing Tricep Kickback', gif: './resources/gifs/tricep-kick-back-tricep.gif' },
    {name: 'Bent-Tricep Kickback', gif: './resources/gifs/Dumbbell-Kickback.gif'},
    {name : 'Dumbbell Skull Crusher', gif: './resources/gifs/skull-crusher-dumbbell.gif'}
  ],
  back: [
    { name: 'Chest Supported Dumbbell Rows', gif: './resources/gifs/Chest-Supported-Dumbbell-Rows.gif' },
    {name: 'Single arm Dumbbell Row', gif: './resources/gifs/Single-arm-dumbbell-row.gif'},
    { name: 'Bent Over Lateral Raise', gif: './resources/gifs/bent-over-lateral-raise.gif' },
    {name : 'Rowing', gif: './resources/gifs/rowing.gif'}
  ],
  shoulder: [
    { name: 'Shoulder Press', gif: './resources/gifs/shoulder-press-seated.gif' },
    { name: 'Lateral Raise', gif: './resources/gifs/DB_LAT_RAISE.gif' },
    {name: 'Inclined One Arm Raise', gif: './resources/gifs/incline-leaned-one-arm-raise.gif'},
    {name : 'Front Raise', gif: './resources/gifs/front-raise.gif'}
  ],
};

const exerciseInstructions = {
  // Bicep exercises
  'Bicep Curl': 'Hold a dumbbell in each hand, arms extended downward. Keep your elbows close to your torso, then curl the weights while contracting your biceps. Lower the weights back to the starting position.',
  'Bicep Incline Curl': 'Sit on an incline bench with a dumbbell in each hand. Let your arms hang straight down, then curl the weights while keeping your upper arms stationary. Slowly lower back down.',
  'Preacher Hammer Curl': 'Sit at a preacher bench with a dumbbell in each hand, palms facing each other. Curl the weights while keeping your upper arms on the pad. Lower back down with control.',
  'Concentrated Bicep Curl': 'Sit on a bench, place your elbow against your inner thigh. Hold a dumbbell and curl it toward your shoulder while keeping your upper arm stationary. Lower it back down slowly.',

  // Tricep exercises
  'One Arm Tricep Extension': 'Hold a dumbbell overhead with one hand. Lower it behind your head by bending your elbow, then extend your arm back up.',
  'Standing Tricep Kickback': 'Bend forward at the waist, keep your back straight. Hold a dumbbell in one hand, upper arm parallel to the floor. Extend your arm backward, then return to start.',
  'Bent-Tricep Kickback': 'Similar to standing kickback but with more bend at the waist. Keep your upper arm stationary while extending your forearm backward.',
  'Dumbbell Skull Crusher': 'Lie on a bench, hold dumbbells above your chest. Bend your elbows to lower the weights toward your forehead, then extend back up.',
  
  // Back exercises
  'Chest Supported Dumbbell Rows': 'Lie face down on an incline bench, hold dumbbells. Pull the weights up toward your hips, squeezing your shoulder blades together. Lower with control.',
  'Single arm Dumbbell Row': 'Place one knee and hand on a bench, keep your back straight. Hold a dumbbell in the other hand, pull it up toward your hip, keeping your elbow close to your body. Lower with control.',
  'Bent Over Lateral Raise': 'Bend at the waist, keep back straight. Hold dumbbells with arms hanging down. Raise arms out to the sides until parallel to the floor, then lower back down.',
  'Rowing': 'Sit on the rowing machine with your arms gripping the handles. Pull back the handle using your back and move the seat backward and forawrd in a rowing fashion.',
  
  // Shoulder exercises
  'Shoulder Press': 'Sit on a bench with back support. Hold dumbbells at shoulder height. Press the weights upward until arms are extended. Lower back to starting position.',
  'Lateral Raise': 'Stand with dumbbells at your sides. With a slight bend in your elbows, raise your arms out to the sides until parallel to the floor. Lower back down slowly.',
  'Inclined One Arm Raise': 'Lie on an incline bench, hold one dumbbell. With a slight bend in your elbow, raise the weight to the side until arm is parallel to the floor. Lower with control.',
  'Front Raise': 'Stand with dumbbells in front of your thighs. Keeping a slight bend in your elbows, raise the weights in front of you to shoulder height. Lower back down slowly.'
};

let selectedExercises = [];
let currentExerciseIdx = 0;
let restInterval = null;
let restRemaining = 60;
let voices = [];
let voicesReady = false;
let isPageUnloading = false;

document.addEventListener('DOMContentLoaded', () => {
  // Initialize voices when they become available
  function loadVoices() {
    voices = window.speechSynthesis.getVoices();
    if (voices.length > 0) {
      voicesReady = true;
      window.speechSynthesis.onvoiceschanged = null; // Remove the listener once we have voices
    }
  }
  
  // Set up voice loading
  if (window.speechSynthesis) {
    window.speechSynthesis.onvoiceschanged = loadVoices;
    loadVoices(); // Try to load voices immediately
  }
});

window.addEventListener('beforeunload', () => {
  isPageUnloading = true;
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
});

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
  instructionsVoice(exercise.name);
}

document.getElementById('next-exercise').addEventListener('click', startRest);

function startRest() {
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
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
  // Stop any ongoing speech when moving to next exercise
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
  
  currentExerciseIdx++;
  if (currentExerciseIdx < selectedExercises.length) {
    setTimeout(() => {
      startExercise();
    }, 100);
  } else {
    celebrateCompletion();
  }
}

function instructionsVoice(exerciseName) {
  if (isPageUnloading || isMuted) return;  // Don't speak if muted or page is unloading
  
  if (!('speechSynthesis' in window)) {
    console.warn('Speech synthesis not supported');
    return;
  }

  const instructions = exerciseInstructions[exerciseName];
  if (!instructions) {
    console.warn('No instructions found for:', exerciseName);
    return;
  }

  // Cancel any ongoing speech
  window.speechSynthesis.cancel();

  const speak = () => {
    if (!voicesReady) {
      // If voices aren't ready yet, try again in 100ms
      setTimeout(speak, 100);
      return;
    }

    const speech = new SpeechSynthesisUtterance(instructions);
    
    speech.voice = voices[1]
    
    // Set speech properties
    speech.rate = 0.9;
    speech.pitch = 1.0;
    speech.volume = 1.0;
    
    window.speechSynthesis.speak(speech);
  };

  // Start speaking
  speak();
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
  showScreen('home');
});

document.getElementById('home-btn').addEventListener('click', () => {
  stopCelebration();
  showScreen('home');
});

function celebrateCompletion() {
  document.getElementById('complete-gif').src = 'resources/gifs/dance.gif';
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
