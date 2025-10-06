import { useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Upload, Play, Download, AlertCircle, CheckCircle, Info } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface AnalysisResults {
  original: string;
  segmentationMask: string;
  vegetationIndex: string;
  healthMap: string;
  diagnosis: {
    crop_type: string;
    disease_name: string;
    overall_health: string;
    confidence: number;
    issues: string[];
    recommendations: string[];
  };
  detections: Array<{
    bbox: number[];
    confidence: number;
    label: string;
    category: string;
  }>;
}

const TerraSightAnalysis = () => {
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [enableYolo, setEnableYolo] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [results, setResults] = useState<AnalysisResults | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        toast({
          title: "Invalid file type",
          description: "Please upload a JPG or PNG image",
          variant: "destructive",
        });
        return;
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        setUploadedImage(event.target?.result as string);
        setResults(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const runAnalysis = async () => {
    if (!uploadedImage) {
      toast({
        title: "No image uploaded",
        description: "Please upload a drone image first",
        variant: "destructive",
      });
      return;
    }

    setIsAnalyzing(true);
    setAnalysisProgress(0);

    try {
      // Simulate progress steps
      const steps = ["Preprocessing", "Segmentation", "Health Classification", "Vegetation Index", "Fusion"];
      for (let i = 0; i < steps.length; i++) {
        setAnalysisProgress((i + 1) * 20);
        await new Promise(resolve => setTimeout(resolve, 800));
      }

      // TODO: Replace with actual API call to your Python backend
      // const response = await fetch('YOUR_BACKEND_URL/analyze', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ 
      //     image: uploadedImage,
      //     enable_yolo: enableYolo 
      //   })
      // });
      // const data = await response.json();

      // Mock results for demonstration
      const mockResults: AnalysisResults = {
        original: uploadedImage,
        segmentationMask: uploadedImage,
        vegetationIndex: uploadedImage,
        healthMap: uploadedImage,
        diagnosis: {
          crop_type: "Wheat",
          disease_name: "Healthy",
          overall_health: "Healthy",
          confidence: 0.92,
          issues: enableYolo ? ["2 potential weed(s) detected"] : [],
          recommendations: enableYolo 
            ? ["Consider targeted herbicide application or manual removal", "Continue regular monitoring"]
            : ["Continue regular monitoring"]
        },
        detections: enableYolo ? [
          { bbox: [100, 100, 200, 200], confidence: 0.85, label: "weed", category: "weed" },
          { bbox: [300, 150, 400, 250], confidence: 0.78, label: "weed", category: "weed" }
        ] : []
      };

      setResults(mockResults);
      setAnalysisProgress(100);
      
      toast({
        title: "Analysis Complete",
        description: "Drone image analysis finished successfully",
      });
    } catch (error) {
      toast({
        title: "Analysis Failed",
        description: "Failed to analyze image. Please check your backend connection.",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const downloadAnalysis = () => {
    if (!results) return;
    
    // Create a downloadable report
    const report = `
TerraSight AI Analysis Report
=============================

Crop Type: ${results.diagnosis.crop_type}
Disease: ${results.diagnosis.disease_name}
Overall Health: ${results.diagnosis.overall_health}
Confidence: ${(results.diagnosis.confidence * 100).toFixed(1)}%

Issues Detected:
${results.diagnosis.issues.map(issue => `- ${issue}`).join('\n')}

Recommendations:
${results.diagnosis.recommendations.map(rec => `- ${rec}`).join('\n')}

Detections: ${results.detections.length} objects found
    `;

    const blob = new Blob([report], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'terrasight-analysis.txt';
    a.click();
    URL.revokeObjectURL(url);

    toast({
      title: "Report Downloaded",
      description: "Analysis report saved successfully",
    });
  };

  return (
    <div className="space-y-6">
      {/* Upload Section */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Upload Drone Image
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png"
              onChange={handleImageUpload}
              className="hidden"
            />
            <Button
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-2"
            >
              <Upload className="h-4 w-4" />
              Select Image
            </Button>
            
            <div className="flex items-center gap-2">
              <Switch
                id="yolo-toggle"
                checked={enableYolo}
                onCheckedChange={setEnableYolo}
              />
              <Label htmlFor="yolo-toggle" className="cursor-pointer">
                Enable Weed/Pest Detection (YOLO)
              </Label>
            </div>
          </div>

          {uploadedImage && (
            <div className="space-y-3">
              <img
                src={uploadedImage}
                alt="Uploaded drone image"
                className="w-full max-w-md rounded-lg border border-border"
              />
              <Button
                onClick={runAnalysis}
                disabled={isAnalyzing}
                className="flex items-center gap-2"
              >
                <Play className="h-4 w-4" />
                {isAnalyzing ? "Analyzing..." : "Run Analysis"}
              </Button>
            </div>
          )}

          {isAnalyzing && (
            <div className="space-y-2">
              <Progress value={analysisProgress} className="w-full" />
              <p className="text-sm text-muted-foreground">
                Processing: {analysisProgress}% complete
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Results Section */}
      {results && (
        <>
          {/* Diagnosis Summary */}
          <Card className="shadow-card">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  {results.diagnosis.overall_health === "Healthy" ? (
                    <CheckCircle className="h-5 w-5 text-success" />
                  ) : (
                    <AlertCircle className="h-5 w-5 text-warning" />
                  )}
                  Diagnosis Summary
                </CardTitle>
                <Button
                  onClick={downloadAnalysis}
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-2"
                >
                  <Download className="h-4 w-4" />
                  Download Report
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">Crop Type</Label>
                  <p className="text-lg font-semibold">{results.diagnosis.crop_type}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Disease Status</Label>
                  <p className="text-lg font-semibold">{results.diagnosis.disease_name}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Overall Health</Label>
                  <div className="flex items-center gap-2">
                    <Badge
                      variant={results.diagnosis.overall_health === "Healthy" ? "default" : "secondary"}
                      className={results.diagnosis.overall_health !== "Healthy" ? "bg-warning" : ""}
                    >
                      {results.diagnosis.overall_health}
                    </Badge>
                    <span className="text-sm text-muted-foreground">
                      {(results.diagnosis.confidence * 100).toFixed(1)}% confidence
                    </span>
                  </div>
                </div>
                <div>
                  <Label className="text-muted-foreground">Detections</Label>
                  <p className="text-lg font-semibold">{results.detections.length} objects</p>
                </div>
              </div>

              {results.diagnosis.issues.length > 0 && (
                <div className="p-4 bg-warning/10 border border-warning rounded-lg">
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <AlertCircle className="h-4 w-4" />
                    Issues Detected
                  </h4>
                  <ul className="space-y-1">
                    {results.diagnosis.issues.map((issue, idx) => (
                      <li key={idx} className="text-sm">• {issue}</li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="p-4 bg-info/10 border border-info rounded-lg">
                <h4 className="font-semibold mb-2 flex items-center gap-2">
                  <Info className="h-4 w-4" />
                  Recommendations
                </h4>
                <ul className="space-y-1">
                  {results.diagnosis.recommendations.map((rec, idx) => (
                    <li key={idx} className="text-sm">• {rec}</li>
                  ))}
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Visual Results */}
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle>Analysis Visualizations</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label className="mb-2 block">Original Image</Label>
                  <img
                    src={results.original}
                    alt="Original"
                    className="w-full rounded-lg border border-border"
                  />
                </div>
                <div>
                  <Label className="mb-2 block">Segmentation Mask</Label>
                  <img
                    src={results.segmentationMask}
                    alt="Segmentation"
                    className="w-full rounded-lg border border-border"
                  />
                </div>
                <div>
                  <Label className="mb-2 block">Vegetation Index Heatmap</Label>
                  <img
                    src={results.vegetationIndex}
                    alt="Vegetation Index"
                    className="w-full rounded-lg border border-border"
                  />
                </div>
                <div>
                  <Label className="mb-2 block">Health Overlay Map</Label>
                  <img
                    src={results.healthMap}
                    alt="Health Map"
                    className="w-full rounded-lg border border-border"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {/* Backend Integration Info */}
      <Card className="shadow-card bg-muted/50">
        <CardHeader>
          <CardTitle className="text-sm flex items-center gap-2">
            <Info className="h-4 w-4" />
            Backend Integration Required
          </CardTitle>
        </CardHeader>
        <CardContent className="text-sm space-y-2">
          <p>To enable real AI analysis, deploy the Python backend (agri_drone_system.py) as a Flask/FastAPI service.</p>
          <p className="text-muted-foreground">
            Update the API endpoint in the <code className="bg-background px-1 py-0.5 rounded">runAnalysis</code> function
            to connect to your backend service.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default TerraSightAnalysis;
