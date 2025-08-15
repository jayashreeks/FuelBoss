import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useTranslation } from "react-i18next";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import { Fuel } from "lucide-react";

const setupSchema = z.object({
  name: z.string().min(1, "RO Name is required"),
  sapcode: z.string().optional(),
  oilCompany: z.string().optional(),
  address: z.string().optional(),
  phoneNumber: z.string().optional(),
});

type SetupForm = z.infer<typeof setupSchema>;

interface SetupProps {
  onComplete: () => void;
}

export default function Setup({ onComplete }: SetupProps) {
  const { t } = useTranslation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<SetupForm>({
    resolver: zodResolver(setupSchema),
    defaultValues: {
      name: "",
      sapcode: "",
      oilCompany: "",
      address: "",
      phoneNumber: "",
    },
  });

  const mutation = useMutation({
    mutationFn: async (data: SetupForm) => {
      await apiRequest("/api/retail-outlet", "POST", data);
    },
    onSuccess: () => {
      toast({
        title: t("common.success"),
        description: "Retail outlet setup completed successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/retail-outlet"] });
      onComplete();
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
        description: "Failed to setup retail outlet",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: SetupForm) => {
    mutation.mutate(data);
  };

  const oilCompanies = [
    "Indian Oil Corporation",
    "Bharat Petroleum",
    "Hindustan Petroleum",
    "Shell",
    "BP",
    "Total",
    "Reliance Petroleum",
    "Essar Oil",
    "Other",
  ];

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center p-4">
      <Card className="w-full max-w-md mx-auto shadow-lg">
        <CardHeader className="text-center pb-6">
          <div className="flex justify-center mb-4">
            <div className="bg-primary/10 p-3 rounded-full">
              <Fuel className="h-8 w-8 text-primary" />
            </div>
          </div>
          <CardTitle className="text-xl font-bold" data-testid="setup-title">
            {t("setup.welcome")}
          </CardTitle>
          <p className="text-gray-600 text-sm" data-testid="setup-subtitle">
            {t("setup.setupRO")}
          </p>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("setup.roName")}</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter RO name" {...field} data-testid="input-ro-name" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="sapcode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("setup.sapcode")}</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter SAP code" {...field} data-testid="input-sapcode" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="oilCompany"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("setup.oilCompany")}</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-oil-company">
                          <SelectValue placeholder="Select oil company" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {oilCompanies.map((company) => (
                          <SelectItem key={company} value={company}>
                            {company}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("setup.address")}</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Enter full address" 
                        className="resize-none"
                        {...field}
                        data-testid="input-address"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="phoneNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("setup.phoneNumber")}</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter phone number" {...field} data-testid="input-phone" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button 
                type="submit" 
                className="w-full bg-primary text-white py-3 hover:bg-primary/90"
                disabled={mutation.isPending}
                data-testid="button-complete-setup"
              >
                {mutation.isPending ? t("common.loading") : t("setup.complete")}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
