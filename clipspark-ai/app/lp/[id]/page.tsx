"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";

interface LeadFormField {
  label: string;
  type: "text" | "email" | "number" | "tel" | "textarea";
  required: boolean;
}

interface BodySection {
  type: string;
  heading: string;
  content: string;
  items?: string[];
}

interface LandingPageData {
  id: string;
  headline: string;
  subheadline: string;
  hero_image_url: string | null;
  body_sections: BodySection[];
  lead_form_fields: LeadFormField[];
  cta_text: string;
  theme_color: string;
  product_service: string;
}

export default function PublicLandingPage() {
  const params = useParams();
  const [page, setPage] = useState<LandingPageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    if (!params.id) return;
    fetch(`/api/landing-pages/${params.id}`)
      .then((r) => {
        if (!r.ok) throw new Error("Not found");
        return r.json();
      })
      .then((d) => setPage(d.page))
      .catch(() => setError("Landing page not found"))
      .finally(() => setLoading(false));
  }, [params.id]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="w-10 h-10 border-4 border-blue-400 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !page) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <p className="text-6xl font-black text-gray-200 mb-3">404</p>
          <p className="text-gray-500 text-lg">{error || "Page not found"}</p>
        </div>
      </div>
    );
  }

  const color = page.theme_color || "#1a73e8";

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitting(true);
    const form = e.currentTarget;
    const formData: Record<string, string> = {};
    page.lead_form_fields.forEach((field) => {
      const el = form.elements.namedItem(field.label) as
        | HTMLInputElement
        | HTMLTextAreaElement
        | null;
      if (el) formData[field.label] = el.value;
    });
    try {
      await fetch(`/api/landing-pages/${params.id}/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ formData }),
      });
    } catch {
      /* show success anyway */
    }
    setSubmitting(false);
    setSubmitted(true);
  };

  const hasForm = page.lead_form_fields.length > 0;
  const featuresSections = page.body_sections.filter(
    (s) => s.type === "features" || s.type === "benefits",
  );
  const statsSections = page.body_sections.filter((s) => s.type === "stats");
  const testimonialSections = page.body_sections.filter(
    (s) => s.type === "testimonial",
  );
  const otherSections = page.body_sections.filter(
    (s) => !["features", "benefits", "stats", "testimonial"].includes(s.type),
  );

  return (
    <div
      className="min-h-screen bg-white"
      style={{ fontFamily: "'Inter', system-ui, -apple-system, sans-serif" }}
    >
      {/* Sticky nav */}
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled ? "bg-white/90 backdrop-blur-md shadow-sm" : "bg-transparent"
        }`}
      >
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <span className="text-lg font-bold text-gray-900">
            {page.product_service}
          </span>
          {hasForm && (
            <a
              href="#lead-form"
              className="px-5 py-2 rounded-full text-white text-sm font-semibold transition-all hover:opacity-90 shadow-md"
              style={{ backgroundColor: color }}
            >
              {page.cta_text}
            </a>
          )}
        </div>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden pt-24 pb-20 md:pt-32 md:pb-28">
        {/* Background decoration */}
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            background: `radial-gradient(circle at 30% 20%, ${color} 0%, transparent 50%), radial-gradient(circle at 70% 80%, ${color} 0%, transparent 50%)`,
          }}
        />
        <div
          className="absolute top-20 right-0 w-96 h-96 rounded-full opacity-[0.06] blur-3xl"
          style={{ backgroundColor: color }}
        />

        <div className="max-w-6xl mx-auto px-6 relative">
          <div
            className={`grid ${page.hero_image_url ? "md:grid-cols-2" : "md:grid-cols-1 text-center"} gap-12 md:gap-16 items-center`}
          >
            <div className={page.hero_image_url ? "" : "max-w-3xl mx-auto"}>
              <div
                className="inline-block px-4 py-1.5 rounded-full text-xs font-semibold mb-6 tracking-wide uppercase"
                style={{ backgroundColor: `${color}12`, color }}
              >
                {page.product_service}
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-gray-900 leading-[1.1] mb-6 tracking-tight">
                {page.headline}
              </h1>
              <p className="text-lg md:text-xl text-gray-500 leading-relaxed mb-10 max-w-xl">
                {page.subheadline}
              </p>
              <div className="flex items-center gap-4 flex-wrap">
                {hasForm && (
                  <a
                    href="#lead-form"
                    className="px-8 py-3.5 rounded-full text-white font-semibold text-sm shadow-lg hover:shadow-xl transition-all hover:-translate-y-0.5"
                    style={{ backgroundColor: color }}
                  >
                    {page.cta_text} →
                  </a>
                )}
                <a
                  href="#features"
                  className="px-8 py-3.5 rounded-full text-sm font-semibold border-2 transition-all hover:-translate-y-0.5"
                  style={{ borderColor: `${color}30`, color }}
                >
                  Learn More
                </a>
              </div>
            </div>
            {page.hero_image_url && (
              <div className="relative">
                <div
                  className="absolute -inset-4 rounded-3xl opacity-20 blur-2xl"
                  style={{ backgroundColor: color }}
                />
                <div className="relative rounded-2xl overflow-hidden shadow-2xl ring-1 ring-gray-200">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={page.hero_image_url}
                    alt={page.headline}
                    className="w-full h-auto object-cover"
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Features / Benefits */}
      {featuresSections.length > 0 && (
        <section id="features" className="py-20 md:py-28 bg-gray-50">
          <div className="max-w-6xl mx-auto px-6">
            {featuresSections.map((section, i) => (
              <div key={i} className={i > 0 ? "mt-20" : ""}>
                <div className="text-center mb-14">
                  <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                    {section.heading}
                  </h2>
                  {section.content && (
                    <p className="text-gray-500 text-lg max-w-2xl mx-auto leading-relaxed">
                      {section.content}
                    </p>
                  )}
                </div>
                {section.items && section.items.length > 0 && (
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {section.items.map((item, j) => {
                      const parts = item.split(" — ");
                      return (
                        <div
                          key={j}
                          className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md hover:-translate-y-0.5 transition-all"
                        >
                          <div
                            className="w-10 h-10 rounded-xl flex items-center justify-center mb-4 text-lg font-bold text-white"
                            style={{ backgroundColor: color }}
                          >
                            {j + 1}
                          </div>
                          {parts.length > 1 ? (
                            <>
                              <h3 className="text-sm font-semibold text-gray-900 mb-2">
                                {parts[0]}
                              </h3>
                              <p className="text-sm text-gray-500 leading-relaxed">
                                {parts[1]}
                              </p>
                            </>
                          ) : (
                            <p className="text-sm text-gray-700 leading-relaxed">
                              {item}
                            </p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Stats */}
      {statsSections.length > 0 && (
        <section className="py-20 md:py-24 bg-white">
          <div className="max-w-5xl mx-auto px-6">
            {statsSections.map((section, i) => (
              <div key={i} className={i > 0 ? "mt-16" : ""}>
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 text-center">
                  {section.heading}
                </h2>
                {section.content && (
                  <p className="text-gray-500 text-center mb-12 max-w-xl mx-auto">
                    {section.content}
                  </p>
                )}
                {section.items && (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                    {section.items.map((item, j) => (
                      <div
                        key={j}
                        className="text-center p-8 rounded-2xl bg-gray-50 border border-gray-100"
                      >
                        <p
                          className="text-3xl md:text-4xl font-extrabold mb-1"
                          style={{ color }}
                        >
                          {item}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Mid-page CTA banner */}
      {hasForm && (
        <section
          className="py-16"
          style={{
            background: `linear-gradient(135deg, ${color} 0%, ${color}dd 100%)`,
          }}
        >
          <div className="max-w-4xl mx-auto px-6 text-center">
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
              Ready to get started with {page.product_service}?
            </h2>
            <p className="text-white/80 mb-8 text-lg">
              Join thousands who already trust us. It only takes a minute.
            </p>
            <a
              href="#lead-form"
              className="inline-block px-10 py-4 bg-white rounded-full font-bold text-sm shadow-xl hover:shadow-2xl transition-all hover:-translate-y-0.5"
              style={{ color }}
            >
              {page.cta_text} — It&apos;s Free →
            </a>
          </div>
        </section>
      )}

      {/* Testimonials */}
      {testimonialSections.length > 0 && (
        <section className="py-20 md:py-24 bg-gray-50">
          <div className="max-w-4xl mx-auto px-6">
            {testimonialSections.map((section, i) => (
              <div key={i} className={i > 0 ? "mt-12" : ""}>
                <h2 className="text-3xl font-bold text-gray-900 mb-10 text-center">
                  {section.heading}
                </h2>
                <div className="bg-white rounded-3xl p-8 md:p-12 shadow-sm border border-gray-100 relative">
                  <div
                    className="absolute -top-4 left-8 text-6xl font-serif leading-none"
                    style={{ color: `${color}30` }}
                  >
                    &ldquo;
                  </div>
                  <blockquote className="text-lg md:text-xl text-gray-700 leading-relaxed italic relative z-10">
                    {section.content}
                  </blockquote>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Other sections */}
      {otherSections.map((section, i) => (
        <section
          key={i}
          className={`py-16 md:py-20 ${i % 2 === 0 ? "bg-white" : "bg-gray-50"}`}
        >
          <div className="max-w-5xl mx-auto px-6">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
              {section.heading}
            </h2>
            {section.content && (
              <p className="text-gray-500 mb-8 max-w-2xl leading-relaxed text-lg">
                {section.content}
              </p>
            )}
            {section.items && section.items.length > 0 && (
              <div className="grid md:grid-cols-2 gap-4">
                {section.items.map((item, j) => (
                  <div
                    key={j}
                    className="p-5 rounded-xl bg-white border border-gray-100 shadow-sm"
                  >
                    <p className="text-gray-700 text-sm leading-relaxed">
                      {item}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      ))}

      {/* Lead form */}
      {hasForm && (
        <section
          id="lead-form"
          className="py-20 md:py-28 relative overflow-hidden"
        >
          <div
            className="absolute inset-0 opacity-[0.03]"
            style={{
              background: `radial-gradient(circle at 50% 50%, ${color} 0%, transparent 70%)`,
            }}
          />
          <div className="max-w-lg mx-auto px-6 relative">
            <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-10 border border-gray-100">
              <div className="text-center mb-8">
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4"
                  style={{ backgroundColor: `${color}10` }}
                >
                  <svg
                    className="w-7 h-7"
                    style={{ color }}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={1.5}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75"
                    />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Get Started Today
                </h2>
                <p className="text-sm text-gray-500">
                  Fill in your details and we&apos;ll be in touch shortly
                </p>
              </div>

              {submitted ? (
                <div className="text-center py-10">
                  <div
                    className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-5"
                    style={{ backgroundColor: `${color}10` }}
                  >
                    <svg
                      className="w-8 h-8"
                      style={{ color }}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2.5}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </div>
                  <p className="text-xl font-bold text-gray-900">Thank you!</p>
                  <p className="text-gray-500 mt-2">
                    We&apos;ll get back to you soon.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  {page.lead_form_fields.map((field, i) => (
                    <div key={i}>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        {field.label}
                        {field.required && (
                          <span className="text-red-500 ml-0.5">*</span>
                        )}
                      </label>
                      {field.type === "textarea" ? (
                        <textarea
                          name={field.label}
                          required={field.required}
                          rows={3}
                          className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:border-transparent outline-none resize-none bg-gray-50 focus:bg-white transition-colors"
                        />
                      ) : (
                        <input
                          name={field.label}
                          type={field.type}
                          required={field.required}
                          className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:border-transparent outline-none bg-gray-50 focus:bg-white transition-colors"
                        />
                      )}
                    </div>
                  ))}
                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full py-3.5 rounded-xl text-white font-semibold text-sm shadow-lg hover:shadow-xl transition-all disabled:opacity-60 hover:-translate-y-0.5"
                    style={{ backgroundColor: color }}
                  >
                    {submitting ? "Submitting..." : page.cta_text}
                  </button>
                  <p className="text-xs text-gray-400 text-center">
                    No spam. Unsubscribe anytime.
                  </p>
                </form>
              )}
            </div>
          </div>
        </section>
      )}

      {/* Bottom CTA */}
      {hasForm && (
        <section className="py-20 bg-gray-900 text-center">
          <div className="max-w-3xl mx-auto px-6">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Don&apos;t miss out
            </h2>
            <p className="text-gray-400 text-lg mb-8">
              Take the first step today. Your future self will thank you.
            </p>
            <a
              href="#lead-form"
              className="inline-block px-10 py-4 rounded-full text-sm font-bold shadow-xl hover:shadow-2xl transition-all hover:-translate-y-0.5"
              style={{ backgroundColor: color, color: "#fff" }}
            >
              {page.cta_text} →
            </a>
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="py-8 px-6 bg-gray-950 text-center border-t border-gray-800">
        <p className="text-gray-500 text-xs">
          © {new Date().getFullYear()} {page.product_service} · Powered by
          ClickSpark AI
        </p>
      </footer>
    </div>
  );
}
