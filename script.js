const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
const $ = (id) => document.getElementById(id);
const h = (tag, at = {}, ...filhos) => {
  const e = document.createElement(tag);
  for (const k in at) { if (k === "texto") e.textContent = at[k]; else e.setAttribute(k, at[k]); }
  filhos.flat().forEach((f) => f && e.append(f));
  return e;
};
const linhas = (el, lista) => { el.replaceChildren(); lista.forEach((t, i) => { if (i) el.append(h("br")); el.append(t); }); };
const negrito = (el, txt) => { el.replaceChildren(); txt.split("**").forEach((t, i) => el.append(i % 2 ? h("strong", { texto: t }) : document.createTextNode(t))); };

/* ---------- Menu ---------- */
const menuButton = document.querySelector(".menu-toggle");
const nav = document.querySelector(".nav");
menuButton.addEventListener("click", () => {
  const aberto = nav.classList.toggle("open");
  menuButton.setAttribute("aria-expanded", String(aberto));
  menuButton.textContent = aberto ? "×" : "☰";
});
nav.addEventListener("click", (e) => {
  if (e.target.closest("a")) { nav.classList.remove("open"); menuButton.setAttribute("aria-expanded", "false"); menuButton.textContent = "☰"; }
});
$("year").textContent = new Date().getFullYear();

/* ---------- Céu interativo ---------- */
const cv = $("ceu"), cx = cv.getContext("2d");
let W, H, estrelas = [], tiros = [], mouse = { x: -999, y: -999 };
function medir() {
  const d = devicePixelRatio || 1; W = innerWidth; H = innerHeight;
  cv.width = W * d; cv.height = H * d; cx.setTransform(d, 0, 0, d, 0, 0);
  const n = Math.min(120, Math.floor((W * H) / 13000));
  estrelas = Array.from({ length: n }, () => ({ x: Math.random() * W, y: Math.random() * H, vx: (Math.random() - .5) * .18, vy: (Math.random() - .5) * .18, r: Math.random() * 1.4 + .4, t: Math.random() * 6 }));
  if (reduce) desenhar();
}
function desenhar() {
  cx.clearRect(0, 0, W, H);
  const perto = [];
  for (const s of estrelas) {
    if (!reduce) {
      s.x += s.vx; s.y += s.vy; s.t += .02;
      if (s.x < 0) s.x = W; if (s.x > W) s.x = 0; if (s.y < 0) s.y = H; if (s.y > H) s.y = 0;
    }
    const dx = s.x - mouse.x, dy = s.y - mouse.y, d = Math.hypot(dx, dy);
    if (d < 170) { perto.push(s); if (!reduce && d > 1 && d < 90) { s.x += dx / d * .7; s.y += dy / d * .7; } }
    cx.globalAlpha = .4 + .4 * Math.sin(s.t);
    cx.fillStyle = d < 170 ? "#d3adff" : "#f5efff";
    cx.beginPath(); cx.arc(s.x, s.y, d < 170 ? s.r + .8 : s.r, 0, 6.3); cx.fill();
  }
  cx.lineWidth = 1;
  for (let i = 0; i < perto.length; i++) {
    const a = perto[i];
    cx.globalAlpha = .5; cx.strokeStyle = "rgba(211,173,255,.55)";
    cx.beginPath(); cx.moveTo(a.x, a.y); cx.lineTo(mouse.x, mouse.y); cx.stroke();
    for (let j = i + 1; j < perto.length; j++) {
      const b = perto[j], dd = Math.hypot(a.x - b.x, a.y - b.y);
      if (dd < 130) { cx.globalAlpha = (1 - dd / 130) * .7; cx.strokeStyle = "#a875d8"; cx.beginPath(); cx.moveTo(a.x, a.y); cx.lineTo(b.x, b.y); cx.stroke(); }
    }
  }
  for (let i = tiros.length - 1; i >= 0; i--) {
    const s = tiros[i]; s.x += s.vx; s.y += s.vy; s.life -= .012;
    const g = cx.createLinearGradient(s.x, s.y, s.x - s.vx * 9, s.y - s.vy * 9);
    g.addColorStop(0, "rgba(245,235,255," + Math.max(s.life, 0) + ")"); g.addColorStop(1, "rgba(189,138,255,0)");
    cx.globalAlpha = 1; cx.strokeStyle = g; cx.lineWidth = 2.2;
    cx.beginPath(); cx.moveTo(s.x, s.y); cx.lineTo(s.x - s.vx * 9, s.y - s.vy * 9); cx.stroke();
    if (s.life <= 0) tiros.splice(i, 1);
  }
  cx.globalAlpha = 1;
  if (!reduce) requestAnimationFrame(desenhar);
}
addEventListener("pointermove", (e) => { mouse.x = e.clientX; mouse.y = e.clientY; });
addEventListener("pointerleave", () => { mouse.x = mouse.y = -999; });
addEventListener("resize", medir);
medir(); if (!reduce) desenhar();
$("lua").addEventListener("click", () => {
  if (reduce) return;
  for (let i = 0; i < 5; i++) setTimeout(() => tiros.push({ x: Math.random() * W * .55, y: Math.random() * H * .3, vx: 9 + Math.random() * 4, vy: 4 + Math.random() * 3, life: 1 }), i * 220);
});

