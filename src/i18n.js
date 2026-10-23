import { useEffect, useState } from "react";

const STORAGE_KEY = "g3p-converter-language";

export const LANGUAGES = {
  en: "English",
  it: "Italiano",
};

const MESSAGES = {
  en: {
    "masthead.title": "Casio G3P converter",
    "masthead.copy":
      "Turn PNG or JPEG images into 384×192 RGB565 still pictures for fx-CG calculators. Preview on a CG50 frame, tune the look, and download `.g3p` files locally in your browser.",
    "nav.aria": "Project links",
    "nav.github": "View on GitHub",
    "lang.aria": "Language",

    "workbench.aria": "G3P converter",
    "controls.aria": "Conversion controls",
    "input.title": "Input",
    "input.loaded": "{count} loaded",
    "input.empty": "Empty",
    "drop.kicker": "Source images",
    "drop.title": "Drop or click to browse",
    "drop.hint": "PNG or JPEG · batch export supported",
    "batch.aria": "Loaded image batch",
    "batch.head": "Loaded batch",

    "frame.title": "Frame",
    "fit.aria": "Fit mode",
    "fit.contain": "Contain",
    "fit.cover": "Cover",
    "fit.stretch": "Stretch",
    "fit.center": "Center",
    "matte": "Matte color",

    "look.title": "Look",
    "presets.aria": "Quality presets",
    "preset.photo.label": "Photo Smooth",
    "preset.photo.note": "Smooth downsample, gentle sharpening, and heavier RGB565 dithering.",
    "preset.crisp.label": "Photo Crisp",
    "preset.crisp.note": "More edge bite and color pop, with moderate dithering.",
    "preset.diagram.label": "Diagram",
    "preset.diagram.note": "Sharper edges for UI captures, charts, maps, and line art.",
    "preset.text.label": "Text",
    "preset.text.note": "Extra edge contrast for labels and dense screenshots.",
    "preset.pixel.label": "Pixel art",
    "preset.pixel.note": "Nearest-neighbor scaling with no smoothing or dithering.",

    "advanced.toggle": "Advanced tuning",
    "advanced.aria": "Image tuning controls",
    "advanced.header": "Fine controls",
    "reset": "Reset",
    "tune.dither": "Dither",
    "tune.sharpen": "Sharpness",
    "tune.contrast": "Contrast",
    "tune.saturation": "Saturation",
    "tune.brightness": "Brightness",
    "toggle.smoothing": "Smooth resize",
    "toggle.progressive": "Progressive downsample",

    "export.title": "Export",
    "export.ready": "Ready",
    "export.waiting": "Waiting",
    "export.download": "Download selected .g3p",
    "export.zip": "Download ZIP",
    "export.zipBusy": "Preparing ZIP...",

    "preview.aria": "Calculator preview",
    "deck.title": "Live preview",
    "deck.screen": "fx-CG50 screen",
    "empty.screen": "Add an image to preview",
    "device.caption": "RGB565 still picture · 3C1B variant",

    "pn.aria": "Preview image navigator",
    "pn.count": "{current} of {total} · {name}",
    "pn.none": "No batch loaded",
    "pn.previous": "Previous",
    "pn.next": "Next",
    "pn.prevAria": "Previous image",
    "pn.nextAria": "Next image",
    "pn.indexAria": "Select image",

    "readout.input": "Input",
    "readout.inputEmpty": "No file",
    "readout.fit": "Fit",
    "readout.quality": "Quality",
    "readout.variant": "Variant",
    "readout.g3p": "G3P size",
    "readout.g3pPending": "Pending",
    "readout.zip": "ZIP size",
    "readout.zipNone": "Not built",

    "notes.aria": "Converter details",
    "note.format.kicker": "Format",
    "note.format.title": "3C1B still pictures",
    "note.format.copy":
      "384×192 RGB565 pixels, raw DEFLATE compression, and Adler-32 over the uncompressed byte stream. No extra CAPTURE footer metadata.",
    "note.hardware.kicker": "Hardware",
    "note.hardware.title": "Built for fx-CG",
    "note.hardware.copy":
      "Matches the Casio Prizm screen size. Always verify exports on your own calculator before class or demo use.",
    "note.privacy.kicker": "Privacy",
    "note.privacy.title": "Runs in-browser",
    "note.privacy.copy":
      "Images never leave your device. Encoding uses native DEFLATE when available, with a JavaScript fallback otherwise.",

    "footer.tagline": "Open source Casio `.g3p` conversion utility.",
    "footer.github": "GitHub repository",
    "footer.research": "Format research",

    "status.idle": "Load a source image to inspect the calculator frame.",
    "status.reading": ["Reading 1 source image...", "Reading {count} source images..."],
    "status.badType": "Use a PNG or JPEG source image.",
    "status.readFailed": "Image read failed: {message}",
    "status.rendering": "Rendering RGB565 preview and preparing .g3p...",
    "status.pipeline":
      "{profile} pipeline applied. Preview shows the actual RGB565 pixels written to the .g3p.",
    "status.renderFailed": "Rendering failed: {message}",
    "status.encoding": [
      "Encoding 1 .g3p file into a ZIP...",
      "Encoding {count} .g3p files into a ZIP...",
    ],
    "status.zipReady": [
      "ZIP ready: 1 .g3p file encoded with the current recipe.",
      "ZIP ready: {count} .g3p files encoded with the current recipe.",
    ],
    "status.zipFailed": "ZIP failed: {message}",
  },

  it: {
    "masthead.title": "Convertitore Casio G3P",
    "masthead.copy":
      "Trasforma immagini PNG o JPEG in immagini fisse 384×192 RGB565 per calcolatrici fx-CG. Anteprima su una cornice CG50, regolazioni a piacere e download dei file `.g3p` direttamente nel browser.",
    "nav.aria": "Collegamenti del progetto",
    "nav.github": "Apri su GitHub",
    "lang.aria": "Lingua",

    "workbench.aria": "Convertitore G3P",
    "controls.aria": "Controlli di conversione",
    "input.title": "Ingresso",
    "input.loaded": "{count} caricate",
    "input.empty": "Vuota",
    "drop.kicker": "Immagini sorgente",
    "drop.title": "Trascina o clicca per scegliere",
    "drop.hint": "PNG o JPEG · esportazione in lotto supportata",
    "batch.aria": "Lotto di immagini caricate",
    "batch.head": "Lotto caricato",

    "frame.title": "Cornice",
    "fit.aria": "Modalità di adattamento",
    "fit.contain": "Adatta",
    "fit.cover": "Riempi",
    "fit.stretch": "Estendi",
    "fit.center": "Centra",
    "matte": "Colore di sfondo",

    "look.title": "Aspetto",
    "presets.aria": "Preset di qualità",
    "preset.photo.label": "Foto morbida",
    "preset.photo.note": "Ridimensionamento morbido, nitidezza leggera e dithering RGB565 più marcato.",
    "preset.crisp.label": "Foto nitida",
    "preset.crisp.note": "Più mordente sui bordi e colori più vividi, con dithering moderato.",
    "preset.diagram.label": "Diagramma",
    "preset.diagram.note": "Bordi più netti per screenshot di UI, grafici, mappe e line art.",
    "preset.text.label": "Testo",
    "preset.text.note": "Contrasto extra sui bordi per etichette e screenshot densi.",
    "preset.pixel.label": "Pixel art",
    "preset.pixel.note": "Ridimensionamento nearest-neighbor senza smoothing né dithering.",

    "advanced.toggle": "Regolazioni avanzate",
    "advanced.aria": "Controlli di rifinitura",
    "advanced.header": "Rifiniture",
    "reset": "Reimposta",
    "tune.dither": "Dithering",
    "tune.sharpen": "Nitidezza",
    "tune.contrast": "Contrasto",
    "tune.saturation": "Saturazione",
    "tune.brightness": "Luminosità",
    "toggle.smoothing": "Ridimensionamento morbido",
    "toggle.progressive": "Downsample progressivo",

    "export.title": "Esportazione",
    "export.ready": "Pronto",
    "export.waiting": "In attesa",
    "export.download": "Scarica il .g3p selezionato",
    "export.zip": "Scarica ZIP",
    "export.zipBusy": "Preparo lo ZIP...",

    "preview.aria": "Anteprima calcolatrice",
    "deck.title": "Anteprima live",
    "deck.screen": "Schermo fx-CG50",
    "empty.screen": "Aggiungi un'immagine per l'anteprima",
    "device.caption": "Immagine fissa RGB565 · variante 3C1B",

    "pn.aria": "Navigatore immagini dell'anteprima",
    "pn.count": "{current} di {total} · {name}",
    "pn.none": "Nessun lotto caricato",
    "pn.previous": "Precedente",
    "pn.next": "Successiva",
    "pn.prevAria": "Immagine precedente",
    "pn.nextAria": "Immagine successiva",
    "pn.indexAria": "Seleziona immagine",

    "readout.input": "Ingresso",
    "readout.inputEmpty": "Nessun file",
    "readout.fit": "Formato",
    "readout.quality": "Qualità",
    "readout.variant": "Variante",
    "readout.g3p": "Peso .g3p",
    "readout.g3pPending": "Da generare",
    "readout.zip": "Peso ZIP",
    "readout.zipNone": "Non creato",

    "notes.aria": "Dettagli del convertitore",
    "note.format.kicker": "Formato",
    "note.format.title": "Immagini fisse 3C1B",
    "note.format.copy":
      "384×192 pixel RGB565, compressione DEFLATE raw e Adler-32 sul flusso di byte non compresso. Nessun footer CAPTURE aggiuntivo.",
    "note.hardware.kicker": "Hardware",
    "note.hardware.title": "Pensato per fx-CG",
    "note.hardware.copy":
      "Corrisponde allo schermo delle Casio Prizm. Verifica sempre le esportazioni sulla tua calcolatrice prima di usarle a scuola o in demo.",
    "note.privacy.kicker": "Privacy",
    "note.privacy.title": "Gira nel browser",
    "note.privacy.copy":
      "Le immagini non lasciano mai il tuo dispositivo. La codifica usa il DEFLATE nativo quando disponibile, con un fallback JavaScript altrimenti.",

    "footer.tagline": "Utility open source per la conversione `.g3p` di Casio.",
    "footer.github": "Repository GitHub",
    "footer.research": "Documentazione del formato",

    "status.idle": "Carica un'immagine sorgente per esaminare la cornice della calcolatrice.",
    "status.reading": ["Leggo 1 immagine sorgente...", "Leggo {count} immagini sorgente..."],
    "status.badType": "Usa un'immagine sorgente PNG o JPEG.",
    "status.readFailed": "Lettura dell'immagine non riuscita: {message}",
    "status.rendering": "Genero l'anteprima RGB565 e preparo il .g3p...",
    "status.pipeline":
      "Pipeline {profile} applicata. L'anteprima mostra i pixel RGB565 reali scritti nel .g3p.",
    "status.renderFailed": "Generazione non riuscita: {message}",
    "status.encoding": [
      "Codifico 1 file .g3p in uno ZIP...",
      "Codifico {count} file .g3p in uno ZIP...",
    ],
    "status.zipReady": [
      "ZIP pronto: 1 file .g3p codificato con la ricetta attuale.",
      "ZIP pronto: {count} file .g3p codificati con la ricetta attuale.",
    ],
    "status.zipFailed": "Errore durante lo ZIP: {message}",
  },
};

