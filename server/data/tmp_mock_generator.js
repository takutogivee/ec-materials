const fs = require('fs');
const path = require('path');

const ASSETS_FILE = path.join(__dirname, 'assets.json');

// 現在のデータをクリアしてゼロからモックを作るのではなく、一度リセットして必要なモックだけにする
const CATEGORIES = [
  "SNS投稿用",
  "広告 / バナー素材",
  "EC / 商品画像",
  "LP / Webサイト",
  "資料 / プレゼン"
];

const MOCK_TITLES = [
  "送料無料アイコン_レッド", "ポイント10倍バナー", "ランキング1位獲得_王冠エンブレム",
  "母の日特集_ギフトラッピング", "あすつく対応_即日配送マーク", "クーポン獲得_ポップ",
  "お買い物マラソン_買い回り", "プレミアム背景素材_ゴールド", "半額SALEアイコン",
  "チェックマークセット", "年末年始セール告知バナー", "店長のおすすめ",
  "【期間限定】タイムセール", "お気に入り登録ボタン", "サイズ交換無料アイコン",
  "安心の返品保証バナー", "バレンタイン背景", "夏物クリアランスSALE",
  "秋冬新作入荷", "レビュー特典プレゼント", "福袋予約受付中",
  "敬老の日ギフト", "ポイント最大44倍", "在庫わずかアテンション",
  "新商品リリース", "テレビで紹介されました", "月桂樹フレーム",
  "定期購入のご案内", "熨斗(のし)デザイン", "店舗休業日のお知らせ"
];

const TAGS_POOL = [
  "送料無料", "ポイント10倍", "ランキング", "母の日", 
  "SALE", "アイコン", "バナー", "王冠", "ギフト", 
  "あすつく", "お買い物マラソン", "背景", "割引"
];

const TYPES = ["ai", "psd", "png", "jpg", "zip"];

// 確実に表示されるローカル上の既存ダミー画像リスト
const DUMMY_PREVIEWS = [
  "/diet_healthy_food_1775262317341.png",
  "/beauty_skincare_bottle_1775262331871.png",
  "/product_podium_marble_1775262345182.png",
  "/logo.png"
];

const getRandomItem = (arr) => arr[Math.floor(Math.random() * arr.length)];
const getRandomTags = (count) => {
  const shuffled = [...TAGS_POOL].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
};

let newAssets = [];
let startId = 1;

for (let i = 0; i < 30; i++) {
  const type = getRandomItem(TYPES);
  
  const newAsset = {
    id: startId + i,
    url: getRandomItem(DUMMY_PREVIEWS), // 確実に表示されるローカルのアセット
    fileUrl: `/uploads/dummy_file_${startId + i}.${type}`,
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

fs.writeFileSync(ASSETS_FILE, JSON.stringify(newAssets, null, 2), 'utf8');
console.log('Successfully regenerated 30 mock assets with local previews!');