/* ---------- Carregar os dados (data.js) ---------- */
if (window.DADOS) montar(window.DADOS);
else {
  const e = $("erro"); e.hidden = false;
  e.textContent = "Não consegui carregar o data.js. Confira se ele está na mesma pasta do index.html e se não há vírgula faltando ou sobrando.";
}

function montar(D) {
  const P = D.perfil, gh = "https://github.com/" + P.usuario_github;
  document.title = P.nome + " | Portfólio";
  $("marca").textContent = $("marcaRodape").textContent = P.marca || "IF";
  $("nome").textContent = P.nome + "."; $("saudacao").textContent = P.saudacao || "Olá, eu sou";
  $("nomeRodape").textContent = P.nome.toUpperCase(); $("etiqueta").textContent = P.etiqueta || "";
  $("cargo").replaceChildren(...P.cargo.flatMap((c, i) => i ? [h("span", { texto: "✳" }), c] : [c]));
  $("descricao").textContent = P.descricao;
  $("meta").replaceChildren(...(P.meta || []).map((m) => h("span", { texto: m })));
  linhas($("arteRotulo"), P.arte_rotulo || []);
  $("btnGithub").href = gh; $("btnLinkedin").href = P.linkedin;
  if (P.email) { $("btnEmail").href = "mailto:" + P.email; $("btnEmail").hidden = false; }
  lema(P.lema || ""); sobre(D.sobre); mapa(D, gh); habilidades(D.habilidades || []);
  formacao(D.formacao || [], D.experiencia); certificados(D.certificados || []);
  revelar();
}

function lema(txt) {
  const el = $("lema"); el.setAttribute("aria-label", txt);
  if (reduce) { el.textContent = txt; return; }
  let i = 0; (function t() { el.textContent = txt.slice(0, ++i); if (i < txt.length) setTimeout(t, 50); })();
}

/* ---------- Sobre ---------- */
function sobre(S) {
  negrito($("destaque"), S.destaque);
  linhas($("marcaTexto"), S.marca_texto || []);
  $("fatos").replaceChildren(...(S.fatos || []).map((f) => h("div", {}, h("strong", { texto: f.valor }), h("span", { texto: f.rotulo }))));
  const botoes = [];
  const abrir = (i) => {
    botoes.forEach((b, k) => b.setAttribute("aria-selected", k === i));
    $("abaTexto").replaceChildren(h("p", { texto: S.abas[i].texto }));
  };
  S.abas.forEach((a, i) => {
    const b = h("button", { type: "button", role: "tab", "aria-selected": "false", texto: a.titulo });
    b.addEventListener("click", () => abrir(i));
    b.addEventListener("keydown", (e) => {
      if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
      const n = (i + (e.key === "ArrowRight" ? 1 : S.abas.length - 1)) % S.abas.length; botoes[n].focus(); abrir(n);
    });
    botoes.push(b); $("abas").append(b);
  });
  if (S.abas.length) abrir(0);
}

