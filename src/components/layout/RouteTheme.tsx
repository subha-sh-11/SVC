"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

/** Routes that use the light (white) theme. Everything else keeps the dark lamp-lit theme. */
const LIGHT_ROUTES = new Set(["/", "/films", "/awards", "/production", "/about", "/contact", "/distribution", "/upcoming"]);

/**
 * Wraps the footer (white on every page, its title logos on a strip of dark film); on light
 * routes the space above it is kept white too.
 */
export function RouteTheme({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  // flow-root keeps the footer's top margin inside this background.
  const light = LIGHT_ROUTES.has(pathname);
  return (
    <div className={light ? "flow-root bg-white" : "flow-root"} data-header-theme={light ? "light" : undefined}>
      {children}
    </div>
  );
}
