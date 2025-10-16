// Smart Todo 앱 클래스 (간단한 서버 인증 포함)
class SmartTodoApp {
    constructor() {
        this.todos = [];
        this.currentSubtaskParent = null;
        this.currentView = 'list';
        this.currentDate = new Date();
        this.selectedDate = null;
        this.currentUser = null;
        this.serverAPI = null;
        this.init();
    }

    async init() {
        // 서버 API 초기화 대기
        await this.waitForServerAPI();
        
        this.setupEventListeners();
        this.setupAuthStateListener();
        this.updateUI();
        this.applyTheme();
        this.showMainApp(); // 메인 앱을 기본으로 표시
    }

    async waitForServerAPI() {
        // Firebase API가 로드될 때까지 대기 (최대 10초)
        let attempts = 0;
        const maxAttempts = 100; // 10초
        
        while (!window.firebaseAPI && attempts < maxAttempts) {
            await new Promise(resolve => setTimeout(resolve, 100));
            attempts++;
        }
        
        if (!window.firebaseAPI) {
            console.error('❌ Firebase API 로드 실패: 타임아웃');
            this.showFirebaseError('Firebase API 로드에 실패했습니다. 페이지를 새로고침해주세요.');
            return;
        }
        
        this.serverAPI = window.firebaseAPI;
        
        // Firebase 초기화 오류 확인
        if (this.serverAPI.error) {
            console.error('Firebase 초기화 오류:', this.serverAPI.error);
            this.showFirebaseError(this.serverAPI.details || this.serverAPI.message);
        }
    }

    setupAuthStateListener() {
        // Firebase 인증 상태 변경 감지
        this.serverAPI.onAuthStateChanged((user) => {
            if (user) {
                // 사용자가 로그인된 경우
                this.currentUser = user.email.split('@')[0]; // 이메일에서 username 추출
                this.currentUserUID = user.uid;
                localStorage.setItem('smartTodoCurrentUser', this.currentUser);
                this.loadUserTodos();
            } else {
                // 사용자가 로그아웃된 경우
                this.currentUser = null;
                this.currentUserUID = null;
                this.todos = [];
                localStorage.removeItem('smartTodoCurrentUser');
                this.renderTodos();
                this.renderCalendar();
            }
            this.updateUI();
        });
    }

    setupEventListeners() {
        // 폼 제출
        document.getElementById('todoForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            await this.addTodo();
        });

        // 테마 토글
        document.getElementById('themeToggleMain').addEventListener('click', () => {
            this.toggleTheme();
        });

        // 로그아웃
        document.getElementById('logoutBtn').addEventListener('click', () => {
            this.logout();
        });

        // 헤더 인증 버튼들
        document.getElementById('loginBtn').addEventListener('click', () => {
            this.showAuthModal('login');
        });

        document.getElementById('registerBtn').addEventListener('click', () => {
            this.showAuthModal('register');
        });

        document.getElementById('forgotPasswordBtn').addEventListener('click', () => {
            this.showAuthModal('forgot');
        });

        // 인증 모달 닫기
        document.getElementById('closeAuthModal').addEventListener('click', () => {
            this.closeAuthModal();
        });

        // 인증 모달 외부 클릭으로 닫기
        document.getElementById('authModal').addEventListener('click', (e) => {
            if (e.target.id === 'authModal') {
                this.closeAuthModal();
            }
        });

        // 로그인 폼 전환
        document.getElementById('showRegisterBtn').addEventListener('click', () => {
            this.showAuthForm('register');
        });

        document.getElementById('showLoginBtn').addEventListener('click', () => {
            this.showAuthForm('login');
        });

        document.getElementById('showForgotPasswordBtn').addEventListener('click', () => {
            this.showAuthForm('forgot');
        });

        document.getElementById('backToLoginFromForgot').addEventListener('click', () => {
            this.showAuthForm('login');
        });

        // 폼 제출 이벤트
        document.getElementById('loginSubmitBtn').addEventListener('click', (e) => {
            e.preventDefault();
            this.handleLogin();
        });

        document.getElementById('registerSubmitBtn').addEventListener('click', (e) => {
            e.preventDefault();
            this.handleRegister();
        });

        document.getElementById('forgotPasswordSubmitBtn').addEventListener('click', (e) => {
            e.preventDefault();
            this.handleForgotPassword();
        });

        // 뷰 전환 탭
        document.getElementById('listViewTab').addEventListener('click', () => {
            this.switchView('list');
        });

        document.getElementById('calendarViewTab').addEventListener('click', () => {
            this.switchView('calendar');
        });

        // 정렬 버튼들
        document.getElementById('sortByPriority').addEventListener('click', () => {
            this.sortTodos('priority');
        });

        document.getElementById('sortByDate').addEventListener('click', () => {
            this.sortTodos('date');
        });

        // 완료 항목 모두 삭제
        document.getElementById('clearCompleted').addEventListener('click', async () => {
            await this.clearCompleted();
        });

        // 캘린더 네비게이션
        document.getElementById('prevMonth').addEventListener('click', () => {
            this.changeMonth(-1);
        });

        document.getElementById('nextMonth').addEventListener('click', () => {
            this.changeMonth(1);
        });

        // 하위 작업 모달
        document.getElementById('closeModal').addEventListener('click', () => {
            this.closeSubtaskModal();
        });

        document.getElementById('addSubtask').addEventListener('click', async () => {
            await this.addSubtask();
        });

        // 하위 작업 모달 외부 클릭으로 닫기
        document.getElementById('subtaskModal').addEventListener('click', (e) => {
            if (e.target.id === 'subtaskModal') {
                this.closeSubtaskModal();
            }
        });

        // 전역 이벤트 리스너
        document.addEventListener('change', async (e) => {
            if (e.target.classList.contains('todo-checkbox')) {
                await this.toggleTodo(e.target);
            }
            if (e.target.classList.contains('subtask-checkbox')) {
                await this.toggleSubtask(e.target);
            }
        });

