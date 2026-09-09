import { prisma } from "./prisma";
import { seedDatabase } from "./seed-database";

let seeding: Promise<void> | null = null;

export async function ensureSeeded() {
  const count = await prisma.plant.count();
  if (count === 0) {
    if (!seeding) {
      seeding = seedDatabase(prisma).finally(() => {
        seeding = null;
      });
    }
    await seeding;
    return;
  }

  await backfillWorkOrders();

  const nominal = await prisma.alert.count({ where: { severity: "NOMINAL" } });
  if (nominal > 0) return;

  const [spinning, loom] = await Promise.all([
    prisma.asset.findUnique({ where: { assetCode: "SF-301D" } }),
    prisma.asset.findUnique({ where: { assetCode: "AJ-T200-08" } }),
  ]);
  if (!spinning || !loom) return;

  function series(points: number, start: number, drift: number) {
    const data: { t: number; v: number }[] = [];
    let v = start;
    for (let i = 0; i < points; i++) {
      v += drift + Math.sin(i / 3) * 0.4;
      data.push({ t: i, v: Math.round(v * 10) / 10 });
    }
    return data;
  }

  await prisma.alert.createMany({
    data: [
      {
        title: "Spindle health within envelope — SF-301D",
        severity: "NOMINAL",
        status: "acked",
        detectedAt: new Date(Date.now() - 1000 * 60 * 25),
        assetId: spinning.id,
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
        title: "Loom baseline confirmed — AJ-T200-08",
        severity: "NOMINAL",
        status: "acked",
        detectedAt: new Date(Date.now() - 1000 * 60 * 80),
        assetId: loom.id,
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
    ],
  });
}

async function backfillWorkOrders() {
  const assets = await prisma.asset.findMany({
    where: {
      assetCode: {
        in: ["DY-J800-01", "AJ-T200-08", "SF-301C", "DY-J800-02", "AJ-T180-03", "SF-301D", "SF-204B", "SF-204A"],
      },
    },
    select: { id: true, assetCode: true },
  });
  const id = Object.fromEntries(assets.map((asset) => [asset.assetCode, asset.id]));
  if (!id["DY-J800-01"] || !id["SF-204A"]) return;

  const extra = [
      {
        caseCode: "CASE-9034",
        title: "DY-J800-01 Steam Valve Overshoot",
        description: "Hold-step temperature exceeded recipe on navy lot.",
        priority: "High",
        status: "In-Progress",
        assignee: "A. Khan",
        workOrderRef: "WO-44208",
        assetId: id["DY-J800-01"],
      },
      {
        caseCode: "CASE-9040",
        title: "AJ-T200-08 Warp Tension Check",
        description: "Line A tension drift flagged during last two shifts.",
        priority: "Medium",
        status: "Open",
        assignee: null,
        workOrderRef: "WO-44221",
        assetId: id["AJ-T200-08"],
      },
      {
        caseCode: "CASE-9044",
        title: "SF-301C Unmonitored Frame Service",
        description: "Critical health with no live template — release for inspection.",
        priority: "Critical",
        status: "Open",
        assignee: "J. Patel",
        workOrderRef: "WO-44233",
        assetId: id["SF-301C"],
      },
      {
        caseCode: "CASE-9051",
        title: "DY-J800-02 Liquor Ratio Verify",
        description: "Completed concentration check after valve stiction report.",
        priority: "Medium",
        status: "Resolved",
        assignee: "R. Singh",
        workOrderRef: "WO-44247",
        assetId: id["DY-J800-02"],
      },
      {
        caseCode: "CASE-9058",
        title: "AJ-T180-03 Air Circuit Leak",
        description: "Pick-rate drop with 6 bar circuit pressure loss.",
        priority: "High",
        status: "In-Progress",
        assignee: "T. Chen",
        workOrderRef: "WO-44258",
        assetId: id["AJ-T180-03"],
      },
      {
        caseCode: "CASE-9062",
        title: "SF-301D Planned Bearing Inspect",
        description: "Routine bearing check at 400 running hours.",
        priority: "Low",
        status: "Open",
        assignee: "E. Miller",
        workOrderRef: "WO-44266",
        assetId: id["SF-301D"],
      },
      {
        caseCode: "CASE-9066",
        title: "SF-204B Alignment Follow-up",
        description: "Released from spindle drift watch for field balance.",
        priority: "High",
        status: "In-Progress",
        assignee: "E. Miller",
        workOrderRef: "WO-44271",
        assetId: id["SF-204B"],
      },
      {
        caseCode: "CASE-9070",
        title: "SF-204A Bearing Replacement Closeout",
        description: "Envelope defect closed after spindle bearing change.",
        priority: "Critical",
        status: "Resolved",
        assignee: "E. Miller",
        workOrderRef: "WO-44188",
        assetId: id["SF-204A"],
      },
    ].filter((row) => Boolean(row.assetId));

  const existing = await prisma.case.findMany({
    where: { caseCode: { in: extra.map((row) => row.caseCode) } },
    select: { caseCode: true },
  });
  const have = new Set(existing.map((row) => row.caseCode));
  const missing = extra.filter((row) => !have.has(row.caseCode));
  if (!missing.length) return;
  await prisma.case.createMany({ data: missing });
}
