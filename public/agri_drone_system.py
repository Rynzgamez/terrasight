"""
Agricultural Drone Image Analysis System
A comprehensive prototype for analyzing drone-captured crop images using multiple AI models.
Now with Hugging Face Transformers for real disease detection!
"""

import torch
import torchvision
from torchvision import transforms
from torchvision.models.segmentation import deeplabv3_resnet101
from torchvision.models import resnet50, ResNet50_Weights
import cv2
import numpy as np
import matplotlib.pyplot as plt
from matplotlib.patches import Rectangle
from PIL import Image as PILImage
import warnings
warnings.filterwarnings('ignore')

# Hugging Face imports
from transformers import AutoImageProcessor, AutoModelForImageClassification

# Try to import ultralytics, provide fallback
try:
    from ultralytics import YOLO
    YOLO_AVAILABLE = True
except ImportError:
    YOLO_AVAILABLE = False
    print("Warning: ultralytics not available. Install with: pip install ultralytics")


class ImagePreprocessor:
    """Handles image loading, resizing, and normalization."""
    
    def __init__(self, target_size=(512, 512)):
        self.target_size = target_size
        self.normalize = transforms.Normalize(
            mean=[0.485, 0.456, 0.406],
            std=[0.229, 0.224, 0.225]
        )
    
    def load_image(self, image_path):
        """Load image from file or accept numpy array."""
        if isinstance(image_path, str):
            image = cv2.imread(image_path)
            image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
        else:
            image = image_path
        return image
    
    def preprocess(self, image, for_model='general'):
        """
        Preprocess image for different model types.
        Returns both original and preprocessed versions.
        """
        original = image.copy()
        
        # Resize
        resized = cv2.resize(image, self.target_size)
        
        if for_model == 'tensor':
            # Convert to tensor and normalize
            tensor = torch.from_numpy(resized).float() / 255.0
            tensor = tensor.permute(2, 0, 1)
            tensor = self.normalize(tensor)
            return original, resized, tensor.unsqueeze(0)
        
        return original, resized


class SegmentationModel:
    """DeepLabV3 for crop/background segmentation."""
    
    def __init__(self, device='cpu'):
        self.device = device
        print("Loading DeepLabV3 segmentation model...")
        self.model = deeplabv3_resnet101(pretrained=True)
        self.model.to(device)
        self.model.eval()
    
    def segment(self, image_tensor):
        """Segment crops from background."""
        with torch.no_grad():
            output = self.model(image_tensor.to(self.device))['out']
            mask = torch.argmax(output, dim=1).squeeze().cpu().numpy()
        
        # Create binary mask (treating vegetation classes as crops)
        # Classes 0-20 are COCO classes; we'll use heuristics for "plant-like"
        crop_mask = np.isin(mask, [9, 10, 13, 15])  # Some greenery-related classes
        
        return mask, crop_mask.astype(np.uint8)


