const ProductCardSkeleton = ({ className = "" }) => {
  return (
    <div
      className={`relative w-42 md:w-56 overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.02] backdrop-blur-md p-1.5 md:p-2.5 mb-6 block ${className}`}
      aria-hidden="true"
    >
      <div className="relative h-60 md:h-74 overflow-hidden rounded-xl bg-neutral-900/50 skeleton-base" />
      <div className="pt-2 px-1 pb-0.5 space-y-2">
        <div className="h-2.5 w-12 rounded skeleton-base" />
        <div className="h-4 w-32 rounded skeleton-base" />
        <div className="flex justify-between items-center mt-2 pt-1">
          <div className="h-4 w-16 rounded skeleton-base" />
          <div className="h-3.5 w-12 rounded skeleton-base" />
        </div>
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

      <div className="flex flex-col md:flex-row md:items-start md:gap-8 max-w-6xl mx-auto mt-4 px-2 md:px-4">
        <div className="relative w-full md:w-[48%] max-w-xl mx-auto md:mx-0">
          <div className="w-full rounded-2xl border border-white/[0.08] aspect-4/5 md:aspect-3/4 max-h-105 md:max-h-120 skeleton-base" />
          <div className="flex justify-center gap-1.5 mt-3 overflow-x-auto pb-1">
            {Array.from({ length: 5 }).map((_, index) => (
              <div
                key={index}
                className="w-12 h-12 rounded-lg skeleton-base shrink-0"
              />
            ))}
          </div>
        </div>

        <div className="w-full md:w-[52%] max-w-2xl p-6 md:p-8 mx-auto md:mx-0 mt-6 md:mt-0 pb-10 bg-white/[0.02] backdrop-blur-md shadow-xl shadow-black/30">
          <div className="h-10 w-3/4 rounded skeleton-base" />
          <div className="h-4 w-28 rounded skeleton-base mt-4" />

          <div className="mt-5 p-4 rounded-2xl bg-white/[0.03] border border-white/[0.06] flex justify-between items-center gap-4">
            <div className="space-y-1.5">
              <div className="h-3 w-16 rounded skeleton-base" />
              <div className="h-6 w-24 rounded skeleton-base" />
            </div>
            <div className="space-y-1.5 flex flex-col items-end">
              <div className="h-3 w-28 rounded skeleton-base" />
              <div className="h-5 w-20 rounded skeleton-base" />
            </div>
          </div>

          <div className="space-y-2 mt-5">
            <div className="h-3.5 w-full rounded skeleton-base" />
            <div className="h-3.5 w-11/12 rounded skeleton-base" />
            <div className="h-3.5 w-10/12 rounded skeleton-base" />
          </div>

          <div className="flex gap-2 mt-5">
            <div className="h-7.5 w-32 rounded-xl skeleton-base" />
            <div className="h-7.5 w-32 rounded-xl skeleton-base" />
          </div>

          <div className="mt-6">
            <div className="h-4 w-24 rounded skeleton-base mb-3" />
            <div className="flex flex-wrap gap-2">
              {Array.from({ length: 5 }).map((_, index) => (
                <div
                  key={index}
                  className="h-10 w-12 rounded-xl skeleton-base"
                />
              ))}
            </div>
          </div>

          <div className="mt-8 flex gap-3">
            <div className="h-13 flex-1 rounded-2xl skeleton-base" />
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
