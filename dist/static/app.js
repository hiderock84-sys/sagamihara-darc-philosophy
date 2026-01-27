// ==========================================
// グローバル変数・定数
// ==========================================

const API_BASE = '/api';
let currentStaff = null;
let currentPhases = {};
let consultationId = null;

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

// ==========================================
// 初期化
// ==========================================

document.addEventListener('DOMContentLoaded', async () => {
  await initApp();
});

async function initApp() {
  try {
    // スタッフ情報とフレーズデータを取得
    await Promise.all([
      loadStaffList(),
      loadPhrases()
    ]);
    
    // 初期画面を表示
    showHomePage();
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
    const response = await axios.get(`${API_BASE}/staff`);
    return response.data.staff;
  } catch (error) {
    console.error('スタッフ情報取得エラー:', error);
    return [];
  }
}

async function loadPhrases() {
  try {
    const response = await axios.get(`${API_BASE}/phrases`);
    currentPhases = groupBy(response.data.phrases, 'category');
    return currentPhases;
  } catch (error) {
    console.error('フレーズ取得エラー:', error);
    return {};
  }
}

async function loadStats() {
  try {
    const response = await axios.get(`${API_BASE}/stats/dashboard`);
    return response.data;
  } catch (error) {
    console.error('統計情報取得エラー:', error);
    return null;
  }
}

async function loadConsultations(page = 1, limit = 20) {
  try {
    const response = await axios.get(`${API_BASE}/consultations?page=${page}&limit=${limit}`);
    return response.data;
  } catch (error) {
    console.error('相談履歴取得エラー:', error);
    return null;
  }
}

async function searchConsultations(params) {
  try {
    const queryString = new URLSearchParams(params).toString();
    const response = await axios.get(`${API_BASE}/consultations/search?${queryString}`);
    return response.data.consultations;
  } catch (error) {
    console.error('検索エラー:', error);
    return [];
  }
}

async function saveConsultation(data) {
  try {
    const response = await axios.post(`${API_BASE}/consultations`, data);
    return response.data;
  } catch (error) {
    console.error('保存エラー:', error);
    throw error;
  }
}

// ==========================================
// ページ表示関数
// ==========================================

function showHomePage() {
  const app = document.getElementById('app');
  app.innerHTML = `
    <div class="min-h-screen">
      <!-- ヘッダー -->
      <header class="bg-gradient-to-r from-blue-600 to-blue-800 text-white shadow-lg">
        <div class="container mx-auto px-4 py-6">
          <div class="flex items-center justify-between">
            <div class="flex items-center space-x-4">
              <i class="fas fa-hands-helping text-4xl"></i>
              <div>
                <h1 class="text-3xl font-bold">相模原ダルク</h1>
                <p class="text-blue-100">電話対応支援システム</p>
              </div>
            </div>
            <div class="text-right">
              <p class="text-sm font-semibold text-white">
                <i class="fas fa-phone mr-1"></i>
                TEL: 042-707-0391
              </p>
              <p class="text-xs text-blue-200 mt-1">
                平日 9:00-17:00 / 土・祝 9:00-14:00
              </p>
            </div>
          </div>
        </div>
      </header>

      <!-- メインコンテンツ -->
      <main class="container mx-auto px-4 py-8">
        <!-- 機能メニュー -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <!-- 新規相談受付 -->
          <button onclick="showNewConsultationPage()" 
                  class="bg-white rounded-lg shadow-md hover:shadow-xl transition-all p-6 text-center group hover:bg-blue-50">
            <div class="text-5xl mb-4 text-blue-600 group-hover:scale-110 transition-transform">
              <i class="fas fa-phone-alt"></i>
            </div>
            <h3 class="text-xl font-bold text-gray-800 mb-2">新規相談受付</h3>
            <p class="text-gray-600 text-sm">電話対応を開始する</p>
          </button>

          <!-- 相談履歴 -->
          <button onclick="showHistoryPage()" 
                  class="bg-white rounded-lg shadow-md hover:shadow-xl transition-all p-6 text-center group hover:bg-green-50">
            <div class="text-5xl mb-4 text-green-600 group-hover:scale-110 transition-transform">
              <i class="fas fa-history"></i>
            </div>
            <h3 class="text-xl font-bold text-gray-800 mb-2">相談履歴</h3>
            <p class="text-gray-600 text-sm">過去の相談記録を確認</p>
          </button>

          <!-- 統計情報 -->
          <button onclick="showStatsPage()" 
                  class="bg-white rounded-lg shadow-md hover:shadow-xl transition-all p-6 text-center group hover:bg-purple-50">
            <div class="text-5xl mb-4 text-purple-600 group-hover:scale-110 transition-transform">
              <i class="fas fa-chart-bar"></i>
            </div>
            <h3 class="text-xl font-bold text-gray-800 mb-2">統計情報</h3>
            <p class="text-gray-600 text-sm">相談傾向を分析</p>
          </button>

          <!-- 対応マニュアル -->
          <button onclick="showManualPage()" 
                  class="bg-white rounded-lg shadow-md hover:shadow-xl transition-all p-6 text-center group hover:bg-orange-50">
            <div class="text-5xl mb-4 text-orange-600 group-hover:scale-110 transition-transform">
              <i class="fas fa-book"></i>
            </div>
            <h3 class="text-xl font-bold text-gray-800 mb-2">対応マニュアル</h3>
            <p class="text-gray-600 text-sm">対応フレーズ集を確認</p>
          </button>
        </div>

        <!-- ダッシュボード統計（簡易版） -->
        <div id="home-stats" class="bg-white rounded-lg shadow-md p-6">
          <h2 class="text-2xl font-bold text-gray-800 mb-4 flex items-center">
            <i class="fas fa-tachometer-alt mr-2 text-blue-600"></i>
            本日の概要
          </h2>
          <div class="text-center py-8">
            <i class="fas fa-spinner fa-spin text-4xl text-gray-400"></i>
            <p class="mt-4 text-gray-600">データを読み込み中...</p>
          </div>
        </div>
      </main>

      <!-- フッター -->
      <footer class="bg-gray-800 text-white mt-12 py-6">
        <div class="container mx-auto px-4 text-center">
          <p class="text-sm">© 2026 一般社団法人相模原ダルク - 電話対応支援システム</p>
          <p class="text-xs text-gray-400 mt-2">薬物・アルコール・ギャンブル依存症からの回復支援</p>
        </div>
      </footer>
    </div>
  `;

  // 統計情報を非同期で読み込み
  loadAndDisplayHomeStats();
}

async function loadAndDisplayHomeStats() {
  const stats = await loadStats();
  const container = document.getElementById('home-stats');
  
  if (!stats) {
    container.innerHTML = `
      <h2 class="text-2xl font-bold text-gray-800 mb-4 flex items-center">
        <i class="fas fa-tachometer-alt mr-2 text-blue-600"></i>
        本日の概要
      </h2>
      <p class="text-center text-gray-600">統計情報の取得に失敗しました</p>
    `;
    return;
  }

  container.innerHTML = `
    <h2 class="text-2xl font-bold text-gray-800 mb-4 flex items-center">
      <i class="fas fa-tachometer-alt mr-2 text-blue-600"></i>
      本日の概要
    </h2>
    <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
      <div class="text-center p-4 bg-blue-50 rounded-lg">
        <div class="text-3xl font-bold text-blue-600">${stats.totalConsultations}</div>
        <div class="text-sm text-gray-600 mt-1">総相談件数</div>
      </div>
      <div class="text-center p-4 bg-green-50 rounded-lg">
        <div class="text-3xl font-bold text-green-600">${stats.thisMonthConsultations}</div>
        <div class="text-sm text-gray-600 mt-1">今月の相談</div>
      </div>
      <div class="text-center p-4 bg-red-50 rounded-lg">
        <div class="text-3xl font-bold text-red-600">${getEmergencyCount(stats.emergencyStats, '高')}</div>
        <div class="text-sm text-gray-600 mt-1">緊急度：高</div>
      </div>
      <div class="text-center p-4 bg-yellow-50 rounded-lg">
        <div class="text-3xl font-bold text-yellow-600">${getEmergencyCount(stats.emergencyStats, '中')}</div>
        <div class="text-sm text-gray-600 mt-1">緊急度：中</div>
      </div>
    </div>
  `;
}

