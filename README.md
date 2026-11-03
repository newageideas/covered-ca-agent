# covered-ca-agent — demo site for a Covered California Certified Insurance Agent (Atwater / Livingston)
Static `index.html` + Vercel functions `api/lead.js`, `api/missed-call.js`. Edit the CONFIG block at the top of the `<script>` in index.html.
Env vars (optional, Vercel → Settings → Environment Variables): `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_FROM` (+1…), `BOOKING_LINK`, `MISSED_CALL_TEXTBACK=on`.
Without them everything runs in demo mode (no texts sent). Not affiliated with Covered California. Translations need native review.
