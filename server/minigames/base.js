// server/minigames/base.js
// Base class for all minigame generators

class BaseMinigame {
  constructor() {
    this.id = 'base';
    this.type = 'base';
    this.name = 'Base Minigame';
    this.topics = [];
  }

  /**
   * Generate a minigame question
   * @param {number} difficulty - 1=easy, 2=medium, 3=hard
   * @param {string} topic - optional topic filter
   * @returns {{ question, answer, choices?, timeLimit, displayType, difficulty }}
   */
  generate(difficulty = 1, topic = null) {
    throw new Error('generate() must be implemented by subclass');
  }

  /**
   * Validate a player's answer
   * @param {any} playerAnswer
   * @param {any} correctAnswer
   * @returns {boolean}
   */
  validate(playerAnswer, correctAnswer) {
    if (Array.isArray(correctAnswer)) {
      return JSON.stringify(playerAnswer) === JSON.stringify(correctAnswer);
    }
    return String(playerAnswer).trim().toLowerCase() === String(correctAnswer).trim().toLowerCase();
  }

  /**
   * Pick a random item from array
   */
  pick(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
  }

  /**
   * Shuffle array (Fisher-Yates)
   */
  shuffle(arr) {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }
}

module.exports = BaseMinigame;