function showNewConsultationPage() {
  const app = document.getElementById('app');
  app.innerHTML = `
    <div class="min-h-screen bg-gray-50">
      <!-- ヘッダー -->
      <header class="bg-gradient-to-r from-blue-600 to-blue-800 text-white shadow-lg">
        <div class="container mx-auto px-4 py-4">
          <div class="flex items-center justify-between">
            <div class="flex items-center space-x-4">
              <button onclick="showHomePage()" class="hover:bg-blue-700 p-2 rounded">
                <i class="fas fa-arrow-left text-xl"></i>
              </button>
              <h1 class="text-2xl font-bold">新規相談受付</h1>
            </div>
            <div class="text-sm">
              <span id="current-time"></span>
            </div>
          </div>
        </div>
      </header>

      <main class="container mx-auto px-4 py-6">
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <!-- 左側: 対応ガイド -->
          <div class="lg:col-span-1">
            <div class="bg-white rounded-lg shadow-md p-6 sticky top-6">
              <h2 class="text-xl font-bold text-gray-800 mb-4 flex items-center">
                <i class="fas fa-headset mr-2 text-blue-600"></i>
                対応ガイド
              </h2>
              
              <div id="guide-content" class="space-y-4">
                <!-- 段階別ガイドをここに表示 -->
                <div class="guide-section" data-phase="opening">
                  <h3 class="font-bold text-blue-600 mb-2">第1段階: オープニング</h3>
                  <div class="text-sm text-gray-700 space-y-2" id="opening-phrases">
                    読み込み中...
                  </div>
                </div>
                
                <div class="guide-section" data-phase="listening">
                  <h3 class="font-bold text-green-600 mb-2">第2段階: 傾聴・共感</h3>
                  <div class="text-sm text-gray-700 space-y-2" id="listening-phrases">
                    読み込み中...
                  </div>
                </div>
                
                <div class="guide-section" data-phase="information">
                  <h3 class="font-bold text-purple-600 mb-2">第3段階: 情報提供</h3>
                  <div class="text-sm text-gray-700 space-y-2" id="information-phrases">
                    読み込み中...
                  </div>
                </div>
                
                <div class="guide-section" data-phase="closing">
                  <h3 class="font-bold text-orange-600 mb-2">第4段階: クロージング</h3>
                  <div class="text-sm text-gray-700 space-y-2" id="closing-phrases">
                    読み込み中...
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- 右側: 記録シート -->
          <div class="lg:col-span-2">
            <form id="consultation-form" class="space-y-6">
              <!-- 受付情報 -->
              <div class="bg-white rounded-lg shadow-md p-6">
                <h2 class="text-xl font-bold text-gray-800 mb-4 flex items-center border-b pb-2">
                  <i class="fas fa-info-circle mr-2 text-blue-600"></i>
                  受付情報
                </h2>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">受付日時 *</label>
                    <input type="datetime-local" id="reception_datetime" required
                           class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500">
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">対応者 *</label>
                    <select id="staff_name" required
                            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500">
                      <option value="">選択してください</option>
                    </select>
                  </div>
                </div>
              </div>

              <!-- 基本情報 -->
              <div class="bg-white rounded-lg shadow-md p-6">
                <h2 class="text-xl font-bold text-gray-800 mb-4 flex items-center border-b pb-2">
                  <i class="fas fa-user mr-2 text-green-600"></i>
                  基本情報
                </h2>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">お名前</label>
                    <input type="text" id="caller_name"
                           class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                           placeholder="匿名でも構いません">
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">年齢</label>
                    <input type="number" id="caller_age" min="0" max="150"
                           class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500">
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">性別</label>
                    <select id="caller_gender"
                            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500">
                      <option value="">選択してください</option>
                      <option value="男性">男性</option>
                      <option value="女性">女性</option>
                      <option value="その他">その他</option>
                    </select>
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">電話番号</label>
                    <input type="tel" id="caller_phone"
                           class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                           placeholder="080-1234-5678">
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">相談者の関係</label>
                    <select id="caller_relationship"
                            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                            onchange="toggleRelationshipDetail(this.value)">
                      <option value="">選択してください</option>
                      <option value="本人">本人</option>
                      <option value="家族">家族</option>
                      <option value="医療機関">医療機関</option>
                      <option value="行政">行政</option>
                      <option value="その他">その他</option>
                    </select>
                  </div>
                  <div id="relationship_detail_container" style="display:none;">
                    <label class="block text-sm font-medium text-gray-700 mb-1">続柄・詳細</label>
                    <input type="text" id="caller_relationship_detail"
                           class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                           placeholder="例: 母、兄弟、施設名など">
                  </div>
                </div>
              </div>

              <!-- 依存症情報 -->
              <div class="bg-white rounded-lg shadow-md p-6">
                <h2 class="text-xl font-bold text-gray-800 mb-4 flex items-center border-b pb-2">
                  <i class="fas fa-heartbeat mr-2 text-red-600"></i>
                  依存症情報
                </h2>
                <div class="mb-4">
                  <label class="block text-sm font-medium text-gray-700 mb-2">依存症の種類（複数選択可）</label>
                  <div class="grid grid-cols-2 md:grid-cols-3 gap-2" id="addiction_types_container">
                    <!-- JavaScriptで生成 -->
                  </div>
                </div>
                <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">期間</label>
                    <input type="text" id="addiction_period"
                           class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                           placeholder="例: 5年、1年半">
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">頻度</label>
                    <input type="text" id="addiction_frequency"
                           class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                           placeholder="例: 毎日、週3回">
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">重症度</label>
                    <input type="text" id="addiction_severity"
                           class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                           placeholder="例: 軽度、中度、重度">
                  </div>
                </div>
              </div>

              <!-- 医療・治療歴 -->
              <div class="bg-white rounded-lg shadow-md p-6">
                <h2 class="text-xl font-bold text-gray-800 mb-4 flex items-center border-b pb-2">
                  <i class="fas fa-hospital mr-2 text-purple-600"></i>
                  医療・治療歴
                </h2>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">入院歴</label>
                    <select id="hospitalization_history" onchange="toggleHospitalDetail(this.value)"
                            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500">
                      <option value="">選択してください</option>
                      <option value="あり">あり</option>
                      <option value="なし">なし</option>
                    </select>
                  </div>
                  <div id="hospitalization_detail" style="display:none;">
                    <label class="block text-sm font-medium text-gray-700 mb-1">施設名</label>
                    <input type="text" id="hospitalization_facility"
                           class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500">
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">通院歴</label>
                    <select id="outpatient_history" onchange="toggleOutpatientDetail(this.value)"
                            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500">
                      <option value="">選択してください</option>
                      <option value="あり">あり</option>
                      <option value="なし">なし</option>
                    </select>
                  </div>
                  <div id="outpatient_detail" style="display:none;">
                    <label class="block text-sm font-medium text-gray-700 mb-1">施設名</label>
                    <input type="text" id="outpatient_facility"
                           class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500">
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">服薬状況</label>
                    <select id="medication_status" onchange="toggleMedicationDetail(this.value)"
                            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500">
                      <option value="">選択してください</option>
                      <option value="あり">あり</option>
                      <option value="なし">なし</option>
                    </select>
                  </div>
                  <div id="medication_detail" style="display:none;">
                    <label class="block text-sm font-medium text-gray-700 mb-1">薬名</label>
                    <input type="text" id="medication_name"
                           class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500">
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">他施設利用</label>
                    <select id="other_facility_use" onchange="toggleOtherFacilityDetail(this.value)"
                            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500">
                      <option value="">選択してください</option>
                      <option value="あり">あり</option>
                      <option value="なし">なし</option>
                    </select>
                  </div>
                  <div id="other_facility_detail" style="display:none;">
                    <label class="block text-sm font-medium text-gray-700 mb-1">施設名</label>
                    <input type="text" id="other_facility_name"
                           class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500">
                  </div>
                </div>
              </div>

              <!-- 緊急度評価 -->
              <div class="bg-white rounded-lg shadow-md p-6 border-2 border-red-200">
                <h2 class="text-xl font-bold text-red-600 mb-4 flex items-center border-b pb-2">
                  <i class="fas fa-exclamation-triangle mr-2"></i>
                  緊急度評価
                </h2>
                <div class="mb-4 space-y-2">
                  <label class="flex items-center space-x-2 cursor-pointer">
                    <input type="checkbox" id="emergency_use_24h" class="w-5 h-5 text-red-600 rounded focus:ring-red-500">
                    <span class="text-sm">24時間以内の使用がある</span>
                  </label>
                  <label class="flex items-center space-x-2 cursor-pointer">
                    <input type="checkbox" id="emergency_withdrawal" class="w-5 h-5 text-red-600 rounded focus:ring-red-500">
                    <span class="text-sm">離脱症状がある</span>
                  </label>
                  <label class="flex items-center space-x-2 cursor-pointer">
                    <input type="checkbox" id="emergency_self_harm" class="w-5 h-5 text-red-600 rounded focus:ring-red-500">
                    <span class="text-sm">自傷・他害の恐れがある</span>
                  </label>
                  <label class="flex items-center space-x-2 cursor-pointer">
                    <input type="checkbox" id="emergency_medical_needed" class="w-5 h-5 text-red-600 rounded focus:ring-red-500">
                    <span class="text-sm">医療機関への受診が必要</span>
                  </label>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">緊急度判定 *</label>
                  <select id="emergency_level" required
                          class="w-full px-3 py-2 border-2 border-red-300 rounded-md focus:ring-2 focus:ring-red-500">
                    <option value="">選択してください</option>
                    <option value="高" class="text-red-600 font-bold">高（即日対応必要）</option>
                    <option value="中" class="text-yellow-600 font-bold">中（3日以内対応）</option>
                    <option value="低" class="text-green-600 font-bold">低（1週間以内対応）</option>
                  </select>
                </div>
              </div>

              <!-- 相談内容 -->
              <div class="bg-white rounded-lg shadow-md p-6">
                <h2 class="text-xl font-bold text-gray-800 mb-4 flex items-center border-b pb-2">
                  <i class="fas fa-comment-dots mr-2 text-blue-600"></i>
                  相談内容・特記事項
                </h2>
                <div class="space-y-4">
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">相談内容</label>
                    <textarea id="consultation_content" rows="4"
                              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                              placeholder="相談者からの話を記録してください..."></textarea>
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">特記事項・備考</label>
                    <textarea id="notes" rows="3"
                              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                              placeholder="その他、気になった点や重要事項を記録してください..."></textarea>
                  </div>
                </div>
              </div>

              <!-- 次のアクション -->
              <div class="bg-white rounded-lg shadow-md p-6">
                <h2 class="text-xl font-bold text-gray-800 mb-4 flex items-center border-b pb-2">
                  <i class="fas fa-tasks mr-2 text-green-600"></i>
                  次のアクション
                </h2>
                <div class="space-y-4">
                  <div class="flex items-center space-x-4">
                    <label class="flex items-center space-x-2 cursor-pointer">
                      <input type="checkbox" id="interview_scheduled" onchange="toggleInterviewDate(this.checked)"
                             class="w-5 h-5 text-blue-600 rounded focus:ring-blue-500">
                      <span class="text-sm font-medium">面談予約</span>
                    </label>
                    <input type="datetime-local" id="interview_datetime" disabled
                           class="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100">
                  </div>
                  
                  <div class="flex items-center space-x-4">
                    <label class="flex items-center space-x-2 cursor-pointer">
                      <input type="checkbox" id="followup_scheduled" onchange="toggleFollowupDate(this.checked)"
                             class="w-5 h-5 text-blue-600 rounded focus:ring-blue-500">
                      <span class="text-sm font-medium">フォローアップ</span>
                    </label>
                    <input type="datetime-local" id="followup_datetime" disabled
                           class="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100">
                  </div>
                  
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">連携先（複数選択可）</label>
                    <div class="grid grid-cols-2 md:grid-cols-4 gap-2">
                      <label class="flex items-center space-x-2">
                        <input type="checkbox" value="医療機関" class="coordination-checkbox">
                        <span class="text-sm">医療機関</span>
                      </label>
                      <label class="flex items-center space-x-2">
                        <input type="checkbox" value="行政" class="coordination-checkbox">
                        <span class="text-sm">行政</span>
                      </label>
                      <label class="flex items-center space-x-2">
                        <input type="checkbox" value="家族" class="coordination-checkbox">
                        <span class="text-sm">家族</span>
                      </label>
                      <label class="flex items-center space-x-2">
                        <input type="checkbox" value="その他" class="coordination-checkbox">
                        <span class="text-sm">その他</span>
                      </label>
                    </div>
                  </div>
                  
                  <div class="flex items-center space-x-4">
                    <label class="flex items-center space-x-2 cursor-pointer">
                      <input type="checkbox" id="report_completed" onchange="toggleReportTo(this.checked)"
                             class="w-5 h-5 text-blue-600 rounded focus:ring-blue-500">
                      <span class="text-sm font-medium">上級スタッフへ報告</span>
                    </label>
                    <input type="text" id="report_to" disabled placeholder="報告先"
                           class="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100">
                  </div>
                </div>
              </div>

              <!-- 対応完了チェック -->
              <div class="bg-white rounded-lg shadow-md p-6 border-2 border-green-200">
                <h2 class="text-xl font-bold text-green-600 mb-4 flex items-center border-b pb-2">
                  <i class="fas fa-check-circle mr-2"></i>
                  対応完了チェックリスト
                </h2>
                <div class="space-y-2">
                  <label class="flex items-center space-x-2 cursor-pointer">
                    <input type="checkbox" id="check_name_contact" class="w-5 h-5 text-green-600 rounded focus:ring-green-500">
                    <span class="text-sm">名前・連絡先を確認</span>
                  </label>
                  <label class="flex items-center space-x-2 cursor-pointer">
                    <input type="checkbox" id="check_addiction_type" class="w-5 h-5 text-green-600 rounded focus:ring-green-500">
                    <span class="text-sm">依存症の種類を把握</span>
                  </label>
                  <label class="flex items-center space-x-2 cursor-pointer">
                    <input type="checkbox" id="check_emergency_level" class="w-5 h-5 text-green-600 rounded focus:ring-green-500">
                    <span class="text-sm">緊急度を評価</span>
                  </label>
                  <label class="flex items-center space-x-2 cursor-pointer">
                    <input type="checkbox" id="check_next_action" class="w-5 h-5 text-green-600 rounded focus:ring-green-500">
                    <span class="text-sm">次のアクションを決定</span>
                  </label>
                  <label class="flex items-center space-x-2 cursor-pointer">
                    <input type="checkbox" id="check_followup_date" class="w-5 h-5 text-green-600 rounded focus:ring-green-500">
                    <span class="text-sm">フォローアップ日を設定</span>
                  </label>
                  <label class="flex items-center space-x-2 cursor-pointer">
                    <input type="checkbox" id="check_record_completed" class="w-5 h-5 text-green-600 rounded focus:ring-green-500">
                    <span class="text-sm">記録シート記入完了</span>
                  </label>
                </div>
              </div>

              <!-- 保存ボタン -->
              <div class="flex space-x-4">
                <button type="submit" 
                        class="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg shadow-lg transition-all">
                  <i class="fas fa-save mr-2"></i>
                  相談記録を保存
                </button>
                <button type="button" onclick="showHomePage()"
                        class="px-6 py-3 bg-gray-500 hover:bg-gray-600 text-white font-bold rounded-lg shadow-lg transition-all">
                  <i class="fas fa-times mr-2"></i>
                  キャンセル
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  `;

  // 初期化処理
  initConsultationForm();
  updateCurrentTime();
  setInterval(updateCurrentTime, 1000);
}

