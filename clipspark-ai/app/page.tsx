"use client";

import { useState, useCallback } from "react";
import LandingPage from "@/components/LandingPage";
import OnboardingFlow from "@/components/OnboardingFlow";
import Sidebar, { type NavSection } from "@/components/Sidebar";
import PipelineView from "@/components/writers/PipelineView";
import LinkedInWriter from "@/components/writers/LinkedInWriter";
import TwitterWriter from "@/components/writers/TwitterWriter";
import BlogWriter from "@/components/writers/BlogWriter";
import SEOWriter from "@/components/writers/SEOWriter";
import GEOWriter from "@/components/writers/GEOWriter";
import EmailWriter from "@/components/writers/EmailWriter";
import AIWriterStudio from "@/components/writers/AIWriterStudio";
import AdCreativeGenerator from "@/components/marketing/AdCreativeGenerator";
import AdCreativeGallery from "@/components/marketing/AdCreativeGallery";
import CampaignManager from "@/components/marketing/CampaignManager";
import MetaCampaigns from "@/components/marketing/MetaCampaigns";
import GoogleCampaigns from "@/components/marketing/GoogleCampaigns";
import PerformanceAnalytics from "@/components/marketing/PerformanceAnalytics";
import OptimizationPanel from "@/components/marketing/OptimizationPanel";
import AlertsPanel from "@/components/marketing/AlertsPanel";
import PlatformConnector from "@/components/marketing/PlatformConnector";
import LandingPageBuilder from "@/components/marketing/LandingPageBuilder";

const SECTIONS: Record<NavSection, React.ComponentType> = {
  pipeline: PipelineView,
  linkedin: LinkedInWriter,
  twitter: TwitterWriter,
  blog: BlogWriter,
  seo: SEOWriter,
  geo: GEOWriter,
  email: EmailWriter,
  "ai-writer": AIWriterStudio,
  "ad-creatives": AdCreativeGenerator,
  "ad-gallery": AdCreativeGallery,
  campaigns: CampaignManager,
  "meta-campaigns": MetaCampaigns,
  "google-campaigns": GoogleCampaigns,
  analytics: PerformanceAnalytics,
  optimization: OptimizationPanel,
  alerts: AlertsPanel,
  integrations: PlatformConnector,
  "landing-pages": LandingPageBuilder,
};

export default function Home() {
  const [showDashboard, setShowDashboard] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [section, setSection] = useState<NavSection>("analytics");
  const [pendingTarget, setPendingTarget] = useState<string | undefined>();

  const handleEnter = (target?: string) => {
    setPendingTarget(target);
    setShowOnboarding(true);
  };

  const handleOnboardingComplete = useCallback(() => {
    if (pendingTarget && pendingTarget in SECTIONS) {
      setSection(pendingTarget as NavSection);
    }
    setShowOnboarding(false);
    setShowDashboard(true);
  }, [pendingTarget]);

  if (!showDashboard) {
    return (
      <>
        <LandingPage onEnter={handleEnter} />
        {showOnboarding && (
          <OnboardingFlow onComplete={handleOnboardingComplete} />
        )}
      </>
    );
  }

  const ActiveSection = SECTIONS[section];

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar active={section} onNavigate={setSection} alertCount={3} />
      <main className="flex-1 p-8 overflow-y-auto">
        <ActiveSection />
      </main>
    </div>
  );
}
