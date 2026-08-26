import { Document, Page, Text, View, StyleSheet, renderToBuffer } from "@react-pdf/renderer";
import type { FullCvData } from "./schema";
import { estimateContentScale } from "./estimate-content-scale";

const ISSUER_NAME = "Thomas Cournou";
const AGENCY_NAME = "AKXIO CONSEILS";
const ISSUER_PHONE = "06 06 42 89 26";
const ISSUER_EMAIL = "t.cournou@akxioconseils.fr";
const BRAND_BLUE = "#2E6DA4";

function buildStyles(scale: number) {
  const f = (n: number) => Math.round(n * scale * 10) / 10;
  return StyleSheet.create({
    page: { padding: f(42), fontSize: f(10.5), fontFamily: "Helvetica", color: "#222222" },
    logoMain: {
      fontSize: f(26),
      fontWeight: 700,
      color: BRAND_BLUE,
      textAlign: "center",
      letterSpacing: f(6),
    },
    logoSub: {
      fontSize: f(11),
      fontWeight: 700,
      color: BRAND_BLUE,
      textAlign: "center",
      letterSpacing: f(8),
      marginTop: f(2),
      marginBottom: f(18),
    },
    centered: { textAlign: "center", fontSize: f(10) },
    reference: { fontSize: f(10), marginTop: f(16), marginBottom: f(10) },
    jobTitle: { fontSize: f(12), fontWeight: 700, marginBottom: f(4) },
    sectionTitle: {
      fontSize: f(11),
      fontWeight: 700,
      color: BRAND_BLUE,
      marginTop: f(16),
      marginBottom: f(6),
    },
    expHeadline: { fontSize: f(10), fontWeight: 700, marginTop: f(8) },
    line: { fontSize: f(10), lineHeight: 1.3 },
    toolsLabel: { fontSize: f(10), fontWeight: 700, marginTop: f(16) },
    footer: { fontSize: f(8.5), color: "#555555", textAlign: "center", marginTop: f(28) },
  });
}

export async function buildPdf(data: FullCvData): Promise<Buffer> {
  const styles = buildStyles(estimateContentScale(data));

  const doc = (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.logoMain}>AKXIO</Text>
        <Text style={styles.logoSub}>CONSEILS</Text>

        <Text style={styles.centered}>Disponibilité : {data.availability || "—"}</Text>
        <Text style={styles.centered}>Rémunération cible : {data.compensation || "—"}</Text>
        {data.searchZone ? (
          <Text style={styles.centered}>Zone de recherche : {data.searchZone}</Text>
        ) : null}

        <Text style={styles.reference}>Référence : {data.reference || "—"}</Text>
        <Text style={styles.jobTitle}>{data.jobTitle}</Text>

        <Text style={styles.sectionTitle}>EXPÉRIENCES</Text>
        {data.experiences.map((exp, i) => (
          <View key={i} wrap={false} style={{ marginTop: i === 0 ? 0 : 8 }}>
            <Text style={styles.expHeadline}>{exp.headline}</Text>
            {exp.descriptionLines.map((line, j) => (
              <Text style={styles.line} key={j}>
                {line}
              </Text>
            ))}
          </View>
        ))}

        <Text style={styles.sectionTitle}>FORMATIONS</Text>
        {data.education.map((ed, i) => (
          <Text style={styles.expHeadline} key={i}>
            {ed.headline}
          </Text>
        ))}

        {data.tools.length ? (
          <>
            <Text style={styles.toolsLabel}>Logiciel :</Text>
            <Text style={styles.line}>{data.tools.join(", ")}</Text>
          </>
        ) : null}

        <Text style={styles.footer}>
          {`${ISSUER_NAME} – ${AGENCY_NAME} – ${ISSUER_PHONE}\n${ISSUER_EMAIL}`}
        </Text>
      </Page>
    </Document>
  );

  return renderToBuffer(doc);
}
