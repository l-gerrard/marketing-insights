import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Chat from "./pages/Chat";
import Analytics from "./pages/Analytics";
import DataIntegration from "./pages/DataIntegration";
import AIMarketingAnalysisBlog from "./pages/AIMarketingAnalysisBlog";
import AboutUs from "./pages/AboutUs";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsAndConditions from "./pages/TermsAndConditions";
import NotFound from "./pages/NotFound";
import Success from "./pages/Success";
import GoogleCallback from "./pages/GoogleCallback";
import GoogleCallbackPopup from "./pages/GoogleCallbackPopup";
import InstagramCallback from "./pages/InstagramCallback";
import InstagramCallbackPopup from "./pages/InstagramCallbackPopup";
import { LastSyncProvider } from "@/contexts/LastSyncContext";
import { AnalyticsProvider } from "@/contexts/AnalyticsContext";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <HelmetProvider>
      <TooltipProvider>
        <BrowserRouter>
          <AuthProvider>
            <LastSyncProvider>
              <AnalyticsProvider>
                <Toaster />
                <Sonner />
                <Routes>
                  <Route path="/" element={
                    <ProtectedRoute>
                      <Index />
                    </ProtectedRoute>
                  } />
                  <Route path="/login" element={<Auth />} />
                  <Route path="/chat" element={
                    <ProtectedRoute>
                      <Chat />
                    </ProtectedRoute>
                  } />
                  <Route path="/analytics" element={
                    <AnalyticsProvider>
                      <ProtectedRoute>
                        <Analytics />
                      </ProtectedRoute>
                    </AnalyticsProvider>
                  } />
                  <Route path="/data-integration" element={
                    <AnalyticsProvider>
                      <ProtectedRoute>
                        <DataIntegration />
                      </ProtectedRoute>
                    </AnalyticsProvider>
                  } />
                  <Route path="/your-full-guide-ai-marketing-analysis" element={<AIMarketingAnalysisBlog />} />
                  <Route path="/about" element={<AboutUs />} />
                  <Route path="/privacy-policy" element={<PrivacyPolicy />} />
                  <Route path="/terms-and-conditions" element={<TermsAndConditions />} />
                  <Route path="/success" element={
                    <ProtectedRoute>
                      <Success />
                    </ProtectedRoute>
                  } />
                  <Route path="/auth/google/callback" element={<GoogleCallback />} />
                  <Route path="/auth/google/callback/popup" element={<GoogleCallbackPopup />} />
                  <Route path="/auth/instagram/callback" element={<InstagramCallback />} />
                  <Route path="/auth/instagram/callback/popup" element={<InstagramCallbackPopup />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </AnalyticsProvider>
            </LastSyncProvider>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </HelmetProvider>
  </QueryClientProvider>
);

export default App;
