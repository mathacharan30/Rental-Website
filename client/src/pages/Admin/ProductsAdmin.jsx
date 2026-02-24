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
  const [isModalOpen, setIsModalOpen] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const list = await adminProductService.listProducts(storename);
      setProducts(list);
    } catch (e) {
      console.error("Failed to load products", e);
      // Don't show an error toast for an empty store – just show the empty state
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

  const handleAdd = async (formData) => {
    const loadingToast = toast.loading("Creating product...");
    try {
      await adminProductService.createProduct(formData);
      toast.success("Product created successfully", { id: loadingToast });
      setIsModalOpen(false);
      await load();
    } catch (e) {
      console.error("Create product failed", e);
      toast.error(e?.response?.data?.message || "Failed to create product", {
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
          <h1 className="text-2xl font-bold text-neutral-900">Products</h1>
          <p className="text-neutral-500 mt-1">Manage your product inventory</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-pink-600 hover:bg-pink-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors shadow-sm"
        >
          <Plus size={20} />
          Add Product
        </button>
      </div>

      <div className="mb-8">
        <Stats products={products} />
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-neutral-200 overflow-hidden">
        {loading ? (
          <div className="p-12 flex justify-center">
            <Loader />
          </div>
        ) : (
          <ProductList products={products} onDelete={handleDelete} />
        )}
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Add New Product"
      >
        <ProductForm
          onCancel={() => setIsModalOpen(false)}
          onSave={handleAdd}
        />
      </Modal>
    </div>
  );
};

export default ProductsAdmin;
