import React, {
  useMemo,
  useState,
} from "react";

const API_URL =
  "http://localhost:5000";

const DEFAULT_HEADERS = [
  "Fire Station",
  "City",
  "State",
];

function Search({
  headers,
}) {
  const [
    station,
    setStation,
  ] = useState({
    "Fire Station": "",
    City: "",
    State: "",
  });

  const [
    results,
    setResults,
  ] = useState({});

  const [
    loading,
    setLoading,
  ] = useState(false);

  const [
    saving,
    setSaving,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState("");

  const researchHeaders =
    useMemo(() => {
      return headers.filter(
        (header) =>
          !DEFAULT_HEADERS.includes(
            header
          )
      );
    }, [headers]);

  const handleInput = (
    event
  ) => {
    const {
      name,
      value,
    } = event.target;

    setStation(
      (current) => ({
        ...current,
        [name]: value,
      })
    );
  };

  const findInformation =
    async () => {
      setError("");

      if (
        !station[
          "Fire Station"
        ].trim()
      ) {
        setError(
          "Enter a fire station."
        );

        return;
      }

      if (
        researchHeaders.length ===
        0
      ) {
        setError(
          "Create at least one research header first."
        );

        return;
      }

      setLoading(true);

      setResults({});

      try {
        const response =
          await fetch(
            `${API_URL}/api/research`,
            {
              method: "POST",

              headers: {
                "Content-Type":
                  "application/json",
              },

              body:
                JSON.stringify(
                  {
                    fireStation:
                      station[
                        "Fire Station"
                      ],

                    city:
                      station.City,

                    state:
                      station.State,

                    fields:
                      researchHeaders,
                  }
                ),
            }
          );

        const data =
          await response.json();

        if (!response.ok) {
          throw new Error(
            data.error ||
              "Research failed."
          );
        }

        setResults(
          data.results || {}
        );
      } catch (error) {
        console.error(error);

        setError(
          error.message
        );
      } finally {
        setLoading(false);
      }
    };

  const updateResult = (
    header,
    value
  ) => {
    setResults(
      (current) => ({
        ...current,

        [header]: {
          ...(current[
            header
          ] || {}),

          value,
        },
      })
    );
  };

  const saveStation =
    async () => {
      setError("");

      if (
        !station[
          "Fire Station"
        ].trim()
      ) {
        setError(
          "Fire Station is required."
        );

        return;
      }

      const record = {
        ...station,
      };

      researchHeaders.forEach(
        (header) => {
          record[header] =
            results[
              header
            ]?.value ||
            "";
        }
      );

      record._sources = {};

      researchHeaders.forEach(
        (header) => {
          record._sources[
            header
          ] = {
            confidence:
              results[
                header
              ]?.confidence ||
              "",

            title:
              results[
                header
              ]?.sourceTitle ||
              "",

            url:
              results[
                header
              ]?.sourceUrl ||
              "",
          };
        }
      );

      setSaving(true);

      try {
        const response =
          await fetch(
            `${API_URL}/api/stations/save`,
            {
              method: "POST",

              headers: {
                "Content-Type":
                  "application/json",
              },

              body:
                JSON.stringify(
                  record
                ),
            }
          );

        const data =
          await response.json();

        if (!response.ok) {
          throw new Error(
            data.error ||
              "Save failed."
          );
        }

        alert(
          "Fire station saved."
        );
      } catch (error) {
        console.error(error);

        setError(
          error.message
        );
      } finally {
        setSaving(false);
      }
    };

  const completedResearchFields = researchHeaders.filter(
    (header) => results[header]?.value
  ).length;

  return (
    <div className="page research-page">
      <div className="research-page-heading">
        <div>
          <span className="eyebrow">RESEARCH WORKSPACE</span>
          <h1>Fire department research</h1>
          <p>Find reliable information for a fire department and save your research.</p>
        </div>
        <span className="research-mode">
          <span className="research-mode-dot" />
          Web-powered research
        </span>
      </div>

      <div className="research-layout">
        <div className="research-main-column">
          <section className="department-card" aria-labelledby="department-heading">
            <div className="department-card-heading">
              <span className="department-icon" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none">
                  <path d="M12 3.5 19 6v5c0 4.4-2.8 7.3-7 9.5-4.2-2.2-7-5.1-7-9.5V6l7-2.5Z" />
                  <path d="m9.5 11.5 1.7 1.7 3.6-3.8" />
                </svg>
              </span>
              <div>
                <h2 id="department-heading">Department details</h2>
                <p>Choose a department to start a new research search.</p>
              </div>
            </div>

            <div className="station-form">
              <div>
                <label htmlFor="fire-station">Fire station</label>
                <input
                  id="fire-station"
                  name="Fire Station"
                  value={station["Fire Station"]}
                  onChange={handleInput}
                  placeholder="Austin Fire Department"
                />
              </div>
              <div>
                <label htmlFor="station-city">City</label>
                <input
                  id="station-city"
                  name="City"
                  value={station.City}
                  onChange={handleInput}
                  placeholder="Austin"
                />
              </div>
              <div>
                <label htmlFor="station-state">State</label>
                <input
                  id="station-state"
                  name="State"
                  value={station.State}
                  onChange={handleInput}
                  placeholder="Texas"
                />
              </div>
            </div>

            <div className="search-actions">
              <button
                className="primary-button"
                onClick={findInformation}
                disabled={loading}
              >
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <circle cx="10.8" cy="10.8" r="6.3" />
                  <path d="m15.5 15.5 4 4" />
                </svg>
                {loading ? "Researching..." : "Find information"}
              </button>
              <button
                className="secondary-button"
                onClick={saveStation}
                disabled={saving}
              >
                {saving ? "Saving..." : "Save station"}
              </button>
            </div>
          </section>

          {error && (
            <div className="error-box" role="alert">
              {error}
            </div>
          )}

          <section className="results-card" aria-labelledby="results-heading">
            <div className="results-card-heading">
              <div>
                <h2 id="results-heading">Research results</h2>
                <p>Edit any result before saving this station.</p>
              </div>
              <span className="results-count">
                {completedResearchFields} {completedResearchFields === 1 ? "field" : "fields"} found
              </span>
            </div>
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    {headers.map((header) => (
                      <th key={header}>{header}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>
                      {station["Fire Station"] || <span className="cell-empty">—</span>}
                    </td>
                    <td>
                      {station.City || <span className="cell-empty">—</span>}
                    </td>
                    <td>
                      {station.State || <span className="cell-empty">—</span>}
                    </td>
                    {researchHeaders.map((header) => (
                      <td key={header}>
                        <input
                          aria-label={header}
                          value={results[header]?.value || ""}
                          onChange={(event) => updateResult(header, event.target.value)}
                          placeholder={loading ? "Searching..." : "Not researched"}
                        />
                        {results[header]?.sourceUrl && (
                          <a
                            href={results[header].sourceUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="source-link"
                          >
                            View source
                          </a>
                        )}
                        {results[header]?.confidence && (
                          <small>Confidence: {results[header].confidence}</small>
                        )}
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          </section>
        </div>

        <aside className="research-help" aria-label="Research help">
          <article className="help-card">
            <h2>Research fields</h2>
            <p>Add custom fields to guide what the research tool looks for.</p>
          </article>
          <article className="help-card">
            <h2>How it works</h2>
            <p>
              Enter the department and its location, then search for your custom
              fields. Review the results and save the completed station.
            </p>
          </article>
        </aside>
      </div>
    </div>
  );
}

export default Search;