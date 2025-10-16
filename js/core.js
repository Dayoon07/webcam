class Core {
    constructor() {
        this.video = null;
        this.filterImages = {};
        this.filters = null;
        this.faceDetection = null;
        this.ui = null;
        this.currentAspectRatio = Config.ASPECT_RATIOS.FULL; // 기본 비율은 전체화면
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
        try {
            this.filterImages = {
                // 기본 필터 이미지들
                cowboy_hat: loadImage('https://dayoon07.github.io/webcam/img/cowboy_hat.png', 
                    () => console.log('cowboy_hat 이미지 로드됨')
                ),
                sunglasses: loadImage('https://dayoon07.github.io/webcam/img/sunglasses.png', 
                    () => console.log('sunglasses 이미지 로드됨')
                ),
                eye_heart: loadImage('https://dayoon07.github.io/webcam/img/heart.png', 
                    () => console.log('heart_eye 이미지 로드됨')
                ),
                white_circle: loadImage('https://dayoon07.github.io/webcam/img/white_circle.png', 
                    () => console.log('white_circle 이미지 로드됨')
                ),
                // 명명 규칙 통일 (snake_case로 통일)
                cat_face: loadImage('https://dayoon07.github.io/webcam/img/cat_face.png', 
                    () => console.log('cat_face 이미지 로드됨')
                ),
                dog_face: loadImage('https://dayoon07.github.io/webcam/img/dog_face.png', 
                    () => console.log('dog_face 이미지 로드됨')
                ),
                bear_face: loadImage('https://dayoon07.github.io/webcam/img/bear_face.png', 
                    () => console.log('bear_face 이미지 로드됨')
                ),
                graduation_cap: loadImage('https://dayoon07.github.io/webcam/img/graduation_cap.png', 
                    () => console.log('graduation_cap 이미지 로드됨')
                ),
                kmhs_logo: loadImage('https://dayoon07.github.io/webcam/img/kmhs_logo.png', 
                    () => console.log('kmhs_logo 이미지 로드됨')
                ),
                christmas_bg: loadImage('https://dayoon07.github.io/webcam/img/christmas_bg.png',
                    () => console.log('christmas_bg 이미지 로드됨')
                ),
                polaroid_pic: loadImage('https://dayoon07.github.io/webcam/img/polaroid_pic.png',
                    () => console.log('polaroid_pic 이미지 로드됨')
                ),
                instagram_popular_filter: loadImage('https://dayoon07.github.io/webcam/img/instagram_popular_filter.png',
                    () => console.log('instagram_popular_filter 이미지 로드됨')
                )
            };
        } catch (err) {
            console.error("이미지 로드 중 오류 발생:", err);
        }
    }

    /**
     * 캔버스 생성 및 반응형 설정
     */
    createResponsiveCanvas() {
        const canvasContainer = document.getElementById('canvas-container');
    
        // p5.js의 createCanvas()는 기본적으로 body에 추가되므로 parent()를 이용해 이동
        this.canvas = createCanvas(canvasContainer.clientWidth, canvasContainer.clientHeight);
        this.canvas.parent(canvasContainer); // canvas를 특정 div 내부에 배치
    
        this.applyAspectRatio(canvasContainer);
    
        // 리사이즈 이벤트 처리
        window.addEventListener('resize', () => {
            this.applyAspectRatio(canvasContainer);
        });
    }

    /**
     * 선택된 비율에 따라 캔버스 크기 적용
     * @param {HTMLElement} container - 캔버스 컨테이너 요소
     */
    applyAspectRatio(container) {
        let canvasWidth, canvasHeight;
        const containerWidth = container.offsetWidth;
        
        switch(this.currentAspectRatio) {
            case Config.ASPECT_RATIOS.RATIO_4_3:
                canvasWidth = containerWidth;
                canvasHeight = containerWidth * (3/4);
                break;
            
            case Config.ASPECT_RATIOS.RATIO_16_9:
                canvasWidth = containerWidth;
                canvasHeight = containerWidth * (9/16);
                break;
            
            case Config.ASPECT_RATIOS.RATIO_9_16:
                // 모바일 화면 대응
                if (window.innerWidth < 768) {
                    // 모바일에서는 컨테이너 너비의 100%를 사용
                    canvasWidth = window.innerWidth;
                    canvasHeight = canvasWidth * 1.1;
                    
                    // 높이가 화면보다 너무 커지지 않도록 제한
                    if (canvasHeight > window.innerHeight * 0.8) {
                        canvasHeight = window.innerHeight * 0.8;
                        canvasWidth = canvasHeight * (9/16);
                    }
                } else {
                    // 기존 데스크톱 로직 유지
                    canvasWidth = containerWidth;
                    canvasHeight = containerWidth * (16/9);
                    if (canvasHeight > window.innerHeight * 0.7) {
                        canvasHeight = window.innerHeight * 0.7;
                        canvasWidth = canvasHeight * (9/16);
                    }
                }
                break;
            
            case Config.ASPECT_RATIOS.FULL:
            default:
                if (window.innerWidth >= 768) {
                    // 데스크톱 환경
                    canvasWidth = containerWidth > 500 ? 500 : containerWidth;
                    canvasHeight = canvasWidth * 0.75; // 4:3 비율 유지
                } else {
                    // 모바일 환경
                    canvasWidth = containerWidth; // 컨테이너 너비의 100%
                    // 화면 비율을 고려한 높이 설정
                    canvasHeight = Math.min(
                        window.innerHeight * 0.7, // 화면 높이의 70%를 최대 높이로 제한
                        canvasWidth * 0.75       // 4:3 비율 유지
                    );
                }
                break;
        }
        
        resizeCanvas(canvasWidth, canvasHeight);
        
        // 비디오 크기도 캔버스에 맞게 조정
        if (this.video) this.video.size(canvasWidth, canvasHeight);
    }

    /**
     * 비율 설정 함수
     * @param {string} ratioId - 설정할 비율 ID
     */
    setAspectRatio(ratioId) {
        if (Object.values(Config.ASPECT_RATIOS).includes(ratioId)) {
            this.currentAspectRatio = ratioId;
            this.applyAspectRatio(document.getElementById('canvas-container'));
            console.log(`비율이 ${this.currentAspectRatio}로 설정되었습니다.`);
        } else {
            console.error(`유효하지 않은 비율: ${ratioId}`);
        }
    }

     /**
     * 비디오 캡처 초기화 (빠른 시작)
     */
    initVideoCapture() {
        // 카메라 즉시 시작
        this.video = createCapture(VIDEO, () => {
            console.log('카메라 준비 완료!');
            // 카메라가 준비되면 UI 업데이트
            if (this.ui) {
                this.ui.updateLoadingProgress('카메라 연결 완료!');
            }
        });
        this.video.size(width, height);
        this.video.hide();
    }

    /**
     * 앱 초기화 (최적화됨)
     */
    initApp() {
        frameRate(60);
        this.createResponsiveCanvas();
        
        // UI 먼저 초기화
        this.filters = new Filters(this.filterImages);
        this.ui = new UI(this.filters);
        this.ui.updateLoadingProgress('카메라 연결 중...');
        
        // 카메라 초기화 (비동기로 빠르게 시작)
        this.initVideoCapture();
        
        // 얼굴 인식 초기화 (카메라와 병렬로 진행)
        this.ui.updateLoadingProgress('얼굴 인식 모델 로딩 중...');
        this.faceDetection = new FaceDetection(this.video, this.filters);
        this.faceDetection.initFaceDetection();
        
        // 전역 함수 노출
        this.ui.exposeFunctionsToWindow(this);
    }
}