class HealthClassificationModel:
    """Hugging Face transformers-based crop disease classifier."""
    
    def __init__(self, device='cpu'):
        self.device = device
        print("Loading Hugging Face PlantVillage Disease Model...")
        
        # Model will auto-download on first run (~90MB)
        model_name = "linkanjarad/mobilenet_v2_1.0_224-plant-disease-identification"
        
        try:
            self.processor = AutoImageProcessor.from_pretrained(model_name)
            self.model = AutoModelForImageClassification.from_pretrained(model_name)
            self.model.to(device)
            self.model.eval()
            print("✓ Model loaded successfully")
        except Exception as e:
            print(f"⚠️  Error loading Hugging Face model: {e}")
            print("Please check your internet connection")
            raise
        
        # Class names from the model
        self.classes = list(self.model.config.id2label.values())
    
    def classify_health(self, image_tensor):
        """
        Classify crop disease using Hugging Face model.
        Args:
            image_tensor: PyTorch tensor [1, 3, H, W]
        Returns:
            status: "Healthy", "Diseased", or "Stressed"
            confidence: float (0-1)
            disease_name: string (specific disease)
            crop_type: string (crop name)
        """
        # Convert tensor back to PIL Image for transformers
        # Denormalize first
        mean = torch.tensor([0.485, 0.456, 0.406]).view(3, 1, 1)
        std = torch.tensor([0.229, 0.224, 0.225]).view(3, 1, 1)
        
        image_denorm = image_tensor.squeeze(0).cpu() * std + mean
        image_denorm = torch.clamp(image_denorm, 0, 1)
        image_np = (image_denorm.permute(1, 2, 0).numpy() * 255).astype(np.uint8)
        pil_image = PILImage.fromarray(image_np)
        
        # Process with Hugging Face processor
        inputs = self.processor(images=pil_image, return_tensors="pt")
        inputs = {k: v.to(self.device) for k, v in inputs.items()}
        
        # Get predictions
        with torch.no_grad():
            outputs = self.model(**inputs)
            probs = torch.nn.functional.softmax(outputs.logits, dim=-1)
            top_prob, top_idx = torch.max(probs, dim=1)
        
        # Get disease name
        disease_full = self.model.config.id2label[top_idx.item()]
        confidence = top_prob.item()
        
        # Parse disease name (format: "Crop___Disease")
        if '___' in disease_full:
            crop_type, disease_name = disease_full.split('___', 1)
            crop_type = crop_type.replace('_', ' ')
            disease_name = disease_name.replace('_', ' ')
        else:
            crop_type = "Unknown"
            disease_name = disease_full.replace('_', ' ')
        
        # Determine health status
        if 'healthy' in disease_name.lower():
            status = "Healthy"
        else:
            status = "Diseased"
        
        return status, confidence, disease_name, crop_type


class WeedPestDetector:
    """YOLOv8 for weed and pest detection."""
    
    def __init__(self, device='cpu'):
        self.device = device
        self.available = YOLO_AVAILABLE
        
        if self.available:
            print("Loading YOLOv8 detection model...")
            try:
                self.model = YOLO('yolov8n.pt')  # Nano model for speed
                self.model.to(device)
            except Exception as e:
                print(f"YOLOv8 loading failed: {e}")
                self.available = False
    
    def detect(self, image):
        """Detect weeds and pests."""
        if not self.available:
            return [], "YOLOv8 not available"
        
        try:
            results = self.model(image, verbose=False)
            detections = []
            
            for result in results:
                boxes = result.boxes
                for box in boxes:
                    x1, y1, x2, y2 = box.xyxy[0].cpu().numpy()
                    conf = box.conf[0].cpu().numpy()
                    cls = int(box.cls[0].cpu().numpy())
                    
                    # Map detected objects to weed/pest categories
                    # In production, use a custom-trained model
                    label = result.names[cls]
                    category = self._categorize_detection(label)
                    
                    if category:
                        detections.append({
                            'bbox': [int(x1), int(y1), int(x2), int(y2)],
                            'confidence': float(conf),
                            'label': label,
                            'category': category
                        })
            
            return detections, "Success"
        except Exception as e:
            return [], f"Detection failed: {str(e)}"
    
    def _categorize_detection(self, label):
        """Categorize detections as weed, pest, or ignore."""
        weed_keywords = ['plant', 'potted plant']
        pest_keywords = ['bird', 'insect', 'bee']
        
        label_lower = label.lower()
        if any(kw in label_lower for kw in weed_keywords):
            return 'weed'
        elif any(kw in label_lower for kw in pest_keywords):
            return 'pest'
        return None


