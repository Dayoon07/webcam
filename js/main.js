let app;

// p5.js 이벤트 핸들러
function preload() {
    app = new Core();
    app.preloadImages();
}

function setup() {
    app.initApp();
}

// 페이지 로드 완료 시 로딩 진행 상태 숨기기
window.addEventListener("load", () => {
    if (app && app.ui) {
        app.ui.hideLoadingProgress();
    }
});