// ==========================================
// ユーティリティ関数
// ==========================================

function groupBy(array, key) {
  return array.reduce((result, item) => {
    const group = item[key];
    if (!result[group]) {
      result[group] = [];
    }
    result[group].push(item);
    return result;
  }, {});
}

function getEmergencyCount(stats, level) {
  const item = stats.find(s => s.emergency_level === level);
  return item ? item.count : 0;
}

function formatDateTime(datetime) {
  if (!datetime) return '';
  const date = new Date(datetime);
  return date.toLocaleString('ja-JP', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });
}

function updateCurrentTime() {
  const now = new Date();
  const timeStr = now.toLocaleString('ja-JP', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });
  const elem = document.getElementById('current-time');
  if (elem) elem.textContent = timeStr;
}

function showError(message) {
  alert('エラー: ' + message);
}

function showSuccess(message) {
  alert('成功: ' + message);
}

// ==========================================
// フォーム関連
// ==========================================

async function initConsultationForm() {
  // 現在時刻を設定
  const now = new Date();
  const localDateTime = new Date(now.getTime() - now.getTimezoneOffset() * 60000)
    .toISOString()
    .slice(0, 16);
  document.getElementById('reception_datetime').value = localDateTime;

  // スタッフリストを読み込み
  const staff = await loadStaffList();
  const staffSelect = document.getElementById('staff_name');
  staff.forEach(s => {
    const option = document.createElement('option');
    option.value = s.name;
    option.textContent = `${s.name}${s.role ? ' (' + s.role + ')' : ''}`;
    staffSelect.appendChild(option);
  });

  // 依存症チェックボックス生成
  const container = document.getElementById('addiction_types_container');
  ADDICTION_TYPES.forEach(type => {
    const label = document.createElement('label');
    label.className = 'flex items-center space-x-2';
    label.innerHTML = `
      <input type="checkbox" value="${type}" class="addiction-type-checkbox rounded text-blue-600">
      <span class="text-sm">${type}</span>
    `;
    container.appendChild(label);
  });

  // フレーズを読み込み
  await loadAndDisplayPhrases();

  // フォーム送信イベント
  document.getElementById('consultation-form').addEventListener('submit', handleFormSubmit);
}

