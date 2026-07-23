// server/minigames/spot-the-bug.js
// Find the line with the error

const BaseMinigame = require('./base');

const questions = [
  {
    topic: 'javascript', difficulty: 1,
    lines: [
      'function suma(a, b) {',
      '  return a + b',
      '}',
      'console.log(suma(2, 3);'
    ],
    bugLine: 3,
    explanation: 'Falta el paréntesis de cierre en console.log'
  },
  {
    topic: 'javascript', difficulty: 1,
    lines: [
      'const nombre = "Ana";',
      'if (nombre = "Ana") {',
      '  console.log("Hola Ana");',
      '}'
    ],
    bugLine: 1,
    explanation: 'Se usa = (asignación) en vez de == o === (comparación)'
  },
  {
    topic: 'javascript', difficulty: 2,
    lines: [
      'const arr = [1, 2, 3];',
      'for (let i = 0; i <= arr.length; i++) {',
      '  console.log(arr[i]);',
      '}'
    ],
    bugLine: 1,
    explanation: 'Debe ser i < arr.length, no i <= arr.length (índice fuera de rango)'
  },
  {
    topic: 'javascript', difficulty: 2,
    lines: [
      'async function getData() {',
      '  const res = fetch("https://api.example.com");',
      '  const data = await res.json();',
      '  return data;',
      '}'
    ],
    bugLine: 1,
    explanation: 'Falta await antes de fetch()'
  },
  {
    topic: 'python', difficulty: 1,
    lines: [
      'def saludar(nombre):',
      '    print("Hola " + nombre)',
      '',
      'saludar("Mundo"'
    ],
    bugLine: 3,
    explanation: 'Falta el paréntesis de cierre al llamar saludar()'
  },
  {
    topic: 'python', difficulty: 2,
    lines: [
      'numeros = [1, 2, 3, 4, 5]',
      'for i in range(len(numeros)):',
      '    print(numeros[i])',
      'print(numeros[5])'
    ],
    bugLine: 3,
    explanation: 'El índice 5 no existe (índices van de 0 a 4), causa IndexError'
  },
  {
    topic: 'sql', difficulty: 2,
    lines: [
      'SELECT nombre, edad',
      'FROM usuarios',
      'WHER edad > 18',
      'ORDER BY nombre;'
    ],
    bugLine: 2,
    explanation: 'WHER está mal escrito, debe ser WHERE'
  },
  {
    topic: 'html', difficulty: 1,
    lines: [
      '<div>',
      '  <p>Hola mundo<p>',
      '  <span>texto</span>',
      '</div>'
    ],
    bugLine: 1,
    explanation: 'La etiqueta </p> de cierre no tiene la barra diagonal correctamente: <p>Hola mundo<p>'
  },
  {
    topic: 'javascript', difficulty: 3,
    lines: [
      'const obj = { nombre: "Ana" };',
      'const { nombre, edad = 0 } = obj;',
      'console.log(edad);',
      'obj.nombre = "Luis";',
      'console.log(nombre);'
    ],
    bugLine: 4,
    explanation: 'nombre ya fue desestructurado como copia; no refleja el cambio en obj.nombre'
  },
  {
    topic: 'javascript', difficulty: 1,
    lines: [
      'let x = 10;',
      'let y = 0;',
      'console.log(x / y);',
      'console.log("fin");'
    ],
    bugLine: 2,
    explanation: 'División entre cero produce Infinity en JS (no error, pero es un bug lógico)'
  },
];

class SpotTheBug extends BaseMinigame {
  constructor() {
    super();
    this.id = 'spot-the-bug';
    this.type = 'spot-the-bug';
    this.name = 'Encuentra el Bug';
  }

  generate(difficulty = 1) {
    const pool = questions.filter(q => q.difficulty <= difficulty + 1 && q.difficulty >= Math.max(1, difficulty - 1));
    const q = this.pick(pool.length > 0 ? pool : questions);
    return {
      type: this.type,
      instruction: '¡Encuentra el bug! Toca/haz clic en la línea con el error.',
      lines: q.lines,
      answer: q.bugLine,         // 0-indexed line number
      explanation: q.explanation,
      timeLimit: difficulty === 1 ? 14 : difficulty === 2 ? 12 : 10,
      difficulty: q.difficulty,
      topic: q.topic
    };
  }

  validate(playerAnswer, correctAnswer) {
    return parseInt(playerAnswer) === parseInt(correctAnswer);
  }
}

module.exports = SpotTheBug;
