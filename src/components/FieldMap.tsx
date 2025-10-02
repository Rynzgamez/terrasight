import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MapPin, Satellite, Activity, Droplets, Power, Clock, AlertTriangle } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

interface Field {
  id: string;
  name: string;
  crop: string;
  area: string;
  health: string;
  waterLevel: number; // percentage 0-100
  sprinklerActive: boolean;
}

interface FieldMapProps {
  fields: Field[];
  selectedField: string;
  onFieldSelect: (fieldId: string) => void;
}

const FieldMap = ({ fields, selectedField, onFieldSelect }: FieldMapProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [sprinklerStates, setSprinklerStates] = useState<{ [key: string]: boolean }>({
    "field-1": false,
    "field-2": false,
    "field-3": false,
  });
  const [automationMode, setAutomationMode] = useState<string>("off");
  
  // Simulated IoT sensor data
  const [waterLevels] = useState<{ [key: string]: number }>({
    "field-1": 28,
    "field-2": 45,
    "field-3": 15,
  });

  const handleSprinklerToggle = (fieldId: string) => {
    setSprinklerStates(prev => {
      const newState = { ...prev, [fieldId]: !prev[fieldId] };
      toast.success(
        newState[fieldId] 
          ? `Sprinklers activated for ${fields.find(f => f.id === fieldId)?.name}`
          : `Sprinklers deactivated for ${fields.find(f => f.id === fieldId)?.name}`
      );
      return newState;
    });
  };

  const handleAutomationChange = (value: string) => {
    setAutomationMode(value);
    if (value !== "off") {
      toast.success(`Automated sprinklers set to: ${value === "2hours" ? "Every 2-3 hours" : "Daily at 6 AM & 6 PM"}`);
    } else {
      toast.info("Automated sprinklers disabled");
    }
  };

  const getWaterStatus = (level: number) => {
    if (level < 30) return { status: "Critical", color: "text-destructive" };
    if (level < 50) return { status: "Low", color: "text-warning" };
    return { status: "Optimal", color: "text-success" };
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Set canvas size
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    // Draw satellite-like background
    const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    gradient.addColorStop(0, "#8B7355");
    gradient.addColorStop(0.5, "#A0826D");
    gradient.addColorStop(1, "#967961");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw field boundaries
    const fieldPositions = [
      { x: 50, y: 50, width: 180, height: 140 },
      { x: 250, y: 100, width: 200, height: 160 },
      { x: 100, y: 220, width: 150, height: 120 },
    ];

    fields.forEach((field, index) => {
      const pos = fieldPositions[index];
      
      // Draw field
      ctx.strokeStyle = field.id === selectedField ? "#22c55e" : "#94a3b8";
      ctx.lineWidth = field.id === selectedField ? 3 : 2;
      ctx.fillStyle = field.health === "good" ? "rgba(34, 197, 94, 0.1)" : "rgba(251, 146, 60, 0.1)";
      
      ctx.beginPath();
      ctx.rect(pos.x, pos.y, pos.width, pos.height);
      ctx.fill();
      ctx.stroke();

      // Draw field label
      ctx.fillStyle = "#1e293b";
      ctx.font = "14px sans-serif";
      ctx.fillText(field.name, pos.x + 10, pos.y + 25);
      ctx.font = "12px sans-serif";
      ctx.fillStyle = "#64748b";
      ctx.fillText(field.crop, pos.x + 10, pos.y + 45);
    });

    // Draw NDVI overlay simulation
    ctx.globalAlpha = 0.3;
    for (let i = 0; i < 20; i++) {
      const x = Math.random() * canvas.width;
      const y = Math.random() * canvas.height;
      const radius = Math.random() * 30 + 10;
      const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
      gradient.addColorStop(0, "rgba(34, 197, 94, 0.5)");
      gradient.addColorStop(1, "rgba(34, 197, 94, 0)");
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  }, [fields, selectedField]);

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const fieldPositions = [
      { id: "field-1", x: 50, y: 50, width: 180, height: 140 },
      { id: "field-2", x: 250, y: 100, width: 200, height: 160 },
      { id: "field-3", x: 100, y: 220, width: 150, height: 120 },
    ];
    
    fieldPositions.forEach((pos) => {
      if (x >= pos.x && x <= pos.x + pos.width && y >= pos.y && y <= pos.y + pos.height) {
        onFieldSelect(pos.id);
      }
    });
  };

  return (
    <Card className="shadow-card overflow-hidden">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Satellite className="h-5 w-5" />
            Field Overview
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="flex items-center gap-1">
              <Activity className="h-3 w-3" />
              Live NDVI
            </Badge>
            <Badge variant="outline" className="flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              8.3 acres total
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="relative">
          <canvas
            ref={canvasRef}
            className="w-full h-[400px] rounded-lg cursor-pointer"
            onClick={handleCanvasClick}
          />
          <div className="absolute bottom-4 left-4 bg-card/90 backdrop-blur p-3 rounded-lg">
            <p className="text-xs text-muted-foreground mb-2">Field Health Index</p>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded-full bg-success" />
                <span className="text-xs">Healthy</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded-full bg-warning" />
                <span className="text-xs">Monitor</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded-full bg-destructive" />
                <span className="text-xs">Alert</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* IoT Water Management Controls */}
        <div className="mt-6 space-y-4">
          <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
            <div className="flex items-center gap-3">
              <Droplets className="h-5 w-5 text-info" />
              <div>
                <h3 className="font-semibold">Smart Irrigation Control</h3>
                <p className="text-sm text-muted-foreground">IoT-based water management system</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Label htmlFor="automation-mode" className="text-sm">Automation:</Label>
              <Select value={automationMode} onValueChange={handleAutomationChange}>
                <SelectTrigger id="automation-mode" className="w-[180px]">
                  <SelectValue placeholder="Select mode" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="off">Manual Control</SelectItem>
                  <SelectItem value="2hours">Every 2-3 Hours</SelectItem>
                  <SelectItem value="daily">Daily (6AM & 6PM)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Field-specific controls */}
          <div className="grid gap-3">
            {fields.map((field) => {
              const waterLevel = waterLevels[field.id] || 0;
              const waterStatus = getWaterStatus(waterLevel);
              const isSprinklerActive = sprinklerStates[field.id] || false;
              
              return (
                <div key={field.id} className="p-4 border rounded-lg bg-card">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h4 className="font-medium">{field.name}</h4>
                        {waterLevel < 30 && (
                          <Badge variant="destructive" className="flex items-center gap-1">
                            <AlertTriangle className="h-3 w-3" />
                            Low Water
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-4 text-sm">
                        <div className="flex items-center gap-2">
                          <Droplets className="h-4 w-4 text-info" />
                          <span>Water Level:</span>
                          <span className={`font-semibold ${waterStatus.color}`}>
                            {waterLevel}% - {waterStatus.status}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <span className="text-muted-foreground">
                            Last updated: 5 mins ago
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2">
                        <Label htmlFor={`sprinkler-${field.id}`} className="text-sm">
                          Sprinkler
                        </Label>
                        <Switch
                          id={`sprinkler-${field.id}`}
                          checked={isSprinklerActive}
                          onCheckedChange={() => handleSprinklerToggle(field.id)}
                          className={isSprinklerActive ? "data-[state=checked]:bg-success" : ""}
                        />
                      </div>
                      {isSprinklerActive && (
                        <Badge className="bg-success/10 text-success border-success/20">
                          <Power className="h-3 w-3 mr-1" />
                          Active
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {automationMode !== "off" && (
            <div className="p-3 bg-info/10 border border-info/20 rounded-lg">
              <div className="flex items-center gap-2 text-sm text-info">
                <Clock className="h-4 w-4" />
                <span>
                  Automated irrigation is {automationMode === "2hours" ? "running every 2-3 hours" : "scheduled for 6 AM and 6 PM"}
                </span>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default FieldMap;