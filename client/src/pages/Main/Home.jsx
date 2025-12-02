import { useEffect, useState } from "react";
import Hero from "../../components/Hero";
import Categories from "../../components/Categories";
import ProductsGrid from "../../components/ProductsGrid";
import Gallery from "../../components/Gallery";
import Reels from "../../components/Reels";
import Testimonials from "../../components/Testimonials";
import Footer from "../../components/Footer";
import { motion } from "framer-motion";
import { getTopPicks } from "../../services/productService";
import toast from "react-hot-toast";

const Home = () => {
  const [productList, setProductList] = useState([]);
  const [loading, setLoading] = useState(true);

  const galleryImages = [
    "https://images.unsplash.com/photo-1505691723518-36a1b2d70f3b?q=80&w=800&auto=format&fit=crop&ixlib=rb-4.0.3&s=7c4a3a9e2d3f4a5b6c7d8e9f0a1b2c3d",
    "https://images.unsplash.com/photo-1493666438817-866a91353ca9?q=80&w=800&auto=format&fit=crop&ixlib=rb-4.0.3&s=3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f",
    "https://images.unsplash.com/photo-1540574163026-643ea20ade25?q=80&w=800&auto=format&fit=crop&ixlib=rb-4.0.3&s=9a8b7c6d5e4f3a2b1c0d9e8f7a6b5c4d",
    "https://images.unsplash.com/photo-1519710164239-da123dc03ef4?q=80&w=800&auto=format&fit=crop&ixlib=rb-4.0.3&s=1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d",
  ];

  useEffect(() => {
    (async () => {
      try {
        const data = await getTopPicks();
        setProductList(Array.isArray(data) ? data.slice(0, 7) : []);
      } catch (e) {
        console.error("[Home] Failed to load top picks", e);
        toast.error("Failed to load top picks");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <motion.div
      className=""
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
    >
      <Hero />
      <main>
        <Categories />
        <ProductsGrid products={productList} loading={loading} />
        <Gallery images={galleryImages} />
        <Testimonials />
        {/* <Reels /> */}
      </main>
      <Footer />
    </motion.div>
  );
};

export default Home;
