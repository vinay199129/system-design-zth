/* =============================================
   System Design Dashboard - Application Logic
   Adapted from DSA Dashboard for system design interview prep
   ============================================= */

// ===== THEME =====
const Theme = {
  init() {
    const saved = localStorage.getItem('sd-theme');
    if (saved === 'light') {
      document.documentElement.setAttribute('data-theme', 'light');
      this._updateBtn('light');
    }
  },
  toggle() {
    const current = document.documentElement.getAttribute('data-theme');
    const next = current === 'light' ? 'dark' : 'light';
    if (next === 'light') {
      document.documentElement.setAttribute('data-theme', 'light');
    } else {
      document.documentElement.removeAttribute('data-theme');
    }
    localStorage.setItem('sd-theme', next);
    this._updateBtn(next);
  },
  _updateBtn(theme) {
    const btn = document.getElementById('theme-btn');
    if (btn) btn.textContent = theme === 'light' ? '\u2600' : '\u263E';
  }
};
Theme.init();

// ===== STATE MANAGEMENT =====
const State = {
  _key: 'sd-v1',
  _data: null,

  load() {
    try { this._data = JSON.parse(localStorage.getItem(this._key) || '{}'); }
    catch { this._data = {}; }
    if (!this._data.ds) this._data.ds = {};       // design status
    if (!this._data.redo) this._data.redo = [];
    if (!this._data.hm) this._data.hm = {};
    if (!this._data.day) this._data.day = 1;
    if (!this._data.pat) this._data.pat = {};
    if (!this._data.wk) this._data.wk = {};
    if (!this._data.streak) this._data.streak = 0;
    if (!this._data.read) this._data.read = {};
    if (!this._data.notes) this._data.notes = {};
    if (!this._data.labNotes) this._data.labNotes = {};
    if (!this._data.profile) this._data.profile = null;
    if (!this._data._collapsed) this._data._collapsed = {};
    return this._data;
  },

  save() { localStorage.setItem(this._key, JSON.stringify(this._data)); },
  get data() { return this._data; }
};

// ===== USER PROFILE =====
const Profile = {
  show() {
    const existing = State.data.profile || {};
    const overlay = document.createElement('div');
    overlay.id = 'profile-overlay';
    overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,.7);z-index:9999;display:flex;align-items:center;justify-content:center;padding:20px;';
    overlay.innerHTML = `
      <div style="background:var(--surface);border:1px solid var(--border);border-radius:12px;padding:28px;max-width:480px;width:100%;max-height:90vh;overflow-y:auto;">
        <h2 style="color:var(--accent);margin:0 0 4px;">Welcome to System Design Zero to Hero</h2>
        <p style="color:var(--text2);font-size:13px;margin-bottom:18px;">Set up your profile to personalize your learning journey. All data stays in your browser (localStorage).</p>
        <div style="margin-bottom:14px;">
          <label style="font-size:12px;color:var(--text2);display:block;margin-bottom:4px;">Your Name</label>
          <input id="prof-name" value="${existing.name||''}" placeholder="e.g., Vinay" style="width:100%;background:var(--surface2);border:1px solid var(--border);color:var(--text);padding:8px 10px;border-radius:6px;font-size:14px;box-sizing:border-box;">
        </div>
        <div style="margin-bottom:14px;">
          <label style="font-size:12px;color:var(--text2);display:block;margin-bottom:4px;">Target Company (optional)</label>
          <input id="prof-target" value="${existing.target||''}" placeholder="e.g., Google, Amazon" style="width:100%;background:var(--surface2);border:1px solid var(--border);color:var(--text);padding:8px 10px;border-radius:6px;font-size:14px;box-sizing:border-box;">
        </div>
        <div style="margin-bottom:14px;">
          <label style="font-size:12px;color:var(--text2);display:block;margin-bottom:4px;">Experience Level</label>
          <select id="prof-level" style="width:100%;background:var(--surface2);border:1px solid var(--border);color:var(--text);padding:8px 10px;border-radius:6px;font-size:14px;">
            <option value="junior" ${existing.level==='junior'?'selected':''}>Junior (new to system design)</option>
            <option value="mid" ${existing.level==='mid'?'selected':''}>Mid-level (2-5 YOE, some exposure)</option>
            <option value="senior" ${existing.level==='senior'?'selected':''}>Senior (5+ YOE, refreshing)</option>
          </select>
        </div>
        <div style="margin-bottom:14px;">
          <label style="font-size:12px;color:var(--text2);display:block;margin-bottom:4px;">Daily Study Hours</label>
          <select id="prof-hours" style="width:100%;background:var(--surface2);border:1px solid var(--border);color:var(--text);padding:8px 10px;border-radius:6px;font-size:14px;">
            <option value="1" ${existing.hours==='1'?'selected':''}>~1-2 hours/day (90-day track)</option>
            <option value="3" ${existing.hours==='3'?'selected':''}>~3-4 hours/day (60-day track)</option>
            <option value="5" ${existing.hours==='5'?'selected':''}>~5+ hours/day (intensive)</option>
          </select>
        </div>
        <div style="margin-bottom:18px;">
          <label style="font-size:12px;color:var(--text2);display:block;margin-bottom:4px;">Start Date</label>
          <input id="prof-start" type="date" value="${existing.startDate||new Date().toISOString().split('T')[0]}" style="width:100%;background:var(--surface2);border:1px solid var(--border);color:var(--text);padding:8px 10px;border-radius:6px;font-size:14px;box-sizing:border-box;">
        </div>
        <div style="background:var(--surface2);border-radius:8px;padding:14px;margin-bottom:18px;font-size:12px;color:var(--text2);line-height:1.7;">
          <strong style="color:var(--text);font-size:13px;">How tracking works:</strong><br>
          &#8226; All progress is saved in your browser's localStorage<br>
          &#8226; Design status syncs across Study, Designs, and Design Lab tabs<br>
          &#8226; The heatmap tracks daily study activity automatically<br>
          &#8226; Redo Queue uses spaced repetition (1, 3, 7, 14 day intervals)<br>
          &#8226; Notes you write on any page are saved and persistent<br>
          &#8226; Nothing is sent to any server -- your data stays on this device
        </div>
        <div style="display:flex;gap:10px;justify-content:flex-end;">
          ${existing.name ? '<button onclick="Profile.close()" class="btn btn-sm">Cancel</button>' : ''}
          <button onclick="Profile.save()" class="btn btn-green btn-sm" style="padding:8px 24px;">Start Learning</button>
        </div>
      </div>`;
    document.body.appendChild(overlay);
  },
  save() {
    State.data.profile = {
      name: document.getElementById('prof-name').value.trim() || 'Learner',
      target: document.getElementById('prof-target').value.trim(),
      level: document.getElementById('prof-level').value,
      hours: document.getElementById('prof-hours').value,
      startDate: document.getElementById('prof-start').value,
    };
    State.save();
    this.close();
    Header.render();
  },
  close() {
    const el = document.getElementById('profile-overlay');
    if (el) el.remove();
  }
};

