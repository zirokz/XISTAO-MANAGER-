const el = {
  goal: document.getElementById("goal"),
  context: document.getElementById("context"),
  style: document.getElementById("style"),
  spice: document.getElementById("spice"),
  avoidFrio: document.getElementById("avoidFrio"),
  avoidCarente: document.getElementById("avoidCarente"),
  avoidInvasivo: document.getElementById("avoidInvasivo"),
  avoidCringe: document.getElementById("avoidCringe"),
  profile: document.getElementById("profile"),
  igStoryField: document.getElementById("igStoryField"),
  igStory: document.getElementById("igStory"),
  lastHer: document.getElementById("lastHer"),
  noReplyField: document.getElementById("noReplyField"),
  noReply: document.getElementById("noReply"),
  meName: document.getElementById("meName"),
  herName: document.getElementById("herName"),
  chat: document.getElementById("chat"),
  chatImage: document.getElementById("chatImage"),
  chatImagePreview: document.getElementById("chatImagePreview"),
  ocrStatus: document.getElementById("ocrStatus"),
  ocrExtract: document.getElementById("ocrExtract"),
  ocrPaste: document.getElementById("ocrPaste"),
  profileImage: document.getElementById("profileImage"),
  profileImagePreview: document.getElementById("profileImagePreview"),
  profileOcrStatus: document.getElementById("profileOcrStatus"),
  profileOcrExtract: document.getElementById("profileOcrExtract"),
  profileOcrPaste: document.getElementById("profileOcrPaste"),
  platformTinder: document.getElementById("platformTinder"),
  platformInstagram: document.getElementById("platformInstagram"),
  toggleDetails: document.getElementById("toggleDetails"),
  detailsFields: document.getElementById("detailsFields"),
  place: document.getElementById("place"),
  dateType: document.getElementById("dateType"),
  budget: document.getElementById("budget"),
  dateWhen: document.getElementById("dateWhen"),
  dateTime: document.getElementById("dateTime"),
  placesProvider: document.getElementById("placesProvider"),
  googleApiKey: document.getElementById("googleApiKey"),
  showGoogleApiKey: document.getElementById("showGoogleApiKey"),
  generate: document.getElementById("generate"),
  reset: document.getElementById("reset"),
  caseName: document.getElementById("caseName"),
  caseList: document.getElementById("caseList"),
  saveCase: document.getElementById("saveCase"),
  loadCase: document.getElementById("loadCase"),
  deleteCase: document.getElementById("deleteCase"),
  exportCases: document.getElementById("exportCases"),
  importCases: document.getElementById("importCases"),
  importCasesFile: document.getElementById("importCasesFile"),
  toggleCasesJson: document.getElementById("toggleCasesJson"),
  casesJsonBox: document.getElementById("casesJsonBox"),
  casesJson: document.getElementById("casesJson"),
  copyCasesJson: document.getElementById("copyCasesJson"),
  importCasesJson: document.getElementById("importCasesJson"),
  closeCasesJson: document.getElementById("closeCasesJson"),
  caseStatus: document.getElementById("caseStatus"),
  options: document.getElementById("options"),
  winnerHint: document.getElementById("winnerHint"),
  copyWinner: document.getElementById("copyWinner"),
  toggleAllOptions: document.getElementById("toggleAllOptions"),
  openWinnerWhatsApp: document.getElementById("openWinnerWhatsApp"),
  enableVariations: document.getElementById("enableVariations"),
  variationsBar: document.getElementById("variationsBar"),
  var1: document.getElementById("var1"),
  var2: document.getElementById("var2"),
  var3: document.getElementById("var3"),
  var4: document.getElementById("var4"),
  privacyMode: document.getElementById("privacyMode"),
  clearSensitive: document.getElementById("clearSensitive"),
  privacyBar: document.getElementById("privacyBar"),
  diagStage: document.getElementById("diagStage"),
  diagInterest: document.getElementById("diagInterest"),
  diagSignals: document.getElementById("diagSignals"),
  diagRisks: document.getElementById("diagRisks"),
  diagStrategy: document.getElementById("diagStrategy"),
  copyPlan: document.getElementById("copyPlan"),
  prompt: document.getElementById("prompt"),
  copyPrompt: document.getElementById("copyPrompt"),
  steps: document.getElementById("steps"),
  inputHint: document.getElementById("inputHint"),
  installStatus: document.getElementById("installStatus"),
  placesList: document.getElementById("placesList"),
  fetchPlaces: document.getElementById("fetchPlaces"),
  placesOnlineStatus: document.getElementById("placesOnlineStatus"),
  placesOnlineList: document.getElementById("placesOnlineList"),
  copyInvite: document.getElementById("copyInvite"),
  openInviteWhatsApp: document.getElementById("openInviteWhatsApp"),
  toggleExtras: document.getElementById("toggleExtras"),
  checkUpdate: document.getElementById("checkUpdate"),
};

const STORAGE_KEY = "paquera_pwa_state_v1";
const PLACE_SEARCH_CACHE_KEY = "paquera_place_search_cache_v1";
const CASES_KEY = "paquera_cases_v1";
const UI_KEY = "paquera_ui_v1";

let variationsEnabled = false;
let variationIndex = 0;

function normalizeText(value) {
  return String(value ?? "")
    .replace(/\r\n/g, "\n")
    .replace(/\t/g, " ")
    .trim();
}

function hashStringToInt(value) {
  const s = String(value ?? "");
  let h = 2166136261;
  for (let i = 0; i < s.length; i += 1) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h | 0;
}

function assessMessage(text) {
  const t = normalizeText(text);
  const warnings = [];
  if (!t) return warnings;

  const len = t.length;
  const questionCount = (t.match(/\?/g) ?? []).length;
  const lineCount = t.split("\n").filter(Boolean).length;

  if (len >= 240) warnings.push("Textão");
  else if (len >= 170) warnings.push("Um pouco longo");

  if (questionCount >= 3) warnings.push("Muitas perguntas");
  else if (questionCount === 2) warnings.push("Duas perguntas");

  if (lineCount >= 4) warnings.push("Muitas linhas");

  if (/(por favor|pfv|plmds)/i.test(t)) warnings.push("Pede demais");
  if (/(me responde|responde aí|responde ai|cadê você|cade voce|cadê vc|cade vc)/i.test(t)) warnings.push("Cobrança");
  if (/(você sumiu|voce sumiu|vc sumiu|tá sumida|ta sumida|sumiu\?)/i.test(t)) warnings.push("“Sumiu?”");
  if (/(desculpa|perd[aã]o)/i.test(t) && len < 40) warnings.push("Desculpa cedo");

  return warnings;
}

