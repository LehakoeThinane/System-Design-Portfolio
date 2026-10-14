import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";

export const alt = "Lehakoe Thinane, Systems Designer & Architect, AI Engineer";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const portrait = await readFile(join(process.cwd(), "public/images/lehakoe-thinane.jpg"));
const portraitSrc = `data:image/jpeg;base64,${portrait.toString("base64")}`;

const tags = ["AI inside controlled boundaries", "Multi-tenant ERP", ".NET · FastAPI · Azure"];

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "72px 80px",
          background: "linear-gradient(135deg, #070c15 0%, #0b1220 60%, #1a120c 100%)",
          color: "#e8eef6",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", maxWidth: 720 }}>
          <div style={{ display: "flex", fontSize: 22, letterSpacing: 4, color: "#ff8a4c", textTransform: "uppercase" }}>
            Systems Designer & Architect
          </div>
          <div style={{ display: "flex", marginTop: 20, fontSize: 76, fontWeight: 700, lineHeight: 1.05 }}>Lehakoe Thinane</div>
          <div style={{ display: "flex", marginTop: 24, fontSize: 30, lineHeight: 1.4, color: "#9babbf" }}>
            AI engineer building ERP, automation and business systems with the guardrails built in.
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", marginTop: 40 }}>
            {tags.map((tag) => (
              <div
                key={tag}
                style={{
                  display: "flex",
                  marginRight: 12,
                  marginBottom: 12,
                  padding: "8px 18px",
                  borderRadius: 999,
                  border: "1px solid rgba(148, 170, 200, 0.26)",
                  fontSize: 22,
                  color: "#e8eef6",
                }}
              >
                {tag}
              </div>
            ))}
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
          {/* eslint-disable-next-line @next/next/no-img-element -- ImageResponse renders plain img elements */}
          <img
            src={portraitSrc}
            alt=""
            width={300}
            height={300}
            style={{ borderRadius: 999, border: "6px solid #ff8a4c", objectFit: "cover" }}
          />
          <div style={{ display: "flex", marginTop: 24, fontSize: 22, color: "#9babbf" }}>Johannesburg, South Africa</div>
        </div>
      </div>
    ),
    { ...size },
  );
}
