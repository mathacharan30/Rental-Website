import React, { useEffect, useState } from "react";
import adminService from "../services/adminService";

const Hero = () => {
  const [images, setImages] = useState([]);

  useEffect(() => {
    try {
      const list = adminService.loadHeroImages();
      setImages(Array.isArray(list) ? list : []);
    } catch (e) {
      setImages(["/pic1.jpg"]);
    }
  }, []);

  const heroSrc = images[0] || "/pic1.jpg";
  return (
    <section className="relative w-full h-[75vh] md:h-[90vh]">
      <img
        src={heroSrc}
        alt="Designer outfit banner"
        className="absolute inset-0 w-full h-full object-cover"
      />
      <div className="absolute inset-0 bg-black/40"></div>
      <div className="relative z-10  max-w-6xl mx-auto h-full flex flex-col justify-end pb-5 px-4 text-center text-white">
        <h1 className="text-xl md:text-2xl font-light leading-tight tracking-tight">
          ~Your Outfit. <span className="text-pink-500 italic">Your Vibe.</span>{" "}
          On Rotation~
        </h1>
        <a href="#collection" className="mt-4 inline-block px-6 text-sm py-3 ">
          Explore
        </a>

        {/* <div className="mt-8 flex flex-col sm:flex-row gap-4">
          <a
            href="#collection"
            className="px-6 py-3 w-full bg-pink-500 text-white rounded-full shadow-lg hover:bg-pink-600 transition"
          >
            Explore
          </a>
          <a
            href="#about"
            className="px-6 py-3 border w-full border-white text-white rounded-full hover:bg-white hover:text-black transition"
          >
            How It Works
          </a>
        </div> */}
      </div>
    </section>
  );
};

export default Hero;
