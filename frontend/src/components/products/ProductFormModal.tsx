"use client";

import React, { useState, useEffect } from "react";
import { api } from "@/lib/api-client";
import { siteConfig } from "@/config/site.config";
import { X, Loader2, Plus, Edit2 } from "lucide-react";
import type { ProductItem } from "@/types";

interface ProductFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  productToEdit?: ProductItem | null;
  onSuccess?: () => void;
}

export const ProductFormModal: React.FC<ProductFormModalProps> = ({
  isOpen,
  onClose,
  productToEdit,
  onSuccess,
}) => {
  const isEditing = !!productToEdit;

  const [sku, setSku] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [stock, setStock] = useState<number>(100);
  const [retailPrice, setRetailPrice] = useState<number>(29.99);
  const [tradePrice, setTradePrice] = useState<number>(21.5);
  const [wholesalePrice, setWholesalePrice] = useState<number>(15.0);
  const [moq, setMoq] = useState<number>(10);
  const [primaryImage, setPrimaryImage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (productToEdit) {
      setSku(productToEdit.sku || "");
      setTitle(productToEdit.title || "");
      setDescription(productToEdit.description || "");
      setStock(productToEdit.stock ?? 100);
      setRetailPrice(productToEdit.retail_price ?? productToEdit.price ?? 29.99);
      setTradePrice(productToEdit.trade_price ?? 21.5);
      setWholesalePrice(productToEdit.wholesale_price ?? 15.0);
      setMoq(productToEdit.min_order_quantity ?? 10);
      setPrimaryImage(productToEdit.primary_image || productToEdit.image_url || "");
    } else {
      setSku(`SKU-${Math.floor(100 + Math.random() * 900)}`);
      setTitle("");
      setDescription("");
      setStock(100);
      setRetailPrice(29.99);
      setTradePrice(21.5);
      setWholesalePrice(15.0);
      setMoq(10);
      setPrimaryImage("https://images.unsplash.com/photo-1527864550417-7fd91fc51a46");
    }
    setError(null);
  }, [productToEdit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    const payload = {
      sku,
      title,
      description,
      stock: Number(stock),
      retail_price: Number(retailPrice),
      trade_price: Number(tradePrice),
      wholesale_price: Number(wholesalePrice),
      moq: Number(moq),
      primary_image: primaryImage || "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46",
    };

    try {
      if (isEditing && productToEdit?.id) {
        await api(siteConfig.api.endpoints.products.detail(productToEdit.id), {
          method: "PATCH",
          body: JSON.stringify(payload),
        });
      } else {
        await api(siteConfig.api.endpoints.products.list, {
          method: "POST",
          body: JSON.stringify(payload),
        });
      }
      if (onSuccess) onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || "Failed to save product in catalog.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
      <div className="bg-surface border border-subtle rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-canvas border-b border-subtle flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-amber-surface border border-subtle text-amber-primary">
              {isEditing ? <Edit2 className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
            </div>
            <div>
              <h3 className="text-base font-bold text-foreground">
                {isEditing ? `Edit Product (SKU: ${sku})` : "List New Catalog Product"}
              </h3>
              <p className="text-xs text-text-muted">
                Configure inventory stock, descriptions, and multi-tier pricing rates.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-text-muted hover:text-foreground hover:bg-surface rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
          {error && (
            <div className="p-3 bg-amber-surface border border-subtle rounded-xl text-amber-primary text-xs">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-foreground">SKU Code</label>
              <input
                type="text"
                required
                disabled={isEditing}
                value={sku}
                onChange={(e) => setSku(e.target.value)}
                className="w-full bg-canvas border border-subtle rounded-xl px-3 py-2 text-xs text-foreground disabled:opacity-60"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-foreground">Product Title</label>
              <input
                type="text"
                required
                placeholder="e.g. Ergonomic Office Chair"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-canvas border border-subtle rounded-xl px-3 py-2 text-xs text-foreground"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-foreground">Description</label>
            <textarea
              rows={2}
              placeholder="Commercial specifications and features..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-canvas border border-subtle rounded-xl px-3 py-2 text-xs text-foreground"
            />
          </div>

          {/* Pricing & MOQ Tiers */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 bg-canvas p-4 rounded-2xl border border-subtle">
            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-amber-primary">Retail Rate ($)</label>
              <input
                type="number"
                step="0.01"
                min="0.01"
                required
                value={retailPrice}
                onChange={(e) => setRetailPrice(Number(e.target.value))}
                className="w-full bg-surface border border-subtle rounded-xl px-3 py-2 text-xs text-foreground font-mono"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-amber-primary">Trade Rate ($)</label>
              <input
                type="number"
                step="0.01"
                min="0.01"
                required
                value={tradePrice}
                onChange={(e) => setTradePrice(Number(e.target.value))}
                className="w-full bg-surface border border-subtle rounded-xl px-3 py-2 text-xs text-foreground font-mono"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-amber-primary">Wholesale ($)</label>
              <input
                type="number"
                step="0.01"
                min="0.01"
                required
                value={wholesalePrice}
                onChange={(e) => setWholesalePrice(Number(e.target.value))}
                className="w-full bg-surface border border-subtle rounded-xl px-3 py-2 text-xs text-foreground font-mono"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-amber-primary">Req. MOQ</label>
              <input
                type="number"
                min="1"
                required
                value={moq}
                onChange={(e) => setMoq(Number(e.target.value))}
                className="w-full bg-surface border border-subtle rounded-xl px-3 py-2 text-xs text-foreground font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-foreground">Initial Stock Quantity</label>
              <input
                type="number"
                min="0"
                required
                value={stock}
                onChange={(e) => setStock(Number(e.target.value))}
                className="w-full bg-canvas border border-subtle rounded-xl px-3 py-2 text-xs text-foreground"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-foreground">Primary Image URL</label>
              <input
                type="text"
                placeholder="https://images.unsplash.com/..."
                value={primaryImage}
                onChange={(e) => setPrimaryImage(e.target.value)}
                className="w-full bg-canvas border border-subtle rounded-xl px-3 py-2 text-xs text-foreground"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-subtle flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-text-muted hover:text-foreground hover:bg-canvas rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 text-xs font-bold bg-amber-primary hover:bg-amber-hover text-white rounded-xl transition-all flex items-center gap-2 shadow-sm"
            >
              {submitting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : isEditing ? (
                "Save Changes"
              ) : (
                "List Product"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
