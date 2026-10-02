"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/", label: "Directory" },
  { href: "/location-data", label: "Location data" },
];

export default function SiteNav() {
  const pathname = usePathname();
  return (
    <nav className="sitenav" aria-label="Main">
      {LINKS.map((l) => {
        const active = l.href === "/" ? pathname === "/" : pathname.startsWith(l.href);
        return (
          <Link
            key={l.href}
            href={l.href}
            className={active ? "navlink active" : "navlink"}
            aria-current={active ? "page" : undefined}
          >
            {l.label}
          </Link>
        );
      })}
    </nav>
  );
}
