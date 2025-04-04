const Config = {
    // 필터 옵션 설정
    // 추가하고 싶은게 있으면
    /*
        필드명: '명칭'
    */
    FILTER_OPTIONS: {
        COWBOY: 'cowboy',
        EYE_HEART: 'eyeHeart',
        WHITE_CIRCLE: 'white_circle'
    },

    // 비율 옵션 설정
    ASPECT_RATIOS: {
        FULL: 'full',    // 전체 화면
        RATIO_4_3: '4:3', // 4:3 비율
        RATIO_16_9: '16:9', // 16:9 비율
        RATIO_9_16: '9:16' // 9:16 비율 (세로형)
    },

    // 얼굴 인식 설정
    DETECTION_OPTIONS: {
        withLandmarks: true,
        withDescriptors: false
    }
};