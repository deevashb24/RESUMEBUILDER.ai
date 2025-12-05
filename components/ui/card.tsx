"use client";
import React from "react";
export function Card({children}:{children:any}) { return <div className="bg-white rounded-lg shadow-sm p-4">{children}</div>; }
export function CardHeader({children}:{children:any}){ return <div className="font-semibold mb-2">{children}</div>; }
export function CardContent({children}:{children:any}){ return <div>{children}</div>; }
export default Card;
