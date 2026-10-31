// Journal : ton appli d'origine (HTML et code inchangés), livrée en plugin.
// Ses données sont dans le dossier du plugin, que NeoBase sauvegarde (synchro cloud et sauvegardes) ; à la première ouverture elle reprend ce que tu avais dans NeoBase.
// Elle demande l'accès complet pour utiliser les outils d'interface de NeoBase. NeoBase ne l'ouvre que si elle est signée.
const HTML = "<div class=\"appWrap\">\n      <div class=\"agHead\"><span class=\"label\">Journal</span><span class=\"hint\" id=\"jrStats\"></span><div class=\"agNav\"><button class=\"btn px\" id=\"jrToday\">AUJOURD'HUI</button></div></div>\n      <div class=\"jrMain\">\n        <div class=\"sysCard px jrSide\"><div class=\"jrNav\"><button class=\"btn px\" id=\"jrPrev\" title=\"Mois précédent\">&lt;</button><span id=\"jrMonthName\"></span><button class=\"btn px\" id=\"jrNext\" title=\"Mois suivant\">&gt;</button></div>\n          <div id=\"jrCal\"></div><div class=\"hint\">Les jours écrits sont marqués, de la couleur de ton humeur.</div></div>\n        <div class=\"sysCard px jrPage\"><div id=\"jrDate\"></div><div class=\"jrMoodRow\"><span class=\"label\">Humeur</span><div id=\"jrMoods\"></div></div>\n          <textarea id=\"jrText\" placeholder=\"Comment s'est passée ta journée ?\"></textarea><div class=\"hint\" id=\"jrWords\"></div></div>\n      </div>\n    </div>";
export default async function (ctx) {
  const view = ctx.view;
  if (!ctx.host) { view.textContent = "Ce plugin doit être approuvé par NeoBase pour s'ouvrir."; return; }
  const host = ctx.host, { el, toast, sfx, ask, newTab, pixIcon, PIX, WX } = host;
  const folder = ctx.folder, legacy = ctx.legacy || {};
  view.innerHTML = HTML;
  const $ = id => id === "journalApp" ? view : (view.querySelector('#' + id) || document.getElementById(id));  // les identifiants de ta vue d'abord, puis ceux de la page (fenêtres, menus)
  const doc = async n => { try { return await folder.read(n); } catch { return null; } };
  const ymd = d => d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
  const addDays = (d, n) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);
  const __icon = () => ctx.icon;  // l'icône de ce plugin
  const LEGACY_API = ["journal"];
  const api = async (n, data) => {
    if (data !== undefined) { await folder.write(n, data); return true; }
    let v = await doc(n);
    if (v == null && legacy.api && LEGACY_API.includes(n)) { v = await legacy.api(n).catch(() => null); if (v != null) await folder.write(n, v); }  // première ouverture : tu retrouves tes données d'avant
    return v;
  };
  // ---- ton code d'origine ----
