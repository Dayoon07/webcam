let faceapi;
let video;
let detections;
let filterImages = {};
let currentFilter = ''; // 현재 선택된 필터
let downloadCounter = 0;

// 필터 옵션 설정
const FILTER_OPTIONS = {
    COWBOY: 'cowboy'
};

// 얼굴 인식 설정
const DETECTION_OPTIONS = {
    withLandmarks: true,
    withDescriptors: false
};

window.addEventListener("load", () => {
    document.getElementById("loadingProgress").style.display = "none";
});

/**
 * p5.js 필터 이미지 사전 로드
 */
function preload() {
    filterImages = {
        cowboyHat: loadImage('img/cowboy_hat.png', () => console.log('cowboy hat image loaded')),
        sunglasses: loadImage('img/sunglasses.png', () => console.log('sunglasses image loaded'))
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

function createResponsiveCanvas() {
    const canvasContainer = document.getElementById('canvas-container');
    
    let canvasWidth, canvasHeight;
    
    if (window.innerWidth >= 768) {
        canvasWidth = 500;
        canvasHeight = 375;
    } else {
        canvasWidth = canvasContainer.offsetWidth;
        canvasHeight = canvasWidth * 0.75;
    }
    
    const canvas = createCanvas(canvasWidth, canvasHeight);
    canvas.parent(canvasContainer);

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

        switch(currentFilter) {
            case FILTER_OPTIONS.COWBOY:
                applyCowboyFilter(mirroredDetection, scaleFactor);
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
    const mirrored = JSON.parse(JSON.stringify(detection));

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
    console.log(`필터가 ${currentFilter}로 설정되었습니다.`);
}

// ================ 전역 함수 노출 ================

// 전역 객체에 함수 노출 (HTML에서 접근하기 위함)
window.func = {
    captureImage,
    downloadImage,
    setFilter
};