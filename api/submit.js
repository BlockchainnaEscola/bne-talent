// api/submit.js — Vercel Serverless Function
// GitHub commit apenas — onchain fica no fluxo de badge separado

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { name, bio, location, github, wallet, cohort, skills, tracks, isMiniPay, email } = req.body;

  if (!wallet || !name) {
    return res.status(400).json({ error: "wallet e name são obrigatórios" });
  }

  const GITHUB_TOKEN      = process.env.GITHUB_TOKEN;
  const GITHUB_OWNER      = process.env.GITHUB_OWNER || "BlockchainnaEscola";
  const GITHUB_REPO       = process.env.GITHUB_REPO  || "Talent-Program";

  const results = { github: null };

  // ── 1. COMMIT NO TALENT-PROGRAM ──────────────────────────────────────────
  try {
    const filePath = `builders/${wallet.toLowerCase()}.md`;
    const fileContent = [
      `# ${name}`,
      ``,
      `**Wallet:** \`${wallet}\``,
      `**Programa:** ${cohort || "—"}`,
      `**Location:** ${location || "—"}`,
      `**GitHub:** ${github || "—"}`,
      `**Email:** ${email || "—"}`,
      `**MiniPay:** ${isMiniPay ? "✓" : "—"}`,
      ``,
      `## Bio`,
      bio || "—",
      ``,
      `## Skills`,
      skills && skills.length ? skills.map((s) => `- ${s}`).join("\n") : "—",
      ``,
      `## Trilhas Concluídas`,
      tracks && tracks.length ? tracks.map((t) => `- ${t}`).join("\n") : "—",
      ``,
      `---`,
      `*Registered via BnE Talent Hub · ${new Date().toISOString().split("T")[0]}*`,
    ].join("\n");

    const contentB64 = Buffer.from(fileContent).toString("base64");

    let sha = undefined;
    const checkRes = await fetch(
      `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${filePath}`,
      { headers: { Authorization: `token ${GITHUB_TOKEN}`, Accept: "application/vnd.github.v3+json" } }
    );
    if (checkRes.ok) {
      const existing = await checkRes.json();
      sha = existing.sha;
    }

    const commitRes = await fetch(
      `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${filePath}`,
      {
        method: "PUT",
        headers: {
          Authorization: `token ${GITHUB_TOKEN}`,
          Accept: "application/vnd.github.v3+json",
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          message: `feat: add builder ${name} (${wallet.slice(0, 8)})`,
          content: contentB64,
          ...(sha ? { sha } : {})
        })
      }
    );

    if (!commitRes.ok) {
      const err = await commitRes.json();
      throw new Error(err.message || "GitHub API error");
    }
    results.github = "ok";
  } catch (err) {
    console.error("GitHub commit error:", err);
    results.github = { error: err.message };
  }

  return res.status(200).json({ ok: true, results });
}
