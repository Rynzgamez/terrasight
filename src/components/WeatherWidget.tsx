import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Cloud, CloudRain, Sun, Wind, Droplets, ThermometerSun } from "lucide-react";

const WeatherWidget = () => {
  const weatherData = {
    current: {
      temp: 28,
      condition: "Partly Cloudy",
      humidity: 65,
      windSpeed: 12,
      precipitation: 0,
    },
    forecast: [
      { day: "Today", high: 32, low: 24, condition: "sunny", rain: 0 },
      { day: "Tomorrow", high: 30, low: 23, condition: "cloudy", rain: 20 },
      { day: "Thu", high: 28, low: 22, condition: "rain", rain: 60 },
      { day: "Fri", high: 29, low: 23, condition: "cloudy", rain: 30 },
    ],
  };

  const getWeatherIcon = (condition: string) => {
    switch (condition) {
      case "sunny":
        return <Sun className="h-5 w-5 text-warning" />;
      case "cloudy":
        return <Cloud className="h-5 w-5 text-muted-foreground" />;
      case "rain":
        return <CloudRain className="h-5 w-5 text-info" />;
      default:
        return <Sun className="h-5 w-5 text-warning" />;
    }
  };

  return (
    <Card className="shadow-card">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Cloud className="h-5 w-5" />
            Weather
          </span>
          <Badge variant="outline">Live</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Current Weather */}
        <div className="flex items-center justify-between p-3 rounded-lg bg-gradient-sky">
          <div>
            <p className="text-3xl font-bold">{weatherData.current.temp}°C</p>
            <p className="text-sm text-muted-foreground">{weatherData.current.condition}</p>
          </div>
          <Sun className="h-12 w-12 text-warning" />
        </div>

        {/* Weather Stats */}
        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="p-2 rounded-lg bg-muted/50">
            <Droplets className="h-4 w-4 mx-auto mb-1 text-info" />
            <p className="text-xs text-muted-foreground">Humidity</p>
            <p className="text-sm font-medium">{weatherData.current.humidity}%</p>
          </div>
          <div className="p-2 rounded-lg bg-muted/50">
            <Wind className="h-4 w-4 mx-auto mb-1 text-primary" />
            <p className="text-xs text-muted-foreground">Wind</p>
            <p className="text-sm font-medium">{weatherData.current.windSpeed} km/h</p>
          </div>
          <div className="p-2 rounded-lg bg-muted/50">
            <CloudRain className="h-4 w-4 mx-auto mb-1 text-info" />
            <p className="text-xs text-muted-foreground">Rain</p>
            <p className="text-sm font-medium">{weatherData.current.precipitation}%</p>
          </div>
        </div>

        {/* 4-Day Forecast */}
        <div className="space-y-2">
          <p className="text-sm font-medium">4-Day Forecast</p>
          <div className="space-y-2">
            {weatherData.forecast.map((day) => (
              <div key={day.day} className="flex items-center justify-between p-2 rounded-lg bg-muted/30">
                <div className="flex items-center gap-3">
                  {getWeatherIcon(day.condition)}
                  <span className="text-sm font-medium w-16">{day.day}</span>
                </div>
                <div className="flex items-center gap-3">
                  {day.rain > 0 && (
                    <Badge variant="outline" className="text-xs">
                      {day.rain}% rain
                    </Badge>
                  )}
                  <div className="text-sm text-right">
                    <span className="font-medium">{day.high}°</span>
                    <span className="text-muted-foreground"> / {day.low}°</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Alert */}
        {weatherData.forecast.some(d => d.rain > 50) && (
          <div className="p-3 rounded-lg bg-info/10 border border-info/20">
            <p className="text-sm font-medium text-info">Irrigation Advisory</p>
            <p className="text-xs text-muted-foreground mt-1">
              Rain expected Thursday. Consider delaying irrigation.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default WeatherWidget;