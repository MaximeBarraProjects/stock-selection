// Maison Barra - Data terminal — site vitrine : langue, theme, onglets de la visite, agrandissement, contact.

// Coordonnees affichees sur la page ; un champ vide n'est pas affiche.
//   nom      : ex. "Prénom Nom"  -> "Conçu et codé par Prénom Nom" en haut de page
//   linkedin : URL complete du profil -> boutons "Me contacter sur LinkedIn"
const AUTEUR = { nom: "", linkedin: "" };

// Chaque capture existe sous les quatre noms images/[fr/]nom[_dark].webp.
(function () {
  const doc = document.documentElement;

  function memoriser(cle, valeur) {
    try { localStorage.setItem(cle, valeur); } catch (e) { /* navigation privee : pas de memoire */ }
  }

  function chemin(nom) {
    const fr = doc.dataset.lang === "fr" ? "fr/" : "";
    const sombre = doc.dataset.theme === "dark" ? "_dark" : "";
    return "images/" + fr + nom + sombre + ".webp";
  }

  function rafraichirCaptures() {
    document.querySelectorAll("img[data-shot]").forEach(function (img) {
      const src = chemin(img.dataset.shot);
      if (img.getAttribute("src") !== src) img.setAttribute("src", src);
    });
    if (vue.dataset.shot) vue.src = chemin(vue.dataset.shot);
  }

  function appliquerLangue(l) {
    doc.dataset.lang = l;
    doc.lang = l;
    document.querySelectorAll("[data-set-lang]").forEach(function (b) {
      b.setAttribute("aria-pressed", String(b.dataset.setLang === l));
    });
    document.title = l === "fr" ? "Maison Barra - Data terminal — un terminal de données de marché construit de bout en bout"
                                : "Maison Barra - Data terminal — a market data terminal built end to end";
    rafraichirCaptures();
    legendeZoom();
  }

  function appliquerTheme(t) {
    doc.dataset.theme = t;
    rafraichirCaptures();
  }

  // ------------------------------------------------------------ agrandissement
  const dlg = document.querySelector(".zoom");
  const vue = dlg.querySelector("img");
  const cap = dlg.querySelector(".zoom-cap");
  let liste = [], pos = 0;

  function texteVisible(el) {
    const bloc = el.cloneNode(true);
    bloc.querySelectorAll("[data-l]").forEach(function (e) { if (e.dataset.l !== doc.dataset.lang) e.remove(); });
    return bloc.textContent.replace(/\s+/g, " ").trim();
  }

  function legendeDe(bouton) {
    const panneau = bouton.closest(".panel");
    if (panneau) return texteVisible(panneau.querySelector("h3"));
    const fig = bouton.closest("figure");
    if (fig && fig.querySelector("figcaption")) return texteVisible(fig.querySelector("figcaption"));
    return texteVisible(bouton);
  }

  function legendeZoom() {
    if (dlg.open && liste[pos]) cap.textContent = legendeDe(liste[pos]);
  }

  function montrer(i) {
    pos = (i + liste.length) % liste.length;
    const b = liste[pos];
    vue.dataset.shot = b.dataset.zoom;
    vue.src = chemin(b.dataset.zoom);
    const img = b.querySelector("img");
    vue.alt = img ? img.alt : "";
    cap.textContent = legendeDe(b);
  }

  document.querySelectorAll("[data-zoom]").forEach(function (b) {
    const nom = b.closest(".panel") ? "" : texteVisible(b);
    b.setAttribute("aria-label", (doc.dataset.lang === "fr" ? "Agrandir" : "Enlarge") + (nom ? " : " + nom : ""));
    b.addEventListener("click", function () {
      if (typeof dlg.showModal !== "function") { window.open(chemin(b.dataset.zoom), "_blank"); return; }
      liste = Array.from(document.querySelectorAll("[data-zoom]"));
      montrer(liste.indexOf(b));
      dlg.showModal();
    });
  });
  dlg.querySelector("[data-zoom-prev]").addEventListener("click", function () { montrer(pos - 1); });
  dlg.querySelector("[data-zoom-next]").addEventListener("click", function () { montrer(pos + 1); });
  dlg.addEventListener("keydown", function (e) {
    if (e.key === "ArrowLeft") montrer(pos - 1);
    if (e.key === "ArrowRight") montrer(pos + 1);
  });
  dlg.addEventListener("click", function (e) { if (e.target === dlg) dlg.close(); });

  // ------------------------------------------------------------ onglets de la visite (motif ARIA tablist)
  const onglets = Array.from(document.querySelectorAll('[role="tab"]'));

  function ouvrir(onglet, focus) {
    onglets.forEach(function (o) {
      const actif = o === onglet;
      o.setAttribute("aria-selected", String(actif));
      o.tabIndex = actif ? 0 : -1;
      document.getElementById(o.getAttribute("aria-controls")).classList.toggle("is-on", actif);
    });
    if (focus) onglet.focus();
    onglet.scrollIntoView({ block: "nearest", inline: "nearest" });
  }

  onglets.forEach(function (o, i) {
    o.addEventListener("click", function () { ouvrir(o, false); });
    o.addEventListener("keydown", function (e) {
      let j = null;
      if (e.key === "ArrowRight") j = (i + 1) % onglets.length;
      if (e.key === "ArrowLeft") j = (i - 1 + onglets.length) % onglets.length;
      if (e.key === "Home") j = 0;
      if (e.key === "End") j = onglets.length - 1;
      if (j !== null) { e.preventDefault(); ouvrir(onglets[j], true); }
    });
  });
  if (onglets.length) document.getElementById(onglets[0].getAttribute("aria-controls")).classList.add("is-on");
  // une fois la page chargee, les captures des onglets caches se telechargent pour que le changement d'onglet soit immediat
  window.addEventListener("load", function () {
    document.querySelectorAll(".panel img[loading]").forEach(function (img) { img.loading = "eager"; });
  });

  // ------------------------------------------------------------ langue et theme
  document.querySelectorAll("[data-set-lang]").forEach(function (b) {
    b.addEventListener("click", function () {
      appliquerLangue(b.dataset.setLang);
      memoriser("ss-lang", b.dataset.setLang);
    });
  });
  document.querySelector("[data-toggle-theme]").addEventListener("click", function () {
    const t = doc.dataset.theme === "dark" ? "light" : "dark";
    appliquerTheme(t);
    memoriser("ss-theme", t);
  });

  // ------------------------------------------------------------ contact
  if (AUTEUR.linkedin) {
    document.querySelectorAll("[data-linkedin]").forEach(function (a) {
      a.href = AUTEUR.linkedin; a.rel = "noopener"; a.target = "_blank"; a.hidden = false;
    });
    document.querySelectorAll("[data-contact]").forEach(function (e) { e.hidden = false; });
  }
  if (AUTEUR.nom) {
    const ligne = document.querySelector("[data-byline]");
    ligne.textContent = "";
    [["en", "Designed and coded by "], ["fr", "Conçu et codé par "]].forEach(function (p) {
      const s = document.createElement("span");
      s.dataset.l = p[0];
      s.append(p[1]);
      const b = document.createElement("b");
      b.textContent = AUTEUR.nom;
      s.append(b, ", 2026");
      ligne.append(s);
    });
  }

  appliquerLangue(doc.dataset.lang === "fr" ? "fr" : "en");
  appliquerTheme(doc.dataset.theme === "dark" ? "dark" : "light");
})();
