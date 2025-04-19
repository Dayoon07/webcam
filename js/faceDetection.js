class FaceDetection {
    constructor(video, filters) {
        this.video = video;
        this.filters = filters;
        this.faceapi = null;
        this.detections = null;
    }

    /**
     * 얼굴 인식 모델 초기화
     */
    initFaceDetection() {
        this.faceapi = ml5.faceApi(this.video, Config.DETECTION_OPTIONS, () => this.modelReady());
    }

    /**
     * 얼굴 인식 모델이 준비되면 호출되는 콜백
     */
    modelReady() {
        console.log('Face API 준비 완료!');
        this.faceapi.detect((err, result) => this.handleFaceDetectionResults(err, result));
        document.getElementById("setting-btn").style.display = "block";
        document.getElementById("filter-btn").style.display = "block";
    }

    /**
     * 얼굴 인식 결과 처리 및 프레임 그리기
     * @param {Error} err - 인식 실패시 오류 객체
     * @param {Array} result - 랜드마크가 포함된 탐지된 얼굴 배열
     */
    handleFaceDetectionResults(err, result) {
        if (err) {
            console.error('얼굴 인식 오류:', err);
            return;
        }

        this.detections = result;
        background(255);
        
        // 비디오를 좌우 반전으로 그리기 (거울 모드)
        this.renderMirroredVideoFrame();

        if (this.detections && this.detections.length > 0) {
            // 거울 모드에서 필터 적용 (좌표 보정 필요)
            this.filters.applyFiltersToDetectedFaces(this.detections);
        }

        requestAnimationFrame(() => this.faceapi.detect((err, result) => this.handleFaceDetectionResults(err, result)));
    }

    /**
     * 비디오 프레임을 거울 모드로 렌더링 (좌우 반전)
     */
    renderMirroredVideoFrame() {
        push();
        translate(width, 0);
        scale(-1, 1);
        image(this.video, 0, 0, width, height);
        pop();
    }
}