<?php
/**
 * X-VERSE Contact Form Mailer Stub
 * 本番環境では実際にメールを送信するロジックを追記してください。
 */

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    // フォームデータの取得（サニタイズは本番用に強化してください）
    $type = $_POST['type'] ?? '';
    $company = $_POST['company'] ?? '';
    $name = $_POST['name'] ?? '';
    $email = $_POST['email'] ?? '';
    $message = $_POST['message'] ?? '';

    // 送信先
    $to = "info@x-verse.example.com";
    $subject = "【X-VERSE】お問い合わせ：" . $type;
    
    $body = "種別: $type\n";
    $body .= "会社名: $company\n";
    $body .= "氏名: $name\n";
    $body .= "メール: $email\n";
    $body .= "内容:\n$message\n";

    // 本番環境でのメール送信例
    // mail($to, $subject, $body);

    // 完了ページへリダイレクト
    header("Location: thanks.html");
    exit;
}
?>
