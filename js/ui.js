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
     * 현재 캔버스를 이미지로 캡처하고 미리보기에 추가
     */
    captureImage() {
        const imageData = canvas.toDataURL();
        
        // 미리보기 이미지 생성
        const previewImage = document.createElement('img');
        previewImage.src = imageData;
        previewImage.classList.add('capture-preview-image');
        previewImage.dataset.src = imageData;
        
        // 미리보기 컨테이너에 추가
        const previewContainer = document.querySelector('.capture-preview');
        previewContainer.appendChild(previewImage);
    }

    /**
     * 이미지 다운로드 처리
     * @param {HTMLElement} element - 클릭된 이미지 요소
     */
    downloadImage(element) {
        const imageData = element.dataset.src;
        const downloadLink = document.createElement('a');
        downloadLink.href = imageData;
        downloadLink.download = `webcam_filter_${this.downloadCounter++}.jpg`;
        downloadLink.click();
    }

    /**
     * 전역 함수 노출 (HTML에서 접근하기 위함)
     */
    exposeFunctionsToWindow() {
        window.func = {
            captureImage: () => this.captureImage(),
            downloadImage: (element) => this.downloadImage(element),
            setFilter: (filterId) => this.filters.setFilter(filterId)
        };
    }
}