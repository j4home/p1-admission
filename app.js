(function () {
  const siteConfig = window.__SITE_CONFIG__ || {};
  const schoolData = window.__SCHOOL_DATA__;
  const research = window.__PROJECT_RESEARCH__;

  const ROUTE_LABELS = {
    dss: "直資小學",
    private: "私立小學",
    pis: "私立獨立學校",
    international: "國際學校（小學）",
    esf: "英基小學",
    other: "其他"
  };

  const CURRICULUM_LABELS = {
    non_local: "非本地課程",
    pis_verify: "私立獨立/需逐校核實",
    local_or_school_based_verify: "本地或校本/需逐校核實",
    verify: "需逐校核實"
  };

  const TAG_LABELS = {
    dss: "直資",
    private: "私立",
    pis: "私立獨立學校",
    international: "國際學校",
    esf: "英基",
    non_local: "非本地課程",
    boys: "男校",
    girls: "女校",
    coed: "男女校",
    whole_day: "全日",
    am: "上午",
    pm: "下午"
  };

  if (!schoolData || !research) {
    document.body.innerHTML = "<p>資料未載入。</p>";
    return;
  }

  const schools = schoolData.schools.slice();
  const compareSet = new Set();
  let currentPreset = "core";

  const els = {
    total: document.getElementById("stat-total"),
    panelNote: document.getElementById("panel-note"),
    summaryChips: document.getElementById("summary-chips"),
    routeCards: document.getElementById("route-cards"),
    priorityLists: document.getElementById("priority-lists"),
    shortlistGrid: document.getElementById("shortlist-grid"),
    extendedShortlistGrid: document.getElementById("extended-shortlist-grid"),
    agendaGrid: document.getElementById("agenda-grid"),
    workPlanGrid: document.getElementById("workplan-grid"),
    latestIntelGrid: document.getElementById("latest-intel-grid"),
    admissionsGrid: document.getElementById("admissions-grid"),
    shortlistMatrixGrid: document.getElementById("shortlist-matrix-grid"),
    phaseThreeGrid: document.getElementById("phase-three-grid"),
    phaseFourGrid: document.getElementById("phase-four-grid"),
    phaseFiveGrid: document.getElementById("phase-five-grid"),
    phaseSixGrid: document.getElementById("phase-six-grid"),
    childScenariosGrid: document.getElementById("child-scenarios-grid"),
    openDayGrid: document.getElementById("open-day-grid"),
    childProfileGrid: document.getElementById("child-profile-grid"),
    portfolioGrid: document.getElementById("portfolio-grid"),
    interviewLensGrid: document.getElementById("interview-lens-grid"),
    coreInterviewGrid: document.getElementById("core-interview-grid"),
    weeklyPracticeGrid: document.getElementById("weekly-practice-grid"),
    homePracticeGrid: document.getElementById("home-practice-grid"),
    studentInterviewQaGrid: document.getElementById("student-interview-qa-grid"),
    countdownGrid: document.getElementById("countdown-grid"),
    interviewDayGrid: document.getElementById("interview-day-grid"),
    parentInterviewGrid: document.getElementById("parent-interview-grid"),
    parentFaqGrid: document.getElementById("parent-faq-grid"),
    parentMockQaGrid: document.getElementById("parent-mock-qa-grid"),
    strategyAxes: document.getElementById("strategy-axes"),
    findingsList: document.getElementById("findings-list"),
    timelineList: document.getElementById("timeline-list"),
    sourceList: document.getElementById("source-list"),
    externalList: document.getElementById("external-list"),
    focusProfiles: document.getElementById("focus-profiles"),
    schoolTbody: document.getElementById("school-tbody"),
    compareGrid: document.getElementById("compare-grid"),
    compareTags: document.getElementById("compare-tags"),
    compareCount: document.getElementById("compare-count"),
    searchInput: document.getElementById("search-input"),
    routeFilter: document.getElementById("route-filter"),
    districtFilter: document.getElementById("district-filter"),
    curriculumFilter: document.getElementById("curriculum-filter"),
    distanceFilter: document.getElementById("distance-filter"),
    sortFilter: document.getElementById("sort-filter"),
    presetButtons: [...document.querySelectorAll(".preset-btn")]
  };

  function visibleRouteSet() {
    switch (currentPreset) {
      case "intl":
        return new Set(["international", "esf"]);
      case "all":
        return new Set(["dss", "private", "pis", "international", "esf"]);
      case "core":
      default:
        return new Set(["dss", "private", "pis"]);
    }
  }

  function uniqueValues(key) {
    return [...new Set(schools.map((item) => item[key]).filter(Boolean))].sort((a, b) =>
      String(a).localeCompare(String(b), "zh-Hant")
    );
  }

  function optionify(select, values) {
    values.forEach((value) => {
      const option = document.createElement("option");
      option.value = value;
      option.textContent = value;
      select.appendChild(option);
    });
  }

  function routeSummary() {
    return [
      ["dss", schoolData.summary.countsByRoute.dss],
      ["private", schoolData.summary.countsByRoute.private],
      ["pis", schoolData.summary.countsByRoute.pis],
      ["international", schoolData.summary.countsByRoute.international],
      ["esf", schoolData.summary.countsByRoute.esf]
    ];
  }

  function renderTop() {
    els.total.textContent = schoolData.summary.total;
    els.panelNote.textContent =
      `資料底座來自教育局學校位置資料集（更新至 ${schools[0]?.source?.datasetUpdated || "N/A"}），目前距離基準已改為窩打老道 8 號。`;

    routeSummary().forEach(([label, count]) => {
      const chip = document.createElement("span");
      chip.className = "chip";
      chip.textContent = `${ROUTE_LABELS[label]} ${count}`;
      els.summaryChips.appendChild(chip);
    });
  }

  function renderPriorityLists() {
    const routeSet = visibleRouteSet();
    const prioritized = schools.filter((item) => routeSet.has(item.routeGroup));
    const groups = routeSummary().filter(([label]) => routeSet.has(label));

    els.priorityLists.innerHTML = "";

    groups.forEach(([routeKey]) => {
      const items = prioritized
        .filter((item) => item.routeGroup === routeKey)
        .sort((a, b) => {
          const da = typeof a.distanceFromYauMaTeiKm === "number" ? a.distanceFromYauMaTeiKm : Number.POSITIVE_INFINITY;
          const db = typeof b.distanceFromYauMaTeiKm === "number" ? b.distanceFromYauMaTeiKm : Number.POSITIVE_INFINITY;
          return da - db;
        });

      const card = document.createElement("article");
      card.className = "priority-card";
      card.innerHTML = `
        <p class="section-kicker">${ROUTE_LABELS[routeKey]}</p>
        <h3>${items.length} 間</h3>
        <div class="priority-list">
          ${items.map((item) => `
            <div class="priority-item">
              <strong>${item.chineseName}</strong>
              <small>${item.englishName}</small>
              <small>${item.districtZh} · ${distanceLabel(item)}</small>
            </div>
          `).join("")}
        </div>
      `;
      els.priorityLists.appendChild(card);
    });
  }

  function renderShortlist() {
    if (!els.shortlistGrid || !research.phaseOneShortlist) return;
    els.shortlistGrid.innerHTML = "";

    research.phaseOneShortlist.forEach((item) => {
      const card = document.createElement("article");
      card.className = "shortlist-card";
      card.innerHTML = `
        <p class="section-kicker">${item.bucket}</p>
        <h3>${item.schoolName}</h3>
        <p><strong>路線：</strong>${item.routeType}</p>
        <div class="shortlist-meta">
          <div><strong>入選原因：</strong><p>${item.whyShortlisted}</p></div>
          <div><strong>英語訊號：</strong><p>${item.englishSignal}</p></div>
          <div><strong>較適合：</strong><p>${item.fit}</p></div>
          <div><strong>要留意：</strong><p>${item.watchout}</p></div>
        </div>
      `;
      els.shortlistGrid.appendChild(card);
    });
  }

  function renderExtendedShortlist() {
    if (!els.extendedShortlistGrid || !research.extendedShortlist) return;
    els.extendedShortlistGrid.innerHTML = "";

    research.extendedShortlist.forEach((item) => {
      const card = document.createElement("article");
      card.className = "shortlist-card";
      card.innerHTML = `
        <p class="section-kicker">${item.bucket}</p>
        <h3>${item.schoolName}</h3>
        <p><strong>路線：</strong>${item.routeType}</p>
        <div class="shortlist-meta">
          <div><strong>入選原因：</strong><p>${item.whyShortlisted}</p></div>
          <div><strong>較適合：</strong><p>${item.fit}</p></div>
          <div><strong>要留意：</strong><p>${item.watchout}</p></div>
        </div>
      `;
      els.extendedShortlistGrid.appendChild(card);
    });
  }

  function renderAgenda() {
    if (!els.agendaGrid || !research.researchAgenda) return;
    els.agendaGrid.innerHTML = "";

    research.researchAgenda.forEach((item) => {
      const card = document.createElement("article");
      card.className = "agenda-card";
      card.innerHTML = `
        <h3>${item.title}</h3>
        <p>${item.detail}</p>
      `;
      els.agendaGrid.appendChild(card);
    });
  }

  function renderWorkPlan() {
    if (!els.workPlanGrid || !research.workPlan) return;
    els.workPlanGrid.innerHTML = "";

    research.workPlan.forEach((item) => {
      const card = document.createElement("article");
      card.className = "agenda-card";
      card.innerHTML = `
        <p class="section-kicker">${item.phase}</p>
        <h3>${item.title}</h3>
        <p>${item.detail}</p>
      `;
      els.workPlanGrid.appendChild(card);
    });
  }

  function renderLatestIntel() {
    if (!els.latestIntelGrid || !research.latestVerifiedIntel) return;
    els.latestIntelGrid.innerHTML = "";

    research.latestVerifiedIntel.forEach((item) => {
      const card = document.createElement("article");
      card.className = "agenda-card";
      card.innerHTML = `
        <p class="section-kicker">${item.status}</p>
        <h3>${item.schoolName}</h3>
        <p>${item.detail}</p>
        <p class="source-footnote"><small><a href="${item.sourceUrl}" target="_blank" rel="noreferrer">${item.sourceLabel}</a></small></p>
      `;
      els.latestIntelGrid.appendChild(card);
    });
  }

  function renderAdmissionsTracker() {
    if (!els.admissionsGrid || !research.admissionsTracker) return;
    els.admissionsGrid.innerHTML = "";

    research.admissionsTracker.forEach((item) => {
      const card = document.createElement("article");
      card.className = "timeline-card";
      card.innerHTML = `
        <div class="timeline-dot"></div>
        <div class="card-headline">
          <p class="section-kicker">${item.scope}</p>
          <span class="status-pill ${item.statusClass || "status-neutral"}">${item.statusLabel}</span>
        </div>
        <h3>${item.date}</h3>
        <p><strong>${item.title}</strong></p>
        <p>${item.detail}</p>
        <p class="source-footnote"><small>最後核實：${item.lastVerified}</small></p>
        <p class="source-footnote"><small><a href="${item.sourceUrl}" target="_blank" rel="noreferrer">${item.sourceLabel}</a></small></p>
      `;
      els.admissionsGrid.appendChild(card);
    });
  }

  function renderShortlistMatrix() {
    if (!els.shortlistMatrixGrid || !research.shortlistDecisionMatrix) return;
    els.shortlistMatrixGrid.innerHTML = "";
    research.shortlistDecisionMatrix.forEach((item) => {
      const card = document.createElement("article");
      card.className = "agenda-card";
      card.innerHTML = `
        <p class="section-kicker">${item.tier}</p>
        <h3>${item.schoolName}</h3>
        <p><strong>現階段決定：</strong>${item.decision}</p>
        <p><strong>原因：</strong>${item.why}</p>
        <p><strong>要留意：</strong>${item.watchout}</p>
      `;
      els.shortlistMatrixGrid.appendChild(card);
    });
  }

  function renderPhaseThreeComparison() {
    if (!els.phaseThreeGrid || !research.phaseThreeComparison) return;
    els.phaseThreeGrid.innerHTML = "";

    research.phaseThreeComparison.forEach((item) => {
      const card = document.createElement("article");
      card.className = "agenda-card";
      card.innerHTML = `
        <p class="section-kicker">${item.routeType}</p>
        <h3>${item.schoolName}</h3>
        <div class="phase-three-meta">
          <p><strong>成績訊號：</strong>${item.academicSignal}</p>
          <p><strong>申請成熟度：</strong>${item.admissionsReadiness}</p>
          <p><strong>成本壓力：</strong>${item.costPressure}</p>
          <p><strong>家長文化風險：</strong>${item.parentCultureRisk}</p>
        </div>
        <p><strong>這間最代表甚麼：</strong>${item.identity}</p>
        <p><strong>現階段最值得追甚麼：</strong>${item.nextFocus}</p>
      `;
      els.phaseThreeGrid.appendChild(card);
    });
  }

  function renderPhaseFourComparison() {
    if (!els.phaseFourGrid || !research.phaseFourComparison) return;
    els.phaseFourGrid.innerHTML = "";

    research.phaseFourComparison.forEach((item) => {
      const card = document.createElement("article");
      card.className = "agenda-card";
      card.innerHTML = `
        <p class="section-kicker">${item.routeType}</p>
        <h3>${item.schoolName}</h3>
        <div class="phase-three-meta">
          <p><strong>面試感覺：</strong>${item.interviewFeel}</p>
          <p><strong>家長投入文化：</strong>${item.parentInvolvement}</p>
          <p><strong>交通/校車：</strong>${item.transportFeel}</p>
        </div>
        <p><strong>最要小心：</strong>${item.caution}</p>
      `;
      els.phaseFourGrid.appendChild(card);
    });
  }

  function renderPhaseFiveComparison() {
    if (!els.phaseFiveGrid || !research.phaseFiveComparison) return;
    els.phaseFiveGrid.innerHTML = "";

    research.phaseFiveComparison.forEach((item) => {
      const card = document.createElement("article");
      card.className = "agenda-card";
      card.innerHTML = `
        <p class="section-kicker">${item.routeType}</p>
        <h3>${item.schoolName}</h3>
        <div class="phase-three-meta">
          <p><strong>學生準備：</strong>${item.studentPrep}</p>
          <p><strong>家長準備：</strong>${item.parentPrep}</p>
          <p><strong>watchlist：</strong>${item.watchlist}</p>
        </div>
      `;
      els.phaseFiveGrid.appendChild(card);
    });
  }

  function renderPhaseSixComparison() {
    if (!els.phaseSixGrid || !research.phaseSixComparison) return;
    els.phaseSixGrid.innerHTML = "";

    research.phaseSixComparison.forEach((item) => {
      const card = document.createElement("article");
      card.className = "agenda-card";
      card.innerHTML = `
        <p class="section-kicker">${item.routeType}</p>
        <h3>${item.schoolName}</h3>
        <div class="phase-three-meta">
          <p><strong>暫定匹配度：</strong>${item.provisionalFit}</p>
          <p><strong>現階段優勢：</strong>${item.strengths}</p>
          <p><strong>目前保留：</strong>${item.reservations}</p>
        </div>
        <p><strong>現階段角色：</strong>${item.currentRole}</p>
      `;
      els.phaseSixGrid.appendChild(card);
    });
  }

  function renderChildScenarios() {
    if (!els.childScenariosGrid || !research.childScenarioComparison) return;
    els.childScenariosGrid.innerHTML = "";
    research.childScenarioComparison.forEach((item) => {
      const card = document.createElement("article");
      card.className = "agenda-card";
      card.innerHTML = `
        <h3>${item.scenario}</h3>
        <p><strong>較可能合適：</strong>${item.likelyFit}</p>
        <p><strong>原因：</strong>${item.why}</p>
        <p><strong>提醒：</strong>${item.caution}</p>
      `;
      els.childScenariosGrid.appendChild(card);
    });
  }

  function renderOpenDayChecklist() {
    if (!els.openDayGrid || !research.openDayChecklist) return;
    els.openDayGrid.innerHTML = "";
    research.openDayChecklist.forEach((item) => {
      const card = document.createElement("article");
      card.className = "agenda-card";
      card.innerHTML = `
        <h3>${item.title}</h3>
        <p>${item.detail}</p>
      `;
      els.openDayGrid.appendChild(card);
    });
  }

  function renderPortfolioChecklist() {
    if (!els.portfolioGrid || !research.portfolioPrepChecklist) return;
    els.portfolioGrid.innerHTML = "";
    research.portfolioPrepChecklist.forEach((item) => {
      const card = document.createElement("article");
      card.className = "agenda-card";
      card.innerHTML = `
        <h3>${item.title}</h3>
        <p>${item.detail}</p>
      `;
      els.portfolioGrid.appendChild(card);
    });
  }

  function renderInterviewLens() {
    if (!els.interviewLensGrid || !research.interviewSkillLens) return;
    els.interviewLensGrid.innerHTML = "";
    research.interviewSkillLens.forEach((item) => {
      const card = document.createElement("article");
      card.className = "agenda-card";
      card.innerHTML = `
        <h3>${item.title}</h3>
        <p>${item.detail}</p>
      `;
      els.interviewLensGrid.appendChild(card);
    });
  }

  function renderCoreInterviewPlan() {
    if (!els.coreInterviewGrid || !research.coreInterviewPlan) return;
    els.coreInterviewGrid.innerHTML = "";
    research.coreInterviewPlan.forEach((item) => {
      const card = document.createElement("article");
      card.className = "agenda-card";
      card.innerHTML = `
        <p class="section-kicker">${item.routeType}</p>
        <h3>${item.schoolName}</h3>
        <div class="phase-three-meta">
          <p><strong>學生要練：</strong>${item.studentFocus}</p>
          <p><strong>家長要講：</strong>${item.parentFocus}</p>
          <p><strong>女兒優勢：</strong>${item.daughterAdvantage}</p>
          <p><strong>補強位：</strong>${item.strengthen}</p>
        </div>
        <p><strong>一句帶走：</strong>${item.takeAway}</p>
      `;
      els.coreInterviewGrid.appendChild(card);
    });
  }

  function renderWeeklyPracticePlan() {
    if (!els.weeklyPracticeGrid || !research.weeklyPracticePlan) return;
    els.weeklyPracticeGrid.innerHTML = "";
    research.weeklyPracticePlan.forEach((item) => {
      const card = document.createElement("article");
      card.className = "agenda-card";
      card.innerHTML = `
        <p class="section-kicker">${item.schoolName} · ${item.week}</p>
        <h3>${item.focus}</h3>
        <p><strong>家長怎樣陪：</strong>${item.parentRole}</p>
        <p><strong>進步訊號：</strong>${item.progressSignal}</p>
      `;
      els.weeklyPracticeGrid.appendChild(card);
    });
  }

  function renderHomePracticeActivities() {
    if (!els.homePracticeGrid || !research.homePracticeActivities) return;
    els.homePracticeGrid.innerHTML = "";
    research.homePracticeActivities.forEach((item) => {
      const card = document.createElement("article");
      card.className = "agenda-card";
      card.innerHTML = `
        <p class="section-kicker">${item.schoolGroup}</p>
        <h3>${item.title}</h3>
        <p><strong>做法：</strong>${item.detail}</p>
        <p><strong>目標：</strong>${item.goal}</p>
      `;
      els.homePracticeGrid.appendChild(card);
    });
  }

  function renderStudentInterviewQa() {
    if (!els.studentInterviewQaGrid || !research.studentInterviewQa) return;
    els.studentInterviewQaGrid.innerHTML = "";

    research.studentInterviewQa.forEach((item) => {
      const card = document.createElement("article");
      card.className = "agenda-card";
      card.innerHTML = `
        <p class="section-kicker">${item.schoolName} · ${item.questionType}</p>
        <h3>${item.samplePrompt}</h3>
        <p><strong>答題方向：</strong>${item.answerDirection}</p>
        <p><strong>家長提醒：</strong>${item.coachTip}</p>
        <p><strong>和你女兒的連結：</strong>${item.fitForDaughter}</p>
      `;
      els.studentInterviewQaGrid.appendChild(card);
    });
  }

  function renderThirtyDayCountdown() {
    if (!els.countdownGrid || !research.thirtyDayCountdown) return;
    els.countdownGrid.innerHTML = "";

    research.thirtyDayCountdown.forEach((item) => {
      const card = document.createElement("article");
      card.className = "agenda-card";
      card.innerHTML = `
        <p class="section-kicker">${item.schoolName} · ${item.stage}</p>
        <h3>這段時間應怎樣準備</h3>
        <p><strong>孩子重點：</strong>${item.childFocus}</p>
        <p><strong>家長重點：</strong>${item.parentFocus}</p>
        <p><strong>檢查點：</strong>${item.checkpoint}</p>
      `;
      els.countdownGrid.appendChild(card);
    });
  }

  function renderInterviewDayChecklist() {
    if (!els.interviewDayGrid || !research.interviewDayChecklist) return;
    els.interviewDayGrid.innerHTML = "";

    research.interviewDayChecklist.forEach((item) => {
      const card = document.createElement("article");
      card.className = "agenda-card";
      card.innerHTML = `
        <p class="section-kicker">${item.phase}</p>
        <h3>當天要留意的事</h3>
        <p><strong>孩子：</strong>${item.childItems}</p>
        <p><strong>家長：</strong>${item.parentItems}</p>
        <p><strong>提醒：</strong>${item.practicalNote}</p>
      `;
      els.interviewDayGrid.appendChild(card);
    });
  }

  function renderParentInterviewPrep() {
    if (!els.parentInterviewGrid || !research.parentInterviewPrep) return;
    els.parentInterviewGrid.innerHTML = "";

    research.parentInterviewPrep.forEach((item) => {
      const card = document.createElement("article");
      card.className = "agenda-card";
      card.innerHTML = `
        <p class="section-kicker">${item.routeType}</p>
        <h3>${item.schoolName}</h3>
        <p><strong>常見家長題目：</strong>${item.likelyQuestions.join(" / ")}</p>
        <p><strong>家長主線：</strong>${item.parentAngle}</p>
        <p><strong>可怎樣講你女兒：</strong>${item.fitStory}</p>
        <p><strong>避免只這樣講：</strong>${item.avoid}</p>
        <p><strong>一句帶走：</strong>${item.takeaway}</p>
      `;
      els.parentInterviewGrid.appendChild(card);
    });
  }

  function renderParentFaqDrafts() {
    if (!els.parentFaqGrid || !research.parentFaqDrafts) return;
    els.parentFaqGrid.innerHTML = "";

    research.parentFaqDrafts.forEach((item) => {
      const card = document.createElement("article");
      card.className = "agenda-card";
      card.innerHTML = `
        <p class="section-kicker">${item.schoolName}</p>
        <h3>${item.question}</h3>
        <p><strong>口語化草稿：</strong>${item.draftAnswer}</p>
        <p><strong>回答重點：</strong>${item.answerNote}</p>
        <p><strong>語氣提醒：</strong>${item.toneReminder}</p>
      `;
      els.parentFaqGrid.appendChild(card);
    });
  }

  function renderParentMockQa() {
    if (!els.parentMockQaGrid || !research.parentMockQa) return;
    els.parentMockQaGrid.innerHTML = "";

    research.parentMockQa.forEach((item) => {
      const card = document.createElement("article");
      card.className = "agenda-card";
      card.innerHTML = `
        <p class="section-kicker">${item.schoolName}</p>
        <h3>${item.question}</h3>
        <p><strong>短答版：</strong>${item.shortAnswer}</p>
        <p><strong>追問版：</strong>${item.followUpAnswer}</p>
        <p><strong>避免這樣答：</strong>${item.avoid}</p>
        <p><strong>適合用在：</strong>${item.useWhen}</p>
      `;
      els.parentMockQaGrid.appendChild(card);
    });
  }

  function renderChildProfile() {
    if (!els.childProfileGrid || !research.familyContext?.childProfile) return;
    els.childProfileGrid.innerHTML = "";
    research.familyContext.childProfile.forEach((item) => {
      const card = document.createElement("article");
      card.className = "agenda-card";
      card.innerHTML = `<p>${item}</p>`;
      els.childProfileGrid.appendChild(card);
    });
  }

  function renderStrategy() {
    research.strategyAxes.forEach((item) => {
      const card = document.createElement("article");
      card.className = "axis-card";
      card.innerHTML = `<h3>${item.title}</h3><p>${item.detail}</p>`;
      els.strategyAxes.appendChild(card);
    });

    research.currentFindings.forEach((item) => {
      const li = document.createElement("li");
      li.textContent = item;
      els.findingsList.appendChild(li);
    });

    research.timeline.forEach((item) => {
      const block = document.createElement("div");
      block.className = "timeline-item";
      block.innerHTML = `<strong>${item.phase}</strong><div>${item.action}</div>`;
      els.timelineList.appendChild(block);
    });

    research.sourceList.forEach((item) => {
      const li = document.createElement("li");
      li.innerHTML = `<a href="${item.url}" target="_blank" rel="noreferrer">${item.title}</a><br><small>${item.note}</small>`;
      els.sourceList.appendChild(li);
    });

    research.externalResearchLinks.forEach((item) => {
      const li = document.createElement("li");
      li.innerHTML = `<a href="${item.url}" target="_blank" rel="noreferrer">${item.label}</a><br><small>${item.note}</small>`;
      els.externalList.appendChild(li);
    });

    research.focusProfiles.forEach((item) => {
      const card = document.createElement("article");
      card.className = "focus-card";
      card.innerHTML = `
        <p class="section-kicker">${item.routeType}</p>
        <h3>${item.schoolName}</h3>
        <p><strong>為何值得看：</strong>${item.whyItMatters}</p>
        ${item.admissionsSnapshot ? `<p style="margin-top:12px;"><strong>申請節奏：</strong>${item.admissionsSnapshot}</p>` : ""}
        <div class="metric-list">
          ${item.keyPoints.map((point) => `<div class="metric-item"><span>${point}</span></div>`).join("")}
        </div>
        <p style="margin-top:12px;"><strong>家長角度：</strong>${item.parentLens}</p>
        <p style="margin-top:12px;"><strong>學校角度：</strong>${item.schoolLens}</p>
        <p style="margin-top:12px;"><strong>提醒：</strong>${item.caution}</p>
        ${item.roundThree ? `<p style="margin-top:12px;"><strong>第三輪重點：</strong>${item.roundThree}</p>` : ""}
        <p style="margin-top:12px;"><small>來源：${item.source}</small></p>
      `;
      els.focusProfiles.appendChild(card);
    });

    routeSummary().forEach(([label, count]) => {
      const card = document.createElement("article");
      card.className = "route-card";
      card.innerHTML = `<strong>${count}</strong><h3>${ROUTE_LABELS[label]}</h3><p>${routeDescription(label)}</p>`;
      els.routeCards.appendChild(card);
    });
  }

  function routeDescription(label) {
    switch (label) {
      case "dss":
        return "較常見以本地課程為主，但在課程設計、語言、資源和升中連續性上有較高自主度。";
      case "private":
        return "市場差異最大，從傳統名校型到新型雙語型都有，必須逐校拆解。";
      case "pis":
        return "通常自成一套課程與文化，常見高自主度、雙語或國際化取向。";
      case "international":
        return "非本地課程訊號最明確，英語語境通常較強，但入學與家庭適配度要另看。";
      case "esf":
        return "屬重要英語/非本地課程路線，對重視英語環境家庭具高參考價值。";
      default:
        return "";
    }
  }

  function distanceLabel(item) {
    if (typeof item.distanceFromYauMaTeiKm !== "number") return "N/A";
    return `${item.distanceFromYauMaTeiKm.toFixed(1)} km`;
  }

  function schoolSearchText(item) {
    return [
      item.chineseName,
      item.englishName,
      item.routeGroup,
      item.districtZh,
      item.districtEn,
      item.religionZh,
      item.religionEn,
      item.curriculumSignal,
      item.tags.map((tag) => TAG_LABELS[tag] || tag).join(" ")
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();
  }

  function filteredSchools() {
    const q = els.searchInput.value.trim().toLowerCase();
    const route = els.routeFilter.value;
    const district = els.districtFilter.value;
    const curriculum = els.curriculumFilter.value;
    const distance = Number(els.distanceFilter.value || 0);

    let result = schools.filter((item) => {
      if (!visibleRouteSet().has(item.routeGroup)) return false;
      if (q && !schoolSearchText(item).includes(q)) return false;
      if (route && item.routeGroup !== route) return false;
      if (district && item.districtZh !== district) return false;
      if (curriculum && item.curriculumSignal !== curriculum) return false;
      if (distance && (!(typeof item.distanceFromYauMaTeiKm === "number") || item.distanceFromYauMaTeiKm > distance)) {
        return false;
      }
      return true;
    });

    switch (els.sortFilter.value) {
      case "name":
        result = result.sort((a, b) => a.chineseName.localeCompare(b.chineseName, "zh-Hant"));
        break;
      case "district":
        result = result.sort((a, b) => a.districtZh.localeCompare(b.districtZh, "zh-Hant"));
        break;
      case "route":
        result = result.sort((a, b) => a.routeGroup.localeCompare(b.routeGroup, "zh-Hant"));
        break;
      case "distance":
      default:
        result = result.sort((a, b) => {
          const da = typeof a.distanceFromYauMaTeiKm === "number" ? a.distanceFromYauMaTeiKm : Number.POSITIVE_INFINITY;
          const db = typeof b.distanceFromYauMaTeiKm === "number" ? b.distanceFromYauMaTeiKm : Number.POSITIVE_INFINITY;
          return da - db;
        });
    }

    return result;
  }

  function renderTable() {
    const result = filteredSchools();
    els.schoolTbody.innerHTML = "";

    result.forEach((item) => {
      const tr = document.createElement("tr");
      const checked = compareSet.has(item.id) ? "checked" : "";
      tr.innerHTML = `
        <td><input class="compare-checkbox" type="checkbox" data-id="${item.id}" ${checked}></td>
        <td>
          <strong>${item.chineseName}</strong>
          <small>${item.englishName}</small>
          <small>${item.addressZh}</small>
        </td>
        <td>
          ${ROUTE_LABELS[item.routeGroup] || item.routeGroup}
          <small>${item.financeTypeZh}</small>
        </td>
        <td>${item.districtZh}</td>
        <td>${distanceLabel(item)}</td>
        <td>${CURRICULUM_LABELS[item.curriculumSignal] || item.curriculumSignal}</td>
        <td>${item.genderZh}</td>
        <td>${item.website ? `<a href="${item.website}" target="_blank" rel="noreferrer">學校網站</a>` : "N/A"}</td>
      `;
      els.schoolTbody.appendChild(tr);
    });

    els.schoolTbody.querySelectorAll(".compare-checkbox").forEach((box) => {
      box.addEventListener("change", () => toggleCompare(box.dataset.id, box.checked));
    });
  }

  function selectedSchools() {
    return schools.filter((item) => compareSet.has(item.id));
  }

  function toggleCompare(id, checked) {
    if (checked && compareSet.size >= 4) {
      const target = els.schoolTbody.querySelector(`.compare-checkbox[data-id="${id}"]`);
      if (target) target.checked = false;
      return;
    }

    if (checked) compareSet.add(id);
    else compareSet.delete(id);

    renderCompare();
  }

  function renderCompare() {
    const picked = selectedSchools();
    els.compareCount.textContent = `${picked.length} / 4`;
    els.compareTags.innerHTML = "";

    picked.forEach((item) => {
      const tag = document.createElement("button");
      tag.className = "tag";
      tag.type = "button";
      tag.textContent = `${item.chineseName} ×`;
      tag.addEventListener("click", () => {
        compareSet.delete(item.id);
        syncCheckboxes();
        renderCompare();
      });
      els.compareTags.appendChild(tag);
    });

    if (!picked.length) {
      els.compareGrid.className = "compare-grid empty-state";
      els.compareGrid.textContent = "先在上方資料庫勾選最多 4 間學校。";
      return;
    }

    els.compareGrid.className = "compare-grid";
    els.compareGrid.innerHTML = "";

    picked.forEach((item) => {
      const card = document.createElement("article");
      card.className = "compare-card";
      card.innerHTML = `
        <p class="section-kicker">${ROUTE_LABELS[item.routeGroup] || item.routeGroup}</p>
        <h3>${item.chineseName}</h3>
        <p>${item.englishName}</p>
        <div class="metric-list">
          ${metric("地區", item.districtZh)}
          ${metric("距離油麻地", distanceLabel(item))}
          ${metric("課程訊號", CURRICULUM_LABELS[item.curriculumSignal] || item.curriculumSignal)}
          ${metric("性別", item.genderZh)}
          ${metric("授課時段", item.sessionZh)}
          ${metric("宗教", item.religionZh || "不適用")}
          ${metric("電話", item.telephone || "N/A")}
        </div>
        <div class="tag-group" style="margin-top:12px;">
          ${item.tags.map((tag) => `<span class="mini-pill">${TAG_LABELS[tag] || tag}</span>`).join("")}
        </div>
        <p style="margin-top:12px;"><small>${item.addressZh}</small></p>
        ${item.website ? `<p style="margin-top:10px;"><a href="${item.website}" target="_blank" rel="noreferrer">前往學校網站</a></p>` : ""}
      `;
      els.compareGrid.appendChild(card);
    });
  }

  function metric(label, value) {
    return `<div class="metric-item"><span>${label}</span><strong>${value}</strong></div>`;
  }

  function syncCheckboxes() {
    els.schoolTbody.querySelectorAll(".compare-checkbox").forEach((box) => {
      box.checked = compareSet.has(box.dataset.id);
    });
  }

  function bindFilters() {
    [els.searchInput, els.routeFilter, els.districtFilter, els.curriculumFilter, els.distanceFilter, els.sortFilter].forEach(
      (el) => el.addEventListener("input", renderTable)
    );
    [els.routeFilter, els.districtFilter, els.curriculumFilter, els.distanceFilter, els.sortFilter].forEach((el) =>
      el.addEventListener("change", renderTable)
    );

    els.presetButtons.forEach((button) => {
      button.addEventListener("click", () => {
        currentPreset = button.dataset.preset;
        els.presetButtons.forEach((item) => item.classList.toggle("active", item === button));
        renderPriorityLists();
        renderTable();
      });
    });
  }

  function initFilters() {
    uniqueValues("routeGroup").forEach((value) => {
      const option = document.createElement("option");
      option.value = value;
      option.textContent = ROUTE_LABELS[value] || value;
      els.routeFilter.appendChild(option);
    });
    optionify(els.districtFilter, uniqueValues("districtZh"));
    uniqueValues("curriculumSignal").forEach((value) => {
      const option = document.createElement("option");
      option.value = value;
      option.textContent = CURRICULUM_LABELS[value] || value;
      els.curriculumFilter.appendChild(option);
    });
  }

  async function sha256(text) {
    const buffer = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text));
    return [...new Uint8Array(buffer)].map((b) => b.toString(16).padStart(2, "0")).join("");
  }

  function unlockSite() {
    const gate = document.getElementById("access-gate");
    if (gate) gate.classList.add("hidden");
  }

  function initGate() {
    const gate = document.getElementById("access-gate");
    const input = document.getElementById("gate-input");
    const submit = document.getElementById("gate-submit");
    const error = document.getElementById("gate-error");
    const hint = document.getElementById("gate-hint");
    const sessionKey = "hk-school-research-unlocked";

    if (!gate || siteConfig.accessMode !== "passcode") {
      if (gate) gate.classList.add("hidden");
      return;
    }

    if (siteConfig.passcodeHint && hint) {
      hint.textContent = `提示：${siteConfig.passcodeHint}`;
    }

    if (sessionStorage.getItem(sessionKey) === "yes") {
      unlockSite();
      return;
    }

    const check = async () => {
      const value = input.value || "";
      const digest = await sha256(value);
      if (digest === siteConfig.passcodeSha256) {
        sessionStorage.setItem(sessionKey, "yes");
        unlockSite();
        return;
      }
      error.textContent = "密碼不正確，請再試一次。";
      input.select();
    };

    submit.addEventListener("click", check);
    input.addEventListener("keydown", (event) => {
      if (event.key === "Enter") {
        check();
      }
    });
  }

  initGate();
  renderTop();
  renderStrategy();
  renderShortlist();
  renderExtendedShortlist();
  renderAgenda();
  renderWorkPlan();
  renderLatestIntel();
  renderAdmissionsTracker();
  renderShortlistMatrix();
  renderPhaseThreeComparison();
  renderPhaseFourComparison();
  renderPhaseFiveComparison();
  renderPhaseSixComparison();
  renderChildScenarios();
  renderOpenDayChecklist();
  renderChildProfile();
  renderPortfolioChecklist();
  renderInterviewLens();
  renderCoreInterviewPlan();
  renderWeeklyPracticePlan();
  renderHomePracticeActivities();
  renderStudentInterviewQa();
  renderThirtyDayCountdown();
  renderInterviewDayChecklist();
  renderParentInterviewPrep();
  renderParentFaqDrafts();
  renderParentMockQa();
  initFilters();
  bindFilters();
  renderPriorityLists();
  renderTable();
  renderCompare();
})();
