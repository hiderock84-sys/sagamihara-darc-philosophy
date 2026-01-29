import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { serveStatic } from 'hono/cloudflare-workers'

type Bindings = {
  DB: D1Database;
}

const app = new Hono<{ Bindings: Bindings }>()

// CORS設定
app.use('/api/*', cors())

// 静的ファイル配信
app.use('/static/*', serveStatic({ root: './public' }))

// ==========================================
// API: スタッフ関連
// ==========================================

// スタッフ一覧取得
app.get('/api/staff', async (c) => {
  const { DB } = c.env
  const result = await DB.prepare('SELECT * FROM staff WHERE is_active = 1 ORDER BY id').all()
  return c.json({ staff: result.results })
})

// ==========================================
// API: 対応フレーズ関連
// ==========================================

// 対応フレーズ取得（カテゴリー別）
app.get('/api/phrases/:category', async (c) => {
  const { DB } = c.env
  const category = c.req.param('category')
  
  const result = await DB.prepare(
    'SELECT * FROM response_phrases WHERE category = ? ORDER BY sort_order'
  ).bind(category).all()
  
  return c.json({ phrases: result.results })
})

// 全フレーズ取得
app.get('/api/phrases', async (c) => {
  const { DB } = c.env
  const result = await DB.prepare('SELECT * FROM response_phrases ORDER BY category, sort_order').all()
  return c.json({ phrases: result.results })
})

// ==========================================
// API: 相談記録関連
// ==========================================

