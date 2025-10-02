import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Phone, LucideIcon } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface ActionCardProps {
  action: {
    type: string;
    priority: string;
    field: string;
    title: string;
    description: string;
    benefit: string;
    icon: LucideIcon;
  };
}

const ActionCard = ({ action }: ActionCardProps) => {
  const [isExecuting, setIsExecuting] = useState(false);

  const handleExecute = () => {
    setIsExecuting(true);
    toast.success("Action initiated! You'll receive SMS instructions shortly.");
    setTimeout(() => setIsExecuting(false), 2000);
  };

  const handleArrange = () => {
    toast.success("Partner notified! They will contact you within 30 minutes.");
  };

  return (
    <Card className="shadow-hover bg-gradient-field text-primary-foreground overflow-hidden">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-lg bg-primary-foreground/20 backdrop-blur">
              <action.icon className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <CardTitle className="text-xl text-primary-foreground">Today's Priority Action</CardTitle>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="secondary" className="bg-primary-foreground/20 text-primary-foreground border-0">
                  {action.priority === "high" ? "High Priority" : "Medium Priority"}
                </Badge>
                <Badge variant="secondary" className="bg-primary-foreground/20 text-primary-foreground border-0">
                  {action.field}
                </Badge>
              </div>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold text-primary-foreground mb-1">{action.title}</h3>
            <p className="text-primary-foreground/90">{action.description}</p>
          </div>
          
          <div className="flex items-center gap-2 p-3 rounded-lg bg-primary-foreground/10 backdrop-blur">
            <CheckCircle className="h-5 w-5 text-primary-foreground" />
            <span className="font-medium">{action.benefit}</span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Button
              variant="secondary"
              size="lg"
              className="bg-primary-foreground text-primary hover:bg-primary-foreground/90"
              onClick={handleExecute}
              disabled={isExecuting}
            >
              <CheckCircle className="h-5 w-5 mr-2" />
              {isExecuting ? "Executing..." : "Execute (Guided)"}
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/20"
              onClick={handleArrange}
            >
              <Phone className="h-5 w-5 mr-2" />
              Arrange for Me
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ActionCard;