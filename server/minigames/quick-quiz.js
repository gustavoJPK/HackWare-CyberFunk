// server/minigames/quick-quiz.js
// True/False and multiple-choice concept questions

const BaseMinigame = require('./base');

const questions = [
  // JavaScript
  {
    topic: 'javascript', difficulty: 1,
    question: '¿Cuál es el resultado de typeof null en JavaScript?',
    choices: ['"object"', '"null"', '"undefined"', '"boolean"'],
    answer: '"object"'
  },
  {
    topic: 'javascript', difficulty: 1,
    question: '¿Qué keyword se usa para declarar una variable que NO puede reasignarse?',
    choices: ['const', 'let', 'var', 'static'],
    answer: 'const'
  },
  {
    topic: 'javascript', difficulty: 2,
    question: '¿Qué devuelve [] == false en JavaScript?',
    choices: ['true', 'false', 'undefined', 'Error'],
    answer: 'true'
  },
  {
    topic: 'javascript', difficulty: 2,
    question: '¿Cuál es la diferencia entre == y === en JavaScript?',
    choices: [
      '=== compara valor y tipo',
      '== compara valor y tipo',
      'Son idénticos',
      '=== solo funciona con números'
    ],
    answer: '=== compara valor y tipo'
  },
  {
    topic: 'javascript', difficulty: 3,
    question: '¿Qué es el "event loop" en JavaScript?',
    choices: [
      'Mecanismo que permite ejecutar código asíncrono en un hilo único',
      'Un bucle que itera sobre eventos del DOM',
      'Una función que maneja errores',
      'El ciclo de vida de un componente'
    ],
    answer: 'Mecanismo que permite ejecutar código asíncrono en un hilo único'
  },
  // HTML/CSS
  {
    topic: 'html', difficulty: 1,
    question: '¿Qué etiqueta HTML se usa para el título de la página en el navegador?',
    choices: ['<title>', '<h1>', '<header>', '<meta>'],
    answer: '<title>'
  },
  {
    topic: 'html', difficulty: 1,
    question: '¿Cuál es la propiedad CSS para cambiar el color de fondo?',
    choices: ['background-color', 'bg-color', 'color-background', 'back-color'],
    answer: 'background-color'
  },
  {
    topic: 'css', difficulty: 2,
    question: '¿Qué valor de display hace que un elemento sea flexible?',
    choices: ['flex', 'block', 'inline', 'grid'],
    answer: 'flex'
  },
  {
    topic: 'css', difficulty: 2,
    question: '¿Qué propiedad CSS controla el espacio DENTRO de un elemento?',
    choices: ['padding', 'margin', 'border', 'spacing'],
    answer: 'padding'
  },
  {
    topic: 'css', difficulty: 3,
    question: '¿Qué hace position: absolute?',
    choices: [
      'Posiciona respecto al ancestro posicionado más cercano',
      'Fija el elemento en la ventana',
      'Lo quita del flujo normal sin referencia',
      'Lo centra automáticamente'
    ],
    answer: 'Posiciona respecto al ancestro posicionado más cercano'
  },
  // OOP
  {
    topic: 'oop', difficulty: 1,
    question: '¿Qué es la herencia en POO?',
    choices: [
      'Una clase puede adquirir propiedades de otra clase',
      'Ocultar los datos internos de un objeto',
      'Una clase puede tener múltiples formas',
      'Crear objetos a partir de funciones'
    ],
    answer: 'Una clase puede adquirir propiedades de otra clase'
  },
  {
    topic: 'oop', difficulty: 2,
    question: '¿Cuál de estos NO es un pilar de la POO?',
    choices: ['Compilación', 'Herencia', 'Encapsulamiento', 'Polimorfismo'],
    answer: 'Compilación'
  },
  {
    topic: 'oop', difficulty: 2,
    question: '¿Qué es el encapsulamiento?',
    choices: [
      'Ocultar detalles internos y exponer solo lo necesario',
      'Crear múltiples instancias de una clase',
      'Heredar métodos de una clase padre',
      'Definir varios métodos con el mismo nombre'
    ],
    answer: 'Ocultar detalles internos y exponer solo lo necesario'
  },
  // SQL
  {
    topic: 'sql', difficulty: 1,
    question: '¿Qué comando SQL se usa para obtener datos de una tabla?',
    choices: ['SELECT', 'GET', 'FETCH', 'READ'],
    answer: 'SELECT'
  },
  {
    topic: 'sql', difficulty: 1,
    question: '¿Qué cláusula SQL filtra resultados?',
    choices: ['WHERE', 'FILTER', 'HAVING', 'LIMIT'],
    answer: 'WHERE'
  },
  {
    topic: 'sql', difficulty: 2,
    question: '¿Qué hace INNER JOIN?',
    choices: [
      'Devuelve solo filas con coincidencia en ambas tablas',
      'Devuelve todas las filas de la tabla izquierda',
      'Devuelve todas las filas de ambas tablas',
      'Elimina duplicados entre tablas'
    ],
    answer: 'Devuelve solo filas con coincidencia en ambas tablas'
  },
  // Algorithms
  {
    topic: 'algorithms', difficulty: 2,
    question: '¿Cuál es la complejidad de buscar en un array desordenado?',
    choices: ['O(n)', 'O(log n)', 'O(1)', 'O(n²)'],
    answer: 'O(n)'
  },
  {
    topic: 'algorithms', difficulty: 3,
    question: '¿Qué estructura de datos sigue el principio LIFO?',
    choices: ['Stack (Pila)', 'Queue (Cola)', 'Array', 'Linked List'],
    answer: 'Stack (Pila)'
  },
];

class QuickQuiz extends BaseMinigame {
  constructor() {
    super();
    this.id = 'quick-quiz';
    this.type = 'quick-quiz';
    this.name = 'Quiz Rápido';
    this.topics = ['javascript', 'html', 'css', 'oop', 'sql', 'algorithms'];
  }

  generate(difficulty = 1) {
    const pool = questions.filter(q => q.difficulty <= difficulty + 1 && q.difficulty >= difficulty - 1);
    const q = this.pick(pool.length > 0 ? pool : questions);
    return {
      type: this.type,
      question: q.question,
      choices: this.shuffle(q.choices),
      answer: q.answer,
      timeLimit: difficulty === 1 ? 12 : difficulty === 2 ? 10 : 8,
      difficulty: q.difficulty,
      topic: q.topic
    };
  }
}

module.exports = QuickQuiz;
