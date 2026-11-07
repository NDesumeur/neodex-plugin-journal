// Journal : ton appli d'origine (HTML et code inchangés), livrée en plugin.
// Ses données sont dans le dossier du plugin, que NeoDex sauvegarde (synchro cloud et sauvegardes) ; à la première ouverture elle reprend ce que tu avais dans NeoDex.
// Elle tourne dans le bac à sable de NeoDex, avec ses outils d'interface (ctx.host) et seulement les autorisations de son plugin.json.
const HTML = "<div class=\"appWrap\">\n      <div class=\"agHead\"><span class=\"label\">Journal</span><span class=\"hint\" id=\"jrStats\"></span><div class=\"agNav\"><button class=\"btn px\" id=\"jrToday\">AUJOURD'HUI</button></div></div>\n      <div class=\"jrMain\">\n        <div class=\"sysCard px jrSide\"><div class=\"jrNav\"><button class=\"btn px\" id=\"jrPrev\" title=\"Mois précédent\">&lt;</button><span id=\"jrMonthName\"></span><button class=\"btn px\" id=\"jrNext\" title=\"Mois suivant\">&gt;</button></div>\n          <div id=\"jrCal\"></div><div class=\"hint\">Les jours écrits sont marqués, de la couleur de ton humeur.</div></div>\n        <div class=\"sysCard px jrPage\"><div id=\"jrDate\"></div><div class=\"jrMoodRow\"><span class=\"label\">Humeur</span><div id=\"jrMoods\"></div></div>\n          <textarea id=\"jrText\" placeholder=\"Comment s'est passée ta journée ?\"></textarea><div class=\"hint\" id=\"jrWords\"></div></div>\n      </div>\n    </div>";
/*CSS-MOVED*/ const CSS = `.jrMain{display:grid;grid-template-columns:340px 1fr;gap:20px;align-items:start}
.jrNav{display:flex;align-items:center;gap:10px}
.jrNav span{flex:1;text-align:center;color:#fff;font-size:17px;text-transform:capitalize}
.jrNav .btn{height:34px;font:10px var(--title);padding:0 10px}
#jrCal{display:grid;grid-template-columns:repeat(7,1fr);gap:4px}
.jrDow{font:7px var(--title);color:var(--muted);text-align:center;padding:4px 0}
.jrCell{all:unset;cursor:var(--cp,pointer);aspect-ratio:1;display:grid;place-items:center;font-size:14px;color:var(--lilac);background:rgba(255,255,255,.03);position:relative}
.jrCell:hover{background:rgba(255,255,255,.08)}
.jrCell.out{opacity:.35}
.jrCell.today{color:#fff;box-shadow:inset 0 0 0 2px var(--line2)}
.jrCell.on{background:rgba(var(--mgr),.25);color:#fff;box-shadow:inset 0 0 0 2px var(--magenta)}
.jrCell.has::after{content:"";position:absolute;bottom:5px;width:6px;height:6px;background:var(--mc,var(--pink))}
.jrPage{min-height:520px}
#jrDate{font:600 22px var(--text);color:#fff;text-transform:capitalize}
.jrMoodRow{display:flex;align-items:center;gap:14px}
#jrMoods{display:flex;gap:6px}
.jrMood{all:unset;cursor:var(--cp,pointer);padding:6px;color:var(--muted);box-shadow:inset 0 0 0 2px transparent}
.jrMood:hover{color:var(--mc)}
.jrMood.on{color:var(--mc);box-shadow:inset 0 0 0 2px var(--mc)}
#jrText{all:unset;flex:1;min-height:380px;font:17px/1.6 var(--text);color:var(--lilac);white-space:pre-wrap;word-break:break-word;overflow-y:auto}
#jrText::placeholder{color:var(--ph)}
/* le journal en carnet de papier pixel art : page lignée à marge rouge, calendrier de bureau à spirale */
.jrPage,.jrSide{--c:#1b1230;position:relative;box-shadow:0 -3px 0 0 #1b1230,0 3px 0 0 #1b1230,-3px 0 0 0 #1b1230,3px 0 0 0 #1b1230,8px 8px 0 2px rgba(0,0,0,.4)}
.jrPage{--fill:linear-gradient(90deg,transparent 50px,#e0707f 50px 53px,transparent 53px),url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='32' height='32' shape-rendering='crispEdges' fill='%23e4d6b0'%3E%3Crect x='3' y='5' width='1' height='1'/%3E%3Crect x='19' y='2' width='2' height='1'/%3E%3Crect x='27' y='13' width='1' height='1'/%3E%3Crect x='9' y='21' width='1' height='2'/%3E%3Crect x='23' y='26' width='1' height='1'/%3E%3Crect x='14' y='12' width='1' height='1'/%3E%3C/svg%3E"),#f3e9cf;padding-left:72px}
.jrPage::before{content:'';position:absolute;left:16px;top:24px;bottom:24px;width:18px;background:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='18' height='64' shape-rendering='crispEdges'%3E%3Cpath fill='%231b1230' d='M6 4h6v2h2v6h-2v2H6v-2H4V6h2z'/%3E%3C/svg%3E") repeat-y}
#jrDate{color:#2b2350}
.jrPage .label{color:#8a7c5a}
.jrPage .hint{color:#5a4f7a}
.jrMood{color:#9a8c6c} .jrMood.on{background:#fff6e0}
#jrText{color:#2b2350;font-size:19px;line-height:32px;background:repeating-linear-gradient(to bottom,transparent 0 30px,#a9bde0 30px 32px);background-attachment:local}
#jrText::placeholder{color:#b0a27c}
.jrSide{--fill:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='32' height='32' shape-rendering='crispEdges' fill='%23e4d6b0'%3E%3Crect x='3' y='5' width='1' height='1'/%3E%3Crect x='19' y='2' width='2' height='1'/%3E%3Crect x='27' y='13' width='1' height='1'/%3E%3Crect x='9' y='21' width='1' height='2'/%3E%3Crect x='23' y='26' width='1' height='1'/%3E%3Crect x='14' y='12' width='1' height='1'/%3E%3C/svg%3E"),#f3e9cf;margin-top:14px;padding-top:28px}
.jrSide::before{content:'';position:absolute;top:-12px;left:18px;right:18px;height:22px;background:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='28' height='22' shape-rendering='crispEdges'%3E%3Cpath fill='%231b1230' d='M10 0h8v2h2v12h-2v2h-8v-2H8V2h2z'/%3E%3Cpath fill='%23c8ccec' d='M12 2h4v2h2v8h-2v2h-4v-2h-2V4h2z'/%3E%3Cpath fill='%23ffffff' d='M12 2h2v2h-2z'/%3E%3Cpath fill='%231b1230' d='M11 16h6v4h-6z'/%3E%3C/svg%3E") repeat-x}
.jrNav{background:#e0707f;margin:-10px -12px 6px;padding:6px 8px;box-shadow:inset 0 -3px 0 #b04a5a}
.jrNav span{color:#fff;text-shadow:2px 2px 0 #7a2a3a}
.jrDow{color:#8a7c5a}
.jrCell{color:#2b2350;background:#fbf3dd;box-shadow:inset 0 -2px 0 #ddcfa8}
.jrCell:hover{background:#fff}
.jrCell.today{color:#2b2350;box-shadow:inset 0 0 0 2px #2b2350}
.jrCell.on{background:#ffd8f2;color:#2b2350;box-shadow:inset 0 0 0 3px #b0288c}
.jrSide .hint{color:#5a4f7a}
`;  // le style de ce plugin (il utilise les variables du thème de NeoDex)
export default async function (ctx) {
  const view = ctx.view;
  if (!ctx.host) { view.textContent = "Ce plugin doit être approuvé par NeoDex pour s'ouvrir."; return; }
  const host = ctx.host, { el, toast, sfx, ask, newTab, pixIcon, PIX, WX } = host;
  const folder = ctx.folder, legacy = ctx.legacy || {};
  ctx.host.addStyle(CSS);
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
