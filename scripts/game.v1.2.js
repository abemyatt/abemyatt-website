const audioControls = globalThis.audioControls;

let isRolling = false;
const button = document.getElementById("game-button");

const RARITY = {
    COMMON: 100,
    UNCOMMON: 40,
    RARE: 15,
    EPIC: 5,
    LEGENDARY: 1
}

const items = [
    {text: "Wallabies", rarity: RARITY.COMMON, image: "https://cdn.abemyatt.com/game/wallabies.png"},
    {text: "Bactrian Camel", rarity: RARITY.UNCOMMON, image: "https://cdn.abemyatt.com/game/bactrian-camel.png"},
    {text: "Flamingos", rarity: RARITY.RARE, image: "https://cdn.abemyatt.com/game/flamingos.png"},
    {text: "Bird", rarity: RARITY.EPIC, image: "https://cdn.abemyatt.com/game/bird.png"},
    {text: "Toilet Cistern", rarity: RARITY.LEGENDARY, image: "https://cdn.abemyatt.com/game/toilet-cistern.png"},
];
const animationItems = items.filter(item => item.rarity !== RARITY.LEGENDARY);

function getAnimationItem() {
    return animationItems[Math.floor(Math.random() * animationItems.length)];
}

const totalWeight = items.reduce((sum, item) => sum + item.rarity, 0);

function getRandomSelection() {
    let random = Math.random() * totalWeight;

    for (let item of items) {
        if (random < item.rarity) {
            return item;
        }
        random -= item.rarity;
    }
}

function loadStats() {
    const saved = localStorage.getItem("gameStats");
    if (saved) return JSON.parse(saved);

    return {
        totalClicks: 0,
        itemCounts: {},
        seen: []
    };
}

function saveStats(stats) {
    localStorage.setItem("gameStats", JSON.stringify(stats));
}

function updateStatsUI(stats) {
    const statsText = document.getElementById("stats-text");
    const breakdown = document.getElementById("stats-breakdown");

    const seenCount = stats.seen.length;
    const totalItems = items.length;

    // Top summary
    statsText.textContent =
        `Clicks: ${stats.totalClicks}\nSeen: ${seenCount}/${totalItems}`;

    // Breakdown list
    breakdown.innerHTML = "";

    items.forEach(item => {
        const count = stats.itemCounts[item.text] || 0;

        const row = document.createElement("div");
        let displayedText = item.text;
        if (!stats.seen.includes(item.text)) {
            row.style.opacity = "0.4";
            displayedText = "???";
        }
        if (item.rarity <= 4) {
            row.style.fontWeight = "bold";
        }

        row.innerHTML = `
            <span>${displayedText}</span>
            <span>${count}</span>
        `;

        breakdown.appendChild(row);
    });
}

let stats = loadStats();

button.addEventListener("click", () => {
    if (isRolling) return;
    isRolling = true;
    button.disabled = true;

    const img = document.getElementById("result-image");
    const text = document.getElementById("result-text");

    let rollCount = 0;
    const minRolls = 10;
    const maxRolls = 30;
    const rolls = Math.floor(Math.random() * (maxRolls - minRolls + 1)) + minRolls;

    const MAX_DELAY = 360;

    function rollStep(delay = 60) {
        const roll = globalThis.audio.rollSound;
        roll.currentTime = 0;

        const variation = (Math.random() * 0.14) - 0.07;
        roll.playbackRate = 1 + variation + (0.002 * rollCount);

        if (!roll.muted && roll.volume > 0) {
            roll.play();
        }
        const randomItem = getAnimationItem();

        img.src = randomItem.image;
        img.alt = randomItem.text;
        img.style.display = "block";

        text.textContent = "Rolling...";

        rollCount++;

        if (rollCount < rolls) {
            const nextDelay = Math.min(delay * 1.2, MAX_DELAY);

            setTimeout(() => rollStep(nextDelay), delay);
        } else {
            const selected = getRandomSelection();

            stats.totalClicks++;

            if (!stats.itemCounts[selected.text]) {
                stats.itemCounts[selected.text] = 0;
            }
            stats.itemCounts[selected.text]++;

            if (!stats.seen.includes(selected.text)) {
                stats.seen.push(selected.text);
            }

            saveStats(stats);
            updateStatsUI(stats);

            const probability = (selected.rarity / totalWeight) * 100;

            img.src = selected.image;
            img.alt = selected.text;

            img.classList.add("result-pop");
            setTimeout(() => img.classList.remove("result-pop"), 200);

            text.textContent =
                `You got ${selected.text} (${probability.toFixed(2)}% chance)`;

            button.disabled = false;
            isRolling = false;
            const roll = globalThis.audio.rollSound;

            roll.pause();
            roll.currentTime = 0;
            roll.loop = false;
            roll.playbackRate = 1;
        }
    }

    rollStep();
});

const resetButton = document.getElementById("reset-stats-button");

resetButton.addEventListener("click", () => {
    const confirmReset = confirm("Are you sure you want to reset all progress?");
    if (!confirmReset) return;
    localStorage.removeItem("gameStats");

    stats = {
        totalClicks: 0,
        itemCounts: {},
        seen: []
    };

    document.getElementById("result-image").style.display = "none";
    document.getElementById("result-text").textContent = "";

    updateStatsUI(stats);
});

window.addEventListener("load", () => {
    audioControls.loadAudioSettings();
    audioControls.bindAudioUI();

    startMusic();
    updateStatsUI(stats);
});