        document.addEventListener('click', async (e) => {
            if (e.target.classList.contains('delete-btn')) {
                await this.deleteTodo(e.target);
            }
            if (e.target.classList.contains('subtask-btn')) {
                this.openSubtaskModal(e.target);
            }
            if (e.target.classList.contains('subtask-delete')) {
                await this.deleteSubtask(e.target);
            }
            if (e.target.classList.contains('calendar-day')) {
                this.selectDate(e.target);
            }
            // 캘린더 할 일 아이템 클릭 시 이벤트 전파 방지
            if (e.target.closest('.calendar-todo-item')) {
                e.stopPropagation();
            }
        });

        // 캘린더 체크박스 이벤트 처리
        document.addEventListener('change', async (e) => {
            if (e.target.classList.contains('calendar-todo-checkbox')) {
                await this.handleCalendarTodoToggle(e.target);
            }
        });

        // 드래그 앤 드롭
        this.setupDragAndDrop();
    }

    // 사용자 인증 관련 메서드들
    showAuthModal(type) {
        document.getElementById('authModal').classList.add('show');
        this.showAuthForm(type);
    }

    closeAuthModal() {
        document.getElementById('authModal').classList.remove('show');
        this.clearAuthForms();
    }

    showAuthForm(type) {
        const loginForm = document.getElementById('loginForm');
        const registerForm = document.getElementById('registerForm');
        const forgotPasswordForm = document.getElementById('forgotPasswordForm');
        const authMessage = document.getElementById('authMessage');
        const authModalTitle = document.getElementById('authModalTitle');

        // 모든 폼 숨기기
        loginForm.style.display = 'none';
        registerForm.style.display = 'none';
        forgotPasswordForm.style.display = 'none';

        // 메시지 초기화
        authMessage.textContent = '';
        authMessage.className = 'auth-message';

        // 선택된 폼 표시
        if (type === 'login') {
            loginForm.style.display = 'block';
            authModalTitle.textContent = '로그인';
        } else if (type === 'register') {
            registerForm.style.display = 'block';
            authModalTitle.textContent = '회원가입';
        } else if (type === 'forgot') {
            forgotPasswordForm.style.display = 'block';
            authModalTitle.textContent = '비밀번호 찾기';
        }
    }

    clearAuthForms() {
        const loginUsername = document.getElementById('loginUsername');
        const loginPassword = document.getElementById('loginPassword');
        const registerUsername = document.getElementById('registerUsername');
        const registerPassword = document.getElementById('registerPassword');
        const registerConfirmPassword = document.getElementById('registerConfirmPassword');
        const forgotUsername = document.getElementById('forgotUsername');
        const authMessage = document.getElementById('authMessage');
        
        if (loginUsername) loginUsername.value = '';
        if (loginPassword) loginPassword.value = '';
        if (registerUsername) registerUsername.value = '';
        if (registerPassword) registerPassword.value = '';
        if (registerConfirmPassword) registerConfirmPassword.value = '';
        if (forgotUsername) forgotUsername.value = '';
        if (authMessage) {
            authMessage.textContent = '';
            authMessage.className = 'auth-message';
        }
        
        // 동의 체크박스 초기화
        const privacyConsent = document.getElementById('privacyConsent');
        const termsConsent = document.getElementById('termsConsent');
        const rightsConsent = document.getElementById('rightsConsent');
        const marketingConsent = document.getElementById('marketingConsent');
        
        if (privacyConsent) privacyConsent.checked = false;
        if (termsConsent) termsConsent.checked = false;
        if (rightsConsent) rightsConsent.checked = false;
        if (marketingConsent) marketingConsent.checked = false;
    }

    showAuthMessage(message, type) {
        const authMessage = document.getElementById('authMessage');
        if (authMessage) {
            authMessage.textContent = message;
            authMessage.className = `auth-message ${type}`;
        }
    }

    async handleLogin() {
        const username = document.getElementById('loginUsername').value.trim();
        const password = document.getElementById('loginPassword').value.trim();

        if (!username || !password) {
            this.showAuthMessage('아이디와 비밀번호를 입력해주세요.', 'error');
            return;
        }

        try {
            const result = await this.serverAPI.loginUser(username, password);
            this.closeAuthModal();
            this.showAuthMessage('로그인 성공!', 'success');
            
            // 서버 상태 확인 (개발용)
            await this.checkServerStatus();
            
            setTimeout(() => {
                this.showAuthMessage('', '');
            }, 2000);
        } catch (error) {
            console.error('로그인 오류:', error);
            this.showAuthMessage(error.message, 'error');
        }
    }

    async handleRegister() {
        const username = document.getElementById('registerUsername').value.trim();
        const password = document.getElementById('registerPassword').value.trim();
        const confirmPassword = document.getElementById('registerConfirmPassword').value.trim();
        
        // 동의 항목 확인
        const privacyConsent = document.getElementById('privacyConsent').checked;
        const termsConsent = document.getElementById('termsConsent').checked;
        const rightsConsent = document.getElementById('rightsConsent').checked;
        const marketingConsent = document.getElementById('marketingConsent').checked;

        if (!username || !password || !confirmPassword) {
            this.showAuthMessage('모든 필드를 입력해주세요.', 'error');
            return;
        }

        if (password !== confirmPassword) {
            this.showAuthMessage('비밀번호가 일치하지 않습니다.', 'error');
            return;
        }

        if (password.length < 4) {
            this.showAuthMessage('비밀번호는 최소 4자 이상이어야 합니다.', 'error');
            return;
        }

        // 필수 동의 항목 확인
        if (!privacyConsent || !termsConsent || !rightsConsent) {
            this.showAuthMessage('필수 동의 항목에 모두 동의해주세요.', 'error');
            return;
        }

        try {
            const result = await this.serverAPI.registerUser(username, password);
            this.showAuthMessage('회원가입 성공! 로그인해주세요.', 'success');
            
            // 동의 정보를 사용자 데이터에 저장
            const consentData = {
                privacyConsent: privacyConsent,
                termsConsent: termsConsent,
                rightsConsent: rightsConsent,
                marketingConsent: marketingConsent,
                consentDate: new Date().toISOString()
            };
            
            // 동의 정보를 로컬 스토리지에 임시 저장 (로그인 후 Firebase에 저장)
            localStorage.setItem('tempConsentData', JSON.stringify(consentData));
            
            // 서버 상태 확인 (개발용)
            await this.checkServerStatus();
            
            setTimeout(() => {
                this.showAuthForm('login');
            }, 1500);
        } catch (error) {
            console.error('회원가입 오류:', error);
            this.showAuthMessage(error.message, 'error');
        }
    }

    async handleForgotPassword() {
        const username = document.getElementById('forgotUsername').value.trim();

        if (!username) {
            this.showAuthMessage('아이디를 입력해주세요.', 'error');
            return;
        }

        try {
            // 간단한 비밀번호 찾기 기능 (실제로는 보안상 위험하므로 데모용)
            this.showAuthMessage('비밀번호 찾기 기능은 준비 중입니다. 관리자에게 문의해주세요.', 'info');
        } catch (error) {
            console.error('비밀번호 찾기 오류:', error);
            this.showAuthMessage('오류가 발생했습니다.', 'error');
        }
    }

    async logout() {
        try {
            await this.serverAPI.logoutUser();
            
            // 뷰를 목록 보기로 초기화
            this.switchView('list');
            
            // 선택된 날짜 정보 완전 초기화
            const selectedDateTitle = document.getElementById('selectedDateTitle');
            const datePendingList = document.getElementById('datePendingList');
            const dateCompletedList = document.getElementById('dateCompletedList');
            
            if (selectedDateTitle) selectedDateTitle.textContent = '';
            if (datePendingList) datePendingList.innerHTML = '';
            if (dateCompletedList) dateCompletedList.innerHTML = '';
            
            this.selectedDate = null;
            
            // 선택된 날짜 스타일 제거
            document.querySelectorAll('.calendar-day.selected').forEach(day => {
                day.classList.remove('selected');
            });
            
            // 폼 초기화
            this.clearAuthForms();
            
            // 할 일 입력 폼 초기화
            const todoInput = document.getElementById('todoInput');
            const prioritySelect = document.getElementById('prioritySelect');
            const dueDate = document.getElementById('dueDate');
            const categorySelect = document.getElementById('categorySelect');
            
            if (todoInput) todoInput.value = '';
            if (prioritySelect) prioritySelect.value = 'normal';
            if (dueDate) dueDate.value = '';
            if (categorySelect) categorySelect.value = 'general';
            
        } catch (error) {
            console.error('로그아웃 오류:', error);
        }
    }

    showMainApp() {
        document.getElementById('mainApp').style.display = 'block';
        this.updateUI();
    }

    showFirebaseError() {
        // Firebase 오류 알림 표시
        const authMessage = document.getElementById('authMessage');
        if (authMessage) {
            authMessage.textContent = 'Firebase 설정 오류: 실제 Firebase 프로젝트 설정이 필요합니다.';
            authMessage.className = 'auth-message error';
        }
        
        // 콘솔에 상세 정보 출력
        console.error('=== Firebase 설정 오류 ===');
        console.error('현재 더미 Firebase 설정이 사용되고 있습니다.');
        console.error('실제 Firebase 프로젝트를 생성하고 설정을 업데이트해야 합니다.');
        console.error('================================');
    }

    updateUI() {
        const guestControls = document.getElementById('guestControls');
        const userInfo = document.getElementById('userName');
        
        if (this.currentUser) {
            // 로그인된 상태
            if (guestControls) guestControls.style.display = 'none';
            const userInfoDiv = document.getElementById('userInfo');
            if (userInfoDiv) userInfoDiv.style.display = 'flex';
            if (userInfo) userInfo.textContent = `${this.currentUser}님`;
        } else {
            // 로그인되지 않은 상태
            if (guestControls) guestControls.style.display = 'flex';
            const userInfoDiv = document.getElementById('userInfo');
            if (userInfoDiv) userInfoDiv.style.display = 'none';
        }
    }

    // 데이터 저장/불러오기 (Firebase Firestore)
    async saveUserTodos() {
        if (this.currentUserUID && this.serverAPI) {
            try {
                await this.serverAPI.saveUserTodos(this.currentUserUID, this.todos);
                console.log(`✅ 할 일 저장 완료: ${this.currentUser} (${this.todos.length}개)`);
            } catch (error) {
                console.error('할 일 저장 오류:', error);
            }
        }
    }

    async loadUserTodos() {
        if (this.currentUserUID && this.serverAPI) {
            try {
                const result = await this.serverAPI.getUserTodos(this.currentUserUID);
                if (result.success) {
                    this.todos = result.todos || [];
                    console.log(`📥 할 일 불러오기 완료: ${this.currentUser} (${this.todos.length}개)`);
                    this.renderTodos();
                    this.updateEmptyMessages();
                    if (this.currentView === 'calendar') {
                        this.renderCalendar();
                    }
                }
            } catch (error) {
                console.error('할 일 불러오기 오류:', error);
                this.todos = [];
            }
        }
    }

    // 뷰 전환
    switchView(view) {
        this.currentView = view;
        
        // 탭 활성화
        document.querySelectorAll('.view-tab').forEach(tab => {
            tab.classList.remove('active');
        });
        document.getElementById(`${view}ViewTab`).classList.add('active');
        
        // 뷰 콘텐츠 활성화
        document.querySelectorAll('.view-content').forEach(content => {
            content.classList.remove('active');
        });
        document.getElementById(`${view}View`).classList.add('active');
        
        if (view === 'calendar') {
            this.renderCalendar();
        }
    }

    async addTodo() {
        if (!this.currentUserUID) {
            this.showAuthModal('login');
            return;
        }

        const input = document.getElementById('todoInput');
        const priority = document.getElementById('prioritySelect').value;
        const dueDate = document.getElementById('dueDate').value;
        const category = document.getElementById('categorySelect').value;
        const text = input.value.trim();

        if (!text) return;

        const todo = {
            id: Date.now(),
            text: text,
            completed: false,
            priority: priority,
            dueDate: dueDate,
            category: category,
            subtasks: [],
            createdAt: new Date().toISOString()
        };

        this.todos.push(todo);
        this.renderTodos();
        await this.saveUserTodos();
        this.updateEmptyMessages();

        // 폼 초기화
        input.value = '';
        document.getElementById('prioritySelect').value = 'normal';
        document.getElementById('dueDate').value = '';
        document.getElementById('categorySelect').value = 'general';
    }

    renderTodos() {
        const pendingList = document.getElementById('pendingList');
        const completedList = document.getElementById('completedList');

        // 기존 항목들 제거
        pendingList.innerHTML = '';
        completedList.innerHTML = '';

        // 로그인되지 않은 경우 빈 상태 메시지 표시
        if (!this.currentUser) {
            const pendingEmptyMsg = document.createElement('div');
            pendingEmptyMsg.className = 'empty-message';
            pendingEmptyMsg.innerHTML = '🔐 로그인이 필요합니다<br><small>로그인하여 할 일을 관리해보세요!</small>';
            pendingList.appendChild(pendingEmptyMsg);

            const completedEmptyMsg = document.createElement('div');
            completedEmptyMsg.className = 'empty-message';
            completedEmptyMsg.innerHTML = '🔐 로그인이 필요합니다<br><small>로그인하여 할 일을 관리해보세요!</small>';
            completedList.appendChild(completedEmptyMsg);
            return;
        }

        // 할 일들을 상태별로 분류하여 렌더링
        this.todos.forEach(todo => {
            const todoElement = this.createTodoElement(todo);
            if (todo.completed) {
                completedList.appendChild(todoElement);
            } else {
                pendingList.appendChild(todoElement);
            }
        });
    }

    createTodoElement(todo) {
        const li = document.createElement('li');
        li.className = `todo-item ${todo.completed ? 'completed' : ''} priority-${todo.priority}`;
        li.draggable = true;
        li.dataset.id = todo.id;

        const priorityText = {
            normal: '일반',
            high: '높음 ⭐',
            urgent: '긴급 🔥'
        };

        const categoryText = {
            general: '일반',
            work: '업무',
            personal: '개인',
            shopping: '쇼핑'
        };

        const dueDateText = todo.dueDate ? this.formatDueDate(todo.dueDate) : '';
        const dueDateClass = todo.dueDate ? this.getDueDateClass(todo.dueDate) : '';

        li.innerHTML = `
            <input type="checkbox" class="todo-checkbox" ${todo.completed ? 'checked' : ''}>
            <div class="todo-content">
                <div class="todo-text ${todo.completed ? 'completed' : ''}">${todo.text}</div>
                <div class="todo-meta">
                    <span class="priority-badge priority-${todo.priority}">${priorityText[todo.priority]}</span>
                    <span class="category-badge">${categoryText[todo.category]}</span>
                    ${dueDateText ? `<span class="due-date ${dueDateClass}">📅 ${dueDateText}</span>` : ''}
                    ${todo.subtasks.length > 0 ? `<span class="subtask-count">📋 ${todo.subtasks.filter(st => !st.completed).length}/${todo.subtasks.length}</span>` : ''}
                </div>
                ${todo.subtasks.length > 0 ? this.renderSubtasks(todo.subtasks) : ''}
            </div>
            <div class="todo-actions">
                <button class="action-btn subtask-btn" title="하위 작업">📋</button>
                <button class="action-btn delete-btn" title="삭제">🗑️</button>
            </div>
        `;

        return li;
    }

    renderSubtasks(subtasks) {
        if (subtasks.length === 0) return '';

        const completedCount = subtasks.filter(st => st.completed).length;
        const totalCount = subtasks.length;

        return `
            <div class="subtasks">
                <div class="subtask-progress">
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${(completedCount / totalCount) * 100}%"></div>
                    </div>
                    <span class="progress-text">${completedCount}/${totalCount}</span>
                </div>
            </div>
        `;
    }

    formatDueDate(dateString) {
        const date = new Date(dateString);
        const today = new Date();
        const diffTime = date - today;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays === 0) return '오늘';
        if (diffDays === 1) return '내일';
        if (diffDays === -1) return '어제';
        if (diffDays > 0) return `${diffDays}일 후`;
        if (diffDays < 0) return `${Math.abs(diffDays)}일 지남`;

        return date.toLocaleDateString('ko-KR');
    }

    getDueDateClass(dateString) {
        const date = new Date(dateString);
        const today = new Date();
        const diffTime = date - today;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays < 0) return 'overdue';
        if (diffDays === 0) return 'today';
        return '';
    }

    async toggleTodo(checkbox) {
        const todoId = parseInt(checkbox.closest('.todo-item').dataset.id);
        const todo = this.todos.find(t => t.id === todoId);
        
        if (todo) {
            todo.completed = checkbox.checked;
            this.renderTodos();
            await this.saveUserTodos();
            this.updateEmptyMessages();
            
            // 캘린더 뷰가 활성화되어 있으면 캘린더도 업데이트
            if (this.currentView === 'calendar') {
                this.renderCalendar();
                if (this.selectedDate) {
                    this.showDateTodos(this.selectedDate);
                }
            }
        }
    }

    async deleteTodo(button) {
        const todoId = parseInt(button.closest('.todo-item').dataset.id);
        this.todos = this.todos.filter(t => t.id !== todoId);
        this.renderTodos();
        await this.saveUserTodos();
        this.updateEmptyMessages();
        
        // 캘린더 뷰가 활성화되어 있으면 캘린더도 업데이트
        if (this.currentView === 'calendar') {
            this.renderCalendar();
            if (this.selectedDate) {
                this.showDateTodos(this.selectedDate);
            }
        }
    }

    async clearCompleted() {
        if (confirm('완료된 모든 항목을 삭제하시겠습니까?')) {
            this.todos = this.todos.filter(t => !t.completed);
            this.renderTodos();
            await this.saveUserTodos();
            this.updateEmptyMessages();
            
            // 캘린더 뷰가 활성화되어 있으면 캘린더도 업데이트
            if (this.currentView === 'calendar') {
                this.renderCalendar();
                if (this.selectedDate) {
                    this.showDateTodos(this.selectedDate);
                }
            }
        }
    }

    sortTodos(type) {
        if (type === 'priority') {
            const priorityOrder = { urgent: 3, high: 2, normal: 1 };
            this.todos.sort((a, b) => {
                if (a.completed !== b.completed) {
                    return a.completed ? 1 : -1;
                }
                return priorityOrder[b.priority] - priorityOrder[a.priority];
            });
        } else if (type === 'date') {
            this.todos.sort((a, b) => {
                if (a.completed !== b.completed) {
                    return a.completed ? 1 : -1;
                }
                if (!a.dueDate && !b.dueDate) return 0;
                if (!a.dueDate) return 1;
                if (!b.dueDate) return -1;
                return new Date(a.dueDate) - new Date(b.dueDate);
            });
        }
        this.renderTodos();
    }

    // 캘린더 체크박스 토글 처리
    async handleCalendarTodoToggle(checkbox) {
        const todoId = parseInt(checkbox.dataset.todoId);
        const todo = this.todos.find(t => t.id === todoId);
        
        if (todo) {
            todo.completed = checkbox.checked;
            await this.saveUserTodos();
            
            // 캘린더 다시 렌더링
            this.renderCalendar();
            
            // 선택된 날짜가 있으면 해당 날짜의 할 일도 업데이트
            if (this.selectedDate) {
                this.showDateTodos(this.selectedDate);
            }
        }
    }

    // 캘린더 관련 메서드들
    renderCalendar() {
        const calendarGrid = document.getElementById('calendarGrid');
        const currentMonthYear = document.getElementById('currentMonthYear');
        
        // 현재 월/년 표시
        const monthNames = ['1월', '2월', '3월', '4월', '5월', '6월', 
                          '7월', '8월', '9월', '10월', '11월', '12월'];
        currentMonthYear.textContent = `${this.currentDate.getFullYear()}년 ${monthNames[this.currentDate.getMonth()]}`;
        
        // 캘린더 그리드 생성
        calendarGrid.innerHTML = '';
        
        // 요일 헤더
        const weekdays = ['일', '월', '화', '수', '목', '금', '토'];
        weekdays.forEach(day => {
            const weekdayDiv = document.createElement('div');
            weekdayDiv.className = 'weekday';
            weekdayDiv.textContent = day;
            calendarGrid.appendChild(weekdayDiv);
        });

        // 로그인되지 않은 경우 빈 캘린더만 표시
        if (!this.currentUser) {
            // 빈 날짜 셀들만 생성
            const year = this.currentDate.getFullYear();
            const month = this.currentDate.getMonth();
            const firstDay = new Date(year, month, 1);
            const startDate = new Date(firstDay);
            startDate.setDate(startDate.getDate() - firstDay.getDay());
            
            for (let i = 0; i < 42; i++) {
                const cellDate = new Date(startDate);
                cellDate.setDate(startDate.getDate() + i);
                
                const dayDiv = document.createElement('div');
                dayDiv.className = 'calendar-day';
                dayDiv.dataset.date = this.formatDate(cellDate);
                
                // 다른 월의 날짜인지 확인
                if (cellDate.getMonth() !== month) {
                    dayDiv.classList.add('other-month');
                }
                
                // 오늘인지 확인
                const today = new Date();
                if (this.isSameDate(cellDate, today)) {
                    dayDiv.classList.add('today');
                }
                
                const dayNumberDiv = document.createElement('div');
                dayNumberDiv.className = 'day-number';
                dayNumberDiv.textContent = cellDate.getDate();
                dayDiv.appendChild(dayNumberDiv);
                
                calendarGrid.appendChild(dayDiv);
            }
            return;
        }
        
        // 날짜 셀들
        const year = this.currentDate.getFullYear();
        const month = this.currentDate.getMonth();
        
        // 해당 월의 첫째 날과 마지막 날
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const startDate = new Date(firstDay);
        startDate.setDate(startDate.getDate() - firstDay.getDay());
        
        // 6주 * 7일 = 42일 표시
        for (let i = 0; i < 42; i++) {
            const cellDate = new Date(startDate);
            cellDate.setDate(startDate.getDate() + i);
            
            const dayDiv = document.createElement('div');
            dayDiv.className = 'calendar-day';
            dayDiv.dataset.date = this.formatDate(cellDate);
            
            // 다른 월의 날짜인지 확인
            if (cellDate.getMonth() !== month) {
                dayDiv.classList.add('other-month');
            }
            
            // 오늘인지 확인
            const today = new Date();
            if (this.isSameDate(cellDate, today)) {
                dayDiv.classList.add('today');
            }
            
            // 선택된 날짜인지 확인
            if (this.selectedDate && this.isSameDate(cellDate, this.selectedDate)) {
                dayDiv.classList.add('selected');
            }
            
            // 해당 날짜에 할 일이 있는지 확인
            const dateTodos = this.getTodosForDate(cellDate);
            if (dateTodos.length > 0) {
                dayDiv.classList.add('has-todos');
                
                const dayTodosDiv = document.createElement('div');
                dayTodosDiv.className = 'day-todos';
                
                // 예정된 할 일과 완료된 할 일을 분리
                const pendingTodos = dateTodos.filter(todo => !todo.completed);
                const completedTodos = dateTodos.filter(todo => todo.completed);
                
                // 예정된 할 일 표시 (최대 3개)
                pendingTodos.slice(0, 3).forEach(todo => {
                    const todoItem = document.createElement('div');
                    todoItem.className = 'calendar-todo-item pending';
                    todoItem.innerHTML = `
                        <input type="checkbox" class="calendar-todo-checkbox" data-todo-id="${todo.id}">
                        <span class="calendar-todo-text">${todo.text}</span>
                    `;
                    dayTodosDiv.appendChild(todoItem);
                });
                
                // 완료된 할 일 표시 (최대 2개)
                if (completedTodos.length > 0) {
                    completedTodos.slice(0, 2).forEach(todo => {
                        const todoItem = document.createElement('div');
                        todoItem.className = 'calendar-todo-item completed';
                        todoItem.innerHTML = `
                            <input type="checkbox" class="calendar-todo-checkbox" checked data-todo-id="${todo.id}">
                            <span class="calendar-todo-text completed">${todo.text}</span>
                        `;
                        dayTodosDiv.appendChild(todoItem);
                    });
                }
                
                // 더 많은 할 일이 있는 경우 표시
                const totalTodos = dateTodos.length;
                if (totalTodos > 5) {
                    const moreItem = document.createElement('div');
                    moreItem.className = 'calendar-todo-more';
                    moreItem.textContent = `+${totalTodos - 5}개 더`;
                    dayTodosDiv.appendChild(moreItem);
                }
                
                dayDiv.appendChild(dayTodosDiv);
            }
            
            const dayNumberDiv = document.createElement('div');
            dayNumberDiv.className = 'day-number';
            dayNumberDiv.textContent = cellDate.getDate();
            dayDiv.insertBefore(dayNumberDiv, dayDiv.firstChild);
            
            calendarGrid.appendChild(dayDiv);
        }
    }

    changeMonth(direction) {
        this.currentDate.setMonth(this.currentDate.getMonth() + direction);
        this.renderCalendar();
    }

    selectDate(dayElement) {
        // 이전 선택 해제
        document.querySelectorAll('.calendar-day.selected').forEach(day => {
            day.classList.remove('selected');
        });
        
        // 새 선택
        dayElement.classList.add('selected');
        
        const dateString = dayElement.dataset.date;
        // 날짜 문자열을 정확히 파싱하기 위해 시간대 문제를 해결
        const [year, month, day] = dateString.split('-').map(num => parseInt(num));
        this.selectedDate = new Date(year, month - 1, day); // month는 0부터 시작
        
        this.showDateTodos(this.selectedDate);
    }

    showDateTodos(date) {
        const selectedDateTitle = document.getElementById('selectedDateTitle');
        const datePendingList = document.getElementById('datePendingList');
        const dateCompletedList = document.getElementById('dateCompletedList');
        
        // 선택된 날짜 표시
        const dateStr = date.toLocaleDateString('ko-KR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            weekday: 'long'
        });
        selectedDateTitle.textContent = dateStr;
        
        // 해당 날짜의 할 일들 가져오기
        const dateTodos = this.getTodosForDate(date);
        const pendingTodos = dateTodos.filter(todo => !todo.completed);
        const completedTodos = dateTodos.filter(todo => todo.completed);
        
        // 예정된 할 일 렌더링
        datePendingList.innerHTML = '';
        if (pendingTodos.length === 0) {
            const emptyMsg = document.createElement('div');
            emptyMsg.className = 'empty-message';
            emptyMsg.textContent = '예정된 할 일이 없습니다';
            datePendingList.appendChild(emptyMsg);
        } else {
            pendingTodos.forEach(todo => {
                const li = this.createDateTodoElement(todo);
                datePendingList.appendChild(li);
            });
        }
        
        // 완료된 할 일 렌더링
        dateCompletedList.innerHTML = '';
        if (completedTodos.length === 0) {
            const emptyMsg = document.createElement('div');
            emptyMsg.className = 'empty-message';
            emptyMsg.textContent = '완료된 할 일이 없습니다';
            dateCompletedList.appendChild(emptyMsg);
        } else {
            completedTodos.forEach(todo => {
                const li = this.createDateTodoElement(todo);
                dateCompletedList.appendChild(li);
            });
        }
    }

    createDateTodoElement(todo) {
        const li = document.createElement('li');
        li.className = `date-todo-item ${todo.completed ? 'completed' : ''}`;
        li.dataset.id = todo.id;
        
        const priorityText = {
            normal: '일반',
            high: '높음',
            urgent: '긴급'
        };
        
        const categoryText = {
            general: '일반',
            work: '업무',
            personal: '개인',
            shopping: '쇼핑'
        };
        
        li.innerHTML = `
            <input type="checkbox" class="todo-checkbox" ${todo.completed ? 'checked' : ''}>
            <div class="date-todo-text ${todo.completed ? 'completed' : ''}">${todo.text}</div>
            <div class="date-todo-meta">
                <span class="date-priority-badge date-priority-${todo.priority}">${priorityText[todo.priority]}</span>
                <span class="date-category-badge">${categoryText[todo.category]}</span>
                <button class="action-btn delete-btn" title="삭제">🗑️</button>
            </div>
        `;
        
        return li;
    }

    getTodosForDate(date) {
        const dateStr = this.formatDate(date);
        return this.todos.filter(todo => {
            if (!todo.dueDate) return false;
            return todo.dueDate === dateStr;
        });
    }

    formatDate(date) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }

    isSameDate(date1, date2) {
        return date1.getFullYear() === date2.getFullYear() &&
               date1.getMonth() === date2.getMonth() &&
               date1.getDate() === date2.getDate();
    }

    // 하위 작업 관련 메서드들
    openSubtaskModal(button) {
        const todoId = parseInt(button.closest('.todo-item').dataset.id);
        this.currentSubtaskParent = this.todos.find(t => t.id === todoId);
        
        document.getElementById('subtaskModal').classList.add('show');
        this.renderSubtaskList();
    }

    closeSubtaskModal() {
        document.getElementById('subtaskModal').classList.remove('show');
        this.currentSubtaskParent = null;
    }

    async addSubtask() {
        const input = document.getElementById('subtaskInput');
        const text = input.value.trim();
        
        if (!text || !this.currentSubtaskParent) return;

        const subtask = {
            id: Date.now(),
            text: text,
            completed: false
        };

        this.currentSubtaskParent.subtasks.push(subtask);
        this.renderSubtaskList();
        this.renderTodos();
        await this.saveUserTodos();
        
        input.value = '';
    }

    renderSubtaskList() {
        const list = document.getElementById('subtaskList');
        list.innerHTML = '';

        if (!this.currentSubtaskParent) return;

        this.currentSubtaskParent.subtasks.forEach(subtask => {
            const li = document.createElement('li');
            li.className = 'subtask-list-item';
            li.dataset.id = subtask.id;
            li.innerHTML = `
                <input type="checkbox" class="subtask-checkbox" ${subtask.completed ? 'checked' : ''}>
                <span class="subtask-text ${subtask.completed ? 'completed' : ''}">${subtask.text}</span>
                <button class="subtask-delete">🗑️</button>
            `;
            list.appendChild(li);
        });
    }

    async toggleSubtask(checkbox) {
        const subtaskText = checkbox.nextElementSibling;
        subtaskText.classList.toggle('completed', checkbox.checked);
        
        // 실제 데이터 업데이트는 모달이 열려있을 때만
        if (this.currentSubtaskParent) {
            const subtaskId = parseInt(checkbox.closest('.subtask-list-item').dataset.id);
            const subtask = this.currentSubtaskParent.subtasks.find(st => st.id === subtaskId);
            if (subtask) {
                subtask.completed = checkbox.checked;
                await this.saveUserTodos();
            }
        }
    }

    async deleteSubtask(button) {
        const listItem = button.closest('.subtask-list-item');
        const subtaskId = parseInt(listItem.dataset.id);
        
        if (this.currentSubtaskParent) {
            this.currentSubtaskParent.subtasks = this.currentSubtaskParent.subtasks.filter(st => st.id !== subtaskId);
            this.renderSubtaskList();
            this.renderTodos();
            await this.saveUserTodos();
        }
    }

    // 드래그 앤 드롭
    setupDragAndDrop() {
        let draggedElement = null;

        document.addEventListener('dragstart', (e) => {
            if (e.target.classList.contains('todo-item')) {
                draggedElement = e.target;
                e.target.classList.add('dragging');
            }
        });

        document.addEventListener('dragend', (e) => {
            if (e.target.classList.contains('todo-item')) {
                e.target.classList.remove('dragging');
                draggedElement = null;
            }
        });

        document.addEventListener('dragover', (e) => {
            e.preventDefault();
        });

        document.addEventListener('drop', (e) => {
            e.preventDefault();
            
            if (draggedElement && e.target.classList.contains('todo-list')) {
                const todoId = parseInt(draggedElement.dataset.id);
                const todo = this.todos.find(t => t.id === todoId);
                
                if (todo) {
                    // 드롭된 위치에 따라 순서 조정
                    const dropTarget = e.target;
                    const todos = Array.from(dropTarget.children);
                    const dropIndex = todos.indexOf(e.target);
                    
                    // 간단한 순서 변경 (실제로는 더 복잡한 로직이 필요)
                    this.renderTodos();
                    this.saveUserTodos();
                }
            }
        });
    }

    // 테마 관련
    toggleTheme() {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        
        const themeToggle = document.getElementById('themeToggleMain');
        if (themeToggle) {
            themeToggle.textContent = newTheme === 'dark' ? '☀️' : '🌙';
        }
    }

    applyTheme() {
        const savedTheme = localStorage.getItem('theme') || 'light';
        document.documentElement.setAttribute('data-theme', savedTheme);
        
        const themeToggle = document.getElementById('themeToggleMain');
        if (themeToggle) {
            themeToggle.textContent = savedTheme === 'dark' ? '☀️' : '🌙';
        }
    }

    // 서버 상태 확인 (개발용)
    async checkServerStatus() {
        if (this.serverAPI) {
            const status = await this.serverAPI.getServerStatus();
            console.log('=== 서버 상태 ===');
            console.log(`서버 타입: ${status.serverType}`);
            console.log(`연결 상태: ${status.isConnected ? '✅ 연결됨' : '❌ 연결 안됨'}`);
            console.log(`알림: ${status.note}`);
            
            if (status.currentUser) {
                console.log(`현재 로그인된 사용자: ${status.currentUser.email}`);
            } else {
                console.log('현재 로그인된 사용자: 없음');
            }
            
            if (status.error) {
                console.log(`오류: ${status.error}`);
            }
            console.log('================');
            return status;
        }
        return null;
    }

    // 빈 상태 메시지
    updateEmptyMessages() {
        const pendingList = document.getElementById('pendingList');
        const completedList = document.getElementById('completedList');

        // 로그인되지 않은 경우 빈 메시지 업데이트하지 않음 (renderTodos에서 처리)
        if (!this.currentUser) {
            return;
        }

        // 기존 빈 메시지 제거
        pendingList.querySelector('.empty-message')?.remove();
        completedList.querySelector('.empty-message')?.remove();

        // 예정 목록이 비어있으면 메시지 추가
        const pendingItems = pendingList.querySelectorAll('li:not(.empty-message)');
        if (pendingItems.length === 0) {
            const emptyMsg = document.createElement('div');
            emptyMsg.className = 'empty-message';
            emptyMsg.innerHTML = '🎯 오늘 할 일이 없습니다<br><small>새로운 할 일을 추가해보세요!</small>';
            pendingList.appendChild(emptyMsg);
        }

        // 완료 목록이 비어있으면 메시지 추가
        const completedItems = completedList.querySelectorAll('li:not(.empty-message)');
        if (completedItems.length === 0) {
            const emptyMsg = document.createElement('div');
            emptyMsg.className = 'empty-message';
            emptyMsg.innerHTML = '✨ 완료된 할 일이 없습니다<br><small>할 일을 완료하면 여기에 표시됩니다!</small>';
            completedList.appendChild(emptyMsg);
        }
    }
}

