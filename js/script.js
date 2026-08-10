(function () {

    // 더미 데이터 — 추후 실제 문제로 교체 예정
    const STAGES = [
        {
            eyebrow: "STAGE 1",
            title: "기억과 지각의 방",
            sub: "여섯 개의 문 뒤에는 각기 다른 인지 오류 사례가 숨어 있습니다. 문을 열어 오류의 이름을 추리하세요.",
            caseNo: "07",
            doors: [
                {
                    tag: "CASE 01",
                    bias: "확증 편향",
                    scenario: "수사관 A는 용의자가 범인이라 확신한 뒤, 그 믿음과 들어맞는 증언만 수첩에 적고 반대되는 목격담은 '신빙성이 낮다'며 넘겨버렸다.",
                    options: ["확증 편향", "가용성 휴리스틱", "손실 회피", "앵커링 효과"],
                    correct: 0,
                    explanation: "자신의 기존 믿음과 일치하는 정보만 받아들이고, 반대되는 정보는 무시하거나 낮게 평가하는 경향입니다."
                },
                {
                    tag: "CASE 02",
                    bias: "가용성 휴리스틱",
                    scenario: "최근 뉴스에서 비행기 사고 소식을 접한 시민은 실제 통계와 달리 '비행기가 자동차보다 훨씬 위험하다'고 단정했다.",
                    options: ["도박사의 오류", "가용성 휴리스틱", "헤일로 효과", "매몰비용 오류"],
                    correct: 1,
                    explanation: "머릿속에 쉽게 떠오르는 사례(강렬하거나 최근의 정보)를 근거로 확률이나 빈도를 과대평가하는 오류입니다."
                },
                {
                    tag: "CASE 03",
                    bias: "사후 확신 편향",
                    scenario: "사건이 종결된 후 형사는 '처음부터 그가 범인이라는 걸 알고 있었다'고 말했지만, 수사 초기 기록에는 전혀 다른 용의자를 지목했었다.",
                    options: ["집단사고", "사후 확신 편향", "확증 편향", "더닝-크루거 효과"],
                    correct: 1,
                    explanation: "결과를 알고 난 뒤 마치 처음부터 그 결과를 예측했던 것처럼 기억을 재구성하는 경향입니다."
                },
                {
                    tag: "CASE 04",
                    bias: "헤일로 효과",
                    scenario: "배심원들은 피고인이 단정한 옷차림에 말투가 부드럽다는 이유만으로 '이런 사람이 범죄를 저질렀을 리 없다'고 느꼈다.",
                    options: ["헤일로 효과", "손실 회피", "앵커링 효과", "가용성 휴리스틱"],
                    correct: 0,
                    explanation: "한 가지 긍정적 특성(외모, 태도 등)이 그 사람의 다른 자질 평가에까지 긍정적으로 번지는 현상입니다."
                },
                {
                    tag: "CASE 05",
                    bias: "착각적 상관",
                    scenario: "탐정은 사건이 발생한 날마다 우연히 검은 우산을 든 사람을 목격했다는 이유로, 검은 우산과 범죄 사이에 어떤 관계가 있다고 믿기 시작했다.",
                    options: ["착각적 상관", "확증 편향", "매몰비용 오류", "집단사고"],
                    correct: 0,
                    explanation: "실제로는 관련이 없는 두 사건 사이에서 그럴듯한 인과관계나 상관관계를 지어내는 오류입니다."
                },
                {
                    tag: "CASE 06",
                    bias: "자기중심적 편향",
                    scenario: "공동 수사를 마친 두 형사는 각자 '내가 사건 해결에 가장 결정적인 역할을 했다'고 회상하며 서로 다른 이야기를 했다.",
                    options: ["자기중심적 편향", "도박사의 오류", "앵커링 효과", "헤일로 효과"],
                    correct: 0,
                    explanation: "공동의 결과에 대해 자신의 기여도를 실제보다 크게 평가하고 기억하는 경향입니다."
                }
            ]
        }
    ];

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
            modalFeedback.textContent = `정답입니다. ${door.explanation}`;
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

    document.getElementById('backToRoomBtn').addEventListener('click', () => {
        document.getElementById('psychScreen').style.display = 'none';
        document.querySelector('.stage-wrap:not(.psych-screen)').style.display = '';
        loadStage(0);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    loadStage(0);

})();