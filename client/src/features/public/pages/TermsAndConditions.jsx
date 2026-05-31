// src/pages/Main/TermsAndConditions.jsx
import React, { useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";

const Section = ({ title, children }) => (
  <div className="mb-10">
    <h2 className="text-xl font-bold text-white mb-3">{title}</h2>
    <div className="text-neutral-400 leading-relaxed space-y-3">{children}</div>
  </div>
);

const TermsAndConditions = () => {
  const [view, setView] = useState("rentals"); // rentals | combos

  const RentalsContent = (
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
          All products listed on our platform are available for <strong className="text-white">rental only</strong>.
          Placing an order constitutes a rental agreement between you ("Customer") and People
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
          <li>Return items in the same condition as received (excluding normal wear).</li>
          <li>Not alter, stitch, cut, bleach, or iron garments in a manner that causes damage.</li>
          <li>Not use heavy perfumes or sprays directly on delicate fabrics.</li>
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
          <li>Heavy staining that cannot be removed by professional cleaning.</li>
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
          Please refer to our <Link to="/refund" className="text-violet-400 hover:underline">Refund &amp; Cancellation Policy</Link> for details on cancellations and eligible refunds.
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
          For questions about these Terms, please contact us at <a href="mailto:hello@peopleandstyle.in" className="text-violet-400 hover:underline">hello@peopleandstyle.in</a> or call <a href="tel:+918431094754" className="text-violet-400 hover:underline">+91 84310 94754</a>.
        </p>
      </Section>
    </div>
  );

  const CombosContent = (
    <div className="max-w-3xl mx-auto px-4 py-14 space-y-8">
      <div>
        <h2 className="text-2xl font-semibold text-white mb-2">Refund &amp; Cancellation Policy</h2>
        <p className="text-sm text-neutral-500 mb-3">People &amp; Style – Makeup Services</p>

        <Section title="1. Overview">
          <p>We want every client to have a smooth and memorable beauty experience. If plans change, we have a transparent cancellation policy designed to clearly explain refund eligibility based on the time of cancellation.</p>
        </Section>

        <Section title="2. Cancellation & Refund Timeline">
          <p>Refunds are calculated based on the time of cancellation relative to your scheduled appointment date:</p>
          <table className="w-full text-sm text-neutral-300 border-collapse">
            <tbody>
              <tr>
                <td className="py-2">7+ days before appointment</td>
                <td className="py-2">100% refund of advance payment</td>
              </tr>
              <tr>
                <td className="py-2">3–6 days before appointment</td>
                <td className="py-2">50% refund of advance payment</td>
              </tr>
              <tr>
                <td className="py-2">1–2 days before appointment</td>
                <td className="py-2">25% refund of advance payment</td>
              </tr>
              <tr>
                <td className="py-2">Same day / appointment day</td>
                <td className="py-2">No refund</td>
              </tr>
            </tbody>
          </table>
          <p className="mt-2">Refunds will be credited to the original payment method within 7 business days.</p>
        </Section>

        <Section title="3. How to Cancel">
          <ul className="list-disc pl-5">
            <li>Contact us through WhatsApp or phone.</li>
            <li>Provide your booking details and appointment date.</li>
            <li>Cancellation requests must be submitted before the applicable refund deadline.</li>
          </ul>
        </Section>

        <Section title="4. Non-Refundable Situations">
          <p>Refunds will not be issued in the following circumstances:</p>
          <ul className="list-disc pl-5">
            <li>Cancellation on the day of the appointment.</li>
            <li>Client fails to arrive at the agreed location.</li>
            <li>Client is unavailable at the scheduled time.</li>
            <li>Service cannot be completed due to client-related delays exceeding one hour.</li>
            <li>Client changes their mind after the service has begun.</li>
          </ul>
        </Section>

        <Section title="5. Artist Unavailability">
          <p>If the assigned makeup artist becomes unavailable due to illness, emergency, or unforeseen circumstances: People &amp; Style will attempt to arrange a replacement artist. If a replacement cannot be arranged, a full refund will be provided.</p>
        </Section>

        <Section title="6. Service Concerns">
          <p>If you are dissatisfied with the service: Concerns must be raised immediately during the appointment whenever possible. People &amp; Style will review the issue and determine an appropriate resolution. Refunds are not guaranteed after successful completion of services.</p>
        </Section>

        <Section title="7. Rescheduling Policy">
          <p>Clients may request rescheduling subject to artist availability. Approved reschedules may be adjusted against the advance payment. Repeated rescheduling requests may require a new booking confirmation.</p>
        </Section>

        <Section title="8. Travel & Location Changes">
          <p>If the appointment location is changed after confirmation: Additional travel charges may apply. If the new location is outside the artist's service area, the booking may be cancelled without refund.</p>
        </Section>

        <Section title="9. Force Majeure">
          <p>People &amp; Style shall not be responsible for cancellations or delays caused by natural disasters, government restrictions, severe weather, transportation disruptions, or other events beyond reasonable control.</p>
        </Section>
      </div>

      <div>
        <h2 className="text-2xl font-semibold text-white mb-2">Terms &amp; Conditions</h2>
        <p className="text-sm text-neutral-500 mb-3">Last Updated: June 2026</p>

        <Section title="1. Acceptance of Terms">
          <p>By booking or using any makeup, hairstyling, saree draping, or beauty services offered by People &amp; Style ("Company"), you agree to be bound by these Terms &amp; Conditions. If you do not agree, please do not use our services.</p>
        </Section>

        <Section title="2. Service Agreement">
          <p>People &amp; Style provides professional beauty services including makeup, hairstyling, saree draping, and related styling services. A booking is considered confirmed only after advance payment is received and acknowledged by People &amp; Style.</p>
        </Section>

        <Section title="3. Eligibility">
          <p>Clients must be at least 18 years old or have the consent of a parent/guardian to book our services. You agree that all information provided during booking is accurate and complete.</p>
        </Section>

        <Section title="4. Booking &amp; Confirmation">
          <p>Bookings are accepted subject to artist availability. Event date and time are reserved only after confirmation. Advance payment is required to secure the booking. The remaining balance must be paid before or on the event day.</p>
        </Section>

        <Section title="5. Client Responsibilities">
          <p>Clients agree to arrive on time, inform us of allergies or sensitivities, provide a clean workspace, and share reference images in advance. People &amp; Style is not responsible for dissatisfaction resulting from undisclosed allergies or conditions.</p>
        </Section>

        <Section title="6. Travel &amp; Venue Policy">
          <p>Travel charges may apply depending on location. Additional charges may apply for early morning, late-night, or outstation bookings. Parking or venue fees must be borne by the client if applicable.</p>
        </Section>

        <Section title="7. Service Modifications">
          <p>Changes to the selected package or service must be requested in advance and are subject to availability. Additional services requested on the event day may incur extra charges.</p>
        </Section>

        <Section title="8. Cancellation Policy">
          <p>Please refer to our Refund &amp; Cancellation Policy for complete details regarding cancellations, refunds, and rescheduling.</p>
        </Section>

        <Section title="9. Photography &amp; Portfolio Usage">
          <p>People &amp; Style may use photographs or videos of completed work for marketing, social media, website portfolios, and promotional purposes. Clients who do not wish to be featured must inform us before the service begins.</p>
        </Section>

        <Section title="10. Limitation of Liability">
          <p>While we use professional products and follow industry standards, People &amp; Style shall not be liable for allergic reactions due to undisclosed sensitivities, delays caused by traffic or weather, or indirect/consequential damages arising from the use of our services.</p>
        </Section>

        <Section title="11. Governing Law">
          <p>These Terms &amp; Conditions shall be governed by the laws of India. Any disputes shall be subject to the jurisdiction of courts in Mysuru, Karnataka.</p>
        </Section>

        <Section title="12. Contact Us">
          <p>For questions, contact: People &amp; Style — hello@peopleandstyle.in — +91 84310 94754 — Mysuru, Karnataka, India – 570026</p>
        </Section>
      </div>

      <div>
        <h2 className="text-2xl font-semibold text-white mb-2">Privacy Policy</h2>
        <p className="text-sm text-neutral-500 mb-3">Last Updated: June 2026</p>

        <Section title="1. Introduction">
          <p>People &amp; Style ("we", "our", "us") is committed to protecting your personal information. This Privacy Policy explains what information we collect, how we use it, and your rights regarding your data when you use our makeup, hairstyling, saree draping, and beauty services.</p>
        </Section>

        <Section title="2. Information We Collect">
          <p>We collect personal information (name, phone, email, event location), booking information, communication data, and photos/videos (with consent).</p>
        </Section>

        <Section title="3. How We Use Your Information">
          <p>To confirm/manage bookings, process payments, provide support, improve services, send marketing (with consent), and comply with legal obligations.</p>
        </Section>

        <Section title="4. Sharing Your Information">
          <p>We do not sell your data. We may share with makeup artists/service partners, payment processors, and legal authorities when required.</p>
        </Section>

        <Section title="5. Data Retention">
          <p>We retain customer information only as necessary to provide services, maintain records, and comply with law. You may request deletion by contacting us.</p>
        </Section>

        <Section title="6. Photos &amp; Portfolio Usage">
          <p>With your permission, People &amp; Style may use photos/videos for social media, website galleries, and marketing. Clients may request exclusion before the service begins.</p>
        </Section>

        <Section title="7. Data Security">
          <p>We implement reasonable security measures to protect your information but cannot guarantee 100% security.</p>
        </Section>

        <Section title="8. Your Rights">
          <p>You have the right to access, correct, or delete your data, and to withdraw consent for marketing. Contact us to exercise these rights.</p>
        </Section>

        <Section title="9. Third-Party Links">
          <p>Our site may link to third parties; we are not responsible for their privacy practices.</p>
        </Section>

        <Section title="10. Changes to This Policy">
          <p>We may update this policy periodically; changes will be posted with the effective date.</p>
        </Section>

        <Section title="11. Contact Us">
          <p>For privacy questions, contact: hello@peopleandstyle.in — +91 84310 94754 — Mysuru, Karnataka, India – 570026</p>
        </Section>
      </div>
    </div>
  );

  return (
    <motion.div
      className="min-h-screen bg-[#0e0e0e]"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Header */}
      <div className="py-12 px-4 text-center">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-4xl font-bold display-font text-white">Terms &amp; Conditions</h1>
          <p className="mt-3 text-neutral-500 text-sm">Last updated: June 2026</p>

          <div className="mt-6 inline-flex rounded-full bg-white/3 p-1">
            <button
              onClick={() => setView("rentals")}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${view === "rentals" ? "bg-violet-600 text-white" : "text-neutral-200"}`}
            >
              Rentals
            </button>
            <button
              onClick={() => setView("combos")}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${view === "combos" ? "bg-violet-600 text-white" : "text-neutral-200"}`}
            >
              Combos (Makeup &amp; Styling)
            </button>
          </div>
        </div>
      </div>

      {view === "rentals" ? RentalsContent : CombosContent}
    </motion.div>
  );
};

export default TermsAndConditions;
