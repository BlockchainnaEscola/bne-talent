// Blockchain na Escola — Talent Hub prototype
// Three-screen flow: Landing → Cadastro → Perfil

const { useState, useEffect, useRef, useMemo } = React;

// ─── DATA ────────────────────────────────────────────────────────────────────

const COHORTS = [
"W3T — Belo Horizonte 2025",
"BnE @ UNIFACS — Salvador",
"Mulheres que Codam — Rio de Janeiro",
"EduLatam — São Paulo"];


const SKILLS = [
{ id: "solidity", label: "Solidity", tag: "DEV" },
{ id: "typescript", label: "TypeScript", tag: "DEV" },
{ id: "react", label: "React", tag: "DEV" },
{ id: "viem", label: "viem", tag: "DEV" },
{ id: "wagmi", label: "wagmi", tag: "DEV" },
{ id: "foundry", label: "Foundry", tag: "DEV" },
{ id: "python", label: "Python", tag: "DEV" },
{ id: "rust", label: "Rust", tag: "DEV" },
{ id: "figma", label: "Figma", tag: "DESIGN" },
{ id: "defi", label: "DeFi", tag: "FIN" },
{ id: "minipay", label: "MiniPay", tag: "PAY" },
{ id: "nfts", label: "NFTs", tag: "ARTE" },
{ id: "dao", label: "DAOs", tag: "GOV" },
{ id: "onchain-data", label: "On-chain Data", tag: "DATA" }];


const TRACKS = [
"Token Engineering",
"Smart Contracts 101",
"DApp Frontend",
"NFT & Arte Digital",
"DAO & Governança",
"On-chain Identity"];


const PARTNERS = [
{ id: "celo", name: "Celo Foundation", role: "Sponsor", color: "var(--c-yellow)" },
{ id: "ava", name: "Team1 Avalanche", role: "Sponsor", color: "var(--c-magenta)" },
{ id: "ocb", name: "Off-Chain Brazil", role: "Validator", color: "var(--c-cyan)" },
{ id: "modular", name: "Modular Crypto", role: "Validator", color: "var(--c-orange)" },
{ id: "rastas", name: "Crypto Rastas", role: "Community", color: "var(--c-yellow)" },
{ id: "lcc", name: "Let's Co Create", role: "Community", color: "var(--c-magenta)" },
{ id: "zec", name: "Zcash Brazil", role: "Validator", color: "var(--c-cyan)" }];


// Demo profile — populated by registration
const DEFAULT_PROFILE = {
  name: "Maria Eduarda Santos",
  bio: "Estudante na E.E. Geraldo Jardim Linhares. Comecei programando smart contracts no bootcamp e quero virar dev fullstack web3.",
  location: "Belo Horizonte, MG",
  github: "github.com/duda-santos",
  wallet: "0x5dC4e4F7Ae4666FF6723828e48a536f56369CB0d",
  cohort: COHORTS[0],
  skills: ["solidity", "typescript", "react", "minipay"],
  tracks: ["Token Engineering", "DApp Frontend"],
  badges: [
  { id: "BNE-1761151541471", token: "#7", chain: "Celo", date: "2025-10-28", validator: "celo" }],

  validations: [
  { partner: "celo", skill: "Solidity", txCount: 12, date: "2025-10-28" },
  { partner: "ocb", skill: "TypeScript", txCount: 4, date: "2025-11-04" },
  { partner: "modular", skill: "MiniPay", txCount: 6, date: "2025-11-12" }]

};

// ─── PRIMITIVES ──────────────────────────────────────────────────────────────

function useReveal() {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver((es) => {
      es.forEach((e) => {if (e.isIntersecting) {el.classList.add("in");io.unobserve(el);}});
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
    </svg>);

}

function Scanlines() {
  return <div className="scanlines" aria-hidden></div>;
}

function CornerTicks({ color = "currentColor" }) {
  return (
    <>
      <span className="cnr cnr-tl" style={{ borderColor: color }}></span>
      <span className="cnr cnr-tr" style={{ borderColor: color }}></span>
      <span className="cnr cnr-bl" style={{ borderColor: color }}></span>
      <span className="cnr cnr-br" style={{ borderColor: color }}></span>
    </>);

}

function Stamp({ children, color = "var(--c-orange)", rotate = -6 }) {
  return (
    <span className="stamp" style={{ color, borderColor: color, transform: `rotate(${rotate}deg)` }}>
      {children}
    </span>);

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
    </div>);

}

function HUDBar({ screen, onScreen }) {
  const [t, setT] = useState(new Date());
  useEffect(() => {const i = setInterval(() => setT(new Date()), 1000);return () => clearInterval(i);}, []);
  const time = t.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
  return (
    <div className="hud">
      <div className="hud-l">
        <img src={(window.__resources && window.__resources.logo) || "assets/logo.png"} alt="BnE" className="hud-logo" style={{ height: "100px", width: "100px" }} />
        <b>BLOCKCHAIN NA ESCOLA</b>
        <span className="hud-sep">/</span>
        <span className="hud-chip">TALENT&nbsp;PROGRAM</span>
        <span className="hud-sep">/</span>
        <span style={{ color: "var(--c-cyan)" }}>{screen.toUpperCase()}</span>
      </div>
      <div className="hud-c">
        <span>5 anos · 6 estados · 27 cidades · 34k+ estudantes</span>
      </div>
      <div className="hud-r">
        <span>NET: CELO</span>
        <span className="hud-sep">·</span>
        <span>{time}</span>
      </div>
    </div>);

}

