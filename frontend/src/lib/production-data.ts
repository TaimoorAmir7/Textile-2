export type FamilySlug = "woven" | "knits-hosiery";
export type StageSlug =
  | "greige"
  | "pre-treatment"
  | "dyeing"
  | "printing"
  | "finishing"
  | "folding-rolling";

export type QualityState = "passed" | "watch" | "failed" | "pending";
export type BatchStatus = "In process" | "Quality review" | "On hold" | "Released" | "Rework";
export type DefectSeverity = "Critical" | "Major" | "Minor";

export type StageProfile = {
  machine: string;
  image: string;
  fabricState: string;
  qualityFocus: string[];
  risks: string[];
};

export type ProductionStage = {
  slug: StageSlug;
  order: number;
  label: string;
  shortLabel: string;
  icon: string;
  whatHappens: string;
  profiles: Record<FamilySlug, StageProfile>;
};

export type FabricFamily = {
  slug: FamilySlug;
  name: string;
  shortName: string;
  product: string;
  unit: "m" | "kg";
  construction: string;
  description: string;
  challenges: string[];
  accent: string;
};

export type ChecklistResult = {
  label: string;
  value: string;
  target: string;
  state: QualityState;
};

export type StageRun = {
  stage: StageSlug;
  status: "complete" | "current" | "blocked" | "upcoming";
  enteredAt?: string;
  completedAt?: string;
  machineRef: string;
  operator: string;
  checklist: ChecklistResult[];
};

export type ProductionBatch = {
  id: string;
  lotCode: string;
  familySlug: FamilySlug;
  product: string;
  article: string;
  shade: string;
  quantity: number;
  unit: "m" | "kg";
  currentStage: StageSlug;
  status: BatchStatus;
  qualityScore: number;
  dueDate: string;
  customer: string;
  stageRuns: StageRun[];
};

export type DefectEvent = {
  id: string;
  title: string;
  severity: DefectSeverity;
  status: "New" | "Under review" | "Contained" | "Closed";
  batchId: string;
  detectedStage: StageSlug;
  suspectedStage: StageSlug;
  affectedQuantity: number;
  unit: "m" | "kg";
  detectedAt: string;
  observation: string;
  rationale: string;
  evidence: string[];
  actions: string[];
  disposition: "Hold" | "Rework" | "Downgrade" | "Release pending" | "Released";
};

export const FAMILIES: FabricFamily[] = [
  {
    slug: "woven",
    name: "Woven Production",
    shortName: "Woven",
    product: "Bedsheets and open-width home textiles",
    unit: "m",
    construction: "Interlaced warp and weft yarns",
    description:
      "Open-width fabric production controlled in meters, with quality gates for construction, shade continuity, print registration and dimensional stability.",
    challenges: ["Width and GSM consistency", "Bow and skew", "Shade continuity", "Print registration", "Roll build quality"],
    accent: "text-secondary",
  },
  {
    slug: "knits-hosiery",
    name: "Knits / Hosiery Production",
    shortName: "Knits / Hosiery",
    product: "Pillow-cover and flexible home-textile fabric",
    unit: "kg",
    construction: "Interlocking yarn loops",
    description:
      "Low-tension knit processing controlled in kilograms, with additional attention to barré, GSM-driven shade variation, spirality and shrinkage.",
    challenges: ["Barré", "GSM variation", "Rope and crease marks", "Spirality", "Dimensional instability"],
    accent: "text-warning",
  },
];

