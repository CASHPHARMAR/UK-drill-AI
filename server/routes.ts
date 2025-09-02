import type { Express, Request } from "express";
import { createServer, type Server } from "http";
import multer, { type FileFilterCallback } from "multer";
import path from "path";
import fs from "fs";
import { storage } from "./storage";
import { insertConversionSchema } from "@shared/schema";

interface UploadRequest extends Request {
  file?: Express.Multer.File;
}

const upload = multer({
  dest: "uploads/",
  fileFilter: (req: Request, file: Express.Multer.File, cb: FileFilterCallback) => {
    const allowedTypes = ['audio/mpeg', 'audio/wav', 'audio/mp4', 'audio/m4a'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only MP3, WAV, and M4A files are allowed.'));
    }
  },
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB limit
  }
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Create uploads directory if it doesn't exist
  if (!fs.existsSync('uploads')) {
    fs.mkdirSync('uploads');
  }

  // Upload audio file
  app.post("/api/upload", upload.single('audio'), async (req: UploadRequest, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      const { intensity } = req.body;
      
      const validationResult = insertConversionSchema.safeParse({
        originalFilename: req.file.originalname,
        originalFilePath: req.file.path,
        intensity: intensity || "medium",
        status: "pending",
        progress: 0,
        metadata: {
          fileSize: req.file.size,
          mimeType: req.file.mimetype,
        }
      });

      if (!validationResult.success) {
        return res.status(400).json({ message: "Invalid request data", errors: validationResult.error.errors });
      }

      const conversion = await storage.createConversion(validationResult.data);
      
      // Start processing in background (mocked for now)
      processAudioFile(conversion.id);

      res.json(conversion);
    } catch (error) {
      console.error("Upload error:", error);
      res.status(500).json({ message: "Upload failed" });
    }
  });

  // Get conversion status
  app.get("/api/conversions/:id", async (req, res) => {
    try {
      const conversion = await storage.getConversion(req.params.id);
      if (!conversion) {
        return res.status(404).json({ message: "Conversion not found" });
      }
      res.json(conversion);
    } catch (error) {
      console.error("Get conversion error:", error);
      res.status(500).json({ message: "Failed to get conversion" });
    }
  });

  // Get all conversions
  app.get("/api/conversions", async (req, res) => {
    try {
      const conversions = await storage.getAllConversions();
      res.json(conversions);
    } catch (error) {
      console.error("Get conversions error:", error);
      res.status(500).json({ message: "Failed to get conversions" });
    }
  });

  // Download converted file
  app.get("/api/download/:id", async (req, res) => {
    try {
      const conversion = await storage.getConversion(req.params.id);
      if (!conversion || !conversion.convertedFilePath) {
        return res.status(404).json({ message: "File not found" });
      }

      if (!fs.existsSync(conversion.convertedFilePath)) {
        return res.status(404).json({ message: "File not found on disk" });
      }

      const filename = `${path.parse(conversion.originalFilename).name}_drill_${conversion.intensity}.mp3`;
      res.download(conversion.convertedFilePath, filename);
    } catch (error) {
      console.error("Download error:", error);
      res.status(500).json({ message: "Download failed" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}

// Mock audio processing function
async function processAudioFile(conversionId: string) {
  try {
    const conversion = await storage.getConversion(conversionId);
    if (!conversion) return;

    // Simulate processing time and progress updates
    const totalSteps = 10;
    
    for (let step = 1; step <= totalSteps; step++) {
      await new Promise(resolve => setTimeout(resolve, 2000)); // 2 second delay per step
      
      const progress = Math.round((step / totalSteps) * 100);
      
      if (step === totalSteps) {
        // Create a mock converted file by copying the original file
        const outputPath = `uploads/converted_${conversionId}.mp3`;
        
        try {
          // Copy original file to simulate conversion output
          if (fs.existsSync(conversion.originalFilePath)) {
            fs.copyFileSync(conversion.originalFilePath, outputPath);
            console.log(`Created converted file: ${outputPath}`);
          } else {
            console.error(`Original file not found: ${conversion.originalFilePath}`);
          }
        } catch (copyError) {
          console.error('Error creating converted file:', copyError);
        }
        
        await storage.updateConversion(conversionId, {
          status: "completed",
          progress,
          convertedFilePath: outputPath,
          completedAt: new Date(),
        });
      } else {
        await storage.updateConversion(conversionId, {
          status: "processing",
          progress,
        });
      }
    }

    // In a real implementation, this would:
    // 1. Load the audio file using libraries like node-ffmpeg
    // 2. Apply UK Drill-specific audio effects:
    //    - Heavy 808 bass lines
    //    - Hi-hat patterns (rapid-fire, triplet patterns)
    //    - Sliding bass synths
    //    - Dark, menacing atmospheres
    //    - Pitch-shifted vocals
    //    - Aggressive EQ (boosted low-end, crisp highs)
    // 3. Save the processed file
    // 4. Update the conversion record with the output path

  } catch (error) {
    console.error("Processing error:", error);
    await storage.updateConversion(conversionId, {
      status: "failed",
      progress: 0,
    });
  }
}