// ─── SCREEN: LANDING ─────────────────────────────────────────────────────────

function Landing({ onRegister, onView, palette }) {
  return (
    <div className="screen landing">
      <Scanlines />

      {/* HERO */}
      <section className="hero">
        <div className="hero-bg" aria-hidden style={{ backgroundSize: "cover", backgroundPosition: "center top" }}></div>
        <div className="hero-grid">
          {/* L COLUMN — Title block */}
          <div className="hero-title-col">
            <div className="eyebrow" style={{ width: "800px" }}>
              <img src={(window.__resources && window.__resources.logo) || "assets/logo.png"} alt="" className="eyebrow-logo" style={{ objectFit: "cover" }} />
              <span style={{ fontSize: "40px" }}>Talent Program · Chapter <b></b></span>
              <span className="eyebrow-sep">·</span>
              <span className="mono small">EST. 2020 · 5 ANOS</span>
            </div>
            <h1 className="display">
              <span className="d-line d-orange" style={{ color: "rgb(56, 30, 129)" }}>BLOCKCHAIN</span>
              <span className="d-line d-outline" style={{ color: "rgb(85, 181, 134)" }}><span style={{ color: "rgb(154, 87, 223)" }}>NA ESCOLA</span></span>
              <span className="d-line d-cyan tilt"><span className="d-amp"> /</span></span>
              <span className="d-line d-magenta"></span>
            </h1>
            <p className="lede">
              Conectando a próxima geração da América Latina ao Web3. Identificamos talento em escolas
              públicas e periferias do Brasil, registramos suas skills on-chain e parceiros validam.
              Sem diploma caro, sem rolê privilegiado — carteira vira CV.
            </p>
            <div className="cta-row">
              <button className="btn btn-primary" onClick={onRegister}>
                <span>Cadastrar perfil</span>
                <ArrowGlyph />
              </button>
              <button className="btn btn-ghost" onClick={onView}>
                Ver perfis →
              </button>
            </div>
            <div className="cta-meta">
              <span>↳ MiniPay · WalletConnect · Celo · Scroll · Avalanche</span>
            </div>
          </div>

          {/* R COLUMN — Collage portrait */}
          <div className="hero-portrait reveal-r" ref={useReveal()}>
            <CollageSlot label="COHORT · SEABRA · CHAPADA DIAMANTINA · BA" tone="warm" img={(window.__resources && window.__resources.art01) || "assets/art-01.png"} />
            <div className="portrait-tag p-tag-1">
              <span className="t-num">1.2k+</span>
              <span className="t-lbl">cadastros<br />2025</span>
            </div>
            <div className="portrait-tag p-tag-2" style={{ backgroundColor: "rgb(162, 219, 188)" }}>
              <span className="t-num">800</span>
              <span className="t-lbl">presentes<br />fev/25</span>
            </div>
            <div className="portrait-tag p-tag-3">
              <Stamp color="var(--c-cyan)" rotate={-8}>VERIFICADO ON-CHAIN</Stamp>
            </div>
          </div>
        </div>
      </section>

      {/* MARQUEE STRIP */}
      <Marquee
        speed={45}
        color="var(--c-bg)"
        items={[
        "FAVELA TECH", "SEABRA → SALVADOR → BH", "34K+ ESTUDANTES", "6 ESTADOS",
        "PROVA ON-CHAIN", "CHAPTER DO TALENT PROGRAM", "CELO · SCROLL", "PERIFERIA NO BLOCO"]
        } />
      

      {/* HOW IT WORKS — three stacked steps */}
      <section className="how">
        <Reveal className="sec-head">
          <span className="sec-num">/01</span>
          <h2 className="sec-title">Como funciona</h2>
          <span className="sec-tag"></span>
        </Reveal>

        <Reveal className="how-grid" variant="reveal-stagger">
          <StepCard n="01" tone="orange" title="Cadastra" sub="WALLET + BIO + ESCOLA">
            Crie seu perfil em 90 segundos. Conecte a carteira do bootcamp — ou abra uma nova com
            MiniPay direto pelo celular. Sem CPF, sem PIX, sem fricção.
          </StepCard>
          <StepCard n="02" tone="cyan" title="Prova" sub="ATIVIDADE ON-CHAIN">
            Suas tx, badges NFT e contratos deployados viram skill verificável. O sistema lê sua carteira
            no Celo e Scroll — mostra o que você fez, não o que você diz que sabe.
          </StepCard>
          <StepCard n="03" tone="magenta" title="É validado" sub="POR PROTOCOLOS WEB3">
            6 protocolos parceiros, 9 universidades, 7 comunidades — assinam atestados on-chain.
            Carteira vira CV. Empresa olha, contrata, paga em stablecoin.
          </StepCard>
        </Reveal>
      </section>

      {/* BIG STATS */}
      <section className="bigstats">
        <Reveal className="stats-row" variant="reveal-stagger">
          <BigStat n="34k+" label="Estudantes alcançados" sub="em 5 anos de programa" />
          <BigStat n="1.2k" label="Cadastros 2025" sub="800 presentes em fev/25" />
          <BigStat n="06" label="Estados · 27 cidades" sub="BA · MG · SP · RJ · PE · CE" />
          <BigStat n="44+" label="Parcerias firmadas" sub="protocolos · universidades · ONGs" />
        </Reveal>
      </section>

      {/* TALENTOS PREVIEW GRID */}
      <section className="talents">
        <Reveal className="sec-head">
          <span className="sec-num">/02</span>
          <h2 className="sec-title">Quem tá no bloco</h2>
          <span className="sec-tag">PIPELINE_BUILDERS.JSON</span>
        </Reveal>
        <Reveal className="talent-grid" variant="reveal-stagger">
          {[
          { n: "Pedro Augusto", cohort: "Seabra · BA · #4", skills: ["Solidity", "viem"], tone: "orange" },
          { n: "Maria Eduarda", cohort: "Salvador · BA · #7", skills: ["TypeScript", "React"], tone: "cyan", featured: true },
          { n: "Kauã Alves", cohort: "BH · MG · #10", skills: ["Rust", "DeFi"], tone: "magenta" },
          { n: "Yasmin Mello", cohort: "Recife · PE · #11", skills: ["Figma", "NFTs"], tone: "yellow" },
          { n: "Izabelly Lopes", cohort: "São Paulo · SP · #12", skills: ["Solidity", "DAO"], tone: "orange" },
          { n: "Lucas Gustavo", cohort: "BH · MG · #15", skills: ["Python", "Indexação on-chain"], tone: "cyan" }].
          map((t, i) =>
          <TalentCard key={i} talent={t} onClick={onView} />
          )}
        </Reveal>
      </section>

      {/* PARTNERS BAR */}
      <section className="partners">
        <Reveal className="partners-head">
          <span className="sec-num">/03</span>
          <h2 className="sec-title">Validadores · Parceiros</h2>
        </Reveal>
        <Reveal className="partners-row" variant="reveal-stagger">
          {PARTNERS.map((p) =>
          <div key={p.id} className="ptn">
              <span className="ptn-dot" style={{ background: p.color }}></span>
              <div className="ptn-l">
                <b>{p.name}</b>
                <small>{p.role}</small>
              </div>
            </div>
          )}
        </Reveal>
      </section>

      {/* MANIFESTO STRIP */}
      <section className="manifesto" style={{ backgroundColor: "rgb(167, 118, 228)" }}>
        <Reveal className="man-inner">
          <Stamp color="var(--c-yellow)" rotate={-3}>MANIFESTO · v0.3</Stamp>
          <p className="man-text">
            <em>Estudante de escola pública</em> raramente acessam educação blockchain ou oportunidade web3. 
            <span className="mk-orange">A gente muda isso.</span> Bootcamp intensivo na escola.
            Tudo que o aluno faz, registrado on-chain. <span className="mk-cyan">Carteira vira diploma.</span>
            Prova invisível pra invisíveis.
          </p>
          <div className="man-sig">
            <span>— Bridging Latin America’s next generation to Web3</span>
            <span className="man-org">Chapter do Talent Program · BR · desde 2020</span>
          </div>
        </Reveal>
      </section>

      <Footer />
    </div>);

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
          {/* abstract head + shoulders silhouette */}
          <defs>
            <pattern id="dots" x="0" y="0" width="6" height="6" patternUnits="userSpaceOnUse">
              <circle cx="3" cy="3" r="1.2" fill="#fff" opacity="0.8" />
            </pattern>
          </defs>
          <path d="M100 20 C 60 20, 50 70, 60 100 L 60 130 C 30 140, 10 180, 10 280 L 190 280 C 190 180, 170 140, 140 130 L 140 100 C 150 70, 140 20, 100 20 Z" fill="#0a0606" />
          {/* VR / glasses bar */}
          <rect x="48" y="78" width="104" height="22" rx="3" fill="var(--c-cyan)" opacity="0.92" />
          <rect x="50" y="80" width="44" height="18" rx="2" fill="#0a0606" />
          <rect x="106" y="80" width="44" height="18" rx="2" fill="#0a0606" />
          {/* dots head pattern */}
          <ellipse cx="100" cy="55" rx="40" ry="38" fill="url(#dots)" opacity="0.35" />
          {/* chain */}
          <path d="M75 145 Q100 165 125 145" stroke="var(--c-yellow)" strokeWidth="3" fill="none" />
          <circle cx="100" cy="160" r="5" fill="var(--c-yellow)" />
        </svg>
      </div>
      <div className="collage-mesh" aria-hidden>
        <MeshBg opacity={0.5} />
      </div>
      <div className="collage-tag">
        <span>◤ {label}</span>
      </div>
      <CornerTicks color="var(--c-fg)" />
    </div>);

}

