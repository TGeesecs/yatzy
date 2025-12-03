import {
    initializeGame, selectScore, endGame,
    CATEGORIES, scoreDisplays, scoreSections,
    $rollButton, $endGameButton, $newGameButton,
    $instructionsButton, $instructionsModal, $closeModalButton,
    $diceElements
} from './yatzyGame.js';

import {
    handleDiceRoll, toggleKeep
} from './dice.js';

// --- This code runs once the HTML document is loaded ---
$(document).ready(function () {

    // Dynamically build element objects and add listeners
    for (const category of CATEGORIES) {
        scoreDisplays[category] = $(`#${category}Score`);
        scoreSections[category] = $(`#${category}-section`);

        // Use jQuery's .on() to attach the click listener
        scoreSections[category].on("click", () => selectScore(category));
    }

    // Add other listeners using jQuery
    $rollButton.on("click", handleDiceRoll);
    $endGameButton.on("click", endGame);
    $newGameButton.on("click", initializeGame);

    // Modal listeners
    $instructionsButton.on("click", () => {
        $instructionsModal.removeClass("hidden");
    });
    $closeModalButton.on("click", () => {
        $instructionsModal.addClass("hidden");
    });
    $instructionsModal.on("click", (event) => {
        if (event.target === $instructionsModal[0]) {
            $instructionsModal.addClass("hidden");
        }
    });

    // Dice listeners
    $diceElements.forEach(($die, index) => {
        $die.on("click", () => toggleKeep(index));
    });

    // Start the game
    initializeGame();
});