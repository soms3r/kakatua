import React from 'react';
import LegalLayout from '../../components/LegalLayout';

export default function PrivacyPage() {
  return (
    <LegalLayout title="Privacy Policy" icon="lock">
      <h1 className="text-lg font-bold text-[#154212] mt-0">Privacy Policy</h1>
      <p className="text-xs text-[#72796e]">Last updated: June 2026</p>

      <h2 className="text-base font-semibold text-[#154212] mt-6">1. Our Commitment to Privacy</h2>
      <p>
        At Kakatua, privacy is not an afterthought — it is a foundational principle. We
        collect only the data we need to connect you with the right language partners and
        to improve your experience. We will never sell your personal information to third
        parties, and we are transparent about exactly what data we hold and why.
      </p>

      <h2 className="text-base font-semibold text-[#154212] mt-6">2. What Data We Collect</h2>
      <h3 className="text-sm font-semibold text-[#154212] mt-4">2.1 Information You Provide</h3>
      <ul className="list-disc pl-5 space-y-1">
        <li><strong>Profile Information:</strong> Your name, native and learning languages, interests, timezone offset, and avatar image. This data is necessary for the matching algorithm to function.</li>
        <li><strong>Culture Card Data:</strong> Traditions, local food descriptions, personal or family history, and fun facts that you choose to share. This content is voluntary and is displayed to your matched partners to facilitate cultural exchange.</li>
        <li><strong>Feedback Submissions:</strong> Messages sent through the &quot;Tell the Flock&quot; feature, including optional contact information.</li>
        <li><strong>Communications:</strong> If you contact us directly via email or support channels, we retain the content of your messages and your contact information to respond to your inquiry.</li>
      </ul>
      <h3 className="text-sm font-semibold text-[#154212] mt-4">2.2 Information Collected Automatically</h3>
      <ul className="list-disc pl-5 space-y-1">
        <li><strong>Usage Data:</strong> Daily flight streaks, mission completion progress, match history, and feature interactions. This helps us personalize your experience and improve the Platform.</li>
        <li><strong>Technical Data:</strong> Browser type, device type, operating system, and anonymized IP address (stored as an INET type in our database). This is used for analytics, security monitoring, and abuse prevention.</li>
      </ul>

      <h2 className="text-base font-semibold text-[#154212] mt-6">3. Cookies & Local Storage</h2>
      <p>
        Kakatua uses minimal cookies and browser local storage solely for essential
        functionality:
      </p>
      <ul className="list-disc pl-5 space-y-1">
        <li><strong>Session cookies:</strong> Required for authentication and keeping you logged in during a session.</li>
        <li><strong>Local storage:</strong> Used to cache UI preferences (e.g., theme settings) and matchmaking queue state.</li>
      </ul>
      <p className="mt-2">
        We do not use third-party tracking cookies, advertising cookies, or any form of
        cross-site tracing. We do not serve ads, and we never will.
      </p>

      <h2 className="text-base font-semibold text-[#154212] mt-6">4. How We Store & Protect Your Data</h2>
      <p>
        All user data is stored in a secure PostgreSQL database, accessed exclusively
        through the Prisma ORM layer. Our database is protected by:
      </p>
      <ul className="list-disc pl-5 space-y-1">
        <li>Encryption at rest using AES-256</li>
        <li>Encryption in transit via TLS 1.3</li>
        <li>Role-based access control with strict least-privilege database credentials</li>
        <li>Regular automated backups with point-in-time recovery</li>
      </ul>
      <p className="mt-2">
        The Platform is hosted on Vercel&apos;s infrastructure (for Next.js server-side
        rendering) and a dedicated PostgreSQL instance. Both providers adhere to industry
        standards for physical and network security, including SOC 2 compliance.
      </p>

      <h2 className="text-base font-semibold text-[#154212] mt-6">5. How We Use Your Data</h2>
      <p>We use your data exclusively for the following purposes:</p>
      <ul className="list-disc pl-5 space-y-1">
        <li><strong>Matching:</strong> Profile data (languages, interests, timezone) powers our compatibility algorithm to find the best language partner for you.</li>
        <li><strong>Personalization:</strong> Usage data helps us tailor daily missions, streak goals, and partner suggestions.</li>
        <li><strong>Improvement:</strong> Aggregated, anonymized feedback and usage patterns guide product development.</li>
        <li><strong>Moderation:</strong> Report data and account status tracking ensure community safety.</li>
      </ul>

      <h2 className="text-base font-semibold text-[#154212] mt-6">6. Data Sharing & Third Parties</h2>
      <p>
        We do not sell, rent, or share your personal data with third parties for their
        own marketing or commercial purposes. We may share data with:
      </p>
      <ul className="list-disc pl-5 space-y-1">
        <li><strong>Service providers:</strong> Vercel (hosting) and our PostgreSQL provider process data on our behalf and are contractually bound to protect it.</li>
        <li><strong>Legal obligations:</strong> If required by law, court order, or governmental regulation, we may disclose limited data to comply with legal processes.</li>
      </ul>

      <h2 className="text-base font-semibold text-[#154212] mt-6">7. Your Rights — Right to Be Forgotten</h2>
      <p>
        You have full control over your data. Subject to applicable law, you have the
        right to:
      </p>
      <ul className="list-disc pl-5 space-y-1">
        <li><strong>Access:</strong> Request a copy of all data we hold about you.</li>
        <li><strong>Rectification:</strong> Correct any inaccurate or incomplete data.</li>
        <li><strong>Deletion (&quot;Right to be Forgotten&quot;):</strong> Request permanent deletion of your account and all associated data. We will process deletion requests within 30 days.</li>
        <li><strong>Data Portability:</strong> Receive your data in a structured, machine-readable format.</li>
        <li><strong>Withdraw Consent:</strong> At any time, for data processed based on your consent.</li>
      </ul>
      <p className="mt-2">
        To exercise any of these rights, contact us at the email below. We will respond
        within 30 days and will not charge a fee for reasonable requests.
      </p>

      <h2 className="text-base font-semibold text-[#154212] mt-6">8. Data Retention</h2>
      <p>
        Your data is retained for as long as your account is active. Upon account
        deletion, profile and Culture Card data are permanently removed within 30 days.
        Feedback submissions may be retained in anonymized form for product analytics
        purposes. Technical logs (IP addresses, request metadata) are retained for 90
        days for security monitoring, then automatically purged.
      </p>

      <h2 className="text-base font-semibold text-[#154212] mt-6">9. Children&apos;s Privacy</h2>
      <p>
        Kakatua is not directed at children under 13. We do not knowingly collect
        personal information from children under 13. If we become aware that a child
        under 13 has provided us with personal data, we will delete it immediately.
      </p>

      <h2 className="text-base font-semibold text-[#154212] mt-6">10. Changes to This Policy</h2>
      <p>
        We may update this Privacy Policy periodically. Material changes will be
        communicated via the app or by email. We encourage you to review this page
        regularly.
      </p>

      <div className="mt-8 p-4 bg-[#f5f3ef] rounded-2xl border border-[#efeeea]">
        <p className="text-[11px] text-[#72796e]">
          <strong>Data Controller:</strong> Kakatua Project &middot; World<br />
          <strong>Privacy Contact:</strong> <a href="https://github.com/soms3r/kakatua" target="_blank" rel="noopener noreferrer" className="text-[#2D5A27] underline">github.com/soms3r/kakatua</a><br />
          <strong>Last updated:</strong> June 2026
        </p>
      </div>
    </LegalLayout>
  );
}
