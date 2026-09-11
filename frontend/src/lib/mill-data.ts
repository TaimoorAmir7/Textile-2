import {
  DEFECTS,
  FAMILIES as PRODUCTION_FAMILIES,
  STAGES,
  batchById,
  stageBySlug,
  type FamilySlug,
  type StageSlug,
} from "./production-data";

export type PlantRow = { id: string; name: string; code: string; location: string; healthScore: number };
export type FamilyRow = {
  id: string;
  slug: string;
  name: string;
  description: string;
  specs: Record<string, string>;
  challenges: { title: string; body: string; tone: string }[];
  useCases: { title: string; body: string; tags: string[]; icon: string }[];
};
export type TemplateRow = {
  id: string;
  slug: string;
  name: string;
  version: string;
  overview: string;
  signals: { key: string; name: string; unit: string; defaultTag: string }[];
  failureModes: { name: string; description: string }[];
  familyId: string;
};
export type AssetRow = {
  id: string;
  assetCode: string;
  name: string;
  location: string;
  healthScore: number;
  status: string;
  monitored: boolean;
  model: string;
  lastService: string;
  plantId: string;
  familyId: string;
  templateId: string | null;
};
export type AlertRow = { id: string; title: string; severity: string; status: string; detectedAt: Date; payload: Record<string, unknown>; assetId: string };
export type CaseRow = {
  id: string;
  caseCode: string;
  title: string;
  description: string;
  priority: string;
  status: string;
  assignee: string | null;
  workOrderRef: string | null;
  createdAt: Date;
  assetId: string;
};
export type CaseAlertRow = { caseId: string; alertId: string };
export type DeploymentRow = { id: string; status: string; qualityPct: number; parameters: Record<string, number>; createdAt: Date; templateId: string };
export type DeploymentAssetRow = { deploymentId: string; assetId: string };
export type SignalMappingRow = { id: string; signalKey: string; tagName: string; assetId: string };
export type MillSnapshot = {
  plants: PlantRow[];
  families: FamilyRow[];
  templates: TemplateRow[];
  assets: AssetRow[];
  alerts: AlertRow[];
  cases: CaseRow[];
  caseAlerts: CaseAlertRow[];
  deployments: DeploymentRow[];
  deploymentAssets: DeploymentAssetRow[];
  mappings: SignalMappingRow[];
};

function series(points: number, start: number, drift: number, changeAt?: number, changeRate = 0) {
  const data: { t: number; v: number }[] = [];
  let value = start;
  for (let index = 0; index < points; index++) {
    value += drift + Math.sin(index / 3) * 0.18;
    if (changeAt !== undefined && index >= changeAt) value += (index - changeAt) * changeRate;
    data.push({ t: index, v: Math.round(Math.max(0, Math.min(100, value)) * 10) / 10 });
  }
  return data;
}

export const DEMO_NOW = new Date("2026-09-10T10:00:00.000Z");
function ago(ms: number) { return new Date(DEMO_NOW.getTime() - ms); }
function uiSlug(family: FamilySlug) { return family === "knits-hosiery" ? "knit" : "woven"; }
function familyId(family: FamilySlug) { return `family-${uiSlug(family)}`; }
function templateId(family: FamilySlug, stage: StageSlug) { return `tpl-${uiSlug(family)}-${stage}`; }
function assetId(family: FamilySlug, stage: StageSlug) { return `asset-${uiSlug(family)}-${stage}`; }
function plantId(stage: StageSlug) {
  const order = stageBySlug(stage)?.order ?? 1;
  return order <= 2 ? "plant-preparation" : order <= 4 ? "plant-colour" : "plant-finish";
}

