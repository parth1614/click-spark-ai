"use client";

import { useState } from "react";
import {
  Zap,
  Briefcase,
  MessageCircle,
  FileText,
  Search,
  Bot,
  Mail,
  Sparkles,
  Palette,
  BarChart3,
  TrendingUp,
  Bell,
  Settings,
  Radio,
  Image,
  Globe,
  Menu,
  X,
  type LucideIcon,
} from "lucide-react";

export type NavSection =
  | "pipeline"
  | "linkedin"
  | "twitter"
  | "blog"
  | "seo"
  | "geo"
  | "email"
  | "ai-writer"
  | "ad-creatives"
  | "ad-gallery"
  | "campaigns"
  | "meta-campaigns"
  | "google-campaigns"
  | "analytics"
  | "optimization"
  | "alerts"
  | "integrations"
  | "landing-pages";

interface NavGroup {
  title: string;
  items: { id: NavSection; label: string; Icon: LucideIcon }[];
}

const NAV_GROUPS: NavGroup[] = [
  {
    title: "Marketing Engine",
    items: [
      { id: "analytics", label: "Analytics", Icon: TrendingUp },
      { id: "meta-campaigns", label: "Meta Ads (Live)", Icon: Radio },
      { id: "google-campaigns", label: "Google Ads (Live)", Icon: Search },
      { id: "ad-creatives", label: "Ad Creatives", Icon: Palette },
      { id: "ad-gallery", label: "Creatives Gallery", Icon: Image },
      { id: "landing-pages", label: "Landing Pages", Icon: Globe },
      { id: "campaigns", label: "Campaigns", Icon: BarChart3 },
      { id: "alerts", label: "Alerts", Icon: Bell },
      { id: "integrations", label: "Integrations", Icon: Settings },
    ],
  },
  {
    title: "Content Factory",
    items: [
      { id: "pipeline", label: "Content Pipeline", Icon: Zap },
      { id: "linkedin", label: "LinkedIn Writer", Icon: Briefcase },
      { id: "twitter", label: "X / Twitter Writer", Icon: MessageCircle },
      { id: "blog", label: "Blog Writer", Icon: FileText },
      { id: "seo", label: "SEO Article Writer", Icon: Search },
      { id: "geo", label: "GEO Optimizer", Icon: Bot },
      { id: "email", label: "Email Writer", Icon: Mail },
      { id: "ai-writer", label: "AI Writer Studio", Icon: Sparkles },
    ],
  },
];

interface SidebarProps {
  active: NavSection;
  onNavigate: (section: NavSection) => void;
  alertCount?: number;
}

export default function Sidebar({
  active,
  onNavigate,
  alertCount,
}: SidebarProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  const NavContent = () => (
    <>
      <div className="mb-6">
        <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
          <Zap className="w-5 h-5 text-yellow-600" /> ClickSpark AI
        </h1>
        <p className="text-xs text-gray-500 mt-1">
          AI Content & Marketing Factory
        </p>
      </div>
      <nav className="flex-1 space-y-6 overflow-y-auto">
        {NAV_GROUPS.map((group) => (
          <div key={group.title}>
            <p className="text-[10px] uppercase tracking-wider text-gray-500 mb-2 px-3">
              {group.title}
            </p>
            <div className="space-y-0.5">
              {group.items.map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    onNavigate(item.id);
                    setMobileOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors text-left ${
                    active === item.id
                      ? "bg-blue-50 text-blue-700 font-medium"
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                  }`}
                >
                  <item.Icon className="w-4 h-4" />
                  <span className="flex-1">{item.label}</span>
                  {item.id === "alerts" && alertCount && alertCount > 0 ? (
                    <span className="px-1.5 py-0.5 bg-red-600 text-white text-[10px] rounded-full min-w-[18px] text-center">
                      {alertCount}
                    </span>
                  ) : null}
                </button>
              ))}
            </div>
          </div>
        ))}
      </nav>
      <div className="pt-4 border-t border-gray-200 text-xs text-gray-500">
        One topic → 50+ content pieces
      </div>
    </>
  );

  return (
    <>
      {/* Mobile burger button */}
      <button
        onClick={() => setMobileOpen(true)}
        className="md:hidden fixed top-4 left-4 z-40 p-2 bg-white rounded-lg shadow-lg border border-gray-200"
        aria-label="Open menu"
      >
        <Menu className="w-5 h-5 text-gray-900" />
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/50 z-50"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile sidebar */}
      <aside
        className={`md:hidden fixed top-0 left-0 h-screen w-64 bg-white border-r border-gray-200 p-4 flex flex-col z-50 transition-transform duration-300 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <button
          onClick={() => setMobileOpen(false)}
          className="absolute top-4 right-4 p-1"
        >
          <X className="w-5 h-5 text-gray-600" />
        </button>
        <NavContent />
      </aside>

      {/* Desktop sidebar */}
      <aside className="hidden md:flex w-64 bg-white border-r border-gray-200 h-screen sticky top-0 p-4 flex-col shrink-0">
        <NavContent />
      </aside>
    </>
  );
}
