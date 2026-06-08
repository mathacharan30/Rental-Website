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
      className="flex flex-wrap gap-4 justify-center"
      aria-label="Loading categories"
      aria-busy="true"
    >
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className="relative overflow-hidden rounded-bl-3xl rounded-tr-3xl h-60 w-40 md:w-48 md:h-72 border border-white/[0.08] bg-white/[0.02] backdrop-blur-md shadow-lg"
          aria-hidden="true"
        >
          <div className="absolute inset-0 skeleton-base" />
          <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between z-10">
            <div className="h-4.5 w-24 rounded skeleton-base bg-white/5" />
            <div className="h-8 w-8 rounded-full skeleton-base bg-white/5" />
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
      className="flex overflow-y-hidden py-4"
      aria-label="Loading testimonials"
      aria-busy="true"
    >
      {Array.from({ length: count }).map((_, index) => (
        <article
          key={index}
          className="relative w-72 md:w-80 shrink-0 mx-3 rounded-2xl border border-white/[0.08] bg-white/[0.02] backdrop-blur-md p-6 md:p-8 flex flex-col justify-between shadow-md"
          aria-hidden="true"
        >
          <div className="space-y-4">
            <div className="h-3 w-16 rounded skeleton-base" />
            <div className="space-y-2.5 py-1">
              <div className="h-3.5 w-full rounded skeleton-base" />
              <div className="h-3.5 w-11/12 rounded skeleton-base" />
              <div className="h-3.5 w-8/12 rounded skeleton-base" />
            </div>
          </div>
          
          <div className="mt-6 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full skeleton-base shrink-0" />
            <div className="space-y-2 flex-1">
              <div className="h-3.5 w-24 rounded skeleton-base" />
              <div className="h-2.5 w-16 rounded skeleton-base" />
            </div>
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
