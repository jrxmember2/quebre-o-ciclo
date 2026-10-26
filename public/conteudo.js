// Conteúdo das fases, tirado do material do PEI (palestra, infográfico e artigo).
// Para trocar perguntas, edite só este arquivo.
window.CONTEUDO = {
  definicoes: {
    conflito: 'Conflito é quando duas pessoas discordam, mas podem conversar e buscar uma solução.',
    agressao: 'Agressão é quando alguém machuca, ameaça ou humilha outra pessoa. Não pode!',
    bullying: 'Bullying é quando a agressão se repete, de propósito, e a pessoa tem dificuldade de se defender.',
  },

  // Fase 1 — o jogo sorteia 8 por partida.
  detector: [
    { texto: 'Ana e Júlia discutem sobre qual música vai tocar na festa da turma. Depois de um tempo, combinam de fazer uma playlist com as duas.', resp: 'conflito' },
    { texto: 'Todo dia, no intervalo, o mesmo grupo esconde a mochila do Pedro e ri enquanto ele procura.', resp: 'bullying' },
    { texto: 'No futsal, um aluno perde a cabeça depois de um gol e empurra o colega no chão.', resp: 'agressao' },
    { texto: 'Há semanas os colegas chamam a Carol por um apelido sobre o peso dela. Ela já nem quer vir pra escola.', resp: 'bullying' },
    { texto: 'Dois amigos brigam porque um acha que o outro não ajudou no trabalho. Eles decidem conversar com a professora.', resp: 'conflito' },
    { texto: 'Um aluno ameaça bater em outro na saída se ele não emprestar o celular.', resp: 'agressao' },
    { texto: 'Criaram um grupo de WhatsApp só pra zoar uma colega, com figurinhas e prints dela. Todo santo dia.', resp: 'bullying' },
    { texto: 'Na fila da cantina, alguém xinga e humilha um colega na frente de todo mundo porque ele esbarrou sem querer.', resp: 'agressao' },
    { texto: 'Duas colegas não concordam sobre quem apresenta o trabalho. Resolvem no par ou ímpar.', resp: 'conflito' },
    { texto: 'Um menino é deixado de fora dos grupos de propósito, sempre. Quando tenta participar, viram piada.', resp: 'bullying' },
    { texto: 'Um aluno puxa o cabelo de uma colega e diz que ela "mereceu" porque não respondeu a mensagem dele.', resp: 'agressao' },
    { texto: 'O time inteiro discute qual tática usar no interclasse. Fazem uma votação e seguem o resultado.', resp: 'conflito' },
  ],

  // Fase 2 — cada post tem 3 escolhas: 150 = melhor atitude, 50~75 = ajuda pouco, 0 = alimenta o ciclo.
  feed: [
    {
      app: 'Grupo "3º ano zoeira" · 32 membros', autor: 'Contato desconhecido',
      post: 'Olha a foto da Mari 😳😳 tá rodando em todos os grupos (feita com IA kkk)',
      tag: 'montagem com IA',
      opcoes: [
        { t: 'Repassar pro grupo dos amigos', p: 0, r: 'Compartilhar também é violência e pode ser crime. Montagem íntima com IA de menor de idade é violência sexual digital, prevista no ECA.' },
        { t: 'Não repassar, apoiar a Mari e avisar um adulto', p: 150, r: 'Isso! Em 2026, um caso assim no ES virou denúncia e protesto dos estudantes. Quem sofre precisa de apoio, e a escola precisa saber.' },
        { t: 'Só ignorar e continuar rolando', p: 50, r: 'Não espalhar já ajuda, mas a Mari continua sozinha. Dá pra fazer mais: apoiar e avisar alguém de confiança.' },
      ],
    },
    {
      app: 'Mensagem direta', autor: '@anônimo_77',
      post: 'amanhã na saída tu vai ver. não adianta correr',
      tag: 'ameaça',
      opcoes: [
        { t: 'Responder ameaçando de volta', p: 0, r: 'Responder com violência só alimenta o ciclo: causa → exposição → repetição.' },
        { t: 'Não contar pra ninguém', p: 25, r: 'Guardar pra você deixa você sozinho no perigo. Pedir ajuda é um ato de coragem.' },
        { t: 'Tirar print e contar pra um adulto de confiança', p: 150, r: 'Perfeito. O print é prova, e um adulto pode agir antes de acontecer. Em perigo imediato: 190.' },
      ],
    },
    {
      app: 'Grupo da turma · enquete', autor: 'Caio',
      post: '📊 VOTAÇÃO: quem é a pessoa mais feia da sala? 🤣🤣',
      tag: 'humilhação',
      opcoes: [
        { t: 'Votar, é só zoeira', p: 0, r: 'Não é brincadeira quando só um lado ri. Humilhar em público é violência psicológica.' },
        { t: 'Dizer que não tem graça e chamar um professor', p: 150, r: 'Você quebrou o ciclo. Quem assiste e não ri tira o "palco" de quem agride.' },
        { t: 'Sair do grupo em silêncio', p: 50, r: 'Você não participou, ótimo. Mas falar e chamar ajuda protege quem está sendo alvo.' },
      ],
    },
    {
      app: 'Stories', autor: 'Gui',
      post: '🎥 vídeo: briga no recreio — "KKKKK olha o moleque apanhando"',
      tag: 'exposição',
      opcoes: [
        { t: 'Compartilhar, todo mundo já viu mesmo', p: 0, r: 'Cada compartilhamento repete a violência contra quem apanhou. Não expor também é proteger.' },
        { t: 'Curtir sem comentar', p: 0, r: 'Curtir dá audiência. É assim que a violência vira "normal".' },
        { t: 'Denunciar o story e ver se o colega está bem', p: 150, r: 'Isso! Denunciar conteúdo violento e acolher quem sofreu muda a história.' },
      ],
    },
    {
      app: 'Mensagem direta', autor: 'perfil_novo_2026',
      post: 'oi linda, me manda uma foto sua? fica só entre a gente, é nosso segredo 🤫',
      tag: 'aliciamento',
      opcoes: [
        { t: 'Mandar, parece gente boa', p: 0, r: 'Pedido de "segredo" é sinal de alerta. Nunca envie fotos pra desconhecidos.' },
        { t: 'Só bloquear', p: 75, r: 'Bloquear é bom! Melhor ainda: salvar prints e contar pra um adulto. Dá pra denunciar no Disque 100.' },
        { t: 'Bloquear, salvar prints e contar pra um adulto', p: 150, r: 'Exatamente. Adulto pedindo segredo a adolescente é violação de direitos: Disque 100.' },
      ],
    },
    {
      app: 'Close friends', autor: 'Lu',
      post: 'ninguém liga pra mim mesmo. cansei de tudo.',
      tag: 'pedido de ajuda',
      opcoes: [
        { t: 'Ignorar, deve ser drama', p: 0, r: 'Às vezes é o único jeito que a pessoa encontrou de pedir ajuda. Nunca é "só drama".' },
        { t: 'Reagir com 😢 e seguir', p: 25, r: 'Um emoji não basta. Uma conversa de verdade pode fazer toda a diferença.' },
        { t: 'Chamar a Lu pra conversar e avisar um adulto', p: 150, r: 'Você é rede de apoio. E o CVV atende no 188, 24h, de graça.' },
      ],
    },
  ],

  // Fase 3 — o que cai do céu.
  bons: ['Diálogo', 'Respeito', 'Empatia', 'Escuta', 'Amizade', 'Pedir ajuda', 'Disque 100', 'Educação', 'Esporte', 'Cultura', 'Gentileza', 'Acolher'],
  ruins: ['Xingar', 'Humilhar', 'Ameaça', 'Fake com IA', 'Exclusão', 'Empurrão', 'Zoar', 'Expor print', 'Preconceito', 'Vingança'],
};
