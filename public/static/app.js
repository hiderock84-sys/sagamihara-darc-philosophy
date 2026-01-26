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
              <p class="text-sm text-blue-100">一般社団法人相模原ダルク</p>
              <p class="text-xs text-blue-200">代表理事: 田中秀泰</p>
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
// 他のページ表示関数（プレースホルダー）
// ==========================================

function showHistoryPage() {
  alert('相談履歴ページ - 開発中');
  // TODO: 実装予定
}

function showStatsPage() {
  alert('統計情報ページ - 開発中');
  // TODO: 実装予定
}

function showManualPage() {
  alert('対応マニュアルページ - 開発中');
  // TODO: 実装予定
}