async function loadAndDisplayPhrases() {
  const phrases = await loadPhrases();
  
  // オープニング
  if (phrases.opening) {
    displayPhrasesInContainer('opening-phrases', phrases.opening);
  }
  
  // 傾聴
  if (phrases.listening) {
    displayPhrasesInContainer('listening-phrases', phrases.listening);
  }
  
  // 情報提供
  if (phrases.information) {
    displayPhrasesInContainer('information-phrases', phrases.information);
  }
  
  // クロージング
  if (phrases.closing) {
    displayPhrasesInContainer('closing-phrases', phrases.closing);
  }
}

function displayPhrasesInContainer(containerId, phrases) {
  const container = document.getElementById(containerId);
  if (!container) return;
  
  container.innerHTML = phrases.map(p => {
    let badgeClass = 'bg-blue-100 text-blue-800';
    if (p.phrase_type === 'NG例') badgeClass = 'bg-red-100 text-red-800';
    else if (p.phrase_type === 'ルール') badgeClass = 'bg-green-100 text-green-800';
    else if (p.phrase_type === '注意') badgeClass = 'bg-yellow-100 text-yellow-800';
    
    return `
      <div class="p-2 bg-gray-50 rounded border border-gray-200">
        <span class="inline-block px-2 py-1 text-xs font-semibold rounded ${badgeClass} mb-1">
          ${p.phrase_type}
        </span>
        <p class="text-sm">${p.phrase_text}</p>
      </div>
    `;
  }).join('');
}

function toggleRelationshipDetail(value) {
  const container = document.getElementById('relationship_detail_container');
  container.style.display = (value === '家族' || value === 'その他') ? 'block' : 'none';
}

function toggleHospitalDetail(value) {
  document.getElementById('hospitalization_detail').style.display = value === 'あり' ? 'block' : 'none';
}

function toggleOutpatientDetail(value) {
  document.getElementById('outpatient_detail').style.display = value === 'あり' ? 'block' : 'none';
}

function toggleMedicationDetail(value) {
  document.getElementById('medication_detail').style.display = value === 'あり' ? 'block' : 'none';
}

function toggleOtherFacilityDetail(value) {
  document.getElementById('other_facility_detail').style.display = value === 'あり' ? 'block' : 'none';
}

function toggleInterviewDate(checked) {
  document.getElementById('interview_datetime').disabled = !checked;
}

function toggleFollowupDate(checked) {
  document.getElementById('followup_datetime').disabled = !checked;
}

function toggleReportTo(checked) {
  document.getElementById('report_to').disabled = !checked;
}

async function handleFormSubmit(e) {
  e.preventDefault();
  
  // チェックリストの確認
  const checkCompleted = document.getElementById('check_record_completed').checked;
  if (!checkCompleted) {
    if (!confirm('記録シートが完全に記入されていない可能性があります。保存しますか？')) {
      return;
    }
  }
  
  // フォームデータ収集
  const formData = collectFormData();
  
  try {
    const result = await saveConsultation(formData);
    if (result.success) {
      showSuccess('相談記録を保存しました');
      showHomePage();
    } else {
      showError(result.message || '保存に失敗しました');
    }
  } catch (error) {
    showError('保存中にエラーが発生しました: ' + error.message);
  }
}

function collectFormData() {
  // 依存症種類を収集
  const addictionTypes = Array.from(document.querySelectorAll('.addiction-type-checkbox:checked'))
    .map(cb => cb.value);
  
  // 連携先を収集
  const coordination = Array.from(document.querySelectorAll('.coordination-checkbox:checked'))
    .map(cb => cb.value);
  
  return {
    reception_datetime: document.getElementById('reception_datetime').value,
    staff_name: document.getElementById('staff_name').value,
    caller_name: document.getElementById('caller_name').value || null,
    caller_age: document.getElementById('caller_age').value ? parseInt(document.getElementById('caller_age').value) : null,
    caller_gender: document.getElementById('caller_gender').value || null,
    caller_phone: document.getElementById('caller_phone').value || null,
    caller_relationship: document.getElementById('caller_relationship').value || null,
    caller_relationship_detail: document.getElementById('caller_relationship_detail').value || null,
    addiction_types: JSON.stringify(addictionTypes),
    addiction_period: document.getElementById('addiction_period').value || null,
    addiction_frequency: document.getElementById('addiction_frequency').value || null,
    addiction_severity: document.getElementById('addiction_severity').value || null,
    hospitalization_history: document.getElementById('hospitalization_history').value || null,
    hospitalization_facility: document.getElementById('hospitalization_facility').value || null,
    outpatient_history: document.getElementById('outpatient_history').value || null,
    outpatient_facility: document.getElementById('outpatient_facility').value || null,
    medication_status: document.getElementById('medication_status').value || null,
    medication_name: document.getElementById('medication_name').value || null,
    other_facility_use: document.getElementById('other_facility_use').value || null,
    other_facility_name: document.getElementById('other_facility_name').value || null,
    emergency_use_24h: document.getElementById('emergency_use_24h').checked,
    emergency_withdrawal: document.getElementById('emergency_withdrawal').checked,
    emergency_self_harm: document.getElementById('emergency_self_harm').checked,
    emergency_medical_needed: document.getElementById('emergency_medical_needed').checked,
    emergency_level: document.getElementById('emergency_level').value,
    consultation_content: document.getElementById('consultation_content').value || null,
    notes: document.getElementById('notes').value || null,
    interview_scheduled: document.getElementById('interview_scheduled').checked,
    interview_datetime: document.getElementById('interview_datetime').value || null,
    followup_scheduled: document.getElementById('followup_scheduled').checked,
    followup_datetime: document.getElementById('followup_datetime').value || null,
    coordination_needed: JSON.stringify(coordination),
    report_completed: document.getElementById('report_completed').checked,
    report_to: document.getElementById('report_to').value || null,
    check_name_contact: document.getElementById('check_name_contact').checked,
    check_addiction_type: document.getElementById('check_addiction_type').checked,
    check_emergency_level: document.getElementById('check_emergency_level').checked,
    check_next_action: document.getElementById('check_next_action').checked,
    check_followup_date: document.getElementById('check_followup_date').checked,
    check_record_completed: document.getElementById('check_record_completed').checked
  };
}

