// ==========================================
// グローバル変数・定数
// ==========================================

const API_BASE = '/api';
let currentPage = 'home';
let currentConsultation = null;
let staffList = [];
let phrasesByCategory = {};
let consultations = [];
let currentFilter = {};
let deferredPrompt = null; // PWAインストールプロンプト

// ページ履歴管理（スワイプナビゲーション用）
let pageHistory = ['home'];
let historyIndex = 0;

// 依存症種類の定義
const ADDICTION_TYPES = [
  'アルコール依存',
  '薬物依存',
  'ギャンブル依存',
  'ゲーム依存',
  'ネット・スマホ依存',
  '処方薬・市販薬依存',
  '窃盗（クレプトマニア）',
  '性依存',
  '共依存',
  '食行動の問題',
  'その他'
];

// 相談フェーズの定義
const PHASES = [
  '第1段階：初期対応（オープニング）',
  '第2段階：情報収集（傾聴・共感）',
  '第3段階：状況確認（アセスメント）',
  '第4段階：提案・説明（情報提供）',
  '第5段階：次のステップ（行動計画）',
  '第6段階：終了・フォローアップ（クロージング）'
];

// フェーズ名マッピング（UI表示名 → DB保存名）
const PHASE_MAPPING = {
  '第1段階：初期対応（オープニング）': '初期対応',
  '第2段階：情報収集（傾聴・共感）': '情報収集',
  '第3段階：状況確認（アセスメント）': '状況確認',
  '第4段階：提案・説明（情報提供）': '提案・説明',
  '第5段階：次のステップ（行動計画）': '次のステップ',
  '第6段階：終了・フォローアップ（クロージング）': '終了・フォローアップ'
};

// DB保存名 → UI表示名の逆マッピング
const PHASE_REVERSE_MAPPING = {
  '初期対応': '第1段階：初期対応（オープニング）',
  '情報収集': '第2段階：情報収集（傾聴・共感）',
  '状況確認': '第3段階：状況確認（アセスメント）',
  '提案・説明': '第4段階：提案・説明（情報提供）',
  '次のステップ': '第5段階：次のステップ（行動計画）',
  '終了・フォローアップ': '第6段階：終了・フォローアップ（クロージング）'
};

// カテゴリ名マッピング（DB保存名 → UI表示名）
const CATEGORY_DISPLAY_NAMES = {
  'opening': '第1段階：初期対応（オープニング）',
  'listening': '第2段階：情報収集（傾聴・共感）',
  'assessment': '第3段階：状況確認（アセスメント）',
  'information': '第4段階：提案・説明（情報提供）',
  'next_steps': '第5段階：次のステップ（行動計画）',
  'closing': '第6段階：終了・フォローアップ（クロージング）',
  'emergency': '緊急対応（クライシス）'
};

// ==========================================
// PWA機能
// ==========================================

// PWAインストールプロンプトをキャプチャ
window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredPrompt = e;
  console.log('📱 PWAインストール可能');
  showInstallButton();
});

// インストールボタンを表示
function showInstallButton() {
  const installSection = document.getElementById('pwa-install-section');
  if (installSection && deferredPrompt) {
    installSection.style.display = 'block';
  }
}

// PWAインストール実行
async function installPWA() {
  if (!deferredPrompt) {
    alert('このアプリは既にインストールされているか、インストールできません。');
    return;
  }
  
  deferredPrompt.prompt();
  const { outcome } = await deferredPrompt.userChoice;
  
  if (outcome === 'accepted') {
    console.log('✅ PWAインストール成功');
    showSuccess('アプリをインストールしました！');
  } else {
    console.log('❌ PWAインストールキャンセル');
  }
  
  deferredPrompt = null;
}

// オンライン/オフライン状態の監視
window.addEventListener('online', () => {
  console.log('✅ オンラインに復帰');
  hideOfflineBanner();
  showSuccess('インターネット接続が回復しました');
});

window.addEventListener('offline', () => {
  console.log('⚠️ オフラインになりました');
  showOfflineBanner();
});

// オフラインバナー表示
function showOfflineBanner() {
  let banner = document.getElementById('offline-banner');
  if (!banner) {
    banner = document.createElement('div');
    banner.id = 'offline-banner';
    banner.className = 'offline-banner';
    banner.innerHTML = '<i class="fas fa-wifi" style="margin-right: 8px;"></i>オフラインモードです';
    document.body.prepend(banner);
  }
}

// オフラインバナー非表示
function hideOfflineBanner() {
  const banner = document.getElementById('offline-banner');
  if (banner) {
    banner.remove();
  }
}

// ==========================================
// 初期化
// ==========================================

document.addEventListener('DOMContentLoaded', async () => {
  await initApp();
  
  // 初期オフラインチェック
  if (!navigator.onLine) {
    showOfflineBanner();
  }
});

async function initApp() {
  try {
    // スタッフリストとフレーズを読み込み
    await Promise.all([
      loadStaffList(),
      loadPhrases()
    ]);
    
    // ホーム画面を表示
    await showHomePage();
  } catch (error) {
    console.error('初期化エラー:', error);
    showError('アプリケーションの初期化に失敗しました');
  }
}

// ==========================================
// データ取得関数
// ==========================================

async function loadStaffList() {
  try {
    const response = await fetch(`${API_BASE}/staff`);
    if (!response.ok) throw new Error('スタッフリスト取得失敗');
    const data = await response.json();
    staffList = data.staff || [];
  } catch (error) {
    console.error('スタッフリスト取得エラー:', error);
    showError('スタッフリストの読み込みに失敗しました');
  }
}

async function loadPhrases() {
  try {
    const response = await fetch(`${API_BASE}/phrases`);
    if (!response.ok) throw new Error('フレーズ取得失敗');
    const data = await response.json();
    const phrases = data.phrases || [];
    
    // カテゴリ別にグループ化
    phrasesByCategory = {};
    phrases.forEach(phrase => {
      if (!phrasesByCategory[phrase.category]) {
        phrasesByCategory[phrase.category] = {};
      }
      if (!phrasesByCategory[phrase.category][phrase.phase]) {
        phrasesByCategory[phrase.category][phrase.phase] = [];
      }
      phrasesByCategory[phrase.category][phrase.phase].push(phrase);
    });
  } catch (error) {
    console.error('フレーズ取得エラー:', error);
    showError('対応フレーズの読み込みに失敗しました');
  }
}

async function loadStats() {
  try {
    const response = await fetch(`${API_BASE}/stats/dashboard`);
    if (!response.ok) throw new Error('統計取得失敗');
    return await response.json();
  } catch (error) {
    console.error('統計取得エラー:', error);
    return {
      today: 0,
      inProgress: 0,
      pending: 0,
      avgDuration: 0
    };
  }
}

async function loadConsultations(page = 1, limit = 20) {
  try {
    const response = await fetch(`${API_BASE}/consultations?page=${page}&limit=${limit}`);
    if (!response.ok) throw new Error('相談履歴取得失敗');
    const data = await response.json();
    consultations = data.consultations || [];
    return data;
  } catch (error) {
    console.error('相談履歴取得エラー:', error);
    return { consultations: [], total: 0, page: 1, limit: 20 };
  }
}

async function searchConsultations(params) {
  try {
    const query = new URLSearchParams(params).toString();
    const response = await fetch(`${API_BASE}/consultations/search?${query}`);
    if (!response.ok) throw new Error('検索失敗');
    return await response.json();
  } catch (error) {
    console.error('検索エラー:', error);
    showError('検索に失敗しました');
    return { consultations: [], total: 0 };
  }
}

