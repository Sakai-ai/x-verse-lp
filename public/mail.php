<?php
header('Content-Type: application/json; charset=UTF-8');

// JSON入力を受け取る
$json = file_get_contents('php://input');
$data = json_decode($json, true);

if (!$data) {
    echo json_encode(['success' => false, 'message' => 'データが正しく送信されませんでした。']);
    exit;
}

// ハニポチェック
if (!empty($data['confirm_email'])) {
    // スパムと判断して成功を装う
    echo json_encode(['success' => true]);
    exit;
}

// 項目取得
$service_name = $data['service_name'] ?? '未指定';
$inquiry_type = $data['inquiry_type'] ?? '未指定';
$company_name = $data['company_name'] ?? '未指定';
$department   = $data['department'] ?? '未指定';
$name         = $data['name'] ?? '未指定';
$email        = $data['email'] ?? '未指定';
$tel          = $data['tel'] ?? '未指定';
$message      = $data['message'] ?? '未指定';

// メール設定（適宜書き換えてください）
$to = 'info@x-verse.jp'; // 管理者メールアドレス
$subject = "【お問い合わせ】{$service_name} - {$company_name}";

$body = <<<EOD
X-VERSE ウェブサイトよりお問い合わせがありました。

【お問い合わせサービス】
{$service_name}

【お問い合わせ種別】
{$inquiry_type}

【会社名】
{$company_name}

【部署名】
{$department}

【お名前】
{$name} 様

【メールアドレス】
{$email}

【電話番号】
{$tel}

【内容】
{$message}

---
このメールはシステムより自動送信されています。
EOD;

$headers = [
    'From' => $email,
    'Reply-To' => $email,
    'X-Mailer' => 'PHP/' . phpversion()
];

// 日本語メール送信設定
mb_language("Japanese");
mb_internal_encoding("UTF-8");

$success = mb_send_mail($to, $subject, $body, $headers);

if ($success) {
    echo json_encode(['success' => true]);
} else {
    echo json_encode(['success' => false, 'message' => 'メールの送信に失敗しました。']);
}
