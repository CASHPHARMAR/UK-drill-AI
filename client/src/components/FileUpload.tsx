import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Upload, File, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  selectedFile: File | null;
  onClear: () => void;
  disabled?: boolean;
}

export default function FileUpload({ onFileSelect, selectedFile, onClear, disabled }: FileUploadProps) {
  const [dragOver, setDragOver] = useState(false);
  const { toast } = useToast();

  const onDrop = useCallback((acceptedFiles: File[], rejectedFiles: any[]) => {
    if (rejectedFiles.length > 0) {
      toast({
        title: "Invalid file",
        description: "Please upload an MP3, WAV, or M4A audio file.",
        variant: "destructive",
      });
      return;
    }

    if (acceptedFiles.length > 0) {
      onFileSelect(acceptedFiles[0]);
    }
  }, [onFileSelect, toast]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'audio/mpeg': ['.mp3'],
      'audio/wav': ['.wav'],
      'audio/mp4': ['.m4a'],
      'audio/m4a': ['.m4a'],
    },
    maxFiles: 1,
    disabled,
    onDragEnter: () => setDragOver(true),
    onDragLeave: () => setDragOver(false),
  });

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (selectedFile) {
    return (
      <Card className="glassmorphism p-6" data-testid="selected-file-display">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-primary/20 rounded-lg">
              <File className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="font-medium text-foreground">{selectedFile.name}</p>
              <p className="text-sm text-muted-foreground">
                {formatFileSize(selectedFile.size)}
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClear}
            disabled={disabled}
            data-testid="button-clear-file"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <Card
      {...getRootProps()}
      className={`glassmorphism file-upload-zone cursor-pointer transition-all duration-300 ${
        isDragActive || dragOver ? 'drag-over' : ''
      } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      data-testid="file-upload-zone"
    >
      <input {...getInputProps()} />
      <div className="p-12 text-center">
        <div className="mx-auto mb-4 p-4 bg-primary/20 rounded-full w-16 h-16 flex items-center justify-center">
          <Upload className="w-8 h-8 text-primary" />
        </div>
        <h3 className="text-xl font-semibold mb-2 text-foreground">
          {isDragActive ? 'Drop your audio file here' : 'Upload Audio File'}
        </h3>
        <p className="text-muted-foreground mb-4">
          Drag and drop your MP3, WAV, or M4A file here, or click to browse
        </p>
        <Button 
          variant="outline" 
          disabled={disabled}
          data-testid="button-browse-files"
        >
          Browse Files
        </Button>
        <p className="text-xs text-muted-foreground mt-4">
          Maximum file size: 50MB
        </p>
      </div>
    </Card>
  );
}
