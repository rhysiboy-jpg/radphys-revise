// Shared sorting activity: each card is filed into one of several bins, and each answer explains itself.
// Used by the legislation, consent and QA sorters. Cards are [text, binKey, why]; ordered keeps them in sequence (a journey)
// instead of shuffling.

export function mountSort(root, { cards, bins, intro = "", ordered = false, prompt = "Choose one for each card.", aside = "" }) {
  root.innerHTML = `
<div class="grid">
  <div class="stage sort-stage">
    ${intro ? `<p class="sort-intro">${intro}</p>` : ""}
    <p class="sort-progress" data-role="progress" aria-live="polite"></p>
    <ol class="sort-list${ordered ? " is-ordered" : ""}" data-role="list"></ol>
    <div class="controls"><button type="button" data-role="again">${ordered ? "Start again" : "Shuffle and start again"}</button></div>
  </div>
  <div class="panel">${aside}</div>
</div>`;
  const $ = r => root.querySelector(`[data-role="${r}"]`);
  const keys = Object.keys(bins);
  let done = 0, right = 0;

  function progress() {
    $("progress").textContent = done === cards.length
      ? `All ${cards.length} done: ${right} right.${right === cards.length ? " Every one." : ` ${ordered ? "Start again" : "Shuffle"} to try again.`}`
      : `${done} of ${cards.length} done${done ? `, ${right} right` : ""}. ${prompt}`;
  }

  function start() {
    const order = ordered ? cards.slice() : cards.map(c => [Math.random(), c]).sort((a, b) => a[0] - b[0]).map(([, c]) => c);
    done = 0; right = 0;
    const list = $("list");
    list.innerHTML = "";
    order.forEach(([text, key, why]) => {
      const li = document.createElement("li");
      li.className = "sort-card";
      li.innerHTML = `<p class="sort-text"></p>
        <div class="controls" role="group"></div>
        <p class="sort-why" hidden></p>`;
      li.querySelector(".sort-text").innerHTML = text;
      const group = li.querySelector(".controls");
      group.setAttribute("aria-label", li.querySelector(".sort-text").textContent);
      keys.forEach(k => {
        const b = document.createElement("button");
        b.type = "button"; b.dataset.k = k; b.textContent = bins[k];
        group.appendChild(b);
      });
      group.querySelectorAll("button").forEach(b => b.addEventListener("click", () => {
        const ok = b.dataset.k === key;
        done++; if (ok) right++;
        li.classList.add(ok ? "is-correct" : "is-wrong");
        group.querySelectorAll("button").forEach(x => { x.disabled = true; x.setAttribute("aria-pressed", x === b); });
        const w = li.querySelector(".sort-why");
        w.innerHTML = `<b>${ok ? "Right" : "Not quite"}: ${bins[key]}.</b> ${why}`;
        w.hidden = false;
        progress();
      }));
      list.appendChild(li);
    });
    progress();
  }

  $("again").addEventListener("click", start);
  start();
}
