# Quebre o Ciclo

Jogo do Projeto de Extensão Interdisciplinar (Direito) sobre o ciclo da violência na juventude, para estudantes de 12 a 18 anos. Três fases (Detector, Feed, Quebre o ciclo), pontuação e ranking com apelido.

- Sem dependências: Node 24 (`node:http` + `node:sqlite`).
- Ranking em `DATA_DIR/ranking.db` (SQLite).
- Se a API cair, o jogo continua e guarda o ranking só no aparelho.

## Rodar local

```bash
npm start          # http://localhost:3000
```

## Publicar no Easypanel

1. Suba a pasta `jogo/` para um repositório no GitHub.
2. No Easypanel: **Create Service → App**, fonte GitHub, build **Dockerfile**.
3. **Environment**:
   ```
   ADMIN_KEY=<uma frase longa só da equipe>
   TOKEN_SECRET=<outra frase longa>
   ```
4. **Mounts → Volume**: nome `ranking`, caminho `/data` (sem isso o ranking some a cada deploy).
5. **Domains**: `www.projetoextensionista.online` e `projetoextensionista.online`, porta `3000`, HTTPS ligado.
6. No DNS do domínio: registro `A` de `@` e de `www` apontando para o IP da VPS.

## Área do professor

- Baixar o ranking: `https://www.projetoextensionista.online/api/admin/csv?chave=ADMIN_KEY`
- Apagar um apelido impróprio (id está no CSV): `POST /api/admin/apagar/<id>?chave=ADMIN_KEY`

## Trocar perguntas

Todo o texto das fases fica em `public/conteudo.js`.

## Proteções

- Apelido de 2 a 16 caracteres, filtro de palavrões, sem nome completo nem dado pessoal (LGPD, público menor de idade).
- Pontuação máxima por fase conferida no servidor, partida assinada (HMAC) com tempo mínimo de 45 s, limite de 20 partidas por IP a cada 10 min.
