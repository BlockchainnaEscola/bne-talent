// Blockchain na Escola — Talent Hub v0.6
// Landing → Cadastro → Perfil
// Integrações: MiniPay/MetaMask, GitHub API (listagem real), Vercel Function /api/submit

const { useState, useEffect, useRef } = React;

const GITHUB_OWNER = "BlockchainnaEscola";
const GITHUB_REPO  = "Talent-Program";
const GITHUB_API   = `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/builders`;

// ─── DATA ────────────────────────────────────────────────────────────────────

const COHORTS = [
  "W3T — Belo Horizonte 2025",
  "BnE @ UNIFACS — Salvador",
  "Mulheres que Codam — Rio de Janeiro",
  "EduLatam — São Paulo"
];

const SKILLS = [
  // DEV
  { id: "solidity",     label: "Solidity",           tag: "DEV"       },
  { id: "typescript",   label: "TypeScript",          tag: "DEV"       },
  { id: "react",        label: "React",               tag: "DEV"       },
  { id: "python",       label: "Python",              tag: "DEV"       },
  { id: "rust",         label: "Rust",                tag: "DEV"       },
  { id: "viem",         label: "viem",                tag: "DEV"       },
  { id: "wagmi",        label: "wagmi",               tag: "DEV"       },
  { id: "foundry",      label: "Foundry",             tag: "DEV"       },
  // WEB3
  { id: "defi",         label: "DeFi",                tag: "WEB3"      },
  { id: "nfts",         label: "NFTs",                tag: "WEB3"      },
  { id: "dao",          label: "DAOs",                tag: "WEB3"      },
  { id: "minipay",      label: "MiniPay",             tag: "WEB3"      },
  { id: "onchain-data", label: "On-chain Data",       tag: "WEB3"      },
  { id: "tokeneng",     label: "Token Engineering",   tag: "WEB3"      },
  // DESIGN
  { id: "figma",        label: "Figma",               tag: "DESIGN"    },
  { id: "uiux",         label: "UI/UX Design",        tag: "DESIGN"    },
  { id: "motion",       label: "Motion & Vídeo",      tag: "DESIGN"    },
  { id: "ilustracao",   label: "Ilustração",          tag: "DESIGN"    },
  { id: "socialmedia",  label: "Social Media",        tag: "DESIGN"    },
  // COMUNIDADE
  { id: "community",    label: "Community Manager",   tag: "COMUNIDADE"},
  { id: "educacao",     label: "Educação",            tag: "COMUNIDADE"},
  { id: "conteudo",     label: "Escrita & Conteúdo",  tag: "COMUNIDADE"},
  { id: "gestao",       label: "Gestão de Projetos",  tag: "COMUNIDADE"},
  { id: "politica",     label: "Política Digital",    tag: "COMUNIDADE"},
  // NEGÓCIOS
  { id: "marketing",    label: "Marketing Web3",      tag: "NEGÓCIOS"  },
  { id: "vendas",       label: "Vendas",              tag: "NEGÓCIOS"  },
  { id: "financeiro",   label: "Financeiro",          tag: "NEGÓCIOS"  },
  { id: "juridico",     label: "Jurídico & Compliance",tag: "NEGÓCIOS" },
];

const TRACKS = [
  "Token Engineering",
  "Smart Contracts 101",
  "DApp Frontend",
  "NFT & Arte Digital",
  "DAO & Governança",
  "On-chain Identity"
];

const PARTNERS = [
  { id: "celo",    name: "Celo Foundation",  role: "Sponsor",   color: "var(--c-yellow)"  },
  { id: "ava",     name: "Team1 Avalanche",  role: "Sponsor",   color: "var(--c-magenta)" },
  { id: "ocb",     name: "Off-Chain Brazil", role: "Validator", color: "var(--c-cyan)"    },
  { id: "modular", name: "Modular Crypto",   role: "Validator", color: "var(--c-orange)"  },
  { id: "rastas",  name: "Crypto Rastas",    role: "Community", color: "var(--c-yellow)"  },
  { id: "lcc",     name: "Let's Co Create",  role: "Community", color: "var(--c-magenta)" },
  { id: "zec",     name: "Zcash Brazil",     role: "Validator", color: "var(--c-cyan)"    }
];

const MOCK_BUILDERS = [
  { name: "Pedro Augusto",  cohort: "Seabra · BA · #4",     skills: ["solidity","viem"],       tone: "orange"  },
  { name: "Maria Eduarda",  cohort: "Salvador · BA · #7",   skills: ["typescript","react"],    tone: "cyan",   featured: true },
  { name: "Kauã Alves",     cohort: "BH · MG · #10",        skills: ["rust","defi"],           tone: "magenta" },
  { name: "Yasmin Mello",   cohort: "Recife · PE · #11",    skills: ["figma","nfts"],          tone: "yellow"  },
  { name: "Izabelly Lopes", cohort: "São Paulo · SP · #12", skills: ["solidity","dao"],        tone: "orange"  },
  { name: "Lucas Gustavo",  cohort: "BH · MG · #15",        skills: ["python","onchain-data"], tone: "cyan"    }
];

// ─── HELPERS ─────────────────────────────────────────────────────────────────

