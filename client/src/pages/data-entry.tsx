import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useTranslation } from "react-i18next";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import type { Staff } from "@shared/schema";

const shiftDataSchema = z.object({
  staffId: z.string().min(1, "Manager is required"),
  shiftType: z.string().min(1, "Shift is required"),
  shiftDate: z.string().min(1, "Date is required"),
  startTime: z.string().min(1, "Start time is required"),
  endTime: z.string().min(1, "End time is required"),
  cashSales: z.string().min(0).transform(Number),
  creditSales: z.string().min(0).transform(Number),
  upiSales: z.string().min(0).transform(Number),
  cardSales: z.string().min(0).transform(Number),
  notes: z.string().optional(),
});

type ShiftDataForm = z.infer<typeof shiftDataSchema>;

export default function DataEntry() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: staff = [], isLoading: staffLoading } = useQuery<Staff[]>({
    queryKey: ["/api/staff"],
  });

  const form = useForm<ShiftDataForm>({
    resolver: zodResolver(shiftDataSchema),
    defaultValues: {
      staffId: "",
      shiftType: "",
      shiftDate: new Date().toISOString().split('T')[0],
      startTime: "",
      endTime: "",
      cashSales: "0",
      creditSales: "0",
      upiSales: "0",
      cardSales: "0",
      notes: "",
    },
  });

  const mutation = useMutation({
    mutationFn: async (data: ShiftDataForm) => {
      const shiftDateTime = new Date(data.shiftDate);
      const [startHour, startMinute] = data.startTime.split(':');
      const [endHour, endMinute] = data.endTime.split(':');
      
      const startTime = new Date(shiftDateTime);
      startTime.setHours(parseInt(startHour), parseInt(startMinute));
      
      const endTime = new Date(shiftDateTime);
      endTime.setHours(parseInt(endHour), parseInt(endMinute));
      
      // If end time is before start time, assume it's next day
      if (endTime < startTime) {
        endTime.setDate(endTime.getDate() + 1);
      }

      const payload = {
        staffId: data.staffId,
        shiftDate: shiftDateTime.toISOString(),
        shiftType: data.shiftType,
        startTime: startTime.toISOString(),
        endTime: endTime.toISOString(),
        cashSales: data.cashSales.toString(),
        creditSales: data.creditSales.toString(),
        upiSales: data.upiSales.toString(),
        cardSales: data.cardSales.toString(),
        notes: data.notes,
      };

      await apiRequest("POST", "/api/shift-sales", payload);
    },
    onSuccess: () => {
      toast({
        title: t("common.success"),
        description: "Shift data submitted successfully",
      });
      form.reset();
      queryClient.invalidateQueries({ queryKey: ["/api/shift-sales"] });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: t("common.error"),
        description: "Failed to submit shift data",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: ShiftDataForm) => {
    mutation.mutate(data);
  };

  const shiftOptions = [
    { value: "morning", label: "6:00 AM - 2:00 PM", startTime: "06:00", endTime: "14:00" },
    { value: "afternoon", label: "2:00 PM - 10:00 PM", startTime: "14:00", endTime: "22:00" },
    { value: "night", label: "10:00 PM - 6:00 AM", startTime: "22:00", endTime: "06:00" },
  ];

  const handleShiftChange = (shiftType: string) => {
    const shift = shiftOptions.find(s => s.value === shiftType);
    if (shift) {
      form.setValue("startTime", shift.startTime);
      form.setValue("endTime", shift.endTime);
    }
  };

  return (
    <div className="p-4 pb-20">
      <Card className="shadow-sm border border-gray-200">
        <CardHeader>
          <CardTitle className="text-lg font-medium" data-testid="data-entry-title">
            {t("dataEntry.title")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="shiftDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} data-testid="input-shift-date" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="shiftType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("dataEntry.selectShift")}</FormLabel>
                    <Select
                      onValueChange={(value) => {
                        field.onChange(value);
                        handleShiftChange(value);
                      }}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger data-testid="select-shift-type">
                          <SelectValue placeholder="Select shift" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {shiftOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-3">
                <FormField
                  control={form.control}
                  name="startTime"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Start Time</FormLabel>
                      <FormControl>
                        <Input type="time" {...field} data-testid="input-start-time" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="endTime"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>End Time</FormLabel>
                      <FormControl>
                        <Input type="time" {...field} data-testid="input-end-time" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="staffId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("dataEntry.manager")}</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-manager">
                          <SelectValue placeholder="Select manager" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {staff.map((member) => (
                          <SelectItem key={member.id} value={member.id}>
                            {member.name} ({member.role})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-3">
                <FormField
                  control={form.control}
                  name="cashSales"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("dataEntry.cashSales")}</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          placeholder="0" 
                          min="0" 
                          step="0.01"
                          {...field}
                          data-testid="input-cash-sales"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="creditSales"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("dataEntry.creditSales")}</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          placeholder="0" 
                          min="0" 
                          step="0.01"
                          {...field}
                          data-testid="input-credit-sales"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <FormField
                  control={form.control}
                  name="upiSales"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("dataEntry.upiSales")}</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          placeholder="0" 
                          min="0" 
                          step="0.01"
                          {...field}
                          data-testid="input-upi-sales"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="cardSales"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("dataEntry.cardSales")}</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          placeholder="0" 
                          min="0" 
                          step="0.01"
                          {...field}
                          data-testid="input-card-sales"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <Button 
                type="submit" 
                className="w-full bg-primary text-white py-3 hover:bg-primary/90"
                disabled={mutation.isPending}
                data-testid="button-submit-data"
              >
                {mutation.isPending ? t("common.loading") : t("dataEntry.submit")}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
