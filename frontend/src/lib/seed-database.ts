import { PrismaClient } from "@prisma/client";

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

export async function seedDatabase(prisma: PrismaClient) {
  await prisma.caseAlert.deleteMany();
  await prisma.deploymentAsset.deleteMany();
  await prisma.signalMapping.deleteMany();
  await prisma.case.deleteMany();
  await prisma.alert.deleteMany();
  await prisma.deployment.deleteMany();
  await prisma.asset.deleteMany();
  await prisma.reliabilityTemplate.deleteMany();
  await prisma.assetFamily.deleteMany();
  await prisma.plant.deleteMany();

  const spinningHall = await prisma.plant.create({
    data: {
      name: "Faisalabad Mill — Spinning Hall",
      code: "FSD-SP",
      location: "Faisalabad, Punjab",
      healthScore: 78,
    },
  });
  const weavingShed = await prisma.plant.create({
    data: {
      name: "Faisalabad Mill — Weaving Shed",
      code: "FSD-WV",
      location: "Faisalabad, Punjab",
      healthScore: 91,
    },
  });
  const dyeHouse = await prisma.plant.create({
    data: {
      name: "Faisalabad Mill — Dye House",
      code: "FSD-DY",
      location: "Faisalabad, Punjab",
      healthScore: 86,
    },
  });

  const spinning = await prisma.assetFamily.create({
    data: {
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
  });

  const looms = await prisma.assetFamily.create({
    data: {
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
  });

  const dyeing = await prisma.assetFamily.create({
    data: {
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
  });

  const spinningTpl = await prisma.reliabilityTemplate.create({
    data: {
      slug: "spinning-machine-v2",
      name: "Spinning Machine V2",
      version: "2.4.0",
      familyId: spinning.id,
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
  });

  const loomTpl = await prisma.reliabilityTemplate.create({
    data: {
      slug: "loom-vibration-analysis",
      name: "Loom Vibration Analysis",
      version: "1.8.0",
      familyId: looms.id,
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
  });

  const dyeTpl = await prisma.reliabilityTemplate.create({
    data: {
      slug: "dye-vat-thermal",
      name: "Dye-vat Thermal",
      version: "1.2.0",
      familyId: dyeing.id,
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
  });

  const sf204a = await prisma.asset.create({
    data: {
      assetCode: "SF-204A",
      name: "Ring Frame SF-204A",
      location: "Plant 1 - Sector 4",
      healthScore: 42,
      status: "CRITICAL",
      monitored: true,
      model: "Rieter G 38",
      lastService: "14 Days Ago",
      plantId: spinningHall.id,
      familyId: spinning.id,
      templateId: spinningTpl.id,
    },
  });
  const sf204b = await prisma.asset.create({
    data: {
      assetCode: "SF-204B",
      name: "Ring Frame SF-204B",
      location: "Plant 1 - Sector 4",
      healthScore: 78,
      status: "WATCH",
      monitored: true,
      model: "Rieter G 38",
      lastService: "32 Days Ago",
      plantId: spinningHall.id,
      familyId: spinning.id,
      templateId: spinningTpl.id,
    },
  });
  const sf301c = await prisma.asset.create({
    data: {
      assetCode: "SF-301C",
      name: "Ring Frame SF-301C",
      location: "Plant 2 - Sector 1",
      healthScore: 42,
      status: "CRITICAL",
      monitored: false,
      model: "Toyota RX300",
      lastService: "8 Days Ago",
      plantId: spinningHall.id,
      familyId: spinning.id,
    },
  });
  const sf301d = await prisma.asset.create({
    data: {
      assetCode: "SF-301D",
      name: "Ring Frame SF-301D",
      location: "Plant 2 - Sector 1",
      healthScore: 98,
      status: "NOMINAL",
      monitored: true,
      model: "Toyota RX300",
      lastService: "5 Days Ago",
      plantId: spinningHall.id,
      familyId: spinning.id,
      templateId: spinningTpl.id,
    },
  });

  const loomT200 = await prisma.asset.create({
    data: {
      assetCode: "AJ-T200-12",
      name: "High-Speed Loom T-200",
      location: "Weaving Shed - Line B",
      healthScore: 81,
      status: "WATCH",
      monitored: true,
      model: "T-200 Air Jet",
      lastService: "21 Days Ago",
      plantId: weavingShed.id,
      familyId: looms.id,
      templateId: loomTpl.id,
    },
  });
  const loomT200Healthy = await prisma.asset.create({
    data: {
      assetCode: "AJ-T200-08",
      name: "High-Speed Loom T-200 #08",
      location: "Weaving Shed - Line A",
      healthScore: 94,
      status: "NOMINAL",
      monitored: true,
      model: "T-200 Air Jet",
      lastService: "11 Days Ago",
      plantId: weavingShed.id,
      familyId: looms.id,
      templateId: loomTpl.id,
    },
  });
  const loomT180 = await prisma.asset.create({
    data: {
      assetCode: "AJ-T180-03",
      name: "Air-Jet Loom T-180 #03",
      location: "Weaving Shed - Line A",
      healthScore: 96,
      status: "NOMINAL",
      monitored: false,
      model: "T-180 Air Jet",
      lastService: "40 Days Ago",
      plantId: weavingShed.id,
      familyId: looms.id,
    },
  });

  const dye01 = await prisma.asset.create({
    data: {
      assetCode: "DY-J800-01",
      name: "Jet Dyeing Machine 01",
      location: "Dye House - Bay 2",
      healthScore: 74,
      status: "WATCH",
      monitored: true,
      model: "Then Airflow Synergy",
      lastService: "9 Days Ago",
      plantId: dyeHouse.id,
      familyId: dyeing.id,
      templateId: dyeTpl.id,
    },
  });
  const dye02 = await prisma.asset.create({
    data: {
      assetCode: "DY-J800-02",
      name: "Jet Dyeing Machine 02",
      location: "Dye House - Bay 2",
      healthScore: 92,
      status: "NOMINAL",
      monitored: false,
      model: "Then Airflow Synergy",
      lastService: "18 Days Ago",
      plantId: dyeHouse.id,
      familyId: dyeing.id,
    },
  });

  const bearingAlert = await prisma.alert.create({
    data: {
      title: "Bearing Failure Detection — SF-204A",
      severity: "CRITICAL",
      status: "new",
      detectedAt: new Date(),
      assetId: sf204a.id,
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
          {
            title: "Dispatch Field Technician",
            detail: "Visual inspection of housing and grease purge analysis.",
          },
          {
            title: "Prepare Spare Parts",
            detail: "SKF 6204-2RS bearing assembly likely required.",
          },
          {
            title: "Schedule Maintenance Window",
            detail: "Estimated downtime: 4 hours. Recommend prior to next shift.",
          },
        ],
      },
    },
  });

  const alignAlert = await prisma.alert.create({
    data: {
      title: "Spindle Alignment Drift — SF-204B",
      severity: "WATCH",
      status: "acked",
      detectedAt: new Date(Date.now() - 1000 * 60 * 60 * 6),
      assetId: sf204b.id,
      payload: {
        vibration: series(24, 1.4, 0.02),
        temperature: series(24, 52, 0.05),
        failureModes: [{ name: "Spindle unbalance", confidence: 61 }],
        rootCauses: ["1× RPM amplitude trending up over 6 hours"],
        actions: [
          { title: "Balance check at next doff", detail: "Phase-angle capture on spindles 12–18." },
        ],
      },
    },
  });

  await prisma.alert.create({
    data: {
      title: "Loom Vibration Watch — AJ-T200-12",
      severity: "WATCH",
      status: "new",
      detectedAt: new Date(Date.now() - 1000 * 60 * 50),
      assetId: loomT200.id,
      payload: {
        vibration: series(24, 3.2, 0.04, 18),
        temperature: series(24, 44, 0.03),
        failureModes: [{ name: "Sley bearing wear", confidence: 58 }],
        rootCauses: ["2× pick-frequency energy up 18% vs baseline"],
        actions: [
          { title: "Inspect sley bearings", detail: "Check lubrication and play on T-200 #12." },
        ],
      },
    },
  });

  await prisma.alert.create({
    data: {
      title: "Spindle health within envelope — SF-301D",
      severity: "NOMINAL",
      status: "acked",
      detectedAt: new Date(Date.now() - 1000 * 60 * 25),
      assetId: sf301d.id,
      payload: {
        vibration: series(24, 0.7, 0.01),
        temperature: series(24, 46, 0.02),
        failureModes: [{ name: "No defect indicated", confidence: 8 }],
        rootCauses: [
          "Spindle vibration holds 0.6–0.8 mm/s against the family baseline",
          "Bearing temperature stable through the last two doffs",
        ],
        actions: [
          { title: "Keep on standard inspection", detail: "Next planned check at 400 running hours." },
        ],
      },
    },
  });

  await prisma.alert.create({
    data: {
      title: "Loom baseline confirmed — AJ-T200-08",
      severity: "NOMINAL",
      status: "acked",
      detectedAt: new Date(Date.now() - 1000 * 60 * 80),
      assetId: loomT200Healthy.id,
      payload: {
        vibration: series(24, 1.1, 0.015),
        temperature: series(24, 41, 0.01),
        failureModes: [{ name: "No defect indicated", confidence: 6 }],
        rootCauses: [
          "Sley vibration and warp tension inside the healthy envelope",
          "Pick rate holding at 1,050 PPM with no yarn-break cluster",
        ],
        actions: [
          { title: "No intervention required", detail: "Continue routine monitoring on Line A." },
        ],
      },
    },
  });

  await prisma.alert.create({
    data: {
      title: "Dye-vat Temperature Envelope — DY-J800-01",
      severity: "WATCH",
      status: "new",
      detectedAt: new Date(Date.now() - 1000 * 60 * 120),
      assetId: dye01.id,
      payload: {
        vibration: series(24, 0.4, 0.01),
        temperature: series(24, 88, 0.4, 14),
        failureModes: [{ name: "Over-temperature", confidence: 71 }],
        rootCauses: ["Ramp exceeded recipe by 4 °C at hold step"],
        actions: [{ title: "Review steam valve PID", detail: "Hold step overshoot on navy lot #4412." }],
      },
    },
  });

  await prisma.case.create({
    data: {
      caseCode: "CASE-9021",
      title: "SF-204A Spindle Alignment Issue",
      description: "Linked to bearing envelope alert. Technician dispatched.",
      priority: "Critical",
      status: "In-Progress",
      assignee: "E. Miller",
      workOrderRef: "WO-44190",
      assetId: sf204a.id,
      alerts: { create: [{ alertId: bearingAlert.id }] },
    },
  });
  await prisma.case.create({
    data: {
      caseCode: "CASE-9018",
      title: "SF-204B Alignment Watch",
      description: "Follow-up from spindle drift alert.",
      priority: "High",
      status: "Open",
      assignee: null,
      workOrderRef: null,
      assetId: sf204b.id,
      alerts: { create: [{ alertId: alignAlert.id }] },
    },
  });
  await prisma.case.create({
    data: {
      caseCode: "CASE-8992",
      title: "Weaving Line B Vibration Trend",
      description: "Air-jet T-200 cluster — sley bearings.",
      priority: "Medium",
      status: "In-Progress",
      assignee: "T. Chen",
      workOrderRef: "WO-44012",
      assetId: loomT200.id,
    },
  });

  await prisma.case.createMany({
    data: [
      {
        caseCode: "CASE-9034",
        title: "DY-J800-01 Steam Valve Overshoot",
        description: "Hold-step temperature exceeded recipe on navy lot.",
        priority: "High",
        status: "In-Progress",
        assignee: "A. Khan",
        workOrderRef: "WO-44208",
        assetId: dye01.id,
      },
      {
        caseCode: "CASE-9040",
        title: "AJ-T200-08 Warp Tension Check",
        description: "Line A tension drift flagged during last two shifts.",
        priority: "Medium",
        status: "Open",
        assignee: null,
        workOrderRef: "WO-44221",
        assetId: loomT200Healthy.id,
      },
      {
        caseCode: "CASE-9044",
        title: "SF-301C Unmonitored Frame Service",
        description: "Critical health with no live template — release for inspection.",
        priority: "Critical",
        status: "Open",
        assignee: "J. Patel",
        workOrderRef: "WO-44233",
        assetId: sf301c.id,
      },
      {
        caseCode: "CASE-9051",
        title: "DY-J800-02 Liquor Ratio Verify",
        description: "Completed concentration check after valve stiction report.",
        priority: "Medium",
        status: "Resolved",
        assignee: "R. Singh",
        workOrderRef: "WO-44247",
        assetId: dye02.id,
      },
      {
        caseCode: "CASE-9058",
        title: "AJ-T180-03 Air Circuit Leak",
        description: "Pick-rate drop with 6 bar circuit pressure loss.",
        priority: "High",
        status: "In-Progress",
        assignee: "T. Chen",
        workOrderRef: "WO-44258",
        assetId: loomT180.id,
      },
      {
        caseCode: "CASE-9062",
        title: "SF-301D Planned Bearing Inspect",
        description: "Routine bearing check at 400 running hours.",
        priority: "Low",
        status: "Open",
        assignee: "E. Miller",
        workOrderRef: "WO-44266",
        assetId: sf301d.id,
      },
      {
        caseCode: "CASE-9066",
        title: "SF-204B Alignment Follow-up",
        description: "Released from spindle drift watch for field balance.",
        priority: "High",
        status: "In-Progress",
        assignee: "E. Miller",
        workOrderRef: "WO-44271",
        assetId: sf204b.id,
      },
      {
        caseCode: "CASE-9070",
        title: "SF-204A Bearing Replacement Closeout",
        description: "Envelope defect closed after spindle bearing change.",
        priority: "Critical",
        status: "Resolved",
        assignee: "E. Miller",
        workOrderRef: "WO-44188",
        assetId: sf204a.id,
      },
    ],
  });
}
