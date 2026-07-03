// Shared config + GitHub Releases helpers for the store.
// The code repos are private; releases (DMGs) live in these PUBLIC repos, so
// the GitHub API can be read anonymously (and is CORS-enabled).

const APPS = {
  nicho: {
    name: "Nicho",
    icon: "nicho.png",
    accent: "amber",
    tagline: "Transforma o notch do MacBook em um espaço útil.",
    description:
      "Nicho transforma o notch do seu MacBook em um HUD útil e bonito: player de música com capa do álbum, widgets (câmera, notas, relógio, calendário), bandeja de arquivos, mensagens no notch e uma luz de notificação que acende na cor do app quando chega chamada ou mensagem. Pode expandir ao passar o mouse. Interface em Português e Inglês, seguindo o idioma do sistema.",
    features: ["Widgets", "Controle de música", "Luz de notificação", "Bandeja de arquivos", "Expandir com o mouse", "PT · EN"],
    req: "macOS 14 (Sonoma) ou superior · Universal (Apple Silicon · Intel)",
    repo: "SAMUKANINJA/Nicho-releases",
  },
  dorso: {
    name: "Dorso+",
    icon: "dorso.png",
    accent: "cyan",
    tagline: "Cuida da sua postura no Mac.",
    description:
      "Dorso+ te ajuda a manter uma boa postura no computador: usa a câmera (ou AirPods / Apple Watch) para perceber quando você se curva ou se afasta da tela, e te avisa de forma discreta. Tem lembrete de hidratação, desfoque de privacidade ao se afastar e perfis de sensibilidade. Interface em Português e Inglês.",
    features: ["Postura", "Hidratação", "Afastamento", "Privacidade", "PT · EN"],
    req: "macOS 13 (Ventura) ou superior · Universal (Apple Silicon · Intel)",
    repo: "SAMUKANINJA/DorsoPlus-releases",
  },
};

const API = "https://api.github.com/repos/";

async function fetchReleases(repo) {
  const r = await fetch(API + repo + "/releases", {
    headers: { Accept: "application/vnd.github+json" },
  });
  if (!r.ok) throw new Error("releases http " + r.status);
  return r.json();
}

// The .dmg asset of a release (the actual download).
function dmgOf(release) {
  return (release.assets || []).find((a) => a.name.toLowerCase().endsWith(".dmg"));
}

// Wire a button/anchor to download the LATEST DMG directly. Falls back to the
// releases page if the API is unreachable.
async function wireSmartDownload(el, repo) {
  const fallback = "https://github.com/" + repo + "/releases/latest";
  el.setAttribute("href", fallback);
  el.setAttribute("aria-disabled", "true");
  try {
    const releases = await fetchReleases(repo);
    const latest = releases.find((rel) => !rel.draft && dmgOf(rel));
    const dmg = latest && dmgOf(latest);
    if (dmg) el.setAttribute("href", dmg.browser_download_url);
  } catch (_) {
    /* keep fallback */
  } finally {
    el.removeAttribute("aria-disabled");
  }
}

function formatDate(iso) {
  try {
    return new Date(iso).toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" });
  } catch (_) {
    return iso.slice(0, 10);
  }
}
