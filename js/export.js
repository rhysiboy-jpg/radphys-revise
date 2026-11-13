// Downloading a diagram as a picture for lecture slides: an SVG (sharp at any size) or a PNG (works everywhere).
// The picture shows the diagram as it is now, on a light background whatever theme the app is in, with its title above,
// its written summary below, and a credit line in APA 7 style.
// PowerPoint's SVG reader ignores style sheets and several CSS features, so every colour, size and position is written
// onto the elements themselves, and the few features it lacks (text centred with dominant-baseline, CSS transforms,
// colours with transparency) are turned into plain attributes.

const WIDTH = 800, PAD = 24;
const FONT = "'Noto Sans', 'Segoe UI', Arial, sans-serif";
const LEAVES = new Set(["path", "rect", "circle", "ellipse", "line", "polyline", "polygon", "text", "tspan", "use", "stop", "image"]);
const NEVER_DRAWN = "defs, clipPath, mask, marker, linearGradient, radialGradient, pattern, symbol";

const xml = s => String(s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);
const num = n => +(+n).toFixed(3);

// The credit, APA 7 style: Author. (Year). Title [Description]. Site. URL. The title is the part set in italics.
export function apaCredit({ author, year, title, site, url = "" }) {
  return { before: `${author} (${year}). `, title, after: ` [Interactive diagram]. ${site}.`, url };
}
// The year the app was last updated ("November 2026" gives 2026); this year if that isn't set.
export const creditYear = (lastUpdated, now = new Date()) => (String(lastUpdated || "").match(/\b(19|20)\d\d\b/) || [now.getFullYear()])[0];

// Words into lines of at most `max` characters.
export function wrap(text, max) {
  const lines = [];
  let line = "";
  for (const word of String(text).split(/\s+/).filter(Boolean)) {
    if (line && (line + " " + word).length > max) { lines.push(line); line = word; }
    else line = line ? line + " " + word : word;
  }
  if (line) lines.push(line);
  return lines;
}

// An opacity as a number: 0 stays 0 (a glow that fades to nothing), and anything unreadable counts as solid.
const opacity = value => { const n = parseFloat(value); return Number.isNaN(n) ? 1 : n; };

// A computed colour as a plain paint and a separate opacity ("rgba(0, 0, 0, 0.5)" gives "rgb(0,0,0)" and 0.5).
function paint(value) {
  const m = String(value).match(/^rgba?\(\s*([\d.]+)[,\s]+([\d.]+)[,\s]+([\d.]+)(?:\s*[,/]\s*([\d.]+)(%?))?\s*\)$/);
  if (!m) return { colour: String(value).replace(/url\(["']?[^#)]*#([^"')]+)["']?\)/, "url(#$1)"), alpha: 1 };
  const alpha = m[4] === undefined ? 1 : m[5] ? +m[4] / 100 : +m[4];
  return { colour: `rgb(${Math.round(m[1])},${Math.round(m[2])},${Math.round(m[3])})`, alpha };
}

