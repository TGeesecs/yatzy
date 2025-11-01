// --- Game State Management ---
let diceValues = [1, 1, 1, 1, 1];
let totalScore = 0;
let rollCount = 0;
let keptDice = [false, false, false, false, false];
let roundsLeft = 13;
let gameIsOver = false;

// Score for all category names
const CATEGORIES = [
    'ones', 'twos', 'threes', 'fours', 'fives', 'sixes',
    'threeOfAKind', 'fourOfAKind', 'fullHouse',
    'smallStraight', 'largeStraight', 'chance', 'yatzy'
];

// Dynamically built objects
let scoresLocked = {};
const scoreDisplays = {};
const scoreSections = {};

// --- DOM Elements ---
const gameContainer = document.getElementById("gameContainer");
const rollButton = document.getElementById("rollButton");
const endGameButton = document.getElementById("endGameButton"); 
const newGameButton = document.getElementById("newGameButton");
const diceElements = [
    document.getElementById("dice1"), document.getElementById("dice2"),
    document.getElementById("dice3"), document.getElementById("dice4"),
    document.getElementById("dice5")
];
const rollCountDisplay = document.getElementById("rollCount");
const totalScoreDisplay = document.getElementById("totalScore");
const instructionsButton = document.getElementById("instructionsButton");
const instructionsModal = document.getElementById("instructionsModal");
const closeModalButton = document.getElementById("closeModalButton");

// --- Scoring Logic ---

function getDiceCounts(dice) {
    const counts = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 };
    for (const value of dice) { counts[value]++; }
    return counts;
}
function sumAllDice(dice) {
    return dice.reduce((sum, val) => sum + val, 0);
}

function scoreUpperSection(dice, num) {
    return getDiceCounts(dice)[num] * num;
}

function scoreNOfAKind(dice, n) {
    const counts = getDiceCounts(dice);
    for (const value in counts) {
        if (counts[value] >= n) { return sumAllDice(dice); }
    }
    return 0;
}
function scoreFullHouse(dice) {
    const counts = getDiceCounts(dice);
    let hasThree = false;
    let hasTwo = false;
    for (const value in counts) {
        if (counts[value] === 3) hasThree = true;
        if (counts[value] === 2) hasTwo = true;
    }
    return (hasThree && hasTwo) ? 25 : 0;
}
function scoreSmallStraight(dice) {
    const uniqueDice = new Set(dice);
    if (uniqueDice.has(1) && uniqueDice.has(2) && uniqueDice.has(3) && uniqueDice.has(4)) return 30;
    if (uniqueDice.has(2) && uniqueDice.has(3) && uniqueDice.has(4) && uniqueDice.has(5)) return 30;
    if (uniqueDice.has(3) && uniqueDice.has(4) && uniqueDice.has(5) && uniqueDice.has(6)) return 30;
    return 0;
}
function scoreLargeStraight(dice) {
    const uniqueDice = new Set(dice);
    if (uniqueDice.has(1) && uniqueDice.has(2) && uniqueDice.has(3) && uniqueDice.has(4) && uniqueDice.has(5)) return 40;
    if (uniqueDice.has(2) && uniqueDice.has(3) && uniqueDice.has(4) && uniqueDice.has(5) && uniqueDice.has(6)) return 40;
    return 0;
}
function scoreChance(dice) { return sumAllDice(dice); }
function scoreYatzy(dice) {
    const counts = getDiceCounts(dice);
    for (const value in counts) {
        if (counts[value] === 5) return 50;
    }
    return 0;
}

// Scoring function map
// This links the category ID to its corresponding function
const SCORING_FUNCTIONS = {
    ones: (dice) => scoreUpperSection(dice, 1),
    twos: (dice) => scoreUpperSection(dice, 2),
    threes: (dice) => scoreUpperSection(dice, 3),
    fours: (dice) => scoreUpperSection(dice, 4),
    fives: (dice) => scoreUpperSection(dice, 5),
    sixes: (dice) => scoreUpperSection(dice, 6),
    threeOfAKind: (dice) => scoreNOfAKind(dice, 3),
    fourOfAKind: (dice) => scoreNOfAKind(dice, 4),
    fullHouse: scoreFullHouse,
    smallStraight: scoreSmallStraight,
    largeStraight: scoreLargeStraight,
    chance: scoreChance,
    yatzy: scoreYatzy
};


// --- Game Logic ---

