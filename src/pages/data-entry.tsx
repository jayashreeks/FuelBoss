import { Clock, Gauge, Package, Warehouse } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface DataEntryProps {
  onNavigate?: (page: string) => void;
}

export default function DataEntry({ onNavigate }: DataEntryProps) {
  const dataEntryCards = [
    {
      id: "shift",
      title: "Shift Management",
      description: "Manage shift rates and density measurements",
      icon: Clock,
      color: "bg-blue-50 border-blue-200 hover:bg-blue-100",
      iconColor: "text-blue-600",
    },
    {
      id: "readings",
      title: "Tank Readings",
      description: "Record tank level measurements and readings",
      icon: Gauge,
      color: "bg-green-50 border-green-200 hover:bg-green-100",
      iconColor: "text-green-600",
    },
    {
      id: "stock",
      title: "Stock Management",
      description: "Track fuel stock levels and deliveries",
      icon: Package,
      color: "bg-orange-50 border-orange-200 hover:bg-orange-100",
      iconColor: "text-orange-600",
    },
    {
      id: "inventory",
      title: "Inventory Reports",
      description: "View inventory levels and analytics",
      icon: Warehouse,
      color: "bg-purple-50 border-purple-200 hover:bg-purple-100",
      iconColor: "text-purple-600",
    },
  ];

  const handleCardClick = (cardId: string) => {
    if (onNavigate) {
      onNavigate(cardId);
    }
  };

  return (
    <div className="p-4 space-y-6">
      <h1 className="text-2xl font-bold" data-testid="data-entry-title">
        Data Entry
      </h1>
      
      <p className="text-gray-600 mb-6">
        Select a category to enter or manage operational data
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {dataEntryCards.map((card) => {
          const Icon = card.icon;
          return (
            <Card
              key={card.id}
              className={`cursor-pointer transition-all duration-200 ${card.color}`}
              onClick={() => handleCardClick(card.id)}
              data-testid={`data-entry-card-${card.id}`}
            >
              <CardHeader className="pb-4">
                <div className="flex items-center space-x-3">
                  <Icon className={`h-8 w-8 ${card.iconColor}`} />
                  <div>
                    <CardTitle className="text-lg">{card.title}</CardTitle>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">{card.description}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}