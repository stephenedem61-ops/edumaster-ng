import AppShell from "@/components/AppShell";
import Link from "next/link";
import { BookOpen, ClipboardList, FileCheck2, Users, ArrowUpRight, Sparkles, Library, ShieldCheck } from "lucide-react";
const tools=[
 {href:"/lesson-planner",title:"Lesson-note generator",desc:"Prepare structured lesson notes using Nigerian classroom context and your school's preferred format.",icon:BookOpen,tag:"TEACHING"},
 {href:"/exam-generator",title:"Examination generator",desc:"Create original objective and theory questions, with answer keys for teacher review.",icon:ClipboardList,tag:"ASSESSMENT"},
 {href:"/marking-assistant",title:"Marking scheme assistant",desc:"Build marking guides, model answers and suggested mark allocations.",icon:FileCheck2,tag:"ASSESSMENT"},
 {href:"/classes",title:"Classes & students",desc:"Set up class lists and keep a simple local preview of classroom records.",icon:Users,tag:"CLASSROOM"},
 {href:"/resources",title:"Resource library",desc:"Find and reuse the teaching documents you generate in this browser.",icon:Library,tag:"LIBRARY"},
 {href:"/settings",title:"Workspace settings",desc:"Set your school name, teacher profile and preferred document details.",icon:ShieldCheck,tag:"SETUP"}
];
export default function Home(){return <AppShell><div className="content">
 <div style={{display:"flex",justifyContent:"space-between",gap:20,alignItems:"flex-start",flexWrap:"wrap"}}><div><div className="eyebrow">YOUR TEACHING WORKSPACE</div><h1 className="page-title">Good morning, Teacher.</h1><p className="subtle">Spend less time formatting documents and more time supporting learning.</p></div><Link className="btn" href="/lesson-planner"><Sparkles size={15}/> Create a lesson note</Link></div>
 <div className="grid4" style={{marginTop:25}}>
  {[["Lesson plans","0","Create your first plan"],["Exam papers","0","Generate original questions"],["Marking guides","0","Prepare answer guides"],["Saved resources","0","Your document library"]].map(([a,b,c])=><div className="card" key={a}><div className="subtle">{a}</div><div className="stat">{b}</div><div style={{fontSize:11,color:"#84939b"}}>{c}</div></div>)}
 </div>
 <div style={{marginTop:32,display:"flex",justifyContent:"space-between",alignItems:"end"}}><div><div className="eyebrow">PRODUCTIVITY TOOLS</div><h2 style={{fontSize:19,fontWeight:800,margin:"7px 0"}}>What would you like to work on?</h2></div><span className="subtle">Designed for Nigerian schools</span></div>
 <div className="tool-grid">{tools.map(({href,title,desc,icon:Icon,tag})=><Link href={href} className="tool-card" key={href}><div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}><div className="icon-box"><Icon size={20}/></div><span className="eyebrow" style={{fontSize:9}}>{tag}</span></div><h3 style={{fontSize:15,fontWeight:800,margin:"17px 0 7px"}}>{title}</h3><p className="subtle" style={{minHeight:60}}>{desc}</p><div style={{display:"flex",alignItems:"center",gap:5,color:"#087e72",fontSize:12,fontWeight:800,marginTop:12}}>Open tool <ArrowUpRight size={14}/></div></Link>)}</div>
 <div className="notice" style={{marginTop:23}}><b>Important:</b> This is the initial application scaffold. AI generation requires your own server-side API key. Generated curriculum references and assessment answers must be checked by a qualified teacher before classroom use.</div>
 </div></AppShell>}