export const STAGES: ProductionStage[] = [
  {
    slug: "greige",
    order: 1,
    label: "Greige inspection",
    shortLabel: "Greige",
    icon: "texture",
    whatHappens: "Raw fabric is received from weaving or knitting and inspected before wet processing.",
    profiles: {
      woven: {
        machine: "Air-jet loom and greige take-up",
        image: "/machines/ht-woven-greige-airjet.png",
        fabricState: "Open-width greige roll measured in meters",
        qualityFocus: ["Width", "Construction", "Defect points", "Roll identity"],
        risks: ["Knots", "Missing yarn", "Weave faults", "Uneven GSM"],
      },
      "knits-hosiery": {
        machine: "Circular knitting and knit-roll take-up",
        image: "/machines/ht-knit-greige-circular.png",
        fabricState: "Tubular or open knit roll measured in kilograms",
        qualityFocus: ["GSM", "Diameter", "Loop condition", "Lot identity"],
        risks: ["Barré", "Needle lines", "Holes", "Uneven GSM"],
      },
    },
  },
  {
    slug: "pre-treatment",
    order: 2,
    label: "Pre-treatment",
    shortLabel: "Pre-treatment",
    icon: "water_drop",
    whatHappens: "Desizing, scouring and bleaching remove size, oils and impurities and prepare uniform absorbency.",
    profiles: {
      woven: {
        machine: "Continuous open-width bleaching range",
        image: "/machines/ht-woven-pretreat-bleach-range.png",
        fabricState: "Clean, absorbent and uniformly white open-width fabric",
        qualityFocus: ["Residual size", "Absorbency", "Whiteness", "Final pH"],
        risks: ["Incomplete desizing", "Uneven bleach", "Chemical streaks", "Strength loss"],
      },
      "knits-hosiery": {
        machine: "Soft-flow scour and bleach machine",
        image: "/machines/ht-knit-pretreat-softflow.png",
        fabricState: "Prepared knit fabric circulating in low-tension rope form",
        qualityFocus: ["Absorbency", "Whiteness", "pH", "Crease control"],
        risks: ["Uneven preparation", "Rope marks", "Residual oils", "Chemical damage"],
      },
    },
  },
  {
    slug: "dyeing",
    order: 3,
    label: "Dyeing",
    shortLabel: "Dyeing",
    icon: "palette",
    whatHappens: "The batch is dyed to its target shade and checked for uniformity and fixation.",
    profiles: {
      woven: {
        machine: "Open-width jigger dyeing machine",
        image: "/machines/ht-woven-dye-jigger.png",
        fabricState: "Open-width fabric passing repeatedly through the dye bath",
        qualityFocus: ["Target shade", "Side-to-side shade", "Fixation", "Crease freedom"],
        risks: ["Ending or listing", "Shade variation", "Tension marks", "Poor fixation"],
      },
      "knits-hosiery": {
        machine: "Soft-flow knit dyeing machine",
        image: "/machines/ht-knit-dye-softflow.png",
        fabricState: "Knitted fabric dyed in circulating rope form",
        qualityFocus: ["Shade", "Barré", "Fixation", "Crease marks"],
        risks: ["Barré", "Rope marks", "Batch shade variation", "Poor fixation"],
      },
    },
  },
  {
    slug: "printing",
    order: 4,
    label: "Printing",
    shortLabel: "Printing",
    icon: "format_paint",
    whatHappens: "Pattern and colour are applied, aligned, fixed and checked against the approved design.",
    profiles: {
      woven: {
        machine: "Rotary screen printing line",
        image: "/machines/ht-woven-print-rotary.png",
        fabricState: "Open-width printed bedsheet fabric",
        qualityFocus: ["Registration", "Repeat", "Colour match", "Print sharpness"],
        risks: ["Misprint", "Pattern misalignment", "Colour bleed", "Stop marks"],
      },
      "knits-hosiery": {
        machine: "Digital inkjet textile printer",
        image: "/machines/ht-knit-print-digital.png",
        fabricState: "Printed knit fabric supported in open width",
        qualityFocus: ["Registration", "Stretch distortion", "Colour yield", "Curing"],
        risks: ["Misalignment", "Distortion", "Colour bleed", "Banding"],
      },
    },
  },
  {
    slug: "finishing",
    order: 5,
    label: "Finishing",
    shortLabel: "Finishing",
    icon: "auto_fix_high",
    whatHappens: "Fabric is softened, stabilised and brought to its final width, handle and shrinkage specification.",
    profiles: {
      woven: {
        machine: "Open-width stenter",
        image: "/machines/ht-woven-finish-stenter.png",
        fabricState: "Printed fabric held to controlled width through heated chambers",
        qualityFocus: ["Finished width", "Shrinkage", "Bow and skew", "Chemical residue"],
        risks: ["Width drift", "Skew or bow", "Over-drying", "Residual shrinkage"],
      },
      "knits-hosiery": {
        machine: "Felt-belt knit compactor",
        image: "/machines/ht-knit-finish-compactor.png",
        fabricState: "Relaxed and compacted knit fabric with controlled GSM",
        qualityFocus: ["GSM", "Shrinkage", "Spirality", "Width and handle"],
        risks: ["Shrinkage", "Spirality", "GSM drift", "Glazing"],
      },
    },
  },
  {
    slug: "folding-rolling",
    order: 6,
    label: "Folding / Rolling",
    shortLabel: "Folding / Rolling",
    icon: "inventory_2",
    whatHappens: "Final fabric is inspected, measured, labelled and folded or rolled for release.",
    profiles: {
      woven: {
        machine: "Automatic sheeting folder and roller",
        image: "/machines/ht-woven-fold-roll.png",
        fabricState: "Finished bedsheet fabric folded or rolled in meters",
        qualityFocus: ["Length", "Shade continuity", "Final appearance", "Label accuracy"],
        risks: ["Wrong length", "Missed defect", "Edge misalignment", "Label mismatch"],
      },
      "knits-hosiery": {
        machine: "Knit rolling and plaiting machine",
        image: "/machines/ht-knit-fold-roll.png",
        fabricState: "Finished knit fabric plaited or rolled and weighed",
        qualityFocus: ["Final weight", "Width", "Appearance", "Lot accuracy"],
        risks: ["Wrong weight", "Telescoping", "Missed defect", "Label mismatch"],
      },
    },
  },
];

