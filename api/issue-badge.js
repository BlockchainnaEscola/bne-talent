// api/issue-badge.js — Vercel Serverless Function
import { ethers } from "ethers";

const CONTRACT_ADDRESS = "0xCD624688b9aF9E88D0fCaC847873cC50788ffFD3";
const RPC_URL          = "https://forno.celo.org";

const ABI = [
  "function registerBuilderFor(address _builder, string _name, string _location, string _github, string _twitter, string _cohort) external",
  "function issueBadge(address _builder, uint8 _badgeType, string _issuerNote) external",
  "function builders(address) view returns (string name, string location, string githubHandle, string twitterHandle, string cohort, uint256 registeredAt, bool exists)",
  "function hasBadge(address _builder, uint8 _badgeType) view returns (bool)",
];

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { wallet, badgeType, name, location, github, twitter, cohort } = req.body;
  if (!wallet || badgeType === undefined || !name)
    return res.status(400).json({ error: "wallet, badgeType e name são obrigatórios" });

  const ADMIN_PRIVATE_KEY = process.env.ADMIN_PRIVATE_KEY;
  if (!ADMIN_PRIVATE_KEY) return res.status(500).json({ error: "ADMIN_PRIVATE_KEY não configurada" });

  try {
    const provider    = new ethers.JsonRpcProvider(RPC_URL);
    const adminWallet = new ethers.Wallet(ADMIN_PRIVATE_KEY, provider);
    const contract    = new ethers.Contract(CONTRACT_ADDRESS, ABI, adminWallet);

    const builder = await contract.builders(wallet);
    if (!builder.exists) {
      const txReg = await contract.registerBuilderFor(wallet, name, location || "", github || "", twitter || "", cohort || "");
      await txReg.wait();
    }

    const already = await contract.hasBadge(wallet, badgeType);
    if (already) return res.status(400).json({ error: "Badge já emitido para esta wallet" });

    const note    = `BnE Passport · badge ${badgeType} · ${new Date().toISOString().split("T")[0]}`;
    const txBadge = await contract.issueBadge(wallet, badgeType, note);
    await txBadge.wait();

    return res.status(200).json({ ok: true, txHash: txBadge.hash });
  } catch (err) {
    console.error("issue-badge error:", err.message);
    return res.status(500).json({ error: err.message });
  }
}
