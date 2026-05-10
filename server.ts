import express, { Request, Response } from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import multer from "multer";
import { nanoid } from "nanoid";
import fs from "fs";
import { fileURLToPath } from "url";

// Extend Request type to include multer file
interface MulterRequest extends Request {
  file?: Express.Multer.File;
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Ensure uploads directory exists
  const uploadsDir = path.join(__dirname, "uploads");
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir);
  }

  // Configure multer for file storage
  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, "uploads/");
    },
    filename: (req, file, cb) => {
      const ext = path.extname(file.originalname);
      cb(null, `${nanoid()}${ext}`);
    },
  });

  const upload = multer({ 
    storage,
    limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
  });

  app.use(express.json());

  const metadataPath = path.join(uploadsDir, "metadata.json");
  const getMetadata = () => {
    if (fs.existsSync(metadataPath)) {
      return JSON.parse(fs.readFileSync(metadataPath, "utf-8"));
    }
    return {};
  };

  const saveMetadata = (data: any) => {
    fs.writeFileSync(metadataPath, JSON.stringify(data, null, 2));
  };

  // API Route: Upload photo
  app.post("/api/upload", upload.single("photo"), (req: MulterRequest, res: Response) => {
    if (!req.file) {
      return res.status(400).json({ error: "No photo uploaded" });
    }
    
    const password = req.body.password;
    if (password) {
      const metadata = getMetadata();
      metadata[req.file.filename] = { password };
      saveMetadata(metadata);
    }
    
    // Construct the public URL
    const baseUrl = process.env.APP_URL || `http://localhost:${PORT}`;
    const photoUrl = `${baseUrl}/view/${req.file.filename}`;
    
    res.json({ 
      id: req.file.filename,
      url: photoUrl 
    });
  });

  // API Route: Check if photo is password protected
  app.get("/api/check-password/:id", (req, res) => {
    const metadata = getMetadata();
    const photoData = metadata[req.params.id];
    res.json({ protected: !!photoData?.password });
  });

  // API Route: Verify password
  app.post("/api/verify-password", (req, res) => {
    const { id, password } = req.body;
    const metadata = getMetadata();
    const photoData = metadata[id];
    
    if (!photoData || photoData.password === password) {
      res.json({ success: true });
    } else {
      res.status(401).json({ success: false, error: "Incorrect password" });
    }
  });

  // Serve uploaded photos publicly
  app.get("/p/:id", (req, res) => {
    const filePath = path.join(uploadsDir, req.params.id);
    if (fs.existsSync(filePath)) {
      res.sendFile(filePath);
    } else {
      res.status(404).send("Photo not found");
    }
  });

  // Health check
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
