import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { ArrowLeft, Plus, GaugeIcon, Edit3, Trash2, Fuel, Calendar } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

interface DispensingUnitsPageProps {
  onBack: () => void;
}

const nozzleSchema = z.object({
  tankId: z.string().min(1, "Tank selection is required"),
  calibrationValidUntil: z.date({
    required_error: "Calibration date is required",
  }),
});

const duSchema = z.object({
  name: z.string().min(1, "DU name is required"),
  numberOfNozzles: z.number().min(1, "At least 1 nozzle is required").max(6, "Maximum 6 nozzles allowed"),
  nozzles: z.array(nozzleSchema),
});

type DUForm = z.infer<typeof duSchema>;

export default function DispensingUnitsPage({ onBack }: DispensingUnitsPageProps) {
  const { t } = useTranslation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingDU, setEditingDU] = useState<any>(null);

  const { data: dispensingUnits = [], isLoading: duLoading } = useQuery({
    queryKey: ["/api/dispensing-units"],
  });

  const { data: tanks = [], isLoading: tanksLoading } = useQuery({
    queryKey: ["/api/tanks"],
  });

  const form = useForm<DUForm>({
    resolver: zodResolver(duSchema),
    defaultValues: {
      name: "",
      numberOfNozzles: 2,
      nozzles: [
        { tankId: "", calibrationValidUntil: new Date() },
        { tankId: "", calibrationValidUntil: new Date() }
      ],
    },
  });

  const numberOfNozzles = form.watch("numberOfNozzles");

  // Update nozzles array when number of nozzles changes
  useEffect(() => {
    const currentNozzles = form.getValues("nozzles");
    const newNozzles = Array.from({ length: numberOfNozzles }, (_, index) => 
      currentNozzles[index] || { tankId: "", calibrationValidUntil: new Date() }
    );
    form.setValue("nozzles", newNozzles);
  }, [numberOfNozzles, form]);

  const createMutation = useMutation({
    mutationFn: async (data: DUForm) => {
      return apiRequest("/api/dispensing-units", "POST", data);
    },
    onSuccess: () => {
      toast({
        title: t("common.success"),
        description: t("dispensingUnits.createSuccess"),
      });
      setIsDialogOpen(false);
      form.reset();
      queryClient.invalidateQueries({ queryKey: ["/api/dispensing-units"] });
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
    mutationFn: async ({ id, data }: { id: string; data: DUForm }) => {
      return apiRequest(`/api/dispensing-units/${id}`, "PATCH", data);
    },
    onSuccess: () => {
      toast({
        title: t("common.success"),
        description: t("dispensingUnits.updateSuccess"),
      });
      setIsDialogOpen(false);
      setEditingDU(null);
      form.reset();
      queryClient.invalidateQueries({ queryKey: ["/api/dispensing-units"] });
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
      return apiRequest(`/api/dispensing-units/${id}`, "DELETE");
    },
    onSuccess: () => {
      toast({
        title: t("common.success"),
        description: t("dispensingUnits.deleteSuccess"),
      });
      queryClient.invalidateQueries({ queryKey: ["/api/dispensing-units"] });
    },
    onError: (error) => {
      toast({
        title: t("common.error"),
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (data: DUForm) => {
    if (editingDU) {
      updateMutation.mutate({ id: editingDU.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleEdit = (du: any) => {
    setEditingDU(du);
    form.reset({
      name: du.name,
      numberOfNozzles: du.numberOfNozzles,
      nozzles: du.nozzles || [],
    });
    setIsDialogOpen(true);
  };

  const handleAddNew = () => {
    setEditingDU(null);
    form.reset();
    setIsDialogOpen(true);
  };

  const getTankName = (tankId: string) => {
    const tank = tanks.find((t: any) => t.id === tankId);
    return tank ? `${tank.tankNumber}` : "Unknown Tank";
  };

  const getFuelTypeColor = () => {
    return "text-blue-600 bg-blue-50";
  };

  if (duLoading || tanksLoading) {
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
            {t("menu.dispensingUnits")}
          </h1>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={handleAddNew} data-testid="add-du-button">
              <Plus className="h-4 w-4 mr-2" />
              {t("dispensingUnits.addDU")}
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingDU ? t("dispensingUnits.editDU") : t("dispensingUnits.addDU")}
              </DialogTitle>
              <DialogDescription>
                {editingDU ? t("dispensingUnits.editDescription") : t("dispensingUnits.addDescription")}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">{t("dispensingUnits.duName")}</Label>
                <Input
                  id="name"
                  {...form.register("name")}
                  placeholder="e.g., DU-01, Pump A"
                  data-testid="input-du-name"
                />
                {form.formState.errors.name && (
                  <p className="text-sm text-red-600">{form.formState.errors.name.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="numberOfNozzles">{t("dispensingUnits.numberOfNozzles")}</Label>
                <Select
                  value={form.watch("numberOfNozzles").toString()}
                  onValueChange={(value) => form.setValue("numberOfNozzles", parseInt(value))}
                >
                  <SelectTrigger data-testid="select-nozzles">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1</SelectItem>
                    <SelectItem value="2">2</SelectItem>
                    <SelectItem value="4">4</SelectItem>
                    <SelectItem value="6">6</SelectItem>
                  </SelectContent>
                </Select>
                {form.formState.errors.numberOfNozzles && (
                  <p className="text-sm text-red-600">{form.formState.errors.numberOfNozzles.message}</p>
                )}
              </div>

              {/* Dynamic Nozzle Configuration */}
              <div className="space-y-4">
                <Label className="text-base font-medium">Nozzle Configuration</Label>
                {Array.from({ length: numberOfNozzles }, (_, index) => (
                  <div key={index} className="border rounded-lg p-4 space-y-3">
                    <h4 className="font-medium">Nozzle #{index + 1}</h4>
                    
                    <div className="space-y-2">
                      <Label>Connected Tank</Label>
                      <Select
                        value={form.watch(`nozzles.${index}.tankId`) || ""}
                        onValueChange={(value) => form.setValue(`nozzles.${index}.tankId`, value)}
                      >
                        <SelectTrigger data-testid={`select-nozzle-${index}-tank`}>
                          <SelectValue placeholder="Select tank" />
                        </SelectTrigger>
                        <SelectContent>
                          {tanks.map((tank: any) => (
                            <SelectItem key={tank.id} value={tank.id}>
                              Tank {tank.tankNumber}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Calibration Valid Until</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className="w-full justify-start text-left font-normal"
                            data-testid={`select-nozzle-${index}-calibration`}
                          >
                            <Calendar className="mr-2 h-4 w-4" />
                            {form.watch(`nozzles.${index}.calibrationValidUntil`) 
                              ? format(form.watch(`nozzles.${index}.calibrationValidUntil`), "PPP")
                              : "Pick a date"
                            }
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <CalendarComponent
                            mode="single"
                            selected={form.watch(`nozzles.${index}.calibrationValidUntil`)}
                            onSelect={(date) => form.setValue(`nozzles.${index}.calibrationValidUntil`, date || new Date())}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex space-x-3 pt-4">
                <Button
                  type="submit"
                  disabled={createMutation.isPending || updateMutation.isPending}
                  className="flex-1"
                  data-testid="save-du-button"
                >
                  {(createMutation.isPending || updateMutation.isPending) ? 
                    t("common.saving") : t("common.save")}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                  className="flex-1"
                  data-testid="cancel-du-button"
                >
                  {t("common.cancel")}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Notice about tank requirement */}
      {tanks.length === 0 && (
        <Card className="mb-4 border-orange-200 bg-orange-50">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2 text-orange-800">
              <Fuel className="h-5 w-5" />
              <p className="text-sm">
                {t("dispensingUnits.noTanksNotice")}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Dispensing Units List */}
      {dispensingUnits.length === 0 ? (
        <Card className="text-center py-8">
          <CardContent>
            <GaugeIcon className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium mb-2">{t("dispensingUnits.noDUs")}</h3>
            <p className="text-gray-600 mb-4">{t("dispensingUnits.noDUsDescription")}</p>
            <Button 
              onClick={handleAddNew} 
              disabled={tanks.length === 0}
              data-testid="add-first-du-button"
            >
              <Plus className="h-4 w-4 mr-2" />
              {t("dispensingUnits.addFirstDU")}
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {dispensingUnits.map((du: any) => (
            <Card key={du.id} data-testid={`du-card-${du.id}`}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <GaugeIcon className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-medium" data-testid={`du-name-${du.id}`}>
                        {du.name}
                      </h3>
                      <div className="flex flex-col space-y-1">
                        <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium w-fit ${getFuelTypeColor()}`}>
                          DU Unit
                        </span>
                        <span className="text-xs text-gray-600">
                          {du.numberOfNozzles} nozzles
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handleEdit(du)}
                      data-testid={`edit-du-${du.id}`}
                    >
                      <Edit3 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => deleteMutation.mutate(du.id)}
                      disabled={deleteMutation.isPending}
                      data-testid={`delete-du-${du.id}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* Nozzle indicators */}
                <div className="flex flex-wrap gap-2">
                  {Array.from({ length: du.nozzles }, (_, i) => (
                    <div
                      key={i}
                      className="flex items-center space-x-1 bg-gray-100 px-2 py-1 rounded text-xs"
                    >
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span>Nozzle {i + 1}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}