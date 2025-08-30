import { ArrowLeft, Plus, User, Fuel, Calculator, DollarSign, CreditCard, Smartphone, Banknote } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import ShiftDateDisplay from "@/components/ShiftDateDisplay";
import { useShiftContext } from "@/contexts/ShiftContext";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useState, useEffect } from "react";

interface ReadingsPageProps {
  onBack?: () => void;
}

interface Attendant {
  id: string;
  name: string;
  phoneNumber: string;
  role: string;
}

interface Nozzle {
  id: string;
  nozzleNumber: number;
  dispensingUnitName: string;
  tankNumber: string;
  productName: string;
  productId: string;
  calibrationValidUntil: string;
}

interface Reading {
  id: string;
  nozzleId: string;
  attendantId: string;
  previousReading: string; // This will be renamed to openingReading in display
  currentReading: string;  // This will be renamed to closingReading in display
  testing: string;
  totalSale: string;
  cashSales: string;
  creditSales: string;
  upiSales: string;
  cardSales: string;
  shiftType: string;
  shiftDate: string;
}

interface LastReading {
  id: string;
  currentReading: string;
}

export default function ReadingsPage({ onBack }: ReadingsPageProps) {
  const { selectedShiftType, selectedDate } = useShiftContext();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [selectedAttendantId, setSelectedAttendantId] = useState<string>("");
  const [selectedNozzleId, setSelectedNozzleId] = useState<string>("");
  const [formData, setFormData] = useState({
    previousReading: "", // Opening reading
    currentReading: "",  // Closing reading
    testing: "0",
    cashSales: "0",
    creditSales: "0",
    upiSales: "0",
    cardSales: "0"
  });

  // Fetch attendants
  const { data: attendants = [], isLoading: loadingAttendants } = useQuery<Attendant[]>({
    queryKey: ["/api/manager/attendants"],
    retry: false,
  });

  // Fetch nozzles
  const { data: nozzles = [], isLoading: loadingNozzles } = useQuery<Nozzle[]>({
    queryKey: ["/api/manager/nozzles"],
    retry: false,
  });

  // Fetch readings for current shift and date
  const { data: readings = [], isLoading: loadingReadings } = useQuery<Reading[]>({
    queryKey: ["/api/manager/readings", selectedShiftType, selectedDate],
    retry: false,
  });

  // Fetch last reading for selected nozzle
  const { data: lastReading } = useQuery<LastReading | null>({
    queryKey: ["/api/manager/nozzles", selectedNozzleId, "last-reading"],
    enabled: !!selectedNozzleId,
    retry: false,
    staleTime: 0, // Always refetch to avoid cache issues
  });

  // Fetch current rates for calculations
  const { data: currentRates = [] } = useQuery<any[]>({
    queryKey: [`/api/shifts/last-rates?date=${selectedDate}&shiftType=${selectedShiftType}`],
    retry: false,
    staleTime: 0, // Always refetch to get latest rates
  });

  // Create reading mutation
  const createReading = useMutation({
    mutationFn: async (readingData: any) => {
      return await apiRequest("/api/manager/readings", "POST", readingData);
    },
    onSuccess: () => {
      toast({
        title: "Success", 
        description: "Reading recorded successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/manager/readings"] });
      // Keep form populated and nozzle selected for editing
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to record reading",
        variant: "destructive",
      });
    },
  });

  // Update reading mutation for editing existing readings
  const updateReading = useMutation({
    mutationFn: async ({ id, readingData }: { id: string, readingData: any }) => {
      return await apiRequest(`/api/manager/readings/${id}`, "PATCH", readingData);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Reading updated successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/manager/readings"] });
      // Keep form populated and nozzle selected for continued editing
    },
    onError: (error) => {
      toast({
        title: "Error", 
        description: "Failed to update reading",
        variant: "destructive",
      });
    },
  });

  const handleAttendantChange = (attendantId: string) => {
    setSelectedAttendantId(attendantId);
    setSelectedNozzleId("");
  };

  const handleNozzleChange = (nozzleId: string) => {
    setSelectedNozzleId(nozzleId);
  };

  // Check if reading exists for this nozzle and shift
  const existingReading = readings.find(r => r.nozzleId === selectedNozzleId);

  // Effect to handle previous reading population when lastReading data changes
  useEffect(() => {
    if (selectedNozzleId && lastReading !== undefined && !existingReading) {
      // Only populate from lastReading if we're not editing an existing reading
      if (lastReading && lastReading.currentReading) {
        setFormData(prev => ({
          ...prev,
          previousReading: lastReading.currentReading
        }));
      } else {
        setFormData(prev => ({
          ...prev,
          previousReading: ""
        }));
      }
    }
  }, [lastReading, selectedNozzleId, existingReading]);
  
  // Effect to populate form with existing reading data when editing
  useEffect(() => {
    if (existingReading && selectedNozzleId === existingReading.nozzleId) {
      setFormData({
        previousReading: existingReading.previousReading,
        currentReading: existingReading.currentReading,
        testing: existingReading.testing,
        cashSales: existingReading.cashSales,
        creditSales: existingReading.creditSales,
        upiSales: existingReading.upiSales,
        cardSales: existingReading.cardSales,
      });
      setSelectedAttendantId(existingReading.attendantId);
    } else if (selectedNozzleId && !existingReading) {
      // Reset form for new reading
      setFormData({
        previousReading: "",
        currentReading: "",
        testing: "0",
        cashSales: "0",
        creditSales: "0",
        upiSales: "0",
        cardSales: "0"
      });
    }
  }, [existingReading, selectedNozzleId]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const calculateTotalSale = () => {
    const cash = parseFloat(formData.cashSales) || 0;
    const credit = parseFloat(formData.creditSales) || 0;
    const upi = parseFloat(formData.upiSales) || 0;
    const card = parseFloat(formData.cardSales) || 0;
    return (cash + credit + upi + card).toFixed(2);
  };

  const calculateSalesProceeds = () => {
    if (!selectedNozzleId || !formData.currentReading || !formData.previousReading) {
      return { calculated: "0.00", actual: "0.00", shortage: "0.00", liters: "0.00", rate: "0.00" };
    }

    const selectedNozzle = nozzles.find(n => n.id === selectedNozzleId);
    if (!selectedNozzle) return { calculated: "0.00", actual: "0.00", shortage: "0.00", liters: "0.00", rate: "0.00" };

    // Debug: log to see what we have
    console.log("Current rates available:", currentRates);
    console.log("Selected nozzle:", selectedNozzle);
    console.log("Selected nozzle product ID:", selectedNozzle?.productId);
    
    // Find the rate for this product from current rates
    const productRate = (currentRates as any[]).find((rate: any) => rate.productId === selectedNozzle?.productId);
    console.log("Found product rate:", productRate);
    
    // If no rate found, return zeros but still calculate other values
    const rate = productRate ? parseFloat(productRate.rate) || 0 : 0;
    console.log("Final rate:", rate);

    const currentReading = parseFloat(formData.currentReading) || 0;
    const previousReading = parseFloat(formData.previousReading) || 0;
    const testing = parseFloat(formData.testing) || 0;
    
    // Calculate liters sold
    const litersSold = currentReading - previousReading - testing;
    
    // Calculate expected sales proceeds (only if rate is available)
    const calculatedProceeds = rate > 0 ? litersSold * rate : 0;
    
    // Calculate actual sales proceeds
    const actualProceeds = parseFloat(calculateTotalSale());
    
    // Calculate shortage
    const shortage = calculatedProceeds - actualProceeds;

    return {
      calculated: calculatedProceeds.toFixed(2),
      actual: actualProceeds.toFixed(2),
      shortage: shortage.toFixed(2),
      liters: litersSold.toFixed(2),
      rate: rate.toFixed(2)
    };
  };

  // Check if next shift has data to determine if current shift is editable
  const getNextShift = (current: string) => {
    const shifts = ['morning', 'evening', 'night'];
    const currentIndex = shifts.indexOf(current);
    return currentIndex < shifts.length - 1 ? shifts[currentIndex + 1] : null;
  };
  
  const nextShift = getNextShift(selectedShiftType);
  const { data: nextShiftReadings = [] } = useQuery<Reading[]>({
    queryKey: ["/api/manager/readings", nextShift, selectedDate],
    enabled: !!nextShift,
    retry: false,
  });
  
  const isEditable = !nextShift || nextShiftReadings.length === 0;

  const handleSubmit = () => {
    if (!selectedAttendantId || !selectedNozzleId || !formData.currentReading || !formData.previousReading) {
      toast({
        title: "Error",
        description: "Please fill all required fields including previous reading",
        variant: "destructive",
      });
      return;
    }

    const totalSale = calculateTotalSale();
    
    const readingData = {
      nozzleId: selectedNozzleId,
      attendantId: selectedAttendantId,
      shiftType: selectedShiftType,
      shiftDate: selectedDate,
      previousReading: formData.previousReading,
      currentReading: formData.currentReading,
      testing: formData.testing,
      totalSale: totalSale,
      cashSales: formData.cashSales,
      creditSales: formData.creditSales,
      upiSales: formData.upiSales,
      cardSales: formData.cardSales,
    };

    if (existingReading) {
      updateReading.mutate({ id: existingReading.id, readingData });
    } else {
      createReading.mutate(readingData);
    }
  };

  const selectedNozzle = nozzles.find((n: Nozzle) => n.id === selectedNozzleId);
  const selectedAttendant = attendants.find((a: Attendant) => a.id === selectedAttendantId);

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
          </div>
          <div className="flex items-center space-x-3">
            <h1 className="text-xl font-semibold" data-testid="page-title">
              Nozzle Readings
            </h1>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-4">
        <ShiftDateDisplay
          selectedShiftType={selectedShiftType}
          selectedDate={selectedDate}
        />

        {/* Attendant Selection */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Select Attendant
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Select value={selectedAttendantId} onValueChange={handleAttendantChange} data-testid="select-attendant">
              <SelectTrigger>
                <SelectValue placeholder="Choose attendant..." />
              </SelectTrigger>
              <SelectContent>
                {attendants.map((attendant: Attendant) => (
                  <SelectItem key={attendant.id} value={attendant.id}>
                    {attendant.name} ({attendant.phoneNumber})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        {/* Nozzle Selection */}
        {selectedAttendantId && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Fuel className="h-5 w-5" />
                Select Nozzle
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Select value={selectedNozzleId} onValueChange={handleNozzleChange} data-testid="select-nozzle">
                <SelectTrigger>
                  <SelectValue placeholder="Choose nozzle..." />
                </SelectTrigger>
                <SelectContent>
                  {nozzles.map((nozzle: Nozzle) => {
                    const hasReading = readings.find(r => r.nozzleId === nozzle.id);
                    return (
                      <SelectItem key={nozzle.id} value={nozzle.id}>
                        Nozzle {nozzle.nozzleNumber} - {nozzle.dispensingUnitName} - {nozzle.productName} (Tank {nozzle.tankNumber})
                        {hasReading && <span className="ml-2 text-green-600">✓ Recorded</span>}
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>
        )}

        {/* Reading Form */}
        {selectedNozzleId && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calculator className="h-5 w-5" />
                {existingReading ? "Edit Reading" : "Record Reading"}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4" data-testid="reading-form">
              {selectedNozzle && (
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="font-medium">Nozzle {selectedNozzle.nozzleNumber}</p>
                  <p className="text-sm text-gray-600">{selectedNozzle.dispensingUnitName} - {selectedNozzle.productName}</p>
                  <p className="text-sm text-gray-600">Tank {selectedNozzle.tankNumber}</p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="opening-reading">Opening Reading</Label>
                  {lastReading && lastReading.currentReading ? (
                    <Input
                      id="opening-reading"
                      type="number"
                      step="0.01"
                      value={formData.previousReading}
                      data-testid="input-opening-reading"
                      readOnly
                      className="bg-gray-100"
                      placeholder="From previous shift"
                    />
                  ) : (
                    <Input
                      id="opening-reading"
                      type="number"
                      step="0.01"
                      value={formData.previousReading}
                      onChange={(e) => handleInputChange("previousReading", e.target.value)}
                      data-testid="input-opening-reading"
                      placeholder="Enter opening reading"
                      className="border-orange-300 focus:border-orange-500"
                    />
                  )}
                  {!lastReading && (
                    <p className="text-xs text-orange-600 mt-1">
                      No previous reading found. Please enter the starting reading.
                    </p>
                  )}
                </div>
                
                <div>
                  <Label htmlFor="closing-reading">Closing Reading *</Label>
                  <Input
                    id="closing-reading"
                    type="number"
                    step="0.01"
                    value={formData.currentReading}
                    onChange={(e) => handleInputChange("currentReading", e.target.value)}
                    data-testid="input-closing-reading"
                    placeholder="Enter closing reading"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="testing">Testing (Liters)</Label>
                <Input
                  id="testing"
                  type="number"
                  step="0.01"
                  value={formData.testing}
                  onChange={(e) => handleInputChange("testing", e.target.value)}
                  data-testid="input-testing"
                  placeholder="0"
                />
              </div>

              <div className="space-y-3">
                <h4 className="font-medium flex items-center gap-2">
                  <DollarSign className="h-4 w-4" />
                  Sales Proceeds
                </h4>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="cash-sales" className="flex items-center gap-2">
                      <Banknote className="h-4 w-4" />
                      Cash Sales
                    </Label>
                    <Input
                      id="cash-sales"
                      type="number"
                      step="0.01"
                      value={formData.cashSales}
                      onChange={(e) => handleInputChange("cashSales", e.target.value)}
                      data-testid="input-cash-sales"
                      placeholder="0"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="credit-sales" className="flex items-center gap-2">
                      <CreditCard className="h-4 w-4" />
                      Credit Sales
                    </Label>
                    <Input
                      id="credit-sales"
                      type="number"
                      step="0.01"
                      value={formData.creditSales}
                      onChange={(e) => handleInputChange("creditSales", e.target.value)}
                      data-testid="input-credit-sales"
                      placeholder="0"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="upi-sales" className="flex items-center gap-2">
                      <Smartphone className="h-4 w-4" />
                      UPI Sales
                    </Label>
                    <Input
                      id="upi-sales"
                      type="number"
                      step="0.01"
                      value={formData.upiSales}
                      onChange={(e) => handleInputChange("upiSales", e.target.value)}
                      data-testid="input-upi-sales"
                      placeholder="0"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="card-sales" className="flex items-center gap-2">
                      <CreditCard className="h-4 w-4" />
                      Card Sales
                    </Label>
                    <Input
                      id="card-sales"
                      type="number"
                      step="0.01"
                      value={formData.cardSales}
                      onChange={(e) => handleInputChange("cardSales", e.target.value)}
                      data-testid="input-card-sales"
                      placeholder="0"
                    />
                  </div>
                </div>

                <div className="p-3 bg-blue-50 rounded-lg">
                  <p className="font-medium text-blue-900">
                    Total Sales: ₹{calculateTotalSale()}
                  </p>
                </div>
              </div>

              {/* Sales Calculation Display */}
              {formData.currentReading && formData.previousReading && (() => {
                const calculations = calculateSalesProceeds();
                return (
                  <div className="space-y-3 p-4 bg-gray-50 rounded-lg border">
                    <h4 className="font-medium text-gray-800 flex items-center gap-2">
                      <Calculator className="h-4 w-4" />
                      Sales Calculation
                    </h4>
                    
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div className="space-y-1">
                        <p className="text-gray-600">Liters Sold</p>
                        <p className="font-medium">{calculations.liters}L</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-gray-600">Rate per Liter</p>
                        <p className="font-medium">₹{calculations.rate}</p>
                      </div>
                    </div>
                    
                    <div className="space-y-2 border-t pt-3">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Calculated Sales Proceeds:</span>
                        <span className="font-medium text-green-700">₹{calculations.calculated}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Actual Sales Proceeds:</span>
                        <span className="font-medium text-blue-700">₹{calculations.actual}</span>
                      </div>
                      <div className="flex justify-between items-center border-t pt-2">
                        <span className="text-gray-600 font-medium">Shortage/Excess:</span>
                        <span className={`font-medium ${parseFloat(calculations.shortage) >= 0 ? 'text-red-600' : 'text-green-600'}`}>
                          {parseFloat(calculations.shortage) >= 0 ? '-' : '+'}₹{Math.abs(parseFloat(calculations.shortage)).toFixed(2)}
                        </span>
                      </div>
                      {parseFloat(calculations.shortage) > 0 && (
                        <p className="text-xs text-red-600 mt-1">
                          Shortage indicates less cash collected than expected
                        </p>
                      )}
                      {parseFloat(calculations.shortage) < 0 && (
                        <p className="text-xs text-green-600 mt-1">
                          Excess indicates more cash collected than expected
                        </p>
                      )}
                    </div>
                  </div>
                );
              })()}

              {/* Show different buttons based on reading status */}
              {!existingReading ? (
                <Button 
                  onClick={handleSubmit} 
                  className="w-full" 
                  disabled={createReading.isPending}
                  data-testid="submit-reading"
                >
                  {createReading.isPending ? "Recording..." : "Record Reading"}
                </Button>
              ) : (
                <div className="space-y-2">
                  <Button 
                    onClick={handleSubmit} 
                    className="w-full" 
                    disabled={updateReading.isPending || !isEditable}
                    data-testid="edit-reading"
                  >
                    {updateReading.isPending ? "Updating..." : (isEditable ? "Edit Reading" : "Reading Locked")}
                  </Button>
                  {isEditable ? (
                    <p className="text-xs text-green-600 text-center">
                      You can edit this reading until the next shift is recorded.
                    </p>
                  ) : (
                    <p className="text-xs text-amber-600 text-center">
                      This reading cannot be edited as the next shift has data recorded.
                    </p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}