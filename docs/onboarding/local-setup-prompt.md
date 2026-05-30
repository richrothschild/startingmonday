# Claude Setup Prompt — Get localhost:3000 Running

Before running this prompt, make sure you have been added to the Doppler
`startingmonday` project. Ask Rich if you are unsure.

Then open Claude Code in your repo folder and paste the prompt below.

---

```
I need to get the Starting Monday app running locally at localhost:3000. Please work through these steps with me:

1. Check my Node.js version by running `node -v`. If it's below 20.9.0, stop and tell me to upgrade Node before we continue.

2. Run `npm install` to make sure all dependencies are installed.

3. Check whether the Doppler CLI is installed by running `doppler --version`. If the command is not found, tell me to install it from doppler.com/docs/cli and wait for me to confirm before continuing.

4. Run `doppler setup` and prompt me to select project `startingmonday` and config `dev` if it asks.

5. Verify Doppler is connected by running `doppler secrets download --no-file --format env` and confirming that `NEXT_PUBLIC_SUPABASE_URL` and `ANTHROPIC_API_KEY` appear in the output. If they are missing or the command fails, stop and tell me.

6. Start the dev server with `doppler run -- npm run dev` and tell me when it is ready at http://localhost:3000.

7. If there are any errors starting the server, show me the error output and help me fix it.
```

---

Full setup guide and workflow reference: SMK-71 in Jira.
