/**
 * X-VERSE Common JavaScript
 */

document.addEventListener('DOMContentLoaded', () => {
    // ==========================================
    // Site Configuration
    // ==========================================
    const CONFIG = {
        // サイト全体を検索エンジンにインデックスさせない場合は true
        PREVENT_INDEXING: true
    };

    // SEO Control (noindex)
    if (CONFIG.PREVENT_INDEXING) {
        const meta = document.createElement('meta');
        meta.name = 'robots';
        meta.content = 'noindex';
        document.head.appendChild(meta);
        console.log('SEO: noindex meta tag added via main.js');
    }

    // モバイルメニューの制御
    const mobileMenuButton = document.getElementById('mobile-menu-button');
    const mobileMenu = document.getElementById('mobile-menu');

    if (mobileMenuButton && mobileMenu) {
        mobileMenuButton.addEventListener('click', () => {
            mobileMenu.classList.toggle('hidden');
        });
    }

    // Local Environment Navigation Fix
    // file:// プロトコルで閲覧時、ディレクトリリンク（末尾が/）に index.html を自動付与
    if (window.location.protocol === 'file:') {
        document.querySelectorAll('a').forEach(link => {
            const href = link.getAttribute('href');
            if (href && !href.startsWith('http') && !href.startsWith('//') && !href.startsWith('#')) {
                // 末尾が / で終わるリンク（ディレクトリ指定）の場合
                if (href.endsWith('/')) {
                    link.setAttribute('href', href + 'index.html');
                }
            }
        });
    }

    // Scroll Animation (Intersection Observer)
    const observerOptions = {
        threshold: 0.1,
        rootMargin: "0px 0px -50px 0px"
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    // すべてのアニメーション対象要素を監視
    const animationClasses = [
        '.animate-on-scroll',
        '.animate-stagger',
        '.animate-slide-left',
        '.animate-slide-right',
        '.animate-zoom-fade'
    ];

    animationClasses.forEach(selector => {
        document.querySelectorAll(selector).forEach(el => {
            observer.observe(el);
        });
    });

    // ==========================================
    // コードブロック タイプライターアニメーション
    // ==========================================
    const codeTypewriter = document.getElementById('code-typewriter');
    if (codeTypewriter) {
        const codeLines = [
            { text: '// X-VERSE Project Initialization', class: 'text-slate-500 mb-4' },
            { text: 'const', class: 'text-pink-400' },
            { text: 'platform = <span class="text-cyan-400">new</span> <span class="text-yellow-300">XVerse</span>({', class: 'text-white ml-4' },
            { text: '<span class="text-slate-400">space:</span> <span class="text-emerald-400">"Photorealistic 3D"</span>,', class: 'ml-8 text-white' },
            { text: '<span class="text-slate-400">time:</span> <span class="text-emerald-400">"4D Timeline Simulation"</span>,', class: 'ml-8 text-white' },
            { text: '<span class="text-slate-400">action:</span> <span class="text-emerald-400">"Unified Interaction UI"</span>,', class: 'ml-8 text-white' },
            { text: '<span class="text-slate-400">share:</span> <span class="text-emerald-400">"Collaborative Sync"</span>', class: 'ml-8 text-white' },
            { text: '});', class: 'text-white ml-4' }
        ];

        let hasAnimated = false;

        // タイプライター効果を実行
        const runTypewriter = () => {
            if (hasAnimated) return;
            hasAnimated = true;

            let lineIndex = 0;
            let charIndex = 0;
            let currentLine = null;
            const typingSpeed = 30; // ミリ秒/文字
            const lineDelay = 200; // 行間の遅延

            const typeNextChar = () => {
                if (lineIndex >= codeLines.length) {
                    // カーソルを非表示
                    const cursor = codeTypewriter.querySelector('.typewriter-cursor');
                    if (cursor) cursor.style.display = 'none';
                    return;
                }

                if (charIndex === 0) {
                    // 新しい行を作成
                    currentLine = document.createElement('p');
                    currentLine.className = codeLines[lineIndex].class;
                    codeTypewriter.appendChild(currentLine);

                    // 点滅カーソルを追加
                    let cursor = codeTypewriter.querySelector('.typewriter-cursor');
                    if (!cursor) {
                        cursor = document.createElement('span');
                        cursor.className = 'typewriter-cursor inline-block w-2 h-4 bg-red-500 ml-0.5 animate-pulse';
                    }
                    currentLine.appendChild(cursor);
                }

                const lineText = codeLines[lineIndex].text;

                // HTMLタグを考慮した文字挿入
                if (charIndex < lineText.length) {
                    // カーソルを一時的に削除
                    const cursor = codeTypewriter.querySelector('.typewriter-cursor');
                    if (cursor) cursor.remove();

                    // テキストを設定（HTMLとして）
                    currentLine.innerHTML = lineText.substring(0, charIndex + 1);

                    // HTML タグをスキップ
                    if (lineText[charIndex] === '<') {
                        const closeTagIndex = lineText.indexOf('>', charIndex);
                        if (closeTagIndex !== -1) {
                            charIndex = closeTagIndex;
                        }
                    }

                    // カーソルを追加
                    if (cursor) currentLine.appendChild(cursor);

                    charIndex++;
                    setTimeout(typeNextChar, typingSpeed);
                } else {
                    // 行が完了、次の行へ
                    const cursor = codeTypewriter.querySelector('.typewriter-cursor');
                    if (cursor) cursor.remove();

                    lineIndex++;
                    charIndex = 0;
                    setTimeout(typeNextChar, lineDelay);
                }
            };

            // アニメーション開始
            typeNextChar();
        };

        // Intersection Observerでコードブロックが表示されたら開始
        const codeObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    setTimeout(runTypewriter, 500); // 少し遅延させて開始
                    codeObserver.unobserve(entry.target);
                }
            });
        }, { threshold: 0.3 });

        codeObserver.observe(codeTypewriter);
    }

    // Parallax Effect
    // Parallax Effect Optimization
    let ticking = false;
    window.addEventListener('scroll', () => {
        if (!ticking) {
            window.requestAnimationFrame(() => {
                const scrolled = window.pageYOffset;
                const heroSection = document.querySelector('section');

                if (heroSection) {
                    const video = heroSection.querySelector('video');
                    // Only apply parallax if a video exists (Home Hero)
                    if (video) {
                        const limit = heroSection.offsetHeight;
                        if (scrolled < limit) {
                            const content = heroSection.querySelector('.container');
                            video.style.transform = `translate3d(0, ${scrolled * 0.5}px, 0) scale(1.05)`;
                            if (content) content.style.transform = `translate3d(0, ${scrolled * 0.3}px, 0)`;
                        }
                    }
                }
                ticking = false;
            });
            ticking = true;
        }
    });

    // Smooth Scroll for Anchor Links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                // Custom smooth scroll function for slower duration
                const targetPosition = targetElement.getBoundingClientRect().top + window.pageYOffset;
                const startPosition = window.pageYOffset;
                const distance = targetPosition - startPosition;
                const duration = 2500; // 2.5 seconds duration
                let start = null;

                function step(timestamp) {
                    if (!start) start = timestamp;
                    const progress = timestamp - start;
                    const percentage = Math.min(progress / duration, 1);

                    // Ease-in-out cubic function
                    const ease = percentage < 0.5
                        ? 4 * percentage * percentage * percentage
                        : 1 - Math.pow(-2 * percentage + 2, 3) / 2;

                    window.scrollTo(0, startPosition + distance * ease);

                    if (progress < duration) {
                        window.requestAnimationFrame(step);
                    }
                }

                window.requestAnimationFrame(step);
            }
        });
    });

    // Back to Top Button Logic
    const backToTopButton = document.getElementById('back-to-top');
    const toggleBackToTop = () => {
        if (window.scrollY > window.innerHeight * 0.8) {
            backToTopButton.classList.remove('opacity-0', 'translate-y-10', 'pointer-events-none');
            backToTopButton.classList.add('opacity-100', 'translate-y-0', 'pointer-events-auto');
        } else {
            backToTopButton.classList.add('opacity-0', 'translate-y-10', 'pointer-events-none');
            backToTopButton.classList.remove('opacity-100', 'translate-y-0', 'pointer-events-auto');
        }
    };

    if (backToTopButton) {
        window.addEventListener('scroll', toggleBackToTop);
        // Also use the custom smooth scroll for back to top by preventing default is handled by the generic anchor handler above
        // just need to ensure href="#" scrolls to top
        backToTopButton.addEventListener('click', (e) => {
            e.preventDefault();
            // Custom scroll to top
            const startPosition = window.pageYOffset;
            const distance = -startPosition;
            const duration = 1500;
            let start = null;

            function step(timestamp) {
                if (!start) start = timestamp;
                const progress = timestamp - start;
                const percentage = Math.min(progress / duration, 1);
                const ease = percentage < 0.5
                    ? 4 * percentage * percentage * percentage
                    : 1 - Math.pow(-2 * percentage + 2, 3) / 2;

                window.scrollTo(0, startPosition + distance * ease);
                if (progress < duration) window.requestAnimationFrame(step);
            }
            window.requestAnimationFrame(step);
        });
    }
});