function shortenMessage(text) {
  const raw = normalizeText(text);
  if (!raw) return "";

  let t = raw
    .replace(/\s+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .replace(/\s{2,}/g, " ")
    .trim();

  t = t.replace(/(^|\s)(por favor|pfv|plmds)(\s|$)/gi, " ").trim();
  t = t
    .replace(/(^|\s)(me responde|responde aí|responde ai|cadê você|cade voce|cadê vc|cade vc)(\s|$)/gi, " ")
    .replace(/(^|\s)(você sumiu|voce sumiu|vc sumiu|tá sumida|ta sumida)(\s|$)/gi, " ")
    .replace(/\s{2,}/g, " ")
    .trim();

  t = t
    .replace(/^(ok,?\s+|tá,?\s+|ta,?\s+|confesso que\s+|vou ser sincero:\s+|vou ser sincera:\s+)/i, "")
    .replace(/^\s+/, "")
    .trim();

  const parts = t
    .split("\n")
    .map((p) => p.trim())
    .filter(Boolean);
  t = parts.join("\n");

  const sentences = t
    .split(/(?<=[\.\?\!])\s+/)
    .map((s) => s.trim())
    .filter(Boolean);

  const firstQuestion = sentences.find((s) => s.includes("?")) ?? "";
  const nonQuestions = sentences.filter((s) => !s.includes("?"));
  const head = nonQuestions[0] ?? sentences[0] ?? "";

  let out = head;
  if (firstQuestion && firstQuestion !== head) {
    out = `${head} ${firstQuestion}`.trim();
  }

  if (!out.includes("?")) {
    out = `${out} E você?`.trim();
  }

  out = out
    .replace(/\?\s*E você\?\s*$/i, "?")
    .replace(/\s{2,}/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();

  const targetLen = 150;
  if (out.length > targetLen) {
    out = clamp(out, targetLen);
  }
  return out;
}

function clamp(value, maxLen) {
  const text = normalizeText(value);
  if (text.length <= maxLen) return text;
  return text.slice(0, maxLen).trimEnd() + "…";
}

function toggleHidden(node, shouldHide) {
  if (!node) return;
  node.classList.toggle("hidden", Boolean(shouldHide));
}

function updateContextUI() {
  const context = normalizeText(el.context?.value);
  toggleHidden(el.igStoryField, context !== "instagram");
}

function updateGoalUI() {
  const goal = normalizeText(el.goal?.value);
  toggleHidden(el.noReplyField, goal !== "reengajar");
}

function updatePrivacyUI() {
  const active = Boolean(el.privacyMode?.checked);
  toggleHidden(el.privacyBar, !active);
}

function updateVariationsUI() {
  const enabled = Boolean(variationsEnabled);
  if (el.enableVariations) el.enableVariations.textContent = enabled ? "Desativar variações" : "Gerar +3 variações";
  toggleHidden(el.variationsBar, !enabled);

  const idx = Number(variationIndex ?? 0);
  for (const [i, btn] of [
    [0, el.var1],
    [1, el.var2],
    [2, el.var3],
    [3, el.var4],
  ]) {
    if (!btn) continue;
    btn.classList.toggle("primary", enabled && idx === i);
  }
}

function loadUiPrefs() {
  try {
    const raw = localStorage.getItem(UI_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

function saveUiPrefs(prefs) {
  try {
    localStorage.setItem(UI_KEY, JSON.stringify(prefs));
  } catch {}
}

let detailsOpen = false;
function setDetailsOpen(open) {
  detailsOpen = Boolean(open);
  toggleHidden(el.detailsFields, !detailsOpen);
  if (el.toggleDetails) el.toggleDetails.textContent = detailsOpen ? "Fechar ajustes" : "Ajustes";
  const prefs = loadUiPrefs();
  prefs.detailsOpen = detailsOpen;
  saveUiPrefs(prefs);
}

if (el.toggleDetails) {
  el.toggleDetails.addEventListener("click", () => setDetailsOpen(!detailsOpen));
}

{
  const prefs = loadUiPrefs();
  const shouldOpen =
    typeof prefs.detailsOpen === "boolean" ? prefs.detailsOpen : !window.matchMedia?.("(max-width: 760px)")?.matches;
  setDetailsOpen(shouldOpen);
}

const extraCards = Array.from(document.querySelectorAll(".extraCard"));
let extrasOpen = false;
function setExtrasOpen(open) {
  extrasOpen = Boolean(open);
  for (const card of extraCards) toggleHidden(card, !extrasOpen);
  if (el.toggleExtras) el.toggleExtras.textContent = extrasOpen ? "Fechar extras" : "Extras";
  const prefs = loadUiPrefs();
  prefs.extrasOpen = extrasOpen;
  saveUiPrefs(prefs);
}

if (el.toggleExtras) {
  el.toggleExtras.addEventListener("click", () => setExtrasOpen(!extrasOpen));
}

{
  const prefs = loadUiPrefs();
  const isMobile = window.matchMedia?.("(max-width: 760px)")?.matches;
  const shouldOpen = typeof prefs.extrasOpen === "boolean" ? prefs.extrasOpen : !isMobile;
  setExtrasOpen(shouldOpen);
}

let showAllOptions = false;
function setShowAllOptions(showAll) {
  showAllOptions = Boolean(showAll);
  if (el.toggleAllOptions) el.toggleAllOptions.textContent = showAllOptions ? "Só vencedora" : "Mais opções";
  const prefs = loadUiPrefs();
  prefs.showAllOptions = showAllOptions;
  saveUiPrefs(prefs);
}

if (el.toggleAllOptions) {
  el.toggleAllOptions.addEventListener("click", () => {
    setShowAllOptions(!showAllOptions);
    requestGenerate({ immediate: true });
  });
}

{
  const prefs = loadUiPrefs();
  const isMobile = window.matchMedia?.("(max-width: 760px)")?.matches;
  const shouldShowAll = typeof prefs.showAllOptions === "boolean" ? prefs.showAllOptions : !isMobile;
  setShowAllOptions(shouldShowAll);
}

function updatePlatformUI() {
  const context = normalizeText(el.context?.value);
  const isTinder = context === "apps";
  if (el.platformTinder) el.platformTinder.classList.toggle("primary", isTinder);
  if (el.platformInstagram) el.platformInstagram.classList.toggle("primary", !isTinder);
}

function setPlatform(platform) {
  if (platform === "tinder") {
    if (el.context) el.context.value = "apps";
  } else {
    if (el.context) el.context.value = "instagram";
  }
  if (el.goal) el.goal.value = "destravar";
  updateContextUI();
  updateGoalUI();
  updatePlatformUI();
  scheduleSave();
  requestGenerate({ immediate: true });
}

if (el.platformTinder) {
  el.platformTinder.addEventListener("click", () => setPlatform("tinder"));
}
if (el.platformInstagram) {
  el.platformInstagram.addEventListener("click", () => setPlatform("instagram"));
}

function pickFirstNonEmptyLine(text) {
  const lines = normalizeText(text)
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);
  return lines[0] ?? "";
}

function extractHook(profileText) {
  const text = normalizeText(profileText);
  if (!text) return "";
  const line = pickFirstNonEmptyLine(text);
  const cleaned = line.replace(/^bio:\s*/i, "").replace(/^foto:\s*/i, "").trim();
  if (!cleaned) return "";
  const short = clamp(cleaned, 72);
  return short;
}

function briefStory(story) {
  const s = normalizeText(story);
  if (!s) return "";
  if (s.length <= 80) return s;
  return `${s.slice(0, 77).trim()}…`;
}

function detectIGTopic(story) {
  const s = normalizeText(story).toLowerCase();
  if (!s) return null;
  if (/(viagem|viajar|trip|aeroporto|voo|hotel)/.test(s)) return { label: "viagem", q: "pra onde foi (ou quer ir) na próxima?" };
  if (/(praia|mar|sol|areia|litoral)/.test(s)) return { label: "praia", q: "qual praia você voltaria fácil?" };
  if (/(treino|academia|gym|cross|corrida|cardio)/.test(s)) return { label: "treino", q: "qual é teu treino que você mais curte (e qual você odeia)?" };
  if (/(cafe|café|capuccino|latte|barista)/.test(s)) return { label: "café", q: "você é time espresso forte ou doce perfeito?" };
  if (/(show|música|musica|spotify|playlist|festival)/.test(s)) return { label: "música", q: "qual música tá no repeat essa semana?" };
  if (/(vinho|drink|bar|cerveja)/.test(s)) return { label: "drink", q: "qual é teu drink favorito (sem julgamento)?" };
  if (/(cachorro|dog|gato|cat|pet)/.test(s)) return { label: "pet", q: "ele é apegado ou faz pose pra câmera?" };
  return { label: "geral", q: "qual foi a melhor parte disso?" };
}

function setStatus(node, text) {
  if (!node) return;
  node.textContent = normalizeText(text);
}

async function pasteClipboardText() {
  if (!window.isSecureContext || !navigator.clipboard?.readText) {
    return { ok: false, error: "Seu navegador não permite colar texto automaticamente aqui. Cole manualmente." };
  }
  try {
    const text = await navigator.clipboard.readText();
    if (!normalizeText(text)) return { ok: false, error: "A área de transferência está vazia." };
    return { ok: true, text };
  } catch {
    return { ok: false, error: "Permita acesso ao Clipboard e tente de novo." };
  }
}

function setOcrStatus(text) {
  setStatus(el.ocrStatus, text);
}

function setProfileOcrStatus(text) {
  setStatus(el.profileOcrStatus, text);
}

function setCaseStatus(text) {
  if (!el.caseStatus) return;
  el.caseStatus.textContent = normalizeText(text);
}

function loadCases() {
  try {
    const raw = localStorage.getItem(CASES_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((x) => x && typeof x === "object" && typeof x.id === "string" && typeof x.name === "string");
  } catch {
    return [];
  }
}

function saveCases(cases) {
  try {
    localStorage.setItem(CASES_KEY, JSON.stringify(cases));
  } catch {}
}

function downloadTextFile({ filename, text, mime = "application/json" }) {
  const blob = new Blob([text], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function safeParseJson(text) {
  try {
    return { ok: true, value: JSON.parse(text) };
  } catch {
    return { ok: false, value: null };
  }
}

function normalizeImportedCase(item) {
  if (!item || typeof item !== "object") return null;
  const name = normalizeText(item.name);
  const id = normalizeText(item.id) || makeCaseId();
  const ts = Number(item.ts || Date.now());
  const state = item.state && typeof item.state === "object" ? item.state : null;
  if (!name || !state) return null;
  return { id, name, ts, state };
}

function mergeCases(existing, incoming) {
  const map = new Map(existing.map((c) => [c.id, c]));
  for (const raw of incoming) {
    const c = normalizeImportedCase(raw);
    if (!c) continue;
    map.set(c.id, c);
  }
  return Array.from(map.values());
}

function makeCaseId() {
  return `${Date.now()}_${Math.random().toString(16).slice(2)}`;
}

function renderCaseList(cases) {
  if (!el.caseList) return;
  el.caseList.innerHTML = "";
  const items = [...cases].sort((a, b) => Number(b.ts || 0) - Number(a.ts || 0));
  if (!items.length) {
    const opt = document.createElement("option");
    opt.value = "";
    opt.textContent = "(sem casos salvos)";
    el.caseList.appendChild(opt);
    if (el.loadCase) el.loadCase.disabled = true;
    if (el.deleteCase) el.deleteCase.disabled = true;
    return;
  }

  for (const item of items) {
    const opt = document.createElement("option");
    opt.value = item.id;
    opt.textContent = item.name;
    el.caseList.appendChild(opt);
  }
  if (el.loadCase) el.loadCase.disabled = false;
  if (el.deleteCase) el.deleteCase.disabled = false;
}

async function fileToImageSource(file) {
  if (typeof createImageBitmap === "function") {
    const bmp = await createImageBitmap(file);
    return { source: bmp, cleanup: () => bmp.close?.() };
  }
  return await new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => resolve({ source: img, cleanup: () => URL.revokeObjectURL(url) });
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Falha ao carregar imagem."));
    };
    img.src = url;
  });
}

async function ocrUsingTextDetector(file) {
  if (!("TextDetector" in window)) return null;
  const detector = new window.TextDetector();
  const { source, cleanup } = await fileToImageSource(file);
  try {
    const detections = await detector.detect(source);
    const lines = (detections ?? [])
      .map((d) => {
        const text = normalizeText(d?.rawValue);
        const y = Number(d?.boundingBox?.y ?? 0);
        const x = Number(d?.boundingBox?.x ?? 0);
        return { text, x, y };
      })
      .filter((x) => x.text);
    lines.sort((a, b) => a.y - b.y || a.x - b.x);
    return lines.map((l) => l.text).join("\n").trim();
  } finally {
    cleanup?.();
  }
}

const previewUrls = {
  chat: "",
  profile: "",
};

function updateImagePreview(kind, file, imgEl) {
  if (!imgEl) return;
  if (previewUrls[kind]) URL.revokeObjectURL(previewUrls[kind]);
  previewUrls[kind] = "";
  if (!file) {
    imgEl.src = "";
    imgEl.classList.add("hidden");
    return;
  }
  const url = URL.createObjectURL(file);
  previewUrls[kind] = url;
  imgEl.src = url;
  imgEl.classList.remove("hidden");
}

async function extractChatFromImage() {
  const file = el.chatImage?.files?.[0];
  if (!file) {
    setOcrStatus("Selecione uma imagem primeiro.");
    return;
  }

  setOcrStatus("Extraindo texto…");
  try {
    const text = await ocrUsingTextDetector(file);
    if (!text) {
      setOcrStatus("OCR não suportado aqui. No iPhone, toque e segure no texto do print (Live Text) e cole em “Conversa”.");
      return;
    }
    el.chat.value = text;

    const lastHer = normalizeText(el.lastHer.value);
    if (!lastHer) {
      const lines = text
        .split("\n")
        .map((l) => l.trim())
        .filter(Boolean);
      const last = lines[lines.length - 1] ?? "";
      if (last) el.lastHer.value = clamp(last, 220);
    }

    scheduleSave();
    scrollToResultsOnce = true;
    generate();
    setOcrStatus("Texto extraído. Dica: marque Eu:/Ela: na conversa pra melhorar a análise.");
  } catch {
    setOcrStatus("Não consegui extrair. Tente outra imagem ou use copiar/colar do Lens.");
  }
}

async function extractProfileFromImage() {
  const file = el.profileImage?.files?.[0];
  if (!file) {
    setProfileOcrStatus("Selecione uma imagem primeiro.");
    return;
  }

  setProfileOcrStatus("Extraindo texto…");
  try {
    const text = await ocrUsingTextDetector(file);
    if (!text) {
      setProfileOcrStatus("OCR não suportado aqui. No iPhone, toque e segure no texto do print (Live Text) e cole em “Gancho do perfil dela”.");
      return;
    }
    const current = normalizeText(el.profile.value);
    el.profile.value = current ? `${current}\n${text}` : text;
    scheduleSave();
    scrollToResultsOnce = true;
    generate();
    setProfileOcrStatus("Texto extraído e colocado no gancho do perfil.");
  } catch {
    setProfileOcrStatus("Não consegui extrair. Tente outra imagem ou use copiar/colar do Live Text.");
  }
}

function normalizeSpeakerName(value) {
  return normalizeText(value)
    .toLowerCase()
    .replace(/[\u200e\u200f]/g, "")
    .trim();
}

function mapSpeaker({ rawName, meName, herName }) {
  const name = normalizeSpeakerName(rawName);
  if (!name) return "unknown";

  const me = normalizeSpeakerName(meName);
  const her = normalizeSpeakerName(herName);

  if (me && name === me) return "me";
  if (her && name === her) return "her";

  if (["eu", "me", "i", "you", "você", "voce", "vc"].includes(name)) return "me";
  if (["ela", "her"].includes(name)) return "her";

  return "unknown";
}

function normalizeWhatsAppText(value) {
  const text = normalizeText(value);
  if (!text) return "";
  if (/(<media omitted>|imagem omitida|vídeo omitido|video omitido|áudio omitido|audio omitido|gif omitido|sticker omitted)/i.test(text))
    return "(mídia)";
  if (/(mensagem apagada|message deleted)/i.test(text)) return "(mensagem apagada)";
  return text;
}

function stripDirectionMarks(value) {
  return String(value ?? "").replace(/[\u200e\u200f]/g, "");
}

function isSystemLine(line) {
  const text = normalizeText(stripDirectionMarks(line)).toLowerCase();
  if (!text) return true;
  if (
    text.includes("messages and calls are end-to-end encrypted") ||
    text.includes("as mensagens e chamadas são protegidas") ||
    text.includes("as mensagens e as chamadas são protegidas") ||
    text.includes("nenhuma das partes fora desta conversa") ||
    text.includes("no one outside of this chat") ||
    text.includes("tocando para") ||
    text.includes("missed voice call") ||
    text.includes("missed video call") ||
    text.includes("chamada de voz") ||
    text.includes("chamada de vídeo") ||
    text.includes("chamada de video")
  )
    return true;
  if (
    /(criou o grupo|added|adicionou|removeu|removed|mudou o assunto|changed the subject|mudou a descrição|changed the group|alterou o ícone|changed this group's icon|left|saiu|entrou|joined using|joined via|security code changed)/i.test(
      text
    )
  )
    return true;
  if (/^(você|you)\s+apagou\s+esta\s+mensagem/i.test(text)) return true;
  return false;
}

function splitNameAndMessage(rest) {
  const idx = rest.indexOf(":");
  if (idx <= 0) return { name: "", msg: normalizeText(rest) };
  const name = rest.slice(0, idx).trim();
  const msg = rest.slice(idx + 1).trim();
  return { name, msg };
}

function parseChat(chatText, { meName, herName } = {}) {
  const raw = normalizeText(chatText);
  if (!raw) {
    return {
      turns: [],
      lastSpeaker: "none",
      lastHer: "",
      lastMe: "",
      totalTurns: 0,
    };
  }

  const lines = raw.split("\n").map((l) => l.trim()).filter(Boolean);

  const turns = [];
  for (const line of lines) {
    if (isSystemLine(line)) continue;

    const direct = line.match(/^(eu|ela|você|vc|voce)\s*:\s*(.+)$/i);
    if (direct) {
      const key = direct[1].toLowerCase();
      const speaker = ["eu", "você", "voce", "vc"].includes(key) ? "me" : "her";
      turns.push({ speaker, text: direct[2].trim() });
      continue;
    }

    const wa1 = line.match(
      /^(?:\[\s*)?(\d{1,2}[\/.-]\d{1,2}[\/.-]\d{2,4})(?:,\s*|\s+)(\d{1,2}:\d{2}(?::\d{2})?)(?:\s*(?:AM|PM))?(?:\s*\])?\s*-\s*(.+)$/i
    );
    if (wa1) {
      const { name, msg } = splitNameAndMessage(wa1[3]);
      const text = normalizeWhatsAppText(msg);
      if (text) turns.push({ speaker: mapSpeaker({ rawName: name, meName, herName }), text });
      continue;
    }

    const wa2 = line.match(/^\[(\d{1,2}[\/.-]\d{1,2}[\/.-]\d{2,4}),\s*(\d{1,2}:\d{2}(?::\d{2})?)\]\s*(.+)$/);
    if (wa2) {
      const { name, msg } = splitNameAndMessage(wa2[3]);
      const text = normalizeWhatsAppText(msg);
      if (text) turns.push({ speaker: mapSpeaker({ rawName: name, meName, herName }), text });
      continue;
    }

    const wa3 = line.match(/^(\d{1,2}:\d{2})\s*-\s*(.+)$/);
    if (wa3) {
      const { name, msg } = splitNameAndMessage(wa3[2]);
      const text = normalizeWhatsAppText(msg);
      if (text) turns.push({ speaker: mapSpeaker({ rawName: name, meName, herName }), text });
      continue;
    }

    const nameLine = line.match(/^([^:]{1,40})\s*:\s*(.+)$/);
    if (nameLine && !/^\d{1,2}:\d{2}$/.test(nameLine[1].trim())) {
      const name = nameLine[1].trim();
      const text = normalizeText(nameLine[2]);
      if (text) turns.push({ speaker: mapSpeaker({ rawName: name, meName, herName }), text });
      continue;
    }

    if (turns.length) {
      turns[turns.length - 1] = {
        ...turns[turns.length - 1],
        text: (turns[turns.length - 1].text + " " + line).trim(),
      };
    } else {
      turns.push({ speaker: "unknown", text: line });
    }
  }

  let lastHer = "";
  let lastMe = "";
  for (let i = turns.length - 1; i >= 0; i -= 1) {
    const t = turns[i];
    if (!lastHer && t.speaker === "her") lastHer = t.text;
    if (!lastMe && t.speaker === "me") lastMe = t.text;
    if (lastHer && lastMe) break;
  }

  const last = turns[turns.length - 1];
  const lastSpeaker = last?.speaker ?? "none";

  return { turns, lastSpeaker, lastHer, lastMe, totalTurns: turns.length };
}

function getEnergy(turnText) {
  const text = normalizeText(turnText);
  if (!text) return "low";
  const len = text.length;
  const hasQuestion = /\?/.test(text);
  const hasLaugh = /\b(kkk+|haha+|rsrs+)\b/i.test(text);
  const emojiCount = (text.match(/[\p{Extended_Pictographic}]/gu) ?? []).length;

  const score =
    (len >= 35 ? 2 : len >= 15 ? 1 : 0) +
    (hasQuestion ? 2 : 0) +
    (hasLaugh ? 1 : 0) +
    (emojiCount >= 2 ? 1 : 0);

  if (score >= 4) return "high";
  if (score >= 2) return "mid";
  return "low";
}

function interestLabel(level) {
  if (level === "high") return "Alto";
  if (level === "mid") return "Médio";
  return "Baixo";
}

function stageLabel(stage) {
  if (stage === "abertura") return "Abertura";
  if (stage === "conexao") return "Conexão";
  if (stage === "tensao") return "Tensão leve";
  if (stage === "convite") return "Convite";
  return "Ajuste";
}

function inferStage({ goal, chat }) {
  if (goal === "encontro") return "convite";
  if (chat.totalTurns <= 2) return "abertura";
  if (chat.totalTurns <= 6) return "conexao";
  return "tensao";
}

function diagnoseInteraction({ goal, context, style, spice, avoidSet, hook, chat }) {
  const lastHer = normalizeText(chat.lastHer);
  const energy = getEnergy(lastHer);
  const hasQuestion = /\?/.test(lastHer);
  const hasLaugh = /\b(kkk+|haha+|rsrs+)\b/i.test(lastHer);
  const hasCompliment = /\b(lindo|bonito|gostei|amei|adorei|curti)\b/i.test(lastHer);
  const isDry = lastHer.length > 0 && lastHer.length <= 8 && !hasLaugh && !hasQuestion;

  const signals = [];
  if (hasQuestion) signals.push("Ela fez pergunta: investimento e abertura pra continuar.");
  if (hasLaugh) signals.push("Risada: você acertou o tom (leveza funcionando).");
  if (hasCompliment) signals.push("Validação: sinal claro de receptividade.");
  if (energy === "high") signals.push("Mensagem com energia alta: dá pra avançar com mais intenção.");
  if (energy === "low" && lastHer) signals.push("Energia baixa: precisa simplificar e puxar pro concreto.");
  if (!lastHer) signals.push("Sem mensagem dela: priorize algo simples, específico e fácil de responder.");

  const risks = [];
  if (avoidSet.has("carente")) risks.push("Evite múltiplas mensagens seguidas, justificativas e cobrança de resposta.");
  if (avoidSet.has("frio")) risks.push("Evite resposta seca. Use calor humano: humor leve + curiosidade.");
  if (avoidSet.has("invasivo")) risks.push("Evite sexualizar cedo ou fazer perguntas íntimas.");
  if (avoidSet.has("cringe")) risks.push("Evite clichês e cantadas prontas. Prefira detalhe específico + subtexto.");
  if (isDry) risks.push("Se ela estiver seca repetidamente, não invista demais: reengaje uma vez e recua.");

  const stage = inferStage({ goal, chat });

  const strategyParts = [];
  if (stage === "abertura") {
    strategyParts.push("Abertura com gancho específico + pergunta leve.");
    strategyParts.push("Objetivo: ganhar resposta fácil e puxar pro terreno dela.");
  } else if (stage === "conexao") {
    strategyParts.push("Conexão: alterna brincadeira leve + curiosidade genuína.");
    strategyParts.push("Objetivo: ela investir com detalhes (história, opinião, hábito).");
  } else if (stage === "tensao") {
    strategyParts.push("Tensão leve: teasing sutil + framing (você tem padrão, não aprova tudo).");
    strategyParts.push("Objetivo: criar subtexto sem ser pesado.");
  } else {
    strategyParts.push("Convite: curto, concreto, com “saída fácil” e duas opções de dia.");
    strategyParts.push("Objetivo: tirar do chat sem vender demais.");
  }

  if (context === "apps") strategyParts.push("Em app: mensagens curtas e rápidas; uma ideia por mensagem.");
  if (context === "instagram") {
    strategyParts.push("No Instagram: use resposta de story + humor leve + pergunta simples (evite textão).");
    strategyParts.push("Se engatar, migre pra WhatsApp ou marque algo sem ficar preso no DM.");
  }
  if (spice === "high") strategyParts.push("Ousado: intenção clara e ritmo mais rápido, sem pressão.");
  if (spice === "low") strategyParts.push("Leve: flerte discreto, foco em conforto e naturalidade.");
  if (style === "direto") strategyParts.push("Direto: pergunta objetiva e convite cedo quando tiver boa resposta.");
  if (style === "romantico") strategyParts.push("Romântico: validação seletiva + curiosidade emocional (sem textão).");
  if (style === "sutil") strategyParts.push("Sutil: subtexto com humor e perguntas simples.");

  const interest =
    hasCompliment || (energy === "high" && hasQuestion) ? "high" : hasQuestion || hasLaugh || energy === "mid" ? "mid" : "low";

  const recommendedKeys = (() => {
    const keys = [];

    if (goal === "encontro" && chat.totalTurns >= 4) {
      keys.push("A");
      if (interest === "high") keys.push("B");
      return keys;
    }

    if (isDry) {
      keys.push("A");
      keys.push("B");
      return keys;
    }

    if (hasQuestion) {
      keys.push("C");
      keys.push("A");
      return keys;
    }

    if (interest === "high") {
      keys.push("A");
      keys.push("C");
      return keys;
    }

    keys.push("A");
    return keys;
  })();

  const recommendationText = (() => {
    if (recommendedKeys.length === 1) return `Vencedora: ${recommendedKeys[0]}`;
    return `Vencedoras: ${recommendedKeys.join(" e ")}`;
  })();

  return {
    stage,
    interest,
    signals: signals.length ? signals : ["Neutro: faltam sinais claros. Construa ritmo e veja se ela investe."],
    risks: risks.length ? risks : ["Sem alertas extras. Mantenha leveza e autenticidade."],
    strategy: strategyParts.join("\n"),
    recommendedKeys,
    recommendationText,
  };
}

function styleTone(style) {
  if (style === "direto") return "confiante e objetivo, com leveza";
  if (style === "romantico") return "gentil e atencioso, sem exageros";
  if (style === "sutil") return "flertando de forma discreta e inteligente";
  return "engraçado e leve, sem forçar";
}

function avoidRule(avoidSet) {
  const rules = [];
  if (avoidSet.has("frio")) rules.push("sem soar frio: calor humano, sorriso e curiosidade");
  if (avoidSet.has("carente")) rules.push("sem insistir, sem cobrar, sem pedir validação");
  if (avoidSet.has("invasivo")) rules.push("sem pressionar, sem sexualizar cedo, sem perguntas íntimas");
  if (avoidSet.has("cringe")) rules.push("sem clichês e sem exagero");
  if (!rules.length) return "natural e respeitoso";
  return rules.join("; ");
}

function formatWhen({ when, time }) {
  const w = normalizeText(when);
  const t = normalizeText(time);
  if (w && t) return `${w} ${t.includes("h") || t.includes(":") ? `às ${t}` : `(${t})`}`.trim();
  if (w) return w;
  if (t) return t.includes("h") || t.includes(":") ? `às ${t}` : t;
  return "";
}

function createInvite({ place, style, spice, dateType, when, time }) {
  const where = normalizeText(place);
  const type =
    dateType === "bar"
      ? "um drink"
      : dateType === "sorvete"
        ? "um sorvete"
        : dateType === "parque"
          ? "uma volta no parque"
          : dateType === "restaurante"
            ? "um jantar simples"
            : "um café";

  const duration = spice === "low" ? "rapidinho" : spice === "high" ? "e ver no que dá" : "de boa";
  const whenText = formatWhen({ when, time });
  const whenBit = whenText ? ` ${whenText}` : " essa semana";
  const base = where ? `Bora ${type} ${duration} por ${where}${whenBit}?` : `Bora ${type} ${duration}${whenBit}?`;

  if (whenText) {
    if (style === "direto") return `${base} Funciona pra você?`;
    if (style === "romantico") return `${base} Se curtir, a gente combina certinho.`;
    if (style === "sutil") return `${base} Se fizer sentido, a gente faz.`;
    return `${base}`;
  }

  if (spice === "high") return `${base} Quinta ou sexta funciona pra você?`;
  if (style === "direto") return `${base} Quinta ou sexta te encaixa melhor?`;
  if (style === "romantico") return `${base} Se curtir, a gente escolhe um lugar tranquilo.`;
  if (style === "sutil") return `${base} Se bater vontade, a gente faz.`;
  return `${base}`;
}

function createInviteForPlace({ placeTitle, style, spice, dateType, when, time }) {
  const name = normalizeText(placeTitle);
  const type =
    dateType === "bar"
      ? "um drink"
      : dateType === "sorvete"
        ? "um sorvete"
        : dateType === "parque"
          ? "uma volta no parque"
          : dateType === "restaurante"
            ? "um jantar simples"
            : "um café";

  const duration = spice === "low" ? "rapidinho" : spice === "high" ? "e ver no que dá" : "de boa";
  const whenText = formatWhen({ when, time });
  const whenBit = whenText ? ` ${whenText}` : " essa semana";
  const base = name ? `Bora ${type} ${duration} no ${name}${whenBit}?` : `Bora ${type} ${duration}${whenBit}?`;

  if (whenText) {
    if (style === "direto") return `${base} Funciona pra você?`;
    if (style === "romantico") return `${base} Se curtir, a gente combina certinho.`;
    if (style === "sutil") return `${base} Se fizer sentido, a gente faz.`;
    return `${base}`;
  }

  if (spice === "high") return `${base} Quinta ou sexta funciona pra você?`;
  if (style === "direto") return `${base} Quinta ou sexta te encaixa melhor?`;
  if (style === "romantico") return `${base} Se curtir, a gente escolhe um lugar tranquilo.`;
  if (style === "sutil") return `${base} Se bater vontade, a gente faz.`;
  return `${base}`;
}

function buildOptions({ goal, style, spice, avoidSet, hook, chat }) {
  const seed = Number(variationIndex ?? 0);
  const energy = getEnergy(chat.lastHer);
  const haveTurns = chat.totalTurns >= 4;
  const lastFromMe = chat.lastSpeaker === "me";

  const hookBit = hook ? ` sobre ${hook}` : "";
  const warm = avoidSet.has("frio");
  const avoidNeediness = avoidSet.has("carente");
  const warmEnd = warm ? " :)" : "";

  const pick = (salt, variants) => variants[(hashStringToInt(`${seed}:${salt}`) >>> 0) % variants.length];

  const playfulQuestion = (() => {
    if (style === "direto")
      return pick("pq:direto", [
        `Pergunta rápida${hookBit}: você é mais “vamos e vemos” ou “planeja tudo”?${warmEnd}`,
        `Sem enrolar${hookBit}: você é mais “improviso” ou “roteiro”?${warmEnd}`,
        `Jogo rápido${hookBit}: você é mais “vai” ou “organiza”?${warmEnd}`,
      ]);
    if (style === "romantico")
      return pick("pq:romantico", [
        `Curiosidade${hookBit}: o que te deixa de bom humor num dia normal?${warmEnd}`,
        `Pergunta leve${hookBit}: qual pequena coisa melhora teu dia na hora?${warmEnd}`,
        `Curiosidade${hookBit}: o que te dá paz num dia corrido?${warmEnd}`,
      ]);
    if (style === "sutil")
      return pick("pq:sutil", [
        `Tá, sem julgamento${hookBit}: você é do time “café” ou “drink”?${warmEnd}`,
        `Sem pressão${hookBit}: você é mais “café” ou “barzinho”?${warmEnd}`,
        `Só pra eu te entender${hookBit}: você é mais “de boa” ou “agitada”?${warmEnd}`,
      ]);
    return pick("pq:engracado", [
      `Ok, preciso saber${hookBit}: você é do time “café” ou “drink”?${warmEnd}`,
      `Me ajuda a te entender${hookBit}: você é mais “calma” ou “caos simpático”?${warmEnd}`,
      `Pergunta importante${hookBit}: você é mais “vou” ou “penso e vou”?${warmEnd}`,
    ]);
  })();

  const humorHook = (() => {
    const start =
      style === "romantico"
        ? "Curti teu jeito."
        : style === "direto"
          ? "Curti teu estilo."
          : "Curti a vibe.";
    if (!hook)
      return pick("hh:nohook", [
        `${start} ${avoidNeediness ? "Qual foi a melhor parte do teu dia hoje?" : "Me dá 30s: qual foi a melhor parte do teu dia hoje?"}${warmEnd}`,
        `${start} ${avoidNeediness ? "Me diz uma coisa: teu dia foi mais paz ou mais caos?" : "Teu dia foi mais paz ou mais caos? Resposta em 1 palavra."}${warmEnd}`,
        `${start} ${avoidNeediness ? "Qual foi o ponto alto do teu dia?" : "Qual foi o ponto alto do teu dia? Versão curta."}${warmEnd}`,
      ]);
    if (style === "direto")
      return pick("hh:direto", [
        `${start} ${hook} é hobby sério ou charme pra enganar distraído?${warmEnd}`,
        `${start} ${hook} é fase ou é traço de personalidade?${warmEnd}`,
        `${start} ${hook} é tua marca registrada ou foi só um dia aleatório?${warmEnd}`,
      ]);
    if (style === "romantico")
      return pick("hh:romantico", [
        `${start} ${hook} parece muito tua cara. Conta a história disso.${warmEnd}`,
        `${start} ${hook} me passou uma vibe boa. Como isso entrou na tua vida?${warmEnd}`,
        `${start} ${hook} me deixou curioso. Qual foi o começo dessa história?${warmEnd}`,
      ]);
    if (style === "sutil")
      return pick("hh:sutil", [
        `${start} ${hook} me deixou curioso. É sempre assim ou foi exceção?${warmEnd}`,
        `${start} ${hook} é rotina tua ou aconteceu por acaso?${warmEnd}`,
        `${start} ${hook} é mais “eu mesmo” ou mais “momento”?${warmEnd}`,
      ]);
    return pick("hh:engracado", [
      `${start} ${hook} foi escolha consciente ou você só é naturalmente interessante assim?${warmEnd}`,
      `${start} ${hook} foi estratégia ou foi só você sendo você?${warmEnd}`,
      `${start} ${hook} foi coincidência ou você coleciona momentos bons?${warmEnd}`,
    ]);
  })();

  const reengage = (() => {
    const noReply = normalizeText(el.noReply?.value);
    const timeBit =
      noReply === "hours"
        ? "Sumiu só um pouco"
        : noReply === "1d"
          ? "Sumiu um dia"
          : noReply === "3d"
            ? "Faz uns dias"
            : noReply === "1w"
              ? "Faz um tempo"
              : "";
    const lead = timeBit ? `${timeBit}. ` : "";
    if (style === "direto")
      return pick("re:direto", [
        `${avoidNeediness ? "Passei rapidinho:" : "Passei aqui pra te roubar 20 segundos:"} ${playfulQuestion}`,
        `${avoidNeediness ? "Ping rápido:" : "Ping rápido (sem roubar muito teu tempo):"} ${playfulQuestion}`,
        `${avoidNeediness ? "Só uma:" : "Só uma pergunta e eu sumo:"} ${playfulQuestion}`,
      ]);
    if (style === "romantico")
      return pick("re:romantico", [
        `${lead}Ei, lembrei de você agora${hook ? ` por causa de ${hook}` : ""}. ${playfulQuestion}`,
        `${lead}Fiquei pensando em você${hook ? ` e em ${hook}` : ""}. ${playfulQuestion}`,
        `${lead}Do nada você me veio na cabeça${hook ? ` por causa de ${hook}` : ""}. ${playfulQuestion}`,
      ]);
    if (style === "sutil")
      return pick("re:sutil", [
        `${lead}Apareci rapidinho${hook ? ` por causa de ${hook}` : ""}. ${playfulQuestion}`,
        `${lead}Surgi aqui do nada${hook ? ` por causa de ${hook}` : ""}. ${playfulQuestion}`,
        `${lead}Passei só pra um teste rápido${hook ? ` sobre ${hook}` : ""}: ${playfulQuestion}`,
      ]);
    return pick("re:engracado", [
      `${lead}Voltei só pra confirmar uma coisa${hook ? ` sobre ${hook}` : ""}: ${playfulQuestion}`,
      `${lead}Ok, eu precisava resolver isso${hook ? ` sobre ${hook}` : ""}: ${playfulQuestion}`,
      `${lead}Eu não ia voltar, mas voltei${hook ? ` por causa de ${hook}` : ""}: ${playfulQuestion}`,
    ]);
  })();

  const escalate = (() => {
    const invite = createInvite({
      place: el.place.value,
      style,
      spice,
      dateType: el.dateType.value,
      when: el.dateWhen?.value,
      time: el.dateTime?.value,
    });
    if (style === "direto") return `Curti a conversa. ${invite}`;
    if (style === "romantico") return `Tô curtindo falar com você. ${invite}`;
    if (style === "sutil") return `A conversa tá boa. ${invite}`;
    return spice === "high" ? `Tá divertido aqui. ${invite} Sem pressão.` : `Tá divertido aqui. ${invite}`;
  })();

  const answerAndPush = (() => {
    if (!chat.lastHer) return humorHook;
    if (/\?$/.test(chat.lastHer.trim())) {
      const opener = pick("aap:opener", ["Boa.", "Boa pergunta.", "Justo."]);
      return `${opener} Eu sou mais ${spice === "high" ? "“vamos e vemos”" : "“equilíbrio entre caos e paz”"}. E você?${warmEnd}`;
    }
    if (energy === "low")
      return pick("aap:low", [
        `${humorHook} Me dá uma dica: o que você curte fazer no tempo livre?${warmEnd}`,
        `${humorHook} Tá, agora eu fiquei curioso: qual rolê você topa fácil?${warmEnd}`,
        `${humorHook} Pergunta de 1 linha: qual tua receita pra um dia bom?${warmEnd}`,
      ]);
    if (energy === "mid")
      return pick("aap:mid", [
        `${humorHook} E você, qual é a tua assinatura: mais caos ou mais paz?${warmEnd}`,
        `${humorHook} E você é mais “paz” ou “aventura”?${warmEnd}`,
        `${humorHook} Se eu tivesse que adivinhar tua vibe em 1 frase, qual seria?${warmEnd}`,
      ]);
    return pick("aap:high", [
      `${humorHook} Agora eu quero a versão completa: como isso começou?${warmEnd}`,
      `${humorHook} Tá, conta direito: qual foi o plot twist dessa história?${warmEnd}`,
      `${humorHook} Agora eu quero a cena completa. Como foi?${warmEnd}`,
    ]);
  })();

  const microGame = (() => {
    const lead = pick("mg:lead", ["Jogo rápido:", "Teste rápido:", "Escolha difícil:"]);
    const q = pick("mg:q", [
      "café de 40 min ou drink de 1 hora?",
      "rolê de tarde ou rolê à noite?",
      "paz e risada ou aventura e caos simpático?",
    ]);
    const end = pick("mg:end", ["Eu aposto no simples.", "Eu vou no de boa.", "Eu vou no curto e bom."]);
    return `${lead} ${q} ${end}${warmEnd}`;
  })();

  const cSmart = /\?$/.test(normalizeText(chat.lastHer))
    ? answerAndPush
    : microGame;

  if (goal === "reengajar" || lastFromMe) {
    return [
      {
        key: "A",
        text: reengage,
        why: "Reentrada leve e rápida. Dá saída fácil e abre espaço sem cobrança.",
      },
      {
        key: "B",
        text: humorHook,
        why: "Resgata vibe com humor + curiosidade. Bom quando a conversa esfriou.",
      },
      {
        key: "C",
        text: microGame,
        why: "Mini-jogo com resposta fácil. Puxa pra proposta sem parecer cobrança.",
      },
    ];
  }

  if (goal === "encontro" && haveTurns) {
    return [
      {
        key: "A",
        text: escalate,
        why: "Convite curto e concreto. Você fecha enquanto a energia está boa, sem vender demais.",
      },
      {
        key: "B",
        text: `${answerAndPush}\n\nSe a gente se der bem ao vivo, melhor ainda. ${createInvite({
          place: el.place.value,
          style: "sutil",
          spice,
          dateType: el.dateType.value,
          when: el.dateWhen?.value,
          time: el.dateTime?.value,
        })}`,
        why: "Você mantém conexão e já faz a ponte pro ao vivo de um jeito natural.",
      },
      {
        key: "C",
        text: `Você é mais time “café de 40 min” ou “drink de 1 hora”? Eu tô indo no simples.${warmEnd}`,
        why: "Micro-jogo divertido que encaminha pro convite sem parecer formal.",
      },
    ];
  }

  if (goal === "destravar") {
    return [
      {
        key: "A",
        text: humorHook,
        why: "Quebra o gelo com um gancho específico e subtexto leve.",
      },
      {
        key: "B",
        text: playfulQuestion,
        why: "Pergunta binária e divertida: mais chance de resposta rápida.",
      },
      {
        key: "C",
        text: cSmart,
        why: "Se ela perguntou algo, você responde e puxa. Se não, você cria ritmo sem virar entrevista.",
      },
    ];
  }

  return [
    {
      key: "A",
      text: humorHook,
      why: "Ideal pra criar conexão sem parecer entrevista: humor + curiosidade.",
    },
    {
      key: "B",
      text: playfulQuestion,
      why: "Você cria ritmo e personalidade. Bom quando você quer resposta rápida.",
    },
    {
      key: "C",
      text: cSmart,
      why: "Se ela perguntou algo, você responde e puxa. Se não, você cria ritmo e convite implícito com saída fácil.",
    },
  ];
}

function buildInstagramOptions({ goal, style, spice, avoidSet, storyText }) {
  const seed = Number(variationIndex ?? 0);
  const pick = (salt, variants) => variants[(hashStringToInt(`ig:${seed}:${salt}`) >>> 0) % variants.length];

  const warm = avoidSet.has("frio");
  const avoidNeediness = avoidSet.has("carente");
  const warmEnd = warm ? " :)" : "";

  const story = normalizeText(storyText);
  const brief = briefStory(story);
  const topic = detectIGTopic(story);
  const storyBit = brief
    ? pick("story:brief", [
        `Vi teu story: “${brief}”. `,
        `Passei no teu story e vi: “${brief}”. `,
        `Ok, vi teu story: “${brief}”. `,
      ])
    : pick("story:nobrief", ["Vi teu story. ", "Passei no teu story. ", "Vi teu story agora. "]);

  const qBase = topic?.q || "qual foi a melhor parte disso?";
  const tease = (() => {
    if (style === "direto") return pick("tease:direto", ["Você tem cara de quem", "Você tem muito cara de quem", "Você é bem do tipo que"]);
    if (style === "romantico") return pick("tease:romantico", ["Isso tem muito a tua vibe…", "Isso tem a tua cara…", "Isso tem uma energia muito tua…"]);
    if (style === "sutil")
      return pick("tease:sutil", [
        "Tá, eu preciso perguntar uma coisa:",
        "Sem pressão, mas eu preciso perguntar:",
        "Ok, pergunta rápida:",
      ]);
    return pick("tease:engracado", ["Ok, confesso que eu ri aqui:", "Eu ri aqui, sério:", "Tá, eu fui fisgado:"]);
  })();

  const a = (() => {
    const q = qBase.charAt(0).toUpperCase() + qBase.slice(1);
    if (style === "direto")
      return pick("a:direto", [
        `${storyBit}${avoidNeediness ? "Pergunta rápida:" : "Pergunta rápida pra eu te entender:"} ${qBase}${warmEnd}`,
        `${storyBit}${avoidNeediness ? "Rápida:" : "Rápida e eu paro:"} ${qBase}${warmEnd}`,
        `${storyBit}${avoidNeediness ? "Só uma:" : "Só uma e eu saio:"} ${qBase}${warmEnd}`,
      ]);
    if (style === "romantico") return pick("a:romantico", [`${storyBit}Eu curti. ${q}${warmEnd}`, `${storyBit}Ficou lindo. ${q}${warmEnd}`, `${storyBit}Curti a energia. ${q}${warmEnd}`]);
    if (style === "sutil") return pick("a:sutil", [`${storyBit}${q}${warmEnd}`, `${storyBit}${q} (curiosa)${warmEnd}`, `${storyBit}${q} rapidinho${warmEnd}`]);
    return pick("a:engracado", [`${storyBit}${avoidNeediness ? "" : "Me dá 15s: "}${qBase}${warmEnd}`, `${storyBit}${avoidNeediness ? "" : "Me dá 10s: "}${qBase}${warmEnd}`, `${storyBit}${q}${warmEnd}`]);
  })();

  const b = (() => {
    const p = spice === "high" ? pick("b:p", ["sem pressão,", "sem compromisso,", "de leve,"]) : "";
    if (style === "direto")
      return pick("b:direto", [
        `${storyBit}${tease} escolhe bem lugares. ${p} me diz: isso foi planejado ou foi “bateu e fui”?${warmEnd}`,
        `${storyBit}${tease} manda bem no rolê. ${p} isso foi “organizei” ou “só fui”?${warmEnd}`,
        `${storyBit}${tease} sabe viver. ${p} isso foi planejado ou foi impulso?${warmEnd}`,
      ]);
    if (style === "romantico")
      return pick("b:romantico", [
        `${storyBit}${tease} ${p} você é mais do tipo “vivo o momento” ou “planejo tudo”?${warmEnd}`,
        `${storyBit}${tease} ${p} você é mais “momento” ou “roteiro”?${warmEnd}`,
        `${storyBit}${tease} ${p} você curte mais “calma” ou “aventura”?${warmEnd}`,
      ]);
    if (style === "sutil")
      return pick("b:sutil", [
        `${storyBit}${tease} ${p} você posta e some, ou conversa de boas?${warmEnd}`,
        `${storyBit}${tease} ${p} você é mais de aparecer e sumir ou de trocar ideia?${warmEnd}`,
        `${storyBit}${tease} ${p} você é mais “story e vaza” ou “story e conversa”?${warmEnd}`,
      ]);
    return pick("b:engracado", [
      `${storyBit}${tease} ${p} isso foi um flex ou foi só um dia normal teu?${warmEnd}`,
      `${storyBit}${tease} ${p} isso foi raro ou você vive assim mesmo?${warmEnd}`,
      `${storyBit}${tease} ${p} isso foi “vida real” ou “melhores momentos”?${warmEnd}`,
    ]);
  })();

  const c = (() => {
    if (goal === "reengajar")
      return pick("c:re", [
        `${storyBit}Passei só pra dizer que isso ficou massa. E aí, como foi?${warmEnd}`,
        `${storyBit}Isso ficou muito bom. Me conta: foi do jeito que você queria?${warmEnd}`,
        `${storyBit}Curti. Me diz: qual foi a melhor parte?${warmEnd}`,
      ]);
    if (spice === "high")
      return `${storyBit}Curti. Se a conversa for boa ao vivo, melhor ainda. ${createInvite({
        place: el.place.value,
        style: "sutil",
        spice,
        dateType: el.dateType.value,
        when: el.dateWhen?.value,
        time: el.dateTime?.value,
      })}`;
    return pick("c:rec", [
      `${storyBit}Curti. Se você me der uma recomendação rápida, eu sigo: o que eu “tenho que” fazer/ir aí?${warmEnd}`,
      `${storyBit}Curti. Me dá uma dica rápida: qual rolê aí vale MUITO?${warmEnd}`,
      `${storyBit}Curti. Me recomenda 1 lugar/1 coisa aí sem pensar muito.${warmEnd}`,
    ]);
  })();

  return [
    { key: "A", text: a, why: "Resposta de story + pergunta simples. Maximiza chance de resposta sem parecer carente." },
    { key: "B", text: b, why: "Teasing leve + framing. Cria subtexto e personalidade sem ser invasivo." },
    { key: "C", text: c, why: "Abre espaço pra história/recomendação e acelera conexão quando ela engata." },
  ];
}

function buildSteps({ goal, context }) {
  const steps = [];
  if (context === "apps") {
    steps.push("Pegue 1 detalhe específico do perfil e faça uma pergunta leve (não entrevista).");
    steps.push("Alterna: 1 linha de humor + 1 linha genuína. Mostra presença.");
    steps.push("Se ela responder bem 2–3 vezes, avance com convite simples e concreto.");
  } else if (context === "instagram") {
    steps.push("Abra pelo story: responda algo específico (sem elogio genérico).");
    steps.push("Traga uma pergunta curta que facilita resposta (simples e divertida).");
    steps.push("Se ela engajar (2–3 trocas boas), proponha áudio curto ou migrar pro WhatsApp com naturalidade.");
  } else if (context === "whatsapp") {
    steps.push("Use mensagens curtas. Uma ideia por mensagem.");
    steps.push("Se a conversa estiver boa, sugira áudio curto ou uma ligação rápida.");
    steps.push("Convite direto quando estiver natural: dia + lugar + duração curta.");
  } else {
    steps.push("Comece com observação do ambiente + pergunta fácil.");
    steps.push("Use humor leve e contato visual. Escuta antes de impressionar.");
    steps.push("Feche com troca de contato quando a energia estiver boa.");
  }

  if (goal === "encontro") {
    steps.push("Convite: algo curto e fácil. Não venda demais, não explique demais.");
    steps.push("Logística: duas opções de dia/horário e um lugar simples.");
    steps.push("Lugar bom: perto, fácil de estacionar/chegar, com barulho ok e ‘saída fácil’ (40–70 min).");
  } else if (goal === "reengajar") {
    steps.push("Reengaje com leveza e saída fácil. Sem cobrança.");
    steps.push("Se ela responder seco de novo, finalize com classe e siga.");
  } else if (goal === "destravar") {
    steps.push("Troque o assunto para algo concreto: gosto, hábito, história.");
    steps.push("Se ela der sinais (perguntas, risada, detalhes), você sobe o flerte.");
  } else {
    steps.push("Depois de 4–6 trocas boas, proponha migrar pra WhatsApp/Instagram ou marcar algo.");
  }

  return steps;
}

function buildPrompt({ goal, context, style, spice, avoidSet, profile, igStory, lastHer, chat, noReply, place, dateType, budget, dateWhen, dateTime }) {
  const goalText =
    goal === "encontro"
      ? "marcar um encontro simples e próximo"
      : goal === "destravar"
        ? "destravar a conversa e aumentar interesse"
        : goal === "reengajar"
          ? "reengajar com leveza sem cobrar"
          : "conhecer e criar conexão rápida";

  const contextText =
    context === "apps" ? "apps de namoro" : context === "instagram" ? "Instagram (DM/stories)" : context === "whatsapp" ? "WhatsApp/DM" : "ao vivo";

  const noReplyText =
    normalizeText(noReply) === "hours"
      ? "algumas horas"
      : normalizeText(noReply) === "1d"
        ? "1 dia"
        : normalizeText(noReply) === "3d"
          ? "2–3 dias"
          : normalizeText(noReply) === "1w"
            ? "1 semana+"
            : "";

  const header = [
    "Você é um especialista em comportamento humano, atração, comunicação social e dinâmica de relacionamentos.",
    "Sua função não é apenas sugerir frases, mas desenvolver estratégias inteligentes, naturais e adaptáveis para interações com mulheres, focando em atração genuína, conexão emocional e posicionamento de valor.",
    "",
    "Princípios obrigatórios:",
    "1) Evite respostas genéricas, clichês ou artificiais.",
    "2) Sempre analise o contexto antes de sugerir qualquer resposta.",
    "3) Priorize autenticidade, leveza e inteligência social acima de técnicas prontas.",
    "4) Identifique sinais de interesse/desinteresse/neutralidade e adapte a estratégia.",
    "5) Trabalhe com progressão: abertura → conexão → tensão leve → convite.",
    "6) Use humor, provocação leve e curiosidade como ferramentas principais.",
    "7) Nunca sugira comportamentos carentes/insistentes que diminuam o valor do usuário.",
    "8) Ensine o raciocínio por trás das sugestões.",
    "",
    `Objetivo: ${goalText}.`,
    `Contexto: ${contextText}.`,
    `Tom: ${styleTone(style)}.`,
    `Ousadia: ${spice === "high" ? "ousado" : spice === "low" ? "leve" : "médio"}.`,
    `Evitar: ${avoidRule(avoidSet)}.`,
    goal === "reengajar" && noReplyText ? `Tempo sem resposta: ${noReplyText}.` : "",
    "",
    "Formato de resposta (obrigatório):",
    "1) Análise da situação",
    "2) O que está acontecendo (nível de interesse dela)",
    "3) Erros potenciais do usuário",
    "4) Melhor estratégia",
    "5) Sugestão prática de resposta (A/B/C)",
    "6) Explicação do porquê",
    "",
    "Entregue 3 opções A/B/C de próxima mensagem curtas e naturais, e diga qual é a melhor e por quê.",
  ].join("\n");

  const details = [
    "",
    "Perfil dela:",
    profile ? clamp(profile, 700) : "(vazio)",
    "",
    "Instagram (story/assunto que vou responder):",
    igStory ? clamp(igStory, 360) : "(vazio)",
    "",
    "Última mensagem dela (se tiver):",
    lastHer ? clamp(lastHer, 220) : "(vazio)",
    "",
    "Conversa:",
    chat ? clamp(chat, 1600) : "(vazio)",
  ];

  const placeBit = normalizeText(place) ? ["", `Local: ${clamp(place, 80)}`] : [];
  const whenText = formatWhen({ when: dateWhen, time: dateTime });
  const whenBit = whenText ? ["", `Quando: ${clamp(whenText, 80)}`] : [];
  const datePrefs = [
    "",
    `Preferência de encontro: ${describeDateType(dateType)}.`,
    `Orçamento: ${budget}.`,
  ];

  return [header, ...details, ...placeBit, ...whenBit, ...datePrefs].join("\n");
}

function setOptions(options, { recommendedKey, showAll = true } = {}) {
  el.options.innerHTML = "";
  const list = showAll || !recommendedKey ? options : options.filter((o) => o.key === recommendedKey);
  for (const opt of list) {
    const wrap = document.createElement("div");
    wrap.className = opt.recommended ? "optionCard winner" : "optionCard";
    wrap.dataset.text = normalizeText(opt.text);

    const header = document.createElement("div");
    header.className = "optionHeader";

    const badge = document.createElement("div");
    badge.className = "badge";
    badge.textContent = opt.key;

    if (opt.recommended) {
      const tag = document.createElement("span");
      tag.className = "winnerTag";
      tag.textContent = opt.rank ? `Vencedora #${opt.rank}` : "Vencedora";
      badge.appendChild(tag);
    }

    const actions = document.createElement("div");
    actions.className = "optionActions";

    const copy = document.createElement("button");
    copy.type = "button";
    copy.className = "ghost";
    copy.textContent = "Copiar";
    copy.addEventListener("click", async () => {
      await copyText(wrap.dataset.text);
      copy.textContent = "Copiado";
      setTimeout(() => (copy.textContent = "Copiar"), 900);
    });

    const shorten = document.createElement("button");
    shorten.type = "button";
    shorten.className = "ghost";
    shorten.textContent = "Encurtar";

    actions.appendChild(copy);
    actions.appendChild(shorten);
    header.appendChild(badge);
    header.appendChild(actions);

    const text = document.createElement("div");
    text.className = "optionText";
    text.textContent = wrap.dataset.text;

    const meta = document.createElement("div");
    meta.className = "optionMeta";
    meta.textContent = opt.why ? `Por quê: ${opt.why}` : "";

    const warnRow = document.createElement("div");
    warnRow.className = "warnRow";
    meta.appendChild(warnRow);

    const renderWarnings = () => {
      warnRow.innerHTML = "";
      const warnings = assessMessage(wrap.dataset.text);
      for (const w of warnings) {
        const chip = document.createElement("div");
        chip.className = "warnChip";
        chip.textContent = w;
        warnRow.appendChild(chip);
      }
      const hasMeta = Boolean(opt.why) || warnings.length > 0;
      meta.classList.toggle("hidden", !hasMeta);
      shorten.classList.toggle("hidden", warnings.length === 0);
    };

    shorten.addEventListener("click", () => {
      const shortened = shortenMessage(wrap.dataset.text);
      if (!shortened) return;
      wrap.dataset.text = shortened;
      text.textContent = shortened;
      renderWarnings();
    });

    renderWarnings();

    wrap.appendChild(header);
    wrap.appendChild(text);
    wrap.appendChild(meta);
    el.options.appendChild(wrap);
  }
}

async function copyText(text) {
  const value = normalizeText(text);
  if (!value) return;
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(value);
    return;
  }
  const ta = document.createElement("textarea");
  ta.value = value;
  ta.style.position = "fixed";
  ta.style.left = "-9999px";
  ta.style.top = "0";
  document.body.appendChild(ta);
  ta.focus();
  ta.select();
  document.execCommand("copy");
  document.body.removeChild(ta);
}

function buildWhatsAppUrl(text) {
  const value = normalizeText(text);
  if (!value) return "";
  return `https://wa.me/?text=${encodeURIComponent(value)}`;
}

function openWhatsApp(text) {
  const url = buildWhatsAppUrl(text);
  if (!url) return;
  const w = window.open(url, "_blank", "noopener,noreferrer");
  if (!w) window.location.href = url;
}

function renderSteps(steps) {
  el.steps.innerHTML = "";
  for (const step of steps) {
    const li = document.createElement("li");
    li.textContent = step;
    el.steps.appendChild(li);
  }
}

function getAvoidSet() {
  const set = new Set();
  if (el.avoidFrio?.checked) set.add("frio");
  if (el.avoidCarente?.checked) set.add("carente");
  if (el.avoidInvasivo?.checked) set.add("invasivo");
  if (el.avoidCringe?.checked) set.add("cringe");
  return set;
}

function describeDateType(dateType) {
  if (dateType === "bar") return "bar/wine bar";
  if (dateType === "sorvete") return "sorveteria";
  if (dateType === "parque") return "parque + café por perto";
  if (dateType === "restaurante") return "restaurante simples";
  return "café";
}

function budgetHints(budget) {
  if (budget === "baixo") return "bom custo-benefício; sem compromisso";
  if (budget === "alto") return "um pouco mais arrumado; experiência";
  return "confortável; sem exagero";
}

function suggestPlaces({ place, dateType, budget }) {
  const where = normalizeText(place);
  const neighborhood = where ? ` em ${where}` : "";
  const base = describeDateType(dateType);

  const items = [];
  items.push({
    title: `${base} com mesas externas${neighborhood}`,
    meta: `Vibe: conversa fácil; ${budgetHints(budget)}\nBuscar: “${base} mesa externa${where ? " " + where : ""}”`,
  });
  items.push({
    title: `${base} perto de metrô/estacionamento${neighborhood}`,
    meta: `Vibe: logística simples, menos chance de desmarcar\nBuscar: “${base} perto metrô${where ? " " + where : ""}”`,
  });
  items.push({
    title: `${base} com ambiente não muito barulhento${neighborhood}`,
    meta: `Vibe: dá pra conversar e criar conexão\nBuscar: “${base} ambiente calmo${where ? " " + where : ""}”`,
  });
  return items;
}

function setPlacesOnlineStatus(text) {
  el.placesOnlineStatus.textContent = text ?? "";
}

let selectedOnlinePlace = null;

function renderOnlinePlaces(items) {
  el.placesOnlineList.innerHTML = "";
  selectedOnlinePlace = null;
  for (let idx = 0; idx < items.length; idx += 1) {
    const item = items[idx];
    const wrap = document.createElement("div");
    wrap.className = "placeItem";

    const title = document.createElement("div");
    title.className = "placeItemTitle";
    title.textContent = item.title;

    if (idx < 3) {
      const tag = document.createElement("span");
      tag.className = "winnerTag";
      tag.textContent = `Vencedor #${idx + 1}`;
      title.appendChild(tag);
    }

    const meta = document.createElement("div");
    meta.className = "placeItemMeta";
    meta.textContent = item.meta;

    const actions = document.createElement("div");
    actions.className = "placeItemActions";

    const open = document.createElement("a");
    open.className = "placeBtn primary";
    open.href = item.mapsUrl;
    open.target = "_blank";
    open.rel = "noopener noreferrer";
    open.textContent = "Abrir no Maps";

    const use = document.createElement("button");
    use.type = "button";
    use.className = "placeBtn";
    use.textContent = "Usar";
    use.addEventListener("click", () => {
      selectedOnlinePlace = item;
      setPlacesOnlineStatus(`Selecionado: ${item.title}`);
      use.textContent = "Selecionado";
      setTimeout(() => (use.textContent = "Usar"), 1100);
    });

    const copyInvite = document.createElement("button");
    copyInvite.type = "button";
    copyInvite.className = "placeBtn";
    copyInvite.textContent = "Convite";
    copyInvite.addEventListener("click", async () => {
      const invite = createInviteForPlace({
        placeTitle: item.title,
        style: el.style.value,
        spice: el.spice.value,
        dateType: el.dateType.value,
        when: el.dateWhen?.value,
        time: el.dateTime?.value,
      });
      const text = [invite, item.mapsUrl].filter(Boolean).join("\n");
      await copyText(text);
      copyInvite.textContent = "Copiado";
      setTimeout(() => (copyInvite.textContent = "Convite"), 900);
    });

    const copy = document.createElement("button");
    copy.type = "button";
    copy.className = "placeBtn";
    copy.textContent = "Copiar";
    copy.addEventListener("click", async () => {
      await copyText(item.copyText);
      copy.textContent = "Copiado";
      setTimeout(() => (copy.textContent = "Copiar"), 900);
    });

    actions.appendChild(open);
    actions.appendChild(copyInvite);
    actions.appendChild(use);
    actions.appendChild(copy);

    wrap.appendChild(title);
    wrap.appendChild(meta);
    wrap.appendChild(actions);
    el.placesOnlineList.appendChild(wrap);
  }
}

function mapTypeForOverpass(dateType) {
  if (dateType === "bar") return { mode: "amenity", value: "bar", label: "bar" };
  if (dateType === "sorvete") return { mode: "amenity", value: "ice_cream", label: "sorveteria" };
  if (dateType === "parque") return { mode: "leisure", value: "park", label: "parque" };
  if (dateType === "restaurante") return { mode: "amenity", value: "restaurant", label: "restaurante" };
  return { mode: "amenity", value: "cafe", label: "café" };
}

function normalizeProvider(provider) {
  const p = normalizeText(provider);
  if (p === "google") return "google";
  if (p === "osm") return "osm";
  return "auto";
}

function getEffectiveProvider() {
  const provider = normalizeProvider(el.placesProvider?.value);
  if (provider === "google") return "google";
  if (provider === "osm") return "osm";
  const key = normalizeText(el.googleApiKey?.value);
  return key ? "google" : "osm";
}

function safeTag(tags, key) {
  if (!tags) return "";
  const v = tags[key];
  return typeof v === "string" ? v : "";
}

function formatAddress(tags) {
  const street = safeTag(tags, "addr:street");
  const number = safeTag(tags, "addr:housenumber");
  const suburb = safeTag(tags, "addr:suburb") || safeTag(tags, "suburb");
  const city = safeTag(tags, "addr:city");
  const parts = [];
  const line1 = [street, number].filter(Boolean).join(", ");
  if (line1) parts.push(line1);
  if (suburb) parts.push(suburb);
  if (city) parts.push(city);
  return parts.join(" • ");
}

function scorePlace(tags) {
  let s = 0;
  const name = safeTag(tags, "name");
  if (name) s += 3;
  if (safeTag(tags, "opening_hours")) s += 1;
  if (safeTag(tags, "website") || safeTag(tags, "contact:website")) s += 1;
  if (safeTag(tags, "phone") || safeTag(tags, "contact:phone")) s += 1;
  if (safeTag(tags, "addr:street")) s += 1;
  if (safeTag(tags, "outdoor_seating") === "yes") s += 1;
  if (safeTag(tags, "wheelchair") === "yes") s += 1;
  return s;
}

async function geocodePlace(query) {
  const q = normalizeText(query);
  if (!q) return null;
  const url = `https://nominatim.openstreetmap.org/search?format=json&limit=1&addressdetails=1&q=${encodeURIComponent(q)}`;
  const res = await fetch(url, { headers: { Accept: "application/json" } });
  if (!res.ok) return null;
  const data = await res.json();
  const top = Array.isArray(data) ? data[0] : null;
  if (!top) return null;
  const lat = Number(top.lat);
  const lon = Number(top.lon);
  if (!Number.isFinite(lat) || !Number.isFinite(lon)) return null;
  return {
    lat,
    lon,
    displayName: typeof top.display_name === "string" ? top.display_name : q,
  };
}

async function overpassPlaces({ lat, lon, dateType, radiusMeters }) {
  const { mode, value } = mapTypeForOverpass(dateType);
  const q = [
    "[out:json][timeout:25];",
    "(",
    `node(around:${radiusMeters},${lat},${lon})[${mode}=${value}];`,
    `way(around:${radiusMeters},${lat},${lon})[${mode}=${value}];`,
    `relation(around:${radiusMeters},${lat},${lon})[${mode}=${value}];`,
    ");",
    "out center tags 60;",
  ].join("\n");

  const res = await fetch("https://overpass-api.de/api/interpreter", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8" },
    body: `data=${encodeURIComponent(q)}`,
  });
  if (!res.ok) return [];
  const data = await res.json();
  const elements = Array.isArray(data?.elements) ? data.elements : [];
  return elements;
}

function buildMapsUrl({ name, address, fallbackQuery }) {
  const q = [name, address].filter(Boolean).join(" ");
  const query = q || fallbackQuery;
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
}

function getCachedPlaceSearch(cacheKey) {
  try {
    const raw = localStorage.getItem(PLACE_SEARCH_CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return null;
    const item = parsed[cacheKey];
    if (!item || typeof item !== "object") return null;
    if (Date.now() - Number(item.ts) > 1000 * 60 * 60 * 6) return null;
    if (!Array.isArray(item.results)) return null;
    return item.results;
  } catch {
    return null;
  }
}

function setCachedPlaceSearch(cacheKey, results) {
  try {
    const raw = localStorage.getItem(PLACE_SEARCH_CACHE_KEY);
    const parsed = raw ? JSON.parse(raw) : {};
    const next = typeof parsed === "object" && parsed ? parsed : {};
    next[cacheKey] = { ts: Date.now(), results };
    localStorage.setItem(PLACE_SEARCH_CACHE_KEY, JSON.stringify(next));
  } catch {}
}

let placesFetchBusy = false;
async function fetchOnlinePlacesOSM({ where, dateType, budget, cacheKey }) {
  const cached = getCachedPlaceSearch(cacheKey);
  if (cached) {
    setPlacesOnlineStatus("Resultados online (cache local).");
    renderOnlinePlaces(cached);
    return;
  }

  setPlacesOnlineStatus("Buscando lugares online (OpenStreetMap)…");

  const geo = await geocodePlace(where);
  if (!geo) {
    setPlacesOnlineStatus("Não consegui localizar esse bairro/cidade. Tente algo como “Moema, São Paulo”.");
    renderOnlinePlaces([]);
    return;
  }

  const radiusMeters = budget === "alto" ? 2500 : budget === "baixo" ? 1200 : 1800;
  const elements = await overpassPlaces({ lat: geo.lat, lon: geo.lon, dateType, radiusMeters });

  const seen = new Set();
  const results = elements
    .map((e) => {
      const tags = e.tags ?? {};
      const name = safeTag(tags, "name");
      const address = formatAddress(tags);
      const opening = safeTag(tags, "opening_hours");
      const website = safeTag(tags, "contact:website") || safeTag(tags, "website");
      const phone = safeTag(tags, "contact:phone") || safeTag(tags, "phone");
      const outdoor = safeTag(tags, "outdoor_seating");
      const score = scorePlace(tags);

      const title = name || `${mapTypeForOverpass(dateType).label} (sem nome)`;
      const metaParts = [];
      if (address) metaParts.push(address);
      if (opening) metaParts.push(`Horários: ${opening}`);
      if (website) metaParts.push(website);
      if (phone) metaParts.push(phone);
      if (outdoor === "yes") metaParts.push("Mesa externa");
      metaParts.push("Dica: confira nota e fotos no Maps antes de decidir.");

      const mapsUrl = buildMapsUrl({ name: title, address, fallbackQuery: `${title} ${where}` });
      const copyTextValue = [title, address, mapsUrl].filter(Boolean).join("\n");
      const dedupeKey = `${title}__${address}`.toLowerCase();
      return { title, meta: metaParts.join("\n"), mapsUrl, copyText: copyTextValue, score, dedupeKey };
    })
    .filter((x) => {
      if (seen.has(x.dedupeKey)) return false;
      seen.add(x.dedupeKey);
      return true;
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, 12)
    .map(({ title, meta, mapsUrl, copyText }) => ({ title, meta, mapsUrl, copyText }));

  if (!results.length) {
    setPlacesOnlineStatus("Não achei opções suficientes. Tente outro bairro/cidade ou aumente o raio (Orçamento alto).");
    renderOnlinePlaces([]);
    return;
  }

  setPlacesOnlineStatus(`Resultados online (OpenStreetMap) próximos de: ${geo.displayName}`);
  renderOnlinePlaces(results);
  setCachedPlaceSearch(cacheKey, results);
}

function priceLevelToNumber(priceLevel) {
  if (priceLevel === "PRICE_LEVEL_INEXPENSIVE") return 1;
  if (priceLevel === "PRICE_LEVEL_MODERATE") return 2;
  if (priceLevel === "PRICE_LEVEL_EXPENSIVE") return 3;
  if (priceLevel === "PRICE_LEVEL_VERY_EXPENSIVE") return 4;
  return 0;
}

function priceLevelLabel(n) {
  if (n === 1) return "$";
  if (n === 2) return "$$";
  if (n === 3) return "$$$";
  if (n === 4) return "$$$$";
  return "";
}

function budgetTarget(budget) {
  if (budget === "baixo") return 1.5;
  if (budget === "alto") return 3.5;
  return 2.5;
}

function googleTypeQuery(dateType) {
  if (dateType === "bar") return "bar";
  if (dateType === "sorvete") return "sorveteria";
  if (dateType === "parque") return "parque";
  if (dateType === "restaurante") return "restaurante";
  return "café";
}

async function googleSearchText({ apiKey, textQuery, locationBias }) {
  const res = await fetch("https://places.googleapis.com/v1/places:searchText", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Goog-Api-Key": apiKey,
      "X-Goog-FieldMask": "places.id,places.displayName,places.formattedAddress,places.rating,places.userRatingCount,places.priceLevel",
    },
    body: JSON.stringify({
      textQuery,
      languageCode: "pt-BR",
      ...(locationBias ? { locationBias } : {}),
    }),
  });
  const data = await res.json().catch(() => null);
  if (!res.ok) {
    const msg = normalizeText(data?.error?.message) || "Erro ao buscar no Google Places.";
    throw new Error(msg);
  }
  return data;
}

async function fetchOnlinePlacesGoogle({ where, dateType, budget, cacheKey }) {
  const apiKey = normalizeText(el.googleApiKey?.value);
  if (!apiKey) {
    setPlacesOnlineStatus("Cole sua chave do Google Places para usar essa busca.");
    renderOnlinePlaces([]);
    return;
  }

  const cached = getCachedPlaceSearch(cacheKey);
  if (cached) {
    setPlacesOnlineStatus("Resultados online (cache local).");
    renderOnlinePlaces(cached);
    return;
  }

  setPlacesOnlineStatus("Buscando lugares online (Google Places)…");

  const geo = await geocodePlace(where);
  const locationBias = geo
    ? {
        circle: {
          center: { latitude: geo.lat, longitude: geo.lon },
          radius: budget === "alto" ? 3500 : budget === "baixo" ? 1600 : 2400,
        },
      }
    : null;

  const query = `${googleTypeQuery(dateType)} ${where}`;
  const data = await googleSearchText({ apiKey, textQuery: query, locationBias });

  const places = Array.isArray(data?.places) ? data.places : [];
  const results = places
    .map((p) => {
      const id = normalizeText(p?.id);
      const title = normalizeText(p?.displayName?.text) || "Lugar";
      const address = normalizeText(p?.formattedAddress);
      const rating = Number(p?.rating);
      const ratingCount = Number(p?.userRatingCount);
      const priceN = priceLevelToNumber(normalizeText(p?.priceLevel));

      const ratingOk = Number.isFinite(rating) ? rating : 0;
      const countOk = Number.isFinite(ratingCount) ? ratingCount : 0;
      const priceOk = Number.isFinite(priceN) ? priceN : 0;

      const target = budgetTarget(budget);
      const priceDist = priceOk ? Math.abs(priceOk - target) : 0.8;
      const priceBonus = priceOk ? Math.max(0, 1.1 - priceDist) : 0.2;
      const countBoost = Math.log10(countOk + 1);
      const score = ratingOk * 2 + countBoost + priceBonus;

      const priceLabel = priceOk ? ` • ${priceLevelLabel(priceOk)}` : "";
      const ratingLabel = ratingOk ? `★ ${ratingOk.toFixed(1)} (${countOk || 0})${priceLabel}` : `Sem nota${priceLabel}`;

      const mapsUrl = id
        ? `https://www.google.com/maps/search/?api=1&query_place_id=${encodeURIComponent(id)}&query=${encodeURIComponent(title)}`
        : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${title} ${where}`)}`;

      const meta = [
        ratingLabel,
        address || where,
        "Dica: veja fotos recentes, horário e distância antes de confirmar.",
      ].join("\n");

      const copyTextValue = [title, address, mapsUrl].filter(Boolean).join("\n");

      return { title, meta, mapsUrl, copyText: copyTextValue, score };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, 12)
    .map(({ title, meta, mapsUrl, copyText }) => ({ title, meta, mapsUrl, copyText }));

  if (!results.length) {
    setPlacesOnlineStatus("Não encontrei resultados suficientes no Google Places. Tente outro bairro/cidade.");
    renderOnlinePlaces([]);
    return;
  }

  setPlacesOnlineStatus(`Resultados online (Google Places) para: ${where}`);
  renderOnlinePlaces(results);
  setCachedPlaceSearch(cacheKey, results);
}

async function fetchOnlinePlaces() {
  if (placesFetchBusy) return;
  placesFetchBusy = true;
  try {
    const where = normalizeText(el.place.value);
    if (!where) {
      setPlacesOnlineStatus("Preencha cidade/bairro pra buscar lugares próximos.");
      renderOnlinePlaces([]);
      return;
    }

    const dateType = el.dateType.value;
    const budget = el.budget.value;
    const provider = getEffectiveProvider();
    const cacheKey = `${provider}__${where}__${dateType}__${budget}`;

    if (provider === "google") {
      await fetchOnlinePlacesGoogle({ where, dateType, budget, cacheKey });
      return;
    }

    await fetchOnlinePlacesOSM({ where, dateType, budget, cacheKey });
  } catch {
    setPlacesOnlineStatus("Não deu pra buscar online agora (rede/CORS/limite). Você ainda pode usar as sugestões por categoria.");
    renderOnlinePlaces([]);
  } finally {
    placesFetchBusy = false;
  }
}

function renderPlaces(items) {
  el.placesList.innerHTML = "";
  for (const item of items) {
    const wrap = document.createElement("div");
    wrap.className = "placeItem";

    const title = document.createElement("div");
    title.className = "placeItemTitle";
    title.textContent = item.title;

    const meta = document.createElement("div");
    meta.className = "placeItemMeta";
    meta.textContent = item.meta;

    wrap.appendChild(title);
    wrap.appendChild(meta);
    el.placesList.appendChild(wrap);
  }
}

function renderDiagnosis(diag) {
  el.diagStage.textContent = stageLabel(diag.stage);
  el.diagInterest.textContent = `${interestLabel(diag.interest)} • ${diag.recommendationText}`;

  el.diagSignals.innerHTML = "";
  for (const s of diag.signals) {
    const chip = document.createElement("div");
    chip.className = "diagChip";
    chip.textContent = s;
    el.diagSignals.appendChild(chip);
  }

  el.diagRisks.innerHTML = "";
  for (const r of diag.risks) {
    const chip = document.createElement("div");
    chip.className = "diagChip";
    chip.textContent = r;
    el.diagRisks.appendChild(chip);
  }

  el.diagStrategy.textContent = diag.strategy;
}

function updateHint({ goal, chat, lastHer }) {
  const parts = [];
  const lastHerText = normalizeText(lastHer);
  if (!chat && !lastHerText) {
    parts.push("Cole a conversa com “Eu:” e “Ela:” (ou preencha ‘Última mensagem dela’) pra melhorar as opções.");
  } else {
    const parsed = parseChat(chat, { meName: el.meName?.value, herName: el.herName?.value });
    if (lastHerText) {
      parts.push("Usando ‘Última mensagem dela’ como referência.");
    }
    if (parsed.lastSpeaker === "me") {
      parts.push("Última mensagem foi sua. Recomendo reengajar leve (sem cobrança) ou esperar um pouco.");
    } else if (parsed.lastSpeaker === "her") {
      parts.push("Última mensagem foi dela. Melhor momento pra ser rápido, quente e curioso.");
    }
  }

  if (goal === "encontro") parts.push("Quando ela estiver respondendo bem, convide com duração curta e duas opções de dia.");
  if (goal === "reengajar") {
    const noReply = normalizeText(el.noReply?.value);
    const timeText = noReply === "hours" ? "algumas horas" : noReply === "1d" ? "1 dia" : noReply === "3d" ? "2–3 dias" : "1 semana+";
    parts.push(`Reengajar: leve e sem cobrança. Tempo sem resposta: ${timeText}.`);
  }
  if (normalizeText(el.context?.value) === "instagram") {
    parts.push("No Instagram, responda story com algo específico + pergunta curta (sem elogio genérico).");
  }
  el.inputHint.textContent = parts.join(" ");
}

let generateTimer = null;
function requestGenerate({ immediate = false } = {}) {
  const isMobile = window.matchMedia?.("(max-width: 760px)")?.matches;
  if (immediate || !isMobile) {
    generate();
    return;
  }
  if (generateTimer) window.clearTimeout(generateTimer);
  generateTimer = window.setTimeout(() => {
    generateTimer = null;
    generate();
  }, 550);
}

let scrollToResultsOnce = false;
function generate() {
  updateContextUI();
  updateGoalUI();
  updatePrivacyUI();
  updateVariationsUI();
  updatePlatformUI();
  const goal = el.goal.value;
  const context = el.context.value;
  const style = el.style.value;
  const spice = el.spice.value;
  const avoidSet = getAvoidSet();
  const profile = normalizeText(el.profile.value);
  const igStory = normalizeText(el.igStory?.value);
  const lastHerText = normalizeText(el.lastHer.value);
  const chatText = normalizeText(el.chat.value);
  const place = normalizeText(el.place.value);
  const dateType = el.dateType.value;
  const budget = el.budget.value;

  const hook = extractHook(profile);
  const chat = parseChat(chatText, { meName: el.meName?.value, herName: el.herName?.value });
  if (lastHerText) {
    chat.lastSpeaker = "her";
    chat.lastHer = lastHerText;
  }

  const diag = diagnoseInteraction({ goal, context, style, spice, avoidSet, hook, chat });
  renderDiagnosis(diag);

  const options =
    normalizeText(context) === "instagram" && igStory
      ? buildInstagramOptions({ goal, style, spice, avoidSet, storyText: igStory })
      : buildOptions({ goal, style, spice, avoidSet, hook, chat });
  const winnerSet = new Set(diag.recommendedKeys ?? []);
  const ranked = options.map((o) => o.key).filter((k) => winnerSet.has(k));
  const optionsWithWins = options.map((o) => ({
    ...o,
    recommended: winnerSet.has(o.key),
    rank: winnerSet.has(o.key) ? ranked.indexOf(o.key) + 1 : null,
  }));
  const recommendedOption =
    optionsWithWins.find((o) => o.key === diag.recommendedKeys?.[0]) ??
    optionsWithWins.find((o) => o.recommended) ??
    optionsWithWins[0];
  setOptions(optionsWithWins, { recommendedKey: recommendedOption?.key, showAll: showAllOptions });
  if (el.winnerHint) {
    el.winnerHint.textContent = recommendedOption ? `Recomendação: ${recommendedOption.key}.` : "";
  }
  if (el.copyWinner) {
    el.copyWinner.onclick = async () => {
      if (!recommendedOption) return;
      await copyText(recommendedOption.text);
      el.copyWinner.textContent = "Copiado";
      setTimeout(() => (el.copyWinner.textContent = "Copiar resposta"), 900);
    };
  }
  if (el.openWinnerWhatsApp) {
    el.openWinnerWhatsApp.onclick = () => {
      if (!recommendedOption) return;
      openWhatsApp(recommendedOption.text);
    };
  }

  const steps = buildSteps({ goal, context });
  renderSteps(steps);

  el.prompt.value = buildPrompt({
    goal,
    context,
    style,
    spice,
    avoidSet,
    profile,
    igStory,
    lastHer: lastHerText,
    chat: chatText,
    noReply: el.noReply?.value,
    place,
    dateType,
    budget,
    dateWhen: el.dateWhen?.value,
    dateTime: el.dateTime?.value,
  });

  updateHint({ goal, chat: chatText, lastHer: lastHerText });

  renderPlaces(suggestPlaces({ place, dateType, budget }));

  if (scrollToResultsOnce) {
    scrollToResultsOnce = false;
    const target = el.winnerHint || el.options;
    if (target?.scrollIntoView) {
      setTimeout(() => target.scrollIntoView({ behavior: "smooth", block: "start" }), 0);
    }
  }

  el.copyPlan.onclick = async () => {
    const recommended = recommendedOption;
    const plan = [
      `Etapa: ${stageLabel(diag.stage)}`,
      `Interesse dela: ${interestLabel(diag.interest)}`,
      `Recomendação: ${diag.recommendationText}`,
      "",
      "Sinais:",
      ...diag.signals.map((s) => `- ${s}`),
      "",
      "Erros potenciais:",
      ...diag.risks.map((r) => `- ${r}`),
      "",
      "Melhor estratégia:",
      diag.strategy,
      "",
      `Mensagem recomendada (${recommended.key}):`,
      recommended.text,
      recommended.why ? `\nPor quê: ${recommended.why}` : "",
    ]
      .join("\n")
      .trim();
    await copyText(plan);
    el.copyPlan.textContent = "Copiado";
    setTimeout(() => (el.copyPlan.textContent = "Copiar plano"), 900);
  };
}

el.generate.addEventListener("click", () => {
  scrollToResultsOnce = true;
  generate();
});

function setVariationEnabled(enabled) {
  variationsEnabled = Boolean(enabled);
  if (!variationsEnabled) variationIndex = 0;
  updateVariationsUI();
  scheduleSave();
  requestGenerate({ immediate: true });
}

function setVariationIndex(idx) {
  variationIndex = Math.max(0, Math.min(3, Number(idx ?? 0)));
  updateVariationsUI();
  scheduleSave();
  requestGenerate({ immediate: true });
}

if (el.enableVariations) {
  el.enableVariations.addEventListener("click", () => {
    setVariationEnabled(!variationsEnabled);
  });
}

if (el.var1) el.var1.addEventListener("click", () => setVariationIndex(0));
if (el.var2) el.var2.addEventListener("click", () => setVariationIndex(1));
if (el.var3) el.var3.addEventListener("click", () => setVariationIndex(2));
if (el.var4) el.var4.addEventListener("click", () => setVariationIndex(3));

el.fetchPlaces.addEventListener("click", fetchOnlinePlaces);

el.showGoogleApiKey.addEventListener("change", () => {
  el.googleApiKey.type = el.showGoogleApiKey.checked ? "text" : "password";
  scheduleSave();
});

function buildCurrentInviteText() {
  const invite = selectedOnlinePlace
    ? createInviteForPlace({
        placeTitle: selectedOnlinePlace.title,
        style: el.style.value,
        spice: el.spice.value,
        dateType: el.dateType.value,
        when: el.dateWhen?.value,
        time: el.dateTime?.value,
      })
    : createInvite({
        place: el.place.value,
        style: el.style.value,
        spice: el.spice.value,
        dateType: el.dateType.value,
        when: el.dateWhen?.value,
        time: el.dateTime?.value,
      });
  return selectedOnlinePlace ? [invite, selectedOnlinePlace.mapsUrl].filter(Boolean).join("\n") : invite;
}

el.copyInvite.addEventListener("click", async () => {
  await copyText(buildCurrentInviteText());
  el.copyInvite.textContent = "Copiado";
  setTimeout(() => (el.copyInvite.textContent = "Copiar convite"), 900);
});

if (el.openInviteWhatsApp) {
  el.openInviteWhatsApp.addEventListener("click", () => openWhatsApp(buildCurrentInviteText()));
}

function defaultState() {
  return {
    goal: "destravar",
    context: "apps",
    style: "engracado",
    spice: "mid",
    avoid: ["frio", "carente"],
    profile: "",
    igStory: "",
    lastHer: "",
    noReply: "1d",
    meName: "",
    herName: "",
    chat: "",
    variationsEnabled: false,
    variationIndex: 0,
    privacyMode: false,
    place: "",
    dateType: "cafe",
    budget: "medio",
    dateWhen: "",
    dateTime: "",
    placesProvider: "auto",
    googleApiKey: "",
    showGoogleApiKey: false,
  };
}

function serializeState({ forStorage = false } = {}) {
  const state = {
    goal: el.goal.value,
    context: el.context.value,
    style: el.style.value,
    spice: el.spice.value,
    avoid: Array.from(getAvoidSet()),
    profile: el.profile.value,
    igStory: el.igStory?.value ?? "",
    lastHer: el.lastHer.value,
    noReply: el.noReply?.value ?? "1d",
    meName: el.meName?.value ?? "",
    herName: el.herName?.value ?? "",
    chat: el.chat.value,
    variationsEnabled: Boolean(variationsEnabled),
    variationIndex: Number.isFinite(Number(variationIndex)) ? Number(variationIndex) : 0,
    privacyMode: Boolean(el.privacyMode?.checked),
    place: el.place.value,
    dateType: el.dateType.value,
    budget: el.budget.value,
    dateWhen: el.dateWhen?.value ?? "",
    dateTime: el.dateTime?.value ?? "",
    placesProvider: normalizeProvider(el.placesProvider.value),
    googleApiKey: el.googleApiKey.value,
    showGoogleApiKey: Boolean(el.showGoogleApiKey.checked),
  };

  if (forStorage && state.privacyMode) {
    return {
      ...state,
      profile: "",
      igStory: "",
      lastHer: "",
      meName: "",
      herName: "",
      chat: "",
      googleApiKey: "",
      showGoogleApiKey: false,
    };
  }
  return state;
}

function applyState(state) {
  const s = { ...defaultState(), ...(state ?? {}) };
  el.goal.value = s.goal;
  el.context.value = s.context;
  el.style.value = s.style;
  el.spice.value = s.spice;
  el.avoidFrio.checked = s.avoid.includes("frio");
  el.avoidCarente.checked = s.avoid.includes("carente");
  el.avoidInvasivo.checked = s.avoid.includes("invasivo");
  el.avoidCringe.checked = s.avoid.includes("cringe");
  el.profile.value = s.profile;
  if (el.igStory) el.igStory.value = s.igStory;
  el.lastHer.value = s.lastHer;
  if (el.noReply) el.noReply.value = s.noReply;
  if (el.meName) el.meName.value = s.meName;
  if (el.herName) el.herName.value = s.herName;
  el.chat.value = s.chat;
  variationsEnabled = Boolean(s.variationsEnabled);
  variationIndex = Math.max(0, Math.min(3, Number(s.variationIndex ?? 0)));
  if (el.privacyMode) el.privacyMode.checked = Boolean(s.privacyMode);
  el.place.value = s.place;
  el.dateType.value = s.dateType;
  el.budget.value = s.budget;
  if (el.dateWhen) el.dateWhen.value = s.dateWhen;
  if (el.dateTime) el.dateTime.value = s.dateTime;
  el.placesProvider.value = normalizeProvider(s.placesProvider);
  el.googleApiKey.value = s.googleApiKey;
  el.showGoogleApiKey.checked = Boolean(s.showGoogleApiKey);
  el.googleApiKey.type = el.showGoogleApiKey.checked ? "text" : "password";
  updateContextUI();
  updateGoalUI();
  updatePrivacyUI();
  updateVariationsUI();
}

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return null;
    return parsed;
  } catch {
    return null;
  }
}

let saveTimer = null;
function scheduleSave() {
  if (saveTimer) window.clearTimeout(saveTimer);
  saveTimer = window.setTimeout(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(serializeState({ forStorage: true })));
    } catch {}
  }, 250);
}

