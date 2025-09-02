import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import ThreeBackground from '@/components/ThreeBackground';
import FileUpload from '@/components/FileUpload';
import WaveformVisualization from '@/components/WaveformVisualization';
import AudioPlayer from '@/components/AudioPlayer';
import ConversionControls from '@/components/ConversionControls';
import ProcessingProgress from '@/components/ProcessingProgress';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Music, Headphones, Zap } from 'lucide-react';
import { type Conversion } from '@shared/schema';

export default function Home() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [currentConversion, setCurrentConversion] = useState<Conversion | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Poll for conversion status when processing
  const { data: conversionStatus } = useQuery({
    queryKey: ['/api/conversions', currentConversion?.id],
    enabled: !!currentConversion && ['pending', 'processing'].includes(currentConversion.status),
    refetchInterval: 2000,
  });

  // Update current conversion when status changes
  if (conversionStatus && currentConversion && 
      typeof conversionStatus === 'object' && 'id' in conversionStatus && 
      conversionStatus.id === currentConversion.id) {
    const status = conversionStatus as Conversion;
    if (status.status !== currentConversion.status || 
        status.progress !== currentConversion.progress) {
      setCurrentConversion(status);
    }
  }

  const uploadMutation = useMutation({
    mutationFn: async ({ file, intensity }: { file: File; intensity: string }) => {
      const formData = new FormData();
      formData.append('audio', file);
      formData.append('intensity', intensity);

      const response = await apiRequest('POST', '/api/upload', formData);
      return response.json();
    },
    onSuccess: (conversion: Conversion) => {
      setCurrentConversion(conversion);
      toast({
        title: "Upload successful",
        description: "Your audio file is being converted to UK Drill style.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/conversions'] });
    },
    onError: (error) => {
      console.error('Upload error:', error);
      toast({
        title: "Upload failed",
        description: "Failed to upload your audio file. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleFileSelect = (file: File) => {
    setSelectedFile(file);
    setCurrentConversion(null);
  };

  const handleClearFile = () => {
    setSelectedFile(null);
    setCurrentConversion(null);
  };

  const handleConvert = (intensity: string) => {
    if (!selectedFile) return;
    
    uploadMutation.mutate({ file: selectedFile, intensity });
  };

  const getConvertedAudioUrl = () => {
    if (currentConversion?.status === 'completed' && currentConversion.convertedFilePath) {
      return `/api/download/${currentConversion.id}`;
    }
    return undefined;
  };

  const isConverting = uploadMutation.isPending || 
    (currentConversion && ['pending', 'processing'].includes(currentConversion.status));

  return (
    <div className="min-h-screen bg-background text-foreground relative overflow-hidden">
      <ThreeBackground />
      
      {/* Header */}
      <header className="glassmorphism fixed top-0 left-0 right-0 z-50 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-primary to-secondary rounded-xl flex items-center justify-center neon-glow">
              <Music className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold gradient-text">DrillBeats AI</h1>
              <p className="text-xs text-muted-foreground">UK Drill Music Converter</p>
            </div>
          </div>
          
          <div className="hidden md:flex items-center space-x-6">
            <Badge variant="outline" className="glassmorphism">
              <Headphones className="w-3 h-3 mr-1" />
              AI-Powered
            </Badge>
            <Badge variant="outline" className="glassmorphism">
              <Zap className="w-3 h-3 mr-1" />
              Real-time Processing
            </Badge>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="pt-32 pb-20 px-6">
        <div className="max-w-6xl mx-auto">
          {/* Hero Section */}
          <div className="text-center mb-16 animate-fade-in">
            <h2 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
              Transform Your Music Into
              <span className="gradient-text block animate-float">UK Drill Beats</span>
            </h2>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Upload any audio file and watch our AI transform it into authentic UK Drill style 
              with heavy 808s, crisp hi-hats, and that signature dark atmosphere.
            </p>
          </div>

          {/* Main Interface */}
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Left Column */}
            <div className="space-y-6">
              <FileUpload
                onFileSelect={handleFileSelect}
                selectedFile={selectedFile}
                onClear={handleClearFile}
                disabled={!!isConverting}
              />
              
              <ConversionControls
                onConvert={handleConvert}
                isConverting={!!isConverting}
                selectedFile={selectedFile}
              />

              {currentConversion && (
                <ProcessingProgress
                  conversion={currentConversion}
                  isVisible={!!currentConversion}
                />
              )}
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              <WaveformVisualization
                audioFile={selectedFile}
                isPlaying={isPlaying}
                currentTime={currentTime}
                duration={duration}
              />
              
              <AudioPlayer
                audioFile={selectedFile}
                convertedAudioUrl={getConvertedAudioUrl()}
                onTimeUpdate={(time, dur) => {
                  setCurrentTime(time);
                  setDuration(dur);
                }}
                onPlayStateChange={setIsPlaying}
              />

              {/* Features Card */}
              <Card className="glassmorphism p-6">
                <h3 className="text-lg font-semibold mb-4 gradient-text">
                  What Makes UK Drill Unique?
                </h3>
                <div className="space-y-3 text-sm">
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                    <div>
                      <p className="font-medium">Heavy 808 Bass Lines</p>
                      <p className="text-muted-foreground">Deep, sliding bass that hits hard</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-secondary rounded-full mt-2 flex-shrink-0" />
                    <div>
                      <p className="font-medium">Rapid Hi-Hat Patterns</p>
                      <p className="text-muted-foreground">Signature triplet and fast hi-hat sequences</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-accent rounded-full mt-2 flex-shrink-0" />
                    <div>
                      <p className="font-medium">Dark Atmosphere</p>
                      <p className="text-muted-foreground">Menacing synths and atmospheric effects</p>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
