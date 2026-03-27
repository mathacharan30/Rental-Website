import React from "react";
import { Link } from "react-router-dom";
import FavoriteButton from "./FavoriteButton";

const ProductCard = ({ product }) => {
  return (
    <Link
      to={`/product/${product.id}`}
      className="relative w-[155px] mb-6 md:w-54 overflow-hidden block"
    >
      <div className="relative h-65 md:h-80 overflow-hidden rounded-xl">
        <img
          src={product.image}
          alt={product.title}
          loading="lazy"
          decoding="async"
          className="w-full h-full object-cover"
        />

        <div className="absolute top-2 right-2 z-10">
          <FavoriteButton productId={product.id} size={18} />
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
