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
const USERS_FILE = path.join(__dirname, 'data', 'users.json');
const BLOGS_FILE = path.join(__dirname, 'data', 'blogs.json');

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || 'rakuzai-super-secret-key';

// JWT認証ミドルウェア
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (token == null) return res.sendStatus(401);

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};

// 画像のアップロード設定
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // 永続化用ディスクを当てやすくするため、server/data/uploads 内に保存する
    const uploadPath = path.join(__dirname, 'data', 'uploads');
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    cb(null, `${file.fieldname}_${Date.now()}${ext}`);
  }
});
const upload = multer({ 
  storage: storage,
  limits: { fieldSize: 10 * 1024 * 1024 } // 10MB limit for react-quill rich text
});
const cpUpload = upload.fields([{ name: 'file', maxCount: 1 }, { name: 'thumbnail', maxCount: 1 }, { name: 'authorImage', maxCount: 1 }]);

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

// --- Auth API ---

app.post('/api/auth/register', async (req, res) => {
  try {
    const users = readData(USERS_FILE);
    const leads = readData(LEADS_FILE);
    const { email, password, company, personName, phone, revenue, storeUrl } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    if (users.find(u => u.email === email)) {
      return res.status(400).json({ error: 'Email already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = {
      id: users.length > 0 ? Math.max(...users.map(u => u.id)) + 1 : 1,
      email,
      password: hashedPassword,
      company: company || '',
      personName: personName || '',
      phone: phone || '',
      revenue: revenue || '',
      storeUrl: storeUrl || '',
      role: users.length === 0 ? 'admin' : 'user', // first user is admin
      createdAt: new Date().toISOString()
    };

    users.push(newUser);
    writeData(USERS_FILE, users);

    const newLead = {
      id: leads.length > 0 ? Math.max(...leads.map(l => l.id)) + 1 : 1,
      email: email,
      company: company || '',
      personName: personName || '',
      phone: phone || '',
      revenue: revenue || '',
      challenge: req.body.challenge || '会員登録',
      storeUrl: storeUrl || '',
      date: new Date().toLocaleString('ja-JP', { timeZone: 'Asia/Tokyo' }),
      downloadedId: null,
      status: '未対応'
    };
    leads.push(newLead);
    writeData(LEADS_FILE, leads);

    const token = jwt.sign({ id: newUser.id, email: newUser.email, role: newUser.role }, JWT_SECRET, { expiresIn: '7d' });

    // ==========================================
    // [新規会員登録時の自動配信メール実装]
    // ==========================================
    const nodemailer = require('nodemailer');
    
    (async () => {
      try {
        const settings = Object.keys(readData(SETTINGS_FILE)).length > 0 
          ? readData(SETTINGS_FILE) 
          : {};

        const activeHost = settings.smtpHost || process.env.SMTP_HOST;
        const activePort = settings.smtpPort || process.env.SMTP_PORT || 587;
        const activeUser = settings.smtpUser || process.env.SMTP_USER;
        const activePass = settings.smtpPass || process.env.SMTP_PASS;
        const activeFrom = settings.smtpFrom || process.env.SMTP_FROM || '"ラクザイ公式" <noreply@rakuzai.com>';

        const transporter = nodemailer.createTransport({
          host: activeHost || 'smtp.ethereal.email',
          port: activePort,
          secure: activePort == 465,
          auth: {
            user: activeUser || 'dummy_user',
            pass: activePass || 'dummy_pass'
          }
        });

        const subjectStr = settings.regMailSubject || "【ラクザイ】新規会員登録が完了しました";
        const bodyStr = settings.regMailBody || "この度はラクザイにご登録いただき誠にありがとうございます。\n\n引き続きラクザイのコンテンツをご活用ください。\n";

        // 置換処理
        const companyStr = newLead.company ? newLead.company + ' ' : '';
        const nameStr = newLead.personName ? newLead.personName + ' 様' : '';
        const finalBody = bodyStr.replace(/{company}/g, companyStr).replace(/{personName}/g, nameStr);

        const mailOptions = {
          from: activeFrom,
          to: newLead.email,
          subject: subjectStr,
          text: finalBody
        };

        if (activeHost && activeUser && activePass) {
          await transporter.sendMail(mailOptions);
          console.log("会員登録完了メールを送信しました: ", newLead.email);

          // 管理者(info@givee.co.jp)宛の通知メール
          const adminMailOptions = {
            from: activeFrom,
            to: 'info@givee.co.jp',
            subject: `【ラクザイ通知】新規会員登録: ${newLead.company} ${newLead.personName}様`,
            text: `新しい会員登録がありました。\n\n` +
                  `【会社名】${newLead.company}\n` +
                  `【担当者名】${newLead.personName}\n` +
                  `【メールアドレス】${newLead.email}\n` +
                  `【電話番号】${newLead.phone}\n` +
                  `【売上規模】${newLead.revenue}\n` +
                  `【楽天店舗URL】${newLead.storeUrl}\n\n` +
                  `確認事項などがあればサポートを実施してください。`
          };
          await transporter.sendMail(adminMailOptions);
        }
      } catch (err) {
        console.error("Registration Mail Send Error:", err);
      }
    })();
    
    // パスワードを除外して返す
    const { password: _, ...userWithoutPassword } = newUser;
    res.status(201).json({ token, user: userWithoutPassword });
  } catch (error) {
    console.error("Register Error:", error);
    res.status(500).json({ error: 'Failed to register user' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const users = readData(USERS_FILE);
    const { email, password } = req.body;

    const user = users.find(u => u.email === email);
    if (!user) return res.status(400).json({ error: 'Invalid email or password' });

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) return res.status(400).json({ error: 'Invalid email or password' });

    const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
    
    const { password: _, ...userWithoutPassword } = user;
    res.json({ token, user: userWithoutPassword });
  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({ error: 'Failed to login' });
  }
});

app.get('/api/auth/me', authenticateToken, (req, res) => {
  const users = readData(USERS_FILE);
  const user = users.find(u => u.id === req.user.id);
  if (!user) return res.status(404).json({ error: 'User not found' });
  
  const { password: _, ...userWithoutPassword } = user;
  res.json({ user: userWithoutPassword });
});

// マイページ用ダウンロード履歴取得
app.get('/api/user/downloads', authenticateToken, (req, res) => {
  try {
    const leads = readData(LEADS_FILE);
    const assets = readData(ASSETS_FILE);
    
    // 自身のメールアドレスでダウンロードした履歴を抽出
    const userLeads = leads.filter(l => l.email === req.user.email);
    
    // ユニークなassetIdのリストを作成
    const downloadedAssetIds = [...new Set(userLeads.map(l => l.downloadedId).filter(id => id != null))];
    
    // Assetの詳細情報を取得
    const downloadedAssets = assets.filter(a => downloadedAssetIds.includes(a.id));
    
    // 新しい順にするため反転など適宜行う（ID降順）
    downloadedAssets.sort((a,b) => b.id - a.id);
    
    res.json(downloadedAssets);
  } catch (err) {
    console.error("Fetch Downloads Error:", err);
    res.status(500).json({ error: 'Failed to fetch downloads' });
  }
});

// --- Blog API ---

app.get('/api/blogs', (req, res) => {
  try {
    const blogs = readData(BLOGS_FILE);
    // 未ログインの人は、限定公開のものは途中までしか見せない等の処理はフロントで行うため、一応全部返す
    // ただし非公開（下書き）は管理者以外には返さない
    res.json(blogs);
  } catch (error) {
    res.status(500).json({ error: 'Failed to read blogs' });
  }
});

app.get('/api/blogs/:id', (req, res) => {
  try {
    const blogs = readData(BLOGS_FILE);
    const blog = blogs.find(b => b.id === parseInt(req.params.id));
    if (!blog) return res.status(404).json({ error: 'Blog not found' });
    res.json(blog);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch blog' });
  }
});

app.post('/api/blogs', cpUpload, (req, res) => {
  try {
    const blogs = readData(BLOGS_FILE);
    const { title, content, isPublic, membersOnly, category, tags, authorName, authorProfile } = req.body;
    
    let thumbnailUrl = '';
    if (req.files && req.files['thumbnail'] && req.files['thumbnail'].length > 0) {
      thumbnailUrl = `/uploads/${req.files['thumbnail'][0].filename}`;
    }

    let authorImageUrl = '';
    if (req.files && req.files['authorImage'] && req.files['authorImage'].length > 0) {
      authorImageUrl = `/uploads/${req.files['authorImage'][0].filename}`;
    }

    const newBlog = {
      id: blogs.length > 0 ? Math.max(...blogs.map(b => b.id)) + 1 : 1,
      title,
      content,
      thumbnailUrl,
      category: category || '',
      tags: tags ? tags.split(',').map(t => t.trim()).filter(Boolean) : [],
      authorName: authorName || '',
      authorProfile: authorProfile || '',
      authorImageUrl,
      isPublic: isPublic === 'true' || isPublic === true,
      membersOnly: membersOnly === 'true' || membersOnly === true,
      createdAt: new Date().toISOString()
    };
    
    blogs.push(newBlog);
    writeData(BLOGS_FILE, blogs);
    res.status(201).json(newBlog);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create blog' });
  }
});

app.put('/api/blogs/:id', cpUpload, (req, res) => {
  try {
    const blogs = readData(BLOGS_FILE);
    const idx = blogs.findIndex(b => b.id === parseInt(req.params.id));
    if (idx === -1) return res.status(404).json({ error: 'Blog not found' });

    const { title, content, isPublic, membersOnly, category, tags, authorName, authorProfile } = req.body;
    
    let thumbnailUrl = blogs[idx].thumbnailUrl;
    if (req.files && req.files['thumbnail'] && req.files['thumbnail'].length > 0) {
      thumbnailUrl = `/uploads/${req.files['thumbnail'][0].filename}`;
    }

    let authorImageUrl = blogs[idx].authorImageUrl;
    if (req.files && req.files['authorImage'] && req.files['authorImage'].length > 0) {
      authorImageUrl = `/uploads/${req.files['authorImage'][0].filename}`;
    }

    blogs[idx] = {
      ...blogs[idx],
      title: title !== undefined ? title : blogs[idx].title,
      content: content !== undefined ? content : blogs[idx].content,
      thumbnailUrl,
      authorImageUrl,
      category: category !== undefined ? category : blogs[idx].category,
      tags: tags !== undefined ? tags.split(',').map(t => t.trim()).filter(Boolean) : (blogs[idx].tags || []),
      authorName: authorName !== undefined ? authorName : blogs[idx].authorName,
      authorProfile: authorProfile !== undefined ? authorProfile : blogs[idx].authorProfile,
      isPublic: isPublic !== undefined ? (isPublic === 'true' || isPublic === true) : blogs[idx].isPublic,
      membersOnly: membersOnly !== undefined ? (membersOnly === 'true' || membersOnly === true) : blogs[idx].membersOnly,
      updatedAt: new Date().toISOString()
    };

    writeData(BLOGS_FILE, blogs);
    res.json(blogs[idx]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update blog' });
  }
});

app.delete('/api/blogs/:id', (req, res) => {
  try {
    let blogs = readData(BLOGS_FILE);
    blogs = blogs.filter(b => b.id !== parseInt(req.params.id));
    writeData(BLOGS_FILE, blogs);
    res.json({ message: 'Blog deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete blog' });
  }
});

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

          // 管理者(info@givee.co.jp)宛の通知メール
          const adminMailOptions = {
            from: activeFrom,
            to: 'info@givee.co.jp',
            subject: `【ラクザイ通知】新規リード獲得: ${newLead.company} ${newLead.personName}様`,
            text: `新しい素材ダウンロードがありました。\n\n` +
                  `【会社名】${newLead.company}\n` +
                  `【担当者名】${newLead.personName}\n` +
                  `【メールアドレス】${newLead.email}\n` +
                  `【電話番号】${newLead.phone}\n` +
                  `【月商規模】${newLead.revenue}\n` +
                  `【主な課題】${newLead.challenge}\n` +
                  `【ＵＲＬ】${newLead.storeUrl || '未入力'}\n\n` +
                  `ラクザイの管理画面から詳細を確認してください。`
          };
          await transporter.sendMail(adminMailOptions);
          console.log("管理者への通知メールを送信しました。");
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

// 永続化領域に保存したアップロード画像を提供する
const UPLOADS_PATH = path.join(__dirname, 'data', 'uploads');
if (fs.existsSync(UPLOADS_PATH)) {
  app.use('/uploads', express.static(UPLOADS_PATH));
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
