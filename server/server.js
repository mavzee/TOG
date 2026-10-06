import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import OpenAI from "openai";
import fs from "fs";
import path from "path";
import XLSX from "xlsx";
import { fileURLToPath } from "url";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_DIR = path.join(__dirname, "..", "data");

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, {
    recursive: true,
  });
}

function sanitizeFolderName(name) {
  return String(name)
    .replace(/[<>:"/\\|?*]/g, "")
    .trim()
    .replace(/\s+/g, " ");
}

function cleanJsonText(text) {
  return text
    .replace(/```json/gi, "")
    .replace(/```/g, "")
    .trim();
}

app.get("/", (req, res) => {
  res.json({
    message: "TOG API is running",
  });
});

/*
====================================================
RESEARCH FIRE STATION
====================================================
*/

app.post("/api/research", async (req, res) => {
  try {
    const {
      fireStation,
      city,
      state,
      fields = [],
    } = req.body;

    if (!fireStation) {
      return res.status(400).json({
        error: "Fire Station is required.",
      });
    }

    if (!Array.isArray(fields) || fields.length === 0) {
      return res.status(400).json({
        error: "At least one research field is required.",
      });
    }

    const fieldList = fields
      .map((field, index) => {
        return `${index + 1}. ${field}`;
      })
      .join("\n");

    const resultTemplate = fields
      .map((field) => {
        return `"${field}": {
          "value": "value or Not Found",
          "confidence": "High, Medium, or Low",
          "sourceTitle": "source title",
          "sourceUrl": "https://example.com"
        }`;
      })
      .join(",\n");

    const prompt = `
You are performing web research for a United States fire department.

FIRE DEPARTMENT
Name: ${fireStation}
City: ${city || "Unknown"}
State: ${state || "Unknown"}

RESEARCH THESE FIELDS:

${fieldList}

IMPORTANT RULES:

1. Search the live web.
2. Do not guess or invent information.
3. Verify that the information belongs to this exact fire department.
4. Prefer recent information when possible.
5. If no reliable answer can be found, use "Not Found".
6. Use authoritative sources whenever possible.
7. Return only valid JSON.

SOURCE PRIORITY:

1. Official fire department website
2. Official city website
3. Official county website
4. Government staff directories
5. Government procurement portals
6. Government bid documents
7. City council minutes
8. Municipal budgets
9. Public contracts
10. Official department social media
11. Manufacturer announcements
12. Distributor announcements
13. Credible local news

FOR POC / CONTACT FIELDS:
Look for:
- Fire Chief
- Deputy Chief
- Assistant Chief
- Administrative staff
- Procurement officer
- Logistics officer
- Department contact

FOR TURNOUT GEAR:
Search procurement records, contracts, bid awards, council minutes,
budgets, purchase orders, news releases and manufacturer announcements.

Common turnout gear companies include:
- Fire-Dex
- Globe
- MSA
- LION
- Honeywell Morning Pride
- INNOTEX
- MES
- LN Curtis

DO NOT assume one of these brands is used unless verified.

Return JSON exactly like this:

{
  "fireStation": "${fireStation}",
  "city": "${city || ""}",
  "state": "${state || ""}",
  "results": {
    ${resultTemplate}
  }
}
`;

    const response = await openai.responses.create({
      model: "gpt-5.4",
      tools: [
        {
          type: "web_search",
          search_context_size: "medium",
        },
      ],
      input: prompt,
    });

    const outputText = response.output_text;

    let parsed;

    try {
      parsed = JSON.parse(
        cleanJsonText(outputText)
      );
    } catch (error) {
      console.error(
        "Failed to parse OpenAI JSON:",
        outputText
      );

      return res.status(500).json({
        error: "OpenAI returned invalid JSON.",
        raw: outputText,
      });
    }

    return res.json(parsed);
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      error: "Research failed.",
      message: error.message,
    });
  }
});

/*
====================================================
SAVE FIRE STATION
====================================================
*/

app.post("/api/stations/save", async (req, res) => {
  try {
    const station = req.body;

    if (!station["Fire Station"]) {
      return res.status(400).json({
        error: "Fire Station is required.",
      });
    }

    const folderName = sanitizeFolderName(
      station["Fire Station"]
    );

    const stationFolder = path.join(
      DATA_DIR,
      folderName
    );

    if (!fs.existsSync(stationFolder)) {
      fs.mkdirSync(stationFolder, {
        recursive: true,
      });
    }

    const infoFile = path.join(
      stationFolder,
      "info.json"
    );

    fs.writeFileSync(
      infoFile,
      JSON.stringify(station, null, 2),
      "utf8"
    );

    return res.json({
      success: true,
      message: "Station saved.",
      folder: folderName,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      error: "Could not save station.",
    });
  }
});

