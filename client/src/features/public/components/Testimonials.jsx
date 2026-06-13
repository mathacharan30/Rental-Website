import React, { useEffect, useState } from "react";
import Marquee from "react-fast-marquee";
import testimonialService from "../../../services/testimonialService";
import { TestimonialsSkeleton } from "../loaders";

const INFO_VIDEO_LINK = "https://www.youtube.com/";

const Testimonials = () => {
  const [quotes, setQuotes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const data = await testimonialService.listTestimonials({
          top: false,
          limit: 10,
        });

        const mapped = (Array.isArray(data) ? data : []).map((t, idx) => ({
          id: t._id || idx,
          name: t.userName,
          handle: t.handle || "@user",
          text: t.comment,
        }));

        setQuotes(mapped);
      } catch (e) {
        console.error("[Testimonials] Failed to load", e);
        setQuotes([]);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <section className="relative py-20 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-12 flex flex-col items-center justify-center">

          <h2 className="text-3xl md:text-4xl font-medium instrument-serif tracking-wide text-white">
            - Customer <span className="text-violet-400 italic">Love -</span>
          </h2>
          <p className="text-neutral-500 mt-2 max-w-md mx-auto text-xs md:text-sm">
            Real experiences from people who love our styles
          </p>
        </div>

        {loading ? (
          <TestimonialsSkeleton count={4} />
        ) : (
          <div className="relative overflow-hidden">
            <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-24 bg-gradient-to-r from-[#0a0a0a] to-transparent" />
            <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-24 bg-gradient-to-l from-[#0a0a0a] to-transparent" />

            <Marquee gradient={false} speed={40} pauseOnHover autoFill={true}>
              <div className="flex py-6">
                {quotes.map((q) => (
                  <article
                    key={q.id}
                    className="relative w-72 md:w-80 shrink-0 mx-2 rounded-2xl border border-white/6 bg-white/2 p-6 md:p-8 flex flex-col justify-between hover:border-white/10 transition-all duration-300"
                  >
                    <span className="absolute top-2 right-4 text-6xl font-serif text-violet-500/10 pointer-events-none select-none">
                      “
                    </span>

                    <div className="flex flex-col gap-3 relative z-10 flex-1">
                      <p className="text-neutral-300 text-sm leading-relaxed font-medium italic">
                        "{q.text}"
                      </p>
                    </div>

                    <div className="mt-5 flex items-center gap-3 relative z-10">
                      <div className="w-10 h-10 rounded-full bg-violet-600/10 border border-violet-500/20 flex items-center justify-center font-bold text-violet-400 text-sm shrink-0">
                        {q.name?.charAt(0) || "U"}
                      </div>
                      <div className="min-w-0">
                        <p className="text-white text-xs font-semibold truncate">
                          {q.name}
                        </p>
                        <p className="text-[10px] text-violet-400 font-medium tracking-wide">
                          {q.handle}
                        </p>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </Marquee>
          </div>
        )}

        {/* Video Button */}
        <div className="mt-12 text-center">
          <a
            href={INFO_VIDEO_LINK}
            target="_blank"
            rel="noreferrer"
            className="px-5 py-2.5 bg-white/2 shadow-inner shadow-white/24 text-neutral-400 border-b-[1.55px] border-white/7 hover:bg-white/10 hover:text-white rounded-full text-xs font-semibold transition-all inline-flex items-center gap-1.5 cursor-pointer"
          >
            <span>▶ Watch Info Video</span>
          </a>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
