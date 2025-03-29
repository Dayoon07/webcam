class Utils {
    /**
     * 특징점 배열에서 중심점 계산
     * @param {Array} points - 특징점 배열
     * @returns {Object} 중심 좌표 {x, y}
     */
    static calculateCenterPoint(points) {
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
     * 얼굴에 유효한 특징점이 있는지 확인
     * @param {Object} detection - 얼굴 인식 결과
     * @returns {boolean} 유효한 특징점 존재 여부
     */
    static hasValidFacialFeatures(detection) {
        return detection.parts && 
               detection.parts.leftEye && 
               detection.parts.rightEye && 
               detection.parts.nose;
    }

    /**
     * 거울 모드용 좌표 보정 (좌표를 좌우 반전)
     * @param {Object} detection - 얼굴 인식 결과
     * @returns {Object} 좌우 반전된 좌표를 가진 탐지 결과
     */
    static mirrorDetectionCoordinates(detection) {
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
}