function parseMd(md, wallet) {
  const get = (label) => {
    const m = md.match(new RegExp(`\\*\\*${label}:\\*\\*\\s*(.+)`));
    return m ? m[1].replace(/`/g, "").trim() : "";
  };
  const section = (label) => {
    const m = md.match(new RegExp(`## ${label}\\n([\\s\\S]*?)(?=\\n##|\\n---|\$)`));
    if (!m) return [];
    return m[1].trim().split("\n").map(l => l.replace(/^- /, "").trim()).filter(Boolean);
  };
  const nameMatch = md.match(/^# (.+)/m);
  return {
    name:     nameMatch ? nameMatch[1].trim() : wallet,
    wallet:   get("Wallet") || wallet,
    cohort:   get("Programa"),
    location: get("Location"),
    github:   get("GitHub"),
    email:    get("Email") !== "—" ? get("Email") : "",
    isMiniPay: get("MiniPay") === "✓",
    bio:      (() => { const m = md.match(/## Bio\n([\s\S]*?)(?=\n##|\n---|\$)/); return m ? m[1].trim() : ""; })(),
    skills:   section("Skills").map(l => SKILLS.find(s => s.label === l)?.id).filter(Boolean),
    tracks:   section("Trilhas Concluídas"),
    badges:   [],
    validations: []
  };
}

// ─── PRIMITIVES ──────────────────────────────────────────────────────────────

function useReveal() {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver((es) => {
      es.forEach((e) => { if (e.isIntersecting) { el.classList.add("in"); io.unobserve(el); } });
    }, { threshold: 0.12, rootMargin: "0px 0px -8% 0px" });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return ref;
}

function Reveal({ as: Tag = "div", className = "", variant = "reveal", children, ...rest }) {
  const ref = useReveal();
  return <Tag ref={ref} className={`${variant} ${className}`} {...rest}>{children}</Tag>;
}

function MeshBg({ opacity = 0.18 }) {
  return (
    <svg className="mesh-bg" aria-hidden style={{ opacity }} preserveAspectRatio="none">
      <defs>
        <pattern id="mesh" x="0" y="0" width="32" height="32" patternUnits="userSpaceOnUse">
          <path d="M0 16 L32 16 M16 0 L16 32" stroke="currentColor" strokeWidth="1" />
          <path d="M0 0 L32 32 M32 0 L0 32" stroke="currentColor" strokeWidth="0.4" opacity="0.5" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#mesh)" />
    </svg>
  );
}

function Scanlines() { return <div className="scanlines" aria-hidden></div>; }

function CornerTicks({ color = "currentColor" }) {
  return (
    <>
      <span className="cnr cnr-tl" style={{ borderColor: color }}></span>
      <span className="cnr cnr-tr" style={{ borderColor: color }}></span>
      <span className="cnr cnr-bl" style={{ borderColor: color }}></span>
      <span className="cnr cnr-br" style={{ borderColor: color }}></span>
    </>
  );
}

function Stamp({ children, color = "var(--c-orange)", rotate = -6 }) {
  return (
    <span className="stamp" style={{ color, borderColor: color, transform: `rotate(${rotate}deg)` }}>
      {children}
    </span>
  );
}

function Marquee({ items, speed = 60, color = "var(--c-fg)" }) {
  const content = items.join("  ◆  ");
  return (
    <div className="mq" style={{ color, backgroundColor: "rgb(137, 75, 223)" }}>
      <div className="mq-track" style={{ animationDuration: `${speed}s` }}>
        <span>{content}</span>
        <span aria-hidden>{content}</span>
        <span aria-hidden>{content}</span>
      </div>
    </div>
  );
}

function ArrowGlyph() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.5">
      <path d="M4 12h16M14 6l6 6-6 6" />
    </svg>
  );
}

function CollageSlot({ label, tone = "warm", img }) {
  return (
    <div className={`collage tone-${tone}`}>
      <div className="collage-bg">
        <div className="cg-stripe cg-s1"></div>
        <div className="cg-stripe cg-s2"></div>
        <div className="cg-stripe cg-s3"></div>
        <div className="cg-stripe cg-s4"></div>
        <div className="cg-stripe cg-s5"></div>
      </div>
      {img && <div className="collage-photo" style={{ backgroundImage: `url('${img}')` }}></div>}
      <div className="collage-silhouette" aria-hidden>
        <svg viewBox="0 0 200 280" preserveAspectRatio="xMidYMax meet">
          <defs>
            <pattern id="dots" x="0" y="0" width="6" height="6" patternUnits="userSpaceOnUse">
              <circle cx="3" cy="3" r="1.2" fill="#fff" opacity="0.8" />
            </pattern>
          </defs>
          <path d="M100 20 C 60 20, 50 70, 60 100 L 60 130 C 30 140, 10 180, 10 280 L 190 280 C 190 180, 170 140, 140 130 L 140 100 C 150 70, 140 20, 100 20 Z" fill="#0a0606" />
          <rect x="48" y="78" width="104" height="22" rx="3" fill="var(--c-cyan)" opacity="0.92" />
          <rect x="50" y="80" width="44" height="18" rx="2" fill="#0a0606" />
          <rect x="106" y="80" width="44" height="18" rx="2" fill="#0a0606" />
          <ellipse cx="100" cy="55" rx="40" ry="38" fill="url(#dots)" opacity="0.35" />
          <path d="M75 145 Q100 165 125 145" stroke="var(--c-yellow)" strokeWidth="3" fill="none" />
          <circle cx="100" cy="160" r="5" fill="var(--c-yellow)" />
        </svg>
      </div>
      <div className="collage-mesh" aria-hidden><MeshBg opacity={0.5} /></div>
      <div className="collage-tag"><span>◤ {label}</span></div>
      <CornerTicks color="var(--c-fg)" />
    </div>
  );
}

// ─── HUD BAR ─────────────────────────────────────────────────────────────────

function WalletMenu({ shortAddr, hasProfile, onMyProfile, onDisconnect }) {
  const [open, setOpen] = React.useState(false);
  return (
    <div style={{ position: "relative" }}>
      <button onClick={() => setOpen(o => !o)} style={{
        background: "var(--c-bg-2)", border: "1px solid var(--c-cyan)", borderRadius: 3,
        padding: "6px 14px", color: "var(--c-cyan)", fontFamily: "JetBrains Mono",
        fontSize: 12, cursor: "pointer", letterSpacing: "0.05em", display: "flex", alignItems: "center", gap: 6
      }}>
        ⬡ {shortAddr} {open ? "▲" : "▼"}
      </button>
      {open && (
        <div style={{
          position: "absolute", right: 0, top: "calc(100% + 6px)", background: "var(--c-bg-2)",
          border: "1px solid var(--c-cyan)", borderRadius: 3, minWidth: 160, zIndex: 9999,
          display: "flex", flexDirection: "column", overflow: "hidden"
        }}>
          {hasProfile && (
            <button onClick={() => { setOpen(false); onMyProfile(); }} style={{
              background: "none", border: "none", borderBottom: "1px solid var(--c-bg-3)",
              padding: "10px 16px", color: "var(--c-cyan)", fontFamily: "JetBrains Mono",
              fontSize: 12, cursor: "pointer", textAlign: "left"
            }}>
              → MEU PERFIL
            </button>
          )}
          <button onClick={() => { setOpen(false); onDisconnect(); }} style={{
            background: "none", border: "none", padding: "10px 16px",
            color: "var(--c-blood)", fontFamily: "JetBrains Mono",
            fontSize: 12, cursor: "pointer", textAlign: "left"
          }}>
            ✕ DESCONECTAR
          </button>
        </div>
      )}
    </div>
  );
}

function HUDBar({ screen, walletAddress, hasProfile, onMyProfile, onConnect, onDisconnect }) {
  const [t, setT] = useState(new Date());
  useEffect(() => { const i = setInterval(() => setT(new Date()), 1000); return () => clearInterval(i); }, []);
  const time = t.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
  const shortAddr = walletAddress ? walletAddress.slice(0, 6) + "…" + walletAddress.slice(-4) : null;
  return (
    <div className="hud">
      <div className="hud-l">
        <img src="assets/logo.png" alt="BnE" className="hud-logo" style={{ height: "100px", width: "100px" }} />
        <b>BLOCKCHAIN NA ESCOLA</b>
        <span className="hud-sep">/</span>
        <span className="hud-chip">TALENT&nbsp;PROGRAM</span>
        <span className="hud-sep">/</span>
        <span style={{ color: "var(--c-cyan)" }}>{screen.toUpperCase()}</span>
      </div>
      <div className="hud-c">
        <span>5 anos · 6 estados · 27 cidades · 34k+ estudantes</span>
      </div>
      <div className="hud-r" style={{ gap: 12 }}>
        <span>NET: CELO</span>
        <span className="hud-sep">·</span>
        {shortAddr ? (
          <WalletMenu shortAddr={shortAddr} hasProfile={hasProfile} onMyProfile={onMyProfile} onDisconnect={onDisconnect} />
        ) : (
          <button onClick={onConnect} style={{
            background: "var(--c-orange)", border: "none", borderRadius: 3,
            padding: "6px 16px", color: "#000", fontFamily: "JetBrains Mono",
            fontSize: 12, fontWeight: 700, cursor: "pointer", letterSpacing: "0.05em"
          }}>
            ⬡ CONECTAR CARTEIRA
          </button>
        )}
        <span className="hud-sep">·</span>
        <span>{time}</span>
      </div>
    </div>
  );
}

// ─── MODAL INVITE ─────────────────────────────────────────────────────────────

function InviteModal({ profile, onClose }) {
  const subject = encodeURIComponent(`Convite para projeto Web3 — via BnE Talent Hub`);
  const body = encodeURIComponent(`Olá ${profile.name},\n\nVi seu perfil no BnE Talent Hub e gostaria de conversar sobre uma oportunidade.\n\nWallet: ${profile.wallet}\nPrograma: ${profile.cohort}\n\n—`);
  const mailto = `mailto:${profile.email}?subject=${subject}&body=${body}`;
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.85)", zIndex: 9000, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ background: "var(--c-bg-2)", border: "1px solid var(--c-orange)", padding: 32, borderRadius: 4, maxWidth: 420, width: "90%", position: "relative" }}>
        <CornerTicks color="var(--c-orange)" />
        <h3 style={{ fontFamily: "Bebas Neue", fontSize: 28, color: "var(--c-orange)", marginBottom: 12 }}>CONVIDAR PARA PROJETO</h3>
        <p style={{ fontSize: 14, color: "var(--c-muted)", marginBottom: 20 }}>
          Vai abrir seu cliente de email com uma mensagem pré-preenchida para <b style={{ color: "var(--c-fg)" }}>{profile.name}</b>.
        </p>
        <div style={{ display: "flex", gap: 12 }}>
          <a href={mailto} className="btn btn-primary" style={{ textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 8 }}>Abrir email <ArrowGlyph /></a>
          <button className="btn btn-ghost" onClick={onClose}>Cancelar</button>
        </div>
      </div>
    </div>
  );
}

// ─── TELA DE SUCESSO ──────────────────────────────────────────────────────────

function SuccessScreen({ data, results, onViewProfile }) {
  const githubUrl = `https://github.com/${GITHUB_OWNER}/${GITHUB_REPO}/blob/main/builders/${data.wallet.toLowerCase()}.md`;
  return (
    <div className="screen landing" style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "calc(100vh - 36px)" }}>
      <Scanlines />
      <div style={{ maxWidth: 560, width: "90%", padding: 48, background: "var(--c-bg-2)", border: "1px solid var(--c-cyan)", borderRadius: 4, position: "relative", textAlign: "center" }}>
        <CornerTicks color="var(--c-cyan)" />
        <div style={{ fontFamily: "Bebas Neue", fontSize: 64, color: "var(--c-cyan)", lineHeight: 1 }}>✓</div>
        <h2 style={{ fontFamily: "Bebas Neue", fontSize: 40, letterSpacing: "0.04em", margin: "16px 0 8px" }}>PERFIL PUBLICADO!</h2>
        <p style={{ color: "var(--c-muted)", marginBottom: 32 }}>Seu perfil está no ar. Em breve você poderá emitir seu badge onchain.</p>

        <div style={{ textAlign: "left", display: "flex", flexDirection: "column", gap: 12, marginBottom: 32 }}>
          <div style={{ background: "var(--c-bg-3)", border: "1px solid var(--c-bg-3)", borderRadius: 3, padding: "12px 16px" }}>
            <div className="mono" style={{ fontSize: 10, color: "var(--c-muted)", marginBottom: 4 }}>✓ PERFIL SALVO · BLOCKCHAIN NA ESCOLA</div>
            <a href={githubUrl} target="_blank" rel="noreferrer" className="mono" style={{ fontSize: 12, color: "var(--c-cyan)", wordBreak: "break-all" }}>
              builders/{data.wallet.toLowerCase()}.md ↗
            </a>
          </div>
        </div>

        <button className="btn btn-primary" onClick={onViewProfile} style={{ width: "100%" }}>
          Ver meu perfil <ArrowGlyph />
        </button>
      </div>
    </div>
  );
}

