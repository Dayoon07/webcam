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
                case Config.FILTER_OPTIONS.WHITE_CIRCLE:
                    this.applyWhite_circleFilter(mirroredDetection, scaleFactor);
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

    /**
     * 사용자 정의 필터 추가 함수
     * @param {string} filterId - 새 필터 ID
     * @param {Object} filterImage - 추가할 필터 이미지
     * @param {string} position - 필터 위치 ('eyes', 'nose', 'mouth', 'forehead', 'whole')
     * @param {Object} options - 필터 위치 조정 옵션 (선택적)
     * @returns {boolean} - 성공 여부
     */
    addCustomFilter(filterId, filterImage, position, options = {}) {
        // 기본 옵션 설정
        const defaultOptions = {
            widthRatio: 1.0,    // 기준 크기 대비 너비 비율
            heightRatio: 1.0,   // 기준 크기 대비 높이 비율
            offsetX: 0,         // 수평 오프셋 (픽셀)
            offsetY: 0,         // 수직 오프셋 (픽셀)
            rotation: 0,        // 회전 각도 (도)
            zIndex: 1           // 필터 레이어 순서
        };
        
        // 사용자 옵션과 기본 옵션 병합
        const filterOptions = { ...defaultOptions, ...options };
        
        // 필터 이미지 유효성 검사
        if (!filterImage) {
            console.error('필터 이미지가 제공되지 않았습니다.');
            return false;
        }
        
        // 필터 ID 유효성 검사
        if (!filterId || typeof filterId !== 'string') {
            console.error('유효한 필터 ID가 필요합니다.');
            return false;
        }
        
        // 위치 유효성 검사
        const validPositions = ['eyes', 'nose', 'mouth', 'forehead', 'whole'];
        if (!validPositions.includes(position)) {
            console.error(`유효하지 않은 위치입니다. 다음 중 하나여야 합니다: ${validPositions.join(', ')}`);
            return false;
        }
        
        // 필터 이미지 등록
        this.filterImages[filterId] = filterImage;
        
        // Config.FILTER_OPTIONS에 필터 ID 추가 (Config 객체가 있다고 가정)
        if (Config && Config.FILTER_OPTIONS) {
            Config.FILTER_OPTIONS[filterId.toUpperCase()] = filterId;
        }
        
        // 필터 적용 함수 정의 및 등록
        this[`apply${filterId.charAt(0).toUpperCase() + filterId.slice(1)}Filter`] = function(detection, scaleFactor) {
            switch(position) {
                case 'eyes':
                    this.applyEyesPositionFilter(detection, scaleFactor, filterId, filterOptions);
                    break;
                case 'nose':
                    this.applyNosePositionFilter(detection, scaleFactor, filterId, filterOptions);
                    break;
                case 'mouth':
                    this.applyMouthPositionFilter(detection, scaleFactor, filterId, filterOptions);
                    break;
                case 'forehead':
                    this.applyForeheadPositionFilter(detection, scaleFactor, filterId, filterOptions);
                    break;
                case 'whole':
                    this.applyWholePositionFilter(detection, scaleFactor, filterId, filterOptions);
                    break;
            }
        };
        
        console.log(`새 필터가 추가되었습니다: ${filterId} (위치: ${position})`);
        return true;
    }

    /**
     * 눈 위치에 필터 적용 (재사용 가능한 함수)
     */
    applyEyesPositionFilter(detection, scaleFactor, filterId, options) {
        const { leftEye, rightEye } = detection.parts;
        
        if (leftEye && rightEye && leftEye.length > 0 && rightEye.length > 0) {
            const leftCenter = Utils.calculateCenterPoint(leftEye);
            const rightCenter = Utils.calculateCenterPoint(rightEye);
            const eyeDistance = dist(leftCenter.x, leftCenter.y, rightCenter.x, rightCenter.y);
            
            // 눈 사이 거리를 기준으로 필터 크기 및 위치 조정
            const filterWidth = eyeDistance * 2.2 * options.widthRatio;
            const filterHeight = filterWidth * 0.6 * options.heightRatio;
            const eyesY = (leftCenter.y + rightCenter.y) / 2;
            const filterX = (leftCenter.x + rightCenter.x) / 2 - filterWidth / 2 + options.offsetX;
            const filterY = eyesY - (filterHeight * 0.2) + options.offsetY;
            
            push(); // 현재 드로잉 상태 저장
            translate(filterX + filterWidth/2, filterY + filterHeight/2);
            rotate(options.rotation * PI / 180);
            image(this.filterImages[filterId], -filterWidth/2, -filterHeight/2, filterWidth, filterHeight);
            pop(); // 이전 드로잉 상태 복원
        }
    }

    /**
     * 코 위치에 필터 적용 (재사용 가능한 함수)
     */
    applyNosePositionFilter(detection, scaleFactor, filterId, options) {
        const { nose } = detection.parts;
        
        if (nose && nose.length > 0) {
            const center = Utils.calculateCenterPoint(nose);
            const faceWidth = detection.alignedRect._width;
            const filterSize = faceWidth * 0.3 * options.widthRatio; // 코 크기에 맞게 조정
            const filterX = center.x - filterSize/2 + options.offsetX;
            const filterY = center.y - filterSize/2 + options.offsetY;
            
            push();
            translate(filterX + filterSize/2, filterY + filterSize/2);
            rotate(options.rotation * PI / 180);
            image(this.filterImages[filterId], -filterSize/2, -filterSize/2, 
                filterSize, filterSize * options.heightRatio);
            pop();
        }
    }

    /**
     * 입 위치에 필터 적용 (재사용 가능한 함수)
     */
    applyMouthPositionFilter(detection, scaleFactor, filterId, options) {
        const { mouth } = detection.parts;
        
        if (mouth && mouth.length > 0) {
            const mouthPoints = mouth.map(pt => ({ x: pt._x, y: pt._y }));
            const leftPoint = mouthPoints.reduce((min, pt) => pt.x < min.x ? pt : min, mouthPoints[0]);
            const rightPoint = mouthPoints.reduce((max, pt) => pt.x > max.x ? pt : max, mouthPoints[0]);
            const topPoint = mouthPoints.reduce((min, pt) => pt.y < min.y ? pt : min, mouthPoints[0]);
            const bottomPoint = mouthPoints.reduce((max, pt) => pt.y > max.y ? pt : max, mouthPoints[0]);
            
            const mouthWidth = dist(leftPoint.x, leftPoint.y, rightPoint.x, rightPoint.y);
            const mouthHeight = dist(topPoint.x, topPoint.y, bottomPoint.x, bottomPoint.y);
            const center = Utils.calculateCenterPoint(mouth);
            
            // 입 크기에 맞게 필터 크기 조정
            const filterWidth = mouthWidth * 1.5 * options.widthRatio;
            const filterHeight = mouthHeight * 2 * options.heightRatio;
            const filterX = center.x - filterWidth/2 + options.offsetX;
            const filterY = center.y - filterHeight/2 + options.offsetY;
            
            push();
            translate(filterX + filterWidth/2, filterY + filterHeight/2);
            rotate(options.rotation * PI / 180);
            image(this.filterImages[filterId], -filterWidth/2, -filterHeight/2, filterWidth, filterHeight);
            pop();
        }
    }

    /**
     * 이마 위치에 필터 적용 (재사용 가능한 함수)
     */
    applyForeheadPositionFilter(detection, scaleFactor, filterId, options) {
        const { leftEye, rightEye } = detection.parts;
        
        if (leftEye && rightEye && leftEye.length > 0 && rightEye.length > 0) {
            const leftCenter = Utils.calculateCenterPoint(leftEye);
            const rightCenter = Utils.calculateCenterPoint(rightEye);
            const eyeDistance = dist(leftCenter.x, leftCenter.y, rightCenter.x, rightCenter.y);
            const eyesY = (leftCenter.y + rightCenter.y) / 2;
            
            // 이마 위치 계산 - 눈 위쪽
            const foreheadY = eyesY - eyeDistance * 1.2;
            const filterWidth = eyeDistance * 2 * options.widthRatio;
            const filterHeight = eyeDistance * options.heightRatio;
            const filterX = (leftCenter.x + rightCenter.x) / 2 - filterWidth / 2 + options.offsetX;
            const filterY = foreheadY - filterHeight/2 + options.offsetY;
            
            push();
            translate(filterX + filterWidth/2, filterY + filterHeight/2);
            rotate(options.rotation * PI / 180);
            image(this.filterImages[filterId], -filterWidth/2, -filterHeight/2, filterWidth, filterHeight);
            pop();
        }
    }

    /**
     * 얼굴 전체에 필터 적용 (재사용 가능한 함수)
     */
    applyWholePositionFilter(detection, scaleFactor, filterId, options) {
        // 얼굴 경계 상자 정보 가져오기
        const box = detection.alignedRect._box;
        const faceWidth = box._width;
        const faceHeight = box._height;
        
        // 얼굴 크기에 맞게 필터 크기 조정
        const filterWidth = faceWidth * options.widthRatio;
        const filterHeight = faceHeight * options.heightRatio;
        const filterX = box._x + (faceWidth - filterWidth) / 2 + options.offsetX;
        const filterY = box._y + (faceHeight - filterHeight) / 2 + options.offsetY;
        
        push();
        translate(filterX + filterWidth/2, filterY + filterHeight/2);
        rotate(options.rotation * PI / 180);
        image(this.filterImages[filterId], -filterWidth/2, -filterHeight/2, filterWidth, filterHeight);
        pop();
    }

    /**
     * applyFiltersToDetectedFaces 메서드를 확장하여 사용자 정의 필터 처리
     */
    applyFiltersToDetectedFaces(detections) {
        for (const detection of detections) {
            if (!Utils.hasValidFacialFeatures(detection)) continue;
    
            const faceWidth = detection.alignedRect._width;
            const scaleFactor = faceWidth / 180;
            const mirroredDetection = Utils.mirrorDetectionCoordinates(detection);
    
            const methodName = `apply${this.currentFilter.charAt(0).toUpperCase()}${this.currentFilter.slice(1)}Filter`;
            if (typeof this[methodName] === 'function') {
                this[methodName](mirroredDetection, scaleFactor);
            } else {
                console.warn(`해당 필터에 대한 적용 함수가 없습니다: ${methodName}`);
            }
        }
    }

    /**
     * 흰색 원 필터 적용 (얼굴 가림)
     * @param {Object} detection - 얼굴 인식 결과
     * @param {number} scaleFactor - 얼굴 크기 비례 계수
     */
    applyWhite_circleFilter(detection, scaleFactor) {
        console.log("applyWhiteCircleFilter 실행됨");
        // 얼굴 경계 상자 확인
        if (!detection.alignedRect || !detection.alignedRect._box) {
            console.error("얼굴 경계 상자 정보가 없습니다");
            return;
        }
        
        // 얼굴 경계 상자 정보 가져오기
        const box = detection.alignedRect._box;
        const faceWidth = box._width;
        const faceHeight = box._height;
        
        // 필터 크기 조정 (더 크게 만들어서 얼굴 전체 가리기)
        const filterSize = Math.max(faceWidth, faceHeight) * 1.5;
        
        // 캔버스의 기준 좌표계에 맞춰 얼굴 중심 위치 계산
        const faceCenterX = box._x + faceWidth/2;
        const faceCenterY = box._y + faceHeight/2;
        
        // 비디오 입력과 출력 캔버스 간의 좌우 반전 해결
        // 화면 너비를 기준으로 좌표를 반전시킵니다
        const adjustedCenterX = width - faceCenterX;
        
        // 필터 위치 계산
        const filterX = adjustedCenterX - filterSize/2;
        const filterY = faceCenterY - filterSize/2;
    
        // 이미지가 있는지 확인
        if (!this.filterImages.white_circle) {
            console.error("white_circle 이미지가 로드되지 않았습니다");
            
            // 이미지 대체 흰색 원
            push();
            fill(255);
            noStroke();
            ellipse(adjustedCenterX, faceCenterY, filterSize, filterSize);
            pop();
        } else {
            push();
            // 이미지 적용
            image(this.filterImages.white_circle, filterX, filterY, filterSize, filterSize);
            pop();
        }
        
        console.log("흰색 원 필터 적용됨", filterX, filterY, filterSize);
    }
}
