import type { StageSlug } from "./production-data";

export type ModuleFamilySlug = "woven" | "knit";
export type ModuleRole = "Primary" | "Supporting" | "Continuous";
export type ModuleCheckpoint = "After stage" | "During stage" | "Across route";

export type ModuleCoverage = {
  stage: StageSlug;
  role: ModuleRole;
  checkpoint: ModuleCheckpoint;
  description: string;
};

export type AIModule = {
  slug: string;
  code: string;
  name: string;
  shortName: string;
  icon: string;
  summary: string;
  outcome: string;
  families: ModuleFamilySlug[];
  coverage: ModuleCoverage[];
  inputs: string[];
  outputs: string[];
  kpis: string[];
};

export type KnowledgeAssistantModule = {
  slug: string;
  code: string;
  name: string;
  shortName: string;
  icon: string;
  summary: string;
  outcome: string;
  coverage: string[];
};

const ALL_STAGES: StageSlug[] = [
  "greige",
  "pre-treatment",
  "dyeing",
  "printing",
  "finishing",
  "folding-rolling",
];

function continuousCoverage(description: string): ModuleCoverage[] {
  return ALL_STAGES.map((stage) => ({
    stage,
    role: "Continuous",
    checkpoint: "Across route",
    description,
  }));
}

export const AI_MODULES: AIModule[] = [
  {
    slug: "color-intelligence",
    code: "AI-01",
    name: "Color Intelligence AI",
    shortName: "Color Intelligence",
    icon: "palette",
    summary: "Supports right-first-time shade control for production dyeing.",
    outcome: "Reduce shade variation, recolouring and avoidable batch holds.",
    families: ["woven", "knit"],
    coverage: [
      {
        stage: "dyeing",
        role: "Primary",
        checkpoint: "During stage",
        description: "Uses the approved shade, preparation results and batch context to guide dyeing decisions and assess shade risk.",
      },
    ],
    inputs: ["Approved shade standard", "Dye recipe", "Pre-treatment results", "Batch quantity"],
    outputs: ["Recipe guidance", "Predicted shade difference", "Shade-drift indication", "Release evidence"],
    kpis: ["Right-first-time shade", "Recolour rate", "Average ΔE", "Batch hold rate"],
  },
  {
    slug: "energy-utilities",
    code: "AI-02",
    name: "Energy & Utilities Optimization AI",
    shortName: "Energy & Utilities",
    icon: "energy_savings_leaf",
    summary: "Compares utility consumption against the expected requirement for each production batch.",
    outcome: "Reduce energy, water and steam intensity without changing the physical route.",
    families: ["woven", "knit"],
    coverage: [
      { stage: "pre-treatment", role: "Primary", checkpoint: "During stage", description: "Tracks water, steam and electricity against preparation quantity and recipe." },
      { stage: "dyeing", role: "Primary", checkpoint: "During stage", description: "Measures batch utility intensity and highlights avoidable recipe or cycle variance." },
      { stage: "printing", role: "Supporting", checkpoint: "During stage", description: "Tracks electricity and curing demand against printed production." },
      { stage: "finishing", role: "Primary", checkpoint: "During stage", description: "Compares thermal and electrical consumption with finished output." },
    ],
    inputs: ["Batch quantity", "Stage duration", "Steam and water use", "Electricity consumption"],
    outputs: ["Consumption baseline", "Variance indication", "Optimization recommendation", "Cost intensity"],
    kpis: ["Energy per m/kg", "Water per batch", "Steam variance", "Utility cost per batch"],
  },
  {
    slug: "fabric-inspection-vision",
    code: "AI-03",
    name: "Fabric Inspection & Vision AI",
    shortName: "Fabric Inspection & Vision",
    icon: "center_focus_strong",
    summary: "Places visual inspection checkpoints after Greige and after Pre-treatment.",
    outcome: "Stop source and preparation defects before additional production value is added.",
    families: ["woven", "knit"],
    coverage: [
      { stage: "greige", role: "Primary", checkpoint: "After stage", description: "Identifies construction faults, holes, barré, knots, missing yarn and visible GSM inconsistency." },
      { stage: "pre-treatment", role: "Primary", checkpoint: "After stage", description: "Checks visible preparation streaks, uneven whiteness and surface inconsistency before dyeing." },
    ],
    inputs: ["Fabric imagery", "Roll or batch identity", "Inspection standard", "Family specification"],
    outputs: ["Defect classification", "Defect location", "Inspection result", "Hold recommendation"],
    kpis: ["Defects found upstream", "Inspection accuracy", "Escaped defects", "Avoided rework"],
  },
  {
    slug: "production-planning",
    code: "AI-04",
    name: "Production Planning & Scheduling AI",
    shortName: "Planning & Scheduling",
    icon: "calendar_month",
    summary: "Coordinates batches, capacity and delivery commitments across the complete production route.",
    outcome: "Improve route flow, delivery confidence and stage utilization.",
    families: ["woven", "knit"],
    coverage: continuousCoverage("Continuously evaluates batch sequence, capacity, route progress and delivery risk."),
    inputs: ["Production orders", "Batch priority", "Stage capacity", "Due dates"],
    outputs: ["Recommended sequence", "Route ETA", "Capacity conflict", "Delivery-risk indication"],
    kpis: ["On-time delivery", "Schedule adherence", "Queue time", "Stage utilization"],
  },
  {
    slug: "production-continuity",
    code: "AI-05",
    name: "Production Continuity & Process Drift AI",
    shortName: "Production Continuity",
    icon: "monitoring",
    summary: "Identifies batch delay and production-quality drift without machine-failure diagnostics.",
    outcome: "Detect production disruption early while keeping the scope focused on fabric and process reliability.",
    families: ["woven", "knit"],
    coverage: continuousCoverage("Monitors route transitions, checklist drift, hold risk and expected stage completion."),
    inputs: ["Stage progress", "Checklist results", "Batch status", "Historical route duration"],
    outputs: ["Delay risk", "Quality-drift indication", "Hold probability", "Recovery recommendation"],
    kpis: ["Interrupted batches", "Stage delay", "First-pass quality", "Recovery time"],
  },
  {
    slug: "compliance-traceability",
    code: "AI-06",
    name: "Compliance & Traceability AI",
    shortName: "Compliance & Traceability",
    icon: "verified_user",
    summary: "Maintains a complete production genealogy from incoming fabric through final release.",
    outcome: "Produce buyer-ready evidence and faster batch investigations.",
    families: ["woven", "knit"],
    coverage: continuousCoverage("Captures stage identity, checklist evidence, disposition and production genealogy."),
    inputs: ["Batch identity", "Stage checklist", "Quality disposition", "Release records"],
    outputs: ["Batch genealogy", "Audit evidence", "Quality certificate", "Traceability exception"],
    kpis: ["Record completeness", "Trace time", "Release compliance", "Audit exceptions"],
  },
];

export const USTAAD_MODULE: KnowledgeAssistantModule = {
  slug: "ustaad",
  code: "AI-07",
  name: "Ustaad — Mill Knowledge Assistant",
  shortName: "Ustaad",
  icon: "support_agent",
  summary: "Provides practical guidance across textile quality, production workflows, alerts and all six AI domains.",
  outcome: "Help teams understand what to inspect, where to act and how production-quality issues connect across the route.",
  coverage: ["Woven", "Knits / Hosiery", "All six stages"],
};

export function moduleBySlug(slug: string) {
  return AI_MODULES.find((module) => module.slug === slug) ?? null;
}

export function moduleCoverageForStage(module: AIModule, stage: StageSlug) {
  return module.coverage.find((item) => item.stage === stage) ?? null;
}

export function familyLabel(slug: ModuleFamilySlug) {
  return slug === "woven" ? "Woven" : "Knits / Hosiery";
}

export function familyUnit(slug: ModuleFamilySlug) {
  return slug === "woven" ? "meters" : "kilograms";
}