// ─── SCREEN: LANDING ─────────────────────────────────────────────────────────

function Landing({ onRegister, onViewBuilders }) {
  return (
    <div className="screen landing">
      <Scanlines />
      <section className="hero">
        <div className="hero-bg" aria-hidden></div>
        <div className="hero-grid">
          <div className="hero-title-col">
            <div className="eyebrow" style={{ width: "800px" }}>
              <img src="assets/logo.png" alt="" className="eyebrow-logo" style={{ objectFit: "cover" }} />
              <span style={{ fontSize: "40px" }}>Talent Program · Chapter <b></b></span>
              <span className="eyebrow-sep">·</span>
              <span className="mono small">EST. 2020 · 5 ANOS</span>
            </div>
            <h1 className="display">
              <span className="d-line d-orange" style={{ color: "rgb(56, 30, 129)" }}>BLOCKCHAIN</span>
              <span className="d-line d-outline"><span style={{ color: "rgb(154, 87, 223)" }}>NA ESCOLA</span></span>
              <span className="d-line d-cyan tilt"><span className="d-amp"> /</span></span>
            </h1>
            <p className="lede">
              Conectando a próxima geração da América Latina ao Web3. Identificamos talento em escolas
              públicas e periferias do Brasil, registramos suas skills on-chain e parceiros validam.
              Sem diploma caro, sem rolê privilegiado — carteira vira CV.
            </p>
            <div className="cta-row">
              <button className="btn btn-primary" onClick={onRegister}><span>Cadastrar perfil</span><ArrowGlyph /></button>
              <button className="btn btn-ghost" onClick={onViewBuilders}>Ver perfis →</button>
            </div>
            <div className="cta-meta"><span>↳ MiniPay · WalletConnect · Celo · Scroll · Avalanche</span></div>
          </div>
          <div className="hero-portrait reveal-r" ref={useReveal()}>
            <CollageSlot label="COHORT · SEABRA · CHAPADA DIAMANTINA · BA" tone="warm" img="assets/art-01.png" />
            <div className="portrait-tag p-tag-1"><span className="t-num">1.2k+</span><span className="t-lbl">cadastros<br />2025</span></div>
            <div className="portrait-tag p-tag-2" style={{ backgroundColor: "rgb(162, 219, 188)" }}><span className="t-num">800</span><span className="t-lbl">presentes<br />fev/25</span></div>
            <div className="portrait-tag p-tag-3"><Stamp color="var(--c-cyan)" rotate={-8}>VERIFICADO ON-CHAIN</Stamp></div>
          </div>
        </div>
      </section>

      <Marquee speed={45} color="var(--c-bg)" items={["FAVELA TECH", "SEABRA → SALVADOR → BH", "34K+ ESTUDANTES", "6 ESTADOS", "PROVA ON-CHAIN", "CHAPTER DO TALENT PROGRAM", "CELO · SCROLL", "PERIFERIA NO BLOCO"]} />

      <section className="how">
        <Reveal className="sec-head"><span className="sec-num">/01</span><h2 className="sec-title">Como funciona</h2></Reveal>
        <Reveal className="how-grid" variant="reveal-stagger">
          <StepCard n="01" tone="orange" title="Cadastra" sub="WALLET + BIO + ESCOLA">Crie seu perfil em 90 segundos. Conecte a carteira do bootcamp — ou abra uma nova com MiniPay direto pelo celular.</StepCard>
          <StepCard n="02" tone="cyan" title="Prova" sub="ATIVIDADE ON-CHAIN">Suas tx, badges NFT e contratos deployados viram skill verificável. O sistema lê sua carteira no Celo.</StepCard>
          <StepCard n="03" tone="magenta" title="É validado" sub="POR PROTOCOLOS WEB3">6 protocolos parceiros, 9 universidades, 7 comunidades — assinam atestados on-chain. Carteira vira CV.</StepCard>
        </Reveal>
      </section>

      <section className="bigstats">
        <Reveal className="stats-row" variant="reveal-stagger">
          <BigStat n="34k+" label="Estudantes alcançados" sub="em 5 anos de programa" />
          <BigStat n="1.2k" label="Cadastros 2025" sub="800 presentes em fev/25" />
          <BigStat n="06" label="Estados · 27 cidades" sub="BA · MG · SP · RJ · PE · CE" />
          <BigStat n="44+" label="Parcerias firmadas" sub="protocolos · universidades · ONGs" />
        </Reveal>
      </section>

      {/* SEMPRE PERFIS FICTÍCIOS NA LANDING */}
      <section className="talents">
        <Reveal className="sec-head">
          <span className="sec-num">/02</span>
          <h2 className="sec-title">Quem tá no bloco</h2>
          <span className="sec-tag">PIPELINE_BUILDERS.JSON</span>
        </Reveal>
        <Reveal className="talent-grid" variant="reveal-stagger">
          {MOCK_BUILDERS.map((t, i) => (
            <TalentCard key={i} talent={t} onClick={onViewBuilders} />
          ))}
        </Reveal>
        <div style={{ textAlign: "center", marginTop: 32 }}>
          <button className="btn btn-ghost" onClick={onViewBuilders}>Ver perfil dos builders →</button>
        </div>
      </section>

      <section className="partners">
        <Reveal className="partners-head"><span className="sec-num">/03</span><h2 className="sec-title">Validadores · Parceiros</h2></Reveal>
        <Reveal className="partners-row" variant="reveal-stagger">
          {PARTNERS.map((p) => (
            <div key={p.id} className="ptn">
              <span className="ptn-dot" style={{ background: p.color }}></span>
              <div className="ptn-l"><b>{p.name}</b><small>{p.role}</small></div>
            </div>
          ))}
        </Reveal>
      </section>

      <section className="manifesto" style={{ backgroundColor: "rgb(167, 118, 228)" }}>
        <Reveal className="man-inner">
          <Stamp color="var(--c-yellow)" rotate={-3}>MANIFESTO · v0.3</Stamp>
          <p className="man-text">
            <em>Estudante de escola pública</em> raramente acessam educação blockchain ou oportunidade web3.
            <span className="mk-orange"> A gente muda isso.</span> Bootcamp intensivo na escola.
            Tudo que o aluno faz, registrado on-chain. <span className="mk-cyan">Carteira vira diploma.</span>
          </p>
          <div className="man-sig">
            <span>— Bridging Latin America's next generation to Web3</span>
            <span className="man-org">Chapter do Talent Program · BR · desde 2020</span>
          </div>
        </Reveal>
      </section>
      <Footer />
    </div>
  );
}

