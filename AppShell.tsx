"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookOpen, LayoutDashboard, ClipboardList, FileCheck2, Users, Library, Settings, GraduationCap } from "lucide-react";
const links = [
  {href:"/",label:"Overview",icon:LayoutDashboard},
  {href:"/lesson-planner",label:"Lesson planner",icon:BookOpen},
  {href:"/exam-generator",label:"Exam generator",icon:ClipboardList},
  {href:"/marking-assistant",label:"Marking assistant",icon:FileCheck2},
  {href:"/classes",label:"Classes & students",icon:Users},
  {href:"/resources",label:"Resource library",icon:Library},
  {href:"/settings",label:"Settings",icon:Settings}
];
export default function AppShell({children}:{children:React.ReactNode}) {
 const path=usePathname();
 return <div className="shell">
  <aside className="sidebar">
   <Link href="/" className="brand"><span className="brand-mark">E</span><span>EduMaster <span style={{color:"#5fd0bd"}}>NG</span></span></Link>
   <div><div className="nav-label">WORKSPACE</div><nav>{links.map(({href,label,icon:Icon})=><Link key={href} href={href} className={`nav-link ${path===href?"active":""}`}><Icon size={16}/>{label}</Link>)}</nav></div>
   <div className="bottom-nav" style={{marginTop:"auto",fontSize:11,color:"#91aab2",lineHeight:1.7}}>Built for Nigerian classrooms.<br/>British English · Naira · Local curriculum</div>
  </aside>
  <main className="main"><header className="topbar"><span style={{fontSize:12,color:"#657786"}}>Teacher workspace <span style={{color:"#b6c3c9"}}>/</span> Nigeria</span><div style={{display:"flex",alignItems:"center",gap:10}}><span className="pill">MVP PREVIEW</span><span style={{width:32,height:32,borderRadius:50,background:"#e6f4f1",display:"grid",placeItems:"center",fontSize:12,fontWeight:800,color:"#087e72"}}>TE</span></div></header>{children}</main>
 </div>;
}
