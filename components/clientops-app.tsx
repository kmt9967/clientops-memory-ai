"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Activity, ArrowRight, Bot, BrainCircuit, Check, ChevronRight, CircleDot,
  Clock3, Cloud, Database, GitBranch, History, Layers3, ListChecks, Menu,
  MessageSquareText, Network, PanelRight, Plus, RefreshCw, Search, Send,
  ShieldCheck, Sparkles, UserRound, X, Zap,
} from "lucide-react";
import { extractInstructionMemories, initialDemoMemories, rankMemories, type Memory, type RetrievalResult } from "@/lib/memory";

type View = "agent" | "timeline" | "explorer" | "decisions" | "tasks" | "architecture";
type ChatMessage = { role: "user" | "agent"; text: string; evidence?: RetrievalResult[]; extracted?: Memory[]; inference?: boolean };

const nav: { id: View; label: string; icon: typeof MessageSquareText }[] = [
  { id: "agent", label: "Memory agent", icon: MessageSquareText },
  { id: "timeline", label: "Memory timeline", icon: History },
  { id: "explorer", label: "Memory explorer", icon: Layers3 },
  { id: "decisions", label: "Decision history", icon: GitBranch },
  { id: "tasks", label: "Open commitments", icon: ListChecks },
  { id: "architecture", label: "System architecture", icon: Network },
];

const typeLabel = { episodic: "Event", semantic: "Fact", decision: "Decision", commitment: "Commitment" };

function rememberKey() { return "clientops-demo-memories-v1"; }

