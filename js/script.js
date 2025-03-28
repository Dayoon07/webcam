let faceapi;
let video;
let detections;
let star, heart, glasses;
let itemName = ''; // 현재 선택된 필터
let downloadName = 0;

const btns = [
    { name: '별', itemName: 'star' },
    { name: '하트', itemName: 'heart' },
    { name: '코주부', itemName: 'glasses' }
];

const detectionOptions = {
    withLandmarks: true,
    withDescriptors: false
};

function preload() {
    star = loadImage('assets/star.png');
    heart = loadImage('assets/heart.png');
    glasses = loadImage('assets/glasses.png');
}

function setup() {
    frameRate(60);
    
    const canvasContainer = document.getElementById('canvas-container');
    const cnv = createCanvas(360, 270);
    cnv.parent(canvasContainer);

    createFilterButtons();
    initVideo();
}

// 필터 버튼 생성
function createFilterButtons() {
    const filterContainer = document.querySelector('.filter-buttons');
    
    btns.forEach(({ name, itemName: iName }) => {
        const btn = createButton(name);
        btn.mousePressed(() => itemName = iName);
        btn.parent(filterContainer);
    });

    const captureButton = createButton('촬영');
    captureButton.mousePressed(captureImage);
    captureButton.parent(filterContainer);
}

// 비디오 캡처 & 얼굴 인식 모델 초기화
function initVideo() {
    video = createCapture(VIDEO);
    video.size(width, height);
    video.hide();
    faceapi = ml5.faceApi(video, detectionOptions, modelReady);
}

// 얼굴 인식 모델이 준비되면 실행
function modelReady() {
    console.log('Face API Ready!');
    faceapi.detect(gotResults);
}

// 얼굴 인식 결과 처리
function gotResults(err, result) {
    if (err) {
        console.error(err);
        return;
    }

    detections = result;
    background(255);
    image(video, 0, 0, width, height);

    if (detections && detections.length > 0) {
        drawLandmarks(detections);
    }

    requestAnimationFrame(() => faceapi.detect(gotResults));
}

// 얼굴 특징을 기반으로 필터 적용
function drawLandmarks(detections) {
    for (const detection of detections) {
        const { leftEye, rightEye, nose } = detection.parts;

        if (itemName === 'star' || itemName === 'heart') {
            drawPart(leftEye);
            drawPart(rightEye);
        } else if (itemName === 'glasses') {
            drawPart(nose);
        }
    }
}

// 특정 부위에 필터 적용
function drawPart(features) {
    let totalX = 0, totalY = 0;

    for (const { _x, _y } of features) {
        totalX += _x;
        totalY += _y;
    }

    totalX /= features.length;
    totalY /= features.length;

    if (itemName === 'star') {
        image(star, totalX - 15, totalY - 15, 30, 30);
    } else if (itemName === 'heart') {
        image(heart, totalX - 15, totalY - 15 + 30, 30, 30);
    } else if (itemName === 'glasses') {
        image(glasses, totalX - 50, totalY - 60, 100, 100);
    }
}

// 사진 촬영 후 미리보기 & 다운로드 기능 추가
function captureImage() {
    const data = canvas.toDataURL();
    
    // 미리보기 이미지 생성
    const img = document.createElement('img');
    img.src = data;
    img.classList.add('capture-preview-image');
    img.onclick = function () {
        const a = document.createElement('a');
        a.href = data;
        a.download = `image${downloadName++}.jpg`;
        a.click();
    };

    // 미리보기 컨테이너에 추가
    const previewContainer = document.querySelector('.capture-preview');
    previewContainer.appendChild(img);
}
