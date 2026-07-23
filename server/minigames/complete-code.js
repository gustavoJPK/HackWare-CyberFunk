// server/minigames/complete-code.js
// Fill in the blank — multiple choice

const BaseMinigame = require('./base');

const questions = [
  {
    topic: 'javascript', difficulty: 1,
    code: 'console.___(\"Hola mundo\");',
    blank: '___',
    choices: ['log', 'print', 'write', 'out'],
    answer: 'log'
  },
  {
    topic: 'javascript', difficulty: 1,
    code: 'const arr = [1,2,3];\narr.___(4);',
    blank: '___',
    choices: ['push', 'add', 'append', 'insert'],
    answer: 'push'
  },
  {
    topic: 'javascript', difficulty: 2,
    code: 'const nums = [1,2,3,4,5];\nconst evens = nums.___(n => n % 2 === 0);',
    blank: '___',
    choices: ['filter', 'map', 'reduce', 'find'],
    answer: 'filter'
  },
  {
    topic: 'javascript', difficulty: 2,
    code: 'const doubled = [1,2,3].___(x => x * 2);',
    blank: '___',
    choices: ['map', 'filter', 'forEach', 'reduce'],
    answer: 'map'
  },
  {
    topic: 'javascript', difficulty: 3,
    code: 'const promise = new ___(resolve => setTimeout(resolve, 1000));',
    blank: '___',
    choices: ['Promise', 'Async', 'Future', 'Callback'],
    answer: 'Promise'
  },
  {
    topic: 'python', difficulty: 1,
    code: 'numeros = [3, 1, 2]\nnumeros.___() \n# Ordena la lista',
    blank: '___',
    choices: ['sort', 'order', 'arrange', 'organize'],
    answer: 'sort'
  },
  {
    topic: 'python', difficulty: 2,
    code: 'texto = "hola mundo"\npalabras = texto.___(" ")',
    blank: '___',
    choices: ['split', 'divide', 'cut', 'separate'],
    answer: 'split'
  },
  {
    topic: 'python', difficulty: 2,
    code: 'numeros = [1,2,3,4,5]\ntotal = ___(numeros)',
    blank: '___',
    choices: ['sum', 'total', 'add', 'count'],
    answer: 'sum'
  },
  {
    topic: 'sql', difficulty: 1,
    code: 'SELECT * ___ usuarios;',
    blank: '___',
    choices: ['FROM', 'IN', 'OF', 'TABLE'],
    answer: 'FROM'
  },
  {
    topic: 'sql', difficulty: 2,
    code: 'SELECT nombre, COUNT(*) as total\nFROM pedidos\n___ nombre;',
    blank: '___',
    choices: ['GROUP BY', 'ORDER BY', 'WHERE', 'HAVING'],
    answer: 'GROUP BY'
  },
  {
    topic: 'html', difficulty: 1,
    code: '<___ href="https://example.com">Visitar</___>;',
    blank: '___',
    choices: ['a', 'link', 'href', 'url'],
    answer: 'a'
  },
  {
    topic: 'css', difficulty: 1,
    code: '.container {\n  ___: flex;\n}',
    blank: '___',
    choices: ['display', 'layout', 'type', 'mode'],
    answer: 'display'
  },
  {
    topic: 'css', difficulty: 2,
    code: '.box {\n  display: flex;\n  ___: center;\n}',
    blank: '___',
    choices: ['justify-content', 'align-items', 'flex-direction', 'flex-wrap'],
    answer: 'justify-content'
  },
];

class CompleteCode extends BaseMinigame {
  constructor() {
    super();
    this.id = 'complete-code';
    this.type = 'complete-code';
    this.name = 'Completa el Código';
  }

  generate(difficulty = 1) {
    const pool = questions.filter(q => q.difficulty <= difficulty + 1 && q.difficulty >= Math.max(1, difficulty - 1));
    const q = this.pick(pool.length > 0 ? pool : questions);
    return {
      type: this.type,
      instruction: 'Completa el código. ¿Qué va en el espacio?',
      code: q.code,
      blank: q.blank,
      choices: this.shuffle(q.choices),
      answer: q.answer,
      timeLimit: difficulty === 1 ? 12 : difficulty === 2 ? 10 : 8,
      difficulty: q.difficulty,
      topic: q.topic
    };
  }
}

module.exports = CompleteCode;
