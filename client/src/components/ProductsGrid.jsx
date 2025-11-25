import React from "react";
import ProductCard from "./ProductCard";
import Loader from "./Loader";

const ProductsGrid = ({ products = [], loading = false }) => {
  return (
    <section id="products" className="py-2 py-12">
      <div className="max-w-6xl mx-auto px-2">
        <div className="flex flex-col  items-center justify-center ">
          <h2 className="text-2xl font-medium text-center tracking-tighter text-slate-900">
            <span className="font-extrabold text-pink-800">/</span> Top Picks
          </h2>
          <p className="mt-1 md:text-sm text-xs text-slate-600">
            Handpicked rental pieces
          </p>
        </div>

        <div className="mt-4">
          {loading ? (
            <div className="flex justify-center items-center py-10">
              <Loader />
            </div>
          ) : (
            <div className="flex flex-row gap-2 overflow-x-auto  py-2 ">
              {products.map((p) => (
                <div key={p.id} className="snap-start shrink-0 ">
                  <ProductCard product={p} />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default ProductsGrid;
