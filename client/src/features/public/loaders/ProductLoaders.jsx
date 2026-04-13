const ProductCardSkeleton = ({ className = "" }) => {
  return (
    <div
      className={`relative w-[155px] mb-6 md:w-54 overflow-hidden block ${className}`}
      aria-hidden="true"
    >
      <div className="relative h-65 md:h-80 overflow-hidden rounded-xl skeleton-base" />
      <div className="py-2 px-1 space-y-2">
        <div className="h-3 w-16 rounded skeleton-base" />
        <div className="h-4 w-28 rounded skeleton-base" />
        <div className="h-4 w-20 rounded skeleton-base" />
      </div>
    </div>
  );
};

const ProductListSkeleton = ({ count = 10 }) => {
  return (
    <div
      className="flex justify-center items-center gap-2 flex-wrap mt-4"
      aria-label="Loading products"
      aria-busy="true"
    >
      {Array.from({ length: count }).map((_, index) => (
        <ProductCardSkeleton key={index} />
      ))}
    </div>
  );
};

const ProductRowSkeleton = ({ count = 6 }) => {
  return (
    <div
      className="flex flex-row gap-3 overflow-x-auto py-2 scrollbar-hide"
      aria-label="Loading products"
      aria-busy="true"
    >
      {Array.from({ length: count }).map((_, index) => (
        <ProductCardSkeleton key={index} className="snap-start shrink-0" />
      ))}
    </div>
  );
};

const ProductDetailSkeleton = () => {
  return (
    <div
      className="bg-[#0e0e0e] min-h-screen"
      aria-label="Loading product details"
      aria-busy="true"
    >
      <div className="max-w-6xl mx-auto px-4 pt-2">
        <div className="h-4 w-32 rounded skeleton-base" />
      </div>

      <div className="flex flex-col md:flex-row md:items-start md:gap-6 max-w-6xl mx-auto mt-4 px-2 md:px-4">
        <div className="relative w-full md:w-[48%] max-w-xl mx-auto md:mx-0">
          <div className="w-full rounded-2xl border border-white/6 aspect-[4/5] md:aspect-[3/4] max-h-[420px] md:max-h-[480px] skeleton-base" />
          <div className="flex justify-center gap-1 mt-2 overflow-x-auto pb-1">
            {Array.from({ length: 5 }).map((_, index) => (
              <div
                key={index}
                className="w-10 h-10 rounded-lg skeleton-base shrink-0"
              />
            ))}
          </div>
        </div>

        <div className="w-full md:w-[52%] max-w-2xl p-4 mx-auto md:mx-0 mt-6 md:mt-0 pb-10">
          <div className="h-10 w-3/4 rounded skeleton-base" />
          <div className="h-4 w-28 rounded skeleton-base mt-4" />
          <div className="h-8 w-32 rounded skeleton-base mt-5" />
          <div className="space-y-2 mt-4">
            <div className="h-3 w-full rounded skeleton-base" />
            <div className="h-3 w-11/12 rounded skeleton-base" />
            <div className="h-3 w-10/12 rounded skeleton-base" />
          </div>
          <div className="flex gap-2 mt-4">
            <div className="h-7 w-32 rounded-lg skeleton-base" />
            <div className="h-7 w-32 rounded-lg skeleton-base" />
          </div>
          <div className="mt-5">
            <div className="h-4 w-24 rounded skeleton-base mb-3" />
            <div className="flex flex-wrap gap-2">
              {Array.from({ length: 5 }).map((_, index) => (
                <div
                  key={index}
                  className="h-10 w-12 rounded-lg skeleton-base"
                />
              ))}
            </div>
          </div>
          <div className="mt-7 flex gap-3">
            <div className="h-12 flex-1 rounded-xl skeleton-base" />
            <div className="h-12 flex-1 rounded-xl skeleton-base" />
          </div>
        </div>
      </div>
    </div>
  );
};

const DeliveryCitiesSkeleton = ({ count = 6 }) => {
  return (
    <div
      className="grid grid-cols-2 gap-2"
      aria-label="Loading delivery cities"
      aria-busy="true"
    >
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className="px-3 py-2.5 rounded-xl border border-white/10 glass"
          aria-hidden="true"
        >
          <div className="h-4 w-16 rounded skeleton-base" />
          <div className="h-3 w-12 rounded skeleton-base mt-2" />
        </div>
      ))}
    </div>
  );
};

export {
  ProductCardSkeleton,
  ProductListSkeleton,
  ProductRowSkeleton,
  ProductDetailSkeleton,
  DeliveryCitiesSkeleton,
};
