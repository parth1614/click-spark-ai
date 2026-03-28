"use client";

import { useState } from "react";
import LandingPage from "@/components/LandingPage";
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
import CampaignManager from "@/components/marketing/CampaignManager";
import MetaCampaigns from "@/components/marketing/MetaCampaigns";
import GoogleCampaigns from "@/components/marketing/GoogleCampaigns";
import PerformanceAnalytics from "@/components/marketing/PerformanceAnalytics";
import OptimizationPanel from "@/components/marketing/OptimizationPanel";
import AlertsPanel from "@/components/marketing/AlertsPanel";
import PlatformConnector from "@/components/marketing/PlatformConnector";

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
  campaigns: CampaignManager,
  "meta-campaigns": MetaCampaigns,
  "google-campaigns": GoogleCampaigns,
  analytics: PerformanceAnalytics,
  optimization: OptimizationPanel,
  alerts: AlertsPanel,
  integrations: PlatformConnector,
};

export default function Home() {
  const [showDashboard, setShowDashboard] = useState(false);
  const [section, setSection] = useState<NavSection>("analytics");

  const handleEnter = (target?: string) => {
    if (target && target in SECTIONS) {
      setSection(target as NavSection);
    }
    setShowDashboard(true);
  };

  if (!showDashboard) {
    return <LandingPage onEnter={handleEnter} />;
  }

  const ActiveSection = SECTIONS[section];

  return (
    <div className="flex min-h-screen">
      <Sidebar active={section} onNavigate={setSection} alertCount={3} />
      <main className="flex-1 p-8 overflow-y-auto">
        <ActiveSection />
      </main>
    </div>
  );
}
