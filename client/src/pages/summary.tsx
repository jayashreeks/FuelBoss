import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, BarChart3, Send, CheckCircle, AlertCircle, DollarSign } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import ShiftDateDisplay from "@/components/ShiftDateDisplay";
import { useShiftContext } from "@/contexts/ShiftContext";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

interface SummaryPageProps {
  onBack?: () => void;
}

interface Reading {
  id: string;
  nozzleId: string;
  attendantId: string;
  shiftType: string;
  shiftDate: string;
  previousReading: string;
  currentReading: string;
  testing: string;
  totalSale: string;
  cashSales: string;
  creditSales: string;
  upiSales: string;
  cardSales: string;
  nozzle: {
    nozzleNumber: number;
    productName: string;
    productId: string;
  };
  attendant: {
    name: string;
  };
}

interface ProductRate {
  rate: number;
  productId: string;
  productName: string;
}

export default function SummaryPage({ onBack }: SummaryPageProps) {
  const { selectedShiftType, selectedDate } = useShiftContext();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch readings for the selected shift and date
  const { data: readings = [], isLoading: readingsLoading } = useQuery<Reading[]>({
    queryKey: ["/api/manager/readings", selectedShiftType, selectedDate],
    enabled: !!selectedShiftType && !!selectedDate,
  });

  // Fetch product rates for calculations
  const { data: rates = [] } = useQuery<ProductRate[]>({
    queryKey: ["/api/shifts/last-rates"],
    enabled: true,
  });

  // Submit shift data mutation
  const submitShiftData = useMutation({
    mutationFn: async () => {
      const response = await fetch("/api/manager/submit-shift", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          shiftType: selectedShiftType,
          shiftDate: selectedDate,
        }),
      });
      if (!response.ok) throw new Error("Failed to submit shift data");
      return response.json();
    },
    onSuccess: () => {
      toast({ title: "Success", description: "Shift data submitted successfully" });
      queryClient.invalidateQueries({ queryKey: ["/api/manager/readings"] });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to submit shift data", variant: "destructive" });
    },
  });

  const handleSubmitShift = async () => {
    setIsSubmitting(true);
    try {
      await submitShiftData.mutateAsync();
    } finally {
      setIsSubmitting(false);
    }
  };

  // Calculate sales data per attendant
  const calculateSalesData = () => {
    const attendantData: Record<string, {
      attendantName: string;
      totalCash: number;
      totalCredit: number;
      totalUpi: number;
      totalCard: number;
      calculatedProceeds: number;
      actualProceeds: number;
      shortage: number;
      readings: Reading[];
    }> = {};

    readings.forEach((reading) => {
      const attendantId = reading.attendantId;
      
      if (!attendantData[attendantId]) {
        attendantData[attendantId] = {
          attendantName: reading.attendant.name,
          totalCash: 0,
          totalCredit: 0,
          totalUpi: 0,
          totalCard: 0,
          calculatedProceeds: 0,
          actualProceeds: 0,
          shortage: 0,
          readings: [],
        };
      }

      const data = attendantData[attendantId];
      data.readings.push(reading);
      
      // Sum up payment methods
      data.totalCash += parseFloat(reading.cashSales || "0");
      data.totalCredit += parseFloat(reading.creditSales || "0");
      data.totalUpi += parseFloat(reading.upiSales || "0");
      data.totalCard += parseFloat(reading.cardSales || "0");
      
      // Calculate actual proceeds (sum of all payment methods)
      data.actualProceeds += parseFloat(reading.totalSale || "0");
      
      // Calculate theoretical proceeds based on rate and fuel sold
      const fuelSold = parseFloat(reading.currentReading) - parseFloat(reading.previousReading) - parseFloat(reading.testing || "0");
      const productRate = rates.find((rate) => rate.productId === reading.nozzle.productId);
      const ratePerLiter = productRate ? productRate.rate : 0;
      data.calculatedProceeds += fuelSold * ratePerLiter;
    });

    // Calculate shortage for each attendant
    Object.values(attendantData).forEach(data => {
      data.shortage = data.calculatedProceeds - data.actualProceeds;
    });

    return Object.values(attendantData);
  };

  const salesData = calculateSalesData();
  const totalCalculatedProceeds = salesData.reduce((sum, data) => sum + data.calculatedProceeds, 0);
  const totalActualProceeds = salesData.reduce((sum, data) => sum + data.actualProceeds, 0);
  const totalShortage = totalCalculatedProceeds - totalActualProceeds;

  if (readingsLoading) {
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
                Shift Summary
              </h1>
            </div>
            {/* Add spacing to prevent overlap with hamburger menu */}
            <div className="w-12"></div>
          </div>
        </div>
        <div className="p-4">
          <div className="text-center py-8">Loading...</div>
        </div>
      </div>
    );
  }

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
              Shift Summary
            </h1>
          </div>
          {/* Add spacing to prevent overlap with hamburger menu */}
          <div className="w-12"></div>
        </div>
      </div>

      <div className="p-4">
        <ShiftDateDisplay
          selectedShiftType={selectedShiftType}
          selectedDate={selectedDate}
        />

        {/* Summary Cards */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <Card className="bg-white">
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <DollarSign className="h-8 w-8 text-green-600" />
                <div>
                  <h3 className="text-sm font-medium text-gray-600">Calculated Proceeds</h3>
                  <p className="text-xl font-semibold text-green-600" data-testid="calculated-proceeds">
                    ₹{totalCalculatedProceeds.toFixed(2)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-white">
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <DollarSign className="h-8 w-8 text-blue-600" />
                <div>
                  <h3 className="text-sm font-medium text-gray-600">Actual Proceeds</h3>
                  <p className="text-xl font-semibold text-blue-600" data-testid="actual-proceeds">
                    ₹{totalActualProceeds.toFixed(2)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Shortage/Excess Display */}
        <Card className="bg-white mb-6">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                {totalShortage > 0 ? (
                  <AlertCircle className="h-8 w-8 text-red-600" />
                ) : (
                  <CheckCircle className="h-8 w-8 text-green-600" />
                )}
                <div>
                  <h3 className="text-sm font-medium text-gray-600">
                    {totalShortage > 0 ? "Shortage" : "Excess"}
                  </h3>
                  <p className={`text-xl font-semibold ${totalShortage > 0 ? "text-red-600" : "text-green-600"}`} data-testid="shortage-excess">
                    ₹{Math.abs(totalShortage).toFixed(2)}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* CA-wise Sales Table */}
        <Card className="bg-white mb-6">
          <CardHeader>
            <CardTitle className="text-lg">CA-wise Sales Summary</CardTitle>
          </CardHeader>
          <CardContent>
            {salesData.length > 0 ? (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>CA Name</TableHead>
                      <TableHead className="text-right">Cash</TableHead>
                      <TableHead className="text-right">Credit</TableHead>
                      <TableHead className="text-right">UPI</TableHead>
                      <TableHead className="text-right">Card</TableHead>
                      <TableHead className="text-right">Calculated</TableHead>
                      <TableHead className="text-right">Actual</TableHead>
                      <TableHead className="text-right">Shortage</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {salesData.map((data, index) => (
                      <TableRow key={index}>
                        <TableCell className="font-medium">{data.attendantName}</TableCell>
                        <TableCell className="text-right">₹{data.totalCash.toFixed(2)}</TableCell>
                        <TableCell className="text-right">₹{data.totalCredit.toFixed(2)}</TableCell>
                        <TableCell className="text-right">₹{data.totalUpi.toFixed(2)}</TableCell>
                        <TableCell className="text-right">₹{data.totalCard.toFixed(2)}</TableCell>
                        <TableCell className="text-right text-green-600 font-medium">₹{data.calculatedProceeds.toFixed(2)}</TableCell>
                        <TableCell className="text-right text-blue-600 font-medium">₹{data.actualProceeds.toFixed(2)}</TableCell>
                        <TableCell className={`text-right font-medium ${data.shortage > 0 ? "text-red-600" : "text-green-600"}`}>
                          ₹{Math.abs(data.shortage).toFixed(2)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="text-center text-gray-500 py-8" data-testid="no-sales-data">
                No readings available for the selected shift and date.
              </div>
            )}
          </CardContent>
        </Card>

        {/* Submit Shift Data Button */}
        {readings && readings.length > 0 && (
          <Card className="bg-white">
            <CardContent className="p-6">
              <div className="text-center space-y-4">
                <div className="flex items-center justify-center space-x-2">
                  <BarChart3 className="h-6 w-6 text-primary" />
                  <h3 className="text-lg font-semibold">Submit Shift Data</h3>
                </div>
                <p className="text-gray-600 text-sm">
                  Once submitted, this shift data will be marked as completed and cannot be edited.
                </p>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      size="lg"
                      disabled={isSubmitting || submitShiftData.isPending}
                      data-testid="submit-shift-button"
                    >
                      <Send className="h-4 w-4 mr-2" />
                      {isSubmitting ? "Submitting..." : "Submit Shift Data"}
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Submit Shift Data</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to submit the shift data for {selectedShiftType} shift on {selectedDate}? 
                        This action will mark the shift as completed and prevent further edits.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={handleSubmitShift}>
                        Submit Shift Data
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}