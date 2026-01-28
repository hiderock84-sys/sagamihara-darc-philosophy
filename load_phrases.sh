#!/bin/bash

# 状況確認（情報収集）
npx wrangler d1 execute sagamihara-darc-production --local --command="INSERT INTO response_phrases (category, phase, phrase_text, sort_order) VALUES ('状況確認', '情報収集', 'どのような依存症でお悩みですか？', 1), ('状況確認', '情報収集', 'いつ頃から使用されていますか？', 2), ('状況確認', '情報収集', '現在の使用頻度を教えていただけますか？', 3), ('状況確認', '情報収集', '過去に治療や入院の経験はありますか？', 4), ('状況確認', '情報収集', 'ご家族は現在の状況をご存知ですか？', 5)" 2>/dev/null

# 状況確認（状況確認）
npx wrangler d1 execute sagamihara-darc-production --local --command="INSERT INTO response_phrases (category, phase, phrase_text, sort_order) VALUES ('状況確認', '状況確認', '24時間以内に使用されましたか？', 1), ('状況確認', '状況確認', '離脱症状（手の震え、発汗など）はありますか？', 2), ('状況確認', '状況確認', '自分や他人を傷つけたいという気持ちはありますか？', 3), ('状況確認', '状況確認', '現在、医療機関に通院されていますか？', 4), ('状況確認', '状況確認', '今すぐ助けが必要な状況ですか？', 5)" 2>/dev/null

# 傾聴・共感（情報収集）
npx wrangler d1 execute sagamihara-darc-production --local --command="INSERT INTO response_phrases (category, phase, phrase_text, sort_order) VALUES ('傾聴・共感', '情報収集', 'それはとてもお辛い状況だったと思います。', 1), ('傾聴・共感', '情報収集', 'よくお電話くださいました。勇気のある行動です。', 2), ('傾聴・共感', '情報収集', 'お話を聞かせていただき、ありがとうございます。', 3), ('傾聴・共感', '情報収集', 'そのようなお気持ちになるのは当然のことです。', 4), ('傾聴・共感', '情報収集', '一人で抱え込まず、お話しいただけて良かったです。', 5)" 2>/dev/null

# 施設説明（提案・説明）
npx wrangler d1 execute sagamihara-darc-production --local --command="INSERT INTO response_phrases (category, phase, phrase_text, sort_order) VALUES ('施設説明', '提案・説明', '相模原ダルクは依存症からの回復を支援する施設です。', 1), ('施設説明', '提案・説明', '薬物、アルコール、ギャンブルなど様々な依存症に対応しています。', 2), ('施設説明', '提案・説明', '入所プログラムと通所プログラムがあります。', 3), ('施設説明', '提案・説明', '同じ経験を持つ仲間と共に回復を目指します。', 4), ('施設説明', '提案・説明', 'まずは面談で詳しくお話を伺います。', 5)" 2>/dev/null

# 次のステップ（次のステップ）
npx wrangler d1 execute sagamihara-darc-production --local --command="INSERT INTO response_phrases (category, phase, phrase_text, sort_order) VALUES ('次のステップ', '次のステップ', '面談のご予約をお取りしましょうか？', 1), ('次のステップ', '次のステップ', 'ご都合の良い日時を教えていただけますか？', 2), ('次のステップ', '次のステップ', '見学も可能ですので、お気軽にお越しください。', 3), ('次のステップ', '次のステップ', 'まずは資料をお送りすることもできます。', 4), ('次のステップ', '次のステップ', '何か不安なことがあれば、いつでもお電話ください。', 5)" 2>/dev/null

# クロージング（終了・フォローアップ）
npx wrangler d1 execute sagamihara-darc-production --local --command="INSERT INTO response_phrases (category, phase, phrase_text, sort_order) VALUES ('クロージング', '終了・フォローアップ', '本日はお電話いただき、ありがとうございました。', 1), ('クロージング', '終了・フォローアップ', '○月○日の○時にお待ちしております。', 2), ('クロージング', '終了・フォローアップ', '何かあれば、いつでもご連絡ください。', 3), ('クロージング', '終了・フォローアップ', '一緒に回復への道を歩んでいきましょう。', 4), ('クロージング', '終了・フォローアップ', 'お大事になさってください。', 5)" 2>/dev/null

# 緊急対応
npx wrangler d1 execute sagamihara-darc-production --local --command="INSERT INTO response_phrases (category, phase, phrase_text, sort_order) VALUES ('緊急対応', '初期対応', '今すぐ救急車を呼ぶ必要はありますか？', 1), ('緊急対応', '初期対応', '安全な場所にいらっしゃいますか？', 2), ('緊急対応', '初期対応', '誰か一緒にいてくれる人はいますか？', 3), ('緊急対応', '状況確認', '自傷や他害の恐れがある場合は、すぐに119番に電話してください。', 4), ('緊急対応', '状況確認', '離脱症状が強い場合は、医療機関の受診をお勧めします。', 5), ('緊急対応', '状況確認', '今日中に対応が必要な場合、すぐに調整いたします。', 6)" 2>/dev/null

# 家族向け
npx wrangler d1 execute sagamihara-darc-production --local --command="INSERT INTO response_phrases (category, phase, phrase_text, sort_order) VALUES ('家族向け', '情報収集', 'ご家族の方からのご相談も多くお受けしています。', 1), ('家族向け', '情報収集', 'ご本人の様子について教えていただけますか？', 2), ('家族向け', '情報収集', 'ご家族の方もとても大変な思いをされていると思います。', 3), ('家族向け', '情報収集', '家族向けの勉強会も定期的に開催しています。', 4), ('家族向け', '提案・説明', 'まずはご家族だけでも面談にお越しください。', 5), ('家族向け', '提案・説明', 'ご本人の同意がなくても、ご相談は可能です。', 6), ('家族向け', '提案・説明', 'ご家族の対応方法についてもアドバイスいたします。', 7)" 2>/dev/null

# 医療連携
npx wrangler d1 execute sagamihara-darc-production --local --command="INSERT INTO response_phrases (category, phase, phrase_text, sort_order) VALUES ('医療連携', '状況確認', '現在通院中の病院はありますか？', 1), ('医療連携', '状況確認', '処方されているお薬はありますか？', 2), ('医療連携', '状況確認', '主治医の先生とはどのような関係ですか？', 3), ('医療連携', '提案・説明', '必要に応じて医療機関との連携も可能です。', 4), ('医療連携', '提案・説明', '当施設と連携している医療機関もございます。', 5), ('医療連携', '提案・説明', '服薬管理も含めてサポートいたします。', 6)" 2>/dev/null

echo "フレーズデータの投入が完了しました"
