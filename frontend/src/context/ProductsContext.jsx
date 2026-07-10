import { createContext, useContext, useState, useEffect } from "react";
import { apiFetch } from "../api";

const ProductsContext = createContext(null);

export function ProductsProvider({ children }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const refresh = async () => {
    try {
      const data = await apiFetch("/products", { auth: false });
      setProducts(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { refresh(); }, []);

  const addProduct = async (product) => {
    const newProduct = await apiFetch("/products", {
      method: "POST",
      body: { ...product, price: Number(product.price), stock: Number(product.stock) },
    });
    setProducts((prev) => [newProduct, ...prev]);
    return newProduct;
  };

  const updateProduct = async (id, updates) => {
    const updated = await apiFetch(`/products/${id}`, {
      method: "PUT",
      body: { ...updates, price: Number(updates.price), stock: Number(updates.stock) },
    });
    setProducts((prev) => prev.map((p) => (p.id === id ? updated : p)));
  };

  const deleteProduct = async (id) => {
    await apiFetch(`/products/${id}`, { method: "DELETE" });
    setProducts((prev) => prev.filter((p) => p.id !== id));
  };

  return (
    <ProductsContext.Provider value={{ products, loading, addProduct, updateProduct, deleteProduct, refresh }}>
      {children}
    </ProductsContext.Provider>
  );
}

export function useProducts() {
  const ctx = useContext(ProductsContext);
  if (!ctx) throw new Error("useProducts must be used inside <ProductsProvider>");
  return ctx;
}
