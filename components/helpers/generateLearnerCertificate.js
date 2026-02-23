import * as Print from "expo-print";

/**
 * Génère un PDF de certificat et retourne l'URI local du fichier.
 *
 * @param {Object} params
 * @param {string} params.learnerName    - Nom de l'apprenant
 * @param {string} params.formationTitle - Titre de la formation
 * @param {string} params.trainerName    - Nom du formateur
 * @param {string} params.issuedAt       - Date de délivrance (string formatée)
 */
export async function generateCertificatePDF({
  learnerName,
  formationTitle,
  trainerName,
  issuedAt,
}) {
  const html = `
    <!DOCTYPE html>
    <html lang="fr">
    <head>
      <meta charset="UTF-8" />
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }

        body {
          font-family: Georgia, 'Times New Roman', serif;
          background: #ffffff;
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: 100vh;
          padding: 40px;
        }

        .certificate {
          width: 100%;
          max-width: 800px;
          border: 12px solid #1E3A8A;
          border-radius: 8px;
          padding: 60px;
          text-align: center;
          position: relative;
          background: #ffffff;
        }

        /* Coins décoratifs */
        .corner {
          position: absolute;
          width: 60px;
          height: 60px;
          border-color: #BFDBFE;
          border-style: solid;
        }
        .corner-tl { top: 12px; left: 12px; border-width: 3px 0 0 3px; }
        .corner-tr { top: 12px; right: 12px; border-width: 3px 3px 0 0; }
        .corner-bl { bottom: 12px; left: 12px; border-width: 0 0 3px 3px; }
        .corner-br { bottom: 12px; right: 12px; border-width: 0 3px 3px 0; }

        /* Badge en haut */
        .badge {
          width: 80px;
          height: 80px;
          background: linear-gradient(135deg, #1E3A8A, #2563EB);
          border-radius: 50%;
          margin: 0 auto 24px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 36px;
        }

        .subtitle {
          font-size: 13px;
          letter-spacing: 4px;
          text-transform: uppercase;
          color: #2563EB;
          font-family: Arial, sans-serif;
          margin-bottom: 12px;
        }

        .title {
          font-size: 42px;
          color: #1E3A8A;
          margin-bottom: 32px;
          font-weight: bold;
        }

        .divider {
          width: 80px;
          height: 3px;
          background: linear-gradient(to right, #2563EB, #BFDBFE);
          margin: 0 auto 32px;
          border-radius: 2px;
        }

        .presented-to {
          font-size: 14px;
          color: #6B7280;
          font-family: Arial, sans-serif;
          letter-spacing: 2px;
          text-transform: uppercase;
          margin-bottom: 12px;
        }

        .learner-name {
          font-size: 36px;
          color: #111827;
          margin-bottom: 32px;
          font-style: italic;
        }

        .description {
          font-size: 15px;
          color: #374151;
          line-height: 1.8;
          font-family: Arial, sans-serif;
          margin-bottom: 40px;
          max-width: 500px;
          margin-left: auto;
          margin-right: auto;
        }

        .formation-name {
          color: #1E3A8A;
          font-weight: bold;
          font-style: normal;
        }

        .footer {
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          margin-top: 40px;
          padding-top: 24px;
          border-top: 1px solid #E5E7EB;
        }

        .signature-block {
          text-align: center;
        }

        .signature-line {
          width: 160px;
          height: 1px;
          background: #374151;
          margin-bottom: 8px;
        }

        .signature-name {
          font-size: 13px;
          font-weight: bold;
          color: #111827;
          font-family: Arial, sans-serif;
        }

        .signature-role {
          font-size: 11px;
          color: #6B7280;
          font-family: Arial, sans-serif;
        }

        .date-block {
          text-align: center;
        }

        .date-label {
          font-size: 11px;
          color: #6B7280;
          font-family: Arial, sans-serif;
          letter-spacing: 1px;
          text-transform: uppercase;
          margin-bottom: 4px;
        }

        .date-value {
          font-size: 14px;
          color: #111827;
          font-family: Arial, sans-serif;
          font-weight: bold;
        }

        .watermark {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%) rotate(-30deg);
          font-size: 80px;
          color: rgba(37, 99, 235, 0.04);
          font-weight: bold;
          white-space: nowrap;
          pointer-events: none;
          z-index: 0;
          font-family: Arial, sans-serif;
        }
      </style>
    </head>
    <body>
      <div class="certificate">
        <!-- Coins décoratifs -->
        <div class="corner corner-tl"></div>
        <div class="corner corner-tr"></div>
        <div class="corner corner-bl"></div>
        <div class="corner corner-br"></div>

        <!-- Filigrane -->
        <div class="watermark">EduTrack</div>

        <!-- Badge -->
        <div class="badge">🎓</div>

        <!-- En-tête -->
        <div class="subtitle">EduTrack · Certificat officiel</div>
        <div class="title">Certificat de Réussite</div>
        <div class="divider"></div>

        <!-- Bénéficiaire -->
        <div class="presented-to">Décerné à</div>
        <div class="learner-name">${learnerName}</div>

        <!-- Description -->
        <div class="description">
          Pour avoir suivi et validé avec succès l'intégralité de la formation
          <br/>
          <span class="formation-name">« ${formationTitle} »</span>
          <br/>
          incluant toutes les leçons et les évaluations du programme.
        </div>

        <!-- Footer -->
        <div class="footer">
          <div class="signature-block">
            <div class="signature-line"></div>
            <div class="signature-name">${trainerName}</div>
            <div class="signature-role">Formateur</div>
          </div>

          <div class="date-block">
            <div class="date-label">Délivré le</div>
            <div class="date-value">${issuedAt}</div>
          </div>

          <div class="signature-block">
            <div class="signature-line"></div>
            <div class="signature-name">EduTrack</div>
            <div class="signature-role">Plateforme certifiée</div>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;

  const { uri } = await Print.printToFileAsync({ html, base64: false });
  return uri; // URI local du PDF (ex: file:///tmp/...)
}
