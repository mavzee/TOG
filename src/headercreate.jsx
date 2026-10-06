import React, {
  useState,
} from "react";

const DEFAULT_HEADERS = [
  "Fire Station",
  "City",
  "State",
];

function HeaderCreate({
  headers,
  addHeader,
  removeHeader,
}) {
  const [
    newHeader,
    setNewHeader,
  ] = useState("");

  const submitHeader = (
    event
  ) => {
    event.preventDefault();

    addHeader(newHeader);

    setNewHeader("");
  };

  return (
    <div className="page">
      <div className="page-heading">
        <div>
          <h1>
            Create Headers
          </h1>

          <p>
            Add fields that the
            research tool should
            find for each fire
            department.
          </p>
        </div>
      </div>

      <form
        className="header-form"
        onSubmit={
          submitHeader
        }
      >
        <input
          value={newHeader}
          onChange={(event) =>
            setNewHeader(
              event.target.value
            )
          }
          placeholder="Example: POC"
        />

        <button type="submit">
          Add Header
        </button>
      </form>

      <div className="header-grid">
        {headers.map(
          (header) => {
            const isDefault =
              DEFAULT_HEADERS.includes(
                header
              );

            return (
              <div
                className="header-card"
                key={header}
              >
                <span>
                  {header}
                </span>

                {isDefault ? (
                  <small>
                    Default
                  </small>
                ) : (
                  <button
                    onClick={() =>
                      removeHeader(
                        header
                      )
                    }
                  >
                    Remove
                  </button>
                )}
              </div>
            );
          }
        )}
      </div>
    </div>
  );
}

export default HeaderCreate;