const emptyChecklist = (stage: StageSlug): ChecklistResult[] => {
  const checks: Record<StageSlug, ChecklistResult[]> = {
    greige: [
      { label: "Visual fabric inspection", value: "Passed", target: "No major faults", state: "passed" },
      { label: "Lot identity", value: "Verified", target: "Match order", state: "passed" },
    ],
    "pre-treatment": [
      { label: "Absorbency", value: "2.8 s", target: "≤ 3.0 s", state: "passed" },
      { label: "Final pH", value: "7.1", target: "6.5–7.5", state: "passed" },
      { label: "Whiteness variation", value: "0.9%", target: "≤ 1.5%", state: "passed" },
    ],
    dyeing: [
      { label: "Shade difference", value: "0.42 ΔE", target: "≤ 0.80 ΔE", state: "passed" },
      { label: "Fixation", value: "Pass", target: "Pass", state: "passed" },
      { label: "Crease marks", value: "None", target: "None", state: "passed" },
    ],
    printing: [
      { label: "Registration error", value: "0.6 mm", target: "≤ 1.0 mm", state: "passed" },
      { label: "Colour bleed", value: "None", target: "None", state: "passed" },
      { label: "Repeat accuracy", value: "Pass", target: "Pass", state: "passed" },
    ],
    finishing: [
      { label: "Shrinkage", value: "2.8%", target: "≤ 3.0%", state: "passed" },
      { label: "Width", value: "244 cm", target: "244 ± 2 cm", state: "passed" },
      { label: "Chemical residue", value: "Pass", target: "Pass", state: "passed" },
    ],
    "folding-rolling": [
      { label: "Final inspection", value: "Passed", target: "Pass", state: "passed" },
      { label: "Quantity verified", value: "Verified", target: "Match order", state: "passed" },
      { label: "Label and lot", value: "Verified", target: "Match batch", state: "passed" },
    ],
  };
  return checks[stage].map((item) => ({ ...item }));
};

