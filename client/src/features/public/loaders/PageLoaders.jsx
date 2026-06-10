import Footer from "../../shared/components/Footer";

const FavoritesSkeleton = ({ count = 6 }) => (
  <div className="min-h-screen bg-[#0e0e0e]">
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <div className="h-11 w-64 mx-auto rounded-xl skeleton-base" />
        <div className="h-4 w-48 mx-auto mt-3 rounded skeleton-base" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: count }).map((_, index) => (
          <div
            key={index}
            className="bg-white/2 border border-white/8 backdrop-blur-md rounded-2xl overflow-hidden shadow-lg"
            aria-hidden="true"
          >
            <div className="h-64 w-full skeleton-base" />
            <div className="p-4 space-y-3">
              <div className="h-3 w-20 rounded skeleton-base" />
              <div className="h-5 w-2/3 rounded skeleton-base" />
              <div className="h-4 w-full rounded skeleton-base" />
              <div className="h-4 w-5/6 rounded skeleton-base" />
              <div className="flex items-center justify-between pt-1">
                <div className="h-6 w-24 rounded skeleton-base" />
                <div className="h-9 w-9 rounded-lg skeleton-base" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
    <Footer />
  </div>
);

const OrdersSkeleton = ({ count = 3 }) => (
  <div className="space-y-4" aria-label="Loading orders" aria-busy="true">
    {Array.from({ length: count }).map((_, index) => (
      <div key={index} className="bg-white/2 border border-white/8 backdrop-blur-md rounded-2xl p-4 shadow-sm" aria-hidden="true">
        <div className="flex items-start gap-4">
          <div className="w-16 h-16 rounded-xl border border-white/8 skeleton-base shrink-0" />
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2">
              <div className="h-5 w-40 rounded skeleton-base" />
              <div className="h-5 w-24 rounded-full skeleton-base" />
            </div>
            <div className="h-4 w-20 mt-2 rounded skeleton-base" />
            <div className="h-4 w-36 mt-2 rounded skeleton-base" />
            <div className="h-4 w-32 mt-1 rounded skeleton-base" />
            <div className="h-3 w-24 mt-2 rounded skeleton-base" />
          </div>
        </div>
      </div>
    ))}
  </div>
);

const PaymentStatusCheckingSkeleton = () => {
  return (
    <div className="bg-white/2 border border-white/8 backdrop-blur-md rounded-3xl p-10 max-w-md w-full shadow-lg">
      <div className="h-12 w-12 mx-auto rounded-full skeleton-base" />
      <div className="h-7 w-2/3 mx-auto mt-5 rounded skeleton-base" />
      <div className="h-4 w-4/5 mx-auto mt-3 rounded skeleton-base" />
      <div className="h-4 w-3/5 mx-auto mt-2 rounded skeleton-base" />
      <div className="flex flex-col sm:flex-row gap-3 justify-center mt-7">
        <div className="h-11 w-full sm:w-36 rounded-xl skeleton-base" />
        <div className="h-11 w-full sm:w-36 rounded-xl skeleton-base" />
      </div>
    </div>
  );
};

export { FavoritesSkeleton, OrdersSkeleton, PaymentStatusCheckingSkeleton };
