export const bridalComboPackages = [
  {
    id: "basic",
    name: "Basic Bridal Makeup",
    price: 5000,
    description: "Entry bridal package for simple wedding-day styling.",
    inclusions: [
      "Saree Draping",
      "Hairstyle",
      "Makeup",
      "Artificial Accessories",
    ],
  },
  {
    id: "bridal",
    name: "Bridal Makeup",
    price: 8000,
    description: "Balanced bridal package with a polished finish.",
    inclusions: ["Makeup", "Saree Draping", "Hairstyle", "Hair Accessories"],
  },
  {
    id: "hd",
    name: "Bridal HD Makeup",
    price: 14000,
    description: "High-definition bridal finish for premium photos and video.",
    inclusions: ["HD Makeup", "Saree Draping", "Hairstyle", "Hair Accessories"],
  },
  {
    id: "airbrush",
    name: "Bridal Airbrush Makeup",
    price: 20000,
    description: "Top-tier bridal package with long-wear airbrush finish.",
    inclusions: [
      "Airbrush Makeup",
      "Saree Draping",
      "Hairstyle",
      "Hair Accessories",
    ],
  },
];

export const bridalComboAddOns = [
  {
    id: "extra-saree-draping",
    label: "Extra Saree Draping",
    helperText: "For a second drape or outfit change.",
  },
  {
    id: "family-makeup",
    label: "Family Makeup",
    helperText: "Add make-up support for close family members.",
  },
  {
    id: "family-hair",
    label: "Family Hair Setup",
    helperText: "Hair styling for family or bridesmaids.",
  },
  {
    id: "rental-jewellery",
    label: "Rental Jewellery",
    helperText: "Complete the bridal look with matching jewellery.",
  },
  {
    id: "photography-combo",
    label: "Photography Combo",
    helperText: "Bundle the package with a photography add-on.",
  },
];

export const comboCategories = [
  {
    slug: "bridal-combo",
    title: "Bridal Combo",
    subtitle:
      "Makeup, draping, hair styling, and premium add-ons in one place.",
    priceNote: "Packages from ₹5,000 to ₹20,000",
    accent: "from-violet-600 via-fuchsia-500 to-amber-400",
    image:
      "https://images.pexels.com/photos/7760689/pexels-photo-7760689.jpeg?auto=compress&cs=tinysrgb&w=1200",
    packages: bridalComboPackages,
    addOns: bridalComboAddOns,
  },
];