function StepCard({ n, tone, title, sub, children }) {
  return (
    <div className={`step step-${tone}`} style={{ borderColor: "rgb(161, 130, 235)" }}>
      <div className="step-head">
        <span className="step-num">{n}</span>
        <span className="step-sub mono">{sub}</span>
      </div>
      <h3 className="step-title">{title}</h3>
      <p className="step-body">{children}</p>
      <div className="step-spark" aria-hidden style={{ color: "rgb(141, 65, 223)" }}>
        {Array.from({ length: 12 }).map((_, i) =>
        <span key={i} style={{ height: `${20 + Math.sin(i * 0.7) * 16 + i % 3 * 4}%` }}></span>
        )}
      </div>
    </div>);

}

function BigStat({ n, label, sub }) {
  return (
    <div className="bstat">
      <div className="bstat-n display-num">{n}</div>
      <div className="bstat-l">{label}</div>
      <div className="bstat-s mono">↳ {sub}</div>
    </div>);

}

function TalentCard({ talent, onClick }) {
  return (
    <div className={`tcard ${talent.featured ? "tcard-feat" : ""}`} onClick={onClick}>
      <div className={`tcard-img tone-${talent.tone}`}>
        <CollageSlot label={talent.cohort} tone={talent.tone} />
      </div>
      <div className="tcard-body">
        <h4>{talent.n}</h4>
        <div className="tcard-skills">
          {talent.skills.map((s) => <span key={s} className="chip">{s}</span>)}
        </div>
        <div className="tcard-cta mono">VER PERFIL ↗</div>
      </div>
    </div>);

}

