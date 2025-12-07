"use client";
import React from "react";
import { cn } from "@/lib/utils";

export function Card({children, className}:{children:any, className?:string}) {
  return <div className={cn("rounded-lg border bg-card text-card-foreground shadow-sm", className)}>{children}</div>;
}

export function CardHeader({children, className}:{children:any, className?:string}) {
  return <div className={cn("flex flex-col space-y-1.5 p-6", className)}>{children}</div>;
}

export function CardTitle({children, className}:{children:any, className?:string}) {
  return <h3 className={cn("text-2xl font-semibold leading-none tracking-tight", className)}>{children}</h3>;
}

export function CardDescription({children, className}:{children:any, className?:string}) {
  return <p className={cn("text-sm text-muted-foreground", className)}>{children}</p>;
}

export function CardContent({children, className}:{children:any, className?:string}) {
  return <div className={cn("p-6 pt-0", className)}>{children}</div>;
}

export default Card;

