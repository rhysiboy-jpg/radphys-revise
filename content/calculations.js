// Randomised calculation questions. Each template makes a new version of the question every time.
// status: "draft" (shown only in review mode), "approved" (shown to students) or "rejected".
// Answers within `tolerance` (a fraction: 0.02 = ±2%) are marked correct.

const pick = arr => arr[Math.floor(Math.random() * arr.length)];
const fmt = (x, dp = 2) => String(+x.toFixed(dp));

export default [
  {
    id: "CALC-ISL-1",
    topic: "protection",
    subtopic: "Inverse square law",
    difficulty: "core",
    status: "draft",
    generate() {
      const d1 = pick([1, 2]);
      const d2 = d1 * pick([1.5, 2, 2.5, 3, 4]);
      const i1 = pick([40, 60, 80, 100, 120, 200, 240]);
      const i2 = i1 * (d1 / d2) ** 2;
      return {
        question: `The scattered dose rate ${d1} m from a patient during fluoroscopy is ${i1} µGy/h. What is the dose rate at ${fmt(d2)} m?`,
        answer: i2, unit: "µGy/h", tolerance: 0.02,
        working: [
          "Inverse square law: I₂ = I₁ × (d₁ ÷ d₂)²",
          `I₂ = ${i1} × (${d1} ÷ ${fmt(d2)})²`,
          `I₂ = ${i1} × ${fmt((d1 / d2) ** 2, 4)}`,
          `I₂ = ${fmt(i2)} µGy/h`,
        ],
        explanation: "Moving further away spreads the radiation over a larger area, so the dose rate falls with the square of the distance. This is why distance is one of the three main ways to cut staff dose, along with time and shielding.",
      };
    },
  },
  {
    id: "CALC-ISL-2",
    topic: "protection",
    subtopic: "Inverse square law",
    difficulty: "core",
    status: "draft",
    generate() {
      const d1 = pick([100, 110, 150, 180]);
      let d2 = pick([90, 100, 120, 150, 180, 200]);
      if (d2 === d1) d2 = d1 + 50;
      const i1 = pick([20, 30, 40, 50, 60]);
      const i2 = i1 * (d1 / d2) ** 2;
      return {
        question: `At a focus-to-receptor distance (FRD) of ${d1} cm the intensity at the receptor is ${i1} units. The FRD is changed to ${d2} cm with the same exposure factors. What is the new intensity?`,
        answer: i2, unit: "units", tolerance: 0.02,
        working: [
          "Inverse square law: I₂ = I₁ × (d₁ ÷ d₂)²",
          `I₂ = ${i1} × (${d1} ÷ ${d2})²`,
          `I₂ = ${i1} × ${fmt((d1 / d2) ** 2, 4)}`,
          `I₂ = ${fmt(i2)} units`,
        ],
        explanation: d2 > d1
          ? "Increasing the FRD spreads the beam over a larger area, so less radiation reaches each part of the receptor."
          : "Reducing the FRD concentrates the beam on a smaller area, so intensity at the receptor rises.",
      };
    },
  },
  {
    id: "CALC-ISL-3",
    topic: "protection",
    subtopic: "Inverse square law",
    difficulty: "stretch",
    status: "draft",
    generate() {
      const mas1 = pick([5, 8, 10, 16, 20, 25]);
      const d1 = 100;
      const d2 = pick([80, 110, 120, 150, 180]);
      const mas2 = mas1 * (d2 / d1) ** 2;
      return {
        question: `A projection uses ${mas1} mAs at ${d1} cm FRD. The FRD must be changed to ${d2} cm. What mAs keeps the same intensity at the receptor (kV unchanged)?`,
        answer: mas2, unit: "mAs", tolerance: 0.02,
        working: [
          "To compensate, mAs changes with the square of the distance: mAs₂ = mAs₁ × (d₂ ÷ d₁)²",
          `mAs₂ = ${mas1} × (${d2} ÷ ${d1})²`,
          `mAs₂ = ${mas1} × ${fmt((d2 / d1) ** 2, 4)}`,
          `mAs₂ = ${fmt(mas2, 1)} mAs`,
        ],
        explanation: "The ratio is flipped compared with the inverse square law. A longer distance loses intensity, so the mAs must go up by the square of the distance ratio to make up for it.",
      };
    },
  },
  {
    id: "CALC-ISL-4",
    topic: "protection",
    subtopic: "Inverse square law",
    difficulty: "core",
    status: "draft",
    generate() {
      const d1 = pick([0.5, 1]);
      const k = pick([2, 3, 4]);
      const d2 = d1 * k;
      return {
        question: `A radiographer moves from ${d1} m to ${fmt(d2)} m from the patient during a mobile exposure. By what factor does the scattered dose rate they receive fall?`,
        answer: k * k, unit: "times lower", tolerance: 0.001,
        working: [
          `The distance has increased by a factor of ${fmt(d2)} ÷ ${d1} = ${k}`,
          `Inverse square law: dose rate falls by ${k}² = ${k * k}`,
        ],
        explanation: `Multiplying the distance by ${k} cuts the dose rate to 1/${k * k} of its value. Small steps back from the patient make a big difference.`,
      };
    },
  },
  {
    id: "CALC-HVL-1",
    topic: "interactions",
    subtopic: "Half-value layer",
    difficulty: "core",
    status: "draft",
    generate() {
      const hvl = pick([2, 2.5, 3, 4]);
      const n = pick([1, 2, 3, 4]);
      const t = hvl * n;
      const pct = 100 / 2 ** n;
      return {
        question: `A beam has a half-value layer (HVL) of ${hvl} mm Al. What percentage of the beam's intensity gets through ${fmt(t)} mm Al?`,
        answer: pct, unit: "%", tolerance: 0.01,
        working: [
          `Number of HVLs = ${fmt(t)} ÷ ${hvl} = ${n}`,
          `Each HVL halves the intensity: 100% → ${Array.from({ length: n }, (_, i) => fmt(100 / 2 ** (i + 1)) + "%").join(" → ")}`,
          `Transmitted = ${fmt(pct)}%`,
        ],
        explanation: "The HVL is the thickness of material that reduces the beam intensity to half. Each extra HVL halves what's left.",
      };
    },
  },
];
