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
  visualizedImage: string;
  status: string;
  crop_type: string;
  disease_name: string;
  confidence: number;
  vegetation_index: number;
  diagnosis: string;
  recommendations: string[];
  detections: {
    weeds: number;
    pests: number;
    total: number;
  };
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
      // Convert base64 to blob
      const base64Response = await fetch(uploadedImage);
      const blob = await base64Response.blob();
      
      // Create FormData
      const formData = new FormData();
      formData.append('image', blob, 'drone_image.jpg');

      // Progress simulation
      setAnalysisProgress(10);
      
      // Call Flask API
      const response = await fetch('http://127.0.0.1:5000/analyze', {
        method: 'POST',
        body: formData,
      });

      setAnalysisProgress(80);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Analysis failed');
      }

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.message || 'Analysis failed');
      }

      // Convert base64 image to data URL
      const visualizedImage = `data:image/png;base64,${data.image_base64}`;

      const analysisResults: AnalysisResults = {
        original: uploadedImage,
        visualizedImage: visualizedImage,
        status: data.status,
        crop_type: data.crop_type,
        disease_name: data.disease_name,
        confidence: data.confidence / 100,
        vegetation_index: data.vegetation_index,
        diagnosis: data.diagnosis,
        recommendations: data.recommendations,
        detections: data.detections
      };

      setResults(analysisResults);
      setAnalysisProgress(100);
      
      toast({
        title: "Analysis Complete",
        description: "Drone image analysis finished successfully",
      });
    } catch (error) {
      console.error('Analysis error:', error);
      toast({
        title: "Analysis Failed",
        description: error instanceof Error ? error.message : "Failed to connect to backend. Ensure Flask server is running on port 5000.",
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

Crop Type: ${results.crop_type}
Disease: ${results.disease_name}
Overall Health: ${results.status}
Confidence: ${(results.confidence * 100).toFixed(1)}%
Vegetation Index: ${results.vegetation_index.toFixed(3)}

Diagnosis:
${results.diagnosis}

Recommendations:
${results.recommendations.map(rec => `- ${rec}`).join('\n')}

Detections:
- Weeds: ${results.detections.weeds}
- Pests: ${results.detections.pests}
- Total: ${results.detections.total}
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
                  {results.status === "Healthy" ? (
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
                  <p className="text-lg font-semibold">{results.crop_type}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Disease Status</Label>
                  <p className="text-lg font-semibold">{results.disease_name}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Overall Health</Label>
                  <div className="flex items-center gap-2">
                    <Badge
                      variant={results.status === "Healthy" ? "default" : "secondary"}
                      className={results.status !== "Healthy" ? "bg-warning" : ""}
                    >
                      {results.status}
                    </Badge>
                    <span className="text-sm text-muted-foreground">
                      {(results.confidence * 100).toFixed(1)}% confidence
                    </span>
                  </div>
                </div>
                <div>
                  <Label className="text-muted-foreground">Vegetation Index</Label>
                  <p className="text-lg font-semibold">{results.vegetation_index.toFixed(3)}</p>
                </div>
              </div>

              <div className="grid md:grid-cols-3 gap-4">
                <div className="p-3 bg-accent/50 rounded-lg">
                  <Label className="text-muted-foreground text-xs">Weeds Detected</Label>
                  <p className="text-2xl font-bold">{results.detections.weeds}</p>
                </div>
                <div className="p-3 bg-accent/50 rounded-lg">
                  <Label className="text-muted-foreground text-xs">Pests Detected</Label>
                  <p className="text-2xl font-bold">{results.detections.pests}</p>
                </div>
                <div className="p-3 bg-accent/50 rounded-lg">
                  <Label className="text-muted-foreground text-xs">Total Detections</Label>
                  <p className="text-2xl font-bold">{results.detections.total}</p>
                </div>
              </div>

              {results.diagnosis && (
                <div className="p-4 bg-warning/10 border border-warning rounded-lg">
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <AlertCircle className="h-4 w-4" />
                    Diagnosis
                  </h4>
                  <p className="text-sm">{results.diagnosis}</p>
                </div>
              )}

              <div className="p-4 bg-info/10 border border-info rounded-lg">
                <h4 className="font-semibold mb-2 flex items-center gap-2">
                  <Info className="h-4 w-4" />
                  Recommendations
                </h4>
                <ul className="space-y-1">
                  {results.recommendations.map((rec, idx) => (
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
                  <Label className="mb-2 block">AI Analysis Result</Label>
                  <img
                    src={results.visualizedImage}
                    alt="Analysis Visualization"
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
            Flask Backend Setup
          </CardTitle>
        </CardHeader>
        <CardContent className="text-sm space-y-2">
          <p>To run the analysis:</p>
          <ol className="list-decimal list-inside space-y-1 text-muted-foreground">
            <li>Install dependencies: <code className="bg-background px-1 py-0.5 rounded">pip install flask flask-cors torch torchvision pillow numpy</code></li>
            <li>Run the Flask server: <code className="bg-background px-1 py-0.5 rounded">python flask_api.py</code></li>
            <li>Ensure server is running on <code className="bg-background px-1 py-0.5 rounded">http://127.0.0.1:5000</code></li>
          </ol>
        </CardContent>
      </Card>
    </div>
  );
};

export default TerraSightAnalysis;
