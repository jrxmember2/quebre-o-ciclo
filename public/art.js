// Ilustrações 2D em SVG: personagens estilo "adesivo" e doodles do infográfico do PEI.
const INK = '#16121d';

const PERSONAGENS = {
  lia:  { nome: 'Lia',  pele: '#c98a5e', cabelo: '#2a1a14', roupa: '#ffc62e', detalhe: '#6c3be4', estilo: 'gorro' },
  davi: { nome: 'Davi', pele: '#7a4a2e', cabelo: '#1a1110', roupa: '#2b2838', detalhe: '#3bb273', estilo: 'cacheado' },
  bia:  { nome: 'Bia',  pele: '#a8693f', cabelo: '#3a2116', roupa: '#3bb273', detalhe: '#ff7a2f', estilo: 'puff' },
  theo: { nome: 'Theo', pele: '#f0c39c', cabelo: '#6b3b1f', roupa: '#ff7a2f', detalhe: '#2f5bea', estilo: 'bone' },
};

function cabeloAtras(p) {
  if (p.estilo === 'gorro') return `<path d="M58 92 C52 140 54 176 66 196 L134 196 C146 176 148 140 142 92 Z" fill="${p.cabelo}" stroke="${INK}" stroke-width="4" stroke-linejoin="round"/>`;
  if (p.estilo === 'puff') return `<circle cx="100" cy="40" r="30" fill="${p.cabelo}" stroke="${INK}" stroke-width="4"/>`;
  return '';
}

function cabeloFrente(p) {
  switch (p.estilo) {
    case 'gorro':
      return `
        <path d="M60 86 C60 46 140 46 140 86 C124 74 78 74 60 86 Z" fill="${p.cabelo}" stroke="${INK}" stroke-width="4" stroke-linejoin="round"/>
        <path d="M56 78 C54 34 146 34 144 78 Z" fill="${p.detalhe}" stroke="${INK}" stroke-width="4" stroke-linejoin="round"/>
        <rect x="52" y="70" width="96" height="16" rx="8" fill="${p.detalhe}" stroke="${INK}" stroke-width="4"/>
        <path d="M70 72 v12 M82 72 v12 M94 72 v12 M106 72 v12 M118 72 v12 M130 72 v12" stroke="${INK}" stroke-opacity=".25" stroke-width="3"/>`;
    case 'cacheado': {
      const bolas = [[64, 74], [74, 58], [90, 50], [108, 49], [125, 56], [136, 72], [140, 88], [60, 90], [82, 62], [116, 62]];
      return bolas.map(([x, y]) => `<circle cx="${x}" cy="${y}" r="15" fill="${p.cabelo}" stroke="${INK}" stroke-width="4"/>`).join('') +
        bolas.map(([x, y]) => `<circle cx="${x}" cy="${y}" r="12" fill="${p.cabelo}"/>`).join('');
    }
    case 'puff':
      return `<path d="M60 92 C58 54 142 54 140 92 C128 78 110 74 100 78 C88 72 70 78 60 92 Z" fill="${p.cabelo}" stroke="${INK}" stroke-width="4" stroke-linejoin="round"/>
        <rect x="80" y="62" width="40" height="10" rx="5" fill="${p.detalhe}" stroke="${INK}" stroke-width="3.5"/>`;
    case 'bone':
      return `<path d="M62 84 C60 50 140 50 138 84 Z" fill="${p.detalhe}" stroke="${INK}" stroke-width="4" stroke-linejoin="round"/>
        <path d="M124 80 C140 76 162 80 166 88 C150 92 132 90 120 88 Z" fill="${p.detalhe}" stroke="${INK}" stroke-width="4" stroke-linejoin="round"/>
        <circle cx="100" cy="52" r="5" fill="${INK}"/>
        <path d="M62 84 C66 92 70 96 72 100 M138 84 C134 92 130 96 128 98" stroke="${p.cabelo}" stroke-width="8" stroke-linecap="round"/>`;
  }
  return '';
}

