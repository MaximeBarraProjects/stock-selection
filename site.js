// Stock Selection — site vitrine : langue, theme, captures, agrandissement, contact.

// Coordonnees affichees en pied de page ; un champ vide n'est pas affiche.
const AUTEUR = { nom: "", linkedin: "", email: "" };

// Chaque capture existe sous les quatre noms images/[fr/]nom[_dark].webp (la version claire remplace une
// version sombre absente).
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
    const vue = document.querySelector(".zoom img");
    if (vue && vue.dataset.shot) vue.src = chemin(vue.dataset.shot);
  }

  function appliquerLangue(l) {
    doc.dataset.lang = l;
    doc.lang = l;
    document.querySelectorAll("[data-set-lang]").forEach(function (b) {
      b.setAttribute("aria-pressed", String(b.dataset.setLang === l));
    });
    document.title = l === "fr" ? "Stock Selection — poste de recherche actions"
                                : "Stock Selection — equity research workstation";
    rafraichirCaptures();
    legendeZoom();
  }

  function appliquerTheme(t) {
    doc.dataset.theme = t;
    rafraichirCaptures();
  }

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

  // ------------------------------------------------------------ agrandissement
  const dlg = document.querySelector(".zoom");
  const vue = dlg.querySelector("img");
  const cap = dlg.querySelector(".zoom-cap");
  let liste = [], pos = 0;

  function legendeDe(bouton) {
    const conteneur = bouton.closest("figure") || bouton;
    const src = conteneur.querySelector(".fig-title") || bouton;
    const bloc = src.cloneNode(true);
    bloc.querySelectorAll("[data-l]").forEach(function (e) { if (e.dataset.l !== doc.dataset.lang) e.remove(); });
    return bloc.textContent.replace(/\s+/g, " ").trim();
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

  // ------------------------------------------------------------ contact
  const contact = document.querySelector("[data-contact]");
  const morceaux = [];
  if (AUTEUR.nom) {
    const b = document.createElement("b"); b.textContent = AUTEUR.nom; morceaux.push(b);
  }
  if (AUTEUR.linkedin) {
    const a = document.createElement("a"); a.href = AUTEUR.linkedin; a.textContent = "LinkedIn";
    a.rel = "noopener"; morceaux.push(a);
  }
  if (AUTEUR.email) {
    const a = document.createElement("a"); a.href = "mailto:" + AUTEUR.email; a.textContent = AUTEUR.email;
    morceaux.push(a);
  }
  if (morceaux.length) { morceaux.forEach(function (m) { contact.appendChild(m); }); contact.hidden = false; }

  appliquerLangue(doc.dataset.lang === "fr" ? "fr" : "en");
  appliquerTheme(doc.dataset.theme === "dark" ? "dark" : "light");
})();
