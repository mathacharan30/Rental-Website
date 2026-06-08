import { Link } from "react-router-dom";
import FavoriteButton from "../../shared/components/FavoriteButton";
import OptimizedImage from "../../shared/components/OptimizedImage";
import { ArrowRight } from "lucide-react";

const ProductCard = ({ product }) => {
  return (
    <Link
      to={`/product/${product.id}`}
      className="group relative w-42 md:w-54 overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.02] backdrop-blur-md shadow-lg shadow-black/25 hover:border-violet-500/40 hover:bg-white/[0.05] hover:shadow-violet-950/20 hover:shadow-xl transition-all duration-500 mb-6 block p-1.5 md:p-2.5"
    >
      <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out bg-gradient-to-r from-transparent via-white/15 to-transparent pointer-events-none z-20" />

      <div className="relative h-56 md:h-72 overflow-hidden rounded-xl bg-neutral-950/50">
        <OptimizedImage
          url={product.image}
          type="category"
          alt={product.title}
          loading="lazy"
          decoding="async"
          className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-80" />

        <div className="absolute top-2 right-2 z-10">
          <FavoriteButton productId={product.id} size={18} />
        </div>
      </div>

      <div className="pt-2 px-1 pb-0.5">
        <p className="text-[8px] tracking-wider uppercase text-violet-400 font-semibold opacity-90">
          {product.category}
        </p>
        <h3 className="mt-0.5 text-sm font-semibold text-white/95 line-clamp-1 group-hover:text-violet-200 transition-colors duration-300">
          {product.title}
        </h3>
        <div className="mt-2 flex items-center justify-between">
          <span className="text-sm font-bold text-violet-300 group-hover:text-violet-200 transition-colors duration-300">
            {product.price}
          </span>
          <span className="text-[10px] md:text-xs text-white/30 group-hover:text-violet-400 group-hover:translate-x-0.5 transition-all duration-300 font-medium">
            Check out <ArrowRight className="inline-block w-4 h-4" />
          </span>
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;
