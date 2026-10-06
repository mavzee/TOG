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

  return (
    <div className="page">
      <div className="page-heading">
        <div>
          <h1>
            Fire Department
            Research
          </h1>

          <p>
            Enter a department,
            then search the web
            for your custom
            fields.
          </p>
        </div>
      </div>

      <div className="station-form">
        <div>
          <label>
            Fire Station
          </label>

          <input
            name="Fire Station"
            value={
              station[
                "Fire Station"
              ]
            }
            onChange={
              handleInput
            }
            placeholder="Austin Fire Department"
          />
        </div>

        <div>
          <label>
            City
          </label>

          <input
            name="City"
            value={
              station.City
            }
            onChange={
              handleInput
            }
            placeholder="Austin"
          />
        </div>

        <div>
          <label>
            State
          </label>

          <input
            name="State"
            value={
              station.State
            }
            onChange={
              handleInput
            }
            placeholder="Texas"
          />
        </div>
      </div>

      <div className="search-actions">
        <button
          className="primary-button"
          onClick={
            findInformation
          }
          disabled={loading}
        >
          {loading
            ? "Researching..."
            : "Find Information"}
        </button>

        <button
          className="secondary-button"
          onClick={
            saveStation
          }
          disabled={
            saving
          }
        >
          {saving
            ? "Saving..."
            : "Save Station"}
        </button>
      </div>

      {error && (
        <div className="error-box">
          {error}
        </div>
      )}

      <div className="table-wrapper">
        <table>
          <thead>
            <tr>
              {headers.map(
                (header) => (
                  <th
                    key={
                      header
                    }
                  >
                    {header}
                  </th>
                )
              )}
            </tr>
          </thead>

          <tbody>
            <tr>
              <td>
                {
                  station[
                    "Fire Station"
                  ]
                }
              </td>

              <td>
                {
                  station.City
                }
              </td>

              <td>
                {
                  station.State
                }
              </td>

              {researchHeaders.map(
                (header) => (
                  <td
                    key={
                      header
                    }
                  >
                    <input
                      value={
                        results[
                          header
                        ]
                          ?.value ||
                        ""
                      }
                      onChange={(
                        event
                      ) =>
                        updateResult(
                          header,
                          event
                            .target
                            .value
                        )
                      }
                      placeholder={
                        loading
                          ? "Searching..."
                          : "Not researched"
                      }
                    />

                    {results[
                      header
                    ]
                      ?.sourceUrl && (
                      <a
                        href={
                          results[
                            header
                          ]
                            .sourceUrl
                        }
                        target="_blank"
                        rel="noreferrer"
                        className="source-link"
                      >
                        View
                        source
                      </a>
                    )}

                    {results[
                      header
                    ]
                      ?.confidence && (
                      <small>
                        Confidence:{" "}
                        {
                          results[
                            header
                          ]
                            .confidence
                        }
                      </small>
                    )}
                  </td>
                )
              )}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Search;