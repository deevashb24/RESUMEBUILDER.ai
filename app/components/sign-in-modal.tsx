 
 "use client";
 
 import React, { useState } from "react";
 import { useRouter } from "next/navigation";
 import { Button } from "@/components/ui/button";
 import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
 import { useAuth } from "@/lib/auth-context";
 
 type SignInModalProps = {
   open: boolean;
   onClose: () => void;
 };
 
 export default function SignInModal({ open, onClose }: SignInModalProps) {
   const { loginWithGoogle, loginWithEmail } = useAuth();
   const router = useRouter();
   const [email, setEmail] = useState("");
   const [password, setPassword] = useState("");
   const [error, setError] = useState<string | null>(null);
   const [isSubmitting, setIsSubmitting] = useState(false);
 
   if (!open) return null;
 
  const handleGoogle = async () => {
    try {
      setIsSubmitting(true);
      setError(null);
      
      // This will open Google's account selection popup
      await loginWithGoogle();
      
      // If successful, redirect to dashboard
      router.push("/dashboard");
      onClose();
    } catch (e: any) {
      // Show user-friendly error messages
      const errorMessage = e?.message || "Failed to sign in with Google";
      setError(errorMessage);
      console.error("Google sign-in error:", e);
    } finally {
      setIsSubmitting(false);
    }
  };
 
   const handleEmail = async (e: React.FormEvent) => {
     e.preventDefault();
     try {
       setIsSubmitting(true);
       setError(null);
       await loginWithEmail(email, password);
       router.push("/dashboard");
       onClose();
     } catch (e: any) {
       setError(e?.message ?? "Failed to sign in with email");
     } finally {
       setIsSubmitting(false);
     }
   };
 
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
      <div className="w-full max-w-md">
        <Card className="relative shadow-xl bg-white">
          <CardHeader>
            <CardTitle className="text-center text-gray-900">Sign in to ResumeAI</CardTitle>
            <CardDescription className="text-center text-gray-600">
              Choose a method to continue
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
             <Button onClick={handleGoogle} disabled={isSubmitting} variant="outline" className="w-full">
               Continue with Google
             </Button>
 
             <div className="relative">
               <div className="absolute inset-0 flex items-center">
                 <span className="w-full border-t" />
               </div>
               <div className="relative flex justify-center text-xs uppercase">
                 <span className="bg-white px-2 text-gray-500">Or</span>
               </div>
             </div>
 
             <form onSubmit={handleEmail} className="space-y-3">
               <div className="space-y-2">
                 <input
                   value={email}
                   onChange={(e) => setEmail(e.target.value)}
                   placeholder="Email"
                   type="email"
                   required
                   className="w-full px-3 py-2 rounded-md border border-gray-300 bg-white text-gray-900 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                 />
                 <input
                   value={password}
                   onChange={(e) => setPassword(e.target.value)}
                   placeholder="Password"
                   type="password"
                   required
                   className="w-full px-3 py-2 rounded-md border border-gray-300 bg-white text-gray-900 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                 />
               </div>
               {error && <p className="text-sm text-destructive text-center">{error}</p>}
               <div className="flex gap-2">
                 <Button type="submit" disabled={isSubmitting} className="flex-1">
                   {isSubmitting ? "Signing in..." : "Continue with Email"}
                 </Button>
                 <Button type="button" variant="ghost" onClick={onClose}>
                   Cancel
                 </Button>
               </div>
             </form>
           </CardContent>
         </Card>
       </div>
     </div>
   );
 }
