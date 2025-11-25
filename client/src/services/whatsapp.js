export function openWhatsApp({
  product,
  action = "enquiry",
  size = "",
  phone,
  link,
}) {
  try {
    const currentLink = link || window.location.href;
    const number = (phone || "9606307685").replace(/[^0-9]/g, "");
    const actionText = action === "rent" ? "rent" : "enquire";
    const parts = [
      `Hello! I'm interested to ${actionText} the following item:`,
      `Link: ${currentLink}`,
      `• Product: ${product?.title ?? "N/A"}`,
      size ? `• Size: ${size}` : null,
      product?.category ? `• Category: ${product.category}` : null,
      product?.price ? `• Listed Price: ${product.price}` : null,
      product?.id ? `• Product ID: ${product.id}` : null,
      "",
      "Could you please share availability, rental terms, and next steps?",
    ].filter(Boolean);

    const text = encodeURIComponent(parts.join("\n"));
    const url = `https://wa.me/${number}?text=${text}`;
    window.open(url, "_blank", "noopener,noreferrer");
  } catch (e) {
    console.error("Failed to open WhatsApp", e);
  }
}