// ===== MARKDOWN RENDERER =====
const Markdown = {
  esc(s) { return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); },

  render(md) {
    if (!md) return '<p style="color:var(--text2)">No content.</p>';
    let h = md;
    h = h.replace(/^>.*Navigation.*$/gm, '');
    // Mermaid blocks -- protect and render as div
    const mermaidBlocks = [];
    h = h.replace(/```mermaid\n([\s\S]*?)```/g, (_, code) => {
      const idx = mermaidBlocks.length;
      mermaidBlocks.push(`<div class="mermaid">${code.trim()}</div>`);
      return `%%MERMAID_${idx}%%`;
    });
    // Code blocks
    const codeBlocks = [];
    h = h.replace(/```(\w*)\n([\s\S]*?)```/g, (_, lang, code) => {
      const idx = codeBlocks.length;
      codeBlocks.push(`<pre><code>${this.esc(code.trimEnd())}</code></pre>`);
      return `%%CODEBLOCK_${idx}%%`;
    });
    // Inline code
    const inlineCodes = [];
    h = h.replace(/`([^`]+)`/g, (_, code) => {
      const idx = inlineCodes.length;
      inlineCodes.push(`<code>${this.esc(code)}</code>`);
      return `%%INLINE_${idx}%%`;
    });
    // Headers
    h = h.replace(/^#### (.+)$/gm, '<h4>$1</h4>');
    h = h.replace(/^### (.+)$/gm, '<h3>$1</h3>');
    h = h.replace(/^## (.+)$/gm, '<h2>$1</h2>');
    h = h.replace(/^# (.+)$/gm, '<h1>$1</h1>');
    // Blockquotes
    h = h.replace(/^> (.+)$/gm, '%%BQ%%$1');
    // Bold, italic, links
    h = h.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
    h = h.replace(/\*(.+?)\*/g, '<em>$1</em>');
    h = h.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" style="color:var(--accent)">$1</a>');
    // Horizontal rules
    h = h.replace(/^---+$/gm, '<hr>');
    // Tables
    h = h.replace(/^\|(.+)\|$/gm, (match) => {
      const cells = match.split('|').filter(c => c.trim() !== '');
      if (cells.every(c => /^[\s\-:]+$/.test(c))) return '%%TABLESEP%%';
      return '%%TR%%' + cells.map(c => c.trim()).join('%%TD%%');
    });

    const lines = h.split('\n');
    let out = [];
    let inTable = false, inList = false, listType = '', inBq = false;

    for (let i = 0; i < lines.length; i++) {
      let l = lines[i];

      // Mermaid placeholder
      if (l.match(/^%%MERMAID_\d+%%$/)) {
        if (inList) { out.push(listType === 'ul' ? '</ul>' : '</ol>'); inList = false; }
        if (inTable) { out.push('</tbody></table></div>'); inTable = false; }
        if (inBq) { out.push('</blockquote>'); inBq = false; }
        const idx = parseInt(l.match(/\d+/)[0]);
        out.push(mermaidBlocks[idx]);
        continue;
      }

      // Code block placeholder
      if (l.match(/^%%CODEBLOCK_\d+%%$/)) {
        if (inList) { out.push(listType === 'ul' ? '</ul>' : '</ol>'); inList = false; }
        if (inTable) { out.push('</tbody></table></div>'); inTable = false; }
        if (inBq) { out.push('</blockquote>'); inBq = false; }
        const idx = parseInt(l.match(/\d+/)[0]);
        out.push(codeBlocks[idx]);
        continue;
      }

      // Table rows
      if (l.startsWith('%%TR%%')) {
        if (inList) { out.push(listType === 'ul' ? '</ul>' : '</ol>'); inList = false; }
        if (inBq) { out.push('</blockquote>'); inBq = false; }
        const cells = l.replace('%%TR%%', '').split('%%TD%%');
        if (!inTable) {
          out.push('<div style="overflow-x:auto;margin:10px 0;"><table class="tbl"><thead><tr>');
          out.push(cells.map(c => `<th>${c}</th>`).join(''));
          out.push('</tr></thead><tbody>');
          inTable = true;
        } else {
          out.push('<tr>' + cells.map(c => `<td>${c}</td>`).join('') + '</tr>');
        }
        continue;
      }
      if (l === '%%TABLESEP%%') continue;
      if (inTable && !l.startsWith('%%TR%%') && l !== '%%TABLESEP%%') {
        out.push('</tbody></table></div>');
        inTable = false;
      }

      // Blockquotes
      if (l.startsWith('%%BQ%%')) {
        if (inList) { out.push(listType === 'ul' ? '</ul>' : '</ol>'); inList = false; }
        if (!inBq) { out.push('<blockquote>'); inBq = true; }
        out.push('<p>' + l.replace('%%BQ%%', '') + '</p>');
        continue;
      }
      if (inBq && !l.startsWith('%%BQ%%')) {
        out.push('</blockquote>');
        inBq = false;
      }

      // List items
      const ulMatch = l.match(/^- (.+)$/);
      const olMatch = l.match(/^\d+\. (.+)$/);
      if (ulMatch) {
        if (inTable) { out.push('</tbody></table></div>'); inTable = false; }
        if (!inList || listType !== 'ul') {
          if (inList) out.push(listType === 'ul' ? '</ul>' : '</ol>');
          out.push('<ul>'); inList = true; listType = 'ul';
        }
        out.push('<li>' + ulMatch[1] + '</li>');
        continue;
      }
      if (olMatch) {
        if (inTable) { out.push('</tbody></table></div>'); inTable = false; }
        if (!inList || listType !== 'ol') {
          if (inList) out.push(listType === 'ul' ? '</ul>' : '</ol>');
          out.push('<ol>'); inList = true; listType = 'ol';
        }
        out.push('<li>' + olMatch[1] + '</li>');
        continue;
      }
      if (inList) { out.push(listType === 'ul' ? '</ul>' : '</ol>'); inList = false; }

      if (l.trim() === '') continue;
      if (l.startsWith('<')) { out.push(l); continue; }
      out.push('<p>' + l + '</p>');
    }

    if (inTable) out.push('</tbody></table></div>');
    if (inList) out.push(listType === 'ul' ? '</ul>' : '</ol>');
    if (inBq) out.push('</blockquote>');

    let result = out.join('\n');
    result = result.replace(/%%INLINE_(\d+)%%/g, (_, idx) => inlineCodes[parseInt(idx)]);
    return result;
  }
};

// ===== STUDY MODULE =====
const Study = {
  sections: null,
  currentId: null,

  PHASE_LABELS: {
    guide: 'Guides',
    p0: 'Phase 0: Framework',
    p1: 'Phase 1: Building Blocks',
    p2: 'Phase 2: Distributed Concepts',
    p3: 'Phase 3: Design Patterns',
    p4: 'Phase 4: Starter Designs',
    p5: 'Phase 5: Advanced Designs',
    p6: 'Phase 6: Mock Interviews',
    templates: 'Answer Template'
  },

  buildSidebar() {
    const sb = document.getElementById('study-sidebar');
    const grouped = {};
    this.sections.forEach(s => {
      if (!grouped[s.phase]) grouped[s.phase] = [];
      grouped[s.phase].push(s);
    });
    let html = '<div style="display:flex;gap:4px;padding:4px 8px;margin-bottom:4px;">';
    html += '<button class="btn btn-sm" style="font-size:10px;padding:2px 8px;" onclick="Study.toggleAll(true)">Collapse All</button>';
    html += '<button class="btn btn-sm" style="font-size:10px;padding:2px 8px;" onclick="Study.toggleAll(false)">Expand All</button>';
    html += '</div>';
    for (const [phase, label] of Object.entries(this.PHASE_LABELS)) {
      if (!grouped[phase]) continue;
      const isCollapsed = State.data._collapsed[phase];
      const arrow = isCollapsed ? '&#9654;' : '&#9660;';
      html += `<div class="snav-group">`;
      html += `<h4 style="cursor:pointer;user-select:none;display:flex;align-items:center;gap:6px;" onclick="Study.toggleGroup('${phase}')"><span style="font-size:8px;">${arrow}</span>${label}</h4>`;
      html += `<div class="snav-children" style="display:${isCollapsed ? 'none' : 'block'};">`;
      grouped[phase].forEach(s => {
        const isRead = State.data.read[s.id];
        html += `<div class="snav-item" data-id="${s.id}" onclick="Study.show('${s.id}')">
          <span>${s.title}</span>
          <span class="check ${isRead ? 'done' : ''}">${isRead ? '&#10003;' : '&#9675;'}</span>
        </div>`;
      });
      html += '</div></div>';
    }
    sb.innerHTML = html;
  },

  toggleGroup(phase) {
    State.data._collapsed[phase] = !State.data._collapsed[phase];
    State.save();
    this.buildSidebar();
  },

  toggleAll(collapse) {
    for (const phase of Object.keys(this.PHASE_LABELS)) {
      State.data._collapsed[phase] = collapse;
    }
    State.save();
    this.buildSidebar();
  },

  show(id) {
    const s = this.sections.find(x => x.id === id);
    if (!s) return;
    this.currentId = id;
    let rendered = Markdown.render(s.content);
    const savedNotes = State.data.notes[id] || '';
    rendered += `
      <div style="margin-top:24px;padding-top:16px;border-top:1px solid var(--border);">
        <h3 style="color:var(--accent);font-size:15px;margin-bottom:8px;">&#9997; My Notes</h3>
        <textarea id="study-notes" placeholder="Write your notes, key insights, trade-offs to remember..."
          style="width:100%;min-height:100px;background:var(--surface2);border:1px solid var(--border);color:var(--text);padding:10px;border-radius:6px;font-size:13px;line-height:1.6;resize:vertical;box-sizing:border-box;font-family:inherit;"
          oninput="Study.saveNotes('${id}')">${Markdown.esc(savedNotes)}</textarea>
        <div style="font-size:11px;color:var(--text2);margin-top:4px;">Auto-saved to localStorage</div>
      </div>`;
    document.getElementById('study-content').innerHTML = rendered;
    document.getElementById('study-title').textContent = s.title;
    const isRead = State.data.read[id];
    document.getElementById('study-actions').innerHTML = `
      <button class="btn ${isRead ? 'btn-sm' : 'btn-green btn-sm'}" onclick="Study.toggleRead('${id}')">
        ${isRead ? '&#10003; Completed' : 'Mark as Read'}
      </button>`;
    document.querySelectorAll('.snav-item').forEach(n =>
      n.classList.toggle('active', n.dataset.id === id));
    document.querySelector('.study-main').scrollTop = 0;
    // Re-render Mermaid diagrams
    if (typeof mermaid !== 'undefined') {
      mermaid.run({ querySelector: '.md .mermaid' }).catch(() => {});
    }
  },

  saveNotes(id) {
    const ta = document.getElementById('study-notes');
    if (ta) { State.data.notes[id] = ta.value; State.save(); }
  },

  toggleRead(id) {
    State.data.read[id] = !State.data.read[id];
    State.save();
    this.buildSidebar();
    this.show(id);
    Header.render();
  },

  countRead() {
    return Object.values(State.data.read).filter(Boolean).length;
  }
};

// ===== HEADER =====
const Header = {
  render() {
    const completed = Object.values(State.data.ds).filter(v => v==='completed'||v==='reviewed').length;
    document.getElementById('stat-completed').textContent = completed;
    document.getElementById('stat-day').textContent = State.data.day;
    document.getElementById('stat-streak').textContent = State.data.streak;
    const nameEl = document.getElementById('user-greeting');
    if (nameEl && State.data.profile) {
      nameEl.textContent = State.data.profile.name ? `Hi, ${State.data.profile.name}!` : '';
    }
  }
};

// ===== ESTIMATION CALCULATOR =====
const EstCalc = {
  update() {
    const dau = parseFloat(document.getElementById('est-dau').value) || 0;
    const actions = parseFloat(document.getElementById('est-actions').value) || 0;
    const bytes = parseFloat(document.getElementById('est-bytes').value) || 0;
    const el = document.getElementById('est-results');
    if (!dau || !actions) { el.innerHTML = ''; return; }
    const total = dau * actions;
    const qps = total / 86400;
    const peak = qps * 3;
    const dailyStorage = total * bytes;
    const monthlyStorage = dailyStorage * 30;
    const yearlyStorage = dailyStorage * 365;
    const fmt = (n) => {
      if (n >= 1e15) return (n/1e15).toFixed(1) + ' PB';
      if (n >= 1e12) return (n/1e12).toFixed(1) + ' TB';
      if (n >= 1e9) return (n/1e9).toFixed(1) + ' GB';
      if (n >= 1e6) return (n/1e6).toFixed(1) + ' MB';
      if (n >= 1e3) return (n/1e3).toFixed(1) + ' KB';
      return n + ' B';
    };
    const fmtN = (n) => {
      if (n >= 1e9) return (n/1e9).toFixed(1) + 'B';
      if (n >= 1e6) return (n/1e6).toFixed(1) + 'M';
      if (n >= 1e3) return (n/1e3).toFixed(1) + 'K';
      return Math.round(n);
    };
    el.innerHTML = `
      <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:8px;margin-top:8px;">
        <div><span style="color:var(--text2);font-size:11px;">Requests/day</span><br><span class="result">${fmtN(total)}</span></div>
        <div><span style="color:var(--text2);font-size:11px;">QPS</span><br><span class="result">${fmtN(qps)}</span></div>
        <div><span style="color:var(--text2);font-size:11px;">Peak QPS (3x)</span><br><span class="result">${fmtN(peak)}</span></div>
        ${bytes ? `
        <div><span style="color:var(--text2);font-size:11px;">Daily Storage</span><br><span class="result">${fmt(dailyStorage)}</span></div>
        <div><span style="color:var(--text2);font-size:11px;">Monthly Storage</span><br><span class="result">${fmt(monthlyStorage)}</span></div>
        <div><span style="color:var(--text2);font-size:11px;">Yearly Storage</span><br><span class="result">${fmt(yearlyStorage)}</span></div>
        ` : ''}
      </div>`;
  }
};

// ===== OVERVIEW =====
const Overview = {
  renderPhases() {
    const el = document.getElementById('phase-cards');
    el.innerHTML = '';
    PHASES.forEach(ph => {
      const designs = DESIGNS.filter(d => d.phase === ph.id);
      const total = designs.length;
      const completed = designs.filter(d => {
        const s = State.data.ds[d.id];
        return s === 'completed' || s === 'reviewed';
      }).length;
      const pct = total > 0 ? Math.round(completed / total * 100) : 0;
      // For non-design phases, count study sections read
      let studyTotal = 0, studyRead = 0;
      if (Study.sections) {
        const phaseSections = Study.sections.filter(s => s.phase === ph.id);
        studyTotal = phaseSections.length;
        studyRead = phaseSections.filter(s => State.data.read[s.id]).length;
      }
      const displayTotal = total > 0 ? total : studyTotal;
      const displayDone = total > 0 ? completed : studyRead;
      const displayPct = displayTotal > 0 ? Math.round(displayDone / displayTotal * 100) : 0;
      el.innerHTML += `<div class="card">
        <h3>${ph.name}<span class="badge" style="background:${ph.color}22;color:${ph.color}">Days ${ph.days}</span></h3>
        <div class="pbar"><div class="pfill" style="width:${displayPct}%;background:${ph.color}"></div></div>
        <div class="plabel"><span>${displayDone}/${displayTotal}</span><span>${displayPct}%</span></div>
      </div>`;
    });
  },

  renderToday() {
    const d = State.data.day;
    let phase, tasks;
    if (d<=3) { phase="Phase 0: Framework & Estimation"; tasks=["Read how-to-think.md & RESHADED framework","Practice 3 estimation problems","Study requirements gathering"]; }
    else if (d<=15) { phase="Phase 1: Building Blocks"; tasks=["Read today's building block README deeply","Take notes on trade-offs","Practice explaining it out loud"]; }
    else if (d<=24) { phase="Phase 2: Distributed Concepts"; tasks=["Read today's distributed concept","Compare with real-world examples","Draw diagrams by hand"]; }
    else if (d<=32) { phase="Phase 3: Design Patterns"; tasks=["Study today's pattern","Apply pattern to a real system","Practice with the answer template"]; }
    else if (d<=44) { phase="Phase 4: Starter Designs"; tasks=["Read problem.md first","Design for 30 min with timer","Compare with solution.md"]; }
    else if (d<=54) { phase="Phase 5: Advanced Designs"; tasks=["Read problem.md (complex system)","Design for 45 min with timer","Study solution.md, note trade-offs"]; }
    else { phase="Phase 6: Mock Interviews"; tasks=["45-min mock interview with timer","Self-assess with rubric","Review weak areas"]; }
    document.getElementById('today-day').textContent = d;
    document.getElementById('today-phase').textContent = phase;
    document.getElementById('today-tasks').innerHTML = tasks.map((t, i) =>
      `<li><input type="checkbox" id="td-${i}" onchange="Overview.markDay()"><label for="td-${i}">${t}</label></li>`).join('');
  },

  markDay() {
    const k = new Date().toISOString().split('T')[0];
    const ch = document.querySelectorAll('#today-tasks input');
    const done = Array.from(ch).filter(c => c.checked).length;
    State.data.hm[k] = done >= ch.length ? 'done' : done > 0 ? 'partial' : 'empty';
    State.save();
    this.renderHeatmap();
  },

  renderHeatmap() {
    const el = document.getElementById('heatmap');
    el.innerHTML = '';
    const now = new Date();
    let legend = '<div style="display:flex;gap:8px;align-items:center;margin-bottom:8px;font-size:11px;color:var(--text2);">';
    legend += '<span>Less</span>';
    legend += '<div class="day-cell empty" style="width:14px;height:14px;font-size:0;"></div>';
    legend += '<div class="day-cell partial" style="width:14px;height:14px;font-size:0;"></div>';
    legend += '<div class="day-cell done" style="width:14px;height:14px;font-size:0;"></div>';
    legend += '<span>More</span></div>';
    el.innerHTML = legend;
    const grid = document.createElement('div');
    grid.className = 'week-grid';
    for (let i = 59; i >= 0; i--) {
      const d = new Date(now); d.setDate(d.getDate() - i);
      const k = d.toISOString().split('T')[0];
      const status = State.data.hm[k] || 'empty';
      grid.innerHTML += `<div class="day-cell ${status} ${i===0?'today':''}" title="${k}: ${status}">${d.getDate()}</div>`;
    }
    el.appendChild(grid);
  }
};

// ===== DESIGNS =====
const Designs = {
  currentPhase: null,

  renderNav() {
    document.getElementById('design-nav').innerHTML =
      '<button class="btn btn-sm btn-accent" data-p="all" onclick="Designs.filter(\'all\')">All</button>' +
      '<button class="btn btn-sm" data-p="p4" onclick="Designs.filter(\'p4\')">Starter</button>' +
      '<button class="btn btn-sm" data-p="p5" onclick="Designs.filter(\'p5\')">Advanced</button>';
  },

  filter(p) {
    this.currentPhase = p === 'all' ? null : p;
    document.querySelectorAll('#design-nav .btn').forEach(b =>
      b.classList.toggle('btn-accent', b.dataset.p === (p || 'all')));
    this.render();
  },

  render() {
    const el = document.getElementById('dtbody');
    const ds = this.currentPhase ? DESIGNS.filter(d => d.phase === this.currentPhase) : DESIGNS;
    let h = '';
    ds.forEach((d, i) => {
      const st = State.data.ds[d.id] || 'not-started';
      const done = st === 'completed' || st === 'reviewed';
      const diffClass = d.diff.toLowerCase().replace('-', '-');
      h += `<tr class="${done?'done':''}">
        <td><select class="sel" onchange="Designs.update('${d.id}',this.value)">
          <option value="not-started" ${st==='not-started'?'selected':''}>-</option>
          <option value="in-progress" ${st==='in-progress'?'selected':''}>In Progress</option>
          <option value="completed" ${st==='completed'?'selected':''}>Completed</option>
          <option value="reviewed" ${st==='reviewed'?'selected':''}>Reviewed</option>
        </select></td>
        <td>${d.num}</td><td>${d.name}</td>
        <td><span class="chip chip-${d.diff.toLowerCase().split('-')[0]}">${d.diff}</span></td>
        <td style="font-size:11px;">${d.concepts}</td>
        <td style="font-size:11px;color:var(--text2);">${d.companies}</td>
        <td style="font-size:11px;color:var(--text2)">${State.data.ds[d.id+'-d']||''}</td>
      </tr>`;
    });
    el.innerHTML = h;
  },

  update(key, val) {
    State.data.ds[key] = val;
    if (val === 'completed' || val === 'reviewed')
      State.data.ds[key + '-d'] = new Date().toLocaleDateString();
    State.save();
    Header.render();
    Overview.renderPhases();
    this.render();
  }
};

// ===== DESIGN LAB =====
const DesignLab = {
  init() {
    const sel = document.getElementById('lab-select');
    DESIGNS.forEach(d => {
      const opt = document.createElement('option');
      opt.value = d.id;
      opt.textContent = `${d.num}. ${d.name} (${d.diff})`;
      sel.appendChild(opt);
    });
  },

  load(id) {
    if (!id) {
      document.getElementById('design-lab-content').style.display = 'none';
      document.getElementById('design-lab-empty').style.display = 'block';
      return;
    }
    document.getElementById('design-lab-content').style.display = 'grid';
    document.getElementById('design-lab-empty').style.display = 'none';
    // Find the design's problem content from study sections
    const problemSection = Study.sections.find(s => s.id === id + '-problem');
    const content = problemSection ? problemSection.content : 'Problem content not found.';
    document.getElementById('lab-problem').innerHTML = Markdown.render(content);
    document.getElementById('lab-notes').value = State.data.labNotes[id] || '';
    // Store current lab ID
    this._currentId = id;
    // Render Mermaid in problem pane
    if (typeof mermaid !== 'undefined') {
      mermaid.run({ querySelector: '#lab-problem .mermaid' }).catch(() => {});
    }
  },

  saveNotes() {
    if (this._currentId) {
      State.data.labNotes[this._currentId] = document.getElementById('lab-notes').value;
      State.save();
    }
  }
};

// ===== PATTERNS =====
const Patterns = {
  CHEAT: [
    {s:'"High read traffic"',p:'Cache (Redis) + CDN + Read Replicas'},
    {s:'"High write traffic"',p:'Message Queue + Sharding + Write-behind'},
    {s:'"Real-time updates"',p:'WebSocket / SSE / Long Polling'},
    {s:'"Large file upload"',p:'Chunking + Presigned URLs + Blob Store'},
    {s:'"Search functionality"',p:'Elasticsearch / Inverted Index'},
    {s:'"User timeline / feed"',p:'Fan-out (Push/Pull/Hybrid)'},
    {s:'"Unique IDs at scale"',p:'Snowflake / ULID'},
    {s:'"Prevent duplicate processing"',p:'Idempotency Keys'},
    {s:'"Cross-service transactions"',p:'Saga Pattern (Choreography/Orchestration)'},
    {s:'"Handle service failures"',p:'Circuit Breaker + Retry + Bulkhead'},
    {s:'"Geospatial queries"',p:'Geohash / QuadTree / R-tree'},
    {s:'"Rate limiting"',p:'Token Bucket / Sliding Window + Redis'},
    {s:'"Separate read/write paths"',p:'CQRS + Event Sourcing'},
    {s:'"Video/image processing"',p:'Async Pipeline + CDN + Adaptive Bitrate'},
  ],
  LIST: [
    {n:'DNS & Networking', d:'DNS translates domain names to IPs. HTTP/HTTPS for web traffic. WebSocket for real-time bidirectional. TCP for reliability, UDP for speed.'},
    {n:'Load Balancing', d:'Distributes traffic across servers. L4 (transport) vs L7 (application). Algorithms: round-robin, least-connections, consistent hashing.'},
    {n:'Caching', d:'Stores frequently accessed data in memory. Patterns: cache-aside, write-through, write-back. Eviction: LRU, LFU. Watch for stampede.'},
    {n:'SQL Databases', d:'Relational, ACID compliant. B-tree indexes. Good for transactions and complex queries. Scale with read replicas, sharding.'},
    {n:'NoSQL Databases', d:'Key-value, document, column-family, graph. Eventual consistency. Good for scale and flexible schema. Choose based on access patterns.'},
    {n:'Message Queues', d:'Kafka for high-throughput streaming. RabbitMQ for task queues. Enables async processing, decoupling, event-driven architecture.'},
    {n:'Blob Storage & CDN', d:'S3-like for large objects. CDN caches at edge for low latency. Media pipeline: upload -> process -> store -> serve via CDN.'},
    {n:'API Design', d:'REST (simple, stateless), GraphQL (flexible queries), gRPC (fast, binary). Use cursor pagination, idempotency keys, versioning.'},
    {n:'Proxies & Gateways', d:'Reverse proxy for load balancing and SSL. API gateway for auth, rate limiting, routing. Service mesh for inter-service communication.'},
    {n:'Scalability', d:'Horizontal (add machines) vs vertical (bigger machine). Stateless services scale easily. Database scaling is the hard part.'},
    {n:'Sharding', d:'Split data across machines. Hash-based (even distribution) vs range-based (range queries). Consistent hashing with virtual nodes.'},
    {n:'Replication', d:'Leader-follower for read scaling. Multi-leader for multi-region writes. Leaderless with quorum for availability.'},
    {n:'Consistency Models', d:'CAP theorem: choose CP or AP during partitions. Strong consistency for transactions. Eventual for high availability.'},
    {n:'Design Patterns', d:'Fan-out, CQRS, Saga, Circuit Breaker, Pub/Sub. Each solves a specific distributed systems challenge.'},
  ],

  renderCheat() {
    document.getElementById('cheat-sheet').innerHTML = this.CHEAT.map(p =>
      `<div class="cheat-item"><span class="signal">${p.s}</span><span class="pattern">-> ${p.p}</span></div>`
    ).join('');
  },

  renderCards() {
    document.getElementById('pattern-cards').innerHTML = this.LIST.map((p, i) => {
      const c = State.data.pat[i] || 0;
      return `<div class="card">
        <h3>${p.n}</h3>
        <p style="font-size:12px;color:var(--text2);margin-bottom:8px;line-height:1.5;">${p.d}</p>
        <div style="display:flex;gap:6px;align-items:center;">
          ${[1,2,3,4,5].map(n =>
            `<span style="cursor:pointer;font-size:18px;color:var(--yellow);opacity:${n<=c?1:.3}" onclick="Patterns.rate(${i},${n})">${n<=c?'&#9733;':'&#9734;'}</span>`
          ).join('')}
          ${c > 0 ? `<span style="cursor:pointer;font-size:12px;color:var(--text2);margin-left:4px;" onclick="Patterns.rate(${i},0)" title="Reset">&#10005;</span>` : ''}
          <span style="font-size:11px;color:var(--text2);margin-left:4px;">${c>=4?'Confident':c>=2?'Learning':c>=1?'Started':'Not rated'}</span>
        </div>
      </div>`;
    }).join('');
  },

  rate(i, r) {
    State.data.pat[i] = r;
    State.save();
    this.renderCards();
  }
};

// ===== TIMER (45-min phased interview timer) =====
const Timer = {
  _fi: null,
  _fs: 5*60, // current phase seconds
  _mode: 'interview',
  _phase: 0,
  _phases: [
    {name: 'Requirements', time: 5*60},
    {name: 'Estimation', time: 5*60},
    {name: 'High-Level Design', time: 10*60},
    {name: 'Detailed Design', time: 15*60},
    {name: 'Evaluation & Wrap-up', time: 10*60},
  ],
  _totalElapsed: 0,

  toggleFocus() {
    const btn = document.getElementById('focus-btn');
    if (this._fi) {
      clearInterval(this._fi); this._fi = null;
      btn.textContent = 'Start'; btn.className = 'btn btn-green';
    } else {
      this._fi = setInterval(() => {
        this._fs--;
        this._totalElapsed++;
        if (this._fs <= 0) {
          if (this._mode === 'interview' && this._phase < this._phases.length - 1) {
            this._phase++;
            this._fs = this._phases[this._phase].time;
            this._updatePhaseIndicators();
          } else {
            clearInterval(this._fi); this._fi = null;
            btn.textContent = 'Start'; btn.className = 'btn btn-green';
            alert('Time is up!');
            this._fs = 0;
          }
        }
        this._updateDisplay();
      }, 1000);
      btn.textContent = 'Pause'; btn.className = 'btn btn-red';
    }
  },

  resetFocus() {
    clearInterval(this._fi); this._fi = null;
    this._phase = 0;
    this._totalElapsed = 0;
    if (this._mode === 'interview') {
      this._fs = this._phases[0].time;
    }
    this._updateDisplay();
    this._updatePhaseIndicators();
    const btn = document.getElementById('focus-btn');
    btn.textContent = 'Start'; btn.className = 'btn btn-green';
  },

  setMode(mode) {
    clearInterval(this._fi); this._fi = null;
    this._mode = mode;
    this._phase = 0;
    this._totalElapsed = 0;
    if (mode === 'interview') {
      this._fs = this._phases[0].time;
      document.getElementById('timer-phases-card').style.display = 'block';
    } else if (mode === 'quick') {
      this._fs = 25*60;
      document.getElementById('timer-phases-card').style.display = 'none';
    } else {
      this._fs = 60*60;
      document.getElementById('timer-phases-card').style.display = 'none';
    }
    this._updateDisplay();
    this._updatePhaseIndicators();
    const btn = document.getElementById('focus-btn');
    btn.textContent = 'Start'; btn.className = 'btn btn-green';
  },

  _updateDisplay() {
    const m = Math.floor(this._fs / 60);
    const s = this._fs % 60;
    document.getElementById('focus-timer').textContent =
      String(m).padStart(2,'0') + ':' + String(s).padStart(2,'0');
    if (this._mode === 'interview') {
      document.getElementById('timer-phase-label').textContent =
        this._phases[this._phase].name + ' Phase';
    } else {
      document.getElementById('timer-phase-label').textContent =
        this._mode === 'quick' ? 'Quick Practice' : 'Deep Practice';
    }
  },

  _updatePhaseIndicators() {
    for (let i = 0; i < this._phases.length; i++) {
      const el = document.getElementById('tps-' + i);
      if (el) {
        if (i < this._phase) {
          el.textContent = '\u2713';
          el.style.color = 'var(--green)';
        } else if (i === this._phase) {
          el.textContent = '\u25CF';
          el.style.color = 'var(--accent)';
        } else {
          el.textContent = '\u25CB';
          el.style.color = 'var(--text2)';
        }
      }
    }
  }
};

// ===== REDO QUEUE =====
const Redo = {
  INTERVALS: [1, 3, 7, 14, 30],
  BOX_LABELS: ['Box 1', 'Box 2', 'Box 3', 'Box 4', 'Mastered'],

  _today() { return new Date().toISOString().split('T')[0]; },
  _daysDiff(dateStr) {
    const d = new Date(dateStr);
    const now = new Date(this._today());
    return Math.floor((now - d) / 86400000);
  },
  isDue(item) {
    const box = item.box || 0;
    const interval = this.INTERVALS[Math.min(box, this.INTERVALS.length - 1)];
    return this._daysDiff(item.lastReview || item.d) >= interval;
  },

  render() {
    const el = document.getElementById('redo-list');
    const em = document.getElementById('redo-empty');
    const dueEl = document.getElementById('srs-due');
    const dueEm = document.getElementById('srs-due-empty');
    if (!State.data.redo.length) {
      el.innerHTML = ''; em.style.display = 'block';
      dueEl.innerHTML = ''; dueEm.style.display = 'block';
      return;
    }
    em.style.display = 'none';
    const due = State.data.redo.filter(r => this.isDue(r));
    if (due.length) {
      dueEm.style.display = 'none';
      dueEl.innerHTML = due.map(r => {
        const idx = State.data.redo.indexOf(r);
        return `<div class="redo-item" style="border-left:3px solid var(--red);padding-left:10px;margin-bottom:8px;">
          <div><strong>${r.n}</strong><span style="color:var(--text2);font-size:11px;margin-left:8px;">${this.BOX_LABELS[r.box||0]}</span></div>
          <div style="display:flex;gap:4px;">
            <button class="btn btn-green btn-sm" onclick="Redo.review(${idx},true)">Pass</button>
            <button class="btn btn-sm" style="background:var(--red);color:#fff;" onclick="Redo.review(${idx},false)">Fail</button>
          </div>
        </div>`;
      }).join('');
    } else { dueEm.style.display = 'block'; dueEl.innerHTML = ''; }

    el.innerHTML = State.data.redo.map((r, i) => {
      const box = r.box || 0;
      const interval = this.INTERVALS[Math.min(box, this.INTERVALS.length - 1)];
      const daysSince = this._daysDiff(r.lastReview || r.d);
      const dueIn = Math.max(0, interval - daysSince);
      return `<div class="redo-item" style="margin-bottom:6px;">
        <div><strong>${r.n}</strong><span style="color:var(--text2);font-size:11px;margin-left:6px;">${this.BOX_LABELS[box]}</span>
        <span style="color:${dueIn===0?'var(--red)':'var(--text2)'};font-size:11px;margin-left:6px;">${dueIn===0?'DUE NOW':'due in '+dueIn+'d'}</span></div>
        <button class="btn btn-sm" onclick="Redo.remove(${i})">x</button>
      </div>`;
    }).join('');
  },

  add() {
    const inp = document.getElementById('redo-input');
    if (!inp.value.trim()) return;
    State.data.redo.push({ n: inp.value.trim(), d: this._today(), box: 0, lastReview: this._today(), streak: 0 });
    inp.value = '';
    State.save(); this.render();
  },
  review(i, success) {
    const item = State.data.redo[i];
    if (!item) return;
    if (success) { item.box = Math.min((item.box||0)+1, 4); item.streak = (item.streak||0)+1; }
    else { item.box = Math.max(0, (item.box||0) <= 2 ? 0 : (item.box||0)-2); item.streak = 0; }
    item.lastReview = this._today();
    State.save(); this.render();
  },
  remove(i) { State.data.redo.splice(i, 1); State.save(); this.render(); }
};

// ===== WEEKLY REVIEW =====
const Weekly = {
  current: 1,
  render() {
    document.getElementById('cw').textContent = this.current;
    const w = State.data.wk[this.current] || {};
    document.getElementById('wp').value = w.p || 0;
    document.getElementById('wh').value = w.h || 0;
    document.getElementById('wr').value = w.r || 0;
    document.getElementById('ww').value = w.w || '';
    document.getElementById('wnp').value = w.np || '';
  },
  save() {
    State.data.wk[this.current] = {
      p: +document.getElementById('wp').value,
      h: +document.getElementById('wh').value,
      r: +document.getElementById('wr').value,
      w: document.getElementById('ww').value,
      np: document.getElementById('wnp').value
    };
    State.save();
  },
  change(d) {
    this.current = Math.max(1, Math.min(9, this.current + d));
    this.render();
  }
};

// ===== TABS =====
document.querySelectorAll('.tab').forEach(t => t.addEventListener('click', () => {
  document.querySelectorAll('.tab').forEach(x => x.classList.remove('active'));
  document.querySelectorAll('.tab-content').forEach(x => x.classList.remove('active'));
  t.classList.add('active');
  document.getElementById('tab-' + t.dataset.tab).classList.add('active');
}));

// ===== KEYBOARD SHORTCUTS =====
document.addEventListener('keydown', e => {
  if (e.key === 'ArrowRight' && e.ctrlKey) {
    State.data.day = Math.min(90, State.data.day + 1);
    State.save(); Header.render(); Overview.renderToday();
  }
  if (e.key === 'ArrowLeft' && e.ctrlKey) {
    State.data.day = Math.max(1, State.data.day - 1);
    State.save(); Header.render(); Overview.renderToday();
  }
});

// ===== INIT =====
function initDashboard() {
  Study.buildSidebar();
  Header.render();
  Overview.renderPhases();
  Overview.renderToday();
  Overview.renderHeatmap();
  Designs.renderNav();
  Designs.render();
  DesignLab.init();
  Patterns.renderCheat();
  Patterns.renderCards();
  Redo.render();
  Weekly.render();
  Timer.setMode('interview');
  // Show profile on first visit
  if (!State.data.profile) Profile.show();
}
