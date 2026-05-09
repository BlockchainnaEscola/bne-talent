// api/submit.js — Vercel Serverless Function
// Recebe dados do formulário, faz commit no Talent-Program e registra no contrato BnETalentHub

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { name, bio, location, github, wallet, cohort, skills, tracks, isMiniPay } = req.body;

  if (!wallet || !name) {
    return res.status(400).json({ error: "wallet e name são obrigatórios" });
  }

  const results = { github: null, contract: null };

  // ── 1. COMMIT NO TALENT-PROGRAM (GitHub API) ──────────────────────────────
  try {
    const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
    const GITHUB_OWNER = process.env.GITHUB_OWNER || "BlockchainnaEscola";
    const GITHUB_REPO  = process.env.GITHUB_REPO  || "Talent-Program";

    const filePath = `builders/${wallet.toLowerCase()}.md`;
    const fileContent = `# ${name}

**Wallet:** \`${wallet}\`
**Cohort:** ${cohort || "—"}
**Location:** ${location || "—"}
**GitHub:** ${github || "—"}
**MiniPay:** ${isMiniPay ? "✓" : "—"}

## Bio
${bio || "—"}

## Skills
${skills && skills.length ? skills.map((s) => `- ${s}`).join("\n") : "—"}

## Trilhas Concluídas
${tracks && tracks.length ? tracks.map((t) => `- ${t}`).join("\n") : "—"}

---
*Registered via BnE Talent Hub · ${new Date().toISOString().split("T")[0]}*
`;

    const contentB64 = Buffer.from(fileContent).toString("base64");

    // Check if file already exists (to get sha for update)
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

  // ── 2. REGISTRAR NO CONTRATO BnETalentHub (Celo Mainnet) ─────────────────
  // O registerBuilder é público (qualquer um pode chamar) mas precisa de gas.
  // A Function usa uma wallet admin para pagar o gas server-side.
  try {
    const ADMIN_PRIVATE_KEY = process.env.ADMIN_PRIVATE_KEY;
    const RPC_URL = "https://forno.celo.org";
    const CONTRACT_ADDRESS = "0x5fFa930E5a068Ae68c9e3f0fB80dEB8eb88B058D";

    // ABI mínimo para registerBuilder
    const ABI_REGISTER = [
      {
        name: "registerBuilder",
        type: "function",
        stateMutability: "nonpayable",
        inputs: [
          { name: "name",     type: "string" },
          { name: "location", type: "string" },
          { name: "github",   type: "string" },
          { name: "cohort",   type: "string" }
        ],
        outputs: []
      }
    ];

    // Encode function call manually (sem ethers no edge)
    // Usamos fetch direto para o RPC com eth_call/eth_sendRawTransaction
    // Para simplicidade, usamos a API do Celo via ethers via dynamic import
    const { ethers } = await import("ethers");

    const provider = new ethers.JsonRpcProvider(RPC_URL);
    const adminWallet = new ethers.Wallet(ADMIN_PRIVATE_KEY, provider);
    const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI_REGISTER, adminWallet);

    const tx = await contract.registerBuilder(
      name,
      location || "",
      github || "",
      cohort || ""
    );
    await tx.wait();
    results.contract = { txHash: tx.hash };
  } catch (err) {
    console.error("Contract error:", err);
    results.contract = { error: err.message };
    // Não falha o submit por causa do contrato — o commit GitHub já foi feito
  }

  return res.status(200).json({ ok: true, results });
}
