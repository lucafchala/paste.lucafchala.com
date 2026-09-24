/* Theme + language bootstrap, shared by every page on this site.
   Loaded synchronously in <head> so the theme is applied before first paint.
   Preferences are read from the lf_theme / lf_lang cookies on .lucafchala.com
   (a choice made on any *.lucafchala.com site sticks everywhere), then
   localStorage, then the OS / browser. Page scripts register their strings
   with lfPrefs.wire(T) and get the PT|EN and ◐ buttons wired for free. */
(function () {
    'use strict';
    var d = document.documentElement;

    function cookie(n) { var m = document.cookie.match(new RegExp('(?:^|; )' + n + '=([^;]*)')); return m ? decodeURIComponent(m[1]) : null; }
    function stored(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }
    function save(k, v) {
        try { localStorage.setItem(k, v); } catch (e) { /* private mode */ }
        var dom = /(^|\.)lucafchala\.com$/.test(location.hostname) ? '; Domain=.lucafchala.com' : '';
        document.cookie = 'lf_' + k + '=' + encodeURIComponent(v) + dom + '; Path=/; Max-Age=31536000; SameSite=Lax' + (location.protocol === 'https:' ? '; Secure' : '');
    }

    var theme = cookie('lf_theme') || stored('theme');
    if (theme !== 'light' && theme !== 'dark') theme = window.matchMedia && matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
    var lang = cookie('lf_lang') || stored('lang');
    if (lang !== 'pt' && lang !== 'en') lang = /^pt/i.test(navigator.language || '') ? 'pt' : 'en';
    d.dataset.theme = theme;
    d.dataset.lang = lang;

    function paintThemeColor() {
        var m = document.querySelector('meta[name="theme-color"]');
        if (m) m.content = P.theme === 'light' ? '#f4efe6' : '#0d0c0a';
    }

    var P = window.lfPrefs = {
        theme: theme,
        lang: lang,
        T: { pt: {}, en: {} },
        listeners: [],
        t: function (k) {
            var v = (P.T[P.lang] || {})[k];
            return v != null ? v : P.T.pt[k];
        },
        apply: function () {
            d.lang = P.lang === 'pt' ? 'pt-BR' : 'en';
            [].forEach.call(document.querySelectorAll('[data-i18n]'), function (e) { var v = P.t(e.getAttribute('data-i18n')); if (v != null) e.textContent = v; });
            [].forEach.call(document.querySelectorAll('[data-i18n-html]'), function (e) { var v = P.t(e.getAttribute('data-i18n-html')); if (v != null) e.innerHTML = v; });
            [].forEach.call(document.querySelectorAll('[data-i18n-attr]'), function (e) {
                e.getAttribute('data-i18n-attr').split(';').forEach(function (pair) { var kv = pair.split(':'); var v = P.t(kv[1]); if (v != null) e.setAttribute(kv[0], v); });
            });
            [].forEach.call(document.querySelectorAll('[data-lang-btn]'), function (b) { b.setAttribute('aria-pressed', String(b.getAttribute('data-lang-btn') === P.lang)); });
            paintThemeColor();
        },
        setLang: function (l) {
            P.lang = l === 'en' ? 'en' : 'pt';
            d.dataset.lang = P.lang;
            save('lang', P.lang);
            P.apply();
            P.listeners.forEach(function (f) { f(P.lang); });
        },
        toggleTheme: function () {
            P.theme = d.dataset.theme === 'dark' ? 'light' : 'dark';
            d.dataset.theme = P.theme;
            save('theme', P.theme);
            paintThemeColor();
        },
        onLang: function (f) { P.listeners.push(f); },
        wire: function (T) {
            ['pt', 'en'].forEach(function (l) { var src = (T && T[l]) || {}; for (var k in src) P.T[l][k] = src[k]; });
            P.apply();
            if (P._wired) return;
            P._wired = true;
            document.addEventListener('click', function (e) {
                var b = e.target.closest && e.target.closest('[data-lang-btn], #btn-theme');
                if (!b) return;
                if (b.id === 'btn-theme') P.toggleTheme();
                else P.setLang(b.getAttribute('data-lang-btn'));
            });
        }
    };
    paintThemeColor();
})();
