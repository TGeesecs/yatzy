const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware to parse JSON bodies
app.use(express.json());

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// --- Server-Side Game State ---
let gameState = {
    diceValues: [1, 1, 1, 1, 1],
    rollCount: 0,
    roundsLeft: 13,
    scoresLocked: {},
    scores: {},
    totalScore: 0,
    gameIsOver: false
};

// --- Scoring Logic ---
const SCORING = {
    upper: (dice, num) => dice.filter(d => d === num).reduce((a, b) => a + b, 0),
    nOfAKind: (dice, n) => {
        const counts = {};
        dice.forEach(d => counts[d] = (counts[d] || 0) + 1);
        for (let val in counts) {
            if (counts[val] >= n) return dice.reduce((a, b) => a + b, 0);
        }
        return 0;
    },
    fullHouse: (dice) => {
        const counts = {};
        dice.forEach(d => counts[d] = (counts[d] || 0) + 1);
        const values = Object.values(counts);
        return (values.includes(3) && values.includes(2)) ? 25 : 0;
    },
    smallStraight: (dice) => {
        const unique = [...new Set(dice)].sort().join('');
        return /1234|2345|3456/.test(unique) ? 30 : 0;
    },
    largeStraight: (dice) => {
        const unique = [...new Set(dice)].sort().join('');
        return /12345|23456/.test(unique) ? 40 : 0;
    },
    chance: (dice) => dice.reduce((a, b) => a + b, 0),
    yatzy: (dice) => {
        return (new Set(dice).size === 1) ? 50 : 0;
    }
};

const CATEGORIES = {
    ones: (d) => SCORING.upper(d, 1),
    twos: (d) => SCORING.upper(d, 2),
    threes: (d) => SCORING.upper(d, 3),
    fours: (d) => SCORING.upper(d, 4),
    fives: (d) => SCORING.upper(d, 5),
    sixes: (d) => SCORING.upper(d, 6),
    threeOfAKind: (d) => SCORING.nOfAKind(d, 3),
    fourOfAKind: (d) => SCORING.nOfAKind(d, 4),
    fullHouse: (d) => SCORING.fullHouse(d),
    smallStraight: (d) => SCORING.smallStraight(d),
    largeStraight: (d) => SCORING.largeStraight(d),
    chance: (d) => SCORING.chance(d),
    yatzy: (d) => SCORING.yatzy(d)
};

// --- Helper Functions ---
function calculatePotentialScores() {
    const potential = {};
    for (const key in CATEGORIES) {
        if (gameState.scoresLocked[key]) {
            potential[key] = gameState.scores[key];
        } else {
            potential[key] = CATEGORIES[key](gameState.diceValues);
        }
    }
    return potential;
}

function resetTurn() {
    gameState.rollCount = 0;
    gameState.diceValues = [6, 6, 6, 6, 6];
}

function initGame() {
    gameState = {
        diceValues: [6, 6, 6, 6, 6],
        rollCount: 0,
        roundsLeft: 13,
        scoresLocked: {},
        scores: {},
        totalScore: 0,
        gameIsOver: false
    };
    for (const key in CATEGORIES) {
        gameState.scoresLocked[key] = false;
        gameState.scores[key] = 0;
    }
}

// --- API Endpoints ---

// GET /game/state
app.get('/game/state', (req, res) => {
    const response = {
        ...gameState,
        potentialScores: calculatePotentialScores()
    };
    res.json(response);
});

// POST /game/start
app.post('/game/start', (req, res) => {
    initGame();
    console.log("--- NEW GAME STARTED ---");
    res.json({ ...gameState, potentialScores: calculatePotentialScores() });
});

// POST /game/roll
app.post('/game/roll', (req, res) => {
    const { keptDice } = req.body;

    if (gameState.gameIsOver || gameState.rollCount >= 3) {
        return res.status(400).json({ error: "Cannot roll" });
    }

    const newValues = gameState.diceValues.map((val, index) => {
        return (keptDice && keptDice[index]) ? val : Math.floor(Math.random() * 6) + 1;
    });

    gameState.diceValues = newValues;
    gameState.rollCount++;

    console.log(`[SERVER] Rolled dice (Roll ${gameState.rollCount}/3): [${gameState.diceValues}]`);

    res.json({
        ...gameState,
        potentialScores: calculatePotentialScores()
    });
});

// POST /game/score
app.post('/game/score', (req, res) => {
    const { category } = req.body;

    console.log(`[SERVER] Client requested to score: "${category}"`);

    // Validation: Block if Game Over, Locked, or NO Rolls yet (Count == 0)
    if (gameState.gameIsOver || gameState.scoresLocked[category] || gameState.rollCount === 0) {
        console.log(`[SERVER] Request denied: Invalid state.`);
        return res.status(400).json({ error: "Invalid move" });
    }

    const scoreEarned = CATEGORIES[category](gameState.diceValues);

    console.log(`[SERVER] Success! Score calculated: ${scoreEarned}. Updating total.`);

    gameState.scoresLocked[category] = true;
    gameState.scores[category] = scoreEarned;
    gameState.totalScore += scoreEarned;
    gameState.roundsLeft--;

    if (gameState.roundsLeft <= 0) {
        gameState.gameIsOver = true;
        console.log(`[SERVER] Game Over! Final Score: ${gameState.totalScore}`);
    } else {
        resetTurn();
    }

    res.json({
        ...gameState,
        potentialScores: calculatePotentialScores()
    });
});

// POST /game/end - THIS IS THE MISSING PART
app.post('/game/end', (req, res) => {
    gameState.gameIsOver = true;

    // 1. Log to Terminal
    console.log(`[SERVER] Game ended early by player. Final Score: ${gameState.totalScore}`);

    // 2. Send score to Client
    res.json({ totalScore: gameState.totalScore });
});

// Initialize and Listen
initGame();
app.listen(PORT, () => {
    console.log(`Yatzy server running on http://localhost:${PORT}`);
}); 