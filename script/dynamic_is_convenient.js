window.addEventListener("load", function () {
    "use strict";
    aaaaaaaaaaaaaa();
});

function aaaaaaaaaaaaaa() {
    const aaaaa_list = [
        {
            id: "filter-instagram_popular_filter", 
            selectName: "instagram_popular_filter", 
            text: "인스타그램 피부 반짝이 이미지",
            src: "https://dayoon07.github.io/webcam/img/instagram_popular_filter.png"
        },
        {
            id: "filter-polaroid_pic", 
            selectName: "polaroid_pic", 
            text: "폴라로이드 느낌 사진",
            src: "https://dayoon07.github.io/webcam/img/polaroid_pic.png"
        },
        {
            id: "filter-christmas_bg", 
            selectName: "christmas_bg", 
            text: "크리스마스 배경",
            src: "https://dayoon07.github.io/webcam/img/christmas_bg.png"
        },
        {
            id: "filter-graduation_cap", 
            selectName: "graduation_cap", 
            text: "학사모",
            src: "https://dayoon07.github.io/webcam/img/graduation_cap.png"
        },
        {
            id: "filter-dog_face", 
            selectName: "dog_face", 
            text: "강아지",
            src: "https://dayoon07.github.io/webcam/img/dog_face.png"
        },
        {
            id: "filter-cat_face", 
            selectName: "cat_face", 
            text: "고양이",
            src: "https://dayoon07.github.io/webcam/img/cat_face.png"
        },
        {
            id: "filter-bear_face", 
            selectName: "bear_face", 
            text: "곰",
            src: "https://dayoon07.github.io/webcam/img/bear_face.png"
        },
        {
            id: "filter-white_circle", 
            selectName: "white_circle", 
            text: "얼굴 가림",
            src: "https://dayoon07.github.io/webcam/img/white_circle.png"
        },
        {
            id: "filter-cowboy", 
            selectName: "cowboy", 
            text: "카우보이",
            src: "https://dayoon07.github.io/webcam/img/cowboy_hat.png"
        },
        {
            id: "filter-eye_heart", 
            selectName: "eye_heart", 
            text: "눈 하트",
            src: "https://dayoon07.github.io/webcam/img/heart.png"
        },
        {
            id: "filter-none", 
            selectName: "", 
            text: "없음",
            src: null
        }
    ];

    const filterOptions = document.querySelector("#filter-options > div");

    if (!filterOptions) {
        console.error("필터 옵션을 찾을 수 없습니다.");
        return;
    }

    aaaaa_list.forEach((item) => {
        const button = document.createElement("button");
        button.id = item.id;
        button.className = "filter-button px-4 py-2 bg-gray-100 transition-all rounded-lg";
        button.innerHTML = 
        item.src != null ? `<img src="${item.src}" alt="${item.text}" 
                                title="${item.text}" width="35" height="35" />
                            ` : `${item.text}`;
        button.onclick = function () {
            selectFilter(item.selectName);
            closeFilter();
        };
        filterOptions.appendChild(button);
    });
}