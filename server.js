// Quebre o Ciclo — servidor do jogo do PEI.
// Sem dependências: node:http + node:sqlite (Node 24+). Serve /public e a API de ranking.
import http from 'node:http';
import { readFile, mkdir } from 'node:fs/promises';
import { createHmac, randomBytes } from 'node:crypto';
import { DatabaseSync } from 'node:sqlite';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.dirname(fileURLToPath(import.meta.url));
const PUBLIC = path.join(ROOT, 'public');
const DATA_DIR = process.env.DATA_DIR || path.join(ROOT, 'data');
const PORT = Number(process.env.PORT || 3000);
const ADMIN_KEY = process.env.ADMIN_KEY || '';
const SECRET = process.env.TOKEN_SECRET || randomBytes(32).toString('hex');

// Limites de pontuação por fase: acima disso a partida é recusada.
const MAX = { f1: 3200, f2: 1000, f3: 15000 };
const MIN_PARTIDA_MS = 45_000;

await mkdir(DATA_DIR, { recursive: true });
const db = new DatabaseSync(path.join(DATA_DIR, 'ranking.db'));
db.exec(`
  PRAGMA journal_mode = WAL;
  CREATE TABLE IF NOT EXISTS partidas (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome TEXT NOT NULL,
    turma TEXT,
    avatar TEXT NOT NULL,
    pontos INTEGER NOT NULL,
    f1 INTEGER NOT NULL, f2 INTEGER NOT NULL, f3 INTEGER NOT NULL,
    criado_em TEXT NOT NULL DEFAULT (datetime('now'))
  );
  CREATE INDEX IF NOT EXISTS idx_pontos ON partidas (pontos DESC);
  CREATE INDEX IF NOT EXISTS idx_criado ON partidas (criado_em);
`);

const AVATARES = new Set(['lia', 'davi', 'bia', 'theo']);
const PROIBIDAS = ['porra', 'caralho', 'merda', 'puta', 'fdp', 'buceta', 'cu', 'viado', 'bosta', 'rola', 'piroca', 'arrombad', 'vagabund', 'otario', 'idiota', 'macaco', 'nazi', 'hitler', 'retardad', 'corno', 'safad', 'cuzao', 'pau'];

function semAcento(s) {
  return s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
}
function nomeLimpo(bruto, max) {
  const s = String(bruto ?? '').replace(/[^\p{L}\p{N} ._-]/gu, '').replace(/\s+/g, ' ').trim().slice(0, max);
  const t = semAcento(s).replace(/[^a-z0-9]/g, '');
  const ruim = PROIBIDAS.some(p => (p.length <= 4 ? semAcento(s).split(/[ ._-]/).includes(p) : t.includes(p)));
  return ruim ? null : s;
}

function assinar(dados) {
  return createHmac('sha256', SECRET).update(dados).digest('base64url');
}

const tentativas = new Map(); // ip -> [timestamps]
function limitado(ip) {
  const agora = Date.now();
  const lista = (tentativas.get(ip) || []).filter(t => agora - t < 10 * 60_000);
  lista.push(agora);
  tentativas.set(ip, lista);
  return lista.length > 20;
}

const ESCOPOS = {
  hoje: "AND date(criado_em, '-3 hours') = date('now', '-3 hours')",
  semana: "AND criado_em >= datetime('now', '-7 days')",
  geral: '',
};
function ranking(escopo, limite) {
  const filtro = ESCOPOS[escopo] ?? '';
  return db.prepare(`SELECT id, nome, turma, avatar, pontos, criado_em FROM partidas WHERE 1=1 ${filtro} ORDER BY pontos DESC, id ASC LIMIT ?`).all(limite);
}

