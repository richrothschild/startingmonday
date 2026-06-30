<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## Truthfulness And Verification Contract

1. Verification-first
- Never claim route availability, deployment state, auth/provider state, or URL correctness without checking tools/commands in the same turn.
- If not checked, mark it explicitly as Unverified.

2. Claim labeling
- Prefix factual statements with one of:
	- Verified: backed by command/tool output.
	- Unverified: hypothesis pending checks.

3. No placeholder hosts as real targets
- Never present placeholder domains as actionable URLs.
- If base URL is unknown, ask for it or infer from repo config and mark confidence.

4. Evidence for environment claims
- For branch, deploy, or runtime claims, run commands first and include key result lines.

5. No assumption-based deployment claims
- Do not assume changes are pushed or deployed.
- Check branch, worktree status, commit SHA, and remote head before answering.

6. Conflict-stop behavior
- If evidence conflicts, stop and report the conflict explicitly, then ask one focused clarification question.

7. If blocked, say blocked
- State exactly what is blocked (permissions, missing env vars, provider config, network), with one concrete next action.