// A copy of one drawing with every style written onto its elements, and anything hidden removed.
function plainCopy(svg) {
  const copy = svg.cloneNode(true);
  const from = [svg, ...svg.querySelectorAll("*")], to = [copy, ...copy.querySelectorAll("*")];
  const drop = [];
  from.forEach((a, i) => {
    const b = to[i], tag = a.tagName.toLowerCase();
    if (tag === "title" || tag === "desc") { drop.push(b); return; }
    const cs = getComputedStyle(a);
    const drawn = !a.closest(NEVER_DRAWN);
    if (drawn && i > 0 && (cs.display === "none" || cs.visibility === "hidden" || +cs.opacity === 0)) { drop.push(b); return; }

    if (drawn && +cs.opacity < 1) b.setAttribute("opacity", num(cs.opacity));
    // A transform set in CSS becomes a plain attribute, worked out from where the element actually sits.
    if (drawn && i > 0 && cs.transform && cs.transform !== "none" && a.getCTM && a.parentNode.getCTM) {
      const outer = a.parentNode.getCTM(), own = a.getCTM();
      if (outer && own) {
        const m = outer.inverse().multiply(own);
        b.setAttribute("transform", `matrix(${[m.a, m.b, m.c, m.d, m.e, m.f].map(num).join(" ")})`);
      }
    }
    if (LEAVES.has(tag)) {
      if (tag === "stop") {
        const p = paint(cs.stopColor);
        b.setAttribute("stop-color", p.colour);
        b.setAttribute("stop-opacity", num(p.alpha * opacity(cs.stopOpacity)));
      } else if (tag !== "image") {
        const isText = tag === "text" || tag === "tspan";
        const fill = paint(cs.fill), stroke = paint(isText ? "none" : cs.stroke);   // labels are filled, never outlined
        b.setAttribute("fill", fill.colour);
        const fo = fill.alpha * opacity(cs.fillOpacity);
        if (fill.colour !== "none" && fo < 1) b.setAttribute("fill-opacity", num(fo));
        b.setAttribute("stroke", stroke.colour);
        if (stroke.colour !== "none") {
          b.setAttribute("stroke-width", num(parseFloat(cs.strokeWidth)));
          const so = stroke.alpha * opacity(cs.strokeOpacity);
          if (so < 1) b.setAttribute("stroke-opacity", num(so));
          if (cs.strokeDasharray && cs.strokeDasharray !== "none") b.setAttribute("stroke-dasharray", cs.strokeDasharray.replace(/px/g, ""));
          if (cs.strokeLinecap !== "butt") b.setAttribute("stroke-linecap", cs.strokeLinecap);
          if (cs.strokeLinejoin !== "miter") b.setAttribute("stroke-linejoin", cs.strokeLinejoin);
        }
        if (tag === "circle" && parseFloat(cs.r)) b.setAttribute("r", num(parseFloat(cs.r)));   // some radii are set in CSS
        if (isText) {
          const size = parseFloat(cs.fontSize) || 12;
          b.setAttribute("font-family", /Figtree/.test(cs.fontFamily) ? `Figtree, ${FONT}` : FONT);
          b.setAttribute("font-size", num(size));
          if (cs.fontWeight !== "400") b.setAttribute("font-weight", cs.fontWeight);
          if (cs.fontStyle !== "normal") b.setAttribute("font-style", cs.fontStyle);
          if (tag === "text") {
            if (cs.textAnchor !== "start") b.setAttribute("text-anchor", cs.textAnchor);
            // PowerPoint ignores dominant-baseline, so a vertically centred label is moved down by hand.
            if (/central|middle/.test(cs.dominantBaseline)) b.setAttribute("dy", num((parseFloat(a.getAttribute("dy")) || 0) + size * 0.35));
          }
          b.removeAttribute("dominant-baseline");
        }
      }
    }
    for (const attr of [...b.attributes]) if (/^(class|style|role|tabindex|data-|aria-)/.test(attr.name)) b.removeAttribute(attr.name);
  });
  drop.forEach(n => n.remove());
  return copy;
}

// The drawings in a diagram: its SVGs and canvases that are on screen, not icons or hidden views.
export function graphics(box) {
  return [...box.querySelectorAll("svg[viewBox], canvas")].filter(g => {
    if (g.closest("button, .mark, [hidden]")) return false;
    const r = g.getBoundingClientRect();
    return r.width >= 120 && r.height >= 40;
  });
}
// The diagram's own words about its current state: the summary sentence, or the caption of a stepped diagram.
function words(box) {
  return [...box.querySelectorAll("p.summary, .caption")]
    .filter(n => !n.closest("[hidden]") && n.getClientRects().length)
    .map(n => {
      // innerText leaves out invisible copies (a stepped caption keeps one of every step, to hold its height steady).
      const lines = n.innerText.split(/\n+/).map(s => s.replace(/\s+/g, " ").trim()).filter(Boolean);
      return lines.length > 1 && n.matches(".caption") ? `${lines[0]}: ${lines.slice(1).join(" ")}` : lines.join(" ");
    }).filter(Boolean);
}

// Runs fn with the app in its light theme and nothing mid-fade, then puts the theme back. Canvases that follow the theme
// get a moment to redraw first.
async function inLightTheme(fn) {
  const root = document.documentElement, had = root.dataset.theme;
  root.classList.add("exporting");
  root.dataset.theme = "light";
  await new Promise(r => setTimeout(r, 80));
  try { return fn(); } finally {
    if (had === undefined) delete root.dataset.theme; else root.dataset.theme = had;
    await new Promise(r => setTimeout(r, 0));
    root.classList.remove("exporting");
  }
}

