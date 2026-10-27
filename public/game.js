(() => {
  const { personagem, PERSONAGENS, DOODLES, anelCiclo } = window.ARTE;
  const C = window.CONTEUDO;
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const espera = ms => new Promise(r => setTimeout(r, ms));
  const embaralha = a => a.map(v => [Math.random(), v]).sort((x, y) => x[0] - y[0]).map(v => v[1]);

  // ---------- arte ----------
  $$('[data-personagem]').forEach(el => (el.innerHTML = personagem(el.dataset.personagem)));
  $$('[data-doodle]').forEach(el => (el.innerHTML = DOODLES[el.dataset.doodle]()));
  $('#anel').innerHTML = anelCiclo();

  const obs = new IntersectionObserver(es => es.forEach(e => e.isIntersecting && (e.target.classList.add('visivel'), obs.unobserve(e.target))), { threshold: .15 });
  $$('.revela-scroll').forEach(el => obs.observe(el));

  // ---------- som ----------
  let somLigado = localStorage.getItem('qoc-som') !== '0';
  let actx;
  const atualizaSom = () => $$('[data-som]').forEach(b => (b.textContent = somLigado ? '🔊' : '🔇'));
  atualizaSom();
  $$('[data-som]').forEach(b => b.addEventListener('click', () => {
    somLigado = !somLigado;
    try { localStorage.setItem('qoc-som', somLigado ? '1' : '0'); } catch {}
    atualizaSom();
  }));
  function bip(notas, tipo = 'triangle', dur = .09) {
    if (!somLigado) return;
    try {
      actx ||= new (window.AudioContext || window.webkitAudioContext)();
      notas.forEach((f, i) => {
        const o = actx.createOscillator(), g = actx.createGain(), t = actx.currentTime + i * dur;
        o.type = tipo; o.frequency.value = f;
        g.gain.setValueAtTime(.12, t); g.gain.exponentialRampToValueAtTime(.001, t + dur * 1.8);
        o.connect(g).connect(actx.destination); o.start(t); o.stop(t + dur * 2);
      });
    } catch {}
  }
  const somCerto = () => bip([660, 880, 1320]);
  const somErro = () => bip([220, 160], 'sawtooth', .12);
  const somPega = () => bip([880 + Math.random() * 200], 'square', .05);

  // ---------- API (com ranking local quando o servidor não responde) ----------
  const api = {
    online: true,
    async req(caminho, opcoes) {
      const r = await fetch(caminho, { headers: { 'content-type': 'application/json' }, ...opcoes });
      const j = await r.json().catch(() => ({}));
      if (!r.ok) throw Object.assign(new Error(j.erro || 'Falha'), { status: r.status });
      return j;
    },
    async iniciar() {
      try { this.online = true; return (await this.req('/api/partida', { method: 'POST' })).token; }
      catch (e) { this.online = false; return null; }
    },
    local() { try { return JSON.parse(localStorage.getItem('qoc-ranking') || '[]'); } catch { return []; } },
    async ranking(escopo = 'geral', limite = 10) {
      try { return await this.req(`/api/ranking?escopo=${escopo}&limite=${limite}`); }
      catch {
        const lista = this.local().sort((a, b) => b.pontos - a.pontos);
        return { itens: lista.slice(0, limite), total: lista.length };
      }
    },
    async salvar(dados) {
      if (this.online) {
        try { return await this.req('/api/pontos', { method: 'POST', body: JSON.stringify(dados) }); }
        catch (e) { if (e.status && e.status < 500) throw e; }
      }
      const lista = this.local();
      const item = { id: Date.now(), nome: dados.nome, turma: dados.turma, avatar: dados.avatar, pontos: dados.f1 + dados.f2 + dados.f3 };
      lista.push(item);
      try { localStorage.setItem('qoc-ranking', JSON.stringify(lista.sort((a, b) => b.pontos - a.pontos).slice(0, 50))); } catch {}
      return { id: item.id, posicao: lista.findIndex(l => l.id === item.id) + 1, pontos: item.pontos };
    },
  };

  function desenhaRanking(ol, itens, meuId) {
    if (!itens.length) { ol.innerHTML = '<li class="vazio">Ninguém jogou ainda. O primeiro lugar está esperando você!</li>'; return; }
    ol.innerHTML = itens.map((it, i) => `
      <li class="${it.id === meuId ? 'eu' : ''}" style="animation-delay:${Math.min(i, 12) * 50}ms">
        <span class="av">${personagem(it.avatar)}</span>
        <span class="nm">${esc(it.nome)}${it.turma ? `<small>${esc(it.turma)}</small>` : ''}</span>
        <span class="pt">${Number(it.pontos).toLocaleString('pt-BR')}</span>
      </li>`).join('');
  }
  // Cada lista mostra o top 10 e pode expandir para todos os jogadores.
  const listas = {
    'ranking-capa': { escopo: 'geral', todos: false, meuId: null },
    'ranking-res': { escopo: 'geral', todos: false, meuId: null },
  };
  async function carregaRanking(id) {
    const st = listas[id];
    const { itens, total } = await api.ranking(st.escopo, st.todos ? 500 : 10);
    const ol = $('#' + id);
    desenhaRanking(ol, itens, st.meuId);
    ol.classList.toggle('expandido', st.todos);
    const b = $(`[data-ver-todos="${id}"]`);
    b.hidden = total <= 10;
    b.querySelector('span').textContent = st.todos ? 'Mostrar só o top 10' : `Ver todos os ${total} jogadores`;
    b.querySelector('i').textContent = st.todos ? '↑' : '↓';
  }
  $$('[data-ver-todos]').forEach(b => b.addEventListener('click', async () => {
    const id = b.dataset.verTodos;
    listas[id].todos = !listas[id].todos;
    await carregaRanking(id);
    if (!listas[id].todos) $('#' + id).scrollIntoView({ behavior: 'smooth', block: 'center' });
  }));
  function carregaRankingCapa(escopo = listas['ranking-capa'].escopo) {
    listas['ranking-capa'].escopo = escopo;
    $$('.abas button').forEach(b => b.classList.toggle('on', b.dataset.escopo === escopo));
    return carregaRanking('ranking-capa');
  }
  $$('.abas button').forEach(b => b.addEventListener('click', () => carregaRankingCapa(b.dataset.escopo)));
  carregaRankingCapa();

  // ---------- navegação ----------
  function mostra(id) {
    $$('.tela').forEach(t => t.classList.remove('ativa'));
    $('#' + id).classList.add('ativa');
    $('#hud').hidden = !['fase1', 'fase2', 'fase3'].includes(id);
    window.scrollTo({ top: 0, behavior: 'instant' });
  }

  // ---------- estado ----------
  const jogador = (() => { try { return JSON.parse(localStorage.getItem('qoc-jogador')) || {}; } catch { return {}; } })();
  jogador.avatar ||= 'lia';
  let pts = { f1: 0, f2: 0, f3: 0 };
  let token = null;
  const total = () => pts.f1 + pts.f2 + pts.f3;
  function atualizaHud(fase) {
    if (fase) $('#hud-fase').textContent = `Fase ${fase}/3`;
    const b = $('#hud-pontos');
    if (b.textContent !== total().toLocaleString('pt-BR')) {
      b.textContent = total().toLocaleString('pt-BR');
      b.parentElement.classList.remove('ganhou'); void b.offsetWidth; b.parentElement.classList.add('ganhou');
    }
  }

  // ---------- cadastro ----------
  const form = $('#form-nome');
  $('#avatares').innerHTML = Object.entries(PERSONAGENS).map(([id, p]) => `<button type="button" data-av="${id}" aria-pressed="false">${personagem(id)}<span>${p.nome}</span></button>`).join('');
  const marcaAvatar = id => { jogador.avatar = id; $$('[data-av]').forEach(b => b.setAttribute('aria-pressed', b.dataset.av === id)); };
  $$('[data-av]').forEach(b => b.addEventListener('click', () => { marcaAvatar(b.dataset.av); bip([520, 780]); }));

  $$('[data-jogar]').forEach(b => b.addEventListener('click', () => {
    form.nome.value = jogador.nome || '';
    form.turma.value = jogador.turma || '';
    marcaAvatar(jogador.avatar);
    $('#erro-nome').textContent = '';
    mostra('cadastro');
    setTimeout(() => form.nome.focus(), 300);
  }));
  $$('[data-voltar]').forEach(b => b.addEventListener('click', () => { mostra('capa'); carregaRankingCapa(); }));

  form.addEventListener('submit', async e => {
    e.preventDefault();
    const nome = form.nome.value.trim();
    if (nome.length < 2) { $('#erro-nome').textContent = 'O apelido precisa de pelo menos 2 letras.'; return; }
    Object.assign(jogador, { nome, turma: form.turma.value.trim() });
    try { localStorage.setItem('qoc-jogador', JSON.stringify(jogador)); } catch {}
    pts = { f1: 0, f2: 0, f3: 0 };
    token = await api.iniciar();
    $('#hud-nome').textContent = nome;
    $('#hud-av').innerHTML = personagem(jogador.avatar);
    $('#hud-pontos').textContent = '0';
    await intro(1, 'Detector', 'É conflito, agressão ou bullying? Você tem 15 segundos por situação. Acertos seguidos viram combo.');
    await fase1();
    await intro(2, 'Feed', 'Seu celular não para. Cada mensagem pede uma decisão. Escolha com cuidado: aqui não tem tempo, tem consequência.');
    await fase2();
    await intro(3, 'Quebre o ciclo', 'Pegue as atitudes que constroem e desvie das que machucam. O escudo roxo é sua rede de apoio. 3 vidas, 45 segundos.');
    await fase3();
    await resultado();
  });

  function intro(n, titulo, texto) {
    $('#intro-num').textContent = String(n).padStart(2, '0');
    $('#intro-titulo').textContent = titulo;
    $('#intro-texto').textContent = texto;
    mostra('intro');
    // reinicia as animações de entrada
    $$('#intro > *').forEach(el => { el.style.animation = 'none'; void el.offsetWidth; el.style.animation = ''; });
    bip([392, 523, 659]);
    return new Promise(r => { $('#intro-ir').onclick = () => r(); });
  }

  // ---------- FASE 1: Detector ----------
  async function fase1() {
    mostra('fase1'); atualizaHud(1);
    const cartas = embaralha(C.detector).slice(0, 8);
    const NOMES = { conflito: 'Conflito', agressao: 'Agressão', bullying: 'Bullying' };
    const DURACAO = 15000;
    let seq = 0;
    for (let i = 0; i < cartas.length; i++) {
      const carta = cartas[i];
      $('#f1-cont').textContent = `${i + 1} / ${cartas.length}`;
      $('#f1-texto').textContent = carta.texto;
      $('#f1-combo').textContent = seq >= 2 ? `combo x${(1 + .25 * Math.min(seq, 4)).toFixed(2).replace(/\.?0+$/, '')}` : '';
      const cartao = $('#f1-cartao');
      cartao.className = 'cartao'; void cartao.offsetWidth; cartao.classList.add('entra');
      const botoes = $$('#fase1 [data-resp]');
      botoes.forEach(b => { b.disabled = false; b.classList.remove('acertou'); });
      $('#f1-retorno').hidden = true;

      const barra = $('#f1-tempo');
      const t0 = performance.now();
      const resposta = await new Promise(res => {
        let raf;
        const tick = now => {
          const resta = Math.max(0, 1 - (now - t0) / DURACAO);
          barra.style.transform = `scaleX(${resta})`;
          barra.classList.toggle('urgente', resta < .3);
          if (resta <= 0) return res({ r: null, resta: 0 });
          raf = requestAnimationFrame(tick);
        };
        raf = requestAnimationFrame(tick);
        botoes.forEach(b => (b.onclick = () => { cancelAnimationFrame(raf); res({ r: b.dataset.resp, resta: Math.max(0, 1 - (performance.now() - t0) / DURACAO) }); }));
      });

      botoes.forEach(b => { b.disabled = true; b.onclick = null; b.classList.toggle('acertou', b.dataset.resp === carta.resp); });
      const certo = resposta.r === carta.resp;
      let ganho = 0;
      if (certo) {
        ganho = Math.round((100 + 50 * resposta.resta) * (1 + .25 * Math.min(seq, 4)));
        seq++; pts.f1 += ganho; somCerto();
      } else { seq = 0; somErro(); }
      cartao.classList.add(certo ? 'certo' : 'errado');
      atualizaHud();
      $('#f1-ret-titulo').textContent = certo ? `Acertou! +${ganho}` : resposta.r ? `Era ${NOMES[carta.resp]}.` : `Tempo! Era ${NOMES[carta.resp]}.`;
      $('#f1-ret-texto').textContent = C.definicoes[carta.resp];
      $('#f1-retorno').hidden = false;
      $('#f1-prox span').textContent = i === cartas.length - 1 ? 'Fechar fase' : 'Próxima';
      await new Promise(r => ($('#f1-prox').onclick = r));
    }
  }

  // ---------- FASE 2: Feed ----------
  async function fase2() {
    mostra('fase2'); atualizaHud(2);
    const posts = C.feed;
    for (let i = 0; i < posts.length; i++) {
      const p = posts[i];
      $('#f2-cont').textContent = `${i + 1} / ${posts.length}`;
      $('#f2-app').textContent = p.app;
      $('#f2-post').innerHTML = `<div class="autor"><i>${esc(p.autor[0].toUpperCase())}</i>${esc(p.autor)}</div><div class="bolha">${esc(p.post)}</div><span class="tag">${esc(p.tag)}</span>`;
      const cel = $('.celular'); cel.style.animation = 'none'; void cel.offsetWidth; cel.style.animation = '';
      const ops = embaralha(p.opcoes);
      $('#f2-opcoes').innerHTML = ops.map((o, k) => `<button data-k="${k}">${esc(o.t)}</button>`).join('');
      $('#f2-retorno').hidden = true;
      const escolha = await new Promise(r => $$('#f2-opcoes button').forEach(b => (b.onclick = () => r(ops[b.dataset.k]))));
      $$('#f2-opcoes button').forEach(b => {
        b.disabled = true;
        const o = ops[b.dataset.k];
        if (o === escolha || o.p === 150) b.classList.add(o.p === 150 ? 'otima' : o.p === 0 ? 'ruim' : 'meio');
      });
      pts.f2 += escolha.p;
      escolha.p === 150 ? somCerto() : escolha.p === 0 ? somErro() : bip([500, 600]);
      atualizaHud();
      $('#f2-ret-titulo').textContent = escolha.p === 150 ? `Atitude top! +150` : escolha.p ? `Quase. +${escolha.p}` : 'Isso alimenta o ciclo. +0';
      $('#f2-ret-texto').textContent = escolha.r;
      $('#f2-retorno').hidden = false;
      $('#f2-prox span').textContent = i === posts.length - 1 ? 'Fechar fase' : 'Próxima';
      await new Promise(r => ($('#f2-prox').onclick = r));
    }
  }

  // ---------- FASE 3: arcade ----------
  function svgParaImagem(svg) {
    const img = new Image();
    img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg.trim());
    return img;
  }

  function fase3() {
    mostra('fase3'); atualizaHud(3);
    const cv = $('#f3-canvas'), ctx = cv.getContext('2d');
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let W, H;
    const ajusta = () => {
      const r = cv.getBoundingClientRect();
      W = r.width; H = r.height;
      cv.width = W * dpr; cv.height = H * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    ajusta();
    window.addEventListener('resize', ajusta);

    const avatar = svgParaImagem(personagem(jogador.avatar, { humor: 'feliz' }));
    const avatarUau = svgParaImagem(personagem(jogador.avatar, { humor: 'uau' }));
    const CORES_BOAS = ['#3bb273', '#6c3be4', '#2f5bea', '#ff7a2f'];
    const DURACAO = 45;
    const p = { x: W / 2, alvo: W / 2, w: 86, h: 86, ai: 0 };
    let itens = [], parts = [], textos = [], vidas = 3, seqBoa = 0, combo = 1, escudo = 0, tremor = 0, flash = 0;
    let t = 0, proxSpawn = .4, fim = false, ultimo = performance.now(), quebrou = 0;
    const teclas = {};

    const kd = e => { teclas[e.key] = true; if (['ArrowLeft', 'ArrowRight'].includes(e.key)) e.preventDefault(); };
    const ku = e => (teclas[e.key] = false);
    const pm = e => { const r = cv.getBoundingClientRect(); p.alvo = e.clientX - r.left; };
    window.addEventListener('keydown', kd); window.addEventListener('keyup', ku);
    cv.addEventListener('pointermove', pm); cv.addEventListener('pointerdown', pm);

    const vidasEl = $('#f3-vidas'), tempoEl = $('#f3-tempo'), comboEl = $('#f3-combo');
    const hudArcade = () => { vidasEl.textContent = '❤️'.repeat(vidas) + '🤍'.repeat(3 - vidas); comboEl.textContent = `x${combo}`; };
    hudArcade();

    function spawn() {
      const dific = Math.min(t / DURACAO, 1);
      const r = Math.random();
      const tipo = r < .05 ? 'escudo' : r < .6 ? 'bom' : 'ruim';
      const texto = tipo === 'escudo' ? 'Rede de apoio' : tipo === 'bom' ? C.bons[Math.random() * C.bons.length | 0] : C.ruins[Math.random() * C.ruins.length | 0];
      ctx.font = '800 16px "Bricolage Grotesque", sans-serif';
      const w = ctx.measureText(texto).width + 44;
      itens.push({
        tipo, texto, w, h: 40,
        x: 10 + Math.random() * (W - w - 20), y: -50,
        v: 120 + dific * 170 + Math.random() * 60,
        rot: (Math.random() - .5) * .3, cor: tipo === 'bom' ? CORES_BOAS[Math.random() * 4 | 0] : null,
      });
    }

    function estoura(x, y, cor, n = 14) {
      for (let i = 0; i < n; i++) {
        const a = Math.random() * Math.PI * 2, s = 80 + Math.random() * 220;
        parts.push({ x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s - 120, vida: .7, cor, tam: 4 + Math.random() * 6 });
      }
    }

    function pilula(it) {
      ctx.save();
      ctx.translate(it.x + it.w / 2, it.y + it.h / 2);
      ctx.rotate(it.rot);
      const bom = it.tipo !== 'ruim';
      const fundo = it.tipo === 'escudo' ? '#6c3be4' : bom ? it.cor : '#16121d';
      ctx.fillStyle = 'rgba(22,18,29,.9)';
      ctx.beginPath(); ctx.roundRect(-it.w / 2 + 4, -it.h / 2 + 4, it.w, it.h, 20); ctx.fill();
      ctx.fillStyle = fundo; ctx.strokeStyle = '#16121d'; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.roundRect(-it.w / 2, -it.h / 2, it.w, it.h, 20); ctx.fill(); ctx.stroke();
      ctx.fillStyle = bom ? '#fff' : '#ff4d6d';
      ctx.font = '800 16px "Bricolage Grotesque", sans-serif';
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      const icone = it.tipo === 'escudo' ? '🛡️ ' : bom ? '' : '⚡ ';
      ctx.fillText(icone + it.texto, 0, 1);
      ctx.restore();
    }

    return new Promise(resolve => {
      function quadro(agora) {
        const dt = Math.min((agora - ultimo) / 1000, .05);
        ultimo = agora;
        if (!fim) t += dt;
        const resta = Math.max(0, Math.ceil(DURACAO - t));
        if (tempoEl.textContent != resta) tempoEl.textContent = resta;

        // movimento do jogador
        const vel = 520;
        if (teclas.ArrowLeft || teclas.a || teclas.A) p.alvo = p.x - vel * dt * 3;
        if (teclas.ArrowRight || teclas.d || teclas.D) p.alvo = p.x + vel * dt * 3;
        p.alvo = Math.max(p.w / 2, Math.min(W - p.w / 2, p.alvo));
        p.x += (p.alvo - p.x) * Math.min(1, dt * 14);
        const py = H - p.h - 18;

        if (!fim) {
          proxSpawn -= dt;
          if (proxSpawn <= 0) { spawn(); proxSpawn = .75 - Math.min(t / DURACAO, 1) * .37; }
        }
        escudo = Math.max(0, escudo - dt);
        p.ai = Math.max(0, p.ai - dt);

        // itens
        for (const it of itens) {
          it.y += it.v * dt;
          const pegou = it.y + it.h > py + 10 && it.y < py + p.h && it.x + it.w > p.x - p.w / 2 + 6 && it.x < p.x + p.w / 2 - 6;
          if (pegou && !fim) {
            it.morto = true;
            const cx = it.x + it.w / 2, cy = it.y + it.h / 2;
            if (it.tipo === 'escudo') {
              escudo = 5; estoura(cx, cy, '#6c3be4', 24); somCerto();
              textos.push({ x: cx, y: cy, txt: 'Escudo! 5s', cor: '#6c3be4', vida: 1 });
            } else if (it.tipo === 'bom') {
              seqBoa++; combo = Math.min(5, 1 + Math.floor(seqBoa / 3));
              const ganho = 50 * combo;
              pts.f3 = Math.min(15000, pts.f3 + ganho); quebrou++;
              estoura(cx, cy, it.cor); somPega(); atualizaHud(); p.ai = .3;
              textos.push({ x: cx, y: cy, txt: `+${ganho}`, cor: it.cor, vida: 1 });
              if (quebrou % 15 === 0) textos.push({ x: W / 2, y: H / 2.4, txt: 'CICLO QUEBRADO!', cor: '#16121d', vida: 1.4, grande: true });
            } else if (escudo > 0) {
              estoura(cx, cy, '#6c3be4', 10); bip([300, 500]);
              textos.push({ x: cx, y: cy, txt: 'bloqueado!', cor: '#6c3be4', vida: .9 });
            } else {
              vidas--; seqBoa = 0; combo = 1; tremor = .35; flash = .3; somErro();
              estoura(cx, cy, '#ff4d6d', 18);
              textos.push({ x: cx, y: cy, txt: it.texto + ' machuca', cor: '#ff4d6d', vida: 1.1 });
              if (navigator.vibrate) navigator.vibrate(80);
            }
            hudArcade();
          }
          if (it.y > H + 60) it.morto = true;
        }
        itens = itens.filter(i => !i.morto);
        for (const q of parts) { q.vx *= .98; q.vy += 520 * dt; q.x += q.vx * dt; q.y += q.vy * dt; q.vida -= dt; }
        parts = parts.filter(q => q.vida > 0);
        for (const tx of textos) { tx.y -= 50 * dt; tx.vida -= dt; }
        textos = textos.filter(tx => tx.vida > 0);
        tremor = Math.max(0, tremor - dt); flash = Math.max(0, flash - dt);

        // desenho
        ctx.save();
        ctx.clearRect(0, 0, W, H);
        if (tremor) ctx.translate((Math.random() - .5) * 14 * tremor * 3, (Math.random() - .5) * 14 * tremor * 3);
        // chão
        ctx.fillStyle = '#16121d'; ctx.fillRect(0, H - 14, W, 14);
        ctx.fillStyle = '#ffc62e'; ctx.fillRect(0, H - 14, W * (1 - t / DURACAO), 5);
        itens.forEach(pilula);
        // jogador
        if (escudo > 0) {
          ctx.beginPath(); ctx.arc(p.x, py + p.h / 2, p.w * .72 + Math.sin(agora / 90) * 3, 0, Math.PI * 2);
          ctx.fillStyle = 'rgba(108,59,228,.18)'; ctx.fill();
          ctx.lineWidth = 4; ctx.strokeStyle = '#6c3be4'; ctx.setLineDash([10, 8]); ctx.lineDashOffset = -agora / 30; ctx.stroke(); ctx.setLineDash([]);
        }
        ctx.beginPath(); ctx.ellipse(p.x, H - 16, p.w * .42, 7, 0, 0, Math.PI * 2); ctx.fillStyle = 'rgba(22,18,29,.25)'; ctx.fill();
        const pulo = Math.sin(agora / 140) * 3 - (p.ai > 0 ? 6 : 0);
        ctx.drawImage(p.ai > 0 ? avatarUau : avatar, p.x - p.w / 2, py + pulo, p.w, p.h);
        for (const q of parts) { ctx.globalAlpha = Math.max(0, q.vida / .7); ctx.fillStyle = q.cor; ctx.fillRect(q.x, q.y, q.tam, q.tam); }
        ctx.globalAlpha = 1;
        for (const tx of textos) {
          ctx.globalAlpha = Math.min(1, tx.vida * 2);
          ctx.font = `400 ${tx.grande ? Math.min(56, W / 12) : 22}px "Permanent Marker", cursive`;
          ctx.textAlign = 'center'; ctx.lineWidth = 5; ctx.strokeStyle = '#fff'; ctx.strokeText(tx.txt, tx.x, tx.y);
          ctx.fillStyle = tx.cor; ctx.fillText(tx.txt, tx.x, tx.y);
        }
        ctx.globalAlpha = 1;
        ctx.restore();
        if (flash) { ctx.fillStyle = `rgba(255,77,109,${flash})`; ctx.fillRect(0, 0, W, H); }

        if (!fim && (t >= DURACAO || vidas <= 0)) {
          fim = true;
          const bonus = t >= DURACAO ? vidas * 300 : 0;
          if (bonus) { pts.f3 = Math.min(15000, pts.f3 + bonus); atualizaHud(); textos.push({ x: W / 2, y: H / 2.4, txt: `Vidas +${bonus}`, cor: '#3bb273', vida: 1.6, grande: true }); }
          else textos.push({ x: W / 2, y: H / 2.4, txt: vidas <= 0 ? 'Respira. Recomeçar faz parte.' : 'Fim!', cor: '#16121d', vida: 1.6, grande: true });
          setTimeout(() => {
            window.removeEventListener('keydown', kd); window.removeEventListener('keyup', ku); window.removeEventListener('resize', ajusta);
            resolve();
          }, 1800);
        }
        if (!fim || textos.length || parts.length) requestAnimationFrame(quadro);
      }
      requestAnimationFrame(quadro);
    });
  }

  // ---------- resultado ----------
  function confete() {
    const box = $('#confete');
    const cores = ['#6c3be4', '#ffc62e', '#ff7a2f', '#3bb273', '#ff4d6d', '#2f5bea'];
    box.innerHTML = Array.from({ length: 90 }, () => `<i style="left:${Math.random() * 100}%;background:${cores[Math.random() * 6 | 0]};--d:${2 + Math.random() * 2.5}s;--x:${(Math.random() - .5) * 300}px;--r:${Math.random() * 1080}deg;animation-delay:${Math.random() * .8}s;border-radius:${Math.random() > .5 ? '50%' : '2px'}"></i>`).join('');
    setTimeout(() => (box.innerHTML = ''), 6000);
  }

  async function resultado() {
    mostra('resultado');
    $('#res-av').innerHTML = personagem(jogador.avatar, { humor: 'feliz' });
    $('#res-nome').textContent = jogador.nome;
    $('#res-f1').textContent = pts.f1.toLocaleString('pt-BR');
    $('#res-f2').textContent = pts.f2.toLocaleString('pt-BR');
    $('#res-f3').textContent = pts.f3.toLocaleString('pt-BR');
    $('#res-selo').textContent = total() >= 6000 ? 'Ciclo quebrado!' : total() >= 3000 ? 'Mandou bem!' : 'Todo mundo aprende!';
    // contagem animada
    const alvo = total(), el = $('#res-pontos'), t0 = performance.now();
    const conta = now => { const k = Math.min(1, (now - t0) / 1400); el.textContent = Math.round(alvo * (1 - Math.pow(1 - k, 3))).toLocaleString('pt-BR'); if (k < 1) requestAnimationFrame(conta); };
    requestAnimationFrame(conta);
    confete(); bip([523, 659, 784, 1046], 'triangle', .12);

    $('#res-pos').textContent = 'Salvando no ranking…';
    let meuId = null;
    try {
      const r = await api.salvar({ token, nome: jogador.nome, turma: jogador.turma, avatar: jogador.avatar, ...pts });
      meuId = r.id;
      $('#res-pos').textContent = `${r.posicao}º lugar no ranking geral${api.online ? '' : ' (deste aparelho)'}`;
    } catch (e) {
      $('#res-pos').textContent = e.message;
    }
    Object.assign(listas['ranking-res'], { todos: false, meuId });
    await carregaRanking('ranking-res');
  }
})();
