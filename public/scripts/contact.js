document.addEventListener('DOMContentLoaded', function () {
    const form = document.getElementById('contact-form');
    const submitButton = form.querySelector('button[type="submit"]');
    const originalButtonText = submitButton.querySelector('span').textContent;

    form.addEventListener('submit', async function (e) {
        e.preventDefault();

        // 簡易バリデーション
        if (!form.checkValidity()) {
            form.reportValidity();
            return;
        }

        // ロード状態
        setLoading(true);

        // フォームデータの取得
        const formData = {
            inquiry_type: form.inquiry_type.value,
            service_name: form.service_name ? form.service_name.value : '',
            company_name: form.company_name.value,
            department: form.department.value,
            name: form.user_name.value, // name属性がnameだと干渉する可能性があるためuser_name推奨だが、HTML修正に合わせて調整
            email: form.email.value,
            tel: form.tel.value,
            message: form.message.value,
            confirm_email: form.confirm_email.value // Honeypot field
        };

        try {
            const response = await fetch('./mail.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });

            // レスポンスがJSONでない場合（PHPエラーなど）を考慮
            const contentType = response.headers.get("content-type");
            if (!contentType || !contentType.includes("application/json")) {
                throw new Error("サーバーエラーが発生しました。");
            }

            const result = await response.json();

            if (response.ok && result.success) {
                // alert('お問い合わせありがとうございます。\n送信が完了しました。');
                // form.reset();
                window.location.href = './thanks.html';
            } else {
                throw new Error(result.message || '送信に失敗しました。');
            }

        } catch (error) {
            console.error('Error:', error);
            // ローカル環境等のフォールバック
            // fileスキームやlocalhostの場合はデモモードとして成功扱いにする
            const isLocal = window.location.protocol === 'file:' ||
                window.location.hostname === 'localhost' ||
                window.location.hostname === '127.0.0.1';

            if (isLocal) {
                console.warn('Demo Mode: Sending simulated success response.');
                // alert('【デモモード】\nローカル環境のため、メール送信をシミュレーションしました。\n（※実際には送信されませんが、完了画面へ遷移します）');
                form.reset();
                window.location.href = './thanks.html';
            } else {
                alert('送信できませんでした。\n※ローカル環境ではメールサーバー設定が必要です。\n\nエラー内容: ' + error.message);
            }
        } finally {
            setLoading(false);
        }
    });

    function setLoading(isLoading) {
        submitButton.disabled = isLoading;
        if (isLoading) {
            submitButton.querySelector('span').textContent = '送信中...';
            submitButton.classList.add('opacity-70', 'cursor-not-allowed');
        } else {
            submitButton.querySelector('span').textContent = originalButtonText;
            submitButton.classList.remove('opacity-70', 'cursor-not-allowed');
        }
    }
});
