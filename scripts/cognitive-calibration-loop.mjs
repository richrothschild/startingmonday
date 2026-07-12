#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import {
  postSlackText,
  writeLatestReportFiles,
} from "./lib/agent-report-kit.mjs";

const slackWebhook =
  process.env.SLACK_RELIABILITY_SERVICE_WEBHOOK_URL ||
  process.env.SLACK_WEBHOOK_URL ||
  "";
const slackChannel =
  process.env.RELIABILITY_SLACK_CHANNEL || "reliability---service";

const deterministicPath = path.join(
  process.cwd(),
  "docs",
  "status",
  "cognitive-load.latest.json",
);
const auditorPath = path.join(
  process.cwd(),
  "docs",
  "status",
  "cognitive-fluency-auditor.latest.json",
);
const reportJsonPath = path.join(
  process.cwd(),
  "docs",
  "status",
  "cognitive-calibration-loop.latest.json",
);
const reportMdPath = path.join(
  process.cwd(),
  "docs",
  "status",
  "cognitive-calibration-loop.latest.md",
);
const historyJsonPath = path.join(
  process.cwd(),
  "docs",
  "status",
  "cognitive-calibration-loop.history.json",
);
const scoreAdjustmentsPath = path.join(
  process.cwd(),
  "config",
  "cognitive-fluency-score-adjustments.json",
);

const args = new Set(process.argv.slice(2));
const applyAdjustments = args.has("--apply-adjustments");

const gradeOrder = ["A-", "B+", "B", "C+", "C"];

function gradeIndex(grade) {
  const idx = gradeOrder.indexOf(grade);
  return idx === -1 ? null : idx;
}

function normalizeGrade(value) {
  if (typeof value !== "string") return null;
  const clean = value.trim().toUpperCase();
  const map = {
    A: "A-",
    "A+": "A-",
    "A-": "A-",
    "B+": "B+",
    B: "B",
    "B-": "B",
    "C+": "C+",
    C: "C",
    "C-": "C",
    D: "C",
    F: "C",
  };
  return map[clean] ?? null;
}

function loadScoreAdjustments() {
  if (!fs.existsSync(scoreAdjustmentsPath)) {
    return {
      version: 1,
      createdAt: new Date().toISOString(),
      adjustments: {},
      issueTypeWeights: {
        "cognitive-load-density": 1.5,
        "choice-overload": 2,
        "trust-spillover": 2.5,
        "typography-inconsistency": 0.8,
        "layout-regression": 1.2,
      },
      routeMultipliers: {
        dashboard: 1.25,
        funnel: 1.5,
        public: 1,
        admin: 0.8,
      },
    };
  }
  return JSON.parse(fs.readFileSync(scoreAdjustmentsPath, "utf8"));
}

function loadCalibrationHistory() {
  if (!fs.existsSync(historyJsonPath)) {
    return { version: 1, runs: [] };
  }
  const parsed = JSON.parse(fs.readFileSync(historyJsonPath, "utf8"));
  return {
    version: parsed.version ?? 1,
    runs: Array.isArray(parsed.runs) ? parsed.runs : [],
  };
}

function writeCalibrationHistory(history, report) {
  const nextRuns = [
    ...history.runs,
    {
      generatedAt: report.generatedAt,
      status: report.status,
      overlapRoutes: report.summary.overlapRoutes,
      exactAgreementRate: report.summary.exactAgreementRate,
      withinOneGradeRate: report.summary.withinOneGradeRate,
      deterministicStricter: report.summary.deterministicStricter,
      auditorStricter: report.summary.auditorStricter,
      majorDisagreements: report.majorDisagreements.length,
    },
  ].slice(-16);

  const nextHistory = {
    version: history.version,
    updatedAt: report.generatedAt,
    runs: nextRuns,
  };

  fs.mkdirSync(path.dirname(historyJsonPath), { recursive: true });
  fs.writeFileSync(historyJsonPath, `${JSON.stringify(nextHistory, null, 2)}\n`, "utf8");
  return nextHistory;
}

