# Local Setup Prompt (Claude Code)

Before running this prompt, confirm you have access to the Doppler project and config:

- Project: startingmonday
- Config: dev

Paste this into Claude Code from the repository root:

I need to get the Starting Monday app running locally at localhost:3000. Please work through these steps with me:
1. Check my Node.js version by running `node -v`. If it is below 20.9.0, stop and tell me to upgrade Node before continuing.
2. Run `npm install` to make sure dependencies are installed.
3. Check whether Doppler CLI is installed with `doppler --version`. If not found, tell me to install Doppler CLI from doppler.com/docs/cli and wait for confirmation.
4. Run `doppler setup` and select project `startingmonday` and config `dev`.
5. Verify Doppler connectivity using `doppler secrets download --no-file --format env` and confirm `NEXT_PUBLIC_SUPABASE_URL` and `ANTHROPIC_API_KEY` are present. If missing, stop and report.
6. Start the app with `doppler run -- npm run dev` and report when http://localhost:3000 is ready.
7. If errors occur, show the exact error output and help fix it.
