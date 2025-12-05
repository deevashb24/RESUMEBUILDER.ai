"use client";
import React from "react";
export function FileUpload({onChange}:{onChange?:(f:File)=>void}) {
  return (
    <label className="block p-4 border-dashed rounded">
      <input type="file" accept=".pdf,.docx" className="hidden"
        onChange={e=>{const f=e.target.files?.[0]; if(f && onChange) onChange(f)}}/>
      Click to upload or drag here
    </label>
  );
}
export default FileUpload;