function ArrowGlyph() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.5">
      <path d="M4 12h16M14 6l6 6-6 6" />
    </svg>);

}

// ─── SCREEN: REGISTER ────────────────────────────────────────────────────────

function Register({ onComplete, onBack, palette }) {
  const [step, setStep] = useState(0);
  const [data, setData] = useState({
    name: "", bio: "", location: "", github: "",
    wallet: "", cohort: "", skills: [], tracks: []
  });
  const [walletConnecting, setWalletConnecting] = useState(false);

  const update = (k, v) => setData((d) => ({ ...d, [k]: v }));
  const toggle = (k, v) =>
  setData((d) => ({ ...d, [k]: d[k].includes(v) ? d[k].filter((x) => x !== v) : [...d[k], v] }));

  const connectWallet = () => {
    setWalletConnecting(true);
    setTimeout(() => {
      update("wallet", "0x" + Math.random().toString(16).slice(2, 10) + "...4F7Ae4666FF6");
      setWalletConnecting(false);
    }, 1400);
  };

  const steps = ["Identidade", "Carteira", "Skills", "Trilhas", "Confirmar"];
  const canNext = () => {
    if (step === 0) return data.name.trim().length > 1;
    if (step === 1) return data.wallet.length > 0;
    return true;
  };

  return (
    <div className="screen register">
      <Scanlines />

      <div className="reg-shell">
        <button className="reg-back mono" onClick={onBack}>← VOLTAR</button>

        <div className="reg-grid">
          {/* L: progress + display */}
          <aside className="reg-side">
            <div className="reg-eyebrow">
              <span className="dot dot-live"></span>
              <span className="mono">CADASTRO · TALENT_HUB</span>
            </div>
            <h2 className="reg-display">
              <span className="rd-1 d-orange">CRIA</span>
              <span className="rd-2 d-outline">SEU</span>
              <span className="rd-3 d-cyan">PERFIL</span>
            </h2>
            <p className="reg-lede">
              Cinco passos. Sua carteira é seu currículo. Suas tx provam o que você sabe.
              <br /><br />
              <span className="mono" style={{ color: "var(--c-orange)" }}>↳ ETA: 90s</span>
            </p>
            <div className="reg-steps">
              {steps.map((s, i) =>
              <div key={s} className={`rs ${i === step ? "rs-on" : ""} ${i < step ? "rs-done" : ""}`}>
                  <span className="rs-n mono">{String(i + 1).padStart(2, "0")}</span>
                  <span className="rs-l">{s}</span>
                  {i < step && <span className="rs-tick">✓</span>}
                </div>
              )}
            </div>
            <div className="reg-side-foot mono">
              ◤ STEP {step + 1} / {steps.length}
            </div>
          </aside>

          {/* R: form */}
          <main className="reg-main">
            <CornerTicks color="var(--c-fg)" />

            {step === 0 &&
            <StepFrame title="Quem é você?" tag="01·IDENTIDADE">
                <Field label="Nome completo" required>
                  <input value={data.name} onChange={(e) => update("name", e.target.value)}
                placeholder="Ex: Maria Eduarda Santos" />
                </Field>
                <Field label="Bio" hint="Em uma frase: quem é você, o que tá construindo">
                  <textarea rows={3} value={data.bio} onChange={(e) => update("bio", e.target.value)}
                placeholder="Estudante na E.E... comecei programando smart contracts..." />
                </Field>
                <div className="field-row">
                  <Field label="Localização" hint="Cidade, UF">
                    <input value={data.location} onChange={(e) => update("location", e.target.value)}
                  placeholder="Belo Horizonte, MG" />
                  </Field>
                  <Field label="GitHub / portfólio" hint="Opcional">
                    <input value={data.github} onChange={(e) => update("github", e.target.value)}
                  placeholder="github.com/seu-user" />
                  </Field>
                </div>
                <Field label="Turma / Cohort">
                  <div className="chip-row">
                    {COHORTS.map((c) =>
                  <button key={c} type="button"
                  className={`chip-pick ${data.cohort === c ? "on" : ""}`}
                  onClick={() => update("cohort", c)}>{c}</button>
                  )}
                  </div>
                </Field>
              </StepFrame>
            }

            {step === 1 &&
            <StepFrame title="Conecta a carteira" tag="02·WALLET">
                <p className="step-frame-lede">
                  Sua carteira é seu CV verificável. A gente lê suas tx, badges, contratos —
                  e mostra pra parceiros validarem.
                </p>

                <div className="wallet-row">
                  <button className={`wallet-pill ${walletConnecting ? "pulsing" : ""}`}
                onClick={connectWallet} disabled={walletConnecting}>
                    <span className="wp-glyph">⬢</span>
                    <span className="wp-l">
                      <b>MiniPay</b>
                      <small>1-tap conectar (recomendado)</small>
                    </span>
                  </button>
                  <button className="wallet-pill" onClick={connectWallet}>
                    <span className="wp-glyph">◈</span>
                    <span className="wp-l">
                      <b>WalletConnect</b>
                      <small>Metamask, Rainbow, etc.</small>
                    </span>
                  </button>
                </div>

                <Field label="Ou cole o endereço Celo">
                  <input value={data.wallet} onChange={(e) => update("wallet", e.target.value)}
                placeholder="0x..." className="mono" />
                </Field>

                {data.wallet && !walletConnecting &&
              <div className="wallet-preview">
                    <CornerTicks color="var(--c-cyan)" />
                    <div className="wp-row">
                      <span className="mono small muted">CARTEIRA</span>
                      <span className="mono">{data.wallet}</span>
                    </div>
                    <div className="wp-row">
                      <span className="mono small muted">SCAN ON-CHAIN</span>
                      <span className="mono"><span className="dot dot-cyan"></span> 12 tx · 1 NFT badge · Celo Mainnet</span>
                    </div>
                    <div className="wp-row">
                      <span className="mono small muted">BADGE BNE</span>
                      <span className="mono">BNE-1761151541471 · #7</span>
                    </div>
                  </div>
              }
              </StepFrame>
            }

            {step === 2 &&
            <StepFrame title="No que você manja?" tag="03·SKILLS">
                <p className="step-frame-lede">
                  Marca tudo que você já tocou. Skills viram chips no seu perfil — parceiros validam
                  baseado nas suas tx.
                </p>
                <div className="skills-grid">
                  {SKILLS.map((s) => {
                  const on = data.skills.includes(s.id);
                  return (
                    <button key={s.id} type="button"
                    className={`skill-chip ${on ? "on" : ""}`}
                    onClick={() => toggle("skills", s.id)}>
                        <span className="sc-tag mono">{s.tag}</span>
                        <span className="sc-l">{s.label}</span>
                        {on && <span className="sc-tick">✓</span>}
                      </button>);

                })}
                </div>
                <div className="muted small mono" style={{ marginTop: 12 }}>
                  ↳ {data.skills.length} skill{data.skills.length === 1 ? "" : "s"} selecionada{data.skills.length === 1 ? "" : "s"}
                </div>
              </StepFrame>
            }

            {step === 3 &&
            <StepFrame title="Quais trilhas você concluiu?" tag="04·TRILHAS">
                <p className="step-frame-lede">
                  As trilhas que você terminou no bootcamp. Cada uma vira um carimbo on-chain.
                </p>
                <div className="tracks-list">
                  {TRACKS.map((t) => {
                  const on = data.tracks.includes(t);
                  return (
                    <label key={t} className={`track-row ${on ? "on" : ""}`}>
                        <input type="checkbox" checked={on} onChange={() => toggle("tracks", t)} />
                        <span className="tr-box">{on && "✓"}</span>
                        <span className="tr-l">{t}</span>
                        <span className="tr-stamp mono">CARIMBO PENDENTE</span>
                      </label>);

                })}
                </div>
              </StepFrame>
            }

            {step === 4 &&
            <StepFrame title="Confere e publica" tag="05·CONFIRMAR">
                <p className="step-frame-lede">
                  Revisa. Quando você publica, gera um arquivo no repo e dispara as validações.
                </p>
                <div className="review">
                  <ReviewRow l="Nome" v={data.name || "—"} />
                  <ReviewRow l="Bio" v={data.bio || "—"} />
                  <ReviewRow l="Local" v={data.location || "—"} />
                  <ReviewRow l="GitHub" v={data.github || "—"} mono />
                  <ReviewRow l="Carteira" v={data.wallet || "—"} mono />
                  <ReviewRow l="Cohort" v={data.cohort || "—"} />
                  <ReviewRow l="Skills" v={data.skills.length ? data.skills.map((id) => SKILLS.find((s) => s.id === id)?.label).join(" · ") : "—"} />
                  <ReviewRow l="Trilhas" v={data.tracks.length ? data.tracks.join(" · ") : "—"} />
                </div>
                <div className="publish-card">
                  <CornerTicks color="var(--c-yellow)" />
                  <div className="pub-l">
                    <Stamp color="var(--c-yellow)" rotate={-4}>PRONTO PRA ON-CHAIN</Stamp>
                    <p>Vai gerar <code>builders/{(data.wallet || "0x000").slice(0, 12).toLowerCase()}.md</code> no repo público e enfileirar atestados dos parceiros.</p>
                  </div>
                </div>
              </StepFrame>
            }

            <div className="reg-nav">
              <button className="btn btn-ghost"
              disabled={step === 0}
              onClick={() => setStep((s) => Math.max(0, s - 1))}>← Anterior</button>
              {step < steps.length - 1 ?
              <button className="btn btn-primary"
              disabled={!canNext()}
              onClick={() => setStep((s) => Math.min(steps.length - 1, s + 1))}>
                  Próximo <ArrowGlyph />
                </button> :

              <button className="btn btn-primary"
              onClick={() => onComplete(data)}>
                  Publicar perfil <ArrowGlyph />
                </button>
              }
            </div>
          </main>
        </div>
      </div>
    </div>);

}