function loadDeterministicSnapshot() {
  if (!fs.existsSync(deterministicPath)) {
    execFileSync(process.execPath, ["scripts/cognitive-load-agent.mjs"], {
      cwd: process.cwd(),
      stdio: "inherit",
    });
  }

  if (!fs.existsSync(deterministicPath)) {
    throw new Error(
      `Missing deterministic cognitive snapshot: ${deterministicPath}`,
    );
  }

  const raw = JSON.parse(fs.readFileSync(deterministicPath, "utf8"));
  const byRoute = new Map();
  for (const page of raw.pages ?? []) {
    const route = page.route;
    if (!route) continue;
    byRoute.set(route, {
      route,
      tier: page.tier ?? null,
      loadGrade: normalizeGrade(page.grade),
      fluencyGrade: normalizeGrade(page.fluency?.grade),
      fluencyScore: Number.isFinite(page.fluency?.score)
        ? page.fluency.score
        : null,
      issueCount: Number.isFinite(page.issueCount) ? page.issueCount : null,
    });
  }

  return {
    generatedAt: raw.generatedAt ?? null,
    sesVersion: raw.sesVersion ?? null,
    totalPages: raw.totalPages ?? byRoute.size,
    byRoute,
  };
}

function loadAuditorSnapshot() {
  if (!fs.existsSync(auditorPath)) {
    return {
      found: false,
      generatedAt: null,
      byRoute: new Map(),
      notes: ["Missing docs/status/cognitive-fluency-auditor.latest.json"],
    };
  }

  const raw = JSON.parse(fs.readFileSync(auditorPath, "utf8"));
  const sourceRoutes = Array.isArray(raw.routes)
    ? raw.routes
    : Array.isArray(raw.findings)
      ? raw.findings
      : Array.isArray(raw.pages)
        ? raw.pages
        : [];

  const byRoute = new Map();
  for (const row of sourceRoutes) {
    const route = row.route ?? row.path;
    if (!route) continue;
    byRoute.set(route, {
      route,
      grade: normalizeGrade(
        row.grade ?? row.fluencyGrade ?? row.cognitiveGrade,
      ),
      notes: row.notes ?? row.summary ?? null,
      source: row.source ?? null,
    });
  }

  return {
    found: true,
    generatedAt: raw.generatedAt ?? raw.createdAt ?? null,
    byRoute,
    notes: [],
  };
}

function compareSnapshots(deterministic, auditor) {
  const overlap = [];
  const deterministicOnly = [];
  const auditorOnly = [];

  const deterministicRoutes = [...deterministic.byRoute.keys()].sort();
  const auditorRoutes = [...auditor.byRoute.keys()].sort();

  const auditorSet = new Set(auditorRoutes);
  const deterministicSet = new Set(deterministicRoutes);

  for (const route of deterministicRoutes) {
    if (!auditorSet.has(route)) {
      deterministicOnly.push(route);
      continue;
    }
    const det = deterministic.byRoute.get(route);
    const aud = auditor.byRoute.get(route);

    const detGrade = det?.fluencyGrade ?? det?.loadGrade;
    const audGrade = aud?.grade;
    const detIdx = gradeIndex(detGrade);
    const audIdx = gradeIndex(audGrade);

    let relation = "unknown";
    let distance = null;
    if (detIdx !== null && audIdx !== null) {
      distance = Math.abs(detIdx - audIdx);
      if (detIdx === audIdx) relation = "exact";
      else if (detIdx > audIdx) relation = "deterministic-stricter";
      else relation = "auditor-stricter";
    }

    overlap.push({
      route,
      deterministicGrade: detGrade,
      auditorGrade: audGrade,
      relation,
      distance,
      deterministicTier: det?.tier ?? null,
      deterministicFluencyScore: det?.fluencyScore ?? null,
      issueCount: det?.issueCount ?? null,
      auditorNotes: aud?.notes ?? null,
    });
  }

  for (const route of auditorRoutes) {
    if (!deterministicSet.has(route)) auditorOnly.push(route);
  }

  const exact = overlap.filter((row) => row.relation === "exact").length;
  const withinOneGrade = overlap.filter(
    (row) => row.distance !== null && row.distance <= 1,
  ).length;
  const deterministicStricter = overlap.filter(
    (row) => row.relation === "deterministic-stricter",
  ).length;
  const auditorStricter = overlap.filter(
    (row) => row.relation === "auditor-stricter",
  ).length;

  return {
    overlap,
    deterministicOnly,
    auditorOnly,
    summary: {
      overlapRoutes: overlap.length,
      exactAgreement: exact,
      withinOneGrade,
      deterministicStricter,
      auditorStricter,
      exactAgreementRate:
        overlap.length === 0
          ? null
          : Number((exact / overlap.length).toFixed(3)),
      withinOneGradeRate:
        overlap.length === 0
          ? null
          : Number((withinOneGrade / overlap.length).toFixed(3)),
    },
  };
}

