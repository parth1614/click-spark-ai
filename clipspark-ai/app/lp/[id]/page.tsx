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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-8 h-8 border-4 border-blue-400 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !page) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-4xl font-bold text-gray-300 mb-2">404</p>
          <p className="text-gray-500">{error || "Page not found"}</p>
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
      // still show success to the visitor
    }

    setSubmitting(false);
    setSubmitted(true);
  };

  return (
    <div
      className="min-h-screen bg-white"
      style={{ fontFamily: "system-ui, -apple-system, sans-serif" }}
    >
      {/* Hero */}
      <section
        className="relative overflow-hidden"
        style={{
          background: `linear-gradient(135deg, ${color}11 0%, ${color}05 100%)`,
        }}
      >
        <div className="max-w-5xl mx-auto px-6 py-20 md:py-28">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 leading-tight mb-4">
                {page.headline}
              </h1>
              <p className="text-lg text-gray-600 leading-relaxed mb-8">
                {page.subheadline}
              </p>
              <a
                href="#lead-form"
                className="inline-block px-8 py-3 rounded-full text-white font-semibold text-sm shadow-lg hover:shadow-xl transition-all"
                style={{ backgroundColor: color }}
              >
                {page.cta_text}
              </a>
            </div>
            {page.hero_image_url && (
              <div className="rounded-2xl overflow-hidden shadow-2xl">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={page.hero_image_url}
                  alt={page.headline}
                  className="w-full h-auto object-cover"
                />
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Body sections */}
      {page.body_sections.map((section, i) => (
        <section
          key={i}
          className={`py-16 px-6 ${i % 2 === 0 ? "bg-white" : "bg-gray-50"}`}
        >
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">
              {section.heading}
            </h2>
            {section.content && (
              <p className="text-gray-600 mb-8 max-w-2xl leading-relaxed">
                {section.content}
              </p>
            )}
            {section.items && section.items.length > 0 && (
              <div
                className={`grid gap-4 ${
                  section.type === "stats"
                    ? "grid-cols-2 md:grid-cols-3"
                    : "grid-cols-1 md:grid-cols-2"
                }`}
              >
                {section.items.map((item, j) => (
                  <div
                    key={j}
                    className={`p-4 rounded-xl ${
                      section.type === "stats"
                        ? "text-center bg-white border border-gray-200 shadow-sm"
                        : "bg-white border border-gray-100 shadow-sm"
                    }`}
                  >
                    {section.type === "stats" ? (
                      <p className="text-2xl font-bold" style={{ color }}>
                        {item}
                      </p>
                    ) : (
                      <p className="text-gray-700 text-sm leading-relaxed">
                        {item}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
            {section.type === "testimonial" && !section.items?.length && (
              <blockquote
                className="border-l-4 pl-6 py-2 italic text-gray-600 text-lg"
                style={{ borderColor: color }}
              >
                {section.content}
              </blockquote>
            )}
          </div>
        </section>
      ))}

      {/* Lead form */}
      {page.lead_form_fields.length > 0 && (
        <section
          id="lead-form"
          className="py-20 px-6"
          style={{
            background: `linear-gradient(135deg, ${color}08 0%, ${color}15 100%)`,
          }}
        >
          <div className="max-w-lg mx-auto">
            <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
              <h2 className="text-2xl font-bold text-gray-900 mb-2 text-center">
                Get Started Today
              </h2>
              <p className="text-sm text-gray-500 text-center mb-6">
                Fill in your details and we&apos;ll be in touch
              </p>

              {submitted ? (
                <div className="text-center py-8">
                  <div
                    className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4"
                    style={{ backgroundColor: `${color}15` }}
                  >
                    <svg
                      className="w-7 h-7"
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
                  <p className="text-lg font-semibold text-gray-900">
                    Thank you!
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    We&apos;ll get back to you soon.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  {page.lead_form_fields.map((field, i) => (
                    <div key={i}>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
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
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:border-transparent outline-none resize-none"
                          style={
                            { focusRingColor: color } as React.CSSProperties
                          }
                        />
                      ) : (
                        <input
                          name={field.label}
                          type={field.type}
                          required={field.required}
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:border-transparent outline-none"
                          style={
                            { focusRingColor: color } as React.CSSProperties
                          }
                        />
                      )}
                    </div>
                  ))}
                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full py-3 rounded-xl text-white font-semibold text-sm shadow-lg hover:shadow-xl transition-all disabled:opacity-60"
                    style={{ backgroundColor: color }}
                  >
                    {submitting ? "Submitting..." : page.cta_text}
                  </button>
                </form>
              )}
            </div>
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="py-8 px-6 bg-gray-900 text-center">
        <p className="text-gray-400 text-xs">Powered by ClickSpark AI</p>
      </footer>
    </div>
  );
}