// ==========================================
// 相談履歴ページ
// ==========================================

async function showHistoryPage() {
  const app = document.getElementById('app');
  app.innerHTML = `
    <div class="min-h-screen bg-gray-50">
      <!-- ヘッダー -->
      <header class="bg-gradient-to-r from-green-600 to-green-800 text-white shadow-lg">
        <div class="container mx-auto px-4 py-4">
          <div class="flex items-center justify-between">
            <div class="flex items-center space-x-4">
              <button onclick="showHomePage()" class="hover:bg-green-700 p-2 rounded">
                <i class="fas fa-arrow-left text-xl"></i>
              </button>
              <h1 class="text-2xl font-bold">相談履歴</h1>
            </div>
            <button onclick="exportToCSV()" class="bg-white text-green-700 px-4 py-2 rounded-lg hover:bg-green-50 font-semibold">
              <i class="fas fa-download mr-2"></i>CSV出力
            </button>
          </div>
        </div>
      </header>

      <main class="container mx-auto px-4 py-6">
        <!-- 検索フォーム -->
        <div class="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 class="text-xl font-bold text-gray-800 mb-4 flex items-center">
            <i class="fas fa-search mr-2 text-green-600"></i>
            検索条件
          </h2>
          <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">キーワード</label>
              <input type="text" id="search_keyword" placeholder="名前、相談内容など"
                     class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500">
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">緊急度</label>
              <select id="search_emergency" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500">
                <option value="">すべて</option>
                <option value="高">高</option>
                <option value="中">中</option>
                <option value="低">低</option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">開始日</label>
              <input type="date" id="search_date_from"
                     class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500">
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">終了日</label>
              <input type="date" id="search_date_to"
                     class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500">
            </div>
          </div>
          <div class="mt-4 flex space-x-2">
            <button onclick="performSearch()" 
                    class="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-semibold">
              <i class="fas fa-search mr-2"></i>検索
            </button>
            <button onclick="clearSearch()" 
                    class="bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded-lg font-semibold">
              <i class="fas fa-redo mr-2"></i>クリア
            </button>
          </div>
        </div>

        <!-- 相談履歴リスト -->
        <div class="bg-white rounded-lg shadow-md p-6">
          <h2 class="text-xl font-bold text-gray-800 mb-4">相談記録一覧</h2>
          <div id="history-list" class="space-y-4">
            <div class="text-center py-8">
              <i class="fas fa-spinner fa-spin text-4xl text-gray-400"></i>
              <p class="mt-4 text-gray-600">データを読み込み中...</p>
            </div>
          </div>
          
          <!-- ページネーション -->
          <div id="pagination" class="mt-6"></div>
        </div>
      </main>
    </div>
  `;

  // データを読み込み
  await loadHistoryData();
}

async function loadHistoryData(page = 1) {
  const data = await loadConsultations(page, 20);
  const container = document.getElementById('history-list');
  const paginationContainer = document.getElementById('pagination');

  if (!data || !data.consultations || data.consultations.length === 0) {
    container.innerHTML = `
      <div class="text-center py-8">
        <i class="fas fa-inbox text-6xl text-gray-300"></i>
        <p class="mt-4 text-gray-600">相談記録がありません</p>
      </div>
    `;
    return;
  }

  // 相談リストを表示
  container.innerHTML = data.consultations.map(consultation => {
    const emergencyColor = {
      '高': 'bg-red-100 text-red-800',
      '中': 'bg-yellow-100 text-yellow-800',
      '低': 'bg-green-100 text-green-800'
    }[consultation.emergency_level] || 'bg-gray-100 text-gray-800';

    const addictionTypes = consultation.addiction_types 
      ? JSON.parse(consultation.addiction_types).slice(0, 3).join(', ')
      : '未記入';

    return `
      <div class="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
           onclick="showConsultationDetail(${consultation.id})">
        <div class="flex items-start justify-between">
          <div class="flex-1">
            <div class="flex items-center space-x-3 mb-2">
              <h3 class="text-lg font-bold text-gray-800">
                ${consultation.caller_name || '匿名'}
              </h3>
              <span class="px-3 py-1 text-xs font-semibold rounded-full ${emergencyColor}">
                緊急度: ${consultation.emergency_level}
              </span>
              ${consultation.caller_age ? `<span class="text-sm text-gray-600">${consultation.caller_age}歳</span>` : ''}
              ${consultation.caller_gender ? `<span class="text-sm text-gray-600">${consultation.caller_gender}</span>` : ''}
            </div>
            <div class="grid grid-cols-2 gap-2 text-sm text-gray-600 mb-2">
              <div><i class="fas fa-calendar mr-1 text-green-600"></i>${formatDateTime(consultation.reception_datetime)}</div>
              <div><i class="fas fa-user mr-1 text-green-600"></i>対応者: ${consultation.staff_name}</div>
              <div><i class="fas fa-heartbeat mr-1 text-green-600"></i>${addictionTypes}</div>
              <div><i class="fas fa-phone mr-1 text-green-600"></i>${consultation.caller_relationship || '未記入'}</div>
            </div>
            ${consultation.consultation_content ? `
              <p class="text-sm text-gray-700 line-clamp-2">
                ${consultation.consultation_content.substring(0, 100)}${consultation.consultation_content.length > 100 ? '...' : ''}
              </p>
            ` : ''}
          </div>
          <div class="ml-4">
            <button onclick="event.stopPropagation(); exportToPDF(${consultation.id})" 
                    class="text-blue-600 hover:text-blue-800 p-2" title="PDF出力">
              <i class="fas fa-file-pdf text-xl"></i>
            </button>
          </div>
        </div>
      </div>
    `;
  }).join('');

  // ページネーション
  if (data.pagination.totalPages > 1) {
    paginationContainer.innerHTML = `
      <div class="flex items-center justify-center space-x-2">
        ${data.pagination.page > 1 ? `
          <button onclick="loadHistoryData(${data.pagination.page - 1})" 
                  class="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
            <i class="fas fa-chevron-left"></i>
          </button>
        ` : ''}
        <span class="text-gray-700 font-medium">
          ${data.pagination.page} / ${data.pagination.totalPages} ページ
          （全 ${data.pagination.total} 件）
        </span>
        ${data.pagination.page < data.pagination.totalPages ? `
          <button onclick="loadHistoryData(${data.pagination.page + 1})" 
                  class="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
            <i class="fas fa-chevron-right"></i>
          </button>
        ` : ''}
      </div>
    `;
  }
}

async function performSearch() {
  const keyword = document.getElementById('search_keyword').value;
  const emergency = document.getElementById('search_emergency').value;
  const dateFrom = document.getElementById('search_date_from').value;
  const dateTo = document.getElementById('search_date_to').value;

  const params = {};
  if (keyword) params.keyword = keyword;
  if (emergency) params.emergency_level = emergency;
  if (dateFrom) params.date_from = dateFrom;
  if (dateTo) params.date_to = dateTo;

  const results = await searchConsultations(params);
  const container = document.getElementById('history-list');
  const paginationContainer = document.getElementById('pagination');

  if (!results || results.length === 0) {
    container.innerHTML = `
      <div class="text-center py-8">
        <i class="fas fa-search text-6xl text-gray-300"></i>
        <p class="mt-4 text-gray-600">検索結果が見つかりませんでした</p>
      </div>
    `;
    paginationContainer.innerHTML = '';
    return;
  }

  // 検索結果を表示（同じフォーマット）
  container.innerHTML = results.map(consultation => {
    const emergencyColor = {
      '高': 'bg-red-100 text-red-800',
      '中': 'bg-yellow-100 text-yellow-800',
      '低': 'bg-green-100 text-green-800'
    }[consultation.emergency_level] || 'bg-gray-100 text-gray-800';

    const addictionTypes = consultation.addiction_types 
      ? JSON.parse(consultation.addiction_types).slice(0, 3).join(', ')
      : '未記入';

    return `
      <div class="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
           onclick="showConsultationDetail(${consultation.id})">
        <div class="flex items-start justify-between">
          <div class="flex-1">
            <div class="flex items-center space-x-3 mb-2">
              <h3 class="text-lg font-bold text-gray-800">
                ${consultation.caller_name || '匿名'}
              </h3>
              <span class="px-3 py-1 text-xs font-semibold rounded-full ${emergencyColor}">
                緊急度: ${consultation.emergency_level}
              </span>
            </div>
            <div class="grid grid-cols-2 gap-2 text-sm text-gray-600 mb-2">
              <div><i class="fas fa-calendar mr-1 text-green-600"></i>${formatDateTime(consultation.reception_datetime)}</div>
              <div><i class="fas fa-user mr-1 text-green-600"></i>対応者: ${consultation.staff_name}</div>
              <div><i class="fas fa-heartbeat mr-1 text-green-600"></i>${addictionTypes}</div>
            </div>
          </div>
          <div class="ml-4">
            <button onclick="event.stopPropagation(); exportToPDF(${consultation.id})" 
                    class="text-blue-600 hover:text-blue-800 p-2" title="PDF出力">
              <i class="fas fa-file-pdf text-xl"></i>
            </button>
          </div>
        </div>
      </div>
    `;
  }).join('');

  paginationContainer.innerHTML = `
    <div class="text-center text-gray-600">
      ${results.length} 件の検索結果
    </div>
  `;
}

