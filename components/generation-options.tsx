"use client";
import React from "react";
export function GenerationOptions({selectedOption,setSelectedOption}:{selectedOption:string,setSelectedOption:(s:string)=>void}) {
  const options = [{id:"resume",label:"Resume"},{id:"sop",label:"SOP"},{id:"cover-letter",label:"Cover Letter"}];
  return <div className="flex gap-2">{options.map(o=> <button key={o.id} onClick={()=>setSelectedOption(o.id)} className={selectedOption===o.id? "font-bold":"opacity-70"}>{o.label}</button>)}</div>;
}
export default GenerationOptions;