function StepCard({ n, tone, title, sub, children }) {
  return (
    <div className={`step step-${tone}`} style={{ borderColor: "rgb(161, 130, 235)" }}>
      <div className="step-head"><span className="step-num">{n}</span><span className="step-sub mono">{sub}</span></div>
      <h3 className="step-title">{title}</h3>
      <p className="step-body">{children}</p>
      <div className="step-spark" aria-hidden style={{ color: "rgb(141, 65, 223)" }}>
        {Array.from({ length: 12 }).map((_, i) => <span key={i} style={{ height: `${20 + Math.sin(i * 0.7) * 16 + i % 3 * 4}%` }}></span>)}
      </div>
    </div>
  );
}

function BigStat({ n, label, sub }) {
  return (
    <div className="bstat">
      <div className="bstat-n display-num">{n}</div>
      <div className="bstat-l">{label}</div>
      <div className="bstat-s mono">↳ {sub}</div>
    </div>
  );
}

function TalentCard({ talent, onClick }) {
  return (
    <div className={`tcard ${talent.featured ? "tcard-feat" : ""}`} onClick={onClick} style={{ cursor: "pointer" }}>
      <div className={`tcard-img tone-${talent.tone}`}><CollageSlot label={talent.cohort} tone={talent.tone} /></div>
      <div className="tcard-body">
        <h4>{talent.n || talent.name}</h4>
        <div className="tcard-skills">
          {talent.skills.slice(0, 2).map((s) => <span key={s} className="chip">{SKILLS.find(x => x.id === s)?.label || s}</span>)}
        </div>
        <div className="tcard-cta mono">VER PERFIL ↗</div>
      </div>
    </div>
  );
}

// ─── SCREEN: BUILDERS LIST ───────────────────────────────────────────────────

