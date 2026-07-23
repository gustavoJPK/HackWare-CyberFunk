// server/scoringSystem.js
// Points, combos, multipliers, lives

const MAX_LIVES = 5;
const MAX_MULTIPLIER = 8;
const LIFE_RECOVERY_STREAK = 10;

/**
 * Calculate score for a correct answer
 * @param {number} difficulty - 1, 2 or 3
 * @param {number} responseTime - ms taken to answer
 * @param {number} timeLimit - ms available
 * @param {number} combo - current combo count
 * @returns {{ points, multiplier, newCombo }}
 */
function calculateScore(difficulty, responseTime, timeLimit, combo) {
  const basePoints = difficulty * 100;
  const timeFraction = Math.max(0, 1 - responseTime / (timeLimit * 1000));
  const speedBonus = Math.round(timeFraction * 50);
  const newCombo = combo + 1;
  const multiplier = Math.min(newCombo, MAX_MULTIPLIER);
  const points = Math.round((basePoints + speedBonus) * multiplier);
  return { points, multiplier, newCombo };
}

/**
 * Process a correct answer on a player object (mutates in place)
 */
function applyCorrectAnswer(player, difficulty, responseTime, timeLimit) {
  const { points, multiplier, newCombo } = calculateScore(difficulty, responseTime, timeLimit, player.combo);

  player.score += points;
  player.combo = newCombo;
  player.multiplier = multiplier;
  player.maxCombo = Math.max(player.maxCombo, newCombo);
  player.correctAnswers++;
  player.totalAnswers++;
  player.totalResponseTime += responseTime;
  player.consecutiveCorrect++;

  let lifeGained = false;
  if (player.consecutiveCorrect >= LIFE_RECOVERY_STREAK && player.lives < MAX_LIVES) {
    player.lives++;
    player.consecutiveCorrect = 0;
    lifeGained = true;
  }

  return { points, multiplier, newCombo, lifeGained };
}

/**
 * Process a wrong answer or timeout on a player object (mutates in place)
 * @returns {{ eliminated: boolean }}
 */
function applyWrongAnswer(player) {
  player.combo = 0;
  player.multiplier = 1;
  player.consecutiveCorrect = 0;
  player.totalAnswers++;
  player.lives = Math.max(0, player.lives - 1);

  const eliminated = player.lives <= 0;
  if (eliminated) {
    player.alive = false;
    player.eliminatedAt = Date.now();
  }

  return { eliminated };
}

/**
 * Calculate final ranking from players array
 * Already-eliminated players sorted by eliminatedAt desc (eliminated last = better rank)
 */
function calculateRanking(players) {
  const sorted = [...players].sort((a, b) => {
    // Alive players rank first
    if (a.alive && !b.alive) return -1;
    if (!a.alive && b.alive) return 1;
    // Both alive or both eliminated: sort by score
    if (b.score !== a.score) return b.score - a.score;
    // Tie-break: later elimination = higher rank (stayed alive longer)
    if (a.eliminatedAt && b.eliminatedAt) return b.eliminatedAt - a.eliminatedAt;
    return 0;
  });

  return sorted.map((p, i) => ({
    rank: i + 1,
    id: p.id,
    username: p.username,
    score: p.score,
    maxCombo: p.maxCombo,
    correctAnswers: p.correctAnswers,
    totalAnswers: p.totalAnswers,
    avgResponseTime: p.totalAnswers > 0
      ? Math.round(p.totalResponseTime / p.totalAnswers)
      : 0,
    livesRemaining: p.lives,
    alive: p.alive,
  }));
}

module.exports = { calculateScore, applyCorrectAnswer, applyWrongAnswer, calculateRanking };
