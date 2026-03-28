import { Helmet } from "react-helmet-async";

export default function ComingSoon() {
  return (
    <div className="min-h-[95vh] w-full overflow-x-hidden flex items-center justify-center px-6">
      <Helmet>
        <title>People and Style - Coming Soon</title>
        <meta name="robots" content="noindex,nofollow" />
      </Helmet>

      <div className="w-full max-w-xl text-center rounded-3xl p-10">
        <p className="text-[11px] uppercase tracking-[0.20em] text-white/70 md:text-sm">
          Under development
        </p>

        <h1 className="mt-3 text-3xl leading-tight md:text-4xl font-semibold display-font">
          People & Style
        </h1>

        <p className="mt-3 text-sm text-white/70 md:text-base">
          We’re putting the finishing touches on the experience. Check back
          shortly.
        </p>

        <div className="mt-6 flex items-center justify-center gap-3">
          <span className="text-sm text-[#d8b4fe]">Launching soon</span>
        </div>
      </div>
    </div>
  );
}
