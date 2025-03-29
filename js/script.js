/**
 * 얼굴 필터 웹 애플리케이션
 * 웹캠을 사용해 얼굴을 인식하고 다양한 필터를 적용합니다.
 * 거울 모드에서 필터가 올바르게 적용되도록 수정됨
 */

// ================ 전역 변수 및 상수 ================
let faceapi;
let video;
let detections;
let filterImages = {};
let currentFilter = ''; // 현재 선택된 필터
let downloadCounter = 0;

// 필터 옵션 설정
const FILTER_OPTIONS = {
    STAR: 'star',
    HEART: 'heart',
    GLASSES: 'glasses',
    COMPUTER: 'computer',
    COWBOY: 'cowboy'
};

// 얼굴 인식 설정
const DETECTION_OPTIONS = {
    withLandmarks: true,
    withDescriptors: false
};

// ================ 초기화 함수 ================

/**
 * 페이지 로드 완료 시 로딩 표시 숨김
 */
window.addEventListener("load", () => {
    document.getElementById("loadingProgress").style.display = "none";
});

/**
 * p5.js 필터 이미지 사전 로드
 */
function preload() {
    filterImages = {
        star: loadImage('img/star.png'),
        heart: loadImage('img/heart.png'),
        glasses: loadImage('img/glasses.png'),
        computer: loadImage('img/computer.jpeg'),
        cowboyHat: loadImage('img/cowboy_hat.png'),
        sunglasses: loadImage('img/sunglasses.png')
    };
}

/**
 * p5.js 캔버스 설정 및 애플리케이션 초기화
 */
function setup() {
    frameRate(60);
    createResponsiveCanvas();
    initVideoAndFaceDetection();
}

/**
 * 반응형 캔버스 생성
 */
function createResponsiveCanvas() {
    const canvasContainer = document.getElementById('canvas-container');
    
    // 디스플레이 너비에 따라 캔버스 크기 설정
    let canvasWidth, canvasHeight;
    
    if (window.innerWidth >= 768) {
        // 768px 이상일 때 너비 500px, 높이는 비율 유지
        canvasWidth = 500;
        // 4:3 비율 유지
        canvasHeight = 375; // 500 * (3/4)
    } else {
        // 768px 미만일 때 100% 너비
        canvasWidth = canvasContainer.offsetWidth;
        // 비율 유지 (4:3)
        canvasHeight = canvasWidth * 0.75;
    }
    
    const canvas = createCanvas(canvasWidth, canvasHeight);
    canvas.parent(canvasContainer);

    // 창 크기가 변경될 때 캔버스 크기 업데이트
    window.addEventListener('resize', () => {
        if (window.innerWidth >= 768) {
            resizeCanvas(500, 375);
        } else {
            resizeCanvas(canvasContainer.offsetWidth, canvasContainer.offsetWidth * 0.75);
        }
    });
}

/**
 * 비디오 캡처 및 얼굴 인식 모델 초기화
 */
function initVideoAndFaceDetection() {
    video = createCapture(VIDEO);
    video.size(width, height);
    video.hide();
    faceapi = ml5.faceApi(video, DETECTION_OPTIONS, modelReady);
}

/**
 * 얼굴 인식 모델이 준비되면 호출되는 콜백
 */
function modelReady() {
    console.log('Face API 준비 완료!');
    faceapi.detect(handleFaceDetectionResults);
}

// ================ 얼굴 인식 처리 함수 ================

/**
 * 얼굴 인식 결과 처리 및 프레임 그리기
 * @param {Error} err - 인식 실패시 오류 객체
 * @param {Array} result - 랜드마크가 포함된 탐지된 얼굴 배열
 */
function handleFaceDetectionResults(err, result) {
    if (err) {
        console.error('얼굴 인식 오류:', err);
        return;
    }

    detections = result;
    background(255);
    
    // 비디오를 좌우 반전으로 그리기 (거울 모드)
    renderMirroredVideoFrame();

    if (detections && detections.length > 0) {
        // 거울 모드에서 필터 적용 (좌표 보정 필요)
        applyFiltersToDetectedFaces(detections);
    }

    requestAnimationFrame(() => faceapi.detect(handleFaceDetectionResults));
}

/**
 * 비디오 프레임을 거울 모드로 렌더링 (좌우 반전)
 */
function renderMirroredVideoFrame() {
    push();
    translate(width, 0);
    scale(-1, 1);
    image(video, 0, 0, width, height);
    pop();
}

/**
 * 감지된 얼굴에 선택된 필터 적용
 * @param {Array} detections - 감지된 얼굴 배열
 */
