import * as Print from "expo-print";

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
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;1,400&family=Inter:wght@300;400;500;600&display=swap');

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
          overflow: hidden;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        /* ── SVG BACKGROUND ORBS ── */
        .bg-svg {
          position: absolute;
          top: 0; left: 0;
          width: 100%; height: 100%;
          pointer-events: none;
        }

        /* ── GRID LINES ── */
        .grid {
          position: absolute;
          top: 0; left: 0;
          width: 100%; height: 100%;
          background-image:
            linear-gradient(rgba(99,179,237,0.04) 1px, transparent 1px),
            linear-gradient(90deg, rgba(99,179,237,0.04) 1px, transparent 1px);
          background-size: 40px 40px;
        }

        /* ── GLASS CARD ── */
        .glass-card {
          position: relative;
          width: 720px;
          min-height: 490px;
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid rgba(255, 255, 255, 0.12);
          border-radius: 24px;
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          padding: 44px 56px;
          z-index: 10;
          box-shadow:
            0 0 0 1px rgba(99,179,237,0.1),
            0 32px 64px rgba(0,0,0,0.4),
            inset 0 1px 0 rgba(255,255,255,0.1);
        }

        /* Top accent line */
        .glass-card::before {
          content: '';
          position: absolute;
          top: 0; left: 60px; right: 60px;
          height: 2px;
          background: linear-gradient(90deg, transparent, #63B3ED, #A78BFA, #63B3ED, transparent);
          border-radius: 0 0 2px 2px;
        }

        /* ── HEADER ── */
        .header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 28px;
        }

        .brand {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .brand-logo {
          width: 36px;
          height: 36px;
        }

        .brand-name {
          font-size: 13px;
          font-weight: 600;
          color: rgba(255,255,255,0.5);
          letter-spacing: 3px;
          text-transform: uppercase;
        }

        .badge-official {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 5px 12px;
          background: rgba(99,179,237,0.1);
          border: 1px solid rgba(99,179,237,0.25);
          border-radius: 20px;
        }

        .badge-dot {
          width: 6px;
          height: 6px;
          background: #63B3ED;
          border-radius: 50%;
          box-shadow: 0 0 6px #63B3ED;
        }

        .badge-text {
          font-size: 10px;
          font-weight: 600;
          color: #63B3ED;
          letter-spacing: 1.5px;
          text-transform: uppercase;
        }

        /* ── DIVIDER ── */
        .divider-line {
          width: 100%;
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.08), transparent);
          margin-bottom: 28px;
        }

        /* ── MAIN CONTENT ── */
        .main {
          display: flex;
          align-items: center;
          gap: 40px;
        }

        /* Left — medal */
        .medal-container {
          flex-shrink: 0;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 12px;
        }

        .medal-svg {
          width: 100px;
          height: 100px;
          filter: drop-shadow(0 0 20px rgba(167,139,250,0.4));
        }

        .cert-type {
          font-size: 9px;
          letter-spacing: 2.5px;
          text-transform: uppercase;
          color: rgba(255,255,255,0.35);
          font-weight: 500;
          text-align: center;
        }

        /* Right — text */
        .content {
          flex: 1;
        }

        .presented-to {
          font-size: 11px;
          letter-spacing: 3px;
          text-transform: uppercase;
          color: rgba(255,255,255,0.35);
          font-weight: 500;
          margin-bottom: 8px;
        }

        .learner-name {
          font-family: 'Playfair Display', Georgia, serif;
          font-size: 38px;
          font-weight: 700;
          color: #ffffff;
          line-height: 1.1;
          margin-bottom: 16px;
          background: linear-gradient(135deg, #ffffff 0%, #E0E7FF 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .description {
          font-size: 13px;
          color: rgba(255,255,255,0.55);
          line-height: 1.7;
          font-weight: 300;
          margin-bottom: 20px;
          max-width: 400px;
        }

        .formation-title {
          display: inline;
          color: #A78BFA;
          font-weight: 500;
          font-style: italic;
        }

        /* ── FOOTER ── */
        .footer {
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          padding-top: 20px;
          border-top: 1px solid rgba(255,255,255,0.06);
          margin-top: 8px;
        }

        .sig-block {
          text-align: center;
          min-width: 140px;
        }

        .sig-line {
          width: 120px;
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.25), transparent);
          margin: 0 auto 8px;
        }

        .sig-name {
          font-size: 12px;
          font-weight: 600;
          color: rgba(255,255,255,0.75);
          letter-spacing: 0.3px;
        }

        .sig-role {
          font-size: 10px;
          color: rgba(255,255,255,0.3);
          letter-spacing: 1px;
          text-transform: uppercase;
          margin-top: 2px;
        }

        .date-center {
          text-align: center;
        }

        .date-label {
          font-size: 9px;
          letter-spacing: 2px;
          text-transform: uppercase;
          color: rgba(255,255,255,0.25);
          margin-bottom: 4px;
        }

        .date-value {
          font-size: 13px;
          font-weight: 500;
          color: rgba(255,255,255,0.6);
        }

        /* ── CORNER ORNAMENTS ── */
        .ornament {
          position: absolute;
          pointer-events: none;
        }
        .ornament-tl { top: 16px; left: 16px; }
        .ornament-tr { top: 16px; right: 16px; transform: scaleX(-1); }
        .ornament-bl { bottom: 16px; left: 16px; transform: scaleY(-1); }
        .ornament-br { bottom: 16px; right: 16px; transform: scale(-1); }

        /* ID strip */
        .cert-id {
          position: absolute;
          bottom: 16px;
          left: 50%;
          transform: translateX(-50%);
          font-size: 8px;
          color: rgba(255,255,255,0.12);
          letter-spacing: 2px;
          font-family: monospace;
        }
      </style>
    </head>
    <body>
      <div class="page">

        <!-- SVG Background: orbs + particles -->
        <svg class="bg-svg" viewBox="0 0 842 595" xmlns="http://www.w3.org/2000/svg">
          <!-- Large orbs -->
          <radialGradient id="orb1" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stop-color="#4F46E5" stop-opacity="0.35"/>
            <stop offset="100%" stop-color="#4F46E5" stop-opacity="0"/>
          </radialGradient>
          <radialGradient id="orb2" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stop-color="#7C3AED" stop-opacity="0.3"/>
            <stop offset="100%" stop-color="#7C3AED" stop-opacity="0"/>
          </radialGradient>
          <radialGradient id="orb3" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stop-color="#0EA5E9" stop-opacity="0.25"/>
            <stop offset="100%" stop-color="#0EA5E9" stop-opacity="0"/>
          </radialGradient>

          <ellipse cx="100" cy="100" rx="280" ry="280" fill="url(#orb1)"/>
          <ellipse cx="742" cy="495" rx="250" ry="250" fill="url(#orb2)"/>
          <ellipse cx="742" cy="100" rx="180" ry="180" fill="url(#orb3)"/>

          <!-- Decorative rings -->
          <circle cx="421" cy="297" r="260" fill="none" stroke="rgba(99,179,237,0.04)" stroke-width="1"/>
          <circle cx="421" cy="297" r="200" fill="none" stroke="rgba(167,139,250,0.05)" stroke-width="1"/>

          <!-- Floating particles -->
          <circle cx="150" cy="480" r="2" fill="rgba(167,139,250,0.4)"/>
          <circle cx="200" cy="520" r="1.5" fill="rgba(99,179,237,0.5)"/>
          <circle cx="680" cy="80" r="2" fill="rgba(167,139,250,0.4)"/>
          <circle cx="720" cy="140" r="1.5" fill="rgba(99,179,237,0.5)"/>
          <circle cx="760" cy="60" r="1" fill="rgba(255,255,255,0.3)"/>
          <circle cx="80" cy="300" r="1.5" fill="rgba(99,179,237,0.3)"/>
          <circle cx="50" cy="200" r="1" fill="rgba(167,139,250,0.4)"/>
          <circle cx="800" cy="350" r="2" fill="rgba(99,179,237,0.3)"/>

          <!-- Stars -->
          <polygon points="60,50 63,43 66,50 73,50 68,55 70,62 63,58 56,62 58,55 53,50" fill="rgba(255,255,255,0.06)" transform="scale(0.7) translate(30,20)"/>
          <polygon points="780,520 783,513 786,520 793,520 788,525 790,532 783,528 776,532 778,525 773,520" fill="rgba(255,255,255,0.06)" transform="scale(0.6)"/>
        </svg>

        <!-- Grid overlay -->
        <div class="grid"></div>

        <!-- Main glass card -->
        <div class="glass-card">

          <!-- Corner ornaments SVG -->
          <svg class="ornament ornament-tl" width="40" height="40" viewBox="0 0 40 40">
            <path d="M2 20 L2 2 L20 2" fill="none" stroke="rgba(99,179,237,0.3)" stroke-width="1.5" stroke-linecap="round"/>
            <circle cx="2" cy="2" r="2" fill="rgba(99,179,237,0.5)"/>
          </svg>
          <svg class="ornament ornament-tr" width="40" height="40" viewBox="0 0 40 40">
            <path d="M2 20 L2 2 L20 2" fill="none" stroke="rgba(99,179,237,0.3)" stroke-width="1.5" stroke-linecap="round"/>
            <circle cx="2" cy="2" r="2" fill="rgba(99,179,237,0.5)"/>
          </svg>
          <svg class="ornament ornament-bl" width="40" height="40" viewBox="0 0 40 40">
            <path d="M2 20 L2 2 L20 2" fill="none" stroke="rgba(99,179,237,0.3)" stroke-width="1.5" stroke-linecap="round"/>
            <circle cx="2" cy="2" r="2" fill="rgba(99,179,237,0.5)"/>
          </svg>
          <svg class="ornament ornament-br" width="40" height="40" viewBox="0 0 40 40">
            <path d="M2 20 L2 2 L20 2" fill="none" stroke="rgba(99,179,237,0.3)" stroke-width="1.5" stroke-linecap="round"/>
            <circle cx="2" cy="2" r="2" fill="rgba(99,179,237,0.5)"/>
          </svg>

          <!-- HEADER -->
          <div class="header">
            <div class="brand">
              <!-- Logo SVG -->
              <svg class="brand-logo" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect width="36" height="36" rx="10" fill="rgba(99,179,237,0.15)"/>
                <path d="M18 8 L28 13 L28 23 L18 28 L8 23 L8 13 Z" fill="none" stroke="#63B3ED" stroke-width="1.5"/>
                <path d="M18 12 L24 15.5 L24 22.5 L18 26 L12 22.5 L12 15.5 Z" fill="rgba(99,179,237,0.2)"/>
                <circle cx="18" cy="18" r="3" fill="#63B3ED"/>
              </svg>
              <span class="brand-name">EduTrack</span>
            </div>
            <div class="badge-official">
              <div class="badge-dot"></div>
              <span class="badge-text">Certificat Officiel</span>
            </div>
          </div>

          <div class="divider-line"></div>

          <!-- MAIN -->
          <div class="main">

            <!-- Medal -->
            <div class="medal-container">
              <svg class="medal-svg" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <radialGradient id="medalGrad" cx="35%" cy="35%" r="65%">
                    <stop offset="0%" stop-color="#C4B5FD"/>
                    <stop offset="50%" stop-color="#7C3AED"/>
                    <stop offset="100%" stop-color="#4C1D95"/>
                  </radialGradient>
                  <radialGradient id="medalGlow" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stop-color="#A78BFA" stop-opacity="0.6"/>
                    <stop offset="100%" stop-color="#A78BFA" stop-opacity="0"/>
                  </radialGradient>
                  <filter id="glow">
                    <feGaussianBlur stdDeviation="3" result="blur"/>
                    <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
                  </filter>
                </defs>

                <!-- Glow base -->
                <circle cx="50" cy="55" r="40" fill="url(#medalGlow)"/>

                <!-- Ribbon left -->
                <path d="M35 30 L30 15 L42 22 L38 35Z" fill="#4F46E5" opacity="0.9"/>
                <!-- Ribbon right -->
                <path d="M65 30 L70 15 L58 22 L62 35Z" fill="#4F46E5" opacity="0.9"/>

                <!-- Outer ring -->
                <circle cx="50" cy="55" r="30" fill="none" stroke="rgba(196,181,253,0.4)" stroke-width="1"/>
                <!-- Ring decoration -->
                <circle cx="50" cy="55" r="34" fill="none" stroke="rgba(167,139,250,0.2)" stroke-width="0.5" stroke-dasharray="4 3"/>

                <!-- Medal body -->
                <circle cx="50" cy="55" r="28" fill="url(#medalGrad)" filter="url(#glow)"/>
                <!-- Shine -->
                <ellipse cx="42" cy="45" rx="8" ry="5" fill="rgba(255,255,255,0.15)" transform="rotate(-20,42,45)"/>

                <!-- Star inside -->
                <path d="M50 40 L52.9 48.1 L61.5 48.1 L54.8 53.2 L57.4 61.8 L50 57 L42.6 61.8 L45.2 53.2 L38.5 48.1 L47.1 48.1 Z"
                  fill="rgba(255,255,255,0.9)" filter="url(#glow)"/>

                <!-- Connector -->
                <rect x="45" y="24" width="10" height="10" rx="2" fill="#6D28D9"/>
                <rect x="47" y="20" width="6" height="8" rx="1" fill="#5B21B6"/>
              </svg>
              <div class="cert-type">Réussite · Excellence</div>
            </div>

            <!-- Content -->
            <div class="content">
              <div class="presented-to">Décerné à</div>
              <div class="learner-name">${learnerName}</div>
              <div class="description">
                Pour avoir suivi et validé avec succès l'intégralité du programme
                <span class="formation-title">« ${formationTitle} »</span>,
                incluant toutes les leçons et les évaluations requises.
              </div>

              <!-- Footer -->
              <div class="footer">
                <div class="sig-block">
                  <div class="sig-line"></div>
                  <div class="sig-name">${trainerName}</div>
                  <div class="sig-role">Formateur</div>
                </div>

                <div class="date-center">
                  <div class="date-label">Délivré le</div>
                  <div class="date-value">${issuedAt}</div>
                </div>

                <div class="sig-block">
                  <div class="sig-line"></div>
                  <div class="sig-name">EduTrack</div>
                  <div class="sig-role">Plateforme certifiée</div>
                </div>
              </div>
            </div>
          </div>

        </div>

        <!-- Certificate ID -->
        <div class="cert-id">EDUTRACK · CERTIFICAT OFFICIEL · ${issuedAt.toUpperCase()}</div>

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
