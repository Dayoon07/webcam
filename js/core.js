class Core {
    constructor() {
        this.video = null;
        this.filterImages = {};
        this.filters = null;
        this.faceDetection = null;
        this.ui = null;
    }

    /**
     * p5.js 필터 이미지 사전 로드
     * 
     * 추가하고 싶은 게 있으면 config.js에서 추가 
     * 했던 (필드명: '명칭') 걸 가지고
     * 명칭: loadImage('img/파일명.확장자', () => console.log('대충 이미지 로드됨'));
     * 
     */
    preloadImages() {
        this.filterImages = {
            cowboyHat: loadImage('http://dayoon07.github.io/webcam/img/cowboy_hat.png', () => console.log('cowboy hat image loaded')),
            sunglasses: loadImage('http://dayoon07.github.io/webcam/img/sunglasses.png', () => console.log('sunglasses image loaded')),
            heartEye: loadImage('http://dayoon07.github.io/webcam/img/heart.png', () => console.log('heart eye image loaded'))
        };
    }

    /**
     * 캔버스 생성 및 반응형 설정
     */
    createResponsiveCanvas() {
        const canvasContainer = document.getElementById('canvas-container');
        
        let canvasWidth, canvasHeight;
        
        if (window.innerWidth >= 768) {
            // 데스크톱 환경
            canvasWidth = 500;
            canvasHeight = 375;
        } else {
            // 모바일 환경
            canvasWidth = canvasContainer.offsetWidth;
            // 화면 비율을 고려한 높이 설정 (4:3 비율 유지)
            canvasHeight = Math.min(
                window.innerHeight * 0.6, // 화면 높이의 60%를 최대 높이로 제한
                canvasWidth * 0.75       // 4:3 비율 유지
            );
        }
        
        const canvas = createCanvas(canvasWidth, canvasHeight);
        canvas.parent(canvasContainer);
    
        // 리사이즈 이벤트 처리
        window.addEventListener('resize', () => {
            if (window.innerWidth >= 768) {
                resizeCanvas(500, 375);
            } else {
                const newWidth = canvasContainer.offsetWidth;
                const newHeight = Math.min(
                    window.innerHeight * 0.6,
                    newWidth * 0.75
                );
                resizeCanvas(newWidth, newHeight);
            }
        });
    }

    /**
     * 비디오 캡처 초기화
     */
    initVideoCapture() {
        this.video = createCapture(VIDEO);
        this.video.size(width, height);
        this.video.hide();
    }

    /**
     * 앱 초기화
     */
    initApp() {
        frameRate(60);
        this.createResponsiveCanvas();
        this.initVideoCapture();
        
        this.filters = new Filters(this.filterImages);
        this.faceDetection = new FaceDetection(this.video, this.filters);
        this.faceDetection.initFaceDetection();
        
        this.ui = new UI(this.filters);
        this.ui.hideLoadingProgress();
        this.ui.exposeFunctionsToWindow();
    }
}