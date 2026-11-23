"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState, type MouseEvent, type RefObject } from "react";
import { nav } from "@/data/site";
import { cn } from "@/lib/utils";
import { useIntroDone } from "@/components/providers/IntroProvider";
import { useLenis } from "@/components/providers/SmoothScroll";

export function Logo({ compact = false, onLight = false, onSaffron = false }: { compact?: boolean; onLight?: boolean; onSaffron?: boolean }) {
  return (
    <span className="flex items-center gap-3">
      <Image
        src="/brand/svc-deity.png"
        alt=""
        width={606}
        height={906}
        loading="eager"
        className={cn("h-11 w-auto transition-[filter] duration-700", onSaffron ? "drop-shadow-[0_2px_8px_rgba(70,18,0,0.55)]" : "drop-shadow-[0_0_14px_rgba(232,181,58,0.35)]")}
      />
      {/* "SVC" in gold, cut from the same Playfair letters as the intro */}
      <span
        aria-hidden="true"
        className={cn("svc-mark block h-7 aspect-[2003/736]", onSaffron ? "svc-mark--saffron" : onLight && "svc-mark--light", compact && "max-sm:hidden")}
      />
      <span className="sr-only">Sri Venkateswara Creations</span>
    </span>
  );
}

// Three grey bars that fold into a cross.
function MenuIcon({ open }: { open: boolean }) {
  return (
    <span className="relative grid h-6 w-7 place-items-center" aria-hidden="true">
      <motion.span className="absolute h-[2px] w-7 rounded-full bg-current" animate={open ? { rotate: 45, y: 0 } : { rotate: 0, y: -8 }} />
      <motion.span className="absolute h-[2px] w-7 rounded-full bg-current" animate={{ opacity: open ? 0 : 1 }} />
      <motion.span className="absolute h-[2px] w-7 rounded-full bg-current" animate={open ? { rotate: -45, y: 0 } : { rotate: 0, y: 8 }} />
    </span>
  );
}

const MENU = [{ href: "/", label: "Home" }, ...nav];

/**
 * Whether what lies behind an element (fixed over the page) is light or dark, from the nearest
 * `data-header-theme` mark under its centre. Unmarked ground is the site's dark ink. It is read on
 * scroll and resize, and a couple of times a second for things that change on their own.
 */
function useToneBehind(ref: RefObject<HTMLElement | null>, ignore: RefObject<HTMLElement | null>, pathname: string) {
  const [tone, setTone] = useState<"light" | "dark">("light");
  useEffect(() => {
    let raf = 0;
    const read = () => {
      raf = 0;
      const box = ref.current?.getBoundingClientRect();
      if (!box) return;
      let next: "light" | "dark" = "dark";
      for (const el of document.elementsFromPoint(box.left + box.width / 2, box.top + box.height / 2)) {
        if (ref.current?.contains(el) || ignore.current?.contains(el)) continue;
        const mark = el.closest("[data-header-theme]");
        if (mark) {
          next = mark.getAttribute("data-header-theme") === "dark" ? "dark" : "light";
          break;
        }
      }
      setTone(next);
    };
    const schedule = () => {
      if (!raf) raf = requestAnimationFrame(read);
    };
    schedule();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    const timer = window.setInterval(schedule, 400);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      window.clearInterval(timer);
    };
  }, [ref, ignore, pathname]);
  return tone;
}

/**
 * The chrome: the banner's mark in the top-left corner (back to home), and the pages in a single
 * line in the top-right corner. On desktop the line is always shown; on phones and tablets a grey
 * menu button slides it out to its left.
 */
