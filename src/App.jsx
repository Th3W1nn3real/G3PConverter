import { useEffect, useMemo, useRef, useState } from "react";
import { zipSync } from "fflate";
import { HEIGHT, WIDTH, encodeG3P } from "./g3p.js";
import {
  FIT_ICONS,
  Icon,
  PRESET_ICONS,
  READOUT_ICONS,
  STATUS_ICONS,
} from "./icons.jsx";
import { QUALITY_PROFILES, processImage } from "./imagePipeline.js";
import { useI18n } from "./i18n.js";

const FIT_OPTIONS = ["contain", "cover", "stretch", "center"];
const GITHUB_URL = "https://github.com/Th3W1nn3real/G3PConverter";
const QUALITY_OPTIONS = Object.entries(QUALITY_PROFILES);

const initialStatus = {
  kind: "idle",
  key: "status.idle",
};

const TUNING_CONTROLS = [
  { key: "dither", labelKey: "tune.dither", min: 0, max: 120, step: 1, suffix: "%" },
  { key: "sharpen", labelKey: "tune.sharpen", min: 0, max: 80, step: 1, suffix: "%" },
  { key: "contrast", labelKey: "tune.contrast", min: 70, max: 140, step: 1, suffix: "%" },
  { key: "saturation", labelKey: "tune.saturation", min: 50, max: 160, step: 1, suffix: "%" },
  { key: "brightness", labelKey: "tune.brightness", min: -30, max: 30, step: 1, suffix: "" },
];

