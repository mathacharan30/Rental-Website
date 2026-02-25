// src/pages/Main/RefundPolicy.jsx
import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const Section = ({ title, children }) => (
  <div className="mb-10">
    <h2 className="text-xl font-bold text-black mb-3">{title}</h2>
    <div className="text-neutral-600 leading-relaxed space-y-3">{children}</div>
  </div>
);

const timelineItems = [
  { window: '7+ days before delivery', refund: '100% refund', color: 'bg-green-100 text-green-700 border-green-200' },
  { window: '3–6 days before delivery', refund: '50% refund', color: 'bg-yellow-100 text-yellow-700 border-yellow-200' },
  { window: '1–2 days before delivery', refund: '25% refund', color: 'bg-orange-100 text-orange-700 border-orange-200' },
  { window: 'Same day / after dispatch', refund: 'No refund', color: 'bg-red-100 text-red-700 border-red-200' },
];

const RefundPolicy = () => (
  <motion.div
    className="min-h-screen bg-[#f7f7f7]"
    initial={{ opacity: 0, y: 16 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5 }}
  >
    {/* Header */}
    <div className="bg-black text-white py-14 px-4 rounded-b-3xl text-center">
      <p className="text-pink-400 text-xs font-semibold uppercase tracking-widest mb-2">Legal</p>
      <h1 className="text-4xl font-bold">Refund &amp; Cancellation Policy</h1>
      <p className="mt-3 text-neutral-400 text-sm">Last updated: February 2026</p>
    </div>

    <div className="max-w-3xl mx-auto px-4 py-14">

      <Section title="1. Overview">
        <p>
          We want you to love your rental experience. If plans change, we have a fair cancellation policy designed to be transparent about what refunds are available depending on how early you cancel.
        </p>
      </Section>

      <Section title="2. Cancellation & Refund Timeline">
        <p>Refunds are calculated based on the time of cancellation relative to your scheduled delivery date:</p>
        <div className="mt-4 space-y-3">
          {timelineItems.map((item) => (
            <div key={item.window} className={`flex items-center justify-between border rounded-xl px-5 py-4 ${item.color}`}>
              <span className="font-medium text-sm">{item.window}</span>
              <span className="font-bold text-sm">{item.refund}</span>
            </div>
          ))}
        </div>
        <p className="text-sm mt-3 text-neutral-500">Refunds are credited to the original payment method within 5–7 business days.</p>
      </Section>

      <Section title="3. How to Cancel">
        <p>To cancel an order, please:</p>
        <ul className="list-disc pl-5 space-y-1">
          <li>Log in to your account and navigate to <strong>My Orders</strong>.</li>
          <li>Select the order and click <strong>Cancel Order</strong>.</li>
          <li>Alternatively, contact us directly at <a href="mailto:hello@peopleandstyle.in" className="text-pink-600 hover:underline">hello@peopleandstyle.in</a> or call <a href="tel:+918431094754" className="text-pink-600 hover:underline">+91 84310 94754</a>.</li>
        </ul>
      </Section>

      <Section title="4. Non-Refundable Situations">
        <p>Refunds will <strong>not</strong> be issued in the following circumstances:</p>
        <ul className="list-disc pl-5 space-y-1">
          <li>Order is cancelled on the day of or after dispatch.</li>
          <li>Garment returned in a damaged, stained, or altered condition (damage charges may apply instead).</li>
          <li>Rental period extended without prior agreement and full payment for the extension.</li>
          <li>Item reported lost or stolen — full replacement cost will be charged.</li>
        </ul>
      </Section>

      <Section title="5. Wrong or Damaged Item Received">
        <p>
          If you receive an item that is incorrect or noticeably damaged upon arrival, please photograph it immediately and
          contact us within <strong>2 hours of delivery</strong>. We will arrange a replacement where possible or issue a full
          refund at our discretion.
        </p>
      </Section>

      <Section title="6. Delivery Failures">
        <p>If we are unable to deliver your order due to reasons on our end (logistics failure, unavailability of the item), you will receive a <strong>full refund</strong> within 3–5 business days.</p>
        <p>If delivery fails due to an incorrect address or no one being available to receive, re-delivery may be arranged at an additional charge. A refund will not be issued in such cases.</p>
      </Section>

      <Section title="7. Security Deposit">
        <p>Some orders may require a refundable security deposit. This deposit will be refunded within 3 business days after the item is returned in good condition.</p>
      </Section>

      <Section title="8. Contact Us">
        <p>
          For any refund or cancellation queries, reach us at:
        </p>
        <ul className="list-none space-y-1">
          <li>📧 <a href="mailto:hello@peopleandstyle.in" className="text-pink-600 hover:underline">hello@peopleandstyle.in</a></li>
          <li>📞 <a href="tel:+918431094754" className="text-pink-600 hover:underline">+91 84310 94754</a></li>
          <li>📍 Mysuru, Karnataka, India – 570026</li>
        </ul>
      </Section>

    </div>
  </motion.div>
);

export default RefundPolicy;
