// src/pages/Main/TermsAndConditions.jsx
import React from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";

const Section = ({ title, children }) => (
  <div className="mb-10">
    <h2 className="text-xl font-bold text-white mb-3">{title}</h2>
    <div className="text-neutral-400 leading-relaxed space-y-3">{children}</div>
  </div>
);

const TermsAndConditions = () => (
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
          Terms &amp; Conditions
        </h1>
        <p className="mt-3 text-neutral-500 text-sm">
          Last updated: February 2026
        </p>
      </div>
    </div>

    <div className="max-w-3xl mx-auto px-4 py-14">
      <Section title="1. Acceptance of Terms">
        <p>
          By accessing or using the People &amp; Style website and services
          ("Service"), you agree to be bound by these Terms &amp; Conditions. If
          you do not agree, please do not use our Service.
        </p>
      </Section>

      <Section title="2. Rental Agreement">
        <p>
          All products listed on our platform are available for{" "}
          <strong className="text-white">rental only</strong>. Placing an order
          constitutes a rental agreement between you ("Customer") and People
          &amp; Style ("Company").
        </p>
        <p>
          The rental period starts on the delivery date and ends on the agreed
          return date specified at checkout. Extending the rental period without
          prior approval may incur additional charges.
        </p>
      </Section>

      <Section title="3. Eligibility">
        <p>
          You must be at least 18 years of age to place a rental order. By using
          our Service you confirm that you meet this requirement and that all
          information you provide is accurate and up to date.
        </p>
      </Section>

      <Section title="4. Product Condition & Care">
        <p>
          All garments are professionally cleaned and inspected before dispatch.
          You agree to:
        </p>
        <ul className="list-disc pl-5 space-y-1">
          <li>
            Return items in the same condition as received (excluding normal
            wear).
          </li>
          <li>
            Not alter, stitch, cut, bleach, or iron garments in a manner that
            causes damage.
          </li>
          <li>
            Not use heavy perfumes or sprays directly on delicate fabrics.
          </li>
          <li>Keep garments away from open flames and sharp objects.</li>
        </ul>
      </Section>

      <Section title="5. Damage & Loss Policy">
        <p>
          Minor stains are covered under normal use. However, the following will
          attract damage charges:
        </p>
        <ul className="list-disc pl-5 space-y-1">
          <li>Irreparable tears, burns, or cuts to fabric.</li>
          <li>
            Heavy staining that cannot be removed by professional cleaning.
          </li>
          <li>Loss or theft of the rented item.</li>
        </ul>
        <p>
          Damage charges will be assessed by our team and communicated to you
          within 48 hours of return. Charges may range from a cleaning fee to
          the full replacement cost of the garment.
        </p>
      </Section>

      <Section title="6. Delivery & Returns">
        <p>
          We currently deliver within Mysuru, Karnataka and select locations
          across India. Delivery timelines are indicative and may be affected by
          public holidays or logistical constraints.
        </p>
        <p>
          It is your responsibility to ensure someone is available to receive
          the delivery. Failed deliveries may incur re-delivery charges. Items
          must be returned by the agreed date using the return packaging
          provided.
        </p>
      </Section>

      <Section title="7. Payments">
        <p>
          All payments are processed securely at the time of booking. Prices are
          displayed in Indian Rupees (INR) and include applicable taxes unless
          stated otherwise.
        </p>
        <p>
          We reserve the right to revise prices at any time. The price shown at
          the time of checkout is the price you pay.
        </p>
      </Section>

      <Section title="8. Cancellations">
        <p>
          Please refer to our{" "}
          <Link to="/refund" className="text-violet-400 hover:underline">
            Refund &amp; Cancellation Policy
          </Link>{" "}
          for details on cancellations and eligible refunds.
        </p>
      </Section>

      <Section title="9. Intellectual Property">
        <p>
          All content on this website — including text, images, logos, and
          design — is the property of People &amp; Style and may not be
          reproduced or distributed without written permission.
        </p>
      </Section>

      <Section title="10. Limitation of Liability">
        <p>
          To the extent permitted by law, People &amp; Style shall not be liable
          for any indirect, incidental, or consequential damages arising from
          the use of our Service or any rented product.
        </p>
      </Section>

      <Section title="11. Governing Law">
        <p>
          These Terms are governed by the laws of India. Any disputes shall be
          subject to the exclusive jurisdiction of the courts in Mysuru,
          Karnataka.
        </p>
      </Section>

      <Section title="12. Contact">
        <p>
          For questions about these Terms, please contact us at{" "}
          <a
            href="mailto:hello@peopleandstyle.in"
            className="text-violet-400 hover:underline"
          >
            hello@peopleandstyle.in
          </a>{" "}
          or call{" "}
          <a
            href="tel:+918431094754"
            className="text-violet-400 hover:underline"
          >
            +91 84310 94754
          </a>
          .
        </p>
      </Section>
    </div>
  </motion.div>
);

export default TermsAndConditions;
