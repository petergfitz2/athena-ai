import { useState } from "react";
import AuthCard from "@/components/AuthCard";
import { useLocation } from "wouter";

export default function AuthPage() {
  const [, setLocation] = useLocation();

  const handleLogin = (username: string, password: string) => {
    console.log('Login attempt:', username);
    setLocation('/dashboard');
  };

  const handleRegister = (username: string, password: string) => {
    console.log('Register attempt:', username);
    setLocation('/dashboard');
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent pointer-events-none" />
      <AuthCard onLogin={handleLogin} onRegister={handleRegister} />
    </div>
  );
}
