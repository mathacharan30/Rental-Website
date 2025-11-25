import React, { useEffect, useState } from "react";
import instaService from "../services/instaService";
import toast from "react-hot-toast";
import { FaPlay } from "react-icons/fa";
import Loader from "./Loader";

const Reels = () => {
  const [items, setItems] = useState([]);
  const [open, setOpen] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const script = document.createElement("script");
    script.src = "//www.instagram.com/embed.js";
    script.async = true;
    document.body.appendChild(script);
    return () => document.body.removeChild(script);
  }, []);

  useEffect(() => {
    if (open && window.instgrm) {
      window.instgrm.Embeds.process();
    }
  }, [open]);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const posts = await instaService.getPosts();
        setItems(posts || []);
        setLoading(false);
      } catch (err) {
        console.log(err);
        toast.error("Failed to load reels" + err);
        setLoading(false);
      }
    })();
  }, []);

  return (
    <section className="py-14 bg-base-off-white">
      <div className="max-w-7xl mx-auto px-2">
        <div className="text-center">
          <h2 className="text-2xl font-medium tracking-tighter">
            <span className="font-extrabold text-pink-800">/</span> Style Reels
          </h2>
          <p className="text-xs md:text-sm text-neutral-600 mt-2">
            Tap to watch reels in a clean modal player.
          </p>
        </div>
        {loading ? (
          <div className="flex justify-center items-center py-10">
            <Loader />
          </div>
        ) : (
          <div className="mt-2 flex flex-row gap-2 overflow-x-auto pb-4 ">
            {items.map((r) => (
              <div className="">
                <blockquote
                  key={r._id}
                  className="instagram-media"
                  data-instgrm-permalink={r.postUrl}
                  data-instgrm-version="14"
                  style={{ border: 0, margin: "0 auto", width: "80%" }}
                  onClick={() => setOpen(r)}
                ></blockquote>
              </div>
            ))}
          </div>
        )}
      </div>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/70"
            onClick={() => setOpen(null)}
          />

          <div className="relative w-full max-w-md bg-white rounded-xl overflow-hidden shadow-xl z-10">
            <button
              onClick={() => setOpen(null)}
              className="absolute top-2 right-2 text-black text-sm underline"
            >
              Close
            </button>

            <div className="p-2 flex justify-center">
              <blockquote
                className="instagram-media"
                data-instgrm-permalink={open.postUrl}
                data-instgrm-version="14"
                style={{
                  width: "100%",
                  maxWidth: "350px",
                  border: 0,
                  margin: "0 auto",
                }}
              ></blockquote>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default Reels;