class VegetationIndexCalculator:
    """Calculate vegetation health indices."""
    
    @staticmethod
    def excess_green_index(image):
        """Calculate ExG (Excess Green) index."""
        # Normalize image
        image_norm = image.astype(np.float32) / 255.0
        R = image_norm[:, :, 0]
        G = image_norm[:, :, 1]
        B = image_norm[:, :, 2]
        
        # ExG = 2*G - R - B
        exg = 2 * G - R - B
        
        # Normalize to 0-1
        exg_norm = (exg - exg.min()) / (exg.max() - exg.min() + 1e-8)
        
        return exg_norm
    
    @staticmethod
    def calculate_ndvi_approximation(image):
        """
        Approximate NDVI using visible spectrum.
        Note: True NDVI requires NIR band.
        This uses a proxy: (Green - Red) / (Green + Red)
        """
        image_norm = image.astype(np.float32) / 255.0
        R = image_norm[:, :, 0]
        G = image_norm[:, :, 1]
        
        # Pseudo-NDVI
        ndvi = (G - R) / (G + R + 1e-8)
        
        # Normalize to 0-1
        ndvi_norm = (ndvi - ndvi.min()) / (ndvi.max() - ndvi.min() + 1e-8)
        
        return ndvi_norm
    
    @staticmethod
    def create_health_map(index_array, colormap='RdYlGn'):
        """Create color-coded health map."""
        import tempfile
        import os
        
        # Use system temp directory (cross-platform)
        temp_dir = tempfile.gettempdir()
        temp_path = os.path.join(temp_dir, 'health_map.png')
        
        plt.imsave(temp_path, index_array, cmap=colormap)
        health_map = cv2.imread(temp_path)
        health_map = cv2.cvtColor(health_map, cv2.COLOR_BGR2RGB)
        
        # Clean up temp file
        try:
            os.remove(temp_path)
        except:
            pass
            
        return health_map


class FusionEngine:
    """Combines outputs from all models with decision rules."""
    
    def __init__(self):
        self.rules = {
            'critical': [],
            'warning': [],
            'info': []
        }
    
    def fuse_results(self, segmentation_mask, health_status, health_confidence,
                     detections, vegetation_index, disease_name="Unknown", crop_type="Unknown"):
        """Apply decision rules to generate final diagnosis."""
        diagnosis = {
            'crop_type': crop_type,
            'disease_name': disease_name,
            'overall_health': 'Unknown',
            'confidence': 0.0,
            'issues': [],
            'recommendations': []
        }
        
        # Rule 1: Vegetation index analysis
        avg_vi = np.mean(vegetation_index)
        
        if avg_vi < 0.3:
            diagnosis['issues'].append("Low vegetation index detected (stress/disease likely)")
            diagnosis['recommendations'].append("Inspect for disease, water stress, or nutrient deficiency")
        
        # Rule 2: Health classification
        diagnosis['overall_health'] = health_status
        diagnosis['confidence'] = health_confidence
        
        if health_status == "Diseased":
            diagnosis['issues'].append(f"Disease detected: {disease_name} (confidence: {health_confidence:.2%})")
            diagnosis['recommendations'].append(f"Apply appropriate treatment for {disease_name}")
        elif health_status == "Stressed":
            diagnosis['issues'].append(f"Crop stress detected (confidence: {health_confidence:.2%})")
            diagnosis['recommendations'].append("Check irrigation and nutrient levels")
        
        # Rule 3: Weed/pest detection
        weed_count = sum(1 for d in detections if d['category'] == 'weed')
        pest_count = sum(1 for d in detections if d['category'] == 'pest')
        
        if weed_count > 0:
            diagnosis['issues'].append(f"{weed_count} potential weed(s) detected")
            diagnosis['recommendations'].append("Consider targeted herbicide application or manual removal")
        
        if pest_count > 0:
            diagnosis['issues'].append(f"{pest_count} potential pest(s) detected")
            diagnosis['recommendations'].append("Monitor pest population and apply IPM strategies")
        
        # Rule 4: Combined decision
        if avg_vi < 0.3 and health_status == "Diseased":
            diagnosis['issues'].append("CRITICAL: Multiple stress factors detected")
            diagnosis['recommendations'].append("Immediate intervention required")
        
        # Default recommendations
        if not diagnosis['recommendations']:
            diagnosis['recommendations'].append("Continue regular monitoring")
        
        return diagnosis