function makeRuns(current: StageSlug, family: FamilySlug): StageRun[] {
  const currentOrder = STAGES.find((stage) => stage.slug === current)?.order ?? 1;
  return STAGES.map((stage) => ({
    stage: stage.slug,
    status: stage.order < currentOrder ? "complete" : stage.order === currentOrder ? "current" : "upcoming",
    enteredAt: stage.order <= currentOrder ? `2026-09-${String(stage.order + 2).padStart(2, "0")}T08:00:00Z` : undefined,
    completedAt: stage.order < currentOrder ? `2026-09-${String(stage.order + 2).padStart(2, "0")}T16:30:00Z` : undefined,
    machineRef: `${family === "woven" ? "WV" : "KN"}-${String(stage.order).padStart(2, "0")}`,
    operator: ["A. Raza", "S. Khan", "M. Iqbal", "H. Noor", "F. Ali", "N. Ahmed"][stage.order - 1],
    checklist: stage.order <= currentOrder ? emptyChecklist(stage.slug) : [],
  }));
}

export const BATCHES: ProductionBatch[] = [
  {
    id: "batch-wv-24091", lotCode: "WV-24091", familySlug: "woven", product: "King bedsheet", article: "Percale 200 TC", shade: "Indigo Botanical", quantity: 4820, unit: "m", currentStage: "finishing", status: "Quality review", qualityScore: 92, dueDate: "2026-09-12", customer: "Northstar Home", stageRuns: makeRuns("finishing", "woven"),
  },
  {
    id: "batch-wv-24094", lotCode: "WV-24094", familySlug: "woven", product: "Queen bedsheet", article: "Sateen 300 TC", shade: "Warm Sand", quantity: 3650, unit: "m", currentStage: "printing", status: "On hold", qualityScore: 81, dueDate: "2026-09-13", customer: "Maison Living", stageRuns: makeRuns("printing", "woven"),
  },
  {
    id: "batch-wv-24097", lotCode: "WV-24097", familySlug: "woven", product: "Flat sheet", article: "Percale 180 TC", shade: "Optic White", quantity: 5210, unit: "m", currentStage: "pre-treatment", status: "In process", qualityScore: 96, dueDate: "2026-09-15", customer: "Cedar & Loom", stageRuns: makeRuns("pre-treatment", "woven"),
  },
  {
    id: "batch-wv-24101", lotCode: "WV-24101", familySlug: "woven", product: "Super king duvet cover", article: "Twill 220 TC", shade: "Mineral Green", quantity: 4440, unit: "m", currentStage: "greige", status: "Quality review", qualityScore: 88, dueDate: "2026-09-17", customer: "Hearth & Haven", stageRuns: makeRuns("greige", "woven"),
  },
  {
    id: "batch-wv-24103", lotCode: "WV-24103", familySlug: "woven", product: "Hotel flat sheet", article: "Percale 180 TC", shade: "Smoke Blue", quantity: 5860, unit: "m", currentStage: "dyeing", status: "In process", qualityScore: 93, dueDate: "2026-09-16", customer: "Meridian Hospitality", stageRuns: makeRuns("dyeing", "woven"),
  },
  {
    id: "batch-wv-24105", lotCode: "WV-24105", familySlug: "woven", product: "Single bedsheet", article: "Percale 144 TC", shade: "Sky Stripe", quantity: 6120, unit: "m", currentStage: "folding-rolling", status: "On hold", qualityScore: 84, dueDate: "2026-09-14", customer: "Cedar & Loom", stageRuns: makeRuns("folding-rolling", "woven"),
  },
  {
    id: "batch-kn-18042", lotCode: "KN-18042", familySlug: "knits-hosiery", product: "Jersey pillow cover", article: "Single Jersey 160 GSM", shade: "Deep Navy", quantity: 940, unit: "kg", currentStage: "dyeing", status: "On hold", qualityScore: 78, dueDate: "2026-09-12", customer: "SoftForm Home", stageRuns: makeRuns("dyeing", "knits-hosiery"),
  },
  {
    id: "batch-kn-18045", lotCode: "KN-18045", familySlug: "knits-hosiery", product: "Stretch pillow cover", article: "Interlock 220 GSM", shade: "Terracotta Floral", quantity: 720, unit: "kg", currentStage: "finishing", status: "Rework", qualityScore: 84, dueDate: "2026-09-14", customer: "Atelier Rest", stageRuns: makeRuns("finishing", "knits-hosiery"),
  },
  {
    id: "batch-kn-18049", lotCode: "KN-18049", familySlug: "knits-hosiery", product: "Jersey pillow cover", article: "Single Jersey 180 GSM", shade: "Natural", quantity: 880, unit: "kg", currentStage: "greige", status: "In process", qualityScore: 98, dueDate: "2026-09-16", customer: "SoftForm Home", stageRuns: makeRuns("greige", "knits-hosiery"),
  },
  {
    id: "batch-kn-18052", lotCode: "KN-18052", familySlug: "knits-hosiery", product: "Printed pillow cover", article: "Interlock 200 GSM", shade: "Clay Geometry", quantity: 760, unit: "kg", currentStage: "printing", status: "Quality review", qualityScore: 86, dueDate: "2026-09-15", customer: "Atelier Rest", stageRuns: makeRuns("printing", "knits-hosiery"),
  },
  {
    id: "batch-kn-18055", lotCode: "KN-18055", familySlug: "knits-hosiery", product: "Mattress protector", article: "Pique 210 GSM", shade: "Optic White", quantity: 1120, unit: "kg", currentStage: "folding-rolling", status: "On hold", qualityScore: 82, dueDate: "2026-09-13", customer: "Northstar Home", stageRuns: makeRuns("folding-rolling", "knits-hosiery"),
  },
  {
    id: "batch-kn-18057", lotCode: "KN-18057", familySlug: "knits-hosiery", product: "Cushion cover", article: "Double Knit 240 GSM", shade: "Graphite", quantity: 680, unit: "kg", currentStage: "pre-treatment", status: "Quality review", qualityScore: 89, dueDate: "2026-09-17", customer: "SoftForm Home", stageRuns: makeRuns("pre-treatment", "knits-hosiery"),
  },
];

