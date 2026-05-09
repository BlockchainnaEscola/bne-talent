// api/submit.js — Vercel Serverless Function
// GitHub commit + registerBuilder + issueBadge (Celo Mainnet)

import { ethers } from "ethers";

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
  const ADMIN_PRIVATE_KEY = process.env.ADMIN_PRIVATE_KEY;
  const CONTRACT_ADDRESS  = "0x5fFa930E5a068Ae68c9e3f0fB80dEB8eb88B058D";
  const RPC_URL           = "https://forno.celo.org";

  const results = { github: null, register: null, badge: null };

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

  // ── 2. CONTRATO — registerBuilder + issueBadge ───────────────────────────
  try {
    if (!ADMIN_PRIVATE_KEY) throw new Error("ADMIN_PRIVATE_KEY not set");

    const ABI = [
      "function registerBuilder(string calldata name, string calldata location, string calldata github, string calldata cohort) external",
      "function issueBadge(address builder, uint8 badgeType, string calldata note) external",
      "function hasBadge(address builder, uint8 badgeType) view returns (bool)"
    ];

    const provider = new ethers.JsonRpcProvider(RPC_URL);
    const adminWallet = new ethers.Wallet(ADMIN_PRIVATE_KEY, provider);
    const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, adminWallet);

    // registerBuilder — qualquer um pode chamar, admin paga o gas
    const txReg = await contract.registerBuilder(
      name,
      location || "",
      github || "",
      cohort || ""
    );
    await txReg.wait();
    results.register = { ok: true, txHash: txReg.hash };

    // issueBadge — badge tipo 0 = Web3 101
    const note = `BnE Talent Hub · ${cohort || "Web3 101"} · ${new Date().toISOString().split("T")[0]}`;
    const txBadge = await contract.issueBadge(wallet, 0, note);
    await txBadge.wait();
    results.badge = { ok: true, txHash: txBadge.hash };

  } catch (err) {
    console.error("Contract error:", err.message);
    results.badge = { error: err.message };
  }

  return res.status(200).json({ ok: true, results });
}
