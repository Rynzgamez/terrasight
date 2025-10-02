import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Activity, Droplets, ThermometerSun, Wind, Gauge } from "lucide-react";
import { Progress } from "@/components/ui/progress";

const SensorData = () => {
  const sensors = [
    {
      id: 1,
      field: "North Field",
      moisture: 25,
      temperature: 28,
      humidity: 65,
      ph: 6.8,
      nitrogen: 45,
      status: "active",
      lastUpdate: "2 mins ago",
    },
    {
      id: 2,
      field: "South Field",
      moisture: 42,
      temperature: 29,
      humidity: 70,
      ph: 7.1,
      nitrogen: 38,
      status: "active",
      lastUpdate: "5 mins ago",
    },
    {
      id: 3,
      field: "East Field",
      moisture: 38,
      temperature: 27,
      humidity: 68,
      ph: 6.5,
      nitrogen: 52,
      status: "active",
      lastUpdate: "1 min ago",
    },
  ];

  const getMoistureColor = (value: number) => {
    if (value < 30) return "text-warning";
    if (value > 60) return "text-info";
    return "text-success";
  };

  const getMoistureStatus = (value: number) => {
    if (value < 30) return "Low - Irrigate Soon";
    if (value > 60) return "High - Skip Irrigation";
    return "Optimal";
  };

  return (
    <div className="grid gap-4">
      {sensors.map((sensor) => (
        <Card key={sensor.id} className="shadow-card hover:shadow-hover transition-all">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">{sensor.field} Sensor</CardTitle>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="flex items-center gap-1">
                  <Activity className="h-3 w-3 text-success" />
                  {sensor.status}
                </Badge>
                <span className="text-xs text-muted-foreground">{sensor.lastUpdate}</span>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-4">
              {/* Soil Moisture */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Droplets className="h-4 w-4 text-info" />
                  <span className="text-sm font-medium">Soil Moisture</span>
                </div>
                <div className="space-y-1">
                  <div className="flex items-baseline gap-1">
                    <span className={`text-2xl font-bold ${getMoistureColor(sensor.moisture)}`}>
                      {sensor.moisture}%
                    </span>
                  </div>
                  <Progress value={sensor.moisture} className="h-2" />
                  <p className="text-xs text-muted-foreground">{getMoistureStatus(sensor.moisture)}</p>
                </div>
              </div>

              {/* Temperature */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <ThermometerSun className="h-4 w-4 text-warning" />
                  <span className="text-sm font-medium">Temperature</span>
                </div>
                <div className="space-y-1">
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-bold">{sensor.temperature}°C</span>
                  </div>
                  <Progress value={(sensor.temperature / 40) * 100} className="h-2" />
                  <p className="text-xs text-muted-foreground">Moderate</p>
                </div>
              </div>

              {/* Humidity */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Wind className="h-4 w-4 text-info" />
                  <span className="text-sm font-medium">Humidity</span>
                </div>
                <div className="space-y-1">
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-bold">{sensor.humidity}%</span>
                  </div>
                  <Progress value={sensor.humidity} className="h-2" />
                  <p className="text-xs text-muted-foreground">Good</p>
                </div>
              </div>

              {/* pH Level */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Gauge className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium">pH Level</span>
                </div>
                <div className="space-y-1">
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-bold">{sensor.ph}</span>
                  </div>
                  <Progress value={(sensor.ph / 14) * 100} className="h-2" />
                  <p className="text-xs text-muted-foreground">Neutral</p>
                </div>
              </div>

              {/* Nitrogen */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Activity className="h-4 w-4 text-success" />
                  <span className="text-sm font-medium">Nitrogen</span>
                </div>
                <div className="space-y-1">
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-bold">{sensor.nitrogen}</span>
                    <span className="text-sm text-muted-foreground">mg/kg</span>
                  </div>
                  <Progress value={(sensor.nitrogen / 100) * 100} className="h-2" />
                  <p className="text-xs text-muted-foreground">Adequate</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default SensorData;