function clearSearch() {
  document.getElementById('search_keyword').value = '';
  document.getElementById('search_emergency').value = '';
  document.getElementById('search_date_from').value = '';
  document.getElementById('search_date_to').value = '';
  loadHistoryData(1);
}

async function showConsultationDetail(id) {
  try {
    const response = await axios.get(`${API_BASE}/consultations/${id}`);
    const consultation = response.data.consultation;

    const addictionTypes = consultation.addiction_types 
      ? JSON.parse(consultation.addiction_types).join(', ')
      : '未記入';
    
    const coordination = consultation.coordination_needed
      ? JSON.parse(consultation.coordination_needed).join(', ')
      : '未記入';

    const app = document.getElementById('app');
    app.innerHTML = `
      <div class="min-h-screen bg-gray-50">
        <header class="bg-gradient-to-r from-blue-600 to-blue-800 text-white shadow-lg">
          <div class="container mx-auto px-4 py-4">
            <div class="flex items-center justify-between">
              <div class="flex items-center space-x-4">
                <button onclick="showHistoryPage()" class="hover:bg-blue-700 p-2 rounded">
                  <i class="fas fa-arrow-left text-xl"></i>
                </button>
                <h1 class="text-2xl font-bold">相談記録詳細</h1>
              </div>
              <button onclick="exportToPDF(${id})" class="bg-white text-blue-700 px-4 py-2 rounded-lg hover:bg-blue-50 font-semibold">
                <i class="fas fa-file-pdf mr-2"></i>PDF出力
              </button>
            </div>
          </div>
        </header>

        <main class="container mx-auto px-4 py-6 max-w-4xl">
          <div class="space-y-6">
            <!-- 基本情報 -->
            <div class="bg-white rounded-lg shadow-md p-6">
              <h2 class="text-xl font-bold text-gray-800 mb-4 border-b pb-2">基本情報</h2>
              <div class="grid grid-cols-2 gap-4">
                <div><span class="font-medium">受付日時:</span> ${formatDateTime(consultation.reception_datetime)}</div>
                <div><span class="font-medium">対応者:</span> ${consultation.staff_name}</div>
                <div><span class="font-medium">お名前:</span> ${consultation.caller_name || '匿名'}</div>
                <div><span class="font-medium">年齢:</span> ${consultation.caller_age ? consultation.caller_age + '歳' : '未記入'}</div>
                <div><span class="font-medium">性別:</span> ${consultation.caller_gender || '未記入'}</div>
                <div><span class="font-medium">電話番号:</span> ${consultation.caller_phone || '未記入'}</div>
                <div><span class="font-medium">相談者:</span> ${consultation.caller_relationship || '未記入'}</div>
                ${consultation.caller_relationship_detail ? `<div><span class="font-medium">詳細:</span> ${consultation.caller_relationship_detail}</div>` : ''}
              </div>
            </div>

            <!-- 依存症情報 -->
            <div class="bg-white rounded-lg shadow-md p-6">
              <h2 class="text-xl font-bold text-gray-800 mb-4 border-b pb-2">依存症情報</h2>
              <div class="grid grid-cols-2 gap-4">
                <div class="col-span-2"><span class="font-medium">種類:</span> ${addictionTypes}</div>
                <div><span class="font-medium">期間:</span> ${consultation.addiction_period || '未記入'}</div>
                <div><span class="font-medium">頻度:</span> ${consultation.addiction_frequency || '未記入'}</div>
                <div><span class="font-medium">重症度:</span> ${consultation.addiction_severity || '未記入'}</div>
              </div>
            </div>

            <!-- 緊急度評価 -->
            <div class="bg-white rounded-lg shadow-md p-6 border-2 ${consultation.emergency_level === '高' ? 'border-red-300' : consultation.emergency_level === '中' ? 'border-yellow-300' : 'border-green-300'}">
              <h2 class="text-xl font-bold mb-4 border-b pb-2 ${consultation.emergency_level === '高' ? 'text-red-600' : consultation.emergency_level === '中' ? 'text-yellow-600' : 'text-green-600'}">
                緊急度評価: ${consultation.emergency_level}
              </h2>
              <div class="space-y-2">
                ${consultation.emergency_use_24h ? '<div class="text-red-600">✓ 24時間以内の使用がある</div>' : ''}
                ${consultation.emergency_withdrawal ? '<div class="text-red-600">✓ 離脱症状がある</div>' : ''}
                ${consultation.emergency_self_harm ? '<div class="text-red-600">✓ 自傷・他害の恐れがある</div>' : ''}
                ${consultation.emergency_medical_needed ? '<div class="text-red-600">✓ 医療機関への受診が必要</div>' : ''}
              </div>
            </div>

            <!-- 相談内容 -->
            <div class="bg-white rounded-lg shadow-md p-6">
              <h2 class="text-xl font-bold text-gray-800 mb-4 border-b pb-2">相談内容</h2>
              <p class="text-gray-700 whitespace-pre-wrap">${consultation.consultation_content || '未記入'}</p>
              ${consultation.notes ? `
                <div class="mt-4 pt-4 border-t">
                  <h3 class="font-medium text-gray-800 mb-2">特記事項</h3>
                  <p class="text-gray-700 whitespace-pre-wrap">${consultation.notes}</p>
                </div>
              ` : ''}
            </div>

            <!-- 次のアクション -->
            <div class="bg-white rounded-lg shadow-md p-6">
              <h2 class="text-xl font-bold text-gray-800 mb-4 border-b pb-2">次のアクション</h2>
              <div class="space-y-2">
                ${consultation.interview_scheduled ? `<div>✓ 面談予約: ${formatDateTime(consultation.interview_datetime)}</div>` : ''}
                ${consultation.followup_scheduled ? `<div>✓ フォローアップ: ${formatDateTime(consultation.followup_datetime)}</div>` : ''}
                <div><span class="font-medium">連携先:</span> ${coordination}</div>
                ${consultation.report_completed ? `<div>✓ 報告済み (${consultation.report_to || ''})</div>` : ''}
              </div>
            </div>

            <div class="flex space-x-4">
              <button onclick="showHistoryPage()" class="flex-1 bg-gray-500 hover:bg-gray-600 text-white font-bold py-3 px-6 rounded-lg">
                <i class="fas fa-arrow-left mr-2"></i>一覧に戻る
              </button>
            </div>
          </div>
        </main>
      </div>
    `;
  } catch (error) {
    console.error('詳細取得エラー:', error);
    showError('相談記録の取得に失敗しました');
  }
}

// ==========================================
// 統計ダッシュボードページ
// ==========================================

