require("dotenv").config();
const express = require("express");
const cors = require("cors");
const Imap = require("imap");
const { simpleParser } = require("mailparser");
const nodemailer = require("nodemailer");
const { google } = require('googleapis');

const app = express();
app.use(cors());
app.use(express.json());

const GMAIL_USER =
  process.env.GMAIL_USER ||
  process.env.EXPO_PUBLIC_GMAIL_ADDRESS ||
  process.env.EXPO_PUBLIC_GMAIL ||
  null;

const GMAIL_PASS =
  process.env.GMAIL_APP_PASSWORD ||
  process.env.EXPO_PUBLIC_GMAIL_APP_PASSWORD ||
  process.env.EXPO_PUBLIC_GMAIL_PASSWORD ||
  null;

const BACKEND_GMAIL_CONFIGURED = !!(GMAIL_USER && GMAIL_PASS);

// ── Nodemailer transporter for SENDING ──────────────────────
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: { user: GMAIL_USER, pass: GMAIL_PASS },
});

// ── Health check ─────────────────────────────────────────────
app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    gmail: GMAIL_USER || null,
    gmailConfigured: BACKEND_GMAIL_CONFIGURED,
  });
});

// ── SEND email ───────────────────────────────────────────────
app.post('/send', async (req, res) => {
  const { to, subject, body } = req.body;
  const authHeader = req.headers['authorization'];
  const userToken = authHeader?.replace('Bearer ', '');

  try {
    if (userToken) {
      // Use user's own Gmail OAuth token
      const auth = new google.auth.OAuth2();
      auth.setCredentials({ access_token: userToken });
      const gmail = google.gmail({ version: 'v1', auth });
      const message = [`From: me`, `To: ${to}`, `Subject: ${subject}`, `MIME-Version: 1.0`, `Content-Type: text/plain; charset=utf-8`, ``, body].join('\r\n');
      const encoded = Buffer.from(message).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
      await gmail.users.messages.send({ userId: 'me', requestBody: { raw: encoded } });
    } else {
      // Fallback: use app's own Gmail (nodemailer)
      if (!BACKEND_GMAIL_CONFIGURED) {
        return res.status(503).json({
          error: 'Backend Gmail is not configured. Sign in with Google or set GMAIL_USER and GMAIL_APP_PASSWORD on the server.',
        });
      }
      await transporter.sendMail({ from: `JobPilot <${GMAIL_USER}>`, to, subject, text: body || '' });
    }
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});


// ── READ inbox (IMAP) ────────────────────────────────────────
app.get("/inbox", async (req, res) => {
  const limit = parseInt(req.query.limit) || 20;

  const imap = new Imap({
    user: GMAIL_USER,
    password: GMAIL_PASS,
    host: "imap.gmail.com",
    port: 993,
    tls: true,
    tlsOptions: { rejectUnauthorized: false },
  });

  const emails = [];
  const parsePromises = [];

  imap.once("ready", () => {
    imap.openBox("INBOX", true, (err, box) => {
      if (err) {
        imap.end();
        return res.status(500).json({ error: err.message });
      }

      const total = box.messages.total;
      if (total === 0) {
        imap.end();
        return res.json({ emails: [] });
      }

      const start = Math.max(1, total - limit + 1);
      const fetch = imap.seq.fetch(`${start}:${total}`, {
        bodies: "",
        struct: true,
        envelope: true,
      });

      fetch.on("message", (msg) => {
        let buffer = "";
        msg.on("body", (stream) => {
          stream.on("data", (chunk) => {
            buffer += chunk.toString("utf8");
          });
          stream.once("end", async () => {
            try {
              const p = simpleParser(buffer)
                .then((parsed) => {
                  emails.push({
                    id: parsed.messageId || Date.now().toString(),
                    from: parsed.from?.text || "",
                    fromName:
                      parsed.from?.value?.[0]?.name || parsed.from?.text || "",
                    subject: parsed.subject || "(no subject)",
                    preview: (parsed.text || "")
                      .slice(0, 120)
                      .replace(/\n/g, " "),
                    body: parsed.text || parsed.html || "",
                    time: parsed.date
                      ? new Date(parsed.date).toLocaleDateString("en-IN", {
                          month: "short",
                          day: "numeric",
                        })
                      : "",
                    date: parsed.date || new Date(),
                    unread: true,
                  });
                })
                .catch((e) => console.error("Parse error:", e));

              parsePromises.push(p);
            } catch (e) {
              console.error("Error parsing email:", e);
            }
          });
        });
      });

      fetch.once("error", (err) => {
        console.error("Fetch error:", err);
      });

      fetch.once("end", async () => {
        await Promise.all(parsePromises); 

        imap.end();
        emails.sort((a, b) => new Date(b.date) - new Date(a.date));
        res.json({ emails });
      });
    });
  });

  imap.once("error", (err) => {
    console.error("IMAP error:", err.message);
    res.status(500).json({ error: err.message });
  });

  imap.connect();
});

// ── SEARCH job-related emails ────────────────────────────────
app.get("/inbox/jobs", async (req, res) => {
  const JOB_KEYWORDS = [
    "application",
    "interview",
    "offer",
    "hiring",
    "recruiter",
    "position",
    "role",
    "job",
    "career",
    "opportunity",
    "resume",
    "shortlisted",
    "assessment",
    "onboarding",
    "hr round",
  ];

  const authHeader = req.headers["authorization"];
  const userToken = authHeader?.replace("Bearer ", "");

  if (userToken) {
    // Use Gmail API with user's token
    try {
      const auth = new google.auth.OAuth2();
      auth.setCredentials({ access_token: userToken });
      const gmail = google.gmail({ version: "v1", auth });
      const listRes = await gmail.users.messages.list({
        userId: "me",
        maxResults: 50,
        q: "subject:(job OR interview OR offer OR application OR hiring OR recruiter)",
      });

      const messages = listRes.data.messages || [];
      const emails = await Promise.all(
        messages.map(async (m) => {
          const msg = await gmail.users.messages.get({
            userId: "me",
            id: m.id,
            format: "full",
          });

          const headers = msg.data.payload.headers || [];
          const getHeader = (name) =>
            headers.find((h) => h.name === name)?.value || "";

          const subjectLower = (getHeader("Subject") || "").toLowerCase();
          const bodyLower = (msg.data.snippet || "").toLowerCase();
          const isJobRelated = JOB_KEYWORDS.some(
            (kw) => subjectLower.includes(kw) || bodyLower.includes(kw)
          );

          if (!isJobRelated) return null;

          return {
            id: m.id,
            from: getHeader("From"),
            fromName: getHeader("From").replace(/<.*>/, "").trim(),
            subject: getHeader("Subject"),
            preview: msg.data.snippet || "",
            body: msg.data.snippet || "",
            time: new Date(getHeader("Date")).toLocaleDateString("en-IN", {
              month: "short",
              day: "numeric",
            }),
            date: getHeader("Date"),
            unread: msg.data.labelIds?.includes("UNREAD"),
          };
        })
      );

      return res.json({ emails: emails.filter(Boolean) });
    } catch (e) {
      console.error("Gmail API error:", e);
      // fallback to IMAP if Gmail API fails
    }
  }

  // fallback to IMAP if no token or Gmail API fails
  if (!BACKEND_GMAIL_CONFIGURED) {
    return res.status(503).json({
      error: 'Backend Gmail is not configured. Sign in with Google or set GMAIL_USER and GMAIL_APP_PASSWORD on the server.',
    });
  }

  const imap = new Imap({
    user: GMAIL_USER,
    password: GMAIL_PASS,
    host: "imap.gmail.com",
    port: 993,
    tls: true,
    tlsOptions: { rejectUnauthorized: false },
  });

  const emails = [];

  imap.once("ready", () => {
    imap.openBox("INBOX", true, (err) => {
      if (err) {
        imap.end();
        return res.status(500).json({ error: err.message });
      }

      const since = new Date();
      since.setDate(since.getDate() - 90);

      imap.search(["ALL", ["SINCE", since]], (err, results) => {
        if (err || !results || results.length === 0) {
          imap.end();
          return res.json({ emails: [] });
        }

        const uids = results.slice(-50);
        const fetch = imap.fetch(uids, { bodies: "", envelope: true });

        fetch.on("message", (msg) => {
          let buffer = "";
          msg.on("body", (stream) => {
            stream.on("data", (chunk) => (buffer += chunk.toString("utf8")));
            stream.once("end", async () => {
              try {
                const parsed = await simpleParser(buffer);
                const subjectLower = (parsed.subject || "").toLowerCase();
                const bodyLower = (parsed.text || "").toLowerCase();
                const isJobRelated = JOB_KEYWORDS.some(
                  (kw) => subjectLower.includes(kw) || bodyLower.includes(kw)
                );
                if (isJobRelated) {
                  emails.push({
                    id: parsed.messageId || Date.now().toString(),
                    from: parsed.from?.text || "",
                    fromName:
                      parsed.from?.value?.[0]?.name || parsed.from?.text || "",
                    subject: parsed.subject || "(no subject)",
                    preview: (parsed.text || "")
                      .slice(0, 120)
                      .replace(/\n/g, " "),
                    body: parsed.text || "",
                    time: parsed.date
                      ? new Date(parsed.date).toLocaleDateString("en-IN", {
                          month: "short",
                          day: "numeric",
                        })
                      : "",
                    date: parsed.date || new Date(),
                    unread: true,
                  });
                }
              } catch {}
            });
          });
        });

        fetch.once("end", () => {
          imap.end();
          emails.sort((a, b) => new Date(b.date) - new Date(a.date));
          res.json({ emails });
        });

        fetch.once("error", (e) => {
          console.error(e);
          imap.end();
          res.json({ emails: [] });
        });
      });
    });
  });

  imap.once("error", (err) => res.status(500).json({ error: err.message }));
  imap.connect();
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () =>
  console.log(`JobPilot backend running on http://localhost:${PORT}`),
);