function clearState() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {}
  applyState(defaultState());
  requestGenerate({ immediate: true });
}

for (const input of [
  el.goal,
  el.context,
  el.style,
  el.spice,
  el.avoidFrio,
  el.avoidCarente,
  el.avoidInvasivo,
  el.avoidCringe,
  el.profile,
  el.igStory,
  el.lastHer,
  el.noReply,
  el.meName,
  el.herName,
  el.chat,
  el.privacyMode,
  el.place,
  el.dateType,
  el.budget,
  el.dateWhen,
  el.dateTime,
  el.placesProvider,
  el.googleApiKey,
  el.showGoogleApiKey,
]) {
  if (!input) continue;
  input.addEventListener("input", () => {
    if (input === el.context) updateContextUI();
    if (input === el.goal) updateGoalUI();
    if (input === el.privacyMode) updatePrivacyUI();
    scheduleSave();
    requestGenerate();
  });
  input.addEventListener("change", () => {
    if (input === el.context) updateContextUI();
    if (input === el.goal) updateGoalUI();
    if (input === el.privacyMode) updatePrivacyUI();
    scheduleSave();
    requestGenerate({ immediate: true });
  });
}

el.reset.addEventListener("click", clearState);

if (el.chatImage) {
  el.chatImage.addEventListener("change", () => {
    const file = el.chatImage.files?.[0];
    updateImagePreview("chat", file ?? null, el.chatImagePreview);
    if (!file) {
      setOcrStatus("");
      return;
    }
    const canOcr = "TextDetector" in window;
    setOcrStatus(
      canOcr
        ? `Imagem selecionada: ${file.name}`
        : `Imagem selecionada: ${file.name}. No iPhone, toque e segure no texto do print (Live Text) e cole em “Conversa”.`
    );
    if (canOcr) extractChatFromImage();
  });
}