// 동의 상세 내용 표시 (전역 함수)
function showConsentDetail(type) {
    const modal = document.getElementById('consentModal');
    const title = document.getElementById('consentModalTitle');
    const content = document.getElementById('consentModalContent');
    
    if (!modal || !title || !content) return;
    
    let titleText = '';
    let contentText = '';
    
    switch(type) {
        case 'privacy':
            titleText = '개인정보 수집이용 동의';
            contentText = `
                <h4>1. 개인정보의 처리목적</h4>
                <p>Smart Do-it! 앱은 다음의 목적을 위하여 개인정보를 처리합니다:</p>
                <ul>
                    <li>회원가입 및 회원 식별, 인증</li>
                    <li>할 일 관리 서비스 제공</li>
                    <li>서비스 이용 통계 및 분석</li>
                    <li>고객 상담 및 불만 처리</li>
                </ul>
                
                <h4>2. 개인정보의 처리 및 보유기간</h4>
                <p>처리기간: 회원 탈퇴 시까지<br>
                보유기간: 회원 탈퇴 후 30일 (관련 법령에 의한 보존 의무가 있는 경우 해당 기간)</p>
                
                <h4>3. 처리하는 개인정보의 항목</h4>
                <p><strong>필수항목:</strong> 사용자명, 비밀번호, 이메일 주소<br>
                <strong>자동수집항목:</strong> 서비스 이용 기록, 접속 로그, 쿠키, 접속 IP 정보</p>
                
                <h4>4. 개인정보의 제3자 제공</h4>
                <p>Smart Do-it! 앱은 개인정보를 제3자에게 제공하지 않습니다.</p>
            `;
            break;
            
        case 'terms':
            titleText = '이용약관';
            contentText = `
                <h4>제1조 (목적)</h4>
                <p>이 약관은 Smart Do-it! 앱의 이용과 관련하여 회사와 이용자 간의 권리, 의무 및 책임사항을 규정함을 목적으로 합니다.</p>
                
                <h4>제2조 (정의)</h4>
                <ul>
                    <li>"서비스"란 할 일 관리 기능을 제공하는 웹/모바일 애플리케이션을 의미합니다.</li>
                    <li>"이용자"란 서비스에 접속하여 이 약관에 따라 서비스를 이용하는 회원을 의미합니다.</li>
                    <li>"회원"이란 서비스에 개인정보를 제공하여 회원등록을 한 자를 의미합니다.</li>
                </ul>
                
                <h4>제3조 (약관의 효력 및 변경)</h4>
                <p>이 약관은 서비스를 이용하고자 하는 모든 이용자에게 그 효력이 발생합니다.</p>
                
                <h4>제4조 (서비스의 제공)</h4>
                <p>회사는 다음과 같은 서비스를 제공합니다:</p>
                <ul>
                    <li>할 일 등록, 수정, 삭제 기능</li>
                    <li>할 일 우선순위 설정 기능</li>
                    <li>마감일 설정 기능</li>
                    <li>캘린더 뷰 기능</li>
                    <li>다크/라이트 테마 기능</li>
                </ul>
            `;
            break;
            
        case 'rights':
            titleText = '정보주체권리보장';
            contentText = `
                <h4>정보주체의 권리</h4>
                <p>정보주체는 다음과 같은 권리를 행사할 수 있습니다:</p>
                <ul>
                    <li><strong>개인정보 처리현황 통지 요구:</strong> 개인정보 처리 현황에 대한 통지를 요구할 수 있습니다.</li>
                    <li><strong>개인정보 열람 요구:</strong> 본인의 개인정보를 열람할 수 있습니다.</li>
                    <li><strong>개인정보 정정·삭제 요구:</strong> 개인정보의 정정, 삭제를 요구할 수 있습니다.</li>
                    <li><strong>개인정보 처리정지 요구:</strong> 개인정보 처리의 정지를 요구할 수 있습니다.</li>
                </ul>
                
                <h4>권리 행사 방법</h4>
                <p>정보주체는 개인정보보호법 시행령 제41조제1항에 따라 서면, 전화, 전자우편, 모사전송(FAX) 등을 통하여 권리를 행사할 수 있습니다.</p>
                
                <h4>개인정보 보호책임자</h4>
                <p><strong>성명:</strong> 개인정보보호책임자<br>
                <strong>연락처:</strong> privacy@smartdoit.com</p>
                
                <h4>개인정보의 안전성 확보조치</h4>
                <ul>
                    <li>개인정보 암호화</li>
                    <li>해킹 등에 대비한 기술적 대책</li>
                    <li>개인정보에 대한 접근 제한</li>
                    <li>접속기록의 보관 및 위변조 방지</li>
                </ul>
            `;
            break;
            
        case 'marketing':
            titleText = '마케팅 정보 수신 동의';
            contentText = `
                <h4>마케팅 정보 수신 동의 (선택)</h4>
                <p>선택적 동의 항목으로, 동의하지 않아도 서비스 이용이 가능합니다.</p>
                
                <h4>수집·이용 목적</h4>
                <ul>
                    <li>신규 서비스 및 이벤트 정보 안내</li>
                    <li>맞춤형 서비스 제공</li>
                    <li>서비스 개선을 위한 설문조사</li>
                    <li>고객 만족도 조사</li>
                </ul>
                
                <h4>수집·이용 항목</h4>
                <ul>
                    <li>이메일 주소</li>
                    <li>서비스 이용 기록</li>
                    <li>접속 로그</li>
                </ul>
                
                <h4>보유·이용 기간</h4>
                <p>동의 철회 시까지 또는 회원 탈퇴 시까지</p>
                
                <h4>동의 철회</h4>
                <p>언제든지 동의를 철회할 수 있으며, 동의 철회 시 마케팅 정보 수신이 중단됩니다.</p>
            `;
            break;
    }
    
    title.textContent = titleText;
    content.innerHTML = contentText;
    modal.style.display = 'block';
}

// 동의 모달 닫기 (전역 함수)
function closeConsentModal() {
    const modal = document.getElementById('consentModal');
    if (modal) {
        modal.style.display = 'none';
    }
}

// 앱 초기화
document.addEventListener('DOMContentLoaded', () => {
    const app = new SmartTodoApp();
    
    // 동의 모달 닫기 이벤트 리스너
    const closeConsentModalBtn = document.getElementById('closeConsentModal');
    if (closeConsentModalBtn) {
        closeConsentModalBtn.addEventListener('click', closeConsentModal);
    }
    
    // 모달 외부 클릭 시 닫기
    const consentModal = document.getElementById('consentModal');
    if (consentModal) {
        consentModal.addEventListener('click', (e) => {
            if (e.target === consentModal) {
                closeConsentModal();
            }
        });
    }
});