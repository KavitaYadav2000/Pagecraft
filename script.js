(() => {
    const $ = (s, c = document) => c.querySelector(s);
    const $$ = (s, c = document) => [...c.querySelectorAll(s)];

    /* mobile menu */
    const burger = $('#burger'), links = $('#links');
    const setMenu = open => { links.classList.toggle('open', open); burger.classList.toggle('open', open); burger.setAttribute('aria-expanded', open); };
    burger.addEventListener('click', () => setMenu(!links.classList.contains('open')));
    $$('a', links).forEach(a => a.addEventListener('click', () => setMenu(false)));

    /* scale 1200px-wide iframes to fit their container */
    const fit = () => $$('.browser-view, .thumb').forEach(box => {
        const f = $('iframe', box);
        if (f) f.style.transform = `scale(${box.clientWidth / 1200})`;
    });
    addEventListener('resize', fit);

    /* template gallery (live thumbnails) */
    const grid = $('#tplGrid');
    Object.keys(TEMPLATES).forEach(key => {
        const t = TEMPLATES[key];
        const a = document.createElement('a');
        a.className = 'tpl reveal';
        a.href = 'builder.html?t=' + key;
        a.innerHTML = `<div class="thumb"><iframe title="${t.label} template" tabindex="-1" loading="lazy"></iframe></div>
            <div class="tpl-info"><b>${t.label}</b><span>Use this template →</span></div>`;
        $('iframe', a).srcdoc = renderSite(defaultsFor(key));
        grid.appendChild(a);
    });

    /* hero demo: cycle through templates */
    const frame = $('#heroFrame'), url = $('#heroUrl');
    const keys = Object.keys(TEMPLATES);
    let i = 0;
    const show = () => {
        const k = keys[i % keys.length];
        frame.style.opacity = 0;
        setTimeout(() => {
            frame.srcdoc = renderSite(defaultsFor(k));
            url.textContent = TEMPLATES[k].title.toLowerCase().replace(/[^a-z0-9]+/g, '') + '.com';
            frame.style.opacity = 1;
        }, 300);
        i++;
    };
    show();
    setInterval(show, 4200);
    fit();
    addEventListener('load', fit);

    /* reveal on scroll */
    const io = new IntersectionObserver(es => es.forEach(e => {
        if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
    }), { threshold: .12 });
    $$('.reveal').forEach((el, n) => { el.style.transitionDelay = (n % 3) * 80 + 'ms'; io.observe(el); });

    $('#year').textContent = new Date().getFullYear();
})();