// 相談記録作成（新フォーマット対応）
app.post('/api/consultations', async (c) => {
  const { DB } = c.env
  const data = await c.req.json()
  
  try {
    // スタッフIDからスタッフ名を取得
    const staffResult = await DB.prepare('SELECT name FROM staff WHERE id = ?').bind(data.staff_id).first()
    const staffName = staffResult ? staffResult.name : 'Unknown'
    
    const result = await DB.prepare(`
      INSERT INTO consultations (
        reception_datetime, staff_name, 
        caller_name, caller_phone, caller_relationship,
        addiction_types, emergency_level, 
        consultation_content, notes
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      new Date().toISOString(),
      staffName,
      data.caller_name || '',
      data.caller_phone || '',
      data.caller_relationship || '',
      data.addiction_type || '',
      data.urgency_level || '中',
      data.phases || '{}',
      data.target_name ? `対象者: ${data.target_name}` : ''
    ).run()
    
    return c.json({ 
      success: true, 
      id: result.meta.last_row_id,
      message: '相談記録を保存しました' 
    })
  } catch (error: any) {
    return c.json({ 
      success: false, 
      message: 'エラーが発生しました: ' + error.message 
    }, 500)
  }
})

// 相談記録一覧取得（ページネーション対応）
app.get('/api/consultations', async (c) => {
  const { DB } = c.env
  const page = parseInt(c.req.query('page') || '1')
  const limit = parseInt(c.req.query('limit') || '20')
  const offset = (page - 1) * limit
  
  // 総件数取得
  const countResult = await DB.prepare('SELECT COUNT(*) as total FROM consultations').first()
  const total = (countResult as any)?.total || 0
  
  // データ取得
  const result = await DB.prepare(
    'SELECT * FROM consultations ORDER BY reception_datetime DESC LIMIT ? OFFSET ?'
  ).bind(limit, offset).all()
  
  return c.json({ 
    consultations: result.results,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit)
    }
  })
})

// 相談記録詳細取得
app.get('/api/consultations/:id', async (c) => {
  const { DB } = c.env
  const id = c.req.param('id')
  
  const result = await DB.prepare(
    'SELECT * FROM consultations WHERE id = ?'
  ).bind(id).first()
  
  if (!result) {
    return c.json({ success: false, message: '記録が見つかりません' }, 404)
  }
  
  return c.json({ consultation: result })
})

// 相談記録更新
app.put('/api/consultations/:id', async (c) => {
  const { DB } = c.env
  const id = c.req.param('id')
  const data = await c.req.json()
  
  try {
    await DB.prepare(`
      UPDATE consultations SET
        staff_name = ?, caller_name = ?, caller_age = ?, caller_gender = ?,
        caller_phone = ?, caller_relationship = ?, caller_relationship_detail = ?,
        addiction_types = ?, addiction_period = ?, addiction_frequency = ?, addiction_severity = ?,
        hospitalization_history = ?, hospitalization_facility = ?,
        outpatient_history = ?, outpatient_facility = ?,
        medication_status = ?, medication_name = ?,
        other_facility_use = ?, other_facility_name = ?,
        emergency_use_24h = ?, emergency_withdrawal = ?, emergency_self_harm = ?, 
        emergency_medical_needed = ?, emergency_level = ?,
        consultation_content = ?, notes = ?,
        interview_scheduled = ?, interview_datetime = ?,
        followup_scheduled = ?, followup_datetime = ?,
        coordination_needed = ?, report_completed = ?, report_to = ?,
        updated_at = datetime('now', 'localtime')
      WHERE id = ?
    `).bind(
      data.staff_name, data.caller_name, data.caller_age, data.caller_gender,
      data.caller_phone, data.caller_relationship, data.caller_relationship_detail,
      data.addiction_types, data.addiction_period, data.addiction_frequency, data.addiction_severity,
      data.hospitalization_history, data.hospitalization_facility,
      data.outpatient_history, data.outpatient_facility,
      data.medication_status, data.medication_name,
      data.other_facility_use, data.other_facility_name,
      data.emergency_use_24h ? 1 : 0, data.emergency_withdrawal ? 1 : 0, 
      data.emergency_self_harm ? 1 : 0, data.emergency_medical_needed ? 1 : 0,
      data.emergency_level, data.consultation_content, data.notes,
      data.interview_scheduled ? 1 : 0, data.interview_datetime,
      data.followup_scheduled ? 1 : 0, data.followup_datetime,
      data.coordination_needed, data.report_completed ? 1 : 0, data.report_to,
      id
    ).run()
    
    return c.json({ success: true, message: '相談記録を更新しました' })
  } catch (error: any) {
    return c.json({ 
      success: false, 
      message: 'エラーが発生しました: ' + error.message 
    }, 500)
  }
})

// 相談記録削除
app.delete('/api/consultations/:id', async (c) => {
  const { DB } = c.env
  const id = c.req.param('id')
  
  try {
    await DB.prepare('DELETE FROM consultations WHERE id = ?').bind(id).run()
    return c.json({ success: true, message: '相談記録を削除しました' })
  } catch (error: any) {
    return c.json({ 
      success: false, 
      message: 'エラーが発生しました: ' + error.message 
    }, 500)
  }
})

// 検索API
app.get('/api/consultations/search', async (c) => {
  const { DB } = c.env
  const keyword = c.req.query('keyword') || ''
  const emergencyLevel = c.req.query('emergency_level') || ''
  const dateFrom = c.req.query('date_from') || ''
  const dateTo = c.req.query('date_to') || ''
  
  let sql = 'SELECT * FROM consultations WHERE 1=1'
  const bindings: any[] = []
  
  if (keyword) {
    sql += ' AND (caller_name LIKE ? OR consultation_content LIKE ? OR notes LIKE ?)'
    const searchPattern = `%${keyword}%`
    bindings.push(searchPattern, searchPattern, searchPattern)
  }
  
  if (emergencyLevel) {
    sql += ' AND emergency_level = ?'
    bindings.push(emergencyLevel)
  }
  
  if (dateFrom) {
    sql += ' AND reception_datetime >= ?'
    bindings.push(dateFrom)
  }
  
  if (dateTo) {
    sql += ' AND reception_datetime <= ?'
    bindings.push(dateTo)
  }
  
  sql += ' ORDER BY reception_datetime DESC LIMIT 100'
  
  const result = await DB.prepare(sql).bind(...bindings).all()
  
  return c.json({ consultations: result.results })
})

// ==========================================
// API: 統計情報
// ==========================================

// ダッシュボード統計
app.get('/api/stats/dashboard', async (c) => {
  const { DB } = c.env
  
  // 総相談件数
  const totalConsultations = await DB.prepare(
    'SELECT COUNT(*) as count FROM consultations'
  ).first()
  
  // 今月の相談件数
  const thisMonthConsultations = await DB.prepare(
    "SELECT COUNT(*) as count FROM consultations WHERE strftime('%Y-%m', reception_datetime) = strftime('%Y-%m', 'now', 'localtime')"
  ).first()
  
  // 緊急度別件数
  const emergencyStats = await DB.prepare(
    'SELECT emergency_level, COUNT(*) as count FROM consultations GROUP BY emergency_level'
  ).all()
  
  // 依存症種類別件数（上位5件）
  const addictionStats = await DB.prepare(`
    SELECT addiction_types, COUNT(*) as count 
    FROM consultations 
    WHERE addiction_types IS NOT NULL 
    GROUP BY addiction_types 
    ORDER BY count DESC 
    LIMIT 5
  `).all()
  
  // 最近の相談（5件）
  const recentConsultations = await DB.prepare(
    'SELECT id, reception_datetime, caller_name, emergency_level, staff_name FROM consultations ORDER BY reception_datetime DESC LIMIT 5'
  ).all()
  
  return c.json({
    totalConsultations: (totalConsultations as any)?.count || 0,
    thisMonthConsultations: (thisMonthConsultations as any)?.count || 0,
    emergencyStats: emergencyStats.results,
    addictionStats: addictionStats.results,
    recentConsultations: recentConsultations.results
  })
})

// ==========================================
// PWAファイル配信（静的ファイルとして配信）
// ==========================================

app.get('/manifest.json', serveStatic({ root: './public' }))
app.get('/sw.js', serveStatic({ root: './public' }))
app.get('/offline.html', serveStatic({ root: './public' }))

// ==========================================
// フロントエンド（ルートページ）
// ==========================================

app.get('/', (c) => {
  return c.html(`
    <!DOCTYPE html>
    <html lang="ja">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=5.0, user-scalable=yes, viewport-fit=cover">
        
        <!-- PWA対応 -->
        <meta name="theme-color" content="#1e40af">
        <meta name="mobile-web-app-capable" content="yes">
        <meta name="apple-mobile-web-app-capable" content="yes">
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
        <meta name="apple-mobile-web-app-title" content="相模原ダルク">
        <link rel="manifest" href="/manifest.json">
        
        <!-- アイコン -->
        <link rel="icon" type="image/png" sizes="192x192" href="/static/icon-192.png">
        <link rel="icon" type="image/png" sizes="512x512" href="/static/icon-512.png">
        <link rel="apple-touch-icon" href="/static/icon-192.png">
        
        <!-- SEO -->
        <meta name="description" content="相模原ダルク 依存症相談電話対応支援システム - 電話相談の記録・管理・統計分析をサポート">
        <meta name="keywords" content="相模原ダルク,依存症,電話相談,支援システム,ダルク">
        
        <title>相模原ダルク 電話対応支援システム</title>
        <script src="https://cdn.tailwindcss.com"></script>
        <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" rel="stylesheet">
        <script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js"></script>
        <script>
          tailwind.config = {
            theme: {
              extend: {
                colors: {
                  'darc-primary': '#2563eb',
                  'darc-secondary': '#1e40af',
                  'darc-accent': '#dc2626',
                }
              }
            }
          }
        </script>
        <style>
          * {
            -webkit-tap-highlight-color: transparent;
          }
          body {
            -webkit-text-size-adjust: 100%;
            -webkit-font-smoothing: antialiased;
          }
          .fade-in {
            animation: fadeIn 0.3s ease-in;
          }
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(-10px); }
            to { opacity: 1; transform: translateY(0); }
          }
          .emergency-pulse {
            animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
          }
          @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: .5; }
          }
          /* モバイル対応 */
          @media (max-width: 640px) {
            .container {
              padding-left: 1rem;
              padding-right: 1rem;
            }
          }
          
          /* タブレット対応 */
          @media (min-width: 641px) and (max-width: 1024px) {
            #app {
              max-width: 768px;
              margin: 0 auto;
            }
          }
          
          /* PWA: セーフエリア対応 */
          body {
            padding-top: env(safe-area-inset-top);
            padding-bottom: env(safe-area-inset-bottom);
            padding-left: env(safe-area-inset-left);
            padding-right: env(safe-area-inset-right);
          }
          
          /* タッチ操作の改善 */
          button, a, [onclick] {
            touch-action: manipulation;
            -webkit-user-select: none;
            user-select: none;
          }
          
          /* スクロールの最適化 */
          * {
            -webkit-overflow-scrolling: touch;
          }
        </style>
        
        <!-- Service Worker登録 -->
        <script>
          if ('serviceWorker' in navigator) {
            window.addEventListener('load', () => {
              navigator.serviceWorker.register('/sw.js')
                .then((registration) => {
                  console.log('✅ Service Worker登録成功:', registration.scope);
                })
                .catch((error) => {
                  console.log('❌ Service Worker登録失敗:', error);
                });
            });
          }
          
          // PWAインストールプロンプト
          let deferredPrompt;
          window.addEventListener('beforeinstallprompt', (e) => {
            e.preventDefault();
            deferredPrompt = e;
            console.log('📱 PWAインストール可能');
            // インストールボタンを表示する処理をここに追加できます
          });
          
          // オンライン/オフライン状態の検知
          window.addEventListener('online', () => {
            console.log('✅ オンラインに復帰');
          });
          
          window.addEventListener('offline', () => {
            console.log('⚠️ オフラインになりました');
          });
        </script>
    </head>
    <body style="background: #f5f5f5; margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;">
        <div id="app"></div>
        
        <script src="https://cdn.jsdelivr.net/npm/axios@1.6.0/dist/axios.min.js"></script>
        <script src="/static/app.js?v=${Date.now()}"></script>
    </body>
    </html>
  `)
})

export default app
