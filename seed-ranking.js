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

// f = escolhe personagem menina (Lia, Bia); m = menino (Davi, Theo).
// '!' marca os 3 de 66 (~5%) que escolhem o personagem do outro gênero.
const NOMES = [
  'Duda:f', 'Gabi_17:f', 'Pedrinho:m', 'LuaMaria:f', 'Kauã:m', 'Ryan:m', 'Isa B:f', 'Enzo:m', 'Yasmin:f', 'Davizin:m',
  'Mel:f!', 'TH:m', 'Heloísa:f', 'JP:m', 'Nanda:f', 'Bielzin:m', 'Vitória:f', 'Kaique:m', 'Ana Clara:f', 'Sofi:f',
  'Lorenzo:m', 'Bella:f', 'Matheus R:m', 'Rafa:m!', 'Lívia:f', 'Gui:m', 'Manu:f', 'Arthurzin:m', 'Clarinha:f', 'Nicolas:m',
  'Bia S:f', 'Samuel:m', 'Luiza:f', 'Heitor:m', 'Julinha:f', 'Breno:m', 'Ester:f', 'Caio:m', 'Lara:f', 'Miguel:m',
  'Alice:f', 'Pietro:m', 'Valentina:f', 'Bernardo:m', 'Duda.M:f', 'Ketlyn:f', 'Wesley:m', 'Thalita:f', 'Igor:m!', 'Carol:f',
  'Vini:m', 'Lohana:f', 'Emanuel:m', 'Rebeca:f', 'Otávio:m', 'Giovanna:f', 'Murilo:m', 'Aninha:f', 'Diogo:m', 'Stefany:f',
  'Luan:m', 'Ayla:f', 'Cauã:m', 'Raissa:f', 'Felipe:m', 'Mirella:f',
].map(t => {
  const [nome, g] = t.split(':');
  const troca = g.endsWith('!');
  return { nome, menina: (g[0] === 'f') !== troca };
});
const TURMAS = [
  '1º A', '1A', '1° ano B', '2ºB', '2 ano C', '3º ano', '3C', '9º ano', '9A', '8ª série', '7º B', '6º ano A',
  '1EM', '2º EM', '3º EM B', '1º ano', 'turma 2B', '8B', '9° C', '1 ano A', '2°A', '3ºA', '7ª', '8º ano C',
  '1ºano', '2° B', '3 EM', '9 ano B', null, null, null,
];
const AVATARES = { menina: ['lia', 'bia'], menino: ['davi', 'theo'] };

// Gerador pseudoaleatório com semente fixa: o resultado é sempre o mesmo.
let s = 20261027;
const rnd = () => ((s = (s * 1103515245 + 12345) % 2147483648) / 2147483648);
const pega = a => a[Math.floor(rnd() * a.length)];

const inserir = db.prepare(`INSERT INTO partidas (nome, turma, avatar, pontos, f1, f2, f3, criado_em, exemplo)
  VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now', ?, ?, ?), 1)`);

db.exec('BEGIN');
NOMES.forEach(({ nome, menina }, i) => {
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
  inserir.run(nome, pega(TURMAS), pega(menina ? AVATARES.menina : AVATARES.menino), pontos, f1, f2, pontos - f1 - f2, ...quando);
});
db.exec('COMMIT');

const top = db.prepare('SELECT nome, turma, pontos FROM partidas ORDER BY pontos DESC LIMIT 5').all();
console.log(`${NOMES.length} jogadores de exemplo inseridos. Top 5 agora:`);
top.forEach((t, i) => console.log(`  ${i + 1}º ${t.nome} (${t.turma ?? '-'}) ${t.pontos}`));
