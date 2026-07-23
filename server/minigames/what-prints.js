// server/minigames/what-prints.js
// "What does this code output?" multiple choice

const BaseMinigame = require('./base');

const questions = [
  {
    topic: 'javascript', difficulty: 1,
    code: `console.log(1 + "2");`,
    choices: ['"12"', '3', 'NaN', 'Error'],
    answer: '"12"'
  },
  {
    topic: 'javascript', difficulty: 1,
    code: `console.log(typeof 42);`,
    choices: ['"number"', '"integer"', '"float"', '"string"'],
    answer: '"number"'
  },
  {
    topic: 'javascript', difficulty: 2,
    code: `let x = 5;\nlet y = x++;\nconsole.log(y);`,
    choices: ['5', '6', '4', 'undefined'],
    answer: '5'
  },
  {
    topic: 'javascript', difficulty: 2,
    code: `console.log(0.1 + 0.2 === 0.3);`,
    choices: ['false', 'true', 'NaN', 'Error'],
    answer: 'false'
  },
  {
    topic: 'javascript', difficulty: 2,
    code: `const arr = [1, 2, 3];\nconsole.log(arr.length);`,
    choices: ['3', '2', '1', 'undefined'],
    answer: '3'
  },
  {
    topic: 'javascript', difficulty: 3,
    code: `function foo() {\n  return\n  42;\n}\nconsole.log(foo());`,
    choices: ['undefined', '42', 'null', 'Error'],
    answer: 'undefined'
  },
  {
    topic: 'javascript', difficulty: 3,
    code: `const a = [1,2,3];\nconst b = a;\nb.push(4);\nconsole.log(a.length);`,
    choices: ['4', '3', '1', 'Error'],
    answer: '4'
  },
  {
    topic: 'javascript', difficulty: 2,
    code: `console.log(!!0);`,
    choices: ['false', 'true', '0', 'NaN'],
    answer: 'false'
  },
  {
    topic: 'javascript', difficulty: 1,
    code: `let a = 10;\nif (a > 5) {\n  console.log("big");\n} else {\n  console.log("small");\n}`,
    choices: ['"big"', '"small"', 'true', 'undefined'],
    answer: '"big"'
  },
  {
    topic: 'python', difficulty: 1,
    code: `print(len("Hello"))`,
    choices: ['5', '4', '6', 'Error'],
    answer: '5'
  },
  {
    topic: 'python', difficulty: 2,
    code: `x = [1, 2, 3]\nprint(x[-1])`,
    choices: ['3', '1', '-1', 'Error'],
    answer: '3'
  },
  {
    topic: 'python', difficulty: 2,
    code: `print(3 ** 2)`,
    choices: ['9', '6', '8', '32'],
    answer: '9'
  },
  {
    topic: 'python', difficulty: 3,
    code: `a = [1,2,3]\nb = a[:]\nb.append(4)\nprint(len(a))`,
    choices: ['3', '4', '2', 'Error'],
    answer: '3'
  },
];

class WhatPrints extends BaseMinigame {
  constructor() {
    super();
    this.id = 'what-prints';
    this.type = 'what-prints';
    this.name = '¿Qué Imprime?';
  }

  generate(difficulty = 1) {
    const pool = questions.filter(q => q.difficulty <= difficulty + 1 && q.difficulty >= Math.max(1, difficulty - 1));
    const q = this.pick(pool.length > 0 ? pool : questions);
    return {
      type: this.type,
      instruction: '¿Qué imprime este código?',
      code: q.code,
      choices: this.shuffle(q.choices),
      answer: q.answer,
      timeLimit: difficulty === 1 ? 12 : difficulty === 2 ? 10 : 8,
      difficulty: q.difficulty,
      topic: q.topic
    };
  }
}

module.exports = WhatPrints;