/* ---------- Journal app: journal.json = {entries: {"YYYY-MM-DD": {text, mood (1..5), t}}}, one page per day, saved as you type ---------- */
let journal = null, jrDay = ymd(new Date()), jrMonth = jrDay.slice(0, 7), jrTimer = null;
const JR_MOODS = [['1', 'Très mauvaise journée', '#ff4f6d'], ['2', 'Pas terrible', '#e89a3a'], ['3', 'Bof', '#9a8cc8'], ['4', 'Bonne journée', '#c94fe0'], ['5', 'Super journée', '#ff5ad9']];
// pixel faces, from sad to happy
PIX.mood1 = ['.#####.', '#.....#', '#.#.#.#', '#.....#', '#.###.#', '#.#.#.#', '.#####.'];
PIX.mood2 = ['.#####.', '#.....#', '#.#.#.#', '#.....#', '#..#..#', '#.#.#.#', '.#####.'];
PIX.mood3 = ['.#####.', '#.....#', '#.#.#.#', '#.....#', '#.###.#', '#.....#', '.#####.'];
PIX.mood4 = ['.#####.', '#.....#', '#.#.#.#', '#.....#', '#.#.#.#', '#..#..#', '.#####.'];
PIX.mood5 = ['.#####.', '#.....#', '#.#.#.#', '#.....#', '#.#.#.#', '#.###.#', '.#####.'];
const saveJournal = () => { clearTimeout(jrTimer); jrTimer = setTimeout(() => { jrTimer = null; api('journal', journal).catch(e => toast('Sauvegarde du journal impossible : ' + e.message, true)); }, 600); };
addEventListener('pagehide', () => { if (jrTimer) folder.write('journal', journal); });
api('journal').then(d => { journal = d?.entries ? d : {entries: {}}; if (view.classList.contains('on')) jrRender(); }).catch(e => toast('Journal indisponible : ' + e.message, true));
function jrStreak() {  // days in a row with something written, up to today (or yesterday if today is still empty)
  let n = 0, d = new Date();
  if (!journal.entries[ymd(d)]?.text?.trim()) d = addDays(d, -1);
  while (journal.entries[ymd(d)]?.text?.trim()) { n++; d = addDays(d, -1); }
  return n;
}
function jrRender() {
  if (!journal) return;
  const first = new Date(jrMonth + '-01T12:00'), start = addDays(first, -((first.getDay() + 6) % 7)), today = ymd(new Date());
  $('jrMonthName').textContent = first.toLocaleDateString('fr-FR', {month: 'long', year: 'numeric'});
  const cells = ['L', 'M', 'M', 'J', 'V', 'S', 'D'].map(d => el('span', 'jrDow', d));
  for (let i = 0; i < 42; i++) {
    const d = addDays(start, i), k = ymd(d), en = journal.entries[k], c = el('button', 'jrCell' + (k.slice(0, 7) !== jrMonth ? ' out' : '') + (k === jrDay ? ' on' : '') + (k === today ? ' today' : '') + (en?.text?.trim() ? ' has' : ''), String(d.getDate()));
    if (en?.mood) c.style.setProperty('--mc', JR_MOODS[en.mood - 1][2]);
    c.onclick = () => { jrDay = k; jrMonth = k.slice(0, 7); jrRender(); $('jrText').focus(); };
    cells.push(c);
  }
  $('jrCal').replaceChildren(...cells);
  const all = Object.entries(journal.entries).filter(([, e]) => e.text?.trim()), month = all.filter(([k]) => k.startsWith(jrMonth)), streak = jrStreak();
  $('jrStats').textContent = `${month.length} jour${month.length > 1 ? 's' : ''} écrit${month.length > 1 ? 's' : ''} ce mois-ci · ${all.length} au total` + (streak ? ` · ${streak} jour${streak > 1 ? 's' : ''} d'affilée` : '');
  const en = journal.entries[jrDay] || {}, d = new Date(jrDay + 'T12:00');
  $('jrDate').textContent = (jrDay === today ? "Aujourd'hui · " : '') + d.toLocaleDateString('fr-FR', {weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'});
  $('jrMoods').replaceChildren(...JR_MOODS.map(([v, label, color], i) => {
    const b = el('button', 'jrMood' + (en.mood === i + 1 ? ' on' : '')); b.innerHTML = pixIcon(PIX['mood' + v], 4); b.title = label; b.style.setProperty('--mc', color);
    b.onclick = () => { const e = journal.entries[jrDay] ||= {text: '', mood: 0, t: 0}; e.mood = e.mood === i + 1 ? 0 : i + 1; e.t = Date.now(); saveJournal(); jrRender(); };
    return b;
  }));
  if (document.activeElement !== $('jrText')) $('jrText').value = en.text || '';
  jrCount();
}
const jrCount = () => { const n = ($('jrText').value.match(/\S+/g) || []).length; $('jrWords').textContent = n + ' mot' + (n > 1 ? 's' : '') + (journal.entries[jrDay]?.t ? ' · modifié à ' + new Date(journal.entries[jrDay].t).toLocaleTimeString('fr-FR', {hour: '2-digit', minute: '2-digit'}) : ''); };
$('jrText').oninput = () => { const e = journal.entries[jrDay] ||= {text: '', mood: 0, t: 0}; e.text = $('jrText').value; e.t = Date.now(); saveJournal(); jrCount(); };
$('jrText').onblur = () => jrRender();
$('jrPrev').onclick = () => { jrMonth = ymd(addDays(new Date(jrMonth + '-01T12:00'), -1)).slice(0, 7); jrRender(); };
$('jrNext').onclick = () => { jrMonth = ymd(addDays(new Date(jrMonth + '-28T12:00'), 7)).slice(0, 7); jrRender(); };
$('jrToday').onclick = () => { jrDay = ymd(new Date()); jrMonth = jrDay.slice(0, 7); jrRender(); $('jrText').focus(); };  // (non indenté : les textes sur plusieurs lignes restent exactement les tiens)
  // ---- fin ----
  ctx.onOpen(() => { jrRender(); });
}
