import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { 
  Droplets, 
  AlertTriangle, 
  TrendingUp, 
  MapPin, 
  ThermometerSun,
  Cloud,
  Activity,
  Sprout,
  DollarSign,
  Calendar,
  CheckCircle,
  Phone
} from "lucide-react";
import ActionCard from "./ActionCard";
import FieldMap from "./FieldMap";
import SensorData from "./SensorData";
import MarketPrices from "./MarketPrices";
import WeatherWidget from "./WeatherWidget";

const Dashboard = () => {
  const [selectedField, setSelectedField] = useState("field-1");
  
  const fields = [
    { 
      id: "field-1", 
      name: "North Field", 
      crop: "Wheat", 
      area: "2.5 acres", 
      health: "good",
      waterLevel: 28,
      sprinklerActive: false
    },
    { 
      id: "field-2", 
      name: "South Field", 
      crop: "Rice", 
      area: "3.2 acres", 
      health: "warning",
      waterLevel: 45,
      sprinklerActive: false
    },
    { 
      id: "field-3", 
      name: "East Field", 
      crop: "Maize", 
      area: "1.8 acres", 
      health: "good",
      waterLevel: 15,
      sprinklerActive: false
    },
  ];

  const todayAction = {
    type: "irrigation",
    priority: "high",
    field: "North Field",
    title: "Irrigate North Field - 20 mins",
    description: "Soil moisture at 25%. Optimal irrigation window today.",
    benefit: "Save 150L water vs. tomorrow",
    icon: Droplets,
  };

  return (
    <div className="min-h-screen bg-gradient-sky">
      {/* Header */}
      <header className="bg-card border-b border-border shadow-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Sprout className="h-8 w-8 text-primary" />
              <div>
                <h1 className="text-2xl font-bold text-foreground">AgriSense</h1>
                <p className="text-sm text-muted-foreground">Smart Farm Management</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Badge variant="outline" className="flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                Rampur Village
              </Badge>
              <Button variant="ghost" size="icon">
                <Phone className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6 space-y-6">
        {/* Today's Action Card */}
        <ActionCard action={todayAction} />

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="shadow-card hover:shadow-hover transition-all">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Water Saved</p>
                  <p className="text-2xl font-bold text-primary">2,500L</p>
                  <p className="text-xs text-muted-foreground">This week</p>
                </div>
                <Droplets className="h-8 w-8 text-info" />
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-card hover:shadow-hover transition-all">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Yield Forecast</p>
                  <p className="text-2xl font-bold text-success">+12%</p>
                  <p className="text-xs text-muted-foreground">vs. last season</p>
                </div>
                <TrendingUp className="h-8 w-8 text-success" />
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-card hover:shadow-hover transition-all">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Pest Risk</p>
                  <p className="text-2xl font-bold text-warning">Medium</p>
                  <p className="text-xs text-muted-foreground">Next 48h</p>
                </div>
                <AlertTriangle className="h-8 w-8 text-warning" />
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-card hover:shadow-hover transition-all">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Market Price</p>
                  <p className="text-2xl font-bold text-foreground">₹2,450</p>
                  <p className="text-xs text-success">+5% today</p>
                </div>
                <DollarSign className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Dashboard Tabs */}
        <Tabs defaultValue="fields" className="space-y-4">
          <TabsList className="grid w-full grid-cols-4 bg-card">
            <TabsTrigger value="fields">Fields</TabsTrigger>
            <TabsTrigger value="sensors">Sensors</TabsTrigger>
            <TabsTrigger value="market">Market</TabsTrigger>
            <TabsTrigger value="schedule">Schedule</TabsTrigger>
          </TabsList>

          <TabsContent value="fields" className="space-y-4">
            <div className="grid lg:grid-cols-3 gap-4">
              <div className="lg:col-span-2">
                <FieldMap fields={fields} selectedField={selectedField} onFieldSelect={setSelectedField} />
              </div>
              <div className="space-y-4">
                <WeatherWidget />
                <Card className="shadow-card">
                  <CardHeader>
                    <CardTitle className="text-lg">Field Health</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {fields.map((field) => (
                      <div
                        key={field.id}
                        className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${
                          selectedField === field.id
                            ? "border-primary bg-primary/5"
                            : "border-border hover:border-primary/50"
                        }`}
                        onClick={() => setSelectedField(field.id)}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">{field.name}</p>
                            <p className="text-sm text-muted-foreground">{field.crop} • {field.area}</p>
                          </div>
                          <Badge
                            variant={field.health === "good" ? "default" : "secondary"}
                            className={field.health === "warning" ? "bg-warning text-primary-foreground" : ""}
                          >
                            {field.health === "good" ? <CheckCircle className="h-3 w-3 mr-1" /> : <AlertTriangle className="h-3 w-3 mr-1" />}
                            {field.health}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="sensors">
            <SensorData />
          </TabsContent>

          <TabsContent value="market">
            <MarketPrices />
          </TabsContent>

          <TabsContent value="schedule">
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Upcoming Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="p-4 rounded-lg bg-muted/50 border border-border">
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <Droplets className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">Tomorrow - Irrigate South Field</p>
                      <p className="text-sm text-muted-foreground">15 minutes recommended</p>
                    </div>
                  </div>
                </div>
                <div className="p-4 rounded-lg bg-muted/50 border border-border">
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-warning/10">
                      <AlertTriangle className="h-5 w-5 text-warning" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">In 2 days - Apply Fungicide</p>
                      <p className="text-sm text-muted-foreground">Preventive measure for East Field</p>
                    </div>
                  </div>
                </div>
                <div className="p-4 rounded-lg bg-muted/50 border border-border">
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-success/10">
                      <TrendingUp className="h-5 w-5 text-success" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">Next week - Harvest Window</p>
                      <p className="text-sm text-muted-foreground">Optimal conditions for North Field wheat</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Dashboard;