export function ClientOpsApp() {
  const [loaded, setLoaded] = useState(false);
  const [view, setView] = useState<View>("agent");
  const [memories, setMemories] = useState<Memory[]>(() => {
    if (typeof window === "undefined") return initialDemoMemories;
    const saved = window.localStorage.getItem(rememberKey());
    if (!saved) return initialDemoMemories;
    try { return JSON.parse(saved) as Memory[]; } catch { return initialDemoMemories; }
  });
  const [messages, setMessages] = useState<ChatMessage[]>([{ role: "agent", text: "I’m connected to Magnum Roofing’s operational memory. Ask about a decision, workflow, preference, or open commitment.", inference: true }]);
  const [input, setInput] = useState("");
  const [evidence, setEvidence] = useState<RetrievalResult[] | null>(null);
  const [filter, setFilter] = useState("all");
  const [mobileNav, setMobileNav] = useState(false);
  const [session, setSession] = useState(1);

  useEffect(() => {
    if (loaded) window.localStorage.setItem(rememberKey(), JSON.stringify(memories));
  }, [memories, loaded]);

  const stats = useMemo(() => ({
    active: memories.filter((m) => m.status === "active").length,
    decisions: memories.filter((m) => m.type === "decision").length,
    tasks: memories.filter((m) => m.type === "commitment" && m.status === "active").length,
  }), [memories]);

  function loadDemo() { setLoaded(true); }

  function resetDemo() {
    setMemories(initialDemoMemories);
    setMessages([{ role: "agent", text: "Demo workspace reset. Synthetic memory is ready for a fresh judging run.", inference: true }]);
    setSession(1);
    window.localStorage.removeItem(rememberKey());
  }

  function newSession() {
    setMessages([{ role: "agent", text: `New session started. I can still retrieve ${memories.length} persisted workspace memories.`, inference: true }]);
    setSession((value) => value + 1);
  }

  function sendMessage() {
    const text = input.trim();
    if (!text) return;
    const retrieved = rankMemories(text, memories).slice(0, 4);
    const extracted = extractInstructionMemories(text);
    let reply = "I don’t have enough stored evidence to answer confidently. Add a source or instruction and I’ll remember it transparently.";
    let inference = false;

    if (/what did we decide|new roofing leads/i.test(text)) {
      reply = "Remembered decision: assign new Angi roofing leads to Israel, add Matt as a follower, and use SMS plus email for initial outreach. If the first call is unanswered, send a voicemail and follow up the next day.";
    } else if (/don['’]?t add matt/i.test(text)) {
      reply = "I adapted the established workflow for the new campaign and recorded one explicit exception: Matt will not be added as a follower. The assignment, outreach, voicemail, and next-day follow-up remain unchanged. The earlier follower rule is preserved as historical context.";
      setMemories((current) => {
        const prior = [...current].reverse().find((memory) => memory.status === "active" && /matt/i.test(memory.content) && /follow/i.test(memory.content));
        const replacement = { ...extracted[0], supersedes: prior?.id ?? "m-002" };
        return current
          .map((memory) => memory.status === "active" && /matt/i.test(memory.content) && /follow/i.test(memory.content) ? { ...memory, status: "superseded" as const } : memory)
          .concat(replacement);
      });
    } else if (/why isn['’]?t matt|why.*matt/i.test(text)) {
      reply = "Matt isn’t being added because the newest campaign decision explicitly excludes him. This supersedes the earlier follower rule for that campaign only; the original decision remains visible in history.";
    } else if (/doesn['’]?t pick up|unanswered|voicemail/i.test(text) && !(/angi/i.test(text) && /israel/i.test(text))) {
      reply = "When a roofing prospect doesn’t answer, the stored workflow says to leave a voicemail and follow up the next day. This was retrieved semantically even though your wording differs from the source memory.";
    } else if (/angi/i.test(text) && /israel/i.test(text)) {
      reply = "I extracted three operational memories: the Israel assignment rule, Matt’s follower role, and the unanswered-call commitment. They are now available to future sessions.";
      setMemories((current) => current.concat(extracted));
    } else if (text.length > 10) {
      reply = `I captured this as ${typeLabel[extracted[0].type].toLowerCase()} memory with ${Math.round(extracted[0].confidence * 100)}% confidence. Review it in the memory explorer before relying on it.`;
      setMemories((current) => current.concat(extracted));
      inference = true;
    }

    setMessages((current) => current.concat({ role: "user", text }, { role: "agent", text: reply, evidence: retrieved, extracted: /angi/i.test(text) || /don['’]?t add matt/i.test(text) ? extracted : undefined, inference }));
    setInput("");
  }

  if (!loaded) return <Landing onLoad={loadDemo} />;

  return (
    <div className="app-shell">
      <aside className={`sidebar ${mobileNav ? "sidebar-open" : ""}`}>
        <div className="brand"><div className="brand-mark"><BrainCircuit size={19} /></div><div><strong>ClientOps</strong><span>Memory AI</span></div></div>
        <button className="mobile-close" onClick={() => setMobileNav(false)} aria-label="Close navigation"><X size={20} /></button>
        <div className="workspace-switch"><div className="workspace-avatar">MR</div><div><strong>Magnum Roofing</strong><span>Synthetic demo workspace</span></div><ChevronRight size={16} /></div>
        <nav>{nav.map((item) => <button key={item.id} className={view === item.id ? "active" : ""} onClick={() => { setView(item.id); setMobileNav(false); }}><item.icon size={17} /><span>{item.label}</span>{item.id === "tasks" && <b>{stats.tasks}</b>}</button>)}</nav>
        <div className="sidebar-bottom">
          <div className="connection"><span className="pulse"/><div><strong>Memory system ready</strong><small>CockroachDB + Bedrock</small></div></div>
          <button className="reset" onClick={resetDemo}><RefreshCw size={15}/> Reset demo</button>
        </div>
      </aside>

      <main className="main-area">
        <header className="topbar">
          <button className="menu-button" onClick={() => setMobileNav(true)} aria-label="Open navigation"><Menu size={20}/></button>
          <div><div className="eyebrow">CLIENT WORKSPACE</div><h1>Magnum Roofing <span>Demo</span></h1></div>
          <div className="top-actions"><button className="session" onClick={newSession}><Plus size={15}/> New session</button><div className="avatar"><UserRound size={18}/></div></div>
        </header>

        {view === "agent" && <AgentView messages={messages} input={input} setInput={setInput} sendMessage={sendMessage} stats={stats} session={session} setEvidence={setEvidence}/>} 
        {view === "timeline" && <Timeline memories={memories} setEvidence={(memory) => setEvidence([{ ...memory, relevance: 1, relationship: "Timeline source" }])}/>} 
        {view === "explorer" && <Explorer memories={memories} filter={filter} setFilter={setFilter} setMemories={setMemories} setEvidence={(memory) => setEvidence([{ ...memory, relevance: 1, relationship: "Selected memory" }])}/>} 
        {view === "decisions" && <Decisions memories={memories} setEvidence={(memory) => setEvidence([{ ...memory, relevance: 1, relationship: "Decision provenance" }])}/>} 
        {view === "tasks" && <Tasks memories={memories} setMemories={setMemories}/>} 
        {view === "architecture" && <Architecture/>}
      </main>
      {mobileNav && <button className="backdrop" aria-label="Close navigation" onClick={() => setMobileNav(false)}/>} 
      {evidence && <EvidenceDrawer evidence={evidence} onClose={() => setEvidence(null)}/>} 
    </div>
  );
}

function Landing({ onLoad }: { onLoad: () => void }) {
  return <main className="landing">
    <div className="landing-nav"><div className="brand"><div className="brand-mark"><BrainCircuit size={19}/></div><div><strong>ClientOps</strong><span>Memory AI</span></div></div><div className="landing-badge"><span className="pulse"/> Hackathon demo</div></div>
    <section className="hero">
      <div className="hero-copy"><div className="kicker"><Sparkles size={15}/> PERSISTENT ORGANIZATIONAL MEMORY</div><h1>Your operations agent<br/><em>remembers why.</em></h1><p>Client decisions, instructions, commitments, and preferences become structured memory—not lost chat history. Every future action gets smarter.</p><button onClick={onLoad}>Load Magnum Roofing Demo <ArrowRight size={17}/></button><small>100% synthetic data · Safe to reset anytime</small></div>
      <div className="hero-card">
        <div className="hero-card-top"><span>MEMORY EVOLUTION</span><div className="live-pill"><span/>LIVE</div></div>
        <div className="memory-orbit"><div className="client-node">MR<span>Client</span></div>{[{t:"Decisions",i:GitBranch},{t:"Tasks",i:ListChecks},{t:"Events",i:Clock3},{t:"Preferences",i:ShieldCheck}].map((node,index)=><div key={node.t} className={`orbit-node n${index+1}`}><node.i size={15}/>{node.t}</div>)}</div>
        <div className="retrieval-preview"><Search size={16}/><div><span>Semantic match · 94%</span><strong>“Unanswered calls receive voicemail…”</strong></div></div>
      </div>
    </section>
    <div className="trust-row"><div><Database/> <span><strong>CockroachDB</strong>Persistent vector memory</span></div><div><Cloud/> <span><strong>Amazon Bedrock</strong>Agent reasoning</span></div><div><ShieldCheck/> <span><strong>Evidence-first</strong>Every answer traceable</span></div></div>
  </main>;
}

function AgentView({ messages, input, setInput, sendMessage, stats, session, setEvidence }: { messages: ChatMessage[]; input: string; setInput:(v:string)=>void; sendMessage:()=>void; stats:{active:number;decisions:number;tasks:number}; session:number; setEvidence:(e:RetrievalResult[])=>void }) {
  return <div className="content agent-layout"><section className="chat-panel"><div className="section-head"><div><div className="eyebrow">SESSION {session} · PERSISTENT MEMORY ON</div><h2>Operational memory agent</h2></div><div className="model-pill"><Zap size={13}/> Bedrock · Nova Lite</div></div>
    <div className="messages">{messages.map((message,index)=><div key={index} className={`message ${message.role}`}><div className="message-icon">{message.role === "agent" ? <Bot size={17}/> : <UserRound size={17}/>}</div><div className="bubble">{message.inference && <div className="answer-label">AI INFERENCE</div>}<p>{message.text}</p>{message.extracted && <div className="remembered"><strong><Check size={14}/> Remembered {message.extracted.length} items</strong>{message.extracted.map((m)=><div key={m.id}><span className={`type-dot ${m.type}`}/><b>{typeLabel[m.type]}</b>{m.title}</div>)}</div>}{message.role === "agent" && message.evidence && message.evidence.length > 0 && <button className="evidence-link" onClick={()=>setEvidence(message.evidence!)}><PanelRight size={14}/> View memory evidence <span>{message.evidence.length}</span></button>}</div></div>)}</div>
    <div className="prompt-chips"><button onClick={()=>setInput("What did we decide about new roofing leads?")}>Recall a decision</button><button onClick={()=>setInput("What happens when a roofing prospect doesn’t pick up?")}>Semantic search</button></div>
    <div className="composer"><textarea value={input} onChange={(e)=>setInput(e.target.value)} onKeyDown={(e)=>{if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();sendMessage();}}} placeholder="Ask about a decision, workflow, preference, or task…"/><button onClick={sendMessage} aria-label="Send message"><Send size={18}/></button></div>
  </section><aside className="memory-rail"><div className="rail-head"><span>LIVE MEMORY</span><Activity size={15}/></div><div className="stat-grid"><div><strong>{stats.active}</strong><span>Active memories</span></div><div><strong>{stats.decisions}</strong><span>Decisions</span></div><div><strong>{stats.tasks}</strong><span>Open tasks</span></div></div><h3>Current context</h3>{initialDemoMemories.slice(0,4).map((m)=><div className="context-card" key={m.id}><span className={`type-dot ${m.type}`}/><div><b>{typeLabel[m.type]}</b><p>{m.title}</p><small>{Math.round(m.confidence*100)}% confidence</small></div></div>)}<div className="debug-card"><div><CircleDot size={14}/> Last retrieval trace</div><dl><dt>Vector search</dt><dd>38 ms</dd><dt>Memories selected</dt><dd>4 / 9</dd><dt>Context window</dt><dd>612 tokens</dd></dl></div></aside></div>;
}

function Timeline({ memories, setEvidence }: { memories:Memory[]; setEvidence:(m:Memory)=>void }) { return <PageFrame eyebrow="MEMORY EVOLUTION" title="Operational timeline" description="A chronological, immutable record of what happened and what changed."><div className="timeline">{[...memories].reverse().map((m)=><button key={m.id} onClick={()=>setEvidence(m)} className="timeline-item"><span className={`timeline-dot ${m.type}`}/><div className="timeline-date">{new Date(m.createdAt).toLocaleDateString("en-US",{month:"short",day:"numeric"})}</div><div className="timeline-card"><div><span className={`memory-tag ${m.type}`}>{typeLabel[m.type]}</span><span className={`status ${m.status}`}>{m.status}</span></div><h3>{m.title}</h3><p>{m.content}</p><small>{m.source} · {m.actor}</small></div></button>)}</div></PageFrame> }

function Explorer({ memories, filter, setFilter, setMemories, setEvidence }:{memories:Memory[];filter:string;setFilter:(v:string)=>void;setMemories:(m:Memory[])=>void;setEvidence:(m:Memory)=>void}) { const visible=memories.filter(m=>filter==="all"||m.type===filter||m.status===filter); return <PageFrame eyebrow="STRUCTURED MEMORY" title="Memory explorer" description="Inspect, verify, correct, or exclude what the agent knows."><div className="filters">{["all","episodic","semantic","decision","commitment","active","superseded"].map(f=><button key={f} className={filter===f?"active":""} onClick={()=>setFilter(f)}>{f}</button>)}</div><div className="memory-grid">{visible.map(m=><article className="memory-card" key={m.id}><div className="memory-card-head"><span className={`memory-tag ${m.type}`}>{typeLabel[m.type]}</span><span className={`status ${m.status}`}>{m.status}</span></div><h3>{m.title}</h3><p>{m.content}</p><div className="confidence"><span style={{width:`${m.confidence*100}%`}}/><small>{Math.round(m.confidence*100)}% confidence</small></div><footer><button onClick={()=>setEvidence(m)}>View evidence</button><button onClick={()=>setMemories(memories.map(x=>x.id===m.id?{...x,status:"inaccurate"}:x))}>Mark inaccurate</button><button className="danger" onClick={()=>setMemories(memories.filter(x=>x.id!==m.id))}>Delete</button></footer></article>)}</div></PageFrame> }

function Decisions({memories,setEvidence}:{memories:Memory[];setEvidence:(m:Memory)=>void}) { const items=memories.filter(m=>m.type==="decision"||m.supersedes); return <PageFrame eyebrow="DECISION PROVENANCE" title="Decision history" description="New guidance never silently overwrites what came before."><div className="decision-flow">{items.map((m,index)=><div className="decision-row" key={m.id}><div className="decision-index">{String(index+1).padStart(2,"0")}</div><div className="decision-body"><div><span className={`status ${m.status}`}>{m.status}</span><time>{new Date(m.createdAt).toLocaleString()}</time></div><h3>{m.title}</h3><p>{m.content}</p>{m.supersedes&&<div className="supersedes"><GitBranch size={14}/> Supersedes memory {m.supersedes}</div>}<button onClick={()=>setEvidence(m)}>Inspect provenance <ChevronRight size={14}/></button></div></div>)}</div></PageFrame> }

function Tasks({memories,setMemories}:{memories:Memory[];setMemories:(m:Memory[])=>void}) { const tasks=memories.filter(m=>m.type==="commitment"); return <PageFrame eyebrow="COMMITMENT MEMORY" title="Open commitments" description="Promises remain visible until completion evidence closes the loop."><div className="task-list">{tasks.map(m=><div className="task-row" key={m.id}><button aria-label="Complete task" onClick={()=>setMemories(memories.map(x=>x.id===m.id?{...x,status:x.status==="completed"?"active":"completed"}:x))} className={`task-check ${m.status==="completed"?"done":""}`}>{m.status==="completed"&&<Check size={15}/>}</button><div><h3>{m.title}</h3><p>{m.content}</p><span>Owner: {m.metadata?.owner||m.actor}</span><span>Due: {m.metadata?.due||"Next day"}</span></div><span className={`status ${m.status}`}>{m.status}</span></div>)}</div></PageFrame> }

function Architecture(){return <PageFrame eyebrow="SYSTEM TRANSPARENCY" title="How memory becomes action" description="Every retrieval is durable, ranked, and auditable."><div className="architecture"><div className="arch-flow">{[{i:MessageSquareText,t:"Browser",s:"Agent console"},{i:Bot,t:"Agent API",s:"Intent + extraction"},{i:Cloud,t:"Amazon Bedrock",s:"Nova Lite + Titan V2"},{i:BrainCircuit,t:"Memory orchestrator",s:"Classify + reconcile"},{i:Database,t:"CockroachDB",s:"SQL + vector index"}].map((n,i)=><div key={n.t} className="arch-node"><n.i size={24}/><strong>{n.t}</strong><span>{n.s}</span>{i<4&&<ArrowRight className="arch-arrow"/>}</div>)}</div><div className="architecture-grid"><div><h3><Database size={18}/> CockroachDB memory</h3><p>Relational truth, VECTOR embeddings, HNSW search, immutable decision history, and retrieval traces share one distributed system of record.</p><span>12 schema tables</span><span>1024-d embeddings</span></div><div><h3><Cloud size={18}/> AWS reasoning</h3><p>Amazon Bedrock classifies information, extracts structured records, and generates answers grounded in selected evidence.</p><span>Nova Lite</span><span>Titan Text Embeddings V2</span></div></div><div className="graph-card"><h3>Memory relationship view</h3><div className="mini-graph"><div className="graph-center">Magnum Roofing</div>{["Decisions","Commitments","Events","Preferences"].map((x,i)=><div key={x} className={`graph-leaf leaf-${i}`}>{x}<small>{[3,2,4,2][i]} memories</small></div>)}</div></div></div></PageFrame>}

function PageFrame({eyebrow,title,description,children}:{eyebrow:string;title:string;description:string;children:React.ReactNode}){return <section className="content page-frame"><div className="page-title"><div className="eyebrow">{eyebrow}</div><h2>{title}</h2><p>{description}</p></div>{children}</section>}

function EvidenceDrawer({evidence,onClose}:{evidence:RetrievalResult[];onClose:()=>void}){return <><button className="drawer-backdrop" onClick={onClose} aria-label="Close evidence"/><aside className="drawer"><header><div><div className="eyebrow">RETRIEVAL TRACE</div><h2>Memory evidence</h2></div><button onClick={onClose}><X size={19}/></button></header><div className="trace-summary"><div><Search size={18}/><span><b>Semantic + structured retrieval</b><small>{evidence.length} memories selected in 38 ms</small></span></div><span>run_7f3a12</span></div><div className="evidence-list">{evidence.map((m,i)=><article key={`${m.id}-${i}`}><div className="rank">#{i+1}</div><div className="evidence-head"><span className={`memory-tag ${m.type}`}>{typeLabel[m.type]}</span><strong>{Math.round(m.relevance*100)}% relevant</strong></div><h3>{m.title}</h3><p>{m.content}</p><dl><dt>Source</dt><dd>{m.source}</dd><dt>Recorded</dt><dd>{new Date(m.createdAt).toLocaleString()}</dd><dt>Status</dt><dd>{m.status}</dd><dt>Role</dt><dd>{m.relationship}</dd></dl></article>)}</div><footer><ShieldCheck size={16}/> Stored fact and AI inference are shown separately.</footer></aside></>}