/* ---------- Mapa estelar de projetos ---------- */
function mapa(D, gh) {
  const projs = D.projetos || [], svg = $("mapa"), NS = "http://www.w3.org/2000/svg";
  if (!projs.length) { $("projetos").hidden = true; return; }
  projs.forEach((p, i) => { // posição automática se faltar x/y
    if (p.x == null || p.y == null) {
      const a = (Math.PI * 2 * i) / projs.length;
      p.x = Math.round(400 + Math.cos(a) * 280); p.y = Math.round(235 + Math.sin(a) * 160);
    }
  });
  const por = Object.fromEntries(projs.map((p) => [p.id, p]));
  const ligacoes = (D.conexoes || []).filter(([a, b]) => por[a] && por[b]);
  const ligados = new Set(ligacoes.flat());
  projs.forEach((p, i) => { if (i > 0 && !ligados.has(p.id)) ligacoes.push([projs[0].id, p.id]); });

  const mk = (tag, at, pai) => { const e = document.createElementNS(NS, tag); for (const k in at) e.setAttribute(k, at[k]); (pai || svg).appendChild(e); return e; };
  ligacoes.forEach(([a, b]) => mk("line", { x1: por[a].x, y1: por[a].y, x2: por[b].x, y2: por[b].y, class: "aresta", "data-a": a, "data-b": b }));

  function escolher(id) {
    const i = projs.findIndex((p) => p.id === id), p = projs[i];
    const legenda = h("span", { class: "visual-caption" }); linhas(legenda, p.legenda || [p.nome.toUpperCase()]);
    $("painel").replaceChildren(h("article", { class: "project-card" },
        h("div", { class: "project-visual tom-" + (p.tom || "lua") }, h("span", { class: "visual-kicker", texto: p.kicker || "" }), h("span", { class: "project-symbol", texto: p.simbolo || "✦" }), legenda),
        h("div", { class: "project-info" },
            h("div", { class: "project-topline" }, h("span", { texto: String(i + 1).padStart(2, "0") + " / PROJETO" }), h("span", { class: "project-type", texto: p.tipo || "" })),
            h("h3", { texto: p.nome }), h("p", { texto: p.descricao }),
            p.detalhe ? h("p", { class: "nota", texto: p.detalhe }) : null,
            h("div", { class: "tags" }, (p.tecnologias || []).map((t) => h("span", { texto: t }))),
            p.repositorio
                ? h("a", { class: "text-link", href: gh + "/" + p.repositorio, target: "_blank", rel: "noreferrer" }, "Ver repositório ", h("span", { texto: "↗" }))
                : h("span", { class: "text-link muted-link", texto: p.status || "Repositório em preparação" }))));
    document.querySelectorAll(".estrela").forEach((g) => { const on = g.dataset.id === id; g.classList.toggle("sel", on); g.setAttribute("aria-pressed", on); });
  }
  projs.forEach((p) => {
    const r = p.tamanho || 12;
    const g = mk("g", { class: "estrela", tabindex: 0, role: "button", "aria-label": "Projeto " + p.nome, "aria-pressed": "false", "data-id": p.id, transform: "translate(" + p.x + " " + p.y + ")" });
    mk("circle", { r: r + 16, class: "halo" }, g); mk("circle", { r: r + 8, class: "anel" }, g); mk("circle", { r: r / 2.2, class: "nucleo" }, g);
    mk("text", { y: r + 34, "text-anchor": "middle" }, g).textContent = p.nome;
    g.addEventListener("click", () => escolher(p.id));
    g.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); escolher(p.id); } });
  });

  const fBox = $("filtros");
  (D.filtros || [{ id: "todos", nome: "Todos" }]).forEach((f, i) => {
    const b = h("button", { type: "button", "aria-pressed": i === 0, "data-k": f.id, texto: f.nome });
    b.addEventListener("click", () => filtrar(f.id)); fBox.append(b);
  });
  function filtrar(k) {
    fBox.querySelectorAll("button").forEach((b) => b.setAttribute("aria-pressed", b.dataset.k === k));
    const fora = (id) => k !== "todos" && !(por[id].temas || []).includes(k);
    document.querySelectorAll(".estrela").forEach((g) => g.classList.toggle("apagada", fora(g.dataset.id)));
    document.querySelectorAll(".aresta").forEach((l) => l.classList.toggle("apagada", fora(l.dataset.a) || fora(l.dataset.b)));
    const atual = document.querySelector(".estrela.sel"), primeira = projs.find((p) => !fora(p.id));
    if (primeira && (!atual || fora(atual.dataset.id))) escolher(primeira.id);
  }
  escolher(projs[0].id);
}