function personagem(id, { humor = 'feliz' } = {}) {
  const p = PERSONAGENS[id] || PERSONAGENS.lia;
  const boca = {
    feliz: `<path d="M86 118 C92 128 108 128 114 118" fill="#fff" stroke="${INK}" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>`,
    serio: `<path d="M90 121 H110" stroke="${INK}" stroke-width="4" stroke-linecap="round"/>`,
    triste: `<path d="M88 124 C94 116 106 116 112 124" fill="none" stroke="${INK}" stroke-width="4" stroke-linecap="round"/>`,
    uau: `<ellipse cx="100" cy="121" rx="6" ry="8" fill="${INK}"/>`,
  }[humor];
  const sobrancelha = humor === 'triste'
    ? `<path d="M76 84 L90 80 M124 84 L110 80" stroke="${INK}" stroke-width="4" stroke-linecap="round"/>`
    : `<path d="M76 82 Q83 77 90 81 M110 81 Q117 77 124 82" stroke="${INK}" stroke-width="4" stroke-linecap="round" fill="none"/>`;
  return `
<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${p.nome}">
  ${cabeloAtras(p)}
  <path d="M28 200 C28 156 58 140 100 140 C142 140 172 156 172 200 Z" fill="${p.roupa}" stroke="${INK}" stroke-width="4" stroke-linejoin="round"/>
  <path d="M76 142 C80 162 120 162 124 142" fill="none" stroke="${INK}" stroke-width="4" stroke-linecap="round"/>
  <path d="M88 158 v22 M112 158 v22" stroke="${INK}" stroke-width="3" stroke-linecap="round"/>
  <rect x="88" y="120" width="24" height="26" rx="8" fill="${p.pele}" stroke="${INK}" stroke-width="4"/>
  <circle cx="62" cy="100" r="9" fill="${p.pele}" stroke="${INK}" stroke-width="4"/>
  <circle cx="138" cy="100" r="9" fill="${p.pele}" stroke="${INK}" stroke-width="4"/>
  <ellipse cx="100" cy="96" rx="38" ry="42" fill="${p.pele}" stroke="${INK}" stroke-width="4"/>
  <circle cx="78" cy="108" r="7" fill="#ff6b8a" opacity=".35"/>
  <circle cx="122" cy="108" r="7" fill="#ff6b8a" opacity=".35"/>
  ${sobrancelha}
  <g class="olhos">
    <ellipse cx="84" cy="96" rx="5" ry="6.5" fill="${INK}"/><circle cx="86" cy="94" r="1.8" fill="#fff"/>
    <ellipse cx="116" cy="96" rx="5" ry="6.5" fill="${INK}"/><circle cx="118" cy="94" r="1.8" fill="#fff"/>
  </g>
  <path d="M100 100 q-3 8 2 9" fill="none" stroke="${INK}" stroke-width="3" stroke-linecap="round" opacity=".6"/>
  ${boca}
  ${cabeloFrente(p)}
</svg>`;
}

