import { Document, Page, Text, View, StyleSheet, renderToBuffer } from "@react-pdf/renderer";
import type { FullCvData } from "./schema";

const ISSUER_NAME = "Thomas Cournou";
const AGENCY_NAME = "AKXIO CONSEILS";
const ISSUER_PHONE = "06 06 42 89 26";
const ISSUER_EMAIL = "t.cournou@akxioconseils.fr";
const BRAND_BLUE = "#2E6DA4";

const styles = StyleSheet.create({
  page: { padding: 42, fontSize: 10.5, fontFamily: "Helvetica", color: "#222222" },
  logoMain: {
    fontSize: 26,
    fontWeight: 700,
    color: BRAND_BLUE,
    textAlign: "center",
    letterSpacing: 6,
  },
  logoSub: {
    fontSize: 11,
    fontWeight: 700,
    color: BRAND_BLUE,
    textAlign: "center",
    letterSpacing: 8,
    marginTop: 2,
    marginBottom: 18,
  },
  centered: { textAlign: "center", fontSize: 10 },
  reference: { fontSize: 10, marginTop: 16, marginBottom: 10 },
  jobTitle: { fontSize: 12, fontWeight: 700, marginBottom: 4 },
  sectionTitle: { fontSize: 11, fontWeight: 700, color: BRAND_BLUE, marginTop: 16, marginBottom: 6 },
  expHeadline: { fontSize: 10, fontWeight: 700, marginTop: 8 },
  line: { fontSize: 10, lineHeight: 1.35 },
  toolsLabel: { fontSize: 10, fontWeight: 700, marginTop: 16 },
  footer: { fontSize: 8.5, color: "#555555", textAlign: "center", marginTop: 28 },
});

export async function buildPdf(data: FullCvData): Promise<Buffer> {
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
