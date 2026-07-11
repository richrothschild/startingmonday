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
    `Deterministic stricter: ${report.summary.deterministicStricter}`,
    `Auditor stricter: ${report.summary.auditorStricter}`,
  ].join("\n");
}

async function main() {
  const deterministic = loadDeterministicSnapshot();
  const auditor = loadAuditorSnapshot();
  const compared = compareSnapshots(deterministic, auditor);

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
