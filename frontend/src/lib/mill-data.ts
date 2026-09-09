export type PlantRow = {
  id: string;
  name: string;
  code: string;
  location: string;
  healthScore: number;
};

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

export type AlertRow = {
  id: string;
  title: string;
  severity: string;
  status: string;
  detectedAt: Date;
  payload: Record<string, unknown>;
  assetId: string;
};

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

export type DeploymentRow = {
  id: string;
  status: string;
  qualityPct: number;
  parameters: Record<string, number>;
  createdAt: Date;
  templateId: string;
};

export type DeploymentAssetRow = { deploymentId: string; assetId: string };

export type SignalMappingRow = {
  id: string;
  signalKey: string;
  tagName: string;
  assetId: string;
};

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

function series(points: number, start: number, drift: number, spikeAt?: number) {
  const data: { t: number; v: number }[] = [];
  let v = start;
  for (let i = 0; i < points; i++) {
    v += drift + Math.sin(i / 3) * 0.4;
    if (spikeAt !== undefined && i >= spikeAt) v += (i - spikeAt) * 1.8;
    data.push({ t: i, v: Math.round(v * 10) / 10 });
  }
  return data;
}

/** Frozen clock so the demo snapshot matches on the server and in the browser. */
export const DEMO_NOW = new Date("2026-09-09T08:00:00.000Z");

function ago(ms: number) {
  return new Date(DEMO_NOW.getTime() - ms);
}

