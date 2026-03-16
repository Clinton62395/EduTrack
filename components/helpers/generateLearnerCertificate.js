import * as Print from "expo-print";

export function generateMatricule() {
  const year = new Date().getFullYear();
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `EDU-${year}-${random}`;
}

export async function generateCertificatePDF({
  learnerName,
  formationTitle,
  trainerName,
  issuedAt,
  logoUrl,
  primaryColor = "#2563EB",
  matricule,
  verifyUrl,
}) {
  const finalLogo =
    logoUrl ||
    "https://res.cloudinary.com/dhpbglioz/image/upload/v1773647977/logo_qg5nab.png";

  // ✅ QR code via API Google Charts — pas besoin de canvas
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${encodeURIComponent(verifyUrl)}&bgcolor=ffffff&color=000000&format=png&margin=4`;
  const html = `
    <!DOCTYPE html>
    <html lang="fr">
    <head>
      <meta charset="UTF-8" />
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=Inter:wght@300;400;500;600&display=swap');

        :root {
          --primary-color: ${primaryColor};
          --primary-glow: ${primaryColor}4D;
        }

        * { margin: 0; padding: 0; box-sizing: border-box; }

        body {
          width: 842px;
          height: 595px;
          overflow: hidden;
          font-family: 'Inter', Arial, sans-serif;
          background: #0A0F2E;
        }

        .page {
          width: 842px;
          height: 595px;
          position: relative;
          background: linear-gradient(135deg, #0A0F2E 0%, #0D1B4B 40%, #0A0F2E 100%);
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .grid {
          position: absolute;
          top: 0; left: 0;
          width: 100%; height: 100%;
          background-image:
            linear-gradient(var(--primary-glow) 1px, transparent 1px),
            linear-gradient(90deg, var(--primary-glow) 1px, transparent 1px);
          background-size: 40px 40px;
          opacity: 0.2;
        }

        .glass-card {
          position: relative;
          width: 720px;
          min-height: 490px;
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid rgba(255, 255, 255, 0.12);
          border-radius: 24px;
          backdrop-filter: blur(20px);
          padding: 44px 56px;
          z-index: 10;
          box-shadow: 0 32px 64px rgba(0,0,0,0.4);
        }

        .glass-card::before {
          content: '';
          position: absolute;
          top: 0; left: 60px; right: 60px;
          height: 2px;
          background: linear-gradient(90deg, transparent, var(--primary-color), transparent);
        }

        .header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 28px;
        }

        .brand {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .brand-logo {
          width: 45px;
          height: 45px;
          object-fit: contain;
          border-radius: 8px;
        }

        .brand-name {
          font-size: 14px;
          font-weight: 600;
          color: rgba(255,255,255,0.7);
          letter-spacing: 2px;
          text-transform: uppercase;
        }

        .badge-official {
          padding: 5px 12px;
          background: var(--primary-glow);
          border: 1px solid var(--primary-color);
          border-radius: 20px;
          color: var(--primary-color);
          font-size: 10px;
          text-transform: uppercase;
          font-weight: 700;
        }

        .learner-name {
          font-family: 'Playfair Display', serif;
          font-size: 42px;
          color: #ffffff;
          margin: 15px 0;
          background: linear-gradient(135deg, #ffffff 0%, var(--primary-color) 150%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .formation-title {
          color: var(--primary-color);
          font-weight: 600;
          font-style: italic;
        }

        .sig-line {
          width: 140px;
          height: 1px;
          background: linear-gradient(90deg, transparent, var(--primary-color), transparent);
          margin-bottom: 8px;
        }

        .qr-block {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 6px;
          padding: 10px;
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 12px;
          background: rgba(255,255,255,0.03);
        }

        .qr-img { width: 80px; height: 80px; }

        .qr-label {
          color: rgba(255,255,255,0.3);
          font-size: 7px;
          text-transform: uppercase;
          letter-spacing: 1px;
          text-align: center;
        }

        .matricule {
          color: var(--primary-color);
          font-size: 8px;
          font-weight: 700;
          letter-spacing: 1.5px;
          font-family: monospace;
        }
      </style>
    </head>
    <body>
      <div class="page">
        <div class="grid"></div>
        <div class="glass-card">
          <div class="header">
            <div class="brand">
              <img src="${finalLogo}" class="brand-logo" />
              <span class="brand-name">EduTrack</span>
            </div>
            <div class="badge-official">Certificat Officiel</div>
          </div>

          <div style="height: 1px; background: rgba(255,255,255,0.1); margin-bottom: 30px;"></div>

          <div style="display: flex; gap: 40px; align-items: center;">
            <div style="text-align: center;">
              <svg width="100" height="100" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="40" fill="none" stroke="${primaryColor}" stroke-width="1" opacity="0.3"/>
                <circle cx="50" cy="50" r="30" fill="${primaryColor}" opacity="0.2"/>
                <path d="M50 35 L53 43 H62 L55 48 L58 57 L50 52 L42 57 L45 48 L38 43 H47 Z" fill="${primaryColor}" />
              </svg>
              <div style="color: rgba(255,255,255,0.4); font-size: 9px; letter-spacing: 2px; margin-top: 10px;">EXCELLENCE</div>
            </div>

            <div style="flex: 1;">
              <div style="color: rgba(255,255,255,0.4); font-size: 11px; text-transform: uppercase; letter-spacing: 2px;">Ce certificat est fièrement décerné à</div>
              <div class="learner-name">${learnerName}</div>
              <div style="color: rgba(255,255,255,0.6); font-size: 14px; line-height: 1.6; max-width: 450px;">
                Pour la réussite exemplaire du programme
                <span class="formation-title">« ${formationTitle} »</span>.
              </div>
            </div>
          </div>

          <div style="display: flex; justify-content: space-between; align-items: flex-end; margin-top: 40px; border-top: 1px solid rgba(255,255,255,0.05); padding-top: 20px;">
            <div style="text-align: center;">
              <div class="sig-line"></div>
              <div style="color: white; font-size: 12px; font-weight: 600;">${trainerName}</div>
              <div style="color: rgba(255,255,255,0.3); font-size: 9px; text-transform: uppercase;">Formateur</div>
            </div>

            <div style="text-align: center;">
              <div style="color: rgba(255,255,255,0.3); font-size: 9px; text-transform: uppercase;">Délivré le</div>
              <div style="color: rgba(255,255,255,0.7); font-size: 13px;">${issuedAt}</div>
            </div>

            <!-- ✅ QR via URL externe, pas de canvas -->
           <div class="qr-block">
             <div style="background: white; padding: 6px; border-radius: 8px;">
              <img src="${qrUrl}" style="width: 80px; height: 80px; display: block;" />
             </div>
             <div class="qr-label">Vérifier l'authenticité</div>
              <div class="matricule">${matricule}</div>
            </div>

            <div style="text-align: center;">
              <div class="sig-line"></div>
              <div style="color: white; font-size: 12px; font-weight: 600;">EduTrack</div>
              <div style="color: rgba(255,255,255,0.3); font-size: 9px; text-transform: uppercase;">Validation Système</div>
            </div>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;

  const { uri } = await Print.printToFileAsync({
    html,
    base64: false,
    width: 842,
    height: 595,
  });

  return uri;
}
