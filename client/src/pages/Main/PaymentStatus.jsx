import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { getPaymentStatus } from "../../services/paymentService";
import { useAuth } from "../../context/AuthContext";
import Loader from "../../components/Loader";
import Footer from "../../components/Footer";

const POLL_INTERVAL = 3000;  // 3 seconds
const MAX_POLLS     = 20;    // stop after ~60 seconds

const PaymentStatus = () => {
  const { merchantOrderId } = useParams();
  const navigate = useNavigate();
  const { firebaseUser } = useAuth();

  const [status, setStatus]   = useState("CHECKING"); // CHECKING | COMPLETED | FAILED | PENDING
  const [details, setDetails] = useState(null);
  const pollCount = useRef(0);

  useEffect(() => {
    let timer;

    const check = async () => {
      try {
        const res = await getPaymentStatus(merchantOrderId);
        const state = res.orderState; // COMPLETED | FAILED | PENDING

        setDetails(res);

        if (state === "COMPLETED") {
          setStatus("COMPLETED");
          return; // stop polling
        }
        if (state === "FAILED") {
          setStatus("FAILED");
          return;
        }

        // Still pending — keep polling
        pollCount.current += 1;
        if (pollCount.current >= MAX_POLLS) {
          setStatus("PENDING");
          return;
        }
        timer = setTimeout(check, POLL_INTERVAL);
      } catch {
        // On network error, keep trying a few times
        pollCount.current += 1;
        if (pollCount.current >= MAX_POLLS) {
          setStatus("FAILED");
          return;
        }
        timer = setTimeout(check, POLL_INTERVAL);
      }
    };

    check();
    return () => clearTimeout(timer);
  }, [merchantOrderId]);

  // ── Render helpers ──────────────────────────────────────────────────────────

  const card = (icon, heading, sub, color, actions) => (
    <motion.div
      className="min-h-screen flex items-center justify-center bg-[#0e0e0e] px-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="text-center glass rounded-3xl p-10 max-w-md w-full border border-white/6">
        <div className={`text-6xl mb-4 ${color}`}>{icon}</div>
        <h1 className="text-2xl font-bold text-white mb-2">{heading}</h1>
        <p className="text-neutral-400 text-sm mb-6">{sub}</p>
        {details?.amount && (
          <p className="text-neutral-500 text-xs mb-4">
            Amount: ₹{(details.amount / 100).toFixed(2)}
          </p>
        )}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          {actions}
        </div>
      </div>
    </motion.div>
  );

  if (status === "CHECKING") {
    return (
      <motion.div
        className="min-h-screen flex flex-col items-center justify-center bg-[#0e0e0e]"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <Loader />
        <p className="mt-6 text-neutral-400 text-sm animate-pulse">
          Verifying your payment…
        </p>
      </motion.div>
    );
  }

  if (status === "COMPLETED") {
    return (
      <>
        {card(
          "✅",
          "Payment Successful!",
          "Your order has been confirmed. You can view it in your profile.",
          "text-green-400",
          <>
            {firebaseUser && (
              <button
                onClick={() => navigate(`/${firebaseUser.uid}/profile`)}
                className="btn-funky rounded-xl! px-8"
              >
                <span>View My Orders</span>
              </button>
            )}
            <Link to="/" className="btn-outline-funky rounded-xl! px-8">
              Continue Shopping
            </Link>
          </>
        )}
        <Footer />
      </>
    );
  }

  if (status === "FAILED") {
    return (
      <>
        {card(
          "❌",
          "Payment Failed",
          "Your payment could not be completed. No amount has been deducted.",
          "text-red-400",
          <>
            <button
              onClick={() => navigate(-1)}
              className="btn-funky rounded-xl! px-8"
            >
              <span>Try Again</span>
            </button>
            <Link to="/" className="btn-outline-funky rounded-xl! px-8">
              Back to Home
            </Link>
          </>
        )}
        <Footer />
      </>
    );
  }

  // PENDING — timed out waiting
  return (
    <>
      {card(
        "⏳",
        "Payment Pending",
        "We're still waiting for confirmation from PhonePe. Your order will be updated once payment is verified. Please check your orders page after a few minutes.",
        "text-yellow-400",
        <>
          {firebaseUser && (
            <button
              onClick={() => navigate(`/${firebaseUser.uid}/profile`)}
              className="btn-funky rounded-xl! px-8"
            >
              <span>View My Orders</span>
            </button>
          )}
          <Link to="/" className="btn-outline-funky rounded-xl! px-8">
            Back to Home
          </Link>
        </>
      )}
      <Footer />
    </>
  );
};

export default PaymentStatus;