function computeQuarterTrend(history, summary) {
  const previous = history.runs.length > 0 ? history.runs[history.runs.length - 1] : null;
  if (!previous) {
    return {
      available: false,
      note: "No previous quarterly run in history.",
      exactAgreementRateDelta: null,
      withinOneGradeRateDelta: null,
      majorDisagreementsDelta: null,
    };
  }

  const exactAgreementRateDelta =
    summary.exactAgreementRate === null || previous.exactAgreementRate === null
      ? null
      : Number((summary.exactAgreementRate - previous.exactAgreementRate).toFixed(3));
  const withinOneGradeRateDelta =
    summary.withinOneGradeRate === null || previous.withinOneGradeRate === null
      ? null
      : Number((summary.withinOneGradeRate - previous.withinOneGradeRate).toFixed(3));
  const majorDisagreementsDelta =
    typeof previous.majorDisagreements !== "number"
      ? null
      : Number(((summary.overlapRoutes - summary.withinOneGrade) - previous.majorDisagreements).toFixed(0));

  return {
    available: true,
    previousGeneratedAt: previous.generatedAt,
    exactAgreementRateDelta,
    withinOneGradeRateDelta,
    majorDisagreementsDelta,
  };
}

function buildMajorDisagreements(overlap) {
  return overlap
    .filter((row) => (row.distance ?? 0) >= 2)
    .sort((a, b) => (b.distance ?? -1) - (a.distance ?? -1) || a.route.localeCompare(b.route));
}

function buildRecommendations(majorDisagreements, scoreAdjustments) {
  const byTier = new Map();
  for (const row of majorDisagreements) {
    const tier = row.deterministicTier ?? "public";
    const bucket = byTier.get(tier) ?? { count: 0, auditorStricter: 0, deterministicStricter: 0 };
    bucket.count += 1;
    if (row.relation === "auditor-stricter") bucket.auditorStricter += 1;
    if (row.relation === "deterministic-stricter") bucket.deterministicStricter += 1;
    byTier.set(tier, bucket);
  }

  const routeMultiplierSuggestions = [];
  for (const [tier, stats] of byTier.entries()) {
    const current = Number(scoreAdjustments.routeMultipliers?.[tier] ?? 1);
    if (stats.auditorStricter >= 2) {
      routeMultiplierSuggestions.push({
        tier,
        current,
        suggested: Number((current + 0.05).toFixed(2)),
        rationale: `Auditor is stricter on ${stats.auditorStricter}/${stats.count} major disagreements for ${tier}.`,
      });
    } else if (stats.deterministicStricter >= 2) {
      routeMultiplierSuggestions.push({
        tier,
        current,
        suggested: Number(Math.max(0.5, current - 0.05).toFixed(2)),
        rationale: `Deterministic is stricter on ${stats.deterministicStricter}/${stats.count} major disagreements for ${tier}.`,
      });
    }
  }

  const routeAdjustmentSuggestions = majorDisagreements.slice(0, 10).map((row) => ({
    route: row.route,
    deterministicGrade: row.deterministicGrade,
    auditorGrade: row.auditorGrade,
    relation: row.relation,
    suggestion:
      row.relation === "auditor-stricter"
        ? "Increase deterministic penalty for this route pattern until next calibration."
        : "Review deterministic threshold severity on this route pattern for potential easing.",
  }));

  return {
    routeMultiplierSuggestions,
    routeAdjustmentSuggestions,
  };
}

