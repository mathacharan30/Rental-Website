// src/pages/Main/PrivacyPolicy.jsx
import React from "react";
import { motion } from "framer-motion";

const Section = ({ title, children }) => (
  <div className="mb-10">
    <h2 className="text-xl font-bold text-white mb-3">{title}</h2>
    <div className="text-neutral-400 leading-relaxed space-y-3">{children}</div>
  </div>
);

const PrivacyPolicy = () => (
  <motion.div
    className="min-h-screen bg-[#0e0e0e]"
    initial={{ opacity: 0, y: 16 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5 }}
  >
    {/* Header */}
    <div className="py-16 px-4 text-center">
      <div>
        <h1 className="text-4xl font-bold display-font text-white">
          Privacy Policy
        </h1>
        <p className="mt-3 text-neutral-500 text-sm">
          Last updated: February 2026
        </p>
      </div>
    </div>

    <div className="max-w-3xl mx-auto px-4 py-14">
      <Section title="1. Introduction">
        <p>
          People &amp; Style ("we", "our", "us") is committed to protecting your
          personal information. This Privacy Policy explains what data we
          collect, how we use it, and your rights regarding it when you use our
          website and services.
        </p>
      </Section>

      <Section title="2. Information We Collect">
        <p>We collect the following categories of information:</p>
        <ul className="list-disc pl-5 space-y-1">
          <li>
            <strong className="text-white">Account Information:</strong> Name,
            email address, phone number, and delivery address when you register.
          </li>
          <li>
            <strong className="text-white">Order Information:</strong> Details
            of garments rented, rental dates, and payment history.
          </li>
          <li>
            <strong className="text-white">Usage Data:</strong> Pages visited,
            time spent on site, browser type, and device information collected
            automatically.
          </li>
          <li>
            <strong className="text-white">Communication Data:</strong> Messages
            or queries you send to our support team.
          </li>
        </ul>
      </Section>

      <Section title="3. How We Use Your Information">
        <p>Your information is used to:</p>
        <ul className="list-disc pl-5 space-y-1">
          <li>Process and fulfil rental orders.</li>
          <li>
            Send order confirmations, delivery updates, and return reminders.
          </li>
          <li>Respond to customer service enquiries.</li>
          <li>
            Improve our website, product catalogue, and overall service quality.
          </li>
          <li>Send promotional emails (you may unsubscribe at any time).</li>
          <li>Comply with legal obligations under Indian law.</li>
        </ul>
      </Section>

      <Section title="4. Sharing Your Information">
        <p>We do not sell your personal data. We may share it with:</p>
        <ul className="list-disc pl-5 space-y-1">
          <li>
            <strong className="text-white">Delivery Partners:</strong> Name and
            address shared solely to fulfil your order.
          </li>
          <li>
            <strong className="text-white">Payment Processors:</strong> Secure
            third-party gateways (e.g., Razorpay) who process your payment under
            their own privacy policy.
          </li>
          <li>
            <strong className="text-white">Legal Authorities:</strong> When
            required by law, court order, or government regulation.
          </li>
        </ul>
      </Section>

      <Section title="5. Data Retention">
        <p>
          We retain your personal data for as long as your account is active or
          as needed to provide services. You may request deletion of your
          account at any time by contacting us. Some data may be retained longer
          where required by law.
        </p>
      </Section>

      <Section title="6. Cookies">
        <p>
          Our website uses cookies to improve your browsing experience, remember
          your preferences, and analyse site traffic. You can disable cookies in
          your browser settings, but some features may not function correctly as
          a result.
        </p>
      </Section>

      <Section title="7. Data Security">
        <p>
          We implement industry-standard security measures including HTTPS
          encryption, secure servers, and access controls to protect your
          information. However, no method of transmission over the internet is
          100% secure and we cannot guarantee absolute security.
        </p>
      </Section>

      <Section title="8. Your Rights">
        <p>Under applicable law, you have the right to:</p>
        <ul className="list-disc pl-5 space-y-1">
          <li>Access the personal data we hold about you.</li>
          <li>Correct inaccurate or incomplete data.</li>
          <li>Request deletion of your data ("right to be forgotten").</li>
          <li>Opt out of marketing communications at any time.</li>
        </ul>
        <p>
          To exercise any of these rights, contact us at{" "}
          <a
            href="mailto:hello@peopleandstyle.in"
            className="text-violet-400 hover:underline"
          >
            hello@peopleandstyle.in
          </a>
          .
        </p>
      </Section>

      <Section title="9. Third-Party Links">
        <p>
          Our website may contain links to third-party websites. We are not
          responsible for the privacy practices of those sites and encourage you
          to review their privacy policies before providing any information.
        </p>
      </Section>

      <Section title="10. Changes to This Policy">
        <p>
          We may update this Privacy Policy from time to time. The latest
          version will always be available on this page with the updated date.
          Continued use of our Service after changes constitutes acceptance of
          the revised policy.
        </p>
      </Section>

      <Section title="11. Contact Us">
        <p>
          For any privacy-related questions, please reach out to us at:
          <br />
          <a
            href="mailto:hello@peopleandstyle.in"
            className="text-violet-400 hover:underline"
          >
            hello@peopleandstyle.in
          </a>
          <br />
          People &amp; Style, Mysuru, Karnataka, India – 570026
        </p>
      </Section>
    </div>
  </motion.div>
);

export default PrivacyPolicy;
