const express = require('express');
const cors = require('cors');
const multer = require('multer');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// 全てのリクエストをログに出力
app.use((req, res, next) => {
  // 静的ファイル(uploads等)へのリクエストはあまりログを汚さないように条件分岐
  if (!req.path.startsWith('/uploads/') && !req.path.includes('.')) {
    console.log(`${new Date().toISOString()} [${req.method}] ${req.path}`);
  }
  next();
});

// JSONデータベースのパス
const ASSETS_FILE = path.join(__dirname, 'data', 'assets.json');
const LEADS_FILE = path.join(__dirname, 'data', 'leads.json');
const SETTINGS_FILE = path.join(__dirname, 'data', 'settings.json');

// 画像のアップロード設定
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // フロントエンドの public フォルダ内に保存する
    cb(null, path.join(__dirname, '../public/uploads'));
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    cb(null, `${file.fieldname}_${Date.now()}${ext}`);
  }
});
const upload = multer({ storage: storage });
const cpUpload = upload.fields([{ name: 'file', maxCount: 1 }, { name: 'thumbnail', maxCount: 1 }]);

// JSONファイルの読み書きヘルパー
const readData = (filePath) => {
  if (!fs.existsSync(filePath)) {
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    const defaultData = filePath.includes('settings.json') ? {} : [];
    fs.writeFileSync(filePath, JSON.stringify(defaultData, null, 2), 'utf8');
    return defaultData;
  }
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch (error) {
    console.error(`Error parsing ${filePath}:`, error);
    return filePath.includes('settings.json') ? {} : [];
  }
};
const writeData = (filePath, data) => fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');

// --- Assets API ---

// 取得
app.get('/api/assets', (req, res) => {
  try {
    const assets = readData(ASSETS_FILE);
    res.json(assets);
  } catch (error) {
    res.status(500).json({ error: 'Failed to read assets' });
  }
});

// 新規作成（ファイルアップロード付き）
app.post('/api/assets', cpUpload, (req, res) => {
  try {
    const assets = readData(ASSETS_FILE);
    
    const { title, tags, type, creator, category } = req.body;
    
    let fileUrl = '';
    let thumbnailUrl = '';
    
    // 実データのファイルパス
    if (req.files && req.files['file'] && req.files['file'].length > 0) {
      fileUrl = `/uploads/${req.files['file'][0].filename}`;
    }
    
    // サムネイル画像のファイルパス
    if (req.files && req.files['thumbnail'] && req.files['thumbnail'].length > 0) {
      thumbnailUrl = `/uploads/${req.files['thumbnail'][0].filename}`;
    }

    // もしサムネイルがなくて実データが画像ならそれをサムネイルにする（後方互換）
    if (!thumbnailUrl && fileUrl && (fileUrl.endsWith('.png') || fileUrl.endsWith('.jpg') || fileUrl.endsWith('.jpeg'))) {
      thumbnailUrl = fileUrl;
    }

    const newAsset = {
      id: assets.length > 0 ? Math.max(...assets.map(a => a.id)) + 1 : 1,
      url: thumbnailUrl || '/logo.png', // サムネイル未指定時はロゴ画像を表示
      fileUrl: fileUrl || thumbnailUrl, // 実データのURL
      title: title || 'Untitled Asset',
      category: category || 'SNS投稿用',
      tags: tags ? tags.split(',').map(tag => tag.trim()).filter(Boolean) : [],
      type: type || 'creator',
      resolution: 'Original',
      downloads: 0,
      creator: creator || 'Admin User'
    };

    assets.unshift(newAsset); // 最新を先頭に追加
    writeData(ASSETS_FILE, assets);

    res.status(201).json(newAsset);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create asset' });
  }
});

// 更新処理 (メタデータのみ対応)
app.put('/api/assets/:id', (req, res) => {
  try {
    const assets = readData(ASSETS_FILE);
    const { title, category, tags } = req.body;
    const index = assets.findIndex(a => a.id === parseInt(req.params.id));
    
    if (index === -1) return res.status(404).json({ error: 'Asset not found' });

    assets[index] = {
      ...assets[index],
      title: title !== undefined ? title : assets[index].title,
      category: category !== undefined ? category : assets[index].category,
      tags: tags ? tags.split(',').map(tag => tag.trim()).filter(Boolean) : assets[index].tags
    };

    writeData(ASSETS_FILE, assets);
    res.json(assets[index]);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update asset' });
  }
});

