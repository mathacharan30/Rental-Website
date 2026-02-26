import React from "react";

const Loader = () => {
  return (
    <div className="flex flex-col items-center gap-3">
      <div className="w-8 h-8 border-2 border-violet-500/30 border-t-violet-500 rounded-full animate-spin" />
      <span className="text-xs text-neutral-500">Loading...</span>
    </div>
  );
};

export default Loader;
