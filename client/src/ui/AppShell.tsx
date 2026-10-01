import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { Button } from "./Button";

export function AppShell({
  navigation,
  footer,
  breadcrumb,
  actions,
  children,
  preview,
}: {
  navigation: ReactNode;
  footer: ReactNode;
  breadcrumb: ReactNode;
  actions: ReactNode;
  children: ReactNode;
  preview: boolean;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  useEffect(() => {
    if (!menuOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMenuOpen(false);
    };
    window.addEventListener("keydown", handleKey);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKey);
    };
  }, [menuOpen]);
  return (
    <div className="app-shell">
      <header className="mobile-header">
        <a className="brand" href="#home">
          <span className="brand__mark" />
          vaultmm
        </a>
        {preview && <span className="mobile-preview">Design preview</span>}
        <Button
          variant="ghost"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-expanded={menuOpen}
          aria-controls="archive-sidebar"
        >
          {menuOpen ? "Close" : "Menu"}
        </Button>
      </header>
      {menuOpen && (
        <button
          className="sidebar-scrim"
          aria-label="Close menu"
          onClick={() => setMenuOpen(false)}
        />
      )}
      <aside
        id="archive-sidebar"
        className={`sidebar ${menuOpen ? "sidebar--open" : ""}`}
      >
        <a className="brand" href="#home" onClick={() => setMenuOpen(false)}>
          <span className="brand__mark" />
          vaultmm
        </a>
        <nav
          aria-label="Archive navigation"
          onClick={(event) => {
            if ((event.target as HTMLElement).closest("a, button"))
              setMenuOpen(false);
          }}
        >
          {navigation}
        </nav>
        <div className="sidebar__footer">
          {preview && <span className="preview-label">Design preview</span>}
          <p className="eyebrow">Private by default</p>
          {footer}
        </div>
      </aside>
      <main className="workspace" inert={menuOpen}>
        <div className="workspace__geometry" aria-hidden="true" />
        <div className="topbar">
          <div className="eyebrow breadcrumb">{breadcrumb}</div>
          <div className="topbar__actions">{actions}</div>
        </div>
        <div className="workspace__content">{children}</div>
        <footer className="workspace__footer eyebrow">
          Your archive. Your own pace.
          {preview && <span>Preview changes last for this visit.</span>}
        </footer>
      </main>
    </div>
  );
}
