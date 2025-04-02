"use strict";

document.addEventListener("DOMContentLoaded", () => {
    setupEventListeners();
});

// 이벤트 리스너 설정
function setupEventListeners() {
    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape") closeAllModals();
    });
}

// 📌 필터 옵션 열기/닫기
function openFilter() {
    toggleModal("filter-options", true);
}

function closeFilter() {
    toggleModal("filter-options", false);
}

// 📌 설정 모달 열기 (비율 설정 + 카메라 설정 함께)
function openSetting() {
    toggleModal("settingsModal", true);
}

// 📌 설정 모달 닫기
function closeSetting() {
    toggleModal("settingsModal", false);
}

// 📌 ESC 키로 모든 모달 닫기
function closeAllModals() {
    closeFilter();
    closeSetting();
}

// 📌 공통 모달 열고 닫는 함수
function toggleModal(id, isOpen) {
    const element = document.getElementById(id);
    if (!element) return;

    if (isOpen) {
        element.classList.add("fixed", "top-0", "left-0", "w-full", "h-full", "bg-white", "z-50", "p-4", "flex", "flex-col", "items-center", "justify-center");
        element.classList.remove("hidden");
        addCloseButton(element, () => toggleModal(id, false));
    } else {
        element.classList.remove("fixed", "top-0", "left-0", "w-full", "h-full", "bg-white", "z-50", "p-4", "flex", "flex-col", "items-center", "justify-center");
        element.classList.add("hidden");
        removeCloseButton(element);
    }
}

// 📌 닫기 버튼 추가
function addCloseButton(parent, closeFunction) {
    if (!parent.querySelector(".close-btn")) {
        const closeBtn = document.createElement("div");
        closeBtn.innerHTML = "&times;";
        closeBtn.className = "close-btn text-4xl fixed top-8 right-8 hover:cursor-pointer";
        closeBtn.onclick = closeFunction;
        parent.appendChild(closeBtn);
    }
}

// 📌 닫기 버튼 제거
function removeCloseButton(parent) {
    const closeBtn = parent.querySelector(".close-btn");
    if (closeBtn) closeBtn.remove();
}

// ======================================= 카메라 설정 기능 함수 로직 ============================================ //
// 활성화된 버튼 상태 관리
function selectFilter(filterId) {
    // 모든 필터 버튼에서 active 클래스 제거
    document.querySelectorAll('.filter-button').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // 선택된 필터 버튼에 active 클래스 추가
    if (filterId) {
        document.getElementById('filter-' + filterId)?.classList.add('active');
    } else {
        document.getElementById('filter-none')?.classList.add('active');
    }
    
    // 필터 설정 함수 호출
    window.func.setFilter(filterId);
}

function selectRatio(ratioId) {
    // 모든 비율 버튼에서 active 클래스 제거
    document.querySelectorAll('.ratio-button').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // 선택된 비율 버튼에 active 클래스 추가
    document.getElementById('ratio-' + ratioId)?.classList.add('active');
    
    // 비율 설정 함수 호출
    window.func.setAspectRatio(ratioId);
}

// 초기 상태 설정
document.addEventListener('DOMContentLoaded', function() {
    // 기본 필터 없음 활성화
    document.getElementById('filter-none')?.classList.add('active');
    // 기본 비율 full 활성화
    document.getElementById('ratio-full')?.classList.add('active');
});

const audioSelect = document.querySelector('select#audioSource');
const videoSelect = document.querySelector('select#videoSource');

// 디바이스 정보를 가져오는 함수
function getDevices() {
    return navigator.mediaDevices.enumerateDevices();
}

// 장치 목록을 받아서 select 옵션에 추가하는 함수
function gotDevices(deviceInfos) {
    console.log('Available input and output devices:', deviceInfos);
    for (const deviceInfo of deviceInfos) {
        const option = document.createElement('option');
        option.value = deviceInfo.deviceId;

        if (deviceInfo.kind === 'audioinput') {
            option.text = deviceInfo.label || `Microphone ${audioSelect.length + 1}`;
            audioSelect.appendChild(option);
        } else if (deviceInfo.kind === 'videoinput') {
            option.text = deviceInfo.label || `Camera ${videoSelect.length + 1}`;
            videoSelect.appendChild(option);
        }
    }
}

// 비디오 및 오디오 스트림을 가져오는 함수
function getStream() {
    const audioSource = audioSelect.value;
    const videoSource = videoSelect.value;

    const constraints = {
        audio: { deviceId: audioSource ? { exact: audioSource } : undefined },
        video: { deviceId: videoSource ? { exact: videoSource } : undefined }
    };

    return navigator.mediaDevices.getUserMedia(constraints)
        .then(gotStream)
        .catch(handleError);
}

// 스트림을 처리하는 함수
function gotStream(stream) {
    const videoElement = document.querySelector('video');
    if (videoElement) {
        videoElement.srcObject = stream;
    }
}

// 오류 처리 함수
function handleError(error) {
    console.error('Error: ', error);
}

// 장치 목록을 가져와서 출력
getDevices().then(gotDevices);

// 스트림을 가져오는 기능
audioSelect.onchange = getStream;
videoSelect.onchange = getStream;