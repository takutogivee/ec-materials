const fs = require('fs');
const path = require('path');

const ASSETS_FILE = path.join(__dirname, 'assets.json');
const PUBLIC_UPLOADS = path.join(__dirname, '../../public/uploads');

const IMAGE_PATHS = [
  '/Users/murakamitakuto/.gemini/antigravity/brain/dc97e818-310c-4e02-828e-935246a63d0f/rakuten_sale_banner_red_1775282811274.png',
  '/Users/murakamitakuto/.gemini/antigravity/brain/dc97e818-310c-4e02-828e-935246a63d0f/rakuten_crown_ranking_1775282831792.png',
  '/Users/murakamitakuto/.gemini/antigravity/brain/dc97e818-310c-4e02-828e-935246a63d0f/rakuten_shipping_icon_1775282850161.png',
  '/Users/murakamitakuto/.gemini/antigravity/brain/dc97e818-310c-4e02-828e-935246a63d0f/rakuten_recommend_tag_1775282867127.png',
  '/Users/murakamitakuto/.gemini/antigravity/brain/dc97e818-310c-4e02-828e-935246a63d0f/rakuten_mother_day_banner_1775282882600.png',
  '/Users/murakamitakuto/.gemini/antigravity/brain/dc97e818-310c-4e02-828e-935246a63d0f/rakuten_summer_clearance_1775282900424.png',
  '/Users/murakamitakuto/.gemini/antigravity/brain/dc97e818-310c-4e02-828e-935246a63d0f/rakuten_point_multiply_1775282916023.png',
  '/Users/murakamitakuto/.gemini/antigravity/brain/dc97e818-310c-4e02-828e-935246a63d0f/rakuten_winter_sale_1775282934212.png',
  '/Users/murakamitakuto/.gemini/antigravity/brain/dc97e818-310c-4e02-828e-935246a63d0f/rakuten_premium_gold_1775282947440.png',
  '/Users/murakamitakuto/.gemini/antigravity/brain/dc97e818-310c-4e02-828e-935246a63d0f/rakuten_freeshipping_banner_1775282994150.png',
  '/Users/murakamitakuto/.gemini/antigravity/brain/dc97e818-310c-4e02-828e-935246a63d0f/rakuten_new_arrival_1775283011615.png',
  '/Users/murakamitakuto/.gemini/antigravity/brain/dc97e818-310c-4e02-828e-935246a63d0f/rakuten_time_sale_1775283027621.png',
  '/Users/murakamitakuto/.gemini/antigravity/brain/dc97e818-310c-4e02-828e-935246a63d0f/rakuten_gift_wrapping_1775283041896.png',
  '/Users/murakamitakuto/.gemini/antigravity/brain/dc97e818-310c-4e02-828e-935246a63d0f/rakuten_review_campaign_1775283062814.png',
  '/Users/murakamitakuto/.gemini/antigravity/brain/dc97e818-310c-4e02-828e-935246a63d0f/rakuten_app_download_1775283080334.png',
  '/Users/murakamitakuto/.gemini/antigravity/brain/dc97e818-310c-4e02-828e-935246a63d0f/rakuten_half_price_1775283093983.png',
  '/Users/murakamitakuto/.gemini/antigravity/brain/dc97e818-310c-4e02-828e-935246a63d0f/rakuten_limited_edition_1775283110116.png',
  '/Users/murakamitakuto/.gemini/antigravity/brain/dc97e818-310c-4e02-828e-935246a63d0f/rakuten_special_price_1775283127601.png',
  '/Users/murakamitakuto/.gemini/antigravity/brain/dc97e818-310c-4e02-828e-935246a63d0f/rakuten_bargain_festival_1775283144982.png',
  '/Users/murakamitakuto/.gemini/antigravity/brain/dc97e818-310c-4e02-828e-935246a63d0f/rakuten_store_pick_1775283164762.png'
];

const MOCK_TITLES = [
  "赤金大セールバナー", "ランキング1位_王冠", "送料無料トラック_緑",
  "店長のおすすめタグ", "母の日_カーネーション", "サマークリアランス波",
  "ポイント最大倍キャンペーン", "ウィンターセール_雪", "プレミアム背景_ゴールド",
  "送料無料バナー_飛行機", "新着アイテム_ポップ", "タイムセール_タイマー",
  "無料ギフトラッピング", "レビューを書いて特典ゲット", "アプリダウンロード",
  "半額・50%OFF爆発", "リミテッドエディション_黒金", "スペシャルプライス_柄",
  "お祭りセール_提灯", "店舗受け取りOK"
];

const CATEGORIES = [
  "SNS投稿用", "広告 / バナー素材", "EC / 商品画像", "LP / Webサイト", "資料 / プレゼン"
];
const TAGS_POOL = [
  "送料無料", "ポイント10倍", "ランキング", "母の日", 
  "SALE", "アイコン", "バナー", "王冠", "ギフト", 
  "あすつく", "お買い物マラソン", "背景", "割引"
];
const TYPES = ["ai", "psd", "png", "jpg", "zip"];

const getRandomItem = (arr) => arr[Math.floor(Math.random() * arr.length)];
const getRandomTags = (count) => {
  const shuffled = [...TAGS_POOL].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
};

let newAssets = [];
let startId = 100; // ID重複を避けるために100からスタート

if (!fs.existsSync(PUBLIC_UPLOADS)) {
  fs.mkdirSync(PUBLIC_UPLOADS, { recursive: true });
}

for (let i = 0; i < IMAGE_PATHS.length; i++) {
  const sourcePath = IMAGE_PATHS[i];
  if (!fs.existsSync(sourcePath)) continue;
  
  const fileName = path.basename(sourcePath);
  const destPath = path.join(PUBLIC_UPLOADS, fileName);
  
  // ファイルコピー
  fs.copyFileSync(sourcePath, destPath);
  
  const type = getRandomItem(TYPES);
  
  const newAsset = {
    id: startId + i,
    url: `/uploads/${fileName}`,
    fileUrl: `/uploads/${fileName}`,
    title: MOCK_TITLES[i] || `ダミー素材_${i+1}`,
    category: getRandomItem(CATEGORIES),
    tags: getRandomTags(3),
    type: type,
    resolution: "Original",
    downloads: Math.floor(Math.random() * 1000),
    creator: "Rakuzai Official"
  };
  
  newAssets.push(newAsset);
}

// 既存のデータを上書きして、今回の20件だけにします
fs.writeFileSync(ASSETS_FILE, JSON.stringify(newAssets, null, 2), 'utf8');
console.log(`Successfully regenerated ${newAssets.length} real 20 assets with copied physical files!`);
