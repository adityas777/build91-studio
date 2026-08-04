'use client';

import { useState, type FormEvent } from 'react';
import { motion } from 'framer-motion';
import { ArrowUpRight, Check, Loader2 } from 'lucide-react';
import { PROJECT_TYPES } from '@/lib/constants';

type Status = 'idle' | 'submitting' | 'success' | 'error';

export function ContactForm() {
  const [status, setStatus] = useState<Status>('idle');
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    projectType: '',
    message: '',
  });

  function update<K extends keyof typeof form>(key: K, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) return;
    setStatus('submitting');
    // No backend wired yet — simulate the submission so the UI is testable.
    await new Promise((r) => setTimeout(r, 900));
    setStatus('success');
    setForm({
      name: '',
      email: '',
      phone: '',
      company: '',
      projectType: '',
      message: '',
    });
  }

  return (
    <form
      onSubmit={onSubmit}
      className="space-y-5 rounded-3xl border border-white/10 bg-white/[0.03] p-7 backdrop-blur-xl md:p-9"
    >
      <div className="grid gap-5 sm:grid-cols-2">
        <Field
          label="Full Name"
          required
          value={form.name}
          onChange={(v) => update('name', v)}
          type="text"
          name="name"
        />
        <Field
          label="Email"
          required
          value={form.email}
          onChange={(v) => update('email', v)}
          type="email"
          name="email"
        />
        <Field
          label="Phone"
          value={form.phone}
          onChange={(v) => update('phone', v)}
          type="tel"
          name="phone"
        />
        <Field
          label="Company / Developer Name"
          value={form.company}
          onChange={(v) => update('company', v)}
          type="text"
          name="company"
        />
      </div>

      <div>
        <label className="mb-2 block text-xs font-medium uppercase tracking-[0.2em] text-white/60">
          Project Type
        </label>
        <select
          name="projectType"
          value={form.projectType}
          onChange={(e) => update('projectType', e.target.value)}
          className="w-full rounded-xl border border-white/10 bg-ink-900/60 px-4 py-3 text-sm text-white placeholder-white/30 transition-colors focus:border-violet-glow/50 focus:outline-none focus:ring-2 focus:ring-violet-glow/30"
        >
          <option value="" className="bg-ink-900">
            Select a project type
          </option>
          {PROJECT_TYPES.map((t) => (
            <option key={t} value={t} className="bg-ink-900">
              {t}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="mb-2 block text-xs font-medium uppercase tracking-[0.2em] text-white/60">
          Tell us about your project <span className="text-violet-soft">*</span>
        </label>
        <textarea
          name="message"
          required
          rows={5}
          value={form.message}
          onChange={(e) => update('message', e.target.value)}
          placeholder="Project name, launch timeline, what you need..."
          className="w-full resize-none rounded-xl border border-white/10 bg-ink-900/60 px-4 py-3 text-sm text-white placeholder-white/30 transition-colors focus:border-violet-glow/50 focus:outline-none focus:ring-2 focus:ring-violet-glow/30"
        />
      </div>

      <div className="flex flex-col items-start gap-4 pt-2 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs text-white/40">
          We&rsquo;ll get back to you within one business day.
        </p>
        <button
          type="submit"
          disabled={status === 'submitting'}
          className="btn-primary group min-w-[180px] justify-center disabled:cursor-not-allowed disabled:opacity-70"
        >
          {status === 'submitting' ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Sending...
            </>
          ) : status === 'success' ? (
            <>
              <Check className="h-4 w-4" />
              Message Sent
            </>
          ) : (
            <>
              Send Message
              <ArrowUpRight className="h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
            </>
          )}
        </button>
      </div>

      {status === 'success' && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-xl border border-violet-glow/40 bg-violet-glow/10 p-4 text-sm text-violet-soft"
        >
          Thanks — your message is in our inbox. We&rsquo;ll be in touch shortly.
        </motion.div>
      )}
    </form>
  );
}

function Field(props: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type: string;
  name: string;
  required?: boolean;
}) {
  return (
    <div>
      <label className="mb-2 block text-xs font-medium uppercase tracking-[0.2em] text-white/60">
        {props.label}
        {props.required && <span className="ml-1 text-violet-soft">*</span>}
      </label>
      <input
        type={props.type}
        name={props.name}
        required={props.required}
        value={props.value}
        onChange={(e) => props.onChange(e.target.value)}
        className="w-full rounded-xl border border-white/10 bg-ink-900/60 px-4 py-3 text-sm text-white placeholder-white/30 transition-colors focus:border-violet-glow/50 focus:outline-none focus:ring-2 focus:ring-violet-glow/30"
      />
    </div>
  );
}