// Seed realistic checklist exceptions that explain the quality-event trail.
BATCHES.find((batch) => batch.id === "batch-wv-24094")!.stageRuns.find((run) => run.stage === "pre-treatment")!.checklist = [
  { label: "Absorbency", value: "4.6 s", target: "≤ 3.0 s", state: "failed" },
  { label: "Final pH", value: "7.4", target: "6.5–7.5", state: "passed" },
  { label: "Whiteness variation", value: "2.3%", target: "≤ 1.5%", state: "failed" },
];
BATCHES.find((batch) => batch.id === "batch-kn-18042")!.stageRuns.find((run) => run.stage === "greige")!.checklist = [
  { label: "GSM variation", value: "±8.2%", target: "≤ ±5.0%", state: "failed" },
  { label: "Barré inspection", value: "Watch", target: "No visible bands", state: "watch" },
  { label: "Lot identity", value: "Verified", target: "Match order", state: "passed" },
];
BATCHES.find((batch) => batch.id === "batch-kn-18045")!.stageRuns.find((run) => run.stage === "finishing")!.checklist = [
  { label: "Shrinkage", value: "5.4%", target: "≤ 4.0%", state: "failed" },
  { label: "Spirality", value: "4.1%", target: "≤ 3.0%", state: "failed" },
  { label: "Finished GSM", value: "216", target: "220 ± 5", state: "passed" },
];
BATCHES.find((batch) => batch.id === "batch-wv-24101")!.stageRuns.find((run) => run.stage === "greige")!.checklist = [
  { label: "Defect points", value: "21 / 100 m", target: "≤ 12 / 100 m", state: "failed" },
  { label: "Width", value: "243.5 cm", target: "244 ± 2 cm", state: "passed" },
  { label: "Warp-line inspection", value: "Review", target: "No continuous lines", state: "watch" },
];
BATCHES.find((batch) => batch.id === "batch-wv-24097")!.stageRuns.find((run) => run.stage === "pre-treatment")!.checklist = [
  { label: "Residual size", value: "1.1%", target: "≤ 0.5%", state: "failed" },
  { label: "Absorbency", value: "3.7 s", target: "≤ 3.0 s", state: "watch" },
  { label: "Final pH", value: "7.1", target: "6.5–7.5", state: "passed" },
];
BATCHES.find((batch) => batch.id === "batch-wv-24105")!.stageRuns.find((run) => run.stage === "finishing")!.checklist = [
  { label: "Bow", value: "3.1 cm", target: "≤ 2.0 cm", state: "failed" },
  { label: "Skew", value: "2.7%", target: "≤ 2.0%", state: "failed" },
  { label: "Finished width", value: "243 cm", target: "244 ± 2 cm", state: "passed" },
];
BATCHES.find((batch) => batch.id === "batch-kn-18052")!.stageRuns.find((run) => run.stage === "printing")!.checklist = [
  { label: "Print banding", value: "Visible", target: "None", state: "failed" },
  { label: "Registration", value: "0.8 mm", target: "≤ 1.0 mm", state: "passed" },
  { label: "Curing", value: "Pass", target: "Pass", state: "passed" },
];
BATCHES.find((batch) => batch.id === "batch-kn-18055")!.stageRuns.find((run) => run.stage === "folding-rolling")!.checklist = [
  { label: "Final inspection", value: "2 oil spots", target: "No visible stains", state: "failed" },
  { label: "Quantity verified", value: "Verified", target: "Match order", state: "passed" },
  { label: "Label and lot", value: "Verified", target: "Match batch", state: "passed" },
];
BATCHES.find((batch) => batch.id === "batch-kn-18057")!.stageRuns.find((run) => run.stage === "pre-treatment")!.checklist = [
  { label: "Absorbency", value: "3.8 s", target: "≤ 3.0 s", state: "watch" },
  { label: "Residual oil", value: "0.7%", target: "≤ 0.5%", state: "failed" },
  { label: "Final pH", value: "7.0", target: "6.5–7.5", state: "passed" },
];

