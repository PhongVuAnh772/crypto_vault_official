const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { nanoid } = require('nanoid');
const QRCode = require('qrcode');
const plist = require('plist');
const cors = require('cors');
const dotenv = require('dotenv');
const { S3Client, PutObjectCommand, DeleteObjectCommand } = require('@aws-sdk/client-s3');
const { Upload } = require('@aws-sdk/lib-storage');
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");

// Load environment variables
dotenv.config();

console.log("--- OTA Server Configuration Status ---");
console.log("PORT:", process.env.PORT || 3000);
console.log("BASE_URL:", process.env.BASE_URL || "Not set");
console.log("S3 Configured:", {
    bucket: !!process.env.AWS_S3_BUCKET,
    accessKey: !!process.env.AWS_ACCESS_KEY_ID,
    secretKey: !!process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION || "us-east-1"
});
console.log("---------------------------------------");

const app = express();
const PORT = process.env.PORT || 3000;
const BASE_URL = process.env.BASE_URL || `http://localhost:${PORT}`;

// AWS S3 Configuration
const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

const BUCKET_NAME = process.env.AWS_S3_BUCKET || 'amzn-s3-cryptovault';

/**
 * Upload to S3 Helper
 */
async function uploadToS3(file) {
  const fileKey = `ota/${Date.now()}-${file.originalname}`;
  const fileStream = fs.createReadStream(file.path);
  
  const upload = new Upload({
    client: s3Client,
    params: {
      Bucket: BUCKET_NAME,
      Key: fileKey,
      Body: fileStream,
      ContentType: 'application/octet-stream',
    },
  });

  await upload.done();
  // Xóa file tạm sau khi upload xong
  fs.unlinkSync(file.path);
  
  return `https://${BUCKET_NAME}.s3.${process.env.AWS_REGION || 'us-east-1'}.amazonaws.com/${fileKey}`;
}

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use(express.static(path.join(__dirname, '../web/public')));

// Simple DB in-memory (persistent in real apps)
const DB_PATH = path.join(__dirname, 'db.json');
const UPLOADS_PATH = path.join(__dirname, 'uploads');

if (!fs.existsSync(DB_PATH)) {
  fs.writeFileSync(DB_PATH, JSON.stringify({ apps: {} }));
}

if (!fs.existsSync(UPLOADS_PATH)) {
  fs.mkdirSync(UPLOADS_PATH, { recursive: true });
}

function getDB() {
  return JSON.parse(fs.readFileSync(DB_PATH));
}

function updateDB(data) {
  fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
}

// Multer Configuration - Dùng diskStorage cho cả S3 và Local để tiết kiệm RAM
storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOADS_PATH),
  filename: (req, file, cb) => cb(null, `${nanoid()}${path.extname(file.originalname)}`)
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    if (path.extname(file.originalname).toLowerCase() !== '.ipa') {
      return cb(new Error('Only .ipa files are allowed'));
    }
    cb(null, true);
  },
  limits: { fileSize: 500 * 1024 * 1024 } // 500MB limit
});

/**
 * Upload API
 * POST /api/ota/upload
 */
