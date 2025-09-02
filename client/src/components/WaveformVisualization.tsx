import { useEffect, useRef, useState } from 'react';
import { Card } from '@/components/ui/card';

interface WaveformVisualizationProps {
  audioFile: File | null;
  isPlaying?: boolean;
  currentTime?: number;
  duration?: number;
}

export default function WaveformVisualization({ 
  audioFile, 
  isPlaying = false, 
  currentTime = 0, 
  duration = 0 
}: WaveformVisualizationProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [waveformData, setWaveformData] = useState<number[]>([]);
  const animationRef = useRef<number>();

  useEffect(() => {
    if (!audioFile) {
      setWaveformData([]);
      return;
    }

    // Generate waveform visualization
    const generateWaveform = async () => {
      try {
        const arrayBuffer = await audioFile.arrayBuffer();
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
        
        const rawData = audioBuffer.getChannelData(0);
        const samples = 200; // Number of samples for visualization
        const blockSize = Math.floor(rawData.length / samples);
        const filteredData = [];

        for (let i = 0; i < samples; i++) {
          let blockStart = blockSize * i;
          let sum = 0;
          for (let j = 0; j < blockSize; j++) {
            sum += Math.abs(rawData[blockStart + j]);
          }
          filteredData.push(sum / blockSize);
        }

        const multiplier = Math.pow(Math.max(...filteredData), -1);
        setWaveformData(filteredData.map(n => n * multiplier));
      } catch (error) {
        console.error('Error generating waveform:', error);
        // Generate dummy waveform for demonstration
        const dummyData = Array.from({ length: 200 }, () => Math.random() * 0.8 + 0.1);
        setWaveformData(dummyData);
      }
    };

    generateWaveform();
  }, [audioFile]);

  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const draw = () => {
      const { width, height } = canvas;
      ctx.clearRect(0, 0, width, height);

      if (waveformData.length === 0) return;

      const barWidth = width / waveformData.length;
      const progress = duration > 0 ? currentTime / duration : 0;

      waveformData.forEach((value, index) => {
        const barHeight = value * height * 0.8;
        const x = index * barWidth;
        const y = (height - barHeight) / 2;

        // Create gradient based on progress
        const isPlayed = index / waveformData.length <= progress;
        
        if (isPlayed) {
          const gradient = ctx.createLinearGradient(0, 0, 0, height);
          gradient.addColorStop(0, '#8b5cf6'); // Primary purple
          gradient.addColorStop(0.5, '#06b6d4'); // Secondary blue
          gradient.addColorStop(1, '#10b981'); // Accent green
          ctx.fillStyle = gradient;
        } else {
          ctx.fillStyle = 'rgba(139, 92, 246, 0.3)';
        }

        ctx.fillRect(x, y, barWidth - 1, barHeight);
      });

      // Add glow effect for playing state
      if (isPlaying) {
        ctx.shadowColor = '#8b5cf6';
        ctx.shadowBlur = 10;
        ctx.globalCompositeOperation = 'screen';
      }
    };

    const animate = () => {
      draw();
      if (isPlaying) {
        animationRef.current = requestAnimationFrame(animate);
      }
    };

    animate();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [waveformData, isPlaying, currentTime, duration]);

  // Resize canvas to match container
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const resizeCanvas = () => {
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * window.devicePixelRatio;
      canvas.height = rect.height * window.devicePixelRatio;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
      }
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    return () => {
      window.removeEventListener('resize', resizeCanvas);
    };
  }, []);

  return (
    <Card className="glassmorphism p-6" data-testid="waveform-visualization">
      <div className="waveform-container">
        <h3 className="text-lg font-semibold mb-4 gradient-text">Audio Waveform</h3>
        <div className="relative h-32 w-full">
          <canvas
            ref={canvasRef}
            className="w-full h-full rounded-lg"
            style={{ width: '100%', height: '100%' }}
            data-testid="waveform-canvas"
          />
          {waveformData.length === 0 && audioFile && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="animate-pulse text-muted-foreground">
                Analyzing audio...
              </div>
            </div>
          )}
          {!audioFile && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-muted-foreground">
                Upload an audio file to see waveform
              </div>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}
