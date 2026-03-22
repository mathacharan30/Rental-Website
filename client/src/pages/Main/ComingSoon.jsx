import { Helmet } from "react-helmet-async";

export default function ComingSoon() {
  return (
    <div className="min-h-[95vh] w-full overflow-x-hidden flex items-center justify-center px-6">
      <Helmet>
        <title>People and Style - Coming Soon</title>
        <meta name="robots" content="noindex,nofollow" />
      </Helmet>

      <div className="relative isolate aspect-square w-full max-w-[420px] rounded-full text-center">
        <div className="pointer-events-none absolute -inset-10 flex items-center justify-center">
          <div
            className="h-[70%] w-[70%] rounded-full opacity-90 animate-[spin_3s_linear_infinite]"
            style={{
              boxShadow:
                "0px 20px 50px #ffffff70, 0px -20px 50px #8949ff, 20px 0px 50px #ff07fb, -20px 0px 50px #7c3aed",
            }}
          />
        </div>

        <div className="relative z-10 flex h-full w-full items-center justify-center">
          <div className="max-w-[75%]">
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
      </div>
    </div>
  );
}
