window.addEventListener("load", function () {
    "use strict";
    aaaaaaaaaaaaaa(); // 함수 호출!
});

function aaaaaaaaaaaaaa() {
    const aaaaa_list = [
        {
            id: "filter-graduation_cap", 
            selectName: "graduation_cap", 
            text: "학사모"
        },
        {
            id: "filter-dog_face", 
            selectName: "dog_face", 
            text: "강아지"
        },
        {
            id: "filter-cat_face", 
            selectName: "cat_face", 
            text: "고양이"
        },
        {
            id: "filter-bear_face", 
            selectName: "bear_face", 
            text: "곰"
        },
        {
            id: "filter-white_circle", 
            selectName: "white_circle", 
            text: "얼굴 가림"
        },
        {
            id: "filter-cowboy", 
            selectName: "cowboy", 
            text: "카우보이"
        },
        {
            id: "filter-eye_heart", 
            selectName: "eye_heart", 
            text: "눈 하트"
        },
        {
            id: "filter-none", 
            selectName: "", 
            text: "없음"
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
        button.innerText = item.text;
        button.onclick = function () {
            selectFilter(item.selectName);
            closeFilter();
        };
        filterOptions.appendChild(button);
    });
}