function json(res, status, corpo) {
  res.writeHead(status, { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' });
  res.end(JSON.stringify(corpo));
}

async function lerCorpo(req) {
  let s = '';
  for await (const parte of req) {
    s += parte;
    if (s.length > 4096) throw new Error('grande demais');
  }
  return JSON.parse(s || '{}');
}

const TIPOS = { '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.ico': 'image/x-icon', '.webmanifest': 'application/manifest+json' };

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, 'http://x');
  const ip = (req.headers['x-forwarded-for'] || req.socket.remoteAddress || '').split(',')[0].trim();

  try {
    if (url.pathname === '/api/saude') return json(res, 200, { ok: true });

    if (url.pathname === '/api/partida' && req.method === 'POST') {
      const inicio = Date.now().toString();
      return json(res, 200, { token: `${inicio}.${assinar(inicio)}` });
    }

    if (url.pathname === '/api/ranking' && req.method === 'GET') {
      const limite = Math.min(Number(url.searchParams.get('limite')) || 10, 50);
      return json(res, 200, { itens: ranking(url.searchParams.get('escopo') || 'geral', limite) });
    }

    if (url.pathname === '/api/pontos' && req.method === 'POST') {
      if (limitado(ip)) return json(res, 429, { erro: 'Muitas partidas seguidas. Respira e tenta daqui a pouco.' });
      const b = await lerCorpo(req);
      const [inicio, sig] = String(b.token || '').split('.');
      if (!inicio || assinar(inicio) !== sig) return json(res, 400, { erro: 'Partida inválida.' });
      if (Date.now() - Number(inicio) < MIN_PARTIDA_MS) return json(res, 400, { erro: 'Partida rápida demais.' });

      const nome = nomeLimpo(b.nome, 16);
      if (!nome || nome.length < 2) return json(res, 400, { erro: 'Escolha outro apelido (sem palavrões 😉).' });
      const turma = b.turma ? nomeLimpo(b.turma, 20) : null;
      const avatar = AVATARES.has(b.avatar) ? b.avatar : 'lia';
      const f = { f1: b.f1 | 0, f2: b.f2 | 0, f3: b.f3 | 0 };
      if (Object.entries(f).some(([k, v]) => v < 0 || v > MAX[k])) return json(res, 400, { erro: 'Pontuação fora do esperado.' });
      const pontos = f.f1 + f.f2 + f.f3;

      const { lastInsertRowid: id } = db.prepare('INSERT INTO partidas (nome, turma, avatar, pontos, f1, f2, f3) VALUES (?, ?, ?, ?, ?, ?, ?)').run(nome, turma, avatar, pontos, f.f1, f.f2, f.f3);
      const { pos } = db.prepare('SELECT COUNT(*) + 1 AS pos FROM partidas WHERE pontos > ?').get(pontos);
      return json(res, 201, { id: Number(id), posicao: pos, pontos });
    }

    // Área do professor: exportar CSV e apagar apelido impróprio.
    if (url.pathname.startsWith('/api/admin/')) {
      if (!ADMIN_KEY || url.searchParams.get('chave') !== ADMIN_KEY) return json(res, 403, { erro: 'Sem acesso.' });
      if (url.pathname === '/api/admin/csv') {
        const linhas = db.prepare('SELECT id, nome, turma, avatar, pontos, f1, f2, f3, criado_em FROM partidas ORDER BY pontos DESC').all();
        const csv = ['id;nome;turma;avatar;pontos;f1;f2;f3;criado_em', ...linhas.map(l => Object.values(l).join(';'))].join('\n');
        res.writeHead(200, { 'content-type': 'text/csv; charset=utf-8', 'content-disposition': 'attachment; filename="ranking.csv"' });
        return res.end('﻿' + csv);
      }
      const apagar = url.pathname.match(/^\/api\/admin\/apagar\/(\d+)$/);
      if (apagar && req.method === 'POST') {
        db.prepare('DELETE FROM partidas WHERE id = ?').run(Number(apagar[1]));
        return json(res, 200, { ok: true });
      }
    }

    if (url.pathname.startsWith('/api/')) return json(res, 404, { erro: 'Não encontrado.' });

    // Arquivos estáticos
    const alvo = path.normalize(path.join(PUBLIC, url.pathname === '/' ? 'index.html' : url.pathname));
    if (!alvo.startsWith(PUBLIC)) return json(res, 403, { erro: 'Não.' });
    const corpo = await readFile(alvo).catch(() => null);
    if (!corpo) {
      res.writeHead(302, { location: '/' });
      return res.end();
    }
    res.writeHead(200, { 'content-type': TIPOS[path.extname(alvo)] || 'application/octet-stream', 'cache-control': 'no-cache' });
    res.end(corpo);
  } catch (e) {
    json(res, 400, { erro: 'Requisição inválida.' });
  }
});

server.listen(PORT, () => console.log(`Quebre o Ciclo em http://localhost:${PORT}`));
