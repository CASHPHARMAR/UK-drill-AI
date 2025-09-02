import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Badge } from '@/components/ui/badge';
import { Zap, Volume, VolumeX } from 'lucide-react';

interface ConversionControlsProps {
  onConvert: (intensity: string) => void;
  isConverting: boolean;
  selectedFile: File | null;
}

const intensityLevels = [
  {
    value: 'soft',
    label: 'Soft',
    description: 'Subtle UK Drill elements',
    icon: <Volume className="w-4 h-4" />,
    color: 'bg-accent/20 text-accent',
    features: ['Light 808s', 'Gentle hi-hats', 'Minimal vocal effects']
  },
  {
    value: 'medium',
    label: 'Medium',
    description: 'Balanced Drill transformation',
    icon: <Zap className="w-4 h-4" />,
    color: 'bg-secondary/20 text-secondary',
    features: ['Moderate bass boost', 'Standard Drill patterns', 'Enhanced atmosphere']
  },
  {
    value: 'heavy',
    label: 'Heavy',
    description: 'Full UK Drill experience',
    icon: <VolumeX className="w-4 h-4" />,
    color: 'bg-destructive/20 text-destructive',
    features: ['Heavy 808s', 'Aggressive hi-hats', 'Dark vocal processing']
  }
];

export default function ConversionControls({ 
  onConvert, 
  isConverting, 
  selectedFile 
}: ConversionControlsProps) {
  const [selectedIntensity, setSelectedIntensity] = useState('medium');

  const handleConvert = () => {
    if (selectedFile) {
      onConvert(selectedIntensity);
    }
  };

  return (
    <Card className="glassmorphism p-6" data-testid="conversion-controls">
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold mb-2 gradient-text">
            Conversion Settings
          </h3>
          <p className="text-muted-foreground text-sm">
            Choose the intensity level for your UK Drill transformation
          </p>
        </div>

        <RadioGroup
          value={selectedIntensity}
          onValueChange={setSelectedIntensity}
          className="space-y-4"
          data-testid="intensity-selector"
        >
          {intensityLevels.map((level) => (
            <div key={level.value} className="flex items-start space-x-3">
              <RadioGroupItem 
                value={level.value} 
                id={level.value}
                className="mt-1"
                data-testid={`radio-intensity-${level.value}`}
              />
              <div className="flex-1 space-y-2">
                <Label 
                  htmlFor={level.value} 
                  className="flex items-center space-x-2 cursor-pointer"
                >
                  <div className={`p-1 rounded ${level.color}`}>
                    {level.icon}
                  </div>
                  <span className="font-medium">{level.label}</span>
                  <Badge variant="outline" className="text-xs">
                    {level.description}
                  </Badge>
                </Label>
                <div className="flex flex-wrap gap-1">
                  {level.features.map((feature, index) => (
                    <Badge 
                      key={index} 
                      variant="secondary" 
                      className="text-xs opacity-70"
                    >
                      {feature}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </RadioGroup>

        <div className="pt-4 border-t border-border">
          <Button
            onClick={handleConvert}
            disabled={!selectedFile || isConverting}
            className="w-full bg-gradient-to-r from-primary via-secondary to-accent hover:scale-105 transition-transform neon-glow"
            size="lg"
            data-testid="button-start-conversion"
          >
            {isConverting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                Converting...
              </>
            ) : (
              <>
                <Zap className="w-5 h-5 mr-2" />
                Transform to UK Drill
              </>
            )}
          </Button>
          
          {!selectedFile && (
            <p className="text-xs text-muted-foreground text-center mt-2">
              Upload an audio file to start conversion
            </p>
          )}
        </div>
      </div>
    </Card>
  );
}
