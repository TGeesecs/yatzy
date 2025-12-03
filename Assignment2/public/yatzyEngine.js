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

export const SCORING_FUNCTIONS = {
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