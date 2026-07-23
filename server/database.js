// server/database.js
// Pure JavaScript JSON file database — zero native dependencies

const fs = require('fs');
const path = require('path');

const DB_FILE = path.join(__dirname, '..', 'hackware_db.json');

// Ensure db file exists
function loadDb() {
  try {
    if (!fs.existsSync(DB_FILE)) {
      const initial = { matches: [], users: [] };
      fs.writeFileSync(DB_FILE, JSON.stringify(initial, null, 2), 'utf-8');
      return initial;
    }
    const data = fs.readFileSync(DB_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (e) {
    console.error('Error loading JSON DB:', e);
    return { matches: [], users: [] };
  }
}

function saveDb(data) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (e) {
    console.error('Error saving JSON DB:', e);
  }
}

/**
 * Save a completed match to the database
 */
function saveMatch(matchData) {
  const db = loadDb();
  const matchRecord = {
    id: matchData.id,
    roomCode: matchData.roomCode,
    startedAt: matchData.startedAt,
    endedAt: matchData.endedAt,
    playerCount: matchData.players.length,
    winnerName: matchData.players[0]?.username || 'N/A',
    players: matchData.players
  };

  db.matches.unshift(matchRecord); // newest first
  if (db.matches.length > 100) db.matches.pop(); // keep last 100

  saveDb(db);
  console.log(`[DB] Saved match ${matchData.id}`);
}

/**
 * Get recent matches (for leaderboard/history)
 */
function getRecentMatches(limit = 10) {
  const db = loadDb();
  return db.matches.slice(0, limit);
}

module.exports = { saveMatch, getRecentMatches };
