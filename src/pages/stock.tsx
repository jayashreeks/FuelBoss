import { useState, useEffect, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Package, Save, Edit3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import ShiftDateDisplay from "@/components/ShiftDateDisplay";
import { useShiftContext } from "@/contexts/ShiftContext";
import { apiRequest } from "@/lib/queryClient";

interface StockPageProps {
  onBack?: () => void;
}

// Re-using the types from the original file for clarity
interface Tank {
  id: string;
  tankNumber: string;
  capacity: string;
  productName: string;
  productId: string;
  isActive: boolean;
}

interface StockEntry {
  id: string;
  tankId: string;
  shiftType: string;
  shiftDate: string;
  openingStock: string;
  receipt: string;
  invoiceValue: string;
  tankNumber: string;
  productName: string;
  productId: string;
}

export default function StockPage({ onBack }: StockPageProps) {
  const { selectedShiftType, selectedDate } = useShiftContext();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [editingEntries, setEditingEntries] = useState<Record<string, boolean>>({});
  const [formData, setFormData] = useState<Record<string, {
    openingStock: string;
    receipt: string;
    invoiceValue: string;
  }>>({});

  // Fix: Remove the explicit type argument <Tank[]>
  const { data: tanks = [], isLoading: tanksLoading } = useQuery({
    queryKey: ["/api/manager/tanks"],
    queryFn: () => apiRequest("/api/manager/tanks"),
  });

  // Fix: Remove the explicit type argument <StockEntry[]>
  const { data: stockEntries = [], isLoading: stockLoading } = useQuery({
    queryKey: ["/api/manager/stock", selectedShiftType, selectedDate],
    queryFn: () => apiRequest(`/api/manager/stock?shiftType=${selectedShiftType}&shiftDate=${selectedDate}`),
    enabled: !!selectedShiftType && !!selectedDate,
  });
  
  // The rest of your code is correctly structured.
  const initialFormData = useMemo(() => {
    const initialData: Record<string, {
      openingStock: string;
      receipt: string;
      invoiceValue: string;
    }> = {};
    tanks.forEach(tank => {
      const existingEntry = stockEntries.find(entry => entry.tankId === tank.id);
      initialData[tank.id] = {
        openingStock: existingEntry?.openingStock ?? "",
        receipt: existingEntry?.receipt ?? "",
        invoiceValue: existingEntry?.invoiceValue ?? "",
      };
    });
    return initialData;
  }, [tanks, stockEntries]);
  
  // Update state only when memoized value changes
  useEffect(() => {
    setFormData(initialFormData);
  }, [initialFormData]);

  const stockMutation = useMutation({
    mutationFn: async ({ tankId, data }: { tankId: string; data: any }) => {
      const existingEntry = stockEntries.find(entry => entry.tankId === tankId);
      if (existingEntry) {
        return await apiRequest(`/api/manager/stock/${existingEntry.id}`, "PATCH", data);
      } else {
        return await apiRequest("/api/manager/stock", "POST", data);
      }
    },
    onSuccess: () => {
      toast({ title: "Success", description: "Stock entry saved successfully" });
      queryClient.invalidateQueries({ queryKey: ["/api/manager/stock"] });
    },
    onError: (error: any) => {
      toast({ title: "Error", description: `Failed to save stock entry: ${error.message}`, variant: "destructive" });
    },
  });

  const handleInputChange = (tankId: string, field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [tankId]: {
        ...prev[tankId],
        [field]: value,
      },
    }));
  };

  const handleSave = async (tankId: string) => {
    const data = formData[tankId];
    if (!data || !selectedShiftType || !selectedDate) {
      toast({ title: "Error", description: "Missing shift or date information.", variant: "destructive" });
      return;
    }

    const stockData = {
      tankId,
      shiftType: selectedShiftType,
      shiftDate: selectedDate,
      openingStock: data.openingStock,
      receipt: data.receipt,
      invoiceValue: data.invoiceValue,
    };

    await stockMutation.mutateAsync({ tankId, data: stockData });
    setEditingEntries(prev => ({ ...prev, [tankId]: false }));
  };

  const toggleEdit = (tankId: string) => {
    setEditingEntries(prev => ({ ...prev, [tankId]: !prev[tankId] }));
  };

  if (tanksLoading || stockLoading || stockMutation.isPending) {
    return (
      <div className="min-h-screen bg-surface p-4 text-center">
        Loading...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface pb-20">
      <div className="bg-primary text-white p-4">
        <div className="flex items-center">
          <div className="flex items-center space-x-3">
            {onBack && (
              <Button
                variant="ghost"
                size="icon"
                onClick={onBack}
                className="text-white hover:bg-white/20"
                data-testid="back-button"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
            )}
          </div>
          <h1 className="text-xl font-semibold" data-testid="page-title">
            Stock Management
          </h1>
          <div className="w-12"></div>
        </div>
      </div>

      <div className="p-4">
        <ShiftDateDisplay
          selectedShiftType={selectedShiftType}
          selectedDate={selectedDate}
        />

        <div className="grid grid-cols-2 gap-4 mb-6">
          <Card className="bg-white rounded-lg shadow-sm p-4">
            <div className="flex items-center space-x-3">
              <Package className="h-8 w-8 text-primary" />
              <div>
                <h3 className="text-sm font-medium text-gray-600">Total Tanks</h3>
                <p className="text-xl font-semibold" data-testid="total-tanks">{tanks.length}</p>
              </div>
            </div>
          </Card>
          <Card className="bg-white rounded-lg shadow-sm p-4">
            <div className="flex items-center space-x-3">
              <Package className="h-8 w-8 text-green-500" />
              <div>
                <h3 className="text-sm font-medium text-gray-600">Entries Saved</h3>
                <p className="text-xl font-semibold" data-testid="entries-saved">{stockEntries.length}</p>
              </div>
            </div>
          </Card>
        </div>

        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Tank Stock Information</h2>

          {tanks.length === 0 ? (
            <div className="text-center text-gray-500 py-8" data-testid="no-tanks">
              No tanks available. Please add tanks in Tank Management first.
            </div>
          ) : (
            tanks.map(tank => {
              const existingEntry = stockEntries.find(entry => entry.tankId === tank.id);
              const isEditing = editingEntries[tank.id] || !existingEntry;
              const tankFormData = formData[tank.id] || { openingStock: "", receipt: "", invoiceValue: "" };

              return (
                <Card key={tank.id} className="bg-white">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">
                        Tank {tank.tankNumber} - {tank.productName}
                      </CardTitle>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => toggleEdit(tank.id)}
                          data-testid={`edit-tank-${tank.id}`}
                          className={isEditing ? "bg-primary text-white" : ""}
                        >
                          <Edit3 className="h-4 w-4 mr-1" />
                          {isEditing ? "Editing" : "Edit"}
                        </Button>
                        <Button
                          onClick={() => handleSave(tank.id)}
                          disabled={stockMutation.isPending}
                          data-testid={`save-tank-${tank.id}`}
                        >
                          <Save className="h-4 w-4 mr-1" />
                          Save
                        </Button>
                      </div>
                    </div>
                    <div className="text-sm text-gray-500">
                      Capacity: {tank.capacity}L
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 gap-4">
                      <div>
                        <Label htmlFor={`opening-${tank.id}`}>Opening Stock (Liters)</Label>
                        <Input
                          id={`opening-${tank.id}`}
                          type="number"
                          placeholder="Enter opening stock in liters"
                          value={tankFormData.openingStock}
                          onChange={(e) => handleInputChange(tank.id, "openingStock", e.target.value)}
                          disabled={!isEditing}
                          data-testid={`input-opening-stock-${tank.id}`}
                        />
                      </div>
                      <div>
                        <Label htmlFor={`receipt-${tank.id}`}>Receipt (Liters)</Label>
                        <Input
                          id={`receipt-${tank.id}`}
                          type="number"
                          placeholder="Enter liters received"
                          value={tankFormData.receipt}
                          onChange={(e) => handleInputChange(tank.id, "receipt", e.target.value)}
                          disabled={!isEditing}
                          data-testid={`input-receipt-${tank.id}`}
                        />
                      </div>
                      <div>
                        <Label htmlFor={`invoice-${tank.id}`}>Invoice Value (₹)</Label>
                        <Input
                          id={`invoice-${tank.id}`}
                          type="number"
                          placeholder="Enter total invoice amount"
                          value={tankFormData.invoiceValue}
                          onChange={(e) => handleInputChange(tank.id, "invoiceValue", e.target.value)}
                          disabled={!isEditing}
                          data-testid={`input-invoice-value-${tank.id}`}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}