function StepFrame({ title, tag, children }) {
  return (
    <div className="step-frame">
      <div className="sf-head">
        <span className="sf-tag mono">◤ {tag}</span>
        <h3 className="sf-title">{title}</h3>
      </div>
      {children}
    </div>);

}

function Field({ label, hint, required, children }) {
  return (
    <label className="field">
      <span className="f-l">
        <span className="f-l-main">{label} {required && <em>*</em>}</span>
        {hint && <span className="f-l-hint mono">{hint}</span>}
      </span>
      {children}
    </label>);

}

function ReviewRow({ l, v, mono }) {
  return (
    <div className="rev-row">
      <span className="rev-l mono">{l.toUpperCase()}</span>
      <span className={`rev-v ${mono ? "mono" : ""}`}>{v}</span>
    </div>);

}

// ─── SCREEN: PROFILE ─────────────────────────────────────────────────────────

function Profile({ profile, onBack, onEdit }) {
  const [tab, setTab] = useState("overview");
  return (
    <div className="screen profile">
      <Scanlines />

      <div className="prof-shell">
        <div className="prof-topnav">
          <button className="reg-back mono" onClick={onBack}>← VOLTAR</button>
          <div className="prof-share mono">
            <span>↗ COMPARTILHAR</span>
            <span>⌘ EDITAR</span>
            <span style={{ color: "var(--c-cyan)" }}>● ON-CHAIN VERIFICADO</span>
          </div>
        </div>

        {/* HERO */}
        <header className="prof-hero">
          <div className="prof-portrait">
            <CollageSlot label={profile.cohort.toUpperCase()} tone="warm" img={(window.__resources && window.__resources.art04) || "assets/art-04.png"} />
          </div>
          <div className="prof-id">
            <div className="eyebrow">
              <span className="dot dot-live"></span>
              <span className="mono">PERFIL · BUILDER</span>
            </div>
            <h1 className="prof-name display">
              <span className="d-orange">{profile.name.split(" ")[0]}</span>{" "}
              <span className="d-outline">{profile.name.split(" ").slice(1).join(" ")}</span>
            </h1>
            <p className="prof-bio">{profile.bio}</p>
            <div className="prof-meta">
              <MetaPill label="Local" v={profile.location} />
              <MetaPill label="Turma" v={profile.cohort} />
              <MetaPill label="GitHub" v={profile.github} mono />
              <MetaPill label="Wallet" v={profile.wallet.slice(0, 6) + "…" + profile.wallet.slice(-4)} mono accent />
            </div>
            <div className="prof-cta">
              <button className="btn btn-primary"><span>Contratar / Convidar</span><ArrowGlyph /></button>
              <button className="btn btn-ghost" onClick={onEdit}>Editar perfil</button>
            </div>
          </div>
          <div className="prof-badge">
            <CornerTicks color="var(--c-yellow)" />
            <div className="pb-stamp">
              <Stamp color="var(--c-yellow)" rotate={-6}>BNE BADGE · #7</Stamp>
            </div>
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
                <text x="60" y="74" textAnchor="middle" fontSize="9" fill="var(--c-fg)" fontFamily="JetBrains Mono">2025·BH</text>
              </svg>
            </div>
            <div className="pb-meta mono">
              <div>BNE-1761151541471</div>
              <div>TOKEN #7 · CELO</div>
            </div>
          </div>
        </header>

        {/* TABS */}
        <nav className="prof-tabs mono">
          {[
          { id: "overview", l: "Overview" },
          { id: "skills", l: "Skills · Validações" },
          { id: "onchain", l: "Atividade on-chain" },
          { id: "projects", l: "Projetos" }].
          map((t) =>
          <button key={t.id} className={`pt ${tab === t.id ? "on" : ""}`} onClick={() => setTab(t.id)}>
              {t.l}
            </button>
          )}
        </nav>

        {tab === "overview" && <OverviewTab profile={profile} />}
        {tab === "skills" && <SkillsTab profile={profile} />}
        {tab === "onchain" && <OnchainTab profile={profile} />}
        {tab === "projects" && <ProjectsTab profile={profile} />}

      </div>

      <Footer />
    </div>);

}

