import { useQuery } from "@tanstack/react-query";
import { Helmet } from "react-helmet-async";
import Hero from "../components/Hero";
import Categories from "../components/Categories";
import ProductsGrid from "../components/ProductsGrid";
import Gallery from "../components/Gallery";
import Testimonials from "../components/Testimonials";
import Footer from "../../shared/components/Footer";
import { getTopPicks } from "../../../services/productService";
import toast from "react-hot-toast";

const Home = () => {
  const { data: productList = [], isLoading: loading } = useQuery({
    queryKey: ["top-picks"],
    queryFn: async () => {
      try {
        const data = await getTopPicks();
        return Array.isArray(data) ? data.slice(0, 7) : [];
      } catch (e) {
        toast.error("Failed to load top picks");
        throw e;
      }
    },
    staleTime: 1000 * 60 * 5,
    cacheTime: 1000 * 60 * 30,
  });

  return (
    <div className="bg-[#0e0e0e]">
      <Helmet>
        <title>
          Bridal Wear on Rent in Mysuru &amp; Bangalore | People &amp; Style
        </title>
        <meta
          name="description"
          content="People &amp; Style — Karnataka's #1 clothing rental service. Rent bridal lehenga, wedding gown, sherwani, bridal saree &amp; jewellery in Mysuru and Bangalore. Affordable bridal wear rental delivered to your door."
        />
        <meta
          name="keywords"
          content="bridal wear on rent in Mysuru, bridal wear on rent in Bangalore, bridal lehenga on rent in Mysuru, bridal lehenga on rent in Bangalore, wedding gown on rent in Mysuru, wedding gown on rent in Bangalore, clothes on rent in Mysuru, clothes on rent in Bangalore, dress rental in Mysuru, dress rental in Bangalore, wedding dress rental in Mysuru, wedding dress rental in Bangalore, bridal dress rental in Mysuru, bridal dress rental in Bangalore, rental outfits in Mysuru, rental outfits in Bangalore, lehenga on rent, designer lehenga on rent, bridal saree on rent, silk saree rental, sherwani on rent, blazer on rent, suit on rent, bridal jewellery on rent, temple jewellery on rent"
        />
        <link rel="canonical" href="https://peopleandstyle.in/" />
        <meta
          property="og:title"
          content="Bridal Wear on Rent in Mysuru &amp; Bangalore | People &amp; Style"
        />
        <meta
          property="og:description"
          content="Rent bridal lehengas, wedding gowns, sherwanis, sarees &amp; bridal jewellery in Mysuru and Bangalore. Premium designer wear rental for weddings &amp; special occasions."
        />
        <meta property="og:url" content="https://peopleandstyle.in/" />
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="People &amp; Style" />
        <meta property="og:locale" content="en_IN" />
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "ClothingStore",
            name: "People & Style",
            description:
              "Bridal wear rental, lehenga on rent, wedding gown rental, sherwani on rent in Mysuru and Bangalore, Karnataka.",
            url: "https://peopleandstyle.in",
            telephone: "+919187668280",
            email: "hello@peopleandstyle.in",
            address: {
              "@type": "PostalAddress",
              addressLocality: "Mysuru",
              addressRegion: "Karnataka",
              postalCode: "570026",
              addressCountry: "IN",
            },
            areaServed: [
              { "@type": "City", name: "Mysuru" },
              { "@type": "City", name: "Bangalore" },
              { "@type": "State", name: "Karnataka" },
            ],
            openingHours: ["Mo-Sa 10:00-19:00", "Su 11:00-17:00"],
            priceRange: "₹₹",
            hasOfferCatalog: {
              "@type": "OfferCatalog",
              name: "Rental Outfits",
              itemListElement: [
                {
                  "@type": "Offer",
                  itemOffered: {
                    "@type": "Product",
                    name: "Bridal Lehenga on Rent",
                  },
                },
                {
                  "@type": "Offer",
                  itemOffered: {
                    "@type": "Product",
                    name: "Wedding Gown on Rent",
                  },
                },
                {
                  "@type": "Offer",
                  itemOffered: { "@type": "Product", name: "Sherwani on Rent" },
                },
                {
                  "@type": "Offer",
                  itemOffered: {
                    "@type": "Product",
                    name: "Bridal Jewellery on Rent",
                  },
                },
              ],
            },
          })}
        </script>
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
