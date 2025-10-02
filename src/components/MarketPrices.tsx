import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, DollarSign, ShoppingCart, AlertCircle } from "lucide-react";
import { toast } from "sonner";

const MarketPrices = () => {
  const crops = [
    {
      name: "Wheat",
      currentPrice: 2450,
      previousPrice: 2330,
      change: 5.15,
      unit: "per quintal",
      marketName: "Rampur Mandi",
      distance: "12 km",
      bestTime: "Sell in 2 days",
      volume: "High demand",
    },
    {
      name: "Rice",
      currentPrice: 3200,
      previousPrice: 3250,
      change: -1.54,
      unit: "per quintal",
      marketName: "District Market",
      distance: "25 km",
      bestTime: "Hold",
      volume: "Moderate",
    },
    {
      name: "Maize",
      currentPrice: 1850,
      previousPrice: 1780,
      change: 3.93,
      unit: "per quintal",
      marketName: "Local Buyer",
      distance: "5 km",
      bestTime: "Sell now",
      volume: "High demand",
    },
  ];

  const handleSellNow = (crop: string) => {
    toast.success(`Sell order placed for ${crop}. Buyer will contact you within 2 hours.`);
  };

  const handlePriceAlert = (crop: string) => {
    toast.success(`Price alert set for ${crop}. You'll receive SMS when target price is reached.`);
  };

  return (
    <div className="space-y-4">
      <Card className="shadow-card bg-gradient-earth text-primary-foreground">
        <CardHeader className="pb-3">
          <CardTitle className="text-xl text-primary-foreground">Market Intelligence</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="bg-primary-foreground/10 backdrop-blur rounded-lg p-3">
              <p className="text-sm text-primary-foreground/80">Best Price Today</p>
              <p className="text-2xl font-bold text-primary-foreground">Rice - ₹3,200</p>
            </div>
            <div className="bg-primary-foreground/10 backdrop-blur rounded-lg p-3">
              <p className="text-sm text-primary-foreground/80">Trending Up</p>
              <p className="text-2xl font-bold text-primary-foreground">Wheat +5.15%</p>
            </div>
            <div className="bg-primary-foreground/10 backdrop-blur rounded-lg p-3">
              <p className="text-sm text-primary-foreground/80">Action Required</p>
              <p className="text-2xl font-bold text-primary-foreground">Maize - Sell Now</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4">
        {crops.map((crop) => (
          <Card key={crop.name} className="shadow-card hover:shadow-hover transition-all">
            <CardContent className="p-6">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="text-lg font-semibold">{crop.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {crop.marketName} • {crop.distance}
                      </p>
                    </div>
                    <Badge variant={crop.volume === "High demand" ? "default" : "secondary"}>
                      {crop.volume}
                    </Badge>
                  </div>
                  
                  <div className="flex items-baseline gap-4">
                    <div className="flex items-baseline gap-2">
                      <span className="text-3xl font-bold">₹{crop.currentPrice}</span>
                      <span className="text-sm text-muted-foreground">{crop.unit}</span>
                    </div>
                    
                    <div className={`flex items-center gap-1 ${crop.change > 0 ? "text-success" : "text-destructive"}`}>
                      {crop.change > 0 ? (
                        <TrendingUp className="h-4 w-4" />
                      ) : (
                        <TrendingDown className="h-4 w-4" />
                      )}
                      <span className="font-medium">{Math.abs(crop.change)}%</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 mt-3">
                    <Badge variant="outline" className="flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {crop.bestTime}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      Previous: ₹{crop.previousPrice}
                    </span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    variant={crop.bestTime.includes("Sell") ? "action" : "outline"}
                    onClick={() => handleSellNow(crop.name)}
                  >
                    <ShoppingCart className="h-4 w-4 mr-2" />
                    Sell Now
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => handlePriceAlert(crop.name)}
                  >
                    <DollarSign className="h-4 w-4 mr-2" />
                    Set Alert
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="shadow-card bg-muted/50">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-warning mt-0.5" />
            <div>
              <p className="font-medium">Market Tip</p>
              <p className="text-sm text-muted-foreground">
                Wheat prices expected to rise 8-10% in next week due to festival demand. Consider holding your harvest.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MarketPrices;