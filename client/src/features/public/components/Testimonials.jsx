import React, { useEffect, useState } from "react";
import Marquee from "react-fast-marquee";
import testimonialService from "../../../services/testimonialService";

const INFO_VIDEO_LINK = "https://www.youtube.com/";

const Testimonials = () => {
  const [quotes, setQuotes] = useState([]);

  useEffect(() => {
    (async () => {
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
      }
    })();
  }, []);

  return (
    <section className="relative py-24 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-10">
          <h2 className="text-4xl font-semibold text-white tracking-tight">
            Customer <span className="text-violet-400">Love</span>
          </h2>
          <p className="text-neutral-400 mt-3 max-w-md mx-auto text-sm">
            Real experiences from people who used our platform
          </p>
        </div>

        <Marquee gradient={false} speed={50} pauseOnHover>
          <div className="flex gap-6">
            {quotes.map((q) => (
              <article
                key={q.id}
                className="group relative w-72 shrink-0 rounded-tr-2xl rounded-bl-2xl p-[1px]  border border-violet-400/20 hover:border-violet-400/40 transition-colors"
              >
                <div className="h-full rounded-2xl bg-black/10 p-10 flex flex-col justify-between transition-all duration-300 group-hover:scale-[1.03] group-hover:shadow-[0_0_40px_rgba(139,92,246,0.25)]">
                  <div>
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
                </div>
              </article>
            ))}
          </div>
        </Marquee>

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
