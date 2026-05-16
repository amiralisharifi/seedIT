'use client';

import { useState } from 'react';

export default function ContactForm() {
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const form = e.currentTarget;
    const data = Object.fromEntries(new FormData(form));

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const json = await res.json() as { error?: string };
        throw new Error(json.error ?? 'Something went wrong');
      }
      setSubmitted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="form-card reveal">
      <h3>Start a project</h3>
      <p className="form-sub">Quick form — takes under 60 seconds.</p>

      {submitted ? (
        <div className="form-success show">✓ Message sent. We&apos;ll be in touch within 24 hours.</div>
      ) : (
        <form onSubmit={handleSubmit} noValidate>
          <div className="form-row-2">
            <div className="form-row">
              <label htmlFor="name">Your name</label>
              <input type="text" id="name" name="name" required placeholder="Full name" />
            </div>
            <div className="form-row">
              <label htmlFor="company">Company</label>
              <input type="text" id="company" name="company" placeholder="(optional)" />
            </div>
          </div>

          <div className="form-row-2">
            <div className="form-row">
              <label htmlFor="email">Email</label>
              <input type="email" id="email" name="email" required placeholder="you@company.com" />
            </div>
            <div className="form-row">
              <label htmlFor="phone">Phone / WhatsApp</label>
              <input type="tel" id="phone" name="phone" placeholder="+971 ..." />
            </div>
          </div>

          <div className="form-row">
            <label htmlFor="service">Project type</label>
            <select id="service" name="service" required defaultValue="">
              <option value="" disabled>Select one</option>
              <option value="web">Website / Web app</option>
              <option value="automation">Automation / AI workflows</option>
              <option value="design">Design / Branding</option>
              <option value="full">Full digital build</option>
              <option value="other">Something else</option>
            </select>
          </div>

          <div className="form-row">
            <label htmlFor="message">Tell us about your project</label>
            <textarea
              id="message"
              name="message"
              rows={3}
              placeholder="A few sentences is enough — what you're trying to solve, any deadlines, rough budget if known."
            />
          </div>

          {error && (
            <p style={{ color: '#ef4444', fontSize: '0.875rem', marginBottom: '0.5rem' }}>{error}</p>
          )}

          <button type="submit" className="form-submit" disabled={loading}>
            {loading ? 'Sending…' : 'Send message'}
            {!loading && <span>→</span>}
          </button>

          <p className="form-note">We reply within 1 business day · Your info stays private</p>
        </form>
      )}
    </div>
  );
}
