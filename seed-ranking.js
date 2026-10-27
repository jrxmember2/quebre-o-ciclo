// Povoa o ranking com jogadores de exemplo, sem tocar nas partidas reais.
// Uso (dentro do container):  node seed-ranking.js           -> insere (só se ainda não houver exemplos)
//                             node seed-ranking.js --remover -> apaga apenas os exemplos
import { DatabaseSync } from 'node:sqlite';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const DATA_DIR = process.env.DATA_DIR || path.join(path.dirname(fileURLToPath(import.meta.url)), 'data');
const db = new DatabaseSync(path.join(DATA_DIR, 'ranking.db'));

// O server.js cria a tabela; garantimos aqui também, para o script rodar sozinho.
db.exec(`CREATE TABLE IF NOT EXISTS partidas (
  id INTEGER PRIMARY KEY AUTOINCREMENT, nome TEXT NOT NULL, turma TEXT, avatar TEXT NOT NULL,
  pontos INTEGER NOT NULL, f1 INTEGER NOT NULL, f2 INTEGER NOT NULL, f3 INTEGER NOT NULL,
  criado_em TEXT NOT NULL DEFAULT (datetime('now')))`);
const colunas = db.prepare('PRAGMA table_info(partidas)').all().map(c => c.name);
if (!colunas.includes('exemplo')) db.exec('ALTER TABLE partidas ADD COLUMN exemplo INTEGER NOT NULL DEFAULT 0');

if (process.argv.includes('--remover')) {
  const { changes } = db.prepare('DELETE FROM partidas WHERE exemplo = 1').run();
  console.log(`${changes} jogadores de exemplo removidos.`);
  process.exit(0);
}

const ja = db.prepare('SELECT COUNT(*) AS n FROM partidas WHERE exemplo = 1').get().n;
if (ja) {
  console.log(`Já existem ${ja} jogadores de exemplo. Nada feito (use --remover antes, se quiser refazer).`);
  process.exit(0);
}

const NOMES = [
  'Duda', 'Gabi_17', 'Pedrinho', 'LuaMaria', 'Kauã', 'Ryan', 'Isa B', 'Enzo', 'Yasmin', 'Davizin',
  'Mel', 'TH', 'Heloísa', 'JP', 'Nanda', 'Bielzin', 'Vitória', 'Kaique', 'Ana Clara', 'Sofi',
  'Lorenzo', 'Bella', 'Matheus R', 'Rafa', 'Lívia', 'Gui', 'Manu', 'Arthurzin', 'Clarinha', 'Nicolas',
  'Bia S', 'Samuel', 'Luiza', 'Heitor', 'Julinha', 'Breno', 'Ester', 'Caio', 'Lara', 'Miguel',
  'Alice', 'Pietro', 'Valentina', 'Bernardo', 'Duda.M', 'Ketlyn', 'Wesley', 'Thalita', 'Igor', 'Carol',
  'Vini', 'Lohana', 'Emanuel', 'Rebeca', 'Otávio', 'Giovanna', 'Murilo', 'Aninha', 'Diogo', 'Stefany',
  'Luan', 'Ayla', 'Cauã', 'Raissa', 'Felipe', 'Mirella',
];
const TURMAS = [
  '1º A', '1A', '1° ano B', '2ºB', '2 ano C', '3º ano', '3C', '9º ano', '9A', '8ª série', '7º B', '6º ano A',
  '1EM', '2º EM', '3º EM B', '1º ano', 'turma 2B', '8B', '9° C', '1 ano A', '2°A', '3ºA', '7ª', '8º ano C',
  '1ºano', '2° B', '3 EM', '9 ano B', null, null, null,
];
const AVATARES = ['lia', 'davi', 'bia', 'theo'];

// Gerador pseudoaleatório com semente fixa: o resultado é sempre o mesmo.
let s = 20261027;
const rnd = () => ((s = (s * 1103515245 + 12345) % 2147483648) / 2147483648);
const pega = a => a[Math.floor(rnd() * a.length)];

const inserir = db.prepare(`INSERT INTO partidas (nome, turma, avatar, pontos, f1, f2, f3, criado_em, exemplo)
  VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now', ?, ?, ?), 1)`);

db.exec('BEGIN');
NOMES.forEach((nome, i) => {
  const habilidade = 1 - i / NOMES.length; // 1 = melhor jogador
  // Fase 2: seis escolhas reais do jogo (0, 25, 50, 75 ou 150).
  let f2 = 0;
  for (let k = 0; k < 6; k++) f2 += rnd() < .35 + habilidade * .55 ? 150 : pega([0, 25, 50, 75]);
  // Fase 1: até ~2000 nos melhores.
  const f1 = Math.round((500 + habilidade * 1300 + rnd() * 250) / 5) * 5;
  // Fase 3: completa o total, em múltiplos de 50, com teto geral de 7000.
  const alvo = Math.min(7000, 1100 + habilidade * 5700 + (rnd() - .5) * 500);
  const f3 = Math.max(150, Math.round((alvo - f1 - f2) / 50) * 50);
  const pontos = Math.min(7000, f1 + f2 + f3);
  // Datas: alguns hoje, vários na semana, o resto nas últimas 3 semanas, em horário de aula.
  // Hoje: algumas horas atrás. Outros dias: entre 7h e 17h de Brasília (10h–20h UTC).
  const dias = i % 9 === 0 ? 0 : i % 3 === 0 ? 1 + Math.floor(rnd() * 6) : 1 + Math.floor(rnd() * 20);
  const quando = dias === 0
    ? [`-${30 + Math.floor(rnd() * 240)} minutes`, '+0 days', '+0 minutes']
    : ['start of day', `-${dias} days`, `+${600 + Math.floor(rnd() * 600)} minutes`];
  inserir.run(nome, pega(TURMAS), pega(AVATARES), pontos, f1, f2, pontos - f1 - f2, ...quando);
});
db.exec('COMMIT');

const top = db.prepare('SELECT nome, turma, pontos FROM partidas ORDER BY pontos DESC LIMIT 5').all();
console.log(`${NOMES.length} jogadores de exemplo inseridos. Top 5 agora:`);
top.forEach((t, i) => console.log(`  ${i + 1}º ${t.nome} (${t.turma ?? '-'}) ${t.pontos}`));
