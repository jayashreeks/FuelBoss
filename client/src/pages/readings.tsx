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
import { useState } from "react";

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
  calibrationValidUntil: string;
}

interface Reading {
  id: string;
  nozzleId: string;
  attendantId: string;
  previousReading: string;
  currentReading: string;
  testing: string;
  totalSale: string;
  cashSales: string;
  creditSales: string;
  upiSales: string;
  cardSales: string;
  shiftType: string;
  shiftDate: string;
}

export default function ReadingsPage({ onBack }: ReadingsPageProps) {
  const { selectedShiftType, selectedDate } = useShiftContext();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [selectedAttendantId, setSelectedAttendantId] = useState<string>("");
  const [selectedNozzleId, setSelectedNozzleId] = useState<string>("");
  const [formData, setFormData] = useState({
    previousReading: "",
    currentReading: "",
    testing: "0",
    cashSales: "0",
    creditSales: "0",
    upiSales: "0",
    cardSales: "0"
  });

  // Fetch attendants
  const { data: attendants = [], isLoading: loadingAttendants } = useQuery({
    queryKey: ["/api/manager/attendants"],
    retry: false,
  });

  // Fetch nozzles
  const { data: nozzles = [], isLoading: loadingNozzles } = useQuery({
    queryKey: ["/api/manager/nozzles"],
    retry: false,
  });

  // Fetch readings for current shift and date
  const { data: readings = [], isLoading: loadingReadings } = useQuery({
    queryKey: ["/api/manager/readings", selectedShiftType, selectedDate],
    retry: false,
  });

  // Fetch last reading for selected nozzle
  const { data: lastReading } = useQuery({
    queryKey: ["/api/manager/nozzles", selectedNozzleId, "last-reading"],
    enabled: !!selectedNozzleId,
    retry: false,
  });

  // Create reading mutation
  const createReading = useMutation({
    mutationFn: async (readingData: any) => {
      return await apiRequest("/api/manager/readings", {
        method: "POST",
        body: JSON.stringify(readingData),
      });
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Reading recorded successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/manager/readings"] });
      // Reset form
      setSelectedNozzleId("");
      setFormData({
        previousReading: "",
        currentReading: "",
        testing: "0",
        cashSales: "0",
        creditSales: "0",
        upiSales: "0",
        cardSales: "0"
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to record reading",
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
    // Auto-populate previous reading if available
    if (lastReading) {
      setFormData(prev => ({
        ...prev,
        previousReading: lastReading.currentReading || "0"
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        previousReading: "0"
      }));
    }
  };

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

  const handleSubmit = () => {
    if (!selectedAttendantId || !selectedNozzleId || !formData.currentReading) {
      toast({
        title: "Error",
        description: "Please fill all required fields",
        variant: "destructive",
      });
      return;
    }

    const totalSale = calculateTotalSale();
    
    createReading.mutate({
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
    });
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
                  {nozzles.map((nozzle: Nozzle) => (
                    <SelectItem key={nozzle.id} value={nozzle.id}>
                      Nozzle {nozzle.nozzleNumber} - {nozzle.dispensingUnitName} - {nozzle.productName} (Tank {nozzle.tankNumber})
                    </SelectItem>
                  ))}
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
                Record Reading
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {selectedNozzle && (
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="font-medium">Nozzle {selectedNozzle.nozzleNumber}</p>
                  <p className="text-sm text-gray-600">{selectedNozzle.dispensingUnitName} - {selectedNozzle.productName}</p>
                  <p className="text-sm text-gray-600">Tank {selectedNozzle.tankNumber}</p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="previous-reading">Previous Reading</Label>
                  <Input
                    id="previous-reading"
                    type="number"
                    step="0.01"
                    value={formData.previousReading}
                    onChange={(e) => handleInputChange("previousReading", e.target.value)}
                    data-testid="input-previous-reading"
                    readOnly
                    className="bg-gray-100"
                  />
                </div>
                
                <div>
                  <Label htmlFor="current-reading">Current Reading *</Label>
                  <Input
                    id="current-reading"
                    type="number"
                    step="0.01"
                    value={formData.currentReading}
                    onChange={(e) => handleInputChange("currentReading", e.target.value)}
                    data-testid="input-current-reading"
                    placeholder="Enter current reading"
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

              <Button 
                onClick={handleSubmit} 
                className="w-full" 
                disabled={createReading.isPending}
                data-testid="submit-reading"
              >
                {createReading.isPending ? "Recording..." : "Record Reading"}
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Current Readings */}
        <Card>
          <CardHeader>
            <CardTitle>
              {selectedDate === new Date().toISOString().split('T')[0] ? "Today's" : "Selected Date"} Readings
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loadingReadings ? (
              <div className="text-center py-4">Loading readings...</div>
            ) : readings.length > 0 ? (
              <div className="space-y-3">
                {readings.map((reading: any) => (
                  <div key={reading.id} className="p-3 border rounded-lg">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium">Nozzle {reading.nozzle?.nozzleNumber}</p>
                        <p className="text-sm text-gray-600">{reading.attendant?.name}</p>
                        <p className="text-sm text-gray-600">{reading.nozzle?.productName}</p>
                      </div>
                      <Badge variant="secondary">₹{reading.totalSale}</Badge>
                    </div>
                    <div className="mt-2 text-sm text-gray-600 grid grid-cols-2 gap-2">
                      <span>Reading: {reading.previousReading} → {reading.currentReading}</span>
                      <span>Sale: {(parseFloat(reading.currentReading) - parseFloat(reading.previousReading) - parseFloat(reading.testing)).toFixed(2)}L</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center text-gray-500 py-8" data-testid="no-readings">
                No readings recorded for {selectedShiftType} shift on {selectedDate}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}