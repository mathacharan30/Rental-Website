import React, { useEffect, useState } from "react";
import Marquee from "react-fast-marquee";
import testimonialService from "../services/testimonialService";

const Testimonials = () => {
  const [quotes, setQuotes] = useState([]);

  useEffect(() => {
    (async () => {
      try {
        const data = await testimonialService.listTopTestimonials(10);
        const mapped = (Array.isArray(data) ? data : []).map((t, idx) => ({
          id: t._id || idx,
          name: t.userName,
          handle: t.handle || "",
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
    <section className="py-20 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-10">
          <h2 className="text-3xl md:text-4xl font-semibold display-font tracking-tight text-white">
            Customer <span className="text-violet-400">Reviews</span>
          </h2>
          <p className="text-sm text-neutral-500 mt-3 max-w-md mx-auto">
            What our customers say about their rental experience
          </p>
        </div>

        <div className="relative">
          {/* Fade edges */}
          <div className="absolute left-0 z-10 h-full w-24 bg-gradient-to-r from-[#0e0e0e] to-transparent" />
          <div className="absolute right-0 z-10 h-full w-24 bg-gradient-to-l from-[#0e0e0e] to-transparent" />

          <Marquee
            pauseOnHover={true}
            gradient={false}
            speed={40}
            className="py-4"
          >
            {quotes.concat(quotes).map((q, index) => (
              <div
                key={`${q.id}-${index}`}
                className="relative md:w-[320px] w-64 mx-2 glass rounded-xl p-6 flex flex-col justify-between md:h-72 h-60 hover:border-white/15 transition-colors duration-300 group"
              >
                <div>
                  <div className="text-3xl text-violet-400 font-bold mb-3">
                    "
                  </div>
                  <p className="text-sm text-neutral-300 leading-relaxed">
                    {q.text}
                  </p>
                </div>

                <div className="mt-4 pt-4 border-t border-white/10">
                  <p className="font-semibold text-white text-sm tracking-tight">
                    {q.name}
                  </p>
                  <p className="text-xs text-violet-400">{q.handle}</p>
                </div>
              </div>
            ))}
          </Marquee>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