export default function App() {
  const { lang, languages, setLang, t } = useI18n();
  const canvasRef = useRef(null);
  const downloadUrlRef = useRef(null);
  const zipUrlRef = useRef(null);
  const [bitmap, setBitmap] = useState(null);
  const [items, setItems] = useState([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [fileName, setFileName] = useState("image");
  const [inputSize, setInputSize] = useState(null);
  const [fit, setFit] = useState("contain");
  const [qualityMode, setQualityMode] = useState("photo");
  const [tuning, setTuning] = useState(() => tuningFromProfile("photo"));
  const [background, setBackground] = useState("#f3efe6");
  const [downloadUrl, setDownloadUrl] = useState(null);
  const [outputSize, setOutputSize] = useState(null);
  const [zipSize, setZipSize] = useState(null);
  const [status, setStatus] = useState(initialStatus);
  const [isDragging, setIsDragging] = useState(false);
  const [isBatching, setIsBatching] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const downloadName = useMemo(() => `${fileName || "image"}.g3p`, [fileName]);
  const zipName = useMemo(
    () => (items.length > 1 ? "g3p-converter-g3p-batch.zip" : `${fileName || "images"}-g3p.zip`),
    [fileName, items.length],
  );
  const activeTune = useMemo(() => tuneForPipeline(tuning), [tuning]);
  const recipe = useMemo(
    () => formatRecipe(qualityMode, fit, background, tuning),
    [qualityMode, fit, background, tuning],
  );

  useEffect(() => {
    return () => {
      if (downloadUrlRef.current) URL.revokeObjectURL(downloadUrlRef.current);
      if (zipUrlRef.current) URL.revokeObjectURL(zipUrlRef.current);
    };
  }, []);

  useEffect(() => {
    clearZipUrl();
  }, [items, fit, background, qualityMode, activeTune]);

  useEffect(() => {
    if (!bitmap) return;
    renderOutput();
  }, [bitmap, fit, background, qualityMode, activeTune]);

  async function loadFiles(fileList) {
    const files = Array.from(fileList).filter((file) => file.type.match(/^image\/(png|jpeg)$/));
    if (!files.length) {
      setStatus({ kind: "error", key: "status.badType" });
      return;
    }

    try {
      setStatus({ kind: "idle", key: "status.reading", params: { count: files.length } });
      const decoded = [];

      for (const [index, file] of files.entries()) {
        const nextBitmap = await decodeImageFile(file);
        decoded.push({
          id: `${file.name}-${file.lastModified}-${index}`,
          name: file.name.replace(/\.[^.]+$/, "") || `image-${index + 1}`,
          originalName: file.name,
          inputSize: `${nextBitmap.width} x ${nextBitmap.height}`,
          bitmap: nextBitmap,
        });
      }

      setItems(decoded);
      selectItem(decoded[0], 0);
    } catch (error) {
      setStatus({ kind: "error", key: "status.readFailed", params: { message: error.message } });
    }
  }

  async function renderOutput() {
    const canvas = canvasRef.current;
    if (!canvas || !bitmap) return;

    try {
      setStatus({ kind: "idle", key: "status.rendering" });
      const processed = processImage({
        bitmap,
        fit,
        background,
        profileId: qualityMode,
        tune: activeTune,
      });
      const context = canvas.getContext("2d", { willReadFrequently: true });
      context.putImageData(processed.preview, 0, 0);
      const rgb565 = processed.rgb565;
      const g3p = await encodeG3P(rgb565);
      const blob = new Blob([g3p], { type: "application/octet-stream" });
      const nextUrl = URL.createObjectURL(blob);
      setDownloadUrl((previous) => {
        if (previous && previous !== nextUrl) URL.revokeObjectURL(previous);
        downloadUrlRef.current = nextUrl;
        return nextUrl;
      });
      setOutputSize(formatBytes(g3p.byteLength));
      setStatus({
        kind: "ok",
        key: "status.pipeline",
        params: { profile: t(`preset.${qualityMode}.label`) },
      });
    } catch (error) {
      if (downloadUrlRef.current) {
        URL.revokeObjectURL(downloadUrlRef.current);
        downloadUrlRef.current = null;
      }
      setDownloadUrl(null);
      setOutputSize(null);
      setStatus({
        kind: "error",
        key: "status.renderFailed",
        params: { message: error.message },
      });
    }
  }

  function handleFileChange(event) {
    const files = event.target.files;
    if (files?.length) loadFiles(files);
    event.target.value = "";
  }

  function handleDrop(event) {
    event.preventDefault();
    setIsDragging(false);
    const files = event.dataTransfer.files;
    if (files?.length) loadFiles(files);
  }

  function selectItem(item, index) {
    setSelectedIndex(index);
    setBitmap(item.bitmap);
    setFileName(item.name);
    setInputSize(item.inputSize);
  }

  function selectIndex(index) {
    if (!items.length) return;
    const nextIndex = Math.max(0, Math.min(items.length - 1, index));
    selectItem(items[nextIndex], nextIndex);
  }

  function stepSelectedImage(direction) {
    selectIndex(selectedIndex + direction);
  }

  function applyQualityMode(nextMode) {
    setQualityMode(nextMode);
    setTuning(tuningFromProfile(nextMode));
  }

  function setTuningValue(key, value) {
    setTuning((current) => ({ ...current, [key]: value }));
  }

  function clearZipUrl() {
    if (zipUrlRef.current) {
      URL.revokeObjectURL(zipUrlRef.current);
      zipUrlRef.current = null;
    }
    setZipSize(null);
  }

  async function downloadZip() {
    if (!items.length || isBatching) return;

    try {
      setIsBatching(true);
      setStatus({ kind: "idle", key: "status.encoding", params: { count: items.length } });

      const entries = {};
      const usedNames = new Set();

      for (const item of items) {
        const processed = processImage({
          bitmap: item.bitmap,
          fit,
          background,
          profileId: qualityMode,
          tune: activeTune,
        });
        const g3p = await encodeG3P(processed.rgb565);
        entries[uniqueZipName(item.name, usedNames)] = g3p;
      }

      const zip = zipSync(entries, { level: 0 });
      const blob = new Blob([zip], { type: "application/zip" });
      const nextUrl = URL.createObjectURL(blob);

      if (zipUrlRef.current) URL.revokeObjectURL(zipUrlRef.current);
      zipUrlRef.current = nextUrl;
      setZipSize(formatBytes(zip.byteLength));
      triggerDownload(nextUrl, zipName);
      setStatus({
        kind: "ok",
        key: "status.zipReady",
        params: { count: items.length },
      });
    } catch (error) {
      setStatus({ kind: "error", key: "status.zipFailed", params: { message: error.message } });
    } finally {
      setIsBatching(false);
    }
  }

  return (
    <main className="app-shell">
      <header className="masthead">
        <div className="masthead-intro">
          <p className="eyebrow with-icon">
            <Icon name="calculator" size={14} />
            G3P Converter
          </p>
          <h1>{t("masthead.title")}</h1>
          <p className="masthead-copy">{t("masthead.copy")}</p>
        </div>
        <nav className="masthead-actions" aria-label={t("nav.aria")}>
          <div className="lang-switch" role="group" aria-label={t("lang.aria")}>
            {Object.entries(languages).map(([id, label]) => (
              <button
                key={id}
                type="button"
                className={id === lang ? "is-active" : ""}
                aria-pressed={id === lang}
                title={label}
                onClick={() => setLang(id)}
              >
                {id}
              </button>
            ))}
          </div>
          <span className="build-chip with-icon">
            <Icon name="chip" size={14} />
            RGB565 · 3C1B
          </span>
          <a className="source-link with-icon" href={GITHUB_URL} target="_blank" rel="noreferrer">
            <Icon name="github" size={16} />
            {t("nav.github")}
          </a>
        </nav>
      </header>

      <section className="workbench" aria-label={t("workbench.aria")}>
        <aside className="control-rail" aria-label={t("controls.aria")}>
          <section className="rail-section" aria-labelledby="input-heading">
            <div className="section-heading">
              <span id="input-heading" className="with-icon">
                <Icon name="images" size={14} />
                {t("input.title")}
              </span>
              <strong>{items.length ? t("input.loaded", { count: items.length }) : t("input.empty")}</strong>
            </div>

            <label
              className={`drop-zone ${isDragging ? "is-dragging" : ""}`}
              onDragEnter={(event) => {
                event.preventDefault();
                setIsDragging(true);
              }}
              onDragOver={(event) => event.preventDefault()}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
            >
              <input
                className="file-input-hidden"
                type="file"
                accept="image/png,image/jpeg"
                multiple
                onChange={handleFileChange}
              />
              <Icon name="upload" size={32} className="drop-zone-icon" />
              <span className="drop-kicker">{t("drop.kicker")}</span>
              <strong>{t("drop.title")}</strong>
              <span className="drop-hint">{t("drop.hint")}</span>
            </label>

            {items.length > 0 && (
              <div className="batch-list" aria-label={t("batch.aria")}>
                <div className="batch-list-head">
                  <span className="with-icon">
                    <Icon name="images" size={14} />
                    {t("batch.head")}
                  </span>
                  <strong>{items.length}</strong>
                </div>
                <div className="batch-items">
                  {items.map((item, index) => (
                    <button
                      className={`batch-item ${index === selectedIndex ? "is-active" : ""}`}
                      type="button"
                      key={item.id}
                      onClick={() => selectItem(item, index)}
                      aria-pressed={index === selectedIndex}
                    >
                      <span className="with-icon batch-item-name">
                        <Icon name="fileImage" size={14} />
                        {item.originalName}
                      </span>
                      <small>{item.inputSize}</small>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </section>

          <section className="rail-section" aria-labelledby="frame-heading">
            <div className="section-heading">
              <span id="frame-heading" className="with-icon">
                <Icon name="fitContain" size={14} />
                {t("frame.title")}
              </span>
              <strong>{t(`fit.${fit}`)}</strong>
            </div>

            <div className="fit-segmented" role="group" aria-label={t("fit.aria")}>
              {FIT_OPTIONS.map((option) => (
                <button
                  className={`fit-option with-icon ${option === fit ? "is-active" : ""}`}
                  type="button"
                  key={option}
                  onClick={() => setFit(option)}
                  aria-pressed={option === fit}
                >
                  <Icon name={FIT_ICONS[option]} size={14} />
                  {t(`fit.${option}`)}
                </button>
              ))}
            </div>

            <label className="field field-color">
              <span className="with-icon">
                <Icon name="palette" size={14} />
                {t("matte")}
              </span>
              <input
                type="color"
                value={background}
                onChange={(event) => setBackground(event.target.value)}
              />
              <code>{background}</code>
            </label>
          </section>

          <section className="rail-section" aria-labelledby="look-heading">
            <div className="section-heading">
              <span id="look-heading" className="with-icon">
                <Icon name="sparkles" size={14} />
                {t("look.title")}
              </span>
              <strong>{t(`preset.${qualityMode}.label`)}</strong>
            </div>

            <div className="preset-grid" role="group" aria-label={t("presets.aria")}>
              {QUALITY_OPTIONS.map(([id]) => (
                <button
                  className={`preset-button with-icon ${id === qualityMode ? "is-active" : ""}`}
                  type="button"
                  key={id}
                  onClick={() => applyQualityMode(id)}
                  aria-pressed={id === qualityMode}
                >
                  <Icon name={PRESET_ICONS[id]} size={14} />
                  {t(`preset.${id}.label`)}
                </button>
              ))}
            </div>
            <p className="profile-note">{t(`preset.${qualityMode}.note`)}</p>

            <button
              type="button"
              className="advanced-toggle with-icon"
              aria-expanded={showAdvanced}
              onClick={() => setShowAdvanced((open) => !open)}
            >
              <Icon name="sliders" size={14} />
              {t("advanced.toggle")}
              <Icon
                name="chevronDown"
                size={14}
                className={`advanced-chevron ${showAdvanced ? "is-open" : ""}`}
              />
            </button>

            {showAdvanced && (
              <div className="tuning-panel" aria-label={t("advanced.aria")}>
                <div className="tuning-header">
                  <span>{t("advanced.header")}</span>
                  <button
                    type="button"
                    className="with-icon"
                    onClick={() => setTuning(tuningFromProfile(qualityMode))}
                  >
                    <Icon name="reset" size={14} />
                    {t("reset")}
                  </button>
                </div>

                {TUNING_CONTROLS.map((control) => (
                  <label className="range-field" key={control.key}>
                    <span>{t(control.labelKey)}</span>
                    <input
                      type="range"
                      min={control.min}
                      max={control.max}
                      step={control.step}
                      value={tuning[control.key]}
                      onChange={(event) => setTuningValue(control.key, Number(event.target.value))}
                    />
                    <output>
                      {formatControlValue(control.key, tuning[control.key])}
                      {control.suffix && control.key !== "brightness" ? control.suffix : ""}
                    </output>
                  </label>
                ))}

                <div className="toggle-row">
                  <label className="toggle-field">
                    <input
                      type="checkbox"
                      checked={tuning.smoothing}
                      onChange={(event) => setTuningValue("smoothing", event.target.checked)}
                    />
                    <span>{t("toggle.smoothing")}</span>
                  </label>

                  <label className="toggle-field">
                    <input
                      type="checkbox"
                      checked={tuning.progressive}
                      disabled={!tuning.smoothing}
                      onChange={(event) => setTuningValue("progressive", event.target.checked)}
                    />
                    <span>{t("toggle.progressive")}</span>
                  </label>
                </div>

                <code className="recipe-box">{recipe}</code>
              </div>
            )}
          </section>

          <section className="rail-section export-section" aria-labelledby="export-heading">
            <div className="section-heading">
              <span id="export-heading" className="with-icon">
                <Icon name="download" size={14} />
                {t("export.title")}
              </span>
              <strong>{downloadUrl ? outputSize || t("export.ready") : t("export.waiting")}</strong>
            </div>

            <div className="export-actions">
              <a
                className="download-button with-icon"
                href={downloadUrl || "#"}
                download={downloadName}
                aria-disabled={!downloadUrl}
              >
                <Icon name="download" size={16} />
                {t("export.download")}
              </a>

              <button
                className="zip-button with-icon"
                type="button"
                disabled={!items.length || isBatching}
                onClick={downloadZip}
              >
                <Icon
                  name={isBatching ? "loader" : "archive"}
                  size={16}
                  className={isBatching ? "icon-spin" : ""}
                />
                {isBatching ? t("export.zipBusy") : t("export.zip")}
              </button>
            </div>

            <div className={`status status-${status.kind} with-icon`} role="status">
              <Icon
                name={STATUS_ICONS[status.kind]}
                size={16}
                className="status-icon"
              />
              <span>{t(status.key, status.params)}</span>
            </div>
          </section>
        </aside>

        <section className="preview-deck" aria-label={t("preview.aria")}>
          <div className="deck-header">
            <div>
              <span className="with-icon">
                <Icon name="monitor" size={14} />
                {t("deck.title")}
              </span>
              <strong>{t("deck.screen")}</strong>
            </div>
            <span className="frame-code with-icon">
              <Icon name="layers" size={12} />
              384×192
            </span>
          </div>

          <div className="calculator-stage">
            <div className="calculator-device">
              <div className="device-top">
                <span className="device-brand">Casio</span>
                <span className="device-model">fx-CG50</span>
              </div>
              <div className="screen-bezel">
                <canvas ref={canvasRef} width={WIDTH} height={HEIGHT} />
                {!bitmap && (
                  <div className="empty-screen">
                    <Icon name="images" size={40} className="empty-screen-icon" />
                    <span>{t("empty.screen")}</span>
                  </div>
                )}
              </div>
              <p className="device-caption">{t("device.caption")}</p>
            </div>
          </div>

          <div className="preview-navigator" aria-label={t("pn.aria")}>
            <p className="preview-nav-caption">
              {items.length
                ? t("pn.count", {
                    current: selectedIndex + 1,
                    total: items.length,
                    name: items[selectedIndex]?.originalName ?? "",
                  })
                : t("pn.none")}
            </p>
            {items.length > 0 && (
              <div className="preview-nav-controls">
                <button
                  type="button"
                  className="preview-nav-step with-icon"
                  disabled={items.length < 2 || selectedIndex === 0}
                  onClick={() => stepSelectedImage(-1)}
                  aria-label={t("pn.prevAria")}
                >
                  <Icon name="chevronLeft" size={16} />
                  {t("pn.previous")}
                </button>
                <div className="preview-nav-buttons" role="tablist" aria-label={t("pn.indexAria")}>
                  {items.map((item, index) => (
                    <button
                      type="button"
                      role="tab"
                      className={`preview-nav-index ${index === selectedIndex ? "is-active" : ""}`}
                      key={item.id}
                      aria-selected={index === selectedIndex}
                      title={item.originalName}
                      onClick={() => selectIndex(index)}
                    >
                      {index + 1}
                    </button>
                  ))}
                </div>
                <button
                  type="button"
                  className="preview-nav-step with-icon"
                  disabled={items.length < 2 || selectedIndex === items.length - 1}
                  onClick={() => stepSelectedImage(1)}
                  aria-label={t("pn.nextAria")}
                >
                  {t("pn.next")}
                  <Icon name="chevronRight" size={16} />
                </button>
              </div>
            )}
          </div>

          <dl className="readout-grid">
            <div>
              <dt className="with-icon">
                <Icon name={READOUT_ICONS.input} size={12} />
                {t("readout.input")}
              </dt>
              <dd>{inputSize || t("readout.inputEmpty")}</dd>
            </div>
            <div>
              <dt className="with-icon">
                <Icon name={FIT_ICONS[fit]} size={12} />
                {t("readout.fit")}
              </dt>
              <dd>{t(`fit.${fit}`)}</dd>
            </div>
            <div>
              <dt className="with-icon">
                <Icon name={READOUT_ICONS.quality} size={12} />
                {t("readout.quality")}
              </dt>
              <dd>{t(`preset.${qualityMode}.label`)}</dd>
            </div>
            <div>
              <dt className="with-icon">
                <Icon name={READOUT_ICONS.variant} size={12} />
                {t("readout.variant")}
              </dt>
              <dd>3C1B</dd>
            </div>
            <div>
              <dt className="with-icon">
                <Icon name={READOUT_ICONS.g3p} size={12} />
                {t("readout.g3p")}
              </dt>
              <dd>{outputSize || t("readout.g3pPending")}</dd>
            </div>
            <div>
              <dt className="with-icon">
                <Icon name={READOUT_ICONS.zip} size={12} />
                {t("readout.zip")}
              </dt>
              <dd>{zipSize || t("readout.zipNone")}</dd>
            </div>
          </dl>
        </section>
      </section>

      <section className="production-notes" aria-label={t("notes.aria")}>
        <article>
          <span className="with-icon note-kicker">
            <Icon name="fileCode" size={14} />
            {t("note.format.kicker")}
          </span>
          <h2>{t("note.format.title")}</h2>
          <p>{t("note.format.copy")}</p>
        </article>
        <article>
          <span className="with-icon note-kicker">
            <Icon name="device" size={14} />
            {t("note.hardware.kicker")}
          </span>
          <h2>{t("note.hardware.title")}</h2>
          <p>{t("note.hardware.copy")}</p>
        </article>
        <article>
          <span className="with-icon note-kicker">
            <Icon name="shield" size={14} />
            {t("note.privacy.kicker")}
          </span>
          <h2>{t("note.privacy.title")}</h2>
          <p>{t("note.privacy.copy")}</p>
        </article>
      </section>

      <footer className="site-footer">
        <div>
          <strong>G3P Converter</strong>
          <span>{t("footer.tagline")}</span>
        </div>
        <div className="footer-links">
          <a className="with-icon" href={GITHUB_URL} target="_blank" rel="noreferrer">
            <Icon name="github" size={14} />
            {t("footer.github")}
          </a>
          <a
            className="with-icon"
            href="https://www.cemetech.net/forum/viewtopic.php?t=10560&start=0"
            target="_blank"
            rel="noreferrer"
          >
            <Icon name="book" size={14} />
            {t("footer.research")}
          </a>
        </div>
      </footer>
    </main>
  );
}

function formatBytes(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  return `${(bytes / 1024).toFixed(1)} KB`;
}

function triggerDownload(url, fileName) {
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  document.body.append(link);
  link.click();
  link.remove();
}

function uniqueZipName(name, usedNames) {
  const cleanName = sanitizeFileStem(name);
  let candidate = `${cleanName}.g3p`;
  let suffix = 2;

  while (usedNames.has(candidate)) {
    candidate = `${cleanName}-${suffix}.g3p`;
    suffix += 1;
  }

  usedNames.add(candidate);
  return candidate;
}

function sanitizeFileStem(name) {
  return (
    name
      .trim()
      .replace(/\.[^.]+$/, "")
      .replace(/[^a-z0-9-_]+/gi, "-")
      .replace(/^-+|-+$/g, "")
      .toLowerCase() || "image"
  );
}

async function decodeImageFile(file) {
  if ("createImageBitmap" in window) {
    try {
      return await createImageBitmap(file);
    } catch {
      // Fall through to the HTMLImageElement path for browsers with partial support.
    }
  }

  const objectUrl = URL.createObjectURL(file);
  try {
    const image = new Image();
    image.decoding = "async";
    image.src = objectUrl;
    await image.decode();
    return image;
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}

function tuningFromProfile(profileId) {
  const profile = QUALITY_PROFILES[profileId] ?? QUALITY_PROFILES.photo;
  return {
    dither: Math.round(profile.dither * 100),
    sharpen: Math.round(profile.sharpen * 100),
    contrast: Math.round(profile.contrast * 100),
    saturation: Math.round(profile.saturation * 100),
    brightness: Math.round(profile.brightness),
    smoothing: profile.smoothing,
    progressive: profile.progressive,
  };
}

function tuneForPipeline(tuning) {
  return {
    dither: tuning.dither / 100,
    sharpen: tuning.sharpen / 100,
    contrast: tuning.contrast / 100,
    saturation: tuning.saturation / 100,
    brightness: tuning.brightness,
    smoothing: tuning.smoothing,
    progressive: tuning.smoothing && tuning.progressive,
  };
}

function formatControlValue(key, value) {
  if (key === "brightness") return value > 0 ? `+${value}` : `${value}`;
  return `${value}`;
}

function formatRecipe(profileId, fit, background, tuning) {
  return [
    `profile=${profileId}`,
    `fit=${fit}`,
    `matte=${background}`,
    `dither=${tuning.dither}`,
    `sharp=${tuning.sharpen}`,
    `contrast=${tuning.contrast}`,
    `sat=${tuning.saturation}`,
    `bright=${formatControlValue("brightness", tuning.brightness)}`,
    `smooth=${tuning.smoothing ? "on" : "off"}`,
    `prog=${tuning.smoothing && tuning.progressive ? "on" : "off"}`,
  ].join(" | ");
}
