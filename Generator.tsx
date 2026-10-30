"use client";
import { useState } from "react";
import { Download, Sparkles, LoaderCircle, Save } from "lucide-react";
type Props={kind:"lesson"|"exam"|"marking";title:string;intro:string};
export default function Generator({kind,title,intro}:Props){
 const [form,setForm]=useState({subject:"English Studies",level:"JSS 2",term:"First Term",topic:"",week:"",duration:"40 minutes",count:"20",questionType:"Mixed objective and theory",difficulty:"Moderate",totalMarks:"50",instructions:""});
 const [result,setResult]=useState(""); const [loading,setLoading]=useState(false); const [error,setError]=useState("");
 const update=(key:string,value:string)=>setForm(p=>({...p,[key]:value}));
 async function generate(){
  setLoading(true);setError("");setResult("");
  try{const res=await fetch("/api/generate",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({kind,...form})});const data=await res.json();if(!res.ok)throw new Error(data.error||"Generation failed");setResult(data.content);}
  catch(e){setError(e instanceof Error?e.message:"Something went wrong");}
  finally{setLoading(false);}
 }
 function save(){const old=JSON.parse(localStorage.getItem("edumaster_documents")||"[]");old.unshift({id:Date.now(),kind,title:form.topic||title,subject:form.subject,level:form.level,createdAt:new Date().toISOString(),content:result});localStorage.setItem("edumaster_documents",JSON.stringify(old));alert("Saved in this browser's resource library.");}
 function download(){const blob=new Blob([result],{type:"text/plain;charset=utf-8"});const url=URL.createObjectURL(blob);const a=document.createElement("a");a.href=url;a.download=`edumaster-${kind}.txt`;a.click();URL.revokeObjectURL(url);}
 return <div className="content"><div className="eyebrow">AI-ASSISTED TEACHING TOOL</div><h1 className="page-title">{title}</h1><p className="subtle" style={{maxWidth:680}}>{intro}</p>
 <div className="grid2" style={{marginTop:24,alignItems:"start"}}><section className="card"><h2 style={{fontWeight:800,fontSize:16,marginBottom:18}}>Document details</h2>
  <div className="form-grid">
   <div className="field"><label>Subject</label><select value={form.subject} onChange={e=>update("subject",e.target.value)}>{["English Studies","English Language","Literature-in-English","Mathematics","Basic Science","Social Studies","Civic Education","Biology","Chemistry","Physics","Economics","Government","Agricultural Science","Business Studies","Other"].map(x=><option key={x}>{x}</option>)}</select></div>
   <div className="field"><label>Class / level</label><select value={form.level} onChange={e=>update("level",e.target.value)}>{["Nursery","Primary 1","Primary 2","Primary 3","Primary 4","Primary 5","Primary 6","JSS 1","JSS 2","JSS 3","SS 1","SS 2","SS 3"].map(x=><option key={x}>{x}</option>)}</select></div>
   <div className="field"><label>Term</label><select value={form.term} onChange={e=>update("term",e.target.value)}>{["First Term","Second Term","Third Term"].map(x=><option key={x}>{x}</option>)}</select></div>
   {kind==="lesson"?<div className="field"><label>Week</label><input value={form.week} onChange={e=>update("week",e.target.value)} placeholder="e.g. 4"/></div>:null}
   <div className="field" style={{gridColumn:"1/-1"}}><label>Topic / subject matter</label><input value={form.topic} onChange={e=>update("topic",e.target.value)} placeholder="Enter the topic" required/></div>
   {kind==="lesson"?<div className="field"><label>Lesson duration</label><input value={form.duration} onChange={e=>update("duration",e.target.value)}/></div>:<div className="field"><label>Number of questions</label><input type="number" min="1" max="100" value={form.count} onChange={e=>update("count",e.target.value)}/></div>}
   {kind!=="lesson"?<><div className="field"><label>Question format</label><select value={form.questionType} onChange={e=>update("questionType",e.target.value)}><option>Mixed objective and theory</option><option>Multiple-choice objective</option><option>Theory / essay</option><option>Short-answer questions</option></select></div><div className="field"><label>Difficulty</label><select value={form.difficulty} onChange={e=>update("difficulty",e.target.value)}><option>Basic</option><option>Moderate</option><option>Challenging</option></select></div></>:null}
   {kind==="marking"?<div className="field"><label>Total marks</label><input value={form.totalMarks} onChange={e=>update("totalMarks",e.target.value)}/></div>:null}
  </div>
  <div className="field"><label>Additional instructions (optional)</label><textarea value={form.instructions} onChange={e=>update("instructions",e.target.value)} placeholder="Add your school's preferred structure, textbook topic, or other guidance."/></div>
  <button className="btn" style={{width:"100%"}} onClick={generate} disabled={loading||!form.topic.trim()}>{loading?<LoaderCircle size={16} className="animate-spin"/>:<Sparkles size={16}/>}{loading?"Preparing your document...":"Generate document"}</button>
  <p style={{fontSize:10,color:"#84939b",lineHeight:1.6,marginTop:12}}>AI output is a draft. Review factual accuracy, curriculum alignment, suitability, and mark allocation before use.</p>
  {error?<p style={{color:"#b54747",fontSize:12,marginTop:10}}>{error}</p>:null}
 </section>
 <section className="card" style={{minHeight:460}}><div style={{display:"flex",justifyContent:"space-between",alignItems:"center",gap:10,marginBottom:17}}><div><div className="eyebrow">DOCUMENT PREVIEW</div><h2 style={{fontWeight:800,fontSize:16,marginTop:5}}>Your generated content</h2></div>{result?<span className="pill">DRAFT</span>:null}</div>
 {result?<><div className="output" contentEditable suppressContentEditableWarning>{result}</div><div style={{display:"flex",gap:8,flexWrap:"wrap",marginTop:22}}><button className="btn" onClick={save}><Save size={14}/> Save to library</button><button className="btn btn-secondary" onClick={download}><Download size={14}/> Download text</button></div></>:<div style={{height:340,display:"grid",placeItems:"center",textAlign:"center",color:"#8a9aa2"}}><div><div className="icon-box" style={{margin:"0 auto 12px"}}><Sparkles size={20}/></div><b style={{fontSize:13,color:"#506674"}}>Your document will appear here</b><p style={{fontSize:11,maxWidth:230,lineHeight:1.6}}>Complete the details and generate a draft tailored to your classroom.</p></div></div>}
 </section></div></div>
}
