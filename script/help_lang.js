function hheellpp() {
    const div = document.createElement("div");

    div.innerHTML = `
        <div class="absolute top-5 right-6">
            <button id="close-help" class="text-white bg-red-500 hover:bg-red-600 px-6 py-2 rounded-full shadow-lg">
                닫기
            </button>
        </div>
        <div class="pt-20 text-lg px-6">
            <h2 class="text-3xl font-bold mb-4">도움말</h2>
            <ul class="list-decimal pl-6 space-y-2">
                <li><b>캠이 켜지지 않을 때</b>: 웹 사이트의 카메라 접근 허용을 눌러주세요.</li>
                <li><b>사진 기능 관련 사항</b>: 사진은 웹에 업로드되지 않으며 로컬에서만 사용됩니다.</li>
                <li><b>기능</b>
                    <ul class="list-decimal pl-6 space-y-1">
                        <li>설정에서는 비율 설정과 카메라 설정을 할 수 있습니다. <br class="hidden lg:inline-block">비율이 맞지 않을 경우, 사진 찍기 버튼 왼쪽의 설정 버튼을 눌러 비율을 맞춰주세요.</li>
                        <li>필터 설정은 촬영 시 사용하는 필터를 선택할 수 있으며, 촬영과 사진을 찍는 용도로만 사용됩니다.</li>
                    </ul>
                </li>
            </ul>
        </div>
    `;

    const styleClasses = ["fixed", "top-0", "left-0", "w-full", "h-full", "bg-white", "z-50", "overflow-auto"];
    div.classList.add(...styleClasses);

    document.body.appendChild(div);

    document.getElementById("close-help").onclick = () => {
        div.remove();
    };
}
