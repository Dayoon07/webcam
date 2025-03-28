let faceapi;
let video;
let detections;
let star;
let heart;
let glasses;
let itemName = '';
let downloadName = 0;
let cameraDiv;
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
    const x = (windowWidth) / 5;
    const y = (windowHeight) / 4;

    frameRate(120);
    initCanvas(x, y);
    createButtons(x, y);
    initVideo();
}

function initCanvas(x, y) {
    cnv = createCanvas(360, 270);
    cnv.position(x, y);
    document.getElementById('canvas-container').appendChild(cnv.elt);
}

function createButtons(x, y) {
    btns.forEach((btn, idx) => {
        const { name, itemName: iName } = btn;
        const element = createButton(name);

        element.position(x + width * idx / 4, y + height);
        element.mousePressed(function () {
            itemName = iName;
        });
        document.querySelector('.filter-buttons').appendChild(element.elt);
    });

    button4 = createButton('촬영');
    button4.position(x + width * 3 / 4, y + height);
    button4.mousePressed(function () {
        const data = cnv.canvas.toDataURL();
        const a = createElement('a');
        const img = createElement('img');
        
        img.size(width / 2, height / 2);
        img.elt.src = data;
        a.elt.href = data;
        a.elt.download = 'image' + str(downloadName++) + '.jpg';
        a.child(img);
        document.querySelector('.capture-button').appendChild(a.elt);
    });
}

function initVideo() {
    video = createCapture(VIDEO);
    video.size(width, height);
    video.hide();
    faceapi = ml5.faceApi(video, detectionOptions, modelReady);
}

function modelReady() {
    console.log('ready!');
    faceapi.detect(gotResults);
}

function gotResults(err, result) {
    if (err) {
        console.log(err);
        return;
    }

    detections = result;
    background(255);
    image(video, 0, 0, width, height);

    if (detections && detections.length > 0) {
        drawLandmarks(detections);
    }
    requestAnimationFrame(function () {
        faceapi.detect(gotResults);
    });
}

function drawLandmarks(detections) {
    for (let i = 0; i < detections.length; i++) {
        const { mouth, nose, leftEye, rightEye } = detections[i].parts;

        if (itemName === 'star' || itemName === 'heart') {
            drawPart(leftEye, true);
            drawPart(rightEye, true);
        }
        else if (itemName === 'glasses') {
            drawPart(nose, true);
        }
    }
}

function drawPart(features, closed) {
    let totalX = 0;
    let totalY = 0;

    for (const feature of features) {
        totalX += feature._x;
        totalY += feature._y;
    }

    totalX /= features.length;
    totalY /= features.length;

    if (itemName === 'star') {
        image(star, totalX - 15, totalY - 15, 30, 30);
    }
    else if (itemName === 'heart') {
        image(heart, totalX - 15, totalY - 15 + 30, 30, 30);
    }
    else if (itemName === 'glasses') {
        image(glasses, totalX - 100 / 2, totalY - 100 * 3 / 5, 100, 100);
    }
}
