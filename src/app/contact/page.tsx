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
      <section className="shell max-w-3xl pt-36 pb-28 sm:pt-44">
        <Reveal y={14}>
          <p className="eyebrow flex items-center gap-3">
            Contact
          </p>
        </Reveal>
        <Reveal delay={0.08}>
          <h1 className="display mt-5 text-5xl sm:text-6xl">
            Get in <span className="text-gold-gradient italic">touch</span>
          </h1>
        </Reveal>
        <Reveal delay={0.14}>
          <p className="mt-5 max-w-xl text-[1.02rem] leading-relaxed text-mute">{copy.contact}</p>
        </Reveal>
        <Reveal delay={0.2} className="mt-14">
          <EnquiryForm />
        </Reveal>
      </section>
    </div>
  );
}