// 削除処理
app.delete('/api/assets/:id', (req, res) => {
  try {
    const assets = readData(ASSETS_FILE);
    const assetId = parseInt(req.params.id);
    const newAssets = assets.filter(a => a.id !== assetId);
    
    // 画像ファイルの削除は今回は省略(DB上のレコードのみ削除)
    writeData(ASSETS_FILE, newAssets);
    res.status(200).json({ message: 'Deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete asset' });
  }
});

// 一括削除処理
app.delete('/api/assets/bulk', (req, res) => {
  try {
    const assets = readData(ASSETS_FILE);
    const { ids } = req.body;
    
    if (!ids || !Array.isArray(ids)) {
      return res.status(400).json({ error: 'Invalid ids provided' });
    }

    const newAssets = assets.filter(a => !ids.includes(a.id));
    writeData(ASSETS_FILE, newAssets);
    res.status(200).json({ message: 'Bulk deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to bulk delete assets' });
  }
});

// ダウンロードカウント増加
app.post('/api/assets/:id/download', (req, res) => {
  try {
    const assets = readData(ASSETS_FILE);
    const assetId = parseInt(req.params.id);
    const assetIndex = assets.findIndex(a => a.id === assetId);

    if (assetIndex !== -1) {
      assets[assetIndex].downloads += 1;
      writeData(ASSETS_FILE, assets);
      res.json(assets[assetIndex]);
    } else {
      res.status(404).json({ error: 'Asset not found' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to update download count' });
  }
});

// --- Leads API ---

// 取得
app.get('/api/leads', (req, res) => {
  try {
    const leads = readData(LEADS_FILE);
    res.json(leads);
  } catch (error) {
    res.status(500).json({ error: 'Failed to read leads' });
  }
});

app.get('/api/stats', (req, res) => {
  try {
    const leads = readData(LEADS_FILE);
    const now = new Date();
    
    // 今日の始まり (00:00:00)
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    
    // 今週の始まり (日曜日を週の始まりとするか、月曜とするか。今回はざっくり過去7日間=168時間とする)
    const sevenDaysAgo = now.getTime() - (7 * 24 * 60 * 60 * 1000);
    
    let todayCount = 0;
    let weekCount = 0;
    
    leads.forEach(lead => {
      // lead.date は '2023/10/25 12:34:56' のような形式 (toLocaleString('ja-JP'))
      // これを適切に Date 型に戻す
      const [datePart] = lead.date.split(' ');
      const [year, month, day] = datePart.split('/');
      // 時刻を無視して日付だけで比較してもよいが、正確を期すなら
      const leadDate = new Date(lead.date);
      const leadTime = leadDate.getTime();
      
      if (!isNaN(leadTime)) {
        if (leadTime >= startOfToday) todayCount++;
        if (leadTime >= sevenDaysAgo) weekCount++;
      } else {
        // 文字列フォーマット等でパース失敗した場合は簡易チェック
        const todayStr = `${now.getFullYear()}/${now.getMonth() + 1}/${now.getDate()}`;
        if (lead.date.startsWith(todayStr)) todayCount++;
        weekCount++; // 正確な週がわからないので一応足す等しない
      }
    });

    res.json({ todayCount, weekCount });
  } catch (error) {
    res.status(500).json({ error: 'Failed to read stats' });
  }
});

// 新規リード登録
app.post('/api/leads', async (req, res) => {
  try {
    const leads = readData(LEADS_FILE);
    const { email, company, personName, phone, revenue, challenge, storeUrl, downloadedId } = req.body;

    const newLead = {
      id: leads.length > 0 ? Math.max(...leads.map(l => l.id)) + 1 : 1,
      email: email,
      company: company || '',
      personName: personName || '',
      phone: phone || '',
      revenue: revenue || '',
      challenge: challenge || '',
      storeUrl: storeUrl || '',
      date: new Date().toLocaleString('ja-JP', { timeZone: 'Asia/Tokyo' }),
      downloadedId: parseInt(downloadedId),
      status: '未対応' // 新しいSFA用のステータス
    };

    leads.push(newLead);
    writeData(LEADS_FILE, leads);

    // ==========================================
    // [自動配信メールの実装]
    // ==========================================
    const nodemailer = require('nodemailer');
    
    (async () => {
      try {
        const settings = Object.keys(readData(SETTINGS_FILE)).length > 0 
          ? readData(SETTINGS_FILE) 
          : { mailSubject: "【ラクザイ】ご登録・ダウンロードありがとうございます", mailBody: "この度はラクザイから素材をダウンロードいただきありがとうございます。" };

        // UI(SettingsManager) で設定した値があればそれを優先、なければ環境変数
        const activeHost = settings.smtpHost || process.env.SMTP_HOST;
        const activePort = settings.smtpPort || process.env.SMTP_PORT || 587;
        const activeUser = settings.smtpUser || process.env.SMTP_USER;
        const activePass = settings.smtpPass || process.env.SMTP_PASS;
        const activeFrom = settings.smtpFrom || process.env.SMTP_FROM || '"ラクザイ公式" <noreply@rakuzai.com>';

        const transporter = nodemailer.createTransport({
          host: activeHost || 'smtp.ethereal.email',
          port: activePort,
          secure: activePort == 465, // true for 465, false for other ports
          auth: {
            user: activeUser || 'dummy_user',
            pass: activePass || 'dummy_pass'
          }
        });

        const finalBody = settings.mailBody.replace(/{company}/g, newLead.company ? newLead.company + ' ' : '');

        const mailOptions = {
          from: activeFrom,
          to: newLead.email,
          subject: settings.mailSubject,
          text: finalBody
        };

        // UIから設定されているか、環境変数が設定されていれば送る
        if (activeHost && activeUser && activePass) {
          await transporter.sendMail(mailOptions);
          console.log("メールを送信しました: ", newLead.email);
        } else {
          console.log("==========================================");
          console.log("✉️ [メール送信シミュレーション] (SMTP未設定)");
          console.log("------------------------------------------");
          console.log(`To: ${mailOptions.to}`);
          console.log(`Subject: ${mailOptions.subject}`);
          console.log(`Body:\n${mailOptions.text}`);
          console.log("==========================================");
        }

      } catch (err) {
        console.error("メール送信エラー:", err);
      }
    })();

    res.status(201).json(newLead);
  } catch (error) {
    console.error("リード保存エラー:", error);
    res.status(500).json({ error: 'Failed to save lead' });
  }
});

// リードのステータス等更新
app.put('/api/leads/:id', (req, res) => {
  try {
    const leads = readData(LEADS_FILE);
    const leadIndex = leads.findIndex(l => l.id === parseInt(req.params.id));

    if (leadIndex === -1) {
      return res.status(404).json({ error: 'Lead not found' });
    }

    leads[leadIndex] = { ...leads[leadIndex], ...req.body };
    writeData(LEADS_FILE, leads);
    res.json(leads[leadIndex]);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update lead' });
  }
});

// --- Settings API ---

app.get('/api/settings', (req, res) => {
  try {
    const settings = readData(SETTINGS_FILE);
    res.json(settings);
  } catch (error) {
    res.status(500).json({ error: 'Failed to read settings' });
  }
});

app.post('/api/settings', (req, res) => {
  try {
    writeData(SETTINGS_FILE, req.body);
    res.status(200).json({ message: 'Settings saved' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to save settings' });
  }
});

app.post('/api/upload', upload.single('image'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }
    const fileUrl = `/uploads/${req.file.filename}`;
    res.json({ url: fileUrl });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to upload image' });
  }
});

// --- 本番(Render等)用 SPAホスティング設定 ---
// React(Vite)でビルドされたフロントエンド(dist)を静的ファイルとして提供
const DIST_PATH = path.join(__dirname, '../dist');
const PUBLIC_PATH = path.join(__dirname, '../public');

if (fs.existsSync(DIST_PATH)) {
  // Viteのビルド成果物を提供する
  app.use(express.static(DIST_PATH));
}

// アップロード先(public/uploads等)も静的に見せる必要がある場合のフォールバック
if (fs.existsSync(PUBLIC_PATH)) {
  app.use(express.static(PUBLIC_PATH));
}

// React Router 用のフォールバック (API以外のすべてのリクエストをindex.htmlへ)
// 404 handling for undefined /api routes to prevent receiving index.html
app.use('/api', (req, res) => {
  res.status(404).json({ error: 'API route not found' });
});

// SPA Fallback: API以外でファイルが存在しない場合は index.html を返す
app.use((req, res, next) => {
  if (fs.existsSync(path.join(DIST_PATH, 'index.html'))) {
    res.sendFile(path.join(DIST_PATH, 'index.html'));
  } else {
    res.status(404).send('Not Found. Build the React app first.');
  }
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`API/Web Server v2.2 running on port ${PORT}`);
});
