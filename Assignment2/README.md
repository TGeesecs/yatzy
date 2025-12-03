# Yatzy Game - Server-Side Integration

## Assignment Overview
This project upgrades an existing client-side Yatzy game to use a **Node.js** and **Express** server. The game state, scoring logic, and dice generation are now handled on the server side to ensure data integrity.

## Features
* **Server-Side Logic:** Scoring algorithms and turn management are executed on the server.
* **API Integration:** The client communicates via RESTful API endpoints using the JavaScript Fetch API.
* **State Management:** The server maintains the `gameState` (dice values, scores, rolls left) in memory.
* **Interactive UI:** The client updates dynamically based on the JSON responses from the server.

## Installation and Setup

1.  **Prerequisites**
    * Node.js installed on your machine.

2.  **Setup**
    Open your terminal in the project directory and install the dependencies:
    ```bash
    npm install
    ```

3.  **Run the Server**
    Start the application:
    ```bash
    node server.js
    ```
    You should see the log: `Yatzy server running on http://localhost:3000`

4.  **Play**
    Open your web browser and navigate to: `http://localhost:3000`

## API Endpoints

The server exposes the following endpoints to manage the game:

### 1. Start Game
* **URL:** `/game/start`
* **Method:** `POST`
* **Description:** Resets the game state and starts a new session.

### 2. Get State
* **URL:** `/game/state`
* **Method:** `GET`
* **Description:** Returns the current game state object (useful for UI refreshes).

### 3. Roll Dice
* **URL:** `/game/roll`
* **Method:** `POST`
* **Body:** `{ "keptDice": [false, true, false, false, true] }`
* **Description:** Rolls the dice. Preserves values for dice marked as `true` in the `keptDice` array.

### 4. Score Category
* **URL:** `/game/score`
* **Method:** `POST`
* **Body:** `{ "category": "ones" }`
* **Description:** Calculates the score for the selected category, updates the total, and advances the game round.

### 5. End Game
* **URL:** `/game/end`
* **Method:** `POST`
* **Description:** Ends the game manually and returns the final score.