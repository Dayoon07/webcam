# webcam

![](https://dayoon07.github.io/webcam/offcial/test_img.png)

p5.js, ml5.js를 사용해 만든 캠 필터 웹 사이트입니다.

<br />

## 라이브러리 목록
- **p5.js** : 내장된 함수들을 갖다가 특정 위치에 그릴 수 있는 라이브러리, 원래는 디자이너들이 웹 페이지 동적으로 처리할 때 쓰는 것 같음 
- **ml5.js** : openCV 처럼 특정 신체를 감지할 수 있는데 js로 리팩토링한 라이브러리 

<br />

## 기능
- **실시간 웹 캠 스트리밍** <br />
    동작하는 거를 조금 말하자면 특정 태그에 p5.js의 createCanvas 함수를 써서 video태그를 만들고 계속 촬영하는 원리

- **필터 구분** (시간 되면 나중에 재밌는 사진 몇 개 더 찾아서 추가할 예정) <br />
    1.학사모 <br />
    2.동물 (강아지, 고양이, 곰 등) <br />
    3.카우보이 <br />

## 레포 복사
1. 레포지토리 클론하기
    ```bash
    git clone https://github.com/Dayoon07/webcam.git
    ```

2. Visual Studio Code에서 클론한 레포 열고 index.html 열기
3. 가끔 안되는 경우도 있는데 웹 브라우저에서 카메라 접근 허용해야 사진 찍을 수 있음

## 사용 기술
정적 페이지여서 그렇게 대단한 기술은 없음, 라이브러리를 사용한 로직이 귀찮고 복잡함
- HTML, CSS, JavaScript
- p5.js, ml5.js