async function showStatsPage() {
  const app = document.getElementById('app');
  app.innerHTML = `
    <div class="min-h-screen bg-gray-50">
      <header class="bg-gradient-to-r from-purple-600 to-purple-800 text-white shadow-lg">
        <div class="container mx-auto px-4 py-4">
          <div class="flex items-center justify-between">
            <div class="flex items-center space-x-4">
              <button onclick="showHomePage()" class="hover:bg-purple-700 p-2 rounded">
                <i class="fas fa-arrow-left text-xl"></i>
              </button>
              <h1 class="text-2xl font-bold">統計情報</h1>
            </div>
          </div>
        </div>
      </header>

      <main class="container mx-auto px-4 py-6">
        <!-- 概要統計 -->
        <div id="stats-overview" class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div class="text-center py-8">
            <i class="fas fa-spinner fa-spin text-4xl text-gray-400"></i>
          </div>
        </div>

        <!-- グラフエリア -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <!-- 緊急度別グラフ -->
          <div class="bg-white rounded-lg shadow-md p-6">
            <h2 class="text-xl font-bold text-gray-800 mb-4">緊急度別相談件数</h2>
            <canvas id="emergencyChart"></canvas>
          </div>

          <!-- 依存症種類別グラフ -->
          <div class="bg-white rounded-lg shadow-md p-6">
            <h2 class="text-xl font-bold text-gray-800 mb-4">依存症種類別統計（上位5件）</h2>
            <canvas id="addictionChart"></canvas>
          </div>

          <!-- 最近の相談 -->
          <div class="bg-white rounded-lg shadow-md p-6 lg:col-span-2">
            <h2 class="text-xl font-bold text-gray-800 mb-4">最近の相談（5件）</h2>
            <div id="recent-consultations">
              <div class="text-center py-4">
                <i class="fas fa-spinner fa-spin text-2xl text-gray-400"></i>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  `;

  // 統計データを読み込んでグラフ表示
  await loadAndDisplayStats();
}

async function loadAndDisplayStats() {
  const stats = await loadStats();
  
  if (!stats) {
    document.getElementById('stats-overview').innerHTML = `
      <div class="col-span-4 text-center py-8 text-gray-600">
        統計情報の取得に失敗しました
      </div>
    `;
    return;
  }

  // 概要統計を表示
  document.getElementById('stats-overview').innerHTML = `
    <div class="bg-white rounded-lg shadow-md p-6 text-center">
      <div class="text-4xl font-bold text-blue-600">${stats.totalConsultations}</div>
      <div class="text-sm text-gray-600 mt-2">総相談件数</div>
    </div>
    <div class="bg-white rounded-lg shadow-md p-6 text-center">
      <div class="text-4xl font-bold text-green-600">${stats.thisMonthConsultations}</div>
      <div class="text-sm text-gray-600 mt-2">今月の相談</div>
    </div>
    <div class="bg-white rounded-lg shadow-md p-6 text-center">
      <div class="text-4xl font-bold text-red-600">${getEmergencyCount(stats.emergencyStats, '高')}</div>
      <div class="text-sm text-gray-600 mt-2">緊急度：高</div>
    </div>
    <div class="bg-white rounded-lg shadow-md p-6 text-center">
      <div class="text-4xl font-bold text-yellow-600">${getEmergencyCount(stats.emergencyStats, '中')}</div>
      <div class="text-sm text-gray-600 mt-2">緊急度：中</div>
    </div>
  `;

  // 緊急度別グラフ（ドーナツチャート）
  const emergencyCtx = document.getElementById('emergencyChart').getContext('2d');
  new Chart(emergencyCtx, {
    type: 'doughnut',
    data: {
      labels: ['高', '中', '低'],
      datasets: [{
        data: [
          getEmergencyCount(stats.emergencyStats, '高'),
          getEmergencyCount(stats.emergencyStats, '中'),
          getEmergencyCount(stats.emergencyStats, '低')
        ],
        backgroundColor: ['#dc2626', '#f59e0b', '#10b981'],
        borderWidth: 2
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          position: 'bottom'
        }
      }
    }
  });

  // 依存症種類別グラフ（横棒グラフ）
  if (stats.addictionStats && stats.addictionStats.length > 0) {
    const addictionCtx = document.getElementById('addictionChart').getContext('2d');
    const labels = stats.addictionStats.map(item => {
      try {
        const types = JSON.parse(item.addiction_types);
        return types.slice(0, 2).join(', ');
      } catch {
        return item.addiction_types || '不明';
      }
    });
    const data = stats.addictionStats.map(item => item.count);

    new Chart(addictionCtx, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [{
          label: '件数',
          data: data,
          backgroundColor: '#8b5cf6',
          borderColor: '#7c3aed',
          borderWidth: 1
        }]
      },
      options: {
        indexAxis: 'y',
        responsive: true,
        plugins: {
          legend: {
            display: false
          }
        },
        scales: {
          x: {
            beginAtZero: true,
            ticks: {
              stepSize: 1
            }
          }
        }
      }
    });
  }

  // 最近の相談を表示
  if (stats.recentConsultations && stats.recentConsultations.length > 0) {
    document.getElementById('recent-consultations').innerHTML = `
      <div class="space-y-2">
        ${stats.recentConsultations.map(c => {
          const emergencyColor = {
            '高': 'text-red-600',
            '中': 'text-yellow-600',
            '低': 'text-green-600'
          }[c.emergency_level] || 'text-gray-600';
          
          return `
            <div class="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer"
                 onclick="showConsultationDetail(${c.id})">
              <div class="flex items-center space-x-4">
                <div class="text-sm">
                  <div class="font-medium">${c.caller_name || '匿名'}</div>
                  <div class="text-gray-600">${formatDateTime(c.reception_datetime)}</div>
                </div>
              </div>
              <div class="flex items-center space-x-3">
                <span class="${emergencyColor} font-semibold">緊急度: ${c.emergency_level}</span>
                <span class="text-gray-600">${c.staff_name}</span>
              </div>
            </div>
          `;
        }).join('')}
      </div>
    `;
  }
}

// ==========================================
// 対応マニュアルページ
// ==========================================

async function showManualPage() {
  const app = document.getElementById('app');
  app.innerHTML = `
    <div class="min-h-screen bg-gray-50">
      <header class="bg-gradient-to-r from-orange-600 to-orange-800 text-white shadow-lg">
        <div class="container mx-auto px-4 py-4">
          <div class="flex items-center justify-between">
            <div class="flex items-center space-x-4">
              <button onclick="showHomePage()" class="hover:bg-orange-700 p-2 rounded">
                <i class="fas fa-arrow-left text-xl"></i>
              </button>
              <h1 class="text-2xl font-bold">対応マニュアル</h1>
            </div>
          </div>
        </div>
      </header>

      <main class="container mx-auto px-4 py-6 max-w-6xl">
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <!-- 第1段階: オープニング -->
          <div class="bg-white rounded-lg shadow-md p-6">
            <h2 class="text-xl font-bold text-blue-600 mb-4 flex items-center">
              <i class="fas fa-door-open mr-2"></i>
              第1段階: オープニング（0-30秒）
            </h2>
            <div id="manual-opening" class="space-y-3">
              読み込み中...
            </div>
          </div>

          <!-- 第2段階: 傾聴・共感 -->
          <div class="bg-white rounded-lg shadow-md p-6">
            <h2 class="text-xl font-bold text-green-600 mb-4 flex items-center">
              <i class="fas fa-ear-listen mr-2"></i>
              第2段階: 傾聴・共感（30秒-5分）
            </h2>
            <div id="manual-listening" class="space-y-3">
              読み込み中...
            </div>
          </div>

          <!-- 第3段階: 情報提供 -->
          <div class="bg-white rounded-lg shadow-md p-6">
            <h2 class="text-xl font-bold text-purple-600 mb-4 flex items-center">
              <i class="fas fa-info-circle mr-2"></i>
              第3段階: 情報提供（5-10分）
            </h2>
            <div id="manual-information" class="space-y-3">
              読み込み中...
            </div>
          </div>

          <!-- 第4段階: クロージング -->
          <div class="bg-white rounded-lg shadow-md p-6">
            <h2 class="text-xl font-bold text-orange-600 mb-4 flex items-center">
              <i class="fas fa-handshake mr-2"></i>
              第4段階: クロージング
            </h2>
            <div id="manual-closing" class="space-y-3">
              読み込み中...
            </div>
          </div>

          <!-- 緊急対応 -->
          <div class="bg-white rounded-lg shadow-md p-6 lg:col-span-2 border-2 border-red-300">
            <h2 class="text-xl font-bold text-red-600 mb-4 flex items-center">
              <i class="fas fa-exclamation-triangle mr-2"></i>
              緊急対応フロー
            </h2>
            <div id="manual-emergency" class="space-y-3">
              読み込み中...
            </div>
          </div>
        </div>
      </main>
    </div>
  `;

  // フレーズを読み込んで表示
  await loadAndDisplayManual();
}

