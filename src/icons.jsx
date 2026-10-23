const PATHS = {
  calculator:
    "<rect x=\"4\" y=\"2\" width=\"16\" height=\"20\" rx=\"2\"/><line x1=\"8\" y1=\"6\" x2=\"16\" y2=\"6\"/><line x1=\"8\" y1=\"10\" x2=\"10\" y2=\"10\"/><line x1=\"12\" y1=\"10\" x2=\"14\" y2=\"10\"/><line x1=\"16\" y1=\"10\" x2=\"16\" y2=\"10\"/><line x1=\"8\" y1=\"14\" x2=\"10\" y2=\"14\"/><line x1=\"12\" y1=\"14\" x2=\"14\" y2=\"14\"/><line x1=\"8\" y1=\"18\" x2=\"16\" y2=\"18\"/>",
  chip:
    "<rect x=\"4\" y=\"4\" width=\"16\" height=\"16\" rx=\"2\"/><rect x=\"9\" y=\"9\" width=\"6\" height=\"6\"/><line x1=\"9\" y1=\"1\" x2=\"9\" y2=\"4\"/><line x1=\"15\" y1=\"1\" x2=\"15\" y2=\"4\"/><line x1=\"9\" y1=\"20\" x2=\"9\" y2=\"23\"/><line x1=\"15\" y1=\"20\" x2=\"15\" y2=\"23\"/><line x1=\"20\" y1=\"9\" x2=\"23\" y2=\"9\"/><line x1=\"20\" y1=\"15\" x2=\"23\" y2=\"15\"/><line x1=\"1\" y1=\"9\" x2=\"4\" y2=\"9\"/><line x1=\"1\" y1=\"15\" x2=\"4\" y2=\"15\"/>",
  github:
    "<path d=\"M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5 0-1.1-.5-2.2-1.2-3 .1-.3.5-1.6-.1-3.3 0 0-1-.3-3.4 1a12 12 0 0 0-6.5 0C6.7 2.7 5.7 3 5.7 3c-.6 1.7-.2 3-.1 3.3A4.7 4.7 0 0 0 4 9.5c0 3.5 3 5.5 6 5.5-.8.7-1 1.7-1 3.2V22\"/><path d=\"M9 18c-4.5 1.5-4.5-2.5-6-3\"/>",
  upload:
    "<path d=\"M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4\"/><polyline points=\"17 8 12 3 7 8\"/><line x1=\"12\" y1=\"3\" x2=\"12\" y2=\"15\"/>",
  images:
    "<rect x=\"3\" y=\"3\" width=\"18\" height=\"18\" rx=\"2\"/><circle cx=\"9\" cy=\"9\" r=\"2\"/><path d=\"m21 15-5-5L5 21\"/>",
  fileImage:
    "<path d=\"M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z\"/><path d=\"M14 2v4a2 2 0 0 0 2 2h4\"/><circle cx=\"10\" cy=\"12\" r=\"2\"/><path d=\"m20 17-4-4-6 6\"/>",
  fitContain:
    "<path d=\"M8 3H5a2 2 0 0 0-2 2v3\"/><path d=\"M21 8V5a2 2 0 0 0-2-2h-3\"/><path d=\"M3 16v3a2 2 0 0 0 2 2h3\"/><path d=\"M16 21h3a2 2 0 0 0 2-2v-3\"/><rect x=\"7\" y=\"7\" width=\"10\" height=\"10\" rx=\"1\"/>",
  fitCover:
    "<path d=\"M8 3H5a2 2 0 0 0-2 2v3\"/><path d=\"M21 8V5a2 2 0 0 0-2-2h-3\"/><path d=\"M3 16v3a2 2 0 0 0 2 2h3\"/><path d=\"M16 21h3a2 2 0 0 0 2-2v-3\"/><rect x=\"5\" y=\"5\" width=\"14\" height=\"14\" rx=\"1\"/>",
  fitStretch:
    "<path d=\"M8 3H5a2 2 0 0 0-2 2v3\"/><path d=\"M21 8V5a2 2 0 0 0-2-2h-3\"/><path d=\"M3 16v3a2 2 0 0 0 2 2h3\"/><path d=\"M16 21h3a2 2 0 0 0 2-2v-3\"/><path d=\"M4 12h16\"/>",
  fitCenter:
    "<circle cx=\"12\" cy=\"12\" r=\"3\"/><path d=\"M12 2v3\"/><path d=\"M12 19v3\"/><path d=\"m4.9 4.9 2.1 2.1\"/><path d=\"m17 17 2.1 2.1\"/><path d=\"M2 12h3\"/><path d=\"M19 12h3\"/><path d=\"m4.9 19.1 2.1-2.1\"/><path d=\"m17 7 2.1-2.1\"/>",
  palette: "<circle cx=\"13.5\" cy=\"6.5\" r=\".5\" fill=\"currentColor\"/><circle cx=\"17.5\" cy=\"10.5\" r=\".5\" fill=\"currentColor\"/><circle cx=\"8.5\" cy=\"7.5\" r=\".5\" fill=\"currentColor\"/><circle cx=\"6.5\" cy=\"12.5\" r=\".5\" fill=\"currentColor\"/><path d=\"M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.9 0 1.7-.1 2.5-.3\"/>",
  camera:
    "<path d=\"M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z\"/><circle cx=\"12\" cy=\"13\" r=\"3\"/>",
  sparkles:
    "<path d=\"m12 3-1.9 5.8H4.4l4.8 3.5-1.9 5.8L12 14.5l4.7 3.6-1.9-5.8 4.8-3.5H13.9Z\"/><path d=\"M5 3v4\"/><path d=\"M3 5h4\"/><path d=\"M19 16v4\"/><path d=\"M17 18h4\"/>",
  chart:
    "<line x1=\"18\" y1=\"20\" x2=\"18\" y2=\"10\"/><line x1=\"12\" y1=\"20\" x2=\"12\" y2=\"4\"/><line x1=\"6\" y1=\"20\" x2=\"6\" y2=\"14\"/>",
  type:
    "<polyline points=\"4 7 4 4 20 4 20 7\"/><line x1=\"9\" y1=\"20\" x2=\"15\" y2=\"20\"/><line x1=\"12\" y1=\"4\" x2=\"12\" y2=\"20\"/>",
  grid:
    "<rect x=\"3\" y=\"3\" width=\"7\" height=\"7\"/><rect x=\"14\" y=\"3\" width=\"7\" height=\"7\"/><rect x=\"14\" y=\"14\" width=\"7\" height=\"7\"/><rect x=\"3\" y=\"14\" width=\"7\" height=\"7\"/>",
  sliders:
    "<line x1=\"4\" y1=\"21\" x2=\"4\" y2=\"14\"/><line x1=\"4\" y1=\"10\" x2=\"4\" y2=\"3\"/><line x1=\"12\" y1=\"21\" x2=\"12\" y2=\"12\"/><line x1=\"12\" y1=\"8\" x2=\"12\" y2=\"3\"/><line x1=\"20\" y1=\"21\" x2=\"20\" y2=\"16\"/><line x1=\"20\" y1=\"12\" x2=\"20\" y2=\"3\"/><line x1=\"1\" y1=\"14\" x2=\"7\" y2=\"14\"/><line x1=\"9\" y1=\"8\" x2=\"15\" y2=\"8\"/><line x1=\"17\" y1=\"16\" x2=\"23\" y2=\"16\"/>",
  reset: "<path d=\"M3 12a9 9 0 1 0 9-9 9.8 9.8 0 0 0-5.1 1.4\"/><path d=\"M3 3v5h5\"/>",
  download:
    "<path d=\"M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4\"/><polyline points=\"7 10 12 15 17 10\"/><line x1=\"12\" y1=\"15\" x2=\"12\" y2=\"3\"/>",
  archive:
    "<rect x=\"2\" y=\"7\" width=\"20\" height=\"14\" rx=\"2\"/><path d=\"M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2\"/><line x1=\"12\" y1=\"12\" x2=\"12\" y2=\"17\"/><line x1=\"9\" y1=\"15\" x2=\"15\" y2=\"15\"/>",
  chevronLeft: "<path d=\"m15 18-6-6 6-6\"/>",
  chevronRight: "<path d=\"m9 18 6-6-6-6\"/>",
  chevronDown: "<path d=\"m6 9 6 6 6-6\"/>",
  monitor:
    "<rect x=\"2\" y=\"3\" width=\"20\" height=\"14\" rx=\"2\"/><line x1=\"8\" y1=\"21\" x2=\"16\" y2=\"21\"/><line x1=\"12\" y1=\"17\" x2=\"12\" y2=\"21\"/>",
  info: "<circle cx=\"12\" cy=\"12\" r=\"10\"/><path d=\"M12 16v-4\"/><path d=\"M12 8h.01\"/>",
  check: "<path d=\"M22 11.08V12a10 10 0 1 1-5.93-9.14\"/><path d=\"m22 4-10 10-4-4\"/>",
  alert:
    "<path d=\"m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3\"/><path d=\"M12 9v4\"/><path d=\"M12 17h.01\"/>",
  loader:
    "<path d=\"M21 12a9 9 0 1 1-6.2-8.6\"/>",
  fileCode:
    "<path d=\"M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z\"/><path d=\"M14 2v4a2 2 0 0 0 2 2h4\"/><path d=\"m10 13-2 2 2 2\"/><path d=\"m14 17 2-2-2-2\"/>",
  device:
    "<rect x=\"5\" y=\"2\" width=\"14\" height=\"20\" rx=\"2\"/><path d=\"M9 22h6\"/><path d=\"M12 18v4\"/>",
  shield:
    "<path d=\"M20 13c0 5-3.5 7.5-7.7 9.2a2 2 0 0 1-1.6 0C6.5 20.5 4 18 4 13V7a2 2 0 0 1 1.1-1.8l7-3.5a2 2 0 0 1 1.8 0l7 3.5A2 2 0 0 1 20 7z\"/>",
  external:
    "<path d=\"M15 3h6v6\"/><path d=\"M10 14 21 3\"/><path d=\"M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6\"/>",
  book:
    "<path d=\"M4 19.5A2.5 2.5 0 0 1 6.5 17H20\"/><path d=\"M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z\"/>",
  hardDrive:
    "<line x1=\"22\" y1=\"12\" x2=\"2\" y2=\"12\"/><path d=\"M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z\"/><line x1=\"6\" y1=\"16\" x2=\"6.01\" y2=\"16\"/><line x1=\"10\" y1=\"16\" x2=\"10.01\" y2=\"16\"/>",
  layers: "<polygon points=\"12 2 2 7 12 12 22 7 12 2\"/><polyline points=\"2 17 12 22 22 17\"/><polyline points=\"2 12 12 17 22 12\"/>",
};

export const FIT_ICONS = {
  contain: "fitContain",
  cover: "fitCover",
  stretch: "fitStretch",
  center: "fitCenter",
};

export const PRESET_ICONS = {
  photo: "camera",
  crisp: "sparkles",
  diagram: "chart",
  text: "type",
  pixel: "grid",
};

export const READOUT_ICONS = {
  input: "fileImage",
  fit: "fitContain",
  quality: "sparkles",
  variant: "layers",
  g3p: "download",
  zip: "archive",
};

export const STATUS_ICONS = {
  idle: "info",
  ok: "check",
  error: "alert",
};

export function Icon({ name, size = 16, className = "", label }) {
  const markup = PATHS[name];
  if (!markup) return null;

  return (
    <svg
      className={className ? `icon ${className}` : "icon"}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden={label ? undefined : true}
      role={label ? "img" : undefined}
      aria-label={label}
      dangerouslySetInnerHTML={{ __html: markup }}
    />
  );
}