export function Header() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const navRef = useRef<HTMLElement>(null);
  const introDone = useIntroDone();
  const lenis = useLenis();
  const logoRef = useRef<HTMLDivElement>(null);
  const hoverClose = useRef<number | undefined>(undefined);
  const dark = useToneBehind(logoRef, navRef, pathname) === "dark";
  // The desktop links sit straight on the page, so they follow what's behind them too.
  const navDark = useToneBehind(navRef, logoRef, pathname) === "dark";

  useEffect(() => setOpen(false), [pathname]);

  // Close on Escape or a click anywhere else.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    const onDown = (e: PointerEvent) => {
      if (navRef.current && !navRef.current.contains(e.target as Node)) setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    window.addEventListener("pointerdown", onDown);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("pointerdown", onDown);
    };
  }, [open]);

  const isActive = (href: string) => (href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(href + "/"));

  // Already home: glide back to the top instead of reloading the page.
  const toTop = (e: MouseEvent<HTMLAnchorElement>) => {
    if (pathname !== "/") return;
    e.preventDefault();
    if (lenis) lenis.scrollTo(0, { duration: 1.4 });
    else window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <>
    {/* Home: Lord Venkateswara and "SVC", always in the top-left corner, straight on the page */}
    <motion.div
      ref={logoRef}
      className={cn("fixed top-5 left-4 z-[79] transition-opacity sm:top-6 sm:left-8", open && "max-md:pointer-events-none max-md:opacity-0")}
      initial={{ opacity: 0 }}
      animate={{ opacity: introDone ? 1 : 0 }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
    >
      <Link href="/" onClick={toTop} aria-label="Sri Venkateswara Creations, home" className="group flex h-12 items-center gap-2.5 transition-transform duration-300 hover:-translate-y-px">
        <Image
          src="/brand/svc-deity.png"
          alt=""
          width={606}
          height={906}
          loading="eager"
          className={cn(
            "h-10 w-auto transition-[transform,filter] duration-500 group-hover:scale-[1.06]",
            dark ? "drop-shadow-[0_0_12px_rgba(232,181,58,0.45)]" : "drop-shadow-[0_2px_6px_rgba(59,26,7,0.18)]",
          )}
        />
        {/* Deep gold on light pages, bright gold over the dark: the two cross-fade */}
        <span aria-hidden="true" className={cn("relative block aspect-[2003/736] h-5 sm:h-[22px]", dark && "drop-shadow-[0_2px_8px_rgba(0,0,0,0.55)]")}>
          <span className={cn("svc-mark svc-mark--light absolute inset-0 transition-opacity duration-500", dark && "opacity-0")} />
          <span className={cn("svc-mark svc-mark--bright absolute inset-0 transition-opacity duration-500", !dark && "opacity-0")} />
        </span>
      </Link>
    </motion.div>

    <motion.nav
      ref={navRef}
      aria-label="Primary"
      // With a mouse, pointing at the menu opens it, and it closes a moment after the pointer leaves.
      onPointerEnter={(e) => {
        if (e.pointerType !== "mouse" || window.matchMedia("(min-width: 1024px)").matches) return;
        window.clearTimeout(hoverClose.current);
        setOpen(true);
      }}
      onPointerLeave={(e) => {
        if (e.pointerType !== "mouse" || window.matchMedia("(min-width: 1024px)").matches) return;
        hoverClose.current = window.setTimeout(() => setOpen(false), 350);
      }}
      className="fixed top-5 right-4 z-[80] flex items-center sm:top-6 sm:right-8"
      initial={{ opacity: 0 }}
      animate={{ opacity: introDone ? 1 : 0 }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
    >
      {/* Desktop: every page in view, always */}
      <div className={cn("hidden transition-[filter] duration-500 lg:block", navDark && "drop-shadow-[0_1px_8px_rgba(0,0,0,0.55)]")}>
        <ul className="flex items-center">
          {MENU.map((item) => (
            <li key={item.href} className="shrink-0">
              <Link
                href={item.href}
                aria-current={isActive(item.href) ? "page" : undefined}
                className={cn(
                  "block px-3.5 py-2 text-[0.68rem] font-semibold tracking-[0.16em] whitespace-nowrap uppercase transition-colors duration-500",
                  isActive(item.href)
                    ? navDark
                      ? "text-[#f2c230]"
                      : "text-saffron-deep"
                    : navDark
                      ? "text-white/85 hover:text-white"
                      : "text-[#5f5f5f] hover:text-[#222]",
                )}
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </div>

      {/* Phones and tablets: the pages fold away behind a menu button */}
      <AnimatePresence>
        {open && (
          <motion.div
            id="site-menu"
            key="menu"
            className="mr-1.5 overflow-hidden rounded-full bg-white/90 shadow-[0_10px_30px_-12px_rgba(0,0,0,0.35)] ring-1 ring-black/[0.06] backdrop-blur-md lg:hidden"
            initial={{ clipPath: "inset(0 0 0 100% round 999px)" }}
            animate={{ clipPath: "inset(0 0 0 0% round 999px)" }}
            exit={{ clipPath: "inset(0 0 0 100% round 999px)" }}
            transition={{ duration: 0.55, ease: [0.76, 0, 0.24, 1] }}
          >
            <ul className="no-scrollbar flex max-w-[calc(100vw-5.25rem)] items-center overflow-x-auto px-2 py-1.5 sm:px-3" data-lenis-prevent>
              {MENU.map((item, i) => (
                <motion.li
                  key={item.href}
                  className="shrink-0"
                  initial={{ opacity: 0, x: 14 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.12 + (MENU.length - 1 - i) * 0.035, duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                >
                  <Link
                    href={item.href}
                    aria-current={isActive(item.href) ? "page" : undefined}
                    className={cn(
                      "block rounded-full px-3 py-2 text-[0.68rem] font-semibold tracking-[0.16em] whitespace-nowrap uppercase transition-colors sm:px-3.5",
                      isActive(item.href) ? "text-saffron-deep" : "text-[#5f5f5f] hover:bg-black/[0.04] hover:text-[#222]",
                    )}
                  >
                    {item.label}
                  </Link>
                </motion.li>
              ))}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>

      <button
        type="button"
        aria-expanded={open}
        aria-controls="site-menu"
        aria-label={open ? "Close menu" : "Open menu"}
        onClick={() => setOpen((o) => !o)}
        className="grid h-12 w-12 shrink-0 place-items-center rounded-full text-[#8a8a8a] transition-colors hover:text-[#5f5f5f] lg:hidden"
      >
        <MenuIcon open={open} />
      </button>
    </motion.nav>
    </>
  );
}
