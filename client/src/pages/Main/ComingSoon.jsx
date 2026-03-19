import React from "react";
import { Helmet } from "react-helmet-async";

export default function ComingSoon() {
  return (
    <div className="min-h-screen flex items-center justify-center px-6">
      <Helmet>
        <title>People and Style - Coming Soon</title>
        <meta name="robots" content="noindex,nofollow" />
      </Helmet>

      <div className="w-full max-w-xl text-center glass rounded-3xl p-10">
        <p className="text-sm uppercase tracking-[0.25em] text-white/70">
          Under development
        </p>
        <h1 className="mt-4 text-4xl md:text-5xl font-semibold display-font">
          People and Style - Coming Soon
        </h1>
        <p className="mt-4 text-white/70">
          We’re putting the finishing touches on the experience. Check back shortly.
        </p>

        <div className="mt-8 flex items-center justify-center gap-3">
          <span className="h-2 w-2 rounded-full bg-violet-400 animate-pulse" />
          <span className="text-sm text-white/60">Launching soon</span>
        </div>
      </div>
    </div>
  );
}
