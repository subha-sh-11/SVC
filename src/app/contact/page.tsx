import type { Metadata } from "next";
import { EnquiryForm } from "@/components/contact/EnquiryForm";
import { Reveal } from "@/components/ui/motion";
import { copy } from "@/data/site";

export const metadata: Metadata = {
  title: "Contact",
  description: copy.contact,
};

/** Contact: a heading and the enquiry form, nothing else. */
export default function ContactPage() {
  return (
    <div className="theme-light type-classic bg-white" data-header-theme="light">
      <section className="shell max-w-3xl pt-28 pb-20 max-sm:pt-7 max-sm:pb-8 sm:pt-44 sm:pb-28">
        {/* Phones: a clean top */}
        <div className="sm:hidden">
          <h1 className="font-display text-[2.2rem] leading-none text-[#2a1408]">Contact</h1>
          <p className="mt-2 text-[0.8rem] leading-relaxed text-[#8a6a52]">{copy.contact}</p>
        </div>
        <Reveal y={14} className="max-sm:hidden">
          <p className="eyebrow flex items-center gap-3">
            Contact
          </p>
        </Reveal>
        <Reveal delay={0.08} className="max-sm:hidden">
          <h1 className="display mt-5 text-5xl sm:text-6xl">
            Get in <span className="text-gold-gradient italic">touch</span>
          </h1>
        </Reveal>
        <Reveal delay={0.14} className="max-sm:hidden">
          <p className="mt-5 max-w-xl text-[1.02rem] leading-relaxed text-mute">{copy.contact}</p>
        </Reveal>
        <Reveal delay={0.2} className="mt-14 max-sm:mt-6">
          <EnquiryForm />
        </Reveal>
      </section>
    </div>
  );
}