app.post('/api/ota/upload', upload.single('ipa'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const { appName, version, bundleId } = req.body;
    if (!appName || !version || !bundleId) {
      return res.status(400).json({ error: 'Missing app info (appName, version, bundleId)' });
    }

    const id = nanoid(10);
    let ipaUrl;

    if (process.env.AWS_ACCESS_KEY_ID && process.env.AWS_S3_BUCKET) {
      // Upload to S3
      ipaUrl = await uploadToS3(req.file);
    } else {
      // Local URL
      ipaUrl = `${BASE_URL}/uploads/${req.file.filename}`;
    }
    const plistUrl = `${BASE_URL}/api/ota/plist/${id}.plist`;
    const installUrl = `itms-services://?action=download-manifest&url=${encodeURIComponent(plistUrl)}`;
    
    // Generate QR Code (Base64)
    const qrCode = await QRCode.toDataURL(installUrl);

    const appData = {
      id,
      appName,
      version,
      bundleId,
      ipaUrl,
      plistUrl,
      installUrl,
      qrCode,
      createdAt: new Date().toISOString()
    };

    const db = getDB();
    db.apps[id] = appData;
    updateDB(db);

    res.json({
      success: true,
      data: appData
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * Create Upload Session (Get Presigned URL)
 * POST /api/ota/session
 */
app.post('/api/ota/session', async (req, res) => {
  try {
    const { appName, version, bundleId } = req.body;
    if (!appName || !version || !bundleId) {
      return res.status(400).json({ error: 'Missing app info' });
    }

    const id = nanoid(10);
    const fileName = `${Date.now()}-${id}.ipa`;
    const fileKey = `ota/${fileName}`;
    
    // Generate S3 Presigned URL
    const command = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: fileKey,
      ContentType: 'application/octet-stream',
    });

    const uploadUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 });
    const ipaUrl = `https://${BUCKET_NAME}.s3.${process.env.AWS_REGION || 'us-east-1'}.amazonaws.com/${fileKey}`;

    res.json({
      success: true,
      data: {
        id,
        uploadUrl,
        ipaUrl,
        appName,
        version,
        bundleId
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * Finalize Upload
 * POST /api/ota/publish
 */
app.post('/api/ota/publish', async (req, res) => {
  try {
    const { id, appName, version, bundleId, ipaUrl } = req.body;
    
    const plistUrl = `${BASE_URL}/api/ota/plist/${id}.plist`;
    const installUrl = `itms-services://?action=download-manifest&url=${encodeURIComponent(plistUrl)}`;
    const qrCode = await QRCode.toDataURL(installUrl);

    const appData = {
      id,
      appName,
      version,
      bundleId,
      ipaUrl,
      plistUrl,
      installUrl,
      qrCode,
      createdAt: new Date().toISOString()
    };

    const db = getDB();
    db.apps[id] = appData;
    updateDB(db);

    res.json({ success: true, data: appData });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * Generate manifest.plist
 * GET /api/ota/plist/:id.plist
 */
app.get('/api/ota/plist/:id.plist', (req, res) => {
  const { id } = req.params;
  const db = getDB();
  const appData = db.apps[id];

  if (!appData) {
    return res.status(404).send('App not found');
  }

  const manifest = {
    items: [
      {
        assets: [
          {
            kind: 'software-package',
            url: appData.ipaUrl
          }
        ],
        metadata: {
          'bundle-identifier': appData.bundleId,
          'bundle-version': appData.version,
          kind: 'software',
          title: appData.appName
        }
      }
    ]
  };

  const xml = plist.build(manifest);
  res.set('Content-Type', 'application/xml');
  res.send(xml);
});

/**
 * Get All Apps List
 * GET /api/ota/list
 */
app.get('/api/ota/list', (req, res) => {
  const db = getDB();
  const apps = Object.values(db.apps).sort((a, b) => 
    new Date(b.createdAt) - new Date(a.createdAt)
  );
  res.json(apps);
});

/**
 * Get App Details
 * GET /api/ota/details/:id
 */
app.get('/api/ota/details/:id', (req, res) => {
  const { id } = req.params;
  const db = getDB();
  const appData = db.apps[id];

  if (!appData) {
    return res.status(404).json({ error: 'App not found' });
  }

  res.json(appData);
});

/**
 * Delete App
 * DELETE /api/ota/delete/:id
 */
app.delete('/api/ota/delete/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const db = getDB();
    const appData = db.apps[id];

    if (!appData) {
      return res.status(404).json({ error: 'App not found' });
    }

    // 1. Delete from S3 if applicable
    if (appData.ipaUrl.includes('amazonaws.com')) {
      const urlParts = appData.ipaUrl.split('.com/');
      const key = urlParts[1]; // Extracts the key after '.com/'
      
      const command = new DeleteObjectCommand({
        Bucket: BUCKET_NAME,
        Key: key,
      });
      await s3Client.send(command);
    } else if (appData.ipaUrl.includes('/uploads/')) {
      // 2. Delete from local storage if applicable
      const fileName = path.basename(appData.ipaUrl);
      const filePath = path.join(UPLOADS_PATH, fileName);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    // 3. Remove from DB
    delete db.apps[id];
    updateDB(db);

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * Serve Dashboard (Upload Page)
 * GET /
 */
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../web/public/index.html'));
});

/**
 * Serve Install Page
 * GET /ota/:id
 */
app.get('/ota/:id', (req, res) => {
  res.sendFile(path.join(__dirname, '../web/public/install.html'));
});

app.listen(PORT, () => {
  console.log(`OTA Server running at ${BASE_URL}`);
});
