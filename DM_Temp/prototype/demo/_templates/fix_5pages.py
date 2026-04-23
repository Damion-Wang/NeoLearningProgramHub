#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Apply 6 fixes to 5 demo HTML files (in-place):
  #2 Left nav keep only home + users (grey)
  #3 Real Neo PNG avatars (male/female) swapped in by state.preferences.neoAvatar
  #5 Remove Chat header Neo name row
  #9 Note window draggable via titlebar
  #10 Outside click closes popups
  #11 X close button on note window

Targets:
  02-hall-new.html       state=srxDemoState_newbie
  03-lecture.html        state=srxDemoState_zhanglei
  04-practice.html       state=srxDemoState_zhanglei
  05-report-learner.html state=srxDemoState_zhanglei
  06-inquiry.html        state=srxDemoState_zhanglei
"""
import base64, os, re, sys

HERE = os.path.dirname(os.path.abspath(__file__))
DEMO = os.path.dirname(HERE)
REF  = os.path.normpath(os.path.join(DEMO, '..', 'ref'))

def b64_png(name):
    with open(os.path.join(REF, name), 'rb') as f:
        return base64.b64encode(f.read()).decode('ascii')

MALE_B64   = b64_png('NEO头像.png')
FEMALE_B64 = b64_png('NEO女头像.png')

# ---- Shared patch bundle: single <script> block appended near end of <body> ----
def fix_script(state_key, has_note_ball=True, is_hall_new=False):
    return r'''
<script>
/* ===== NEO AVATAR + UX FIXES (injected) ===== */
(function(){
  var STATE_KEY = '__STATE_KEY__';
  var MALE_URI = 'data:image/png;base64,__MALE_B64__';
  var FEMALE_URI = 'data:image/png;base64,__FEMALE_B64__';
  function readGender(){
    try { var s = JSON.parse(localStorage.getItem(STATE_KEY)||'{}'); return (s.preferences && s.preferences.neoAvatar) || 'male'; }
    catch(e){ return 'male'; }
  }
  function applyAvatars(){
    var uri = readGender() === 'female' ? FEMALE_URI : MALE_URI;
    document.querySelectorAll('img.neo-avatar, img.neo-brand-avatar').forEach(function(img){
      img.src = uri;
      img.style.objectFit = 'cover';
      img.style.background = '#0A0B10';
    });
    // inline <svg> .neo-brand-avatar wrapper: replace with <img>
    document.querySelectorAll('div.neo-brand-avatar, span.neo-brand-avatar').forEach(function(el){
      var w = el.style.width || '160px', h = el.style.height || '160px';
      el.innerHTML = '<img src="' + uri + '" alt="Neo" style="width:'+w+';height:'+h+';object-fit:cover;border-radius:50%;background:#0A0B10" />';
    });
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', applyAvatars);
  } else {
    applyAvatars();
  }
  // Re-apply after any dynamic chat inserts (observer)
  try {
    var obs = new MutationObserver(function(muts){
      for (var i=0;i<muts.length;i++){
        var m = muts[i];
        for (var j=0;j<m.addedNodes.length;j++){
          var n = m.addedNodes[j];
          if (n.nodeType === 1 && (n.querySelector && (n.querySelector('img.neo-avatar') || n.querySelector('img.neo-brand-avatar')))) {
            applyAvatars(); return;
          }
        }
      }
    });
    obs.observe(document.body, {childList:true, subtree:true});
  } catch(e){}
})();

/* #10 Outside click: close popups (bell/user/note, navOverlay) */
(function(){
  document.addEventListener('click', function(e){
    // nav overlay drawer
    var panel = document.getElementById('navOverlayPanel');
    var backdrop = document.getElementById('navOverlayBackdrop');
    if (panel && panel.classList.contains('open')) {
      if (!panel.contains(e.target) && !e.target.closest('[onclick*="openNavOverlay"]')) {
        panel.classList.remove('open');
        if (backdrop) backdrop.classList.remove('open');
      }
    }
    // leftPanel (03-lecture uses id=leftPanel)
    var lp = document.getElementById('leftPanel');
    var lpbk = document.getElementById('leftPanelBackdrop');
    if (lp && lp.classList.contains('open')) {
      if (!lp.contains(e.target) && !e.target.closest('[onclick*="openPanel"]') && !e.target.closest('[onclick*="togglePanel"]')) {
        if (typeof closePanel === 'function') closePanel();
        else { lp.classList.remove('open'); if (lpbk) lpbk.classList.remove('open'); }
      }
    }
    // note window
    var noteWin = document.getElementById('noteWin') || document.getElementById('note');
    var noteBall = document.getElementById('noteBall');
    if (noteWin && !noteWin.classList.contains('hidden')) {
      var tgt = e.target;
      var attr = tgt && tgt.getAttribute ? (tgt.getAttribute('onclick')||'') : '';
      var parentAttr = tgt.closest && tgt.closest('[onclick]');
      parentAttr = parentAttr ? (parentAttr.getAttribute('onclick')||'') : '';
      var fromToggle = /toggleNote|toggle\(.note.\)/.test(attr + '|' + parentAttr);
      if (!noteWin.contains(tgt)
          && (!noteBall || !noteBall.contains(tgt))
          && !fromToggle) {
        noteWin.classList.add('hidden');
      }
    }
  }, true);
})();

/* #9 Note window draggable via titlebar */
(function(){
  var noteWin = document.getElementById('noteWin') || document.getElementById('note');
  if (!noteWin) return;
  var bar = noteWin.querySelector(':scope > div');
  if (!bar) return;
  bar.style.cursor = 'move';
  bar.style.userSelect = 'none';
  var dragging = false, sx=0, sy=0, ox=0, oy=0;
  bar.addEventListener('mousedown', function(e){
    if (e.target.closest('button')) return;
    dragging = true;
    var r = noteWin.getBoundingClientRect();
    sx = e.clientX; sy = e.clientY; ox = r.left; oy = r.top;
    e.preventDefault();
  });
  document.addEventListener('mousemove', function(e){
    if (!dragging) return;
    var nx = Math.max(8, Math.min(ox + (e.clientX - sx), window.innerWidth - noteWin.offsetWidth - 8));
    var ny = Math.max(8, Math.min(oy + (e.clientY - sy), window.innerHeight - noteWin.offsetHeight - 8));
    noteWin.style.left = nx + 'px';
    noteWin.style.top  = ny + 'px';
    noteWin.style.right = 'auto';
    noteWin.style.bottom = 'auto';
  });
  document.addEventListener('mouseup', function(){ dragging = false; });
})();
</script>
'''.replace('__STATE_KEY__', state_key)\
   .replace('__MALE_B64__', MALE_B64)\
   .replace('__FEMALE_B64__', FEMALE_B64)


# Left-nav aside markup: home (active) + users (grey, disabled)
# home is rendered based on whether current page is the hall or not
def left_nav_aside(home_active, home_href='02-hall-mid.html'):
    if home_active:
        home_btn = (
            '<button class="group relative h-10 w-10 rounded-xl flex items-center justify-center bg-gradient-to-br from-cyan-400/20 to-violet-500/20 text-cyan-300 ring-1 ring-cyan-400/20 shadow-glow-cyan">'
            '<i data-lucide="home" class="h-4 w-4"></i>'
            '<span class="pointer-events-none absolute left-full ml-2 whitespace-nowrap rounded-md border hairline backdrop-blur px-2 py-1 text-[11px] text-ink-200 opacity-0 group-hover:opacity-100 transition z-50" style="background:rgba(14,16,22,0.9)">大厅</span>'
            '</button>'
        )
    else:
        home_btn = (
            '<a href="' + home_href + '" class="group relative h-10 w-10 rounded-xl flex items-center justify-center text-ink-400 hover:text-ink-100 hover:bg-white/[0.04] transition" title="返回大厅">'
            '<i data-lucide="home" class="h-4 w-4"></i>'
            '<span class="pointer-events-none absolute left-full ml-2 whitespace-nowrap rounded-md border hairline backdrop-blur px-2 py-1 text-[11px] text-ink-200 opacity-0 group-hover:opacity-100 transition z-50" style="background:rgba(14,16,22,0.9)">返回大厅</span>'
            '</a>'
        )
    users_btn = (
        '<button title="社区（建构中）" class="group relative h-10 w-10 rounded-xl flex items-center justify-center text-ink-600 cursor-not-allowed opacity-60">'
        '<i data-lucide="users" class="h-4 w-4"></i>'
        '<span class="pointer-events-none absolute left-full ml-2 whitespace-nowrap rounded-md border hairline backdrop-blur px-2 py-1 text-[11px] text-ink-200 opacity-0 group-hover:opacity-100 transition z-50" style="background:rgba(14,16,22,0.9)">社区（建构中）</span>'
        '</button>'
    )
    return (
        '\n    <!-- LEFT NAV (fixed 2-item sidebar) -->\n'
        '    <aside class="w-14 shrink-0 border-r hairline backdrop-blur-md flex flex-col items-center py-4" style="background:rgba(10,11,16,0.4)">\n'
        '      <div class="flex flex-col gap-1.5">\n'
        '        ' + home_btn + '\n'
        '        ' + users_btn + '\n'
        '      </div>\n'
        '    </aside>\n'
    )


# ---------- Per-file fixes ----------
def fix_hall_new():
    p = os.path.join(DEMO, '02-hall-new.html')
    s = open(p, encoding='utf-8').read()

    # #2 Left nav: replace compass with users, keep home active
    # Find the existing compass button block
    old = re.search(r'<button class="group relative h-10 w-10 rounded-xl flex items-center justify-center text-ink-600 cursor-not-allowed opacity-40">\s*<i data-lucide="compass"[^<]*</i>\s*<span[^>]*>学习旅程[^<]*</span>\s*</button>', s)
    assert old, 'hall-new: compass button not found'
    users_btn = (
        '<button title="社区（建构中）" class="group relative h-10 w-10 rounded-xl flex items-center justify-center text-ink-600 cursor-not-allowed opacity-60">\n'
        '          <i data-lucide="users" class="h-4 w-4"></i>\n'
        '          <span class="pointer-events-none absolute left-full ml-2 whitespace-nowrap rounded-md border hairline backdrop-blur px-2 py-1 text-[11px] text-ink-200 opacity-0 group-hover:opacity-100 transition z-50" style="background:rgba(14,16,22,0.9)">社区（建构中）</span>\n'
        '        </button>'
    )
    s = s[:old.start()] + users_btn + s[old.end():]

    # #5 Remove Chat header Neo name row: the block before chat scroll area
    # (<div class="px-5 pt-3 pb-3 border-b hairline"> ... <img neo-avatar h-10 w-10> ... Neo ... </div>)
    header_pat = re.compile(
        r'<div class="px-5 pt-3 pb-3 border-b hairline">\s*<div class="flex items-center gap-3">\s*<img[^>]*class="neo-avatar[^"]*h-10 w-10[^"]*"[^>]*/>\s*<div class="flex-1 min-w-0"><span class="text-sm font-medium text-ink-100">Neo</span></div>\s*</div>\s*</div>\s*',
        re.DOTALL,
    )
    m = header_pat.search(s)
    assert m, 'hall-new: chat-header Neo row not found'
    s = s[:m.start()] + s[m.end():]

    # Inject fix script before </body>
    s = s.replace('</body>', fix_script('srxDemoState_newbie', is_hall_new=True) + '</body>')

    open(p, 'w', encoding='utf-8', newline='\n').write(s)
    return p


def fix_lecture():
    p = os.path.join(DEMO, '03-lecture.html')
    s = open(p, encoding='utf-8').read()

    # #2 Inject left nav before the main flex row starts (after </header>)
    # 03-lecture uses <div class="flex-1 min-h-0 flex relative">
    # Insert aside *inside* this div as the first child
    marker = '<div class="flex-1 min-h-0 flex relative">'
    idx = s.find(marker)
    assert idx >= 0, 'lecture: main flex not found'
    s = s[:idx+len(marker)] + left_nav_aside(home_active=False) + s[idx+len(marker):]

    # #5 Replace Chat header Neo row (which also has a pause button)
    # Strip avatar+name but keep the pause button in a minimal right-aligned row
    header_pat = re.compile(
        r'<div class="shrink-0 px-5 pt-3 pb-3 border-b hairline">\s*<div class="flex items-center gap-3">\s*<img[^>]*class="neo-avatar[^"]*h-10 w-10[^"]*"[^>]*/>\s*<div class="flex-1 min-w-0"><span class="text-sm font-medium text-ink-100">Neo</span></div>\s*(<button[^>]*title="暂停"[^<]*<i[^<]*</i>\s*</button>)\s*</div>\s*</div>',
        re.DOTALL,
    )
    m = header_pat.search(s)
    assert m, 'lecture: chat-header Neo row (with pause) not found'
    s = s[:m.start()] + (
        '<div class="shrink-0 px-5 pt-2 pb-2 border-b hairline">\n'
        '        <div class="flex items-center justify-end">\n'
        '          ' + m.group(1) + '\n'
        '        </div>\n'
        '      </div>'
    ) + s[m.end():]

    s = s.replace('</body>', fix_script('srxDemoState_zhanglei') + '</body>')
    open(p, 'w', encoding='utf-8', newline='\n').write(s)
    return p


def fix_practice():
    p = os.path.join(DEMO, '04-practice.html')
    s = open(p, encoding='utf-8').read()

    # #2 Inject left nav at start of main flex row
    marker = '<div class="flex-1 min-h-0 flex overflow-hidden">'
    idx = s.find(marker)
    assert idx >= 0, 'practice: main flex not found'
    s = s[:idx+len(marker)] + left_nav_aside(home_active=False) + s[idx+len(marker):]

    # #5 Remove Chat header Neo name row (3 phase copies)
    header_pat = re.compile(
        r'\s*<div class="shrink-0 px-5 pt-3 pb-3 border-b hairline">\s*<div class="flex items-center gap-3">\s*<img[^>]*class="neo-avatar[^"]*h-10 w-10[^"]*"[^>]*/>\s*<div class="flex-1"><span class="text-sm font-medium text-ink-100">Neo</span></div>\s*</div>\s*</div>',
        re.DOTALL,
    )
    s = header_pat.sub('', s)

    s = s.replace('</body>', fix_script('srxDemoState_zhanglei') + '</body>')
    open(p, 'w', encoding='utf-8', newline='\n').write(s)
    return p


def fix_report():
    p = os.path.join(DEMO, '05-report-learner.html')
    s = open(p, encoding='utf-8').read()

    # #2 Inject left nav at start of main flex
    marker = '<div class="flex-1 min-h-0 flex">'
    idx = s.find(marker)
    assert idx >= 0, 'report: main flex not found'
    s = s[:idx+len(marker)] + left_nav_aside(home_active=False) + s[idx+len(marker):]

    # #5 Remove chat header Neo row
    header_pat = re.compile(
        r'\s*<div class="px-5 pt-3 pb-3 border-b hairline">\s*<div class="flex items-center gap-3">\s*<img class="neo-avatar h-10 w-10 rounded-xl object-cover" alt="Neo" />\s*<div class="flex-1 min-w-0">\s*<span class="text-sm font-medium text-ink-100">Neo</span>\s*</div>\s*</div>\s*</div>',
        re.DOTALL,
    )
    s = header_pat.sub('', s)

    s = s.replace('</body>', fix_script('srxDemoState_zhanglei') + '</body>')
    open(p, 'w', encoding='utf-8', newline='\n').write(s)
    return p


def fix_inquiry():
    p = os.path.join(DEMO, '06-inquiry.html')
    s = open(p, encoding='utf-8').read()

    # #2 Inject left nav
    # Find the main flex container after </header>
    marker_candidates = [
        '<div class="flex-1 min-h-0 flex overflow-hidden">',
        '<div class="flex-1 min-h-0 flex">',
        '<div class="flex-1 min-h-0 flex relative">',
    ]
    idx = -1; marker=None
    for mc in marker_candidates:
        idx = s.find(mc)
        if idx >= 0: marker = mc; break
    assert idx >= 0, 'inquiry: main flex not found'
    s = s[:idx+len(marker)] + left_nav_aside(home_active=False) + s[idx+len(marker):]

    # #5 Remove chat header Neo row
    header_pat = re.compile(
        r'\s*<div class="(?:shrink-0 )?px-5 pt-3 pb-3 border-b hairline">\s*<div class="flex items-center gap-3">\s*<img[^>]*class="neo-avatar[^"]*h-10 w-10[^"]*"[^>]*/>\s*<div class="flex-1[^"]*"><span class="text-sm font-medium text-ink-100">Neo</span></div>\s*</div>\s*</div>',
        re.DOTALL,
    )
    s = header_pat.sub('', s)

    s = s.replace('</body>', fix_script('srxDemoState_zhanglei') + '</body>')
    open(p, 'w', encoding='utf-8', newline='\n').write(s)
    return p


if __name__ == '__main__':
    for fn in [fix_hall_new, fix_lecture, fix_practice, fix_report, fix_inquiry]:
        out = fn()
        sz = os.path.getsize(out)
        print('fixed {}  ({} bytes, {:.1f} KB)'.format(os.path.basename(out), sz, sz/1024.0))
