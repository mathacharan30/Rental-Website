import { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import Hero from '../components/Hero';
import Categories from '../components/Categories';
import ProductsGrid from '../components/ProductsGrid';
import Gallery from '../components/Gallery';
import Testimonials from '../components/Testimonials';
import Footer from '../../shared/components/Footer';
import { getTopPicks } from '../../../services/productService';
import toast from "react-hot-toast";

const Home = () => {
  const [productList, setProductList] = useState([]);
  const [loading, setLoading] = useState(true);

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
    <div className="bg-[#0e0e0e]">
      <Helmet>
        <title>
          People &amp; Style — Rent Designer Outfits in Bangalore &amp;
          Karnataka
        </title>
        <meta
          name="description"
          content="Rent premium designer lehengas, sarees, sherwanis and ethnic wear for weddings and events in Bangalore, Mysuru and across Karnataka. Affordable luxury clothing rental — delivered to your door."
        />
        <meta
          name="keywords"
          content="clothing rental Bangalore, lehenga on rent Mysuru, designer saree rental Karnataka, ethnic wear rental, wedding outfit rental Bangalore"
        />
        <link rel="canonical" href="https://peopleandstyle.in/" />
        <meta
          property="og:title"
          content="People & Style — Rent Designer Outfits in Bangalore & Karnataka"
        />
        <meta
          property="og:description"
          content="Premium clothing rentals for weddings, events, and special moments. Affordable luxury, delivered to your door in Karnataka."
        />
        <meta property="og:url" content="https://peopleandstyle.in/" />
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="People & Style" />
      </Helmet>
      <Hero />
      <Categories />
      <ProductsGrid products={productList} loading={loading} />
      <Gallery />
      <Testimonials />
      <Footer />
    </div>
  );
};

export default Home;
