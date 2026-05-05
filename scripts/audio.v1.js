const music = new Audio("https://cdn.abemyatt.com/sounds/animal-song.mp3");
const rollSound = new Audio("https://cdn.abemyatt.com/sounds/roll.mp3");

music.loop = true;
music.volume = 0.3;

rollSound.volume = 0.5;

let hasInteracted = false;

function initAudio() {
    if (hasInteracted) return;
    hasInteracted = true;

    if (!musicMuted) {
        music.play().catch(() => {
        });
    }
}

function startMusic() {
    if (!musicMuted) {
        music.play().catch(() => {
        });
    }
}

globalThis.audio = globalThis.audio || {};
globalThis.audio.music = music;
globalThis.audio.rollSound = rollSound;

let musicMuted = false;
let rollMuted = false;

function bindAudioUI() {
    const musicToggle = document.getElementById("music-toggle");
    const musicVolume = document.getElementById("music-volume");

    const rollToggle = document.getElementById("roll-toggle");
    const rollVolume = document.getElementById("roll-volume");

    if (!musicToggle || !musicVolume || !rollToggle || !rollVolume) return;

    musicToggle.addEventListener("click", () => {
        musicMuted = !musicMuted;
        music.muted = musicMuted;
        musicToggle.textContent = musicMuted ? "Unmute" : "Mute";

        if (!musicMuted && music.paused) music.play();

        saveAudioSettings();
    });

    musicVolume.addEventListener("input", () => {
        music.volume = musicVolume.value;
        saveAudioSettings();
    });

    rollToggle.addEventListener("click", () => {
        rollMuted = !rollMuted;
        rollSound.muted = rollMuted;
        rollToggle.textContent = rollMuted ? "Unmute" : "Mute";
        saveAudioSettings();
    });

    rollVolume.addEventListener("input", () => {
        rollSound.volume = rollVolume.value;
        saveAudioSettings();
    });
}

function saveAudioSettings() {
    localStorage.setItem("audioSettings", JSON.stringify({
        musicVolume: music.volume,
        musicMuted,
        rollVolume: rollSound.volume,
        rollMuted
    }));
}

function loadAudioSettings() {
    const saved = localStorage.getItem("audioSettings");
    if (!saved) return;

    const s = JSON.parse(saved);

    music.volume = s.musicVolume;
    musicMuted = s.musicMuted;
    music.muted = musicMuted;

    rollSound.volume = s.rollVolume;
    rollMuted = s.rollMuted;
    rollSound.muted = rollMuted;

    const musicToggle = document.getElementById("music-toggle");
    const rollToggle = document.getElementById("roll-toggle");

    if (musicToggle) {
        musicToggle.textContent = musicMuted ? "Unmute" : "Mute";
    }

    if (rollToggle) {
        rollToggle.textContent = rollMuted ? "Unmute" : "Mute";
    }
}

globalThis.audioControls = {
    loadAudioSettings,
    bindAudioUI,
    get musicMuted() {
        return musicMuted;
    },
    get rollMuted() {
        return rollMuted;
    }
};