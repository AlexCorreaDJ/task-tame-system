import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";

import React, { useEffect } from "react";
import { initializeLocalNotifications, startReminderChecker } from "./utils/localNotifications";

console.log('📦 App.tsx carregado');

const queryClient = new QueryClient();

const App = () => {
  console.log('🎯 App component sendo renderizado...');

  useEffect(() => {
    (async () => {
      const granted = await initializeLocalNotifications();
      if (granted) {
        startReminderChecker();
      }
    })();
  }, []);

  try {
    return (
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/index.html" element={<Navigate to="/" replace />} />
              <Route path="/home" element={<Navigate to="/" replace />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </QueryClientProvider>
    );
  } catch (error) {
    console.error('❌ Erro no App component:', error);
    return (
      <div className="min-h-screen flex items-center justify-center bg-red-50">
        <div className="text-center p-8">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Erro no App</h1>
          <p className="text-red-500">Verifique o console para mais detalhes</p>
        </div>
      </div>
    );
  }
};

export default App;
