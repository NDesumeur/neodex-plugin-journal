// lancé par le test « local » de NeoDex : la page remplit la hauteur de l'écran, le calendrier n'est ni minuscule ni coupé, rien ne déborde
module.exports = async ({ pj, sleep }) => {
  await sleep(800);
  const r = await pj(`(() => {
    const page = document.querySelector('.jrPage').getBoundingClientRect(), text = document.getElementById('jrText').getBoundingClientRect(), cell = document.querySelector('.jrCell').getBoundingClientRect();
    const over = [...document.querySelectorAll('.appWrap *')].filter(e => e.getBoundingClientRect().right > innerWidth + 1).length;
    return { pageBottom: Math.round(page.bottom), h: innerHeight, text: Math.round(text.height), cell: Math.round(cell.width), cells: document.querySelectorAll('.jrCell').length, over, ask: document.querySelector('#jrAsk .q')?.textContent || '' };
  })()`);
  if (!/\?$/.test(r.ask)) throw new Error('pas de question du jour');
  if (r.cells < 28) throw new Error('calendrier incomplet : ' + JSON.stringify(r));
  if (r.cell < 30) throw new Error('jours trop petits : ' + r.cell + ' px');
  if (r.pageBottom < r.h * .8) throw new Error('la page ne remplit pas l’écran : ' + JSON.stringify(r));
  if (r.over) throw new Error(r.over + ' élément(s) débordent à droite');
  return 'page de ' + r.text + ' px de haut, jours de ' + r.cell + ' px';
};
