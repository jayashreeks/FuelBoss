import { ArrowLeft, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useShiftContext } from "@/contexts/ShiftContext";

interface ShiftPageProps {
  onBack?: () => void;
}

interface ProductRate {
  productId: string;
  productName: string;
  rate: number;
  lastUpdated?: string;
  observedDensity?: number;
  observedTemperature?: number;
  densityAt15C?: number;
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
  const { selectedShiftType, selectedDate, setSelectedShiftType, setSelectedDate } = useShiftContext();
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
    queryKey: ['/api/shifts/last-rates', selectedDate, selectedShiftType],
    queryFn: () => {
      const params = new URLSearchParams({
        date: selectedDate,
        shiftType: selectedShiftType
      });
      return fetch(`/api/shifts/last-rates?${params}`).then(res => res.json());
    },
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
      return apiRequest('/api/shifts/rates', 'POST', {
        shiftType: selectedShiftType,
        date: selectedDate,
        rates: rates,
      });
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Product rates saved successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/shifts/last-rates', selectedDate, selectedShiftType] });
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

  const handleDensityChange = (productId: string, density: string) => {
    const numericDensity = parseFloat(density) || 0;
    setProductRates(prev => 
      prev.map(item => {
        if (item.productId === productId) {
          const updatedItem = { ...item, observedDensity: numericDensity };
          // Auto-calculate density at 15°C if both density and temperature are available
          if (updatedItem.observedTemperature && numericDensity) {
            updatedItem.densityAt15C = calculateDensityAt15C(numericDensity, updatedItem.observedTemperature);
          }
          return updatedItem;
        }
        return item;
      })
    );
  };

  const handleTemperatureChange = (productId: string, temperature: string) => {
    const numericTemp = parseFloat(temperature) || 0;
    setProductRates(prev => 
      prev.map(item => {
        if (item.productId === productId) {
          const updatedItem = { ...item, observedTemperature: numericTemp };
          // Auto-calculate density at 15°C if both density and temperature are available
          if (updatedItem.observedDensity && numericTemp) {
            updatedItem.densityAt15C = calculateDensityAt15C(updatedItem.observedDensity, numericTemp);
          }
          return updatedItem;
        }
        return item;
      })
    );
  };

  // Formula to calculate density at 15°C from observed density and temperature
  const calculateDensityAt15C = (observedDensity: number, observedTemp: number): number => {
    // Using the standard petroleum density correction formula
    // Density at 15°C = Observed Density * [1 + 0.0008 * (Observed Temp - 15)]
    const correctionFactor = 1 + 0.0008 * (observedTemp - 15);
    return Math.round((observedDensity * correctionFactor) * 100) / 100; // Round to 2 decimal places for Kg/m³
  };

  const handleSaveRates = () => {
    saveRatesMutation.mutate(productRates);
  };



  return (
    <div className="min-h-screen bg-surface pb-20">
      <div className="bg-primary text-white p-4">
        <div className="flex items-center justify-between">
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
          {/* Add spacing to prevent overlap with hamburger menu */}
          <div className="w-12"></div>
        </div>
      </div>

      <div className="p-4 space-y-6">
        {/* Shift Selection */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold mb-4">Select Shift</h2>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="shift-date">Date</Label>
                <Input
                  id="shift-date"
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="mt-1"
                  data-testid="shift-date-select"
                />
              </div>
              
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
            </div>


          </div>
        </div>

        {/* Product Rates Section */}
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

        {/* Density Measurements Section */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold mb-4">Density Measurements</h2>
          
          <div className="space-y-4">
            {productRates.length > 0 ? (
              productRates.map((product) => (
                <div key={`density-${product.productId}`} className="p-4 border rounded-lg">
                  <h3 className="font-medium mb-4">{product.productName}</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor={`density-${product.productId}`} className="text-sm text-gray-600">
                        Observed Density (Kg/m³)
                      </Label>
                      <Input
                        id={`density-${product.productId}`}
                        type="number"
                        step="0.01"
                        placeholder="750.00"
                        value={product.observedDensity || ''}
                        onChange={(e) => handleDensityChange(product.productId, e.target.value)}
                        className="w-full mt-1"
                        data-testid={`density-input-${product.productId}`}
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor={`temperature-${product.productId}`} className="text-sm text-gray-600">
                        Temperature (°C)
                      </Label>
                      <Input
                        id={`temperature-${product.productId}`}
                        type="number"
                        step="0.1"
                        placeholder="25.0"
                        value={product.observedTemperature || ''}
                        onChange={(e) => handleTemperatureChange(product.productId, e.target.value)}
                        className="w-full mt-1"
                        data-testid={`temperature-input-${product.productId}`}
                      />
                    </div>

                    <div>
                      <Label className="text-sm text-gray-600">Density at 15°C</Label>
                      <div className="mt-1 p-3 bg-gray-50 rounded border text-sm font-medium">
                        {product.densityAt15C ? `${product.densityAt15C} Kg/m³` : '---'}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center text-gray-500 py-8">
                No products available for density measurements.
              </div>
            )}
          </div>
        </div>


      </div>
    </div>
  );
}