export function buildMillSnapshot(): MillSnapshot {
  const plants: PlantRow[] = [
    {
      id: "plant-fsd-sp",
      name: "Faisalabad Mill — Spinning Hall",
      code: "FSD-SP",
      location: "Faisalabad, Punjab",
      healthScore: 78,
    },
    {
      id: "plant-fsd-wv",
      name: "Faisalabad Mill — Weaving Shed",
      code: "FSD-WV",
      location: "Faisalabad, Punjab",
      healthScore: 91,
    },
    {
      id: "plant-fsd-dy",
      name: "Faisalabad Mill — Dye House",
      code: "FSD-DY",
      location: "Faisalabad, Punjab",
      healthScore: 86,
    },
  ];

  const families: FamilyRow[] = [
    {
      id: "family-spinning",
      slug: "spinning-frames",
      name: "Spinning Frames Family",
      description:
        "Comprehensive monitoring and diagnostic profiles for high-speed continuous spinning machinery used in textile manufacturing.",
      specs: {
        "Operating Speed": "15,000 - 25,000 RPM",
        "Sensor Nodes": "Avg 12 per chassis",
        "Telemetry Freq": "100 Hz Continuous",
        "Data Footprint": "2.4 GB / day / unit",
      },
      challenges: [
        {
          title: "High-Frequency Vibration",
          body: "Spindle speeds create complex harmonic profiles, masking early-stage bearing defects.",
          tone: "error",
        },
        {
          title: "Thermal Expansion",
          body: "Continuous operation causes micro-misalignments requiring dynamic compensation models.",
          tone: "neutral",
        },
      ],
      useCases: [
        {
          title: "Bearing Failure Detection",
          body: "Envelope analysis models trained specifically for high-speed roller bearings to detect inner/outer race defects.",
          tags: ["Vibration Data"],
          icon: "network_node",
        },
        {
          title: "Spindle Alignment",
          body: "Phase-angle monitoring to detect dynamic unbalance and misalignment conditions during operation.",
          tags: ["Phase Data", "Temp"],
          icon: "account_tree",
        },
        {
          title: "Drive Motor Health",
          body: "Current signature analysis (MCSA) to identify rotor bar issues and stator winding degradation.",
          tags: ["Current Data"],
          icon: "cable",
        },
      ],
    },
    {
      id: "family-looms",
      slug: "air-jet-looms",
      name: "Air-Jet Looms Family",
      description:
        "High-speed weaving assets with vibration, air pressure, and yarn-break monitoring to keep fabric quality and uptime stable.",
      specs: {
        "Pick Rate": "800 - 1,200 PPM",
        "Sensor Nodes": "Avg 8 per loom",
        "Telemetry Freq": "50 Hz Continuous",
        "Air Circuit": "6 bar nominal",
      },
      challenges: [
        {
          title: "Yarn Breakage",
          body: "Transient tension spikes at high pick rates cause breaks that stop the loom and waste warp.",
          tone: "error",
        },
        {
          title: "Reed / Sley Vibration",
          body: "Imbalance in the sley drive shows up as fabric barré before a mechanical failure is obvious.",
          tone: "neutral",
        },
      ],
      useCases: [
        {
          title: "Loom Vibration Analysis",
          body: "Broadband vibration templates for sley, gearing, and main motor mounts.",
          tags: ["Vibration Data"],
          icon: "graphic_eq",
        },
        {
          title: "Yarn Break Prediction",
          body: "Tension and air-jet pressure models that flag rising break risk before stop events.",
          tags: ["Tension", "Air Pressure"],
          icon: "timeline",
        },
      ],
    },
    {
      id: "family-dyeing",
      slug: "dyeing-machines",
      name: "Dyeing Machines Family",
      description:
        "Thermal and liquor-level profiles for dye vats and jet dyeing machines to prevent shade variation and overheat trips.",
      specs: {
        "Batch Volume": "200 - 800 kg",
        "Liquor Ratio": "1:8 typical",
        "Telemetry Freq": "1 Hz",
        "Max Temp": "135 °C",
      },
      challenges: [
        {
          title: "Temperature Overshoot",
          body: "Ramp-rate errors scorch lots and force costly re-dye.",
          tone: "error",
        },
        {
          title: "Liquor Level Drift",
          body: "Leaks and valve stiction change concentration mid-cycle.",
          tone: "neutral",
        },
      ],
      useCases: [
        {
          title: "Dye-vat Thermal Control",
          body: "Watch heat-up curves against the recipe envelope.",
          tags: ["Temperature"],
          icon: "thermostat",
        },
      ],
    },
  ];

  const templates: TemplateRow[] = [
    {
      id: "tpl-spinning",
      slug: "spinning-machine-v2",
      name: "Spinning Machine V2",
      version: "2.4.0",
      familyId: "family-spinning",
      overview:
        "Predictive reliability template for ring and compact spinning frames: spindle vibration, bearing envelope, and drive-motor current.",
      signals: [
        { key: "vib_spindle", name: "Spindle vibration", unit: "mm/s", defaultTag: "SF.VIB.SPDL" },
        { key: "temp_bearing", name: "Bearing temperature", unit: "°C", defaultTag: "SF.TMP.BRG" },
        { key: "current_drive", name: "Drive motor current", unit: "A", defaultTag: "SF.CUR.DRV" },
        { key: "rpm", name: "Spindle RPM", unit: "rpm", defaultTag: "SF.RPM" },
      ],
      failureModes: [
        { name: "Inner race defect", description: "BPFI harmonics in envelope spectrum" },
        { name: "Lubrication starvation", description: "Rising temperature with broadband energy" },
        { name: "Spindle unbalance", description: "1× RPM amplitude growth" },
      ],
    },
    {
      id: "tpl-loom",
      slug: "loom-vibration-analysis",
      name: "Loom Vibration Analysis",
      version: "1.8.0",
      familyId: "family-looms",
      overview:
        "Vibration and yarn-break template for air-jet looms. Maps sley vibration, air pressure, and warp tension into watch/critical alerts.",
      signals: [
        { key: "vib_sley", name: "Sley vibration", unit: "mm/s", defaultTag: "AJ.VIB.SLY" },
        { key: "air_press", name: "Main jet pressure", unit: "bar", defaultTag: "AJ.AIR.P" },
        { key: "warp_tension", name: "Warp tension", unit: "cN", defaultTag: "AJ.TENS.WRP" },
      ],
      failureModes: [
        { name: "Sley bearing wear", description: "Rising 2× pick-frequency vibration" },
        { name: "Yarn break cluster", description: "Tension spikes correlated with air-jet dips" },
      ],
    },
    {
      id: "tpl-dye",
      slug: "dye-vat-thermal",
      name: "Dye-vat Thermal",
      version: "1.2.0",
      familyId: "family-dyeing",
      overview: "Thermal envelope and liquor-level monitoring for jet dyeing machines.",
      signals: [
        { key: "vat_temp", name: "Vat temperature", unit: "°C", defaultTag: "DY.TMP.VAT" },
        { key: "liquor", name: "Liquor level", unit: "%", defaultTag: "DY.LVL" },
      ],
      failureModes: [
        { name: "Over-temperature", description: "Recipe envelope exceeded" },
        { name: "Level loss", description: "Drain valve leak or sensor fault" },
      ],
    },
  ];

  const assets: AssetRow[] = [
    {
      id: "asset-sf204a",
      assetCode: "SF-204A",
      name: "Ring Frame SF-204A",
      location: "Plant 1 - Sector 4",
      healthScore: 42,
      status: "CRITICAL",
      monitored: true,
      model: "Rieter G 38",
      lastService: "14 Days Ago",
      plantId: "plant-fsd-sp",
      familyId: "family-spinning",
      templateId: "tpl-spinning",
    },
    {
      id: "asset-sf204b",
      assetCode: "SF-204B",
      name: "Ring Frame SF-204B",
      location: "Plant 1 - Sector 4",
      healthScore: 78,
      status: "WATCH",
      monitored: true,
      model: "Rieter G 38",
      lastService: "32 Days Ago",
      plantId: "plant-fsd-sp",
      familyId: "family-spinning",
      templateId: "tpl-spinning",
    },
    {
      id: "asset-sf301c",
      assetCode: "SF-301C",
      name: "Ring Frame SF-301C",
      location: "Plant 2 - Sector 1",
      healthScore: 42,
      status: "CRITICAL",
      monitored: false,
      model: "Toyota RX300",
      lastService: "8 Days Ago",
      plantId: "plant-fsd-sp",
      familyId: "family-spinning",
      templateId: null,
    },
    {
      id: "asset-sf301d",
      assetCode: "SF-301D",
      name: "Ring Frame SF-301D",
      location: "Plant 2 - Sector 1",
      healthScore: 98,
      status: "NOMINAL",
      monitored: true,
      model: "Toyota RX300",
      lastService: "5 Days Ago",
      plantId: "plant-fsd-sp",
      familyId: "family-spinning",
      templateId: "tpl-spinning",
    },
    {
      id: "asset-ajt200-12",
      assetCode: "AJ-T200-12",
      name: "High-Speed Loom T-200",
      location: "Weaving Shed - Line B",
      healthScore: 81,
      status: "WATCH",
      monitored: true,
      model: "T-200 Air Jet",
      lastService: "21 Days Ago",
      plantId: "plant-fsd-wv",
      familyId: "family-looms",
      templateId: "tpl-loom",
    },
    {
      id: "asset-ajt200-08",
      assetCode: "AJ-T200-08",
      name: "High-Speed Loom T-200 #08",
      location: "Weaving Shed - Line A",
      healthScore: 94,
      status: "NOMINAL",
      monitored: true,
      model: "T-200 Air Jet",
      lastService: "11 Days Ago",
      plantId: "plant-fsd-wv",
      familyId: "family-looms",
      templateId: "tpl-loom",
    },
    {
      id: "asset-ajt180-03",
      assetCode: "AJ-T180-03",
      name: "Air-Jet Loom T-180 #03",
      location: "Weaving Shed - Line A",
      healthScore: 96,
      status: "NOMINAL",
      monitored: false,
      model: "T-180 Air Jet",
      lastService: "40 Days Ago",
      plantId: "plant-fsd-wv",
      familyId: "family-looms",
      templateId: null,
    },
    {
      id: "asset-dyj800-01",
      assetCode: "DY-J800-01",
      name: "Jet Dyeing Machine 01",
      location: "Dye House - Bay 2",
      healthScore: 74,
      status: "WATCH",
      monitored: true,
      model: "Then Airflow Synergy",
      lastService: "9 Days Ago",
      plantId: "plant-fsd-dy",
      familyId: "family-dyeing",
      templateId: "tpl-dye",
    },
    {
      id: "asset-dyj800-02",
      assetCode: "DY-J800-02",
      name: "Jet Dyeing Machine 02",
      location: "Dye House - Bay 2",
      healthScore: 92,
      status: "NOMINAL",
      monitored: false,
      model: "Then Airflow Synergy",
      lastService: "18 Days Ago",
      plantId: "plant-fsd-dy",
      familyId: "family-dyeing",
      templateId: null,
    },
  ];

  const alerts: AlertRow[] = [
    {
      id: "alert-bearing",
      title: "Bearing Failure Detection — SF-204A",
      severity: "CRITICAL",
      status: "new",
      detectedAt: ago(1000 * 60 * 8),
      assetId: "asset-sf204a",
      payload: {
        vibration: series(24, 2.1, 0.05, 16),
        temperature: series(24, 58, 0.2, 16),
        failureModes: [
          { name: "Inner Race Defect", confidence: 85 },
          { name: "Lubrication Starvation", confidence: 32 },
        ],
        rootCauses: [
          "High frequency vibration spike at 8:40 AM",
          "Corresponding rapid temperature rise",
          "Harmonic patterns match BPFI frequencies",
        ],
        actions: [
          { title: "Dispatch Field Technician", detail: "Visual inspection of housing and grease purge analysis." },
          { title: "Prepare Spare Parts", detail: "SKF 6204-2RS bearing assembly likely required." },
          { title: "Schedule Maintenance Window", detail: "Estimated downtime: 4 hours. Recommend prior to next shift." },
        ],
      },
    },
    {
      id: "alert-align",
      title: "Spindle Alignment Drift — SF-204B",
      severity: "WATCH",
      status: "acked",
      detectedAt: ago(1000 * 60 * 60 * 6),
      assetId: "asset-sf204b",
      payload: {
        vibration: series(24, 1.4, 0.02),
        temperature: series(24, 52, 0.05),
        failureModes: [{ name: "Spindle unbalance", confidence: 61 }],
        rootCauses: ["1× RPM amplitude trending up over 6 hours"],
        actions: [{ title: "Balance check at next doff", detail: "Phase-angle capture on spindles 12–18." }],
      },
    },
    {
      id: "alert-loom",
      title: "Loom Vibration Watch — AJ-T200-12",
      severity: "WATCH",
      status: "new",
      detectedAt: ago(1000 * 60 * 50),
      assetId: "asset-ajt200-12",
      payload: {
        vibration: series(24, 3.2, 0.04, 18),
        temperature: series(24, 44, 0.03),
        failureModes: [{ name: "Sley bearing wear", confidence: 58 }],
        rootCauses: ["2× pick-frequency energy up 18% vs baseline"],
        actions: [{ title: "Inspect sley bearings", detail: "Check lubrication and play on T-200 #12." }],
      },
    },
    {
      id: "alert-spin-nominal",
      title: "Spindle health within envelope — SF-301D",
      severity: "NOMINAL",
      status: "acked",
      detectedAt: ago(1000 * 60 * 25),
      assetId: "asset-sf301d",
      payload: {
        vibration: series(24, 0.7, 0.01),
        temperature: series(24, 46, 0.02),
        failureModes: [{ name: "No defect indicated", confidence: 8 }],
        rootCauses: [
          "Spindle vibration holds 0.6–0.8 mm/s against the family baseline",
          "Bearing temperature stable through the last two doffs",
        ],
        actions: [{ title: "Keep on standard inspection", detail: "Next planned check at 400 running hours." }],
      },
    },
    {
      id: "alert-loom-nominal",
      title: "Loom baseline confirmed — AJ-T200-08",
      severity: "NOMINAL",
      status: "acked",
      detectedAt: ago(1000 * 60 * 80),
      assetId: "asset-ajt200-08",
      payload: {
        vibration: series(24, 1.1, 0.015),
        temperature: series(24, 41, 0.01),
        failureModes: [{ name: "No defect indicated", confidence: 6 }],
        rootCauses: [
          "Sley vibration and warp tension inside the healthy envelope",
          "Pick rate holding at 1,050 PPM with no yarn-break cluster",
        ],
        actions: [{ title: "No intervention required", detail: "Continue routine monitoring on Line A." }],
      },
    },
    {
      id: "alert-dye",
      title: "Dye-vat Temperature Envelope — DY-J800-01",
      severity: "WATCH",
      status: "new",
      detectedAt: ago(1000 * 60 * 120),
      assetId: "asset-dyj800-01",
      payload: {
        vibration: series(24, 0.4, 0.01),
        temperature: series(24, 88, 0.4, 14),
        failureModes: [{ name: "Over-temperature", confidence: 71 }],
        rootCauses: ["Ramp exceeded recipe by 4 °C at hold step"],
        actions: [{ title: "Review steam valve PID", detail: "Hold step overshoot on navy lot #4412." }],
      },
    },
  ];

  const cases: CaseRow[] = [
    {
      id: "case-9021",
      caseCode: "CASE-9021",
      title: "SF-204A Spindle Alignment Issue",
      description: "Linked to bearing envelope alert. Technician dispatched.",
      priority: "Critical",
      status: "In-Progress",
      assignee: "E. Miller",
      workOrderRef: "WO-44190",
      createdAt: ago(1000 * 60 * 60 * 26),
      assetId: "asset-sf204a",
    },
    {
      id: "case-9018",
      caseCode: "CASE-9018",
      title: "SF-204B Alignment Watch",
      description: "Follow-up from spindle drift alert.",
      priority: "High",
      status: "Open",
      assignee: null,
      workOrderRef: null,
      createdAt: ago(1000 * 60 * 60 * 40),
      assetId: "asset-sf204b",
    },
    {
      id: "case-8992",
      caseCode: "CASE-8992",
      title: "Weaving Line B Vibration Trend",
      description: "Air-jet T-200 cluster — sley bearings.",
      priority: "Medium",
      status: "In-Progress",
      assignee: "T. Chen",
      workOrderRef: "WO-44012",
      createdAt: ago(1000 * 60 * 60 * 54),
      assetId: "asset-ajt200-12",
    },
    {
      id: "case-9034",
      caseCode: "CASE-9034",
      title: "DY-J800-01 Steam Valve Overshoot",
      description: "Hold-step temperature exceeded recipe on navy lot.",
      priority: "High",
      status: "In-Progress",
      assignee: "A. Khan",
      workOrderRef: "WO-44208",
      createdAt: ago(1000 * 60 * 60 * 18),
      assetId: "asset-dyj800-01",
    },
    {
      id: "case-9040",
      caseCode: "CASE-9040",
      title: "AJ-T200-08 Warp Tension Check",
      description: "Line A tension drift flagged during last two shifts.",
      priority: "Medium",
      status: "Open",
      assignee: null,
      workOrderRef: "WO-44221",
      createdAt: ago(1000 * 60 * 60 * 22),
      assetId: "asset-ajt200-08",
    },
    {
      id: "case-9044",
      caseCode: "CASE-9044",
      title: "SF-301C Unmonitored Frame Service",
      description: "Critical health with no live template — release for inspection.",
      priority: "Critical",
      status: "Open",
      assignee: "J. Patel",
      workOrderRef: "WO-44233",
      createdAt: ago(1000 * 60 * 60 * 30),
      assetId: "asset-sf301c",
    },
    {
      id: "case-9051",
      caseCode: "CASE-9051",
      title: "DY-J800-02 Liquor Ratio Verify",
      description: "Completed concentration check after valve stiction report.",
      priority: "Medium",
      status: "Resolved",
      assignee: "R. Singh",
      workOrderRef: "WO-44247",
      createdAt: ago(1000 * 60 * 60 * 80),
      assetId: "asset-dyj800-02",
    },
    {
      id: "case-9058",
      caseCode: "CASE-9058",
      title: "AJ-T180-03 Air Circuit Leak",
      description: "Pick-rate drop with 6 bar circuit pressure loss.",
      priority: "High",
      status: "In-Progress",
      assignee: "T. Chen",
      workOrderRef: "WO-44258",
      createdAt: ago(1000 * 60 * 60 * 36),
      assetId: "asset-ajt180-03",
    },
    {
      id: "case-9062",
      caseCode: "CASE-9062",
      title: "SF-301D Planned Bearing Inspect",
      description: "Routine bearing check at 400 running hours.",
      priority: "Low",
      status: "Open",
      assignee: "E. Miller",
      workOrderRef: "WO-44266",
      createdAt: ago(1000 * 60 * 60 * 12),
      assetId: "asset-sf301d",
    },
    {
      id: "case-9066",
      caseCode: "CASE-9066",
      title: "SF-204B Alignment Follow-up",
      description: "Released from spindle drift watch for field balance.",
      priority: "High",
      status: "In-Progress",
      assignee: "E. Miller",
      workOrderRef: "WO-44271",
      createdAt: ago(1000 * 60 * 60 * 16),
      assetId: "asset-sf204b",
    },
    {
      id: "case-9070",
      caseCode: "CASE-9070",
      title: "SF-204A Bearing Replacement Closeout",
      description: "Envelope defect closed after spindle bearing change.",
      priority: "Critical",
      status: "Resolved",
      assignee: "E. Miller",
      workOrderRef: "WO-44188",
      createdAt: ago(1000 * 60 * 60 * 96),
      assetId: "asset-sf204a",
    },
  ];

  const caseAlerts: CaseAlertRow[] = [
    { caseId: "case-9021", alertId: "alert-bearing" },
    { caseId: "case-9018", alertId: "alert-align" },
  ];

  const deployments: DeploymentRow[] = [
    {
      id: "dep-spinning",
      status: "deployed",
      qualityPct: 97,
      parameters: { sensitivity: 0.72, windowHrs: 24 },
      createdAt: ago(1000 * 60 * 60 * 24 * 12),
      templateId: "tpl-spinning",
    },
    {
      id: "dep-loom",
      status: "deployed",
      qualityPct: 96,
      parameters: { sensitivity: 0.68, windowHrs: 24 },
      createdAt: ago(1000 * 60 * 60 * 24 * 9),
      templateId: "tpl-loom",
    },
    {
      id: "dep-dye",
      status: "deployed",
      qualityPct: 98,
      parameters: { sensitivity: 0.7, windowHrs: 12 },
      createdAt: ago(1000 * 60 * 60 * 24 * 6),
      templateId: "tpl-dye",
    },
  ];

  const deploymentAssets: DeploymentAssetRow[] = [
    { deploymentId: "dep-spinning", assetId: "asset-sf204a" },
    { deploymentId: "dep-spinning", assetId: "asset-sf204b" },
    { deploymentId: "dep-spinning", assetId: "asset-sf301d" },
    { deploymentId: "dep-loom", assetId: "asset-ajt200-12" },
    { deploymentId: "dep-loom", assetId: "asset-ajt200-08" },
    { deploymentId: "dep-dye", assetId: "asset-dyj800-01" },
  ];

  const mappings: SignalMappingRow[] = [
    { id: "map-sf204a-vib", signalKey: "vib_spindle", tagName: "SF204A.VIB.SPDL", assetId: "asset-sf204a" },
    { id: "map-sf204a-tmp", signalKey: "temp_bearing", tagName: "SF204A.TMP.BRG", assetId: "asset-sf204a" },
    { id: "map-sf204b-vib", signalKey: "vib_spindle", tagName: "SF204B.VIB.SPDL", assetId: "asset-sf204b" },
    { id: "map-sf301d-vib", signalKey: "vib_spindle", tagName: "SF301D.VIB.SPDL", assetId: "asset-sf301d" },
    { id: "map-ajt200-12-vib", signalKey: "vib_sley", tagName: "AJT20012.VIB.SLY", assetId: "asset-ajt200-12" },
    { id: "map-ajt200-08-vib", signalKey: "vib_sley", tagName: "AJT20008.VIB.SLY", assetId: "asset-ajt200-08" },
    { id: "map-dy01-tmp", signalKey: "vat_temp", tagName: "DYJ80001.TMP.VAT", assetId: "asset-dyj800-01" },
  ];

  return {
    plants,
    families,
    templates,
    assets,
    alerts,
    cases,
    caseAlerts,
    deployments,
    deploymentAssets,
    mappings,
  };
}