if (el.ocrExtract) {
  el.ocrExtract.addEventListener("click", extractChatFromImage);
}

if (el.ocrPaste) {
  el.ocrPaste.addEventListener("click", async () => {
    const res = await pasteClipboardText();
    if (!res.ok) {
      setOcrStatus(res.error);
      return;
    }
    el.chat.value = res.text;
    scheduleSave();
    scrollToResultsOnce = true;
    generate();
    setOcrStatus("Texto colado no campo Conversa.");
  });
}

if (el.profileImage) {
  el.profileImage.addEventListener("change", () => {
    const file = el.profileImage.files?.[0];
    updateImagePreview("profile", file ?? null, el.profileImagePreview);
    if (!file) {
      setProfileOcrStatus("");
      return;
    }
    const canOcr = "TextDetector" in window;
    setProfileOcrStatus(
      canOcr
        ? `Imagem selecionada: ${file.name}`
        : `Imagem selecionada: ${file.name}. No iPhone, toque e segure no texto do print (Live Text) e cole em “Gancho do perfil dela”.`
    );
    if (canOcr) extractProfileFromImage();
  });
}

if (el.profileOcrExtract) {
  el.profileOcrExtract.addEventListener("click", extractProfileFromImage);
}

if (el.profileOcrPaste) {
  el.profileOcrPaste.addEventListener("click", async () => {
    const res = await pasteClipboardText();
    if (!res.ok) {
      setProfileOcrStatus(res.error);
      return;
    }
    const current = normalizeText(el.profile.value);
    el.profile.value = current ? `${current}\n${res.text}` : res.text;
    scheduleSave();
    scrollToResultsOnce = true;
    generate();
    setProfileOcrStatus("Texto colado no Gancho do perfil.");
  });
}

