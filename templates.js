/* Shared site renderer: used by the landing page (live thumbnails) and the builder (preview + export). */
const esc = s => String(s).replace(/[&<>"']/g, m => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m]));

function hexToHsl(hex) {
    let h = hex.replace('#', '');
    if (h.length === 3) h = h.split('').map(x => x + x).join('');
    const r = parseInt(h.slice(0, 2), 16) / 255, g = parseInt(h.slice(2, 4), 16) / 255, b = parseInt(h.slice(4, 6), 16) / 255;
    const mx = Math.max(r, g, b), mn = Math.min(r, g, b), l = (mx + mn) / 2;
    let hh = 0, s = 0;
    if (mx !== mn) {
        const d = mx - mn;
        s = l > .5 ? d / (2 - mx - mn) : d / (mx + mn);
        hh = mx === r ? (g - b) / d + (g < b ? 6 : 0) : mx === g ? (b - r) / d + 2 : (r - g) / d + 4;
        hh *= 60;
    }
    return [hh, s * 100, l * 100];
}
const shift = (hex, deg) => { const [h, s, l] = hexToHsl(hex); return `hsl(${Math.round((h + deg) % 360)} ${Math.round(s)}% ${Math.round(l)}%)`; };

const FONTS = {
    'Space Grotesk': 'Space+Grotesk:wght@500;700',
    'Playfair Display': 'Playfair+Display:wght@500;700',
    'DM Serif Display': 'DM+Serif+Display',
    'Poppins': 'Poppins:wght@500;700',
    'Inter': 'Inter:wght@500;700'
};

const TEMPLATES = {
    portfolio: {
        label: 'Portfolio', dark: true, accent: '#8b5cf6', font: 'Space Grotesk',
        title: 'Aarav Mehta', tagline: 'Designer & developer crafting calm, fast, memorable websites.', cta: 'See my work',
        about: 'I help small teams and founders turn rough ideas into polished digital products. I care about clear structure, honest copy and details that feel good to use.',
        email: 'hello@example.com', gridTitle: 'Selected work',
        features: [['Design', 'Interfaces that are simple to use and easy on the eyes.'], ['Development', 'Clean, fast code that works on every device.'], ['Strategy', 'Clear goals before pixels, so projects ship on time.']],
        grid: ['Brand identity', 'Mobile app', 'Web dashboard', 'Packaging', 'Photography', 'Illustration']
    },
    agency: {
        label: 'Agency', dark: false, accent: '#2563eb', font: 'Poppins',
        title: 'Northwind Studio', tagline: 'We design and build websites that turn visitors into customers.', cta: 'Start a project',
        about: 'Northwind is a small, senior team of designers and engineers. We work closely with each client from the first sketch to launch day and beyond.',
        email: 'team@example.com', gridTitle: 'Recent projects',
        features: [['Websites', 'Fast, responsive sites built around your goals.'], ['Branding', 'Logos and visual systems that stay consistent.'], ['Growth', 'SEO and analytics so you can see what works.']],
        grid: ['Fintech launch', 'Clinic booking', 'Travel brand', 'SaaS website', 'Coffee roaster', 'Fitness app']
    },
    cafe: {
        label: 'Cafe', dark: false, accent: '#c2410c', font: 'Playfair Display',
        title: 'Brew & Bloom', tagline: 'Slow coffee, fresh bakes and a corner table waiting for you.', cta: 'View the menu',
        about: 'A neighbourhood cafe serving single-origin coffee and pastries baked every morning. Come for a quick espresso or stay all afternoon with a book.',
        email: 'hello@brewandbloom.example', gridTitle: 'From the kitchen',
        features: [['Fresh coffee', 'Single-origin beans roasted in small batches.'], ['Baked daily', 'Croissants, cakes and breads from our own oven.'], ['Cozy space', 'Free Wi-Fi, good music and plenty of plants.']],
        grid: ['Flat white', 'Butter croissant', 'Cold brew', 'Banana bread', 'Avocado toast', 'Masala chai']
    },
    shop: {
        label: 'Store', dark: false, accent: '#059669', font: 'Inter',
        title: 'Everyday Goods', tagline: 'Thoughtfully made essentials for your home and desk.', cta: 'Shop now',
        about: 'We pick a small number of well-made products and stand behind each one. Free shipping on orders above 999 and easy 7-day returns.',
        email: 'support@everydaygoods.example', gridTitle: 'Featured products',
        features: [['Free shipping', 'On every order above 999.'], ['Easy returns', 'Not happy? Send it back within 7 days.'], ['Secure checkout', 'Pay with UPI, cards or cash on delivery.']],
        grid: [['Ceramic mug', '499'], ['Desk lamp', '1,299'], ['Canvas tote', '699'], ['Notebook set', '349'], ['Plant pot', '599'], ['Wall clock', '899']]
    }
};

function defaultsFor(key) {
    const t = TEMPLATES[key] || TEMPLATES.portfolio;
    return {
        tpl: key in TEMPLATES ? key : 'portfolio', title: t.title, tagline: t.tagline, cta: t.cta, about: t.about, email: t.email,
        accent: t.accent, font: t.font, dark: t.dark,
        sections: { features: true, grid: true, about: true, contact: true }
    };
}

function renderSite(c) {
    const key = c.tpl in TEMPLATES ? c.tpl : 'portfolio';
    const t = TEMPLATES[key];
    const s = c.sections || {};
    const acc = /^#[0-9a-f]{3,6}$/i.test(c.accent) ? c.accent : t.accent;
    const acc2 = shift(acc, 38), acc3 = shift(acc, -30);
    const font = FONTS[c.font] ? c.font : 'Inter';
    const bg = c.dark ? '#0c0c12' : (key === 'cafe' ? '#fbf6ef' : '#ffffff');
    const fg = c.dark ? '#f2f1fa' : '#16141f';
    const card = c.dark ? 'rgba(255,255,255,.06)' : (key === 'cafe' ? '#f3e9db' : '#f4f4f8');
    const line = c.dark ? 'rgba(255,255,255,.12)' : 'rgba(0,0,0,.1)';

    const features = t.features.map(f => `<div class="card"><i></i><h3>${esc(f[0])}</h3><p>${esc(f[1])}</p></div>`).join('');
    const grid = t.grid.map((g, i) => {
        const name = Array.isArray(g) ? g[0] : g;
        const price = Array.isArray(g) ? `<b>&#8377;${esc(g[1])}</b>` : '';
        return `<div class="tile"><div class="art a${i % 6}"></div><p><span>${esc(name)}</span>${price}</p></div>`;
    }).join('');

    const nav = [s.grid ? `<a href="#work">${key === 'shop' ? 'Shop' : key === 'cafe' ? 'Menu' : 'Work'}</a>` : '', s.about ? '<a href="#about">About</a>' : '', s.contact ? '<a href="#contact">Contact</a>' : ''].join('');

    return `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(c.title)}</title><meta name="description" content="${esc(c.tagline)}">
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=${FONTS[font]}&family=Inter:wght@400;500&display=swap" rel="stylesheet">
<style>
*{margin:0;padding:0;box-sizing:border-box}html{scroll-behavior:smooth}
:root{--acc:${acc};--acc2:${acc2};--acc3:${acc3};--bg:${bg};--fg:${fg};--card:${card};--line:${line}}
body{font-family:Inter,system-ui,sans-serif;background:var(--bg);color:var(--fg);line-height:1.6}
h1,h2,h3,.brand{font-family:'${font}',serif;line-height:1.1;letter-spacing:-.01em}
a{color:inherit;text-decoration:none}
.wrap{width:min(1080px,90%);margin-inline:auto}
header{position:sticky;top:0;z-index:5;background:color-mix(in srgb,var(--bg) 85%,transparent);backdrop-filter:blur(12px);border-bottom:1px solid var(--line)}
header .wrap{display:flex;align-items:center;justify-content:space-between;height:64px}
.brand{font-size:1.3rem;font-weight:700}nav{display:flex;gap:1.6rem;font-size:.92rem;opacity:.8}nav a:hover{opacity:1;color:var(--acc)}
.btn{display:inline-block;padding:.85rem 1.7rem;border-radius:999px;background:var(--acc);color:#fff;font-weight:600;font-size:.95rem;transition:.25s}
.btn:hover{transform:translateY(-2px);box-shadow:0 12px 28px -10px var(--acc)}
.hero{position:relative;overflow:hidden;padding:110px 0 100px}
.hero:before{content:"";position:absolute;width:520px;height:520px;border-radius:50%;background:radial-gradient(circle,var(--acc),transparent 65%);opacity:.28;top:-160px;right:-120px;filter:blur(30px)}
.hero .wrap{position:relative;display:grid;gap:3rem;align-items:center}
.hero h1{font-size:clamp(2.4rem,6.5vw,4.6rem);font-weight:700;max-width:14ch}
.hero p{font-size:1.15rem;max-width:46ch;opacity:.75;margin:1.3rem 0 2rem}
.hero-art{display:none;aspect-ratio:1/1;border-radius:28px;background:linear-gradient(145deg,var(--acc),var(--acc2));position:relative;overflow:hidden}
.hero-art:after{content:"";position:absolute;width:60%;height:60%;border-radius:50%;background:rgba(255,255,255,.22);right:-10%;bottom:-10%}
.t-agency .hero{text-align:center}.t-agency .hero h1,.t-agency .hero p{margin-inline:auto}.t-agency .hero h1{max-width:18ch}
.t-cafe .hero .wrap,.t-shop .hero .wrap{grid-template-columns:1.1fr .9fr}.t-cafe .hero-art,.t-shop .hero-art{display:block}
.t-cafe .hero-art{border-radius:240px 240px 24px 24px}
.t-shop .hero{background:var(--card)}
section{padding:80px 0}
.eyebrow{font-size:.78rem;letter-spacing:.18em;text-transform:uppercase;color:var(--acc);font-weight:600;margin-bottom:.7rem}
h2{font-size:clamp(1.8rem,4vw,2.7rem);margin-bottom:2.2rem}
.cards{display:grid;grid-template-columns:repeat(3,1fr);gap:1.2rem}
.card{background:var(--card);border:1px solid var(--line);border-radius:20px;padding:1.7rem}
.card i{display:block;width:42px;height:42px;border-radius:12px;background:linear-gradient(135deg,var(--acc),var(--acc2));margin-bottom:1.1rem}
.card h3{font-size:1.25rem;margin-bottom:.5rem}.card p{opacity:.7;font-size:.95rem}
.grid{display:grid;grid-template-columns:repeat(3,1fr);gap:1.2rem}
.art{aspect-ratio:4/3;border-radius:18px;transition:.4s}.tile:hover .art{transform:scale(1.03)}
.a0{background:linear-gradient(135deg,var(--acc),var(--acc2))}.a1{background:linear-gradient(200deg,var(--acc2),var(--acc3))}
.a2{background:linear-gradient(45deg,var(--acc3),var(--acc))}.a3{background:linear-gradient(160deg,var(--acc),var(--acc3))}
.a4{background:linear-gradient(315deg,var(--acc2),var(--acc))}.a5{background:linear-gradient(90deg,var(--acc3),var(--acc2))}
.tile p{display:flex;justify-content:space-between;padding:.8rem .2rem 0;font-weight:500}.tile b{color:var(--acc)}
.about{display:grid;grid-template-columns:1fr 1fr;gap:3rem;align-items:center}
.about p{font-size:1.12rem;opacity:.8}
.about .pic{aspect-ratio:1/1;border-radius:26px;background:linear-gradient(145deg,var(--acc3),var(--acc))}
.contact{text-align:center;background:var(--card);border-radius:28px;padding:64px 24px}
.contact p{opacity:.75;margin:-1rem auto 1.8rem;max-width:44ch}
footer{padding:36px 0;border-top:1px solid var(--line);font-size:.85rem;opacity:.65;text-align:center}
@media(max-width:760px){nav{display:none}.cards,.grid{grid-template-columns:1fr}.about{grid-template-columns:1fr}.t-cafe .hero .wrap,.t-shop .hero .wrap{grid-template-columns:1fr}.hero-art{max-width:320px}.hero{padding:70px 0}section{padding:56px 0}}
</style></head><body class="t-${key}">
<header><div class="wrap"><a class="brand" href="#top">${esc(c.title)}</a><nav>${nav}</nav><a class="btn" href="#contact" style="padding:.55rem 1.2rem;font-size:.85rem">${esc(c.cta)}</a></div></header>
<div class="hero" id="top"><div class="wrap"><div><h1>${esc(c.title)}</h1><p>${esc(c.tagline)}</p><a class="btn" href="#${s.grid ? 'work' : 'contact'}">${esc(c.cta)}</a></div><div class="hero-art"></div></div></div>
${s.features ? `<section><div class="wrap"><div class="eyebrow">What we offer</div><h2>Why choose us</h2><div class="cards">${features}</div></div></section>` : ''}
${s.grid ? `<section id="work"><div class="wrap"><div class="eyebrow">Gallery</div><h2>${esc(t.gridTitle)}</h2><div class="grid">${grid}</div></div></section>` : ''}
${s.about ? `<section id="about"><div class="wrap about"><div><div class="eyebrow">About</div><h2>Our story</h2><p>${esc(c.about)}</p></div><div class="pic"></div></div></section>` : ''}
${s.contact ? `<section id="contact"><div class="wrap contact"><div class="eyebrow">Contact</div><h2>Let's talk</h2><p>Questions or ideas? Send us a message and we'll reply soon.</p><a class="btn" href="mailto:${esc(c.email)}">${esc(c.email)}</a></div></section>` : ''}
<footer><div class="wrap">&copy; ${new Date().getFullYear()} ${esc(c.title)}. All rights reserved.</div></footer>
</body></html>`;
}

if (typeof module !== 'undefined') module.exports = { renderSite, defaultsFor, TEMPLATES, FONTS };
