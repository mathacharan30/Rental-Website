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
    <section className="relative py-24 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-10">
          <h2 className="text-4xl md:text-4xl font-medium instrument-serif tracking-wide text-white">
            - Customer <span className="text-violet-400 italic">Love -</span>
          </h2>
          <p className="text-neutral-400 mt-3 max-w-md mx-auto text-sm">
            Real experiences from people who used our platform
          </p>
        </div>

        {loading ? (
          <TestimonialsSkeleton count={4} />
        ) : (
          <div className="relative overflow-hidden ">
            <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-24 bg-linear-to-r from-[#0a0a0a] via-[#0a0a0a]/95 to-transparent" />
            <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-24 bg-linear-to-l from-[#0a0a0a] via-[#0a0a0a]/95 to-transparent" />

            <Marquee gradient={false} speed={50} pauseOnHover autoFill={true}>
              <div className="flex overflow-y-hidden py-2">
                {quotes.map((q) => (
                  <article
                    key={q.id}
                    className="group relative w-62 shrink-0 rounded-tr-2xl mx-2 rounded-bl-2xl p-px border-2 border-violet-400/20 hover:border-violet-400/40 transition-colors overflow-hidden"
                  >
                    <div className="h-full rounded-2xl bg-black/10 p-10 flex flex-col justify-between transition-all duration-300 group-hover:scale-[1.03] group-hover:shadow-[0_0_40px_rgba(139,92,246,0.25)]">
                      <div className="mt-6 flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-violet-500/20 flex items-center justify-center text-sm font-semibold text-violet-300">
                          {q.name?.charAt(0)}
                        </div>

                        <div>
                          <p className="text-white text-sm font-medium">
                            {q.name}
                          </p>
                          <p className="text-xs text-violet-400">{q.handle}</p>
                        </div>
                      </div>
                      <p className="text-neutral-300 py-6 text-sm leading-relaxed">
                        “{q.text}”
                      </p>
                    </div>

                    <div className="mt-4 flex gap-1 text-violet-400 text-xs">
                      ★ ★ ★ ★ ★
                    </div>
                  </article>
                ))}
              </div>
            </Marquee>
          </div>
        )}

        <div className="mt-12 text-center">
          <a
            href={INFO_VIDEO_LINK}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-violet-500/10 border border-violet-400/30 text-violet-300 hover:bg-violet-500/20 hover:scale-105 transition-all text-sm"
          >
            ▶ Watch Info Video
          </a>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