function BuildersList({ builders, loading, onSelect, onBack }) {
  const [search, setSearch] = useState("");
  const tones = ["orange", "cyan", "magenta", "yellow"];
  const filtered = builders.filter(b =>
    b.name.toLowerCase().includes(search.toLowerCase()) ||
    (b.cohort || "").toLowerCase().includes(search.toLowerCase()) ||
    b.skills.some(s => (SKILLS.find(x => x.id === s)?.label || s).toLowerCase().includes(search.toLowerCase()))
  );
  return (
    <div className="screen landing">
      <Scanlines />
      <div style={{ padding: "32px 48px", maxWidth: 1200, margin: "0 auto" }}>
        <button className="reg-back mono" onClick={onBack} style={{ marginBottom: 24 }}>← VOLTAR</button>
        <div className="sec-head" style={{ marginBottom: 24 }}>
          <span className="sec-num">/02</span>
          <h2 className="sec-title">Builders · {builders.length} cadastrados</h2>
        </div>
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Buscar por nome, programa ou skill..."
          style={{ width: "100%", marginBottom: 24, padding: "10px 16px", background: "var(--c-bg-2)", border: "1px solid var(--c-bg-3)", color: "var(--c-fg)", fontFamily: "JetBrains Mono", fontSize: 13, borderRadius: 4 }}
        />
        {loading ? (
          <p className="mono" style={{ color: "var(--c-muted)", textAlign: "center", padding: 40 }}>Carregando builders...</p>
        ) : filtered.length === 0 ? (
          <p className="mono" style={{ color: "var(--c-muted)", textAlign: "center", padding: 40 }}>
            {builders.length === 0 ? "Nenhum builder cadastrado ainda. Seja o primeiro!" : "Nenhum resultado encontrado."}
          </p>
        ) : (
          <div className="talent-grid">
            {filtered.map((b, i) => (
              <div key={b.wallet} className="tcard" onClick={() => onSelect(b)} style={{ cursor: "pointer" }}>
                <div className={`tcard-img tone-${tones[i % tones.length]}`}>
                  <CollageSlot label={b.cohort || "BnE"} tone={tones[i % tones.length]} />
                </div>
                <div className="tcard-body">
                  <h4>{b.name}</h4>
                  <p className="mono" style={{ fontSize: 11, color: "var(--c-muted)", marginBottom: 8 }}>{b.location || b.cohort}</p>
                  <div className="tcard-skills">
                    {b.skills.slice(0, 3).map(id => <span key={id} className="chip">{SKILLS.find(s => s.id === id)?.label || id}</span>)}
                  </div>
                  <div className="tcard-cta mono">VER PERFIL ↗</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}

// ─── SCREEN: REGISTER ────────────────────────────────────────────────────────

function Register({ onComplete, onBack, initialData }) {
  const [step, setStep] = useState(0);
  const [data, setData] = useState(initialData || {
    name: "", bio: "", location: "", github: "", email: "",
    wallet: "", cohort: "", skills: [], tracks: []
  });
  const [walletConnecting, setWalletConnecting] = useState(false);
  const [isMiniPay, setIsMiniPay] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [submitResults, setSubmitResults] = useState(null);

  const update = (k, v) => setData((d) => ({ ...d, [k]: v }));
  const toggle = (k, v) => setData((d) => ({ ...d, [k]: d[k].includes(v) ? d[k].filter((x) => x !== v) : [...d[k], v] }));

  const connectWallet = async () => {
    setWalletConnecting(true);
    try {
      if (typeof window.ethereum !== "undefined") {
        const miniPay = window.ethereum.isMiniPay === true;
        setIsMiniPay(miniPay);
        const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
        if (accounts && accounts[0]) update("wallet", accounts[0]);
      } else {
        alert("Nenhuma carteira detectada. Abra no MiniPay ou instale MetaMask.");
      }
    } catch (err) {
      alert("Erro ao conectar carteira. Tente novamente.");
    } finally {
      setWalletConnecting(false);
    }
  };

  useEffect(() => {
    if (typeof window.ethereum !== "undefined" && window.ethereum.isMiniPay) connectWallet();
  }, []);

  const handlePublish = async () => {
    setSubmitting(true);
    setSubmitError(null);
    try {
      const res = await fetch("/api/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, isMiniPay })
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || "Erro no servidor");
      setSubmitResults(result.results);
    } catch (err) {
      setSubmitError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  // Mostra tela de sucesso após submit
  if (submitResults) {
    return <SuccessScreen data={data} results={submitResults} onViewProfile={() => onComplete(data)} />;
  }

  const steps = ["Identidade", "Carteira", "Skills", "Trilhas", "Confirmar"];
  const canNext = () => {
    if (step === 0) return data.name.trim().length > 1;
    if (step === 1) return data.wallet.length > 0;
    return true;
  };

  // Agrupa skills por tag
  const skillGroups = SKILLS.reduce((acc, s) => {
    if (!acc[s.tag]) acc[s.tag] = [];
    acc[s.tag].push(s);
    return acc;
  }, {});

  return (
    <div className="screen register">
      <Scanlines />
      <div className="reg-shell">
        <button className="reg-back mono" onClick={onBack}>← VOLTAR</button>
        <div className="reg-grid">
          <aside className="reg-side">
            <div className="reg-eyebrow"><span className="dot dot-live"></span><span className="mono">CADASTRO · TALENT_HUB</span></div>
            <h2 className="reg-display">
              <span className="rd-1 d-orange">CRIA</span>
              <span className="rd-2 d-outline">SEU</span>
              <span className="rd-3 d-cyan">PERFIL</span>
            </h2>
            <p className="reg-lede">Cinco passos. Sua carteira é seu currículo.<br /><br /><span className="mono" style={{ color: "var(--c-orange)" }}>↳ ETA: 90s</span></p>
            <div className="reg-steps">
              {steps.map((s, i) => (
                <div key={s} className={`rs ${i === step ? "rs-on" : ""} ${i < step ? "rs-done" : ""}`}>
                  <span className="rs-n mono">{String(i + 1).padStart(2, "0")}</span>
                  <span className="rs-l">{s}</span>
                  {i < step && <span className="rs-tick">✓</span>}
                </div>
              ))}
            </div>
            <div className="reg-side-foot mono">◤ STEP {step + 1} / {steps.length}</div>
          </aside>

          <main className="reg-main">
            <CornerTicks color="var(--c-fg)" />

            {step === 0 && (
              <StepFrame title="Quem é você?" tag="01·IDENTIDADE">
                <Field label="Nome completo" required><input value={data.name} onChange={(e) => update("name", e.target.value)} placeholder="Ex: Maria Eduarda Santos" /></Field>
                <Field label="Bio" hint="Em uma frase: quem é você, o que tá construindo">
                  <textarea rows={3} value={data.bio} onChange={(e) => update("bio", e.target.value)} placeholder="Estudante na E.E... comecei programando smart contracts..." />
                </Field>
                <div className="field-row">
                  <Field label="Localização" hint="Cidade, UF"><input value={data.location} onChange={(e) => update("location", e.target.value)} placeholder="Belo Horizonte, MG" /></Field>
                  <Field label="GitHub / portfólio" hint="Opcional"><input value={data.github} onChange={(e) => update("github", e.target.value)} placeholder="github.com/seu-user" /></Field>
                </div>
                <Field label="Email de contato" hint="Opcional">
                  <input value={data.email} onChange={(e) => update("email", e.target.value)} placeholder="use um email não sensível" type="email" />
                  {data.email && (
                    <div style={{ marginTop: 6, padding: "8px 12px", background: "rgba(255,210,63,0.08)", border: "1px solid rgba(255,210,63,0.25)", borderRadius: 3, fontSize: 12, color: "var(--c-yellow)" }}>
                      ⚠ Seu email ficará <b>público</b> no repositório GitHub. Use um email não sensível.
                    </div>
                  )}
                </Field>
                <Field label="Programa / Cohort">
                  <div className="chip-row">
                    {COHORTS.map((c) => (
                      <button key={c} type="button" className={`chip-pick ${data.cohort === c ? "on" : ""}`} onClick={() => update("cohort", c)}>{c}</button>
                    ))}
                  </div>
                </Field>
              </StepFrame>
            )}

            {step === 1 && (
              <StepFrame title="Conecta a carteira" tag="02·WALLET">
                <p className="step-frame-lede">Sua carteira é seu CV verificável.</p>
                <div className="wallet-row">
                  <button className={`wallet-pill ${walletConnecting ? "pulsing" : ""}`} onClick={connectWallet} disabled={walletConnecting}>
                    <span className="wp-glyph">⬢</span>
                    <span className="wp-l"><b>MiniPay</b><small>1-tap conectar (recomendado)</small></span>
                  </button>
                  <button className="wallet-pill" onClick={connectWallet}>
                    <span className="wp-glyph">◈</span>
                    <span className="wp-l"><b>WalletConnect / MetaMask</b><small>Metamask, Rainbow, etc.</small></span>
                  </button>
                </div>
                <Field label="Ou cole o endereço Celo">
                  <input value={data.wallet} onChange={(e) => update("wallet", e.target.value)} placeholder="0x..." className="mono" />
                </Field>
                {data.wallet && !walletConnecting && (
                  <div className="wallet-preview">
                    <CornerTicks color="var(--c-cyan)" />
                    <div className="wp-row"><span className="mono small muted">CARTEIRA</span><span className="mono">{data.wallet}</span></div>
                    <div className="wp-row"><span className="mono small muted">TIPO</span><span className="mono"><span className="dot dot-cyan"></span>{isMiniPay ? " MiniPay detectado" : " Carteira externa"}</span></div>
                    <div className="wp-row"><span className="mono small muted">REDE</span><span className="mono">Celo Mainnet</span></div>
                  </div>
                )}
              </StepFrame>
            )}

            {step === 2 && (
              <StepFrame title="No que você manja?" tag="03·SKILLS">
                <p className="step-frame-lede">Marca tudo que você já tocou — técnico ou não.</p>
                {Object.entries(skillGroups).map(([tag, skills]) => (
                  <div key={tag} style={{ marginBottom: 20 }}>
                    <div className="mono" style={{ fontSize: 10, color: "var(--c-muted)", letterSpacing: "0.12em", marginBottom: 8 }}>◤ {tag}</div>
                    <div className="skills-grid">
                      {skills.map((s) => {
                        const on = data.skills.includes(s.id);
                        return (
                          <button key={s.id} type="button" className={`skill-chip ${on ? "on" : ""}`} onClick={() => toggle("skills", s.id)}>
                            <span className="sc-tag mono">{s.tag}</span>
                            <span className="sc-l">{s.label}</span>
                            {on && <span className="sc-tick">✓</span>}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
                <div className="muted small mono" style={{ marginTop: 8 }}>↳ {data.skills.length} skill{data.skills.length !== 1 ? "s" : ""} selecionada{data.skills.length !== 1 ? "s" : ""}</div>
              </StepFrame>
            )}

            {step === 3 && (
              <StepFrame title="Quais trilhas você concluiu?" tag="04·TRILHAS">
                <p className="step-frame-lede">As trilhas que você terminou no bootcamp.</p>
                <div className="tracks-list">
                  {TRACKS.map((t) => {
                    const on = data.tracks.includes(t);
                    return (
                      <label key={t} className={`track-row ${on ? "on" : ""}`}>
                        <input type="checkbox" checked={on} onChange={() => toggle("tracks", t)} />
                        <span className="tr-box">{on && "✓"}</span>
                        <span className="tr-l">{t}</span>
                        <span className="tr-stamp mono">CARIMBO PENDENTE</span>
                      </label>
                    );
                  })}
                </div>
              </StepFrame>
            )}

            {step === 4 && (
              <StepFrame title="Confere e publica" tag="05·CONFIRMAR">
                <p className="step-frame-lede">Revisa seus dados. Ao publicar:</p>
                <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 20, padding: "12px 16px", background: "var(--c-bg-3)", borderRadius: 3 }}>
                  <div className="mono" style={{ fontSize: 12, color: "var(--c-cyan)" }}>✓ Cria seu perfil no repositório público (GitHub)</div>
                  <div className="mono" style={{ fontSize: 12, color: "var(--c-yellow)" }}>✓ Emite um Badge NFT Web3 101 na sua carteira (Celo Mainnet) — gas pago pelo BnE</div>
                </div>
                <div className="review">
                  <ReviewRow l="Nome" v={data.name || "—"} />
                  <ReviewRow l="Bio" v={data.bio || "—"} />
                  <ReviewRow l="Local" v={data.location || "—"} />
                  <ReviewRow l="GitHub" v={data.github || "—"} mono />
                  <ReviewRow l="Email" v={data.email || "—"} mono />
                  <ReviewRow l="Carteira" v={data.wallet || "—"} mono />
                  <ReviewRow l="Programa" v={data.cohort || "—"} />
                  <ReviewRow l="Skills" v={data.skills.length ? data.skills.map((id) => SKILLS.find((s) => s.id === id)?.label).join(" · ") : "—"} />
                  <ReviewRow l="Trilhas" v={data.tracks.length ? data.tracks.join(" · ") : "—"} />
                </div>
                {submitError && <div style={{ marginTop: 12, color: "var(--c-blood)", fontFamily: "JetBrains Mono", fontSize: 13 }}>⚠ {submitError}</div>}
              </StepFrame>
            )}

            <div className="reg-nav">
              <button className="btn btn-ghost" disabled={step === 0} onClick={() => setStep((s) => Math.max(0, s - 1))}>← Anterior</button>
              {step < steps.length - 1 ? (
                <button className="btn btn-primary" disabled={!canNext()} onClick={() => setStep((s) => Math.min(steps.length - 1, s + 1))}>Próximo <ArrowGlyph /></button>
              ) : (
                <button className="btn btn-primary" disabled={submitting || !data.wallet} onClick={handlePublish}>
                  {submitting ? "Publicando…" : "Publicar perfil"} <ArrowGlyph />
                </button>
              )}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}

function StepFrame({ title, tag, children }) {
  return (
    <div className="step-frame">
      <div className="sf-head"><span className="sf-tag mono">◤ {tag}</span><h3 className="sf-title">{title}</h3></div>
      {children}
    </div>
  );
}

function Field({ label, hint, required, children }) {
  return (
    <label className="field">
      <span className="f-l">
        <span className="f-l-main">{label} {required && <em>*</em>}</span>
        {hint && <span className="f-l-hint mono">{hint}</span>}
      </span>
      {children}
    </label>
  );
}

function ReviewRow({ l, v, mono }) {
  return (
    <div className="rev-row">
      <span className="rev-l mono">{l.toUpperCase()}</span>
      <span className={`rev-v ${mono ? "mono" : ""}`}>{v}</span>
    </div>
  );
}

// ─── SCREEN: PROFILE ─────────────────────────────────────────────────────────

function Profile({ profile, onBack, onEdit, isOwn }) {
  const [tab, setTab] = useState("overview");
  const [copied, setCopied] = useState(false);
  const [showInvite, setShowInvite] = useState(false);

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="screen profile">
      <Scanlines />
      {showInvite && <InviteModal profile={profile} onClose={() => setShowInvite(false)} />}
      <div className="prof-shell">
        <div className="prof-topnav">
          <button className="reg-back mono" onClick={onBack}>← VOLTAR</button>
          <div className="prof-share mono">
            <button onClick={handleShare} style={{ background: "none", border: "none", cursor: "pointer", color: copied ? "var(--c-cyan)" : "var(--c-muted)", fontFamily: "JetBrains Mono", fontSize: 12 }}>
              {copied ? "✓ LINK COPIADO!" : "↗ COMPARTILHAR"}
            </button>
            {isOwn && <button onClick={onEdit} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--c-muted)", fontFamily: "JetBrains Mono", fontSize: 12 }}>⌘ EDITAR</button>}
            <span style={{ color: "var(--c-cyan)" }}>● ON-CHAIN VERIFICADO</span>
          </div>
        </div>

        <header className="prof-hero">
          <div className="prof-portrait"><CollageSlot label={profile.cohort ? profile.cohort.toUpperCase() : "BNE"} tone="warm" img="assets/art-04.png" /></div>
          <div className="prof-id">
            <div className="eyebrow"><span className="dot dot-live"></span><span className="mono">PERFIL · BUILDER</span></div>
            <h1 className="prof-name display">
              <span className="d-orange">{profile.name.split(" ")[0]}</span>{" "}
              <span className="d-outline">{profile.name.split(" ").slice(1).join(" ")}</span>
            </h1>
            <p className="prof-bio">{profile.bio}</p>
            <div className="prof-meta">
              {profile.location && <MetaPill label="Local" v={profile.location} />}
              {profile.cohort && <MetaPill label="Programa" v={profile.cohort} />}
              {profile.github && <MetaPill label="GitHub" v={profile.github} mono />}
              <MetaPill label="Wallet" v={profile.wallet.slice(0, 6) + "…" + profile.wallet.slice(-4)} mono accent />
            </div>
            <div className="prof-cta">
              {profile.email && (
                <button className="btn btn-primary" onClick={() => setShowInvite(true)}>
                  <span>Convidar para projeto</span><ArrowGlyph />
                </button>
              )}
              {isOwn && <button className="btn btn-ghost" onClick={onEdit}>Editar perfil</button>}
            </div>
          </div>
          <div className="prof-badge">
            <CornerTicks color="var(--c-yellow)" />
            <div className="pb-stamp"><Stamp color="var(--c-yellow)" rotate={-6}>BNE BADGE · NFT</Stamp></div>
            <div className="pb-art" aria-hidden>
              <svg viewBox="0 0 120 120">
                <defs>
                  <pattern id="pbDot" x="0" y="0" width="4" height="4" patternUnits="userSpaceOnUse">
                    <circle cx="2" cy="2" r="0.7" fill="var(--c-yellow)" opacity="0.6" />
                  </pattern>
                </defs>
                <polygon points="60,8 110,38 110,82 60,112 10,82 10,38" fill="var(--c-bg-2)" stroke="var(--c-yellow)" strokeWidth="2" />
                <polygon points="60,20 100,42 100,78 60,100 20,78 20,42" fill="url(#pbDot)" />
                <text x="60" y="58" textAnchor="middle" fontSize="11" fill="var(--c-yellow)" fontFamily="JetBrains Mono">BNE</text>
                <text x="60" y="74" textAnchor="middle" fontSize="9" fill="var(--c-fg)" fontFamily="JetBrains Mono">CELO</text>
              </svg>
            </div>
            <div className="pb-meta mono"><div>BNE TALENT HUB</div><div>CELO MAINNET</div></div>
          </div>
        </header>

        <nav className="prof-tabs mono">
          {[{ id: "overview", l: "Overview" }, { id: "skills", l: "Skills · Validações" }, { id: "onchain", l: "Atividade on-chain" }].map((t) => (
            <button key={t.id} className={`pt ${tab === t.id ? "on" : ""}`} onClick={() => setTab(t.id)}>{t.l}</button>
          ))}
        </nav>

        {tab === "overview" && <OverviewTab profile={profile} onInvite={() => setShowInvite(true)} />}
        {tab === "skills" && <SkillsTab profile={profile} />}
        {tab === "onchain" && <OnchainTab profile={profile} />}
      </div>
      <Footer />
    </div>
  );
}

function MetaPill({ label, v, mono, accent }) {
  return (
    <div className={`mpill ${accent ? "mp-accent" : ""}`}>
      <span className="mp-l mono">{label.toUpperCase()}</span>
      <span className={`mp-v ${mono ? "mono" : ""}`}>{v}</span>
    </div>
  );
}

function OverviewTab({ profile, onInvite }) {
  const skillLabels = profile.skills.map((id) => SKILLS.find((s) => s.id === id)?.label).filter(Boolean);
  return (
    <div className="ovw-grid">
      <div className="ovw-card ov-skills">
        <div className="oc-head"><span className="mono">◤ SKILLS</span><span className="mono small muted">{skillLabels.length} · declaradas</span></div>
        <div className="ovw-skills">{skillLabels.map((s) => <span key={s} className="chip chip-lg">{s}</span>)}</div>
      </div>
      <div className="ovw-card ov-tracks">
        <div className="oc-head"><span className="mono">◤ TRILHAS</span><span className="mono small muted">{profile.tracks.length} · concluídas</span></div>
        <div className="ovw-tracks">
          {profile.tracks.map((t) => (
            <div key={t} className="ot-row"><span className="ot-tick">✓</span><span className="ot-l">{t}</span><span className="ot-stamp mono">CARIMBADO ON-CHAIN</span></div>
          ))}
        </div>
      </div>
      <div className="ovw-card ov-stats">
        <div className="oc-head"><span className="mono">◤ ATIVIDADE</span></div>
        <div className="mini-stats">
          <div><b className="display-num">—</b><small>tx Celo</small></div>
          <div><b className="display-num">1</b><small>Badge NFT</small></div>
          <div><b className="display-num">{profile.tracks.length}</b><small>Trilhas</small></div>
          <div><b className="display-num">{profile.skills.length}</b><small>Skills</small></div>
        </div>
      </div>
      {profile.email && (
        <div className="ovw-card ov-cta">
          <Stamp color="var(--c-magenta)" rotate={-3}>RECRUTANDO</Stamp>
          <h4 style={{ marginTop: 18, fontFamily: "Bebas Neue", fontSize: 32, letterSpacing: "0.02em" }}>ABERTA PRA<br />OPORTUNIDADE</h4>
          <p>Estágio remoto, freelance web3, mentoria. Pagamento em USDC ou BRL.</p>
          <button className="btn btn-primary" style={{ marginTop: 12 }} onClick={onInvite}>Convidar pra projeto <ArrowGlyph /></button>
        </div>
      )}
    </div>
  );
}

function SkillsTab({ profile }) {
  const skillRows = profile.skills.map((id) => {
    const s = SKILLS.find((x) => x.id === id);
    const txCount = 2 + id.length % 12;
    return { ...s, txCount };
  });
  return (
    <div className="skills-tab">
      {skillRows.map((s) => (
        <div key={s.id} className="skill-row">
          <CornerTicks color="var(--c-fg)" />
          <div className="sr-l"><span className="sr-tag mono">{s.tag}</span><h4>{s.label}</h4><span className="sr-tx mono">↳ {s.txCount} tx</span></div>
          <div className="sr-bar">
            <div className="sr-bar-fill" style={{ width: `${30 + s.txCount * 5}%` }}></div>
            <div className="sr-bar-marks">{Array.from({ length: 20 }).map((_, i) => <span key={i}></span>)}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

function OnchainTab({ profile }) {
  return (
    <div className="onchain-tab">
      <div className="oc-grid">
        <div className="oc-stat"><span className="display-num">—</span><small>TX TOTAL</small></div>
        <div className="oc-stat"><span className="display-num">1</span><small>NFT MINTADO</small></div>
        <div className="oc-stat"><span className="display-num">{profile.tracks.length}</span><small>TRILHAS</small></div>
        <div className="oc-stat"><span className="display-num">{profile.skills.length}</span><small>SKILLS</small></div>
      </div>
      <p className="mono" style={{ color: "var(--c-muted)", fontSize: 12, marginTop: 24, textAlign: "center" }}>
        ↗ <a href={`https://celoscan.io/address/${profile.wallet}`} target="_blank" rel="noreferrer" style={{ color: "var(--c-cyan)" }}>Ver histórico completo no Celoscan</a>
      </p>
    </div>
  );
}

function Footer() {
  return (
    <footer className="ftr">
      <div className="ftr-grid">
        <div>
          <div className="ftr-mark display d-orange"><img src="assets/logo.png" alt="" className="ftr-logo" />BLOCKCHAIN NA ESCOLA</div>
          <p>Chapter brasileiro do <b>Talent Program</b>. Identifica, registra e rastreia talento web3 em escolas públicas e periferias do Brasil.</p>
        </div>
        <div><h5 className="mono">CONTATO</h5><ul><li>verber@refaz.xyz</li><li>delasperifa@gmail.com</li><li>marcelo@refaz.xyz</li></ul></div>
        <div><h5 className="mono">REPOS</h5><ul><li>↗ github.com/BlockchainnaEscola</li><li>↗ blockchain-na-escola.gitbook.io</li></ul></div>
        <div><h5 className="mono">PARCEIROS</h5><ul><li>Celo Foundation</li><li>Team1 Avalanche</li><li>Off-Chain Brazil · Modular · Rastas</li><li>Let's Co Create · Zcash BR</li></ul></div>
      </div>
      <div className="ftr-foot mono"><span>BNE//TALENT_HUB v0.6 · BH→SSA→SP · 2026</span><span>Built by kids da quebrada · Open source · MIT</span></div>
    </footer>
  );
}

// ─── ROOT ────────────────────────────────────────────────────────────────────

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "screen": "landing",
  "palette": "sunset",
  "showScanlines": true
}/*EDITMODE-END*/;

function App() {
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);
  const [screen, setScreenState] = useState(t.screen);
  const [profile, setProfile] = useState(null);
  const [walletAddress, setWalletAddress] = useState(null);
  const [builders, setBuilders] = useState([]);
  const [loadingBuilders, setLoadingBuilders] = useState(true);
  const [selectedBuilder, setSelectedBuilder] = useState(null);
  const [editData, setEditData] = useState(null);

  useEffect(() => { setScreenState(t.screen); }, [t.screen]);
  const setScreen = (s) => { setScreenState(s); setTweak("screen", s); };

  useEffect(() => {
    document.documentElement.dataset.palette = t.palette;
    document.documentElement.dataset.scanlines = t.showScanlines ? "on" : "off";
  }, [t.palette, t.showScanlines]);

  // Carrega builders reais do GitHub
  useEffect(() => {
    fetch(GITHUB_API)
      .then(r => r.json())
      .then(async files => {
        if (!Array.isArray(files)) { setLoadingBuilders(false); return; }
        const mdFiles = files.filter(f => f.name.endsWith(".md"));
        const loaded = await Promise.all(
          mdFiles.map(async f => {
            try {
              const r = await fetch(f.download_url);
              const md = await r.text();
              const wallet = f.name.replace(".md", "");
              return parseMd(md, wallet);
            } catch { return null; }
          })
        );
        setBuilders(loaded.filter(Boolean));
        setLoadingBuilders(false);
      })
      .catch(() => setLoadingBuilders(false));
  }, []);

  // Detecta carteira conectada
  useEffect(() => {
    if (typeof window.ethereum !== "undefined") {
      window.ethereum.request({ method: "eth_accounts" }).then(accounts => {
        if (accounts && accounts[0]) {
          setWalletAddress(accounts[0]);
          const own = builders.find(b => b.wallet.toLowerCase() === accounts[0].toLowerCase());
          if (own) setProfile(own);
        }
      }).catch(() => {});
    }
  }, [builders]);

  const connectWallet = async () => {
    if (typeof window.ethereum !== "undefined") {
      const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
      if (accounts && accounts[0]) {
        setWalletAddress(accounts[0]);
        const own = builders.find(b => b.wallet.toLowerCase() === accounts[0].toLowerCase());
        if (own) setProfile(own);
      }
    } else {
      alert("Nenhuma carteira detectada.");
    }
  };

  const hasProfile = !!(walletAddress && builders.find(b => b.wallet.toLowerCase() === walletAddress.toLowerCase()));
  const currentProfile = selectedBuilder || profile;
  const disconnectWallet = () => {
    setWalletAddress(null);
    setProfile(null);
  };

  const isOwn = currentProfile && walletAddress && currentProfile.wallet.toLowerCase() === walletAddress.toLowerCase();

  return (
    <div className="app" data-screen-label={screen}>
      <HUDBar
        screen={screen}
        walletAddress={walletAddress}
        hasProfile={hasProfile}
        onMyProfile={() => { setSelectedBuilder(null); setScreen("profile"); }}
        onConnect={connectWallet}
        onDisconnect={disconnectWallet}
      />

      {screen === "landing" && (
        <Landing onRegister={() => { setEditData(null); setScreen("register"); }} onViewBuilders={() => setScreen("builders")} />
      )}
      {screen === "builders" && (
        <BuildersList builders={builders} loading={loadingBuilders} onSelect={(b) => { setSelectedBuilder(b); setScreen("profile"); }} onBack={() => setScreen("landing")} />
      )}
      {screen === "register" && (
        <Register onComplete={(data) => { setProfile(data); setSelectedBuilder(null); setScreen("profile"); }} onBack={() => setScreen("landing")} initialData={editData} />
      )}
      {screen === "profile" && currentProfile && (
        <Profile profile={currentProfile} onBack={() => setScreen("builders")} onEdit={() => { setEditData(currentProfile); setScreen("register"); }} isOwn={isOwn} />
      )}
      {screen === "profile" && !currentProfile && (
        <div style={{ padding: 80, textAlign: "center" }}>
          <p className="mono" style={{ color: "var(--c-muted)" }}>Nenhum perfil selecionado.</p>
          <button className="btn btn-ghost" style={{ marginTop: 16 }} onClick={() => setScreen("landing")}>← Voltar</button>
        </div>
      )}

      <TweaksPanel>
        <TweakSection label="Demo · Tela" />
        <TweakRadio label="Tela" value={t.screen} options={["landing", "register", "profile"]} onChange={(v) => setTweak("screen", v)} />
        <TweakSection label="Aesthetic" />
        <TweakSelect label="Paleta" value={t.palette}
          options={[
            { value: "sunset", label: "Sunset Favela (default)" },
            { value: "neon", label: "Neon Periferia" },
            { value: "mono", label: "Mono Cyber" },
            { value: "dia", label: "Dia · Sol Quente" }
          ]}
          onChange={(v) => setTweak("palette", v)} />
        <TweakToggle label="Scanlines" value={t.showScanlines} onChange={(v) => setTweak("showScanlines", v)} />
      </TweaksPanel>
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById("app"));
root.render(<App />);