function applyCalibrationRecommendations(scoreAdjustments, recommendations) {
  const next = {
    ...scoreAdjustments,
    routeMultipliers: { ...(scoreAdjustments.routeMultipliers ?? {}) },
    lastUpdatedAt: new Date().toISOString(),
  };

  for (const suggestion of recommendations.routeMultiplierSuggestions) {
    next.routeMultipliers[suggestion.tier] = suggestion.suggested;
  }

  fs.writeFileSync(scoreAdjustmentsPath, `${JSON.stringify(next, null, 2)}\n`, "utf8");
  return next;
}

function buildMarkdown(report) {
  const lines = [];
  lines.push("# Cognitive Calibration Loop Report");
  lines.push("");
  lines.push(`Generated: ${report.generatedAt}`);
  lines.push(`Channel: ${report.channel}`);
  lines.push(
    `Deterministic snapshot: ${report.deterministic.generatedAt ?? "n/a"}`,
  );
  lines.push(`Auditor snapshot: ${report.auditor.generatedAt ?? "missing"}`);
  lines.push(`Status: ${report.status}`);
  lines.push("");
  lines.push("## Summary");
  lines.push("");
  lines.push(`- Overlap routes: ${report.summary.overlapRoutes}`);
  lines.push(`- Exact agreement: ${report.summary.exactAgreement}`);
  lines.push(`- Within one grade: ${report.summary.withinOneGrade}`);
  lines.push(
    `- Deterministic stricter: ${report.summary.deterministicStricter}`,
  );
  lines.push(`- Auditor stricter: ${report.summary.auditorStricter}`);
  lines.push(
    `- Exact agreement rate: ${report.summary.exactAgreementRate ?? "n/a"}`,
  );
  lines.push(
    `- Within one grade rate: ${report.summary.withinOneGradeRate ?? "n/a"}`,
  );
  lines.push(`- Major disagreements (distance >= 2): ${report.majorDisagreements.length}`);
  lines.push("");

  lines.push("## Quarter-over-Quarter Trend");
  lines.push("");
  if (!report.quarterTrend.available) {
    lines.push(`- ${report.quarterTrend.note}`);
  } else {
    lines.push(`- Previous run: ${report.quarterTrend.previousGeneratedAt}`);
    lines.push(`- Exact agreement rate delta: ${report.quarterTrend.exactAgreementRateDelta ?? "n/a"}`);
    lines.push(`- Within-one-grade rate delta: ${report.quarterTrend.withinOneGradeRateDelta ?? "n/a"}`);
    lines.push(`- Major disagreements delta: ${report.quarterTrend.majorDisagreementsDelta ?? "n/a"}`);
  }
  lines.push("");

  if (report.deterministicOnly.length > 0) {
    lines.push("## Deterministic-only routes");
    lines.push("");
    for (const route of report.deterministicOnly.slice(0, 20))
      lines.push(`- ${route}`);
    lines.push("");
  }

  if (report.auditorOnly.length > 0) {
    lines.push("## Auditor-only routes");
    lines.push("");
    for (const route of report.auditorOnly.slice(0, 20))
      lines.push(`- ${route}`);
    lines.push("");
  }

  lines.push("## Largest disagreements");
  lines.push("");
  const disagreements = [...report.overlap]
    .filter((row) => row.distance !== null)
    .sort(
      (a, b) =>
        (b.distance ?? -1) - (a.distance ?? -1) ||
        a.route.localeCompare(b.route),
    )
    .slice(0, 12);
  if (disagreements.length === 0) {
    lines.push("- None");
  } else {
    for (const row of disagreements) {
      lines.push(
        `- ${row.route}: deterministic=${row.deterministicGrade ?? "n/a"}, auditor=${row.auditorGrade ?? "n/a"}, relation=${row.relation}, distance=${row.distance}`,
      );
    }
  }
  lines.push("");

  lines.push("## Calibration Recommendations");
  lines.push("");
  if (report.recommendations.routeMultiplierSuggestions.length === 0) {
    lines.push("- No route-multiplier changes suggested this quarter.");
  } else {
    for (const suggestion of report.recommendations.routeMultiplierSuggestions) {
      lines.push(`- ${suggestion.tier}: ${suggestion.current} -> ${suggestion.suggested} (${suggestion.rationale})`);
    }
  }
  lines.push("");

  lines.push(`Adjustments applied: ${report.adjustmentsApplied}`);
  lines.push("");
  return `${lines.join("\n")}\n`;
}