let savedCases = loadCases();
renderCaseList(savedCases);

function findCaseById(id) {
  return savedCases.find((c) => c.id === id) ?? null;
}

function getSelectedCaseId() {
  const id = normalizeText(el.caseList?.value);
  return id;
}

if (el.saveCase) {
  el.saveCase.addEventListener("click", () => {
    const name =
      normalizeText(el.caseName?.value) ||
      `Caso ${new Date().toLocaleDateString("pt-BR")} ${new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}`;
    const privacyOn = Boolean(el.privacyMode?.checked);
    const state = serializeState({ forStorage: privacyOn });
    const now = Date.now();
    const existing = savedCases.find((c) => normalizeText(c.name).toLowerCase() === name.toLowerCase());
    if (existing) {
      existing.state = state;
      existing.ts = now;
      existing.name = name;
      setCaseStatus(privacyOn ? "Salvo (atualizado, sem sensíveis)." : "Salvo (atualizado).");
    } else {
      savedCases.push({ id: makeCaseId(), name, ts: now, state });
      setCaseStatus(privacyOn ? "Salvo (sem sensíveis)." : "Salvo.");
    }
    saveCases(savedCases);
    renderCaseList(savedCases);
    const selectId = (savedCases.find((c) => c.name === name) ?? savedCases[savedCases.length - 1])?.id;
    if (selectId && el.caseList) el.caseList.value = selectId;
  });
}

