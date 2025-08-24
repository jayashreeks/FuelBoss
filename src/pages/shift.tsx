import { ArrowLeft, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useShiftContext } from "@/contexts/ShiftContext";
import { apiRequest, queryClient } from "@/lib/queryClient"; // Assume apiRequest is a helper function

interface ShiftPageProps {
  onBack?: () => void;
}

// Re-defining types for clarity and to ensure correct usage
interface Product {
  id: string;
  name: string;
  unit: string;
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
}

export default function ShiftPage({ onBack }: ShiftPageProps) {
  const { selectedShiftType, selectedDate, setSelectedShiftType, setSelectedDate } = useShiftContext();
  const [productRates, setProductRates] = useState<ProductRate[]>([]);
  const { toast } = useToast();

  // Fix 1 & 2: Correctly type the useQuery hooks to return arrays and add `queryFn`.
  // The `/api/manager/products` endpoint should return an array of Product objects.
  const { data: products = [] } = useQuery<Product[]>({
    queryKey: ['/api/manager/products'],
    queryFn: () => apiRequest('/api/manager/products'),
    retry: false,
  });

  // The `/api/shifts/last-rates` endpoint should return an array of ProductRate objects.
  const { data: lastRates = [] } = useQuery<ProductRate[]>({
    queryKey: ['/api/shifts/last-rates', selectedDate, selectedShiftType],
    queryFn: () => apiRequest(`/api/shifts/last-rates?date=${selectedDate}&shiftType=${selectedShiftType}`),
    retry: false,
    enabled: !!selectedDate && !!selectedShiftType,
  });

  // Fix 3: Initialize product rates based on fetched data.
  // Use a single useEffect hook that depends on products and lastRates.
  useEffect(() => {
    if (products.length > 0) {
      const initialRates = products.map(product => {
        const lastRate = lastRates?.find(rate => rate.productId === product.id);
        return {
          productId: product.id,
          productName: product.name,
          rate: lastRate?.rate || 0,
          observedDensity: lastRate?.observedDensity,
          observedTemperature: lastRate?.observedTemperature,
          densityAt15C: lastRate?.densityAt15C,
          lastUpdated: lastRate?.lastUpdated,
        };
      });
      setProductRates(initialRates);
    }
  }, [products, lastRates]);

  // Save rates mutation
  const saveRatesMutation = useMutation({
    mutationFn: async (rates: ProductRate[]) => {
      // Clean the data before sending to the server to avoid unnecessary fields
      const ratesToSave = rates.map(({ productName, lastUpdated, ...rest }) => rest);
      return apiRequest('/api/shifts/rates', 'POST', {
        shiftType: selectedShiftType,
        date: selectedDate,
        rates: ratesToSave,
      });
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Product rates saved successfully",
      });
      // Invalidate both relevant queries to re-fetch and re-render with new data
      queryClient.invalidateQueries({ queryKey: ['/api/shifts/last-rates', selectedDate, selectedShiftType] });
      queryClient.invalidateQueries({ queryKey: ['/api/shifts/rates'] });
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

  // Fix 4: Simplified change handlers
  const handleRateChange = (productId: string, rate: string) => {
    setProductRates(prev =>
      prev.map(item =>
        item.productId === productId ? { ...item, rate: parseFloat(rate) || 0 } : item
      )
    );
  };

  const updateDensityAndTemperature = (productId: string, field: 'observedDensity' | 'observedTemperature', value: string) => {
    const numericValue = parseFloat(value) || 0;
    setProductRates(prev =>
      prev.map(item => {
        if (item.productId === productId) {
          const updatedItem = { ...item, [field]: numericValue };
          if (updatedItem.observedDensity && updatedItem.observedTemperature) {
            updatedItem.densityAt15C = calculateDensityAt15C(updatedItem.observedDensity, updatedItem.observedTemperature);
          }
          return updatedItem;
        }
        return item;
      })
    );
  };

  const calculateDensityAt15C = (observedDensity: number, observedTemp: number): number => {
    // Density at 15°C = Observed Density * [1 + 0.0008 * (Observed Temp - 15)]
    const correctionFactor = 1 + 0.0008 * (observedTemp - 15);
    return Math.round((observedDensity