function MetaPill({ label, v, mono, accent }) {
  return (
    <div className={`mpill ${accent ? "mp-accent" : ""}`}>
      <span className="mp-l mono">{label.toUpperCase()}</span>
      <span className={`mp-v ${mono ? "mono" : ""}`}>{v}</span>
    </div>);

}

function OverviewTab({ profile }) {
  const skillLabels = profile.skills.map((id) => SKILLS.find((s) => s.id === id)?.label).filter(Boolean);
  return (
    <div className="ovw-grid">
      <div className="ovw-card ov-skills">
        <div className="oc-head"><span className="mono">◤ SKILLS</span><span className="mono small muted">{skillLabels.length} · declaradas</span></div>
        <div className="ovw-skills">
          {skillLabels.map((s) => <span key={s} className="chip chip-lg">{s}</span>)}
        </div>
      </div>

      <div className="ovw-card ov-tracks">
        <div className="oc-head"><span className="mono">◤ TRILHAS</span><span className="mono small muted">{profile.tracks.length} · concluídas</span></div>
        <div className="ovw-tracks">
          {profile.tracks.map((t) =>
          <div key={t} className="ot-row">
              <span className="ot-tick">✓</span>
              <span className="ot-l">{t}</span>
              <span className="ot-stamp mono">CARIMBADO ON-CHAIN</span>
            </div>
          )}
        </div>
      </div>

      <div className="ovw-card ov-stats">
        <div className="oc-head"><span className="mono">◤ ATIVIDADE</span></div>
        <div className="mini-stats">
          <div><b className="display-num">12</b><small>tx Celo</small></div>
          <div><b className="display-num">01</b><small>Badge NFT</small></div>
          <div><b className="display-num">03</b><small>Validações</small></div>
          <div><b className="display-num">02</b><small>Projetos</small></div>
        </div>
      </div>

      <div className="ovw-card ov-cta">
        <Stamp color="var(--c-magenta)" rotate={-3}>RECRUTANDO</Stamp>
        <h4 style={{ marginTop: 18, fontFamily: "Bebas Neue", fontSize: 32, letterSpacing: "0.02em" }}>
          ABERTA PRA<br />OPORTUNIDADE
        </h4>
        <p>Estágio remoto, freelance web3, mentoria. Pagamento em USDC ou BRL.</p>
        <button className="btn btn-primary" style={{ marginTop: 12 }}>Convidar pra projeto <ArrowGlyph /></button>
      </div>
    </div>);

}

