"use client";

import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState, type FormEvent, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { PrimaryButton } from "@/components/ui/Buttons";

const CATEGORIES = ["Production", "Distribution", "Media & press", "Other"] as const;

type Status = "idle" | "sending" | "sent" | "error";

export function EnquiryForm() {
  const [category, setCategory] = useState<(typeof CATEGORIES)[number]>("Production");
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);
  // The contact page's route cards choose the enquiry type for the visitor.
  useEffect(() => {
    const onPick = (e: Event) => {
      const c = (e as CustomEvent<string>).detail;
      if ((CATEGORIES as readonly string[]).includes(c)) setCategory(c as (typeof CATEGORIES)[number]);
    };
    window.addEventListener("svc:enquiry", onPick);
    return () => window.removeEventListener("svc:enquiry", onPick);
  }, []);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = Object.fromEntries(new FormData(form)) as Record<string, string>;
    setStatus("sending");
    setError(null);
    try {
      const res = await fetch("/api/enquiry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, category }),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(body.error ?? "Something went wrong. Please try again.");
      setStatus("sent");
      form.reset();
    } catch (err) {
      setStatus("error");
      setError(err instanceof Error ? err.message : "Something went wrong.");
    }
  }

  return (
    <div className="relative">
      <AnimatePresence mode="wait">
        {status === "sent" ? (
          <motion.div key="sent" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="rounded-[2px] border border-gold/40 bg-gold/[0.05] p-10">
            <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 300, damping: 18, delay: 0.1 }} className="grid h-14 w-14 place-items-center rounded-full bg-gold text-xl text-ink">
              ✓
            </motion.span>
            <h3 className="display mt-6 text-4xl">Thank you.</h3>
            <p className="mt-3 max-w-md text-mute">Your {category.toLowerCase()} enquiry has been received.</p>
            <button onClick={() => setStatus("idle")} className="mt-8 text-[max(0.65rem,9px)] font-bold tracking-[0.2em] text-gold uppercase hover:text-gold-bright">
              Send another →
            </button>
          </motion.div>
        ) : (
          <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, y: -10 }}>
            {/* Wide screens: chips for the enquiry type, fields with labels that float up */}
            <form onSubmit={onSubmit} className="space-y-8 max-sm:hidden sm:space-y-10">
              <fieldset>
                <legend className="text-[max(0.62rem,9px)] font-bold tracking-[0.2em] text-dim uppercase">Enquiry type</legend>
                <div className="mt-4 flex flex-wrap gap-2">
                  {CATEGORIES.map((c) => (
                    <button
                      type="button"
                      key={c}
                      onClick={() => setCategory(c)}
                      aria-pressed={category === c}
                      className={cn("rounded-full border px-4 py-2 text-xs font-semibold transition", category === c ? "border-gold bg-gold text-ink" : "border-gold/25 text-paper/75 hover:border-paper/40")}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </fieldset>
              <div className="grid gap-7 sm:grid-cols-2 sm:gap-10">
                <Field name="name" label="Your name" autoComplete="name" required />
                <Field name="email" label="Email" type="email" autoComplete="email" required />
                <Field name="organisation" label="Organisation (optional)" autoComplete="organization" />
                <Field name="phone" label="Phone (optional)" type="tel" autoComplete="tel" />
              </div>
              <Field name="message" label="Message" textarea required />
              {/* Honeypot for bots */}
              <input type="text" name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden="true" />
              <div className="flex flex-wrap items-center gap-6">
                <PrimaryButton type="submit" disabled={status === "sending"}>
                  {status === "sending" ? "Sending…" : "Send Enquiry"}
                </PrimaryButton>
                {error && <p className="text-sm text-[#ffb3ab]">{error}</p>}
              </div>
            </form>

            {/* Phones: a plain, compact form; labels above slim fields, the enquiry type a dropdown */}
            <form onSubmit={onSubmit} className="space-y-4 sm:hidden">
              <PhoneField label="Enquiry type">
                <span className="relative block">
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as (typeof CATEGORIES)[number])}
                    className={cn(PHONE_INPUT, "appearance-none pr-10")}
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                  <svg viewBox="0 0 16 16" className="pointer-events-none absolute top-1/2 right-3.5 h-3.5 w-3.5 -translate-y-1/2 text-[#8a6a52]" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="m4 6 4 4 4-4" />
                  </svg>
                </span>
              </PhoneField>
              <PhoneField label="Your name" required>
                <input name="name" required autoComplete="name" className={PHONE_INPUT} />
              </PhoneField>
              <PhoneField label="Email" required>
                <input name="email" type="email" required autoComplete="email" className={PHONE_INPUT} />
              </PhoneField>
              <div className="grid grid-cols-2 gap-3">
                <PhoneField label="Organisation">
                  <input name="organisation" autoComplete="organization" className={PHONE_INPUT} />
                </PhoneField>
                <PhoneField label="Phone">
                  <input name="phone" type="tel" autoComplete="tel" className={PHONE_INPUT} />
                </PhoneField>
              </div>
              <PhoneField label="Message" required>
                <textarea name="message" required rows={4} className={cn(PHONE_INPUT, "h-auto resize-none py-2.5")} />
              </PhoneField>
              {/* Honeypot for bots */}
              <input type="text" name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden="true" />
              <button type="submit" disabled={status === "sending"} className="mt-1 h-12 w-full rounded-xl bg-[#2a1408] text-[0.86rem] font-semibold text-white disabled:opacity-60">
                {status === "sending" ? "Sending…" : "Send enquiry"}
              </button>
              {error && <p className="text-[0.82rem] text-[#b3261e]">{error}</p>}
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function Field({ name, label, type = "text", textarea, required, autoComplete }: { name: string; label: string; type?: string; textarea?: boolean; required?: boolean; autoComplete?: string }) {
  const cls =
    "peer w-full border-b border-paper/20 bg-transparent pt-6 pb-2.5 text-base text-paper outline-none transition-colors placeholder:text-transparent focus:border-gold";
  return (
    <label className="relative block">
      {textarea ? (
        <textarea name={name} required={required} rows={5} placeholder={label} className={cn(cls, "resize-none")} />
      ) : (
        <input name={name} type={type} required={required} autoComplete={autoComplete} placeholder={label} className={cls} />
      )}
      <span className="pointer-events-none absolute top-0 left-0 text-[max(0.65rem,9px)] font-bold tracking-[0.18em] text-gold uppercase transition-all duration-300 peer-placeholder-shown:top-6 peer-placeholder-shown:text-base peer-placeholder-shown:font-normal peer-placeholder-shown:tracking-normal peer-placeholder-shown:text-dim peer-placeholder-shown:normal-case peer-focus:top-0 peer-focus:text-[max(0.65rem,9px)] peer-focus:font-bold peer-focus:tracking-[0.18em] peer-focus:text-gold peer-focus:uppercase">
        {label}
        {required && " *"}
      </span>
    </label>
  );
}

/** Phones: one slim field style for every input. */
const PHONE_INPUT =
  "block h-11 w-full rounded-xl border border-[#e6dccf] bg-white px-3.5 text-[0.92rem] text-[#2a1408] outline-none transition-colors focus:border-saffron-deep focus:ring-2 focus:ring-saffron-deep/15";

/** Phones: a field with its label above it. */
function PhoneField({ label, required, children }: { label: string; required?: boolean; children: ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[0.74rem] font-medium text-[#6f4b2f]">
        {label}
        {required && <span className="text-saffron-deep"> *</span>}
      </span>
      {children}
    </label>
  );
}