function buildSlackText(report) {
  if (report.status === "blocked-missing-auditor-snapshot") {
    return [
      "*Quarterly cognitive calibration loop: blocked*",
      `Channel: ${report.channel}`,
      `Deterministic snapshot: ${report.deterministic.generatedAt ?? "n/a"}`,
      "",
      "*Action needed*",
      "- Publish the Page Experience Auditor report through .github/workflows/cognitive-fluency-auditor.yml, or provide docs/status/cognitive-fluency-auditor.latest.json, then re-run this workflow.",
    ].join("\n");
  }

  return [
    "*Quarterly cognitive calibration loop complete*",
    `Channel: ${report.channel}`,
    `Overlap routes: ${report.summary.overlapRoutes}`,
    `Exact agreement: ${report.summary.exactAgreement} (${report.summary.exactAgreementRate ?? "n/a"})`,
    `Within one grade: ${report.summary.withinOneGrade} (${report.summary.withinOneGradeRate ?? "n/a"})`,
    `Major disagreements: ${report.majorDisagreements.length}`,
    `Deterministic stricter: ${report.summary.deterministicStricter}`,
    `Auditor stricter: ${report.summary.auditorStricter}`,
    `Adjustments applied: ${report.adjustmentsApplied}`,
  ].join("\n");
}

async function main() {
  const deterministic = loadDeterministicSnapshot();
  const auditor = loadAuditorSnapshot();
  const compared = compareSnapshots(deterministic, auditor);
  const scoreAdjustments = loadScoreAdjustments();
  const history = loadCalibrationHistory();
  const majorDisagreements = buildMajorDisagreements(compared.overlap);
  const recommendations = buildRecommendations(majorDisagreements, scoreAdjustments);
  const quarterTrend = computeQuarterTrend(history, compared.summary);

  if (applyAdjustments && recommendations.routeMultiplierSuggestions.length > 0) {
    applyCalibrationRecommendations(scoreAdjustments, recommendations);
  }

  const report = {
    generatedAt: new Date().toISOString(),
    channel: slackChannel,
    status: auditor.found ? "ok" : "blocked-missing-auditor-snapshot",
    deterministic: {
      generatedAt: deterministic.generatedAt,
      sesVersion: deterministic.sesVersion,
      totalPages: deterministic.totalPages,
    },
    auditor: {
      generatedAt: auditor.generatedAt,
      notes: auditor.notes,
    },
    summary: compared.summary,
    overlap: compared.overlap,
    majorDisagreements,
    quarterTrend,
    recommendations,
    adjustmentsApplied:
      applyAdjustments && recommendations.routeMultiplierSuggestions.length > 0,
    scoreAdjustmentVersion: scoreAdjustments.version ?? 1,
    deterministicOnly: compared.deterministicOnly,
    auditorOnly: compared.auditorOnly,
  };

  writeLatestReportFiles({
    jsonPath: reportJsonPath,
    markdownPath: reportMdPath,
    report,
    markdown: buildMarkdown(report),
  });

  const posted = await postSlackText({
    webhookUrl: slackWebhook,
    text: buildSlackText(report),
  });
  if (!posted) console.log("No Slack webhook configured; skipping Slack post.");

  writeCalibrationHistory(history, report);

  console.log(
    `Cognitive calibration loop completed with status=${report.status}.`,
  );
}

main().catch((error) => {
  console.error(
    error instanceof Error ? (error.stack ?? error.message) : String(error),
  );
  process.exit(1);
});
