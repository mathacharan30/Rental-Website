import React from "react";
import { Heart } from "lucide-react";
import { Link } from "react-router-dom";

const ProductCard = ({ product }) => {
  return (
    <Link
      to={`/product/${product.id}`}
      className="relative group bg-base-off-white w-[180px] md:w-58 pb-4  overflow-hidden  translate-y-1 block"
    >
      <div className="relative h-68 md:h-78 overflow-hidden">
        <img
          src={product.image}
          alt={product.title}
          className="w-full h-full object-cover transition-transform duration-500 rounded-lg group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-linear-to-t from-black/60 via-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      </div>

      <div className=" py-1">
        <p className="text-xs  tracking-tight text-neutral-500">
          {product.category}
        </p>

        <h3 className="mt-1 text-sm font-semibold text-base-charcoal line-clamp-1">
          {product.title}
        </h3>

        <div className=" flex items-center justify-between">
          <div className="text-md dm-sans font-light text-base-charcoal">
            {product.price}
          </div>
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;
