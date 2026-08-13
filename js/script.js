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
                    options: ["o", "가용성 휴리스틱", "손실 회피", "앵커링 효과"],
                    correct: 0,
                    explanation: "자신의 기존 믿음과 일치하는 정보만 받아들이고, 반대되는 정보는 무시하거나 낮게 평가하는 경향입니다."
                },
                {
                    tag: "CASE 02",
                    bias: "가용성 휴리스틱",
                    scenario: "최근 뉴스에서 비행기 사고 소식을 접한 시민은 실제 통계와 달리 '비행기가 자동차보다 훨씬 위험하다'고 단정했다.",
                    options: ["도박사의 오류", "o", "헤일로 효과", "매몰비용 오류"],
                    correct: 1,
                    explanation: "머릿속에 쉽게 떠오르는 사례(강렬하거나 최근의 정보)를 근거로 확률이나 빈도를 과대평가하는 오류입니다."
                },
                {
                    tag: "CASE 03",
                    bias: "사후 확신 편향",
                    scenario: "사건이 종결된 후 형사는 '처음부터 그가 범인이라는 걸 알고 있었다'고 말했지만, 수사 초기 기록에는 전혀 다른 용의자를 지목했었다.",
                    options: ["집단사고", "o", "확증 편향", "더닝-크루거 효과"],
                    correct: 1,
                    explanation: "결과를 알고 난 뒤 마치 처음부터 그 결과를 예측했던 것처럼 기억을 재구성하는 경향입니다."
                },
                {
                    tag: "CASE 04",
                    bias: "헤일로 효과",
                    scenario: "배심원들은 피고인이 단정한 옷차림에 말투가 부드럽다는 이유만으로 '이런 사람이 범죄를 저질렀을 리 없다'고 느꼈다.",
                    options: ["o", "손실 회피", "앵커링 효과", "가용성 휴리스틱"],
                    correct: 0,
                    explanation: "한 가지 긍정적 특성(외모, 태도 등)이 그 사람의 다른 자질 평가에까지 긍정적으로 번지는 현상입니다."
                },
                {
                    tag: "CASE 05",
                    bias: "착각적 상관",
                    scenario: "탐정은 사건이 발생한 날마다 우연히 검은 우산을 든 사람을 목격했다는 이유로, 검은 우산과 범죄 사이에 어떤 관계가 있다고 믿기 시작했다.",
                    options: ["o", "확증 편향", "매몰비용 오류", "집단사고"],
                    correct: 0,
                    explanation: "실제로는 관련이 없는 두 사건 사이에서 그럴듯한 인과관계나 상관관계를 지어내는 오류입니다."
                },
                {
                    tag: "CASE 06",
                    bias: "자기중심적 편향",
                    scenario: "공동 수사를 마친 두 형사는 각자 '내가 사건 해결에 가장 결정적인 역할을 했다'고 회상하며 서로 다른 이야기를 했다.",
                    options: ["o", "도박사의 오류", "앵커링 효과", "헤일로 효과"],
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

    const PSYCH_QUESTIONS = [
        {
            q: "친구들과 대화하는 단체 대화방에서 대화가 끊겼을 때 나는?",
            options: [
                { text: "다들 내 메시지를 보고 속으로 ‘얘 또 말도 안 되는 소리 하네’라며 일부러 무시하는 게 틀림없어.", type: "임의적 추론" },
                { text: "내가 대화 흐름을 망쳤나보다... 이제 친구들이 나와는 다시는 대화하고 싶어 하지 않을 거야.", type: "파국화" }
            ]
        }
    ];

    // 결과 7종 (더미 설명 — 추후 실제 문구로 교체 예정)
    const RESULT_TYPES = {
        "임의적 추론": {
            title: "임의적 추론형",
            desc: "충분한 근거 없이 성급하게 결론으로 건너뛰는 경향이 있습니다. 명확한 증거가 없어도 최악의 가능성을 사실처럼 받아들이곤 해요."
        },
        "선택적 추상화": {
            title: "선택적 추상화형",
            desc: "전체 상황 중 부정적인 한 부분에만 집중해 전체를 판단하는 경향이 있습니다. 좋았던 부분은 쉽게 잊혀지곤 해요."
        },
        "과잉 일반화": {
            title: "과잉 일반화형",
            desc: "한두 번의 경험을 근거로 모든 상황에 똑같은 결론을 적용하는 경향이 있습니다. '항상', '역시'라는 말이 자주 떠오르곤 해요."
        },
        "파국화": {
            title: "파국화형",
            desc: "작은 문제를 실제보다 훨씬 크고 심각한 일로 확대해서 받아들이는 경향이 있습니다. 최악의 시나리오부터 떠오르곤 해요."
        },
        "개인화": {
            title: "개인화형",
            desc: "자신과 직접 관련 없는 일까지 스스로의 탓으로 돌리는 경향이 있습니다. 문제의 원인을 나에게서부터 찾곤 해요."
        },
        "흑백논리": {
            title: "흑백논리형",
            desc: "중간 없이 모든 것을 극단적인 두 가지로만 나눠서 보는 경향이 있습니다. '완벽하거나 실패하거나' 둘 중 하나로 느껴지곤 해요."
        },
        "건강한 사고": {
            title: "건강한 사고형",
            desc: "상황을 있는 그대로 균형 있게 받아들이는 편입니다. 과도한 걱정이나 왜곡 없이 유연하게 생각하는 힘을 갖고 있어요."
        }
    };

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
        psychAnswers.forEach((t) => { tally[t] = (tally[t] || 0) + 1; });

        let bestType = psychAnswers[0];
        let bestCount = 0;
        Object.keys(tally).forEach((t) => {
            if (tally[t] > bestCount) {
                bestCount = tally[t];
                bestType = t;
            }
        });

        const result = RESULT_TYPES[bestType];
        psychResultTitleEl.textContent = result.title;
        psychResultDescEl.textContent = result.desc;

        sendResultToSheet(bestType);

        psychQuizEl.style.display = 'none';
        psychResultEl.style.display = 'block';
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