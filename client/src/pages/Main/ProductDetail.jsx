import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { BiLeftArrow } from "react-icons/bi";
import { AiFillStar, AiOutlineStar } from "react-icons/ai";
import Footer from "../../components/Footer";
import { openWhatsApp } from "../../services/whatsapp";
import { getProductById } from "../../services/productService";
import toast from "react-hot-toast";
import Loader from "../../components/Loader";

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedSize, setSelectedSize] = useState("");

  useEffect(() => {
    setLoading(true);
    (async () => {
      try {
        const data = await getProductById(id);
        setProduct(data);
      } catch (e) {
        console.error("[ProductDetail] Failed to load product", e);
        toast.error("Failed to load product details");
        setProduct(null);
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  if (loading) {
    return (
      <motion.div
        className="min-h-[60vh] flex items-center justify-center bg-gray-50"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
      >
        <Loader />
      </motion.div>
    );
  }

  if (!product) {
    return (
      <motion.div
        className="min-h-[60vh] flex items-center justify-center bg-gray-50"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
      >
        <div className="text-center p-6 bg-white shadow-md rounded-lg">
          <h2 className="text-2xl font-semibold text-gray-800">
            Product not found
          </h2>
          <p className="mt-2 text-gray-500">
            The product you are looking for does not exist.
          </p>
          <button
            onClick={() => navigate(-1)}
            className="mt-4 px-5 py-2 bg-gray-800 text-white rounded-md hover:bg-gray-700 transition"
          >
            Go Back
          </button>
        </div>
      </motion.div>
    );
  }

  const rating = product.rating || 4.3;
  const sizes = product.sizes || ["XS", "S", "M", "L", "XL"];

  const handleRent = () => {
    if (!selectedSize) {
      toast.error("Please select a size");
      return;
    }
    toast.success("Opening WhatsApp for rental...");
    openWhatsApp({
      product,
      action: "rent",
      size: selectedSize,
      link: window.location.href,
    });
  };

  const handleEnquire = () => {
    toast.success("Opening WhatsApp for enquiry...");
    openWhatsApp({
      product,
      action: "enquire",
      size: selectedSize,
      link: window.location.href,
    });
  };

  return (
    <motion.div
      className="pt-5"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
    >
      <div className="max-w-7xl mx-auto px-3">
        <Link
          to={`/products/${encodeURIComponent(product.category)}`}
          className="text-sm flex items-center gap-1 text-gray-600 hover:underline"
        >
          <BiLeftArrow /> Back to Products
        </Link>

        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-md overflow-hidden shadow-sm">
            <img
              src={product.image}
              alt={product.title}
              className="w-full h-[400px] md:h-[450px] object-contain"
            />
            <div className="p-2 items-center flex flex-row justify-center">
              {product.images && product.images.length > 0 && (
                <div className="mb-4 flex gap-2 overflow-x-auto">
                  {product.images.map((imgUrl, index) => (
                    <img
                      key={index}
                      src={imgUrl}
                      alt={`${product.title} ${index + 1}`}
                      className="w-16 h-16 object-cover rounded cursor-pointer border"
                      onClick={() => setProduct({ ...product, image: imgUrl })}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-col justify-between font-light">
            <div>
              <h1 className="text-2xl md:text-3xl font-semibold text-gray-900 tracking-tighter">
                {product.title}
              </h1>

              <div className="flex items-center gap-1 ">
                {Array.from({ length: 5 }).map((_, i) =>
                  i < Math.floor(rating) ? (
                    <AiFillStar key={i} className="text-yellow-500" />
                  ) : (
                    <AiOutlineStar key={i} className="text-yellow-500" />
                  )
                )}
                <span className="text-sm text-gray-600 ml-1">
                  {rating.toFixed(1)}
                </span>
              </div>

              <div className="mt-2 space-y-1">
                <div className="text-2xl font-light text-pink-900">
                  {product.price}
                </div>
                <div className="text-sm text-gray-500 flex flex-col gap-0.5">
                  {/* <span>Rent: ₹{product.rentPrice} + Commission: ₹{product.commissionPrice}</span> */}
                  {product.advanceAmount > 0 && (
                    <span className="text-gray-600 font-medium">
                      Advance: ₹{Number.isInteger(product.advanceAmount) ? product.advanceAmount : product.advanceAmount.toFixed(2)}
                    </span>
                  )}
                </div>
              </div>

              <p className="mt-4 text-md text-gray-700 leading-tight ">
                {product.description ||
                  "Elegant rental piece — perfect for special occasions. Contact us for custom durations and styling options."}
              </p>

              <div className="mt-4">
                <p className="text-sm font-medium text-gray-700 mb-2">Size</p>
                <div className="flex flex-wrap gap-2">
                  {sizes.map((size) => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`px-4 py-2 border rounded-md transition ${
                        selectedSize === size
                          ? "bg-pink-900 text-white border-pink-900"
                          : "text-gray-700 border-gray-300 hover:bg-gray-100"
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mt-4 flex flex-col gap-1 text-sm text-gray-600">
                <div>
                  <strong>Condition:</strong> Excellent
                </div>
                <div>
                  <strong>Availability:</strong> Ready to rent
                </div>
              </div>
            </div>

            <div className="my-6  flex flex-col sm:flex-row gap-2">
              <button
                onClick={handleRent}
                className="px-6 py-3 cursor-pointer bg-pink-900 text-white rounded w-full sm:w-auto hover:bg-pink-800 transition"
              >
                Rent Now
              </button>
              <button
                onClick={handleEnquire}
                className="px-6 py-3 border cursor-pointer text-gray-700 rounded w-full sm:w-auto hover:bg-gray-100 transition"
              >
                Enquire Now
              </button>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </motion.div>
  );
};

export default ProductDetail;
