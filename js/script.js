// 전역 변수
let faceapi;
let video;
let detections;
let filterImages = {};
let currentFilter = ''; // 현재 선택된 필터
let downloadCounter = 0;

// 필터 버튼 설정
const filterButtons = [
    { label: '별', filterId: 'star' },
    { label: '하트', filterId: 'heart' },
    { label: '코주부', filterId: 'glasses' },
    { label: '테스트사진', filterId: 'computer' },
    { label: '카우보이', filterId: 'cowboy' }
];

// 얼굴 인식 설정
const detectionOptions = {
    withLandmarks: true,
    withDescriptors: false
};

/**
 * 필터 이미지 미리 로드
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
    
    const canvasContainer = document.getElementById('canvas-container');
    const canvas = createCanvas(360, 270);
    canvas.parent(canvasContainer);

    // createFilterButtons();
    initVideoAndFaceDetection();
}

/**
 * 필터 선택 버튼 생성
 */
function createFilterButtons() {
    const filterContainer = document.querySelector('.filter-buttons');
    
    filterButtons.forEach(({ label, filterId }) => {
        const btn = createButton(label);
        btn.mousePressed(() => currentFilter = filterId);
        btn.parent(filterContainer);
    });

    // 촬영 버튼은 HTML에서 직접 처리하므로 여기서는 제거
}

/**
 * 비디오 캡처 및 얼굴 인식 모델 초기화
 */
function initVideoAndFaceDetection() {
    video = createCapture(VIDEO);
    video.size(width, height);
    video.hide();
    faceapi = ml5.faceApi(video, detectionOptions, modelReady);
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
    image(video, 0, 0, width, height);

    if (detections && detections.length > 0) {
        applyFiltersToDetectedFaces(detections);
    }

    requestAnimationFrame(() => faceapi.detect(handleFaceDetectionResults));
}

/**
 * 탐지된 얼굴에 선택된 필터 적용
 * @param {Array} detections - 랜드마크가 포함된 탐지된 얼굴 배열
 */
function applyFiltersToDetectedFaces(detections) {
    for (const detection of detections) {
        const { leftEye, rightEye, nose } = detection.parts;

        switch(currentFilter) {
            case 'star':
            case 'heart':
                applyFilterToFacePart(leftEye, currentFilter);
                applyFilterToFacePart(rightEye, currentFilter);
                break;
            case 'glasses':
                applyFilterToFacePart(nose, currentFilter);
                break;
            case 'cowboy':
                applyCowboyFilter(detection);
                break;
            case 'computer':
                applyComputerFilter(detection);
                break;
        }
    }
}

/**
 * 카우보이 모자와 선글라스 필터 적용
 * @param {Object} detection - 랜드마크가 포함된 탐지된 얼굴
 */
function applyCowboyFilter(detection) {
    const { leftEye, rightEye, nose } = detection.parts;
    
    // 선글라스를 위한 눈 중앙 좌표 계산
    const eyeX = (leftEye[0]._x + rightEye[3]._x) / 2;
    const eyeY = (leftEye[0]._y + rightEye[3]._y) / 2;
    
    // 모자를 위한 코 중앙 좌표 계산
    const noseX = nose[0]._x;
    const noseY = nose[0]._y;

    // 선글라스 적용
    image(filterImages.sunglasses, eyeX - 50, eyeY - 25, 100, 50); 

    // 카우보이 모자 적용 (이마 위쪽에 배치)
    image(filterImages.cowboyHat, noseX - 75, noseY - 120, 150, 100);
}

/**
 * 얼굴 위에 컴퓨터 이미지 필터 적용
 * @param {Object} detection - 랜드마크가 포함된 탐지된 얼굴
 */
function applyComputerFilter(detection) {
    const { nose } = detection.parts;
    const center = calculateCenterPoint(nose);
    
    image(filterImages.computer, center.x - 50, center.y - 60, 100, 100);
}

/**
 * 특정 얼굴 부위에 필터 적용
 * @param {Array} featurePoints - 얼굴 특징점 배열
 * @param {string} filterType - 적용할 필터 유형
 */
function applyFilterToFacePart(featurePoints, filterType) {
    const center = calculateCenterPoint(featurePoints);
    
    if (filterType === 'star') {
        image(filterImages.star, center.x - 15, center.y - 15, 30, 30);
    } else if (filterType === 'heart') {
        image(filterImages.heart, center.x - 15, center.y + 15, 30, 30); // 위치 수정됨 (이전에 잘못됨)
    } else if (filterType === 'glasses') {
        image(filterImages.glasses, center.x - 50, center.y - 60, 100, 100);
    }
}

/**
 * 특징점 배열에서 중심점 계산
 * @param {Array} points - 특징점 배열
 * @returns {Object} 중심 좌표 {x, y}
 */
function calculateCenterPoint(points) {
    let totalX = 0, totalY = 0;

    for (const { _x, _y } of points) {
        totalX += _x;
        totalY += _y;
    }

    return {
        x: totalX / points.length,
        y: totalY / points.length
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

// 전역 객체에 함수 노출 (HTML에서 접근하기 위함)
window.appFunctions = {
    captureImage,
    downloadImage,
    setFilter: (filterId) => {
        currentFilter = filterId;
    }
};