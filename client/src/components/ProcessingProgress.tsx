import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, AlertCircle, Loader } from 'lucide-react';
import { type Conversion } from '@shared/schema';

interface ProcessingProgressProps {
  conversion: Conversion | null;
  isVisible: boolean;
}

const processingSteps = [
  { label: 'Analyzing audio structure', progress: 10 },
  { label: 'Extracting tempo and key', progress: 20 },
  { label: 'Generating 808 patterns', progress: 30 },
  { label: 'Adding hi-hat sequences', progress: 45 },
  { label: 'Processing bass lines', progress: 60 },
  { label: 'Applying vocal effects', progress: 75 },
  { label: 'Mixing and mastering', progress: 85 },
  { label: 'Finalizing output', progress: 95 },
  { label: 'Conversion complete', progress: 100 },
];

export default function ProcessingProgress({ 
  conversion, 
  isVisible 
}: ProcessingProgressProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [animatedProgress, setAnimatedProgress] = useState(0);

  useEffect(() => {
    if (!conversion || !isVisible) return;

    // Animate progress bar
    const targetProgress = conversion.progress;
    const step = targetProgress > animatedProgress ? 1 : -1;
    
    const interval = setInterval(() => {
      setAnimatedProgress(prev => {
        if (Math.abs(prev - targetProgress) < 2) {
          clearInterval(interval);
          return targetProgress;
        }
        return prev + step * 2;
      });
    }, 50);

    // Update current step based on progress
    const stepIndex = processingSteps.findIndex(step => step.progress >= targetProgress);
    if (stepIndex >= 0) {
      setCurrentStep(stepIndex);
    }

    return () => clearInterval(interval);
  }, [conversion?.progress, isVisible, animatedProgress]);

  if (!isVisible || !conversion) {
    return null;
  }

  const getStatusIcon = () => {
    switch (conversion.status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-accent" />;
      case 'failed':
        return <AlertCircle className="w-5 h-5 text-destructive" />;
      case 'processing':
      case 'pending':
      default:
        return <Loader className="w-5 h-5 text-primary animate-spin" />;
    }
  };

  const getStatusColor = () => {
    switch (conversion.status) {
      case 'completed':
        return 'bg-accent/20 text-accent';
      case 'failed':
        return 'bg-destructive/20 text-destructive';
      case 'processing':
        return 'bg-secondary/20 text-secondary';
      case 'pending':
      default:
        return 'bg-muted/20 text-muted-foreground';
    }
  };

  return (
    <Card className="glassmorphism p-6 animate-slide-up" data-testid="processing-progress">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold gradient-text">
            Converting to UK Drill
          </h3>
          <div className="flex items-center space-x-2">
            {getStatusIcon()}
            <Badge className={getStatusColor()}>
              {conversion.status.charAt(0).toUpperCase() + conversion.status.slice(1)}
            </Badge>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Progress</span>
            <span className="font-medium">{animatedProgress}%</span>
          </div>
          
          <div className="relative">
            <Progress 
              value={animatedProgress} 
              className="h-3"
              data-testid="progress-bar"
            />
            <div 
              className="absolute top-0 left-0 h-full processing-bar rounded-full transition-all duration-300"
              style={{ width: `${animatedProgress}%` }}
            />
          </div>
        </div>

        {conversion.status === 'processing' && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-foreground">Current Step:</h4>
            <div className="space-y-1">
              {processingSteps.map((step, index) => (
                <div 
                  key={index}
                  className={`flex items-center space-x-2 text-sm transition-opacity duration-300 ${
                    index === currentStep 
                      ? 'text-primary opacity-100' 
                      : index < currentStep 
                        ? 'text-accent opacity-60' 
                        : 'text-muted-foreground opacity-30'
                  }`}
                  data-testid={`step-${index}`}
                >
                  <div className={`w-2 h-2 rounded-full ${
                    index === currentStep 
                      ? 'bg-primary animate-pulse-slow' 
                      : index < currentStep 
                        ? 'bg-accent' 
                        : 'bg-muted'
                  }`} />
                  <span>{step.label}</span>
                  {index < currentStep && (
                    <CheckCircle className="w-3 h-3 text-accent" />
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {conversion.status === 'completed' && (
          <div className="text-center py-4">
            <CheckCircle className="w-12 h-12 text-accent mx-auto mb-2" />
            <p className="text-accent font-medium">
              Conversion completed successfully!
            </p>
            <p className="text-sm text-muted-foreground">
              Your track has been transformed into UK Drill style
            </p>
          </div>
        )}

        {conversion.status === 'failed' && (
          <div className="text-center py-4">
            <AlertCircle className="w-12 h-12 text-destructive mx-auto mb-2" />
            <p className="text-destructive font-medium">
              Conversion failed
            </p>
            <p className="text-sm text-muted-foreground">
              Please try again with a different file
            </p>
          </div>
        )}

        <div className="text-xs text-muted-foreground">
          <p><strong>File:</strong> {conversion.originalFilename}</p>
          <p><strong>Intensity:</strong> {conversion.intensity.charAt(0).toUpperCase() + conversion.intensity.slice(1)}</p>
        </div>
      </div>
    </Card>
  );
}