/*
====================================================
GET ALL SAVED STATIONS
====================================================
*/

app.get("/api/stations", (req, res) => {
  try {
    const folders = fs.readdirSync(
      DATA_DIR,
      {
        withFileTypes: true,
      }
    );

    const stations = [];

    for (const folder of folders) {
      if (!folder.isDirectory()) {
        continue;
      }

      const infoPath = path.join(
        DATA_DIR,
        folder.name,
        "info.json"
      );

      if (!fs.existsSync(infoPath)) {
        continue;
      }

      const file = fs.readFileSync(
        infoPath,
        "utf8"
      );

      const parsed = JSON.parse(file);

      stations.push(parsed);
    }

    return res.json(stations);
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      error: "Could not read stations.",
    });
  }
});

/*
====================================================
DELETE STATION
====================================================
*/

app.delete("/api/stations/:stationName", (req, res) => {
  try {
    const stationName = sanitizeFolderName(
      req.params.stationName
    );

    const stationFolder = path.join(
      DATA_DIR,
      stationName
    );

    if (!fs.existsSync(stationFolder)) {
      return res.status(404).json({
        error: "Station not found.",
      });
    }

    fs.rmSync(stationFolder, {
      recursive: true,
      force: true,
    });

    return res.json({
      success: true,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      error: "Could not delete station.",
    });
  }
});

/*
====================================================
EXPORT EXCEL
====================================================
*/

app.get("/api/export", (req, res) => {
  try {
    const folders = fs.readdirSync(
      DATA_DIR,
      {
        withFileTypes: true,
      }
    );

    const rows = [];

    for (const folder of folders) {
      if (!folder.isDirectory()) {
        continue;
      }

      const infoPath = path.join(
        DATA_DIR,
        folder.name,
        "info.json"
      );

      if (!fs.existsSync(infoPath)) {
        continue;
      }

      const data = JSON.parse(
        fs.readFileSync(
          infoPath,
          "utf8"
        )
      );

      rows.push(data);
    }

    if (!rows.length) {
      return res.status(400).json({
        error: "No station data found.",
      });
    }

    const worksheet =
      XLSX.utils.json_to_sheet(rows);

    const workbook =
      XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(
      workbook,
      worksheet,
      "TOG Research"
    );

    const outputPath = path.join(
      DATA_DIR,
      "TOG_Research.xlsx"
    );

    XLSX.writeFile(
      workbook,
      outputPath
    );

    return res.download(
      outputPath,
      "TOG_Research.xlsx"
    );
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      error: "Export failed.",
    });
  }
});

const PORT =
  process.env.PORT || 5000;

  /*
====================================================
EXPORT SELECTED FIRE STATIONS
====================================================
*/

app.post("/api/export-selected", (req, res) => {
  try {
    const { stations } = req.body;

    if (!Array.isArray(stations) || stations.length === 0) {
      return res.status(400).json({
        error: "No fire stations selected.",
      });
    }

    const rows = [];

    for (const stationName of stations) {
      const folderName = sanitizeFolderName(stationName);

      const infoPath = path.join(
        DATA_DIR,
        folderName,
        "info.json"
      );

      if (!fs.existsSync(infoPath)) {
        continue;
      }

      const station = JSON.parse(
        fs.readFileSync(infoPath, "utf8")
      );

      // Don't put the raw _sources object
      // into a single Excel cell.
      const {
        _sources,
        ...stationData
      } = station;

      const excelRow = {
        ...stationData,
      };

      // Add source columns beside the researched data.
      if (_sources) {
        Object.entries(_sources).forEach(
          ([field, source]) => {
            excelRow[`${field} Source`] =
              source?.url || "";

            excelRow[`${field} Confidence`] =
              source?.confidence || "";
          }
        );
      }

      rows.push(excelRow);
    }

    if (rows.length === 0) {
      return res.status(404).json({
        error: "No selected station data was found.",
      });
    }

    const worksheet =
      XLSX.utils.json_to_sheet(rows);

    const workbook =
      XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(
      workbook,
      worksheet,
      "TOG Research"
    );

    const excelBuffer = XLSX.write(
      workbook,
      {
        type: "buffer",
        bookType: "xlsx",
      }
    );

    res.setHeader(
      "Content-Disposition",
      'attachment; filename="TOG_Selected_Research.xlsx"'
    );

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );

    return res.send(excelBuffer);

  } catch (error) {
    console.error("Export error:", error);

    return res.status(500).json({
      error: "Excel export failed.",
    });
  }
});

app.listen(PORT, () => {
  console.log(
    `TOG API running at http://localhost:${PORT}`
  );
});