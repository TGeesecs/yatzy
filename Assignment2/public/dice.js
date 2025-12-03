import {
    $rollButton, $diceElements, keptDice,
    setKeptDice, updateUI
} from './yatzyGame.js';

// --- Dice-Specific Logic ---

export function toggleKeep(index) {
    // Only allow keeping if we have rolled at least once (but not 0)
    // Note: We rely on UI state for responsiveness here
    if (!$rollButton.prop('disabled') || $rollButton.text() === "Roll Dice") {
        const newState = !keptDice[index];
        setKeptDice(index, newState);
        $diceElements[index].toggleClass("kept", newState);
    }
}

export function handleDiceRoll() {
    $rollButton.prop('disabled', true).text("Rolling...");

    // Visual Animation Only
    let $diceToAnimate = $();
    $diceElements.forEach(($die, index) => {
        if (!keptDice[index]) {
            $diceToAnimate = $diceToAnimate.add($die);
        }
    });

    // If no dice to animate (all kept), fetch immediately (though UI usually prevents this)
    if ($diceToAnimate.length === 0) {
        performServerRoll();
        return;
    }

    // Trigger animation
    $diceToAnimate.first().data('isTrigger', true);
    $diceToAnimate
        .animate({ top: '-20px', opacity: 0.4 }, 150, 'swing')
        .animate({ left: '-8px', top: '-15px' }, 60)
        .animate({ left: '8px', top: '-20px' }, 60)
        .animate({ left: '0px', top: '-15px' }, 60)
        .animate({ top: '0px', opacity: 1.0 }, 150, 'swing',
            function () {
                // Callback: After animation finishes, fetch new data
                if ($(this).data('isTrigger')) {
                    performServerRoll();
                    $(this).removeData('isTrigger');
                }
            }
        );
}

// --- Server Roll Function  ---
async function performServerRoll() {
    try {
        const response = await fetch('/game/roll', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ keptDice: keptDice }) // Send kept dice state
        });

        if (!response.ok) {
            throw new Error(`Server error: ${response.statusText}`);
        }

        const gameState = await response.json();

        // Update global UI with server response
        updateUI(gameState);

    } catch (error) {
        console.error("Failed to fetch dice rolls:", error);
        alert("Failed to connect to the server.");
        $rollButton.prop('disabled', false).text("Roll Dice");
    }
}