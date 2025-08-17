import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { ArrowLeft, Plus, Edit, Trash2, Package } from "lucide-react";
import type { Product, InsertProduct } from "@/types";

interface ProductsPageProps {
  onBack: () => void;
}

export default function ProductsPage({ onBack }: ProductsPageProps) {
  const { t } = useTranslation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const [formData, setFormData] = useState<InsertProduct>({
    retailOutletId: "",
    name: "",
    pricePerLiter: "0",
  });

  const { data: products = [], isLoading } = useQuery<Product[]>({
    queryKey: ["/api/products"],
  });

  const createMutation = useMutation({
    mutationFn: async (data: InsertProduct) => {
      return await apiRequest("/api/products", "POST", data);
    },
    onSuccess: () => {
      toast({
        title: t("common.success"),
        description: t("products.productCreatedSuccess"),
      });
      setIsDialogOpen(false);
      resetForm();
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
    },
    onError: (error) => {
      toast({
        title: t("common.error"),
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (data: { id: string; product: Partial<InsertProduct> }) => {
      return await apiRequest(`/api/products/${data.id}`, "PUT", data.product);
    },
    onSuccess: () => {
      toast({
        title: t("common.success"),
        description: t("products.productUpdatedSuccess"),
      });
      setIsDialogOpen(false);
      resetForm();
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
    },
    onError: (error) => {
      toast({
        title: t("common.error"),
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return await apiRequest(`/api/products/${id}`, "DELETE");
    },
    onSuccess: () => {
      toast({
        title: t("common.success"),
        description: t("products.productDeletedSuccess"),
      });
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
    },
    onError: (error) => {
      toast({
        title: t("common.error"),
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const resetForm = () => {
    setFormData({
      retailOutletId: "",
      name: "",
      pricePerLiter: "0",
    });
    setEditingProduct(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields
    if (!formData.name.trim()) {
      toast({
        title: t("common.error"),
        description: t("products.productNameRequired"),
        variant: "destructive",
      });
      return;
    }
    
    if (!formData.pricePerLiter || parseFloat(formData.pricePerLiter) <= 0) {
      toast({
        title: t("common.error"),
        description: t("products.validPriceRequired"),
        variant: "destructive",
      });
      return;
    }

    if (editingProduct) {
      updateMutation.mutate({ id: editingProduct.id, product: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      retailOutletId: product.retailOutletId,
      name: product.name,
      pricePerLiter: product.pricePerLiter,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string, productName: string) => {
    if (window.confirm(t("products.deleteConfirmation", { productName }))) {
      deleteMutation.mutate(id);
    }
  };

  const getFuelTypeLabel = (type: string) => {
    switch (type) {
      case "petrol":
        return t("tankManagement.petrol");
      case "diesel":
        return t("tankManagement.diesel");
      case "premium":
        return t("tankManagement.premium");
      default:
        return type;
    }
  };

  if (isLoading) {
    return (
      <div className="p-4">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          <div className="h-20 bg-gray-200 rounded"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 pb-20">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <Button
            variant="ghost"
            size="icon"
            onClick={onBack}
            className="mr-3"
            data-testid="back-button"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-xl font-semibold" data-testid="page-title">
            {t("products.title")}
          </h1>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm} data-testid="add-product-button">
              <Plus className="h-4 w-4 mr-2" />
              {t("products.addProduct")}
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingProduct ? t("products.editProduct") : t("products.addNewProduct")}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">{t("products.productName")}</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder={t("products.enterProductName")}
                  required
                  data-testid="input-product-name"
                />
              </div>



              <div className="space-y-2">
                <Label htmlFor="pricePerLiter">{t("products.pricePerLiter")} (₹)</Label>
                <Input
                  id="pricePerLiter"
                  type="number"
                  step="0.01"
                  value={formData.pricePerLiter}
                  onChange={(e) => setFormData({ ...formData, pricePerLiter: e.target.value })}
                  placeholder="0.00"
                  required
                  data-testid="input-price"
                />
              </div>

              <div className="flex space-x-3 pt-4">
                <Button
                  type="submit"
                  disabled={createMutation.isPending || updateMutation.isPending}
                  className="flex-1"
                  data-testid="save-product-button"
                >
                  {createMutation.isPending || updateMutation.isPending
                    ? t("common.saving")
                    : editingProduct
                    ? t("common.update")
                    : t("common.save")}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                  className="flex-1"
                  data-testid="cancel-button"
                >
                  {t("common.cancel")}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Products List */}
      <div className="space-y-4">
        {products.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <Package className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold text-gray-600 mb-2">
                {t("products.noProducts")}
              </h3>
              <p className="text-gray-500 mb-4">
                {t("products.noProductsDescription")}
              </p>
              <Button onClick={() => setIsDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                {t("products.addProduct")}
              </Button>
            </CardContent>
          </Card>
        ) : (
          products.map((product: Product) => (
            <Card key={product.id} data-testid={`product-card-${product.id}`}>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center text-lg">
                    <Package className="h-5 w-5 mr-2 text-primary" />
                    {product.name}
                  </CardTitle>
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(product)}
                      data-testid={`edit-product-${product.id}`}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(product.id, product.name)}
                      data-testid={`delete-product-${product.id}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-sm">
                  <div>
                    <p className="text-gray-600">{t("products.pricePerLiter")}</p>
                    <p className="font-medium text-lg">₹{parseFloat(product.pricePerLiter).toFixed(2)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}