async function loadAndDisplayManual() {
  const phrases = await loadPhrases();

  // 各カテゴリーのフレーズを表示
  displayManualCategory('manual-opening', phrases.opening);
  displayManualCategory('manual-listening', phrases.listening);
  displayManualCategory('manual-information', phrases.information);
  displayManualCategory('manual-closing', phrases.closing);
  displayManualCategory('manual-emergency', phrases.emergency);
}

function displayManualCategory(containerId, phrases) {
  const container = document.getElementById(containerId);
  if (!container || !phrases || phrases.length === 0) {
    if (container) container.innerHTML = '<p class="text-gray-600">データがありません</p>';
    return;
  }

  container.innerHTML = phrases.map(p => {
    let badgeClass = 'bg-blue-100 text-blue-800';
    let iconClass = 'fa-check-circle';
    
    if (p.phrase_type === 'NG例') {
      badgeClass = 'bg-red-100 text-red-800';
      iconClass = 'fa-times-circle';
    } else if (p.phrase_type === 'ルール') {
      badgeClass = 'bg-green-100 text-green-800';
      iconClass = 'fa-book';
    } else if (p.phrase_type === '注意') {
      badgeClass = 'bg-yellow-100 text-yellow-800';
      iconClass = 'fa-exclamation-triangle';
    }

    return `
      <div class="p-4 bg-gray-50 rounded-lg border border-gray-200">
        <div class="flex items-start space-x-3">
          <i class="fas ${iconClass} text-xl mt-1 ${p.phrase_type === 'NG例' ? 'text-red-600' : 'text-green-600'}"></i>
          <div class="flex-1">
            <div class="flex items-center mb-2">
              <span class="inline-block px-3 py-1 text-xs font-semibold rounded-full ${badgeClass}">
                ${p.phrase_type}
              </span>
              ${p.situation ? `<span class="ml-2 text-sm text-gray-600">${p.situation}</span>` : ''}
            </div>
            <p class="text-gray-800 leading-relaxed">${p.phrase_text}</p>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

// ==========================================
// エクスポート機能
// ==========================================

async function exportToCSV() {
  try {
    const response = await axios.get(`${API_BASE}/consultations?page=1&limit=10000`);
    const consultations = response.data.consultations;

    if (!consultations || consultations.length === 0) {
      showError('エクスポートするデータがありません');
      return;
    }

    // CSVヘッダー
    const headers = [
      'ID', '受付日時', '対応者', '名前', '年齢', '性別', '電話番号', 
      '相談者の関係', '依存症種類', '期間', '頻度', '重症度',
      '緊急度', '相談内容', '特記事項', '作成日時'
    ];

    // CSVデータ作成
    const csvRows = [headers.join(',')];
    
    consultations.forEach(c => {
      const row = [
        c.id,
        `"${formatDateTime(c.reception_datetime)}"`,
        `"${c.staff_name}"`,
        `"${c.caller_name || ''}"`,
        c.caller_age || '',
        `"${c.caller_gender || ''}"`,
        `"${c.caller_phone || ''}"`,
        `"${c.caller_relationship || ''}"`,
        `"${c.addiction_types ? JSON.parse(c.addiction_types).join('; ') : ''}"`,
        `"${c.addiction_period || ''}"`,
        `"${c.addiction_frequency || ''}"`,
        `"${c.addiction_severity || ''}"`,
        `"${c.emergency_level}"`,
        `"${(c.consultation_content || '').replace(/"/g, '""')}"`,
        `"${(c.notes || '').replace(/"/g, '""')}"`,
        `"${formatDateTime(c.created_at)}"`
      ];
      csvRows.push(row.join(','));
    });

    // CSVファイルをダウンロード
    const csvContent = '\uFEFF' + csvRows.join('\n'); // BOM追加（Excel対応）
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', `相談記録_${new Date().toISOString().slice(0, 10)}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showSuccess('CSVファイルをダウンロードしました');
  } catch (error) {
    console.error('CSV出力エラー:', error);
    showError('CSV出力に失敗しました');
  }
}

async function exportToPDF(id) {
  try {
    const response = await axios.get(`${API_BASE}/consultations/${id}`);
    const c = response.data.consultation;

    // PDFライブラリ（jsPDF）を使用
    // 注: 実際の実装では jsPDF をCDN経由で読み込む必要があります
    showSuccess('PDF出力機能は次のアップデートで実装予定です');
    
    // 暫定的にブラウザの印刷ダイアログを表示
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head>
          <title>相談記録 - ${c.caller_name || '匿名'}</title>
          <style>
            body { font-family: 'MS PGothic', sans-serif; padding: 20px; }
            h1 { color: #2563eb; border-bottom: 2px solid #2563eb; padding-bottom: 10px; }
            h2 { color: #374151; margin-top: 20px; border-bottom: 1px solid #d1d5db; padding-bottom: 5px; }
            .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin: 10px 0; }
            .info-item { padding: 5px; }
            .label { font-weight: bold; }
            .emergency-high { color: #dc2626; font-weight: bold; }
            .emergency-mid { color: #f59e0b; font-weight: bold; }
            .emergency-low { color: #10b981; font-weight: bold; }
          </style>
        </head>
        <body>
          <h1>相模原ダルク 相談記録</h1>
          
          <h2>基本情報</h2>
          <div class="info-grid">
            <div class="info-item"><span class="label">受付日時:</span> ${formatDateTime(c.reception_datetime)}</div>
            <div class="info-item"><span class="label">対応者:</span> ${c.staff_name}</div>
            <div class="info-item"><span class="label">お名前:</span> ${c.caller_name || '匿名'}</div>
            <div class="info-item"><span class="label">年齢:</span> ${c.caller_age ? c.caller_age + '歳' : '未記入'}</div>
            <div class="info-item"><span class="label">性別:</span> ${c.caller_gender || '未記入'}</div>
            <div class="info-item"><span class="label">電話番号:</span> ${c.caller_phone || '未記入'}</div>
          </div>

          <h2>依存症情報</h2>
          <div class="info-item"><span class="label">種類:</span> ${c.addiction_types ? JSON.parse(c.addiction_types).join(', ') : '未記入'}</div>
          <div class="info-item"><span class="label">期間:</span> ${c.addiction_period || '未記入'}</div>
          <div class="info-item"><span class="label">頻度:</span> ${c.addiction_frequency || '未記入'}</div>

          <h2>緊急度評価</h2>
          <div class="info-item emergency-${c.emergency_level === '高' ? 'high' : c.emergency_level === '中' ? 'mid' : 'low'}">
            緊急度: ${c.emergency_level}
          </div>

          <h2>相談内容</h2>
          <div style="white-space: pre-wrap; padding: 10px; background: #f9fafb; border-radius: 5px;">
            ${c.consultation_content || '未記入'}
          </div>

          ${c.notes ? `
            <h2>特記事項</h2>
            <div style="white-space: pre-wrap; padding: 10px; background: #f9fafb; border-radius: 5px;">
              ${c.notes}
            </div>
          ` : ''}

          <div style="margin-top: 40px; text-align: center; color: #6b7280; font-size: 12px;">
            一般社団法人相模原ダルク | 代表理事: 田中秀泰
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  } catch (error) {
    console.error('PDF出力エラー:', error);
    showError('PDF出力に失敗しました');
  }
}