function applyFiltersToDetectedFaces(detections) {
    for (const detection of detections) {
        // 안전 확인: 얼굴 부위가 탐지되었는지
        if (!hasValidFacialFeatures(detection)) {
            continue; // 특징점이 없으면 다음 얼굴로 건너뜀
        }

        // 얼굴 크기에 따라 필터 크기 조정 계수
        const faceWidth = detection.alignedRect._width;
        const scaleFactor = faceWidth / 180; // 기준 얼굴 너비를 180px로 가정

        // 거울 모드에서 좌표 보정을 위한 준비
        // 특징점 좌표 가공 수행
        const mirroredDetection = mirrorDetectionCoordinates(detection);

        // 선택된 필터에 따라 적절한 함수 호출
        switch(currentFilter) {
            case FILTER_OPTIONS.STAR:
                applyStarFilter(mirroredDetection, scaleFactor);
                break;
                
            case FILTER_OPTIONS.HEART:
                applyHeartFilter(mirroredDetection, scaleFactor);
                break;
                
            case FILTER_OPTIONS.GLASSES:
                applyGlassesFilter(mirroredDetection, scaleFactor);
                break;
                
            case FILTER_OPTIONS.COWBOY:
                applyCowboyFilter(mirroredDetection, scaleFactor);
                break;
                
            case FILTER_OPTIONS.COMPUTER:
                applyComputerFilter(mirroredDetection, scaleFactor);
                break;
        }
    }
}

/**
 * 거울 모드용 좌표 보정 (좌표를 좌우 반전)
 * @param {Object} detection - 얼굴 인식 결과
 * @returns {Object} 좌우 반전된 좌표를 가진 탐지 결과
 */
function mirrorDetectionCoordinates(detection) {
    // 원본 객체를 변경하지 않도록 깊은 복사
    const mirrored = JSON.parse(JSON.stringify(detection));

    // 각 특징점의 x 좌표를 반전 (width - x 형태로)
    if (mirrored.parts) {
        Object.keys(mirrored.parts).forEach(partName => {
            const part = mirrored.parts[partName];
            if (Array.isArray(part)) {
                part.forEach(point => {
                    if (point && typeof point._x === 'number') {
                        point._x = width - point._x;
                    }
                });
            }
        });
    }

    // alignedRect의 좌표도 반전
    if (mirrored.alignedRect && typeof mirrored.alignedRect._x === 'number') {
        mirrored.alignedRect._x = width - mirrored.alignedRect._x - mirrored.alignedRect._width;
    }

    return mirrored;
}

/**
 * 얼굴에 유효한 특징점이 있는지 확인
 * @param {Object} detection - 얼굴 인식 결과
 * @returns {boolean} 유효한 특징점 존재 여부
 */
function hasValidFacialFeatures(detection) {
    return detection.parts && 
           detection.parts.leftEye && 
           detection.parts.rightEye && 
           detection.parts.nose;
}

// ================ 필터 적용 함수 ================

/**
 * 별 필터 적용 - 양쪽 눈에 별 이미지 추가
 * @param {Object} detection - 얼굴 인식 결과
 * @param {number} scaleFactor - 얼굴 크기 비례 계수
 */
function applyStarFilter(detection, scaleFactor) {
    const { leftEye, rightEye } = detection.parts;
    const size = 30 * scaleFactor;
    
    if (leftEye && leftEye.length > 0) {
        const center = calculateCenterPoint(leftEye);
        image(filterImages.star, center.x - size/2, center.y - size/2, size, size);
    }
    
    if (rightEye && rightEye.length > 0) {
        const center = calculateCenterPoint(rightEye);
        image(filterImages.star, center.x - size/2, center.y - size/2, size, size);
    }
}

/**
 * 하트 필터 적용 - 양쪽 눈에 하트 이미지 추가
 * @param {Object} detection - 얼굴 인식 결과
 * @param {number} scaleFactor - 얼굴 크기 비례 계수
 */
function applyHeartFilter(detection, scaleFactor) {
    const { leftEye, rightEye } = detection.parts;
    const size = 30 * scaleFactor;
    
    if (leftEye && leftEye.length > 0) {
        const center = calculateCenterPoint(leftEye);
        image(filterImages.heart, center.x - size/2, center.y, size, size);
    }
    
    if (rightEye && rightEye.length > 0) {
        const center = calculateCenterPoint(rightEye);
        image(filterImages.heart, center.x - size/2, center.y, size, size);
    }
}

/**
 * 안경 필터 적용 - 눈 위치에 안경 이미지 추가
 * @param {Object} detection - 얼굴 인식 결과
 * @param {number} scaleFactor - 얼굴 크기 비례 계수
 */
