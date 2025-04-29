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
     * applyFiltersToDetectedFaces 메서드를 확장하여 사용자 정의 필터 처리
     */
    applyFiltersToDetectedFaces(detections) {
        if (!detections || !Array.isArray(detections)) {
            console.warn("유효한 얼굴 인식 데이터가 없습니다");
            return;
        }

        const toPascalCase = (str) => {
            if (!str) return '';
            return str
                .replace(/[_-](\w)/g, (_, c) => c.toUpperCase()) // snake_case → camelCase
                .replace(/^\w/, c => c.toUpperCase()); // 첫 글자 대문자
        };

        for (const detection of detections) {
            // 유효한 얼굴 특징점이 없으면 건너뛰기
            if (!Utils.hasValidFacialFeatures(detection)) continue;

            try {
                const faceWidth = detection.alignedRect?._width || 180; // 기본값으로 180 사용
                const scaleFactor = faceWidth / 180;
                const mirroredDetection = Utils.mirrorDetectionCoordinates(detection);

                // 현재 선택된 필터가 없으면 종료
                if (!this.currentFilter) continue;

                const methodName = `apply${toPascalCase(this.currentFilter)}Filter`;

                if (typeof this[methodName] === 'function') {
                    this[methodName](mirroredDetection, scaleFactor);
                } else {
                    console.warn(`해당 필터에 대한 적용 함수가 없습니다: ${methodName}`);
                }
            } catch (err) {
                console.error("필터 적용 중 오류 발생:", err);
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
            image(this.filterImages.cowboy_hat, hatX, hatY, hatWidth, hatHeight);
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
                this.filterImages.eye_heart, 
                leftCenter.x - heartSize/2, 
                leftCenter.y - heartSize/2, 
                heartSize, 
                heartSize
            );
            
            // 오른쪽 눈에 하트 적용
            image(
                this.filterImages.eye_heart, 
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
     * applyFiltersToDetectedFaces 메서드를 확장하여 사용자 정의 필터 처리
     */
    applyFiltersToDetectedFaces(detections) {
        if (!detections || !Array.isArray(detections)) {
            console.warn("유효한 얼굴 인식 데이터가 없습니다");
            return;
        }

        const filterMethodMap = {
            cowboy: 'applyCowboyFilter',
            eye_heart: 'applyEyeHeartFilter',
            white_circle: 'applyWhiteCircleFilter',
            cat_face: 'applyCatFaceFilter',
            dog_face: 'applyDogFaceFilter',
            bear_face: 'applyBearFaceFilter',
            rainbow_bg: 'applyRainbowBgFilter',
            graduation_cap: 'applyGraduationCapFilter',
            kmhs_logo: 'applyKmhsLogoFilter',
            christmas_bg: 'applyChristmasBgFilter',
            white_vector: 'applyWhiteVectorFilter',
            polaroid_pic: 'applyPolaroidPicFilter'
        };
    
        for (const detection of detections) {
            if (!Utils.hasValidFacialFeatures(detection)) continue;

            try {
                const faceWidth = detection.alignedRect?._width || 180;
                const scaleFactor = faceWidth / 180;
                const mirroredDetection = Utils.mirrorDetectionCoordinates(detection);

                if (!this.currentFilter) continue;

                const methodName = filterMethodMap[this.currentFilter];

                if (typeof this[methodName] === 'function') {
                    this[methodName](mirroredDetection, scaleFactor);
                } else {
                    console.warn(`해당 필터에 대한 적용 함수가 없습니다: ${methodName}`);
                }
            } catch (err) {
                console.error("필터 적용 중 오류 발생:", err);
            }
        }
    }

    /**
     * 흰색 원 필터 적용 (얼굴 가림)
     * @param {Object} detection - 얼굴 인식 결과
     * @param {number} scaleFactor - 얼굴 크기 비례 계수
     */
    applyWhiteCircleFilter(detection, scaleFactor) {
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
        const filterSize = Math.max(faceWidth, faceHeight) * 1.25;
        
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
            ellipse(adjustedCenterX, faceCenterY, filterSize, filterSize);
            pop();
        } else {
            push();
            // 이미지 적용
            image(this.filterImages.white_circle, filterX, filterY, filterSize, filterSize);
            pop();
        }
    }

    /**
     * 고양이 얼굴 필터 적용 (안정성 개선)
     */
    applyCatFaceFilter(detection, scaleFactor) {
        const canvasWidth = typeof width !== 'undefined' ? width : 640;
        const canvasHeight = typeof height !== 'undefined' ? height : 480;

        const catImage = this.filterImages.cat_face;
        if (!catImage) {
            console.error("cat_face 이미지가 로드되지 않았습니다");
            return;
        }

        try {
            const { leftEye, rightEye } = detection.parts;
            if (!leftEye?.length || !rightEye?.length) {
                console.warn("고양이 필터 적용 실패: 눈 정보 부족");
                return;
            }

            const box = detection.alignedRect?._box;
            if (!box) {
                console.warn("고양이 필터 적용 실패: 얼굴 경계 상자 없음");
                return;
            }

            const faceWidth = box._width;
            const faceHeight = box._height;

            // 필터의 너비는 얼굴 너비보다 약간 넓게
            const filterWidth = faceWidth * 1.1;

            // 원본 이미지 비율 고려해서 높이 자동 계산
            const filterHeight = filterWidth * 1.1;

            // 얼굴 중심 계산
            const faceCenterX = box._x + faceWidth / 2;
            const faceCenterY = box._y + faceHeight / 2;

            // 캔버스가 좌우 반전된 경우 고려
            const adjustedCenterX = canvasWidth - faceCenterX;

            // 필터 위치 계산 (조금 위로 이동해서 고양이 귀가 머리 위에 올라오도록)
            const filterX = adjustedCenterX - filterWidth / 2;
            const filterY = faceCenterY - filterHeight * 0.8; // 이 부분은 살짝 조정해보면서 튜닝 가능

            if (filterX + filterWidth < 0 || filterX > canvasWidth ||
                filterY + filterHeight < 0 || filterY > canvasHeight) {
                console.warn("고양이 필터가 화면 밖에 있음");
                return;
            }

            push();
            image(catImage, filterX, filterY, filterWidth, filterHeight);
            pop();
        } catch (err) {
            console.error("고양이 필터 적용 중 오류:", err);
        }
    }

    /**
     * 강아지 얼굴 필터 적용
     */
    applyDogFaceFilter(detection, scaleFactor) {
        const dogImage = this.filterImages.dog_face;
        if (!dogImage) {
            console.error("dog_face 이미지가 로드되지 않았습니다");
            return;
        }

        const { leftEye, rightEye, nose } = detection.parts;
        if (!leftEye?.length || !rightEye?.length || !nose?.length) {
            console.warn("강아지 필터 적용 실패: 얼굴 특징점 부족");
            return;
        }

        const leftCenter = Utils.calculateCenterPoint(leftEye);
        const rightCenter = Utils.calculateCenterPoint(rightEye);
        const noseCenter = Utils.calculateCenterPoint(nose);

        const eyeDistance = dist(leftCenter.x, leftCenter.y, rightCenter.x, rightCenter.y);
        const dogFaceWidth = eyeDistance * 3.1;
        const dogFaceHeight = dogFaceWidth;
        const dogFaceX = (leftCenter.x + rightCenter.x) / 2 - dogFaceWidth / 2;
        const dogFaceY = noseCenter.y - dogFaceHeight * 0.8;

        push();
        image(dogImage, dogFaceX, dogFaceY, dogFaceWidth, dogFaceHeight);
        pop();
    }

    /**
     * 곰 얼굴 필터 적용
     * @param {Object} detection - 얼굴 인식 결과
     * @param {number} scaleFactor - 얼굴 크기 비례 계수
     */
    applyBearFaceFilter(detection, scaleFactor) {
        const { leftEye, rightEye, nose } = detection.parts;
        
        if (leftEye && rightEye && nose && leftEye.length > 0 && rightEye.length > 0) {
            const leftCenter = Utils.calculateCenterPoint(leftEye);
            const rightCenter = Utils.calculateCenterPoint(rightEye);
            const noseCenter = Utils.calculateCenterPoint(nose);
            
            // 눈 사이 거리 계산
            const eyeDistance = dist(leftCenter.x, leftCenter.y, rightCenter.x, rightCenter.y);
            
            // 곰 얼굴 요소 크기 계산
            const bearFaceWidth = eyeDistance * 3.25;
            const bearFaceHeight = bearFaceWidth * 1.1;
            
            // 곰 얼굴 위치 (코 주변에 배치)
            const bearFaceX = (leftCenter.x + rightCenter.x) / 2 - bearFaceWidth / 2;
            const bearFaceY = noseCenter.y - bearFaceHeight * 0.8; // 코 위치 조정
            
            // 곰 얼굴 이미지 적용
            image(this.filterImages.bear_face, bearFaceX, bearFaceY, bearFaceWidth, bearFaceHeight);
        }
    }

    /**
     * 강아지 얼굴 필터 적용
     */
    applyGraduationCapFilter(detection, scaleFactor) {
        const graduationCapImage = this.filterImages.graduation_cap;
        if (!graduationCapImage) {
            console.error("dog_face 이미지가 로드되지 않았습니다");
            return;
        }

        const { leftEye, rightEye, nose } = detection.parts;
        if (!leftEye?.length || !rightEye?.length || !nose?.length) {
            console.warn("강아지 필터 적용 실패: 얼굴 특징점 부족");
            return;
        }

        const leftCenter = Utils.calculateCenterPoint(leftEye);
        const rightCenter = Utils.calculateCenterPoint(rightEye);
        const noseCenter = Utils.calculateCenterPoint(nose);
        const eyeDistance = dist(leftCenter.x, leftCenter.y, rightCenter.x, rightCenter.y);

        const graduationCapWidth = eyeDistance * 6;
        const graduationCapHeight = graduationCapWidth * 1.15;
        const graduationCapX = (leftCenter.x + rightCenter.x) / 2 - graduationCapWidth / 2;
        const graduationCapY = noseCenter.y - graduationCapHeight * 0.8;

        push();
        image(graduationCapImage, graduationCapX, graduationCapY, graduationCapWidth, graduationCapHeight);
        pop();
    }

    applyKmhsLogoFilter(detection, scaleFactor) {
        const graduationCapImage = this.filterImages.kmhs_logo;
        if (!graduationCapImage) {
            console.error("kmhs_logo 이미지가 로드되지 않았습니다");
            return;
        }
        
        // p5.js의 width와 height 전역 변수 사용 (캔버스 크기)
        const canvasWidth = width;
        const canvasHeight = height;
        
        // 로고 크기 설정
        const graduationCapWidth = canvasWidth * 0.2;
        const graduationCapHeight = graduationCapWidth;
        
        // 왼쪽 아래 위치로 수정
        const graduationCapX = 20; // 왼쪽에서 20px 여백
        const graduationCapY = canvasHeight - graduationCapHeight - 20; // 아래에서 20px 여백
        
        push();
        image(graduationCapImage, graduationCapX, graduationCapY, graduationCapWidth, graduationCapHeight);
        pop();
    }

    /**
     * 크리스마스 배경 필터 적용 - 전체 화면에 크리스마스 배경 적용
     * @param {Object} detection - 얼굴 인식 결과
     * @param {number} scaleFactor - 얼굴 크기 비례 계수
     */
    applyChristmasBgFilter(detection, scaleFactor) {
        const christmasBgImage = this.filterImages.christmas_bg;
        if (!christmasBgImage) {
            console.error("christmas_bg 이미지가 로드되지 않았습니다");
            return;
        }
        
        // p5.js의 width와 height 전역 변수 사용 (캔버스 크기)
        const canvasWidth = width;
        const canvasHeight = height;
        
        // 이미지를 전체 화면에 적용
        push();
        // 먼저 배경 이미지를 그려서 다른 모든 요소 뒤에 표시되도록 함
        image(christmasBgImage, 0, 0, canvasWidth, canvasHeight);
        pop();
    }

    applyWhiteVectorFilter(detection, scaleFactor) {
        const maskImage = this.filterImages.white_vector;
        if (!maskImage) {
            console.error("squid_game_mask 이미지가 로드되지 않았습니다");
            return;
        }

        try {
            // 얼굴 경계 상자 확인
            if (!detection.alignedRect || !detection.alignedRect._box) {
                console.warn("오징어 게임 마스크 필터 적용 실패: 얼굴 경계 상자 없음");
                return;
            }
            
            // 캔버스 크기
            const canvasWidth = typeof width !== 'undefined' ? width : 640;
            
            // 얼굴 경계 상자 정보
            const box = detection.alignedRect._box;
            const faceWidth = box._width;
            const faceHeight = box._height;
            
            // 마스크 크기 조정 (얼굴보다 약간 더 크게)
            const maskWidth = faceWidth * 1.5;
            const maskHeight = maskWidth * 1.2; // 마스크 이미지 비율에 맞게 조정
            
            // 얼굴 중심 계산
            const faceCenterX = box._x + faceWidth / 2;
            const faceCenterY = box._y + faceHeight / 2;
            
            // 캔버스의 좌우 반전 고려
            const adjustedCenterX = canvasWidth - faceCenterX;
            
            // 마스크 위치 계산 (얼굴 중앙에 배치)
            const maskX = adjustedCenterX - maskWidth / 2;
            const maskY = faceCenterY - maskHeight / 2;
            
            // 마스크 이미지 적용
            push();
            image(maskImage, maskX, maskY, maskWidth, maskHeight);
            pop();
        } catch (err) {
            console.error("오징어 게임 마스크 필터 적용 중 오류:", err);
        }
    }

    applyPolaroidPicFilter(detection, scaleFactor) {
        const christmasBgImage = this.filterImages.polaroid_pic;
        if (!christmasBgImage) {
            console.error("polaroid_pic 이미지가 로드되지 않았습니다");
            return;
        }
        
        // p5.js의 width와 height 전역 변수 사용 (캔버스 크기)
        const canvasWidth = width;
        const canvasHeight = height;
        
        // 이미지를 전체 화면에 적용
        push();
        // 먼저 배경 이미지를 그려서 다른 모든 요소 뒤에 표시되도록 함
        image(christmasBgImage, 0, 0, canvasWidth, canvasHeight);
        pop();
    }
}
