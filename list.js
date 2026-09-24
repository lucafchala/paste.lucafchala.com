/* Index page: lists every paste from /pastes.json with a live filter. */
(function () {
    'use strict';
    var P = window.lfPrefs;
    var T = {
        pt: {
            skip: 'Pular para o conteúdo', prefs: 'Preferências', theme: 'Alternar tema', rule: 'PASTES',
            tagline: 'textos, snippets e chaves de lucafchala.com', filter_label: 'Filtrar pastes', filter_ph: 'filtrar…',
            loading: 'carregando…', error: 'Erro ao carregar pastes.', empty: 'Nenhum paste encontrado.', count: 'pastes', of: 'de'
        },
        en: {
            skip: 'Skip to content', prefs: 'Preferences', theme: 'Toggle theme', rule: 'PASTES',
            tagline: 'texts, snippets and keys from lucafchala.com', filter_label: 'Filter pastes', filter_ph: 'filter…',
            loading: 'loading…', error: 'Could not load pastes.', empty: 'No pastes found.', count: 'pastes', of: 'of'
        }
    };

    var all = [];
    var failed = false;
    var list = document.getElementById('paste-list');
    var q = document.getElementById('q');
    var count = document.getElementById('count');

    function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#x27;'); }
    function desc(p) { return P.lang === 'en' ? (p.description_en || p.description || '') : (p.description || p.description_en || ''); }

    function render() {
        if (failed) { list.innerHTML = '<li class="empty">' + esc(P.t('error')) + '</li>'; count.textContent = ''; return; }
        if (!all.length) { list.innerHTML = '<li class="empty">' + esc(P.t('loading')) + '</li>'; return; }
        var v = q.value.trim().toLowerCase();
        var shown = all.filter(function (p) {
            return !v || [p.slug, p.subtitle, p.description, p.description_en].some(function (x) { return String(x || '').toLowerCase().indexOf(v) !== -1; });
        });
        list.innerHTML = shown.length ? shown.map(function (p) {
            var d = desc(p);
            return '<li><a href="/' + encodeURIComponent(p.slug) + '/" class="paste-item"><span class="paste-body"><span class="paste-slug">' + esc(p.slug) + '</span>' +
                (d ? '<span class="paste-desc">' + esc(d) + '</span>' : '') + '</span><span class="paste-arrow" aria-hidden="true">→</span></a></li>';
        }).join('') : '<li class="empty">' + esc(P.t('empty')) + '</li>';
        count.textContent = v ? shown.length + ' ' + P.t('of') + ' ' + all.length : all.length + ' ' + P.t('count');
    }

    P.wire(T);
    P.onLang(render);
    q.addEventListener('input', render);
    document.addEventListener('keydown', function (e) {
        if (e.key === '/' && !/^(INPUT|TEXTAREA|SELECT)$/.test(e.target.tagName)) { e.preventDefault(); q.focus(); }
    });
    render();

    fetch('/pastes.json', { cache: 'no-cache' })
        .then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); })
        .then(function (data) { all = data.pastes || []; failed = !all.length; render(); })
        .catch(function () { failed = true; render(); });

    if ('serviceWorker' in navigator) {
        window.addEventListener('load', function () { navigator.serviceWorker.register('/sw.js').catch(function () {}); });
    }
})();