/* ---------- Habilidades, formação, certificados ---------- */
function habilidades(lista) {
  $("grupos").replaceChildren(...lista.map((g, i) => h("div", { class: "skill-group" },
      h("span", { class: "skill-number", texto: String(i + 1).padStart(2, "0") }),
      h("div", {}, h("h3", { texto: g.grupo }), h("div", { class: "skill-pills" }, g.itens.map((t) => h("span", { texto: t })))))));
}
function formacao(lista, exp) {
  $("linha").replaceChildren(...lista.map((f) => h("article", { class: "timeline-item" },
      h("span", { class: "timeline-date", texto: f.data }),
      h("div", {}, h("h3", { texto: f.titulo }), h("p", { texto: f.instituicao }), f.detalhe ? h("span", { class: "timeline-detail", texto: f.detalhe }) : null))));
  if (exp) $("experiencia").replaceChildren(h("span", { class: "experience-icon", texto: "✧" }), h("div", {}, h("h3", { texto: exp.titulo }), h("p", { texto: exp.texto })));
  else $("experiencia").hidden = true;
}
function certificados(lista) {
  if (!lista.length) return;
  $("certificados").hidden = false; $("navCert").hidden = false;
  const box = $("certs"), fBox = $("filtrosCert");
  const cats = [...new Set(lista.map((c) => c.categoria).filter(Boolean))];
  const TOM = { "Tecnologia": "sistema", "Gestão e inovação": "terra", "Idiomas": "fantasia" };
  box.replaceChildren(...lista.map((c) => {
    const meta = [c.instituicao, c.ano].filter(Boolean).join(" · ");
    return h("article", { class: "cert", "data-cat": c.categoria || "" },
        h("div", { class: "cert-visual tom-" + (c.tom || TOM[c.categoria] || "lua") },
            h("span", { class: "cert-kicker", texto: c.categoria || "Curso" }),
            h("span", { class: "project-symbol cert-symbol", texto: c.simbolo || "✦" }),
            c.carga_horaria ? h("span", { class: "cert-horas", texto: c.carga_horaria }) : null),
        h("div", { class: "cert-corpo" }, h("h3", { texto: c.titulo }), meta ? h("p", { class: "cert-meta", texto: meta }) : null,
            c.link ? h("a", { class: "text-link", href: c.link, target: "_blank", rel: "noreferrer" }, "Ver certificado ", h("span", { texto: "↗" })) : null));
  }));
  if (cats.length < 2) { fBox.hidden = true; return; }
  ["Todos", ...cats].forEach((nome, i) => {
    const b = h("button", { type: "button", "aria-pressed": i === 0, texto: nome });
    b.addEventListener("click", () => {
      fBox.querySelectorAll("button").forEach((x) => x.setAttribute("aria-pressed", x === b));
      box.querySelectorAll(".cert").forEach((el) => { el.hidden = i !== 0 && el.dataset.cat !== nome; });
    });
    fBox.append(b);
  });
}

/* ---------- Animação de entrada ao rolar ---------- */
function revelar() {
  const itens = document.querySelectorAll(".section-heading, .about-grid, .mapa-grid, .filtros, .skills-layout, .timeline-item, .experience-note, .cert, .contact-panel");
  itens.forEach((i) => i.classList.add("reveal"));
  const obs = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("visible"); obs.unobserve(e.target); } }), { threshold: 0.12 });
  itens.forEach((i) => obs.observe(i));
}