if (el.loadCase) {
  el.loadCase.addEventListener("click", () => {
    const id = getSelectedCaseId();
    const item = id ? findCaseById(id) : null;
    if (!item) {
      setCaseStatus("Selecione um caso válido.");
      return;
    }
    applyState(item.state);
    generate();
    setCaseStatus("Carregado.");
  });
}

if (el.deleteCase) {
  el.deleteCase.addEventListener("click", () => {
    const id = getSelectedCaseId();
    const before = savedCases.length;
    savedCases = savedCases.filter((c) => c.id !== id);
    if (savedCases.length === before) {
      setCaseStatus("Nada pra excluir.");
      return;
    }
    saveCases(savedCases);
    renderCaseList(savedCases);
    setCaseStatus("Excluído.");
  });
}

if (el.exportCases) {
  el.exportCases.addEventListener("click", () => {
    if (!savedCases.length) {
      setCaseStatus("Sem casos pra exportar.");
      return;
    }
    const date = new Date().toISOString().slice(0, 10);
    const filename = `xistao_manager_casos_${date}.json`;
    downloadTextFile({ filename, text: JSON.stringify(savedCases, null, 2) });
    setCaseStatus("Exportado.");
  });
}

if (el.importCases) {
  el.importCases.addEventListener("click", () => {
    if (!el.importCasesFile) return;
    el.importCasesFile.value = "";
    el.importCasesFile.click();
  });
}

