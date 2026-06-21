// 1. 현재 폴더 깊이를 기반으로 상위 경로 자동 계산
    function getRootPath() {
        const pathParts = window.location.pathname.split('/');
        const fileIndex = pathParts.indexOf('Syun_D');
        
        if (fileIndex !== -1) {
            const depth = pathParts.length - fileIndex - 2;
            return depth > 0 ? '../'.repeat(depth) : '';
        }
        const depth = pathParts.length - 2;
        return depth > 0 ? '../'.repeat(depth) : '';
    }

    // 2. components 를 불러오고 내부 경로 치환
    function includeComponent(targetId, filename) {
        const rootPath = getRootPath();
        const filePath = `${rootPath}components/${filename}`;

        fetch(filePath)
            .then(response => {
                if (!response.ok) throw new Error('네트워크 응답에 문제가 있습니다.');
                return response.text();
            })
            .then(data => {
                // {{ROOT}} 치환자를 실제 계산된 상대 경로로 변경하여 주입
                const 주입할데이터 = data.replace(/\{\{ROOT\}\}/g, rootPath);
                document.getElementById(targetId).innerHTML = 주입할데이터;

                // 사이드바 주입이 완료된 직후 실행해야 하는 이벤트들 바인딩
                if (targetId === 'sidebar-container') { 
                    initHamburgerMenu();
                    initActiveMenu(); 
                }
            })
            .catch(error => console.error(`${filePath} 로드 실패:`, error));
    }

    // 3. 모바일에서 햄버거 메뉴 작동
    function initHamburgerMenu() {
        const hamburgerBtn = document.getElementById('hamburgerBtn');
        const sidebar = document.querySelector('.sidebar');

        if (hamburgerBtn && sidebar) {
            hamburgerBtn.onclick = function() {
                sidebar.classList.toggle('active');
                this.classList.toggle('active'); 
            };
        }
    }

    // 4. 현재 위치한 폴더명과 사이드바 메뉴를 매칭하여 active 기능 활성화
// 현재 위치한 폴더명 또는 파일명을 분석하여 사이드바 메뉴에 불을 켜주는 함수 (최종 통합 버전)
function initActiveMenu() {
    const currentPath = window.location.pathname;
    const pathParts = currentPath.split('/');
    
    // 1. 현재 파일명과 바로 위 부모 폴더명을 추출
    const currentFileName = pathParts.pop() || 'index.html';
    const parentFolder = pathParts.pop() || '';

    // 만약 주소창 끝이 슬래시로 끝나 빈값이라면 index.html로 기본값 지정
    const activeFileName = currentFileName === '' ? 'index.html' : currentFileName;

    const menuLinks = document.querySelectorAll('.sidebar .menu a');

    menuLinks.forEach(link => {
        const hrefAttr = link.getAttribute('href');
        if (!hrefAttr) return;

        // 2. 사이드바 메뉴 링크의 파일명 추출 (예: detail_page.html, index.html)
        const linkFileName = hrefAttr.split('/').pop();

        // [케이스 1] 메인 페이지(index.html) 처리
        if (activeFileName === 'index.html') {
            if (linkFileName === 'index.html') {
                link.classList.add('active');
            }
            return; 
        }

        // [케이스 2] index와 동일선상(최상위 폴더)에 있는 카테고리 메인 HTML 파일 처리
        // 예: 주소창의 'detail_page.html'과 사이드바 링크의 'detail_page.html'이 정확히 일치할 때
        if (activeFileName === linkFileName) {
            if (link.closest('.submenu')) {
                link.classList.add('active-sub');
            } else {
                link.classList.add('active');
            }
            return;
        }

        // [케이스 3] 하위 카테고리 폴더 내부에 깊숙이 들어간 서브 상세 페이지 처리
        // 부모 폴더명(예: detail_page_area)에서 '_area'를 뗀 키워드가 메뉴 링크 파일명에 포함되는지 검증
        const folderKeyword = parentFolder.replace('_area', '');

        if (folderKeyword && folderKeyword !== 'Syun_D' && linkFileName.includes(folderKeyword)) {
            if (link.closest('.submenu')) {
                link.classList.add('active-sub'); // 2차 서브메뉴 디자인 활성화
            } else {
                link.classList.add('active'); // 1차 대메뉴 디자인 활성화
            }
        }
    });
}

    // 5. 이미지 클릭 시 모달 기능
    function initImageModal() {
        const portfolioItems = document.querySelectorAll('.portfolio-item');
        const modal = document.getElementById('imageModal');
        const modalImg = document.getElementById('modalImage');
        const closeBtn = document.getElementById('closeModal');

        if (portfolioItems.length > 0 && modal && modalImg && closeBtn) {
            portfolioItems.forEach(item => {
                item.addEventListener('click', function(e) {
                    e.preventDefault(); 
                    const imgElement = this.querySelector('.image-area img');
                    if (imgElement) {
                        modalImg.src = imgElement.src; 
                        modal.classList.add('active'); 
                    }
                });
            });

            closeBtn.addEventListener('click', () => modal.classList.remove('active'));
            modal.addEventListener('click', (e) => {
                if (e.target === modal) modal.classList.remove('active');
            });
        }
    }

    // 6. DOM 구조 완료 후 컴포넌트 로드 프로세스 시작
    window.addEventListener('DOMContentLoaded', () => {
        includeComponent('sidebar-container', 'sidebar.html');
        includeComponent('footer-container', 'footer.html');
        initImageModal(); 
    });