const DOODLES = {
  coracao: (c = '#ff4d6d') => `<svg viewBox="0 0 64 64"><path d="M32 54 C10 40 4 28 8 18 C12 8 26 6 32 18 C38 6 52 8 56 18 C60 28 54 40 32 54 Z" fill="${c}" stroke="${INK}" stroke-width="4" stroke-linejoin="round"/><path d="M16 22 q2 -6 8 -6" stroke="#fff" stroke-width="4" stroke-linecap="round" fill="none" opacity=".7"/></svg>`,
  coroa: (c = '#6c3be4') => `<svg viewBox="0 0 80 60"><path d="M8 46 L12 12 L28 32 L40 6 L52 32 L68 12 L72 46 Z" fill="none" stroke="${c}" stroke-width="5" stroke-linejoin="round" stroke-linecap="round"/></svg>`,
  brilho: (c = '#ffc62e') => `<svg viewBox="0 0 64 64"><path d="M32 4 C34 24 40 30 60 32 C40 34 34 40 32 60 C30 40 24 34 4 32 C24 30 30 24 32 4 Z" fill="${c}" stroke="${INK}" stroke-width="3.5" stroke-linejoin="round"/></svg>`,
  exclamacao: (c = INK) => `<svg viewBox="0 0 40 90"><path d="M14 6 L28 8 L22 60 L16 60 Z" fill="${c}"/><circle cx="19" cy="76" r="7" fill="${c}"/></svg>`,
  raios: (c = INK) => `<svg viewBox="0 0 60 60"><path d="M10 40 L22 28 M24 50 L30 34 M40 50 L38 34" stroke="${c}" stroke-width="5" stroke-linecap="round"/></svg>`,
  balao: (c = '#6c3be4') => `<svg viewBox="0 0 90 70"><path d="M10 12 h70 a6 6 0 0 1 6 6 v30 a6 6 0 0 1 -6 6 h-44 l-14 12 v-12 h-12 a6 6 0 0 1 -6 -6 v-30 a6 6 0 0 1 6 -6 Z" fill="${c}" stroke="${INK}" stroke-width="4" stroke-linejoin="round"/><circle cx="30" cy="33" r="4.5" fill="#fff"/><circle cx="45" cy="33" r="4.5" fill="#fff"/><circle cx="60" cy="33" r="4.5" fill="#fff"/></svg>`,
  maos: () => `<svg viewBox="0 0 120 80"><path d="M6 50 C20 38 36 34 52 40 L70 46 C76 48 76 56 70 57 L52 56" fill="#c98a5e" stroke="${INK}" stroke-width="4" stroke-linejoin="round" stroke-linecap="round"/><path d="M114 30 C100 42 84 46 68 40 L52 34 C46 32 46 24 52 23 L70 24" fill="#7a4a2e" stroke="${INK}" stroke-width="4" stroke-linejoin="round" stroke-linecap="round"/></svg>`,
  balanca: (c = INK) => `<svg viewBox="0 0 100 90"><path d="M50 10 V78 M30 82 H70 M14 24 H86" stroke="${c}" stroke-width="5" stroke-linecap="round"/><circle cx="50" cy="10" r="5" fill="${c}"/><path d="M14 24 L4 52 H24 Z M86 24 L76 52 H96 Z" fill="none" stroke="${c}" stroke-width="4" stroke-linejoin="round"/><path d="M4 52 a10 6 0 0 0 20 0 M76 52 a10 6 0 0 0 20 0" fill="${c}"/></svg>`,
  escudo: (c = '#6c3be4') => `<svg viewBox="0 0 64 72"><path d="M32 4 L58 14 V34 C58 52 46 62 32 68 C18 62 6 52 6 34 V14 Z" fill="${c}" stroke="${INK}" stroke-width="4" stroke-linejoin="round"/><path d="M20 36 L29 45 L45 27" fill="none" stroke="#fff" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
  celular: () => `<svg viewBox="0 0 60 90"><rect x="6" y="4" width="48" height="82" rx="10" fill="#fff" stroke="${INK}" stroke-width="4"/><rect x="13" y="16" width="34" height="10" rx="5" fill="#ff7a2f"/><rect x="13" y="32" width="26" height="10" rx="5" fill="#6c3be4"/><rect x="13" y="48" width="30" height="10" rx="5" fill="#ff4d6d"/><circle cx="30" cy="74" r="4" fill="${INK}"/></svg>`,
};

// Anel do ciclo da violência (4 etapas do infográfico) com o "corte" que o quebra.
function anelCiclo() {
  const cores = ['#ff5a5f', '#ff8a3d', '#ffc62e', '#3bb273'];
  const nomes = ['CAUSAS', 'EXPOSIÇÃO', 'REPETIÇÃO', 'CONSEQUÊNCIAS'];
  const r = 120, c = 160;
  const arco = (i) => {
    const a0 = (i * 90 - 90 + 6) * Math.PI / 180, a1 = (i * 90 + 6 - 12) * Math.PI / 180;
    return `M${c + r * Math.cos(a0)} ${c + r * Math.sin(a0)} A${r} ${r} 0 0 1 ${c + r * Math.cos(a1)} ${c + r * Math.sin(a1)}`;
  };
  const rotulo = (i) => {
    const a = (i * 90 - 45) * Math.PI / 180;
    return `<text x="${c + (r + 2) * Math.cos(a)}" y="${c + (r + 2) * Math.sin(a)}" text-anchor="middle" dominant-baseline="middle" class="anel-rotulo" fill="${INK}">${nomes[i]}</text>`;
  };
  return `
<svg viewBox="0 0 320 320" class="anel" aria-hidden="true">
  <defs><marker id="seta" viewBox="0 0 10 10" refX="3" refY="5" markerUnits="userSpaceOnUse" markerWidth="30" markerHeight="30" orient="auto"><path d="M0 0 L10 5 L0 10 Z" fill="${INK}"/></marker></defs>
  <g class="anel-gira">
    ${cores.map((cor, i) => `<path d="${arco(i)}" stroke="${INK}" stroke-width="34" fill="none" stroke-linecap="round"/><path d="${arco(i)}" stroke="${cor}" stroke-width="26" fill="none" stroke-linecap="round" marker-end="url(#seta)"/>`).join('')}
    ${nomes.map((_, i) => rotulo(i)).join('')}
  </g>
</svg>`;
}

window.ARTE = { personagem, PERSONAGENS, DOODLES, anelCiclo, INK };
