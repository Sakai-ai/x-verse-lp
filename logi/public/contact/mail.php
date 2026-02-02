<?php
header('Content-Type: application/json; charset=utf-8');

// POSTメソッド以外は拒否
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method Not Allowed']);
    exit;
}

// JSON入力を受け取る場合
$json = file_get_contents('php://input');
$data = json_decode($json, true);

// 必須項目のチェック
if (empty($data['inquiry_type']) || empty($data['company_name']) || empty($data['name']) || empty($data['email'])) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => '必須項目が入力されていません。']);
    exit;
}

// 入力データのサニタイズ
$inquiry_type = htmlspecialchars($data['inquiry_type'], ENT_QUOTES, 'UTF-8');
$company_name = htmlspecialchars($data['company_name'], ENT_QUOTES, 'UTF-8');
$department = isset($data['department']) ? htmlspecialchars($data['department'], ENT_QUOTES, 'UTF-8') : '';
$name = htmlspecialchars($data['name'], ENT_QUOTES, 'UTF-8');
$email = filter_var($data['email'], FILTER_SANITIZE_EMAIL);
$tel = isset($data['tel']) ? htmlspecialchars($data['tel'], ENT_QUOTES, 'UTF-8') : '';
$message = isset($data['message']) ? htmlspecialchars($data['message'], ENT_QUOTES, 'UTF-8') : '';

// Honeypot check (Spam protection)
if (!empty($data['confirm_email'])) {
    // Bot detected. Return success to fool the bot, but do not send email.
    echo json_encode(['success' => true, 'message' => 'お問い合わせを送信しました。']);
    exit;
}

// バリデーション
// メールアドレスの形式チェック（@マークやドメインの有無を確認）
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'メールアドレスの形式が正しくありません。(@マークやドメインをご確認ください)']);
    exit;
}

// フォームの値を日本語表記に変換するマッピング
$inquiry_type_map = [
    'demo' => 'デモ依頼',
    'docs' => '資料請求',
    'poc' => 'PoC相談',
    'pricing' => '料金・プランについて'
];
$inquiry_type_text = isset($inquiry_type_map[$inquiry_type]) ? $inquiry_type_map[$inquiry_type] : $inquiry_type;

// 送信先メールアドレス（管理者）
// TODO: 実際の運用に合わせて変更してください
$to = 'info@x-verse.jp'; 

// メールの件名
$subject = '【X-VERSE】お問い合わせを受け付けました';

// メールの本文
$body = "以下のお問い合わせを受け付けました。対応お願いします。\n\n";
$body .= "お問い合わせ種別: " . $inquiry_type_text . "\n";
$body .= "会社名: " . $company_name . "\n";
$body .= "部署名: " . $department . "\n";
$body .= "氏名: " . $name . "\n";
$body .= "メールアドレス: " . $email . "\n";
$body .= "電話番号: " . $tel . "\n";
$body .= "お問い合わせ内容:\n" . $message . "\n\n";

// メールヘッダー
$headers = "From: info@x-verse.jp\r\n";
$headers .= "Reply-To: " . $email . "\r\n";
$headers .= "X-Mailer: PHP/" . phpversion();

// メール送信実行
// ※ローカル環境（メールサーバー設定なし）では失敗する可能性がありますが、
// 実際のサーバーでは設定に応じて動作します。
$mail_sent = mail($to, $subject, $body, $headers);

if ($mail_sent) {
    echo json_encode(['success' => true, 'message' => 'お問い合わせを送信しました。']);
} else {
    // ローカル開発やメールサーバー未設定の場合を考慮し、成功とみなすレスポンスを返すことも検討できますが、
    // ここでは厳密に判定します。
    // 開発確認用に、メールサーバーがない環境でも成功として返す場合は以下をコメントアウト解除
    /*
    echo json_encode(['success' => true, 'message' => 'お問い合わせを送信しました。(Demo Mode)']);
    */
    
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'メール送信に失敗しました。サーバー設定を確認してください。']);
}
?>
