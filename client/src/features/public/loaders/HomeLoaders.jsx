const HeroSkeleton = () => {
  return (
    <div className="absolute inset-0 z-10 bg-[#0e0e0e]/70 backdrop-blur-[2px]">
      <div className="h-full w-full px-6 md:px-16 flex flex-col justify-end pb-20">
        <div className="mx-auto mb-16 w-full max-w-3xl text-center space-y-3">
          <div className="h-10 w-2/3 mx-auto rounded-xl skeleton-base" />
          <div className="h-4 w-1/2 mx-auto rounded skeleton-base" />
        </div>
        <div className="mx-auto h-12 w-55 rounded-[1.75rem] skeleton-base" />
      </div>
    </div>
  );
};

const CategoriesSkeleton = ({ count = 6 }) => {
  return (
    <div
      className="flex flex-wrap gap-2 justify-center"
      aria-label="Loading categories"
      aria-busy="true"
    >
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className="relative overflow-hidden rounded-bl-3xl rounded-tr-3xl h-58 w-40 md:w-48 md:h-70 border border-white/10 skeleton-base"
          aria-hidden="true"
        >
          <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
            <div className="h-4 w-20 rounded skeleton-base" />
            <div className="h-8 w-8 rounded-full skeleton-base" />
          </div>
        </div>
      ))}
    </div>
  );
};

const GallerySkeleton = ({ count = 8 }) => {
  const heights = [
    "h-[170px]",
    "h-[210px]",
    "h-[190px]",
    "h-[240px]",
    "h-[220px]",
    "h-[180px]",
    "h-[230px]",
    "h-[200px]",
  ];

  return (
    <div
      className="columns-2 sm:columns-3 lg:columns-4 gap-2 md:gap-3"
      aria-label="Loading gallery"
      aria-busy="true"
    >
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className={`mb-2 md:mb-3 w-full rounded-xl break-inside-avoid skeleton-base ${heights[index % heights.length]}`}
          aria-hidden="true"
        />
      ))}
    </div>
  );
};

const TestimonialsSkeleton = ({ count = 4 }) => {
  return (
    <div
      className="flex overflow-y-hidden"
      aria-label="Loading testimonials"
      aria-busy="true"
    >
      {Array.from({ length: count }).map((_, index) => (
        <article
          key={index}
          className="relative w-72 shrink-0 rounded-tr-2xl mx-2 rounded-bl-2xl p-px border border-violet-400/20 overflow-hidden"
          aria-hidden="true"
        >
          <div className="h-full rounded-2xl bg-black/10 p-10 flex flex-col justify-between">
            <div>
              <div className="mt-6 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full skeleton-base" />
                <div className="space-y-2">
                  <div className="h-3 w-20 rounded skeleton-base" />
                  <div className="h-3 w-14 rounded skeleton-base" />
                </div>
              </div>
              <div className="space-y-2 py-6">
                <div className="h-3 w-full rounded skeleton-base" />
                <div className="h-3 w-11/12 rounded skeleton-base" />
                <div className="h-3 w-9/12 rounded skeleton-base" />
              </div>
            </div>
            <div className="mt-4 h-3 w-20 rounded skeleton-base" />
          </div>
        </article>
      ))}
    </div>
  );
};

export {
  HeroSkeleton,
  CategoriesSkeleton,
  GallerySkeleton,
  TestimonialsSkeleton,
};
