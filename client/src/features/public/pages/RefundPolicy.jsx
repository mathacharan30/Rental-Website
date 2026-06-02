// src/pages/Main/RefundPolicy.jsx
import React, { useState } from "react";
import { motion } from "framer-motion";

const Section = ({ title, children }) => (
  <div className="mb-10">
    <h2 className="text-xl font-bold text-white mb-3">{title}</h2>
    <div className="text-neutral-400 leading-relaxed space-y-3">{children}</div>
  </div>
);

const timelineItems = [
  {
    window: "7+ days before delivery",
    refund: "100% refund",
    color: "text-green-400 bg-green-500/10 border-green-500/20",
  },
  {
    window: "3–6 days before delivery",
    refund: "50% refund",
    color: "text-yellow-400 bg-yellow-500/10 border-yellow-500/20",
  },
  {
    window: "1–2 days before delivery",
    refund: "25% refund",
    color: "text-orange-400 bg-orange-500/10 border-orange-500/20",
  },
  {
    window: "Same day / after dispatch",
    refund: "No refund",
    color: "text-red-400 bg-red-500/10 border-red-500/20",
  },
];

const RefundPolicy = () => {
  const [view, setView] = useState("rentals"); // rentals | combos

  const RentalsContent = (
    <div>
      <Section title="1. Overview">
        <p>
          We want you to love your rental experience. If plans change, we have a
          fair cancellation policy designed to be transparent about what refunds
          are available depending on how early you cancel.
        </p>
      </Section>

      <Section title="2. Cancellation & Refund Timeline">
        <p>
          Refunds are calculated based on the time of cancellation relative to
          your scheduled delivery date:
        </p>
        <div className="mt-4 space-y-3">
          {timelineItems.map((item) => (
            <div
              key={item.window}
              className={`flex items-center justify-between border rounded-xl px-5 py-4 ${item.color}`}
            >
              <span className="font-medium text-sm">{item.window}</span>
              <span className="font-bold text-sm">{item.refund}</span>
            </div>
          ))}
        </div>
        <p className="text-sm mt-3 text-neutral-500">
          Refunds will be credited back to the original payment method within{" "}
          <strong className="text-white">7 business days</strong>.
        </p>
      </Section>

      <Section title="3. How to Cancel">
        <p>To cancel an order, please:</p>
        <ul className="list-disc pl-5 space-y-1">
          <li>
            Log in to your account and navigate to{" "}
            <strong className="text-white">My Orders</strong>.
          </li>
          <li>
            Select the order and click{" "}
            <strong className="text-white">Cancel Order</strong>.
          </li>
          <li>
            Alternatively, contact us directly at{" "}
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
          </li>
        </ul>
      </Section>

      <Section title="4. Non-Refundable Situations">
        <p>
          Refunds will <strong className="text-white">not</strong> be issued in
          the following circumstances:
        </p>
        <ul className="list-disc pl-5 space-y-1">
          <li>Order is cancelled on the day of or after dispatch.</li>
          <li>
            Garment returned in a damaged, stained, or altered condition (damage
            charges may apply instead).
          </li>
          <li>
            Rental period extended without prior agreement and full payment for
            the extension.
          </li>
          <li>
            Item reported lost or stolen — full replacement cost will be
            charged.
          </li>
        </ul>
      </Section>

      <Section title="5. Wrong or Damaged Item Received">
        <p>
          If you receive an item that is incorrect or noticeably damaged upon
          arrival, please photograph it immediately and contact us within{" "}
          <strong className="text-white">2 hours of delivery</strong>. We will
          arrange a replacement where possible or issue a full refund at our
          discretion.
        </p>
      </Section>

      <Section title="6. Delivery Failures">
        <p>
          If we are unable to deliver your order due to reasons on our end
          (logistics failure, unavailability of the item), you will receive a{" "}
          <strong className="text-white">full refund</strong> within 3–5
          business days.
        </p>
        <p>
          If delivery fails due to an incorrect address or no one being
          available to receive, re-delivery may be arranged at an additional
          charge. A refund will not be issued in such cases.
        </p>
      </Section>

      <Section title="7. Security Deposit">
        <p>
          Some orders may require a refundable security deposit. This deposit
          will be refunded within 3 business days after the item is returned in
          good condition.
        </p>
      </Section>

      <Section title="8. Return Policy">
        <p>
          We have a <strong className="text-white">7-day return policy</strong>.
          If you are not satisfied with your order, you may initiate a return
          within 7 days of delivery. The item must be returned in its original
          condition — unworn, undamaged, and with all tags intact.
        </p>
        <p>
          To initiate a return, please contact us at{" "}
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
          </a>{" "}
          within the 7-day window.
        </p>
      </Section>

      <Section title="9. Exchange & Replacement">
        <p>
          All approved exchanges and replacements will be completed within{" "}
          <strong className="text-white">7 business days</strong> from the date
          of approval. Once your exchange or replacement request is reviewed and
          accepted, we will process and dispatch the replacement item promptly.
        </p>
      </Section>

      <Section title="10. Shipping Policy">
        <p>
          Products will be delivered within{" "}
          <strong className="text-white">7–15 business days</strong> from the
          date of order confirmation. Delivery timelines may vary based on your
          location and product availability.
        </p>
        <p>
          You will receive a tracking update once your order has been
          dispatched. For any shipping-related queries, feel free to reach out
          to us.
        </p>
      </Section>

      <Section title="11. Contact Us">
        <p>For any refund or cancellation queries, reach us at:</p>
        <ul className="list-none space-y-1">
          <li>
            🏢 <strong className="text-white">Kan Overseas</strong> — Handled by
            Sagar S
          </li>
          <li>
            📧{" "}
            <a
              href="mailto:hello@peopleandstyle.in"
              className="text-violet-400 hover:underline"
            >
              hello@peopleandstyle.in
            </a>
          </li>
          <li>
            📞{" "}
            <a
              href="tel:+918431094754"
              className="text-violet-400 hover:underline"
            >
              +91 84310 94754
            </a>
          </li>
          <li>📍 Mysuru, Karnataka, India – 570026</li>
        </ul>
      </Section>
    </div>
  );

  const CombosContent = (
    <div className="space-y-6">
      <Section title="1. Overview">
        <p>
          We want every client to have a smooth and memorable beauty experience.
          If plans change, we have a transparent cancellation policy designed to
          clearly explain refund eligibility based on the time of cancellation.
        </p>
      </Section>

      <Section title="2. Cancellation & Refund Timeline">
        <p>
          Refunds are calculated based on the time of cancellation relative to
          your scheduled appointment date:
        </p>
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
        <p className="mt-2">
          Refunds will be credited to the original payment method within 7
          business days.
        </p>
      </Section>

      <Section title="3. How to Cancel">
        <ul className="list-disc pl-5">
          <li>Contact us through WhatsApp or phone.</li>
          <li>Provide your booking details and appointment date.</li>
          <li>
            Cancellation requests must be submitted before the applicable refund
            deadline.
          </li>
        </ul>
      </Section>

      <Section title="4. Non-Refundable Situations">
        <p>Refunds will not be issued in the following circumstances:</p>
        <ul className="list-disc pl-5">
          <li>Cancellation on the day of the appointment.</li>
          <li>Client fails to arrive at the agreed location.</li>
          <li>Client is unavailable at the scheduled time.</li>
          <li>
            Service cannot be completed due to client-related delays exceeding
            one hour.
          </li>
          <li>Client changes their mind after the service has begun.</li>
        </ul>
      </Section>

      <Section title="5. Artist Unavailability">
        <p>
          If the assigned makeup artist becomes unavailable due to illness,
          emergency, or unforeseen circumstances: People &amp; Style will
          attempt to arrange a replacement artist. If a replacement cannot be
          arranged, a full refund will be provided.
        </p>
      </Section>

      <Section title="6. Service Concerns">
        <p>
          If you are dissatisfied with the service: Concerns must be raised
          immediately during the appointment whenever possible. People &amp;
          Style will review the issue and determine an appropriate resolution.
          Refunds are not guaranteed after successful completion of services.
        </p>
      </Section>

      <Section title="7. Rescheduling Policy">
        <p>
          Clients may request rescheduling subject to artist availability.
          Approved reschedules may be adjusted against the advance payment.
          Repeated rescheduling requests may require a new booking confirmation.
        </p>
      </Section>

      <Section title="8. Travel & Location Changes">
        <p>
          If the appointment location is changed after confirmation: Additional
          travel charges may apply. If the new location is outside the artist's
          service area, the booking may be cancelled without refund.
        </p>
      </Section>

      <Section title="9. Force Majeure">
        <p>
          People &amp; Style shall not be responsible for cancellations or
          delays caused by natural disasters, government restrictions, severe
          weather, transportation disruptions, or other events beyond reasonable
          control.
        </p>
      </Section>
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
      <div className="py-16 px-4 text-center">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-4xl font-bold display-font text-white">
            Refund &amp; Cancellation Policy
          </h1>
          <p className="mt-2 text-neutral-300 text-sm font-medium">
            People &amp; Style
          </p>
          <p className="mt-1 text-neutral-500 text-sm">
            Last updated: June 2026
          </p>

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

      <div className="max-w-3xl mx-auto px-4 py-14">
        {view === "rentals" ? RentalsContent : CombosContent}
      </div>
    </motion.div>
  );
};

export default RefundPolicy;
