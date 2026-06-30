"use client";

import { use } from "react";

export default function LmsLessonPage({ params: paramsPromise }:{ params:Promise<{courseId:string;moduleId:string;lessonId:string}> }){
  const params = use(paramsPromise);
  return <main style={{padding:32,background:'#f8fcff',minHeight:'100vh',fontFamily:'Inter,Arial,sans-serif'}}><section style={{background:'white',border:'4px solid #102a43',borderRadius:28,padding:28,boxShadow:'8px 8px 0 rgba(16,42,67,.1)'}}><p style={{color:'#2667ff',fontWeight:950}}>BEA/BEA LMS Course Player</p><h1 style={{color:'#102a43',fontSize:46,letterSpacing:'-.06em'}}>Module Lesson Player</h1><p><strong>Course:</strong> {params.courseId}</p><p><strong>Module:</strong> {params.moduleId}</p><p><strong>Lesson:</strong> {params.lessonId}</p><button type='button' style={{background:'#ff8c42',color:'white',border:0,borderRadius:16,padding:'14px 20px',fontWeight:950}} onClick={async()=>{await fetch('/api/flow/progress/update',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({courseId:params.courseId,moduleId:params.moduleId,lessonId:params.lessonId,status:'completed',score:100,timeSpentSeconds:300})}); alert('Progress saved.');}}>Complete Lesson and Save Progress</button></section></main>;
}