export const DEFECTS: DefectEvent[] = [
  {
    id: "defect-shade-variation", title: "Patchy shade uptake", severity: "Critical", status: "New", batchId: "batch-wv-24094", detectedStage: "dyeing", suspectedStage: "pre-treatment", affectedQuantity: 1280, unit: "m", detectedAt: "2026-09-10T09:24:00Z", observation: "Side-to-side shade difference is visible across the first inspection panel after dyeing.", rationale: "The dyeing check is within its recipe tolerance, while the previous pre-treatment gate recorded slow absorbency and excessive whiteness variation.", evidence: ["Absorbency 4.6 s against ≤ 3.0 s", "Whiteness variation 2.3% against ≤ 1.5%", "Dyeing recipe completion recorded within tolerance"], actions: ["Place the batch on quality hold", "Confirm shade difference against the approved standard", "Review and rework the affected pre-treatment section before recolouring"], disposition: "Hold",
  },
  {
    id: "defect-knit-barre", title: "Barré and GSM-driven shade bands", severity: "Critical", status: "Under review", batchId: "batch-kn-18042", detectedStage: "dyeing", suspectedStage: "greige", affectedQuantity: 410, unit: "kg", detectedAt: "2026-09-10T08:52:00Z", observation: "Repeated horizontal shade bands are visible after the first dyeing sample was relaxed.", rationale: "Greige inspection recorded GSM variation outside the article tolerance before wet processing.", evidence: ["Incoming GSM variation ±8.2% against ≤ ±5.0%", "Barré marked Watch at greige inspection", "Dye fixation sample passed"], actions: ["Hold the remaining batch quantity", "Separate affected rolls by greige source", "Review shade under standard lighting before disposition"], disposition: "Hold",
  },
  {
    id: "defect-print-register", title: "Pattern registration drift", severity: "Major", status: "Contained", batchId: "batch-wv-24091", detectedStage: "printing", suspectedStage: "printing", affectedQuantity: 340, unit: "m", detectedAt: "2026-09-09T14:18:00Z", observation: "The blue repeat is displaced from the approved strike-off on one print section.", rationale: "The defect first appears at the printing gate and all previous quality gates passed.", evidence: ["Registration error 1.8 mm against ≤ 1.0 mm", "Pre-treatment gate passed", "Dyeing shade gate passed"], actions: ["Segregate affected length", "Reset registration reference", "Inspect the next 50 meters before restart"], disposition: "Rework",
  },
  {
    id: "defect-knit-shrinkage", title: "Residual shrinkage above limit", severity: "Major", status: "Under review", batchId: "batch-kn-18045", detectedStage: "finishing", suspectedStage: "finishing", affectedQuantity: 720, unit: "kg", detectedAt: "2026-09-09T11:05:00Z", observation: "Relaxed sample exceeds the article shrinkage and spirality specification after compaction.", rationale: "The exception was first recorded during the finishing checklist; upstream preparation and colour gates passed.", evidence: ["Shrinkage 5.4% against ≤ 4.0%", "Spirality 4.1% against ≤ 3.0%", "Finished GSM remains within specification"], actions: ["Return for controlled recompaction", "Re-test shrinkage and spirality", "Release only after quality approval"], disposition: "Rework",
  },
  {
    id: "defect-label-mismatch", title: "Roll label mismatch", severity: "Minor", status: "Closed", batchId: "batch-wv-24091", detectedStage: "folding-rolling", suspectedStage: "folding-rolling", affectedQuantity: 120, unit: "m", detectedAt: "2026-09-08T16:42:00Z", observation: "Two roll labels carried the previous lot code during final verification.", rationale: "The discrepancy was introduced and detected at the final packing gate.", evidence: ["Physical roll identity verified", "Two labels replaced", "Quantity reconciliation passed"], actions: ["Replace incorrect labels", "Re-scan the affected rolls", "Record final release verification"], disposition: "Released",
  },
  {
    id: "defect-woven-warp-line", title: "Continuous warp-line cluster", severity: "Major", status: "New", batchId: "batch-wv-24101", detectedStage: "greige", suspectedStage: "greige", affectedQuantity: 620, unit: "m", detectedAt: "2026-09-10T07:46:00Z", observation: "A repeated warp-wise line is visible through three consecutive inspection frames on the incoming greige roll.", rationale: "The exception is present before wet processing and the greige defect-point count exceeds the article limit.", evidence: ["Defect count 21 points per 100 m against ≤ 12", "Line repeats through three inspection frames", "Fabric width remains within tolerance"], actions: ["Segregate the affected roll section", "Mark the defect position on the genealogy record", "Inspect the adjacent greige roll before release"], disposition: "Hold",
  },
  {
    id: "defect-residual-size", title: "Residual size above preparation limit", severity: "Major", status: "Contained", batchId: "batch-wv-24097", detectedStage: "pre-treatment", suspectedStage: "pre-treatment", affectedQuantity: 860, unit: "m", detectedAt: "2026-09-10T06:40:00Z", observation: "The prepared fabric shows delayed wetting and a positive residual-size result at the exit quality gate.", rationale: "Both exceptions originate in the pre-treatment checklist before the lot proceeds to dyeing.", evidence: ["Residual size 1.1% against ≤ 0.5%", "Absorbency 3.7 s against ≤ 3.0 s", "Final pH within target"], actions: ["Keep the affected length in preparation", "Repeat desizing on the segregated section", "Re-test absorbency before dyeing release"], disposition: "Rework",
  },
  {
    id: "defect-knit-print-banding", title: "Digital print banding", severity: "Major", status: "Under review", batchId: "batch-kn-18052", detectedStage: "printing", suspectedStage: "printing", affectedQuantity: 260, unit: "kg", detectedAt: "2026-09-09T17:35:00Z", observation: "Fine horizontal density bands are visible in the clay ground after curing on the first production panel.", rationale: "The prepared and dyed fabric passed their quality gates; the variation first appears in the printed panel.", evidence: ["Banding visible under D65 inspection", "Registration 0.8 mm against ≤ 1.0 mm", "Curing test passed"], actions: ["Pause release of the printed panels", "Run the approved nozzle and density verification", "Inspect the next panel against the strike-off"], disposition: "Release pending",
  },
  {
    id: "defect-woven-bow-skew", title: "Bow and skew outside tolerance", severity: "Major", status: "New", batchId: "batch-wv-24105", detectedStage: "finishing", suspectedStage: "finishing", affectedQuantity: 1480, unit: "m", detectedAt: "2026-09-09T09:20:00Z", observation: "The finished stripe repeat curves across the width and exceeds the approved skew tolerance before rolling.", rationale: "Printing registration passed, while bow and skew moved outside tolerance at the finishing quality gate.", evidence: ["Bow 3.1 cm against ≤ 2.0 cm", "Skew 2.7% against ≤ 2.0%", "Finished width remains within specification"], actions: ["Hold the affected finished length", "Correct overfeed and alignment settings", "Recheck bow and skew before final inspection"], disposition: "Hold",
  },
  {
    id: "defect-knit-final-stain", title: "Oil spots found at final inspection", severity: "Minor", status: "Contained", batchId: "batch-kn-18055", detectedStage: "folding-rolling", suspectedStage: "folding-rolling", affectedQuantity: 145, unit: "kg", detectedAt: "2026-09-08T13:12:00Z", observation: "Two small oil spots were found while the first finished roll was opened for final inspection.", rationale: "All upstream gates passed and the marks were first recorded during final handling and rolling.", evidence: ["Two spots recorded on inspection map", "Shade and shrinkage checks passed", "Lot and quantity reconciliation passed"], actions: ["Segregate the marked panels", "Clean the final handling surface", "Re-inspect the remaining roll before packing"], disposition: "Rework",
  },
  {
    id: "defect-knit-residual-oil", title: "Residual oil after scouring", severity: "Minor", status: "Closed", batchId: "batch-kn-18057", detectedStage: "pre-treatment", suspectedStage: "pre-treatment", affectedQuantity: 180, unit: "kg", detectedAt: "2026-09-08T11:28:00Z", observation: "A mild hydrophobic patch was detected in the pre-treatment sample before colour approval.", rationale: "Residual oil and slow absorbency were isolated at the preparation gate and corrected before dyeing.", evidence: ["Residual oil 0.7% against ≤ 0.5%", "Absorbency 3.8 s against ≤ 3.0 s", "Repeat sample passed after corrective scour"], actions: ["Repeat the scour cycle for the affected load", "Confirm absorbency at three sample positions", "Record the corrected gate result"], disposition: "Released",
  },
  {
    id: "defect-knit-needle-line", title: "Needle line at greige inspection", severity: "Minor", status: "Closed", batchId: "batch-kn-18049", detectedStage: "greige", suspectedStage: "greige", affectedQuantity: 95, unit: "kg", detectedAt: "2026-09-08T10:15:00Z", observation: "A faint vertical needle line was identified and mapped during incoming greige inspection.", rationale: "The line is present in the raw knit construction and did not originate in downstream wet processing.", evidence: ["Needle line confirmed under transmitted light", "GSM variation remains within tolerance", "Affected panel positions recorded"], actions: ["Mark and segregate affected panels", "Verify the next roll from the same yarn lot", "Release unaffected quantity to preparation"], disposition: "Released",
  },
];

export function familyBySlug(slug: string) {
  return FAMILIES.find((family) => family.slug === slug) ?? null;
}

export function stageBySlug(slug: string) {
  return STAGES.find((stage) => stage.slug === slug) ?? null;
}

export function batchById(id: string) {
  return BATCHES.find((batch) => batch.id === id) ?? null;
}

export function defectById(id: string) {
  return DEFECTS.find((defect) => defect.id === id) ?? null;
}

export function defectsForBatch(batchId: string) {
  return DEFECTS.filter((defect) => defect.batchId === batchId);
}

export function productionSummary() {
  return {
    activeBatches: BATCHES.filter((batch) => batch.status !== "Released").length,
    heldBatches: BATCHES.filter((batch) => batch.status === "On hold").length,
    openDefects: DEFECTS.filter((defect) => defect.status !== "Closed").length,
    firstPassQuality: Math.round(BATCHES.reduce((sum, batch) => sum + batch.qualityScore, 0) / BATCHES.length),
  };
}
