(() => {
    const $ = (s, c = document) => c.querySelector(s);
    const $$ = (s, c = document) => [...c.querySelectorAll(s)];
    const KEY = 'pagecraft-site';

    /* ---------- state ---------- */
    let state = null;
    const fromUrl = new URLSearchParams(location.search).get('t');
    try {
        if (!fromUrl) state = JSON.parse(localStorage.getItem(KEY) || 'null');
    } catch (e) { state = null; }
    if (!state || !TEMPLATES[state.tpl]) state = defaultsFor(fromUrl || 'portfolio');
    state.sections = Object.assign({ features: true, grid: true, about: true, contact: true }, state.sections);

    const save = () => { try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) { } };

    /* ---------- preview ---------- */
    const frame = $('#preview');
    let timer;
    const render = () => {
        clearTimeout(timer);
        timer = setTimeout(() => { frame.srcdoc = renderSite(state); save(); }, 120);
    };

    /* ---------- controls ---------- */
    const fields = ['title', 'tagline', 'cta', 'about', 'email'];
    const syncUI = () => {
        fields.forEach(f => { $('#' + f).value = state[f]; });
        $('#accent').value = state.accent.length === 7 ? state.accent : '#6d4aff';
        $('#accentHex').textContent = state.accent;
        $('#font').value = state.font;
        $('#dark').checked = !!state.dark;
        $$('[data-sec]').forEach(cb => { cb.checked = !!state.sections[cb.dataset.sec]; });
        $$('#tplPick button').forEach(b => b.classList.toggle('active', b.dataset.k === state.tpl));
    };

    fields.forEach(f => $('#' + f).addEventListener('input', e => { state[f] = e.target.value; render(); }));

    $('#accent').addEventListener('input', e => { state.accent = e.target.value; $('#accentHex').textContent = e.target.value; render(); });
    $('#dark').addEventListener('change', e => { state.dark = e.target.checked; render(); });
    $('#font').addEventListener('change', e => { state.font = e.target.value; render(); });
    $$('[data-sec]').forEach(cb => cb.addEventListener('change', () => { state.sections[cb.dataset.sec] = cb.checked; render(); }));

    Object.keys(FONTS).forEach(f => { const o = document.createElement('option'); o.value = o.textContent = f; $('#font').appendChild(o); });

    ['#8b5cf6', '#2563eb', '#0891b2', '#059669', '#c2410c', '#e11d48', '#db2777', '#ca8a04'].forEach(c => {
        const b = document.createElement('button');
        b.style.background = c; b.title = c; b.setAttribute('aria-label', 'Accent ' + c);
        b.addEventListener('click', () => { state.accent = c; syncUI(); render(); });
        $('#swatches').appendChild(b);
    });

    Object.keys(TEMPLATES).forEach(k => {
        const b = document.createElement('button');
        b.dataset.k = k; b.textContent = TEMPLATES[k].label;
        b.addEventListener('click', () => {
            if (k === state.tpl) return;
            state = defaultsFor(k);
            syncUI(); render();
            toast(TEMPLATES[k].label + ' template loaded');
        });
        $('#tplPick').appendChild(b);
    });

    /* ---------- device toggle ---------- */
    $$('.seg button').forEach(b => b.addEventListener('click', () => {
        $$('.seg button').forEach(x => x.classList.toggle('active', x === b));
        $('#viewport').style.width = b.dataset.w;
    }));

    /* ---------- toast ---------- */
    const t = $('#toast');
    let tt;
    function toast(msg) { t.textContent = msg; t.classList.add('show'); clearTimeout(tt); tt = setTimeout(() => t.classList.remove('show'), 2200); }

    /* ---------- export / reset ---------- */
    $('#export').addEventListener('click', () => {
        const html = renderSite(state);
        const blob = new Blob([html], { type: 'text/html' });
        const a = document.createElement('a');
        const name = (state.title || 'my-website').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'my-website';
        a.href = URL.createObjectURL(blob);
        a.download = name + '.html';
        document.body.appendChild(a); a.click(); a.remove();
        setTimeout(() => URL.revokeObjectURL(a.href), 1000);
        toast('Downloaded ' + name + '.html');
    });

    $('#reset').addEventListener('click', () => {
        state = defaultsFor(state.tpl);
        syncUI(); render();
        toast('Template reset');
    });

    syncUI();
    frame.srcdoc = renderSite(state);
    save();
    if (fromUrl) { try { history.replaceState(null, '', location.pathname); } catch (e) { } }
})();