class AgriDroneAnalyzer:
    """Main analysis pipeline integrating all components."""
    
    def __init__(self, device='cpu'):
        self.device = device
        self.preprocessor = ImagePreprocessor()
        self.segmentation_model = SegmentationModel(device)
        self.health_classifier = HealthClassificationModel(device)
        self.weed_pest_detector = WeedPestDetector(device)
        self.vi_calculator = VegetationIndexCalculator()
        self.fusion_engine = FusionEngine()
    
    def analyze(self, image_path):
        """
        Complete analysis pipeline.
        Returns all results and visualizations.
        """
        print(f"\n{'='*60}")
        print("AGRICULTURAL DRONE IMAGE ANALYSIS")
        print(f"{'='*60}\n")
        
        # 1. Preprocessing
        print("Step 1/6: Loading and preprocessing image...")
        image = self.preprocessor.load_image(image_path)
        original, resized = self.preprocessor.preprocess(image)
        _, _, image_tensor = self.preprocessor.preprocess(image, for_model='tensor')
        
        # 2. Segmentation
        print("Step 2/6: Running segmentation model...")
        seg_mask, crop_mask = self.segmentation_model.segment(image_tensor)
        
        # 3. Health Classification (now with 4 return values)
        print("Step 3/6: Classifying crop health...")
        health_status, health_confidence, disease_name, crop_type = self.health_classifier.classify_health(image_tensor)
        
        # 4. Weed/Pest Detection
        print("Step 4/6: Detecting weeds and pests...")
        detections, det_status = self.weed_pest_detector.detect(resized)
        print(f"   Detection status: {det_status}")
        
        # 5. Vegetation Index
        print("Step 5/6: Calculating vegetation indices...")
        exg_index = self.vi_calculator.excess_green_index(resized)
        health_map = self.vi_calculator.create_health_map(exg_index)
        
        # 6. Fusion and Decision (now with disease_name and crop_type)
        print("Step 6/6: Fusing results and generating diagnosis...")
        diagnosis = self.fusion_engine.fuse_results(
            crop_mask, health_status, health_confidence, detections, exg_index,
            disease_name=disease_name, crop_type=crop_type
        )
        
        results = {
            'original': original,
            'resized': resized,
            'segmentation_mask': crop_mask,
            'detections': detections,
            'health_map': health_map,
            'vegetation_index': exg_index,
            'diagnosis': diagnosis
        }
        
        return results
    
    def visualize_results(self, results, save_path='analysis_output.png'):
        """Create comprehensive visualization of all results."""
        fig = plt.figure(figsize=(20, 12))
        
        # 1. Original Image
        ax1 = plt.subplot(2, 3, 1)
        ax1.imshow(results['resized'])
        ax1.set_title('Original Image', fontsize=14, fontweight='bold')
        ax1.axis('off')
        
        # 2. Segmentation Mask
        ax2 = plt.subplot(2, 3, 2)
        ax2.imshow(results['resized'])
        ax2.imshow(results['segmentation_mask'], alpha=0.5, cmap='Greens')
        ax2.set_title('Crop Segmentation', fontsize=14, fontweight='bold')
        ax2.axis('off')
        
        # 3. Detection Results
        ax3 = plt.subplot(2, 3, 3)
        det_img = results['resized'].copy()
        for det in results['detections']:
            x1, y1, x2, y2 = det['bbox']
            color = (255, 0, 0) if det['category'] == 'weed' else (255, 165, 0)
            cv2.rectangle(det_img, (x1, y1), (x2, y2), color, 2)
            label = f"{det['category']}: {det['confidence']:.2f}"
            cv2.putText(det_img, label, (x1, y1-5), 
                       cv2.FONT_HERSHEY_SIMPLEX, 0.5, color, 2)
        ax3.imshow(det_img)
        ax3.set_title(f'Weed/Pest Detection ({len(results["detections"])} found)', 
                     fontsize=14, fontweight='bold')
        ax3.axis('off')
        
        # 4. Vegetation Index Heatmap
        ax4 = plt.subplot(2, 3, 4)
        im = ax4.imshow(results['vegetation_index'], cmap='RdYlGn', vmin=0, vmax=1)
        ax4.set_title('Vegetation Health Index (ExG)', fontsize=14, fontweight='bold')
        ax4.axis('off')
        plt.colorbar(im, ax=ax4, fraction=0.046, pad=0.04)
        
        # 5. Health Map Overlay
        ax5 = plt.subplot(2, 3, 5)
        ax5.imshow(results['resized'], alpha=0.6)
        ax5.imshow(results['vegetation_index'], cmap='RdYlGn', alpha=0.4, vmin=0, vmax=1)
        ax5.set_title('Health Map Overlay', fontsize=14, fontweight='bold')
        ax5.axis('off')
        
        # 6. Diagnosis Panel
        ax6 = plt.subplot(2, 3, 6)
        ax6.axis('off')
        
        diagnosis = results['diagnosis']
        avg_vi = np.mean(results['vegetation_index'])
        
        diagnosis_text = f"""
CROP HEALTH DIAGNOSIS
{'='*40}

Crop Type: {diagnosis.get('crop_type', 'Unknown')}
Disease: {diagnosis.get('disease_name', 'Unknown')}
Overall Status: {diagnosis['overall_health']}
Confidence: {diagnosis['confidence']:.1%}
Avg Vegetation Index: {avg_vi:.3f}

DETECTED ISSUES:
{chr(10).join('• ' + issue for issue in diagnosis['issues']) if diagnosis['issues'] else '• No critical issues detected'}

RECOMMENDATIONS:
{chr(10).join(f'{i+1}. ' + rec for i, rec in enumerate(diagnosis['recommendations']))}

DETECTION SUMMARY:
• Weeds: {sum(1 for d in results['detections'] if d['category'] == 'weed')}
• Pests: {sum(1 for d in results['detections'] if d['category'] == 'pest')}
"""
        
        # Color-code based on health
        if diagnosis['overall_health'] == 'Healthy':
            bg_color = '#d4edda'
        elif diagnosis['overall_health'] == 'Stressed':
            bg_color = '#fff3cd'
        else:
            bg_color = '#f8d7da'
        
        ax6.text(0.05, 0.95, diagnosis_text, transform=ax6.transAxes,
                fontsize=11, verticalalignment='top', family='monospace',
                bbox=dict(boxstyle='round', facecolor=bg_color, alpha=0.8))
        
        plt.tight_layout()
        plt.savefig(save_path, dpi=150, bbox_inches='tight')
        print(f"\n✓ Visualization saved to: {save_path}")
        
        return fig