function SkillsTab({ profile }) {
  const skillRows = profile.skills.map((id) => {
    const s = SKILLS.find((x) => x.id === id);
    const validations = PARTNERS.filter((p, i) => i % (profile.skills.indexOf(id) + 2) === 0).slice(0, 3);
    const txCount = 2 + id.length % 12;
    return { ...s, validations, txCount };
  });

  return (
    <div className="skills-tab">
      <div className="st-legend mono">
        <span><span className="dot dot-cyan"></span> Validado on-chain</span>
        <span><span className="dot dot-orange"></span> Pendente</span>
        <span><span className="dot dot-yellow"></span> Auto-declarado</span>
      </div>
      {skillRows.map((s) =>
      <div key={s.id} className="skill-row">
          <CornerTicks color="var(--c-fg)" />
          <div className="sr-l">
            <span className="sr-tag mono">{s.tag}</span>
            <h4>{s.label}</h4>
            <span className="sr-tx mono">↳ {s.txCount} tx · {s.validations.length} parceiros</span>
          </div>
          <div className="sr-bar">
            <div className="sr-bar-fill" style={{ width: `${30 + s.txCount * 5}%` }}></div>
            <div className="sr-bar-marks">
              {Array.from({ length: 20 }).map((_, i) => <span key={i}></span>)}
            </div>
          </div>
          <div className="sr-validators">
            {s.validations.map((v) =>
          <span key={v.id} className="vchip" title={v.name}>
                <span className="vchip-dot" style={{ background: v.color }}></span>
                <span className="vchip-l">{v.name}</span>
              </span>
          )}
            <button className="vchip vchip-add">+ Solicitar</button>
          </div>
        </div>
      )}
    </div>);

}

