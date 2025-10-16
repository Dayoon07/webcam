let app;

// p5.js 이벤트 핸들러
function preload() {
    // 로딩 메시지 업데이트
    const loadingText = document.querySelector('#loadingProgress p');
    if (loadingText) {
        loadingText.textContent = '이미지 로딩 중...';
    }
    
    app = new Core();
    app.preloadImages();
    
    if (loadingText) {
        loadingText.textContent = '초기화 중...';
    }
}

function setup() {
    app.initApp();
}