// server/minigames/match-concepts.js
// Click-to-match: connect terms to their definitions

const BaseMinigame = require('./base');

const questionSets = [
  {
    topic: 'javascript', difficulty: 1,
    pairs: [
      { term: 'let', definition: 'Variable que puede reasignarse' },
      { term: 'const', definition: 'Variable que NO puede reasignarse' },
      { term: 'var', definition: 'Variable con scope de función (legacy)' },
    ]
  },
  {
    topic: 'oop', difficulty: 1,
    pairs: [
      { term: 'Clase', definition: 'Plantilla para crear objetos' },
      { term: 'Objeto', definition: 'Instancia de una clase' },
      { term: 'Método', definition: 'Función definida dentro de una clase' },
    ]
  },
  {
    topic: 'oop', difficulty: 2,
    pairs: [
      { term: 'Herencia', definition: 'Una clase extiende otra' },
      { term: 'Polimorfismo', definition: 'Mismo método, comportamiento distinto' },
      { term: 'Encapsulamiento', definition: 'Ocultar datos internos del objeto' },
    ]
  },
  {
    topic: 'algorithms', difficulty: 2,
    pairs: [
      { term: 'O(1)', definition: 'Tiempo constante' },
      { term: 'O(n)', definition: 'Tiempo lineal' },
      { term: 'O(n²)', definition: 'Tiempo cuadrático' },
    ]
  },
  {
    topic: 'sql', difficulty: 1,
    pairs: [
      { term: 'SELECT', definition: 'Obtener datos' },
      { term: 'INSERT', definition: 'Agregar datos' },
      { term: 'DELETE', definition: 'Eliminar datos' },
    ]
  },
  {
    topic: 'javascript', difficulty: 2,
    pairs: [
      { term: 'map()', definition: 'Transforma cada elemento del array' },
      { term: 'filter()', definition: 'Filtra elementos según condición' },
      { term: 'reduce()', definition: 'Reduce el array a un único valor' },
    ]
  },
  {
    topic: 'css', difficulty: 1,
    pairs: [
      { term: 'margin', definition: 'Espacio FUERA del elemento' },
      { term: 'padding', definition: 'Espacio DENTRO del elemento' },
      { term: 'border', definition: 'Borde del elemento' },
    ]
  },
  {
    topic: 'html', difficulty: 1,
    pairs: [
      { term: '<h1>', definition: 'Encabezado principal' },
      { term: '<p>', definition: 'Párrafo de texto' },
      { term: '<a>', definition: 'Enlace / hipervínculo' },
    ]
  },
];

class MatchConcepts extends BaseMinigame {
  constructor() {
    super();
    this.id = 'match-concepts';
    this.type = 'match-concepts';
    this.name = 'Conecta los Conceptos';
  }

  generate(difficulty = 1) {
    const pool = questionSets.filter(q => q.difficulty <= difficulty + 1 && q.difficulty >= Math.max(1, difficulty - 1));
    const q = this.pick(pool.length > 0 ? pool : questionSets);

    const terms = q.pairs.map(p => p.term);
    const definitions = this.shuffle(q.pairs.map(p => p.definition));
    const answer = {}; // { term: definition }
    q.pairs.forEach(p => { answer[p.term] = p.definition; });

    return {
      type: this.type,
      instruction: 'Conecta cada término con su definición correcta',
      terms,
      definitions,
      answer,
      timeLimit: difficulty === 1 ? 20 : difficulty === 2 ? 16 : 13,
      difficulty: q.difficulty,
      topic: q.topic
    };
  }

  validate(playerAnswer, correctAnswer) {
    if (typeof playerAnswer !== 'object' || typeof correctAnswer !== 'object') return false;
    const keys = Object.keys(correctAnswer);
    return keys.every(k => playerAnswer[k] === correctAnswer[k]);
  }
}

module.exports = MatchConcepts;
