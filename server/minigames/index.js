// server/minigames/index.js
// Minigame registry — add new minigame files here, no other changes needed

const QuickQuiz = require('./quick-quiz');
const WhatPrints = require('./what-prints');
const SpotTheBug = require('./spot-the-bug');
const CompleteCode = require('./complete-code');
const OrderLines = require('./order-lines');
const MatchConcepts = require('./match-concepts');

const registry = [
  new QuickQuiz(),
  new WhatPrints(),
  new SpotTheBug(),
  new CompleteCode(),
  new OrderLines(),
  new MatchConcepts(),
];

/**
 * Get a random minigame, weighted by difficulty
 * @param {number} roundNumber - current round (used to ramp up difficulty)
 * @returns {{ minigame, questionData }}
 */
function getNextMinigame(roundNumber = 1) {
  // Difficulty ramps up: easy for first 5, medium for 5-15, hard after 15
  let difficulty = 1;
  if (roundNumber > 5 && roundNumber <= 15) difficulty = 2;
  else if (roundNumber > 15) difficulty = 3;

  // Weight types so no same type twice in a row (stored in closure)
  const minigame = registry[Math.floor(Math.random() * registry.length)];
  const questionData = minigame.generate(difficulty);

  return { minigame, questionData };
}

/**
 * Get a specific minigame by id
 */
function getMinigame(id) {
  return registry.find(m => m.id === id);
}

module.exports = { registry, getNextMinigame, getMinigame };