function applyGlassesFilter(detection, scaleFactor) {
    const { leftEye, rightEye } = detection.parts;
    
    if (leftEye && rightEye && leftEye.length > 0 && rightEye.length > 0) {
        const leftCenter = calculateCenterPoint(leftEye);
        const rightCenter = calculateCenterPoint(rightEye);
        const eyeDistance = dist(leftCenter.x, leftCenter.y, rightCenter.x, rightCenter.y);
        
        // 눈 사이 거리를 기준으로 안경 크기 및 위치 조정
        const glassesWidth = eyeDistance * 2.2;
        const glassesHeight = glassesWidth * 0.6;
        const eyesY = (leftCenter.y + rightCenter.y) / 2;
        const glassesX = (leftCenter.x + rightCenter.x) / 2 - glassesWidth / 2;
        const glassesY = eyesY - (glassesHeight * 0.2);
        
        image(filterImages.glasses, glassesX, glassesY, glassesWidth, glassesHeight);
    }
}

/**
 * 카우보이 필터 적용 - 선글라스와 모자 추가
 * @param {Object} detection - 얼굴 인식 결과
 * @param {number} scaleFactor - 얼굴 크기 비례 계수
 */
function applyCowboyFilter(detection, scaleFactor) {
    const { leftEye, rightEye, nose } = detection.parts;
    
    if (leftEye && rightEye && nose && leftEye.length > 0 && rightEye.length > 0) {
        const leftCenter = calculateCenterPoint(leftEye);
        const rightCenter = calculateCenterPoint(rightEye);
        
        // 눈 사이 거리 기준으로 크기 조정
        const eyeDistance = dist(leftCenter.x, leftCenter.y, rightCenter.x, rightCenter.y);
        
        // 선글라스 위치 조정
        const glassesWidth = eyeDistance * 2.5;
        const glassesHeight = glassesWidth * 0.5;
        const eyesY = (leftCenter.y + rightCenter.y) / 2;
        const glassesX = (leftCenter.x + rightCenter.x) / 2 - glassesWidth / 2;
        const glassesY = eyesY - (glassesHeight * 0.25);
        
        // 모자 위치 및 크기 조정
        const hatWidth = glassesWidth * 1.8;
        const hatHeight = hatWidth * 0.66;
        const hatX = (leftCenter.x + rightCenter.x) / 2 - hatWidth / 2;
        const hatY = eyesY - hatHeight * 1.2; // 이마 위쪽에 배치
        
        // 선글라스와 모자 적용
        image(filterImages.sunglasses, glassesX, glassesY, glassesWidth, glassesHeight);
        image(filterImages.cowboyHat, hatX, hatY, hatWidth, hatHeight);
    }
}

/**
 * 컴퓨터 필터 적용 - 코 위치에 컴퓨터 이미지 추가
 * @param {Object} detection - 얼굴 인식 결과
 * @param {number} scaleFactor - 얼굴 크기 비례 계수
 */
function applyComputerFilter(detection, scaleFactor) {
    const { nose } = detection.parts;
    
    if (nose && nose.length > 0) {
        const center = calculateCenterPoint(nose);
        const size = 100 * scaleFactor;
        image(filterImages.computer, center.x - size/2, center.y - size/2, size, size);
    }
}

// ================ 유틸리티 함수 ================

/**
 * 특징점 배열에서 중심점 계산
 * @param {Array} points - 특징점 배열
 * @returns {Object} 중심 좌표 {x, y}
 */
function calculateCenterPoint(points) {
    if (!points || points.length === 0) {
        return { x: width/2, y: height/2 }; // 기본값 반환
    }
    
    let totalX = 0, totalY = 0;
    let validPoints = 0;

    for (const point of points) {
        if (point && typeof point._x === 'number' && typeof point._y === 'number') {
            totalX += point._x;
            totalY += point._y;
            validPoints++;
        }
    }

    if (validPoints === 0) {
        return { x: width/2, y: height/2 }; // 유효한 점이 없으면 기본값 반환
    }

    return {
        x: totalX / validPoints,
        y: totalY / validPoints
    };
}

// ================ 이미지 캡처 및 다운로드 함수 ================

/**
 * 현재 캔버스를 이미지로 캡처하고 미리보기에 추가
 * HTML의 onclick 이벤트에서 호출됨
 */
function captureImage() {
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
 * HTML 이벤트에서 호출됨
 * @param {HTMLElement} element - 클릭된 이미지 요소
 */
function downloadImage(element) {
    const imageData = element.dataset.src;
    const downloadLink = document.createElement('a');
    downloadLink.href = imageData;
    downloadLink.download = `webcam_filter_${downloadCounter++}.jpg`;
    downloadLink.click();
}

/**
 * 필터 설정 함수
 * @param {string} filterId - 적용할 필터 ID
 */
function setFilter(filterId) {
    currentFilter = filterId;
}

// ================ 전역 함수 노출 ================

// 전역 객체에 함수 노출 (HTML에서 접근하기 위함)
window.func = {
    captureImage,
    downloadImage,
    setFilter
};