if (el.importCasesFile) {
  el.importCasesFile.addEventListener("change", async () => {
    const file = el.importCasesFile.files?.[0];
    if (!file) return;
    try {
      const rawText = await file.text();
      const parsed = safeParseJson(rawText);
      if (!parsed.ok) {
        setCaseStatus("Arquivo inválido (JSON).");
        return;
      }
      const arr = Array.isArray(parsed.value)
        ? parsed.value
        : Array.isArray(parsed.value?.cases)
          ? parsed.value.cases
          : null;
      if (!arr) {
        setCaseStatus("Arquivo inválido (formato).");
        return;
      }
      const before = savedCases.length;
      savedCases = mergeCases(savedCases, arr);
      saveCases(savedCases);
      renderCaseList(savedCases);
      setCaseStatus(`Importado. Casos: ${before} → ${savedCases.length}.`);
    } catch {
      setCaseStatus("Falha ao importar.");
    }
  });
}

function setCasesJsonOpen(open) {
  toggleHidden(el.casesJsonBox, !open);
  if (open && el.casesJson) {
    el.casesJson.value = "";
    el.casesJson.focus();
  }
}

if (el.toggleCasesJson) {
  el.toggleCasesJson.addEventListener("click", () => setCasesJsonOpen(Boolean(el.casesJsonBox?.classList.contains("hidden"))));
}

