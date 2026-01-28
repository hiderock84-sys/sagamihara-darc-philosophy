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

// 相談記録作成
app.post('/api/consultations', async (c) => {
  const { DB } = c.env
  const data = await c.req.json()
  
  try {
    const result = await DB.prepare(`
      INSERT INTO consultations (
        reception_datetime, staff_name, caller_name, caller_age, caller_gender,
        caller_phone, caller_relationship, caller_relationship_detail,
        addiction_types, addiction_period, addiction_frequency, addiction_severity,
        hospitalization_history, hospitalization_facility,
        outpatient_history, outpatient_facility,
        medication_status, medication_name,
        other_facility_use, other_facility_name,
        emergency_use_24h, emergency_withdrawal, emergency_self_harm, emergency_medical_needed,
        emergency_level, consultation_content, notes,
        interview_scheduled, interview_datetime,
        followup_scheduled, followup_datetime,
        coordination_needed, report_completed, report_to,
        check_name_contact, check_addiction_type, check_emergency_level,
        check_next_action, check_followup_date, check_record_completed
      ) VALUES (
        ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?,
        ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?,
        ?, ?, ?, ?, ?, ?, ?, ?, ?
      )
    `).bind(
      data.reception_datetime, data.staff_name, data.caller_name, data.caller_age, data.caller_gender,
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
      data.check_name_contact ? 1 : 0, data.check_addiction_type ? 1 : 0, 
      data.check_emergency_level ? 1 : 0,
      data.check_next_action ? 1 : 0, data.check_followup_date ? 1 : 0, 
      data.check_record_completed ? 1 : 0
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
// フロントエンド（ルートページ）
// ==========================================

app.get('/', (c) => {
  return c.html(`
    <!DOCTYPE html>
    <html lang="ja">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=5.0, user-scalable=yes">
        <meta name="apple-mobile-web-app-capable" content="yes">
        <meta name="apple-mobile-web-app-status-bar-style" content="default">
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
        </style>
    </head>
    <body style="background: #f5f5f5; margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;">
        <!-- ヘッダー -->
        <header style="background: #2563eb; color: white; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
          <div style="max-width: 480px; margin: 0 auto; padding: 16px 20px;">
            <div style="display: flex; justify-content: space-between; align-items: flex-start;">
              <!-- 左側：タイトル -->
              <div>
                <h1 style="font-size: 26px; font-weight: 800; margin: 0; line-height: 1.2; letter-spacing: -0.3px;">相模原ダルク</h1>
                <p style="font-size: 14px; margin: 4px 0 0 0; font-weight: 400; opacity: 0.95; letter-spacing: 0.3px;">電話対応支援システム</p>
              </div>
              
              <!-- 右側：電話番号 -->
              <div style="text-align: right; font-size: 11px; line-height: 1.5; white-space: nowrap;">
                <p style="margin: 0; font-weight: 600;">TEL: 042-707-0391</p>
                <p style="margin: 2px 0 0 0; opacity: 0.95; font-weight: 400;">平日 9:00-17:00</p>
                <p style="margin: 0; opacity: 0.95; font-weight: 400;">土祝日 9:00-12:00</p>
              </div>
            </div>
          </div>
        </header>

        <!-- メインコンテンツ -->
        <main style="max-width: 480px; margin: 0 auto; padding: 16px;">
          <!-- 機能メニュー -->
          <div style="margin-bottom: 20px;">
            <!-- 新規相談受付 -->
            <a href="/new-consultation" style="display: flex; align-items: center; justify-content: space-between; padding: 18px 20px; background: white; border-radius: 20px; box-shadow: 0 2px 8px rgba(0,0,0,0.08); margin-bottom: 12px; text-decoration: none;">
              <div style="display: flex; align-items: center; flex: 1;">
                <div style="width: 60px; height: 60px; border-radius: 16px; background: #3b82f6; display: flex; align-items: center; justify-content: center; color: white; font-size: 30px; margin-right: 15px; flex-shrink: 0;">
                  📞
                </div>
                <div style="flex: 1;">
                  <h3 style="font-size: 17px; font-weight: 700; color: #1f2937; margin: 0 0 2px 0;">新規相談受付</h3>
                  <p style="font-size: 13px; color: #6b7280; margin: 0;">電話対応を開始する</p>
                </div>
              </div>
              <svg style="width: 24px; height: 24px; color: #d1d5db; flex-shrink: 0; margin-left: 12px;" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M9 5l7 7-7 7"></path></svg>
            </a>

            <!-- 相談履歴 -->
            <a href="/history" style="display: flex; align-items: center; justify-content: space-between; padding: 18px 20px; background: white; border-radius: 20px; box-shadow: 0 2px 8px rgba(0,0,0,0.08); margin-bottom: 12px; text-decoration: none;">
              <div style="display: flex; align-items: center; flex: 1;">
                <div style="width: 60px; height: 60px; border-radius: 16px; background: #10b981; display: flex; align-items: center; justify-content: center; color: white; font-size: 30px; margin-right: 15px; flex-shrink: 0;">
                  🕐
                </div>
                <div style="flex: 1;">
                  <h3 style="font-size: 17px; font-weight: 700; color: #1f2937; margin: 0 0 2px 0;">相談履歴</h3>
                  <p style="font-size: 13px; color: #6b7280; margin: 0;">過去の相談記録を確認</p>
                </div>
              </div>
              <svg style="width: 24px; height: 24px; color: #d1d5db; flex-shrink: 0; margin-left: 12px;" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M9 5l7 7-7 7"></path></svg>
            </a>

            <!-- 統計情報 -->
            <a href="/stats" style="display: flex; align-items: center; justify-content: space-between; padding: 18px 20px; background: white; border-radius: 20px; box-shadow: 0 2px 8px rgba(0,0,0,0.08); margin-bottom: 12px; text-decoration: none;">
              <div style="display: flex; align-items: center; flex: 1;">
                <div style="width: 60px; height: 60px; border-radius: 16px; background: #8b5cf6; display: flex; align-items: center; justify-content: center; color: white; font-size: 30px; margin-right: 15px; flex-shrink: 0;">
                  📊
                </div>
                <div style="flex: 1;">
                  <h3 style="font-size: 17px; font-weight: 700; color: #1f2937; margin: 0 0 2px 0;">統計情報</h3>
                  <p style="font-size: 13px; color: #6b7280; margin: 0;">相談傾向を分析</p>
                </div>
              </div>
              <svg style="width: 24px; height: 24px; color: #d1d5db; flex-shrink: 0; margin-left: 12px;" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M9 5l7 7-7 7"></path></svg>
            </a>

            <!-- 対応マニュアル -->
            <a href="/manual" style="display: flex; align-items: center; justify-content: space-between; padding: 18px 20px; background: white; border-radius: 20px; box-shadow: 0 2px 8px rgba(0,0,0,0.08); text-decoration: none;">
              <div style="display: flex; align-items: center; flex: 1;">
                <div style="width: 60px; height: 60px; border-radius: 16px; background: #f97316; display: flex; align-items: center; justify-content: center; color: white; font-size: 30px; margin-right: 15px; flex-shrink: 0;">
                  📖
                </div>
                <div style="flex: 1;">
                  <h3 style="font-size: 17px; font-weight: 700; color: #1f2937; margin: 0 0 2px 0;">対応マニュアル</h3>
                  <p style="font-size: 13px; color: #6b7280; margin: 0;">対応フレーズ集を確認</p>
                </div>
              </div>
              <svg style="width: 24px; height: 24px; color: #d1d5db; flex-shrink: 0; margin-left: 12px;" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M9 5l7 7-7 7"></path></svg>
            </a>
          </div>

          <!-- 統計情報（4つのボックス） -->
          <div style="background: white; border-radius: 20px; box-shadow: 0 2px 8px rgba(0,0,0,0.08); padding: 20px 16px;">
            <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 0;">
              <div style="text-align: center; padding: 0 8px;">
                <p style="font-size: 11px; color: #6b7280; margin: 0 0 6px 0; font-weight: 500;">本日の相談</p>
                <p style="font-size: 26px; font-weight: 800; color: #1f2937; margin: 0; line-height: 1;">12件</p>
              </div>
              <div style="text-align: center; padding: 0 8px; border-left: 1px solid #e5e7eb;">
                <p style="font-size: 11px; color: #6b7280; margin: 0 0 6px 0; font-weight: 500;">対応中</p>
                <p style="font-size: 26px; font-weight: 800; color: #1f2937; margin: 0; line-height: 1;">3件</p>
              </div>
              <div style="text-align: center; padding: 0 8px; border-left: 1px solid #e5e7eb;">
                <p style="font-size: 11px; color: #6b7280; margin: 0 0 6px 0; font-weight: 500;">未完了</p>
                <p style="font-size: 26px; font-weight: 800; color: #1f2937; margin: 0; line-height: 1;">8件</p>
              </div>
              <div style="text-align: center; padding: 0 8px; border-left: 1px solid #e5e7eb;">
                <p style="font-size: 11px; color: #6b7280; margin: 0 0 6px 0; font-weight: 500;">平均時間</p>
                <p style="font-size: 26px; font-weight: 800; color: #1f2937; margin: 0; line-height: 1;">14分</p>
              </div>
            </div>
          </div>
        </main>

        <!-- フッター -->
        <footer style="background: #1f2937; color: white; margin-top: 48px; padding: 24px 0;">
          <div style="max-width: 480px; margin: 0 auto; padding: 0 20px; text-align: center;">
            <p style="font-size: 14px; margin: 0;">© 2026 一般社団法人相模原ダルク - 電話対応支援システム</p>
            <p style="font-size: 16px; font-weight: 600; margin: 12px 0 0 0;">人は必ずやり直せる--</p>
            <p style="font-size: 14px; color: #93c5fd; font-weight: 500; margin: 8px 0 0 0;">--相模原ダルクの挑戦--</p>
          </div>
        </footer>
    </body>
    </html>
  `)
})

export default app
