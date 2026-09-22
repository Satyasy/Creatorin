"use client";

import Link from "next/link";
import { BriefcaseBusiness, ChevronDown, FolderKanban, UserRound } from "lucide-react";
import { useEffect, useRef, useState } from "react";

const exploreLinks = [
  { label: "Profil", href: "/jelajah/creator", Icon: UserRound },
  { label: "Proyek", href: "/jelajah/proyek", Icon: FolderKanban },
  { label: "Layanan", href: "/jelajah/layanan", Icon: BriefcaseBusiness },
];

export default function JelajahNav() {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function closeOnOutsideClick(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) setOpen(false);
    }

    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }

    document.addEventListener("mousedown", closeOnOutsideClick);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("mousedown", closeOnOutsideClick);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, []);

  return <div className={open ? "explore-menu is-open" : "explore-menu"} ref={menuRef}>
    <button className="explore-trigger active" type="button" aria-expanded={open} aria-haspopup="menu" onClick={() => setOpen((value) => !value)}>
      Jelajah <ChevronDown />
    </button>
    <div className="explore-dropdown" role="menu" aria-hidden={!open}>
      {exploreLinks.map(({ label, href, Icon }) => <Link className="explore-item" href={href} role="menuitem" tabIndex={open ? undefined : -1} onClick={() => setOpen(false)} key={label}><Icon />{label}</Link>)}
    </div>
  </div>;
}