let currentLang = resolveInitialLang();
const listeners = new Set();

function resolveInitialLang() {
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored && MESSAGES[stored]) return stored;
  } catch {
    // localStorage can be unavailable; fall through to browser language.
  }

  for (const candidate of navigator.languages ?? [navigator.language]) {
    if (candidate && MESSAGES[candidate.slice(0, 2)]) return candidate.slice(0, 2);
  }
  return "en";
}

function switchLang(nextLang) {
  if (!MESSAGES[nextLang] || nextLang === currentLang) return;
  currentLang = nextLang;
  try {
    window.localStorage.setItem(STORAGE_KEY, nextLang);
  } catch {
    // Persistence is best-effort only.
  }
  document.documentElement.lang = nextLang;
  for (const listener of listeners) listener(nextLang);
}

function translate(lang, key, params = {}) {
  const entry = MESSAGES[lang]?.[key] ?? MESSAGES.en[key] ?? key;
  const template = Array.isArray(entry) ? (params.count === 1 ? entry[0] : entry[1]) : entry;
  return template.replace(/\{(\w+)\}/g, (match, name) =>
    name in params ? String(params[name]) : match,
  );
}

export function useI18n() {
  const [lang, setLangState] = useState(currentLang);

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  useEffect(() => {
    const listener = (nextLang) => setLangState(nextLang);
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  }, []);

  return {
    lang,
    languages: LANGUAGES,
    setLang: switchLang,
    t: (key, params) => translate(lang, key, params),
  };
}
