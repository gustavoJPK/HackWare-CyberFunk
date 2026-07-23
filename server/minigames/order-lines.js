// server/minigames/order-lines.js
// Arrange scrambled lines of code in the correct order

const BaseMinigame = require('./base');

const questions = [
  {
    topic: 'javascript', difficulty: 1,
    instruction: 'Ordena estas líneas para que el código funcione',
    lines: [
      'function saludar(nombre) {',
      '  console.log("Hola " + nombre);',
      '}',
      'saludar("Mundo");'
    ],
    answer: [0, 1, 2, 3]
  },
  {
    topic: 'javascript', difficulty: 2,
    instruction: 'Ordena el código para filtrar y mostrar números pares',
    lines: [
      'const numeros = [1, 2, 3, 4, 5, 6];',
      'const pares = numeros.filter(n => n % 2 === 0);',
      'console.log(pares);'
    ],
    answer: [0, 1, 2]
  },
  {
    topic: 'javascript', difficulty: 3,
    instruction: 'Ordena el código de la función async correctamente',
    lines: [
      'async function obtenerDatos() {',
      '  const respuesta = await fetch(url);',
      '  const datos = await respuesta.json();',
      '  return datos;',
      '}'
    ],
    answer: [0, 1, 2, 3, 4]
  },
  {
    topic: 'python', difficulty: 1,
    instruction: 'Ordena el código para calcular el factorial',
    lines: [
      'def factorial(n):',
      '  if n == 0:',
      '    return 1',
      '  return n * factorial(n - 1)'
    ],
    answer: [0, 1, 2, 3]
  },
  {
    topic: 'python', difficulty: 2,
    instruction: 'Ordena el código para leer y procesar una lista',
    lines: [
      'numeros = [10, 20, 30]',
      'total = sum(numeros)',
      'promedio = total / len(numeros)',
      'print(promedio)'
    ],
    answer: [0, 1, 2, 3]
  },
  {
    topic: 'sql', difficulty: 2,
    instruction: 'Ordena las cláusulas SQL correctamente',
    lines: [
      'SELECT nombre, COUNT(*) as total',
      'FROM pedidos',
      'WHERE estado = "activo"',
      'GROUP BY nombre',
      'ORDER BY total DESC;'
    ],
    answer: [0, 1, 2, 3, 4]
  },
  {
    topic: 'html', difficulty: 1,
    instruction: 'Ordena la estructura HTML básica',
    lines: [
      '<!DOCTYPE html>',
      '<html>',
      '<head><title>Mi página</title></head>',
      '<body><p>Hola</p></body>',
      '</html>'
    ],
    answer: [0, 1, 2, 3, 4]
  },
];

class OrderLines extends BaseMinigame {
  constructor() {
    super();
    this.id = 'order-lines';
    this.type = 'order-lines';
    this.name = 'Ordena el Código';
  }

  generate(difficulty = 1) {
    const pool = questions.filter(q => q.difficulty <= difficulty + 1 && q.difficulty >= Math.max(1, difficulty - 1));
    const q = this.pick(pool.length > 0 ? pool : questions);

    // Create shuffled order mapping
    const shuffledIndices = this.shuffle(q.answer);
    const shuffledLines = shuffledIndices.map(i => q.lines[i]);

    // The answer is the order in which the original lines appear
    // Player must click lines to put them in correct order
    // Answer: array of original line texts in correct order
    return {
      type: this.type,
      instruction: q.instruction,
      shuffledLines,          // lines in shuffled order shown to player
      correctLines: q.lines,  // correct order
      answer: q.lines,        // player must produce this order
      timeLimit: difficulty === 1 ? 18 : difficulty === 2 ? 15 : 12,
      difficulty: q.difficulty,
      topic: q.topic
    };
  }

  validate(playerAnswer, correctAnswer) {
    if (!Array.isArray(playerAnswer) || !Array.isArray(correctAnswer)) return false;
    if (playerAnswer.length !== correctAnswer.length) return false;
    return playerAnswer.every((line, i) => line.trim() === correctAnswer[i].trim());
  }
}

module.exports = OrderLines;
