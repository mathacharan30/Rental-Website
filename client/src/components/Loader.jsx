import React from "react";

const Loader = () => {
  return (
    <div
      className="flex flex-col items-center gap-4"
      role="status"
      aria-live="polite"
      aria-label="Loading content"
    >
      <div class="dot-spinner">
        <div class="dot-spinner__dot"></div>
        <div class="dot-spinner__dot"></div>
        <div class="dot-spinner__dot"></div>
        <div class="dot-spinner__dot"></div>
        <div class="dot-spinner__dot"></div>
        <div class="dot-spinner__dot"></div>
        <div class="dot-spinner__dot"></div>
        <div class="dot-spinner__dot"></div>
      </div>

      <span className="text-xs uppercase tracking-[0.24em] text-neutral-400">
        Loading
      </span>
    </div>
  );
};

export default Loader;
