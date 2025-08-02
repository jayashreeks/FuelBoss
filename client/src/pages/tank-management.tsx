import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { ArrowLeft, Plus, Truck, Edit3, Trash2, Fuel } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

interface TankManagementPageProps {
  onBack: () => void;
}

const tankSchema = z.object({
  tankNumber: z.string().min(1, "Tank number is required"),
  productId: z.string().min(1, "Product is required"),
  capacity: z.number().min(1, "Capacity must be greater than 0"),
  currentStock: z.number().min(0, "Current stock cannot be negative"),
  minimumLevel: z.number().min(0, "Minimum level cannot be negative"),
});

type TankForm = z.infer<typeof tankSchema>;

export default function TankManagementPage({ onBack }: TankManagementPageProps) {
  const { t } = useTranslation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTank, setEditingTank] = useState<any>(null);

  const { data: tanks = [], isLoading } = useQuery({
    queryKey: ["/api/tanks"],
  });

  const { data: products = [] } = useQuery({
    queryKey: ["/api/products"],
  });

  const form = useForm<TankForm>({
    resolver: zodResolver(tankSchema),
    defaultValues: {
      tankNumber: "",
      productId: "",
      capacity: 0,
      currentStock: 0,
      minimumLevel: 0,
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: TankForm) => {
      return apiRequest("/api/tanks", "POST", data);
    },
    onSuccess: () => {
      toast({
        title: t("common.success"),
        description: t("tankManagement.createSuccess"),
      });
      setIsDialogOpen(false);
      form.reset();
      queryClient.invalidateQueries({ queryKey: ["/api/tanks"] });
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
    mutationFn: async ({ id, data }: { id: string; data: TankForm }) => {
      return apiRequest(`/api/tanks/${id}`, "PUT", data);
    },
    onSuccess: () => {
      toast({
        title: t("common.success"),
        description: t("tankManagement.updateSuccess"),
      });
      setIsDialogOpen(false);
      setEditingTank(null);
      form.reset();
      queryClient.invalidateQueries({ queryKey: ["/api/tanks"] });
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
      return apiRequest(`/api/tanks/${id}`, "DELETE");
    },
    onSuccess: () => {
      toast({
        title: t("common.success"),
        description: t("tankManagement.deleteSuccess"),
      });
      queryClient.invalidateQueries({ queryKey: ["/api/tanks"] });
    },
    onError: (error) => {
      toast({
        title: t("common.error"),
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (data: TankForm) => {
    if (editingTank) {
      updateMutation.mutate({ id: editingTank.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleEdit = (tank: any) => {
    setEditingTank(tank);
    form.reset({
      tankNumber: tank.tankNumber,
      productId: tank.productId,
      capacity: tank.capacity,
      currentStock: tank.currentStock,
      minimumLevel: tank.minimumLevel,
    });
    setIsDialogOpen(true);
  };

  const handleAddNew = () => {
    setEditingTank(null);
    form.reset();
    setIsDialogOpen(true);
  };

  const getFuelTypeColor = (fuelType: string) => {
    switch (fuelType) {
      case "petrol": return "text-red-600 bg-red-50";
      case "diesel": return "text-yellow-600 bg-yellow-50";
      case "cng": return "text-green-600 bg-green-50";
      default: return "text-gray-600 bg-gray-50";
    }
  };

  const getStatusColor = (currentLevel: number, minThreshold: number, capacity: number) => {
    const percentage = (currentLevel / capacity) * 100;
    if (currentLevel <= minThreshold) return "text-red-600 bg-red-50";
    if (percentage < 25) return "text-orange-600 bg-orange-50";
    return "text-green-600 bg-green-50";
  };

  if (isLoading) {
    return (
      <div className="p-4">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          <div className="h-20 bg-gray-200 rounded"></div>
          <div className="h-20 bg-gray-200 rounded"></div>
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
            {t("menu.tankManagement")}
          </h1>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={handleAddNew} data-testid="add-tank-button">
              <Plus className="h-4 w-4 mr-2" />
              {t("tankManagement.addTank")}
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingTank ? t("tankManagement.editTank") : t("tankManagement.addTank")}
              </DialogTitle>
              <DialogDescription>
                {editingTank ? t("tankManagement.editDescription") : t("tankManagement.addDescription")}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="tankNumber">Tank Number</Label>
                <Input
                  id="tankNumber"
                  {...form.register("tankNumber")}
                  data-testid="input-tank-number"
                  placeholder="Tank 1, Tank 2, etc."
                />
                {form.formState.errors.tankNumber && (
                  <p className="text-sm text-red-600">{form.formState.errors.tankNumber.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label>Product</Label>
                <Select
                  value={form.watch("productId")}
                  onValueChange={(value) => form.setValue("productId", value)}
                >
                  <SelectTrigger data-testid="select-product">
                    <SelectValue placeholder="Select a product" />
                  </SelectTrigger>
                  <SelectContent>
                    {products.map((product: any) => (
                      <SelectItem key={product.id} value={product.id}>
                        {product.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {form.formState.errors.productId && (
                  <p className="text-sm text-red-600">{form.formState.errors.productId.message}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="capacity">Capacity (L)</Label>
                  <Input
                    id="capacity"
                    type="number"
                    {...form.register("capacity", { valueAsNumber: true })}
                    data-testid="input-capacity"
                  />
                  {form.formState.errors.capacity && (
                    <p className="text-sm text-red-600">{form.formState.errors.capacity.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="currentStock">Current Stock (L)</Label>
                  <Input
                    id="currentStock"
                    type="number"
                    {...form.register("currentStock", { valueAsNumber: true })}
                    data-testid="input-current-stock"
                  />
                  {form.formState.errors.currentStock && (
                    <p className="text-sm text-red-600">{form.formState.errors.currentStock.message}</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="minimumLevel">Minimum Level (L)</Label>
                <Input
                  id="minimumLevel"
                  type="number"
                  {...form.register("minimumLevel", { valueAsNumber: true })}
                  data-testid="input-minimum-level"
                />
                {form.formState.errors.minimumLevel && (
                  <p className="text-sm text-red-600">{form.formState.errors.minimumLevel.message}</p>
                )}
              </div>

              <div className="flex space-x-3 pt-4">
                <Button
                  type="submit"
                  disabled={createMutation.isPending || updateMutation.isPending}
                  className="flex-1"
                  data-testid="save-tank-button"
                >
                  {(createMutation.isPending || updateMutation.isPending) ? 
                    t("common.saving") : t("common.save")}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                  className="flex-1"
                  data-testid="cancel-tank-button"
                >
                  {t("common.cancel")}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Tanks List */}
      {tanks.length === 0 ? (
        <Card className="text-center py-8">
          <CardContent>
            <Truck className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium mb-2">{t("tankManagement.noTanks")}</h3>
            <p className="text-gray-600 mb-4">{t("tankManagement.noTanksDescription")}</p>
            <Button onClick={handleAddNew} data-testid="add-first-tank-button">
              <Plus className="h-4 w-4 mr-2" />
              {t("tankManagement.addFirstTank")}
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {tanks.map((tank: any) => {
            const percentage = Math.round((tank.currentLevel / tank.capacity) * 100);
            return (
              <Card key={tank.id} data-testid={`tank-card-${tank.id}`}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 rounded-lg bg-primary/10">
                        <Fuel className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-medium" data-testid={`tank-name-${tank.id}`}>
                          {tank.name}
                        </h3>
                        <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getFuelTypeColor(tank.fuelType)}`}>
                          {t(`tankManagement.${tank.fuelType}`)}
                        </span>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handleEdit(tank)}
                        data-testid={`edit-tank-${tank.id}`}
                      >
                        <Edit3 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => deleteMutation.mutate(tank.id)}
                        disabled={deleteMutation.isPending}
                        data-testid={`delete-tank-${tank.id}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>{t("tankManagement.level")}</span>
                      <span className={`font-medium ${getStatusColor(tank.currentLevel, tank.minThreshold, tank.capacity)}`}>
                        {tank.currentLevel}L / {tank.capacity}L ({percentage}%)
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all ${
                          tank.currentLevel <= tank.minThreshold 
                            ? "bg-red-500" 
                            : percentage < 25 
                            ? "bg-orange-500" 
                            : "bg-green-500"
                        }`}
                        style={{ width: `${Math.max(percentage, 2)}%` }}
                      ></div>
                    </div>
                    {tank.currentLevel <= tank.minThreshold && (
                      <p className="text-sm text-red-600 font-medium">
                        ⚠️ {t("tankManagement.lowLevel")}
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}