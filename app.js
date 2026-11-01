/* كتابي — كتاب العلوم على الجهاز: قراءة وكتابة بالقلم، ومساعد لكل درس، وتقويم للدروس. لا خادم ولا حساب. */
(function () {
'use strict';
var docEl = document.documentElement;
var VERSION = window.KITABI_VERSION || '';

/* ---------- helpers ---------- */
var ESC = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return ESC[c]; }); }
function fx(s) { return esc(s).replace(/`([^`]+)`/g, function (m, x) { return '<bdi class="fx" dir="ltr">' + x + '</bdi>'; }).replace(/\*\*([^*]+?)\*\*/g, '<b>$1</b>'); }
function plain(s) { return String(s == null ? '' : s).replace(/`|\*\*/g, ''); }
function num(n) { return Number(n).toLocaleString('en-US'); }
function shuffle(a) { a = a.slice(); for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)); var t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
function pct(a, b) { return b ? Math.round(100 * a / b) : 0; }
function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }
function uid(p) { return (p || '') + Date.now().toString(36) + Math.random().toString(36).slice(2, 6); }
var DIAC = /[ؗ-ًؚ-ْٰـ]/g;
function norm(s) { return String(s || '').replace(DIAC, '').replace(/[إأآٱ]/g, 'ا').replace(/ة/g, 'ه').replace(/ى/g, 'ي').replace(/[`*]/g, '').toLowerCase(); }
var LET = ['أ', 'ب', 'ج', 'د'];
var WORDS = {
  day: ['يوم واحد', 'يومان', 'أيام', 'يومًا'], lesson: ['درس واحد', 'درسان', 'دروس', 'درسًا'],
  q: ['سؤال واحد', 'سؤالان', 'أسئلة', 'سؤالًا'], page: ['صفحة واحدة', 'صفحتان', 'صفحات', 'صفحة'],
  week: ['أسبوع واحد', 'أسبوعان', 'أسابيع', 'أسبوعًا'], cls: ['فصل واحد', 'فصلان', 'فصول', 'فصلًا'],
  book: ['كتاب واحد', 'كتابان', 'كتب', 'كتابًا']
};
function cnt(n, w) { if (n === 1) return w[0]; if (n === 2) return w[1]; var r = n % 100; if (r >= 3 && r <= 10) return num(n) + ' ' + w[2]; return num(n) + ' ' + w[3]; }
function cntWord(n, w) { return cnt(n, w).replace(/^[\d,]+ /, ''); }

/* ---------- colour: hues and icon tiles (from إتقان) ---------- */
var HUES = ['green', 'violet', 'amber', 'blue', 'rose', 'cyan', 'teal'];
var ICONS = {
  leaf: '<path d="M5 19c0-8 5-13 14-14 0 9-5 14-13 14z"/><path d="M5 19l7-7"/>',
  planet: '<circle cx="12" cy="12" r="5"/><path d="M4.2 16.6c-1.2 1.6-.9 2.8 1.2 2.7 2.6-.1 6.6-2 10-4.8s5.6-5.8 5-7.3c-.4-1-1.7-1.2-3.4-.7"/>',
  globe: '<circle cx="12" cy="12" r="8.5"/><path d="M3.5 12h17M12 3.5c2.4 2.6 3.5 5.5 3.5 8.5s-1.1 5.9-3.5 8.5c-2.4-2.6-3.5-5.5-3.5-8.5s1.1-5.9 3.5-8.5z"/>',
  flask: '<path d="M9 3.5h6M10 3.5v5.7L4.8 18a1.8 1.8 0 0 0 1.6 2.6h11.2a1.8 1.8 0 0 0 1.6-2.6L14 9.2V3.5"/><path d="M7.4 14.5h9.2"/>',
  bolt: '<path d="M13 3 5 13.5h6L10.5 21 19 10.5h-6z"/>',
  bulb: '<path d="M9 17.5h6M10 20.5h4"/><path d="M8.2 14.6a6 6 0 1 1 7.6 0c-.6.5-.8 1.2-.8 1.9v.5H9v-.5c0-.7-.3-1.4-.8-1.9z"/>',
  star: '<path d="m12 3.6 2.6 5.3 5.8.8-4.2 4.1 1 5.8L12 16.9l-5.2 2.7 1-5.8-4.2-4.1 5.8-.8z"/>',
  book: '<path d="M4 5.5c2.6-1 5.4-1 8 .6 2.6-1.6 5.4-1.6 8-.6v13c-2.6-1-5.4-.9-8 .6-2.6-1.5-5.4-1.6-8-.6z"/><path d="M12 6.1v13"/>',
  board: '<rect x="3.5" y="4" width="17" height="11.5" rx="2"/><path d="M12 15.5V20M8.5 20h7M7.5 9.5l3 2.4 5.5-4.4"/>',
  clock: '<circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  warn: '<path d="M12 4 21 19.5H3z"/><path d="M12 10v4M12 16.8v.1"/>',
  target: '<circle cx="12" cy="12" r="8.5"/><circle cx="12" cy="12" r="4.5"/><path d="M12 12h.01"/>',
  chart: '<path d="M4 20h16"/><path d="M7 16v-5M12 16V6M17 16v-8"/>',
  cal: '<rect x="3.6" y="5" width="16.8" height="15.2" rx="3"/><path d="M3.6 10h16.8M8 3v4M16 3v4"/>',
  q: '<circle cx="12" cy="12" r="8.6"/><path d="M9.5 9.4a2.6 2.6 0 1 1 3.6 2.4c-.7.3-1.1.8-1.1 1.5v.5"/><path d="M12 16.9v.1"/>',
  spark: '<path d="M12 3v4M12 17v4M3 12h4M17 12h4"/><path d="m6 6 2.5 2.5M15.5 15.5 18 18M18 6l-2.5 2.5M8.5 15.5 6 18"/>',
  pen: '<path d="M4 20l1-4L16.5 4.5a2.1 2.1 0 0 1 3 3L8 19z"/><path d="M14.5 6.5l3 3"/>',
  people: '<circle cx="9" cy="8" r="3.2"/><path d="M3.5 19c.6-3.2 2.8-5 5.5-5s4.9 1.8 5.5 5"/><circle cx="17" cy="9" r="2.5"/><path d="M15.5 14.2c2.3.2 4.1 1.8 4.6 4.8"/>',
  map: '<circle cx="12" cy="5.5" r="2.5"/><circle cx="5.5" cy="18" r="2.5"/><circle cx="18.5" cy="18" r="2.5"/><path d="M12 8v3.5M12 11.5 6.5 15.7M12 11.5l5.5 4.2"/>',
  file: '<path d="M14 3.5H7a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8.5z"/><path d="M14 3.5v5h5"/>'
};
function svgI(name) { return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + (ICONS[name] || ICONS.book) + '</svg>'; }
function ico(name, hue, txt) {
  return '<span class="ico hue-' + hue + '" aria-hidden="true">' + (txt != null ? '<b>' + esc(txt) + '</b>' : svgI(name)) + '</span>';
}
function unitHue(k) { return HUES[k % HUES.length]; }

/* ---------- dates: local calendar days ---------- */
var DAY = 864e5;
function dayOf(d) { return Math.floor(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()) / DAY); }
function today() { return dayOf(new Date()); }
function isoOf(i) { return new Date(i * DAY).toISOString().slice(0, 10); }
function parseISO(s) { var m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s || ''); return m ? Math.floor(Date.UTC(+m[1], +m[2] - 1, +m[3]) / DAY) : null; }
var AR_MONTHS = ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'];
var AR_DAYS = ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
var AR_DAYS_S = ['أحد', 'اثنين', 'ثلاثاء', 'أربعاء', 'خميس', 'جمعة', 'سبت'];
function wday(i) { return new Date(i * DAY).getUTCDay(); }
function ymd(i) { var d = new Date(i * DAY); return { y: d.getUTCFullYear(), m: d.getUTCMonth(), d: d.getUTCDate() }; }
function dayFull(i) { var p = ymd(i); return AR_DAYS[wday(i)] + ' ' + p.d + ' ' + AR_MONTHS[p.m] + ' ' + p.y; }
function dayShort(i) { var p = ymd(i); return AR_DAYS[wday(i)] + ' ' + p.d + ' ' + AR_MONTHS[p.m]; }
function dmShort(i) { var p = ymd(i); return p.d + ' ' + AR_MONTHS[p.m]; }
function rng(a, b) { return a === b || !b ? String(a) : '\u2066' + a + '–' + b + '\u2069'; }
function rangeLbl(a, b) { if (a === b) return dayShort(a); var x = ymd(a), y = ymd(b); return x.m === y.m ? rng(x.d, y.d) + ' ' + AR_MONTHS[y.m] : dmShort(a) + ' – ' + dmShort(b); }
function relDay(ms) { var d = today() - dayOf(new Date(ms)); return d <= 0 ? 'اليوم' : d === 1 ? 'أمس' : 'قبل ' + cnt(d, WORDS.day); }
function hijriOf(i) { // Umm al-Qura date, or null where the browser has no Islamic calendar
  try {
    if (!hijriOf.f) hijriOf.f = { d: new Intl.DateTimeFormat('en-u-ca-islamic-umalqura', { day: 'numeric', timeZone: 'UTC' }), n: new Intl.DateTimeFormat('en-u-ca-islamic-umalqura', { month: 'numeric', timeZone: 'UTC' }),
      y: new Intl.DateTimeFormat('en-u-ca-islamic-umalqura', { year: 'numeric', timeZone: 'UTC' }), m: new Intl.DateTimeFormat('ar-SA-u-ca-islamic-umalqura-nu-latn', { month: 'long', timeZone: 'UTC' }) };
    var dt = new Date(i * DAY), d = parseInt(hijriOf.f.d.format(dt), 10), mn = parseInt(hijriOf.f.n.format(dt), 10);
    return isFinite(d) && isFinite(mn) ? { d: d, mn: mn, y: parseInt(hijriOf.f.y.format(dt), 10), m: hijriOf.f.m.format(dt) } : null;
  } catch (e) { return null; }
}
function hjShort(m) { return m.replace('ربيع الأول', 'ربيع 1').replace('ربيع الآخر', 'ربيع 2').replace('جمادى الأولى', 'جمادى 1').replace('جمادى الآخرة', 'جمادى 2').replace(/^ذو /, ''); }

/* Ministry of Education calendar, 1448 AH (2026–2027), as announced (same table as إتقان); west = Makkah, Madinah, Jeddah and Taif. */
var EDU_CAL = {
  both: [['2026-09-23', '2026-09-26', 'off', 'إجازة اليوم الوطني'], ['2026-10-25', '2026-10-25', 'extra', 'إجازة إضافية'], ['2026-11-20', '2026-11-28', 'off', 'إجازة الخريف'],
    ['2027-01-07', '2027-01-07', 'end', 'نهاية الفصل الدراسي الأول'], ['2027-01-08', '2027-01-16', 'off', 'إجازة منتصف العام'], ['2027-01-17', '2027-01-17', 'start', 'بداية الفصل الدراسي الثاني'],
    ['2027-02-19', '2027-02-22', 'off', 'إجازة يوم التأسيس'], ['2027-02-26', '2027-03-13', 'off', 'إجازة عيد الفطر']],
  std: [['2026-08-23', '2026-08-23', 'start', 'بداية الدراسة'],
    ['2026-11-29', '2026-11-29', 'extra', 'إجازة إضافية'], ['2027-01-07', '2027-01-07', 'extra', 'إجازة إضافية'], ['2027-04-11', '2027-04-11', 'extra', 'إجازة إضافية'],
    ['2027-05-07', '2027-05-22', 'off', 'إجازة عيد الأضحى'], ['2027-06-24', '2027-06-24', 'end', 'نهاية العام الدراسي'], ['2027-06-25', '2027-08-21', 'off', 'الإجازة الصيفية للطلاب']],
  west: [['2026-08-30', '2026-08-30', 'start', 'بداية الدراسة'],
    ['2027-04-30', '2027-05-22', 'off', 'إجازة عيد الأضحى'], ['2027-07-01', '2027-07-01', 'end', 'نهاية العام الدراسي'], ['2027-07-02', '2027-08-28', 'off', 'الإجازة الصيفية للطلاب']]
};
/* the two terms of 1448 AH: first day and last day of teaching */
var TERMS = {
  std: [['t1', 'الفصل الدراسي الأول', '2026-08-23', '2027-01-07'], ['t2', 'الفصل الدراسي الثاني', '2027-01-17', '2027-06-24']],
  west: [['t1', 'الفصل الدراسي الأول', '2026-08-30', '2027-01-07'], ['t2', 'الفصل الدراسي الثاني', '2027-01-17', '2027-07-01']]
};
function eduList() { var r = P.region === 'west' ? 'west' : 'std'; return EDU_CAL.both.concat(EDU_CAL[r]).map(function (e) { return { a: parseISO(e[0]), b: parseISO(e[1]), k: e[2], t: e[3] }; }); }
function termNow() { var t = today(), T = termsList(); return (T.filter(function (x) { return t <= parseISO(x[3]); })[0] || T[T.length - 1])[0]; }
function guessTerm(title) { var s = String(title || ''); if (/الجزء الأول|الفصل الدراسي الأول|(^|\s)ف\s?1(\s|$)|الفصل الأول|SM1|S1\b/i.test(s)) return 't1'; if (/الجزء الثاني|الفصل الدراسي الثاني|(^|\s)ف\s?2(\s|$)|الفصل الثاني|SM2|S2\b/i.test(s)) return 't2'; return ''; }
function termName(k) { return k === 't1' ? 'الفصل الدراسي الأول' : k === 't2' ? 'الفصل الدراسي الثاني' : ''; }
function termsList() { return TERMS[P.region === 'west' ? 'west' : 'std']; }
function dayInfo(i, E) {
  var hj = hijriOf(i), o = { we: wday(i) >= 5, off: '', extra: false, marks: [], ram: 0, eid: '', hj: hj };
  E.forEach(function (e) { if (i < e.a || i > e.b) return; if (e.k === 'off') o.off = e.t; else if (e.k === 'extra') o.extra = true; else o.marks.push(e.t); });
  if (hj) { if (hj.mn === 9) o.ram = hj.d; if (hj.mn === 10 && hj.d <= 3) o.eid = 'عيد الفطر'; if (hj.mn === 12 && hj.d >= 10 && hj.d <= 13) o.eid = 'عيد الأضحى'; }
  o.school = !o.we && !o.off && !o.extra && !o.eid;
  o.fill = o.eid ? 'eid' : o.off ? 'off' : o.extra ? 'extra' : o.we ? 'we' : '';
  return o;
}
function nextBreak(t, E) {
  var l = E.filter(function (e) { return e.k === 'off' || e.k === 'extra'; }).sort(function (x, y) { return x.a - y.a; });
  for (var k = 0; k < l.length; k++) {
    var a = l[k].a, b = l[k].b, tt = l[k].k === 'off' ? l[k].t : '';
    while (k + 1 < l.length && l[k + 1].a <= b + 3) { var gap = true; for (var n = b + 1; n < l[k + 1].a; n++) if (wday(n) < 5) gap = false; if (!gap) break; k++; b = Math.max(b, l[k].b); if (!tt && l[k].k === 'off') tt = l[k].t; }
    if (b >= t) return { a: a, b: b, t: tt || 'إجازة إضافية' };
  }
  return null;
}

/* ---------- storage ---------- */
/* IndexedDB «kitabi»: books (metadata and lessons), files (the PDF itself), fonts (font files the user added), aids (lesson helpers), ink (writing on pages), notes (boards and notes).
   localStorage: kitabi-pref (preferences, the API key) and kitabi-state (current book, last pages, taught classes, plan, answers). */
var DBN = 'kitabi', DB = null;
function idb() {
  if (DB) return Promise.resolve(DB);
  return new Promise(function (res, rej) {
    var r; try { r = indexedDB.open(DBN, 3); } catch (e) { rej(e); return; }
    r.onupgradeneeded = function () {
      var d = r.result;
      ['books', 'files', 'fonts'].forEach(function (n) { if (!d.objectStoreNames.contains(n)) d.createObjectStore(n, { keyPath: 'id' }); });
      ['aids', 'ink', 'notes', 'media'].forEach(function (n) { if (!d.objectStoreNames.contains(n)) d.createObjectStore(n, { keyPath: 'k' }); });
    };
    r.onsuccess = function () { DB = r.result; DB.onversionchange = function () { try { DB.close(); } catch (e) {} DB = null; }; res(DB); };
    r.onerror = function () { rej(r.error || new Error('idb')); };
    r.onblocked = function () { rej(new Error('blocked')); };
  });
}
function tx(store, mode, fn) {
  return idb().then(function (d) {
    return new Promise(function (res, rej) {
      var t = d.transaction(store, mode), out, rq = fn(t.objectStore(store));
      if (rq) rq.onsuccess = function () { out = rq.result; };
      t.oncomplete = function () { res(out); };
      t.onerror = function () { rej(t.error || new Error('tx')); };
      t.onabort = function () { rej(t.error || new Error('abort')); };
    });
  });
}
function dbAll(st) { return tx(st, 'readonly', function (s) { return s.getAll(); }); }
function dbGet(st, k) { return tx(st, 'readonly', function (s) { return s.get(k); }); }
function dbPut(st, v) { var p = tx(st, 'readwrite', function (s) { s.put(v); }); syncMark(st, v && (v.id != null ? v.id : v.k)); return p; }
function dbDel(st, k) { var p = tx(st, 'readwrite', function (s) { s['delete'](k); }); syncMark(st, k); return p; }
function dbDelRange(st, prefix) { return tx(st, 'readwrite', function (s) { var r = s.getAllKeys(IDBKeyRange.bound(prefix, prefix + '\uffff')); r.onsuccess = function () { (r.result || []).forEach(function (k) { s['delete'](k); syncMark(st, k); }); }; }); }

var PREF_KEY = 'kitabi-pref', STATE_KEY = 'kitabi-state';
function loadJSON(k) { try { return JSON.parse(localStorage.getItem(k) || '{}') || {}; } catch (e) { return {}; } }
var P = loadJSON(PREF_KEY);   // theme, region, classes, ai {key, model}
var S = loadJSON(STATE_KEY);  // cur, last{bookId:page}, taught{lk:{cls:iso}}, ans{qid:[n,ok,last,t]}, plan{bookId:{...}}, notes{lk:text}, backupAt
function savePref() { try { localStorage.setItem(PREF_KEY, JSON.stringify(P)); } catch (e) {} if (typeof syncStateMark === 'function') syncStateMark(); }
var saveT = null;
function saveState(now) { clearTimeout(saveT); var f = function () { S.t = Date.now(); try { localStorage.setItem(STATE_KEY, JSON.stringify(S)); } catch (e) {} syncStateMark(); }; if (now) f(); else saveT = setTimeout(f, 250); }
['last', 'taught', 'ans', 'plan', 'notes'].forEach(function (k) { if (!S[k] || typeof S[k] !== 'object') S[k] = {}; });
if (!Array.isArray(P.classes)) P.classes = [];
if (!P.ai || typeof P.ai !== 'object') P.ai = {};

/* in memory */
var BOOKS = [];      // book records (without the file)
var AIDS = {};       // lk -> aid record
var route = { v: 'home' };

function curBook() { var b = BOOKS.filter(function (x) { return x.id === S.cur; })[0]; return b || BOOKS[0] || null; }
function bookById(id) { return BOOKS.filter(function (x) { return x.id === id; })[0] || null; }
function lk(b, l) { return b.id + ':' + l.id; }
function lessonByKey(k) { var i = k.indexOf(':'), b = bookById(k.slice(0, i)); if (!b) return null; var l = b.lessons.filter(function (x) { return x.id === k.slice(i + 1); })[0]; return l ? { b: b, l: l } : null; }
function aidOf(b, l) { return AIDS[lk(b, l)] || null; }
function units(b) { // lessons grouped by unit, keeping the book order
  var out = [], map = {};
  b.lessons.forEach(function (l) { var u = l.unit || 'الدروس'; if (!map[u]) { map[u] = { name: u, lessons: [] }; out.push(map[u]); } map[u].lessons.push(l); });
  return out;
}
function pdfPage(b, printed) { return clamp(Math.round(+printed + (+b.offset || 0)), 1, b.pages || 1); }
function printedOf(b, p) { return p - (+b.offset || 0); }
function lessonAtPage(b, p) { var pr = printedOf(b, p), hit = null; b.lessons.forEach(function (l) { if (pr >= l.from && pr <= (l.to || l.from)) hit = hit || l; }); return hit; }
function saveBook(b) { b.t = Date.now(); return dbPut('books', b); }

/* ---------- PDF library (loaded once, on first need) ---------- */
var PDFJS = null, DOCS = {};
function pdfjs() {
  if (!PDFJS) PDFJS = import('./vendor/pdfjs/pdf.min.mjs').then(function (m) { m.GlobalWorkerOptions.workerSrc = './vendor/pdfjs/pdf.worker.min.mjs'; return m; });
  return PDFJS;
}
function loadDoc(data) {
  return pdfjs().then(function (m) {
    return m.getDocument({ data: data, cMapUrl: './vendor/pdfjs/cmaps/', cMapPacked: true, standardFontDataUrl: './vendor/pdfjs/standard_fonts/', isEvalSupported: false, enableXfa: false }).promise;
  });
}
function openDoc(b) {
  if (!DOCS[b.id]) {
    DOCS[b.id] = dbGet('files', b.id).then(function (f) {
      if (!f || !f.data) throw new Error('nofile');
      return (f.data.arrayBuffer ? f.data.arrayBuffer() : new Response(f.data).arrayBuffer());
    }).then(function (buf) { return loadDoc(new Uint8Array(buf)); });
    DOCS[b.id]['catch'](function () { delete DOCS[b.id]; });
  }
  return DOCS[b.id];
}
function closeDocs() { Object.keys(DOCS).forEach(function (k) { DOCS[k].then(function (d) { try { d.destroy(); } catch (e) {} }, function () {}); delete DOCS[k]; }); }
/* one page as a JPEG (data URL without the prefix), for the AI */
function pageJpeg(doc, n, width, q) {
  return doc.getPage(n).then(function (pg) {
    var v1 = pg.getViewport({ scale: 1 }), sc = (width || 1100) / v1.width, vp = pg.getViewport({ scale: sc });
    var c = document.createElement('canvas'); c.width = Math.round(vp.width); c.height = Math.round(vp.height);
    var x = c.getContext('2d'); x.fillStyle = '#fff'; x.fillRect(0, 0, c.width, c.height);
    return pg.render({ canvasContext: x, viewport: vp }).promise.then(function () { var d = c.toDataURL('image/jpeg', q || 0.72); c.width = c.height = 0; return d.slice(d.indexOf(',') + 1); });
  });
}

/* ---------- shell: render, routing, sheets ---------- */
var VIEWS = {}, ACT = {}, AFTER = [];
var PTITLE = { home: 'الرئيسية', lessons: 'الدروس', read: 'الكتاب', quiz: 'الأسئلة', plan: 'التقويم', books: 'كتبي', lesson: '' };
var TABS = ['home', 'lessons', 'read', 'quiz', 'plan'];
function render(keep) {
  var main = document.getElementById('main'), y = window.scrollY;
  if (route.v !== 'read') readerUnmount();
  boardsUnmount();
  var html = (VIEWS[route.v] || VIEWS.home)();
  main.innerHTML = html;
  var tabFor = route.v === 'lesson' ? 'lessons' : route.v, ti = TABS.indexOf(tabFor);
  Array.prototype.forEach.call(document.querySelectorAll('#tabs .tab'), function (b) { var on = b.getAttribute('data-to') === tabFor; b.classList.toggle('on', on); if (on) b.setAttribute('aria-current', 'page'); else b.removeAttribute('aria-current'); });
  var tin = document.querySelector('#tabs .tabs-in'); tin.style.setProperty('--i', Math.max(0, ti)); tin.classList.toggle('nopill', ti < 0);
  document.getElementById('ptitle').textContent = PTITLE[route.v] || '';
  document.querySelector('header.top').classList.toggle('slim', route.v === 'lesson' || route.v === 'read');
  document.body.classList.toggle('v-read', route.v === 'read');
  topMeta();
  var son = main.querySelector('.subtabs .stab.on');
  if (son) { var sc = son.parentNode, r1 = son.getBoundingClientRect(), r0 = sc.getBoundingClientRect(); if (r1.left < r0.left) sc.scrollLeft -= (r0.left - r1.left + 16); else if (r1.right > r0.right) sc.scrollLeft += (r1.right - r0.right + 16); }
  if (keep) window.scrollTo(0, y);
  AFTER.forEach(function (f) { try { f(); } catch (e) { console.error(e); } });
}
var LAST_LESSON = null; // the lesson last open, its tab and scroll position: «الدروس» and «عُد إلى الدرس» return there
function go(v, extra) {
  if (route.v === 'lesson' && route.k) LAST_LESSON = { k: route.k, tab: route.tab || 'goals', y: window.scrollY };
  route = Object.assign({ v: v }, extra || {});
  render(); if (route.v !== 'read') window.scrollTo(0, 0);
  try { history.replaceState(null, '', '#' + v + (v === 'lesson' && route.k ? '=' + encodeURIComponent(route.k) : '')); } catch (e) {}
}
function backToLesson() {
  var L = LAST_LESSON; if (!L) { go('lessons'); return; }
  var x = lessonByKey(L.k); if (x) S.cur = x.b.id;
  if (document.body.classList.contains('present')) { document.body.classList.remove('present'); wake(false); }
  go('lesson', { k: L.k, tab: L.tab }); var y = L.y || 0; requestAnimationFrame(function () { window.scrollTo(0, y); });
}
ACT['back-lesson'] = backToLesson;
function toast(msg, ms) {
  var el = document.getElementById('toast'); el.textContent = msg; el.hidden = false;
  clearTimeout(toast.t); toast.t = setTimeout(function () { el.hidden = true; }, ms || 2600);
}
function openModal(html, sheet) {
  var m = document.getElementById('modal');
  m.innerHTML = html; m.hidden = false; m.classList.toggle('as-sheet', !!sheet);
  var b = m.querySelector('[data-focus]') || m.querySelector('.btn'); if (b) try { b.focus({ preventScroll: true }); } catch (e) {}
}
function closeModal() { var m = document.getElementById('modal'); if (m.__busy) return; m.hidden = true; m.innerHTML = ''; m.classList.remove('as-sheet'); }
function card(inner, label) { return '<div class="modal-card" role="dialog" aria-modal="true"' + (label ? ' aria-label="' + esc(label) + '"' : '') + '>' + inner + '</div>'; }
function sheet(title, inner) { return '<div class="modal-card sheet" role="dialog" aria-modal="true" aria-label="' + esc(title) + '"><div class="grab" aria-hidden="true"></div><div class="sheet-h"><h2>' + esc(title) + '</h2><button class="link" data-act="modal-close">تم</button></div>' + inner + '</div>'; }
function confirmBox(title, text, yesAct, yesLabel, data, danger) {
  openModal(card('<h2>' + esc(title) + '</h2>' + (text ? '<p class="muted">' + text + '</p>' : '') + '<div class="actions"><button class="btn' + (danger ? ' danger' : '') + '" data-act="' + yesAct + '"' + (data || '') + '>' + esc(yesLabel) + '</button><button class="btn ghost" data-act="modal-close">إلغاء</button></div>'));
}
var TOP_ICONS = {
  update: '<path d="M20 11a8 8 0 0 0-14.3-4.9L4 8"/><path d="M4 3v5h5"/><path d="M4 13a8 8 0 0 0 14.3 4.9L20 16"/><path d="M20 21v-5h-5"/>',
  books: '<path d="M5 4.5h3.5v15H5zM10 4.5h3.5v15H10z"/><path d="m15.4 5.4 3.3-.9 3.6 14.4-3.3.9z"/>',
  gear: '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/>'
};
function topBtn(act, icon, label, on) { return '<button class="icon-btn' + (on ? ' on' : '') + '" data-act="' + act + '" aria-label="' + label + '" title="' + label + '"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + TOP_ICONS[icon] + '</svg></button>'; }
function topMeta() {
  var el = document.getElementById('top-meta');
  el.innerHTML = '<div class="top-btns">' + topBtn('app-update', 'update', 'تحديث التطبيق') + topBtn('go-books', 'books', 'كتبي', route.v === 'books') + topBtn('settings', 'gear', 'الإعدادات') + '</div>';
  var cs = document.getElementById('cstrip'), b = curBook();
  if (!b || route.v === 'lesson' || route.v === 'read' || route.v === 'books') { cs.innerHTML = ''; return; }
  var n = b.lessons.length, ready = b.lessons.filter(function (l) { return aidOf(b, l); }).length;
  cs.innerHTML = '<div class="cs-row"><button class="cs-name cs-book" data-act="pick-book">' + esc(b.title) + (BOOKS.length > 1 ? ' <span aria-hidden="true">▾</span>' : '') + '</button><span class="cs-left">' + (n ? 'مساعد جاهز لـ <b>' + ready + '</b> من ' + n : 'لم تُحدَّد الدروس بعد') + '</span></div>' +
    (n ? '<div class="cs-track"><i style="width:' + pct(ready, n) + '%"></i></div>' : '');
}
function pick(accept, multiple) {
  return new Promise(function (res) {
    var inp = document.createElement('input'); inp.type = 'file'; if (accept) inp.accept = accept; inp.multiple = !!multiple;
    inp.style.cssText = 'position:fixed;top:-200px;left:0;opacity:0';
    document.body.appendChild(inp);
    inp.addEventListener('change', function () { var f = Array.prototype.slice.call(inp.files || []); if (inp.parentNode) inp.parentNode.removeChild(inp); if (f.length) res(f); });
    inp.click();
  });
}
function readBuf(f) { return f.arrayBuffer ? f.arrayBuffer() : new Response(f).arrayBuffer(); }
function saveFile(name, text, type) {
  var file = null;
  try { file = new File([text], name, { type: type || 'application/json' }); } catch (e) {}
  if (file && navigator.canShare && navigator.share) {
    var can = false; try { can = navigator.canShare({ files: [file] }); } catch (e) {}
    if (can) return navigator.share({ files: [file], title: name }).then(function () { return 'shared'; }, function (e) { if (e && e.name === 'AbortError') return 'cancel'; return download(name, text, type); });
  }
  return Promise.resolve(download(name, text, type));
}
function download(name, text, type) {
  var url = URL.createObjectURL(new Blob([text], { type: type || 'application/json' })), a = document.createElement('a');
  a.href = url; a.download = name; document.body.appendChild(a); a.click();
  setTimeout(function () { URL.revokeObjectURL(url); if (a.parentNode) a.parentNode.removeChild(a); }, 4000);
  return 'download';
}
function copyText(t) {
  if (navigator.clipboard && navigator.clipboard.writeText) return navigator.clipboard.writeText(t).then(function () { toast('نُسخ'); }, function () { fallback(); });
  fallback();
  function fallback() { var ta = document.createElement('textarea'); ta.value = t; ta.style.cssText = 'position:fixed;top:-500px'; document.body.appendChild(ta); ta.select(); try { document.execCommand('copy'); toast('نُسخ'); } catch (e) { toast('تعذّر النسخ'); } ta.parentNode.removeChild(ta); }
}
var WAKE = null;
function wake(on) {
  try {
    if (on && !WAKE && navigator.wakeLock) navigator.wakeLock.request('screen').then(function (w) { WAKE = w; }, function () {});
    if (!on && WAKE) { WAKE.release(); WAKE = null; }
  } catch (e) {}
}

/* iPhone/iPad: a two-finger pinch or a double tap could zoom the whole screen, so the bars and sheets slid out of place.
   The book has its own zoom (two fingers on the pages); the screen itself stays at its size. */
['gesturestart', 'gesturechange', 'gestureend'].forEach(function (ev) { document.addEventListener(ev, function (e) { e.preventDefault(); }, { passive: false }); });
(function () {
  var vv = window.visualViewport, t = null; if (!vv) return;
  function unzoom() {
    if (Math.abs(vv.scale - 1) < 0.01 && Math.abs(vv.offsetLeft) < 1) return;
    var m = document.querySelector('meta[name=viewport]'); if (!m) return;
    var c = m.getAttribute('content'); m.setAttribute('content', c.replace(/,?\s*minimum-scale=[\d.]+/, '') + ',minimum-scale=1');
    setTimeout(function () { m.setAttribute('content', c); if (Math.abs(vv.offsetLeft) >= 1) window.scrollTo(0, window.scrollY); }, 60);
  }
  vv.addEventListener('resize', function () { clearTimeout(t); t = setTimeout(unzoom, 250); });
  vv.addEventListener('scroll', function () { clearTimeout(t); t = setTimeout(unzoom, 250); });
})();

/* ---------- the book reader: PDF pages with a writing layer ---------- */
var PEN_C = ['#1B2621', '#C62828', '#1F5FB8', '#1E7B4F'], PEN_N = ['أسود', 'أحمر', 'أزرق', 'أخضر'];
var HL_C = ['#FFD23F', '#6FDB98', '#86B6FF', '#FF9EC4'], HL_N = ['أصفر', 'أخضر', 'أزرق', 'وردي'];
function pLabel(b, n) { var p = printedOf(b, n); return p >= 1 ? String(p) : ''; }
var INK_W = 1000;               // a page is 1000 units wide; strokes are kept in those units
var RD = null;                  // the open reader
function rt() { var o = P.rt || {}; return { tool: o.tool || 'pen', ink: +o.ink || 0, hlc: +o.hlc || 0, finger: !!o.finger, zoom: +o.zoom || 1 }; }
function setRt(k, v) { P.rt = P.rt || {}; P.rt[k] = v; savePref(); }
var RSVG = {
  stk: '<path d="M5 4h14v10l-5 6H5z"/><path d="M14 20v-6h5"/><path d="M8.5 9h7M8.5 12.5h4"/>',
  spark: '<path d="M12 3l1.8 4.7L18.5 9.5l-4.7 1.8L12 16l-1.8-4.7L5.5 9.5l4.7-1.8z"/><path d="M19 15l.8 2.2L22 18l-2.2.8L19 21l-.8-2.2L16 18l2.2-.8z"/>',
  off: '<path d="M8 13V5.5a1.5 1.5 0 0 1 3 0V12"/><path d="M11 11.5V4.5a1.5 1.5 0 0 1 3 0V12"/><path d="M14 11.5V6.5a1.5 1.5 0 0 1 3 0V14c0 4-2.5 7-6.5 7S5 18.5 4 16l-1.2-3a1.5 1.5 0 0 1 2.7-1.3L8 15"/>',
  hl: '<path d="M9 15l-2 5h5l1.5-2.5"/><path d="M13.5 17.5 20 8l-4-3-6.5 9.5z"/>',
  er: '<path d="M7 20h11"/><path d="M5.6 14.6 13.8 6.4a2 2 0 0 1 2.8 0l2.4 2.4a2 2 0 0 1 0 2.8L11 19.6H8.4z"/><path d="m9.5 10.5 5 5"/>',
  undo: '<path d="M9 5 4 10l5 5"/><path d="M4 10h10.5a5.5 5.5 0 0 1 0 11H11"/>',
  clear: '<path d="M4 7h16M10 11v6M14 11v6"/><path d="M6 7l1 13h10l1-13M9 7V4h6v3"/>',
  finger: '<path d="M9 11V5.5a1.5 1.5 0 0 1 3 0V11"/><path d="M12 10.5V9a1.5 1.5 0 0 1 3 0v2"/><path d="M15 11a1.5 1.5 0 0 1 3 0v3c0 4-2.5 7-6.5 7-3 0-4.6-1.6-5.7-3.6L4 14a1.5 1.5 0 0 1 2.6-1.5L9 15"/>',
  minus: '<path d="M6 12h12"/>', plus: '<path d="M12 6v12M6 12h12"/>',
  present: '<rect x="3.5" y="4.5" width="17" height="11" rx="2"/><path d="M12 15.5V20M8 20h8"/>',
  exit: '<path d="M6 6l12 12M18 6 6 18"/>',
  up: '<path d="m6 15 6-6 6 6"/>', down: '<path d="m6 9 6 6 6-6"/>',
  aid: ICONS.spark,
  back: '<path d="M9 6l6 6-6 6"/>'
};
function rIcon(n) { return '<svg viewBox="0 0 24 24" aria-hidden="true">' + RSVG[n] + '</svg>'; }

VIEWS.read = function () {
  var b = curBook();
  if (!b) return noBook();
  if (b.missing) return '<section class="panel welcome"><h1>' + esc(b.title) + '</h1><p class="muted">ملف هذا الكتاب غير موجود على هذا الجهاز (استُعيدت بياناته من نسخة احتياطية). أضف ملف PDF نفسه لتعود إليه كتابتك وشروحه.</p><div class="actions"><button class="btn" data-act="book-attach" data-id="' + b.id + '">أضف ملف الكتاب</button></div></section>';
  var o = rt(), p = route.page ? pdfPage(b, route.page) : (S.last[b.id] || 1);
  route.page = null; route.at = p;
  return '<div class="rd' + (route.present ? ' present' : '') + '" id="rd">' +
    '<div class="rd-head"><button class="rd-title" data-act="rd-goto"><b id="rd-lesson">' + esc(b.title) + '</b><span id="rd-pno">…</span></button>' +
    '<div class="rd-hb">' + clkPill() + (route.back && lessonByKey(route.back) ? '<button class="rd-hbtn rd-back" data-act="back-lesson">' + rIcon('back') + '<span>عُد إلى الدرس</span></button>' : '<button class="rd-hbtn" data-act="rd-aid">' + rIcon('aid') + '<span>مساعد الدرس</span></button>') +
    '<button class="rd-hbtn rd-solve" data-act="rd-solve" aria-label="حلّ أسئلة الصفحة مع Claude">' + rIcon('spark') + '<span>حلّ الأسئلة</span></button>' +
    '<button class="rd-hbtn" data-act="rd-present" aria-label="وضع العرض">' + rIcon(route.present ? 'exit' : 'present') + '<span>' + (route.present ? 'إنهاء العرض' : 'عرض') + '</span></button></div></div>' +
    '<div class="rd-x" id="rd-x"><div class="rd-pages" id="rd-pages" style="--z:' + o.zoom + '"><p class="muted rd-wait">جارٍ فتح الكتاب…</p></div></div>' +
    (route.present ? '<div class="rd-nav"><button data-act="rd-step" data-d="-1" aria-label="الصفحة السابقة">' + rIcon('up') + '</button><button data-act="rd-step" data-d="1" aria-label="الصفحة التالية">' + rIcon('down') + '</button></div>' : '') +
    '<div class="rd-bar" id="rd-bar">' + rdBar() + '</div></div>';
};
function rdBar() {
  var o = rt();
  function b(act, v, icon, label, on) { return '<button type="button" class="rb' + (on ? ' on' : '') + '" data-act="' + act + '"' + (v != null ? ' data-v="' + v + '"' : '') + ' aria-label="' + label + '" title="' + label + '">' + rIcon(icon) + '</button>'; }
  return b('rd-tool', 'off', 'off', 'تصفّح دون كتابة', o.tool === 'off') +
    PEN_C.map(function (c, k) { return '<button type="button" class="rb-ink' + (o.tool === 'pen' && o.ink === k ? ' on' : '') + '" data-act="rd-ink" data-v="' + k + '" aria-label="قلم ' + PEN_N[k] + '" style="--c:' + c + '"></button>'; }).join('') +
    '<button type="button" class="rb rb-hl' + (o.tool === 'hl' ? ' on' : '') + '" data-act="rd-hl" style="--hc:' + HL_C[o.hlc] + '" aria-label="قلم تحديد ' + HL_N[o.hlc] + ' (اضغط مرة ثانية لتغيير اللون)" title="قلم التحديد">' + rIcon('hl') + '</button>' +
    b('rd-tool', 'er', 'er', 'ممحاة', o.tool === 'er') + '<i class="rb-sep"></i>' +
    b('rd-undo', null, 'undo', 'تراجع') + b('rd-clear', null, 'clear', 'امسح كتابة هذه الصفحة') +
    b('rd-stk', null, 'stk', 'لاصقة على هذه الصفحة') +
    b('rd-finger', null, 'finger', o.finger ? 'الكتابة بالإصبع مفعّلة' : 'الكتابة بالإصبع', o.finger) + '<i class="rb-sep"></i>' +
    b('rd-zoom', '-1', 'minus', 'تصغير') + '<span class="rb-z" id="rb-z">' + Math.round(o.zoom * 100) + '%</span>' + b('rd-zoom', '1', 'plus', 'تكبير');
}
function rdBarRefresh() { var el = document.getElementById('rd-bar'); if (el) el.innerHTML = rdBar(); if (RD) RD.host.classList.toggle('rd-finger', rt().finger); }
AFTER.push(function () { if (route.v === 'read' && document.getElementById('rd')) readerMount(); });

function readerUnmount() {
  if (!RD) return;
  RD.dead = true; flushInk();
  if (RD.io) RD.io.disconnect();
  window.removeEventListener('scroll', RD.onScroll); window.removeEventListener('resize', RD.onResize);
  RD.pages.forEach(function (pg) { if (pg.task) try { pg.task.cancel(); } catch (e) {} if (pg.c) { pg.c.width = pg.c.height = 0; } if (pg.ic) { pg.ic.width = pg.ic.height = 0; } });
  document.documentElement.classList.remove('present-snap');
  RD = null;
}
function readerMount() {
  readerUnmount();
  var b = curBook(), host = document.getElementById('rd'), wrap = document.getElementById('rd-pages'), start = route.at || 1;
  var R = RD = { b: b, host: host, wrap: wrap, x: document.getElementById('rd-x'), pages: [], ink: {}, undo: [], cur: start, dirty: {}, saveT: null, zoom: rt().zoom, dead: false };
  host.classList.toggle('rd-finger', rt().finger);
  if (route.present) document.documentElement.classList.add('present-snap');
  openDoc(b).then(function (doc) {
    if (R.dead) return;
    R.doc = doc;
    if (doc.numPages !== b.pages) { b.pages = doc.numPages; saveBook(b); }
    return doc.getPage(Math.min(start, doc.numPages)).then(function (pg) {
      if (R.dead) return;
      var v = pg.getViewport({ scale: 1 }), ratio = v.width / v.height, h = '';
      for (var n = 1; n <= doc.numPages; n++) h += '<div class="pg" data-n="' + n + '" style="aspect-ratio:' + v.width.toFixed(1) + ' / ' + v.height.toFixed(1) + '"><canvas class="pg-c"></canvas><canvas class="pg-i"></canvas><div class="pg-a"></div><div class="stk-l"></div><span class="pg-no">' + pLabel(b, n) + '</span></div>';
      wrap.innerHTML = h;
      R.ratio = ratio;
      Array.prototype.forEach.call(wrap.querySelectorAll('.pg'), function (el) {
        var n = +el.getAttribute('data-n');
        R.pages[n - 1] = { n: n, el: el, c: el.querySelector('.pg-c'), ic: el.querySelector('.pg-i'), a: el.querySelector('.pg-a'), s: el.querySelector('.stk-l'), ratio: ratio, sized: false, done: 0, task: null };
        var P0 = R.pages[n - 1]; hookInk(R, P0); hookAns(R, P0); drawAns(P0); P0.stk = stkCtx(R, P0); stkBind(P0.s, P0.stk); drawStk(P0);
      });
      if (route.present) presentFit(true);
      R.io = new IntersectionObserver(function (es) {
        es.forEach(function (e) { var pg = R.pages[+e.target.getAttribute('data-n') - 1]; pg.vis = e.isIntersecting; if (e.isIntersecting) queueRender(pg); else releasePage(pg); });
      }, { rootMargin: '150% 0px 150% 0px' });
      R.pages.forEach(function (pg) { R.io.observe(pg.el); });
      R.onScroll = function () { if (R.sT) return; R.sT = requestAnimationFrame(function () { R.sT = null; trackPage(R); }); };
      R.onResize = function () { clearTimeout(R.rzT); R.rzT = setTimeout(function () { if (route.present) presentFit(); rerenderAll(); }, 200); };
      window.addEventListener('scroll', R.onScroll, { passive: true });
      window.addEventListener('resize', R.onResize);
      hookPinch(R);
      requestAnimationFrame(function () { scrollToPage(start, true); trackPage(R); });
    });
  })['catch'](function (e) {
    if (R.dead) return;
    wrap.innerHTML = '<section class="panel"><h2>تعذّر فتح الكتاب</h2><p class="muted">' + (e && e.message === 'nofile' ? 'ملف الكتاب غير موجود على هذا الجهاز.' : 'الملف تالف أو لا يمكن قراءته (' + esc((e && (e.message || e.name)) || e) + ').') + '</p></section>';
  });
}
function headH() { var h = document.querySelector('.rd-head'); return h && !route.present ? h.getBoundingClientRect().height + 8 : 0; }
function scrollToPage(n, instant) {
  if (!RD || !RD.pages[n - 1]) return;
  var el = RD.pages[n - 1].el, y = el.getBoundingClientRect().top + window.scrollY - headH();
  if (route.present) y = el.getBoundingClientRect().top + window.scrollY - Math.max(0, (window.innerHeight - el.getBoundingClientRect().height) / 2);
  window.scrollTo({ top: Math.max(0, y), behavior: instant ? 'auto' : 'smooth' });
}
function trackPage(R) {
  if (!R || R.dead || !R.pages.length) return;
  var mid = window.innerHeight * 0.45, best = R.cur, i0 = clamp(R.cur - 4, 1, R.pages.length), i1 = clamp(R.cur + 4, 1, R.pages.length), found = false;
  for (var pass = 0; pass < 2 && !found; pass++) {
    for (var n = i0; n <= i1; n++) { var r = R.pages[n - 1].el.getBoundingClientRect(); if (r.top <= mid && r.bottom >= mid) { best = n; found = true; break; } }
    if (!found) { i0 = 1; i1 = R.pages.length; }
  }
  R.cur = best;
  if (best !== R.lbl || !R.shown) {
    R.lbl = best; R.shown = true;
    S.last[R.b.id] = best; saveState();
    var l = lessonAtPage(R.b, best), t = document.getElementById('rd-lesson'), pn = document.getElementById('rd-pno');
    if (t) t.textContent = l ? l.title : R.b.title;
    if (pn) pn.textContent = (printedOf(R.b, best) >= 1 ? 'ص ' + printedOf(R.b, best) + ' · ' : '') + 'صفحة ' + best + ' من ' + R.pages.length;
  }
}
/* rendering: only pages near the screen keep a bitmap */
function queueRender(pg) { if (!RD || pg.done === RD.zoom * 1000 + (RD.gen || 0)) return; renderPage(pg); }
function renderPage(pg) {
  var R = RD; if (!R || !R.doc) return;
  if (pg.task) { try { pg.task.cancel(); } catch (e) {} pg.task = null; }
  var stamp = R.zoom * 1000 + (R.gen || 0);
  R.doc.getPage(pg.n).then(function (page) {
    if (R.dead || !pg.vis) return;
    var v1 = page.getViewport({ scale: 1 }), ratio = v1.width / v1.height;
    if (Math.abs(ratio - pg.ratio) > 0.01) { pg.ratio = ratio; pg.el.style.aspectRatio = v1.width.toFixed(1) + ' / ' + v1.height.toFixed(1); }
    var cssW = pg.el.clientWidth || 300, dpr = Math.min(window.devicePixelRatio || 1, 2), sc = cssW * dpr / v1.width;
    var maxPx = 7e6; if (v1.width * sc * v1.height * sc > maxPx) sc = Math.sqrt(maxPx / (v1.width * v1.height));
    var vp = page.getViewport({ scale: sc }), off = document.createElement('canvas');
    off.width = Math.round(vp.width); off.height = Math.round(vp.height);
    var task = page.render({ canvasContext: off.getContext('2d'), viewport: vp, background: '#ffffff' });
    pg.task = task;
    return task.promise.then(function () {
      pg.task = null; if (R.dead || !pg.vis) { off.width = off.height = 0; return; }
      pg.c.width = off.width; pg.c.height = off.height; pg.c.getContext('2d').drawImage(off, 0, 0); off.width = off.height = 0;
      pg.done = stamp; pg.el.classList.add('ok');
      sizeInk(pg); if (Math.abs(ratio - (pg.aRatio || 0)) > 0.001) { pg.aRatio = ratio; drawAns(pg); }
    });
  })['catch'](function () {});
}
function releasePage(pg) {
  if (pg.task) { try { pg.task.cancel(); } catch (e) {} pg.task = null; }
  if (pg.done) { pg.c.width = pg.c.height = 0; pg.ic.width = pg.ic.height = 0; pg.done = 0; pg.el.classList.remove('ok'); }
}
function rerenderAll() { if (!RD) return; RD.gen = (RD.gen || 0) + 1; RD.pages.forEach(function (pg) { if (pg.vis) renderPage(pg); }); }

/* writing: strokes per page in IndexedDB (ink store, key bookId:page) */
function inkKey(R, n) { return R.b.id + ':' + n; }
function inkOf(R, n) {
  if (R.ink[n]) return Promise.resolve(R.ink[n]);
  return dbGet('ink', inkKey(R, n)).then(function (d) { R.ink[n] = R.ink[n] || (d && d.s ? d : { s: [] }); return R.ink[n]; }, function () { R.ink[n] = R.ink[n] || { s: [] }; return R.ink[n]; });
}
function saveInk(R, n) { R.dirty[n] = 1; clearTimeout(R.saveT); R.saveT = setTimeout(flushInk, 400); }
function flushInk() {
  var R = RD; if (!R) return; clearTimeout(R.saveT);
  Object.keys(R.dirty).forEach(function (n) {
    var d = R.ink[n]; delete R.dirty[n]; if (!d) return;
    if (d.s.length) dbPut('ink', { k: inkKey(R, n), s: d.s, t: Date.now() }); else dbDel('ink', inkKey(R, n));
  });
}
function sizeInk(pg) {
  var R = RD; if (!R) return;
  var w = pg.el.clientWidth, h = pg.el.clientHeight, dpr = Math.min(window.devicePixelRatio || 1, 2);
  pg.ic.width = Math.round(w * dpr); pg.ic.height = Math.round(h * dpr);
  pg.k = w / INK_W; pg.ic.getContext('2d').setTransform(dpr * pg.k, 0, 0, dpr * pg.k, 0, 0);
  inkOf(R, pg.n).then(function () { drawInk(pg); });
}
function drawInk(pg) {
  var R = RD; if (!R || !pg.ic.width) return; var d = R.ink[pg.n], x = pg.ic.getContext('2d');
  x.save(); x.setTransform(1, 0, 0, 1, 0, 0); x.clearRect(0, 0, pg.ic.width, pg.ic.height); x.restore();
  if (d) d.s.forEach(function (st) { stroke(x, st); });
  if (pg.live) stroke(x, pg.live);
}
function stroke(ctx, st) {
  var p = st.p, n = p.length / 3; if (!n) return;
  ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  if (st.k === 'hl') {
    ctx.save(); ctx.globalAlpha = 0.42; ctx.strokeStyle = HL_C[st.hc || 0]; ctx.lineWidth = st.w || 18; ctx.beginPath(); ctx.moveTo(p[0], p[1]);
    for (var i = 1; i < n; i++) ctx.lineTo(p[i * 3], p[i * 3 + 1]); if (n === 1) ctx.lineTo(p[0] + 0.1, p[1]);
    ctx.stroke(); ctx.restore(); return;
  }
  ctx.strokeStyle = ctx.fillStyle = st.c || PEN_C[0];
  var base = st.w || 3.2;
  if (n === 1) { ctx.beginPath(); ctx.arc(p[0], p[1], base * (0.45 + p[2] / 90) / 2, 0, 7); ctx.fill(); return; }
  for (var j = 1; j < n; j++) {
    ctx.lineWidth = base * (0.45 + (p[j * 3 + 2] + p[j * 3 - 1]) / 180);
    ctx.beginPath(); ctx.moveTo(p[j * 3 - 3], p[j * 3 - 2]); ctx.lineTo(p[j * 3], p[j * 3 + 1]); ctx.stroke();
  }
}
function hookInk(R, pg) {
  var c = pg.ic, cur = null, touch = null;
  function pt(cx, cy, f) { var r = c.getBoundingClientRect(), k = r.width / INK_W; return [Math.round((cx - r.left) / k * 10) / 10, Math.round((cy - r.top) / k * 10) / 10, Math.max(0, Math.min(99, Math.round((f == null ? 0.5 : f) * 100)))]; }
  function begin(q) {
    var o = rt(); if (o.tool === 'off') return false;
    inkOf(R, pg.n);
    cur = o.tool === 'er' ? { er: true, gone: [] } : o.tool === 'hl' ? { k: 'hl', hc: o.hlc, w: 18, p: [] } : { c: PEN_C[o.ink], w: 3.2, p: [] };
    if (!cur.er) pg.live = cur;
    move(q); return true;
  }
  function move(q) {
    if (!cur) return; var d = R.ink[pg.n]; if (!d) return;
    if (cur.er) {
      var hit = false;
      for (var i = d.s.length - 1; i >= 0; i--) { var p = d.s[i].p, rr = d.s[i].k === 'hl' ? 14 : 10; for (var j = 0; j < p.length; j += 3) if (Math.abs(p[j] - q[0]) < rr && Math.abs(p[j + 1] - q[1]) < rr) { cur.gone.push({ i: i, s: d.s[i] }); d.s.splice(i, 1); hit = true; break; } }
      if (hit) drawInk(pg); return;
    }
    var a = cur.p, n = a.length;
    if (n && Math.abs(a[n - 3] - q[0]) + Math.abs(a[n - 2] - q[1]) < 1.2) return;
    if (cur.k === 'hl' && n >= 3) q[1] = a[1] + (q[1] - a[1]) * 0.25; // a highlighter keeps to its line
    a.push(q[0], q[1], q[2]);
    drawInk(pg);
  }
  function end() {
    var s = cur; cur = null; pg.live = null; if (!s) return;
    var d = R.ink[pg.n]; if (!d) return;
    if (s.er) { if (s.gone.length) { R.undo.push({ n: pg.n, a: 'del', items: s.gone.reverse() }); saveInk(R, pg.n); } return; }
    if (!s.p.length) { drawInk(pg); return; }
    d.s.push(s); R.undo.push({ n: pg.n, a: 'add' }); drawInk(pg); saveInk(R, pg.n);
  }
  function wants(t) { return t.touchType === 'stylus' || rt().finger; }
  c.addEventListener('touchstart', function (e) {
    if (touch != null) { e.preventDefault(); return; }
    if (e.touches.length > 1 && cur) { cur = null; pg.live = null; touch = null; drawInk(pg); return; }
    for (var k = 0; k < e.changedTouches.length; k++) {
      var t = e.changedTouches[k]; if (!wants(t) || e.touches.length > 1) continue;
      if (begin(pt(t.clientX, t.clientY, t.touchType === 'stylus' ? t.force : null))) { e.preventDefault(); touch = t.identifier; }
      return;
    }
  }, { passive: false });
  c.addEventListener('touchmove', function (e) {
    if (touch == null) return; e.preventDefault();
    for (var k = 0; k < e.changedTouches.length; k++) { var t = e.changedTouches[k]; if (t.identifier === touch) move(pt(t.clientX, t.clientY, t.touchType === 'stylus' ? t.force : null)); }
  }, { passive: false });
  function tend(e) { for (var k = 0; k < e.changedTouches.length; k++) if (e.changedTouches[k].identifier === touch) { touch = null; end(); } }
  c.addEventListener('touchend', tend); c.addEventListener('touchcancel', tend);
  c.addEventListener('pointerdown', function (e) { if (e.pointerType !== 'mouse' || e.button !== 0) return; if (!begin(pt(e.clientX, e.clientY, 0.5))) return; e.preventDefault(); try { c.setPointerCapture(e.pointerId); } catch (x) {} });
  c.addEventListener('pointermove', function (e) { if (e.pointerType === 'mouse' && cur && touch == null) move(pt(e.clientX, e.clientY, 0.5)); });
  c.addEventListener('pointerup', function (e) { if (e.pointerType === 'mouse' && touch == null) end(); });
}
/* two fingers: zoom the pages around the point between them */
function hookPinch(R) {
  var g = null, el = R.wrap;
  function dist(t) { var a = t[0], b = t[1]; return Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY); }
  function mid(t) { return { x: (t[0].clientX + t[1].clientX) / 2, y: (t[0].clientY + t[1].clientY) / 2 }; }
  el.addEventListener('touchstart', function (e) {
    if (e.touches.length !== 2 || e.touches[0].touchType === 'stylus' || e.touches[1].touchType === 'stylus') return;
    var r = el.getBoundingClientRect(), m = mid(e.touches);
    g = { d0: dist(e.touches), m: m, cx: m.x - r.left, cy: m.y - r.top, s: 1 };
    el.style.transformOrigin = g.cx + 'px ' + g.cy + 'px';
  }, { passive: true });
  el.addEventListener('touchmove', function (e) {
    if (!g || e.touches.length !== 2) return; e.preventDefault();
    var z = R.zoom; g.s = clamp(dist(e.touches) / g.d0, 0.4 / z, 3 / z);
    el.style.transform = 'scale(' + g.s.toFixed(3) + ')';
  }, { passive: false });
  function fin() {
    if (!g) return; var s = g.s, G = g; g = null;
    el.style.transform = ''; el.style.transformOrigin = '';
    if (Math.abs(s - 1) < 0.04) return;
    setZoom(R.zoom * s, G);
  }
  el.addEventListener('touchend', function (e) { if (e.touches.length < 2) fin(); });
  el.addEventListener('touchcancel', fin);
}
function setZoom(z, G) {
  var R = RD; if (!R) return;
  z = clamp(Math.round(z * 100) / 100, 0.4, 3); if (z === R.zoom) return;
  var s = z / R.zoom, r0 = R.wrap.getBoundingClientRect();
  if (!G) { G = { m: { x: window.innerWidth / 2, y: window.innerHeight / 2 } }; G.cx = G.m.x - r0.left; G.cy = G.m.y - r0.top; }
  R.zoom = z; if (!route.present) setRt('zoom', z);
  R.wrap.style.setProperty('--z', z);
  var r1 = R.wrap.getBoundingClientRect();
  var wantL = G.m.x - G.cx * s, wantT = G.m.y - G.cy * s;
  R.x.scrollLeft += (r1.left - wantL);
  window.scrollBy(0, r1.top - wantT);
  var zl = document.getElementById('rb-z'); if (zl) zl.textContent = Math.round(z * 100) + '%';
  rerenderAll(); trackPage(R);
}
function presentFit(noScroll) {
  var R = RD; if (!R) return;
  var w = Math.min(R.x.clientWidth || window.innerWidth, 900), h = window.innerHeight - 12, z = clamp(h * R.ratio / w, 0.3, 1);
  R.zoom = Math.round(z * 100) / 100; R.wrap.style.setProperty('--z', R.zoom); var zl = document.getElementById('rb-z'); if (zl) zl.textContent = Math.round(R.zoom * 100) + '%';
  if (!noScroll) { rerenderAll(); scrollToPage(R.cur, true); }
}
ACT['rd-tool'] = function (el) { var v = el.getAttribute('data-v'); setRt('tool', rt().tool === v && v !== 'off' ? 'pen' : v); rdBarRefresh(); if (v === 'off') toast('القلم متوقف: تتصفح الكتاب دون كتابة'); };
ACT['rd-ink'] = function (el) { setRt('tool', 'pen'); setRt('ink', +el.getAttribute('data-v')); rdBarRefresh(); };
ACT['rd-hl'] = function () { var o = rt(); if (o.tool === 'hl') setRt('hlc', (o.hlc + 1) % HL_C.length); else setRt('tool', 'hl'); rdBarRefresh(); };
ACT['rd-finger'] = function () { setRt('finger', !rt().finger); rdBarRefresh(); toast(rt().finger ? 'تكتب الآن بالإصبع أيضًا؛ مرّر بإصبعين' : 'الكتابة بقلم الآيباد فقط، والإصبع يقلّب الصفحات'); };
ACT['rd-undo'] = function () {
  var R = RD; if (!R) return; var u = R.undo.pop(); if (!u) { toast('لا شيء للتراجع عنه'); return; }
  var d = R.ink[u.n]; if (!d) return;
  if (u.a === 'add') d.s.pop(); else if (u.a === 'del') u.items.slice().reverse().forEach(function (it) { d.s.splice(it.i, 0, it.s); }); else if (u.a === 'clear') d.s = u.s;
  var pg = R.pages[u.n - 1]; if (pg) drawInk(pg); saveInk(R, u.n);
  if (u.n !== R.cur) scrollToPage(u.n);
};
ACT['rd-clear'] = function (el) {
  var R = RD; if (!R) return; var n = R.cur, d = R.ink[n];
  if (!d || !d.s.length) { toast('لا كتابة على هذه الصفحة'); return; }
  if (!el.classList.contains('arm')) { el.classList.add('arm'); toast('اضغط مرة ثانية لمسح كتابة صفحة ' + printedOf(R.b, n)); setTimeout(function () { el.classList.remove('arm'); }, 3000); return; }
  el.classList.remove('arm'); R.undo.push({ n: n, a: 'clear', s: d.s }); d.s = []; drawInk(R.pages[n - 1]); saveInk(R, n); toast('مُسحت الكتابة؛ «تراجع» يعيدها');
};
ACT['rd-zoom'] = function (el) { if (!RD) return; var d = +el.getAttribute('data-v'); setZoom(RD.zoom + d * (RD.zoom >= 1 ? 0.25 : 0.1)); };
ACT['rd-step'] = function (el) { if (!RD) return; var n = clamp(RD.cur + +el.getAttribute('data-d'), 1, RD.pages.length); RD.cur = n; scrollToPage(n, true); trackPage(RD); };
ACT['rd-present'] = function () {
  var on = !route.present, at = RD ? RD.cur : null;
  route = { v: 'read', present: on, at: at, back: route.back }; if (at && RD) S.last[RD.b.id] = at;
  document.body.classList.toggle('present', on); wake(on);
  try { if (on && document.documentElement.requestFullscreen) document.documentElement.requestFullscreen().catch(function () {}); else if (!on && document.fullscreenElement) document.exitFullscreen().catch(function () {}); } catch (e) {}
  render();
};
ACT['rd-aid'] = function () {
  var R = RD; if (!R) return; var l = lessonAtPage(R.b, R.cur);
  if (!l) { toast(R.b.lessons.length ? 'هذه الصفحة خارج الدروس المحددة' : 'حدّد دروس الكتاب أولًا من «الدروس»'); return; }
  if (route.present) { document.body.classList.remove('present'); wake(false); }
  go('lesson', { k: lk(R.b, l), tab: 'goals' });
};
ACT['rd-goto'] = function () {
  var R = RD; if (!R) return; var b = R.b;
  var opts = b.lessons.map(function (l) { return '<option value="' + l.from + '">' + esc(l.title) + ' · ص ' + l.from + '</option>'; }).join('');
  openModal(card('<h2>انتقل إلى صفحة</h2>' +
    '<label class="field"><span>رقم الصفحة في الكتاب</span><input type="number" inputmode="numeric" id="go-p" data-focus value="' + printedOf(b, R.cur) + '"></label>' +
    (opts ? '<label class="field"><span>أو اختر درسًا</span><select id="go-l"><option value="">—</option>' + opts + '</select></label>' : '') +
    '<div class="actions"><button class="btn" data-act="rd-goto-yes">انتقل</button><button class="btn ghost" data-act="modal-close">إلغاء</button></div>' +
    '<details class="small"><summary><b>ضبط ترقيم الصفحات</b></summary><p class="muted" style="margin:6px 0">إن لم يطابق رقمُ الصفحة المعروض رقمَها المطبوع في الكتاب، اكتب الرقم المطبوع على الصفحة المفتوحة الآن (صفحة ' + R.cur + ' في الملف).</p>' +
    '<div class="actions" style="margin-top:0"><input type="number" inputmode="numeric" id="go-fix" class="inp" placeholder="الرقم المطبوع" style="max-width:150px"><button class="btn ghost sm" data-act="rd-fix">اضبط</button></div></details>'));
};
ACT['rd-goto-yes'] = function () {
  var R = RD; if (!R) return; var l = document.getElementById('go-l'), v = l && l.value ? +l.value : +document.getElementById('go-p').value;
  closeModal(); if (!isFinite(v)) return; var n = pdfPage(R.b, v); R.cur = n; scrollToPage(n, true); trackPage(R);
};
ACT['rd-fix'] = function () {
  var R = RD; if (!R) return; var v = +document.getElementById('go-fix').value; if (!isFinite(v) || !document.getElementById('go-fix').value) return;
  R.b.offset = R.cur - v; saveBook(R.b); closeModal(); toast('ضُبط الترقيم: الصفحة ' + R.cur + ' في الملف = ص ' + v + ' في الكتاب');
  Array.prototype.forEach.call(R.wrap.querySelectorAll('.pg'), function (el) { el.querySelector('.pg-no').textContent = pLabel(R.b, +el.getAttribute('data-n')); });
  R.shown = false; trackPage(R);
};
document.addEventListener('keydown', function (e) {
  if (!RD || route.v !== 'read' || /input|textarea|select/i.test((e.target && e.target.tagName) || '')) return;
  if (e.key === 'ArrowDown' || e.key === 'PageDown' || e.key === 'ArrowLeft') { e.preventDefault(); RD.cur = clamp(RD.cur + 1, 1, RD.pages.length); scrollToPage(RD.cur); }
  else if (e.key === 'ArrowUp' || e.key === 'PageUp' || e.key === 'ArrowRight') { e.preventDefault(); RD.cur = clamp(RD.cur - 1, 1, RD.pages.length); scrollToPage(RD.cur); }
  else if (e.key === 'Escape' && route.present) ACT['rd-present']();
});
document.addEventListener('visibilitychange', function () { if (document.hidden) { flushInk(); saveState(true); } });
window.addEventListener('pagehide', function () { flushInk(); saveState(true); });

/* ---------- lesson helpers: checking what comes from a file or from the AI ---------- */
var IDRE = /^[A-Za-z0-9_-]{1,48}$/;
var SVG_OK = {}; 'svg g rect circle ellipse path polygon polyline line text tspan defs marker lineargradient radialgradient stop clippath title desc'.split(' ').forEach(function (k) { SVG_OK[k] = 1; });
function cleanSvg(src) {
  if (typeof src !== 'string' || src.length > 120000) return '';
  var doc; try { doc = new DOMParser().parseFromString(src.trim(), 'image/svg+xml'); } catch (e) { return ''; }
  var root = doc && doc.documentElement;
  if (!root || root.localName !== 'svg' || doc.getElementsByTagName('parsererror').length) return '';
  var bad = false;
  (function walk(el) {
    if (bad) return;
    if (!SVG_OK[String(el.localName).toLowerCase()] || el.namespaceURI !== 'http://www.w3.org/2000/svg') { el.parentNode && el !== root ? el.parentNode.removeChild(el) : (bad = true); return; }
    Array.prototype.slice.call(el.attributes).forEach(function (a) {
      var n = a.name.toLowerCase(), v = a.value;
      if (/^on/.test(n) || n === 'style' || /javascript:|data:|expression\(/i.test(v) || (/href$/.test(n) && v.charAt(0) !== '#') || (/url\(/i.test(v) && !/^\s*url\(#[\w-]+\)\s*$/.test(v))) el.removeAttribute(a.name);
    });
    Array.prototype.slice.call(el.childNodes).forEach(function (c) { if (c.nodeType === 1) walk(c); else if (c.nodeType !== 3) el.removeChild(c); });
  })(root);
  if (bad) return '';
  if (!root.getAttribute('viewBox')) { var w = parseFloat(root.getAttribute('width')) || 600, h = parseFloat(root.getAttribute('height')) || 400; root.setAttribute('viewBox', '0 0 ' + w + ' ' + h); }
  root.removeAttribute('width'); root.removeAttribute('height');
  return new XMLSerializer().serializeToString(root);
}
function arr(x) { return Array.isArray(x) ? x : []; }
function str(x) { return x == null ? '' : String(x).slice(0, 4000); }
var IMG_RE = /^data:image\/(webp|png|jpeg);base64,[A-Za-z0-9+\/=]+$/;
function cleanFig(f) {
  if (!f || typeof f !== 'object') return null;
  if (typeof f.img === 'string') { if (f.img.length > 3000000 || !IMG_RE.test(f.img)) return null; return { img: f.img, cap: str(f.cap) }; }
  var v = cleanSvg(f.svg); return v ? { svg: v, cap: str(f.cap) } : null;
}
function cleanTb(t) { if (!t || typeof t !== 'object') return null; return { t: str(t.t), hd: arr(t.hd).map(str), r: arr(t.r).map(function (r) { return arr(r).map(str); }) }; }
var BOXES = { ex: 1, pit: 1, note: 1, key: 1, q: 1, life: 1 };
function jsonish(b) { // the AI sometimes writes a block as a JSON string: {"h":"…"}
  if (typeof b !== 'string') return b; var t = b.trim();
  if (t.charAt(0) === '{' && t.charAt(t.length - 1) === '}') { try { var o = JSON.parse(t); if (o && typeof o === 'object') return o; } catch (e) {} }
  return b;
}
function cleanBlocks(bs, depth) {
  return arr(bs).map(function (b) {
    b = jsonish(b);
    if (typeof b === 'string') return b;
    if (!b || typeof b !== 'object') return null;
    if (b.h != null) return { h: str(b.h) };
    if (b.ul) return { ul: arr(b.ul).map(str) };
    if (b.ol) return { ol: arr(b.ol).map(str) };
    if (b.fig) { var f = cleanFig(b.fig); return f ? { fig: f } : null; }
    if (b.box && (depth || 0) < 3) return { box: { k: BOXES[b.box.k] ? b.box.k : 'note', h: str(b.box.h), b: cleanBlocks(b.box.b, (depth || 0) + 1) } };
    if (b.tb) { var t = cleanTb(b.tb); return t ? { tb: t } : null; }
    return null;
  }).filter(function (x) { return x !== null; });
}
function cleanNode(n, d) { if (!n || typeof n !== 'object' || d > 5) return null; return { t: str(n.t), l: n.l ? str(n.l) : '', c: arr(n.c).map(function (x) { return cleanNode(x, d + 1); }).filter(Boolean).slice(0, 12) }; }
function cleanMap(m) { if (!m || typeof m !== 'object') return null; if (m.fig) { var f = cleanFig(m.fig); return f ? { t: str(m.t), fig: f } : null; } var r = cleanNode(m.r, 0); return r ? { t: str(m.t), r: r } : null; }
function cleanAid(o) {
  if (!o || typeof o !== 'object') throw new Error('format');
  var q = o.quiz && typeof o.quiz === 'object' ? o.quiz : {};
  var a = {
    idea: str(o.idea), intro: str(o.intro), prior: arr(o.prior).map(str),
    goals: arr(o.goals).map(str).filter(Boolean),
    vocab: arr(o.vocab).map(function (v) { return v && typeof v === 'object' ? { t: str(v.t), d: str(v.d) } : null; }).filter(function (v) { return v && v.t; }),
    figs: arr(o.figs).map(cleanFig).filter(Boolean).slice(0, 8),
    exp: arr(o.exp).map(function (x) { return x && typeof x === 'object' ? { h: str(x.h), page: +x.page || 0, body: cleanBlocks(x.body), fig: typeof x.fig === 'number' ? x.fig : -1 } : null; }).filter(Boolean),
    maps: arr(o.maps).map(cleanMap).filter(Boolean).slice(0, 4),
    mis: arr(o.mis).map(str).filter(Boolean), life: arr(o.life).map(str).filter(Boolean),
    sum: arr(o.sum).map(str).filter(Boolean), hw: arr(o.hw).map(str).filter(Boolean),
    acts: arr(o.acts).map(function (x) { return x && typeof x === 'object' ? { t: str(x.t), d: str(x.d), mins: +x.mins || 0 } : null; }).filter(function (x) { return x && x.t; }),
    quiz: {
      mcq: arr(q.mcq).filter(function (x) { return x && Array.isArray(x.o) && x.o.length === 4 && [0, 1, 2, 3].indexOf(+x.a) >= 0; }).map(function (x) { return { q: str(x.q), o: x.o.map(str), a: +x.a, e: str(x.e), lv: str(x.lv) }; }),
      tf: arr(q.tf).filter(function (x) { return x && typeof x.a === 'boolean'; }).map(function (x) { return { q: str(x.q), a: x.a, e: str(x.e) }; }),
      short: arr(q.short).filter(function (x) { return x && x.q; }).map(function (x) { return { q: str(x.q), a: str(x.a) }; })
    }
  };
  a.figs.forEach(function (f, k) { f.n = k; });
  a.exp.forEach(function (x) { if (x.fig < 0 || x.fig >= a.figs.length) x.fig = -1; });
  if (!a.goals.length && !a.exp.length && !a.quiz.mcq.length && !a.sum.length) throw new Error('empty');
  return a;
}
function hasAid(o) { return !!(o && (o.goals || o.exp || o.quiz || o.sum || o.idea)); }
function aidCounts(a) { return { q: a.quiz.mcq.length + a.quiz.tf.length + a.quiz.short.length, f: a.figs.length, m: a.maps.length }; }
function storeAid(b, l, d, src, extra) {
  var rec = Object.assign({ k: lk(b, l), src: src, at: Date.now(), d: d }, extra || {});
  AIDS[rec.k] = rec; return dbPut('aids', rec);
}

/* ---------- rendering pieces (same look as إتقان) ---------- */
function figure(f, zoomable) {
  if (!f) return '';
  if (f.img) return '<figure class="fig img"><img data-act="zoom" src="' + f.img + '" alt="' + esc(plain(f.cap || '')) + '" loading="lazy" decoding="async">' + (f.cap ? '<figcaption>' + fx(f.cap) + '</figcaption>' : '') + '</figure>';
  return '<figure class="fig' + (zoomable ? ' zf' : '') + '"' + (zoomable ? ' data-act="fig-zoom"' : '') + '>' + (f.svg || '') + (f.cap ? '<figcaption>' + fx(f.cap) + '</figcaption>' : '') + '</figure>';
}
var BOXK = { ex: ['green', 'مثال', 'bulb'], pit: ['amber', 'انتبه', 'warn'], note: ['blue', 'ملاحظة', 'clip'], key: ['violet', 'تذكّر', 'star'], q: ['rose', 'سؤال للطلاب', 'q'], life: ['teal', 'من حياتنا', 'leaf'] };
ICONS.clip = '<rect x="5" y="4.5" width="14" height="16" rx="2.5"/><path d="M9 4.5v-1h6v1M8.5 10h7M8.5 14h5"/>';
function boxHtml(k, h, inner) { var K = BOXK[k] || BOXK.note; return '<div class="x-box kb kb-' + (BOXK[k] ? k : 'note') + ' hue-' + K[0] + '"><b class="kb-h">' + svgI(K[2]) + (h ? fx(h) : K[1]) + '</b>' + inner + '</div>'; }
function blocks(bs) {
  return (bs || []).map(function (b) {
    b = jsonish(b);
    if (typeof b === 'string') return '<p>' + fx(b) + '</p>';
    if (b.h) return '<h4 class="x-h">' + fx(b.h) + '</h4>';
    if (b.ul) return '<ul class="x-ul">' + b.ul.map(function (x) { return '<li>' + fx(x) + '</li>'; }).join('') + '</ul>';
    if (b.ol) return '<ol class="x-steps">' + b.ol.map(function (x) { return '<li>' + fx(x) + '</li>'; }).join('') + '</ol>';
    if (b.fig) return figure(b.fig, true);
    if (b.box) return boxHtml(b.box.k, b.box.h, blocks(b.box.b));
    if (b.tb) return table(b.tb);
    return '';
  }).join('');
}
function table(tb) {
  return '<div class="tbl-wrap">' + (tb.t ? '<p class="tbl-t">' + fx(tb.t) + '</p>' : '') + '<table><thead><tr>' + (tb.hd || []).map(function (x) { return '<th>' + fx(x) + '</th>'; }).join('') +
    '</tr></thead><tbody>' + (tb.r || []).map(function (r) { return '<tr>' + r.map(function (c) { return '<td>' + fx(c) + '</td>'; }).join('') + '</tr>'; }).join('') + '</tbody></table></div>';
}
function mapKids(c) {
  if (!c || !c.length) return '';
  return '<ul class="cm-kids">' + c.map(function (n) { return '<li>' + (n.l ? '<span class="cm-l">' + fx(n.l) + '</span>' : '') + '<span class="cm-n" data-act="cm-reveal">' + fx(n.t) + '</span>' + mapKids(n.c) + '</li>'; }).join('') + '</ul>';
}
var MAPQ = {};
function mapHtml(m, key) {
  if (m.fig) return '<section class="cmap"><div class="cm-top"><h3>' + fx(m.t) + '</h3></div>' + figure(m.fig, true) + '</section>';
  var on = !!MAPQ[key];
  return '<section class="cmap' + (on ? ' quiz' : '') + '"><div class="cm-top"><h3>' + fx(m.t) + '</h3>' + (key ? '<button class="btn ghost sm" data-act="map-quiz" data-key="' + esc(key) + '">' + (on ? 'أظهر كل الفروع' : 'أخفِ الفروع') + '</button>' : '') + '</div>' +
    '<div class="cm-root">' + fx(m.r.t) + '</div>' + (m.r.c && m.r.c.length ? '<div class="cm-stem"></div><div class="cm-grid">' + m.r.c.map(function (br) {
      return '<div class="cm-b">' + (br.l ? '<span class="cm-l">' + fx(br.l) + '</span>' : '') + '<span class="cm-n lv1" data-act="cm-reveal">' + fx(br.t) + '</span>' + mapKids(br.c) + '</div>';
    }).join('') + '</div>' : '') + '</section>';
}
ACT['map-quiz'] = function (el) { var k = el.getAttribute('data-key'); MAPQ[k] = !MAPQ[k]; render(true); };
ACT['cm-reveal'] = function (el) { var m = el.closest('.cmap'); if (m && m.classList.contains('quiz')) el.classList.toggle('shown'); };
ACT['fig-zoom'] = function (el) { var s = el.querySelector('svg'); if (!s) return; openZoom(s.outerHTML, el.querySelector('figcaption') ? el.querySelector('figcaption').innerHTML : ''); };
ACT['zoom'] = function (el) { openZoom('<img src="' + el.getAttribute('src') + '" alt="">', ''); };
function openZoom(inner, cap) {
  var pv = document.getElementById('pv');
  pv.innerHTML = '<div class="zoom-in"><button class="pv-x" data-act="pv-close" aria-label="إغلاق">✕</button><div class="zoom-body">' + inner + '</div>' + (cap ? '<p class="zoom-cap">' + cap + '</p>' : '') + '</div>';
  pv.hidden = false; pv.classList.add('zoom');
}

/* ---------- no book yet ---------- */
function noBook() {
  return '<section class="panel welcome"><div class="logo">' + svgI('book') + '</div><h1>كتابي</h1>' +
    '<p>أضف كتاب العلوم بصيغة PDF: تقرؤه وتشرح عليه بقلم الآيباد، ولكل درس أهدافه وشرحه ورسومه وخريطة مفاهيمه وأسئلة تقويمه، وتوزيع الدروس على أسابيع الفصل.</p>' +
    '<p class="muted">يُحفظ الكتاب وكل ما تكتبه على هذا الجهاز فقط، ولا يُرفع إلى أي مكان.</p>' +
    (STANDALONE ? '' : '<p class="hint">' + INSTALL + '</p>') +
    '<div class="actions"><button class="btn" data-act="book-add">أضف كتاب العلوم (PDF)</button></div>' +
    '<ol class="steps small muted"><li>اختر ملف الكتاب من تطبيق «الملفات».</li><li>حدّد دروسه: من فهرس الملف، أو يقرأ الذكاء الاصطناعي الفهرس، أو تكتبها بنفسك، أو من ملف دروس جاهز.</li><li>جهّز مساعد كل درس بضغطة، واكتب على صفحات الكتاب بالقلم.</li></ol></section>';
}

/* ---------- lessons list ---------- */
VIEWS.lessons = function () {
  var b = curBook(); if (!b) return noBook();
  var h = '<div class="page-head"><h1>الدروس</h1></div>';
  if (!b.lessons.length) return h + setupPanel(b);
  var n = b.lessons.length, ready = b.lessons.filter(function (l) { return aidOf(b, l); }).length, cls = P.classes;
  h += '<section class="panel"><div class="tiles">' + tile(n, cntWord(n, WORDS.lesson), 'teal', 'book') + tile(ready, 'مساعد جاهز', 'violet', 'spark') + tile(b.lessons.reduce(function (s, l) { var a = aidOf(b, l); return s + (a ? aidCounts(a.d).q : 0); }, 0), 'سؤال تقويم', 'amber', 'q') +
    tile(cls.length ? b.lessons.filter(function (l) { return taughtN(b, l) === cls.length; }).length : 0, cls.length ? 'درس شُرح في كل فصولك' : 'أضف فصولك من الإعدادات', 'green', 'people') + '</div>' +
    '<div class="actions">' + (ready < n ? '<button class="btn" data-act="gen-all">' + svgI('spark') + 'جهّز مساعد ' + (ready ? 'الدروس الباقية (' + (n - ready) + ')' : 'كل الدروس') + '</button>' : '') +
    '<button class="btn ghost" data-act="pack-add">أضف ملف دروس</button><button class="btn ghost" data-act="lessons-edit">عدّل قائمة الدروس</button></div></section>';
  h += '<label class="search"><span class="sr">بحث</span><input id="l-search" type="search" placeholder="ابحث عن درس أو مصطلح" value="' + esc(route.q || '') + '" autocomplete="off"></label><div id="l-results">' + lessonsBody(b, route.q || '') + '</div>';
  return h;
};
function tile(n, l, hue, icon) { return '<div class="tile' + (hue ? ' hue-' + hue : '') + '">' + (icon ? '<span class="tile-ic" aria-hidden="true">' + svgI(icon) + '</span>' : '') + '<span class="tile-n">' + num(n) + '</span><span class="tile-l">' + l + '</span></div>'; }
function taughtN(b, l) { var t = S.taught[lk(b, l)] || {}; return P.classes.filter(function (c) { return t[c]; }).length; }
function lessonRow(b, l, k, hue) {
  var a = aidOf(b, l), tn = taughtN(b, l), cl = P.classes.length;
  return '<button class="urow" data-act="lesson" data-k="' + esc(lk(b, l)) + '">' + ico(null, hue, k + 1) + '<span><span class="u-title">' + esc(l.title) + '</span><span class="u-std">' + (l.chap ? esc(l.chap) + ' · ' : '') + 'ص ' + rng(l.from, l.to) + '</span></span>' +
    '<span class="u-side">' + (a ? '<span class="mchip ok"><i></i>جاهز</span>' : '<span class="mchip"><i></i>لم يُجهّز</span>') + (cl ? '<span class="small muted">' + (tn ? 'شُرح ' + tn + '/' + cl : '') + '</span>' : '') + '</span></button>';
}
function lessonsBody(b, q) {
  q = norm(q).trim();
  if (q.length >= 2) {
    var hits = b.lessons.filter(function (l) { var a = aidOf(b, l); return norm(l.title + ' ' + (l.unit || '') + ' ' + (l.chap || '')).indexOf(q) >= 0 || (a && norm(JSON.stringify([a.d.vocab, a.d.goals, a.d.sum, a.d.idea])).indexOf(q) >= 0); });
    return hits.length ? '<div class="ulist">' + hits.map(function (l) { return lessonRow(b, l, b.lessons.indexOf(l), 'teal'); }).join('') + '</div>' : '<p class="muted">لا نتائج.</p>';
  }
  var k = 0;
  return units(b).map(function (u, ui) {
    var hue = unitHue(ui);
    return '<section class="group"><div class="g-head"><h2 class="hh">' + ico('book', hue) + esc(u.name) + '</h2></div><div class="ulist">' + u.lessons.map(function (l) { return lessonRow(b, l, k++, hue); }).join('') + '</div></section>';
  }).join('');
}
document.addEventListener('input', function (e) {
  if (e.target.id === 'l-search') { route.q = e.target.value; var r = document.getElementById('l-results'), b = curBook(); if (r && b) r.innerHTML = lessonsBody(b, route.q); }
  else if (e.target.id === 'my-note') { var k = e.target.getAttribute('data-k'); if (e.target.value.trim()) S.notes[k] = e.target.value; else delete S.notes[k]; saveState(); }
});
function setupPanel(b) {
  var ai = !!P.ai.key;
  return '<section class="panel"><h2 class="hh">' + ico('book', 'teal') + 'حدّد دروس «' + esc(b.title) + '»</h2><p class="muted">يحتاج التطبيق أن يعرف كل درس وصفحاته في الكتاب، ثم يجهّز لكل درس مساعده. اختر طريقة:</p>' +
    '<div class="setup">' +
    '<button class="setup-o" data-act="toc-outline"><b>من فهرس الملف</b><span class="small muted">إن كان ملف PDF يحوي فهرسًا (إشارات مرجعية)</span></button>' +
    '<button class="setup-o" data-act="toc-ai"><b>يقرأ الذكاء الاصطناعي فهرس الكتاب</b><span class="small muted">' + (ai ? 'تحدد صفحات الفهرس فيستخرج الوحدات والدروس وصفحاتها' : 'يحتاج مفتاح API من الإعدادات') + '</span></button>' +
    '<button class="setup-o" data-act="pack-add"><b>من ملف دروس جاهز</b><span class="small muted">ملف JSON أو PDF أعدّه لك Claude أو زميل، فيه الدروس ومساعدها</span></button>' +
    '<button class="setup-o" data-act="lessons-edit"><b>أكتبها بنفسي</b><span class="small muted">اسم كل درس وصفحة بدايته ونهايته</span></button></div></section>';
}

/* ---------- editing the list of lessons ---------- */
function editRow(l) {
  return '<div class="ed-row" data-id="' + esc(l.id || '') + '"><input class="inp ed-u" placeholder="الوحدة / الفصل" value="' + esc(l.unit || '') + '"><input class="inp ed-t" placeholder="عنوان الدرس" value="' + esc(l.title || '') + '">' +
    '<input class="inp ed-f" type="number" inputmode="numeric" placeholder="من ص" value="' + (l.from || '') + '"><input class="inp ed-e" type="number" inputmode="numeric" placeholder="إلى ص" value="' + (l.to || '') + '"><button class="nb-b" data-act="ed-del" aria-label="احذف الدرس">✕</button></div>';
}
ACT['lessons-edit'] = function () {
  var b = curBook(); if (!b) return;
  var rows = b.lessons.length ? b.lessons : [{}];
  openModal(sheet('قائمة الدروس', '<p class="small muted">لكل درس: الوحدة (أو الفصل)، والعنوان، ورقم صفحة بدايته ونهايته كما هو مطبوع في الكتاب. الدروس المتتالية في الوحدة نفسها تُجمع تحتها.</p>' +
    '<div class="ed-head small muted"><span>الوحدة</span><span>الدرس</span><span>من</span><span>إلى</span><span></span></div><div id="ed-list">' + rows.map(editRow).join('') + '</div>' +
    '<div class="actions"><button class="btn ghost sm" data-act="ed-add">' + svgI('plus') + 'درس جديد</button></div>' +
    '<div class="actions"><button class="btn" data-act="ed-save">احفظ الدروس</button></div>'), true);
};
ACT['ed-add'] = function () { var list = document.getElementById('ed-list'), last = list.lastElementChild, u = last ? last.querySelector('.ed-u').value : '', e = last ? +last.querySelector('.ed-e').value : 0; list.insertAdjacentHTML('beforeend', editRow({ unit: u, from: e ? e + 1 : '' })); list.lastElementChild.querySelector('.ed-t').focus(); };
ACT['ed-del'] = function (el) { el.closest('.ed-row').remove(); };
ACT['ed-save'] = function () {
  var b = curBook(), out = [], bad = 0, old = {};
  b.lessons.forEach(function (l) { old[l.id] = l; });
  Array.prototype.forEach.call(document.querySelectorAll('#ed-list .ed-row'), function (r) {
    var t = r.querySelector('.ed-t').value.trim(), f = +r.querySelector('.ed-f').value, e = +r.querySelector('.ed-e').value, id = r.getAttribute('data-id');
    if (!t && !f) return; if (!t || !f) { bad++; return; }
    var l = Object.assign({}, old[id] || {}, { id: id || uid('l'), unit: r.querySelector('.ed-u').value.trim(), title: t, from: f, to: e >= f ? e : f });
    out.push(l);
  });
  fillTo(out, b);
  b.lessons = out; saveBook(b); closeModal(); render();
  toast(bad ? 'حُفظت الدروس، وتُرك ' + bad + ' سطر ناقص (يحتاج عنوانًا وصفحة بداية)' : 'حُفظت ' + cnt(out.length, WORDS.lesson));
};
function fillTo(list, b) { // a lesson without an end runs to the page before the next one
  list.forEach(function (l, k) { var nx = list[k + 1]; if (!l.to || l.to < l.from) l.to = nx && nx.from > l.from ? nx.from - 1 : Math.max(l.from, Math.min(l.from + 8, printedOf(b, b.pages || l.from))); });
}

/* from the PDF's own bookmarks */
ACT['toc-outline'] = function () {
  var b = curBook();
  openModal(card('<h2>جارٍ قراءة فهرس الملف…</h2>'));
  openDoc(b).then(function (doc) {
    return doc.getOutline().then(function (ol) {
      if (!ol || !ol.length) throw new Error('none');
      var leaves = [];
      function walk(items, path) { return items.reduce(function (p, it) { return p.then(function () { var np = path.concat([it.title]); if (it.items && it.items.length) return walk(it.items, np); return destPage(doc, it.dest).then(function (pg) { if (pg) leaves.push({ path: np, page: pg }); }); }); }, Promise.resolve()); }
      return walk(ol, []).then(function () {
        if (!leaves.length) throw new Error('none');
        var list = leaves.map(function (x) { return { id: uid('l'), unit: x.path.length > 1 ? x.path[0] : '', chap: x.path.length > 2 ? x.path[x.path.length - 2] : '', title: x.path[x.path.length - 1], from: printedOf(b, x.page) }; });
        list.sort(function (a, c) { return a.from - c.from; });
        fillTo(list, b); b.lessons = list; saveBook(b); closeModal(); render();
        toast('استُخرج ' + cnt(list.length, WORDS.lesson) + ' من فهرس الملف؛ راجعها من «عدّل قائمة الدروس»', 4000);
      });
    });
  })['catch'](function (e) { openModal(card('<h2>لا يحوي الملف فهرسًا</h2><p class="muted">' + (e && e.message === 'none' ? 'ملف الكتاب بلا إشارات مرجعية. استعمل قراءة الفهرس بالذكاء الاصطناعي، أو اكتب الدروس بنفسك.' : 'تعذّرت قراءة الملف.') + '</p><div class="actions"><button class="btn" data-act="modal-close">حسنًا</button></div>')); });
};
function destPage(doc, dest) {
  return Promise.resolve(typeof dest === 'string' ? doc.getDestination(dest) : dest).then(function (d) {
    if (!d || !d[0]) return 0; if (typeof d[0] === 'number') return d[0] + 1;
    return doc.getPageIndex(d[0]).then(function (i) { return i + 1; });
  })['catch'](function () { return 0; });
}

/* ---------- one lesson ---------- */
var LTABS = [['goals', 'الأهداف'], ['exp', 'الشرح'], ['figs', 'الرسوم'], ['map', 'خريطة المفاهيم'], ['eval', 'التقويم'], ['lab', 'المختبر'], ['sum', 'الملخص والأنشطة'], ['notes', 'ملاحظاتي']];
VIEWS.lesson = function () {
  var x = lessonByKey(route.k || ''); if (!x) { route = { v: 'lessons' }; return VIEWS.lessons(); }
  var b = x.b, l = x.l, a = aidOf(b, l), k = lk(b, l), idx = b.lessons.indexOf(l);
  var prev = b.lessons[idx - 1], next = b.lessons[idx + 1];
  var h = '<div class="upage hue-' + unitHue(Math.max(0, units(b).map(function (u) { return u.name; }).indexOf(l.unit || 'الدروس'))) + '"><nav class="crumbs" aria-label="المسار"><button class="link" data-act="go" data-to="lessons">الدروس</button><span aria-hidden="true">›</span><span>' + esc(l.unit || b.title) + '</span></nav>' +
    '<header class="u-head"><div><h1>' + esc(l.title) + '</h1>' + (l.chap ? '<p class="std">' + esc(l.chap) + '</p>' : '') +
    '<p class="muted small">ص ' + rng(l.from, l.to) + ' · ' + cnt(l.to - l.from + 1, WORDS.page) + '</p>' +
    '<div class="actions l-acts"><button class="btn" data-act="open-pages" data-k="' + esc(k) + '">' + svgI('book') + 'افتح صفحات الدرس</button>' +
    (a ? '<button class="btn ghost tint hue-violet" data-act="pv-open" data-k="' + esc(k) + '">' + rIcon('present') + 'اعرضه على الطلاب</button>' : '') + clkPill() + '</div></div></header>';
  if (P.classes.length) h += taughtBar(b, l);
  if (!a) h += genPanel(b, l);
  else {
    var tab = route.tab || 'goals';
    h += '<div class="subtabs" role="tablist">' + LTABS.map(function (t) { return '<button role="tab" aria-selected="' + (tab === t[0]) + '" class="stab' + (tab === t[0] ? ' on' : '') + '" data-act="ltab" data-tab="' + t[0] + '">' + t[1] + (t[0] === 'eval' ? ' (' + aidCounts(a.d).q + ')' : t[0] === 'lab' && labsOf(b, l).length ? ' (' + labsOf(b, l).length + ')' : '') + '</button>'; }).join('') + '</div>';
    h += '<div class="l-body">' + (L_TAB[tab] || L_TAB.goals)(a.d, b, l) + '</div>';
  }
  h += '<div class="l-nav">' + (prev ? '<button class="btn ghost sm" data-act="lesson" data-k="' + esc(lk(b, prev)) + '">→ ' + esc(prev.title) + '</button>' : '<span></span>') + (next ? '<button class="btn ghost sm" data-act="lesson" data-k="' + esc(lk(b, next)) + '">' + esc(next.title) + ' ←</button>' : '<span></span>') + '</div>';
  if (a) h += '<details class="l-more"><summary class="small muted">عن مساعد هذا الدرس</summary><p class="small muted">' + (a.src === 'ai' ? 'أعدّه ' + esc(a.model || 'الذكاء الاصطناعي') + ' من صفحات الدرس ' + relDay(a.at) + '. راجع دقته قبل عرضه على الطلاب.' : 'من ملف دروس أُضيف ' + relDay(a.at) + '.') + '</p>' +
    '<div class="actions"><button class="btn ghost sm" data-act="gen-one" data-k="' + esc(k) + '">' + svgI('spark') + 'أعد تجهيزه بالذكاء</button><button class="btn ghost sm danger" data-act="aid-del" data-k="' + esc(k) + '">احذف المساعد</button></div></details>';
  return h + '</div>';
};
function taughtBar(b, l) {
  var t = S.taught[lk(b, l)] || {};
  return '<div class="taught"><span class="small muted">شُرح في:</span>' + P.classes.map(function (c) { var d = t[c]; return '<button class="tchip' + (d ? ' on' : '') + '" data-act="taught" data-k="' + esc(lk(b, l)) + '" data-c="' + esc(c) + '" aria-pressed="' + !!d + '">' + (d ? '✓ ' : '') + esc(c) + (d ? '<small>' + esc(dmShort(parseISO(d))) + '</small>' : '') + '</button>'; }).join('') + '</div>';
}
ACT.taught = function (el) {
  var k = el.getAttribute('data-k'), c = el.getAttribute('data-c'), t = S.taught[k] = S.taught[k] || {};
  if (t[c]) delete t[c]; else t[c] = isoOf(today());
  if (!Object.keys(t).length) delete S.taught[k];
  saveState(); render(true);
};
function genPanel(b, l) {
  var ai = !!P.ai.key, np = Math.min(l.to - l.from + 1, MAX_PAGES);
  return '<section class="panel gen"><h2 class="hh">' + ico('spark', 'violet') + 'جهّز مساعد هذا الدرس</h2>' +
    '<p class="muted">يقرأ الذكاء الاصطناعي صفحات الدرس (' + cnt(np, WORDS.page) + ') ويكتب: الأهداف والمفردات والفكرة الرئيسة، وشرحًا مرتبًا بفقراته ورسومًا توضيحية، وخريطة مفاهيم، وأسئلة تقويم بإجاباتها، وملخصًا وأنشطة وربطًا بالحياة.</p>' +
    (ai ? '<label class="field"><span>توجيه إضافي (اختياري)</span><input type="text" id="gen-extra" placeholder="مثال: ركّز على المفاهيم الخاطئة، وأكثِر من أسئلة التطبيق"></label>' +
      '<div class="actions"><button class="btn" data-act="gen-one" data-k="' + esc(lk(b, l)) + '">' + svgI('spark') + 'جهّز المساعد</button></div><p class="small muted">' + costLine(np) + '</p>'
      : '<p class="hint">أضف مفتاح Claude API من الإعدادات ← الذكاء الاصطناعي، أو أضف ملف دروس جاهزًا.</p><div class="actions"><button class="btn" data-act="settings">افتح الإعدادات</button><button class="btn ghost" data-act="pack-add">أضف ملف دروس</button></div>') + '</section>';
}
ACT.ltab = function (el) { route.tab = el.getAttribute('data-tab'); var y = window.scrollY; render(); var st = document.querySelector('.subtabs'); if (st) { var top = st.getBoundingClientRect().top + window.scrollY - 8; window.scrollTo(0, Math.min(y, top)); } };
ACT['open-pages'] = function (el) { var x = lessonByKey(el.getAttribute('data-k')); if (!x) return; S.cur = x.b.id; go('read', { page: x.l.from, back: route.k }); };
ACT['aid-del'] = function (el) { confirmBox('حذف مساعد الدرس؟', 'يُحذف الشرح والرسوم والأسئلة لهذا الدرس من الجهاز. يمكنك تجهيزه مرة أخرى.', 'aid-del-yes', 'احذف', ' data-k="' + esc(el.getAttribute('data-k')) + '"', true); };
ACT['aid-del-yes'] = function (el) { var k = el.getAttribute('data-k'); delete AIDS[k]; dbDel('aids', k); closeModal(); render(); };

var L_TAB = {
  goals: function (a, b, l) {
    var k = lk(b, l), h = '';
    if (a.idea) h += '<p class="x-idea idea-big xa" id="x-' + esc(k) + ':i"><b>الفكرة الرئيسة:</b> ' + fx(a.idea) + '</p>';
    if (a.goals.length) h += '<article class="xcard xa hue-teal" id="x-' + esc(k) + ':g"><header class="x-head"><span class="i-num">' + svgI('target') + '</span><p class="x-ind">أهداف الدرس</p></header><ol class="goal-list">' + a.goals.map(function (g, i) { return '<li><span class="g-n">' + (i + 1) + '</span><span>' + fx(g) + '</span></li>'; }).join('') + '</ol></article>';
    if (a.vocab.length) h += '<article class="xcard xa hue-teal" id="x-' + esc(k) + ':v"><header class="x-head"><span class="i-num">' + svgI('book') + '</span><p class="x-ind">المفردات</p></header><dl class="vocab">' + a.vocab.map(function (v, i) { return '<div><dt>' + fx(v.t) + '</dt><dd>' + fx(v.d) + '</dd></div>'; }).join('') + '</dl></article>';
    if (a.prior.length || a.intro) h += '<article class="xcard xa hue-teal" id="x-' + esc(k) + ':p"><header class="x-head"><span class="i-num">' + svgI('bulb') + '</span><p class="x-ind">قبل الشرح</p></header>' +
      (a.prior.length ? boxHtml('note', 'التعلم القبلي', '<ul class="x-ul">' + a.prior.map(function (x) { return '<li>' + fx(x) + '</li>'; }).join('') + '</ul>') : '') +
      (a.intro ? boxHtml('q', 'تمهيد للدرس', '<p>' + fx(a.intro) + '</p>') : '') + '</article>';
    return h || '<p class="muted">لا أهداف في هذا المساعد.</p>';
  },
  exp: function (a, b, l) {
    if (!a.exp.length) return '<p class="muted">لا شرح في هذا المساعد.</p>';
    var k = lk(b, l);
    return '<p class="muted small xa-tip">اكتب على الشرح بقلم الآيباد مباشرة: قلم التحديد يظلّل الكلمات، وأقلام الكتابة تكتب بجانب الفقرة. ' + (xaPref().finger ? 'الكتابة بالإصبع مفعّلة؛ مرّر الصفحة بإصبعين. <button class="link" data-act="xa-finger">أوقفها</button>' : '<button class="link" data-act="xa-finger">اكتب بإصبعك</button>') + '</p>' + a.exp.map(function (x, i) {
      var id = k + ':e' + i;
      return '<article class="xcard xa hue-teal" id="x-' + esc(id) + '"><header class="x-head"><span class="i-num">' + (i + 1) + '</span><p class="x-ind">' + fx(x.h) + '</p>' + (x.page ? '<button class="pchip" data-act="go-page" data-p="' + x.page + '">ص ' + x.page + '</button>' : '') + '</header>' +
        (x.fig >= 0 ? figure(a.figs[x.fig], true) : '') + '<div class="x-body">' + blocks(x.body) + '</div>' + cardTools(id) + '</article>';
    }).join('') +
      (a.mis.length || a.life.length ? '<article class="xcard xa hue-teal" id="x-' + esc(k) + ':m"><header class="x-head"><span class="i-num">' + svgI('warn') + '</span><p class="x-ind">أخطاء شائعة وربط بالحياة</p></header>' +
        (a.mis.length ? boxHtml('pit', 'أخطاء شائعة عند الطلاب', '<ul class="x-ul">' + a.mis.map(function (x) { return '<li>' + fx(x) + '</li>'; }).join('') + '</ul>') : '') +
        (a.life.length ? boxHtml('life', 'ربط بالحياة', '<ul class="x-ul">' + a.life.map(function (x) { return '<li>' + fx(x) + '</li>'; }).join('') + '</ul>') : '') + cardTools(k + ':m') + '</article>' : '');
  },
  figs: function (a) {
    if (!a.figs.length) return '<p class="muted">لا رسوم في هذا المساعد.</p>';
    return '<p class="muted small" style="margin-bottom:10px">اضغط أي رسم ليكبر على الشاشة كلها.</p><div class="figs">' + a.figs.map(function (f) { return figure(f, true); }).join('') + '</div>';
  },
  map: function (a, b, l) {
    if (!a.maps.length) return '<p class="muted">لا خريطة مفاهيم في هذا المساعد.</p>';
    return '<p class="muted small" style="margin-bottom:12px">«أخفِ الفروع» يحوّلها إلى نشاط: يتذكر الطلاب كل فرع قبل أن تكشفه بالضغط عليه.</p>' + a.maps.map(function (m, k) { return mapHtml(m, lk(b, l) + ':' + k); }).join('');
  },
  eval: function (a, b, l) {
    var k = lk(b, l), qz = a.quiz;
    if (!qz.mcq.length && !qz.tf.length && !qz.short.length) return '<p class="muted">لا أسئلة في هذا المساعد.</p>';
    var h = '<div class="actions" style="margin-top:0"><button class="btn ghost sm tint hue-violet" data-act="pv-open" data-k="' + esc(k) + '" data-from="quiz">' + rIcon('present') + 'اعرض الأسئلة على الطلاب</button><button class="btn ghost sm" data-act="q-copy" data-k="' + esc(k) + '">انسخ الأسئلة</button><button class="btn ghost sm" data-act="q-reset" data-k="' + esc(k) + '">أعد الحل</button></div>';
    if (qz.mcq.length) h += '<h3 class="sec-h">اختيار من متعدد</h3>' + qz.mcq.map(function (q, i) { return mcqHtml(k + ':m' + i, q, i + 1); }).join('');
    if (qz.tf.length) h += '<h3 class="sec-h">صح أو خطأ</h3>' + qz.tf.map(function (q, i) { return tfHtml(k + ':t' + i, q, i + 1); }).join('');
    if (qz.short.length) h += '<h3 class="sec-h">أسئلة مقالية قصيرة</h3>' + qz.short.map(function (q, i) { return '<details class="citem"><summary><span class="i-num">' + (i + 1) + '</span> ' + fx(q.q) + '</summary><div class="c-a">' + fx(q.a) + '</div></details>'; }).join('');
    return h;
  },
  sum: function (a, b, l) {
    var k = lk(b, l), h = '';
    if (a.sum.length) h += '<article class="xcard xa hue-teal" id="x-' + esc(k) + ':s"><header class="x-head"><span class="i-num">' + svgI('star') + '</span><p class="x-ind">ملخص الدرس</p></header><ul class="sum-list">' + a.sum.map(function (x) { return '<li>' + fx(x) + '</li>'; }).join('') + '</ul></article>';
    if (a.acts.length) h += '<article class="xcard xa hue-teal" id="x-' + esc(k) + ':a"><header class="x-head"><span class="i-num">' + svgI('people') + '</span><p class="x-ind">أنشطة صفية</p></header>' + a.acts.map(function (x, i) { return '<div class="act-i"><b>' + fx(x.t) + (x.mins ? '<span class="mins">' + x.mins + ' د</span>' : '') + '</b><p>' + fx(x.d) + '</p></div>'; }).join('') + '</article>';
    if (a.hw.length) h += '<article class="xcard xa hue-teal" id="x-' + esc(k) + ':h"><header class="x-head"><span class="i-num">' + svgI('pen') + '</span><p class="x-ind">واجب منزلي</p></header><ul class="x-ul">' + a.hw.map(function (x) { return '<li>' + fx(x) + '</li>'; }).join('') + '</ul></article>';
    return h || '<p class="muted">لا ملخص في هذا المساعد.</p>';
  },
  notes: function (a, b, l) {
    var k = lk(b, l);
    return '<section class="panel"><h2>ملاحظاتي على الدرس</h2><textarea id="my-note" class="note-ta" data-k="' + esc(k) + '" rows="5" placeholder="ما نجح في الحصة، وما تعدّله في المرة القادمة، وأسماء من يحتاج متابعة…">' + esc(S.notes[k] || '') + '</textarea></section>' +
      '<section class="panel" style="margin-top:14px"><h2 class="hh">' + ico('pen', 'amber') + 'سبورتي</h2><p class="small muted">اكتب بقلم الآيباد: الإصبع يمرّر الصفحة ولا يكتب إلا إذا فعّلت الكتابة بالإصبع.</p><div class="nb-slot" data-nb="' + esc('b:' + k) + '"></div></section>';
  }
};

/* answering the lesson questions on the page */
var ANS = {}; // this session's choices: qid -> option
function mcqHtml(id, q, no) {
  var ch = ANS[id], done = ch != null;
  return '<article class="qcard lq"><p class="q-meta">سؤال ' + no + (q.lv ? ' · ' + esc(q.lv) : '') + '</p><h3 class="q-text">' + fx(q.q) + '</h3><div class="opts">' + q.o.map(function (o, k) {
    var cls = done ? (k === q.a ? ' right' : k === ch ? ' wrong' : ' dim') : '';
    return '<button class="opt' + cls + '" data-act="lq-opt" data-id="' + esc(id) + '" data-k="' + k + '"' + (done ? ' disabled' : '') + '><span class="lt">' + LET[k] + '</span><span>' + fx(o) + '</span></button>';
  }).join('') + '</div>' + (done ? '<div class="explain ' + (ch === q.a ? 'ok' : 'no') + '"><p><b>' + (ch === q.a ? 'إجابة صحيحة.' : 'الإجابة الصحيحة (' + LET[q.a] + ').') + '</b> ' + fx(q.e) + '</p></div>' : '') + '</article>';
}
function tfHtml(id, q, no) {
  var ch = ANS[id], done = ch != null;
  return '<article class="qcard lq"><p class="q-meta">عبارة ' + no + '</p><h3 class="q-text">' + fx(q.q) + '</h3><div class="opts tf">' + [[1, 'صح'], [0, 'خطأ']].map(function (x) {
    var v = !!x[0], cls = done ? (v === q.a ? ' right' : (ch === x[0] ? ' wrong' : ' dim')) : '';
    return '<button class="opt' + cls + '" data-act="lq-tf" data-id="' + esc(id) + '" data-k="' + x[0] + '"' + (done ? ' disabled' : '') + '><span>' + x[1] + '</span></button>';
  }).join('') + '</div>' + (done ? '<div class="explain ' + (!!ch === q.a ? 'ok' : 'no') + '"><p><b>' + (q.a ? 'العبارة صحيحة.' : 'العبارة خاطئة.') + '</b> ' + fx(q.e) + '</p></div>' : '') + '</article>';
}
function recordAns(id, ok) { var r = S.ans[id] || [0, 0, 0, 0]; S.ans[id] = [r[0] + 1, r[1] + (ok ? 1 : 0), ok ? 1 : 0, Date.now()]; saveState(); }
function qById(id) { var m = /^(.*):(m|t)(\d+)$/.exec(id); if (!m) return null; var x = lessonByKey(m[1]), a = x && aidOf(x.b, x.l); if (!a) return null; return (m[2] === 'm' ? a.d.quiz.mcq : a.d.quiz.tf)[+m[3]] || null; }
ACT['lq-opt'] = function (el) { var id = el.getAttribute('data-id'), q = qById(id); if (!q || ANS[id] != null) return; var k = +el.getAttribute('data-k'); ANS[id] = k; recordAns(id, k === q.a); var art = el.closest('.lq'); art.outerHTML = mcqHtml(id, q, +(/\d+/.exec(art.querySelector('.q-meta').textContent) || [0])[0]); };
ACT['lq-tf'] = function (el) { var id = el.getAttribute('data-id'), q = qById(id); if (!q || ANS[id] != null) return; var k = +el.getAttribute('data-k'); ANS[id] = k; recordAns(id, !!k === q.a); var art = el.closest('.lq'); art.outerHTML = tfHtml(id, q, +(/\d+/.exec(art.querySelector('.q-meta').textContent) || [0])[0]); };
ACT['q-reset'] = function (el) { var k = el.getAttribute('data-k'); Object.keys(ANS).forEach(function (id) { if (id.indexOf(k + ':') === 0) delete ANS[id]; }); render(true); };
function quizText(x, a, withAns) {
  var q = a.d.quiz, t = [x.l.title, ''];
  if (q.mcq.length) { t.push('أولًا: اختر الإجابة الصحيحة'); q.mcq.forEach(function (m, i) { t.push((i + 1) + ') ' + plain(m.q)); m.o.forEach(function (o, k) { t.push('   ' + LET[k] + ') ' + plain(o)); }); if (withAns) t.push('   الإجابة: ' + LET[m.a]); }); t.push(''); }
  if (q.tf.length) { t.push('ثانيًا: ضع علامة (✓) أمام العبارة الصحيحة وعلامة (✗) أمام الخاطئة'); q.tf.forEach(function (m, i) { t.push((i + 1) + ') ' + plain(m.q) + ' (   )' + (withAns ? '  ← ' + (m.a ? '✓' : '✗') : '')); }); t.push(''); }
  if (q.short.length) { t.push('ثالثًا: أجب عما يأتي'); q.short.forEach(function (m, i) { t.push((i + 1) + ') ' + plain(m.q)); if (withAns) t.push('   الإجابة: ' + plain(m.a)); }); }
  return t.join('\n');
}
ACT['q-copy'] = function (el) {
  var k = el.getAttribute('data-k');
  openModal(card('<h2>انسخ أسئلة الدرس</h2><p class="muted">تلصقها في ورقة عمل أو اختبار قصير.</p><div class="actions"><button class="btn" data-act="q-copy-do" data-k="' + esc(k) + '" data-a="0">الأسئلة فقط</button><button class="btn ghost" data-act="q-copy-do" data-k="' + esc(k) + '" data-a="1">مع الإجابات</button></div>'));
};
ACT['q-copy-do'] = function (el) { var x = lessonByKey(el.getAttribute('data-k')), a = x && aidOf(x.b, x.l); closeModal(); if (a) copyText(quizText(x, a, el.getAttribute('data-a') === '1')); };

/* AI panels in a lesson stay folded (they are not for the students' eyes); each one remembers being opened in this session */
var FOLD = {};
function foldOpen(key, dflt) { return key in FOLD ? FOLD[key] : !!dflt; }
document.addEventListener('toggle', function (e) { var d = e.target; if (d && d.matches && d.matches('details[data-fold]')) FOLD[d.getAttribute('data-fold')] = d.open; }, true);

/* ---------- «المختبر»: interactive virtual experiments for a lesson, designed by Claude ----------
   Each experiment is one self-contained HTML page, kept in the notes store as l:<bookId>:<lessonId> {labs:[{id, title, html, idea, at, model}], t}
   (so it goes into the backup and the sync). It runs inside a sandboxed frame with no access to the app, its storage or the network. */
var LAB_SYS = [
  'أنت مصمم مختبرات علوم افتراضية تفاعلية ومعلم علوم خبير في المرحلة المتوسطة في المملكة العربية السعودية.',
  'صمّم تجربة افتراضية تفاعلية واحدة مبدعة عن الدرس المعطى، يستعملها المعلم على الآيباد أو جهاز العرض ويتفاعل معها الطلاب.',
  'أعد صفحة HTML كاملة واحدة فقط، تبدأ بـ <!DOCTYPE html> وتنتهي بـ </html>، دون أي شرح أو علامات ``` قبلها أو بعدها.',
  'شروط تقنية لازمة:',
  '- <html lang="ar" dir="rtl">، وكل CSS وJavaScript داخل الصفحة. ممنوع أي مورد خارجي: لا خطوط ولا صور ولا مكتبات ولا روابط ولا fetch.',
  '- ممنوع localStorage وsessionStorage وcookies وalert وconfirm وprompt وwindow.open (الصفحة تعمل في إطار معزول).',
  '- الرسم بـ canvas أو SVG مع حركة سلسة (requestAnimationFrame)، يراعي devicePixelRatio ويتكيف مع تغيّر الحجم (من عرض 360 إلى 1400 بكسل).',
  '- التحكم باللمس والقلم والفأرة عبر Pointer Events: منزلقات range وأزرار كبيرة (44 بكسل على الأقل)، وعناصر تُسحب إن كان ذلك مناسبًا.',
  '- السحب على الآيباد والآيفون: ضع touch-action:none على canvas وعلى كل عنصر يُسحب، واستعمل pointerdown وpointermove وpointerup مع setPointerCapture، وحوّل الإحداثيات بـ getBoundingClientRect مع مراعاة devicePixelRatio، واجعل منطقة اللمس حول الجسم المسحوب واسعة (30 بكسل على الأقل). ووفّر دائمًا زرًا يشغّل الحركة إلى جانب السحب.',
  '- قراءات حية بالأرقام والوحدات، وجدول بيانات يُضاف إليه صف عند الضغط على «سجّل القراءة»، ورسم بياني بسيط على canvas إن كان مفيدًا.',
  '- خط system-ui، وأرقام غربية 0-9، وألوان هادئة واضحة على خلفية فاتحة، وتباين جيد على جهاز العرض.',
  '- الحجم مهم: الصفحة كلها أقل من 28 ألف حرف. اكتب CSS وJavaScript مختصرين دون تعليقات ودون تكرار، ونصوصًا عربية قصيرة، وركّز على محاكاة واحدة متقنة بدل ميزات كثيرة. الكود سليم بلا أخطاء، وأنهِ الصفحة دائمًا بـ </html>.',
  'المحتوى:',
  '- عنوان قصير، و«سؤال التجربة»، ثم «توقّع» يختار فيه الطالب توقعه قبل التشغيل، ثم المحاكاة، ثم «المهمة» في 3 إلى 5 خطوات، ثم «استنتج» بسؤالين أو ثلاثة اختيار من متعدد تظهر بعدها تغذية راجعة فورية تشرح السبب، وزر «إعادة».',
  '- دقيقة علميًا: استعمل المعادلات والقيم الحقيقية والوحدات الصحيحة، وبسّط دون أن تخطئ، وبمصطلحات الكتاب. اجعلها تجربة يغيّر فيها الطالب متغيرًا ويلاحظ أثره، لا رسمًا متحركًا فقط.',
  '- عربية فصيحة قصيرة الجمل. إن كان للتجربة الحقيقية خطر فاذكر احتياط السلامة في سطر.',
  'قبل أن تكتب، راجع هذه الأخطاء الشائعة وتجنبها:',
  '- كل عمود أو خط في رسم بياني يُقاس على أكبر قيمة ممكنة فيه فلا يخرج عن حدود الرسم أبدًا، وتظهر قيمته رقمًا فوقه.',
  '- لا تخلط محورين بوحدتين مختلفتين في رسم واحد (مثل الارتفاع بالمتر والطاقة بالجول): لكل رسم محوره ووحدته.',
  '- الحالة الأولى قبل التشغيل متسقة فيزيائيًا (جسم ساكن طاقته الحركية صفر)، وكل الأرقام والرسوم تتحدث معًا في كل إطار.',
  '- الرسم البياني مع الزمن يُرسم أثناء الحركة نفسها، والأزرار المعطّلة واضحة ويُشرح سبب تعطيلها، وزر «إعادة» يعيد كل شيء.',
  '- المشهد يتسع لكامل الحركة (الكرة لا تخرج من الإطار) مهما كانت قيم المنزلقات، وأبعاده تُحسب من القيم القصوى.',
  '- النص لا يتداخل مع الرسم، وكل التسميات مقروءة على شاشة الجوال.'
].join('\n');
function labKey(b, l) { return 'l:' + lk(b, l); }
function labsOf(b, l) { var r = XC[labKey(b, l)]; return r && Array.isArray(r.labs) ? r.labs : []; }
function labsSave(b, l, labs) { var k = labKey(b, l); if (!labs.length) { delete XC[k]; dbDel('notes', k); return; } var rec = { k: k, labs: labs, t: Date.now() }; XC[k] = rec; dbPut('notes', rec); }
function labDoc(html) { // a strict content policy inside the frame: nothing leaves it, nothing is loaded into it
  var csp = '<meta http-equiv="Content-Security-Policy" content="default-src \'none\'; script-src \'unsafe-inline\'; style-src \'unsafe-inline\'; img-src data: blob:; media-src data: blob:; font-src data:">';
  var rep = '<script>(function(){function s(m){try{parent.postMessage({labErr:String(m).slice(0,300)},"*")}catch(e){}}window.addEventListener("error",function(e){s((e.message||"خطأ")+(e.lineno?" (سطر "+e.lineno+")":""))});window.addEventListener("unhandledrejection",function(e){s(e.reason&&e.reason.message||e.reason)})})()<\/script>';
  rep += '<style>canvas,svg{touch-action:none!important;-webkit-user-select:none;user-select:none;-webkit-touch-callout:none}</style>'; // a finger on the drawing moves things instead of scrolling the page (iPhone/iPad)
  return /<head[^>]*>/i.test(html) ? html.replace(/<head[^>]*>/i, function (m) { return m + csp + rep; }) : csp + rep + html;
}
function labFrame(lab, cls) { return '<iframe data-lab="' + lab.id + '" class="' + (cls || 'lab-f') + '" title="' + esc(lab.title) + '" sandbox="allow-scripts" referrerpolicy="no-referrer" srcdoc="' + esc(labDoc(lab.html)) + '"></iframe>'; }
function aidText(d) { // the lesson helper as plain text, for Claude
  function bt(bs) { return (bs || []).map(function (x) { if (typeof x === 'string') return x; if (!x) return ''; if (x.h) return x.h; if (x.ul) return x.ul.join('؛ '); if (x.ol) return x.ol.join('؛ '); if (x.box) return (x.box.h || '') + ': ' + bt(x.box.b); return ''; }).filter(Boolean).join('\n'); }
  var L = [];
  if (d.idea) L.push('الفكرة الرئيسة: ' + d.idea);
  if (d.goals && d.goals.length) L.push('الأهداف: ' + d.goals.join('؛ '));
  if (d.vocab && d.vocab.length) L.push('المفردات: ' + d.vocab.map(function (v) { return v.t + ' (' + v.d + ')'; }).join('؛ '));
  (d.exp || []).forEach(function (x) { L.push('## ' + x.h + '\n' + bt(x.body)); });
  if (d.sum && d.sum.length) L.push('الخلاصة: ' + d.sum.join('؛ '));
  if (d.acts && d.acts.length) L.push('أنشطة الكتاب والمساعد: ' + d.acts.map(function (x) { return x.t; }).join('؛ '));
  return L.join('\n').replace(/\*\*|`/g, '').slice(0, 14000);
}
L_TAB.lab = function (a, b, l) {
  var labs = labsOf(b, l), k = lk(b, l), ai = !!P.ai.key, open = route.lab;
  var h = '<p class="muted small" style="margin-bottom:12px">تجارب افتراضية تفاعلية يصممها Claude لهذا الدرس: يغيّر الطالب المتغيرات بإصبعه ويلاحظ ويسجّل ويستنتج. اعرضها على جهاز العرض أو أعطِ الآيباد لطالب.</p>';
  h += labs.map(function (lab) {
    var on = open === lab.id;
    return '<article class="xcard lab-card hue-violet"><header class="x-head"><span class="i-num">' + svgI('spark') + '</span><p class="x-ind">' + esc(lab.title) + '</p></header>' +
      (lab.idea ? '<p class="small muted" style="margin:0 0 8px">الفكرة: ' + esc(lab.idea) + '</p>' : '') +
      (on ? labFrame(lab) : '') +
      '<div class="actions" style="margin-top:8px"><button class="btn' + (on ? ' ghost' : '') + ' sm" data-act="lab-open" data-k="' + esc(k) + '" data-id="' + lab.id + '">' + (on ? 'أغلق التجربة' : 'شغّل التجربة') + '</button>' +
      '<button class="btn ghost sm tint hue-violet" data-act="lab-full" data-k="' + esc(k) + '" data-id="' + lab.id + '">' + rIcon('present') + 'ملء الشاشة</button>' +
      '<button class="btn ghost sm" data-act="lab-edit" data-k="' + esc(k) + '" data-id="' + lab.id + '">' + svgI('spark') + 'عدّلها أو أصلحها</button>' +
      (lab.prev ? '<button class="btn ghost sm" data-act="lab-undo" data-k="' + esc(k) + '" data-id="' + lab.id + '">ارجع للنسخة السابقة</button>' : '') +
      '<button class="btn ghost sm danger" data-act="lab-del" data-k="' + esc(k) + '" data-id="' + lab.id + '">احذف</button></div>' +
      '<p class="small bad lab-err" data-id="' + lab.id + '"' + ((LAB_ERR[lab.id] || []).length ? '' : ' hidden') + '>ظهرت أخطاء برمجية في هذه التجربة؛ اضغط «عدّلها أو أصلحها» ليصلحها Claude.</p>' +
      '<p class="small muted" style="margin:6px 0 0">صمّمها ' + esc(lab.model || 'Claude') + ' ' + relDay(lab.at) + '. جرّبها قبل الحصة وتأكد من دقتها.</p></article>';
  }).join('');
  h += '<details class="panel gen ai-fold" data-fold="lab"' + (foldOpen('lab', !labs.length) ? ' open' : '') + '><summary class="hh">' + ico('spark', 'violet') + (labs.length ? 'صمّم تجربة أخرى' : 'صمّم تجربة افتراضية لهذا الدرس') + '</summary>' +
    (ai ? '<label class="field"><span>فكرة التجربة (اختياري، أو اترك Claude يختار)</span><textarea id="lab-idea" rows="2" placeholder="مثال: كرة على مسار متعرج تتحول طاقتها بين الوضع والحركة، مع منزلق للارتفاع والكتلة"></textarea></label>' +
      '<div id="lab-ideas" class="lab-ideas"></div>' +
      '<div class="actions"><button class="btn" data-act="lab-gen" data-k="' + esc(k) + '">' + svgI('spark') + 'صمّم التجربة</button><button class="btn ghost" data-act="lab-ideas" data-k="' + esc(k) + '">اقترح عليّ أفكارًا</button></div>' +
      '<p class="small muted">' + labCost() + '</p>'
      : '<p class="hint">أضف مفتاح Claude API من الإعدادات ← الذكاء الاصطناعي.</p><div class="actions"><button class="btn" data-act="settings">افتح الإعدادات</button></div>') + '</details>';
  return h;
};
function labCost() {
  var m = MODELS.filter(function (x) { return x[0] === aiModel(); })[0]; if (!m) return 'التكلفة بحسب النموذج الذي اخترته.';
  var usd = (5000 * m[2] + 14000 * m[3]) / 1e6;
  return 'التكلفة التقريبية من رصيد حسابك: نحو ' + (usd < 0.01 ? 'أقل من سنت' : usd.toFixed(2) + ' دولار') + ' للتجربة، ويستغرق التصميم دقيقة إلى ثلاث.';
}
function labCtx(b, l) {
  var a = aidOf(b, l);
  return 'الكتاب: ' + b.title + '\nالوحدة: ' + (l.unit || '') + (l.chap ? '\nالفصل: ' + l.chap : '') + '\nالدرس: ' + l.title + '\n\nمحتوى الدرس:\n' + (a ? aidText(a.d) : '(لا يوجد مساعد للدرس)');
}
ACT['lab-open'] = function (el) { var id = el.getAttribute('data-id'); route.lab = route.lab === id ? null : id; render(true); };
ACT['lab-full'] = function (el) {
  var x = lessonByKey(el.getAttribute('data-k')); if (!x) return; var lab = labsOf(x.b, x.l).filter(function (y) { return y.id === el.getAttribute('data-id'); })[0]; if (!lab) return;
  var ov = document.createElement('div'); ov.className = 'lab-full'; ov.innerHTML = '<div class="lab-fh"><b>' + esc(lab.title) + '</b><button class="btn sm" type="button">إغلاق</button></div>' + labFrame(lab, 'lab-ff');
  document.body.appendChild(ov); document.documentElement.classList.add('lab-on'); wake(true);
  ov.querySelector('button').addEventListener('click', function () { ov.remove(); document.documentElement.classList.remove('lab-on'); wake(false); });
};
ACT['lab-del'] = function (el) {
  if (!el.classList.contains('arm')) { el.classList.add('arm'); el.textContent = 'اضغط مرة ثانية للحذف'; setTimeout(function () { el.classList.remove('arm'); el.textContent = 'احذف'; }, 3000); return; }
  var x = lessonByKey(el.getAttribute('data-k')); if (!x) return; var id = el.getAttribute('data-id');
  labsSave(x.b, x.l, labsOf(x.b, x.l).filter(function (y) { return y.id !== id; })); render(true); toast('حُذفت التجربة');
};
ACT['lab-ideas'] = function (el) {
  var x = lessonByKey(el.getAttribute('data-k')); if (!x) return; var box = document.getElementById('lab-ideas'); if (box) box.innerHTML = '<p class="small muted">يفكّر Claude…</p>';
  claude('أنت مصمم مختبرات علوم افتراضية للمرحلة المتوسطة في السعودية. اقترح 4 أفكار متنوعة ومبدعة لتجارب افتراضية تفاعلية عن الدرس المعطى، يغيّر فيها الطالب متغيرًا ويلاحظ أثره. أعد JSON فقط: {"ideas":[{"t":"عنوان قصير","d":"وصف في جملة: ماذا يغيّر الطالب وماذا يلاحظ"}]}', [{ type: 'text', text: labCtx(x.b, x.l) }], 1200, null)
    .then(function (res) {
      var o = parseJSON(res), ideas = (o.ideas || []).filter(function (i) { return i && i.t; }).slice(0, 6);
      if (box) box.innerHTML = ideas.map(function (i) { return '<button type="button" class="lab-idea" data-act="lab-pick" data-v="' + esc(i.t + ': ' + (i.d || '')) + '"><b>' + esc(i.t) + '</b><span>' + esc(i.d || '') + '</span></button>'; }).join('');
    }, function (e) { if (box) box.innerHTML = '<p class="small bad">' + esc(aiMsg(e)) + '</p>'; });
};
ACT['lab-pick'] = function (el) { var t = document.getElementById('lab-idea'); if (t) { t.value = el.getAttribute('data-v'); t.focus(); } Array.prototype.forEach.call(document.querySelectorAll('.lab-idea'), function (b) { b.classList.toggle('on', b === el); }); };
var LABGEN = null;
var LAB_CONT = 'انقطع ردك عند حد الطول قبل نهاية الصفحة. أكمل الصفحة من آخر حرف كتبته بالضبط، دون أي تكرار لما سبق ودون مقدمة أو شرح أو علامات ```، حتى </html>. واختصر ما بقي قدر الإمكان.';
function labJoin(a, b) { // the continuation, glued to what came before without repeating it
  b = b.replace(/^\s*```(?:html)?\s*/i, '');
  if (/^\s*(<!DOCTYPE html|<html[\s>])/i.test(b)) return b; // it started over
  for (var k = Math.min(400, a.length, b.length); k >= 12; k--) if (a.slice(-k) === b.slice(0, k)) return a + b.slice(k);
  return a + b;
}
function labWrite(ask, prog, verb) { // the page, with one continuation if the answer hit the length limit
  var acc = '', round = 0, outT = 0;
  function run() {
    var msgs = round ? [{ role: 'user', content: [{ type: 'text', text: ask }] }, { role: 'assistant', content: acc }, { role: 'user', content: LAB_CONT }] : [{ type: 'text', text: ask }];
    return claude(LAB_SYS, msgs, 32000, function (n) { prog(verb + ' ' + num(acc.length * (round ? 1 : 0) + n) + ' حرفًا' + (round ? ' (تكملة)' : '')); }, LABGEN).then(function (res) {
      outT += (res.usage && res.usage.out) || 0;
      acc = round ? labJoin(acc, res.text) : res.text;
      if (/<\/html>/i.test(acc)) return acc;
      if (res.stop === 'max_tokens' && round < 1 && /<!DOCTYPE html|<html[\s>]/i.test(acc)) { round++; return run(); }
      var e = aiErr(res.stop === 'max_tokens' ? 'cut' : 'json'); e.chars = acc.length; e.toks = outT; throw e;
    });
  }
  return run().then(function (s) { var i = s.search(/<!DOCTYPE html|<html[\s>]/i), j = s.toLowerCase().lastIndexOf('</html>'); if (i < 0 || j < i) throw aiErr('json'); return s.slice(i, j + 7); });
}
function labCutMsg(e) { return 'طالت صفحة التجربة أكثر من الحد المسموح للرد حتى مع التكملة، فلم تُحفظ' + (e.chars ? ' (وصل ' + num(e.chars) + ' حرفًا' + (e.toks ? ' في ' + num(e.toks) + ' وحدة' : '') + ')' : '') + '. أعد المحاولة بفكرة أبسط تركّز على متغير واحد.'; }
ACT['lab-gen'] = function (el) {
  var x = lessonByKey(el.getAttribute('data-k')); if (!x) return;
  if (!P.ai.key) { toast('أضف مفتاح Claude API أولًا'); ACT.settings(); return; }
  var t = document.getElementById('lab-idea'), idea = t ? t.value.trim() : '';
  LABGEN = { stopped: false }; wake(true);
  var t0 = Date.now(), prog = progModal('Claude يصمّم التجربة', 'lab-stop'), tick = setInterval(function () { var bb = document.getElementById('ai-bar'); if (bb) bb.style.width = clamp((Date.now() - t0) / 1600, 4, 95) + '%'; }, 500);
  prog('يقرأ الدرس ويصمّم التجربة…');
  labWrite(labCtx(x.b, x.l) + '\n\n' + (idea ? 'فكرة المعلم للتجربة: ' + idea : 'اختر أنت فكرة التجربة الأنسب والأكثر إبداعًا لهذا الدرس.') + '\n\nاكتب صفحة HTML الآن، مختصرة (أقل من 28 ألف حرف) ومكتملة حتى </html>.', prog, 'يكتب Claude التجربة…')
    .then(function (html) {
      clearInterval(tick); wake(false);
      var tm = /<title[^>]*>([\s\S]*?)<\/title>/i.exec(html), hm = /<h1[^>]*>([\s\S]*?)<\/h1>/i.exec(html);
      var title = ((tm && tm[1]) || (hm && hm[1].replace(/<[^>]+>/g, '')) || 'تجربة افتراضية').trim().slice(0, 90);
      var lab = { id: 'x' + Date.now().toString(36), title: title, html: html, idea: idea.slice(0, 300), at: Date.now(), model: aiModel() };
      labsSave(x.b, x.l, labsOf(x.b, x.l).concat([lab]));
      var m = document.getElementById('modal'); m.__busy = false; closeModal();
      route.tab = 'lab'; route.lab = lab.id; render(true); toast('جاهزة: «' + title + '». جرّبها قبل الحصة', 4000);
    })['catch'](function (e) { clearInterval(tick); wake(false); doneModal('<h2>' + (e.code === 'stop' ? 'أُوقف' : 'لم تكتمل التجربة') + '</h2><p class="muted">' + (e.code === 'stop' ? '' : e.code === 'cut' ? labCutMsg(e) : esc(aiMsg(e))) + '</p>'); });
};
ACT['lab-stop'] = function () { if (LABGEN) { LABGEN.stopped = true; if (LABGEN.abort) LABGEN.abort(); } };

/* errors reported from inside a running experiment, kept for the fix request */
var LAB_ERR = {};
window.addEventListener('message', function (e) {
  if (!e.data || typeof e.data.labErr !== 'string') return;
  var fr = Array.prototype.filter.call(document.querySelectorAll('iframe[data-lab]'), function (f) { return f.contentWindow === e.source; })[0]; if (!fr) return;
  var id = fr.getAttribute('data-lab'), l = LAB_ERR[id] = LAB_ERR[id] || [];
  if (l.indexOf(e.data.labErr) < 0 && l.length < 8) l.push(e.data.labErr);
  Array.prototype.forEach.call(document.querySelectorAll('.lab-err[data-id="' + id + '"]'), function (p) { p.hidden = false; });
});
var LAB_FIXES = ['لا أقدر أحرّك الجسم باللمس', 'الأعمدة أو الرسوم تخرج من حدودها', 'الرسم البياني لا يُرسم أثناء الحركة', 'الأرقام لا تتطابق مع الحركة', 'كبّر الخط والأزرار للعرض', 'اجعلها أبسط وأوضح للطلاب', 'أضف مقارنة بين محاولتين'];
ACT['lab-edit'] = function (el) {
  var k = el.getAttribute('data-k'), id = el.getAttribute('data-id'), x = lessonByKey(k); if (!x) return;
  if (!P.ai.key) { toast('أضف مفتاح Claude API أولًا'); ACT.settings(); return; }
  var errs = LAB_ERR[id] || [];
  openModal(card('<h2>عدّل التجربة أو أصلحها</h2><p class="small muted">صف ما رأيته أو ما تريد تغييره، ويعيد Claude كتابة التجربة. تبقى النسخة الحالية فتستطيع الرجوع إليها.</p>' +
    (errs.length ? '<p class="small bad">سيُرسل معها ' + cnt(errs.length, ['خطأ برمجي واحد', 'خطآن برمجيان', 'أخطاء برمجية', 'خطأً برمجيًا']) + ' ظهر أثناء تشغيلها.</p>' : '') +
    '<div class="lab-ideas">' + LAB_FIXES.map(function (f) { return '<button type="button" class="lab-idea lab-fix" data-act="lab-fix-pick" data-v="' + esc(f) + '"><span>' + esc(f) + '</span></button>'; }).join('') + '</div>' +
    '<label class="field"><span>ملاحظاتك</span><textarea id="lab-note" rows="3" placeholder="مثال: عمودا الحركية والكلية يخرجان من أعلى الرسم، والرسم البياني فارغ، وزر «ارمِ الكرة» يبدو معطلًا"></textarea></label>' +
    '<div class="actions"><button class="btn" data-act="lab-fix" data-k="' + esc(k) + '" data-id="' + id + '">' + svgI('spark') + 'عدّلها</button><button class="btn ghost" data-act="modal-close">إلغاء</button></div><p class="small muted">التكلفة نحو ضعف تصميمها أول مرة، لأن Claude يقرأ الصفحة الحالية ثم يكتبها كاملة.</p>'));
};
ACT['lab-fix-pick'] = function (el) { var t = document.getElementById('lab-note'), v = el.getAttribute('data-v'); if (!t) return; el.classList.toggle('on'); var parts = t.value.split('\n').filter(Boolean); if (el.classList.contains('on')) parts.push(v); else parts = parts.filter(function (p) { return p !== v; }); t.value = parts.join('\n'); };
ACT['lab-fix'] = function (el) {
  var k = el.getAttribute('data-k'), id = el.getAttribute('data-id'), x = lessonByKey(k); if (!x) return;
  var labs = labsOf(x.b, x.l), lab = labs.filter(function (y) { return y.id === id; })[0]; if (!lab) return;
  var t = document.getElementById('lab-note'), note = t ? t.value.trim() : '', errs = LAB_ERR[id] || [];
  if (!note && !errs.length) { toast('اكتب ما تريد تغييره، أو اختر من الاقتراحات'); return; }
  LABGEN = { stopped: false }; wake(true);
  var t0 = Date.now(), prog = progModal('Claude يعدّل التجربة', 'lab-stop'), tick = setInterval(function () { var bb = document.getElementById('ai-bar'); if (bb) bb.style.width = clamp((Date.now() - t0) / 1800, 4, 95) + '%'; }, 500);
  prog('يقرأ التجربة الحالية…');
  var ask = labCtx(x.b, x.l) + '\n\nهذه صفحة التجربة الحالية:\n' + lab.html + '\n\n' + (note ? 'ملاحظات المعلم بعد تجربتها:\n' + note + '\n\n' : '') + (errs.length ? 'أخطاء برمجية ظهرت أثناء تشغيلها:\n' + errs.join('\n') + '\n\n' : '') +
    'أعد كتابة الصفحة كاملة بعد إصلاح كل ما سبق، مع الإبقاء على فكرتها وما يعمل فيها، ومراجعة الأخطاء الشائعة المذكورة في التعليمات. أعد صفحة HTML كاملة فقط (أقل من 28 ألف حرف) ومكتملة حتى </html>.';
  labWrite(ask, prog, 'يكتب Claude النسخة المعدّلة…').then(function (html) {
    clearInterval(tick); wake(false);
    var tm = /<title[^>]*>([\s\S]*?)<\/title>/i.exec(html);
    lab.prev = { html: lab.html, title: lab.title, at: lab.at };
    lab.html = html; lab.title = ((tm && tm[1]) || lab.title).trim().slice(0, 90); lab.at = Date.now(); lab.model = aiModel();
    labsSave(x.b, x.l, labs); delete LAB_ERR[id];
    var m = document.getElementById('modal'); m.__busy = false; closeModal();
    route.tab = 'lab'; route.lab = id; render(true); toast('عُدّلت التجربة. جرّبها، وإن لم تعجبك فارجع للنسخة السابقة', 4500);
  })['catch'](function (e) { clearInterval(tick); wake(false); doneModal('<h2>' + (e.code === 'stop' ? 'أُوقف' : 'لم يكتمل التعديل') + '</h2><p class="muted">' + (e.code === 'stop' ? '' : e.code === 'cut' ? labCutMsg(e) + ' ولم تتغير التجربة الحالية.' : esc(aiMsg(e))) + '</p>'); });
};
ACT['lab-undo'] = function (el) {
  var x = lessonByKey(el.getAttribute('data-k')); if (!x) return; var id = el.getAttribute('data-id'), labs = labsOf(x.b, x.l), lab = labs.filter(function (y) { return y.id === id; })[0];
  if (!lab || !lab.prev) return;
  var cur = { html: lab.html, title: lab.title, at: lab.at }; lab.html = lab.prev.html; lab.title = lab.prev.title; lab.at = lab.prev.at; lab.prev = cur;
  labsSave(x.b, x.l, labs); delete LAB_ERR[id]; render(true); toast('رجعت للنسخة السابقة (والمعدّلة محفوظة: اضغط مرة أخرى للتبديل)');
};

/* ---------- «الرسوم»: more drawings by Claude, from a description, a photo, or a page of the book ----------
   Kept in the notes store as f:<bookId>:<lessonId> {figs:[{id, svg, cap, from, at, model}]} (backup and sync); the SVG is cleaned like every drawing. */
var FIG_SYS = [
  'أنت رسام توضيحي لكتب العلوم في المرحلة المتوسطة في المملكة العربية السعودية.',
  'ارسم رسومًا توضيحية تعليمية أصلية بصيغة SVG، واضحة على جهاز العرض، بتسميات عربية قصيرة، دقيقة علميًا.',
  'إن أُرفقت صورة فحاكِها: أعد رسم محتواها نفسه (الأجزاء وترتيبها وأسهمها وتسمياتها) رسمًا توضيحيًا نظيفًا مبسطًا، لا نسخة من الصورة. وإن كانت الصورة صفحة كتاب فيها أكثر من شكل فارسم الشكل الذي يطلبه المعلم، أو أهم شكل فيها.',
  'شروط SVG لازمة:',
  '- عنصر <svg> واحد مع viewBox="0 0 800 560" أو قريب منه، دون width أو height.',
  '- العناصر المسموحة فقط: svg g rect circle ellipse path polygon polyline line text tspan defs marker linearGradient radialGradient stop clipPath title.',
  '- لا style ولا class ولا CSS ولا صور ولا روابط: استعمل الخصائص المباشرة fill وstroke وstroke-width وfont-size وfont-weight وtext-anchor وopacity.',
  '- النص العربي: font-size بين 20 و28، وtext-anchor="middle" غالبًا، وfill="#1B2621"، ولا يتداخل مع الخطوط. الأسهم بـ marker معرّف في defs.',
  '- ألوان هادئة واضحة، وخلفية بيضاء أو فاتحة جدًا (rect بكامل المساحة).',
  'أعد JSON فقط دون أي نص أو علامات ``` قبله أو بعده: {"figs":[{"svg":"<svg …>…</svg>","cap":"وصف قصير للرسم"}]}'
].join('\n');
var FIG_REF = null, FIGGEN = null;
function figKey(b, l) { return 'f:' + lk(b, l); }
function figsOf(b, l) { var r = XC[figKey(b, l)]; return r && Array.isArray(r.figs) ? r.figs : []; }
function figsSave(b, l, figs) { var k = figKey(b, l); if (!figs.length) { delete XC[k]; dbDel('notes', k); return; } var rec = { k: k, figs: figs, t: Date.now() }; XC[k] = rec; dbPut('notes', rec); }
var FIGS_BASE = L_TAB.figs;
L_TAB.figs = function (a, b, l) {
  var k = lk(b, l), extra = figsOf(b, l), ai = !!P.ai.key, ref = FIG_REF && FIG_REF.k === k ? FIG_REF : null;
  var h = a.figs.length ? FIGS_BASE(a, b, l) : '<p class="muted small">لا رسوم في مساعد هذا الدرس بعد.</p>';
  if (extra.length) h += '<h3 class="sec-h">رسومي الإضافية</h3><div class="figs">' + extra.map(function (f) {
    return '<div class="fig-x">' + (f.img ? figure({ img: f.img, cap: f.cap }) : figure({ svg: f.svg, cap: f.cap }, true)) + (f.img && f.credit ? '<p class="fig-cr small muted">' + esc(f.credit) + '</p>' : '') + '<div class="fig-xa"><span class="small muted">' + (f.from === 'photo' ? 'صورة حرة' : f.from === 'image' ? 'محاكاة صورة' : f.from === 'page' ? 'من صفحة ' + esc(f.page || '') : 'من وصفك') + ' · ' + relDay(f.at) + '</span><button class="link small danger" data-act="fig-del" data-k="' + esc(k) + '" data-id="' + f.id + '">احذف</button></div></div>';
  }).join('') + '</div>';
  h += '<details class="panel gen ai-fold" data-fold="fig"' + (foldOpen('fig', !!ref) ? ' open' : '') + ' style="margin-top:16px"><summary class="hh">' + ico('spark', 'violet') + 'ارسم مع Claude<span class="small muted">رسوم إضافية أو محاكاة صورة</span></summary>' +
    (ai ? '<p class="small muted">صف الرسم الذي تريده، أو أعطه صورة أو صفحة من الكتاب ليحاكيها برسم توضيحي نظيف بتسميات عربية.</p>' +
      '<label class="field"><span>ماذا يرسم؟</span><textarea id="fig-idea" rows="2" placeholder="مثال: مخطط يوضح تحول الطاقة في المصباح الكهربائي من كهربائية إلى ضوئية وحرارية، بأسهم ونسب"></textarea></label>' +
      '<div class="fig-ref">' + (ref ? '<img src="' + ref.src + '" alt="الصورة المرفقة"><span class="small">' + (ref.page ? 'صفحة ' + esc(ref.page) + ' من الكتاب' : 'صورة مرفقة') + '</span><button class="link small" data-act="fig-ref-x">أزلها</button>'
        : '<button class="btn ghost sm" data-act="fig-ref-img" data-k="' + esc(k) + '">' + svgI('image') + 'أرفق صورة يحاكيها</button><span class="small muted">أو</span><label class="fig-pg"><span class="small">صفحة الكتاب</span><input type="number" inputmode="numeric" id="fig-pg" placeholder="' + l.from + '"></label><button class="btn ghost sm" data-act="fig-ref-page" data-k="' + esc(k) + '">أرفقها</button>') + '</div>' +
      '<div class="actions"><label class="fig-n"><span class="small">عدد الرسوم</span><select id="fig-n"><option>1</option><option selected>2</option><option>3</option></select></label><button class="btn" data-act="fig-gen" data-k="' + esc(k) + '">' + svgI('spark') + 'ارسم</button></div>' +
      '<p class="small muted">التكلفة نحو 3 إلى 8 سنتات للرسم مع Sonnet. الرسوم توضيحية مبسطة (SVG)، لا صور واقعية.</p>'
      : '<p class="hint">أضف مفتاح Claude API من الإعدادات ← الذكاء الاصطناعي.</p><div class="actions"><button class="btn" data-act="settings">افتح الإعدادات</button></div>') + '</details>';
  return h + photoPanel(b, l);
};
ICONS.image = ICONS.image || '<rect x="3.5" y="5" width="17" height="14" rx="2.5"/><circle cx="9" cy="10" r="1.6"/><path d="m4 17 5-4.5 3.5 3 3-2.5L20 17"/>';
ACT['fig-ref-img'] = function (el) {
  var k = el.getAttribute('data-k');
  pick('image/*', false).then(function (files) { return phShrink(files[0]); }).then(function (im) { FIG_REF = { k: k, src: im.src }; render(true); }, function () { toast('تعذّرت قراءة الصورة'); });
};
ACT['fig-ref-page'] = function (el) {
  var x = lessonByKey(el.getAttribute('data-k')); if (!x) return; var inp = document.getElementById('fig-pg'), pr = +(inp && inp.value) || x.l.from;
  if (x.b.missing) { toast('ملف الكتاب غير موجود على هذا الجهاز'); return; }
  toast('جارٍ تجهيز الصفحة…');
  openDoc(x.b).then(function (doc) { return pageJpeg(doc, pdfPage(x.b, pr), 1400, 0.8); }).then(function (b64) { FIG_REF = { k: lk(x.b, x.l), src: 'data:image/jpeg;base64,' + b64, page: pr }; render(true); }, function () { toast('تعذّر فتح الصفحة'); });
};
ACT['fig-ref-x'] = function () { FIG_REF = null; render(true); };
ACT['fig-del'] = function (el) {
  if (!el.classList.contains('arm')) { el.classList.add('arm'); el.textContent = 'اضغط مرة ثانية للحذف'; setTimeout(function () { el.classList.remove('arm'); el.textContent = 'احذف'; }, 3000); return; }
  var x = lessonByKey(el.getAttribute('data-k')); if (!x) return; var id = el.getAttribute('data-id');
  figsSave(x.b, x.l, figsOf(x.b, x.l).filter(function (f) { return f.id !== id; })); render(true);
};
ACT['fig-gen'] = function (el) {
  var k = el.getAttribute('data-k'), x = lessonByKey(k); if (!x) return;
  if (!P.ai.key) { toast('أضف مفتاح Claude API أولًا'); ACT.settings(); return; }
  var t = document.getElementById('fig-idea'), idea = t ? t.value.trim() : '', ref = FIG_REF && FIG_REF.k === k ? FIG_REF : null, n = +(document.getElementById('fig-n') || {}).value || 2;
  if (!idea && !ref) { toast('صف الرسم، أو أرفق صورة أو صفحة يحاكيها'); return; }
  var a = aidOf(x.b, x.l), content = [];
  if (ref) content.push({ type: 'image', source: { type: 'base64', media_type: 'image/jpeg', data: ref.src.slice(ref.src.indexOf(',') + 1) } });
  content.push({ type: 'text', text: 'الدرس: ' + x.l.title + (a && a.d.idea ? '\nالفكرة الرئيسة: ' + a.d.idea : '') + (a && a.d.vocab ? '\nالمفردات: ' + a.d.vocab.map(function (v) { return v.t; }).join('، ') : '') +
    '\n\n' + (ref ? 'حاكِ ' + (ref.page ? 'الشكل في صفحة الكتاب المرفقة' : 'الصورة المرفقة') + ' برسم توضيحي. ' : '') + (idea ? 'طلب المعلم: ' + idea : '') + '\nارسم ' + (n === 1 ? 'رسمًا واحدًا' : n === 2 ? 'رسمين مختلفين' : 'ثلاثة رسوم مختلفة') + (ref && n > 1 ? ' (الأول محاكاة الصورة، والباقي رسوم مكملة لها)' : '') + '. أعد JSON المطلوب.' });
  FIGGEN = { stopped: false }; wake(true);
  var t0 = Date.now(), prog = progModal('Claude يرسم', 'fig-stop'), tick = setInterval(function () { var bb = document.getElementById('ai-bar'); if (bb) bb.style.width = clamp((Date.now() - t0) / 900, 4, 95) + '%'; }, 400);
  prog(ref ? 'يقرأ الصورة ويرسم…' : 'يرسم…');
  claude(FIG_SYS, content, 16000, function (c) { prog('يرسم Claude… ' + num(c) + ' حرفًا'); }, FIGGEN).then(function (res) {
    clearInterval(tick); wake(false);
    var o = parseJSON(res), got = (Array.isArray(o.figs) ? o.figs : []).map(function (f) { return { svg: cleanSvg(f && f.svg), cap: str(f && f.cap).slice(0, 200) }; }).filter(function (f) { return f.svg; });
    if (!got.length) throw aiErr('json');
    var now = Date.now(), list = figsOf(x.b, x.l).concat(got.map(function (f, i) { return { id: 'g' + now.toString(36) + i, svg: f.svg, cap: f.cap, from: ref ? (ref.page ? 'page' : 'image') : 'text', page: ref && ref.page ? String(ref.page) : '', at: now, model: aiModel() }; }));
    figsSave(x.b, x.l, list); FIG_REF = null;
    var m = document.getElementById('modal'); m.__busy = false; closeModal(); render(true);
    toast('أُضيف ' + cnt(got.length, ['رسم واحد', 'رسمان', 'رسوم', 'رسمًا']) + ' تحت «رسومي الإضافية»', 3500);
    setTimeout(function () { var el2 = document.querySelectorAll('.fig-x'); if (el2.length) el2[el2.length - got.length].scrollIntoView({ block: 'center', behavior: 'smooth' }); }, 200);
  })['catch'](function (e) { clearInterval(tick); wake(false); doneModal('<h2>' + (e.code === 'stop' ? 'أُوقف' : 'لم يكتمل الرسم') + '</h2><p class="muted">' + (e.code === 'stop' ? '' : esc(aiMsg(e))) + '</p>'); });
};
ACT['fig-stop'] = function () { if (FIGGEN) { FIGGEN.stopped = true; if (FIGGEN.abort) FIGGEN.abort(); } };

/* ---------- «التقويم»: more questions from Claude, on request; added to the lesson's questions (present, copy, counts) ---------- */
var QGEN_SYS = [
  'أنت معلم علوم خبير في المرحلة المتوسطة في المملكة العربية السعودية ومُعدّ اختبارات.',
  'اكتب أسئلة تقويم جديدة عن الدرس المعطى بحسب طلب المعلم، دقيقة علميًا، بعربية فصيحة واضحة، من محتوى الدرس، ولا تكرر الأسئلة الموجودة.',
  'أعد JSON فقط دون أي نص أو علامات ``` قبله أو بعده: {"mcq":[{"q":"السؤال","o":["","","",""],"a":0,"e":"تفسير الإجابة الصحيحة","lv":"تذكر|فهم|تطبيق|تحليل"}],"tf":[{"q":"عبارة","a":true,"e":"التفسير"}],"short":[{"q":"سؤال مقالي قصير","a":"الإجابة النموذجية"}]}',
  '- الاختيار من متعدد: أربعة خيارات، وa رقم الصحيح من 0 إلى 3 موزعًا بين الأسئلة، والخيارات الخاطئة معقولة ومن مفاهيم الدرس.',
  '- اترك أي نوع لم يُطلب قائمة فارغة. التزم بالعدد المطلوب. ضع المصطلح المهم بين ** ** والرموز والوحدات بين ` `.'
].join('\n');
var QGEN = null;
var QGEN_BASE = L_TAB.eval;
L_TAB.eval = function (a, b, l) {
  var k = lk(b, l), rec = aidOf(b, l), add = rec && rec.qadd, ai = !!P.ai.key, nAdd = add ? add.mcq + add.tf + add.short : 0;
  return QGEN_BASE(a, b, l) + '<details class="panel gen ai-fold" data-fold="qgen"' + (foldOpen('qgen', false) ? ' open' : '') + ' style="margin-top:16px"><summary class="hh">' + ico('spark', 'violet') + 'أسئلة إضافية مع Claude<span class="small muted">اطلب أسئلة بالنوع والمستوى الذي تريده</span></summary>' +
    (ai ? '<label class="field"><span>ماذا تريد؟ (اختياري)</span><textarea id="qg-ask" rows="2" placeholder="مثال: أسئلة على تحولات الطاقة في الأجهزة المنزلية، بمستوى تطبيق وتحليل، تناسب اختبارًا قصيرًا"></textarea></label>' +
      '<div class="qg-opts"><label><span class="small">النوع</span><select id="qg-type"><option value="mix">متنوعة</option><option value="mcq">اختيار من متعدد</option><option value="tf">صح أو خطأ</option><option value="short">مقالية قصيرة</option></select></label>' +
      '<label><span class="small">العدد</span><select id="qg-n"><option>3</option><option selected>5</option><option>8</option><option>10</option></select></label>' +
      '<label><span class="small">المستوى</span><select id="qg-lv"><option value="">متدرج</option><option>تذكر</option><option>فهم</option><option>تطبيق</option><option>تحليل</option></select></label></div>' +
      '<div class="actions"><button class="btn" data-act="qg-run" data-k="' + esc(k) + '">' + svgI('spark') + 'أنشئ الأسئلة</button>' +
      (nAdd ? '<button class="btn ghost sm danger" data-act="qg-undo" data-k="' + esc(k) + '">احذف آخر ما أضافه (' + nAdd + ')</button>' : '') + '</div>' +
      '<p class="small muted">تُضاف في آخر الأسئلة أعلاه، وتدخل في «اعرض الأسئلة على الطلاب» و«انسخ الأسئلة». التكلفة نحو سنتين إلى خمسة سنتات مع Sonnet.</p>'
      : '<p class="hint">أضف مفتاح Claude API من الإعدادات ← الذكاء الاصطناعي.</p><div class="actions"><button class="btn" data-act="settings">افتح الإعدادات</button></div>') + '</details>';
};
ACT['qg-run'] = function (el) {
  var x = lessonByKey(el.getAttribute('data-k')); if (!x) return; var rec = aidOf(x.b, x.l); if (!rec) return;
  if (!P.ai.key) { toast('أضف مفتاح Claude API أولًا'); ACT.settings(); return; }
  var ask = (document.getElementById('qg-ask') || {}).value || '', type = (document.getElementById('qg-type') || {}).value || 'mix', n = +(document.getElementById('qg-n') || {}).value || 5, lv = (document.getElementById('qg-lv') || {}).value || '';
  var TYPE = { mix: 'متنوعة بين اختيار من متعدد وصح أو خطأ ومقالية قصيرة', mcq: 'اختيار من متعدد فقط', tf: 'صح أو خطأ فقط', short: 'مقالية قصيرة فقط' }, qz = rec.d.quiz;
  var have = qz.mcq.map(function (q) { return '- ' + q.q; }).concat(qz.tf.map(function (q) { return '- ' + q.q; }), qz.short.map(function (q) { return '- ' + q.q; })).join('\n').replace(/\*\*|`/g, '');
  var text = 'الدرس: ' + x.l.title + '\n\nمحتوى الدرس:\n' + aidText(rec.d) + '\n\nالأسئلة الموجودة (لا تكررها):\n' + (have || '(لا يوجد)') +
    '\n\nالمطلوب: ' + n + ' أسئلة ' + TYPE[type] + (lv ? '، بمستوى ' + lv : '، متدرجة الصعوبة') + '.' + (ask.trim() ? '\nطلب المعلم: ' + ask.trim() : '') + '\nأعد JSON المطلوب.';
  QGEN = { stopped: false }; wake(true);
  var t0 = Date.now(), prog = progModal('Claude يكتب الأسئلة', 'qg-stop'), tick = setInterval(function () { var bb = document.getElementById('ai-bar'); if (bb) bb.style.width = clamp((Date.now() - t0) / 500, 4, 95) + '%'; }, 300);
  claude(QGEN_SYS, [{ type: 'text', text: text }], 8000, function (c) { prog('يكتب… ' + num(c) + ' حرفًا'); }, QGEN).then(function (res) {
    clearInterval(tick); wake(false);
    var o = parseJSON(res), got = cleanAid({ goals: ['-'], quiz: { mcq: o.mcq, tf: o.tf, short: o.short } }).quiz, total = got.mcq.length + got.tf.length + got.short.length;
    if (!total) throw aiErr('json');
    var r = aidOf(x.b, x.l); r.d.quiz.mcq = r.d.quiz.mcq.concat(got.mcq); r.d.quiz.tf = r.d.quiz.tf.concat(got.tf); r.d.quiz.short = r.d.quiz.short.concat(got.short);
    r.qadd = { mcq: got.mcq.length, tf: got.tf.length, short: got.short.length, at: Date.now() }; r.at = Date.now(); AIDS[r.k] = r; dbPut('aids', r);
    var m = document.getElementById('modal'); m.__busy = false; closeModal(); render(true);
    toast('أُضيف ' + cnt(total, WORDS.q) + ' في آخر أسئلة التقويم', 3500);
  })['catch'](function (e) { clearInterval(tick); wake(false); doneModal('<h2>' + (e.code === 'stop' ? 'أُوقف' : 'لم تكتمل الأسئلة') + '</h2><p class="muted">' + (e.code === 'stop' ? '' : esc(aiMsg(e))) + '</p>'); });
};
ACT['qg-stop'] = function () { if (QGEN) { QGEN.stopped = true; if (QGEN.abort) QGEN.abort(); } };
ACT['qg-undo'] = function (el) {
  if (!el.classList.contains('arm')) { el.classList.add('arm'); el.textContent = 'اضغط مرة ثانية للحذف'; setTimeout(function () { el.classList.remove('arm'); }, 3000); return; }
  var x = lessonByKey(el.getAttribute('data-k')); if (!x) return; var r = aidOf(x.b, x.l); if (!r || !r.qadd) return;
  var qz = r.d.quiz, ad = r.qadd;
  qz.mcq.splice(qz.mcq.length - ad.mcq, ad.mcq); qz.tf.splice(qz.tf.length - ad.tf, ad.tf); qz.short.splice(qz.short.length - ad.short, ad.short);
  delete r.qadd; r.at = Date.now(); AIDS[r.k] = r; dbPut('aids', r); render(true); toast('حُذفت الأسئلة التي أضافها Claude آخر مرة');
};

/* ---------- «الرسوم»: a real picture for the lesson, free to use, from Wikimedia Commons ----------
   Only files whose licence is public domain / CC0 (or, if the teacher chooses, CC BY / CC BY-SA with the credit kept).
   The picture is saved into the lesson (f:<bookId>:<lessonId>) as a JPEG, with its source, author and licence. */
var PHOTO = { k: null, q: '', en: '', lic: 'pd', res: null, busy: false, err: '' };
function photoPanel(b, l) {
  var k = lk(b, l), S0 = PHOTO.k === k ? PHOTO : { q: '', en: '', lic: 'pd', res: null };
  var h = '<details class="panel gen ai-fold" data-fold="photo"' + (foldOpen('photo', !!S0.res) ? ' open' : '') + ' style="margin-top:12px"><summary class="hh">' + ico('image', 'green') + 'صورة حقيقية حرة<span class="small muted">صور وتوضيحات من ويكيميديا كومنز بلا حقوق نشر</span></summary>' +
    '<label class="field"><span>ابحث عن</span><input type="search" id="ph-q" enterkeyhint="search" value="' + esc(S0.q || l.title.replace(/^الدرس\s*\d+\s*[:：]\s*/, '')) + '" placeholder="مثال: محطة توليد كهرباء، دورة الماء، خلية نباتية تحت المجهر"></label>' +
    '<div class="qg-opts"><label><span class="small">الترخيص</span><select id="ph-lic"><option value="pd"' + (S0.lic === 'pd' ? ' selected' : '') + '>بلا حقوق (ملكية عامة)</option><option value="by"' + (S0.lic === 'by' ? ' selected' : '') + '>وتشمل المشروط بذكر المصدر</option></select></label>' +
    '<button class="btn" data-act="ph-search" data-k="' + esc(k) + '">ابحث</button></div>' +
    (S0.en ? '<p class="small muted">بُحث بالإنجليزية عن: <b dir="ltr">' + esc(S0.en) + '</b></p>' : '');
  if (PHOTO.k === k && PHOTO.busy) h += '<p class="small muted">جارٍ البحث…</p>';
  else if (PHOTO.k === k && PHOTO.err) h += '<p class="small bad">' + esc(PHOTO.err) + '</p>';
  else if (S0.res) h += S0.res.length ? '<div class="ph-res">' + S0.res.map(function (r, i) { return '<div class="ph-r"><img src="' + esc(r.thumb) + '" alt="' + esc(r.title) + '" loading="lazy"><span class="ph-lic">' + esc(r.licName) + '</span><button class="btn sm" data-act="ph-take" data-k="' + esc(k) + '" data-i="' + i + '">أضف</button></div>'; }).join('') + '</div>' : '<p class="small muted">لا نتائج بهذا الترخيص. جرّب كلمات أبسط، أو اختر «وتشمل المشروط بذكر المصدر».</p>';
  return h + '<p class="small muted">الصور من <a href="https://commons.wikimedia.org" target="_blank" rel="noopener">Wikimedia Commons</a>، ويُحفظ مع كل صورة مصدرها ومؤلفها وترخيصها ويظهر تحتها. تحتاج اتصالًا بالإنترنت للبحث فقط.</p></details>';
}
function phStrip(h) { var d = document.createElement('div'); d.innerHTML = String(h || ''); return (d.textContent || '').replace(/\s+/g, ' ').trim(); }
function phFree(md, lic) { // public domain / CC0, or also CC BY / BY-SA when allowed
  var a = ((md.License && md.License.value) || '') + ' ' + ((md.LicenseShortName && md.LicenseShortName.value) || '');
  if (/(^|\s)(pd|cc0|cc-zero|public domain)/i.test(a) || /\bpd-/i.test(a)) return 'pd';
  if (lic === 'by' && /cc[- ]by(-sa)?[- ]?\d/i.test(a) && !/nc|nd/i.test(a)) return 'by';
  return '';
}
function phTerms(q) { // Arabic words become a short English query (Commons is searched in English); without a key, the words as typed
  if (!/[؀-ۿ]/.test(q) || !P.ai.key) return Promise.resolve(q);
  return claude('حوّل طلب صورة تعليمية لدرس علوم إلى كلمات بحث إنجليزية قصيرة (2 إلى 4 كلمات) تناسب البحث في Wikimedia Commons. أعد الكلمات فقط.', [{ type: 'text', text: q }], 40, null)
    .then(function (r) { return r.text.replace(/["\n]/g, ' ').trim().slice(0, 80) || q; }, function () { return q; });
}
ACT['ph-search'] = function (el) {
  var k = el.getAttribute('data-k'), q = (document.getElementById('ph-q').value || '').trim(), lic = document.getElementById('ph-lic').value;
  if (!q) { toast('اكتب ما تبحث عنه'); return; }
  PHOTO = { k: k, q: q, en: '', lic: lic, res: null, busy: true, err: '' }; FOLD.photo = true; render(true);
  phTerms(q).then(function (en) {
    PHOTO.en = en !== q ? en : '';
    var url = 'https://commons.wikimedia.org/w/api.php?action=query&format=json&origin=*&generator=search&gsrnamespace=6&gsrlimit=40&gsrsearch=' + encodeURIComponent(en + ' filetype:bitmap|drawing') +
      '&prop=imageinfo&iiprop=url|mime|extmetadata&iiurlwidth=1000&iiextmetadatafilter=LicenseShortName|License|Artist|ObjectName';
    return fetch(url, { cache: 'no-store' }).then(function (r) { if (!r.ok) throw new Error('http'); return r.json(); });
  }).then(function (j) {
    var pages = j && j.query && j.query.pages ? Object.keys(j.query.pages).map(function (id) { return j.query.pages[id]; }) : [];
    pages.sort(function (a, b) { return (a.index || 0) - (b.index || 0); });
    PHOTO.res = pages.map(function (p) {
      var ii = p.imageinfo && p.imageinfo[0], md = ii && ii.extmetadata || {}; if (!ii || !ii.thumburl || !/image\/(jpeg|png|svg|gif|webp)/.test(ii.mime || '')) return null;
      var free = phFree(md, PHOTO.lic); if (!free) return null;
      return { title: phStrip((md.ObjectName && md.ObjectName.value) || p.title.replace(/^File:|\.\w+$/g, '')), thumb: ii.thumburl, page: ii.descriptionurl, free: free,
        licName: free === 'pd' ? 'ملكية عامة' : phStrip(md.LicenseShortName && md.LicenseShortName.value), author: phStrip(md.Artist && md.Artist.value).slice(0, 80) };
    }).filter(Boolean).slice(0, 18);
  })['catch'](function () { PHOTO.err = 'تعذّر البحث: تأكد من الاتصال بالإنترنت وأعد المحاولة.'; }).then(function () { PHOTO.busy = false; render(true); });
};
ACT['ph-take'] = function (el) {
  var x = lessonByKey(el.getAttribute('data-k')), r = PHOTO.res && PHOTO.res[+el.getAttribute('data-i')]; if (!x || !r) return;
  el.disabled = true; el.textContent = 'جارٍ الحفظ…';
  fetch(r.thumb, { mode: 'cors' }).then(function (res) { if (!res.ok) throw new Error('img'); return res.blob(); }).then(function (blob) { return phShrink(new File([blob], 'p.jpg', { type: blob.type || 'image/jpeg' })); })
  ['catch'](function () { return /^https:\/\/upload\.wikimedia\.org\//.test(r.thumb) ? { src: r.thumb, remote: true } : Promise.reject(new Error('img')); }) // kept as a link if the copy cannot be made here
  .then(function (im) {
    var credit = 'المصدر: Wikimedia Commons' + (r.author ? ' · ' + r.author : '') + ' · ' + r.licName;
    var list = figsOf(x.b, x.l).concat([{ id: 'p' + Date.now().toString(36), img: im.src, cap: r.title, credit: credit, url: r.page, lic: r.licName, from: 'photo', at: Date.now() }]);
    figsSave(x.b, x.l, list); render(true); toast(im.remote ? 'أُضيفت الصورة (رابطًا: تظهر حين يتوفر الإنترنت)' : 'أُضيفت الصورة تحت «رسومي الإضافية»');
  })['catch'](function () { el.disabled = false; el.textContent = 'أضف'; toast('تعذّر تنزيل الصورة؛ جرّب صورة أخرى'); });
};

/* ---------- presenting a lesson to the class: one idea per screen ---------- */
var PV = null;
function pvSlides(x, a) {
  var d = a.d, sl = [];
  sl.push({ k: 'title', h: '<p class="pv-eb">' + esc(x.l.unit || x.b.title) + '</p><h1 class="pv-t">' + esc(x.l.title) + '</h1>' + (d.idea ? '<p class="pv-idea">' + fx(d.idea) + '</p>' : '') });
  var intro = pvIntro(d.intro); if (intro) sl.push({ k: 'intro', h: '<h2>تمهيد</h2>' + intro });
  if (d.goals.length) sl.push({ k: 'goals', h: '<h2>في هذا الدرس سنتعلم أن:</h2><ol class="pv-list">' + d.goals.map(function (g) { return '<li>' + fx(g) + '</li>'; }).join('') + '</ol>' });
  if (d.vocab.length) sl.push({ k: 'vocab', h: '<h2>المفردات</h2><dl class="vocab pv-vocab">' + d.vocab.map(function (v) { return '<div><dt>' + fx(v.t) + '</dt><dd>' + fx(v.d) + '</dd></div>'; }).join('') + '</dl>' });
  d.exp.forEach(function (e) { sl.push({ k: 'exp', h: '<h2>' + fx(e.h) + '</h2>' + (e.fig >= 0 ? figure(d.figs[e.fig]) : '') + '<div class="x-body">' + blocks(e.body) + '</div>' }); });
  d.figs.forEach(function (f, k) { if (!d.exp.some(function (e) { return e.fig === k; })) sl.push({ k: 'fig', h: figure(f) }); });
  figsOf(x.b, x.l).forEach(function (f) { sl.push({ k: 'fig', h: f.img ? figure({ img: f.img, cap: f.cap }) + (f.credit ? '<p class="fig-cr small muted">' + esc(f.credit) + '</p>' : '') : figure({ svg: f.svg, cap: f.cap }) }); }); // the teacher's own drawings and photos
  d.maps.forEach(function (m, k) { sl.push({ k: 'map', h: mapHtml(m, 'pv:' + k) }); });
  sl.push({ k: 'quiz0', h: '<h1 class="pv-t">اختبر فهمك</h1><p class="pv-idea">' + cnt(d.quiz.mcq.length + d.quiz.tf.length, WORDS.q) + '</p>', quiz: true });
  d.quiz.mcq.forEach(function (q, i) { sl.push({ k: 'mcq', q: q, i: i, quiz: true }); });
  d.quiz.tf.forEach(function (q, i) { sl.push({ k: 'tf', q: q, i: i, quiz: true }); });
  if (d.sum.length) sl.push({ k: 'sum', h: '<h2>الخلاصة</h2><ul class="pv-list">' + d.sum.map(function (s) { return '<li>' + fx(s) + '</li>'; }).join('') + '</ul>' });
  return sl;
}
function pvIntro(t) { // the warm-up as the students should see it: a note written for the teacher shows only its questions
  t = String(t || '').trim(); if (!t) return '';
  var teacher = /^(اعرض|اطرح|اسأل|ابدأ|اطلب|وجّه|وجه|قدّم|قدم|أحضر|احضر|ناقش|استعرض|ذكّر|ذكر|اكتب على السبورة|شغّل|شغل|أرِ|أر|ضع|اجعل|امسك|أمسك|ارسم)[\s\u064B-\u0652]/.test(t) || /(اسألهم|اسأل الطلاب|وجّههم|وجههم|اطلب منهم|اطلب من الطلاب|المعلم)/.test(t);
  if (!teacher) return '<p class="pv-big">' + fx(t) + '</p>';
  var qs = (t.match(/[^.:،؛!؟\n«»"]+؟/g) || []).map(function (q) { return q.replace(/^\s*(?:ثم\s+|أو\s+|و(?=(?:من|ما|ماذا|هل|كيف|لماذا|متى|أين|لم)\s))?(?:اسألهم|اسأل الطلاب|واسألهم)?\s*[:،]?\s*/, '').trim(); }).filter(function (q) { return q.length > 6 && !/^(اسأل|اعرض|اطلب)/.test(q); });
  var quoted = (t.match(/«([^»]+)»/g) || []).map(function (q) { return q.slice(1, -1).trim(); });
  qs = quoted.length ? quoted : qs;
  if (!qs.length) return '';
  return qs.length === 1 ? '<p class="pv-big">' + fx(qs[0]) + '</p>' : '<ul class="pv-list">' + qs.map(function (q) { return '<li>' + fx(q) + '</li>'; }).join('') + '</ul>';
}
function pvBody(s) {
  if (s.k === 'mcq') return '<p class="pv-eb">سؤال ' + (s.i + 1) + '</p><h2 class="pv-q">' + fx(s.q.q) + '</h2><div class="opts pv-opts">' + s.q.o.map(function (o, k) { var cls = s.shown ? (k === s.q.a ? ' right' : ' dim') : ''; return '<div class="opt' + cls + '"><span class="lt">' + LET[k] + '</span><span>' + fx(o) + '</span></div>'; }).join('') + '</div>' +
    (s.shown ? '<div class="explain ok"><p>' + fx(s.q.e) + '</p></div>' : '<button class="btn pv-show" data-act="pv-show">أظهر الإجابة</button>');
  if (s.k === 'tf') return '<p class="pv-eb">صح أم خطأ؟</p><h2 class="pv-q">' + fx(s.q.q) + '</h2>' + (s.shown ? '<div class="explain ' + (s.q.a ? 'ok' : 'no') + '"><p><b>' + (s.q.a ? 'صحيحة.' : 'خاطئة.') + '</b> ' + fx(s.q.e) + '</p></div>' : '<button class="btn pv-show" data-act="pv-show">أظهر الإجابة</button>');
  return s.h;
}
function pvRender() {
  if (!PV) return; var pv = document.getElementById('pv'), s = PV.sl[PV.i];
  pv.innerHTML = '<div class="pv-in" style="--fs:' + PV.fs + '"><div class="pv-top"><button class="pv-x" data-act="pv-close" aria-label="إغلاق">✕</button><span class="pv-n">' + (PV.i + 1) + ' / ' + PV.sl.length + '</span>' + clkPill() +
    '<span class="pv-fs"><button data-act="pv-fs" data-d="-1" aria-label="تصغير الخط">ص-</button><button data-act="pv-fs" data-d="1" aria-label="تكبير الخط">ص+</button></span></div>' +
    '<div class="pv-slide pv-' + s.k + '">' + pvBody(s) + '</div>' +
    '<div class="pv-nav"><button class="btn ghost" data-act="pv-go" data-d="-1"' + (PV.i ? '' : ' disabled') + '>السابق</button><div class="pv-dots">' + PV.sl.map(function (x, k) { return '<i' + (k === PV.i ? ' class="on"' : '') + '></i>'; }).join('') + '</div><button class="btn" data-act="pv-go" data-d="1"' + (PV.i < PV.sl.length - 1 ? '' : ' disabled') + '>التالي</button></div></div>';
  pv.scrollTop = 0;
}
ACT['pv-open'] = function (el) {
  var x = lessonByKey(el.getAttribute('data-k')), a = x && aidOf(x.b, x.l); if (!a) return;
  var sl = pvSlides(x, a), i = 0;
  if (el.getAttribute('data-from') === 'quiz') sl.forEach(function (s, k) { if (!i && s.k === 'quiz0') i = k; });
  PV = { sl: sl, i: i, fs: P.pvfs || 1 };
  var pv = document.getElementById('pv'); pv.classList.remove('zoom'); pv.hidden = false; document.body.classList.add('pv-on'); wake(true);
  try { if (document.documentElement.requestFullscreen) document.documentElement.requestFullscreen().catch(function () {}); } catch (e) {}
  pvRender();
};
ACT['pv-go'] = function (el) { if (!PV) return; PV.i = clamp(PV.i + +el.getAttribute('data-d'), 0, PV.sl.length - 1); pvRender(); };
ACT['pv-show'] = function () { if (!PV) return; PV.sl[PV.i].shown = true; pvRender(); };
ACT['pv-fs'] = function (el) { if (!PV) return; PV.fs = clamp(Math.round((PV.fs + 0.15 * +el.getAttribute('data-d')) * 100) / 100, 0.7, 2); P.pvfs = PV.fs; savePref(); pvRender(); };
ACT['pv-close'] = function () {
  var pv = document.getElementById('pv'); pv.hidden = true; pv.innerHTML = ''; pv.classList.remove('zoom');
  if (PV) { PV = null; document.body.classList.remove('pv-on'); wake(false); try { if (document.fullscreenElement && route.v !== 'read') document.exitFullscreen().catch(function () {}); } catch (e) {} }
};
document.addEventListener('keydown', function (e) {
  var pv = document.getElementById('pv'); if (pv.hidden) return;
  if (e.key === 'Escape') { ACT['pv-close'](); return; }
  if (!PV) return;
  if (e.key === 'ArrowLeft' || e.key === ' ' || e.key === 'PageDown') { e.preventDefault(); if (PV.sl[PV.i].quiz && PV.sl[PV.i].q && !PV.sl[PV.i].shown) { ACT['pv-show'](); return; } PV.i = Math.min(PV.i + 1, PV.sl.length - 1); pvRender(); }
  else if (e.key === 'ArrowRight' || e.key === 'PageUp') { e.preventDefault(); PV.i = Math.max(PV.i - 1, 0); pvRender(); }
});
(function () { // swipe between slides
  var sx = null, sy = 0;
  document.addEventListener('touchstart', function (e) { if (!PV || e.touches.length !== 1 || !e.target.closest('#pv')) { sx = null; return; } sx = e.touches[0].clientX; sy = e.touches[0].clientY; }, { passive: true });
  document.addEventListener('touchend', function (e) {
    if (sx == null || !PV) return; var t = e.changedTouches[0], dx = t.clientX - sx, dy = t.clientY - sy; sx = null;
    if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy) * 1.5) { PV.i = clamp(PV.i + (dx > 0 ? 1 : -1), 0, PV.sl.length - 1); pvRender(); } // RTL: swipe right goes forward
  }, { passive: true });
})();

/* ---------- سبورتي: a ruled board under each lesson (the engine from إتقان) ---------- */
var NB_INK = ['#1B2621', '#1F5FB8', '#C62828', '#1E7B4F'], NB_W = 1000, NB_H0 = 420, NB_GROW = 260, NB_LIVE = [];
function nbPref() { return P.nb || {}; }
function nbSetPref(k, v) { P.nb = P.nb || {}; P.nb[k] = v; savePref(); }
var NB_SVG = {
  hl: RSVG.hl, er: RSVG.er, undo: RSVG.undo, clear: RSVG.clear, grow: '<path d="M12 5v14M5 12h14"/>', hand: RSVG.finger
};
function nbBar() {
  var o = nbPref(), tool = o.tool || 'pen', ink = +o.ink || 0;
  function b(act, v, svg, label, on) { return '<button type="button" class="nb-b' + (on ? ' on' : '') + '" data-nb="' + act + '"' + (v != null ? ' data-v="' + v + '"' : '') + ' aria-label="' + label + '" title="' + label + '"><svg viewBox="0 0 24 24" aria-hidden="true">' + svg + '</svg></button>'; }
  return '<div class="nb-bar" role="toolbar" aria-label="أدوات السبورة">' +
    NB_INK.map(function (c, k) { return '<button type="button" class="nb-ink' + (tool === 'pen' && ink === k ? ' on' : '') + '" data-nb="ink" data-v="' + k + '" aria-label="قلم ' + ['أسود', 'أزرق', 'أحمر', 'أخضر'][k] + '" style="--c:' + c + '"></button>'; }).join('') +
    b('tool', 'hl', NB_SVG.hl, 'قلم تمييز', tool === 'hl') + b('tool', 'er', NB_SVG.er, 'ممحاة', tool === 'er') + '<i class="nb-sep"></i>' +
    b('undo', null, NB_SVG.undo, 'تراجع') + b('grow', null, NB_SVG.grow, 'مساحة أكبر') + b('clear', null, NB_SVG.clear, 'امسح السبورة') +
    b('finger', null, NB_SVG.hand, o.finger ? 'الكتابة بالإصبع مفعّلة' : 'الكتابة بالإصبع', !!o.finger) + '</div>';
}
function nbStroke(ctx, st) {
  var p = st.p, n = p.length / 3; if (!n) return;
  ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  if (st.k === 'hl') { ctx.save(); ctx.globalAlpha = 0.38; ctx.strokeStyle = '#FFD23F'; ctx.lineWidth = 22; ctx.beginPath(); ctx.moveTo(p[0], p[1]); for (var i = 1; i < n; i++) ctx.lineTo(p[i * 3], p[i * 3 + 1]); if (n === 1) ctx.lineTo(p[0] + 0.1, p[1]); ctx.stroke(); ctx.restore(); return; }
  ctx.strokeStyle = ctx.fillStyle = st.c || NB_INK[0];
  var base = st.w || 4;
  if (n === 1) { ctx.beginPath(); ctx.arc(p[0], p[1], base * (0.45 + p[2] / 90) / 2, 0, 7); ctx.fill(); return; }
  for (var j = 1; j < n; j++) { ctx.lineWidth = base * (0.45 + (p[j * 3 + 2] + p[j * 3 - 1]) / 180); ctx.beginPath(); ctx.moveTo(p[j * 3 - 3], p[j * 3 - 2]); ctx.lineTo(p[j * 3], p[j * 3 + 1]); ctx.stroke(); }
}
function nbMount(host, id, data) {
  var d = data && data.s ? data : { k: id, h: NB_H0, s: [] };
  host.innerHTML = nbBar() + '<div class="nb-wrap"><canvas class="nb-base"></canvas><canvas class="nb-live"></canvas></div>';
  var wrap = host.querySelector('.nb-wrap'), base = host.querySelector('.nb-base'), live = host.querySelector('.nb-live');
  var B = { id: id, host: host, d: d, undo: [], cur: null, touch: null, scale: 1, saveT: null };
  function fit() {
    var w = wrap.clientWidth || 300, dpr = Math.min(window.devicePixelRatio || 1, 3), hpx = Math.round(B.d.h * w / NB_W);
    B.scale = w / NB_W; wrap.style.height = hpx + 'px'; wrap.style.setProperty('--lh', (60 * B.scale).toFixed(2) + 'px');
    [base, live].forEach(function (c) { c.width = Math.round(w * dpr); c.height = Math.round(hpx * dpr); c.style.width = w + 'px'; c.style.height = hpx + 'px'; c.getContext('2d').setTransform(dpr * B.scale, 0, 0, dpr * B.scale, 0, 0); });
    redraw();
  }
  function redraw() { var x = base.getContext('2d'); x.clearRect(0, 0, NB_W, B.d.h + 10); B.d.s.forEach(function (st) { nbStroke(x, st); }); }
  function save() { B.d.t = Date.now(); clearTimeout(B.saveT); B.saveT = setTimeout(B.flush, 300); }
  B.flush = function () { clearTimeout(B.saveT); B.saveT = null; var c = JSON.parse(JSON.stringify(B.d)); c.k = id; xcPut(id, c.s.length ? c : null); nbBadge(id); };
  function pt(cx, cy, f) { var r = live.getBoundingClientRect(); return [Math.round((cx - r.left) / B.scale), Math.round((cy - r.top) / B.scale), Math.max(0, Math.min(99, Math.round((f == null ? 0.5 : f) * 100)))]; }
  function begin(q) { var o = nbPref(), tool = o.tool || 'pen'; B.cur = tool === 'er' ? { er: true, gone: [] } : tool === 'hl' ? { k: 'hl', p: [] } : { c: NB_INK[+o.ink || 0], w: 4, p: [] }; move(q); }
  function move(q) {
    if (!B.cur) return;
    if (B.cur.er) { var hit = false; for (var i = B.d.s.length - 1; i >= 0; i--) { var p = B.d.s[i].p; for (var j = 0; j < p.length; j += 3) if (Math.abs(p[j] - q[0]) < 14 && Math.abs(p[j + 1] - q[1]) < 14) { B.cur.gone.push({ i: i, s: B.d.s[i] }); B.d.s.splice(i, 1); hit = true; break; } } if (hit) redraw(); return; }
    var a = B.cur.p, n = a.length; if (n && Math.abs(a[n - 3] - q[0]) + Math.abs(a[n - 2] - q[1]) < 2) return;
    a.push(q[0], q[1], q[2]); var x = live.getContext('2d'); x.clearRect(0, 0, NB_W, B.d.h + 10); nbStroke(x, B.cur);
  }
  function end() {
    var c = B.cur; B.cur = null; if (!c) return; live.getContext('2d').clearRect(0, 0, NB_W, B.d.h + 10);
    if (c.er) { if (c.gone.length) { B.undo.push({ a: 'del', items: c.gone.reverse() }); save(); } return; }
    if (!c.p.length) return; B.d.s.push(c); B.undo.push({ a: 'add' }); nbStroke(base.getContext('2d'), c);
    var maxY = 0; for (var j = 1; j < c.p.length; j += 3) maxY = Math.max(maxY, c.p[j]); if (maxY > B.d.h - 70) { B.d.h += NB_GROW; fit(); }
    save();
  }
  function wants(t) { return t.touchType === 'stylus' || !!nbPref().finger; }
  live.addEventListener('touchstart', function (e) { if (B.touch != null) { e.preventDefault(); return; } for (var k = 0; k < e.changedTouches.length; k++) { var t = e.changedTouches[k]; if (!wants(t)) continue; e.preventDefault(); B.touch = t.identifier; begin(pt(t.clientX, t.clientY, t.touchType === 'stylus' ? t.force : null)); return; } }, { passive: false });
  live.addEventListener('touchmove', function (e) { if (B.touch == null) return; e.preventDefault(); for (var k = 0; k < e.changedTouches.length; k++) { var t = e.changedTouches[k]; if (t.identifier === B.touch) move(pt(t.clientX, t.clientY, t.touchType === 'stylus' ? t.force : null)); } }, { passive: false });
  function tend(e) { for (var k = 0; k < e.changedTouches.length; k++) if (e.changedTouches[k].identifier === B.touch) { B.touch = null; end(); } }
  live.addEventListener('touchend', tend); live.addEventListener('touchcancel', tend);
  live.addEventListener('pointerdown', function (e) { if (e.pointerType !== 'mouse' || e.button !== 0) return; e.preventDefault(); try { live.setPointerCapture(e.pointerId); } catch (x) {} begin(pt(e.clientX, e.clientY, 0.5)); });
  live.addEventListener('pointermove', function (e) { if (e.pointerType === 'mouse' && B.cur && B.touch == null) move(pt(e.clientX, e.clientY, 0.5)); });
  live.addEventListener('pointerup', function (e) { if (e.pointerType === 'mouse' && B.touch == null) end(); });
  host.onclick = function (e) {
    var el = e.target.closest('[data-nb]'); if (!el || !host.contains(el)) return;
    var a = el.getAttribute('data-nb'), v = el.getAttribute('data-v');
    if (a === 'ink') { nbSetPref('tool', 'pen'); nbSetPref('ink', +v); nbBars(); return; }
    if (a === 'tool') { nbSetPref('tool', nbPref().tool === v ? 'pen' : v); nbBars(); return; }
    if (a === 'finger') { nbSetPref('finger', !nbPref().finger); nbBars(); toast(nbPref().finger ? 'تكتب الآن بالإصبع أيضًا؛ مرّر الصفحة من خارج السبورة' : 'الكتابة بقلم الآيباد فقط، والإصبع يمرّر الصفحة'); return; }
    if (a === 'undo') { var u = B.undo.pop(); if (!u) { if (!B.d.s.length) return; u = { a: 'add' }; } if (u.a === 'add') B.d.s.pop(); else if (u.a === 'del') u.items.slice().reverse().forEach(function (it) { B.d.s.splice(it.i, 0, it.s); }); else if (u.a === 'grow') B.d.h = Math.max(NB_H0, B.d.h - NB_GROW); else if (u.a === 'clear') B.d.s = u.s; fit(); save(); return; }
    if (a === 'grow') { B.d.h += NB_GROW; B.undo.push({ a: 'grow' }); fit(); save(); return; }
    if (a === 'clear') { if (!B.d.s.length) return; if (!el.classList.contains('arm')) { el.classList.add('arm'); toast('اضغط زر المسح مرة ثانية لتأكيد مسح السبورة'); setTimeout(function () { el.classList.remove('arm'); }, 3000); return; } B.undo.push({ a: 'clear', s: B.d.s }); B.d.s = []; fit(); save(); toast('مُسحت السبورة؛ «تراجع» يعيدها'); }
  };
  host.classList.toggle('nb-finger', !!nbPref().finger);
  B.ro = window.ResizeObserver ? new ResizeObserver(function () { var w = wrap.clientWidth; if (w && Math.abs(w / NB_W - B.scale) > 0.001) fit(); }) : null;
  if (B.ro) B.ro.observe(wrap);
  host.__nb = B; NB_LIVE.push(B); host.classList.add('nb'); fit();
}
function nbBars() { NB_LIVE.forEach(function (B) { var bar = B.host.querySelector('.nb-bar'); if (bar) bar.outerHTML = nbBar(); B.host.classList.toggle('nb-finger', !!nbPref().finger); }); }
function boardsUnmount() { NB_LIVE.forEach(function (B) { if (B.saveT) B.flush(); if (B.ro) B.ro.disconnect(); }); NB_LIVE = []; }
var NB_OPEN = {};
function nbHas(id) { var d = XC[id]; return !!(d && d.s && d.s.length); }
function nbBadge(id) { Array.prototype.forEach.call(document.querySelectorAll('[data-act="nb-toggle"][data-id="' + id + '"]'), function (b) { b.classList.toggle('has', nbHas(id)); }); }
AFTER.push(function () {
  xcReady().then(function () {
    Array.prototype.forEach.call(document.querySelectorAll('#main .nb-slot'), function (h) {
      var id = h.getAttribute('data-nb'), lazy = h.hasAttribute('data-lazy'); nbBadge(id);
      if (lazy && !((NB_OPEN[id] || nbHas(id)) && NB_OPEN[id] !== false)) return;
      h.hidden = false; nbMount(h, id, XC[id] ? JSON.parse(JSON.stringify(XC[id])) : null);
    });
  });
});
ACT['nb-toggle'] = function (el) {
  var id = el.getAttribute('data-id'), h = document.querySelector('.nb-slot[data-nb="' + id + '"]'); if (!h) return;
  if (h.__nb) { if (h.__nb.saveT) h.__nb.flush(); NB_LIVE = NB_LIVE.filter(function (x) { return x !== h.__nb; }); h.__nb = null; h.innerHTML = ''; h.hidden = true; NB_OPEN[id] = false; }
  else { NB_OPEN[id] = true; h.hidden = false; nbMount(h, id, XC[id] ? JSON.parse(JSON.stringify(XC[id])) : null); try { h.scrollIntoView({ block: 'nearest', behavior: 'smooth' }); } catch (e) {} }
  var c = h.closest('.xa'); if (c) xaDraw(c);
};

/* ---------- notes store in memory: boards (b:), marks on the explanation (x:), the teacher's photos (p:) ---------- */
var XC = {}, XC_READY = null;
function xcReady() {
  if (!XC_READY) XC_READY = dbAll('notes').then(function (all) { (all || []).forEach(function (d) { XC[d.k] = d; }); return XC; }, function () { return XC; });
  return XC_READY;
}
function xcPut(k, d) {
  if (d) { d.k = k; d.t = d.t || Date.now(); XC[k] = d; dbPut('notes', d); }
  else { delete XC[k]; dbDel('notes', k); }
}

/* ---------- marking the explanation: the pencil highlights words and writes beside paragraphs (from إتقان) ---------- */
var XA_PEN = ['ink', '#C62828', '#1F5FB8'], XA_UNDO = [], XA_LIVE = null;
var XA_HLC = [['#FFD23F', 'أصفر'], ['#6FDB98', 'أخضر'], ['#86BEFF', 'أزرق'], ['#FF92BF', 'وردي'], ['#FFAA5C', 'برتقالي']];
function hlColor(k) { return (XA_HLC[+k || 0] || XA_HLC[0])[0]; }
function xaPref() { var o = nbPref(); return { tool: o.xtool || 'hl', ink: +o.xink || 0, hlc: Math.min(XA_HLC.length - 1, +o.xhlc || 0), pencil: !!o.pencil, finger: !!o.xfinger }; }
function xaData(id) { var d = XC['x:' + id]; return d ? JSON.parse(JSON.stringify(d)) : { hl: [], ink: [] }; }
function xaSave(id, d) { d.t = Date.now(); xcPut('x:' + id, d.hl.length || d.ink.length ? d : null); }
function xaStore(id, d, before) { XA_UNDO.push({ id: id, d: before }); if (XA_UNDO.length > 60) XA_UNDO.shift(); xaSave(id, d); setTimeout(xaBar, 0); }
function xaCard(id) { return document.getElementById('x-' + id); }
function xaSkip(n) { var p = n.nodeType === 1 ? n : n.parentNode; return !p || !!p.closest('.nb-slot, .actions, .xa-acts, button, svg, canvas, .mchip, .i-num, .ph-sec, .kb-h svg, .g-n, .stk-l'); }
function xaTexts(card) { var out = [], w = document.createTreeWalker(card, NodeFilter.SHOW_TEXT, { acceptNode: function (n) { return xaSkip(n) ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT; } }); while (w.nextNode()) out.push(w.currentNode); return out; }
function xaOff(card, node, off) { var ns = xaTexts(card), sum = 0; for (var i = 0; i < ns.length; i++) { if (ns[i] === node) return sum + off; sum += ns[i].length; } return -1; }
function xaCaret(x, y) {
  var r = null;
  try { if (document.caretRangeFromPoint) r = document.caretRangeFromPoint(x, y); else if (document.caretPositionFromPoint) { var q = document.caretPositionFromPoint(x, y); if (q) { r = document.createRange(); r.setStart(q.offsetNode, q.offset); } } } catch (e) {}
  return r && r.startContainer && r.startContainer.nodeType === 3 ? { n: r.startContainer, o: r.startOffset } : null;
}
function xaAddHl(card, id, a, b, col) { // word-snapped; replaces what it covers
  var ns = xaTexts(card), T = ns.map(function (n) { return n.data; }).join(''), ends = [], pos = 0;
  ns.forEach(function (n) { ends.push([pos, pos + n.length]); pos += n.length; });
  function span(o) { for (var i = 0; i < ends.length; i++) if (o >= ends[i][0] && o < ends[i][1]) return ends[i]; return [o, o]; }
  if (a > b) { var t = a; a = b; b = t; }
  while (a < b && /\s/.test(T[a])) a++; while (b > a && /\s/.test(T[b - 1])) b--;
  var sa = span(a), sb = span(Math.max(a, b - 1));
  while (a > sa[0] && !/\s/.test(T[a - 1])) a--; while (b < sb[1] && !/\s/.test(T[b])) b++;
  if (b - a < 1) return false;
  col = col == null ? xaPref().hlc : col;
  var d = xaData(id), before = xaData(id), list = [];
  d.hl.forEach(function (h) { var c = h[2] || 0, at = h[3] || 0; if (h[1] <= a || h[0] >= b) list.push([h[0], h[1], c, at]); else { if (h[0] < a) list.push([h[0], a, c, at]); if (h[1] > b) list.push([b, h[1], c, at]); } });
  list.push([a, b, col, Date.now()]); list.sort(function (x, y) { return x[0] - y[0]; });
  d.hl = list; xaStore(id, d, before); xaMarks(card, d); return true;
}
function xaMarks(card, d) {
  Array.prototype.forEach.call(card.querySelectorAll('mark.xhl'), function (m) { var pn = m.parentNode; while (m.firstChild) pn.insertBefore(m.firstChild, m); pn.removeChild(m); pn.normalize(); });
  if (!d || !d.hl || !d.hl.length) return;
  var pos = 0, list = xaTexts(card).map(function (n) { var x = { n: n, a: pos, b: pos + n.length, cuts: [] }; pos += n.length; return x; });
  d.hl.forEach(function (h) { list.forEach(function (t) { var a = Math.max(h[0], t.a), b = Math.min(h[1], t.b); if (a < b) t.cuts.push([a - t.a, b - t.a, h[2] || 0]); }); });
  list.forEach(function (t) {
    t.cuts.sort(function (x, y) { return y[0] - x[0]; }).forEach(function (c) {
      var mid = t.n.splitText(c[0]); mid.splitText(c[1] - c[0]);
      var m = document.createElement('mark'); m.className = 'xhl c' + (c[2] || 0); mid.parentNode.insertBefore(m, mid); m.appendChild(mid);
    });
  });
}
var XA_BL = '.x-head, p, li, h4, figure, tr, .x-box, .tbl-wrap, dt, dd, .act-i';
function xaBlocks(card) { return Array.prototype.filter.call(card.querySelectorAll(XA_BL), function (e) { return !e.closest('.nb-slot, .actions, .xa-acts'); }); }
function xaInkColor(c) { if (c !== 'ink') return c; try { return getComputedStyle(document.documentElement).getPropertyValue('--ink').trim() || '#1B2621'; } catch (e) { return '#1B2621'; } }
function xaCanvas(card, make) {
  var c = card.querySelector(':scope > canvas.xa-ink');
  if (!c && make) { c = document.createElement('canvas'); c.className = 'xa-ink'; c.setAttribute('aria-hidden', 'true'); card.appendChild(c); }
  if (!c) return null;
  var w = card.offsetWidth, h = card.offsetHeight, dpr = Math.min(window.devicePixelRatio || 1, 2);
  while (dpr > 1 && w * h * dpr * dpr > 12e6) dpr -= 0.5;
  if (c.width !== Math.round(w * dpr) || c.height !== Math.round(h * dpr)) { c.width = Math.round(w * dpr); c.height = Math.round(h * dpr); c.style.width = w + 'px'; c.style.height = h + 'px'; }
  var x = c.getContext('2d'); x.setTransform(dpr, 0, 0, dpr, 0, 0); return x;
}
function xaPath(x, pts, st) {
  var n = pts.length / 3; if (!n) return;
  x.lineCap = 'round'; x.lineJoin = 'round';
  if (st.k === 'hl') { x.save(); x.globalAlpha = 0.38; x.strokeStyle = hlColor(st.hc); x.lineWidth = 16; x.beginPath(); x.moveTo(pts[0], pts[1]); for (var i = 1; i < n; i++) x.lineTo(pts[i * 3], pts[i * 3 + 1]); x.stroke(); x.restore(); return; }
  x.strokeStyle = xaInkColor(st.c);
  for (var j = 1; j < n; j++) { x.lineWidth = (st.w || 2.4) * (0.5 + (pts[j * 3 + 2] + pts[j * 3 - 1]) / 200); x.beginPath(); x.moveTo(pts[j * 3 - 3], pts[j * 3 - 2]); x.lineTo(pts[j * 3], pts[j * 3 + 1]); x.stroke(); }
}
function xaToCard(card, blocks, st) {
  var cr = card.getBoundingClientRect(), bl = st.b >= 0 && blocks[st.b], r = bl ? bl.getBoundingClientRect() : cr, bx = r.left - cr.left, by = r.top - cr.top, bw = r.width || 1, out = [];
  for (var i = 0; i < st.p.length; i += 3) out.push(bx + st.p[i] * bw / 1000, by + st.p[i + 1] * bw / 1000, st.p[i + 2]);
  return out;
}
function xaDraw(card) {
  var id = card.id.slice(2), d = XC['x:' + id], has = d && d.ink && d.ink.length;
  var x = xaCanvas(card, has); if (!x) return;
  x.clearRect(0, 0, card.offsetWidth + 2, card.offsetHeight + 2);
  if (!has) return;
  var blocks = xaBlocks(card); d.ink.forEach(function (st) { xaPath(x, xaToCard(card, blocks, st), st); });
}
function xaBegin(card, t) {
  var tool = xaPref().tool;
  XA_LIVE = { card: card, id: card.id.slice(2), tool: tool, touch: t.identifier, pts: [], x0: t.clientX, y0: t.clientY, before: xaData(card.id.slice(2)) };
  if (tool !== 'er') { var el = document.elementFromPoint(t.clientX, t.clientY), blocks = xaBlocks(card), bl = el && el.closest && el.closest(XA_BL); XA_LIVE.b = bl && card.contains(bl) ? blocks.indexOf(bl) : -1; }
  xaMove(t);
}
function xaMove(t) {
  var L = XA_LIVE; if (!L) return;
  var cr = L.card.getBoundingClientRect(), px = t.clientX - cr.left, py = t.clientY - cr.top;
  if (L.tool === 'er') { xaErase(L, t.clientX, t.clientY); return; }
  var a = L.pts, n = a.length, f = t.touchType === 'stylus' ? Math.max(0, Math.min(99, Math.round((t.force || 0.5) * 100))) : 50;
  if (n && Math.abs(a[n - 3] - px) + Math.abs(a[n - 2] - py) < 1.5) return;
  a.push(px, py, f);
  var x = xaCanvas(L.card, true); if (n) xaPath(x, a.slice(n - 3), { k: L.tool === 'hl' ? 'hl' : 'pen', c: XA_PEN[xaPref().ink], hc: xaPref().hlc, w: 2.4 });
}
function xaErase(L, cx, cy) {
  var id = L.id; if (!XC['x:' + id]) return;
  var card = L.card, cr = card.getBoundingClientRect(), px = cx - cr.left, py = cy - cr.top, blocks = xaBlocks(card), changed = false, d = xaData(id);
  d.ink = d.ink.filter(function (st) { var q = xaToCard(card, blocks, st); for (var i = 0; i < q.length; i += 3) if (Math.abs(q[i] - px) < 12 && Math.abs(q[i + 1] - py) < 12) { changed = true; return false; } return true; });
  var c = xaCaret(cx, cy), off = c && card.contains(c.n) ? xaOff(card, c.n, c.o) : -1;
  if (off >= 0) d.hl = d.hl.filter(function (h) { if (off >= h[0] && off <= h[1]) { changed = true; return false; } return true; });
  if (changed) { xaSave(id, d); L.erased = true; xaMarks(card, d); xaDraw(card); }
}
function xaEnd() {
  var L = XA_LIVE; XA_LIVE = null; if (!L) return;
  var card = L.card, id = L.id;
  if (L.tool === 'er') { if (L.erased) { XA_UNDO.push({ id: id, d: L.before }); xaBar(); } return; }
  var a = L.pts, n = a.length / 3, len = 0;
  for (var i = 1; i < n; i++) len += Math.abs(a[i * 3] - a[i * 3 - 3]) + Math.abs(a[i * 3 + 1] - a[i * 3 - 2]);
  if (len < 4) { xaDraw(card); return; }
  if (L.tool === 'hl') { // over words: becomes a highlight of those words
    var s0 = xaCaret(L.x0, L.y0), cr = card.getBoundingClientRect(), s1 = xaCaret(cr.left + a[a.length - 3], cr.top + a[a.length - 2]);
    if (s0 && s1 && card.contains(s0.n) && card.contains(s1.n) && !xaSkip(s0.n) && !xaSkip(s1.n)) {
      var o0 = xaOff(card, s0.n, s0.o), o1 = xaOff(card, s1.n, s1.o);
      if (o0 >= 0 && o1 >= 0 && o0 !== o1 && xaAddHl(card, id, o0, o1)) { xaDraw(card); return; }
    }
  }
  var blocks = xaBlocks(card), bl = L.b >= 0 && blocks[L.b], cr2 = card.getBoundingClientRect(), r = bl ? bl.getBoundingClientRect() : cr2;
  var bx = r.left - cr2.left, by = r.top - cr2.top, bw = r.width || 1, p = [];
  for (var j = 0; j < a.length; j += 3) p.push(Math.round((a[j] - bx) * 1000 / bw), Math.round((a[j + 1] - by) * 1000 / bw), a[j + 2]);
  var d = xaData(id); d.ink.push({ b: bl ? L.b : -1, k: L.tool === 'hl' ? 'hl' : 'pen', c: XA_PEN[xaPref().ink], hc: xaPref().hlc, w: 2.4, at: Date.now(), p: p });
  xaStore(id, d, L.before); xaDraw(card);
}
function xaHook(card) {
  if (card.__xa) return; card.__xa = true;
  var pan = null; // with finger writing on, two fingers scroll the page
  card.addEventListener('touchstart', function (e) {
    var t = e.changedTouches[0]; if (!t) return;
    var stylus = t.touchType === 'stylus', finger = !stylus && xaPref().finger;
    if (finger && e.touches.length >= 2) { // a second finger: cancel the stroke just begun, and scroll instead
      if (XA_LIVE && !XA_LIVE.stylus) { var L0 = XA_LIVE; XA_LIVE = null; xaDraw(L0.card); }
      pan = { y: (e.touches[0].clientY + e.touches[1].clientY) / 2 }; e.preventDefault(); return;
    }
    if (!stylus && !finger) return;
    if (XA_LIVE && Date.now() - XA_LIVE.at > 1500) XA_LIVE = null;
    if (XA_LIVE) return;
    if (e.target.closest && e.target.closest('button, a, input, select, textarea, summary, label, .nb-slot, .ph-sec, .stk' + (finger ? ', figure, [data-act]' : ''))) return;
    e.preventDefault(); if (stylus && !xaPref().pencil) { nbSetPref('pencil', true); xaBar(); }
    var tg = e.target, id = t.identifier;
    function mv(ev) { if (!XA_LIVE) return; for (var k = 0; k < ev.changedTouches.length; k++) if (ev.changedTouches[k].identifier === id) { ev.preventDefault(); XA_LIVE.at = Date.now(); xaMove(ev.changedTouches[k]); } }
    function en(ev) { for (var k = 0; k < ev.changedTouches.length; k++) if (ev.changedTouches[k].identifier === id) { tg.removeEventListener('touchmove', mv); tg.removeEventListener('touchend', en); tg.removeEventListener('touchcancel', en); xaEnd(); } }
    tg.addEventListener('touchmove', mv, { passive: false }); tg.addEventListener('touchend', en); tg.addEventListener('touchcancel', en);
    xaBegin(card, t); XA_LIVE.at = Date.now(); XA_LIVE.stylus = stylus;
  }, { passive: false });
  card.addEventListener('touchmove', function (e) {
    if (!pan || e.touches.length < 2) return; e.preventDefault();
    var y = (e.touches[0].clientY + e.touches[1].clientY) / 2; window.scrollBy(0, pan.y - y); pan.y = y;
  }, { passive: false });
  card.addEventListener('touchend', function (e) { if (e.touches.length < 2) pan = null; });
  if (window.ResizeObserver) { var ro = new ResizeObserver(function () { xaDraw(card); }); ro.observe(card); }
}
function xaSelCard() {
  var sel = window.getSelection && window.getSelection(); if (!sel || sel.isCollapsed || !sel.rangeCount) return null;
  var r = sel.getRangeAt(0), a = r.startContainer, b = r.endContainer, ca = (a.nodeType === 1 ? a : a.parentNode).closest('.xa'), cb = (b.nodeType === 1 ? b : b.parentNode).closest('.xa');
  return ca && ca === cb && a.nodeType === 3 && b.nodeType === 3 ? { card: ca, r: r } : null;
}
function xaOn() { return route.v === 'lesson' && !!document.querySelector('#main .xa'); }
function xaBar() {
  var on = xaOn(), bar = document.getElementById('xa-bar'), selc = on && xaSelCard();
  if (!on || !(xaPref().pencil || selc)) { if (bar) bar.remove(); return; }
  if (!bar) { bar = document.createElement('div'); bar.id = 'xa-bar'; bar.className = 'xa-bar'; bar.setAttribute('role', 'toolbar'); bar.setAttribute('aria-label', 'أدوات التحديد'); document.body.appendChild(bar); bar.addEventListener('click', xaBarClick); bar.addEventListener('mousedown', function (e) { e.preventDefault(); }); }
  var o = xaPref(), h = '';
  if (selc) h += '<span class="xa-lbl">ظلّل التحديد:</span>' + XA_HLC.map(function (c, k) { return '<button type="button" class="xa-t xa-hl' + (k === o.hlc ? ' on' : '') + '" data-xa="sel" data-v="' + k + '" aria-label="ظلّل بالـ' + c[1] + '" style="--c:' + c[0] + '"><i></i></button>'; }).join('') + (o.pencil ? '<i class="xa-sep"></i>' : '');
  if (o.pencil) h += XA_HLC.map(function (c, k) { return '<button type="button" class="xa-t xa-hl' + (o.tool === 'hl' && o.hlc === k ? ' on' : '') + '" data-xa="hl" data-v="' + k + '" aria-label="قلم تحديد ' + c[1] + '" style="--c:' + c[0] + '"><i></i></button>'; }).join('') + '<i class="xa-sep"></i>' +
    XA_PEN.map(function (c, k) { return '<button type="button" class="xa-t xa-pen' + (o.tool === 'pen' && o.ink === k ? ' on' : '') + '" data-xa="pen" data-v="' + k + '" aria-label="قلم ' + ['داكن', 'أحمر', 'أزرق'][k] + '" style="--c:' + (c === 'ink' ? 'var(--ink)' : c) + '"><i></i></button>'; }).join('') +
    '<button type="button" class="xa-t' + (o.tool === 'er' ? ' on' : '') + '" data-xa="tool" data-v="er" aria-label="ممحاة"><svg viewBox="0 0 24 24" aria-hidden="true">' + NB_SVG.er + '</svg></button>' +
    '<button type="button" class="xa-undo" data-xa="undo" aria-label="تراجع عن آخر تحديد أو كتابة"' + (XA_UNDO.length || xaNewest() ? '' : ' disabled') + '><svg viewBox="0 0 24 24" aria-hidden="true">' + NB_SVG.undo + '</svg>تراجع</button>' +
    '<button type="button" class="xa-t xa-fg' + (o.finger ? ' on' : '') + '" data-xa="finger" aria-label="' + (o.finger ? 'الكتابة بالإصبع مفعّلة' : 'الكتابة بالإصبع') + '" title="الكتابة بالإصبع"><svg viewBox="0 0 24 24" aria-hidden="true">' + RSVG.finger + '</svg></button>' +
    '<button type="button" class="xa-t" data-xa="hide" aria-label="أخفِ الأدوات"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m6 9 6 6 6-6"/></svg></button>';
  bar.innerHTML = h;
}
function xaNewest() {
  var best = null;
  Array.prototype.forEach.call(document.querySelectorAll('#main .xa'), function (card) {
    var id = card.id.slice(2), d = XC['x:' + id]; if (!d) return;
    d.hl.forEach(function (h, k) { var at = h[3] || 0; if (!best || at > best.at) best = { id: id, kind: 'hl', k: k, at: at }; });
    d.ink.forEach(function (st, k) { var at = st.at || 0; if (!best || at >= best.at) best = { id: id, kind: 'ink', k: k, at: at }; });
  });
  return best;
}
function xaUndo() {
  var u = XA_UNDO.pop(), id, msg;
  if (u) { id = u.id; xaSave(id, u.d); msg = 'تراجعت عن آخر خطوة'; }
  else {
    var nw = xaNewest(); if (!nw) return;
    id = nw.id; var d = xaData(id); d[nw.kind].splice(nw.k, 1); xaSave(id, d);
    msg = nw.kind === 'hl' ? 'أُزيل آخر تظليل' : 'أُزيلت آخر كتابة';
  }
  var c = xaCard(id); if (c) { xaMarks(c, XC['x:' + id]); xaDraw(c); var r = c.getBoundingClientRect(); if (r.bottom < 0 || r.top > window.innerHeight) c.scrollIntoView({ block: 'center', behavior: 'smooth' }); }
  toast(msg);
}
function xaBarClick(e) {
  var b = e.target.closest('[data-xa]'); if (!b) return;
  var a = b.getAttribute('data-xa'), v = b.getAttribute('data-v');
  if (a === 'tool') nbSetPref('xtool', v);
  else if (a === 'hl') { nbSetPref('xtool', 'hl'); nbSetPref('xhlc', +v); }
  else if (a === 'pen') { nbSetPref('xtool', 'pen'); nbSetPref('xink', +v); }
  else if (a === 'undo') xaUndo();
  else if (a === 'hide') { nbSetPref('pencil', false); nbSetPref('xfinger', false); document.body.classList.remove('xa-finger'); toast('تعود الأدوات حين تكتب بالقلم على الشرح'); }
  else if (a === 'finger') xaFinger(!xaPref().finger);
  else if (a === 'sel') { nbSetPref('xhlc', +v || 0); var S0 = XA_SEL && Date.now() - XA_SEL.at < 4000 ? XA_SEL : null, c2 = S0 && xaCard(S0.id); if (c2) xaAddHl(c2, S0.id, S0.a, S0.b, +v || 0); XA_SEL = null; try { window.getSelection().removeAllRanges(); } catch (x) {} }
  xaBar();
}
var XA_SEL = null;
document.addEventListener('selectionchange', function () {
  var sc = xaSelCard(); if (sc) { var a = xaOff(sc.card, sc.r.startContainer, sc.r.startOffset), b = xaOff(sc.card, sc.r.endContainer, sc.r.endOffset); if (a >= 0 && b >= 0) XA_SEL = { id: sc.card.id.slice(2), a: a, b: b, at: Date.now() }; }
  clearTimeout(xaBar.t); xaBar.t = setTimeout(xaBar, sc ? 150 : 900);
});
AFTER.push(function () {
  document.body.classList.toggle('xa-finger', xaOn() && xaPref().finger);
  if (!xaOn()) { xaBar(); return; }
  xcReady().then(function () {
    Array.prototype.forEach.call(document.querySelectorAll('#main .xa'), function (card) { phFill(card); xaHook(card); var d = XC['x:' + card.id.slice(2)]; if (d) xaMarks(card, d); xaDraw(card); if (/^x-/.test(card.id)) stkDrawCard(card); });
    xaBar();
  });
});
function xaFinger(on) {
  nbSetPref('xfinger', on); if (on) nbSetPref('pencil', true);
  document.body.classList.toggle('xa-finger', on); xaBar();
  toast(on ? 'تكتب وتظلّل الآن بإصبعك على الشرح؛ مرّر الصفحة بإصبعين' : 'الإصبع يمرّر الصفحة، والكتابة بقلم الآيباد', 3500);
}
ACT['xa-pen'] = function () { nbSetPref('pencil', !xaPref().pencil); xaBar(); if (xaPref().pencil) toast('اكتب بقلم الآيباد على الشرح؛ قلم التحديد يظلّل الكلمات'); };
ACT['xa-finger'] = function () { xaFinger(!xaPref().finger); render(true); };

/* under each explanation card: my photos and videos, and a board (from إتقان) */
function cardTools(id) {
  return '<div class="ph-sec" data-ph="' + esc(id) + '" hidden></div><div class="actions xa-acts">' +
    '<button class="btn ghost sm tint hue-green ph-add" data-act="ph-add" data-id="' + esc(id) + '"><svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3.5" y="5" width="17" height="14" rx="2.5"/><circle cx="9" cy="10" r="1.6"/><path d="m4 17 5-4.5 3.5 3 3-2.5L20 17"/></svg>صورة أو فيديو</button>' +
    '<button class="btn ghost sm tint hue-rose ph-add" data-act="yt-add" data-id="' + esc(id) + '"><svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="5.5" width="18" height="13" rx="3.5"/><path d="m10.5 9.5 4 2.5-4 2.5z"/></svg>رابط يوتيوب</button>' +
    '<button class="btn ghost sm tint hue-amber" data-act="stk-add" data-id="' + esc(id) + '"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 4h14v10l-5 6H5z"/><path d="M14 20v-6h5"/></svg>لاصقة</button>' +
    '<button class="btn ghost sm tint hue-amber nb-tg" data-act="nb-toggle" data-id="' + esc('b:' + id) + '"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 20l1-4L16.5 4.5a2.1 2.1 0 0 1 3 3L8 19z"/><path d="M14.5 6.5l3 3"/></svg>سبورتي</button></div>' +
    '<div class="nb-slot" data-nb="' + esc('b:' + id) + '" data-lazy hidden></div>';
}
var MEDIA_URL = {}; // media key -> object URL, made once per session
function mediaUrl(mk) {
  if (MEDIA_URL[mk]) return Promise.resolve(MEDIA_URL[mk]);
  return dbGet('media', mk).then(function (r) { if (!r || !r.blob) return null; MEDIA_URL[mk] = URL.createObjectURL(r.blob); return MEDIA_URL[mk]; }, function () { return null; });
}
function ytId(u) {
  var m = /(?:youtu\.be\/|youtube(?:-nocookie)?\.com\/(?:watch\?(?:.*&)?v=|embed\/|shorts\/|live\/|v\/))([A-Za-z0-9_-]{11})/.exec(String(u || ''));
  return m ? m[1] : null;
}
function phItem(id, m, k) {
  var cap = '<input class="ph-cap" type="text" maxlength="200" data-ph-cap="' + esc(id) + '" data-k="' + k + '" placeholder="اكتب وصفًا" value="' + esc(m.cap || '') + '">' +
    '<button type="button" class="ph-del" data-act="ph-del" data-id="' + esc(id) + '" data-k="' + k + '" aria-label="احذف">×</button>';
  if (m.kind === 'video') return '<figure class="ph vid"><video controls playsinline preload="metadata" data-mk="' + esc(m.mk) + '"' + (m.src ? ' poster="' + m.src + '"' : '') + '></video><p class="vid-miss small" hidden>المقطع غير موجود على هذا الجهاز (لا يدخل في النسخة الاحتياطية). احذفه وأضفه من جديد.</p>' + cap + '</figure>';
  if (m.kind === 'yt') return '<figure class="ph yt"><iframe src="https://www.youtube-nocookie.com/embed/' + esc(m.yt) + '?rel=0&playsinline=1" title="' + esc(m.cap || 'مقطع يوتيوب') + '" loading="lazy" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture; fullscreen" allowfullscreen referrerpolicy="strict-origin-when-cross-origin"></iframe>' + cap + '</figure>';
  return '<figure class="ph"><img data-act="zoom" src="' + m.src + '" alt="' + esc(m.cap || 'صورة أضفتها') + '"' + (m.w ? ' width="' + m.w + '" height="' + m.h + '"' : '') + ' loading="lazy" decoding="async">' + cap + '</figure>';
}
function phFill(card) {
  var id = card.id.slice(2), sec = card.querySelector('.ph-sec'); if (!sec) return;
  var d = XC['p:' + id], imgs = d && d.imgs || [];
  sec.hidden = !imgs.length;
  var nv = imgs.filter(function (m) { return m.kind === 'video' || m.kind === 'yt'; }).length, ni = imgs.length - nv;
  sec.innerHTML = imgs.length ? '<p class="ph-h">' + [ni ? 'صوري (' + ni + ')' : '', nv ? 'مقاطعي (' + nv + ')' : ''].filter(Boolean).join(' · ') + '</p><div class="ph-grid">' + imgs.map(function (m, k) { return phItem(id, m, k); }).join('') + '</div>' : '';
  Array.prototype.forEach.call(sec.querySelectorAll('video[data-mk]'), function (v) {
    mediaUrl(v.getAttribute('data-mk')).then(function (u) { if (u) { v.src = u; v.addEventListener('loadedmetadata', function () { xaDraw(card); }, { once: true }); } else { v.hidden = true; v.parentNode.querySelector('.vid-miss').hidden = false; } });
  });
}
function phShrink(file) {
  return new Promise(function (res, rej) {
    var url = URL.createObjectURL(file), im = new Image();
    im.onload = function () {
      var w = im.naturalWidth, h = im.naturalHeight, k = Math.min(1, 1400 / Math.max(w, h || 1)), c = document.createElement('canvas');
      c.width = Math.max(1, Math.round(w * k)); c.height = Math.max(1, Math.round(h * k));
      var x = c.getContext('2d'); x.fillStyle = '#fff'; x.fillRect(0, 0, c.width, c.height); x.drawImage(im, 0, 0, c.width, c.height);
      URL.revokeObjectURL(url); res({ src: c.toDataURL('image/jpeg', 0.82), w: c.width, h: c.height });
    };
    im.onerror = function () { URL.revokeObjectURL(url); rej(new Error('image')); };
    im.src = url;
  });
}
function videoPoster(file) { // a small still from the start of the clip; empty when the browser cannot make one
  return new Promise(function (res) {
    var url = URL.createObjectURL(file), v = document.createElement('video'), done = false;
    function fin(x) { if (done) return; done = true; try { v.removeAttribute('src'); v.load(); } catch (e) {} URL.revokeObjectURL(url); res(x); }
    v.muted = true; v.playsInline = true; v.preload = 'auto';
    v.onloadeddata = function () { try { v.currentTime = Math.min(0.5, (v.duration || 1) / 3); } catch (e) { fin({}); } };
    v.onseeked = function () {
      try { var w = v.videoWidth, h = v.videoHeight, k = Math.min(1, 640 / Math.max(w, h || 1)), c = document.createElement('canvas'); c.width = Math.round(w * k) || 1; c.height = Math.round(h * k) || 1; c.getContext('2d').drawImage(v, 0, 0, c.width, c.height); fin({ src: c.toDataURL('image/jpeg', 0.7), w: w, h: h, dur: Math.round(v.duration || 0) }); }
      catch (e) { fin({}); }
    };
    v.onerror = function () { fin({}); };
    setTimeout(function () { fin({}); }, 6000);
    v.src = url;
  });
}
ACT['ph-add'] = function (el) {
  var id = el.getAttribute('data-id');
  pick('image/*,video/*', true).then(function (files) {
    toast('جارٍ الحفظ…', 8000);
    var d = XC['p:' + id] ? JSON.parse(JSON.stringify(XC['p:' + id])) : { imgs: [] }, bad = 0, full = 0, nv = 0;
    files.reduce(function (pr, f) {
      return pr.then(function () {
        if (/^video\//.test(f.type) || /\.(mov|mp4|m4v|webm)$/i.test(f.name || '')) {
          var iid = uid(), mk = 'm:' + id + ':' + iid;
          return dbPut('media', { k: mk, blob: f, type: f.type || 'video/mp4', name: f.name || '', size: f.size }).then(function () {
            return videoPoster(f).then(function (p) { d.imgs.push({ id: iid, kind: 'video', mk: mk, src: p.src || '', w: p.w || 0, h: p.h || 0, dur: p.dur || 0, size: f.size, cap: '', at: Date.now() }); nv++; });
          }, function (e) { if (e && e.name === 'QuotaExceededError') full++; else bad++; });
        }
        return phShrink(f).then(function (r) { d.imgs.push({ id: uid(), src: r.src, w: r.w, h: r.h, cap: '', at: Date.now() }); }, function () { bad++; });
      });
    }, Promise.resolve()).then(function () {
      d.t = Date.now(); xcPut('p:' + id, d.imgs.length ? d : null);
      var card = xaCard(id); if (card) { phFill(card); xaDraw(card); }
      toast(full ? 'لا توجد مساحة كافية على الجهاز لهذا المقطع' : bad ? 'تعذّر فتح ' + cnt(bad, ['ملف واحد', 'ملفين', 'ملفات', 'ملفًا']) : nv ? 'أُضيف المقطع تحت الفقرة؛ يُحفظ على هذا الجهاز فقط' : 'أُضيفت الصور تحت الفقرة', 3500);
    });
  });
};
ACT['yt-add'] = function (el) {
  openModal(card('<h2>رابط مقطع يوتيوب</h2><p class="muted small">انسخ رابط المقطع من تطبيق يوتيوب (مشاركة ← نسخ الرابط) والصقه هنا. يُعرض تحت الفقرة ويحتاج إنترنت عند تشغيله.</p>' +
    '<label class="field"><span>الرابط</span><input type="url" id="yt-url" dir="ltr" placeholder="https://youtu.be/…" data-focus></label><label class="field"><span>وصف (اختياري)</span><input type="text" id="yt-cap" maxlength="200"></label>' +
    '<div class="actions"><button class="btn" data-act="yt-yes" data-id="' + esc(el.getAttribute('data-id')) + '">أضف</button><button class="btn ghost" data-act="modal-close">إلغاء</button></div>'));
};
ACT['yt-yes'] = function (el) {
  var id = el.getAttribute('data-id'), v = ytId(document.getElementById('yt-url').value);
  if (!v) { toast('الرابط ليس رابط مقطع يوتيوب'); return; }
  var d = XC['p:' + id] ? JSON.parse(JSON.stringify(XC['p:' + id])) : { imgs: [] };
  d.imgs.push({ id: uid(), kind: 'yt', yt: v, cap: document.getElementById('yt-cap').value.trim().slice(0, 200), at: Date.now() }); d.t = Date.now(); xcPut('p:' + id, d);
  closeModal(); var c = xaCard(id); if (c) { phFill(c); xaDraw(c); } toast('أُضيف المقطع تحت الفقرة');
};
ACT['ph-del'] = function (el) {
  if (!el.classList.contains('arm')) { el.classList.add('arm'); el.textContent = 'احذف؟'; setTimeout(function () { el.classList.remove('arm'); el.textContent = '×'; }, 3000); return; }
  var id = el.getAttribute('data-id'), k = +el.getAttribute('data-k'), d = XC['p:' + id]; if (!d) return;
  d = JSON.parse(JSON.stringify(d)); var gone = d.imgs.splice(k, 1)[0]; d.t = Date.now(); xcPut('p:' + id, d.imgs.length ? d : null);
  if (gone && gone.mk) { dbDel('media', gone.mk); if (MEDIA_URL[gone.mk]) { URL.revokeObjectURL(MEDIA_URL[gone.mk]); delete MEDIA_URL[gone.mk]; } }
  var card = xaCard(id); if (card) { phFill(card); xaDraw(card); }
};
document.addEventListener('change', function (e) {
  var t = e.target; if (!t.getAttribute || !t.getAttribute('data-ph-cap')) return;
  var id = t.getAttribute('data-ph-cap'), k = +t.getAttribute('data-k'), d = XC['p:' + id]; if (!d || !d.imgs[k]) return;
  d = JSON.parse(JSON.stringify(d)); d.imgs[k].cap = t.value.trim().slice(0, 200); d.t = Date.now(); xcPut('p:' + id, d);
});

/* ---------- the AI: Claude API called from the device with the user's own key ---------- */
var MODELS = [['claude-sonnet-5-5', 'Sonnet 5.5 · متوازن (مستحسن)', 2, 10], ['claude-opus-5-5', 'Opus 5.5 · الأدق', 4, 20], ['claude-haiku-5-5', 'Haiku 5.5 · الأسرع والأرخص', 0.1, 0.5]];
var MAX_PAGES = 16;
function aiModel() { return P.ai.model || MODELS[0][0]; }
function costLine(np) {
  var m = MODELS.filter(function (x) { return x[0] === aiModel(); })[0];
  if (!m) return 'التكلفة بحسب النموذج الذي اخترته في الإعدادات.';
  var inT = 3500 + np * 1600, outT = 16000, usd = (inT * m[2] + outT * m[3]) / 1e6;
  return 'التكلفة التقريبية من رصيد حسابك: نحو ' + (usd < 0.01 ? 'أقل من سنت' : usd.toFixed(2) + ' دولار') + ' لهذا الدرس، ويستغرق دقيقة إلى ثلاث.';
}
var LESSON_SYS = [
  'أنت معلم علوم خبير في المرحلة المتوسطة في المملكة العربية السعودية، ومؤلف أدلة معلم. أمامك صور صفحات درس واحد من كتاب العلوم المقرر.',
  'اكتب «مساعد الدرس» للمعلم مبنيًا على محتوى هذه الصفحات، بعربية فصيحة واضحة قصيرة الجمل، دقيقًا علميًا، مناسبًا لمستوى الطلاب. لا تنسخ فقرات الكتاب حرفيًا؛ أعد صياغتها شرحًا للمعلم.',
  'أعد كائن JSON واحدًا فقط، دون أي نص أو علامات ``` قبله أو بعده، بهذه الحقول:',
  '{"idea":"الفكرة الرئيسة في جملة","goals":["3 إلى 6 أهداف سلوكية تبدأ بفعل مضارع: يذكر، يوضح، يقارن، يفسر، يطبق"],"prior":["التعلم القبلي اللازم (1–3)"],',
  '"vocab":[{"t":"المصطلح كما في الكتاب","d":"تعريف قصير"}],"intro":"تمهيد يُعرض على الطلاب على الشاشة كما هو: سؤال مثير أو موقف من حياة الطالب السعودي، بصيغة الخطاب للطلاب، دون أي تعليمات للمعلم (لا تكتب: اعرض، اسأل، وجّههم، اطلب منهم)",',
  '"exp":[{"h":"عنوان الفقرة","page":14,"fig":0,"body":[…]}],',
  '"figs":[{"svg":"<svg …>…</svg>","cap":"وصف الرسم"}],',
  '"maps":[{"t":"عنوان الخريطة","r":{"t":"المفهوم الرئيس","c":[{"l":"كلمة الربط","t":"مفهوم","c":[{"t":"مفهوم فرعي"}]}]}}],',
  '"mis":["تصور خاطئ شائع ← التصحيح"],"life":["ربط بالحياة اليومية والبيئة السعودية"],"sum":["نقاط الخلاصة"],',
  '"acts":[{"t":"اسم نشاط صفي قصير","d":"خطواته بإيجاز، دون مواد كيميائية أو أدوات خطرة","mins":5}],"hw":["واجب منزلي قصير"],',
  '"quiz":{"mcq":[{"q":"السؤال","o":["","","",""],"a":0,"e":"تفسير الإجابة الصحيحة","lv":"تذكر|فهم|تطبيق|تحليل"}],"tf":[{"q":"عبارة","a":true,"e":"التفسير"}],"short":[{"q":"سؤال مقالي قصير","a":"الإجابة النموذجية"}]}}',
  'القواعد:',
  '- exp يغطي الدرس كله بترتيب الكتاب، من 3 إلى 7 فقرات. page رقم الصفحة المطبوع في الكتاب الذي تتناوله الفقرة. fig رقم الرسم من figs (يبدأ من 0) أو -1.',
  '- body قائمة عناصر، كل عنصر واحد من: نص فقرة، أو {"h":"عنوان فرعي"}، أو {"ul":["…"]}، أو {"ol":["خطوات"]}، أو {"box":{"k":"ex|pit|note|key|q|life","h":"عنوان الصندوق","b":["…"]}} (ex مثال، pit انتبه، note ملاحظة، key تذكّر، q سؤال يطرحه المعلم على الطلاب، life ربط بالحياة)، أو {"tb":{"t":"عنوان الجدول","hd":["…"],"r":[["…"]]}}.',
  '- كل عنصر في body كائن JSON حقيقي أو نص؛ لا تكتب الكائن داخل نص بين علامتي تنصيص. نوّع العناصر في كل فقرة: عنوان فرعي وقائمة وصندوق واحد على الأقل، ليكون الشرح مقسمًا وسهل المتابعة.',
  '- ضع المصطلح المهم بين ** ** ليظهر غامقًا، والرموز والصيغ والوحدات اللاتينية بين ` ` مثل `H2O` و`m/s`.',
  '- figs من 2 إلى 4 رسوم SVG توضيحية أصلية بسيطة واضحة (لا تحاول نسخ صور الكتاب): viewBox="0 0 600 400" أو نحوه، نص عربي font-size بين 18 و24 مع text-anchor="middle" و fill="#1B2621"، ألوان هادئة، أسهم بـ marker عند الحاجة. لا تستعمل style ولا script ولا image ولا foreignObject ولا روابط، فقط: svg g rect circle ellipse path polygon polyline line text tspan defs marker linearGradient stop title.',
  '- maps خريطة مفاهيم واحدة أو اثنتان، بعمق لا يتجاوز ثلاثة مستويات.',
  '- quiz: 8 أسئلة اختيار من متعدد متدرجة الصعوبة (a رقم الخيار الصحيح من 0 إلى 3، والخيارات الخاطئة معقولة)، و5 عبارات صح أو خطأ، و4 أسئلة مقالية قصيرة، كلها من محتوى الدرس.',
  '- لا تضف معلومات علمية من خارج الدرس إلا للتوضيح والربط بالحياة، ولا تذكر أرقام صفحات غير موجودة.'
].join('\n');
var TOC_SYS = [
  'أمامك صور صفحات الفهرس (المحتويات) من كتاب علوم مدرسي سعودي، وبعدها صورة صفحة «عينة» من داخل الكتاب.',
  'استخرج كل الدروس بترتيبها مع الوحدة والفصل ورقم صفحة بداية الدرس المطبوع في الفهرس.',
  'أعد كائن JSON واحدًا فقط دون أي نص آخر: {"lessons":[{"unit":"الوحدة 1: …","chap":"الفصل 1: …","title":"الدرس 1: …","from":12,"to":19}],"sample":37}',
  '- title يبدأ بـ «الدرس» إن كان مكتوبًا كذلك في الفهرس. لا تُدخل صفحات افتتاح الوحدات ولا مراجعة الفصول ولا المسارد ضمن الدروس.',
  '- to نهاية الدرس إن أمكن معرفتها (الصفحة التي قبل بداية العنصر التالي في الفهرس)، وإلا فاحذفه.',
  '- sample رقم الصفحة المطبوع على صورة العينة الأخيرة، أو null إن لم يظهر رقم.'
].join('\n');

function aiErr(code, msg) { var e = new Error(msg || code); e.code = code; return e; }
function aiMsg(e) {
  var c = e && e.code;
  if (c === 401) return 'مفتاح API غير صحيح أو أُلغي. راجعه في الإعدادات.';
  if (c === 403) return 'المفتاح لا يملك صلاحية هذا الطلب.';
  if (c === 429) return 'تجاوزت حد الطلبات أو نفد الرصيد مؤقتًا. انتظر دقيقة ثم أعد المحاولة.';
  if (c === 529 || c === 503 || c === 500) return 'خدمة Claude مزدحمة الآن. أعد المحاولة بعد قليل.';
  if (c === 400) return 'رُفض الطلب: ' + (e.message || '') + (/credit|balance/i.test(e.message || '') ? ' (رصيد الحساب غير كافٍ)' : '');
  if (c === 404) return 'اسم النموذج غير معروف. اختر نموذجًا آخر من الإعدادات.';
  if (c === 'net') return 'لا اتصال بالإنترنت، أو حُجب الطلب.';
  if (c === 'cut') return 'انقطع الرد قبل اكتماله. أعد المحاولة.';
  if (c === 'json') return 'وصل رد لكن صيغته غير مكتملة. أعد المحاولة.';
  if (c === 'stop') return 'أُوقف.';
  return (e && e.message) || String(e);
}
function claude(system, content, maxTokens, onText, ctl) {
  var key = (P.ai.key || '').trim(); if (!key) return Promise.reject(aiErr('nokey', 'أضف مفتاح API من الإعدادات'));
  var ac = window.AbortController ? new AbortController() : null; if (ctl) ctl.abort = function () { if (ac) ac.abort(); };
  return fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST', signal: ac ? ac.signal : undefined,
    headers: { 'content-type': 'application/json', 'x-api-key': key, 'anthropic-version': '2023-06-01', 'anthropic-dangerous-direct-browser-access': 'true' },
    body: JSON.stringify({ model: aiModel(), max_tokens: maxTokens, stream: true, system: system, messages: content.length && content[0].role ? content : [{ role: 'user', content: content }] })
  }).then(function (r) {
    if (!r.ok) return r.text().then(function (t) { var m = ''; try { m = JSON.parse(t).error.message; } catch (e) { m = t.slice(0, 200); } throw aiErr(r.status, m); });
    var rd = r.body.getReader(), dec = new TextDecoder(), buf = '', out = '', stop = '', usage = {};
    function pump() {
      return rd.read().then(function (x) {
        if (x.done) return;
        buf += dec.decode(x.value, { stream: true });
        var lines = buf.split('\n'); buf = lines.pop();
        lines.forEach(function (ln) {
          if (ln.indexOf('data:') !== 0) return; var ev; try { ev = JSON.parse(ln.slice(5)); } catch (e) { return; }
          if (ev.type === 'content_block_delta' && ev.delta && ev.delta.type === 'text_delta') { out += ev.delta.text; if (onText) onText(out.length); }
          else if (ev.type === 'message_delta' && ev.delta) { stop = ev.delta.stop_reason || stop; if (ev.usage) usage.out = ev.usage.output_tokens; }
          else if (ev.type === 'message_start' && ev.message && ev.message.usage) usage.inp = ev.message.usage.input_tokens;
          else if (ev.type === 'error') throw aiErr(ev.error && ev.error.type === 'overloaded_error' ? 529 : 'api', ev.error && ev.error.message);
        });
        return pump();
      });
    }
    return pump().then(function () { return { text: out, stop: stop, usage: usage }; });
  }, function (e) { throw e && e.name === 'AbortError' ? aiErr('stop') : aiErr('net'); });
}
function parseJSON(res) {
  var t = res.text.replace(/^\s*```(?:json)?/i, '').replace(/```\s*$/, ''), i = t.indexOf('{'), j = t.lastIndexOf('}');
  if (i < 0 || j < i) throw aiErr(res.stop === 'max_tokens' ? 'cut' : 'json');
  try { return JSON.parse(t.slice(i, j + 1)); } catch (e) { throw aiErr(res.stop === 'max_tokens' ? 'cut' : 'json'); }
}
function img(b64) { return { type: 'image', source: { type: 'base64', media_type: 'image/jpeg', data: b64 } }; }

/* one lesson */
function genLesson(b, l, extra, prog, ctl) {
  var first = pdfPage(b, l.from), last = Math.min(pdfPage(b, l.to || l.from), first + MAX_PAGES - 1), content = [];
  return openDoc(b).then(function (doc) {
    var seq = Promise.resolve();
    for (var n = first; n <= last; n++) (function (n) {
      seq = seq.then(function () { if (ctl && ctl.stopped) throw aiErr('stop'); prog('تُقرأ الصفحة ' + printedOf(b, n) + ' (' + (n - first + 1) + ' من ' + (last - first + 1) + ')'); return pageJpeg(doc, n, 1100, 0.72); })
        .then(function (d) { content.push({ type: 'text', text: 'صفحة ' + printedOf(b, n) + ':' }); content.push(img(d)); });
    })(n);
    return seq;
  }).then(function () {
    content.push({ type: 'text', text: 'الكتاب: ' + b.title + '\nالوحدة: ' + (l.unit || '') + (l.chap ? '\nالفصل: ' + l.chap : '') + '\nالدرس: ' + l.title + ' (الصفحات ' + l.from + '–' + l.to + ')' + (extra ? '\nتوجيه من المعلم: ' + extra : '') + '\nاكتب مساعد الدرس الآن بصيغة JSON المطلوبة.' });
    prog('يكتب Claude مساعد الدرس…');
    return claude(LESSON_SYS, content, 32000, function (n) { prog('يكتب Claude مساعد الدرس… ' + num(n) + ' حرفًا'); }, ctl);
  }).then(function (res) {
    var d = cleanAid(parseJSON(res));
    return storeAid(b, l, d, 'ai', { model: aiModel(), usage: res.usage }).then(function () { return d; });
  });
}
function progModal(title, stopAct) {
  var m = document.getElementById('modal'); m.__busy = true;
  openModal(card('<h2>' + esc(title) + '</h2><p class="muted" id="ai-prog">…</p><div class="prog"><b id="ai-bar" style="width:4%"></b></div><p class="small muted">أبقِ التطبيق مفتوحًا حتى ينتهي.</p><div class="actions"><button class="btn ghost" data-act="' + stopAct + '">إيقاف</button></div>'));
  return function (t, p) { var e = document.getElementById('ai-prog'); if (e) e.textContent = t; var bb = document.getElementById('ai-bar'); if (bb && p != null) bb.style.width = clamp(p, 4, 100) + '%'; };
}
function doneModal(html) { var m = document.getElementById('modal'); m.__busy = false; openModal(card(html + '<div class="actions"><button class="btn" data-act="modal-close">حسنًا</button></div>')); }
var GEN = null;
ACT['gen-one'] = function (el) {
  var x = lessonByKey(el.getAttribute('data-k')); if (!x) return;
  if (!P.ai.key) { toast('أضف مفتاح Claude API أولًا'); ACT.settings(); return; }
  var ex = document.getElementById('gen-extra'), extra = ex ? ex.value.trim() : '';
  GEN = { stopped: false }; wake(true);
  var t0 = Date.now(), prog = progModal('تجهيز «' + x.l.title + '»', 'gen-stop'), tick = setInterval(function () { var bb = document.getElementById('ai-bar'); if (bb) bb.style.width = clamp((Date.now() - t0) / 1500, 4, 95) + '%'; }, 500);
  genLesson(x.b, x.l, extra, function (t) { prog(t); }, GEN).then(function (d) {
    clearInterval(tick); wake(false); var m = document.getElementById('modal'); m.__busy = false; closeModal();
    route.tab = 'goals'; render(); var c = aidCounts(d); toast('جاهز: ' + cnt(d.exp.length, ['فقرة واحدة', 'فقرتان', 'فقرات', 'فقرة']) + ' شرح، و' + cnt(c.f, ['رسم واحد', 'رسمان', 'رسوم', 'رسمًا']) + '، و' + cnt(c.q, WORDS.q), 4000);
  }, function (e) { clearInterval(tick); wake(false); doneModal('<h2>لم يكتمل التجهيز</h2><p class="muted">' + esc(aiMsg(e)) + '</p>'); });
};
ACT['gen-stop'] = function () { if (GEN) { GEN.stopped = true; if (GEN.abort) GEN.abort(); } var m = document.getElementById('modal'); m.__busy = false; closeModal(); wake(false); };
ACT['gen-all'] = function () {
  var b = curBook(); if (!b) return;
  if (!P.ai.key) { toast('أضف مفتاح Claude API أولًا'); ACT.settings(); return; }
  var todo = b.lessons.filter(function (l) { return !aidOf(b, l); }), pages = todo.reduce(function (s, l) { return s + Math.min(l.to - l.from + 1, MAX_PAGES); }, 0);
  var m = MODELS.filter(function (x) { return x[0] === aiModel(); })[0], usd = m ? ((3500 * todo.length + pages * 1600) * m[2] + 16000 * todo.length * m[3]) / 1e6 : 0;
  openModal(card('<h2>تجهيز ' + cnt(todo.length, WORDS.lesson) + '</h2><p class="muted">يُجهَّز درس بعد درس، ونحو دقيقتين لكل درس. ' + (m ? 'التكلفة التقريبية نحو ' + usd.toFixed(2) + ' دولار من رصيد حسابك.' : '') + ' تستطيع الإيقاف في أي وقت، وما اكتمل يبقى.</p><div class="actions"><button class="btn" data-act="gen-all-yes">ابدأ</button><button class="btn ghost" data-act="modal-close">إلغاء</button></div>'));
};
ACT['gen-all-yes'] = function () {
  var b = curBook(), todo = b.lessons.filter(function (l) { return !aidOf(b, l); }), ok = 0, bad = [];
  GEN = { stopped: false }; wake(true);
  var prog = progModal('تجهيز مساعد الدروس', 'gen-stop');
  todo.reduce(function (p, l, i) {
    return p.then(function () {
      if (GEN.stopped) return;
      var head = 'الدرس ' + (i + 1) + ' من ' + todo.length + ': ' + l.title + ' — ';
      prog(head, i / todo.length * 100);
      return genLesson(b, l, '', function (t) { prog(head + t, (i + 0.5) / todo.length * 100); }, GEN).then(function () { ok++; topMeta(); }, function (e) {
        if (e && e.code === 'stop') return;
        bad.push(l.title + ': ' + aiMsg(e));
        if (e && (e.code === 401 || e.code === 403 || e.code === 404 || e.code === 'net' || /credit|balance/i.test(e.message || ''))) GEN.stopped = true;
      });
    });
  }, Promise.resolve()).then(function () {
    wake(false); render(true);
    doneModal('<h2>' + (ok ? 'جُهّز ' + cnt(ok, WORDS.lesson) : 'لم يُجهّز أي درس') + '</h2>' + (bad.length ? '<ul class="imp-res">' + bad.map(function (x) { return '<li class="bad"><span class="small">' + esc(x) + '</span></li>'; }).join('') + '</ul>' : '') + (GEN.stopped && ok + bad.length < todo.length ? '<p class="small muted">توقف قبل إكمال الكل؛ اضغط «جهّز مساعد الدروس الباقية» لاحقًا.</p>' : ''));
  });
};

/* reading the table of contents */
ACT['toc-ai'] = function () {
  var b = curBook();
  if (!P.ai.key) { toast('أضف مفتاح Claude API أولًا'); ACT.settings(); return; }
  openModal(card('<h2>قراءة فهرس الكتاب</h2><p class="muted">اكتب أرقام صفحات الفهرس كما تظهر في عارض الكتاب (ترتيبها في الملف، من 1 إلى ' + (b.pages || '…') + '). تجدها في «الكتاب»: الرقم الثاني أعلى الصفحة.</p>' +
    '<div class="row2"><label class="field"><span>من صفحة</span><input type="number" inputmode="numeric" id="toc-a" value="' + (P.tocA || 3) + '" data-focus></label><label class="field"><span>إلى صفحة</span><input type="number" inputmode="numeric" id="toc-b" value="' + (P.tocB || 6) + '"></label></div>' +
    '<div class="actions"><button class="btn" data-act="toc-ai-yes">اقرأ الفهرس</button><button class="btn ghost" data-act="modal-close">إلغاء</button></div><p class="small muted">تكلفته أقل من سنتين في الغالب.</p>'));
};
ACT['toc-ai-yes'] = function () {
  var b = curBook(), a = +document.getElementById('toc-a').value, z = +document.getElementById('toc-b').value;
  if (!(a >= 1) || !(z >= a)) { toast('اكتب رقمي الصفحتين'); return; }
  z = Math.min(z, a + 9, b.pages || z); P.tocA = a; P.tocB = z; savePref();
  GEN = { stopped: false };
  var prog = progModal('قراءة الفهرس', 'gen-stop'), content = [], sample = Math.min(b.pages || z + 20, z + 20);
  openDoc(b).then(function (doc) {
    var seq = Promise.resolve();
    for (var n = a; n <= z; n++) (function (n) { seq = seq.then(function () { prog('تُقرأ صفحة ' + n); return pageJpeg(doc, n, 1300, 0.75); }).then(function (d) { content.push(img(d)); }); })(n);
    return seq.then(function () { return pageJpeg(doc, sample, 900, 0.7); }).then(function (d) { content.push({ type: 'text', text: 'صفحة العينة:' }); content.push(img(d)); });
  }).then(function () {
    content.push({ type: 'text', text: 'استخرج الدروس الآن بصيغة JSON المطلوبة.' });
    prog('يقرأ Claude الفهرس…');
    return claude(TOC_SYS, content, 12000, function (n) { prog('يقرأ Claude الفهرس… ' + num(n) + ' حرفًا'); }, GEN);
  }).then(function (res) {
    var o = parseJSON(res), list = arr(o.lessons).filter(function (x) { return x && x.title && +x.from > 0; }).map(function (x) { return { id: uid('l'), unit: str(x.unit), chap: str(x.chap), title: str(x.title), from: +x.from, to: +x.to || 0 }; });
    if (!list.length) throw aiErr('json');
    list.sort(function (p, q) { return p.from - q.from; });
    if (+o.sample > 0) b.offset = sample - +o.sample;
    fillTo(list, b); b.lessons = list; saveBook(b); render();
    doneModal('<h2>استُخرج ' + cnt(list.length, WORDS.lesson) + '</h2><p class="muted">' + (+o.sample > 0 ? 'وضُبط ترقيم الصفحات تلقائيًا (صفحة ' + sample + ' في الملف = ص ' + (+o.sample) + ').' : 'لم يُعرف ترقيم الصفحات؛ اضبطه من «الكتاب» ← رقم الصفحة أعلاه.') + ' راجع القائمة من «عدّل قائمة الدروس» قبل التجهيز.</p>');
  })['catch'](function (e) { doneModal('<h2>تعذّرت قراءة الفهرس</h2><p class="muted">' + esc(aiMsg(e)) + '</p>'); });
};
ACT['ai-test'] = function () {
  var k = document.getElementById('ai-key'); if (k) { P.ai.key = k.value.trim(); savePref(); }
  var out = document.getElementById('ai-test-out'); if (out) out.textContent = 'جارٍ التجربة…';
  claude('أجب بكلمة واحدة.', [{ type: 'text', text: 'قل: جاهز' }], 50, null).then(function (r) { if (out) out.textContent = '✓ المفتاح يعمل (' + aiModel() + '): ' + r.text.trim().slice(0, 30); }, function (e) { if (out) out.textContent = '✗ ' + aiMsg(e); });
};

/* ---------- Claude solves the questions printed on a page, and the answers sit on the page itself ----------
   Kept in the notes store as a:<bookId>:<page> {items:[{n, q, a, x, y, w, c}], t, model}; x, y, w in page units (the page is 1000 wide, like the ink).
   They go into the backup and the sync with the rest of the notes. */
var SOLVE_SYS = [
  'أنت معلم علوم خبير في المرحلة المتوسطة في المملكة العربية السعودية. أمامك صورة صفحة واحدة من كتاب العلوم المقرر.',
  'ابحث في الصفحة عن كل سؤال يطلب من الطالب إجابة: أسئلة «اختبر نفسك» و«مراجعة الدرس» و«التفكير الناقد» و«تطبيق الرياضيات» و«ماذا قرأت؟» و«تحقق» وأسئلة الصور والجداول ومراجعة الفصل والاختبار المقنن، وأي سؤال مرقّم أو مسبوق بفعل أمر (صف، وضح، فسر، قارن، احسب، ماذا، لماذا، كيف…).',
  'أجب عن كل سؤال إجابة نموذجية دقيقة علميًا كما يتوقعها المعلم من طالب متوسط، بعربية فصيحة مختصرة: جملة أو جملتان غالبًا. في الاختيار من متعدد اكتب رمز الخيار ونصه. في المسائل الحسابية اكتب القانون والتعويض والناتج بالوحدة، وضع المعادلة كاملة بأرقامها ووحدتها بين علامتي ` ` مثل `KE = ½ × 2 × 5² = 25 J` حتى لا تنقلب مع النص العربي. التزم بما في الكتاب ومصطلحاته.',
  'أعد كائن JSON واحدًا فقط، دون أي نص أو علامات ``` قبله أو بعده:',
  '{"items":[{"n":"رقم السؤال كما في الكتاب","q":"نص السؤال مختصرًا","a":"الإجابة النموذجية","box":[x0,y0,x1,y1],"spot":[x0,y0,x1,y1]}]}',
  'الإحداثيات أرقام من 0 إلى 1000 نسبة إلى عرض الصورة وارتفاعها، والأصل في أعلى يسار الصورة: x يزيد إلى اليمين و y يزيد إلى الأسفل.',
  '- box: المستطيل الذي يحيط بنص السؤال في الصورة.',
  '- spot: مساحة بيضاء فارغة قريبة من السؤال (تحته أو بجانبه أو في الهامش) تكفي لكتابة الإجابة دون أن تغطي كلامًا مطبوعًا. إن لم توجد فاكتب null.',
  '- رتّب الأسئلة كما تظهر في الصفحة. إن لم يكن في الصفحة أسئلة فأعد {"items":[]}. لا تخترع أسئلة غير موجودة، وإن كان جزء من السؤال غير مقروء فقل ذلك في الإجابة.'
].join('\n');
var SOLVE = null;
function ansKey(b, n) { return 'a:' + b.id + ':' + n; }
function ansOf(b, n) { return XC[ansKey(b, n)] || null; }
function ansOn() { return !P.rt || P.rt.ans !== false; }
function ansSave(b, n, rec) { rec.k = ansKey(b, n); rec.t = Date.now(); XC[rec.k] = rec; dbPut('notes', rec); }
function solvePage(doc, b, n, ratio, ctl) { // one page: image to Claude, answers placed in page units
  return pageJpeg(doc, n, 1400, 0.78).then(function (d) {
    if (ctl && ctl.stopped) throw aiErr('stop');
    var l = lessonAtPage(b, n);
    return claude(SOLVE_SYS, [img(d), { type: 'text', text: 'الكتاب: ' + b.title + (l ? '\nالدرس: ' + l.title : '') + '\nالصفحة ' + printedOf(b, n) + '. حلّ أسئلتها بصيغة JSON المطلوبة.' }], 6000, null, ctl);
  }).then(function (res) {
    var o = parseJSON(res), H = 1000 / ratio, items = [];
    (Array.isArray(o.items) ? o.items : []).forEach(function (it) {
      if (!it || !it.a) return;
      var bx = Array.isArray(it.box) && it.box.length === 4 ? it.box.map(Number) : null, sp = Array.isArray(it.spot) && it.spot.length === 4 ? it.spot.map(Number) : null;
      var x, y, w;
      if (sp && sp.every(isFinite) && sp[2] - sp[0] >= 120) { x = sp[0]; y = sp[1] * H / 1000; w = sp[2] - sp[0]; }
      else if (bx && bx.every(isFinite)) { x = bx[0]; y = bx[3] * H / 1000 + 4; w = Math.max(260, bx[2] - bx[0]); }
      else { x = 40; y = 40 + items.length * 70; w = 420; }
      w = clamp(w, 200, 900); x = clamp(x, 0, 1000 - w); y = clamp(y, 0, H - 30);
      items.push({ n: String(it.n || items.length + 1).slice(0, 8), q: String(it.q || '').slice(0, 400), a: String(it.a).slice(0, 1200), x: Math.round(x), y: Math.round(y), w: Math.round(w) });
    });
    var rec = { items: items, model: aiModel(), page: n };
    ansSave(b, n, rec);
    return rec;
  });
}
/* drawing the answers on a page */
function drawAns(pg) {
  var R = RD; if (!R || !pg.a) return;
  var rec = ansOf(R.b, pg.n);
  if (!rec || !rec.items.length || !ansOn()) { pg.a.innerHTML = ''; return; }
  var H = 1000 / pg.ratio;
  pg.a.innerHTML = rec.items.map(function (it, i) {
    return '<div class="ans' + (it.c ? ' c' : '') + '" data-i="' + i + '" style="left:' + (it.x / 10) + '%;top:' + (it.y / H * 100) + '%;width:' + (it.c ? 'auto' : (it.w / 10) + '%') + '"><b class="ans-n">' + esc(it.n) + '</b><span class="ans-t">' + fx(it.a) + '</span></div>';
  }).join('');
}
function drawAnsAll() { if (RD) RD.pages.forEach(function (pg) { if (pg.a) drawAns(pg); }); }
function hookAns(R, pg) { // a tap folds an answer to its number (to reveal it later in class); a drag moves it
  var drag = null;
  pg.a.addEventListener('pointerdown', function (e) {
    var el = e.target.closest('.ans'); if (!el) return;
    e.preventDefault(); e.stopPropagation();
    var r = pg.el.getBoundingClientRect();
    drag = { el: el, i: +el.getAttribute('data-i'), x0: e.clientX, y0: e.clientY, l: el.offsetLeft, t: el.offsetTop, W: r.width, moved: false, id: e.pointerId };
    try { el.setPointerCapture(e.pointerId); } catch (x) {}
  });
  pg.a.addEventListener('pointermove', function (e) {
    if (!drag || e.pointerId !== drag.id) return;
    var dx = e.clientX - drag.x0, dy = e.clientY - drag.y0;
    if (!drag.moved && Math.abs(dx) + Math.abs(dy) < 8) return;
    drag.moved = true; drag.el.classList.add('drag');
    drag.el.style.left = (drag.l + dx) + 'px'; drag.el.style.top = (drag.t + dy) + 'px';
  });
  function up(e) {
    if (!drag || e.pointerId !== drag.id) return;
    var d = drag; drag = null; d.el.classList.remove('drag');
    var rec = ansOf(R.b, pg.n); if (!rec || !rec.items[d.i]) return;
    var it = rec.items[d.i], k = d.W / 1000;
    if (d.moved) { it.x = Math.round(clamp(d.el.offsetLeft / k, 0, 990)); it.y = Math.round(Math.max(0, d.el.offsetTop / k)); }
    else it.c = !it.c;
    ansSave(R.b, pg.n, rec); drawAns(pg);
  }
  pg.a.addEventListener('pointerup', up); pg.a.addEventListener('pointercancel', up);
}
/* the sheet: this page's answers, and solving a page or a range */
ACT['rd-solve'] = function () {
  var R = RD; if (!R) return;
  var b = R.b, n = R.cur, rec = ansOf(b, n), l = lessonAtPage(b, n), pr = printedOf(b, n);
  var from = l ? l.from : pr, to = l ? (l.to || l.from) : pr;
  var list = rec && rec.items.length ? '<ol class="ans-list">' + rec.items.map(function (it) { return '<li><b>' + esc(it.n) + (it.q ? ' · ' + esc(it.q) : '') + '</b><span>' + fx(it.a) + '</span></li>'; }).join('') + '</ol>' : '';
  openModal(sheet('حلّ أسئلة الكتاب مع Claude',
    '<section class="set-sec"><h3>صفحة ' + (pr >= 1 ? pr : n) + '</h3>' +
    (rec ? (rec.items.length ? '<p class="small muted">حلّ Claude ' + cnt(rec.items.length, WORDS.q) + ' في هذه الصفحة. الإجابات مكتوبة على الصفحة: اضغط إجابة لتطويها إلى رقمها (فتكشفها للطلاب لاحقًا)، واسحبها لتنقلها إن غطّت شيئًا.</p>' + list : '<p class="small muted">لم يجد Claude أسئلة في هذه الصفحة.</p>') : '<p class="small muted">يقرأ Claude صورة الصفحة ويحل كل سؤال فيها، ثم تظهر الإجابة على الصفحة نفسها بجانب السؤال.</p>') +
    '<div class="actions" style="margin-top:0"><button class="btn" data-act="solve-run" data-from="' + pr + '" data-to="' + pr + '" data-redo="1">' + (rec ? 'أعد حلّ هذه الصفحة' : 'حلّ أسئلة هذه الصفحة') + '</button>' +
    (rec && rec.items.length ? '<button class="btn ghost sm danger" data-act="solve-del">احذف حلولها</button>' : '') + '</div></section>' +
    '<section class="set-sec"><h3>صفحات أكثر</h3><p class="small muted">للدرس كله ومراجعة الفصل والاختبار المقنن. تُتخطى الصفحات المحلولة من قبل، والصفحات التي لا أسئلة فيها لا يظهر عليها شيء. التكلفة نحو سنتين لكل صفحة مع Sonnet.</p>' +
    '<div class="actions" style="margin-top:0;align-items:end"><label class="field" style="margin:0;flex:1"><span>من صفحة</span><input type="number" inputmode="numeric" id="sv-from" value="' + from + '"></label><label class="field" style="margin:0;flex:1"><span>إلى صفحة</span><input type="number" inputmode="numeric" id="sv-to" value="' + to + '"></label></div>' +
    '<div class="actions"><button class="btn ghost" data-act="solve-run">حلّ أسئلة هذه الصفحات</button></div></section>' +
    '<section class="set-sec"><h3>العرض</h3>' + segBtns('solve-show', ansOn() ? 'on' : 'off', [['on', 'أظهر الإجابات على الصفحات'], ['off', 'أخفِها']]) + '</section>'), true);
};
ACT['solve-show'] = function (el) { P.rt = P.rt || {}; P.rt.ans = el.getAttribute('data-v') === 'on'; savePref(); drawAnsAll(); ACT['rd-solve'](); };
ACT['solve-del'] = function (el) {
  var R = RD; if (!R) return;
  if (!el.classList.contains('arm')) { el.classList.add('arm'); el.textContent = 'اضغط مرة ثانية للحذف'; return; }
  var k = ansKey(R.b, R.cur); delete XC[k]; dbDel('notes', k); drawAnsAll(); closeModal(); toast('حُذفت حلول هذه الصفحة');
};
ACT['solve-run'] = function (el) {
  var R = RD; if (!R) return;
  if (!P.ai.key) { toast('أضف مفتاح Claude API أولًا من الإعدادات'); ACT.settings(); return; }
  var b = R.b, f = el.getAttribute('data-from'), t = el.getAttribute('data-to'), redo = !!el.getAttribute('data-redo');
  if (f == null) { f = document.getElementById('sv-from').value; t = document.getElementById('sv-to').value; }
  var a = pdfPage(b, +f), z = pdfPage(b, +t); if (!isFinite(a) || !isFinite(z)) return; if (z < a) { var s = a; a = z; z = s; }
  if (z - a > 40) { toast('اختر 40 صفحة على الأكثر في المرة الواحدة'); return; }
  var pages = []; for (var n = a; n <= z; n++) if (redo || !ansOf(b, n)) pages.push(n);
  if (!pages.length) { toast('هذه الصفحات محلولة من قبل'); return; }
  SOLVE = { stopped: false }; wake(true);
  var prog = progModal('Claude يحلّ الأسئلة', 'solve-stop'), done = 0, found = 0, failed = [];
  pages.reduce(function (p, n, i) {
    return p.then(function () {
      if (SOLVE.stopped) throw aiErr('stop');
      prog('صفحة ' + printedOf(b, n) + ' (' + (i + 1) + ' من ' + pages.length + ')…', (i + 0.3) / pages.length * 100);
      return solvePage(R.doc, b, n, (R.pages[n - 1] && R.pages[n - 1].ratio) || R.ratio, SOLVE).then(function (rec) {
        done++; found += rec.items.length; var pg = RD && RD.pages[n - 1]; if (pg) drawAns(pg);
      }, function (e) { if (e.code === 'stop' || e.code === 401 || e.code === 'nokey' || e.code === 'net') throw e; failed.push(printedOf(b, n)); });
    });
  }, Promise.resolve()).then(function () {
    wake(false); var first = pages.filter(function (n) { var r = ansOf(b, n); return r && r.items.length; })[0];
    doneModal('<h2>' + (found ? 'حُلّ ' + cnt(found, WORDS.q) : 'لا أسئلة') + '</h2><p class="muted">' + (found ? 'في ' + cnt(pages.filter(function (n) { var r = ansOf(b, n); return r && r.items.length; }).length, ['صفحة واحدة', 'صفحتين', 'صفحات', 'صفحة']) + '. الإجابات مكتوبة على الصفحات بجانب كل سؤال؛ راجعها قبل أن تعرضها، واسحب أي إجابة إن احتاجت مكانًا أنسب.' : 'لم يجد Claude أسئلة في هذه الصفحات.') + (failed.length ? ' تعذّر حل الصفحات: ' + failed.join('، ') + '؛ أعد المحاولة لها.' : '') + '</p>');
    if (first && RD) { RD.cur = first; scrollToPage(first, true); trackPage(RD); }
  }, function (e) { wake(false); doneModal('<h2>' + (e.code === 'stop' ? 'أُوقف' : 'لم يكتمل الحل') + '</h2><p class="muted">' + (done ? 'حُلّت ' + cnt(done, ['صفحة واحدة', 'صفحتان', 'صفحات', 'صفحة']) + ' قبل التوقف. ' : '') + (e.code === 'stop' ? '' : esc(aiMsg(e))) + '</p>'); });
};
ACT['solve-stop'] = function () { if (SOLVE) { SOLVE.stopped = true; if (SOLVE.abort) SOLVE.abort(); } };

/* ---------- sticky notes: a note stuck on a page or a card, typed or handwritten ----------
   On the note itself: the Apple Pencil writes, a finger drags it, a tap opens it. Inside the open note the finger writes too.
   Positions are in units of the holder's width (1000 = full width); handwriting is in the note's own 1000 × 800 box. */
var STK_C = ['#FFE873', '#FFC6DC', '#C2F0C8', '#C4E4FF'], STK_N = ['أصفر', 'وردي', 'أخضر', 'أزرق'], STK_ED = null;
var STK_INK = ['#2A2412', '#C62828', '#1F5FB8'], STK_INKN = ['أسود', 'أحمر', 'أزرق'], STK_H = 800;
function stkPath(st) {
  var p = st.p || [], d = '';
  for (var j = 0; j < p.length; j += 3) d += (j ? 'L' : 'M') + p[j] + ' ' + p[j + 1];
  if (p.length === 3) d += 'l0.1 0';
  return '<path d="' + d + '" stroke="' + (STK_INK[st.c || 0] || STK_INK[0]) + '" stroke-width="' + (st.w || 9) + '"/>';
}
function stkSvg(ink) { return '<svg class="stk-ink" viewBox="0 0 1000 ' + STK_H + '" preserveAspectRatio="none" aria-hidden="true">' + (ink || []).map(stkPath).join('') + '</svg>'; }
function stkHtml(items) {
  return (items || []).map(function (it, i) {
    var ink = it.ink && it.ink.length;
    return '<div class="stk' + (it.m ? ' m' : '') + (ink ? ' has-ink' : '') + '" data-i="' + i + '" style="left:' + (it.x / 10) + '%;top:' + (it.y / 10) + 'cqw;--sc:' + (STK_C[it.c || 0] || STK_C[0]) + '" role="note" aria-label="لاصقة' + (it.txt ? ': ' + esc(it.txt.slice(0, 60)) : '') + '">' +
      (it.m ? '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 4h14v10l-5 6H5z"/><path d="M14 20v-6h5"/></svg>' : (it.txt ? '<span>' + esc(it.txt) + '</span>' : '') + stkSvg(it.ink)) + '</div>';
  }).join('');
}
function stkPt(box, e) { var r = box.getBoundingClientRect(); return [Math.round(Math.max(0, Math.min(1000, (e.clientX - r.left) / (r.width || 1) * 1000))), Math.round(Math.max(0, Math.min(STK_H, (e.clientY - r.top) / (r.height || 1) * STK_H))), Math.round(Math.max(0.1, Math.min(1, e.pressure || 0.5)) * 99)]; }
function stkInkBegin(svg, e, col, w) { // a live stroke drawn into the note's svg
  var st = { c: col || 0, w: w || 9, p: stkPt(svg, e) }, el = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  el.setAttribute('stroke', STK_INK[st.c]); el.setAttribute('stroke-width', st.w); svg.appendChild(el);
  return { st: st, el: el, svg: svg, add: function (ev) { var q = stkPt(svg, ev), p = st.p, n = p.length; if (Math.abs(p[n - 3] - q[0]) + Math.abs(p[n - 2] - q[1]) < 3) return; p.push(q[0], q[1], q[2]); var d = ''; for (var j = 0; j < p.length; j += 3) d += (j ? 'L' : 'M') + p[j] + ' ' + p[j + 1]; el.setAttribute('d', d); } };
}
function stkBind(layer, ctx) { // ctx: {host(), get(), set(items)}
  var drag = null, pen = null;
  layer.addEventListener('pointerdown', function (e) {
    var el = e.target.closest && e.target.closest('.stk'); if (!el) return;
    e.preventDefault(); e.stopPropagation();
    var i = +el.getAttribute('data-i'), it = ctx.get()[i];
    if (e.pointerType === 'pen' && it && !it.m) { // the pencil writes on the note where it is
      var svg = el.querySelector('svg.stk-ink'); if (!svg) return;
      pen = stkInkBegin(svg, e, STK_LAST.ink, 9); pen.i = i; pen.id = e.pointerId; pen.x0 = e.clientX; pen.y0 = e.clientY;
      try { el.setPointerCapture(e.pointerId); } catch (x) {}
      return;
    }
    drag = { el: el, i: i, x0: e.clientX, y0: e.clientY, l: el.offsetLeft, t: el.offsetTop, W: ctx.host().getBoundingClientRect().width || 1, moved: false, id: e.pointerId };
    try { el.setPointerCapture(e.pointerId); } catch (x) {}
  });
  layer.addEventListener('pointermove', function (e) {
    if (pen && e.pointerId === pen.id) { var evs = e.getCoalescedEvents ? e.getCoalescedEvents() : [e]; (evs.length ? evs : [e]).forEach(pen.add); return; }
    if (!drag || e.pointerId !== drag.id) return;
    var dx = e.clientX - drag.x0, dy = e.clientY - drag.y0;
    if (!drag.moved && Math.abs(dx) + Math.abs(dy) < 8) return;
    drag.moved = true; drag.el.classList.add('drag');
    drag.el.style.left = (drag.l + dx) + 'px'; drag.el.style.top = (drag.t + dy) + 'px';
  });
  function up(e) {
    if (pen && e.pointerId === pen.id) {
      var P = pen; pen = null; var items = ctx.get(), it = items[P.i]; if (!it) return;
      if (P.st.p.length <= 6 && Math.abs(e.clientX - P.x0) + Math.abs(e.clientY - P.y0) < 6) { P.el.remove(); stkEdit(ctx, P.i); return; } // a tap of the pencil opens the note
      (it.ink = it.ink || []).push(P.st); it.at = Date.now(); ctx.set(items); return;
    }
    if (!drag || e.pointerId !== drag.id) return;
    var d = drag; drag = null; d.el.classList.remove('drag');
    var items2 = ctx.get(), it2 = items2[d.i]; if (!it2) return;
    if (d.moved) { var k = d.W / 1000, H = (ctx.host().getBoundingClientRect().height || 1) / k; it2.x = Math.round(Math.max(0, Math.min(980, d.el.offsetLeft / k))); it2.y = Math.round(Math.max(0, Math.min(H - 20, d.el.offsetTop / k))); ctx.set(items2); }
    else if (it2.m) { it2.m = false; ctx.set(items2); }
    else stkEdit(ctx, d.i);
  }
  layer.addEventListener('pointerup', up); layer.addEventListener('pointercancel', up);
}
var STK_LAST = { ink: 0 };
function stkAdd(ctx, w) { // a new note in the middle of what is on screen of this holder
  var host = ctx.host(), r = host.getBoundingClientRect(), k = (r.width || 1) / 1000;
  var mid = Math.max(20, Math.min(r.height - 120, window.innerHeight / 2 - r.top - 60));
  stkEdit(ctx, -1, { id: Date.now().toString(36), x: Math.round((1000 - w) / 2), y: Math.round(mid / k), txt: '', ink: [], c: 0, at: Date.now() }); // kept only once something is written
}
function stkEdit(ctx, i, fresh) {
  var it = fresh || ctx.get()[i]; if (!it) return;
  STK_ED = { ctx: ctx, i: i, fresh: fresh || null, c: it.c || 0, ink: JSON.parse(JSON.stringify(it.ink || [])) };
  openModal('<div class="modal-card stk-ed" role="dialog" aria-modal="true" aria-label="لاصقة" style="--sc:' + STK_C[it.c || 0] + '">' +
    '<div class="stk-pad" id="stk-pad" aria-label="اكتب هنا بالقلم أو بإصبعك">' + stkSvg(STK_ED.ink) + '<span class="stk-hint"' + (STK_ED.ink.length ? ' hidden' : '') + '>اكتب هنا بقلم الآيباد أو بإصبعك</span></div>' +
    '<textarea id="stk-t" rows="2" placeholder="أو اكتب نصًا بلوحة المفاتيح…">' + esc(it.txt || '') + '</textarea>' +
    '<div class="stk-tools"><span class="stk-cs">' + STK_INK.map(function (c, k) { return '<button type="button" data-stk="ink" data-v="' + k + '" aria-label="قلم ' + STK_INKN[k] + '" aria-pressed="' + (STK_LAST.ink === k) + '" style="--c:' + c + '"></button>'; }).join('') + '</span>' +
    '<button type="button" class="stk-tb" data-stk="undo">تراجع</button><button type="button" class="stk-tb" data-stk="wipe">امسح الكتابة</button></div>' +
    '<div class="stk-cs stk-bg">' + STK_C.map(function (c, k) { return '<button type="button" data-stk="col" data-v="' + k + '" aria-label="لاصقة ' + STK_N[k] + '" aria-pressed="' + ((it.c || 0) === k) + '" style="--c:' + c + '"></button>'; }).join('') + '</div>' +
    '<div class="actions"><button class="btn" data-stk="save">احفظ</button><button class="btn ghost" data-stk="min">صغّرها</button><button class="btn ghost danger" data-stk="del">احذف</button></div></div>');
  stkPadBind(document.getElementById('stk-pad'));
}
function stkPadBind(pad) { // inside the open note: pencil and finger both write
  if (!pad) return; var cur = null;
  pad.addEventListener('pointerdown', function (e) {
    e.preventDefault(); var a = document.activeElement; if (a && a.blur && a.id === 'stk-t') a.blur();
    var h = pad.querySelector('.stk-hint'); if (h) h.hidden = true;
    cur = stkInkBegin(pad.querySelector('svg.stk-ink'), e, STK_LAST.ink, 9); cur.id = e.pointerId; try { pad.setPointerCapture(e.pointerId); } catch (x) {}
  });
  pad.addEventListener('pointermove', function (e) { if (cur && e.pointerId === cur.id) { var evs = e.getCoalescedEvents ? e.getCoalescedEvents() : [e]; (evs.length ? evs : [e]).forEach(cur.add); } });
  function up(e) { if (!cur || e.pointerId !== cur.id) return; var c = cur; cur = null; if (STK_ED) STK_ED.ink.push(c.st); }
  pad.addEventListener('pointerup', up); pad.addEventListener('pointercancel', up);
}
function stkRedrawPad() { var pad = document.getElementById('stk-pad'); if (!pad || !STK_ED) return; var old = pad.querySelector('svg.stk-ink'), w = document.createElement('div'); w.innerHTML = stkSvg(STK_ED.ink); pad.replaceChild(w.firstChild, old); }
function stkDone(act) {
  var E = STK_ED; if (!E) return; var items = E.ctx.get(), it = E.fresh || items[E.i]; if (!it) { STK_ED = null; closeModal(); return; }
  var t = document.getElementById('stk-t'), txt = t ? t.value.trim().slice(0, 2000) : it.txt, empty = !txt && !E.ink.length;
  if (E.fresh && (act === 'del' || empty)) { STK_ED = null; closeModal(); return; } // an empty new note is not kept
  if (!E.fresh && (act === 'del' || (empty && act !== 'min'))) items.splice(E.i, 1);
  else { it.txt = txt; it.ink = E.ink; it.c = E.c; it.m = act === 'min'; it.at = Date.now(); if (E.fresh) items.push(it); }
  STK_ED = null; E.ctx.set(items); closeModal();
  if (act === 'del') toast('حُذفت اللاصقة');
}
document.addEventListener('click', function (e) {
  var b = e.target && e.target.closest ? e.target.closest('[data-stk]') : null; if (!b || !STK_ED) return;
  e.preventDefault(); e.stopPropagation();
  var a = b.getAttribute('data-stk');
  if (a === 'col') { STK_ED.c = +b.getAttribute('data-v'); var m = b.closest('.stk-ed'); if (m) m.style.setProperty('--sc', STK_C[STK_ED.c]); Array.prototype.forEach.call(b.parentNode.children, function (x) { x.setAttribute('aria-pressed', String(x === b)); }); return; }
  if (a === 'ink') { STK_LAST.ink = +b.getAttribute('data-v'); Array.prototype.forEach.call(b.parentNode.children, function (x) { x.setAttribute('aria-pressed', String(x === b)); }); return; }
  if (a === 'undo') { STK_ED.ink.pop(); stkRedrawPad(); return; }
  if (a === 'wipe') { STK_ED.ink = []; stkRedrawPad(); return; }
  stkDone(a);
}, true);
/* kitabi: notes on the book pages, kept in the notes store as n:<bookId>:<page> {items:[{id, x, y, txt, c, m}]} (backup and sync with the rest) */
function stkKey(b, n) { return 'n:' + b.id + ':' + n; }
function stkCtx(R, pg) {
  return {
    host: function () { return pg.el; },
    get: function () { var r = XC[stkKey(R.b, pg.n)]; return r && Array.isArray(r.items) ? JSON.parse(JSON.stringify(r.items)) : []; },
    set: function (items) { var k = stkKey(R.b, pg.n); if (!items.length) { delete XC[k]; dbDel('notes', k); } else { var rec = { k: k, items: items, t: Date.now() }; XC[k] = rec; dbPut('notes', rec); } drawStk(pg); }
  };
}
function drawStk(pg) { var R = RD; if (!R || !pg.s) return; var r = XC[stkKey(R.b, pg.n)]; pg.s.innerHTML = stkHtml(r && r.items); }
function drawStkAll() { if (RD) RD.pages.forEach(function (pg) { if (pg.s) drawStk(pg); }); }
ACT['rd-stk'] = function () { var R = RD; if (!R) return; var pg = R.pages[R.cur - 1]; if (pg && pg.stk) stkAdd(pg.stk, 260); };

/* and on the explanation cards of a lesson: n:<cardId>, laid over the card */
function stkCtxCard(card) {
  var id = card.id.slice(2), k = 'n:' + id;
  return {
    host: function () { return card; },
    get: function () { var r = XC[k]; return r && Array.isArray(r.items) ? JSON.parse(JSON.stringify(r.items)) : []; },
    set: function (items) { if (!items.length) { delete XC[k]; dbDel('notes', k); } else { var rec = { k: k, items: items, t: Date.now() }; XC[k] = rec; dbPut('notes', rec); } stkDrawCard(card); }
  };
}
function stkDrawCard(card) {
  var l = card.querySelector(':scope > .stk-l');
  if (!l) { l = document.createElement('div'); l.className = 'stk-l'; card.appendChild(l); card.__stk = stkCtxCard(card); stkBind(l, card.__stk); }
  var r = XC['n:' + card.id.slice(2)]; l.innerHTML = stkHtml(r && r.items);
}
ACT['stk-add'] = function (el) { var card = document.getElementById('x-' + el.getAttribute('data-id')); if (!card) return; if (!card.__stk) stkDrawCard(card); stkAdd(card.__stk, 320); };

/* ---------- books: adding a PDF, the library ---------- */
function fingerprint(file, buf) { // same file → same id, so a restored backup finds its writing again
  var head = new Uint8Array(buf, 0, Math.min(buf.byteLength, 1048576));
  var h = (crypto && crypto.subtle) ? crypto.subtle.digest('SHA-256', head).then(function (d) { return Array.prototype.map.call(new Uint8Array(d).slice(0, 6), function (x) { return ('0' + x.toString(16)).slice(-2); }).join(''); })
    : Promise.resolve((function () { var a = 2166136261; for (var i = 0; i < head.length; i += 7) { a ^= head[i]; a = Math.imul(a, 16777619); } return (a >>> 0).toString(16); })());
  return h.then(function (x) { return 'b' + x + (buf.byteLength % 46656).toString(36); });
}
ACT['book-add'] = function () { pick('.pdf,application/pdf', false).then(function (f) { addBook(f[0]); }); };
ACT['book-attach'] = function (el) { var id = el.getAttribute('data-id'); pick('.pdf,application/pdf', false).then(function (f) { addBook(f[0], id); }); };
function addBook(file, attachTo) {
  var m = document.getElementById('modal'); m.__busy = true;
  openModal(card('<h2>جارٍ إضافة الكتاب…</h2><p class="muted" id="ab-p">يُقرأ الملف</p>'));
  function step(t) { var e = document.getElementById('ab-p'); if (e) e.textContent = t; }
  var buf, id, doc;
  readBuf(file).then(function (b) {
    buf = b;
    if (b.byteLength < 40e6 && findPack(new Uint8Array(b)) >= 0) throw new Error('ispack');
    return fingerprint(file, b);
  }).then(function (x) {
    id = attachTo || x; step('يُفتح الكتاب');
    return loadDoc(new Uint8Array(buf.slice(0)));
  }).then(function (d) {
    doc = d; return Promise.all([d.getMetadata()['catch'](function () { return null; }), d.getPageLabels()['catch'](function () { return null; })]);
  }).then(function (r) {
    step('يُحفظ على الجهاز');
    var old = bookById(id), meta = r[0], labels = r[1], offset = 0;
    if (labels) { for (var i = 0; i < labels.length; i++) if (/^\s*[1١]\s*$/.test(labels[i] || '')) { offset = i; break; } }
    var title = (old && old.title) || ((meta && meta.info && meta.info.Title && /[؀-ۿ]/.test(meta.info.Title)) ? meta.info.Title : file.name.replace(/\.pdf$/i, '').replace(/[_-]+/g, ' '));
    var b = old || { id: id, title: title, lessons: [], offset: offset, added: Date.now() };
    b.pages = doc.numPages; b.file = file.name; b.size = file.size; delete b.missing;
    try { doc.destroy(); } catch (e) {}
    return dbPut('files', { id: id, data: new Blob([buf], { type: 'application/pdf' }), name: file.name }).then(function () { return saveBook(b); }).then(function () { return b; });
  }).then(function (b) {
    if (!bookById(b.id)) BOOKS.push(b);
    S.cur = b.id; saveState(true); delete DOCS[b.id];
    if (navigator.storage && navigator.storage.persist) navigator.storage.persist()['catch'](function () {});
    m.__busy = false;
    if (attachTo) { closeModal(); toast('أُضيف ملف الكتاب'); go('read'); return; }
    openModal(card('<h2>أُضيف الكتاب</h2><label class="field"><span>اسم الكتاب كما تريد أن يظهر</span><input type="text" id="bk-title" value="' + esc(b.title) + '" data-focus></label><p class="small muted">' + cnt(b.pages, WORDS.page) + (b.offset ? ' · ضُبط ترقيم الصفحات من الملف' : '') + '</p><div class="actions"><button class="btn" data-act="bk-title-save" data-id="' + b.id + '">التالي: تحديد الدروس</button></div>'));
  })['catch'](function (e) {
    m.__busy = false;
    if (e && e.message === 'ispack') { closeModal(); importPackBytes(new Uint8Array(buf), file.name); return; }
    openModal(card('<h2>تعذّرت إضافة الكتاب</h2><p class="muted">' + (e && e.name === 'QuotaExceededError' ? 'لا توجد مساحة كافية على الجهاز.' : e && /password/i.test(e.name || e.message || '') ? 'الملف محمي بكلمة مرور.' : 'الملف ليس PDF صالحًا أو تعذّرت قراءته.') + '</p><div class="actions"><button class="btn" data-act="modal-close">حسنًا</button></div>'));
  });
}
ACT['bk-title-save'] = function (el) { var b = bookById(el.getAttribute('data-id')), t = document.getElementById('bk-title').value.trim(); if (b && t) { b.title = t; if (!b.term) b.term = guessTerm(t); saveBook(b); } closeModal(); go('lessons'); };
ACT['go-books'] = function () { go('books'); };
ACT['pick-book'] = function () {
  if (BOOKS.length < 2) { go('books'); return; }
  openModal(card('<h2>اختر الكتاب</h2><div class="ulist">' + BOOKS.map(function (b) { return '<button class="urow" data-act="use-book" data-id="' + b.id + '">' + ico('book', b.id === S.cur ? 'teal' : 'gray') + '<span><span class="u-title">' + esc(b.title) + '</span><span class="u-std">' + cnt(b.lessons.length, WORDS.lesson) + '</span></span></button>'; }).join('') + '</div>'));
};
ACT['use-book'] = function (el) { S.cur = el.getAttribute('data-id'); saveState(); closeModal(); route.v === 'books' ? render() : go(route.v === 'lesson' ? 'lessons' : route.v); };
VIEWS.books = function () {
  var h = '<div class="page-head"><h1>كتبي</h1><p class="muted">الكتب على هذا الجهاز فقط. لكل كتاب دروسه ومساعدها وكتابتك عليه.</p></div>';
  h += BOOKS.length ? '<div class="ulist">' + BOOKS.map(function (b) {
    var ready = b.lessons.filter(function (l) { return aidOf(b, l); }).length;
    return '<div class="urow bk' + (b.id === (curBook() || {}).id ? ' cur' : '') + '">' + ico('book', b.id === (curBook() || {}).id ? 'teal' : 'gray') + '<span><span class="u-title">' + esc(b.title) + (b.missing ? ' <span class="mchip bad"><i></i>الملف غير موجود</span>' : '') + '</span><span class="u-std">' + (b.term ? termName(b.term) + ' · ' : '') + cnt(b.pages || 0, WORDS.page) + ' · ' + cnt(b.lessons.length, WORDS.lesson) + ' · مساعد جاهز لـ ' + ready + (b.size ? ' · ' + (b.size / 1048576).toFixed(0) + ' م.ب' : '') + '</span></span>' +
      '<span class="u-side bk-acts">' + (b.id !== (curBook() || {}).id ? '<button class="btn sm" data-act="use-book" data-id="' + b.id + '">افتحه</button>' : '<span class="mchip ok"><i></i>المفتوح</span>') + '<button class="btn ghost sm" data-act="bk-edit" data-id="' + b.id + '">إعداد</button></span></div>';
  }).join('') + '</div>' : '<p class="muted">لا كتب بعد.</p>';
  h += '<div class="actions"><button class="btn" data-act="book-add">أضف كتابًا (PDF)</button><button class="btn ghost" data-act="pack-add">أضف ملف دروس</button></div>';
  return h;
};
ACT['bk-edit'] = function (el) {
  var b = bookById(el.getAttribute('data-id')); if (!b) return;
  openModal(sheet('إعداد الكتاب', '<section class="set-sec"><label class="field"><span>اسم الكتاب</span><input type="text" id="be-title" value="' + esc(b.title) + '"></label>' +
    '<label class="field"><span>يُدرَّس في</span><select id="be-term">' + [['', 'غير محدد'], ['t1', 'الفصل الدراسي الأول'], ['t2', 'الفصل الدراسي الثاني']].map(function (x) { return '<option value="' + x[0] + '"' + ((b.term || '') === x[0] ? ' selected' : '') + '>' + x[1] + '</option>'; }).join('') + '</select></label><p class="small muted">يُفتح الكتاب تلقائيًا حين يبدأ فصله، ويبدأ تقويمه على فصله.</p>' +
    '<label class="field"><span>فرق الترقيم: صفحة الملف = الصفحة المطبوعة + ؟</span><input type="number" inputmode="numeric" id="be-off" value="' + (+b.offset || 0) + '"></label><p class="small muted">مثال: إن كانت ص 1 المطبوعة هي الصفحة 9 في الملف فالفرق 8. أسهل طريقة: من «الكتاب» اضغط رقم الصفحة أعلاه ← ضبط ترقيم الصفحات.</p>' +
    '<div class="actions"><button class="btn" data-act="be-save" data-id="' + b.id + '">احفظ</button></div></section>' +
    '<section class="set-sec"><h3>مشاركة الدروس</h3><p class="small muted">صدّر دروس هذا الكتاب ومساعدها في ملف واحد، تحفظه أو ترسله لزميل يدرّس الكتاب نفسه فيضيفه إلى تطبيقه دون تكلفة. لا يحوي الملف الكتاب ولا كتابتك عليه.</p><div class="actions" style="margin-top:0"><button class="btn ghost" data-act="pack-export" data-id="' + b.id + '"' + (b.lessons.length ? '' : ' disabled') + '>صدّر ملف الدروس</button></div></section>' +
    '<section class="set-sec"><h3>حذف</h3><div class="actions" style="margin-top:0"><button class="btn ghost sm danger" data-act="ink-wipe" data-id="' + b.id + '">امسح كل كتابتي على الكتاب</button><button class="btn ghost sm danger" data-act="bk-del" data-id="' + b.id + '">احذف الكتاب</button></div></section>'), true);
};
ACT['be-save'] = function (el) {
  var b = bookById(el.getAttribute('data-id')); if (!b) return;
  var t = document.getElementById('be-title').value.trim(); if (t) b.title = t;
  var o = parseInt(document.getElementById('be-off').value, 10); if (isFinite(o)) b.offset = o;
  var tm = document.getElementById('be-term').value; if (tm !== (b.term || '')) { b.term = tm; if (S.plan[b.id]) { delete S.plan[b.id].termSet; } }
  saveBook(b); closeModal(); render(); toast('حُفظ');
};
ACT['bk-del'] = function (el) { confirmBox('حذف الكتاب؟', 'يُحذف ملف الكتاب ودروسه ومساعدها وكتابتك عليه من هذا الجهاز. لا يمكن التراجع؛ احفظ نسخة احتياطية أولًا إن أردت.', 'bk-del-yes', 'احذف الكتاب', ' data-id="' + el.getAttribute('data-id') + '"', true); };
ACT['bk-del-yes'] = function (el) {
  var id = el.getAttribute('data-id');
  Promise.all([dbDel('books', id), dbDel('files', id), dbDelRange('aids', id + ':'), dbDelRange('ink', id + ':'), dbDelRange('notes', 'b:' + id + ':'), dbDelRange('notes', 'x:' + id + ':'), dbDelRange('notes', 'p:' + id + ':'), dbDelRange('media', 'm:' + id + ':')]).then(function () {
    Object.keys(XC).forEach(function (k) { if (k.indexOf(':' + id + ':') === 1) delete XC[k]; });
    BOOKS = BOOKS.filter(function (b) { return b.id !== id; }); Object.keys(AIDS).forEach(function (k) { if (k.indexOf(id + ':') === 0) delete AIDS[k]; });
    delete DOCS[id]; delete S.plan[id]; delete S.last[id]; if (S.cur === id) S.cur = BOOKS[0] ? BOOKS[0].id : ''; saveState(); closeModal(); go(BOOKS.length ? 'books' : 'home');
  });
};
ACT['ink-wipe'] = function (el) { confirmBox('مسح كل كتابتك على هذا الكتاب؟', 'تُحذف الكتابة والتظليل من كل الصفحات. لا يمكن التراجع.', 'ink-wipe-yes', 'امسح', ' data-id="' + el.getAttribute('data-id') + '"', true); };
ACT['ink-wipe-yes'] = function (el) { dbDelRange('ink', el.getAttribute('data-id') + ':').then(function () { closeModal(); toast('مُسحت الكتابة'); }); };

/* ---------- lesson files («ملف دروس»): JSON, or JSON inside a PDF ---------- */
var MARK = '{"kitabiPack":1', MB = new TextEncoder().encode(MARK);
function findPack(u8) {
  var n = MB.length, last = u8.length - n, f = MB[0], i, j;
  outer: for (i = 0; i <= last; i++) { if (u8[i] !== f) continue; for (j = 1; j < n; j++) if (u8[i + j] !== MB[j]) continue outer; return i; }
  return -1;
}
function packFromBytes(u8) {
  var head = new TextDecoder('utf-8').decode(u8.subarray(0, 64)).replace(/^﻿/, '').trim();
  if (head.charAt(0) === '{') return JSON.parse(new TextDecoder('utf-8').decode(u8).replace(/^﻿/, ''));
  var i = findPack(u8); if (i < 0) throw new Error('nopack');
  var m = /"bytes"\s*:\s*"?(\d+)/.exec(new TextDecoder('utf-8').decode(u8.subarray(i, i + 60)));
  if (m) return JSON.parse(new TextDecoder('utf-8').decode(u8.subarray(i, i + +m[1])));
  // no length: read to the matching closing brace
  var depth = 0, inS = false, esc2 = false;
  for (var k = i; k < u8.length; k++) { var c = u8[k]; if (inS) { if (esc2) esc2 = false; else if (c === 92) esc2 = true; else if (c === 34) inS = false; continue; } if (c === 34) inS = true; else if (c === 123) depth++; else if (c === 125 && --depth === 0) return JSON.parse(new TextDecoder('utf-8').decode(u8.subarray(i, k + 1))); }
  throw new Error('format');
}
ACT['pack-add'] = function () { pick('.json,.pdf,application/json,application/pdf', false).then(function (f) { readBuf(f[0]).then(function (b) { importPackBytes(new Uint8Array(b), f[0].name); }); }); };
function importPackBytes(u8, name) {
  var p; try { p = packFromBytes(u8); } catch (e) { openModal(card('<h2>ليس ملف دروس</h2><p class="muted">«' + esc(name) + '» لا يحوي دروسًا بصيغة التطبيق' + (e.message === 'nopack' ? '. إن كان هذا كتابًا فأضفه من «أضف كتابًا».' : '.') + '</p><div class="actions"><button class="btn" data-act="modal-close">حسنًا</button></div>')); return; }
  if (!p || p.kitabiPack !== 1 || !Array.isArray(p.lessons)) { openModal(card('<h2>صيغة غير صالحة</h2><p class="muted">الملف لا يتبع صيغة ملفات الدروس.</p><div class="actions"><button class="btn" data-act="modal-close">حسنًا</button></div>')); return; }
  var b = curBook();
  if (!b) { openModal(card('<h2>أضف الكتاب أولًا</h2><p class="muted">ملف الدروس يُضاف إلى كتاب. أضف ملف PDF الكتاب ثم أضف ملف الدروس.</p><div class="actions"><button class="btn" data-act="book-add">أضف الكتاب</button></div>')); return; }
  PENDING = p;
  var bt = p.book && p.book.title ? str(p.book.title) : '';
  openModal(card('<h2>إضافة ملف الدروس</h2><p>' + cnt(p.lessons.length, WORDS.lesson) + (bt ? ' من «' + esc(bt) + '»' : '') + '، ستُضاف إلى:</p>' +
    (BOOKS.length > 1 ? '<select id="pk-book" class="inp">' + BOOKS.map(function (x) { return '<option value="' + x.id + '"' + (x.id === b.id ? ' selected' : '') + '>' + esc(x.title) + '</option>'; }).join('') + '</select>' : '<p><b>' + esc(b.title) + '</b></p>') +
    '<p class="small muted">الدرس الموجود بالعنوان نفسه يُحدَّث، والجديد يُضاف. كتابتك على الكتاب لا تتغير.</p><div class="actions"><button class="btn" data-act="pack-yes">أضف</button><button class="btn ghost" data-act="modal-close">إلغاء</button></div>'));
}
var PENDING = null;
ACT['pack-yes'] = function () {
  var p = PENDING; PENDING = null; if (!p) return; var sel = document.getElementById('pk-book'), b = sel ? bookById(sel.value) : curBook();
  var added = 0, upd = 0, aids = 0, bad = 0, jobs = [], wasEmpty = !b.lessons.length;
  p.lessons.forEach(function (x) {
    if (!x || !x.title || !(+x.from > 0)) { bad++; return; }
    var l = b.lessons.filter(function (y) { return (x.id && y.id === x.id) || norm(y.title) === norm(x.title); })[0];
    if (l) { upd++; if (x.unit) l.unit = str(x.unit); if (x.chap) l.chap = str(x.chap); l.from = +x.from; if (+x.to) l.to = +x.to; }
    else { l = { id: x.id && IDRE.test(x.id) && !b.lessons.some(function (y) { return y.id === x.id; }) ? x.id : uid('l'), unit: str(x.unit), chap: str(x.chap), title: str(x.title), from: +x.from, to: +x.to || 0 }; b.lessons.push(l); added++; }
    if (hasAid(x)) { try { var d = cleanAid(x); jobs.push([l, d]); } catch (e) { bad++; } }
  });
  b.lessons.sort(function (a, c) { return a.from - c.from; }); fillTo(b.lessons, b);
  if (wasEmpty && p.book && isFinite(+p.book.offset) && !b.offset) b.offset = +p.book.offset;
  S.cur = b.id; saveState();
  saveBook(b).then(function () { return Promise.all(jobs.map(function (j) { aids++; return storeAid(b, j[0], j[1], 'pack'); })); }).then(function () {
    closeModal(); go('lessons');
    toast([added ? 'أُضيف ' + cnt(added, WORDS.lesson) : '', upd ? 'حُدّث ' + cnt(upd, WORDS.lesson) : '', aids ? 'ومساعد ' + cnt(aids, WORDS.lesson) : '', bad ? '(تُرك ' + bad + ' غير صالح)' : ''].filter(Boolean).join(' '), 4500);
  });
};
ACT['pack-export'] = function (el) {
  var b = bookById(el.getAttribute('data-id')); if (!b) return;
  var p = { kitabiPack: 1, ver: VERSION, book: { title: b.title, pages: b.pages, offset: +b.offset || 0 }, lessons: b.lessons.map(function (l) { var a = aidOf(b, l); return Object.assign({ id: l.id, unit: l.unit, chap: l.chap || '', title: l.title, from: l.from, to: l.to }, a ? a.d : {}); }) };
  saveFile('دروس-' + b.title.replace(/[\\\/:*?"<>|]+/g, ' ').slice(0, 60) + '.json', JSON.stringify(p)).then(function (how) { if (how !== 'cancel') toast(how === 'shared' ? 'صُدّر ملف الدروس' : 'نُزّل ملف الدروس'); });
};

/* ---------- the question bank of the open book ---------- */
var QS = null;
function bookQs(b, scope) {
  var out = [];
  b.lessons.forEach(function (l) {
    if (scope && scope !== 'all' && scope !== l.id && scope !== 'u:' + (l.unit || 'الدروس')) return;
    var a = aidOf(b, l); if (!a) return;
    a.d.quiz.mcq.forEach(function (q, i) { out.push(lk(b, l) + ':m' + i); });
    a.d.quiz.tf.forEach(function (q, i) { out.push(lk(b, l) + ':t' + i); });
  });
  return out;
}
VIEWS.quiz = function () {
  var b = curBook(); if (!b) return noBook();
  if (QS && !QS.done) return quizRunner();
  if (QS && QS.done) return quizResult();
  var all = bookQs(b, 'all'), tried = all.filter(function (id) { return S.ans[id]; }), right = tried.filter(function (id) { return S.ans[id][2]; });
  var h = '<div class="page-head"><h1>الأسئلة</h1></div>';
  if (!all.length) return h + '<section class="panel"><p class="muted">تظهر هنا أسئلة تقويم الدروس بعد تجهيز مساعدها.</p><div class="actions"><button class="btn" data-act="go" data-to="lessons">إلى الدروس</button></div></section>';
  var sc = route.scope || 'all';
  h += '<section class="panel"><h2 class="hh">' + ico('q', 'amber') + 'تدرّب أو راجع الأسئلة</h2><p class="muted small">' + cnt(all.length, WORDS.q) + ' (اختيار من متعدد وصح أو خطأ) من ' + cnt(b.lessons.filter(function (l) { return aidOf(b, l); }).length, WORDS.lesson) + '. حللت منها ' + tried.length + (tried.length ? '، صحيحة في آخر محاولة ' + pct(right.length, tried.length) + '%' : '') + '.</p>' +
    '<label class="field"><span>من</span><select id="q-scope"><option value="all">كل الدروس الجاهزة</option>' + units(b).map(function (u) { var n = bookQs(b, 'u:' + u.name).length; return n ? '<optgroup label="' + esc(u.name) + '"><option value="u:' + esc(u.name) + '"' + (sc === 'u:' + u.name ? ' selected' : '') + '>الوحدة كلها (' + n + ')</option>' + u.lessons.filter(function (l) { return aidOf(b, l); }).map(function (l) { return '<option value="' + esc(l.id) + '"' + (sc === l.id ? ' selected' : '') + '>' + esc(l.title) + '</option>'; }).join('') + '</optgroup>' : ''; }).join('') + '</select></label>' +
    '<div class="actions"><button class="btn" data-act="quiz-go" data-n="10">10 أسئلة</button><button class="btn ghost" data-act="quiz-go" data-n="20">20 سؤالًا</button><button class="btn ghost tint hue-rose" data-act="quiz-go" data-n="20" data-w="1"' + (tried.length - right.length ? '' : ' disabled') + '>ما أخطأت فيه (' + (tried.length - right.length) + ')</button></div></section>';
  var weak = b.lessons.map(function (l) { var ids = bookQs(b, l.id).filter(function (id) { return S.ans[id]; }); return { l: l, n: ids.length, ok: ids.filter(function (id) { return S.ans[id][2]; }).length }; }).filter(function (x) { return x.n >= 3; }).sort(function (x, y) { return x.ok / x.n - y.ok / y.n; }).slice(0, 5);
  if (weak.length) h += '<section class="panel" style="margin-top:14px"><h2 class="hh">' + ico('warn', 'rose') + 'دروس تحتاج مراجعة</h2><div class="ulist">' + weak.map(function (x) { return '<button class="urow" data-act="lesson" data-k="' + esc(lk(b, x.l)) + '" data-tab="eval">' + ico(null, 'rose', pct(x.ok, x.n) + '%') + '<span><span class="u-title">' + esc(x.l.title) + '</span><span class="u-std">' + x.ok + ' صحيحة من ' + x.n + '</span></span></button>'; }).join('') + '</div></section>';
  h += '<p class="small muted" style="margin-top:12px">لعرض أسئلة درس على الطلاب: افتح الدرس ← التقويم ← «اعرض الأسئلة على الطلاب».</p>';
  return h;
};
document.addEventListener('change', function (e) { if (e.target.id === 'q-scope') route.scope = e.target.value; });
ACT['quiz-go'] = function (el) {
  var b = curBook(), sc = (document.getElementById('q-scope') || {}).value || 'all', ids = bookQs(b, sc);
  if (el.getAttribute('data-w')) ids = bookQs(b, 'all').filter(function (id) { return S.ans[id] && !S.ans[id][2]; });
  if (!ids.length) { toast('لا أسئلة هنا'); return; }
  ids = shuffle(ids).slice(0, +el.getAttribute('data-n') || 10);
  QS = { items: ids, i: 0, ans: {}, ok: 0, done: false }; render(); window.scrollTo(0, 0);
};
function quizRunner() {
  var id = QS.items[QS.i], q = qById(id), tf = /:t\d+$/.test(id), ch = QS.ans[id], done = ch != null, x = lessonByKey(id.replace(/:(m|t)\d+$/, ''));
  if (!q) { QS.items.splice(QS.i, 1); if (QS.i >= QS.items.length) QS.done = true; return QS.done ? quizResult() : quizRunner(); }
  var right = tf ? (q.a ? 1 : 0) : q.a, ok = ch === right;
  var h = '<div class="sess-head"><button class="btn ghost sm" data-act="quiz-end">إنهاء</button><span class="muted small">سؤال ' + (QS.i + 1) + ' من ' + QS.items.length + '</span><span class="score">' + QS.ok + ' صحيحة</span></div><div class="prog"><b style="width:' + pct(QS.i + (done ? 1 : 0), QS.items.length) + '%"></b></div>' +
    '<article class="qcard"><p class="q-meta">' + esc(x ? x.l.title : '') + (q.lv ? ' · ' + esc(q.lv) : '') + (tf ? ' · صح أو خطأ' : '') + '</p><h2 class="q-text">' + fx(q.q) + '</h2><div class="opts' + (tf ? ' tf' : '') + '">' +
    (tf ? [[1, 'صح'], [0, 'خطأ']] : q.o.map(function (o, k) { return [k, o]; })).map(function (o, n) {
      var k = o[0], cls = done ? (k === right ? ' right' : k === ch ? ' wrong' : ' dim') : '';
      return '<button class="opt' + cls + '" data-act="qs-opt" data-k="' + k + '"' + (done ? ' disabled' : '') + '>' + (tf ? '' : '<span class="lt">' + LET[n] + '</span>') + '<span>' + fx(o[1]) + '</span></button>';
    }).join('') + '</div>';
  if (done) h += '<div class="explain ' + (ok ? 'ok' : 'no') + '"><p><b>' + (ok ? 'إجابة صحيحة.' : tf ? (q.a ? 'العبارة صحيحة.' : 'العبارة خاطئة.') : 'الإجابة الصحيحة (' + LET[q.a] + ').') + '</b> ' + fx(q.e) + '</p></div><div class="actions"><button class="btn" data-act="qs-next">' + (QS.i + 1 < QS.items.length ? 'التالي' : 'النتيجة') + '</button></div>';
  return h + '</article>';
}
ACT['qs-opt'] = function (el) {
  var id = QS.items[QS.i], q = qById(id), tf = /:t\d+$/.test(id), k = +el.getAttribute('data-k'); if (QS.ans[id] != null) return;
  var ok = tf ? (!!k === q.a) : k === q.a; QS.ans[id] = k; if (ok) QS.ok++; recordAns(id, ok); render(true);
};
ACT['qs-next'] = function () { QS.i++; if (QS.i >= QS.items.length) QS.done = true; render(); window.scrollTo(0, 0); };
ACT['quiz-end'] = function () { if (Object.keys(QS.ans).length) QS.done = true; else QS = null; render(); };
ACT['quiz-new'] = function () { QS = null; render(); };
function quizResult() {
  var n = Object.keys(QS.ans).length, p = pct(QS.ok, n), wrong = QS.items.filter(function (id) { var q = qById(id), tf = /:t\d+$/.test(id); return QS.ans[id] != null && (tf ? !!QS.ans[id] !== q.a : QS.ans[id] !== q.a); });
  return '<section class="panel result"><p class="eyebrow">نتيجة التدريب</p><h1><span class="big ' + (p >= 80 ? 'good' : 'bad') + '">' + p + '%</span> <span class="muted" style="font-size:.7em">' + QS.ok + ' من ' + n + '</span></h1>' +
    '<div class="actions"><button class="btn" data-act="quiz-new">تدريب آخر</button></div></section>' +
    (wrong.length ? '<section class="panel" style="margin-top:16px"><h2>راجع ما أخطأت فيه</h2>' + wrong.map(function (id) { var q = qById(id), tf = /:t\d+$/.test(id); return '<div class="witem"><p><b>' + fx(q.q) + '</b></p><p class="ans-ok">الصحيح: ' + (tf ? (q.a ? 'صح' : 'خطأ') : fx(q.o[q.a])) + '</p><p class="muted">' + fx(q.e) + '</p></div>'; }).join('') + '</section>' : '');
}

/* ---------- plan: lessons over the weeks of the term ---------- */
function planOf(b) { // each term keeps its own dates, review weeks and lesson lengths
  var P0 = S.plan[b.id] = S.plan[b.id] || {}, T = termsList();
  if (b.term && (!P0.termSet || BOOKS.some(function (x) { return x !== b && x.term && x.term === P0.term; }))) P0.term = b.term; // a book of one term opens on its term; another term with its own book belongs to that book
  var t = T.filter(function (x) { return x[0] === P0.term; })[0];
  if (!t) { var td = today(); t = T.filter(function (x) { return td <= parseISO(x[3]); })[0] || T[0]; P0.term = t[0]; }
  if (!P0.terms) { P0.terms = {}; if (P0.start || P0.dur) P0.terms[P0.term] = { start: P0.start, end: P0.end, review: P0.review, dur: P0.dur || {} }; ['start', 'end', 'review', 'dur', 'manual'].forEach(function (k) { delete P0[k]; }); }
  var p = P0.terms[t[0]] = P0.terms[t[0]] || {};
  if (!p.start) p.start = t[2]; if (!p.end) p.end = t[3]; if (p.review == null) p.review = 1; if (!p.wk) p.wk = {};
  p.term = t[0];
  return p;
}
function weeksOf(p) {
  var E = eduList(), a = parseISO(p.start), z = parseISO(p.end), out = [];
  if (a == null || z == null || z < a) return out;
  var s = a - wday(a);
  for (var w = s; w <= z; w += 7) {
    var days = 0, offs = {};
    for (var d = Math.max(w, a); d <= Math.min(w + 6, z); d++) { var di = dayInfo(d, E); if (di.school) days++; else if (!di.we) offs[di.off || di.eid || 'إجازة إضافية'] = 1; }
    out.push({ a: w, b: w + 4, days: days, off: Object.keys(offs) });
  }
  return out;
}
/* the teacher picks the lesson of each week from a list; a lesson may be picked in several weeks, and a week may hold more than one.
   p.wk[ISO date of the week's Sunday] = [lesson ids] */
function buildSchedule(b) {
  var p = planOf(b), W = weeksOf(p), ids = {}, weeks = {}, start = {};
  b.lessons.forEach(function (l) { ids[l.id] = l; weeks[l.id] = []; });
  if (!p.wk) p.wk = {};
  W.forEach(function (w, i) { (p.wk[isoOf(w.a)] || []).forEach(function (id) { if (ids[id] && weeks[id].indexOf(i) < 0) weeks[id].push(i); }); });
  b.lessons.forEach(function (l) { start[l.id] = weeks[l.id].length ? weeks[l.id][0] : -1; });
  var teach = W.map(function (w, i) { return i; }).filter(function (i) { return W[i].days > 0; });
  return { p: p, W: W, weeks: weeks, start: start, review: teach.slice(Math.max(1, teach.length - (+p.review || 0))), empty: !Object.keys(p.wk).some(function (k) { return p.wk[k].length; }),
    inWeek: function (i) { var w = W[i]; return w ? (p.wk[isoOf(w.a)] || []).map(function (id) { return ids[id]; }).filter(Boolean) : []; } };
}
function autoFill(b) { // a first draft: the lessons over the teaching weeks by their number of pages
  var p = planOf(b), W = weeksOf(p), teach = W.map(function (w, i) { return i; }).filter(function (i) { return W[i].days > 0; });
  var n = Math.max(1, teach.length - (+p.review || 0)), wts = b.lessons.map(function (l) { return Math.max(1, (l.to || l.from) - l.from + 1); }), T = wts.reduce(function (s, x) { return s + x; }, 0), acc = 0, out = {};
  b.lessons.forEach(function (l, j) {
    var a = acc / T * n, z = (acc + wts[j]) / T * n; acc += wts[j];
    for (var k = Math.floor(a); k < Math.min(n, Math.ceil(z - 0.25) || 1); k++) { var key = isoOf(W[teach[k]].a); (out[key] = out[key] || []).push(l.id); }
    if (Math.ceil(z - 0.25) <= Math.floor(a)) { var key2 = isoOf(W[teach[Math.min(n - 1, Math.floor(a))]].a); out[key2] = out[key2] || []; if (out[key2].indexOf(l.id) < 0) out[key2].push(l.id); }
  });
  p.wk = out; saveState();
}
function weekNo(W, i) { var n = 0; for (var k = 0; k <= i; k++) if (W[k].days > 0) n++; return n; }
function curWeek(W) { var t = today(); for (var i = 0; i < W.length; i++) if (t >= W[i].a && t <= W[i].a + 6) return i; return -1; }
function wkPicker(b, X, i, has) {
  return '<select class="wk-add' + (has ? ' more' : '') + '" data-w="' + isoOf(X.W[i].a) + '" aria-label="اختر درس هذا الأسبوع"><option value="">' + (has ? '＋ درس آخر' : 'اختر الدرس…') + '</option>' +
    units(b).map(function (u) { return '<optgroup label="' + esc(u.name) + '">' + u.lessons.map(function (l) { var n = X.weeks[l.id].length; return '<option value="' + esc(l.id) + '">' + esc(l.title) + (n ? ' ✓' : '') + '</option>'; }).join('') + '</optgroup>'; }).join('') + '</select>';
}
VIEWS.plan = function () {
  var b = curBook(); if (!b) return noBook();
  var h = '<div class="page-head"><h1>التقويم</h1></div>' + calPanel(b);
  if (!b.lessons.length) return h + '<section class="panel" style="margin-top:14px"><p class="muted">حدّد دروس الكتاب أولًا لتوزّعها على أسابيع الفصل.</p><div class="actions"><button class="btn" data-act="go" data-to="lessons">إلى الدروس</button></div></section>';
  var X = buildSchedule(b), p = X.p, W = X.W, cw = curWeek(W), nTeach = W.filter(function (w) { return w.days; }).length;
  var planned = b.lessons.filter(function (l) { return X.weeks[l.id].length; }).length;
  h += '<h2 class="sec-h hh">' + ico('target', 'teal') + 'دروس كل أسبوع</h2>';
  h += '<section class="panel plan-set"><div class="seg" role="group">' + termsList().map(function (t) { var tb = BOOKS.filter(function (x) { return x.term === t[0]; }); return '<button type="button" data-act="plan-term" data-v="' + t[0] + '" aria-pressed="' + (p.term === t[0]) + '">' + t[1] + (tb.length === 1 && BOOKS.length > 1 ? '<small class="seg-sub">' + esc(tb[0].title.replace(/^.*?(الجزء \S+)$/, '$1')) + '</small>' : '') + '</button>'; }).join('') + '</div>' +
    '<p class="small muted">' + cnt(nTeach, WORDS.week) + ' دراسية. اختر درس كل أسبوع من القائمة تحته؛ تختار الدرس نفسه في أكثر من أسبوع إن امتد، وتضيف درسًا ثانيًا للأسبوع نفسه من «＋ درس آخر». ' + (X.empty ? '' : 'وُزّع ' + planned + ' من ' + cnt(b.lessons.length, WORDS.lesson) + '.') + '</p>' +
    '<div class="actions" style="margin-top:0">' + (X.empty ? '<button class="btn ghost sm" data-act="plan-fill">املأ الأسابيع مبدئيًا ثم أعدّل</button>' : '<button class="btn ghost sm danger" data-act="plan-clear">امسح دروس الأسابيع</button>') + '</div>' +
    '<details class="small"><summary>بداية الفصل ونهايته وأسابيع المراجعة</summary><div class="row2" style="margin-top:8px"><label class="field"><span>من</span><input type="date" id="plan-a" value="' + esc(p.start) + '"></label><label class="field"><span>إلى</span><input type="date" id="plan-b" value="' + esc(p.end) + '"></label></div>' +
    '<div class="plan-rv" style="margin-top:8px"><span class="small muted">أسابيع للمراجعة في آخر الفصل (يستعملها «املأ الأسابيع»)</span><div class="seg" role="group">' + [0, 1, 2, 3].map(function (n) { return '<button type="button" data-act="plan-rv" data-v="' + n + '" aria-pressed="' + (+p.review === n) + '">' + n + '</button>'; }).join('') + '</div></div></details></section>';
  h += '<ol class="weeks">' + W.map(function (w, i) {
    if (!w.days) return '<li class="wk off"><div class="wk-h"><b>' + esc(w.off.join('، ') || 'إجازة') + '</b><span>' + esc(rangeLbl(w.a, w.b)) + '</span></div></li>';
    var ls = X.inWeek(i), iso = isoOf(w.a);
    return '<li class="wk' + (i === cw ? ' now' : '') + (i < cw ? ' past' : '') + '" id="wk-' + i + '"><div class="wk-h"><b>الأسبوع ' + weekNo(W, i) + (i === cw ? ' · هذا الأسبوع' : '') + '</b><span>' + esc(rangeLbl(w.a, w.b)) + (w.days < 5 ? ' · ' + cnt(w.days, WORDS.day) + ' دراسة' : '') + '</span></div>' +
      (w.off.length ? '<p class="small wk-off">' + esc(w.off.join('، ')) + '</p>' : '') +
      (ls.length ? '<ul class="wk-ls">' + ls.map(function (l) {
        var tn = taughtN(b, l), cl = P.classes.length, ws = X.weeks[l.id], part = ws.indexOf(i) + 1;
        return '<li>' + (part > 1 ? '<span class="wk-cont">تابع</span>' : '') + '<button class="link" data-act="lesson" data-k="' + esc(lk(b, l)) + '">' + esc(l.title) + '</button>' +
          (ws.length > 1 ? '<span class="small muted">' + part + '/' + ws.length + '</span>' : '') +
          (cl ? '<span class="small ' + (tn === cl ? 'good' : 'muted') + '">' + (tn ? (tn === cl ? '✓ شُرح' : 'شُرح ' + tn + '/' + cl) : '') + '</span>' : '') +
          '<button class="wk-x" data-act="wk-del" data-w="' + iso + '" data-l="' + esc(l.id) + '" aria-label="أزل الدرس من هذا الأسبوع">✕</button></li>';
      }).join('') + '</ul>' : '') + wkPicker(b, X, i, ls.length) + '</li>';
  }).join('') + '</ol>';
  return h;
};
AFTER.push(function () { if (route.v === 'plan') { var n = document.querySelector('.wk.now'); if (n && route.jump) { route.jump = false; n.scrollIntoView({ block: 'center' }); } } });
ACT['plan-term'] = function (el) {
  var b = curBook(), v = el.getAttribute('data-v'), tb = BOOKS.filter(function (x) { return x.term === v; });
  if (tb.length === 1) { // the term has its own book: open it
    if (tb[0].id !== b.id) { S.cur = tb[0].id; saveState(); render(true); toast('فُتح «' + tb[0].title + '»'); }
    return;
  }
  planOf(b); S.plan[b.id].term = v; S.plan[b.id].termSet = true; saveState(); render(true);
};
ACT['plan-rv'] = function (el) { var p = planOf(curBook()); p.review = +el.getAttribute('data-v'); saveState(); render(true); };
ACT['plan-fill'] = function () { autoFill(curBook()); render(true); toast('وُزّعت الدروس مبدئيًا بحسب صفحاتها؛ عدّل أي أسبوع من قائمته'); };
ACT['plan-clear'] = function () { confirmBox('مسح دروس الأسابيع؟', 'تُفرَّغ أسابيع هذا الفصل الدراسي من الدروس لتختارها من جديد.', 'plan-clear-yes', 'امسح', '', true); };
ACT['plan-clear-yes'] = function () { var p = planOf(curBook()); p.wk = {}; saveState(); closeModal(); render(true); };
ACT['wk-del'] = function (el) { var p = planOf(curBook()), w = el.getAttribute('data-w'), id = el.getAttribute('data-l'); p.wk[w] = (p.wk[w] || []).filter(function (x) { return x !== id; }); if (!p.wk[w].length) delete p.wk[w]; saveState(); render(true); };
document.addEventListener('change', function (e) {
  var t = e.target, b = curBook(); if (!b) return;
  if (t.id === 'plan-a' || t.id === 'plan-b') { var p = planOf(b); if (parseISO(t.value) != null) { p[t.id === 'plan-a' ? 'start' : 'end'] = t.value; saveState(); render(true); } }
  else if (t.classList.contains('wk-add') && t.value) { var p2 = planOf(b), w = t.getAttribute('data-w'); p2.wk[w] = p2.wk[w] || []; if (p2.wk[w].indexOf(t.value) < 0) p2.wk[w].push(t.value); saveState(); render(true); }
});
/* month calendar: school calendar, and the lessons of each week */
function calPanel(b) {
  var t = today(), now = ymd(t), off = route.calM || 0, y = now.y, m = now.m + off;
  y += Math.floor(m / 12); m = ((m % 12) + 12) % 12;
  var first = Math.floor(Date.UTC(y, m, 1) / DAY), last = Math.floor(Date.UTC(y, m + 1, 1) / DAY) - 1, E = eduList();
  var X = b.lessons.length ? buildSchedule(b) : null, wkOf = {};
  if (X) X.W.forEach(function (w, i) { for (var d = w.a; d <= w.a + 6; d++) wkOf[d] = i; });
  var sel = route.calSel != null && route.calSel >= first && route.calSel <= last ? route.calSel : (t >= first && t <= last ? t : first);
  var h1 = hijriOf(first), h2 = hijriOf(last), hjR = h1 && h2 ? (h1.mn === h2.mn ? h1.m : h1.m + ' – ' + h2.m) + ' ' + h2.y + 'هـ' : '';
  var h = '<section class="panel cal"><div class="cal-h"><div class="cal-tt"><h2 class="hh">' + ico('cal', 'blue') + '<span>' + AR_MONTHS[m] + ' ' + y + (hjR ? '<small>' + esc(hjR) + '</small>' : '') + '</span></h2></div><div class="cal-nav">' +
    (off || (route.calSel != null && route.calSel !== t) ? '<button type="button" class="cal-tod" data-act="cal-today">اليوم</button>' : '') +
    '<button type="button" data-act="cal-nav" data-d="-1" aria-label="الشهر السابق"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 6l6 6-6 6"/></svg></button><button type="button" data-act="cal-nav" data-d="1" aria-label="الشهر التالي"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 6l-6 6 6 6"/></svg></button></div></div>';
  var nb = nextBreak(t, E); if (nb) h += '<div class="cal-next"><p><i class="sw k-off"></i><span>' + (nb.a <= t ? 'أنت في <b>' + esc(nb.t) + '</b> حتى ' + esc(dayShort(nb.b)) : 'أقرب إجازة: <b>' + esc(nb.t) + '</b> بعد ' + cnt(nb.a - t, WORDS.day)) + '</span></p></div>';
  h += '<div class="cal-wk">' + AR_DAYS_S.map(function (d, k) { return '<span' + (k >= 5 ? ' class="we"' : '') + '>' + d + '</span>'; }).join('') + '</div><div class="cal-grid">';
  for (var k = 0, f = wday(first); k < f; k++) h += '<span class="cal-pad" aria-hidden="true"></span>';
  var seen = {};
  for (var i = first; i <= last; i++) {
    var di = dayInfo(i, E), hj = di.hj, cls = i < t ? 'past' : i === t ? 'today' : 'next', wi = wkOf[i], has = X && wi != null && di.school && wday(i) === 0 && X.inWeek(wi).length;
    if (di.fill) { cls += ' k-' + di.fill; seen[di.fill] = 1; } if (di.ram) { cls += ' ram'; seen.ram = 1; } if (di.marks.length) { cls += ' k-mark'; seen.mark = 1; } if (i === sel) cls += ' sel';
    if (has) seen.plan = 1;
    h += '<button type="button" class="cal-d ' + cls + '" data-act="cal-day" data-d="' + i + '" aria-pressed="' + (i === sel) + '" aria-label="' + esc(dayFull(i)) + '"><b>' + ymd(i).d + '</b>' + (hj ? (hj.d === 1 ? '<small class="mo">' + esc(hjShort(hj.m)) + '</small>' : '<small>' + hj.d + '</small>') : '') + '<span class="dots">' + (has ? '<i class="d-plan"></i>' : '') + '</span></button>';
  }
  h += '</div>';
  var dI = dayInfo(sel, E), chips = [], dd = sel - t, rel = dd === 0 ? 'اليوم' : dd === 1 ? 'غدًا' : dd === -1 ? 'أمس' : dd > 0 ? 'بعد ' + cnt(dd, WORDS.day) : 'قبل ' + cnt(-dd, WORDS.day);
  if (dI.eid) chips.push(['eid', dI.eid]); if (dI.off) chips.push(['off', dI.off]); if (dI.extra) chips.push(['extra', 'إجازة إضافية']);
  dI.marks.forEach(function (x) { chips.push(['mark', x]); }); if (dI.ram) chips.push(['ram', 'رمضان · اليوم ' + dI.ram]);
  if (dI.we && !dI.off && !dI.extra && !dI.eid) chips.push(['we', 'عطلة نهاية الأسبوع']);
  var body = chips.length ? '<div class="cal-chips">' + chips.map(function (x) { return '<span class="cc cc-' + x[0] + '">' + esc(x[1]) + '</span>'; }).join('') + '</div>' : '';
  var wi2 = wkOf[sel];
  if (X && wi2 != null && X.W[wi2].days) { var ls = X.inWeek(wi2); body += '<div class="cal-plan"><p class="small muted">دروس الأسبوع ' + weekNo(X.W, wi2) + '</p>' + (ls.length ? '<ul class="wk-ls">' + ls.map(function (l) { return '<li><button class="link" data-act="lesson" data-k="' + esc(lk(b, l)) + '">' + esc(l.title) + '</button></li>'; }).join('') + '</ul>' : '<p class="small muted">لم تختر درسًا لهذا الأسبوع.</p>') + '</div>'; }
  if (!body) body = '<p class="cal-ln muted">لا مواعيد في هذا اليوم.</p>';
  h += '<div class="cal-det"><div class="cal-det-h"><b>' + esc(dayFull(sel)) + '</b><span>' + (dI.hj ? dI.hj.d + ' ' + esc(dI.hj.m) + ' · ' : '') + rel + '</span></div>' + body + '</div>';
  var LG = [['we', 'نهاية الأسبوع'], ['off', 'إجازة دراسية'], ['extra', 'إجازة إضافية'], ['eid', 'عيد'], ['ram', 'رمضان'], ['mark', 'بدايات ونهايات']].filter(function (x) { return seen[x[0]]; });
  h += '<div class="cal-leg"><span><i class="sw today"></i>اليوم</span>' + LG.map(function (x) { return '<span><i class="sw k-' + x[0] + '"></i>' + x[1] + '</span>'; }).join('') + (seen.plan ? '<span><i class="d-plan"></i>أسبوع فيه دروس</span>' : '') + '</div>';
  h += '<p class="cal-src">التقويم الدراسي من وزارة التعليم لعام 1448هـ (' + (P.region === 'west' ? 'مكة المكرمة والمدينة المنورة وجدة والطائف' : 'باقي مناطق المملكة') + '؛ غيّره من الإعدادات)، ورمضان والأعياد بتقويم أم القرى.</p></section>';
  return h;
}
ACT['cal-nav'] = function (el) { route.calM = (route.calM || 0) + +el.getAttribute('data-d'); route.calSel = null; render(true); };
ACT['cal-today'] = function () { route.calM = 0; route.calSel = null; render(true); };
ACT['cal-day'] = function (el) { route.calSel = +el.getAttribute('data-d'); render(true); };

/* ---------- home ---------- */
VIEWS.home = function () {
  var b = curBook(); if (!b) return noBook();
  var t = today(), E = eduList(), h = '<div class="home">', hj = hijriOf(t);
  var X = b.lessons.length ? buildSchedule(b) : null, cw = X ? curWeek(X.W) : -1;
  var wkTxt = X && cw >= 0 ? (X.W[cw].days ? 'الأسبوع ' + weekNo(X.W, cw) + ' من ' + (termsList().filter(function (x) { return x[0] === X.p.term; })[0] || [0, ''])[1] : 'أسبوع إجازة') : '';
  h += '<section class="panel hero span"><div class="hero-main"><p class="eyebrow">' + esc(dayFull(t)) + (hj ? ' · ' + hj.d + ' ' + esc(hj.m) + ' ' + hj.y + 'هـ' : '') + '</p><h1>' + (wkTxt ? esc(wkTxt) : esc(b.title)) + '</h1>';
  var nb = nextBreak(t, E); if (nb) h += '<p class="muted">' + (nb.a <= t ? 'أنت في ' + esc(nb.t) + ' حتى ' + esc(dayShort(nb.b)) : 'أقرب إجازة: ' + esc(nb.t) + ' بعد ' + cnt(nb.a - t, WORDS.day)) + '</p>';
  h += '</div></section>';
  if (!b.lessons.length) return h + '<div class="span">' + setupPanel(b) + '</div></div>';
  if (X) {
    var wi = cw >= 0 ? cw : 0, ls = [];
    for (var i = Math.max(0, cw); i < X.W.length && !ls.length; i++) { ls = X.inWeek(i); wi = i; }
    h += '<section class="panel span"><h2 class="hh">' + ico('target', 'teal') + (wi === cw ? 'دروس هذا الأسبوع' : 'الدروس القادمة') + '</h2>' + (ls.length ? '<p class="small muted">' + (wi !== cw ? 'الأسبوع ' + weekNo(X.W, wi) + ' · ' : '') + esc(rangeLbl(X.W[wi].a, X.W[wi].b)) + '</p><div class="ulist">' + ls.map(function (l) { return lessonRow(b, l, b.lessons.indexOf(l), 'teal'); }).join('') + '</div>' : '<p class="muted">' + (X.empty ? 'لم تختر دروس الأسابيع بعد؛ اخترها من «التقويم».' : 'لا دروس مختارة للأسابيع القادمة.') + '</p>') +
      '<div class="actions"><button class="btn ghost" data-act="go-plan">التقويم كاملًا</button>' + (S.last[b.id] ? '<button class="btn ghost tint hue-blue" data-act="go" data-to="read">تابع القراءة من ص ' + printedOf(b, S.last[b.id]) + '</button>' : '') + '</div></section>';
  }
  var n = b.lessons.length, ready = b.lessons.filter(function (l) { return aidOf(b, l); }).length;
  h += '<section class="panel"><h2 class="hh">' + ico('chart', 'violet') + 'الكتاب</h2><div class="tiles">' + tile(n, cntWord(n, WORDS.lesson), 'teal', 'book') + tile(ready, 'مساعد جاهز', 'violet', 'spark') +
    tile(b.lessons.reduce(function (s, l) { var a = aidOf(b, l); return s + (a ? a.d.figs.length : 0); }, 0), 'رسم توضيحي', 'amber', 'board') + tile(b.lessons.reduce(function (s, l) { var a = aidOf(b, l); return s + (a ? aidCounts(a.d).q : 0); }, 0), 'سؤال تقويم', 'rose', 'q') + '</div>' +
    (ready < n ? '<div class="actions"><button class="btn" data-act="gen-all">' + svgI('spark') + 'جهّز مساعد ' + (ready ? 'الدروس الباقية (' + (n - ready) + ')' : 'كل الدروس') + '</button></div>' : '') + '</section>';
  if (P.classes.length) {
    h += '<section class="panel"><h2 class="hh">' + ico('people', 'green') + 'التقدم في فصولي</h2><div class="groups">' + P.classes.map(function (c) {
      var d = b.lessons.filter(function (l) { return (S.taught[lk(b, l)] || {})[c]; }).length, p = pct(d, n);
      return '<div class="grow cls-row"><span class="g-name">' + esc(c) + '<small>' + d + ' من ' + n + '</small></span><span class="phbar" style="--b:var(--accent)"><b style="width:' + p + '%"></b></span><span class="g-pct">' + p + '%</span></div>';
    }).join('') + '</div><p class="small muted" style="margin-top:8px">علّم الدرس «شُرح» لكل فصل من صفحة الدرس.</p></section>';
  } else h += '<section class="panel"><h2 class="hh">' + ico('people', 'green') + 'فصولي</h2><p class="muted small">أضف فصولك (مثل 1/1، 1/2) لتتابع أين وصلت في كل فصل.</p><div class="actions"><button class="btn ghost" data-act="settings">أضف فصولي</button></div></section>';
  return h + '</div>';
};
ACT['go-plan'] = function () { go('plan', { jump: true }); };
function backupLine() {
  var last = S.backupAt || 0, stale = (!last || Date.now() - last > 14 * DAY) && (Object.keys(AIDS).length || Object.keys(S.taught).length);
  return '<span class="sync-line"><i></i>' + (stale ? 'كل شيء محفوظ على هذا الجهاز فقط' + (last ? '، وآخر نسخة احتياطية ' + relDay(last) : '، ولم تحفظ نسخة احتياطية بعد') + '. حذف التطبيق يحذف بياناته.' : 'كل شيء محفوظ على هذا الجهاز' + (last ? ' · آخر نسخة احتياطية ' + relDay(last) : '') + '.') + '</span>' + (stale ? '<button class="btn sm" data-act="backup-save">احفظ نسخة احتياطية</button>' : '');
}
AFTER.push(function () { var el = document.getElementById('sync'); if (el) { var stale = el.querySelector('.btn'); el.className = 'sync span ' + (stale ? 'off' : 'on'); } });

/* ---------- sync between the teacher's devices through his own Supabase project ----------
   One table, kitabi_kv (user_id, store, k, v jsonb, deleted, updated_at), locked to the signed-in user by row level security.
   Synced: books (without the PDF), aids, ink, notes (boards, marks, photos), and pieces of the state (taught, notes, plans, classes).
   Each record carries the time it was written on the device (t or at); the newer one wins. PDFs and videos stay on each device. */
var SB_STORES = { books: 1, aids: 1, ink: 1, notes: 1 };
var SBQ_KEY = 'kitabi-sync-q', SBS_KEY = 'kitabi-sync-st';
var SBQ = loadJSON(SBQ_KEY), SBS = loadJSON(SBS_KEY); // pending keys "store\u0001key"; snapshot of state pieces {key: [hash, t]}
var APPLYING = false, SB_TIMER = null, SB_BUSY = null, SB_ERR = '';
function sbOn() { return !!(P.sb && P.sb.url && P.sb.key && P.sb.rt); }
function sbSaveQ() { try { localStorage.setItem(SBQ_KEY, JSON.stringify(SBQ)); } catch (e) {} }
function sbSaveS() { try { localStorage.setItem(SBS_KEY, JSON.stringify(SBS)); } catch (e) {} }
function syncMark(st, k) {
  if (APPLYING || k == null || !SB_STORES[st] || !sbOn()) return;
  SBQ[st + '\u0001' + k] = 1; sbSaveQ(); sbSoon();
}
function sbSoon(ms) { if (!sbOn()) return; clearTimeout(SB_TIMER); SB_TIMER = setTimeout(function () { sbSync(); }, ms || 4000); }
function hashOf(x) { var s = JSON.stringify(x) || '', a = 2166136261; for (var i = 0; i < s.length; i++) { a ^= s.charCodeAt(i); a = Math.imul(a, 16777619); } return (a >>> 0).toString(36) + s.length; }
function statePieces() { // the state, cut into pieces that change separately
  var o = {};
  Object.keys(S.taught).forEach(function (k) { o['taught:' + k] = S.taught[k]; });
  Object.keys(S.notes).forEach(function (k) { o['note:' + k] = S.notes[k]; });
  Object.keys(S.plan).forEach(function (k) { o['plan:' + k] = S.plan[k]; });
  o['pref:classes'] = P.classes; if (P.region) o['pref:region'] = P.region;
  return o;
}
function syncStateMark() {
  if (APPLYING || !sbOn()) return;
  var o = statePieces(), now = Date.now(), any = false;
  Object.keys(o).forEach(function (k) { var h = hashOf(o[k]); if (!SBS[k] || SBS[k][0] !== h) { SBS[k] = [h, now]; SBQ['st\u0001' + k] = 1; any = true; } });
  Object.keys(SBS).forEach(function (k) { if (!(k in o) && SBS[k][0] !== 'x') { SBS[k] = ['x', now]; SBQ['st\u0001' + k] = 1; any = true; } });
  if (any) { sbSaveS(); sbSaveQ(); sbSoon(); }
}
function setPiece(k, v) { // a piece that came from the other device
  var i = k.indexOf(':'), kind = k.slice(0, i), key = k.slice(i + 1);
  if (kind === 'taught') { if (v == null) delete S.taught[key]; else S.taught[key] = v; }
  else if (kind === 'note') { if (v == null) delete S.notes[key]; else S.notes[key] = String(v); }
  else if (kind === 'plan') { if (v == null) delete S.plan[key]; else S.plan[key] = v; }
  else if (k === 'pref:classes') { P.classes = Array.isArray(v) ? v.map(String).slice(0, 20) : []; }
  else if (k === 'pref:region') { P.region = v === 'west' ? 'west' : 'std'; }
}

/* the Supabase REST endpoints, called directly */
function sbErr(code, msg) { var e = new Error(msg || String(code)); e.code = code; return e; }
function sbAuth(path, body) {
  var u = P.sb.url.replace(/\/+$/, '');
  return fetch(u + '/auth/v1/' + path, { method: 'POST', headers: { 'content-type': 'application/json', apikey: P.sb.key, Authorization: 'Bearer ' + P.sb.key }, body: JSON.stringify(body) })
    .then(function (r) { return r.json()['catch'](function () { return {}; }).then(function (j) { if (!r.ok) throw sbErr(r.status, j.msg || j.error_description || j.message || j.error || ''); return j; }); }, function () { throw sbErr('net'); });
}
function sbKeep(j) { P.sb.at = j.access_token; P.sb.rt = j.refresh_token; P.sb.exp = Date.now() + (j.expires_in || 3600) * 1000; if (j.user) { P.sb.uid = j.user.id; P.sb.email = j.user.email; } savePref(); }
function sbToken() {
  if (P.sb.at && P.sb.exp - Date.now() > 90000) return Promise.resolve(P.sb.at);
  return sbAuth('token?grant_type=refresh_token', { refresh_token: P.sb.rt }).then(function (j) { sbKeep(j); return P.sb.at; }, function (e) {
    if (e.code === 400 || e.code === 401) { P.sb.rt = ''; P.sb.at = ''; savePref(); SB_ERR = 'انتهت جلسة الدخول؛ سجّل الدخول مرة أخرى من الإعدادات.'; }
    throw e;
  });
}
function sbRest(method, query, body, prefer) {
  return sbToken().then(function (tok) {
    var h = { apikey: P.sb.key, Authorization: 'Bearer ' + tok };
    if (body) h['content-type'] = 'application/json'; if (prefer) h.Prefer = prefer;
    return fetch(P.sb.url.replace(/\/+$/, '') + '/rest/v1/kitabi_kv' + query, { method: method, headers: h, body: body ? JSON.stringify(body) : undefined })
      .then(function (r) { if (!r.ok) return r.text().then(function (t) { var m = ''; try { m = JSON.parse(t).message; } catch (e) { m = t.slice(0, 160); } throw sbErr(r.status, m); }); return method === 'GET' ? r.json() : null; }, function () { throw sbErr('net'); });
  });
}
function sbMsg(e) {
  var c = e && e.code, m = (e && e.message) || '';
  if (c === 'net') return 'لا اتصال بالإنترنت أو تعذّر الوصول إلى Supabase. تأكد من رابط المشروع، وأن المشروع ليس متوقفًا.';
  if (c === 400 && /invalid login|credentials/i.test(m)) return 'الإيميل أو كلمة المرور غير صحيحة.';
  if (/confirm/i.test(m)) return 'الحساب لم يُفعَّل: افتح رسالة التفعيل في بريدك. أو احذف المستخدم من Authentication ← Users، وأطفئ Confirm email، ثم «إنشاء حساب» من جديد.';
  if (/signups? not allowed|signup.*disabled/i.test(m)) return 'إنشاء الحسابات مطفأ في مشروعك (Allow new users to sign up). إن كان حسابك موجودًا فاضغط «دخول».';
  if (c === 401 || c === 403) return 'رُفض الطلب: تأكد من المفتاح العام (anon/publishable) ومن تشغيل كود SQL.';
  if (c === 404 || /kitabi_kv/.test(m)) return 'الجدول kitabi_kv غير موجود: شغّل كود SQL في مشروعك (الإعدادات ← المزامنة ← طريقة الإعداد).';
  if (c === 422 && /already/i.test(m)) return 'هذا الإيميل مسجّل من قبل؛ استعمل «دخول».';
  return m || String(c);
}

/* local records */
function recT(st, r) { return r ? (st === 'aids' ? +r.at || 0 : +r.t || +r.at || 0) : 0; }
function cleanOut(st, r) { // what leaves the device
  if (st === 'books') { var b = {}; ['id', 'title', 'lessons', 'offset', 'pages', 'term', 'added', 'file', 'size', 't'].forEach(function (k) { if (r[k] != null) b[k] = r[k]; }); return b; }
  return r;
}
function localGet(st, k) { if (st === 'st') return Promise.resolve(null); return dbGet(st, k)['catch'](function () { return null; }); }

/* applying what came from the other device */
function applyRow(row, ctx) {
  var st = row.store, k = row.k, v = row.v, del = row.deleted, rt = v ? +(v.t || v.at || 0) : 0;
  if (st === 'st') {
    var snap = SBS[k];
    if (!ctx.first && snap && snap[1] >= rt) return Promise.resolve(false); // on the first sync of a device, what is in the project wins
    if (ctx.first && !del && /^taught:/.test(k)) { var cur = S.taught[k.slice(7)] || {}, merged = Object.assign({}, v.d || {}, cur); setPiece(k, merged); }
    else if (ctx.first && snap == null && k.indexOf('pref:') === 0 && !del && k === 'pref:classes' && P.classes.length) { /* keep this device's classes on the very first sync */ }
    else setPiece(k, del ? null : v.d);
    var o = statePieces(); SBS[k] = [k in o ? hashOf(o[k]) : 'x', rt]; ctx.state = true; return Promise.resolve(true);
  }
  if (!SB_STORES[st]) return Promise.resolve(false);
  return localGet(st, k).then(function (loc) {
    if (st === 'books' && !loc && !del && ctx.first) { // the same book, added on this device from another copy of the file
      var same = BOOKS.filter(function (x) { return !x.synced && x.id !== k && +x.pages === +v.pages && (norm(x.title) === norm(v.title) || !x.lessons.length) && !ctx.remoteBooks[x.id]; });
      if (same.length === 1) return rekeyBook(same[0].id, k).then(function () { return applyRow(row, ctx); });
    }
    var lt = recT(st, loc);
    var fill = st === 'books' && loc && !del && !(loc.lessons || []).length && (v.lessons || []).length; // a book still without lessons takes the other device's
    if (loc && lt >= rt && !fill && !(del && rt > lt)) return false;
    APPLYING = true;
    try {
      if (del) {
        if (!loc) return false;
        dbDel(st, k);
        if (st === 'aids') delete AIDS[k]; else if (st === 'notes') { delete XC[k]; if (/^a:/.test(k) && RD) setTimeout(drawAnsAll, 0); if (/^n:/.test(k) && RD) setTimeout(drawStkAll, 0); } else if (st === 'books') BOOKS = BOOKS.filter(function (x) { return x.id !== k; });
      } else if (st === 'books') {
        var b = bookById(k);
        if (!b) { b = { id: k, lessons: [] }; BOOKS.push(b); b.missing = !ctx.files[k]; }
        ['title', 'lessons', 'offset', 'pages', 'term', 'added', 'file', 'size', 't'].forEach(function (f) { if (v[f] != null) b[f] = v[f]; });
        b.synced = true; dbPut('books', b);
      } else if (st === 'aids') {
        var d; try { d = cleanAid(v.d); } catch (e) { return false; }
        var rec = { k: k, src: v.src === 'ai' ? 'ai' : 'pack', at: rt, model: str(v.model), d: d }; AIDS[k] = rec; dbPut('aids', rec);
      } else if (st === 'ink') { if (Array.isArray(v.s)) dbPut('ink', { k: k, s: v.s, t: rt }); }
      else if (st === 'notes') { var c = Object.assign({}, v, { k: k }); XC[k] = c; dbPut('notes', c); if (/^a:/.test(k) && RD) setTimeout(drawAnsAll, 0); if (/^n:/.test(k) && RD) setTimeout(drawStkAll, 0); }
    } finally { APPLYING = false; }
    ctx.changed = true; return true;
  });
}
function rekeyBook(oldId, nu) { // move everything of a book to the id the other device uses
  APPLYING = true;
  function moveStore(st, match, mapKey, fix) {
    return dbAll(st).then(function (all) {
      var jobs = [];
      (all || []).forEach(function (r) { var key = r.k != null ? r.k : r.id; if (!match(key)) return; var n = JSON.parse(JSON.stringify(r)); var nk = mapKey(key); if (r.k != null) n.k = nk; else n.id = nk; if (fix) fix(n); jobs.push(tx(st, 'readwrite', function (s) { s.put(n); s['delete'](key); })); });
      return Promise.all(jobs);
    });
  }
  var pre = oldId + ':', pk = function (key) { return key.indexOf(pre) === 0; }, mk = function (key) { return nu + key.slice(oldId.length); };
  var npk = function (key) { return /^[bxpalnf]:/.test(key) && key.indexOf(pre, 2) === 2; }, nmk = function (key) { return key.slice(0, 2) + nu + key.slice(2 + oldId.length); };
  return Promise.all([
    dbGet('books', oldId).then(function (b) { if (!b) return; b.id = nu; return tx('books', 'readwrite', function (s) { s.put(b); s['delete'](oldId); }); }),
    dbGet('files', oldId).then(function (f) { if (!f) return; f.id = nu; return tx('files', 'readwrite', function (s) { s.put(f); s['delete'](oldId); }); }),
    moveStore('aids', pk, mk), moveStore('ink', pk, mk),
    moveStore('notes', npk, nmk, function (n) { if (Array.isArray(n.imgs)) n.imgs.forEach(function (m) { if (m.mk) m.mk = 'm:' + nmk(String(m.mk).slice(2)); }); }),
    moveStore('media', function (key) { return key.indexOf('m:' + pre) === 0; }, function (key) { return 'm:' + nu + key.slice(2 + oldId.length); })
  ]).then(function () {
    var b = bookById(oldId); if (b) { b.id = nu; b.synced = true; }
    Object.keys(AIDS).forEach(function (key) { if (pk(key)) { var a = AIDS[key]; delete AIDS[key]; a.k = mk(key); AIDS[a.k] = a; } });
    Object.keys(XC).forEach(function (key) { if (npk(key)) { var x = XC[key]; delete XC[key]; x.k = nmk(key); XC[x.k] = x; } });
    ['taught', 'notes', 'ans'].forEach(function (f) { Object.keys(S[f]).forEach(function (key) { if (pk(key)) { S[f][mk(key)] = S[f][key]; delete S[f][key]; } }); });
    ['plan', 'last'].forEach(function (f) { if (S[f][oldId] != null) { S[f][nu] = S[f][oldId]; delete S[f][oldId]; } });
    if (S.cur === oldId) S.cur = nu; delete DOCS[oldId];
    Object.keys(SBQ).forEach(function (q) { if (q.indexOf(oldId) >= 0) delete SBQ[q]; });
    APPLYING = false; saveState(true);
  }, function (e) { APPLYING = false; throw e; });
}

/* one round: pull what changed, then push what changed here */
function sbSync(manual) {
  if (!sbOn()) return Promise.resolve();
  if (SB_BUSY) return SB_BUSY;
  if (navigator.onLine === false) { SB_ERR = 'لا اتصال بالإنترنت؛ ستُرفع التغييرات حين يعود.'; return Promise.resolve(); }
  var first = !P.sb.cursor, ctx = { first: first, changed: false, state: false, remoteBooks: {}, remoteT: {}, files: {} }, pulled = 0, pushed = 0;
  SB_BUSY = tx('files', 'readonly', function (s) { return s.getAllKeys(); }).then(function (fk) {
    (fk || []).forEach(function (k) { ctx.files[k] = 1; });
    var cursor = P.sb.cursor || '1970-01-01T00:00:00Z', maxSeen = cursor;
    function page() {
      return sbRest('GET', '?select=store,k,v,deleted,updated_at&updated_at=gt.' + encodeURIComponent(cursor) + '&order=updated_at.asc&limit=300').then(function (rows) {
        rows.forEach(function (r) { ctx.remoteT[r.store + '\u0001' + r.k] = r.v ? +(r.v.t || r.v.at || 0) : 0; if (r.store === 'books') ctx.remoteBooks[r.k] = 1; });
        rows.sort(function (a, b) { return (a.store === 'books' ? 0 : 1) - (b.store === 'books' ? 0 : 1); }); // books first: their ids decide where the rest goes
        return rows.reduce(function (p, r) { return p.then(function () { return applyRow(r, ctx); }).then(function (x) { if (x) pulled++; }); }, Promise.resolve()).then(function () {
          rows.forEach(function (r) { if (r.updated_at > maxSeen) maxSeen = r.updated_at; });
          if (rows.length === 300) { cursor = maxSeen; return page(); }
        });
      });
    }
    return page().then(function () {
      if (ctx.state) { APPLYING = true; saveState(true); savePref(); APPLYING = false; }
      if (!first) return;
      // first sync on this device: everything here that the project lacks or holds older
      return Promise.all(Object.keys(SB_STORES).map(function (st) { return dbAll(st).then(function (all) { (all || []).forEach(function (r) { var key = r.k != null ? r.k : r.id; if (recT(st, r) > (ctx.remoteT[st + '\u0001' + key] || -1)) SBQ[st + '\u0001' + key] = 1; }); }); })).then(function () {
        var o = statePieces(), now = Date.now(); Object.keys(o).forEach(function (k) { if (ctx.remoteT['st\u0001' + k] == null) { SBS[k] = [hashOf(o[k]), now]; SBQ['st\u0001' + k] = 1; } }); sbSaveS(); sbSaveQ();
      });
    }).then(function () { P.sb.cursor = maxSeen; savePref(); return sbPush(); });
  }).then(function (n) {
    pushed = n || 0; SB_ERR = ''; P.sb.last = Date.now(); savePref();
    if (ctx.changed || ctx.state) sbRefresh();
    if (manual) toast(pulled || pushed ? 'زُومن: وصل ' + pulled + ' ورُفع ' + pushed : 'كل شيء متزامن');
    return { pulled: pulled, pushed: pushed };
  }, function (e) {
    SB_ERR = sbMsg(e); if (manual) toast(SB_ERR, 5000);
  }).then(function (x) { SB_BUSY = null; refreshSyncInfo(); return x; });
  return SB_BUSY;
}
function sbPush() {
  var keys = Object.keys(SBQ); if (!keys.length) return Promise.resolve(0);
  var o = statePieces();
  return Promise.all(keys.map(function (q) {
    var i = q.indexOf('\u0001'), st = q.slice(0, i), k = q.slice(i + 1);
    if (st === 'st') { var del = !(k in o); return { store: 'st', k: k, v: { d: del ? null : o[k], t: (SBS[k] || [0, Date.now()])[1] }, deleted: del }; }
    return localGet(st, k).then(function (r) { return r ? { store: st, k: String(k), v: cleanOut(st, r), deleted: false } : { store: st, k: String(k), v: { t: Date.now() }, deleted: true }; });
  })).then(function (rows) {
    var batches = [], cur = [], size = 0;
    rows.forEach(function (r) { var n = JSON.stringify(r).length; if (cur.length && size + n > 800000) { batches.push(cur); cur = []; size = 0; } cur.push(r); size += n; });
    if (cur.length) batches.push(cur);
    return batches.reduce(function (p, b) {
      return p.then(function () { return sbRest('POST', '?on_conflict=user_id,store,k', b, 'resolution=merge-duplicates,return=minimal'); })
        .then(function () { b.forEach(function (r) { delete SBQ[r.store + '\u0001' + r.k]; }); sbSaveQ(); });
    }, Promise.resolve()).then(function () { BOOKS.forEach(function (b) { b.synced = true; }); return rows.length; });
  });
}
function sbRefresh() { // show what arrived, unless the teacher is in the middle of something
  var busy = route.v === 'read' || !document.getElementById('modal').hidden || !document.getElementById('pv').hidden || XA_LIVE || NB_LIVE.some(function (B) { return B.cur; }) || (document.activeElement && /input|textarea|select/i.test(document.activeElement.tagName));
  if (busy) { SB_LATER = true; return; }
  SB_LATER = false; render(true);
}
var SB_LATER = false;
AFTER.push(function () { if (SB_LATER && route.v !== 'read') { SB_LATER = false; setTimeout(function () { render(true); }, 0); } });
document.addEventListener('input', function (e) { // keep what is typed, so leaving the app to copy the key loses nothing
  var t = e.target, id = t && t.id; if (sbOn() || (id !== 'sb-url' && id !== 'sb-key' && id !== 'sb-email')) return;
  P.sb = P.sb || {};
  if (id === 'sb-url') { var both = /(https?:\/\/[^\s]+)\s+((?:sb_publishable_|eyJ)[^\s]+)/.exec(t.value); if (both) { t.value = both[1]; document.getElementById('sb-key').value = both[2]; P.sb.key = both[2]; } P.sb.url = t.value.trim(); }
  else if (id === 'sb-key') P.sb.key = t.value.replace(/\s+/g, ''); else P.sb.email = t.value.trim();
  savePref();
}, true);
document.addEventListener('visibilitychange', function () { if (!document.hidden) sbSoon(500); else if (Object.keys(SBQ).length) sbSync(); });
window.addEventListener('online', function () { sbSoon(500); });
setInterval(function () { if (!document.hidden) sbSync(); }, 90000);

/* settings */
var SB_SQL = [
  'create table if not exists public.kitabi_kv (',
  '  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,',
  '  store text not null,',
  '  k text not null,',
  '  v jsonb,',
  '  deleted boolean not null default false,',
  '  updated_at timestamptz not null default clock_timestamp(),',
  '  primary key (user_id, store, k)',
  ');',
  'create index if not exists kitabi_kv_sync on public.kitabi_kv (user_id, updated_at);',
  'alter table public.kitabi_kv enable row level security;',
  'drop policy if exists "kitabi own rows" on public.kitabi_kv;',
  'create policy "kitabi own rows" on public.kitabi_kv for all to authenticated',
  '  using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);',
  'create or replace function public.kitabi_touch() returns trigger language plpgsql set search_path = \'\' as $$',
  'begin new.updated_at := clock_timestamp(); return new; end $$;',
  'drop trigger if exists kitabi_touch on public.kitabi_kv;',
  'create trigger kitabi_touch before insert or update on public.kitabi_kv for each row execute function public.kitabi_touch();',
  'grant select, insert, update, delete on public.kitabi_kv to authenticated;'
].join('\n');
function syncSec() {
  var sb = P.sb || {}, on = sbOn();
  if (on) return '<section class="set-sec" id="sync-sec"><h3>المزامنة بين أجهزتك (Supabase)</h3><p class="small">متصل بحساب <b dir="ltr">' + esc(sb.email || '') + '</b></p><p class="small muted" id="sync-info">' + syncInfo() + '</p>' +
    '<div class="actions" style="margin-top:0"><button class="btn" data-act="sb-now">زامن الآن</button><button class="btn ghost sm" data-act="sb-copy">انسخ الرابط والمفتاح</button><button class="btn ghost sm" data-act="sb-out">خروج</button></div>' +
    '<p class="small muted">يتزامن: الدروس ومساعدها، والكتابة على الصفحات والشرح، والسبورات والصور، والملاحظات، و«شُرح في»، والتقويم، وفصولك. ويبقى على كل جهاز: ملف الكتاب ومقاطع الفيديو. أضف الكتاب مرة على كل جهاز.</p></section>';
  return '<section class="set-sec" id="sync-sec"><h3>المزامنة بين أجهزتك (Supabase)</h3><p class="small muted">اربط التطبيق بمشروعك في Supabase فيظهر ما تجهّزه وتكتبه على الآيفون في الآيباد تلقائيًا. الرابط والمفتاح وبيانات الدخول تبقى على هذا الجهاز. <button class="link" data-act="sb-how">طريقة الإعداد</button></p>' +
    '<label class="field"><span>رابط المشروع (Project URL)</span><input type="url" id="sb-url" dir="ltr" autocapitalize="off" spellcheck="false" placeholder="https://xxxx.supabase.co" value="' + esc(sb.url || '') + '"></label>' +
    '<label class="field"><span>المفتاح العام (anon أو publishable)</span><input type="text" id="sb-key" dir="ltr" autocapitalize="off" spellcheck="false" placeholder="eyJ… أو sb_publishable_…" value="' + esc(sb.key || '') + '"></label>' +
    '<label class="field"><span>الإيميل</span><input type="email" id="sb-email" dir="ltr" autocapitalize="off" value="' + esc(sb.email || '') + '"></label>' +
    '<label class="field"><span>كلمة المرور</span><input type="password" id="sb-pass" dir="ltr" autocomplete="current-password"></label>' +
    '<div class="actions" style="margin-top:0"><button class="btn" data-act="sb-in">دخول</button><button class="btn ghost sm" data-act="sb-up">إنشاء حساب</button></div><p class="small muted" id="sync-info">' + esc(SB_ERR) + '</p></section>';
}
function syncInfo() {
  var sb = P.sb || {}, q = Object.keys(SBQ).length;
  if (SB_ERR) return esc(SB_ERR);
  if (SB_BUSY) return 'تجري المزامنة…';
  return (sb.last ? 'آخر مزامنة: ' + new Date(sb.last).toLocaleTimeString('ar-SA-u-nu-latn', { hour: 'numeric', minute: '2-digit' }) + ' ' + relDay(sb.last) : 'لم تتم مزامنة بعد') + (q ? ' · بانتظار الرفع: ' + q : '');
}
function refreshSyncInfo() { var el = document.getElementById('sync-info'); if (el && sbOn()) el.innerHTML = syncInfo(); }
function sbUrl(x) { // accepts the Project URL, any URL inside the project, or the dashboard address
  x = String(x || '').trim(); if (!x) return '';
  var m = /supabase\.com\/dashboard\/project\/([a-z0-9]{10,40})/i.exec(x); if (m) return 'https://' + m[1].toLowerCase() + '.supabase.co';
  if (/^[a-z0-9]{15,40}$/i.test(x)) return 'https://' + x.toLowerCase() + '.supabase.co'; // the project id alone
  if (!/^https?:\/\//i.test(x)) x = 'https://' + x;
  try { var u = new URL(x); return u.protocol === 'https:' || /^(localhost|127\.0\.0\.1)$/.test(u.hostname) ? u.origin : ''; } catch (e) { return ''; }
}
function sbForm() {
  var info = document.getElementById('sync-info');
  function bad(t) { if (info) info.innerHTML = '<span class="bad">' + esc(t) + '</span>'; toast(t, 4000); return null; }
  var url = sbUrl(document.getElementById('sb-url').value), key = (document.getElementById('sb-key').value || '').replace(/\s+/g, ''), em = (document.getElementById('sb-email').value || '').trim(), pw = document.getElementById('sb-pass').value || '';
  if (!url) return bad('رابط المشروع غير صحيح. انسخه من Project Settings ← Data API، وشكله: https://….supabase.co');
  if (key.length < 20) return bad('الصق المفتاح العام كاملًا (Publishable أو anon).');
  if (/^sb_secret_/.test(key) || /service_role/.test(key)) return bad('هذا المفتاح السري؛ الصق المفتاح العام (Publishable أو anon) لا secret.');
  if (!/^\S+@\S+\.\S+$/.test(em)) return bad('اكتب الإيميل كاملًا.');
  if (pw.length < 6) return bad('كلمة المرور 6 أحرف فأكثر.');
  document.getElementById('sb-url').value = url;
  P.sb = { url: url, key: key, email: em }; savePref(); return { email: em, password: pw };
}
function sbAfterIn(j) {
  sbKeep(j); P.sb.cursor = ''; SBS = {}; sbSaveS(); SBQ = {}; sbSaveQ(); SB_ERR = '';
  toast('تم الدخول؛ تجري أول مزامنة…', 3000); refreshSettings();
  sbSync(true).then(function () { refreshSettings(); });
}
ACT['sb-in'] = function () { var f = sbForm(); if (!f) return; var o = document.getElementById('sync-info'); if (o) o.textContent = 'جارٍ الدخول…'; sbAuth('token?grant_type=password', f).then(sbAfterIn, function (e) { SB_ERR = sbMsg(e); if (o) o.textContent = SB_ERR; }); };
ACT['sb-up'] = function () {
  var f = sbForm(); if (!f) return; var o = document.getElementById('sync-info'); if (o) o.textContent = 'جارٍ إنشاء الحساب…';
  sbAuth('signup', f).then(function (j) { if (j.access_token) sbAfterIn(j); else if (o) o.textContent = 'أُنشئ الحساب. افتح رسالة التفعيل في بريدك، ثم اضغط «دخول». (أو أوقف «Confirm email» في Supabase.)'; }, function (e) { SB_ERR = sbMsg(e); if (o) o.textContent = SB_ERR; });
};
ACT['sb-now'] = function () { SB_ERR = ''; refreshSyncInfo(); sbSync(true); };
ACT['sb-out'] = function () { confirmBox('الخروج من المزامنة؟', 'تبقى كل بياناتك على هذا الجهاز، وتتوقف المزامنة حتى تدخل مرة أخرى.', 'sb-out-yes', 'اخرج', ''); };
ACT['sb-out-yes'] = function () { var sb = P.sb || {}; if (sb.at) fetch(sb.url + '/auth/v1/logout', { method: 'POST', headers: { apikey: sb.key, Authorization: 'Bearer ' + sb.at } })['catch'](function () {}); P.sb = { url: sb.url, key: sb.key, email: sb.email }; savePref(); SBQ = {}; sbSaveQ(); closeModal(); ACT.settings(); };
ACT['sb-how'] = function () {
  openModal(sheet('إعداد Supabase للمزامنة', '<ol class="steps small">' +
    '<li>ادخل <a href="https://supabase.com/dashboard" target="_blank" rel="noopener">supabase.com/dashboard</a> وأنشئ مشروعًا جديدًا (Free). اختر منطقة قريبة واحفظ كلمة مرور قاعدة البيانات.</li>' +
    '<li>من <b>SQL Editor</b> ← New query: الصق الكود أدناه واضغط <b>Run</b>. ينشئ جدولًا واحدًا لا يقرأ صفوفه إلا صاحبها.</li>' +
    '<li><b>الرابط:</b> من <b>Project Settings</b> (الترس أسفل القائمة الجانبية) ← <b>Data API</b> ← انسخ <b>Project URL</b>. أو كوّنه بنفسك: عنوان المتصفح فيه <span dir="ltr">supabase.com/dashboard/project/<b>abcd…</b></span>، فيكون الرابط <span dir="ltr">https://<b>abcd…</b>.supabase.co</span>.</li>' +
    '<li><b>المفتاح:</b> من <b>Project Settings ← API Keys</b> ← انسخ <b>Publishable key</b> (يبدأ بـ sb_publishable_)، أو من تبويب Legacy المفتاح <b>anon</b>. لا تنسخ secret ولا service_role.</li>' +
    '<li>من <b>Authentication ← Sign In / Providers</b>: أطفئ <b>Confirm email</b> واحفظ (تجده في أعلى الصفحة، أو بالضغط على <b>Email</b> في قائمة المزوّدين).</li>' +
    '<li>في هذا التطبيق على الجهاز الذي فيه عملك: الإعدادات ← المزامنة: الصق الرابط والمفتاح، واكتب إيميلك وكلمة مرور جديدة، ثم <b>«إنشاء حساب»</b>. يدخل مباشرة ويبدأ أول مزامنة.</li>' +
    '<li>ارجع إلى <b>Sign In / Providers</b> وأطفئ <b>Allow new users to sign up</b> واحفظ، حتى لا ينشئ غيرك حسابات في مشروعك.</li>' +
    '<li>على الجهاز الثاني: الإعدادات ← المزامنة: الرابط والمفتاح والإيميل وكلمة المرور نفسها، ثم <b>«دخول»</b>.</li></ol>' +
    '<p class="small muted">المشروع المجاني يتوقف إذا لم يُستعمل أسبوعًا؛ أعِد تشغيله من لوحة Supabase بزر Restore، والتطبيق يعمل على الجهاز في أثناء ذلك.</p>' +
    '<div class="actions"><button class="btn" data-act="sb-sql">انسخ كود SQL</button></div><pre class="sql" dir="ltr">' + esc(SB_SQL) + '</pre>'), true);
};
ACT['sb-sql'] = function () { copyText(SB_SQL); };
ACT['sb-copy'] = function () { var sb = P.sb || {}; Promise.resolve(copyText(sb.url + ' ' + sb.key)).then(function () { toast('نُسخ الرابط والمفتاح (بلا كلمة المرور). الصقهما في خانة الرابط في إتقان أو مصروفي.', 4000); }); };

/* ---------- the user's own font (from إتقان): files kept in IndexedDB «fonts», used as "thmanyah sans" ---------- */
var FONTS = 0;
var WEIGHT_NAMES = { 200: 'خفيف جدًا', 300: 'خفيف', 400: 'عادي', 500: 'متوسط', 600: 'شبه عريض', 700: 'عريض', 800: 'عريض جدًا', 900: 'أسود' };
function fontWeight(name) {
  var n = String(name).toLowerCase();
  return /black|heavy/.test(n) ? 900 : /extra-?bold|ultra-?bold/.test(n) ? 800 : /semi-?bold|demi/.test(n) ? 600 : /bold/.test(n) ? 700 : /medium/.test(n) ? 500 : /extra-?light|ultra-?light|thin|hairline/.test(n) ? 200 : /light/.test(n) ? 300 : 400;
}
function applyFont(f) {
  try { var ff = new FontFace('thmanyah sans', f.data, { weight: String(f.weight), style: 'normal' }); return ff.load().then(function () { document.fonts.add(ff); }); }
  catch (e) { return Promise.reject(e); }
}
function fontsBoot() {
  return dbAll('fonts').then(function (all) {
    all = all || []; FONTS = all.length;
    all.forEach(function (f) { applyFont(f)['catch'](function () {}); });
  }, function () {});
}
function fontSec() {
  return '<section class="set-sec"><h3>الخط</h3><p class="small muted">' + (FONTS ? 'يُستخدم الآن الخط الذي أضفته (' + (FONTS === 1 ? 'وزن واحد' : FONTS === 2 ? 'وزنان' : FONTS + ' أوزان') + ').' : 'يستخدم التطبيق خط جهازك.') +
    ' إن كانت لديك ملفات خط عربي (مثل خط ثمانية) بصيغة OTF أو TTF أو WOFF فأضفها ليُستخدم داخل التطبيق على هذا الجهاز فقط. اختر كل أوزان الخط معًا (عادي وعريض…)، ويُعرف الوزن من اسم الملف.</p>' +
    '<div class="actions" style="margin-top:0"><button class="btn ghost" data-act="font-add">أضف ملفات الخط</button>' + (FONTS ? '<button class="btn ghost" data-act="font-remove">ارجع إلى خط الجهاز</button>' : '') + '</div></section>';
}
ACT['font-add'] = function () {
  pick('', true).then(function (files) {
    var ok = [], bad = 0;
    toast('جارٍ إضافة الخط…');
    return files.reduce(function (pr, f) {
      return pr.then(function () {
        return (f.arrayBuffer ? f.arrayBuffer() : new Response(f).arrayBuffer()).then(function (buf) {
          var w = fontWeight(f.name), rec = { id: 'w' + w, weight: w, name: f.name, data: buf };
          return applyFont(rec).then(function () { return dbPut('fonts', rec); }).then(function () { ok.push(w); });
        })['catch'](function () { bad++; });
      });
    }, Promise.resolve()).then(function () {
      return dbAll('fonts').then(function (all) { FONTS = (all || []).length; });
    }).then(function () {
      refreshSettings();
      if (ok.length) toast('أُضيف الخط: ' + ok.sort().map(function (w) { return WEIGHT_NAMES[w] || w; }).join('، ') + (bad ? '. ولم يُقبل ' + bad + ' ملف لأنه ليس ملف خط صالحًا' : ''), 4500);
      else toast('تعذّرت إضافة الخط: اختر ملفات OTF أو TTF أو WOFF', 4000);
    });
  });
};
ACT['font-remove'] = function () {
  tx('fonts', 'readwrite', function (s) { s.clear(); }).then(function () { location.reload(); });
};

/* ---------- the class clock: date and time in the lesson and the reader, and a countdown timer ----------
   The timer lives in localStorage «kitabi-timer» {end, left, dur}, so it keeps running across screens and a reload. */
var CLK = (function () { try { return JSON.parse(localStorage.getItem('kitabi-timer') || '{}') || {}; } catch (e) { return {}; } })(), CLK_AC = null, CLK_DONE = false;
function clkSave() { try { localStorage.setItem('kitabi-timer', JSON.stringify(CLK)); } catch (e) {} }
function clkLeft() { return CLK.end ? Math.max(0, CLK.end - Date.now()) : (CLK.left || 0); }
function clkOn() { return !!(CLK.end || CLK.left); }
function clkFmt(ms) { var s = Math.ceil(ms / 1000), m = Math.floor(s / 60); s %= 60; return m + ':' + (s < 10 ? '0' : '') + s; }
function clkTime() { var d = new Date(), h = d.getHours(), m = d.getMinutes(); return ((h % 12) || 12) + ':' + (m < 10 ? '0' : '') + m + ' ' + (h < 12 ? 'ص' : 'م'); }
function clkDates() {
  var i = today(), p = ymd(i), hj = hijriOf(i);
  return { day: AR_DAYS[wday(i)], hj: hj ? hj.d + ' ' + hj.m + ' ' + hj.y + 'هـ' : '', hs: hj ? hj.d + ' ' + hjShort(hj.m) : '', hm: hj ? hj.d + ' ' + hj.m : p.d + ' ' + AR_MONTHS[p.m], g: p.d + ' ' + AR_MONTHS[p.m] + ' ' + p.y + 'م' };
}
function clkPill() {
  var D = clkDates(), on = clkOn();
  return '<button type="button" class="clk" data-act="clk-open" aria-label="التاريخ والوقت والمؤقت"><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="13" r="8"/><path d="M12 9v4l2.5 2.5M9.5 2.5h5"/></svg><span class="clk-d">' + esc(D.day + ' ' + D.hm + ' ·') + '</span><b class="clk-t">' + clkTime() + '</b><span class="clk-r"' + (on ? '' : ' hidden') + '>' + (on ? clkFmt(clkLeft()) : '') + '</span></button>';
}
function clkTick() {
  var left = clkLeft(), run = !!CLK.end, on = clkOn();
  if (CLK.end && left <= 0) { var late = Date.now() - CLK.end > 90000; CLK.end = 0; CLK.left = 0; clkSave(); if (!late) clkAlarm(); else wake(false); on = false; run = false; } // ended long ago (app closed): no alarm now
  var D = clkDates(), t = clkTime();
  Array.prototype.forEach.call(document.querySelectorAll('.clk'), function (el) {
    el.querySelector('.clk-d').textContent = D.day + ' ' + D.hm + ' ·';
    el.querySelector('.clk-t').textContent = t;
    var r = el.querySelector('.clk-r'); r.textContent = on ? clkFmt(left) : ''; r.hidden = !on;
    el.classList.toggle('run', run); el.classList.toggle('pause', on && !run); el.classList.toggle('late', run && left <= 10000); el.classList.toggle('done', CLK_DONE);
  });
  var big = document.getElementById('clk-num'), dur = CLK.dur || left || 1;
  if (big) { big.textContent = on ? clkFmt(left) : CLK_DONE ? '0:00' : clkFmt(CLK.dur || 300000); big.className = 'clk-num' + (run && left <= 10000 ? ' late' : '') + (CLK_DONE ? ' done' : ''); }
  var bar = document.getElementById('clk-bar'); if (bar) bar.style.width = (on ? Math.max(0, Math.min(100, left / dur * 100)) : CLK_DONE ? 0 : 100) + '%';
  var pt = document.getElementById('clk-ptime'); if (pt) pt.textContent = t;
  Array.prototype.forEach.call(document.querySelectorAll('[data-act="clk-go"]'), function (b) { b.textContent = run ? 'إيقاف مؤقت' : on ? 'تابع' : 'ابدأ'; });
}
setInterval(clkTick, 500);
AFTER.push(function () { setTimeout(clkTick, 0); });
function clkSound() { // short beeps; the audio is unlocked by the tap that started the timer
  try {
    var C = window.AudioContext || window.webkitAudioContext; if (!C) return null;
    if (!CLK_AC) CLK_AC = new C(); if (CLK_AC.state === 'suspended') CLK_AC.resume();
    return CLK_AC;
  } catch (e) { return null; }
}
function clkBeeps() {
  var ac = clkSound(); if (!ac) return;
  for (var k = 0; k < 6; k++) (function (k) {
    var o = ac.createOscillator(), g = ac.createGain(), t0 = ac.currentTime + k * 0.42;
    o.type = 'sine'; o.frequency.value = k % 2 ? 660 : 880; o.connect(g); g.connect(ac.destination);
    g.gain.setValueAtTime(0.0001, t0); g.gain.exponentialRampToValueAtTime(0.5, t0 + 0.02); g.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.32);
    o.start(t0); o.stop(t0 + 0.34);
  })(k);
}
function clkAlarm() {
  CLK_DONE = true; clkBeeps(); try { if (navigator.vibrate) navigator.vibrate([300, 150, 300, 150, 300]); } catch (e) {}
  wake(false);
  var el = document.getElementById('clk-alarm');
  if (!el) { el = document.createElement('div'); el.id = 'clk-alarm'; el.className = 'clk-alarm'; el.setAttribute('role', 'alert'); document.body.appendChild(el); }
  el.innerHTML = '<b>⏰ انتهى الوقت</b><div><button type="button" class="btn sm" data-act="clk-more" data-m="1">دقيقة أخرى</button><button type="button" class="btn sm ghost" data-act="clk-ok">حسنًا</button></div>';
  el.hidden = false;
}
ACT['clk-ok'] = function () { CLK_DONE = false; var el = document.getElementById('clk-alarm'); if (el) el.hidden = true; clkTick(); };
function clkStart(ms) { clkSound(); CLK_DONE = false; var a = document.getElementById('clk-alarm'); if (a) a.hidden = true; CLK.dur = ms; CLK.end = Date.now() + ms; CLK.left = 0; clkSave(); wake(true); clkTick(); }
ACT['clk-more'] = function (el) { ACT['clk-ok'](); clkStart((+el.getAttribute('data-m') || 1) * 60000); };
ACT['clk-preset'] = function (el) { clkStart(+el.getAttribute('data-m') * 60000); };
ACT['clk-go'] = function () {
  if (CLK.end) { CLK.left = clkLeft(); CLK.end = 0; wake(false); } // pause
  else if (CLK.left) { clkSound(); CLK.end = Date.now() + CLK.left; CLK.left = 0; wake(true); } // resume
  else { var m = document.getElementById('clk-min'); clkStart(Math.max(0.25, +(m && m.value) || 5) * 60000); return; }
  clkSave(); clkTick();
};
ACT['clk-add'] = function (el) {
  var d = +el.getAttribute('data-d') * 60000;
  if (CLK.end) CLK.end = Math.max(Date.now() + 1000, CLK.end + d); else if (CLK.left) CLK.left = Math.max(1000, CLK.left + d);
  else { var m = document.getElementById('clk-min'); if (m) m.value = Math.max(1, Math.min(180, (+m.value || 5) + d / 60000)); return; }
  CLK.dur = Math.max(CLK.dur || 0, clkLeft()); clkSave(); clkTick();
};
ACT['clk-reset'] = function () { CLK = { dur: CLK.dur }; CLK_DONE = false; clkSave(); wake(false); var a = document.getElementById('clk-alarm'); if (a) a.hidden = true; clkTick(); };
function clkPanel() {
  var D = clkDates(), last = Math.round((CLK.dur || 300000) / 60000);
  return '<div class="clk-p"><p class="clk-day">' + D.day + '</p><p class="clk-hj">' + esc(D.hj) + '</p><p class="clk-g">' + esc(D.g) + '</p><p class="clk-time" id="clk-ptime">' + clkTime() + '</p></div>' +
    '<section class="set-sec"><h3>المؤقت التنازلي</h3><div class="clk-num" id="clk-num"></div><div class="clk-track"><i id="clk-bar"></i></div>' +
    '<div class="clk-pre">' + [1, 2, 3, 5, 10, 15, 20].map(function (m) { return '<button type="button" data-act="clk-preset" data-m="' + m + '">' + m + ' د</button>'; }).join('') + '</div>' +
    '<div class="clk-row"><button type="button" class="btn ghost sm" data-act="clk-add" data-d="-1" aria-label="أنقص دقيقة">−1</button><label class="clk-m"><input type="number" id="clk-min" inputmode="numeric" min="1" max="180" value="' + last + '"><span>دقيقة</span></label><button type="button" class="btn ghost sm" data-act="clk-add" data-d="1" aria-label="زد دقيقة">+1</button></div>' +
    '<div class="actions"><button class="btn" data-act="clk-go">ابدأ</button><button class="btn ghost" data-act="clk-reset">إعادة</button><button class="btn ghost tint hue-violet" data-act="clk-big">' + rIcon('present') + 'اعرضه كبيرًا</button></div>' +
    '<p class="small muted">ينبّهك بصوت حين ينتهي (ارفع صوت الجهاز وألغِ الوضع الصامت). ويبقى يعمل وأنت تتنقل بين الدروس والكتاب.</p></section>';
}
ACT['clk-open'] = function () { openModal(sheet('الوقت والمؤقت', clkPanel()), true); clkTick(); };
ACT['clk-big'] = function () { // the timer full screen, for the projector
  closeModal();
  var ov = document.createElement('div'); ov.className = 'clk-full'; ov.id = 'clk-full';
  var D = clkDates();
  ov.innerHTML = '<div class="clk-fh"><span>' + D.day + ' ' + esc(D.hs) + ' · <b id="clk-ptime">' + clkTime() + '</b></span><button type="button" class="btn sm" data-act="clk-big-x">إغلاق</button></div>' +
    '<div class="clk-num" id="clk-num"></div><div class="clk-track"><i id="clk-bar"></i></div>' +
    '<div class="actions"><button class="btn" data-act="clk-go">ابدأ</button><button class="btn ghost" data-act="clk-add" data-d="1">+1 دقيقة</button><button class="btn ghost" data-act="clk-reset">إعادة</button></div>';
  document.body.appendChild(ov); document.documentElement.classList.add('lab-on'); clkTick();
};
ACT['clk-big-x'] = function () { var ov = document.getElementById('clk-full'); if (ov) ov.remove(); document.documentElement.classList.remove('lab-on'); };
if (CLK.end) wake(true);

/* ---------- settings ---------- */
function segBtns(act, cur, items) { return '<div class="seg" role="group">' + items.map(function (x) { return '<button type="button" data-act="' + act + '" data-v="' + x[0] + '" aria-pressed="' + (String(cur) === String(x[0])) + '">' + x[1] + '</button>'; }).join('') + '</div>'; }
function settingsHtml() {
  var m = aiModel(), known = MODELS.some(function (x) { return x[0] === m; });
  return sheet('الإعدادات',
    '<section class="set-sec"><h3>المظهر</h3>' + segBtns('pref-theme', P.theme || 'auto', [['auto', 'تلقائي'], ['light', 'فاتح'], ['dark', 'داكن']]) + '</section>' +
    '<section class="set-sec"><h3>الذكاء الاصطناعي (Claude)</h3><p class="small muted">لتجهيز مساعد الدروس وقراءة الفهرس. ضع مفتاح API من حسابك في منصة Claude للمطورين (<a href="https://platform.claude.com/" target="_blank" rel="noopener">platform.claude.com</a>) برصيد مدفوع مسبقًا. يبقى المفتاح على هذا الجهاز فقط، ويُرسَل مباشرة إلى Anthropic مع صور صفحات الدرس، ولا يدخل في النسخة الاحتياطية.</p>' +
    '<label class="field"><span>مفتاح API</span><input type="password" id="ai-key" autocomplete="off" autocapitalize="off" spellcheck="false" dir="ltr" placeholder="sk-ant-…" value="' + esc(P.ai.key || '') + '"></label>' +
    '<label class="field"><span>النموذج</span><select id="ai-model">' + MODELS.map(function (x) { return '<option value="' + x[0] + '"' + (x[0] === m ? ' selected' : '') + '>' + x[1] + '</option>'; }).join('') + '<option value="custom"' + (known ? '' : ' selected') + '>نموذج آخر…</option></select></label>' +
    (known ? '' : '<label class="field"><span>اسم النموذج</span><input type="text" id="ai-custom" dir="ltr" value="' + esc(m) + '"></label>') +
    '<div class="actions" style="margin-top:0"><button class="btn ghost sm" data-act="ai-test">جرّب المفتاح</button><span class="small muted" id="ai-test-out"></span></div></section>' +
    syncSec() +
    '<section class="set-sec"><h3>فصولي</h3><label class="field"><span>أسماء الفصول التي تدرّسها، تفصل بينها بفاصلة</span><input type="text" id="classes" placeholder="1/1، 1/2، 2/1" value="' + esc(P.classes.join('، ')) + '"></label><p class="small muted">تعلّم في كل درس الفصول التي شرحته لها، وترى تقدم كل فصل في الرئيسية.</p></section>' +
    '<section class="set-sec"><h3>التقويم الدراسي</h3>' + segBtns('pref-region', P.region === 'west' ? 'west' : 'std', [['std', 'باقي مناطق المملكة'], ['west', 'مكة والمدينة وجدة والطائف']]) + '</section>' +
    fontSec() +
    '<section class="set-sec"><h3>النسخ الاحتياطي</h3><p class="small muted">' + (S.backupAt ? 'آخر نسخة: ' + relDay(S.backupAt) + '. ' : '') + 'يحفظ الدروس ومساعدها وكتابتك على الصفحات وسبوراتك وملاحظاتك وتقدم فصولك في ملف واحد، دون ملفات الكتب نفسها (تضيفها مرة أخرى فتعود إليها كتابتها)، ودون مقاطع الفيديو التي أضفتها من جهازك لكبر حجمها؛ روابط يوتيوب تدخل فيها.</p>' +
    '<div class="actions" style="margin-top:0"><button class="btn" data-act="backup-save">احفظ نسخة احتياطية</button><button class="btn ghost" data-act="backup-restore">استعد من ملف</button></div></section>' +
    '<section class="set-sec"><h3>التخزين على الجهاز</h3><p class="small muted" id="storage-info">…</p>' + (STANDALONE ? '' : '<p class="hint">' + INSTALL + '</p>') + '<div class="actions" style="margin-top:0"><button class="btn ghost sm danger" data-act="reset">احذف كل بيانات التطبيق</button></div></section>' +
    '<section class="set-sec"><h3>عن التطبيق</h3><p class="small muted">كتابي، الإصدار ' + esc(VERSION) + '. لا خادم ولا حساب: الكتب وكل ما تكتبه على هذا الجهاز وحده.</p><div class="actions"><button class="btn ghost" data-act="app-update">تحديث التطبيق الآن</button></div></section>');
}
ACT.settings = function () {
  openModal(settingsHtml(), true);
  if (navigator.storage && navigator.storage.estimate) Promise.all([navigator.storage.estimate()['catch'](function () { return null; }), navigator.storage.persisted ? navigator.storage.persisted()['catch'](function () { return null; }) : null]).then(function (r) {
    var el = document.getElementById('storage-info'); if (!el) return; var t = [];
    if (r[0] && r[0].usage != null) t.push('المساحة المستخدمة نحو ' + Math.max(0.1, r[0].usage / 1048576).toFixed(1) + ' م.ب.');
    if (r[1] === true) t.push('التخزين محمي من الحذف التلقائي.'); else if (r[1] === false) t.push('لم يُمنح التطبيق حماية التخزين بعد، فاحرص على النسخ الاحتياطي. <button class="link" data-act="persist">اطلب الحماية</button>');
    el.innerHTML = t.join(' ') || 'لا تتوفر معلومات التخزين.';
  }); else { var el = document.getElementById('storage-info'); if (el) el.textContent = 'لا تتوفر معلومات التخزين.'; }
};
function refreshSettings() { var m = document.getElementById('modal'); if (!m.hidden && m.querySelector('#ai-key')) { var y = m.querySelector('.sheet').scrollTop; ACT.settings(); m.querySelector('.sheet').scrollTop = y; } }
ACT['pref-theme'] = function (el) { var v = el.getAttribute('data-v'); P.theme = v; savePref(); if (v === 'light' || v === 'dark') docEl.setAttribute('data-theme', v); else docEl.removeAttribute('data-theme'); refreshSettings(); };
ACT['pref-region'] = function (el) { P.region = el.getAttribute('data-v'); savePref(); Object.keys(S.plan).forEach(function (k) { var T0 = S.plan[k].terms || {}; Object.keys(T0).forEach(function (x) { delete T0[x].start; delete T0[x].end; }); delete S.plan[k].start; delete S.plan[k].end; }); saveState(); refreshSettings(); render(true); };
ACT.persist = function () { if (navigator.storage && navigator.storage.persist) navigator.storage.persist().then(function (ok) { toast(ok ? 'صار التخزين محميًا' : 'لم يوافق المتصفح الآن؛ ثبّت التطبيق على الشاشة الرئيسية ثم أعد المحاولة'); refreshSettings(); }); };
document.addEventListener('change', function (e) {
  var t = e.target;
  if (t.id === 'ai-key') { P.ai.key = t.value.trim(); savePref(); toast(P.ai.key ? 'حُفظ المفتاح على هذا الجهاز' : 'حُذف المفتاح'); }
  else if (t.id === 'ai-model') { if (t.value !== 'custom') { P.ai.model = t.value; savePref(); } else { P.ai.model = 'claude-'; savePref(); } refreshSettings(); }
  else if (t.id === 'ai-custom') { P.ai.model = t.value.trim() || MODELS[0][0]; savePref(); }
  else if (t.id === 'classes') { P.classes = t.value.split(/[،,؛;\n]+/).map(function (x) { return x.trim(); }).filter(Boolean).filter(function (x, i, a) { return a.indexOf(x) === i; }).slice(0, 20); savePref(); render(true); }
});

/* ---------- backup ---------- */
ACT['backup-save'] = function () {
  Promise.all([dbAll('aids'), dbAll('ink'), dbAll('notes')]).then(function (r) {
    var pref = JSON.parse(JSON.stringify(P)); if (pref.ai) delete pref.ai.key; delete pref.sb;
    var o = { kitabiBackup: 1, ver: VERSION, at: Date.now(), books: BOOKS, aids: r[0], ink: r[1], notes: r[2], state: S, pref: pref };
    return saveFile('كتابي-نسخة-' + isoOf(today()) + '.json', JSON.stringify(o));
  }).then(function (how) { if (how === 'cancel') return; S.backupAt = Date.now(); saveState(true); render(true); refreshSettings(); toast(how === 'shared' ? 'حُفظت النسخة الاحتياطية' : 'نُزّل ملف النسخة الاحتياطية'); }, function () { toast('تعذّر حفظ الملف'); });
};
ACT['backup-restore'] = function () {
  var fname = '';
  pick('.json,application/json,text/plain', false).then(function (f) { fname = f[0].name; return f[0].text ? f[0].text() : new Response(f[0]).text(); }).then(function (txt) {
    var o; try { o = JSON.parse(txt); } catch (e) { toast('الملف ليس نسخة احتياطية صالحة'); return; }
    if (!o || o.kitabiBackup !== 1) { if (o && o.kitabiPack === 1) { importPackBytes(new TextEncoder().encode(txt), fname); return; } toast('الملف ليس نسخة احتياطية من كتابي'); return; }
    restore(o);
  });
};
/* the same lesson twice (same title and first page, different ids): keep the one with the aid, the newest if both have one */
function dedupeBook(b) {
  var groups = {}, order = [], removed = 0;
  b.lessons.forEach(function (l) { var key = norm(l.title).replace(/\s+/g, ' ').trim() + '|' + l.from; if (!groups[key]) { groups[key] = []; order.push(key); } groups[key].push(l); });
  if (order.length === b.lessons.length) return 0;
  var keep = [];
  order.forEach(function (key) {
    var g = groups[key]; if (g.length === 1) { keep.push(g[0]); return; }
    var best = g.slice().sort(function (x, y) { var ax = AIDS[lk(b, x)], ay = AIDS[lk(b, y)]; return (ay ? ay.at || 1 : 0) - (ax ? ax.at || 1 : 0); })[0], kk = lk(b, best);
    g.forEach(function (l) {
      if (l === best) return; var k = lk(b, l); removed++;
      if (S.taught[k]) { var t = S.taught[kk] = S.taught[kk] || {}; Object.keys(S.taught[k]).forEach(function (c) { if (!t[c]) t[c] = S.taught[k][c]; }); delete S.taught[k]; }
      if (S.notes[k]) { S.notes[kk] = S.notes[kk] ? S.notes[kk] + '\n' + S.notes[k] : S.notes[k]; delete S.notes[k]; }
      if (AIDS[k]) { delete AIDS[k]; dbDel('aids', k); }
      if (!best.unit && l.unit) best.unit = l.unit; if (!best.chap && l.chap) best.chap = l.chap;
    });
    keep.push(best);
  });
  b.lessons = keep.sort(function (x, y) { return x.from - y.from; });
  saveBook(b); saveState(); return removed;
}
function restore(o) {
  var n = 0, jobs = [], MAP = {};
  /* a key of the backup, moved to the book it now belongs to on this device */
  function rk(k) { k = String(k); Object.keys(MAP).forEach(function (a) { if (k.indexOf(a + ':') === 0 || k === a) k = MAP[a] + k.slice(a.length); else if (/^[bxp]:/.test(k) && k.indexOf(a + ':', 2) === 2) k = k.slice(0, 2) + MAP[a] + k.slice(2 + a.length); }); return k; }
  function rkObj(obj) { var out = {}; Object.keys(obj || {}).forEach(function (k) { out[rk(k)] = obj[k]; }); return out; }
  return dbAll('aids').then(function (curA) {
    var haveA = {}; (curA || []).forEach(function (a) { haveA[a.k] = a.at || 0; });
    arr(o.books).forEach(function (b) {
      if (!b || !b.id || !/^[A-Za-z0-9_-]{1,40}$/.test(b.id) || !Array.isArray(b.lessons)) return;
      b.lessons = b.lessons.filter(function (l) { return l && l.id && l.title && +l.from > 0; }).map(function (l) { return { id: str(l.id), unit: str(l.unit), chap: str(l.chap), title: str(l.title), from: +l.from, to: +l.to || +l.from }; });
      var cur = bookById(b.id);
      if (!cur) { // the same book added here from another copy of the file: same number of pages, and the same name or still without lessons
        var same = BOOKS.filter(function (x) { return !o.books.some(function (y) { return y && y.id === x.id; }) && +x.pages === +b.pages && (norm(x.title) === norm(b.title) || !x.lessons.length); });
        if (same.length === 1) { cur = same[0]; MAP[b.id] = cur.id; }
      }
      if (!cur) { var nb = { id: b.id, title: str(b.title), lessons: b.lessons, offset: +b.offset || 0, pages: +b.pages || 0, added: +b.added || Date.now(), file: str(b.file), size: +b.size || 0, missing: true }; BOOKS.push(nb); jobs.push(saveBook(nb)); n++; return; }
      // both lists are kept, then the same lesson twice is merged into one (dedupeBook, after the aids are in)
      if (!cur.lessons.length) { cur.offset = +b.offset || 0; if (str(b.title)) cur.title = str(b.title); }
      var have = {}; cur.lessons.forEach(function (l) { have[l.id] = 1; }); var add = b.lessons.filter(function (l) { return !have[l.id]; });
      if (add.length) { cur.lessons = cur.lessons.concat(add).sort(function (x, y) { return x.from - y.from; }); jobs.push(saveBook(cur)); n += add.length; }
    });
    if (Object.keys(MAP).length) {
      arr(o.aids).forEach(function (a) { if (a && typeof a.k === 'string') a.k = rk(a.k); });
      arr(o.ink).forEach(function (a) { if (a && typeof a.k === 'string') a.k = rk(a.k); });
      arr(o.notes).forEach(function (a) { if (a && typeof a.k === 'string') { a.k = rk(a.k); if (Array.isArray(a.imgs)) a.imgs.forEach(function (m) { if (m && m.mk) m.mk = 'm:' + rk(String(m.mk).slice(2)); }); } });
      var st0 = o.state || {}; ['taught', 'ans', 'notes', 'plan', 'last'].forEach(function (f) { if (st0[f]) st0[f] = rkObj(st0[f]); }); if (st0.cur && MAP[st0.cur]) st0.cur = MAP[st0.cur];
    }
    arr(o.aids).forEach(function (a) {
      if (!a || typeof a.k !== 'string' || (haveA[a.k] || 0) >= (a.at || 0)) return;
      try { var d = cleanAid(a.d); var rec = { k: a.k, src: a.src === 'ai' ? 'ai' : 'pack', at: +a.at || Date.now(), model: str(a.model), d: d }; AIDS[a.k] = rec; jobs.push(dbPut('aids', rec)); n++; } catch (e) {}
    });
    BOOKS.forEach(function (bk) { dedupeBook(bk); });
    return Promise.all([dbAll('ink'), dbAll('notes')]);
  }).then(function (r) {
    [['ink', r[0], o.ink], ['notes', r[1], o.notes]].forEach(function (x) {
      var have = {}; (x[1] || []).forEach(function (d) { have[d.k] = d.t || 0; });
      arr(x[2]).forEach(function (d) {
        if (!d || typeof d.k !== 'string' || d.k.length > 200 || (have[d.k] || 0) >= (d.t || 0)) return;
        var c = { k: d.k, t: +d.t || Date.now() };
        if (Array.isArray(d.s)) { c.s = d.s.filter(function (s) { return s && Array.isArray(s.p); }); if (x[0] === 'notes') c.h = +d.h || NB_H0; }
        else if (x[0] === 'notes' && Array.isArray(d.hl) && Array.isArray(d.ink)) { c.hl = d.hl.filter(function (h) { return Array.isArray(h) && h.length >= 2 && h.length <= 4; }); c.ink = d.ink.filter(function (s) { return s && Array.isArray(s.p); }); }
        else if (x[0] === 'notes' && Array.isArray(d.imgs)) {
          var okImg = function (s) { return /^data:image\/(jpeg|png|webp);base64,[A-Za-z0-9+\/=]+$/.test(s || ''); };
          c.imgs = d.imgs.filter(function (m) { return m && (m.kind === 'yt' ? /^[A-Za-z0-9_-]{11}$/.test(m.yt || '') : m.kind === 'video' ? typeof m.mk === 'string' && (!m.src || okImg(m.src)) : okImg(m.src)); })
            .map(function (m) { var o = { id: str(m.id).slice(0, 20), src: m.src || '', w: +m.w || 0, h: +m.h || 0, cap: str(m.cap).slice(0, 200), at: +m.at || 0 }; if (m.kind === 'yt') { o.kind = 'yt'; o.yt = m.yt; } if (m.kind === 'video') { o.kind = 'video'; o.mk = str(m.mk).slice(0, 200); o.size = +m.size || 0; } return o; });
        }
        else return;
        if (x[0] === 'notes') XC[c.k] = c;
        jobs.push(dbPut(x[0], c)); n++;
      });
    });
    var st = o.state || {};
    Object.keys(st.taught || {}).forEach(function (k) { var t = S.taught[k] = S.taught[k] || {}; Object.keys(st.taught[k] || {}).forEach(function (c) { if (!t[c]) { t[c] = String(st.taught[k][c]).slice(0, 10); n++; } }); });
    Object.keys(st.ans || {}).forEach(function (k) { var a = st.ans[k]; if (Array.isArray(a) && (!S.ans[k] || (S.ans[k][3] || 0) < (a[3] || 0))) S.ans[k] = a; });
    Object.keys(st.notes || {}).forEach(function (k) { if (!S.notes[k]) S.notes[k] = String(st.notes[k]); });
    Object.keys(st.plan || {}).forEach(function (k) { if (!S.plan[k]) S.plan[k] = st.plan[k]; });
    Object.keys(st.last || {}).forEach(function (k) { if (!S.last[k]) S.last[k] = st.last[k]; });
    if (!S.cur && st.cur) S.cur = st.cur;
    var pf = o.pref || {}; if (!P.classes.length && Array.isArray(pf.classes)) P.classes = pf.classes.map(str).slice(0, 20); if (!P.region && pf.region) P.region = pf.region; savePref();
    saveState(true);
    return Promise.all(jobs);
  }).then(function () { closeModal(); render(); toast('استُعيد ' + n + ' عنصرًا', 3500); }, function () { toast('تعذّرت الاستعادة'); });
}
ACT.reset = function () { confirmBox('حذف كل بيانات التطبيق؟', 'تُحذف من هذا الجهاز الكتب والدروس ومساعدها وكتابتك وتقدم فصولك والإعدادات. لا يمكن التراجع؛ احفظ نسخة احتياطية أولًا.', 'reset-yes', 'احذف الكل', '', true); };
ACT['reset-yes'] = function () {
  closeDocs(); if (DB) { DB.close(); DB = null; }
  try { [STATE_KEY, PREF_KEY, SBQ_KEY, SBS_KEY].forEach(function (k) { localStorage.removeItem(k); }); } catch (e) {}
  var r = indexedDB.deleteDatabase(DBN); r.onsuccess = r.onerror = r.onblocked = function () { location.reload(); };
};
ACT['app-update'] = function () { // ask for the new version, wait until it is installed, then reload (the old copy stays until then, so the app always opens)
  var bs = document.querySelectorAll('[data-act="app-update"]');
  if (navigator.onLine === false) { toast('التحديث يحتاج اتصالًا بالإنترنت'); return; }
  Array.prototype.forEach.call(bs, function (b) { b.disabled = true; b.classList.add('spin'); });
  toast('جارٍ تنزيل التحديث…', 20000);
  function go() { flushInk(); saveState(true); try { sessionStorage.setItem('kitabi-resume', JSON.stringify({ r: route, y: window.scrollY, t: Date.now() })); } catch (e) {} location.reload(); }
  fetch('./index.html', { cache: 'no-store' }).then(function (r) {
    if (!r.ok) throw new Error('http');
    if (!('serviceWorker' in navigator)) return go();
    return navigator.serviceWorker.getRegistration().then(function (g) {
      if (!g) return go();
      return g.update().then(function () {
        var w = g.installing || g.waiting; if (!w) return go();
        return new Promise(function (res) {
          var t = setTimeout(res, 25000);
          function chk() { if (w.state === 'activated' || w.state === 'redundant') { clearTimeout(t); res(); } }
          w.addEventListener('statechange', chk); chk();
        }).then(go);
      });
    });
  })['catch'](function () { Array.prototype.forEach.call(bs, function (b) { b.disabled = false; b.classList.remove('spin'); }); toast('تعذّر الوصول إلى الخادم؛ جرّب بعد قليل'); });
};


/* ---------- events ---------- */
ACT.go = function (el) { var to = el.getAttribute('data-to'); if (to === 'lessons' && route.v !== 'lesson' && route.v !== 'lessons' && LAST_LESSON && lessonByKey(LAST_LESSON.k)) { backToLesson(); return; } if (to === 'quiz' && route.v === 'quiz' && QS) QS = null; if (to === 'read' && route.v === 'read') { if (RD) scrollToPage(RD.cur); return; } if (to === 'plan') { go('plan', { jump: true }); return; } go(to); };
ACT.lesson = function (el) { closeModal(); var k = el.getAttribute('data-k'), x = lessonByKey(k); if (x) S.cur = x.b.id; go('lesson', { k: k, tab: el.getAttribute('data-tab') || 'goals' }); };
ACT['modal-close'] = closeModal;
ACT['go-page'] = function (el) { var x = lessonByKey(route.k || ''); if (x) S.cur = x.b.id; go('read', { page: +el.getAttribute('data-p'), back: route.k }); };
document.addEventListener('click', function (e) {
  var el = e.target.closest('[data-act]');
  if (!el) { var m = document.getElementById('modal'); if (e.target === m) closeModal(); else if (e.target.id === 'pv' || (e.target.closest && e.target.closest('.zoom-in') && !e.target.closest('svg,img'))) { if (document.getElementById('pv').classList.contains('zoom')) ACT['pv-close'](); } return; }
  var a = el.getAttribute('data-act'); if (el.disabled || !ACT[a]) return;
  if (el.tagName === 'A') return;
  e.preventDefault();
  try { ACT[a](el, e); } catch (err) { console.error(err); toast('حدث خطأ: ' + (err && err.message)); }
});

/* ---------- boot ---------- */
var UA = navigator.userAgent || '';
var IOS = /iP(hone|ad|od)/.test(UA) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
var STANDALONE = navigator.standalone === true || !!(window.matchMedia && window.matchMedia('(display-mode: standalone)').matches);
var INSTALL = IOS ? '<b>ثبّته على الشاشة الرئيسية:</b> في Safari اضغط زر المشاركة ثم «إضافة إلى الشاشة الرئيسية»، وافتحه من أيقونته وأضف الكتاب من داخله؛ فبيانات التطبيق المثبّت تُحفظ منفصلة عن Safari.' : '<b>لتثبيته كتطبيق:</b> اختر من قائمة المتصفح «تثبيت التطبيق» أو «إضافة إلى الشاشة الرئيسية».';
if ('serviceWorker' in navigator && (location.protocol === 'https:' || location.hostname === 'localhost' || location.hostname === '127.0.0.1')) navigator.serviceWorker.register('sw.js').catch(function () {});
document.getElementById('app').appendChild(document.getElementById('tabs'));
Promise.all([idb().then(function () { return Promise.all([dbAll('books'), dbAll('aids'), tx('files', 'readonly', function (s) { return s.getAllKeys(); }), xcReady(), fontsBoot()]); })]).then(function (r) {
  r = r[0];
  var files = {}; (r[2] || []).forEach(function (k) { files[k] = 1; });
  BOOKS = (r[0] || []).sort(function (a, b) { return (a.added || 0) - (b.added || 0); });
  BOOKS.forEach(function (b) { if (!Array.isArray(b.lessons)) b.lessons = []; if (files[b.id]) delete b.missing; else b.missing = true; });
  (r[1] || []).forEach(function (a) { AIDS[a.k] = a; });
  if (!curBook() && BOOKS[0]) S.cur = BOOKS[0].id; else if (curBook()) S.cur = curBook().id;
  BOOKS.forEach(function (bk) { if (bk.term == null) { bk.term = guessTerm(bk.title); if (bk.term) saveBook(bk); } });
  var tn = termNow(), tb = BOOKS.filter(function (bk) { return bk.term === tn; }), switched = false;
  if (S.autoTerm !== tn && tb.length) { if (tb.length === 1 && S.cur !== tb[0].id) { S.cur = tb[0].id; switched = tb[0].title; } S.autoTerm = tn; saveState(); }
  if (switched) setTimeout(function () { toast('بدأ ' + termName(tn) + ': فُتح «' + switched + '»', 4000); }, 700);
  var dd = 0; BOOKS.forEach(function (bk) { dd += dedupeBook(bk); }); if (dd) setTimeout(function () { toast('أُزيلت الدروس المكررة (' + dd + ')', 4000); }, 600);
  document.getElementById('tabs').hidden = !BOOKS.length;
  var h = (location.hash || '').slice(1), rs = null;
  try { rs = JSON.parse(sessionStorage.getItem('kitabi-resume') || 'null'); sessionStorage.removeItem('kitabi-resume'); } catch (e) {}
  if (rs && Date.now() - rs.t < 120000 && rs.r && VIEWS[rs.r.v]) { route = rs.r; route.present = false; render(); window.scrollTo(0, rs.y || 0); toast('حُدّث التطبيق'); }
  else { var hm = /^lesson=(.+)$/.exec(h), hk = hm ? decodeURIComponent(hm[1]) : ''; if (hk && lessonByKey(hk)) { route = { v: 'lesson', k: hk, tab: 'goals' }; S.cur = lessonByKey(hk).b.id; } else if (VIEWS[h] && h !== 'lesson') route = { v: h }; render(); }
  if (sbOn()) setTimeout(function () { sbSync(); }, 1500);
  var obs = new MutationObserver(function () { document.getElementById('tabs').hidden = !BOOKS.length; }); obs.observe(document.getElementById('main'), { childList: true });
})['catch'](function (e) {
  document.getElementById('main').innerHTML = '<section class="panel welcome"><h1>تعذّر فتح التخزين</h1><p class="muted">' + esc((e && (e.message || e.name)) || String(e)) + '</p><p>إن كنت في وضع التصفح الخاص فافتح التطبيق في نافذة عادية أو من أيقونته على الشاشة الرئيسية.</p></section>';
});
})();