function OnchainTab({ profile }) {
  const txs = [
  { hash: "0x4f...8a21", type: "MINT NFT", desc: "BNE Badge #7", chain: "Celo", date: "2025-10-28" },
  { hash: "0x9e...44b1", type: "DEPLOY", desc: "MeuPrimeiroToken.sol", chain: "Celo", date: "2025-10-28" },
  { hash: "0x12...09cf", type: "TRANSFER", desc: "0.01 cUSD → professor.celo", chain: "Celo", date: "2025-10-29" },
  { hash: "0x77...b3a4", type: "INTERACT", desc: "Mento.swap(cUSD→cREAL)", chain: "Celo", date: "2025-11-02" },
  { hash: "0xa3...51c2", type: "ATTESTATION", desc: "Modular validou 'MiniPay'", chain: "Celo", date: "2025-11-12" },
  { hash: "0xff...728d", type: "MINT NFT", desc: "Crypto Rastas POAP", chain: "Celo", date: "2025-11-15" }];

  return (
    <div className="onchain-tab">
      <div className="oc-grid">
        <div className="oc-stat"><span className="display-num">12</span><small>TX TOTAL</small></div>
        <div className="oc-stat"><span className="display-num">01</span><small>NFT MINTADO</small></div>
        <div className="oc-stat"><span className="display-num">02</span><small>CONTRATOS DEPLOY</small></div>
        <div className="oc-stat"><span className="display-num">03</span><small>ATESTADOS</small></div>
      </div>
      <table className="tx-table mono">
        <thead>
          <tr><th>HASH</th><th>TIPO</th><th>DESCRIÇÃO</th><th>REDE</th><th>DATA</th></tr>
        </thead>
        <tbody>
          {txs.map((tx) =>
          <tr key={tx.hash}>
              <td><span className="tx-hash">{tx.hash}</span></td>
              <td><span className={`tx-type tx-${tx.type.split(" ")[0].toLowerCase()}`}>{tx.type}</span></td>
              <td>{tx.desc}</td>
              <td>{tx.chain}</td>
              <td>{tx.date}</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>);

}

function ProjectsTab({ profile }) {
  const projects = [
  { n: "MeuPrimeiroToken", desc: "ERC-20 deployado durante o bootcamp. 1.000 supply, simbólico.", tone: "orange" },
  { n: "PoapDeAniversário", desc: "Coleção de NFTs como lembrança da turma. 28 mintados.", tone: "magenta" }];

  return (
    <div className="projects-tab">
      {projects.map((p) =>
      <div key={p.n} className={`pj pj-${p.tone}`}>
          <CornerTicks color="var(--c-fg)" />
          <div className="pj-img"><CollageSlot label={p.n.toUpperCase()} tone={p.tone} /></div>
          <div className="pj-body">
            <h4>{p.n}</h4>
            <p>{p.desc}</p>
            <div className="pj-foot mono">
              <span>↗ CELOSCAN</span>
              <span>↗ GITHUB</span>
              <span>↗ DEMO</span>
            </div>
          </div>
        </div>
      )}
      <button className="pj pj-add">
        <span style={{ fontSize: 48, fontFamily: "Bebas Neue" }}>+</span>
        <span>Adicionar projeto</span>
      </button>
    </div>);

}

function Footer() {
  return (
    <footer className="ftr">
      <div className="ftr-grid">
        <div>
          <div className="ftr-mark display d-orange">
            <img src={(window.__resources && window.__resources.logo) || "assets/logo.png"} alt="" className="ftr-logo" />
            BLOCKCHAIN NA ESCOLA
          </div>
          <p>Chapter brasileiro do <b>Talent Program</b>. Identifica, registra e rastreia talento web3 em escolas públicas e periferias do Brasil — conectando a próxima geração da América Latina ao Web3.</p>
        </div>
        <div>
          <h5 className="mono">CONTATO</h5>
          <ul>
            <li>verber@refaz.xyz</li>
            <li>delasperifa@gmail.com</li>
            <li>marcelo@refaz.xyz</li>
          </ul>
        </div>
        <div>
          <h5 className="mono">REPOS</h5>
          <ul>
            <li>↗ github.com/BlockchainnaEscola</li>
            <li>↗ blockchain-na-escola.gitbook.io</li>
            <li>↗ bne.lovable.app</li>
          </ul>
        </div>
        <div>
          <h5 className="mono">PARCEIROS</h5>
          <ul>
            <li>Celo Foundation</li>
            <li>Team1 Avalanche</li>
            <li>Off-Chain Brazil · Modular · Rastas</li>
            <li>Let's Co Create · Zcash BR</li>
          </ul>
        </div>
      </div>
      <div className="ftr-foot mono">
        <span>BNE//TALENT_HUB v0.3 · BH→SSA→SP · 2026</span>
        <span>Built by kids da quebrada · Open source · MIT</span>
      </div>
    </footer>);

}

// ─── ROOT ────────────────────────────────────────────────────────────────────

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "screen": "landing",
  "palette": "sunset",
  "showScanlines": true,
  "intensity": 1.0
} /*EDITMODE-END*/;

function App() {
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);
  const [screen, setScreenState] = useState(t.screen);
  const [profile, setProfile] = useState(DEFAULT_PROFILE);

  // sync screen with tweak
  useEffect(() => {setScreenState(t.screen);}, [t.screen]);
  const setScreen = (s) => {setScreenState(s);setTweak("screen", s);};

  // palette
  useEffect(() => {
    document.documentElement.dataset.palette = t.palette;
    document.documentElement.dataset.scanlines = t.showScanlines ? "on" : "off";
  }, [t.palette, t.showScanlines]);

  const handleComplete = (data) => {
    // merge submitted data with placeholder validations/badges
    setProfile((p) => ({
      ...p,
      ...data,
      name: data.name || p.name,
      cohort: data.cohort || p.cohort,
      bio: data.bio || p.bio,
      location: data.location || p.location,
      github: data.github || p.github,
      wallet: data.wallet || p.wallet,
      skills: data.skills.length ? data.skills : p.skills,
      tracks: data.tracks.length ? data.tracks : p.tracks
    }));
    setScreen("profile");
  };

  return (
    <div className="app" data-screen-label={screen}>
      <HUDBar screen={screen} onScreen={setScreen} />
      {screen === "landing" && <Landing onRegister={() => setScreen("register")} onView={() => setScreen("profile")} />}
      {screen === "register" && <Register onComplete={handleComplete} onBack={() => setScreen("landing")} />}
      {screen === "profile" && <Profile profile={profile} onBack={() => setScreen("landing")} onEdit={() => setScreen("register")} />}

      <TweaksPanel>
        <TweakSection label="Demo · Tela" />
        <TweakRadio label="Tela" value={t.screen}
        options={["landing", "register", "profile"]}
        onChange={(v) => setTweak("screen", v)} />
        <TweakSection label="Aesthetic" />
        <TweakSelect label="Paleta" value={t.palette}
        options={[
        { value: "sunset", label: "Sunset Favela (default)" },
        { value: "neon", label: "Neon Periferia" },
        { value: "mono", label: "Mono Cyber" },
        { value: "dia", label: "Dia · Sol Quente" }]
        }
        onChange={(v) => setTweak("palette", v)} />
        <TweakToggle label="Scanlines" value={t.showScanlines}
        onChange={(v) => setTweak("showScanlines", v)} />
      </TweaksPanel>
    </div>);

}

const root = ReactDOM.createRoot(document.getElementById("app"));
root.render(<App />);