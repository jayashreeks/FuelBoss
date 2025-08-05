import { ArrowLeft, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface ShiftPageProps {
  onBack?: () => void;
}

interface ProductRate {
  productId: string;
  productName: string;
  rate: number;
  lastUpdated?: string;
}

interface Shift {
  id: string;
  type: 'morning' | 'evening' | 'night';
  startTime?: string;
  endTime?: string;
  status: 'not-started' | 'active' | 'completed';
  productRates: ProductRate[];
}

export default function ShiftPage({ onBack }: ShiftPageProps) {
  const [selectedShiftType, setSelectedShiftType] = useState<'morning' | 'evening' | 'night'>('morning');
  const [productRates, setProductRates] = useState<ProductRate[]>([]);
  const [currentShift, setCurrentShift] = useState<Shift | null>(null);
  const { toast } = useToast();

  // Fetch products for rate entry
  const { data: products } = useQuery({
    queryKey: ['/api/manager/products'],
    retry: false,
  });

  // Fetch current shift data
  const { data: shiftData } = useQuery({
    queryKey: ['/api/shifts/current'],
    retry: false,
  });

  // Fetch last saved rates
  const { data: lastRates } = useQuery({
    queryKey: ['/api/shifts/last-rates'],
    retry: false,
  });

  // Initialize product rates when products load
  useEffect(() => {
    if (products && products.length > 0) {
      const initialRates = products.map((product: any) => {
        const lastRate = lastRates?.find((rate: any) => rate.productId === product.id);
        return {
          productId: product.id,
          productName: product.name,
          rate: lastRate?.rate || 0,
          lastUpdated: lastRate?.lastUpdated,
        };
      });
      setProductRates(initialRates);
    }
  }, [products, lastRates]);

  // Save rates mutation
  const saveRatesMutation = useMutation({
    mutationFn: async (rates: ProductRate[]) => {
      return apiRequest('/api/shifts/rates', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          shiftType: selectedShiftType,
          rates: rates,
        }),
      });
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Product rates saved successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/shifts/last-rates'] });
    },
    onError: (error) => {
      console.error('Save rates error:', error);
      toast({
        title: "Error",
        description: "Failed to save product rates",
        variant: "destructive",
      });
    },
  });



  const handleRateChange = (productId: string, rate: string) => {
    const numericRate = parseFloat(rate) || 0;
    setProductRates(prev => 
      prev.map(item => 
        item.productId === productId 
          ? { ...item, rate: numericRate }
          : item
      )
    );
  };

  const handleSaveRates = () => {
    saveRatesMutation.mutate(productRates);
  };



  return (
    <div className="min-h-screen bg-surface pb-20">
      <div className="bg-primary text-white p-4">
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
          <h1 className="text-xl font-semibold" data-testid="page-title">
            Shift Management
          </h1>
        </div>
      </div>

      <div className="p-4 space-y-6">
        {/* Shift Selection */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold mb-4">Select Shift</h2>
          <div className="space-y-4">
            <div>
              <Label htmlFor="shift-type">Shift Type</Label>
              <Select 
                value={selectedShiftType} 
                onValueChange={(value: 'morning' | 'evening' | 'night') => setSelectedShiftType(value)}
              >
                <SelectTrigger className="mt-1" data-testid="shift-type-select">
                  <SelectValue placeholder="Select shift type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="morning">Morning Shift (6 AM - 2 PM)</SelectItem>
                  <SelectItem value="evening">Evening Shift (2 PM - 10 PM)</SelectItem>
                  <SelectItem value="night">Night Shift (10 PM - 6 AM)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-sm font-medium text-gray-600">Current Status</h3>
                <p className="text-lg font-semibold" data-testid="shift-status">
                  {currentShift?.status === 'active' ? 'Active' : 'Not Started'}
                </p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-sm font-medium text-gray-600">Duration</h3>
                <p className="text-lg font-semibold" data-testid="shift-duration">
                  {currentShift?.status === 'active' ? '00:45' : '--:--'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Product Rates */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Product Rates</h2>
            <Button 
              onClick={handleSaveRates}
              disabled={saveRatesMutation.isPending}
              size="sm"
              data-testid="save-rates"
            >
              <Save className="h-4 w-4 mr-2" />
              Save Rates
            </Button>
          </div>

          <div className="space-y-4">
            {productRates.length > 0 ? (
              productRates.map((product) => (
                <div key={product.productId} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <h3 className="font-medium">{product.productName}</h3>
                    {product.lastUpdated && (
                      <p className="text-sm text-gray-500">
                        Last updated: {new Date(product.lastUpdated).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center space-x-2">
                    <Label htmlFor={`rate-${product.productId}`} className="text-sm">₹</Label>
                    <Input
                      id={`rate-${product.productId}`}
                      type="number"
                      step="0.01"
                      value={product.rate}
                      onChange={(e) => handleRateChange(product.productId, e.target.value)}
                      className="w-24"
                      data-testid={`rate-input-${product.productId}`}
                    />
                    <span className="text-sm text-gray-500">/L</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center text-gray-500 py-8" data-testid="no-products">
                No products configured. Please set up products first.
              </div>
            )}
          </div>
        </div>


      </div>
    </div>
  );
}