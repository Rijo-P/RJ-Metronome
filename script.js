let metronomeInterval;
let incrementInterval;
let practiceTimeout;
let currentTempo = 60;
let isRunning = false;
let beatCounter = 0;
const flash = document.getElementById('flash');
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
const longBeep = new Audio('https://www.soundjay.com/button/beep-01a.mp3'); // Long beep sound

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

function startMetronome() {
    isRunning = true;
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
        pauseAndIncrementTempo(increment);
    }, interval);
    practiceTimeout = setTimeout(() => {
        stopMetronome();
        alert('Practice time is over!');
    }, totalTime);
}

function pauseAndIncrementTempo(increment) {
    clearInterval(metronomeInterval); // Stop the metronome
    longBeep.play(); // Play long beep sound
    setTimeout(() => {
        currentTempo += increment;
        document.getElementById('currentTempoDisplay').textContent = currentTempo;
        restartMetronome(); // Restart the metronome with the new tempo
    }, 2000); // 2-second pause
}

function restartMetronome() {
    const beatInterval = (60 / currentTempo) * 1000;
    metronomeInterval = setInterval(() => {
        playClick(parseInt(document.getElementById('timeSignature').value));
    }, beatInterval);
}

function stopMetronome() {
    clearInterval(metronomeInterval);
    clearInterval(incrementInterval);
    clearTimeout(practiceTimeout);
    isRunning = false;
    beatCounter = 0;
    flash.style.backgroundColor = '#333333';
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
