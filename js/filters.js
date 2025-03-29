class Filters {
    constructor(filterImages) {
        this.filterImages = filterImages;
        this.currentFilter = '';
    }

    /**
     * 필터 설정 함수
     * @param {string} filterId - 적용할 필터 ID
     */
    setFilter(filterId) {
        this.currentFilter = filterId;
        console.log(`필터가 ${this.currentFilter}로 설정되었습니다.`);
    }

    /**
     * 감지된 얼굴에 선택된 필터 적용
     * @param {Array} detections - 감지된 얼굴 배열
     */
    applyFiltersToDetectedFaces(detections) {
        for (const detection of detections) {
            // 안전 확인: 얼굴 부위가 탐지되었는지
            if (!Utils.hasValidFacialFeatures(detection)) {
                continue; // 특징점이 없으면 다음 얼굴로 건너뜀
            }

            // 얼굴 크기에 따라 필터 크기 조정 계수
            const faceWidth = detection.alignedRect._width;
            const scaleFactor = faceWidth / 180; // 기준 얼굴 너비를 180px로 가정

            // 거울 모드에서 좌표 보정을 위한 준비
            // 특징점 좌표 가공 수행
            const mirroredDetection = Utils.mirrorDetectionCoordinates(detection);

            switch(this.currentFilter) {
                case Config.FILTER_OPTIONS.COWBOY:      // 카우보이 필터
                    this.applyCowboyFilter(mirroredDetection, scaleFactor);
                    break;
                case Config.FILTER_OPTIONS.EYE_HEART:   // 눈 하트 필터
                    this.applyEyeHeartFilter(mirroredDetection, scaleFactor);
                    break;
            }
        }
    }

    /**
     * 안경 필터 적용 - 눈 위치에 안경 이미지 추가
     * @param {Object} detection - 얼굴 인식 결과
     * @param {number} scaleFactor - 얼굴 크기 비례 계수
     */
    applyGlassesFilter(detection, scaleFactor) {
        const { leftEye, rightEye } = detection.parts;
        
        if (leftEye && rightEye && leftEye.length > 0 && rightEye.length > 0) {
            const leftCenter = Utils.calculateCenterPoint(leftEye);
            const rightCenter = Utils.calculateCenterPoint(rightEye);
            const eyeDistance = dist(leftCenter.x, leftCenter.y, rightCenter.x, rightCenter.y);
            
            // 눈 사이 거리를 기준으로 안경 크기 및 위치 조정
            const glassesWidth = eyeDistance * 2.2;
            const glassesHeight = glassesWidth * 0.6;
            const eyesY = (leftCenter.y + rightCenter.y) / 2;
            const glassesX = (leftCenter.x + rightCenter.x) / 2 - glassesWidth / 2;
            const glassesY = eyesY - (glassesHeight * 0.2);
            
            image(this.filterImages.glasses, glassesX, glassesY, glassesWidth, glassesHeight);
        }
    }

    /**
     * 카우보이 필터 적용 - 선글라스와 모자 추가
     * @param {Object} detection - 얼굴 인식 결과
     * @param {number} scaleFactor - 얼굴 크기 비례 계수
     */
    applyCowboyFilter(detection, scaleFactor) {
        const { leftEye, rightEye, nose } = detection.parts;
        
        if (leftEye && rightEye && nose && leftEye.length > 0 && rightEye.length > 0) {
            const leftCenter = Utils.calculateCenterPoint(leftEye);
            const rightCenter = Utils.calculateCenterPoint(rightEye);
            
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
            image(this.filterImages.sunglasses, glassesX, glassesY, glassesWidth, glassesHeight);
            image(this.filterImages.cowboyHat, hatX, hatY, hatWidth, hatHeight);
        }
    }

    /**
     * 눈 하트 필터 적용 - 눈 위치에 하트 이미지 추가
     * @param {Object} detection - 얼굴 인식 결과
     * @param {number} scaleFactor - 얼굴 크기 비례 계수
     */
    applyEyeHeartFilter(detection, scaleFactor) {
        const { leftEye, rightEye } = detection.parts;
        
        if (leftEye && rightEye && leftEye.length > 0 && rightEye.length > 0) {
            const leftCenter = Utils.calculateCenterPoint(leftEye);
            const rightCenter = Utils.calculateCenterPoint(rightEye);
            
            // 눈 사이 거리 기준으로 크기 조정
            const eyeDistance = dist(leftCenter.x, leftCenter.y, rightCenter.x, rightCenter.y);
            
            // 개별 하트 크기 계산 (눈 크기에 맞춤)
            const heartSize = eyeDistance * 0.8;
            
            // 왼쪽 눈에 하트 적용
            image(
                this.filterImages.heartEye, 
                leftCenter.x - heartSize/2, 
                leftCenter.y - heartSize/2, 
                heartSize, 
                heartSize
            );
            
            // 오른쪽 눈에 하트 적용
            image(
                this.filterImages.heartEye, 
                rightCenter.x - heartSize/2, 
                rightCenter.y - heartSize/2, 
                heartSize, 
                heartSize
            );
        }
    }

    /**
     * 컴퓨터 필터 적용 - 코 위치에 컴퓨터 이미지 추가
     * @param {Object} detection - 얼굴 인식 결과
     * @param {number} scaleFactor - 얼굴 크기 비례 계수
     */
    applyComputerFilter(detection, scaleFactor) {
        const { nose } = detection.parts;
        
        if (nose && nose.length > 0) {
            const center = Utils.calculateCenterPoint(nose);
            const size = 100 * scaleFactor;
            image(this.filterImages.computer, center.x - size/2, center.y - size/2, size, size);
        }
    }
}
