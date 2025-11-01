# Yatzy Game

## Overview
This project is a single-player web-based Yatzy game created for **Assignment 1**. It is built using HTML, CSS, and vanilla JavaScript. The game implements the core Yatzy rules, scoring system, and a responsive user interface for a complete, playable experience.

## Gameplay Instructions
1. **Start a Turn:**  
   Click the **Roll Dice** button to roll all five dice. Each turn allows up to three rolls.

2. **Keep Dice:**  
   After your first or second roll, click any die to keep it. Kept dice will be highlighted and will not re-roll. Click again to unkeep.

3. **Re-Roll:**  
   Click **Roll Dice** again to re-roll only the dice that are not kept.

4. **Score Your Hand:**  
   After three rolls—or earlier if you prefer—select a category from the scorecard.  
   - The game displays the potential score for all available categories.  
   - You must choose one category per turn, even if the score is zero.

5. **End of Game:**  
   The game ends after all 13 categories have been filled. You can also end the game early using the **End Game** button.

6. **New Game:**  
   When a game finishes, the **End Game** button is replaced with a **New Game** button to reset and play again.

7. **Instructions:**  
   The **(?)** button in the top-right corner opens the rules and scoring guide at any time.

## Design Elements
The interface is designed to be clean, responsive, and mobile-friendly.

### Color Palette
| Role | Color Name | Hex Code | Usage |
|------|-------------|----------|--------|
| Primary | Orange | #F4A261 | Totals, kept dice, New Game button |
| Secondary | Teal | #2A9D8F | Roll button, section headers |
| Accent | Cream | #F1FAEE | Background color of game container |
| Text | Dark Blue | #264653 | Primary text for readability |
| Danger | Red | #E76F51 | End Game button |

### Fonts
| Type | Font | Description |
|------|------|--------------|
| Headings | Poppins | Used for the main “Assignment 1: Yatzy” title |
| Body & UI | Open Sans | Used for all buttons, scores, and modal text |

## Layout Structure

1. **Header (`.game-header`):**  
   A flexible container with the title and instructions button aligned horizontally.

2. **Scorecard (`.scorecard`):**  
   A two-column grid organizing all 13 categories. Section headers span both columns, and totals are displayed at the bottom.

3. **Dice Container (`.dice-container`):**  
   A centered flex container that arranges five dice and wraps them neatly on small screens.

4. **Dice (`.dice`):**  
   Each die is composed of multiple pip elements arranged by CSS classes to represent each face value.

5. **Controls (`.button-container`):**  
   A bottom section that contains the **Roll Dice**, **End Game**, and **New Game** buttons. Buttons are shown or hidden dynamically using JavaScript.
