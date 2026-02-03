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

        // メニュー内のリンクをクリックしたら閉じる
        const mobileLinks = mobileMenu.querySelectorAll('a');
        mobileLinks.forEach(link => {
            link.addEventListener('click', () => {
                mobileMenu.classList.add('hidden');
            });
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

    console.log('Main.js: Initializing scroll animations...');

    // Scroll Animation (Intersection Observer)
    const observerOptions = {
        threshold: 0, // 0.1から0に変更して、少しでも入ったらすぐに発火するように
        rootMargin: "0px 0px -50px 0px"
    };

    const animationObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                console.log('Animation triggered for:', entry.target.className);
                entry.target.classList.add('is-visible');
                animationObserver.unobserve(entry.target);
            }
        });
    }, observerOptions);

    // [修正] animate- で始まるすべてのクラス、および animate-on-scroll を監視対象にする
    document.querySelectorAll('[class*="animate-"], .animate-on-scroll').forEach(el => {
        animationObserver.observe(el);
    });

    // セーフティフォールバック: スクロール位置ではなく時間で発火してしまう問題があったため削除
    // IntersectionObserverが正常に動作すれば不要。

    // カード・ブロック用スタッガーアニメーション
    const staggerObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const parent = entry.target;
                const children = parent.querySelectorAll('.stagger-item');

                children.forEach((child, index) => {
                    // 各子要素にインデックスに応じた遅延を設定
                    child.style.setProperty('--stagger-delay', `${index * 150}ms`);
                    child.classList.add('stagger-animate');
                });

                staggerObserver.unobserve(parent);
            }
        });
    }, { threshold: 0, rootMargin: "0px 0px 0px 0px" }); // 画面内に入ったらすぐに発火

    // スタッガーアニメーション対象の親要素を監視
    document.querySelectorAll('.stagger-container').forEach(container => {
        staggerObserver.observe(container);
    });

    // 個別カードのホバーエフェクト（3D傾き）
    document.querySelectorAll('.card-tilt').forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;

            const rotateX = (y - centerY) / 20;
            const rotateY = (centerX - x) / 20;

            card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-5px)`;
        });

        card.addEventListener('mouseleave', () => {
            card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) translateY(0)';
        });
    });

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
    // Smooth Scroll for Anchor Links
    // href^="#" だけでなく、パスを含んでいてもハッシュがあるものを対象にする
    document.querySelectorAll('a[href*="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const href = this.getAttribute('href');
            // ページ内リンクかどうか判定
            // 1. #だけで始まる
            // 2. 現在のパスと同じパス + #
            // 3. ./index.html#... のような相対パスで、解決すると現在のページになる場合

            const url = new URL(href, window.location.href);
            // 同じページ内のハッシュリンクの場合のみスムーススクロール
            if (url.pathname === window.location.pathname && url.hash) {
                e.preventDefault();
                const targetId = url.hash;
                const targetElement = document.querySelector(targetId);
                if (targetElement) {
                    const targetPosition = targetElement.getBoundingClientRect().top + window.pageYOffset;
                    const startPosition = window.pageYOffset;
                    const distance = targetPosition - startPosition;
                    const duration = 1500; // 少し短くする（2.5秒は長すぎるため）
                    let start = null;

                    function step(timestamp) {
                        if (!start) start = timestamp;
                        const progress = timestamp - start;
                        const percentage = Math.min(progress / duration, 1);
                        const ease = percentage < 0.5
                            ? 4 * percentage * percentage * percentage
                            : 1 - Math.pow(-2 * percentage + 2, 3) / 2;

                        window.scrollTo(0, startPosition + distance * ease);

                        if (progress < duration) {
                            window.requestAnimationFrame(step);
                        } else {
                            // アニメーション完了後にハッシュをURLに反映（オプション）
                            // history.pushState(null, null, targetId);
                        }
                    }
                    window.requestAnimationFrame(step);
                }
            }
        });
    });




    // Typewriter Effect for Platform Code
    const codeContainer = document.getElementById('code-typewriter');
    if (codeContainer) {
        const codeText = `// X-VERSE Project Initialization

const
  platform = new XVerse({
    space: "Photorealistic 3D",
    time: "4D Timeline Simulation",
    action: "Unified Interaction UI",
    share: "Collaborative Sync"
  });`;

        const typeWriterObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    console.log('Typewriter section intersected');
                    startTypewriter(codeContainer, codeText);
                    typeWriterObserver.unobserve(entry.target);
                }
            });
        }, { threshold: 0, rootMargin: "0px 0px 0px 0px" }); // 画面内に入ったらすぐに発火

        typeWriterObserver.observe(codeContainer);
    }

    function startTypewriter(element, text) {
        let i = 0;
        element.innerHTML = '';
        const speed = 30; // ms per char

        function type() {
            if (i < text.length) {
                // Simple syntax highlighting support could be added here
                // For now, just preserving formatting
                let char = text.charAt(i);

                // Handle newlines
                if (char === '\n') {
                    element.innerHTML += '<br>';
                } else if (char === ' ') {
                    element.innerHTML += '&nbsp;';
                } else {
                    element.innerHTML += `<span class="text-emerald-400">${char}</span>`;
                }

                i++;
                setTimeout(type, speed);
            } else {
                // blink cursor at end
                element.innerHTML += '<span class="animate-pulse">_</span>';
            }
        }
        type();
    }

    // Platformセクション用アニメーション監視
    const platformElements = document.querySelectorAll('.platform-slide-left, .platform-slide-right');
    if (platformElements.length > 0) {
        const platformObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-visible');
                    platformObserver.unobserve(entry.target);
                }
            });
        }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

        platformElements.forEach(el => platformObserver.observe(el));
    }
});
