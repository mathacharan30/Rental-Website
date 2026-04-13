import React from "react";
import ProductCard from "./ProductCard";
import { ProductRowSkeleton } from "../loaders";

const ProductsGrid = ({ products = [], loading = false }) => {
  return (
    <section id="products" className="py-16">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex flex-col items-center justify-center mb-8">
          <h2 className="text-3xl md:text-4xl font-medium instrument-serif tracking-wide text-white">
            - Popular <span className="text-violet-400 italic">Rentals -</span>
          </h2>
          <p className="mt-2 text-neutral-500 text-sm">
            Handpicked rental pieces just for you
          </p>
        </div>

        <div>
          {loading ? (
            <ProductRowSkeleton count={6} />
          ) : (
            <div className="flex flex-row gap-3 overflow-x-auto py-2 scrollbar-hide">
              {products.map((p) => (
                <div key={p.id} className="snap-start shrink-0">
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