async function saveConsultation(data) {
  try {
    const response = await fetch(`${API_BASE}/consultations`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    
    if (!response.ok) throw new Error('保存失敗');
    return await response.json();
  } catch (error) {
    console.error('保存エラー:', error);
    showError('データの保存に失敗しました');
    throw error;
  }
}

// ==========================================
// ヘッダー共通コンポーネント
// ==========================================

function renderHeader(title = 'ホーム', showBack = false) {
  // PWAモード判定（standalone表示モード）
  const isPWA = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone;
  const topPadding = isPWA ? '88px' : '16px'; // PWA時は上部に2cm（約76px≒88px）追加
  
  return `
    <header style="background: #1e40af; color: white; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
      <div style="max-width: 480px; margin: 0 auto; padding: ${topPadding} 20px 16px 20px;">
        <div style="display: flex; justify-content: space-between; align-items: flex-start;">
          ${!showBack ? `
            <!-- ホーム画面：左側タイトル、右側電話番号 -->
            <div>
              <h1 style="font-size: 26px; font-weight: 800; margin: 0; line-height: 1.2; letter-spacing: -0.3px;">相模原ダルク</h1>
              <p style="font-size: 14px; margin: 4px 0 0 0; font-weight: 400; opacity: 0.95; letter-spacing: 0.3px;">電話対応支援システム</p>
            </div>
            <div style="text-align: right; font-size: 11px; line-height: 1.5; white-space: nowrap;">
              <p style="margin: 0; font-weight: 600;">TEL: 042-707-0391</p>
              <p style="margin: 2px 0 0 0; opacity: 0.95; font-weight: 400;">平日 9:00-17:00</p>
              <p style="margin: 0; opacity: 0.95; font-weight: 400;">土祝日 9:00-12:00</p>
            </div>
          ` : `
            <!-- サブ画面：戻るボタン + タイトル -->
            <button onclick="goBack()" style="background: none; border: none; color: white; font-size: 24px; cursor: pointer; padding: 0; margin-right: 12px;">←</button>
            <div style="flex: 1;">
              <h1 style="font-size: 22px; font-weight: 700; margin: 0; line-height: 1.3;">${title}</h1>
            </div>
          `}
        </div>
      </div>
    </header>
  `;
}

// ==========================================
// フッター共通コンポーネント
// ==========================================

function renderFooter() {
  return `
    <footer style="background: #1f2937; color: white; margin-top: 24px; padding: 32px 0;">
      <div style="max-width: 800px; margin: 0 auto; padding: 0 20px; text-align: center;">
        <p style="font-size: 14px; margin: 0; line-height: 1.6; white-space: nowrap;">© 2026 一般社団法人相模原ダルク - 電話対応支援システム</p>
        <p style="font-size: 17px; font-weight: 600; margin: 12px 0 0 0; line-height: 1.4;">人は必ずやり直せる--</p>
        <p style="font-size: 17px; color: #93c5fd; font-weight: 500; margin: 8px 0 0 0; line-height: 1.6;">--相模原ダルクの挑戦--</p>
      </div>
    </footer>
  `;
}

// ==========================================
// ホーム画面
// ==========================================

async function showHomePage() {
  currentPage = 'home';
  
  // 統計データを取得
  const stats = await loadStats();
  
  const app = document.getElementById('app');
  app.innerHTML = `
    ${renderHeader('ホーム', false)}
    
    <main style="max-width: 480px; margin: 0 auto; padding: 16px;">
      <!-- 機能メニュー -->
      <div style="margin-bottom: 20px;">
        <!-- 新規相談受付 -->
        <div onclick="navigateToPage('new-consultation')" style="background: white; border-radius: 20px; padding: 20px; margin-bottom: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.08); cursor: pointer; display: flex; align-items: center;">
          <div style="width: 60px; height: 60px; border-radius: 16px; background: linear-gradient(135deg, #3b82f6, #2563eb); display: flex; align-items: center; justify-content: center; font-size: 28px; flex-shrink: 0;">📞</div>
          <div style="flex: 1; margin-left: 16px;">
            <h3 style="margin: 0; font-size: 18px; font-weight: 700; color: #1f2937;">新規相談受付</h3>
            <p style="margin: 4px 0 0 0; font-size: 14px; color: #6b7280;">電話対応を開始</p>
          </div>
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" style="flex-shrink: 0; margin-left: 16px;">
            <path d="M7 4L13 10L7 16" stroke="#9ca3af" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </div>
        
        <!-- 相談履歴 -->
        <div onclick="navigateToPage('history')" style="background: white; border-radius: 20px; padding: 20px; margin-bottom: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.08); cursor: pointer; display: flex; align-items: center;">
          <div style="width: 60px; height: 60px; border-radius: 16px; background: linear-gradient(135deg, #10b981, #059669); display: flex; align-items: center; justify-content: center; font-size: 28px; flex-shrink: 0;">🕐</div>
          <div style="flex: 1; margin-left: 16px;">
            <h3 style="margin: 0; font-size: 18px; font-weight: 700; color: #1f2937;">相談履歴</h3>
            <p style="margin: 4px 0 0 0; font-size: 14px; color: #6b7280;">過去の相談記録を確認</p>
          </div>
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" style="flex-shrink: 0; margin-left: 16px;">
            <path d="M7 4L13 10L7 16" stroke="#9ca3af" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </div>
        
        <!-- 統計情報 -->
        <div onclick="navigateToPage('stats')" style="background: white; border-radius: 20px; padding: 20px; margin-bottom: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.08); cursor: pointer; display: flex; align-items: center;">
          <div style="width: 60px; height: 60px; border-radius: 16px; background: linear-gradient(135deg, #8b5cf6, #7c3aed); display: flex; align-items: center; justify-content: center; font-size: 28px; flex-shrink: 0;">📊</div>
          <div style="flex: 1; margin-left: 16px;">
            <h3 style="margin: 0; font-size: 18px; font-weight: 700; color: #1f2937;">統計情報</h3>
            <p style="margin: 4px 0 0 0; font-size: 14px; color: #6b7280;">データ分析とレポート</p>
          </div>
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" style="flex-shrink: 0; margin-left: 16px;">
            <path d="M7 4L13 10L7 16" stroke="#9ca3af" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </div>
        
        <!-- 対応マニュアル -->
        <div onclick="navigateToPage('manual')" style="background: white; border-radius: 20px; padding: 20px; margin-bottom: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.08); cursor: pointer; display: flex; align-items: center;">
          <div style="width: 60px; height: 60px; border-radius: 16px; background: linear-gradient(135deg, #f59e0b, #d97706); display: flex; align-items: center; justify-content: center; font-size: 28px; flex-shrink: 0;">📖</div>
          <div style="flex: 1; margin-left: 16px;">
            <h3 style="margin: 0; font-size: 18px; font-weight: 700; color: #1f2937;">対応マニュアル</h3>
            <p style="margin: 4px 0 0 0; font-size: 14px; color: #6b7280;">フレーズ集と対応例</p>
          </div>
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" style="flex-shrink: 0; margin-left: 16px;">
            <path d="M7 4L13 10L7 16" stroke="#9ca3af" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </div>
      </div>
      
      <!-- PWAインストールボタン（インストール可能な場合のみ表示） -->
      <div id="pwa-install-section" style="display: none; margin-bottom: 20px;">
        <div onclick="installPWA()" style="background: linear-gradient(135deg, #10b981, #059669); border-radius: 20px; padding: 20px; box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3); cursor: pointer; display: flex; align-items: center; color: white;">
          <div style="width: 60px; height: 60px; border-radius: 16px; background: rgba(255,255,255,0.2); display: flex; align-items: center; justify-content: center; font-size: 32px; flex-shrink: 0;">📲</div>
          <div style="flex: 1; margin-left: 16px;">
            <h3 style="margin: 0; font-size: 18px; font-weight: 700; color: white;">アプリをインストール</h3>
            <p style="margin: 4px 0 0 0; font-size: 14px; color: rgba(255,255,255,0.9);">ホーム画面に追加してすぐアクセス</p>
          </div>
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" style="flex-shrink: 0; margin-left: 16px;">
            <path d="M10 3V13M10 13L6 9M10 13L14 9M3 17H17" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </div>
      </div>
      
      <!-- 管理・マニュアル（フッター拡大版・横並び） -->
      <div style="margin-bottom: 20px; padding: 32px 20px; background: #f8fafc; border-radius: 20px; border-top: 4px solid #1e40af;">
        <h3 style="margin: 0 0 24px 0; font-size: 20px; font-weight: 700; color: #1e40af; text-align: center;">📚 管理・マニュアル</h3>
        
        <!-- 横並びコンテナ -->
        <div style="display: flex; gap: 16px; justify-content: space-between;">
          <!-- スタッフ管理マニュアル -->
          <div onclick="window.open('https://github.com/hiderock84-sys/sagamihara-darc-philosophy/blob/main/STAFF_MANAGEMENT.md', '_blank')" style="flex: 1; background: white; border-radius: 16px; padding: 20px 16px; box-shadow: 0 2px 8px rgba(0,0,0,0.08); cursor: pointer; display: flex; flex-direction: column; align-items: center; text-align: center; transition: transform 0.2s, box-shadow 0.2s;">
            <div style="width: 56px; height: 56px; border-radius: 14px; background: linear-gradient(135deg, #06b6d4, #0891b2); display: flex; align-items: center; justify-content: center; font-size: 28px; margin-bottom: 12px;">👥</div>
            <h4 style="margin: 0; font-size: 15px; font-weight: 600; color: #1f2937; line-height: 1.4;">スタッフ<br/>管理マニュアル</h4>
          </div>
          
          <!-- プロジェクトREADME -->
          <div onclick="window.open('https://github.com/hiderock84-sys/sagamihara-darc-philosophy/blob/main/README.md', '_blank')" style="flex: 1; background: white; border-radius: 16px; padding: 20px 16px; box-shadow: 0 2px 8px rgba(0,0,0,0.08); cursor: pointer; display: flex; flex-direction: column; align-items: center; text-align: center; transition: transform 0.2s, box-shadow 0.2s;">
            <div style="width: 56px; height: 56px; border-radius: 14px; background: linear-gradient(135deg, #ec4899, #db2777); display: flex; align-items: center; justify-content: center; font-size: 28px; margin-bottom: 12px;">📄</div>
            <h4 style="margin: 0; font-size: 15px; font-weight: 600; color: #1f2937; line-height: 1.4;">プロジェクト<br/>説明書</h4>
          </div>
          
          <!-- GitHubリポジトリ -->
          <div onclick="window.open('https://github.com/hiderock84-sys/sagamihara-darc-philosophy', '_blank')" style="flex: 1; background: white; border-radius: 16px; padding: 20px 16px; box-shadow: 0 2px 8px rgba(0,0,0,0.08); cursor: pointer; display: flex; flex-direction: column; align-items: center; text-align: center; transition: transform 0.2s, box-shadow 0.2s;">
            <div style="width: 56px; height: 56px; border-radius: 14px; background: linear-gradient(135deg, #6366f1, #4f46e5); display: flex; align-items: center; justify-content: center; font-size: 28px; margin-bottom: 12px;">💻</div>
            <h4 style="margin: 0; font-size: 15px; font-weight: 600; color: #1f2937; line-height: 1.4;">GitHub<br/>リポジトリ</h4>
          </div>
        </div>
      </div>
      
      <!-- 本日の概要 -->
      <div style="background: white; border-radius: 20px; padding: 20px; box-shadow: 0 2px 8px rgba(0,0,0,0.08);">
        <h3 style="margin: 0 0 16px 0; font-size: 18px; font-weight: 700; color: #1f2937;">本日の概要</h3>
        <div style="display: flex; gap: 1px; background: #e5e7eb; border-radius: 12px; overflow: hidden;">
          <div style="flex: 1; background: white; padding: 16px; text-align: center;">
            <p style="margin: 0; font-size: 26px; font-weight: 800; color: #3b82f6;">${stats.today || 0}</p>
            <p style="margin: 4px 0 0 0; font-size: 11px; color: #6b7280; font-weight: 500;">本日の相談</p>
          </div>
          <div style="flex: 1; background: white; padding: 16px; text-align: center;">
            <p style="margin: 0; font-size: 26px; font-weight: 800; color: #10b981;">${stats.inProgress || 0}</p>
            <p style="margin: 4px 0 0 0; font-size: 11px; color: #6b7280; font-weight: 500;">対応中</p>
          </div>
          <div style="flex: 1; background: white; padding: 16px; text-align: center;">
            <p style="margin: 0; font-size: 26px; font-weight: 800; color: #f59e0b;">${stats.pending || 0}</p>
            <p style="margin: 4px 0 0 0; font-size: 11px; color: #6b7280; font-weight: 500;">未完了</p>
          </div>
          <div style="flex: 1; background: white; padding: 16px; text-align: center;">
            <p style="margin: 0; font-size: 26px; font-weight: 800; color: #8b5cf6;">${stats.avgDuration || 0}</p>
            <p style="margin: 4px 0 0 0; font-size: 11px; color: #6b7280; font-weight: 500;">平均時間(分)</p>
          </div>
        </div>
      </div>
    </main>
    
    ${renderFooter()}
  `;
}

// ==========================================
// 新規相談受付画面
// ==========================================

function showNewConsultation() {
  currentPage = 'new-consultation';
  currentConsultation = {
    caller_name: '',
    caller_phone: '',
    caller_relationship: '',
    target_name: '',
    target_age: null,
    target_gender: '',
    addiction_type: '',
    urgency_level: '中',
    phases: {},
    staff_id: staffList[0]?.id || null
  };
  
  const app = document.getElementById('app');
  app.innerHTML = `
    ${renderHeader('新規相談受付', true)}
    
    <main style="max-width: 480px; margin: 0 auto; padding: 16px;">
      <!-- 基本情報入力 -->
      <div style="background: white; border-radius: 16px; padding: 20px; margin-bottom: 16px; box-shadow: 0 2px 8px rgba(0,0,0,0.06);">
        <h3 style="margin: 0 0 16px 0; font-size: 18px; font-weight: 700; color: #1f2937; border-bottom: 2px solid #3b82f6; padding-bottom: 8px;">基本情報</h3>
        
        <div style="margin-bottom: 16px;">
          <label style="display: block; margin-bottom: 6px; font-size: 14px; font-weight: 600; color: #374151;">対応スタッフ <span style="color: #ef4444;">*</span></label>
          <select id="staff_id" onchange="updateConsultationField('staff_id', this.value)" style="width: 100%; padding: 12px; border: 2px solid #e5e7eb; border-radius: 8px; font-size: 16px; background: white;">
            ${staffList.map(staff => `<option value="${staff.id}" ${staff.id === currentConsultation.staff_id ? 'selected' : ''}>${staff.name}</option>`).join('')}
          </select>
        </div>
        
        <div style="margin-bottom: 16px;">
          <label style="display: block; margin-bottom: 6px; font-size: 14px; font-weight: 600; color: #374151;">相談者氏名 <span style="color: #ef4444;">*</span></label>
          <input type="text" id="caller_name" onchange="updateConsultationField('caller_name', this.value)" placeholder="例: 田中太郎" style="width: 100%; padding: 12px; border: 2px solid #e5e7eb; border-radius: 8px; font-size: 16px;">
        </div>
        
        <div style="margin-bottom: 16px;">
          <label style="display: block; margin-bottom: 6px; font-size: 14px; font-weight: 600; color: #374151;">連絡先電話番号</label>
          <input type="tel" id="caller_phone" onchange="updateConsultationField('caller_phone', this.value)" placeholder="例: 090-1234-5678" style="width: 100%; padding: 12px; border: 2px solid #e5e7eb; border-radius: 8px; font-size: 16px;">
        </div>
        
        <div style="margin-bottom: 16px;">
          <label style="display: block; margin-bottom: 6px; font-size: 14px; font-weight: 600; color: #374151;">ご本人との関係 <span style="color: #ef4444;">*</span></label>
          <select id="caller_relationship" onchange="updateConsultationField('caller_relationship', this.value)" style="width: 100%; padding: 12px; border: 2px solid #e5e7eb; border-radius: 8px; font-size: 16px; background: white;">
            <option value="">選択してください</option>
            <option value="本人">本人</option>
            <option value="家族">家族</option>
            <option value="友人">友人</option>
            <option value="医療関係者">医療関係者</option>
            <option value="その他">その他</option>
          </select>
        </div>
      </div>
      
      <!-- 対象者情報 -->
      <div style="background: white; border-radius: 16px; padding: 20px; margin-bottom: 16px; box-shadow: 0 2px 8px rgba(0,0,0,0.06);">
        <h3 style="margin: 0 0 16px 0; font-size: 18px; font-weight: 700; color: #1f2937; border-bottom: 2px solid #10b981; padding-bottom: 8px;">対象者情報</h3>
        
        <div style="margin-bottom: 16px;">
          <label style="display: block; margin-bottom: 6px; font-size: 14px; font-weight: 600; color: #374151;">氏名</label>
          <input type="text" id="target_name" onchange="updateConsultationField('target_name', this.value)" placeholder="例: 田中花子" style="width: 100%; padding: 12px; border: 2px solid #e5e7eb; border-radius: 8px; font-size: 16px;">
        </div>
        
        <div style="display: flex; gap: 12px; margin-bottom: 16px;">
          <div style="flex: 1;">
            <label style="display: block; margin-bottom: 6px; font-size: 14px; font-weight: 600; color: #374151;">年齢</label>
            <input type="number" id="target_age" onchange="updateConsultationField('target_age', this.value)" placeholder="例: 35" style="width: 100%; padding: 12px; border: 2px solid #e5e7eb; border-radius: 8px; font-size: 16px;">
          </div>
          <div style="flex: 1;">
            <label style="display: block; margin-bottom: 6px; font-size: 14px; font-weight: 600; color: #374151;">性別</label>
            <select id="target_gender" onchange="updateConsultationField('target_gender', this.value)" style="width: 100%; padding: 12px; border: 2px solid #e5e7eb; border-radius: 8px; font-size: 16px; background: white;">
              <option value="">選択</option>
              <option value="男性">男性</option>
              <option value="女性">女性</option>
              <option value="その他">その他</option>
            </select>
          </div>
        </div>
        
        <div style="margin-bottom: 16px;">
          <label style="display: block; margin-bottom: 6px; font-size: 14px; font-weight: 600; color: #374151;">依存症の種類 <span style="color: #ef4444;">*</span></label>
          <select id="addiction_type" onchange="updateConsultationField('addiction_type', this.value)" style="width: 100%; padding: 12px; border: 2px solid #e5e7eb; border-radius: 8px; font-size: 16px; background: white;">
            <option value="">選択してください</option>
            ${ADDICTION_TYPES.map(type => `<option value="${type}">${type}</option>`).join('')}
          </select>
        </div>
        
        <div style="margin-bottom: 16px;">
          <label style="display: block; margin-bottom: 6px; font-size: 14px; font-weight: 600; color: #374151;">緊急度 <span style="color: #ef4444;">*</span></label>
          <select id="urgency_level" onchange="updateConsultationField('urgency_level', this.value)" style="width: 100%; padding: 12px; border: 2px solid #e5e7eb; border-radius: 8px; font-size: 16px; background: white;">
            <option value="低">低 - 情報収集</option>
            <option value="中" selected>中 - 一般的な相談</option>
            <option value="高">高 - 緊急対応必要</option>
          </select>
        </div>
      </div>
      
      <!-- 相談フェーズ -->
      <div id="phases-container" style="margin-bottom: 16px;">
        ${renderPhases()}
      </div>
      
      <!-- 保存ボタン -->
      <div style="position: sticky; bottom: 16px; z-index: 100;">
        <button onclick="saveConsultationData()" style="width: 100%; padding: 16px; background: linear-gradient(135deg, #3b82f6, #2563eb); color: white; border: none; border-radius: 12px; font-size: 18px; font-weight: 700; cursor: pointer; box-shadow: 0 4px 12px rgba(59,130,246,0.3);">
          相談内容を保存
        </button>
      </div>
    </main>
  `;
}

function renderPhases() {
  return `
    <div style="background: white; border-radius: 16px; padding: 20px; box-shadow: 0 2px 8px rgba(0,0,0,0.06);">
      <h3 style="margin: 0 0 16px 0; font-size: 18px; font-weight: 700; color: #1f2937; border-bottom: 2px solid #8b5cf6; padding-bottom: 8px;">対応フェーズ</h3>
      
      ${PHASES.map((phase, index) => `
        <div style="margin-bottom: 20px; ${index === PHASES.length - 1 ? '' : 'border-bottom: 1px solid #e5e7eb; padding-bottom: 20px;'}">
          <div style="display: flex; align-items: center; margin-bottom: 12px;">
            <div style="width: 32px; height: 32px; border-radius: 50%; background: linear-gradient(135deg, #8b5cf6, #7c3aed); color: white; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 14px; flex-shrink: 0;">${index + 1}</div>
            <h4 style="margin: 0 0 0 12px; font-size: 16px; font-weight: 700; color: #1f2937;">${phase}</h4>
          </div>
          
          <div style="margin-bottom: 12px;">
            <label style="display: block; margin-bottom: 6px; font-size: 13px; font-weight: 600; color: #6b7280;">対応内容</label>
            <textarea id="phase_${index}_content" onchange="updatePhaseField('${phase}', 'content', this.value)" placeholder="この段階での対応内容を記録..." style="width: 100%; min-height: 80px; padding: 12px; border: 2px solid #e5e7eb; border-radius: 8px; font-size: 14px; resize: vertical;"></textarea>
          </div>
          
          <div>
            <label style="display: block; margin-bottom: 6px; font-size: 13px; font-weight: 600; color: #6b7280;">使用フレーズ</label>
            <select onchange="addPhraseToPhase('${phase}', this.value); this.value='';" style="width: 100%; padding: 10px; border: 2px solid #e5e7eb; border-radius: 8px; font-size: 14px; background: white;">
              <option value="">よく使うフレーズを選択...</option>
              ${Object.keys(phrasesByCategory).map(category => {
                const dbPhase = PHASE_MAPPING[phase] || phase;
                return phrasesByCategory[category][dbPhase] ? 
                  `<optgroup label="${category}">
                    ${phrasesByCategory[category][dbPhase].map(p => `<option value="${p.id}">${p.phrase_text.substring(0, 50)}...</option>`).join('')}
                  </optgroup>` : '';
              }).join('')}
            </select>
            <div id="phase_${index}_phrases" style="margin-top: 8px;"></div>
          </div>
        </div>
      `).join('')}
    </div>
  `;
}

function updateConsultationField(field, value) {
  currentConsultation[field] = value;
}

function updatePhaseField(phase, field, value) {
  if (!currentConsultation.phases[phase]) {
    currentConsultation.phases[phase] = { content: '', phrases: [] };
  }
  currentConsultation.phases[phase][field] = value;
}

function addPhraseToPhase(phase, phraseId) {
  if (!phraseId) return;
  
  // フレーズIDから実際のフレーズテキストを取得
  let phraseText = '';
  Object.values(phrasesByCategory).forEach(categories => {
    Object.values(categories).forEach(phrases => {
      const found = phrases.find(p => p.id == phraseId);
      if (found) phraseText = found.phrase_text;
    });
  });
  
  if (!currentConsultation.phases[phase]) {
    currentConsultation.phases[phase] = { content: '', phrases: [] };
  }
  
  if (!currentConsultation.phases[phase].phrases) {
    currentConsultation.phases[phase].phrases = [];
  }
  
  currentConsultation.phases[phase].phrases.push(phraseId);
  
  // フレーズ表示エリアに追加
  const phaseIndex = PHASES.indexOf(phase);
  const container = document.getElementById(`phase_${phaseIndex}_phrases`);
  const phraseDiv = document.createElement('div');
  phraseDiv.style.cssText = 'background: #f3f4f6; padding: 8px 12px; border-radius: 6px; margin-top: 6px; font-size: 13px; color: #374151; display: flex; justify-content: space-between; align-items: center;';
  phraseDiv.innerHTML = `
    <span style="flex: 1;">${phraseText}</span>
    <button onclick="this.parentElement.remove();" style="background: #ef4444; color: white; border: none; border-radius: 4px; padding: 4px 8px; font-size: 11px; cursor: pointer;">削除</button>
  `;
  container.appendChild(phraseDiv);
}

async function saveConsultationData() {
  // 二重クリック防止
  if (window.isSaving) {
    return;
  }
  
  // バリデーション
  if (!currentConsultation.caller_name) {
    showError('相談者氏名を入力してください');
    return;
  }
  
  if (!currentConsultation.caller_relationship) {
    showError('ご本人との関係を選択してください');
    return;
  }
  
  if (!currentConsultation.addiction_type) {
    showError('依存症の種類を選択してください');
    return;
  }
  
  try {
    // 保存中フラグを立てる
    window.isSaving = true;
    
    // データ整形
    const dataToSave = {
      ...currentConsultation,
      target_age: currentConsultation.target_age ? parseInt(currentConsultation.target_age) : null,
      phases: JSON.stringify(currentConsultation.phases),
      status: 'completed'
    };
    
    // 保存
    await saveConsultation(dataToSave);
    
    // 成功メッセージ
    showSuccess('相談内容を保存しました');
    
    // 2秒後にホーム画面へ
    setTimeout(() => {
      window.isSaving = false;
      showHomePage();
    }, 2000);
    
  } catch (error) {
    console.error('保存エラー:', error);
    showError('保存に失敗しました');
    window.isSaving = false;
  }
}

// ==========================================
// 相談履歴画面
// ==========================================

async function showHistory() {
  currentPage = 'history';
  currentFilter = {};
  
  const data = await loadConsultations(1, 20);
  
  const app = document.getElementById('app');
  app.innerHTML = `
    ${renderHeader('相談履歴', true)}
    
    <main style="max-width: 480px; margin: 0 auto; padding: 16px;">
      <!-- 検索フィルター -->
      <div style="background: white; border-radius: 16px; padding: 20px; margin-bottom: 16px; box-shadow: 0 2px 8px rgba(0,0,0,0.06);">
        <h3 style="margin: 0 0 16px 0; font-size: 16px; font-weight: 700; color: #1f2937;">検索フィルター</h3>
        
        <div style="display: flex; gap: 8px; margin-bottom: 12px;">
          <input type="text" id="search_name" placeholder="氏名で検索..." style="flex: 1; padding: 10px; border: 2px solid #e5e7eb; border-radius: 8px; font-size: 14px;">
          <select id="search_addiction" style="flex: 1; padding: 10px; border: 2px solid #e5e7eb; border-radius: 8px; font-size: 14px; background: white;">
            <option value="">すべての依存症</option>
            ${ADDICTION_TYPES.map(type => `<option value="${type}">${type}</option>`).join('')}
          </select>
        </div>
        
        <div style="display: flex; gap: 8px; margin-bottom: 12px;">
          <select id="search_caller_age" style="flex: 1; padding: 10px; border: 2px solid #e5e7eb; border-radius: 8px; font-size: 14px; background: white;">
            <option value="">本人年齢（全て）</option>
            <option value="0-19">未成年（0〜19歳）</option>
            <option value="20-29">20代（20〜29歳）</option>
            <option value="30-49">30〜40代（30〜49歳）</option>
            <option value="50-999">50歳以上</option>
          </select>
          <select id="search_family_age" style="flex: 1; padding: 10px; border: 2px solid #e5e7eb; border-radius: 8px; font-size: 14px; background: white;">
            <option value="">家族年齢（全て）</option>
            <option value="0-19">未成年（0〜19歳）</option>
            <option value="20-29">20代（20〜29歳）</option>
            <option value="30-49">30〜40代（30〜49歳）</option>
            <option value="50-999">50歳以上</option>
          </select>
        </div>
        
        <div style="display: flex; gap: 8px;">
          <button onclick="applyHistoryFilter()" style="flex: 1; padding: 10px; background: linear-gradient(135deg, #3b82f6, #2563eb); color: white; border: none; border-radius: 8px; font-size: 14px; font-weight: 600; cursor: pointer;">検索</button>
          <button onclick="clearHistoryFilter()" style="padding: 10px 16px; background: #f3f4f6; color: #6b7280; border: none; border-radius: 8px; font-size: 14px; font-weight: 600; cursor: pointer;">クリア</button>
        </div>
      </div>
      
      <!-- 相談リスト -->
      <div id="consultations-list" style="margin-bottom: 16px;">
        ${renderConsultationsList(data.consultations)}
      </div>
      
      <!-- ページネーション -->
      ${data.total > 20 ? renderPagination(data.page, Math.ceil(data.total / 20)) : ''}
    </main>
    
    ${renderFooter()}
  `;
}

function renderConsultationsList(consultations) {
  if (consultations.length === 0) {
    return `
      <div style="background: white; border-radius: 16px; padding: 40px 20px; text-align: center; box-shadow: 0 2px 8px rgba(0,0,0,0.06);">
        <div style="font-size: 48px; margin-bottom: 16px;">📋</div>
        <p style="margin: 0; font-size: 16px; color: #6b7280;">相談履歴がありません</p>
      </div>
    `;
  }
  
  return consultations.map(consultation => {
    const urgencyLevel = consultation.emergency_level || '中';
    const urgencyColor = urgencyLevel === '高' ? '#ef4444' : urgencyLevel === '中' ? '#f59e0b' : '#10b981';
    const date = new Date(consultation.created_at || consultation.reception_datetime);
    const dateStr = `${date.getFullYear()}/${String(date.getMonth() + 1).padStart(2, '0')}/${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
    
    return `
      <div onclick="showConsultationDetail(${consultation.id})" style="background: white; border-radius: 12px; padding: 16px; margin-bottom: 12px; box-shadow: 0 2px 6px rgba(0,0,0,0.06); cursor: pointer; transition: transform 0.2s;" onmouseover="this.style.transform='translateY(-2px)'" onmouseout="this.style.transform='translateY(0)'">
        <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 8px;">
          <div>
            <h4 style="margin: 0 0 4px 0; font-size: 16px; font-weight: 700; color: #1f2937;">${consultation.caller_name || '（氏名なし）'}</h4>
            <p style="margin: 0; font-size: 13px; color: #6b7280;">${dateStr}</p>
          </div>
          <span style="background: ${urgencyColor}; color: white; padding: 4px 12px; border-radius: 12px; font-size: 12px; font-weight: 600;">${urgencyLevel}</span>
        </div>
        
        <div style="display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 8px;">
          <span style="background: #dbeafe; color: #1e40af; padding: 4px 10px; border-radius: 8px; font-size: 12px; font-weight: 600;">${consultation.addiction_types || '未分類'}</span>
          <span style="background: #f3f4f6; color: #6b7280; padding: 4px 10px; border-radius: 8px; font-size: 12px;">${consultation.caller_relationship || '不明'}</span>
        </div>
        
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <p style="margin: 0; font-size: 13px; color: #9ca3af;">対応: ${consultation.staff_name || '不明'}</p>
          <svg width="16" height="16" viewBox="0 0 20 20" fill="none">
            <path d="M7 4L13 10L7 16" stroke="#9ca3af" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </div>
      </div>
    `;
  }).join('');
}

function renderPagination(currentPage, totalPages) {
  return `
    <div style="display: flex; justify-content: center; gap: 8px; margin-top: 20px;">
      ${currentPage > 1 ? `<button onclick="loadHistoryPage(${currentPage - 1})" style="padding: 8px 16px; background: white; color: #3b82f6; border: 2px solid #3b82f6; border-radius: 8px; font-size: 14px; font-weight: 600; cursor: pointer;">前へ</button>` : ''}
      <span style="padding: 8px 16px; background: #3b82f6; color: white; border-radius: 8px; font-size: 14px; font-weight: 600;">${currentPage} / ${totalPages}</span>
      ${currentPage < totalPages ? `<button onclick="loadHistoryPage(${currentPage + 1})" style="padding: 8px 16px; background: white; color: #3b82f6; border: 2px solid #3b82f6; border-radius: 8px; font-size: 14px; font-weight: 600; cursor: pointer;">次へ</button>` : ''}
    </div>
  `;
}

async function loadHistoryPage(page) {
  const data = await loadConsultations(page, 20);
  document.getElementById('consultations-list').innerHTML = renderConsultationsList(data.consultations);
}

async function applyHistoryFilter() {
  const name = document.getElementById('search_name').value;
  const addiction = document.getElementById('search_addiction').value;
  const callerAge = document.getElementById('search_caller_age').value;
  const familyAge = document.getElementById('search_family_age').value;
  
  currentFilter = {};
  if (name) currentFilter.caller_name = name;
  if (addiction) currentFilter.addiction_type = addiction;
  if (callerAge) currentFilter.caller_age_range = callerAge;
  if (familyAge) currentFilter.family_age_range = familyAge;
  
  const data = await searchConsultations(currentFilter);
  document.getElementById('consultations-list').innerHTML = renderConsultationsList(data.consultations);
}

function clearHistoryFilter() {
  document.getElementById('search_name').value = '';
  document.getElementById('search_addiction').value = '';
  document.getElementById('search_caller_age').value = '';
  document.getElementById('search_family_age').value = '';
  currentFilter = {};
  showHistory();
}

let editingConsultation = null;

async function showConsultationDetail(id) {
  try {
    const response = await fetch(`${API_BASE}/consultations/${id}`);
    if (!response.ok) throw new Error('詳細取得失敗');
    const data = await response.json();
    const consultation = data.consultation || data;
    editingConsultation = consultation;
    
    const date = new Date(consultation.created_at || consultation.reception_datetime);
    const dateStr = `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日 ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
    const urgencyLevel = consultation.emergency_level || '中';
    const urgencyColor = urgencyLevel === '高' ? '#ef4444' : urgencyLevel === '中' ? '#f59e0b' : '#10b981';
    
    let phases = {};
    try {
      phases = JSON.parse(consultation.consultation_content || '{}');
    } catch (e) {
      console.error('フェーズパースエラー:', e);
    }
    
    const app = document.getElementById('app');
    app.innerHTML = `
      ${renderHeader('相談詳細', true)}
      
      <main style="max-width: 480px; margin: 0 auto; padding: 16px;">
        <!-- 基本情報 -->
        <div style="background: white; border-radius: 16px; padding: 20px; margin-bottom: 16px; box-shadow: 0 2px 8px rgba(0,0,0,0.06);">
          <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 16px;">
            <div>
              <h3 style="margin: 0 0 4px 0; font-size: 20px; font-weight: 700; color: #1f2937;">${consultation.caller_name || '（氏名なし）'}</h3>
              <p style="margin: 0; font-size: 13px; color: #6b7280;">${dateStr}</p>
            </div>
            <span style="background: ${urgencyColor}; color: white; padding: 6px 14px; border-radius: 12px; font-size: 13px; font-weight: 600;">${urgencyLevel}</span>
          </div>
          
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; padding-top: 12px; border-top: 1px solid #e5e7eb;">
            <div>
              <p style="margin: 0 0 4px 0; font-size: 12px; color: #6b7280; font-weight: 600;">電話番号</p>
              <p style="margin: 0; font-size: 14px; color: #1f2937;">${consultation.caller_phone || '未記載'}</p>
            </div>
            <div>
              <p style="margin: 0 0 4px 0; font-size: 12px; color: #6b7280; font-weight: 600;">関係</p>
              <p style="margin: 0; font-size: 14px; color: #1f2937;">${consultation.caller_relationship || '不明'}</p>
            </div>
            <div>
              <p style="margin: 0 0 4px 0; font-size: 12px; color: #6b7280; font-weight: 600;">依存症</p>
              <p style="margin: 0; font-size: 14px; color: #1f2937;">${consultation.addiction_types || '未分類'}</p>
            </div>
            <div>
              <p style="margin: 0 0 4px 0; font-size: 12px; color: #6b7280; font-weight: 600;">対応スタッフ</p>
              <p style="margin: 0; font-size: 14px; color: #1f2937;">${consultation.staff_name || '不明'}</p>
            </div>
          </div>
        </div>
        
        <!-- メモ -->
        ${consultation.notes ? `
          <div style="background: white; border-radius: 16px; padding: 20px; margin-bottom: 16px; box-shadow: 0 2px 8px rgba(0,0,0,0.06);">
            <h3 style="margin: 0 0 12px 0; font-size: 16px; font-weight: 700; color: #1f2937; border-bottom: 2px solid #10b981; padding-bottom: 6px;">メモ</h3>
            <p style="margin: 0; font-size: 14px; color: #374151; line-height: 1.6; white-space: pre-wrap;">${consultation.notes}</p>
          </div>
        ` : ''}
        
        <!-- 対応フェーズ -->
        ${Object.keys(phases).length > 0 ? `
          <div style="background: white; border-radius: 16px; padding: 20px; margin-bottom: 16px; box-shadow: 0 2px 8px rgba(0,0,0,0.06);">
            <h3 style="margin: 0 0 16px 0; font-size: 16px; font-weight: 700; color: #1f2937; border-bottom: 2px solid #8b5cf6; padding-bottom: 6px;">対応履歴</h3>
            ${Object.entries(phases).map(([phase, data], index) => `
              <div style="margin-bottom: 16px; ${index === Object.keys(phases).length - 1 ? '' : 'border-bottom: 1px solid #e5e7eb; padding-bottom: 16px;'}">
                <div style="display: flex; align-items: center; margin-bottom: 8px;">
                  <div style="width: 24px; height: 24px; border-radius: 50%; background: linear-gradient(135deg, #8b5cf6, #7c3aed); color: white; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 12px; flex-shrink: 0;">${index + 1}</div>
                  <h4 style="margin: 0 0 0 10px; font-size: 14px; font-weight: 700; color: #1f2937;">${phase}</h4>
                </div>
                ${data.content ? `<p style="margin: 0; font-size: 13px; color: #374151; line-height: 1.6; white-space: pre-wrap;">${data.content}</p>` : '<p style="margin: 0; font-size: 13px; color: #9ca3af; font-style: italic;">記録なし</p>'}
              </div>
            `).join('')}
          </div>
        ` : ''}
        
        <!-- アクションボタン -->
        <div style="display: flex; gap: 8px;">
          <button onclick="showHistory()" style="flex: 1; padding: 14px; background: white; color: #3b82f6; border: 2px solid #3b82f6; border-radius: 12px; font-size: 16px; font-weight: 600; cursor: pointer;">一覧に戻る</button>
          <button onclick="exportConsultationPDF(${consultation.id})" style="flex: 1; padding: 14px; background: linear-gradient(135deg, #10b981, #059669); color: white; border: none; border-radius: 12px; font-size: 16px; font-weight: 600; cursor: pointer;">PDF出力</button>
        </div>
      </main>
      
      ${renderFooter()}
    `;
  } catch (error) {
    console.error('詳細取得エラー:', error);
    showError('詳細情報の取得に失敗しました');
  }
}

function exportConsultationPDF(id) {
  showInfo('PDF出力機能は開発中です');
}

// ==========================================
// 統計情報画面
// ==========================================

async function showStatistics() {
  currentPage = 'statistics';
  
  // 初期表示は今週
  const stats = await loadStatsPeriod('week');
  
  renderStatisticsPage(stats, 'week');
}

// 統計データを取得
async function loadStatsPeriod(period) {
  try {
    const response = await fetch(`${API_BASE}/stats/period?period=${period}`);
    if (!response.ok) throw new Error('統計取得失敗');
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('統計取得エラー:', error);
    return {
      period: period,
      totalCount: 0,
      periodStats: [],
      byType: [],
      byUrgency: []
    };
  }
}

// 統計画面をレンダリング
function renderStatisticsPage(stats, selectedPeriod) {
  const app = document.getElementById('app');
  
  // 期間別のラベル作成
  let periodLabels = [];
  if (selectedPeriod === 'week') {
    periodLabels = ['日', '月', '火', '水', '木', '金', '土'];
  } else if (selectedPeriod === 'month') {
    // 1日〜31日
    for (let i = 1; i <= 31; i++) {
      periodLabels.push(i + '日');
    }
  } else if (selectedPeriod === 'year') {
    periodLabels = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'];
  }
  
  // 期間別データを整形
  const periodData = {};
  stats.periodStats.forEach(item => {
    periodData[item.period] = item.count;
  });
  
  // チャート用データ作成
  const chartData = periodLabels.map((label, index) => {
    if (selectedPeriod === 'week') {
      return periodData[index] || 0;
    } else if (selectedPeriod === 'month') {
      return periodData[String(index + 1).padStart(2, '0')] || 0;
    } else {
      return periodData[String(index + 1).padStart(2, '0')] || 0;
    }
  });
  
  app.innerHTML = `
    ${renderHeader('統計情報', true)}
    
    <main style="max-width: 480px; margin: 0 auto; padding: 16px;">
      <!-- 期間選択 -->
      <div style="background: white; border-radius: 16px; padding: 20px; margin-bottom: 16px; box-shadow: 0 2px 8px rgba(0,0,0,0.06);">
        <h3 style="margin: 0 0 12px 0; font-size: 16px; font-weight: 700; color: #1f2937;">期間選択</h3>
        <div style="display: flex; gap: 8px;">
          <button onclick="loadAndRenderStats('week')" style="flex: 1; padding: 10px; background: ${selectedPeriod === 'week' ? 'linear-gradient(135deg, #3b82f6, #2563eb)' : 'white'}; color: ${selectedPeriod === 'week' ? 'white' : '#3b82f6'}; border: ${selectedPeriod === 'week' ? 'none' : '2px solid #3b82f6'}; border-radius: 8px; font-size: 14px; font-weight: 600; cursor: pointer;">今週</button>
          <button onclick="loadAndRenderStats('month')" style="flex: 1; padding: 10px; background: ${selectedPeriod === 'month' ? 'linear-gradient(135deg, #3b82f6, #2563eb)' : 'white'}; color: ${selectedPeriod === 'month' ? 'white' : '#3b82f6'}; border: ${selectedPeriod === 'month' ? 'none' : '2px solid #3b82f6'}; border-radius: 8px; font-size: 14px; font-weight: 600; cursor: pointer;">今月</button>
          <button onclick="loadAndRenderStats('year')" style="flex: 1; padding: 10px; background: ${selectedPeriod === 'year' ? 'linear-gradient(135deg, #3b82f6, #2563eb)' : 'white'}; color: ${selectedPeriod === 'year' ? 'white' : '#3b82f6'}; border: ${selectedPeriod === 'year' ? 'none' : '2px solid #3b82f6'}; border-radius: 8px; font-size: 14px; font-weight: 600; cursor: pointer;">今年</button>
        </div>
      </div>
      
      <!-- サマリー -->
      <div style="background: white; border-radius: 16px; padding: 20px; margin-bottom: 16px; box-shadow: 0 2px 8px rgba(0,0,0,0.06);">
        <h3 style="margin: 0 0 16px 0; font-size: 16px; font-weight: 700; color: #1f2937;">${selectedPeriod === 'week' ? '今週' : selectedPeriod === 'month' ? '今月' : '今年'}のサマリー</h3>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
          <div style="background: linear-gradient(135deg, #dbeafe, #bfdbfe); border-radius: 12px; padding: 16px; text-align: center;">
            <p style="margin: 0; font-size: 28px; font-weight: 800; color: #1e40af;">${stats.totalCount}</p>
            <p style="margin: 4px 0 0 0; font-size: 13px; color: #1e40af; font-weight: 600;">総相談件数</p>
          </div>
          <div style="background: linear-gradient(135deg, #fef3c7, #fde68a); border-radius: 12px; padding: 16px; text-align: center;">
            <p style="margin: 0; font-size: 28px; font-weight: 800; color: #b45309;">${Math.round(stats.totalCount / (selectedPeriod === 'week' ? 7 : selectedPeriod === 'month' ? 30 : 365))}</p>
            <p style="margin: 4px 0 0 0; font-size: 13px; color: #b45309; font-weight: 600;">1日平均</p>
          </div>
        </div>
      </div>
      
      <!-- 期間別グラフ -->
      <div style="background: white; border-radius: 16px; padding: 20px; margin-bottom: 16px; box-shadow: 0 2px 8px rgba(0,0,0,0.06);">
        <h3 style="margin: 0 0 16px 0; font-size: 16px; font-weight: 700; color: #1f2937;">期間別相談件数</h3>
        <canvas id="periodChart" style="max-height: 240px;"></canvas>
      </div>
      
      <!-- 依存症種類別 -->
      <div style="background: white; border-radius: 16px; padding: 20px; margin-bottom: 16px; box-shadow: 0 2px 8px rgba(0,0,0,0.06);">
        <h3 style="margin: 0 0 16px 0; font-size: 16px; font-weight: 700; color: #1f2937;">依存症種類別</h3>
        <canvas id="typeChart" style="max-height: 240px;"></canvas>
      </div>
      
      <!-- 緊急度別 -->
      <div style="background: white; border-radius: 16px; padding: 20px; margin-bottom: 16px; box-shadow: 0 2px 8px rgba(0,0,0,0.06);">
        <h3 style="margin: 0 0 16px 0; font-size: 16px; font-weight: 700; color: #1f2937;">緊急度別</h3>
        <canvas id="urgencyChart" style="max-height: 240px;"></canvas>
      </div>
      
      <!-- CSV出力ボタン -->
      <button onclick="exportStatsCSV()" style="width: 100%; padding: 16px; background: linear-gradient(135deg, #10b981, #059669); color: white; border: none; border-radius: 12px; font-size: 16px; font-weight: 700; cursor: pointer; box-shadow: 0 4px 12px rgba(16,185,129,0.3); margin-bottom: 16px;">
        📊 CSV出力
      </button>
    </main>
    
    ${renderFooter()}
  `;
  
  // Chart.jsでグラフを描画
  setTimeout(() => {
    // 期間別グラフ
    const periodCtx = document.getElementById('periodChart').getContext('2d');
    new Chart(periodCtx, {
      type: 'bar',
      data: {
        labels: periodLabels,
        datasets: [{
          label: '相談件数',
          data: chartData,
          backgroundColor: 'rgba(59, 130, 246, 0.5)',
          borderColor: 'rgba(59, 130, 246, 1)',
          borderWidth: 2
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              stepSize: 1
            }
          }
        }
      }
    });
    
    // 依存症種類別グラフ
    const typeCtx = document.getElementById('typeChart').getContext('2d');
    new Chart(typeCtx, {
      type: 'doughnut',
      data: {
        labels: stats.byType.map(item => item.type),
        datasets: [{
          data: stats.byType.map(item => item.count),
          backgroundColor: [
            'rgba(239, 68, 68, 0.7)',
            'rgba(59, 130, 246, 0.7)',
            'rgba(16, 185, 129, 0.7)',
            'rgba(245, 158, 11, 0.7)',
            'rgba(139, 92, 246, 0.7)'
          ]
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: true
      }
    });
    
    // 緊急度別グラフ
    const urgencyCtx = document.getElementById('urgencyChart').getContext('2d');
    new Chart(urgencyCtx, {
      type: 'pie',
      data: {
        labels: stats.byUrgency.map(item => item.level),
        datasets: [{
          data: stats.byUrgency.map(item => item.count),
          backgroundColor: [
            'rgba(239, 68, 68, 0.7)',
            'rgba(245, 158, 11, 0.7)',
            'rgba(16, 185, 129, 0.7)'
          ]
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: true
      }
    });
  }, 100);
}

// 期間を切り替えて再レンダリング
async function loadAndRenderStats(period) {
  showInfo(`${period === 'week' ? '今週' : period === 'month' ? '今月' : '今年'}のデータを読み込み中...`);
  const stats = await loadStatsPeriod(period);
  renderStatisticsPage(stats, period);
}

function renderBarChart(data, labelKey, valueKey, color) {
  const maxValue = Math.max(...data.map(item => item[valueKey]));
  
  return `
    <div style="display: flex; flex-direction: column; gap: 12px;">
      ${data.map(item => {
        const percentage = (item[valueKey] / maxValue) * 100;
        return `
          <div>
            <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
              <span style="font-size: 13px; font-weight: 600; color: #374151;">${item[labelKey]}</span>
              <span style="font-size: 13px; font-weight: 700; color: ${color};">${item[valueKey]}</span>
            </div>
            <div style="width: 100%; height: 24px; background: #f3f4f6; border-radius: 6px; overflow: hidden;">
              <div style="width: ${percentage}%; height: 100%; background: ${color}; border-radius: 6px; transition: width 0.5s;"></div>
            </div>
          </div>
        `;
      }).join('')}
    </div>
  `;
}

function exportStatsCSV() {
  showInfo('CSV出力機能は開発中です');
}

function exportStatsPDF() {
  showInfo('PDF出力機能は開発中です');
}

// ==========================================
// 対応マニュアル画面
// ==========================================

async function showManual() {
  currentPage = 'manual';
  
  const app = document.getElementById('app');
  app.innerHTML = `
    ${renderHeader('対応マニュアル', true)}
    
    <main style="max-width: 480px; margin: 0 auto; padding: 16px;">
      <!-- 検索 -->
      <div style="background: white; border-radius: 16px; padding: 20px; margin-bottom: 16px; box-shadow: 0 2px 8px rgba(0,0,0,0.06);">
        <h3 style="margin: 0 0 12px 0; font-size: 16px; font-weight: 700; color: #1f2937;">フレーズ検索</h3>
        <div style="display: flex; gap: 8px;">
          <input type="text" id="manual_search" placeholder="キーワードで検索..." style="flex: 1; padding: 10px; border: 2px solid #e5e7eb; border-radius: 8px; font-size: 14px;">
          <button onclick="searchManualPhrases()" style="padding: 10px 20px; background: linear-gradient(135deg, #3b82f6, #2563eb); color: white; border: none; border-radius: 8px; font-size: 14px; font-weight: 600; cursor: pointer;">検索</button>
        </div>
      </div>
      
      <!-- カテゴリフィルター -->
      <div style="background: white; border-radius: 16px; padding: 20px; margin-bottom: 16px; box-shadow: 0 2px 8px rgba(0,0,0,0.06);">
        <h3 style="margin: 0 0 12px 0; font-size: 16px; font-weight: 700; color: #1f2937;">カテゴリフィルター</h3>
        <div style="display: flex; flex-wrap: wrap; gap: 8px;">
          ${(() => {
            // カテゴリ表示順序を定義
            const categoryOrder = ['opening', 'listening', 'assessment', 'information', 'next_steps', 'closing', 'emergency'];
            const allCategories = Object.keys(phrasesByCategory);
            const sortedCategories = categoryOrder.filter(cat => allCategories.includes(cat))
              .concat(allCategories.filter(cat => !categoryOrder.includes(cat)));
            
            // カテゴリボタンを生成
            const categoryButtons = sortedCategories.map(category => `
              <button onclick="filterManualByCategory('${category}')" style="padding: 8px 16px; background: white; color: #3b82f6; border: 2px solid #3b82f6; border-radius: 8px; font-size: 13px; font-weight: 600; cursor: pointer;">${CATEGORY_DISPLAY_NAMES[category] || category}</button>
            `).join('');
            
            // 「すべて」ボタンを最後に追加
            return categoryButtons + `
              <button onclick="filterManualByCategory(null)" style="padding: 8px 16px; background: linear-gradient(135deg, #3b82f6, #2563eb); color: white; border: none; border-radius: 8px; font-size: 13px; font-weight: 600; cursor: pointer;">すべて</button>
            `;
          })()}
        </div>
      </div>
      
      <!-- フレーズリスト -->
      <div id="manual-phrases-list">
        ${renderManualPhrases(null, null)}
      </div>
    </main>
    
    ${renderFooter()}
  `;
}

function renderManualPhrases(category, searchTerm) {
  let html = '';
  
  // カテゴリ表示順序を定義（opening → listening → assessment → information → next_steps → closing → emergency）
  const categoryOrder = [
    'opening',      // 第1段階
    'listening',    // 第2段階
    'assessment',   // 第3段階
    'information',  // 第4段階
    'next_steps',   // 第5段階
    'closing',      // 第6段階
    'emergency'     // 緊急対応
  ];
  
  // カテゴリをソート（定義順 → 存在するカテゴリのみ表示）
  const allCategories = Object.keys(phrasesByCategory);
  const sortedCategories = categoryOrder.filter(cat => allCategories.includes(cat))
    .concat(allCategories.filter(cat => !categoryOrder.includes(cat)));
  
  const categoriesToShow = category ? [category] : sortedCategories;
  
  categoriesToShow.forEach(cat => {
    const phases = phrasesByCategory[cat];
    
    html += `
      <div style="background: white; border-radius: 16px; padding: 20px; margin-bottom: 16px; box-shadow: 0 2px 8px rgba(0,0,0,0.06);">
        <h3 style="margin: 0 0 16px 0; font-size: 18px; font-weight: 700; color: #1f2937; border-bottom: 2px solid #f59e0b; padding-bottom: 8px;">${CATEGORY_DISPLAY_NAMES[cat] || cat}</h3>
        
        ${Object.entries(phases).map(([phase, phrases]) => {
          const filteredPhrases = searchTerm 
            ? phrases.filter(p => p.phrase_text.toLowerCase().includes(searchTerm.toLowerCase()))
            : phrases;
          
          if (filteredPhrases.length === 0) return '';
          
          return `
            <div style="margin-bottom: 20px;">
              <h4 style="margin: 0 0 12px 0; font-size: 15px; font-weight: 700; color: #6b7280; display: flex; align-items: center;">
                <span style="width: 6px; height: 6px; border-radius: 50%; background: #f59e0b; margin-right: 8px;"></span>
                ${PHASE_REVERSE_MAPPING[phase] || phase}
              </h4>
              
              ${filteredPhrases.map((phrase, index) => `
                <div style="background: #f9fafb; border-left: 3px solid #f59e0b; padding: 12px 16px; margin-bottom: 8px; border-radius: 6px;">
                  <p style="margin: 0; font-size: 14px; color: #1f2937; line-height: 1.6;">${phrase.phrase_text}</p>
                  ${phrase.situation ? `<p style="margin: 8px 0 0 0; font-size: 12px; color: #6b7280; font-style: italic;">💡 ${phrase.situation}</p>` : ''}
                </div>
              `).join('')}
            </div>
          `;
        }).join('')}
      </div>
    `;
  });
  
  return html || '<div style="background: white; border-radius: 16px; padding: 40px 20px; text-align: center; box-shadow: 0 2px 8px rgba(0,0,0,0.06);"><p style="margin: 0; font-size: 16px; color: #6b7280;">該当するフレーズが見つかりません</p></div>';
}

function searchManualPhrases() {
  const searchTerm = document.getElementById('manual_search').value;
  document.getElementById('manual-phrases-list').innerHTML = renderManualPhrases(null, searchTerm);
}

function filterManualByCategory(category) {
  document.getElementById('manual-phrases-list').innerHTML = renderManualPhrases(category, null);
}

// ==========================================
// ユーティリティ関数
// ==========================================

function showError(message) {
  const toast = document.createElement('div');
  toast.style.cssText = 'position: fixed; top: 80px; left: 50%; transform: translateX(-50%); background: #ef4444; color: white; padding: 16px 24px; border-radius: 12px; font-size: 14px; font-weight: 600; box-shadow: 0 4px 12px rgba(0,0,0,0.2); z-index: 9999; max-width: 90%; animation: slideDown 0.3s ease;';
  toast.textContent = `❌ ${message}`;
  document.body.appendChild(toast);
  
  setTimeout(() => {
    toast.style.animation = 'slideUp 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

function showSuccess(message) {
  const toast = document.createElement('div');
  toast.style.cssText = 'position: fixed; top: 80px; left: 50%; transform: translateX(-50%); background: #10b981; color: white; padding: 16px 24px; border-radius: 12px; font-size: 14px; font-weight: 600; box-shadow: 0 4px 12px rgba(0,0,0,0.2); z-index: 9999; max-width: 90%; animation: slideDown 0.3s ease;';
  toast.textContent = `✅ ${message}`;
  document.body.appendChild(toast);
  
  setTimeout(() => {
    toast.style.animation = 'slideUp 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

function showInfo(message) {
  const toast = document.createElement('div');
  toast.style.cssText = 'position: fixed; top: 80px; left: 50%; transform: translateX(-50%); background: #3b82f6; color: white; padding: 16px 24px; border-radius: 12px; font-size: 14px; font-weight: 600; box-shadow: 0 4px 12px rgba(0,0,0,0.2); z-index: 9999; max-width: 90%; animation: slideDown 0.3s ease;';
  toast.textContent = `ℹ️ ${message}`;
  document.body.appendChild(toast);
  
  setTimeout(() => {
    toast.style.animation = 'slideUp 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

// アニメーション追加
const style = document.createElement('style');
style.textContent = `
  @keyframes slideDown {
    from { transform: translateX(-50%) translateY(-100%); opacity: 0; }
    to { transform: translateX(-50%) translateY(0); opacity: 1; }
  }
  
  @keyframes slideUp {
    from { transform: translateX(-50%) translateY(0); opacity: 1; }
    to { transform: translateX(-50%) translateY(-100%); opacity: 0; }
  }
`;
document.head.appendChild(style);

// ==========================================
// ナビゲーション履歴管理
// ==========================================

function addToHistory(page) {
  // 現在の位置から後ろの履歴を削除
  pageHistory = pageHistory.slice(0, historyIndex + 1);
  // 新しいページを追加
  pageHistory.push(page);
  historyIndex = pageHistory.length - 1;
  console.log('📚 履歴追加:', page, 'index:', historyIndex, 'history:', pageHistory);
}

function goBack() {
  if (historyIndex > 0) {
    historyIndex--;
    const previousPage = pageHistory[historyIndex];
    console.log('⬅️ 戻る:', previousPage, 'index:', historyIndex);
    navigateToPage(previousPage, false); // 履歴に追加しない
  } else {
    console.log('⬅️ これ以上戻れません');
    showHomePage();
  }
}

function goForward() {
  if (historyIndex < pageHistory.length - 1) {
    historyIndex++;
    const nextPage = pageHistory[historyIndex];
    console.log('➡️ 進む:', nextPage, 'index:', historyIndex);
    navigateToPage(nextPage, false); // 履歴に追加しない
  } else {
    console.log('➡️ これ以上進めません');
  }
}

function navigateToPage(page, addHistory = true) {
  if (addHistory) {
    addToHistory(page);
  }
  
  switch(page) {
    case 'home':
      showHomePage();
      break;
    case 'new-consultation':
      showNewConsultation();
      break;
    case 'history':
      showHistory();
      break;
    case 'stats':
      showStatistics();
      break;
    case 'manual':
      showManual();
      break;
    default:
      showHomePage();
  }
}

// ==========================================
// スワイプジェスチャー検出
// ==========================================

let touchStartX = 0;
let touchStartY = 0;
let touchEndX = 0;
let touchEndY = 0;

function handleSwipe() {
  const deltaX = touchEndX - touchStartX;
  const deltaY = touchEndY - touchStartY;
  const minSwipeDistance = 100; // 最小スワイプ距離（50→100pxに変更で誤操作防止）
  
  // 横スワイプの方が縦スワイプより十分大きい場合のみ処理
  // 横方向の移動が縦方向の2倍以上の場合のみ横スワイプとみなす
  if (Math.abs(deltaX) > Math.abs(deltaY) * 2 && Math.abs(deltaX) > minSwipeDistance) {
    if (deltaX > 0) {
      // 右スワイプ = 戻る
      console.log('👉 右スワイプ検出: 戻る');
      goBack();
    } else {
      // 左スワイプ = 進む
      console.log('👈 左スワイプ検出: 進む');
      goForward();
    }
  }
}

// タッチイベントリスナー設定
document.addEventListener('touchstart', (e) => {
  touchStartX = e.changedTouches[0].screenX;
  touchStartY = e.changedTouches[0].screenY;
}, { passive: true });

document.addEventListener('touchend', (e) => {
  touchEndX = e.changedTouches[0].screenX;
  touchEndY = e.changedTouches[0].screenY;
  handleSwipe();
}, { passive: true });

// ==========================================
// プルダウン更新機能 (Pull to Refresh)
// ==========================================

let pullStartY = 0;
let pullCurrentY = 0;
let isPulling = false;
let refreshIndicator = null;

// 更新インジケーターを作成
function createRefreshIndicator() {
  if (!refreshIndicator) {
    refreshIndicator = document.createElement('div');
    refreshIndicator.id = 'refresh-indicator';
    refreshIndicator.style.cssText = `
      position: fixed;
      top: -60px;
      left: 50%;
      transform: translateX(-50%);
      width: 40px;
      height: 40px;
      background: linear-gradient(135deg, #3b82f6, #2563eb);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 20px;
      z-index: 9999;
      transition: top 0.3s ease;
      box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
    `;
    refreshIndicator.innerHTML = '🔄';
    document.body.appendChild(refreshIndicator);
  }
  return refreshIndicator;
}

// プルダウン更新処理
async function handlePullToRefresh() {
  const indicator = createRefreshIndicator();
  indicator.style.top = '20px';
  indicator.style.animation = 'spin 1s linear infinite';
  
  // CSSアニメーションを追加
  if (!document.getElementById('refresh-animation-style')) {
    const style = document.createElement('style');
    style.id = 'refresh-animation-style';
    style.textContent = `
      @keyframes spin {
        from { transform: translateX(-50%) rotate(0deg); }
        to { transform: translateX(-50%) rotate(360deg); }
      }
    `;
    document.head.appendChild(style);
  }
  
  // ホーム画面の場合は統計データを再取得
  if (currentPage === 'home') {
    await showHomePage();
  }
  
  // 少し待ってからインジケーターを非表示
  setTimeout(() => {
    indicator.style.top = '-60px';
    indicator.style.animation = '';
  }, 1000);
}

// プルダウン用のタッチイベント
document.addEventListener('touchstart', (e) => {
  // スクロール位置が最上部の場合のみプルダウン有効
  if (window.scrollY === 0) {
    pullStartY = e.touches[0].clientY;
    isPulling = true;
  }
}, { passive: true });

document.addEventListener('touchmove', (e) => {
  if (!isPulling) return;
  
  pullCurrentY = e.touches[0].clientY;
  const pullDistance = pullCurrentY - pullStartY;
  
  // 下方向に50px以上引っ張った場合
  if (pullDistance > 50 && window.scrollY === 0) {
    const indicator = createRefreshIndicator();
    const displayDistance = Math.min(pullDistance - 50, 40);
    indicator.style.top = `${displayDistance}px`;
  }
}, { passive: true });

document.addEventListener('touchend', (e) => {
  if (!isPulling) return;
  
  const pullDistance = pullCurrentY - pullStartY;
  
  // 80px以上引っ張った場合は更新実行
  if (pullDistance > 80 && window.scrollY === 0) {
    handlePullToRefresh();
  } else {
    // 更新しない場合はインジケーターを戻す
    const indicator = createRefreshIndicator();
    indicator.style.top = '-60px';
  }
  
  isPulling = false;
  pullStartY = 0;
  pullCurrentY = 0;
}, { passive: true });

// ==========================================
// 自動更新機能
// ==========================================

let autoRefreshInterval = null;

// 自動更新を開始（30秒ごと）
function startAutoRefresh() {
  // 既存のインターバルをクリア
  if (autoRefreshInterval) {
    clearInterval(autoRefreshInterval);
  }
  
  // 30秒ごとにホーム画面の統計を更新
  autoRefreshInterval = setInterval(() => {
    if (currentPage === 'home') {
      console.log('🔄 自動更新: 統計データを更新中...');
      showHomePage();
    }
  }, 30000); // 30秒 = 30000ミリ秒
  
  console.log('✅ 自動更新を開始しました（30秒ごと）');
}

// 自動更新を停止
function stopAutoRefresh() {
  if (autoRefreshInterval) {
    clearInterval(autoRefreshInterval);
    autoRefreshInterval = null;
    console.log('⏹️ 自動更新を停止しました');
  }
}

// ページ読み込み時に自動更新を開始
window.addEventListener('load', () => {
  startAutoRefresh();
});

// ページを離れる時に自動更新を停止
window.addEventListener('beforeunload', () => {
  stopAutoRefresh();
});
