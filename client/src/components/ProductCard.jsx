import React from "react";
import { Link } from "react-router-dom";

const ProductCard = ({ product }) => {
  return (
    <Link
      to={`/product/${product.id}`}
      className="relative group w-[170px] md:w-56 overflow-hidden block transition-all duration-300"
    >
      <div className="relative h-64 md:h-80 overflow-hidden rounded-xl">
        <img
          src={product.image}
          alt={product.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-linear-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

        {/* Hover overlay */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
          <span className="px-4 py-1.5 rounded-lg bg-white/10 backdrop-blur-sm text-xs text-white font-medium">
            View
          </span>
        </div>
      </div>

      <div className="py-2 px-1">
        <p className="text-xs tracking-tight text-violet-400">
          {product.category}
        </p>
        <h3 className="mt-0.5 text-sm font-semibold text-white line-clamp-1">
          {product.title}
        </h3>
        <div className="mt-1 text-sm font-bold text-violet-400">
          {product.price}
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;
