/* Portfolio renderer — builds the page body from content.json.
 * Used in two places, so it must produce the same HTML in both:
 *   - admin/ (browser): preview + the index.html it publishes
 *   - Portfolio/.shots/build.js (node): rebuild index.html after a design change
 * Text helpers: **bold**, ==gradient== ; a {en, bn} pair with an empty or equal bn is shown in both languages. */
(function (root) {
  'use strict';

  var CHECK = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12l5 5L20 7"/></svg>';
  var ARROW = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg>';
  var LI = '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M4.98 3.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5zM3 9.75h4v11H3zM9.5 9.75h3.8v1.5h.06c.53-1 1.83-2.06 3.77-2.06 4.03 0 4.77 2.65 4.77 6.1v5.46h-4v-4.84c0-1.15-.02-2.64-1.6-2.64-1.62 0-1.86 1.26-1.86 2.56v4.92h-4z"/></svg>';
  var MAIL = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 7l9 6 9-6"/></svg>';
  var PHONE = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 1.9.7 2.8a2 2 0 0 1-.5 2.1L8 9.9a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.8.7a2 2 0 0 1 1.7 2z"/></svg>';
  var WA = '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2zm0 18.2a8.2 8.2 0 0 1-4.2-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8-.2-.1-.4-.1-.6.1l-.8 1c-.1.2-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.2-.4.2-.4.7-1.3.1-.2 0-.3 0-.4l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-.9 2.2 5.2 5.2 0 0 0 1.1 2.7 11.8 11.8 0 0 0 4.5 4c1.7.7 2.3.8 3.2.6a2.7 2.7 0 0 0 1.8-1.2 2.2 2.2 0 0 0 .1-1.3c0-.1-.2-.2-.4-.3z"/></svg>';
  var INFO = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 8v5M12 16h.01"/></svg>';

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; });
  }
  function rich(s) {
    return esc(s).replace(/\*\*([\s\S]+?)\*\*/g, '<b>$1</b>').replace(/==([\s\S]+?)==/g, '<span class="grad-text">$1</span>');
  }
  function T(o) { return o && typeof o === 'object' ? o : { en: o == null ? '' : String(o), bn: '' }; }
  function same(o) { o = T(o); return !o.bn || o.bn === o.en; }
  // one tag per language, or one shared tag when there is no separate Bangla text
  function pair(o, tag, attrs) {
    o = T(o); tag = tag || 'span'; attrs = attrs ? ' ' + attrs : '';
    if (same(o)) return '<' + tag + attrs + '>' + rich(o.en) + '</' + tag + '>';
    return '<' + tag + ' lang="en"' + attrs + '>' + rich(o.en) + '</' + tag + '><' + tag + ' lang="bn"' + attrs + '>' + rich(o.bn) + '</' + tag + '>';
  }
  function list(items, cls) {
    items = items || [];
    var c = cls ? ' class="' + cls + '"' : '';
    var en = items.map(function (x) { return '<li>' + rich(T(x).en) + '</li>'; }).join('');
    var bn = items.map(function (x) { x = T(x); return '<li>' + rich(x.bn || x.en) + '</li>'; }).join('');
    return '<ul' + c + ' lang="en">' + en + '</ul>\n' + '<ul' + c + ' lang="bn">' + bn + '</ul>';
  }
  function chips(items) {
    return (items || []).map(function (x) { return pair(x, 'span', 'class="chip"'); }).join('');
  }
  function shown(a) { return (a || []).filter(function (x) { return x && !x.hide; }); }
  function ind(s, n) { var p = new Array(n + 1).join(' '); return s.split('\n').map(function (l) { return l ? p + l : l; }).join('\n'); }

  function head(sec, extra) {
    return '<div class="rv">\n' +
      '  <span class="eyebrow">' + pair(sec.eyebrow) + '</span>\n' +
      '  <h2>' + pair(sec.title) + '</h2>\n' +
      (sec.lead && T(sec.lead).en ? '  <p class="lead">' + pair(sec.lead) + '</p>\n' : '') +
      (extra || '') +
      '</div>';
  }

  function render(c) {
    var I = c.icons || {};
    var ic = function (k) { return I[k] || ''; };
    var ct = c.contact || {};
    var out = [];

    /* ---------- hero ---------- */
    var h = c.hero;
    var stats = shown(h.stats).map(function (s) {
      var n = Number(s.n) || 0, txt = n.toLocaleString('en-US') + (s.plus ? '+' : '');
      return '<div class="stat rv"><i>' + ic(s.icon) + '</i><b class="grad-text" data-n="' + n + '"' + (s.plus ? '' : ' data-plain="1"') + '>' + txt + '</b>' + pair(s.label) + '</div>';
    }).join('\n');
    var badges = (h.badges || []).slice(0, 2).map(function (b, i) {
      return '<div class="badge b' + (2 - i) + '"><span class="bi">' + ic(b.icon) + '</span><span><b>' + esc(b.n) + '</b>' + pair(b.label, 'small') + '</span></div>';
    }).join('\n');
    out.push('<!-- ============ HERO ============ -->\n<section class="hero">\n' + ind(
      '<div class="wrap hero-grid">\n  <div>\n' +
      '    <span class="hi rv"><span class="dot"></span>' + pair(h.hi) + '</span>\n' +
      '    <h1 class="rv">' + pair(h.name) + '</h1>\n' +
      '    <p class="role rv">' + pair(h.role) + '</p>\n' +
      '    <p class="sum rv">' + pair(h.sum) + '</p>\n' +
      '    <div class="cta rv">\n' +
      '      <a class="btn pri" href="#projects">' + pair(h.ctaWork) + ARROW + '</a>\n' +
      '      <a class="btn" href="#contact">' + pair(h.ctaContact) + '</a>\n' +
      (ct.linkedin ? '      <a class="btn" href="' + esc(ct.linkedin) + '" target="_blank" rel="noopener" aria-label="LinkedIn">' + LI + 'LinkedIn</a>\n' : '') +
      '    </div>\n  </div>\n' +
      '  <div class="photo-wrap rv">\n' +
      '    <div class="photo"><img src="' + esc(h.photo) + '" alt="' + esc(T(h.alt).en || 'Photo') + '" width="500" height="500"></div>\n' +
      ind(badges, 4) + '\n  </div>\n</div>\n' +
      '<div class="wrap">\n  <div class="stats">\n' + ind(stats, 4) + '\n  </div>\n</div>', 2) + '\n</section>');

    /* ---------- the rest: sections alternate plain / .alt ---------- */
    var secs = [];
    var a = c.about;
    secs.push(['about', 'ABOUT',
      '<div class="wrap about">\n' + ind(head(a), 2) + '\n' +
      '  <div class="rv">\n' +
      ind((a.paras || []).map(function (p) { return pair(p, 'p'); }).join('\n'), 4) + '\n' +
      '    <div class="focus">\n' + ind(shown(a.focus).map(function (f) { return '<div>' + CHECK + pair(f.t || f) + '</div>'; }).join('\n'), 6) + '\n    </div>\n' +
      '  </div>\n</div>\n\n' +
      '<!-- journey: the line fills and the dots light up as the page scrolls -->\n' +
      '<div class="wrap journey">\n' +
      '  <div class="jh rv">\n' +
      '    <span class="eyebrow">' + pair(a.journey.eyebrow) + '</span>\n' +
      '    <h2>' + pair(a.journey.title) + '</h2>\n' +
      '  </div>\n' +
      '  <div class="jr" id="journey">\n    <span class="jr-line"><i id="jrFill"></i></span>\n' +
      ind(shown(a.journey.items).map(function (j) {
        return '<div class="jn rv"><div class="jc"><b class="yr grad-text">' + esc(j.yr) + '</b>' + pair(j.t, 'h3') + pair(j.d, 'p') + '</div></div>';
      }).join('\n'), 4) + '\n  </div>\n</div>']);

    var sk = c.skills;
    secs.push(['skills', 'SKILLS',
      '<div class="wrap">\n' + ind(head(sk), 2) + '\n  <div class="skills">\n' +
      ind(shown(sk.groups).map(function (g) {
        return '<div class="sk rv">\n  <h3><i>' + ic(g.icon) + '</i>' + pair(g.t) + '</h3>\n  <div class="chips">' + chips(g.chips) + '</div>\n</div>';
      }).join('\n'), 4) + '\n  </div>\n</div>']);

    var ex = c.experience;
    secs.push(['experience', 'EXPERIENCE',
      '<div class="wrap">\n' + ind(head(ex), 2) + '\n  <div class="tl">\n' +
      ind(shown(ex.orgs).map(function (o) {
        var nm = pair(o.name, 'b');
        if (o.url) nm = '<a class="co" href="' + esc(o.url) + '" target="_blank" rel="noopener">' + nm + '</a>';
        return '<div class="org rv">\n' +
          '  <div class="org-h"><i class="logo">' + esc(o.logo) + '</i><div>' + nm + pair(o.place) + (T(o.tag).en ? pair(o.tag, 'span', 'class="tag"') : '') + '</div></div>\n' +
          '  <div class="roles">\n' + ind(shown(o.roles).map(function (r) {
            return '<div class="rl' + (r.cur ? ' cur' : '') + '">\n' +
              '  <h3>' + pair(r.t) + (r.cur ? '<span class="now" lang="en">Present</span><span class="now" lang="bn">বর্তমান</span>' : '') + '</h3>\n' +
              '  <div class="when">' + pair(r.when) + '</div>\n' +
              ind(list(r.pts), 2) + '\n</div>';
          }).join('\n'), 4) + '\n  </div>\n</div>';
      }).join('\n\n'), 4) + '\n  </div>\n</div>']);

    var pr = c.projects;
    secs.push(['projects', 'PROJECTS',
      '<div class="wrap">\n' + ind(head(pr, T(pr.note).en ? '  <span class="note">' + INFO + pair(pr.note) + '</span>\n' : ''), 2) + '\n\n' +
      ind(shown(pr.items).map(function (p) {
        var icon = p.iconSvg ? '<span class="ic-svg">' + ic(p.iconSvg) + '</span>' : '<img src="' + esc(p.icon) + '" alt="" width="56" height="56">';
        var shot;
        if (p.tile) {
          var t = p.tile, mid = t.keys
            ? '<div class="kbd">' + String(t.keys).split('+').map(function (k) { return '<kbd>' + esc(k.trim()) + '</kbd>'; }).join('<b>+</b>') + '</div>'
            : '<img src="' + esc(t.img || p.icon) + '" alt="" width="120" height="120">';
          shot = '<div class="browser" style="cursor:default"><div class="bar"><i></i><i></i><i></i></div>\n' +
            '  <div class="icon-tile">' + mid + '\n' +
            ((t.flow || []).length ? '    <div class="flow">' + t.flow.map(function (f) { return pair(f); }).join('') + '</div>\n' : '') +
            '  </div>\n</div>';
        } else {
          var d = p.desk || {}, ph = p.phone;
          shot = '<div class="browser" data-full="' + esc(d.src) + '"><div class="bar"><i></i><i></i><i></i></div><img src="' + esc(d.src) + '" alt="' + esc(d.alt || p.name) + '" loading="lazy" width="' + (d.w || 1600) + '" height="' + (d.h || 1000) + '"></div>' +
            (ph && ph.src ? '\n<div class="phone" data-full="' + esc(ph.src) + '"><img src="' + esc(ph.src) + '" alt="' + esc(ph.alt || p.name + ' on phone') + '" loading="lazy" width="' + (ph.w || 480) + '" height="' + (ph.h || 1039) + '"></div>' : '');
        }
        return '<!-- ' + esc(p.name).replace(/--/g, '-') + ' -->\n<article class="proj">\n' +
          '  <div class="rv">\n' +
          '    <div class="ph">' + icon + '<div>' + pair(p.cat, 'small') + '<h3>' + esc(p.name) + '</h3></div></div>\n' +
          ind(pair(p.desc, 'p').replace('</p><p', '</p>\n<p'), 4) + '\n' +
          ind(list(p.feats, 'feat'), 4) + '\n' +
          '    <div class="chips">' + chips(p.chips) + '</div>\n' +
          '  </div>\n' +
          '  <div class="shot rv">\n' + ind(shot, 4) + '\n  </div>\n</article>';
      }).join('\n\n'), 2) + '\n</div>']);

    var hw = c.how;
    if (hw && !hw.hide) secs.push(['how', 'HOW I BUILD',
      '<div class="wrap">\n' + ind(head(hw), 2) + '\n  <div class="plat">\n' +
      ind(shown(hw.steps).map(function (s, i) {
        return '<div class="pc rv"><i><b>' + (i + 1) + '</b></i>' + pair(s.t, 'h3') + pair(s.d, 'p') + '</div>';
      }).join('\n'), 4) + '\n  </div>\n</div>']);

    var pl = c.platform;
    if (pl && !pl.hide) secs.push(['platform', 'PLATFORM',
      '<div class="wrap">\n' + ind(head(pl), 2) + '\n  <div class="plat">\n' +
      ind(shown(pl.cards).map(function (s) {
        return '<div class="pc rv"><i>' + ic(s.icon) + '</i>' + pair(s.t, 'h3') + pair(s.d, 'p') + '</div>';
      }).join('\n'), 4) + '\n  </div>\n' +
      ((pl.stack || []).length ? '  <div class="stack rv">' + pl.stack.map(function (s) { return '<span>' + esc(s) + '</span>'; }).join('') + '</div>\n' : '') +
      '</div>']);

    var ed = c.education;
    secs.push(['education', 'EDUCATION',
      '<div class="wrap">\n' + ind(head(ed), 2) + '\n  <div class="edu">\n' +
      ind(shown(ed.items).map(function (e) {
        return '<div class="ed rv"><div class="yr">' + pair(e.yr) + '</div>' + pair(e.school, 'h3') + pair(e.deg, 'p') + '</div>';
      }).join('\n'), 4) + '\n  </div>\n</div>']);

    var tel = String(ct.phone || '').replace(/[^\d+]/g, ''), wa = tel.replace(/\D/g, '');
    var cl = [];
    if (ct.email) cl.push('<a class="ci" href="mailto:' + esc(ct.email) + '"><i>' + MAIL + '</i><span><small lang="en">Email</small><small lang="bn">ইমেইল</small><b>' + esc(ct.email).replace('@', '@<wbr>') + '</b></span><button class="cp" type="button" data-copy="' + esc(ct.email) + '"><span lang="en">Copy</span><span lang="bn">কপি</span></button></a>');
    if (tel) cl.push('<a class="ci" href="tel:' + esc(tel) + '"><i>' + PHONE + '</i><span><small lang="en">Phone</small><small lang="bn">ফোন</small><b>' + esc(ct.phone) + '</b></span></a>');
    if (wa && ct.whatsapp !== false) cl.push('<a class="ci" href="https://wa.me/' + wa + '" target="_blank" rel="noopener"><i>' + WA + '</i><span><small>WhatsApp</small><b lang="en">Message me</b><b lang="bn">মেসেজ করুন</b></span></a>');
    if (ct.linkedin) cl.push('<a class="ci" href="' + esc(ct.linkedin) + '" target="_blank" rel="noopener"><i>' + LI + '</i><span><small>LinkedIn</small><b>' + esc(ct.linkedinLabel || 'LinkedIn') + '</b></span></a>');
    secs.push(['contact', 'CONTACT',
      '<div class="wrap">\n  <div class="contact rv">\n' +
      '    <div style="position:relative;z-index:1">\n' +
      '      <h2>' + pair(ct.title) + '</h2>\n' +
      ind(pair(ct.text, 'p').replace('</p><p', '</p>\n<p'), 6) + '\n' +
      '    </div>\n    <div class="cl">\n' + ind(cl.join('\n'), 6) + '\n    </div>\n  </div>\n</div>']);

    secs.forEach(function (s, i) {
      out.push('<!-- ============ ' + s[1] + ' ============ -->\n<section id="' + s[0] + '"' + (i % 2 ? ' class="alt"' : '') + '>\n' + ind(s[2], 2) + '\n</section>');
    });
    return out.join('\n\n');
  }

  // the "say hello" icons at the bottom of the phone menu
  function mfoot(c) {
    var ct = c.contact || {}, tel = String(ct.phone || '').replace(/\D/g, ''), o = [];
    if (ct.email) o.push('<a href="mailto:' + esc(ct.email) + '" aria-label="Email">' + MAIL + '</a>');
    if (tel && ct.whatsapp !== false) o.push('<a href="https://wa.me/' + tel + '" target="_blank" rel="noopener" aria-label="WhatsApp">' + WA + '</a>');
    if (ct.linkedin) o.push('<a href="' + esc(ct.linkedin) + '" target="_blank" rel="noopener" aria-label="LinkedIn">' + LI + '</a>');
    return o.join('\n');
  }

  // template.html holds the page with <!--PF:MAIN--> and <!--PF:MFOOT--> where the content goes
  function build(template, c) {
    if (template.indexOf('<!--PF:MAIN-->') < 0) throw new Error('template is missing <!--PF:MAIN-->');
    return template.replace('<!--PF:MAIN-->', function () { return render(c); })
                   .replace('<!--PF:MFOOT-->', function () { return mfoot(c); });
  }

  var api = { render: render, mfoot: mfoot, build: build, esc: esc, rich: rich };
  if (typeof module !== 'undefined' && module.exports) module.exports = api; else root.PF = api;
})(this);
