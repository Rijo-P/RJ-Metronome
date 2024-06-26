let metronomeInterval;
let incrementInterval;
let practiceTimeout;
let currentTempo = 60;
let isRunning = false;
let beatCounter = 0;
const flash = document.getElementById('flash');
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
const longBeep = new Audio('ding2.wav'); // Long beep sound
let wakeLock = null;

function updateTempoDisplay(value) {
    document.getElementById('tempoDisplay').textContent = value;
    currentTempo = parseInt(value);
    document.getElementById('currentTempoDisplay').textContent = value;
}

function updateIncrementDisplay(value) {
    document.getElementById('incrementDisplay').textContent = value;
}

function updateIntervalDisplay(value) {
    const minutes = (value / 60).toFixed(1);
    document.getElementById('intervalDisplay').textContent = `${value} (${minutes} min)`;
}

function updateTotalTimeDisplay(value) {
    document.getElementById('totalTimeDisplay').textContent = `${value} min`;
}

function toggleMetronome() {
    if (isRunning) {
        stopMetronome();
        document.getElementById('startStopBtn').textContent = 'Start';
    } else {
        startMetronome();
        document.getElementById('startStopBtn').textContent = 'Stop';
    }
}

async function requestWakeLock() {
    try {
        wakeLock = await navigator.wakeLock.request('screen');
        wakeLock.addEventListener('release', () => {
            console.log('Wake Lock was released');
        });
        console.log('Wake Lock is active');
    } catch (err) {
        console.error(`${err.name}, ${err.message}`);
    }
}

function startMetronome() {
    isRunning = true;
    requestWakeLock();
    currentTempo = parseInt(document.getElementById('tempo').value);
    const increment = parseInt(document.getElementById('increment').value);
    const interval = parseInt(document.getElementById('interval').value) * 1000; // convert seconds to milliseconds
    const totalTime = parseInt(document.getElementById('totalTime').value) * 60 * 1000; // convert minutes to milliseconds
    const timeSignature = parseInt(document.getElementById('timeSignature').value);

    document.getElementById('currentTempoDisplay').textContent = currentTempo;

    const beatInterval = (60 / currentTempo) * 1000;
    metronomeInterval = setInterval(() => {
        playClick(timeSignature);
    }, beatInterval);
    incrementInterval = setInterval(() => {
        pauseAndIncrementTempo(increment, timeSignature);
    }, interval);
    practiceTimeout = setTimeout(() => {
        stopMetronome();
        alert('Practice time is over!');
        location.reload(); // Refresh the page
    }, totalTime);

    document.addEventListener('visibilitychange', handleVisibilityChange);
}

function pauseAndIncrementTempo(increment, timeSignature) {
    clearInterval(metronomeInterval); // Stop the metronome
    longBeep.play(); // Play long beep sound
    setTimeout(() => {
        currentTempo += increment;
        document.getElementById('currentTempoDisplay').textContent = currentTempo;
        beatCounter = 0; // Reset beat counter
        flash.style.backgroundColor = '#ff5252'; // Start with red color
        restartMetronome(timeSignature); // Restart the metronome with the new tempo
    }, 2000); // 2-second pause
}

function restartMetronome(timeSignature) {
    const beatInterval = (60 / currentTempo) * 1000;
    metronomeInterval = setInterval(() => {
        playClick(timeSignature);
    }, beatInterval);
}

function stopMetronome() {
    clearInterval(metronomeInterval);
    clearInterval(incrementInterval);
    clearTimeout(practiceTimeout);
    isRunning = false;
    beatCounter = 0;
    flash.style.backgroundColor = '#333333';
    if (wakeLock !== null) {
        wakeLock.release();
        wakeLock = null;
    }
    document.removeEventListener('visibilitychange', handleVisibilityChange);
}

function playClick(timeSignature) {
    const oscillator = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();

    oscillator.type = 'square';
    oscillator.frequency.setValueAtTime(beatCounter % timeSignature === 0 ? 1200 : 800, audioCtx.currentTime); // Accent the first beat
    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    gainNode.gain.setValueAtTime(1, audioCtx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.1);

    oscillator.start();
    oscillator.stop(audioCtx.currentTime + 0.1);

    // Flash color change
    if (beatCounter % timeSignature === 0) {
        flash.style.backgroundColor = '#ff5252'; // Red for the first beat
    } else {
        flash.style.backgroundColor = '#03dac6'; // Green for other beats
    }

    beatCounter = (beatCounter + 1) % timeSignature;
}

function handleVisibilityChange() {
    if (document.visibilityState === 'hidden') {
        stopMetronome();
    } else if (document.visibilityState === 'visible' && isRunning) {
        startMetronome();
    }
}
