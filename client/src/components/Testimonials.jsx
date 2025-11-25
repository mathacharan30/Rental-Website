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
    <section className="py-14 max-w-6xl mx-auto bg-base-off-white overflow-hidden">
      <div className="px-2 items-center justify-center">
        <div className="text-center mb-6">
          <h2 className="text-2xl  tracking-tighter font-medium  text-base-charcoal">
            <span className="font-extrabold text-pink-800">/</span> Straight
            from the Source
          </h2>
          <p className="text-xs md:text-sm text-neutral-600 mt-2 max-w-md mx-auto">
            Voices of our community — elegance shared, stories told.
          </p>
        </div>
        <div className="relative">
          <div className="absolute left-0 z-10 h-full w-20 bg-linear-to-r from-[#f7f7f7] to-transparent"></div>
          <div className="absolute right-0 z-10 h-full w-20 bg-linear-to-l from-[#f7f7f7] to-transparent"></div>
          <Marquee
            pauseOnHover={true}
            gradient={false}
            speed={50}
            className="p-4"
          >
            {quotes.concat(quotes).map((q, index) => (
              <div
                key={`${q.id}-${index}`}
                className="relative md:w-[300px] w-60  mx-2 bg-white text-base-off-white justify-between rounded-xl p-6 flex flex-col md:h-78 h-68"
              >
                <div className="w-8 h-8 text-7xl text-pink-800 absolute -top-4 -left-3">
                  *
                </div>
                <p className="text-base font-light text-neutral-900 leading-tight">
                  {q.text}
                </p>
                <div className="mt-6 pt-4 border-t border-neutral-300">
                  <p className="font-bold text-black tracking-tight">
                    {q.name}
                  </p>
                  <p className="text-sm text-pink-900">{q.handle}</p>
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
