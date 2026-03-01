import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import ProductList from "../../components/admin/ProductList";
import ProductForm from "../../components/admin/ProductForm";
import Stats from "../../components/admin/Stats";
import Modal from "../../components/admin/Modal";
import adminProductService from "../../services/adminProductService";
import toast from "react-hot-toast";
import Loader from "../../components/Loader";
import { Plus } from "lucide-react";

const ProductsAdmin = () => {
  const { storename } = useParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editProduct, setEditProduct] = useState(null); // product being edited
  const [activeCategory, setActiveCategory] = useState("All");

  const load = async () => {
    setLoading(true);
    try {
      const list = await adminProductService.listProducts(storename);
      setProducts(list);
    } catch (e) {
      console.error("Failed to load products", e);
      if (e?.response?.status !== 404) {
        toast.error("Failed to load products");
      }
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  // Derive unique categories for tabs
  const categoryTabs = ["All", ...Array.from(new Set(products.map((p) => p.category).filter(Boolean)))];

  const filteredProducts =
    activeCategory === "All"
      ? products
      : products.filter((p) => p.category === activeCategory);

  const handleAdd = async (formData) => {
    const loadingToast = toast.loading("Creating product...");
    try {
      await adminProductService.createProduct(formData);
      toast.success("Product created successfully", { id: loadingToast });
      setIsAddModalOpen(false);
      await load();
    } catch (e) {
      console.error("Create product failed", e);
      toast.error(e?.response?.data?.message || "Failed to create product", {
        id: loadingToast,
      });
    }
  };

  const handleEdit = async (formData) => {
    const loadingToast = toast.loading("Updating product...");
    try {
      await adminProductService.updateProduct(editProduct.id, formData);
      toast.success("Product updated successfully", { id: loadingToast });
      setEditProduct(null);
      await load();
    } catch (e) {
      console.error("Update product failed", e);
      toast.error(e?.response?.data?.message || "Failed to update product", {
        id: loadingToast,
      });
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this product?"))
      return;

    const loadingToast = toast.loading("Deleting product...");
    try {
      await adminProductService.deleteProduct(id);
      toast.success("Product deleted successfully", { id: loadingToast });
      await load();
    } catch (e) {
      console.error("Delete product failed", e);
      toast.error(e?.response?.data?.message || "Failed to delete product", {
        id: loadingToast,
      });
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">Products</h1>
          <p className="text-neutral-500 mt-1">Manage your product inventory</p>
        </div>
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="bg-violet-600 hover:bg-violet-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
        >
          <Plus size={20} />
          Add Product
        </button>
      </div>

      <div className="mb-8">
        <Stats products={products} />
      </div>

      {/* Category tabs */}
      {!loading && categoryTabs.length > 1 && (
        <div className="flex gap-2 flex-wrap mb-4">
          {categoryTabs.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                activeCategory === cat
                  ? "bg-violet-600 text-white"
                  : "bg-white/5 text-neutral-400 hover:bg-white/10 hover:text-white"
              }`}
            >
              {cat}
              {cat !== "All" && (
                <span className="ml-1.5 text-xs opacity-60">
                  ({products.filter((p) => p.category === cat).length})
                </span>
              )}
            </button>
          ))}
        </div>
      )}

      <div className="glass rounded-xl overflow-hidden">
        {loading ? (
          <div className="p-12 flex justify-center">
            <Loader />
          </div>
        ) : (
          <ProductList
            products={filteredProducts}
            onDelete={handleDelete}
            onEdit={(p) => setEditProduct(p)}
          />
        )}
      </div>

      {/* Add product modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add New Product"
      >
        <ProductForm
          onCancel={() => setIsAddModalOpen(false)}
          onSave={handleAdd}
        />
      </Modal>

      {/* Edit product modal */}
      <Modal
        isOpen={!!editProduct}
        onClose={() => setEditProduct(null)}
        title="Edit Product"
      >
        {editProduct && (
          <ProductForm
            key={editProduct.id}
            initialData={editProduct}
            onCancel={() => setEditProduct(null)}
            onSave={handleEdit}
          />
        )}
      </Modal>
    </div>
  );
};

export default ProductsAdmin;
