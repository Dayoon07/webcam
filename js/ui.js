class UI {
    constructor(filters) {
        this.filters = filters;
        this.downloadCounter = 0;
    }

    /**
     * 로딩 진행 상태 숨기기
     */
    hideLoadingProgress() {
        document.getElementById("loadingProgress").style.display = "none";
    }

    /**
     * 현재 캔버스를 이미지로 캡처하고 즉시 다운로드
     */
    captureAndDownloadImage() {
        const imageData = canvas.toDataURL();
        const downloadLink = document.createElement('a');
        downloadLink.href = imageData;
        downloadLink.download = `webcam_filter_${this.downloadCounter++}.jpg`;
        downloadLink.click();
    }

    /**
     * 전역 함수 노출 (HTML에서 접근하기 위함)
     * @param {Core} core - 코어 객체 참조
     */
    exposeFunctionsToWindow(core) {
        window.func = {
            captureAndDownloadImage: () => this.captureAndDownloadImage(),
            setFilter: (filterId) => this.filters.setFilter(filterId),
            setAspectRatio: (ratioId) => core.setAspectRatio(ratioId)
        };
    }
}