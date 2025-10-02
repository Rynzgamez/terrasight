import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Satellite, Activity } from "lucide-react";
import { useEffect, useRef } from "react";

interface Field {
  id: string;
  name: string;
  crop: string;
  area: string;
  health: string;
}

interface FieldMapProps {
  fields: Field[];
  selectedField: string;
  onFieldSelect: (fieldId: string) => void;
}

const FieldMap = ({ fields, selectedField, onFieldSelect }: FieldMapProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

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
      </CardContent>
    </Card>
  );
};

export default FieldMap;