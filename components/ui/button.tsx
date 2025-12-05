"use client";
import React from "react";
export function Button({ children, onClick }:{children:any,onClick?:()=>void}) {
  return <button onClick={onClick} className="px-3 py-2 rounded-md">{children}</button>;
}
export default Button;
