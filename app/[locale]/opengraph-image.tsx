import { ImageResponse } from "next/og";
import { getTranslations } from "next-intl/server";

export const alt = "Nicolás Villabona";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OpengraphImage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Home" });

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "80px",
          color: "white",
          background:
            "linear-gradient(353deg, #000000 0%, #212e25 82%, #34553f 100%)",
        }}
      >
        <div style={{ fontSize: 88, fontWeight: 700 }}>Nicolás Villabona</div>
        <div style={{ fontSize: 44, marginTop: 24, color: "#c3d7c6" }}>
          {t("role")}
        </div>
        <div
          style={{
            marginTop: 48,
            width: 160,
            height: 8,
            borderRadius: 4,
            background: "#4f7a5c",
          }}
        />
      </div>
    ),
    size
  );
}
