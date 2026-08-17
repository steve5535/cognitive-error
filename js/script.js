(function () {

    let stageIndex = 0;
    let status = [];
    let activeDoorIndex = null;

    const roomEl = document.getElementById('room');
    const stageEyebrow = document.getElementById('stageEyebrow');
    const stageTitle = document.getElementById('stageTitle');
    const stageSub = document.getElementById('stageSub');
    const solvedCountEl = document.getElementById('solvedCount');
    const progressDots = document.getElementById('progressDots');

    const questionOverlay = document.getElementById('questionOverlay');
    const modalPanel = document.getElementById('modalPanel');
    const modalLamp = document.getElementById('modalLamp');
    const modalCaseLabel = document.getElementById('modalCaseLabel');
    const modalBiasPlaceholder = document.getElementById('modalBiasPlaceholder');
    const modalScenario = document.getElementById('modalScenario');
    const modalOptions = document.getElementById('modalOptions');
    const modalFeedback = document.getElementById('modalFeedback');

    const confirmOverlay = document.getElementById('confirmOverlay');

    function loadStage(idx) {
        stageIndex = idx;
        const stage = STAGES[stageIndex];
        status = new Array(stage.doors.length).fill('unsolved');

        stageEyebrow.textContent = stage.eyebrow;
        stageTitle.textContent = stage.title;
        stageSub.textContent = stage.sub;
        roomEl.setAttribute('data-case', stage.caseNo);

        roomEl.innerHTML = '';
        progressDots.innerHTML = '';

        stage.doors.forEach((door, i) => {
            const slot = document.createElement('div');
            slot.className = `door-slot pos-${i}`;

            const lamp = document.createElement('div');
            lamp.className = 'lamp';
            lamp.id = `lamp-${i}`;

            const doorBtn = document.createElement('button');
            doorBtn.className = 'door';
            doorBtn.id = `door-${i}`;
            doorBtn.setAttribute('aria-label', `${door.tag} 문 열기`);
            doorBtn.innerHTML = `
        <span class="door-well"></span>
        <span class="leaf left"></span>
        <span class="leaf right"></span>
      `;
            doorBtn.addEventListener('click', () => openDoor(i));

            slot.appendChild(lamp);
            slot.appendChild(doorBtn);
            roomEl.appendChild(slot);

            const dot = document.createElement('span');
            dot.id = `dot-${i}`;
            progressDots.appendChild(dot);
        });

        renderProgress();
    }

    function renderProgress() {
        const stage = STAGES[stageIndex];
        let solved = 0;
        status.forEach((s, i) => {
            const lampEl = document.getElementById(`lamp-${i}`);
            const doorEl = document.getElementById(`door-${i}`);
            const dotEl = document.getElementById(`dot-${i}`);
            lampEl.classList.remove('correct', 'wrong');
            doorEl.classList.remove('is-correct', 'is-wrong');
            dotEl.classList.remove('on');
            if (s === 'correct') {
                lampEl.classList.add('correct');
                doorEl.classList.add('is-correct');
                dotEl.classList.add('on');
                solved++;
            } else if (s === 'wrong') {
                lampEl.classList.add('wrong');
                doorEl.classList.add('is-wrong');
            }
        });
        solvedCountEl.textContent = solved;

        const goNextWrap = document.getElementById('goNextWrap');
        if (goNextWrap) {
            goNextWrap.style.display = (solved === stage.doors.length) ? 'flex' : 'none';
        }

        return solved;
    }

    function openDoor(i) {
        activeDoorIndex = i;
        const stage = STAGES[stageIndex];
        const door = stage.doors[i];

        const doorEl = document.getElementById(`door-${i}`);
        doorEl.classList.add('open');

        modalCaseLabel.textContent = door.tag;
        modalLamp.className = 'mini-lamp' + (status[i] === 'correct' ? ' correct' : status[i] === 'wrong' ? ' wrong' : '');
        modalBiasPlaceholder.textContent = status[i] === 'correct' ? door.bias : '이 문 뒤에는 어떤 인지 오류가 숨어 있을까요?';
        modalScenario.textContent = door.scenario;

        renderOptions(i);

        setTimeout(() => {
            questionOverlay.classList.add('show');
        }, 260);
    }

    function renderOptions(doorIdx) {
        const stage = STAGES[stageIndex];
        const door = stage.doors[doorIdx];

        modalFeedback.className = 'feedback';
        modalFeedback.innerHTML = '';

        modalOptions.innerHTML = '';
        door.options.forEach((opt, oi) => {
            const li = document.createElement('li');
            const btn = document.createElement('button');
            btn.className = 'option-btn';
            btn.innerHTML = `<span class="idx">${oi + 1}</span><span>${opt}</span>`;
            btn.addEventListener('click', () => selectOption(doorIdx, oi));

            if (status[doorIdx] === 'correct') {
                btn.disabled = true;
                if (oi === door.correct) { btn.classList.add('correct-pick'); }
            }

            li.appendChild(btn);
            modalOptions.appendChild(li);
        });
    }

    function selectOption(doorIdx, optionIdx) {
        const stage = STAGES[stageIndex];
        const door = stage.doors[doorIdx];
        const buttons = modalOptions.querySelectorAll('.option-btn');
        const isCorrect = optionIdx === door.correct;

        buttons.forEach((b) => b.disabled = true);
        const chosenBtn = buttons[optionIdx];

        if (isCorrect) {
            chosenBtn.classList.add('correct-pick');
            status[doorIdx] = 'correct';
            modalLamp.className = 'mini-lamp correct';
            modalBiasPlaceholder.textContent = door.bias;
            modalFeedback.className = 'feedback ok show';
            modalFeedback.textContent = `정답입니다.`;
        } else {
            chosenBtn.classList.add('wrong-pick');
            status[doorIdx] = 'wrong';
            modalLamp.className = 'mini-lamp wrong';

            modalFeedback.className = 'feedback bad show';
            modalFeedback.innerHTML = '';
            const msg = document.createElement('p');
            msg.className = 'feedback-text';
            msg.textContent = '틀렸습니다.';
            const retryBtn = document.createElement('button');
            retryBtn.className = 'btn ghost retry-btn';
            retryBtn.textContent = '다시 풀기';
            retryBtn.addEventListener('click', () => renderOptions(doorIdx));
            modalFeedback.appendChild(msg);
            modalFeedback.appendChild(retryBtn);
        }

        renderProgress();
    }

    function closeModal() {
        questionOverlay.classList.remove('show');
        if (activeDoorIndex !== null) {
            const doorEl = document.getElementById(`door-${activeDoorIndex}`);
            if (doorEl) doorEl.classList.remove('open');
        }
        activeDoorIndex = null;
        const solved = renderProgress();
        if (solved === STAGES[stageIndex].doors.length) {
            setTimeout(() => confirmOverlay.classList.add('show'), 350);
        }
    }

    document.getElementById('closeModalBtn').addEventListener('click', closeModal);
    document.getElementById('closeModalBtn2').addEventListener('click', closeModal);
    questionOverlay.addEventListener('click', (e) => {
        if (e.target === questionOverlay) closeModal();
    });
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && questionOverlay.classList.contains('show')) closeModal();
    });

    function goToNextPage() {
        confirmOverlay.classList.remove('show');
        document.querySelector('.stage-wrap:not(.psych-screen)').style.display = 'none';
        document.getElementById('psychScreen').style.display = 'flex';
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    document.getElementById('stayBtn').addEventListener('click', () => {
        confirmOverlay.classList.remove('show');
    });

    document.getElementById('nextStageBtn').addEventListener('click', goToNextPage);
    document.getElementById('goNextBtn').addEventListener('click', goToNextPage);

    let psychIndex = 0;
    let psychAnswers = [];

    const RESULT_SHEET_URL = 'https://script.google.com/macros/s/AKfycbydjpmMyRdIfwVZwcYr0CroEyU2la-I4RzdXEDoURKMipnpCbZfJk9kDhcUGyjmiyQ7/exec';

    function sendResultToSheet(resultKey) {
        if (!RESULT_SHEET_URL) return;
        fetch(RESULT_SHEET_URL, {
            method: 'POST',
            mode: 'no-cors',
            headers: { 'Content-Type': 'text/plain;charset=utf-8' },
            body: JSON.stringify({
                resultType: resultKey
            })
        }).catch((err) => {
            console.warn('결과 저장 전송 실패(네트워크/URL 확인 필요):', err);
        });
    }

    const psychIntroEl = document.getElementById('psychIntro');
    const psychQuizEl = document.getElementById('psychQuiz');
    const psychResultEl = document.getElementById('psychResultView');
    const psychQNumEl = document.getElementById('psychQNum');
    const psychQuestionTextEl = document.getElementById('psychQuestionText');
    const psychOptionsEl = document.getElementById('psychOptions');
    const psychResultTitleEl = document.getElementById('psychResultTitle');
    const psychResultDescEl = document.getElementById('psychResultDesc');
    const psychResultImageEl = document.getElementById('psychResultImage');
    const psychCognitiveErrorEl = document.getElementById('psychCognitiveError');
    const psychWertherEl = document.getElementById('psychWerther');
    const psychTipEl = document.getElementById('psychTip');

    function resetPsychViews() {
        psychIntroEl.style.display = '';
        psychQuizEl.style.display = 'none';
        psychResultEl.style.display = 'none';
    }

    function startPsychTest() {
        if (PSYCH_QUESTIONS.length === 0) {
            alert('아직 등록된 문항이 없습니다. script.js의 PSYCH_QUESTIONS에 문항을 추가해주세요.');
            return;
        }

        psychIndex = 0;
        psychAnswers = [];
        psychIntroEl.style.display = 'none';
        psychResultEl.style.display = 'none';
        psychQuizEl.style.display = 'block';
        renderPsychQuestion();
    }

    function renderPsychQuestion() {
        const q = PSYCH_QUESTIONS[psychIndex];
        psychQNumEl.textContent = psychIndex + 1;
        psychQuestionTextEl.textContent = q.q;

        psychOptionsEl.innerHTML = '';
        q.options.forEach((opt, oi) => {
            const li = document.createElement('li');
            const btn = document.createElement('button');
            btn.className = 'option-btn';
            btn.innerHTML = `<span class="idx">${oi + 1}</span><span>${opt.text}</span>`;
            btn.addEventListener('click', () => selectPsychOption(opt.type));
            li.appendChild(btn);
            psychOptionsEl.appendChild(li);
        });
    }

    function selectPsychOption(type) {
        psychAnswers.push(type);
        if (psychIndex + 1 < PSYCH_QUESTIONS.length) {
            psychIndex++;
            renderPsychQuestion();
        } else {
            showPsychResult();
        }
    }

    function showPsychResult() {
        const tally = {};

        psychAnswers.forEach((type) => {
            tally[type] = (tally[type] || 0) + 1;
        });

        const priority = [
            "선택적 추상화",
            "과잉 일반화",
            "개인화",
            "흑백논리",
            "임의적 추론",
            "파국화"
        ];

        let bestCount = Math.max(...Object.values(tally));

        const tiedTypes = Object.keys(tally).filter((type) => {
            return tally[type] === bestCount;
        });

        let bestType;

        if (tiedTypes.length === 1) {
            bestType = tiedTypes[0];
        }

        else {
            bestType = priority.find((type) => tiedTypes.includes(type));

            if (!bestType) {
                bestType = "건강한 사고";
            }
        }

        const result =
            RESULT_TYPES[bestType] ||
            RESULT_TYPES["건강한 사고"];

        psychResultTitleEl.textContent = result.title;

        psychResultImageEl.src = result.image;
        psychResultImageEl.alt = result.title;
        psychResultImageEl.style.display = "block";

        psychCognitiveErrorEl.textContent = result.cognitiveError;
        psychWertherEl.textContent = result.werther;
        psychTipEl.textContent = result.tip;

        sendResultToSheet(bestType);

        psychQuizEl.style.display = "none";
        psychResultEl.style.display = "block";
    }

    document.getElementById('startPsychBtn').addEventListener('click', startPsychTest);
    document.getElementById('retakePsychBtn').addEventListener('click', startPsychTest);

    document.querySelectorAll('.back-to-room-btn').forEach((btn) => {
        btn.addEventListener('click', () => {
            document.getElementById('psychScreen').style.display = 'none';
            document.querySelector('.stage-wrap:not(.psych-screen)').style.display = '';
            resetPsychViews();
            loadStage(0);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    });

    loadStage(0);
})();