def demo_analysis(image_path='sample_crop.jpg'):
    """
    Run complete demo analysis on a sample image.
    """
    # Detect device
    device = 'cuda' if torch.cuda.is_available() else 'cpu'
    print(f"Using device: {device}")
    
    # Initialize analyzer
    analyzer = AgriDroneAnalyzer(device=device)
    
    # Run analysis
    results = analyzer.analyze(image_path)
    
    # Visualize
    analyzer.visualize_results(results)
    
    # Print summary
    print(f"\n{'='*60}")
    print("ANALYSIS COMPLETE")
    print(f"{'='*60}")
    print(f"Crop Type: {results['diagnosis']['crop_type']}")
    print(f"Disease: {results['diagnosis']['disease_name']}")
    print(f"Overall Health: {results['diagnosis']['overall_health']}")
    print(f"Confidence: {results['diagnosis']['confidence']:.1%}")
    print(f"Issues Found: {len(results['diagnosis']['issues'])}")
    print(f"Detections: {len(results['detections'])}")
    
    return results


if __name__ == "__main__":
    # Usage example
    print("""
    Agricultural Drone Analysis System (with HF Transformers)
    ==========================================================
    
    Usage:
        # For custom image
        results = demo_analysis('path/to/your/crop/image.jpg')
        
        # For programmatic use
        analyzer = AgriDroneAnalyzer(device='cpu')
        results = analyzer.analyze('image.jpg')
        analyzer.visualize_results(results, save_path='output.png')
    
    Required packages:
        pip install torch torchvision opencv-python matplotlib pillow numpy
        pip install transformers  # NEW: For HF disease detection
        pip install ultralytics  # For YOLOv8
    """)
    
    # Run demo (you need to provide an actual image)
    results = demo_analysis(r"C:\Users\admin\Desktop\TerraSight-ArabAIChallenge\2.jpg")