// --- Game State (Client View) ---
export let keptDice = [false, false, false, false, false];

// --- jQuery Selectors ---
export const $rollButton = $("#rollButton");
export const $endGameButton = $("#endGameButton");
export const $newGameButton = $("#newGameButton");
export const $diceElements = [
    $("#dice1"), $("#dice2"), $("#dice3"), $("#dice4"), $("#dice5")
];
export const $rollCountDisplay = $("#rollCount");
export const $totalScoreDisplay = $("#totalScore");
export const $instructionsButton = $("#instructionsButton");
export const $instructionsModal = $("#instructionsModal");
export const $closeModalButton = $("#closeModalButton");

export const CATEGORIES = [
    'ones', 'twos', 'threes', 'fours', 'fives', 'sixes',
    'threeOfAKind', 'fourOfAKind', 'fullHouse',
    'smallStraight', 'largeStraight', 'chance', 'yatzy'
];

export const scoreDisplays = {};
export const scoreSections = {};

// --- State Management ---
export function setKeptDice(index, value) {
    keptDice[index] = value;
}
export function resetKeptDice() {
    keptDice = [false, false, false, false, false];
    $diceElements.forEach($die => $die.removeClass("kept"));
}

// --- Client-Server Communication Functions ---

// 1. Start Game
export async function initializeGame() {
    try {
        const response = await fetch('/game/start', { method: 'POST' });
        const gameState = await response.json();
        updateUI(gameState);
        resetKeptDice();
    } catch (err) {
        console.error("Error starting game:", err);
    }
}

// 2. Select Category
export async function selectScore(category) {
    const $section = $(`#${category}-section`);

    // Only allow click if the section is marked as 'selectable'
    if (!$section.hasClass('selectable')) return;

    try {
        const response = await fetch('/game/score', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ category })
        });

        if (!response.ok) throw new Error("Move rejected by server");

        const gameState = await response.json();
        resetKeptDice();
        updateUI(gameState);

        if (gameState.gameIsOver) {
            alert(`Game Over! Final Score: ${gameState.totalScore}`);
        }

    } catch (err) {
        console.error("Error selecting score:", err);
    }
}

// --- UI Update Function ---
export function updateUI(gameState) {
    // Update Dice Faces
    gameState.diceValues.forEach((val, index) => {
        const $die = $diceElements[index];
        $die.removeClass("face-1 face-2 face-3 face-4 face-5 face-6")
            .addClass(`face-${val}`);
    });

    // Update Roll Count & Total Score
    $rollCountDisplay.text(gameState.rollCount);
    $totalScoreDisplay.text("Total: " + gameState.totalScore);

    // Update Scorecard
    const potential = gameState.potentialScores;
    const locked = gameState.scoresLocked;

    CATEGORIES.forEach(cat => {
        scoreDisplays[cat].text(potential[cat] !== undefined ? potential[cat] : 0);

        scoreSections[cat].removeClass("locked selectable");

        if (locked[cat]) {
            scoreSections[cat].addClass("locked");
        } else if (!gameState.gameIsOver && gameState.rollCount > 0) {
            scoreSections[cat].addClass("selectable");
        }
    });

    // Update Buttons
    if (gameState.gameIsOver) {
        $rollButton.prop('disabled', true);
        $endGameButton.addClass("hidden");
        $newGameButton.removeClass("hidden");
    } else {
        $newGameButton.addClass("hidden");
        $endGameButton.removeClass("hidden");

        if (gameState.rollCount >= 3) {
            $rollButton.prop('disabled', true);
        } else {
            $rollButton.prop('disabled', false);
            $rollButton.text("Roll Dice");
        }
    }
}

// --- END GAME FUNCTION (Updated) ---
export async function endGame() {
    try {
        // Fetch the final score from the server
        const response = await fetch('/game/end', { method: 'POST' });

        if (!response.ok) throw new Error("Server failed to end game");

        const data = await response.json();

        // Show the alert with the score from the server
        alert(`Game Ended! Your Final Score: ${data.totalScore}`);

        // Restart game
        initializeGame();
    } catch (err) {
        console.error("Error ending game:", err);
        alert("Game Ended. (Server error - make sure server.js is updated)");
        window.location.reload();
    }
}