// The whole picture as SVG text. credit: from apaCredit().
export function diagramSvg(box, { title, credit }) {
  return inLightTheme(() => {
    // Colours come from the light theme's own tokens, read while it is switched on.
    const token = name => getComputedStyle(document.documentElement).getPropertyValue(name).trim();
    const ink = token("--ink"), grey = token("--muted"), rule = token("--line"), paper = token("--surface");
    const serial = new XMLSerializer();
    const inner = WIDTH - 2 * PAD;
    const parts = [];
    let y = PAD;
    const text = (str, size, { weight = 400, fill = ink, gap = 0 } = {}) => {
      y += gap + size;
      parts.push(`<text x="${PAD}" y="${num(y)}" font-family="${FONT}" font-size="${size}" font-weight="${weight}" fill="${fill}">${str}</text>`);
      y += size * 0.35;
    };
    text(xml(title), 20, { weight: 600 });
    y += 10;

    graphics(box).forEach((g, k) => {
      const isSvg = g.tagName.toLowerCase() === "svg";
      const vb = isSvg ? g.viewBox.baseVal : { x: 0, y: 0, width: g.width, height: g.height };
      const s = inner / vb.width, h = vb.height * s;
      if (isSvg) {
        const copy = plainCopy(g);
        parts.push(`<clipPath id="rp-clip-${k}"><rect x="${PAD}" y="${num(y)}" width="${inner}" height="${num(h)}"/></clipPath>` +
          `<g clip-path="url(#rp-clip-${k})"><g transform="translate(${num(PAD - vb.x * s)} ${num(y - vb.y * s)}) scale(${num(s)})">${[...copy.childNodes].map(n => serial.serializeToString(n)).join("")}</g></g>`);
      } else {
        const data = g.toDataURL("image/png");
        parts.push(`<image x="${PAD}" y="${num(y)}" width="${inner}" height="${num(h)}" href="${data}" xlink:href="${data}"/>`);
      }
      y += h + 12;
    });

    for (const sentence of words(box)) wrap(sentence, 112).forEach((line, i) => text(xml(line), 13, { gap: i ? 2 : 6 }));

    y += 8;
    parts.push(`<line x1="${PAD}" y1="${num(y)}" x2="${WIDTH - PAD}" y2="${num(y)}" stroke="${rule}" stroke-width="1"/>`);
    const whole = credit.before + credit.title + credit.after;
    if (whole.length <= 118) text(`${xml(credit.before)}<tspan font-style="italic" font-size="11" font-weight="400">${xml(credit.title)}</tspan>${xml(credit.after)}`, 11, { fill: grey, gap: 8 });
    else {   // a long title: wrap the credit, keeping the italics where the title falls
      let used = 0;
      wrap(whole, 118).forEach((ln, i) => {
        const start = whole.indexOf(ln, used), a = Math.max(credit.before.length, start), b = Math.min(credit.before.length + credit.title.length, start + ln.length);
        used = start + ln.length;
        const marked = a < b ? `${xml(whole.slice(start, a))}<tspan font-style="italic" font-size="11" font-weight="400">${xml(whole.slice(a, b))}</tspan>${xml(whole.slice(b, start + ln.length))}` : xml(ln);
        text(marked, 11, { fill: grey, gap: i ? 2 : 8 });
      });
    }
    if (credit.url) text(xml(credit.url), 11, { fill: grey, gap: 2 });
    const height = Math.ceil(y + PAD - 8);

    return `<?xml version="1.0" encoding="UTF-8"?>\n<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="${WIDTH}" height="${height}" viewBox="0 0 ${WIDTH} ${height}">` +
      `<rect width="${WIDTH}" height="${height}" fill="${paper}"/>${parts.join("")}</svg>`;
  });
}

// The same picture as a PNG, twice the size so it stays sharp on a large screen.
export function svgToPng(svg, scale = 2) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.width * scale; canvas.height = img.height * scale;
      canvas.getContext("2d").drawImage(img, 0, 0, canvas.width, canvas.height);
      canvas.toBlob(b => b ? resolve(b) : reject(new Error("The picture could not be made.")), "image/png");
    };
    img.onerror = () => reject(new Error("The picture could not be made."));
    img.src = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svg);
  });
}

export function save(blob, name) {
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = name;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 10000);
}