function initializeGame() {
    diceValues = [1, 1, 1, 1, 1];
    totalScore = 0;
    rollCount = 0;
    roundsLeft = 13;
    gameIsOver = false;
    keptDice = [false, false, false, false, false];
    
    for (const category of CATEGORIES) {
        scoresLocked[category] = false;
        scoreDisplays[category].textContent = 0;
        scoreSections[category].classList.remove("locked", "selectable");
    }

    updateDiceDisplay();
    rollCountDisplay.textContent = rollCount;
    
    rollButton.disabled = false;
    endGameButton.classList.remove("hidden");
    newGameButton.classList.add("hidden");
    totalScoreDisplay.innerText = "Total: 0";
    diceElements.forEach(die => die.classList.remove("kept"));
}

function rollSingleDice() {
    return Math.floor(Math.random() * 6) + 1;
}

function updateDiceDisplay() {
    diceElements.forEach((dieEl, index) => {
        const value = diceValues[index];
        dieEl.className = 'dice'; // Reset classes (removes face-1, face-2, etc.)
        dieEl.classList.add(`face-${value}`);
        if (keptDice[index]) {
            dieEl.classList.add('kept');
        }
    });
}

function toggleKeep(index) {
    if (rollCount > 0 && !gameIsOver) { 
        keptDice[index] = !keptDice[index];
        diceElements[index].classList.toggle("kept");
    }
}

function handleDiceRoll() {
    for (let i = 0; i < diceValues.length; i++) {
        if (!keptDice[i]) {
            diceValues[i] = rollSingleDice();
        }
    }
    
    incrementRollCount();
    updateDiceDisplay();
    updatePotentialScores(); 
}

function incrementRollCount() {
    if (rollCount < 3) {
        rollCount++;
        rollCountDisplay.textContent = rollCount;
    }
    if (rollCount >= 3) {
        rollButton.disabled = true; 
    }
}

// --- UI Update Functions ---

function updatePotentialScores() {
    for (const category of CATEGORIES) {
        if (!scoresLocked[category]) {
            // Get the score by calling the function from the map
            const score = SCORING_FUNCTIONS[category](diceValues);
            scoreDisplays[category].textContent = score;
            scoreSections[category].classList.add("selectable");
        }
    }
}

function calculateTotalScore() {
    totalScore = 0; 
    for (const category of CATEGORIES) {
        if (scoresLocked[category]) {
            totalScore += parseInt(scoreDisplays[category].textContent);
        }
    }
    totalScoreDisplay.innerText = "Total: " + totalScore;
}

function selectScore(category) {
    if (rollCount === 0 || scoresLocked[category] || gameIsOver) return; 

    scoresLocked[category] = true;
    roundsLeft--;
    
    scoreSections[category].classList.add("locked");
    scoreSections[category].classList.remove("selectable");

    calculateTotalScore();
    
    if (roundsLeft > 0) {
        resetTurn();
    } else {
        endGame();
    }
}

function resetTurn() {
    rollCount = 0;
    rollCountDisplay.textContent = rollCount;
    keptDice = [false, false, false, false, false];
    rollButton.disabled = false;
    
    for (const category of CATEGORIES) {
        if (!scoresLocked[category]) {
            scoreDisplays[category].textContent = 0;
            scoreSections[category].classList.remove("selectable");
        }
    }
    
    diceValues = [1, 1, 1, 1, 1];
    updateDiceDisplay();
}

function endGame() {
    if (gameIsOver) return; 
    gameIsOver = true;

    rollButton.disabled = true;
    endGameButton.classList.add("hidden");
    newGameButton.classList.remove("hidden");

    for (const category of CATEGORIES) {
        if (!scoresLocked[category]) {
            scoreSections[category].classList.add("locked");
            scoreSections[category].classList.remove("selectable");
        }
    }

    calculateTotalScore(); 
    alert(`Game Over! Your final score is: ${totalScore}`);
}


// --- Event Listeners & Initialization ---

function initializeApp() {
    for (const category of CATEGORIES) {
        // Build the objects
        scoresLocked[category] = false;
        scoreDisplays[category] = document.getElementById(`${category}Score`);
        scoreSections[category] = document.getElementById(`${category}-section`);

        // Add click listener
        scoreSections[category].addEventListener("click", () => selectScore(category));
    }
    
    // Add other listeners
    rollButton.addEventListener("click", handleDiceRoll);
    endGameButton.addEventListener("click", endGame);
    newGameButton.addEventListener("click", initializeGame);

    instructionsButton.addEventListener("click", () => {
        instructionsModal.classList.remove("hidden");
    });
    closeModalButton.addEventListener("click", () => {
        instructionsModal.classList.add("hidden");
    });
    instructionsModal.addEventListener("click", (event) => {
        if (event.target === instructionsModal) {
            instructionsModal.classList.add("hidden");
        }
    });
    
    diceElements.forEach((die, index) => {
        die.addEventListener("click", () => toggleKeep(index));
    });

    // Start the game
    initializeGame();
}

// Run the app
initializeApp();