export function buildMillSnapshot(): MillSnapshot {
  const plants: PlantRow[] = [
    { id: "plant-preparation", name: "Faisalabad Mill — Greige & Preparation", code: "FSD-PR", location: "Faisalabad, Punjab", healthScore: 91 },
    { id: "plant-colour", name: "Faisalabad Mill — Colouration & Printing", code: "FSD-CP", location: "Faisalabad, Punjab", healthScore: 82 },
    { id: "plant-finish", name: "Faisalabad Mill — Finishing & Packing", code: "FSD-FP", location: "Faisalabad, Punjab", healthScore: 89 },
  ];

  const families: FamilyRow[] = PRODUCTION_FAMILIES.map((family) => ({
    id: familyId(family.slug),
    slug: uiSlug(family.slug),
    name: family.slug === "woven" ? "Woven Family" : "Knit / Hosiery Family",
    description: family.description,
    specs: {
      "Primary Product": family.product,
      "Unit of Measure": family.unit === "m" ? "Meters" : "Kilograms",
      "Construction": family.construction,
      "Production Route": "6 controlled stages",
    },
    challenges: family.challenges.slice(0, 4).map((challenge, index) => ({
      title: challenge,
      body: family.slug === "woven"
        ? ["Control width and GSM before shade or print variation is amplified downstream.", "Track bow and skew through finishing and final inspection.", "Maintain shade continuity across open-width lots and roll joins.", "Verify pattern repeat and registration against the approved strike-off."][index]
        : ["Identify barré at greige and confirm it again after colour development.", "GSM variation can produce visible shade bands after dyeing.", "Low-tension handling is required to prevent rope and crease marks.", "Control relaxation, spirality and shrinkage before final release."][index],
      tone: index === 0 ? "error" : "neutral",
    })),
    useCases: STAGES.map((stage) => ({
      title: stage.label,
      body: stage.profiles[family.slug].fabricState,
      tags: stage.profiles[family.slug].qualityFocus.slice(0, 2),
      icon: stage.icon,
    })),
  }));

  const templates: TemplateRow[] = PRODUCTION_FAMILIES.flatMap((family) =>
    STAGES.map((stage) => {
      const profile = stage.profiles[family.slug];
      return {
        id: templateId(family.slug, stage.slug),
        slug: `${uiSlug(family.slug)}-${stage.slug}-quality-gate`,
        name: `${family.shortName} · ${stage.label}`,
        version: "1.0.0",
        familyId: familyId(family.slug),
        overview: `${stage.whatHappens} Quality gate for ${profile.fabricState.toLowerCase()}.`,
        signals: profile.qualityFocus.map((name, index) => ({
          key: `q${index + 1}_${stage.slug.replace("-", "_")}`,
          name,
          unit: "spec",
          defaultTag: `${uiSlug(family.slug).toUpperCase()}.${String(stage.order).padStart(2, "0")}.Q${index + 1}`,
        })),
        failureModes: profile.risks.map((name) => ({
          name,
          description: `Production-quality exception checked at ${stage.shortLabel}.`,
        })),
      };
    }),
  );

  const quality: Record<string, { score: number; status: string }> = {
    "woven-greige": { score: 96, status: "NOMINAL" },
    "woven-pre-treatment": { score: 84, status: "WATCH" },
    "woven-dyeing": { score: 72, status: "CRITICAL" },
    "woven-printing": { score: 81, status: "WATCH" },
    "woven-finishing": { score: 94, status: "NOMINAL" },
    "woven-folding-rolling": { score: 97, status: "NOMINAL" },
    "knit-greige": { score: 82, status: "WATCH" },
    "knit-pre-treatment": { score: 91, status: "NOMINAL" },
    "knit-dyeing": { score: 69, status: "CRITICAL" },
    "knit-printing": { score: 86, status: "WATCH" },
    "knit-finishing": { score: 78, status: "WATCH" },
    "knit-folding-rolling": { score: 95, status: "NOMINAL" },
  };

  const assets: AssetRow[] = PRODUCTION_FAMILIES.flatMap((family) =>
    STAGES.map((stage) => {
      const key = `${uiSlug(family.slug)}-${stage.slug}`;
      const state = quality[key];
      return {
        id: assetId(family.slug, stage.slug),
        assetCode: `${family.slug === "woven" ? "WV" : "KN"}-${String(stage.order).padStart(2, "0")}`,
        name: `${family.shortName} · ${stage.label}`,
        location: `${family.shortName} Route · Stage ${stage.order}`,
        healthScore: state.score,
        status: state.status,
        monitored: true,
        model: stage.profiles[family.slug].machine,
        lastService: "Quality gate active",
        plantId: plantId(stage.slug),
        familyId: familyId(family.slug),
        templateId: templateId(family.slug, stage.slug),
      };
    }),
  );

  const alerts: AlertRow[] = DEFECTS.map((defect, index) => {
    const batch = batchById(defect.batchId)!;
    const detected = stageBySlug(defect.detectedStage)!;
    const source = stageBySlug(defect.suspectedStage)!;
    const profile = detected.profiles[batch.familySlug];
    const severity = defect.severity === "Critical" ? "CRITICAL" : defect.severity === "Major" ? "WATCH" : "NOMINAL";
    const qualityStart = severity === "CRITICAL" ? 91 : severity === "WATCH" ? 93 : 96;
    const changeAt = defect.status === "Closed" ? undefined : severity === "CRITICAL" ? 16 : 19;
    const changeRate = severity === "CRITICAL" ? -0.66 : severity === "WATCH" ? -0.36 : 0;
    return {
      id: defect.id,
      title: defect.title,
      severity,
      status: defect.status === "Closed" ? "acked" : defect.status === "Contained" ? "snoozed" : "new",
      detectedAt: new Date(defect.detectedAt),
      assetId: assetId(batch.familySlug, defect.detectedStage),
      payload: {
        qualityScoreSeries: series(24, qualityStart - (index % 3), -0.01, changeAt, changeRate),
        processComplianceSeries: series(24, 93 - (index % 2), 0.01),
        causality: [{ name: `Suspected source: ${source.shortLabel}`, confidence: defect.suspectedStage === defect.detectedStage ? 86 : 78 }],
        rootCauses: defect.evidence,
        actions: defect.actions.map((action) => ({ title: action, detail: `Contain ${defect.affectedQuantity.toLocaleString()} ${defect.unit} before release.` })),
        stageSlug: defect.detectedStage,
        stageLabel: detected.shortLabel,
        suspectedStage: defect.suspectedStage,
        suspectedStageLabel: source.shortLabel,
        image: profile.image,
        machine: profile.machine,
        fabricState: profile.fabricState,
        batchCode: batch.lotCode,
        affectedQuantity: defect.affectedQuantity,
        unit: defect.unit,
        observation: defect.observation,
        disposition: defect.disposition,
      },
    };
  });

  const cases: CaseRow[] = DEFECTS.slice(0, 10).map((defect, index) => {
    const batch = batchById(defect.batchId)!;
    const assignees = ["S. Khan", "M. Iqbal", "H. Noor", "F. Ali", "N. Ahmed", "A. Raza", "Z. Fatima", "R. Mahmood", "T. Aslam", "K. Tariq"];
    const status = defect.status === "Closed" ? "Resolved" : defect.status === "New" ? "Open" : "In-Progress";
    const priority = defect.severity === "Critical" ? "Critical" : defect.severity === "Major" ? "High" : status === "Resolved" ? "Low" : "Medium";
    return {
      id: `case-quality-${index + 1}`,
      caseCode: `QCA-${4101 + index}`,
      title: `${batch.lotCode} · ${defect.title}`,
      description: defect.actions[0],
      priority,
      status,
      assignee: assignees[index],
      workOrderRef: status === "Open" ? null : `QA-${6101 + index}`,
      createdAt: ago((index + 1) * 1000 * 60 * 60 * 8),
      assetId: assetId(batch.familySlug, defect.detectedStage),
    };
  });

  const caseAlerts: CaseAlertRow[] = cases.map((item, index) => ({ caseId: item.id, alertId: DEFECTS[index].id }));
  const deployments: DeploymentRow[] = templates.flatMap((template, index) => {
    const primary: DeploymentRow = {
      id: `dep-${template.id}`,
      status: "deployed",
      qualityPct: 95 + (index % 4),
      parameters: { completionRequired: 1, alertOnFailure: 1 },
      createdAt: ago((index + 1) * 1000 * 60 * 60 * 12),
      templateId: template.id,
    };
    if (index % 2 !== 0) return [primary];
    return [
      primary,
      {
        id: `dep-${template.id}-validation`,
        status: "deployed",
        qualityPct: 96 + (index % 3),
        parameters: { completionRequired: 1, alertOnFailure: 1, validationRun: 1 },
        createdAt: ago((index + 13) * 1000 * 60 * 60 * 12),
        templateId: template.id,
      },
    ];
  });
  const deploymentAssets: DeploymentAssetRow[] = deployments.map((deployment) => {
    const template = templates.find((item) => item.id === deployment.templateId)!;
    const asset = assets.find((item) => item.templateId === template.id)!;
    return { deploymentId: deployment.id, assetId: asset.id };
  });
  const mappings: SignalMappingRow[] = assets.flatMap((asset) => {
    const template = templates.find((item) => item.id === asset.templateId)!;
    return template.signals.slice(0, 2).map((signal, index) => ({
      id: `map-${asset.id}-${index + 1}`,
      signalKey: signal.key,
      tagName: signal.defaultTag,
      assetId: asset.id,
    }));
  });

  return { plants, families, templates, assets, alerts, cases, caseAlerts, deployments, deploymentAssets, mappings };
}
