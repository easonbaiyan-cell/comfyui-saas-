"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

export default function LoginPage() {
  const router = useRouter();
  
  // Auth state
  const [authMode, setAuthMode] = useState<"otp" | "password">("otp");
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Countdown state for OTP
  const [countdown, setCountdown] = useState(0);

  // Check if already logged in
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        router.push("/");
      }
    });
  }, [router]);

  // Handle countdown timer
  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setInterval(() => setCountdown(prev => prev - 1), 1000);
    return () => clearInterval(timer);
  }, [countdown]);

  const handleSendOtp = async () => {
    if (!phone) {
      setError("Please enter your phone number");
      return;
    }
    
    setError(null);
    setLoading(true);
    
    // Ensure phone starts with +86 if not explicitly provided
    const formattedPhone = phone.startsWith("+") ? phone : `+86${phone}`;
    
    try {
      const { error } = await supabase.auth.signInWithOtp({
        phone: formattedPhone,
      });

      if (error) throw error;
      
      setCountdown(60);
    } catch (err: unknown) {
      const e = err as Error;
      setError(e.message || "Failed to send verification code");
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const formattedPhone = phone.startsWith("+") ? phone : `+86${phone}`;

    try {
      if (authMode === "otp") {
        if (!code) throw new Error("Please enter verification code");
        
        const { error } = await supabase.auth.verifyOtp({
          phone: formattedPhone,
          token: code,
          type: 'sms',
        });
        
        if (error) throw error;
      } else {
        if (!password) throw new Error("Please enter your password");
        
        const { error } = await supabase.auth.signInWithPassword({
          phone: formattedPhone,
          password,
        });
        
        if (error) throw error;
      }

      // If successful, redirect
      router.push("/");
    } catch (err: unknown) {
      const e = err as Error;
      setError(e.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0b0d13] flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-background/40 backdrop-blur-xl border-white/10 shadow-2xl">
        <CardHeader className="space-y-4 text-center">
          <div className="flex justify-center mb-2">
            <Image 
              src="/logo.png" 
              alt="Logo" 
              width={160} 
              height={48} 
              className="h-12 w-auto object-contain" 
            />
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight">
            {authMode === "otp" ? "Welcome / Log In" : "Log In with Password"}
          </CardTitle>
          <CardDescription className="text-muted-foreground">
            {authMode === "otp" 
              ? "Enter your mobile number to receive a verification code." 
              : "Enter your mobile number and password to log in."}
          </CardDescription>
        </CardHeader>
        
        <form onSubmit={handleLogin}>
          <CardContent className="space-y-4">
            {error && (
              <div className="bg-destructive/15 text-destructive text-sm p-3 rounded-md border border-destructive/20">
                {error}
              </div>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="phone">Mobile Number</Label>
              <div className="flex">
                <div className="bg-muted px-3 py-2 flex items-center justify-center rounded-l-md border border-r-0 border-input text-sm text-muted-foreground font-medium">
                  +86
                </div>
                <Input 
                  id="phone" 
                  type="tel" 
                  placeholder="138 0000 0000" 
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                  className="rounded-l-none"
                  required
                />
              </div>
            </div>

            {authMode === "otp" ? (
              <div className="space-y-2">
                <Label htmlFor="code">Verification Code</Label>
                <div className="flex gap-2">
                  <Input 
                    id="code" 
                    type="text" 
                    placeholder="6-digit code" 
                    value={code}
                    onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    className="flex-1"
                    required
                  />
                  <Button 
                    type="button" 
                    variant="secondary" 
                    onClick={handleSendOtp}
                    disabled={loading || countdown > 0 || phone.length < 11}
                    className="w-[120px]"
                  >
                    {countdown > 0 ? `${countdown}s` : "Get Code"}
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Password</Label>
                </div>
                <Input 
                  id="password" 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            )}
          </CardContent>

          <CardFooter className="flex flex-col gap-4">
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Processing..." : (authMode === "otp" ? "Log In / Register" : "Log In")}
            </Button>
            
            <button
              type="button"
              onClick={() => {
                setAuthMode(authMode === "otp" ? "password" : "otp");
                setError(null);
                setCode("");
                setPassword("");
              }}
              className="text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              {authMode === "otp" 
                ? "Switch to Password Login" 
                : "Switch to SMS Verification"}
            </button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
