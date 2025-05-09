class UI {
    constructor(filters) {
        this.filters = filters;
    }

    /**
     * 로딩 진행 상태 숨기기
     */
    hideLoadingProgress() {
        document.getElementById("loadingProgress").style.display = "none";
    }

    /**
     * 카운트다운 후 현재 캔버스를 이미지로 캡처하고 다운로드
     */
    captureAndDownloadImage() {
        const countdownContainer = document.createElement('div');
        countdownContainer.id = 'countdown-container';
        countdownContainer.className = 'fixed top-0 left-0 right-0 bg-blue-500 text-white text-center py-2 font-bold text-xl z-50';
        countdownContainer.style.transition = 'opacity 0.3s ease-in-out';
        document.body.appendChild(countdownContainer);
        
        let count = 3;
        
        const updateCountdown = () => {
            countdownContainer.textContent = `캡처까지 ${count}초 남았습니다...`;
            
            if (count === 0) {
                countdownContainer.textContent = '캡처 중...';
                const year = new Date().getFullYear();
                const month = String(new Date().getMonth() + 1).padStart(2, '0');
                const day = String(new Date().getDate()).padStart(2, '0');
                const hour = String(new Date().getHours()).padStart(2, '0');
                const minute = String(new Date().getMinutes()).padStart(2, '0');
                const second = String(new Date().getSeconds()).padStart(2, '0');
                const dateString = `${year}${month}${day}_${hour}${minute}${second}`;

                const imageData = canvas.toDataURL();
                const downloadLink = document.createElement('a');
                downloadLink.href = imageData;
                downloadLink.download = `KM_Snap_${dateString}.png`;
                
                setTimeout(() => {
                    countdownContainer.textContent = '다운로드 시작...';
                    downloadLink.click();
                    
                    setTimeout(() => {
                        countdownContainer.style.opacity = '0';
                        setTimeout(() => {
                            if (countdownContainer.parentNode) {
                                countdownContainer.parentNode.removeChild(countdownContainer);
                            }
                        }, 300);
                    }, 1000);
                }, 500);
                
                return;
            }
            
            count--;
            setTimeout(updateCountdown, 1000);
        };
        
        // 카운트다운 시작
        updateCountdown();
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