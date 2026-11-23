import { PrimaryButton, GhostButton } from "@/components/ui/Buttons";
import { SplitWords } from "@/components/ui/motion";

export default function NotFound() {
  return (
    <section className="relative flex min-h-[90svh] items-center overflow-hidden">
      <span className="display pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[40vw] leading-none text-paper/[0.03]">404</span>
      <div className="shell relative text-center">
        <p className="eyebrow">Scene missing</p>
        <SplitWords as="h1" text="The reel ends here." italicWords={["ends"]} className="display mt-6 block text-5xl sm:text-7xl" />
        <p className="mx-auto mt-6 max-w-md text-mute">The page you were looking for isn&apos;t in the archive.</p>
        <div className="mt-10 flex flex-wrap justify-center gap-4">
          <PrimaryButton href="/">Back to home</PrimaryButton>
          <GhostButton href="/films">Explore Our Films</GhostButton>
        </div>
      </div>
    </section>
  );
}
