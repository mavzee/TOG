import React, { useRef, useState } from "react";

import HeaderCreate from "./headercreate.jsx";
import Search from "./search.jsx";
import Files from "./files.jsx";

import "./App.css";

const DEFAULT_HEADERS = [
  "Fire Station",
  "City",
  "State",
];

function App() {
  const [headers, setHeaders] = useState(DEFAULT_HEADERS);

  const [activePage, setActivePage] = useState("search");
  const [sidebarExpanded, setSidebarExpanded] = useState(false);
  const sidebarOpenTimer = useRef(null);

  const handleSidebarPointerEnter = () => {
    window.clearTimeout(sidebarOpenTimer.current);
    sidebarOpenTimer.current = window.setTimeout(() => {
      setSidebarExpanded(true);
      sidebarOpenTimer.current = null;
    }, 100);
  };

  const handleSidebarPointerLeave = () => {
    window.clearTimeout(sidebarOpenTimer.current);
    sidebarOpenTimer.current = null;
    setSidebarExpanded(false);
  };

  const addHeader = (header) => {
    const cleaned = header.trim();

    if (!cleaned) {
      return;
    }

    const alreadyExists = headers.some(
      (item) =>
        item.toLowerCase() === cleaned.toLowerCase()
    );

    if (alreadyExists) {
      alert("That header already exists.");
      return;
    }

    setHeaders((current) => [
      ...current,
      cleaned,
    ]);
  };

  const removeHeader = (header) => {
    if (DEFAULT_HEADERS.includes(header)) {
      return;
    }

    setHeaders((current) =>
      current.filter(
        (item) => item !== header
      )
    );
  };

  return (
    <div className={`app-shell${sidebarExpanded ? " sidebar-expanded" : ""}`}>
      <aside
        className="sidebar"
        onMouseEnter={handleSidebarPointerEnter}
        onMouseLeave={handleSidebarPointerLeave}
      >
        <div className="sidebar-brand-row">
          <a className="brand" href="/" aria-label="TOG Research home" title="TOG Research">
            <span className="brand-mark" aria-hidden="true">T</span>
            <span className="brand-copy" aria-hidden="true">TOG RESEARCH</span>
          </a>
        </div>
        <div className="sidebar-divider" />
        <nav className="side-nav" id="main-navigation" aria-label="Main navigation">
          <button
            className={activePage === "search" ? "active" : ""}
            onClick={() => setActivePage("search")}
            aria-current={activePage === "search" ? "page" : undefined}
            aria-label="Search"
            title="Search"
          >
            <svg className="nav-icon" viewBox="0 0 24 24" aria-hidden="true">
              <circle cx="10.8" cy="10.8" r="6.3" />
              <path d="m15.5 15.5 4 4" />
            </svg>
            <span className="nav-label">Search</span>
          </button>
          <button
            className={activePage === "headers" ? "active" : ""}
            onClick={() => setActivePage("headers")}
            aria-current={activePage === "headers" ? "page" : undefined}
            aria-label="Create Headers"
            title="Create Headers"
          >
            <svg className="nav-icon sparkle-icon" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M12 2.8 13.7 9l6.2 1.8-6.2 1.7-1.7 6.3-1.7-6.3-6.2-1.7L10.3 9 12 2.8Z" />
              <path d="m19 15 .8 2.2L22 18l-2.2.8L19 21l-.8-2.2L16 18l2.2-.8L19 15Z" />
            </svg>
            <span className="nav-label">Create Headers</span>
          </button>
          <button
            className={activePage === "files" ? "active" : ""}
            onClick={() => setActivePage("files")}
            aria-current={activePage === "files" ? "page" : undefined}
            aria-label="Files"
            title="Files"
          >
            <svg className="nav-icon" viewBox="0 0 24 24" aria-hidden="true">
              <rect x="5" y="3.5" width="14" height="17" rx="2" />
              <path d="M9 8h6M9 12h6M9 16h4" />
            </svg>
            <span className="nav-label">Files</span>
          </button>
        </nav>
      </aside>

      <main className="main-content">
        <header className="topbar">
          <div className="breadcrumb">
            <strong className="breadcrumb-brand">TOG RESEARCH</strong>
            <span className="breadcrumb-divider">/</span>
            <strong>
              {activePage === "search"
                ? "Fire department research"
                : activePage === "headers"
                  ? "Create Headers"
                  : "Files"}
            </strong>
          </div>
          <div className="topbar-note">
            <span className="topbar-live-dot" />
            Research workspace
          </div>
        </header>
        <div className="workspace">
          {activePage === "headers" && (
            <HeaderCreate
              headers={headers}
              addHeader={addHeader}
              removeHeader={removeHeader}
            />
          )}
          {activePage === "search" && <Search headers={headers} />}
          {activePage === "files" && <Files />}
        </div>
      </main>
    </div>
  );
}

export default App;