if (el.closeCasesJson) {
  el.closeCasesJson.addEventListener("click", () => setCasesJsonOpen(false));
}

if (el.copyCasesJson) {
  el.copyCasesJson.addEventListener("click", async () => {
    if (!savedCases.length) {
      setCaseStatus("Sem casos pra copiar.");
      return;
    }
    const text = JSON.stringify(savedCases, null, 2);
    await copyText(text);
    if (el.casesJson) el.casesJson.value = text;
    setCaseStatus("JSON copiado.");
  });
}

if (el.importCasesJson) {
  el.importCasesJson.addEventListener("click", () => {
    const rawText = normalizeText(el.casesJson?.value);
    if (!rawText) {
      setCaseStatus("Cole o JSON primeiro.");
      return;
    }
    const parsed = safeParseJson(rawText);
    if (!parsed.ok) {
      setCaseStatus("JSON inválido.");
      return;
    }
    const arr = Array.isArray(parsed.value)
      ? parsed.value
      : Array.isArray(parsed.value?.cases)
        ? parsed.value.cases
        : null;
    if (!arr) {
      setCaseStatus("Formato inválido.");
      return;
    }
    const before = savedCases.length;
    savedCases = mergeCases(savedCases, arr);
    saveCases(savedCases);
    renderCaseList(savedCases);
    setCaseStatus(`Importado. Casos: ${before} → ${savedCases.length}.`);
  });
}

function clearSensitiveFields() {
  el.profile.value = "";
  if (el.igStory) el.igStory.value = "";
  el.lastHer.value = "";
  if (el.meName) el.meName.value = "";
  if (el.herName) el.herName.value = "";
  el.chat.value = "";
  if (el.chatImage) el.chatImage.value = "";
  if (el.profileImage) el.profileImage.value = "";
  updateImagePreview("chat", null, el.chatImagePreview);
  updateImagePreview("profile", null, el.profileImagePreview);
  if (el.googleApiKey) el.googleApiKey.value = "";
  if (el.showGoogleApiKey) el.showGoogleApiKey.checked = false;
  if (el.googleApiKey) el.googleApiKey.type = "password";
  setOcrStatus("");
  setProfileOcrStatus("");
}

if (el.clearSensitive) {
  el.clearSensitive.addEventListener("click", () => {
    clearSensitiveFields();
    scheduleSave();
    generate();
  });
}

el.copyPrompt.addEventListener("click", async () => {
  await copyText(el.prompt.value);
  el.copyPrompt.textContent = "Copiado";
  setTimeout(() => (el.copyPrompt.textContent = "Copiar prompt"), 900);
});

function setInstallStatus(text) {
  el.installStatus.textContent = text;
}

let deferredInstallPrompt = null;
window.addEventListener("beforeinstallprompt", (e) => {
  e.preventDefault();
  deferredInstallPrompt = e;
  setInstallStatus("Dica: no Android, você pode “Adicionar à tela inicial” pelo menu do navegador.");
});

window.addEventListener("appinstalled", () => {
  deferredInstallPrompt = null;
  setInstallStatus("Instalado. Agora você pode usar como app na tela inicial.");
});

const isIos = /iphone|ipad|ipod/i.test(navigator.userAgent);
const isIosInApp =
  isIos && /(Instagram|FBAN|FBAV|FB_IAB|FBIOS|Line|WhatsApp|Twitter|Snapchat|TikTok)/i.test(navigator.userAgent);
const isStandalone = window.matchMedia?.("(display-mode: standalone)")?.matches || window.navigator.standalone;
const isSecure =
  window.isSecureContext ||
  window.location.protocol === "https:" ||
  window.location.hostname === "localhost" ||
  window.location.hostname === "127.0.0.1";

function updateInstallHints() {
  if (isStandalone) return;
  if (isIos) {
    if (isIosInApp) {
      setInstallStatus("No iPhone: abra este link no Safari (não no navegador do Instagram/WhatsApp). Lá o upload e “Adicionar à Tela de Início” funcionam melhor.");
      return;
    }
    if (!isSecure) {
      setInstallStatus("No iPhone: para instalar/usar offline, abra em HTTPS (ex.: GitHub Pages / Cloudflare Tunnel / LocalTunnel).");
      return;
    }
    setInstallStatus("No iPhone: Compartilhar → Adicionar à Tela de Início.");
    return;
  }
  if (!isSecure) {
    setInstallStatus("Para instalar e usar offline, abra em HTTPS.");
    return;
  }
  setInstallStatus("Você pode salvar nos favoritos ou adicionar à tela inicial pelo menu do navegador.");
}

updateInstallHints();

if ("serviceWorker" in navigator) {
  window.addEventListener("load", async () => {
    if (!isSecure) return;
    try {
      await navigator.serviceWorker.register("./service-worker.js");
    } catch {
      updateInstallHints();
    }
  });
}

if ("serviceWorker" in navigator) {
  navigator.serviceWorker.addEventListener("controllerchange", () => {
    window.location.reload();
  });
}

async function checkForAppUpdate() {
  if (!("serviceWorker" in navigator)) {
    setInstallStatus("Sem service worker. Recarregando…");
    window.location.reload();
    return;
  }
  try {
    setInstallStatus("Verificando atualização…");
    const reg = await navigator.serviceWorker.getRegistration();
    if (!reg) {
      setInstallStatus("Sem registro de service worker. Recarregando…");
      window.location.reload();
      return;
    }
    await reg.update();
    if (reg.waiting) {
      reg.waiting.postMessage({ type: "SKIP_WAITING" });
      setInstallStatus("Atualizando app…");
      return;
    }
    if (reg.installing) {
      reg.installing.addEventListener("statechange", () => {
        if (reg.installing && reg.installing.state === "installed") {
          if (reg.waiting) reg.waiting.postMessage({ type: "SKIP_WAITING" });
          setInstallStatus("Atualizando app…");
        }
      });
      return;
    }
    setInstallStatus("Nenhuma atualização encontrada.");
  } catch {
    setInstallStatus("Falha ao verificar atualização.");
  }
}

if (el.checkUpdate) {
  el.checkUpdate.addEventListener("click", checkForAppUpdate);
}

applyState(loadState());
generate();
