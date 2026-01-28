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
  '初期対応',
  '情報収集',
  '状況確認',
  '提案・説明',
  '次のステップ',
  '終了・フォローアップ'
];

// ==========================================
// 初期化
// ==========================================

document.addEventListener('DOMContentLoaded', async () => {
  await initApp();
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
    staffList = await response.json();
  } catch (error) {
    console.error('スタッフリスト取得エラー:', error);
    showError('スタッフリストの読み込みに失敗しました');
  }
}

async function loadPhrases() {
  try {
    const response = await fetch(`${API_BASE}/phrases`);
    if (!response.ok) throw new Error('フレーズ取得失敗');
    const phrases = await response.json();
    
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
  return `
    <header style="background: #1e40af; color: white; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
      <div style="max-width: 480px; margin: 0 auto; padding: 16px 20px;">
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
            <button onclick="showHomePage()" style="background: none; border: none; color: white; font-size: 24px; cursor: pointer; padding: 0; margin-right: 12px;">←</button>
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
    <footer style="background: #1f2937; color: white; margin-top: 48px; padding: 24px 0;">
      <div style="max-width: 480px; margin: 0 auto; padding: 0 20px; text-align: center;">
        <p style="font-size: 14px; margin: 0;">© 2026 一般社団法人相模原ダルク - 電話対応支援システム</p>
        <p style="font-size: 16px; font-weight: 600; margin: 12px 0 0 0;">人は必ずやり直せる--</p>
        <p style="font-size: 14px; color: #93c5fd; font-weight: 500; margin: 8px 0 0 0;">--相模原ダルクの挑戦--</p>
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
        <div onclick="showNewConsultation()" style="background: white; border-radius: 20px; padding: 20px; margin-bottom: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.08); cursor: pointer; display: flex; align-items: center;">
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
        <div onclick="showHistory()" style="background: white; border-radius: 20px; padding: 20px; margin-bottom: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.08); cursor: pointer; display: flex; align-items: center;">
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
        <div onclick="showStatistics()" style="background: white; border-radius: 20px; padding: 20px; margin-bottom: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.08); cursor: pointer; display: flex; align-items: center;">
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
        <div onclick="showManual()" style="background: white; border-radius: 20px; padding: 20px; margin-bottom: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.08); cursor: pointer; display: flex; align-items: center;">
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
              ${Object.keys(phrasesByCategory).map(category => 
                phrasesByCategory[category][phase] ? 
                  `<optgroup label="${category}">
                    ${phrasesByCategory[category][phase].map(p => `<option value="${p.id}">${p.phrase_text.substring(0, 50)}...</option>`).join('')}
                  </optgroup>` : ''
              ).join('')}
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
      showHomePage();
    }, 2000);
    
  } catch (error) {
    console.error('保存エラー:', error);
    showError('保存に失敗しました');
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
        
        <div style="display: flex; gap: 8px;">
          <select id="search_urgency" style="flex: 1; padding: 10px; border: 2px solid #e5e7eb; border-radius: 8px; font-size: 14px; background: white;">
            <option value="">すべての緊急度</option>
            <option value="高">高</option>
            <option value="中">中</option>
            <option value="低">低</option>
          </select>
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
    const urgencyColor = consultation.urgency_level === '高' ? '#ef4444' : consultation.urgency_level === '中' ? '#f59e0b' : '#10b981';
    const date = new Date(consultation.created_at);
    const dateStr = `${date.getFullYear()}/${String(date.getMonth() + 1).padStart(2, '0')}/${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
    
    return `
      <div onclick="showConsultationDetail(${consultation.id})" style="background: white; border-radius: 12px; padding: 16px; margin-bottom: 12px; box-shadow: 0 2px 6px rgba(0,0,0,0.06); cursor: pointer; transition: transform 0.2s;" onmouseover="this.style.transform='translateY(-2px)'" onmouseout="this.style.transform='translateY(0)'">
        <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 8px;">
          <div>
            <h4 style="margin: 0 0 4px 0; font-size: 16px; font-weight: 700; color: #1f2937;">${consultation.caller_name || '（氏名なし）'}</h4>
            <p style="margin: 0; font-size: 13px; color: #6b7280;">${dateStr}</p>
          </div>
          <span style="background: ${urgencyColor}; color: white; padding: 4px 12px; border-radius: 12px; font-size: 12px; font-weight: 600;">${consultation.urgency_level}</span>
        </div>
        
        <div style="display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 8px;">
          <span style="background: #dbeafe; color: #1e40af; padding: 4px 10px; border-radius: 8px; font-size: 12px; font-weight: 600;">${consultation.addiction_type}</span>
          <span style="background: #f3f4f6; color: #6b7280; padding: 4px 10px; border-radius: 8px; font-size: 12px;">${consultation.caller_relationship}</span>
          ${consultation.target_age ? `<span style="background: #f3f4f6; color: #6b7280; padding: 4px 10px; border-radius: 8px; font-size: 12px;">${consultation.target_age}歳</span>` : ''}
          ${consultation.target_gender ? `<span style="background: #f3f4f6; color: #6b7280; padding: 4px 10px; border-radius: 8px; font-size: 12px;">${consultation.target_gender}</span>` : ''}
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
  const urgency = document.getElementById('search_urgency').value;
  
  currentFilter = {};
  if (name) currentFilter.caller_name = name;
  if (addiction) currentFilter.addiction_type = addiction;
  if (urgency) currentFilter.urgency_level = urgency;
  
  const data = await searchConsultations(currentFilter);
  document.getElementById('consultations-list').innerHTML = renderConsultationsList(data.consultations);
}

function clearHistoryFilter() {
  document.getElementById('search_name').value = '';
  document.getElementById('search_addiction').value = '';
  document.getElementById('search_urgency').value = '';
  currentFilter = {};
  showHistory();
}

async function showConsultationDetail(id) {
  try {
    const response = await fetch(`${API_BASE}/consultations/${id}`);
    if (!response.ok) throw new Error('詳細取得失敗');
    const consultation = await response.json();
    
    const date = new Date(consultation.created_at);
    const dateStr = `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日 ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
    const urgencyColor = consultation.urgency_level === '高' ? '#ef4444' : consultation.urgency_level === '中' ? '#f59e0b' : '#10b981';
    
    let phases = {};
    try {
      phases = JSON.parse(consultation.phases || '{}');
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
            <span style="background: ${urgencyColor}; color: white; padding: 6px 14px; border-radius: 12px; font-size: 13px; font-weight: 600;">${consultation.urgency_level}</span>
          </div>
          
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; padding-top: 12px; border-top: 1px solid #e5e7eb;">
            <div>
              <p style="margin: 0 0 4px 0; font-size: 12px; color: #6b7280; font-weight: 600;">電話番号</p>
              <p style="margin: 0; font-size: 14px; color: #1f2937;">${consultation.caller_phone || '未記載'}</p>
            </div>
            <div>
              <p style="margin: 0 0 4px 0; font-size: 12px; color: #6b7280; font-weight: 600;">関係</p>
              <p style="margin: 0; font-size: 14px; color: #1f2937;">${consultation.caller_relationship}</p>
            </div>
            <div>
              <p style="margin: 0 0 4px 0; font-size: 12px; color: #6b7280; font-weight: 600;">依存症</p>
              <p style="margin: 0; font-size: 14px; color: #1f2937;">${consultation.addiction_type}</p>
            </div>
            <div>
              <p style="margin: 0 0 4px 0; font-size: 12px; color: #6b7280; font-weight: 600;">対応スタッフ</p>
              <p style="margin: 0; font-size: 14px; color: #1f2937;">${consultation.staff_name || '不明'}</p>
            </div>
          </div>
        </div>
        
        <!-- 対象者情報 -->
        ${consultation.target_name ? `
          <div style="background: white; border-radius: 16px; padding: 20px; margin-bottom: 16px; box-shadow: 0 2px 8px rgba(0,0,0,0.06);">
            <h3 style="margin: 0 0 12px 0; font-size: 16px; font-weight: 700; color: #1f2937; border-bottom: 2px solid #10b981; padding-bottom: 6px;">対象者情報</h3>
            <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 12px;">
              <div>
                <p style="margin: 0 0 4px 0; font-size: 12px; color: #6b7280; font-weight: 600;">氏名</p>
                <p style="margin: 0; font-size: 14px; color: #1f2937;">${consultation.target_name}</p>
              </div>
              ${consultation.target_age ? `
                <div>
                  <p style="margin: 0 0 4px 0; font-size: 12px; color: #6b7280; font-weight: 600;">年齢</p>
                  <p style="margin: 0; font-size: 14px; color: #1f2937;">${consultation.target_age}歳</p>
                </div>
              ` : ''}
              ${consultation.target_gender ? `
                <div>
                  <p style="margin: 0 0 4px 0; font-size: 12px; color: #6b7280; font-weight: 600;">性別</p>
                  <p style="margin: 0; font-size: 14px; color: #1f2937;">${consultation.target_gender}</p>
                </div>
              ` : ''}
            </div>
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
  
  // ダミーデータ（実際のAPIが実装されたら置き換え）
  const stats = {
    weekly: [
      { day: '月', count: 12 },
      { day: '火', count: 15 },
      { day: '水', count: 10 },
      { day: '木', count: 18 },
      { day: '金', count: 14 },
      { day: '土', count: 8 },
      { day: '日', count: 6 }
    ],
    byType: [
      { type: 'アルコール依存', count: 25 },
      { type: '薬物依存', count: 18 },
      { type: 'ギャンブル依存', count: 12 },
      { type: 'ゲーム依存', count: 8 },
      { type: 'その他', count: 20 }
    ],
    byUrgency: [
      { level: '高', count: 15 },
      { level: '中', count: 48 },
      { level: '低', count: 20 }
    ]
  };
  
  const app = document.getElementById('app');
  app.innerHTML = `
    ${renderHeader('統計情報', true)}
    
    <main style="max-width: 480px; margin: 0 auto; padding: 16px;">
      <!-- 期間選択 -->
      <div style="background: white; border-radius: 16px; padding: 20px; margin-bottom: 16px; box-shadow: 0 2px 8px rgba(0,0,0,0.06);">
        <h3 style="margin: 0 0 12px 0; font-size: 16px; font-weight: 700; color: #1f2937;">期間選択</h3>
        <div style="display: flex; gap: 8px;">
          <button onclick="loadStatsPeriod('week')" style="flex: 1; padding: 10px; background: linear-gradient(135deg, #3b82f6, #2563eb); color: white; border: none; border-radius: 8px; font-size: 14px; font-weight: 600; cursor: pointer;">今週</button>
          <button onclick="loadStatsPeriod('month')" style="flex: 1; padding: 10px; background: white; color: #3b82f6; border: 2px solid #3b82f6; border-radius: 8px; font-size: 14px; font-weight: 600; cursor: pointer;">今月</button>
          <button onclick="loadStatsPeriod('year')" style="flex: 1; padding: 10px; background: white; color: #3b82f6; border: 2px solid #3b82f6; border-radius: 8px; font-size: 14px; font-weight: 600; cursor: pointer;">今年</button>
        </div>
      </div>
      
      <!-- サマリー -->
      <div style="background: white; border-radius: 16px; padding: 20px; margin-bottom: 16px; box-shadow: 0 2px 8px rgba(0,0,0,0.06);">
        <h3 style="margin: 0 0 16px 0; font-size: 16px; font-weight: 700; color: #1f2937;">今週のサマリー</h3>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
          <div style="background: linear-gradient(135deg, #dbeafe, #bfdbfe); border-radius: 12px; padding: 16px; text-align: center;">
            <p style="margin: 0; font-size: 28px; font-weight: 800; color: #1e40af;">${stats.weekly.reduce((sum, day) => sum + day.count, 0)}</p>
            <p style="margin: 4px 0 0 0; font-size: 13px; color: #1e40af; font-weight: 600;">総相談件数</p>
          </div>
          <div style="background: linear-gradient(135deg, #dcfce7, #bbf7d0); border-radius: 12px; padding: 16px; text-align: center;">
            <p style="margin: 0; font-size: 28px; font-weight: 800; color: #166534;">${Math.round(stats.weekly.reduce((sum, day) => sum + day.count, 0) / 7)}</p>
            <p style="margin: 4px 0 0 0; font-size: 13px; color: #166534; font-weight: 600;">1日平均</p>
          </div>
        </div>
      </div>
      
      <!-- 曜日別グラフ -->
      <div style="background: white; border-radius: 16px; padding: 20px; margin-bottom: 16px; box-shadow: 0 2px 8px rgba(0,0,0,0.06);">
        <h3 style="margin: 0 0 16px 0; font-size: 16px; font-weight: 700; color: #1f2937;">曜日別相談件数</h3>
        ${renderBarChart(stats.weekly, 'day', 'count', '#3b82f6')}
      </div>
      
      <!-- 依存症別グラフ -->
      <div style="background: white; border-radius: 16px; padding: 20px; margin-bottom: 16px; box-shadow: 0 2px 8px rgba(0,0,0,0.06);">
        <h3 style="margin: 0 0 16px 0; font-size: 16px; font-weight: 700; color: #1f2937;">依存症別分布</h3>
        ${renderBarChart(stats.byType, 'type', 'count', '#10b981')}
      </div>
      
      <!-- 緊急度別グラフ -->
      <div style="background: white; border-radius: 16px; padding: 20px; margin-bottom: 16px; box-shadow: 0 2px 8px rgba(0,0,0,0.06);">
        <h3 style="margin: 0 0 16px 0; font-size: 16px; font-weight: 700; color: #1f2937;">緊急度別分布</h3>
        ${renderBarChart(stats.byUrgency, 'level', 'count', '#8b5cf6')}
      </div>
      
      <!-- エクスポート -->
      <div style="display: flex; gap: 8px;">
        <button onclick="exportStatsCSV()" style="flex: 1; padding: 14px; background: linear-gradient(135deg, #10b981, #059669); color: white; border: none; border-radius: 12px; font-size: 16px; font-weight: 600; cursor: pointer;">CSV出力</button>
        <button onclick="exportStatsPDF()" style="flex: 1; padding: 14px; background: linear-gradient(135deg, #ef4444, #dc2626); color: white; border: none; border-radius: 12px; font-size: 16px; font-weight: 600; cursor: pointer;">PDF出力</button>
      </div>
    </main>
    
    ${renderFooter()}
  `;
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

function loadStatsPeriod(period) {
  showInfo(`${period === 'week' ? '今週' : period === 'month' ? '今月' : '今年'}のデータを読み込み中...`);
  setTimeout(() => {
    showStatistics();
  }, 500);
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
          <button onclick="filterManualByCategory(null)" style="padding: 8px 16px; background: linear-gradient(135deg, #3b82f6, #2563eb); color: white; border: none; border-radius: 8px; font-size: 13px; font-weight: 600; cursor: pointer;">すべて</button>
          ${Object.keys(phrasesByCategory).map(category => `
            <button onclick="filterManualByCategory('${category}')" style="padding: 8px 16px; background: white; color: #3b82f6; border: 2px solid #3b82f6; border-radius: 8px; font-size: 13px; font-weight: 600; cursor: pointer;">${category}</button>
          `).join('')}
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
  
  const categoriesToShow = category ? [category] : Object.keys(phrasesByCategory);
  
  categoriesToShow.forEach(cat => {
    const phases = phrasesByCategory[cat];
    
    html += `
      <div style="background: white; border-radius: 16px; padding: 20px; margin-bottom: 16px; box-shadow: 0 2px 8px rgba(0,0,0,0.06);">
        <h3 style="margin: 0 0 16px 0; font-size: 18px; font-weight: 700; color: #1f2937; border-bottom: 2px solid #f59e0b; padding-bottom: 8px;">${cat}</h3>
        
        ${Object.entries(phases).map(([phase, phrases]) => {
          const filteredPhrases = searchTerm 
            ? phrases.filter(p => p.phrase_text.toLowerCase().includes(searchTerm.toLowerCase()))
            : phrases;
          
          if (filteredPhrases.length === 0) return '';
          
          return `
            <div style="margin-bottom: 20px;">
              <h4 style="margin: 0 0 12px 0; font-size: 15px; font-weight: 700; color: #6b7280; display: flex; align-items: center;">
                <span style="width: 6px; height: 6px; border-radius: 50%; background: #f59e0b; margin-right: 8px;"></span>
                ${phase}
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
  toast.style.cssText = 'position: fixed; top: 20px; left: 50%; transform: translateX(-50%); background: #ef4444; color: white; padding: 16px 24px; border-radius: 12px; font-size: 14px; font-weight: 600; box-shadow: 0 4px 12px rgba(0,0,0,0.2); z-index: 9999; max-width: 90%; animation: slideDown 0.3s ease;';
  toast.textContent = `❌ ${message}`;
  document.body.appendChild(toast);
  
  setTimeout(() => {
    toast.style.animation = 'slideUp 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

function showSuccess(message) {
  const toast = document.createElement('div');
  toast.style.cssText = 'position: fixed; top: 20px; left: 50%; transform: translateX(-50%); background: #10b981; color: white; padding: 16px 24px; border-radius: 12px; font-size: 14px; font-weight: 600; box-shadow: 0 4px 12px rgba(0,0,0,0.2); z-index: 9999; max-width: 90%; animation: slideDown 0.3s ease;';
  toast.textContent = `✅ ${message}`;
  document.body.appendChild(toast);
  
  setTimeout(() => {
    toast.style.animation = 'slideUp 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

function showInfo(message) {
  const toast = document.createElement('div');
  toast.style.cssText = 'position: fixed; top: 20px; left: 50%; transform: translateX(-50%); background: #3b82f6; color: white; padding: 16px 24px; border-rounded: 12px; font-size: 14px; font-weight: 600; box-shadow: 0 4px 12px rgba(0,0,0,0.2); z-index: 9999; max-width: 90%; animation: slideDown 0.3s ease;';
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
