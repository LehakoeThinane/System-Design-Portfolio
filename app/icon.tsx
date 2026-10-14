import { ImageResponse } from "next/og";

export const size = { width: 64, height: 64 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          borderRadius: 14,
          background: "#ff8a4c",
          color: "#1d1008",
          fontSize: 34,
          fontWeight: 700,
          letterSpacing: -1,
        }}
      >
        LT
      </div>
    ),
    { ...size },
  );
}
