import React, { useState } from "react";

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
    <div className="app-shell">

      <aside className="sidebar">

        <h2>TOG Research</h2>

        <button
          className={
            activePage === "search"
              ? "active"
              : ""
          }
          onClick={() =>
            setActivePage("search")
          }
        >
          Search
        </button>

        <button
          className={
            activePage === "headers"
              ? "active"
              : ""
          }
          onClick={() =>
            setActivePage("headers")
          }
        >
          Create Headers
        </button>

        <button
          className={
            activePage === "files"
              ? "active"
              : ""
          }
          onClick={() =>
            setActivePage("files")
          }
        >
          Files
        </button>

      </aside>

      <main className="main-content">

        {activePage === "headers" && (
          <HeaderCreate
            headers={headers}
            addHeader={addHeader}
            removeHeader={removeHeader}
          />
        )}

        {activePage === "search" && (
          <Search
            headers={headers}
          />
        )}

        {activePage === "files" && (
          <Files />
        )}

      </main>

    </div>
  );
}

export default App;
