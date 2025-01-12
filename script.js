/*************************************************
 * Grab references to main elements
 *************************************************/
const mhf4u        = document.getElementById('mhf4u');
const mcv4u        = document.getElementById('mcv4u');
const sph4u        = document.getElementById('sph4u');
const sch4u        = document.getElementById('sch4u');
const eng4u        = document.getElementById('eng4u');
const electiveName = document.getElementById('electiveName');
const electiveMark = document.getElementById('electiveMark');
const calcButton   = document.getElementById('calcButton');
const resultDiv    = document.getElementById('result');

/*************************************************
 * SVG Circle elements
 *************************************************/
const ringFg       = document.getElementById('ringFg');
const ringText     = document.getElementById('ringText');
const circleRadius = 120;
const circleCircum = 2 * Math.PI * circleRadius; // ~753.98

/*************************************************
 * "What If" modal elements
 *************************************************/
const whatIfButton     = document.getElementById('whatIfButton');
const whatIfModal      = document.getElementById('whatIfModal');
const closeModal       = document.getElementById('closeModal');
const courseSelect     = document.getElementById('courseSelect');
const newMarkInput     = document.getElementById('newMark');
const calcWhatIfButton = document.getElementById('calcWhatIf');
const whatIfResultDiv  = document.getElementById('whatIfResult');

/*************************************************
 * "Class Average" modal elements
 *************************************************/
const classModal        = document.getElementById('classModal');
const classModalClose   = document.getElementById('classModalClose');
const classModalTitle   = document.getElementById('classModalTitle');
const assessmentsTable  = document
  .getElementById('assessmentsTable')
  .querySelector('tbody');
const addAssessmentBtn  = document.getElementById('addAssessmentBtn');
const calcClassBtn      = document.getElementById('calcClassBtn');
const useAverageBtn     = document.getElementById('useAverageBtn');
const classResultDiv    = document.getElementById('classResult');

// We'll store the last computed average so we can "Use This Average"
let lastComputedAverage = null;

/*************************************************
 * Load / Save from localStorage
 *************************************************/
window.addEventListener('load', () => {
  // Restore course marks
  if (localStorage.getItem('mhf4u'))        mhf4u.value        = localStorage.getItem('mhf4u');
  if (localStorage.getItem('mcv4u'))        mcv4u.value        = localStorage.getItem('mcv4u');
  if (localStorage.getItem('sph4u'))        sph4u.value        = localStorage.getItem('sph4u');
  if (localStorage.getItem('sch4u'))        sch4u.value        = localStorage.getItem('sch4u');
  if (localStorage.getItem('eng4u'))        eng4u.value        = localStorage.getItem('eng4u');
  if (localStorage.getItem('electiveName')) electiveName.value = localStorage.getItem('electiveName');
  if (localStorage.getItem('electiveMark')) electiveMark.value = localStorage.getItem('electiveMark');
});

// Save marks to localStorage whenever an input changes
[mhf4u, mcv4u, sph4u, sch4u, eng4u, electiveName, electiveMark].forEach(input => {
  input.addEventListener('input', () => {
    localStorage.setItem(input.id, input.value);
  });
});

/*************************************************
 * Calculate Top 6 average
 *************************************************/
calcButton.addEventListener('click', () => {
  const marks = [
    Number(mhf4u.value),
    Number(mcv4u.value),
    Number(sph4u.value),
    Number(sch4u.value),
    Number(eng4u.value),
    Number(electiveMark.value)
  ];
  
  // Validate
  const allMarksValid = marks.every(mark => !isNaN(mark) && mark !== '');
  if (!allMarksValid) {
    resultDiv.textContent = 'Please fill in all six marks to calculate your average.';
    updateCircle(0); // reset circle
    return;
  }

  // Compute
  const sum = marks.reduce((acc, curr) => acc + curr, 0);
  const average = (sum / 6).toFixed(2);
  resultDiv.textContent = `Your Top 6 Average is: ${average}%`;

  // Update the circle
  updateCircle(Number(average));
});

/*************************************************
 * CIRCLE: updateCircle function
 *************************************************/
function updateCircle(percentage) {
  // clamp 0-100
  if (isNaN(percentage) || percentage < 0) {
    percentage = 0;
  } else if (percentage > 100) {
    percentage = 100;
  }
  
  // The circle is "full" (offset=0) at 100%.
  const offset = circleCircum - (circleCircum * (percentage / 100));
  ringFg.style.strokeDashoffset = offset.toString();

  ringText.textContent = `${percentage.toFixed(2)}%`;
}

/*************************************************
 * "What If" Scenario
 *************************************************/
whatIfButton.addEventListener('click', () => {
  whatIfResultDiv.textContent = '';
  newMarkInput.value = '';
  whatIfModal.style.display = 'block';
});

closeModal.addEventListener('click', () => {
  whatIfModal.style.display = 'none';
});

// Close if user clicks outside
window.addEventListener('click', (e) => {
  if (e.target === whatIfModal) {
    whatIfModal.style.display = 'none';
  }
});

calcWhatIfButton.addEventListener('click', () => {
  const currentMarks = [
    Number(mhf4u.value),
    Number(mcv4u.value),
    Number(sph4u.value),
    Number(sch4u.value),
    Number(eng4u.value),
    Number(electiveMark.value)
  ];

  const allMarksValid = currentMarks.every(mark => !isNaN(mark) && mark !== '');
  if (!allMarksValid) {
    whatIfResultDiv.textContent = 'Fill in all main marks before using "What If."';
    return;
  }

  const selectedCourse = courseSelect.value;
  const hypotheticalValue = Number(newMarkInput.value);

  if (isNaN(hypotheticalValue) || newMarkInput.value === '') {
    whatIfResultDiv.textContent = 'Please enter a valid new mark.';
    return;
  }

  // Make a copy
  const hypotheticalMarks = [...currentMarks];
  const courseMap = {
    mhf4u: 0,
    mcv4u: 1,
    sph4u: 2,
    sch4u: 3,
    eng4u: 4,
    electiveMark: 5
  };
  const indexToReplace = courseMap[selectedCourse];
  hypotheticalMarks[indexToReplace] = hypotheticalValue;

  const sumHypothetical = hypotheticalMarks.reduce((acc, curr) => acc + curr, 0);
  const hypotheticalAverage = (sumHypothetical / 6).toFixed(2);
  whatIfResultDiv.textContent = `Hypothetical Top 6 Average: ${hypotheticalAverage}%`;
});

/*************************************************
 * "Class Average" Calculator (Modal)
 *************************************************/
const classAverageBtns = document.querySelectorAll('.classAverageBtn');
classAverageBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    const course = btn.dataset.course;
    openClassModal(course);
  });
});

function openClassModal(course) {
  classModalTitle.textContent = `Class Average Calculator: ${course.toUpperCase()}`;

  // Clear existing rows
  assessmentsTable.innerHTML = '';
  loadAssessmentRows(course);

  // Hide any old results
  classResultDiv.textContent = '';
  lastComputedAverage = null;
  useAverageBtn.style.display = 'none';

  // Show
  classModal.style.display = 'block';

  // Handlers
  addAssessmentBtn.onclick = () => addAssessmentRow(course);
  calcClassBtn.onclick      = () => calculateClassAverage(course);
  useAverageBtn.onclick     = () => {
    if (lastComputedAverage !== null) {
      // Put that average into the actual course mark
      const targetInput = document.getElementById(course);
      if (targetInput) {
        targetInput.value = lastComputedAverage.toFixed(2);
        localStorage.setItem(course, lastComputedAverage.toFixed(2));
      }
      classModal.style.display = 'none';
    }
  };
}

function loadAssessmentRows(course) {
  const storedData = localStorage.getItem(`assessments_${course}`);
  if (!storedData) return;
  const rows = JSON.parse(storedData);
  rows.forEach(row => {
    insertTableRow(row);
  });
}

function addAssessmentRow(course) {
  const rowData = {
    name: '',
    category: '',
    percentScore: '',
    pointsScored: '',
    totalPoints: '',
    weight: ''
  };
  insertTableRow(rowData);
  updateLocalStorage(course);
}

// Insert a row into the table
function insertTableRow(rowData) {
  const tr = document.createElement('tr');

  // 7 cells: name, category, %score, pScored, tPoints, weight, delete
  tr.appendChild(buildTextCell(rowData, 'name'));

  // category cell
  const tdCat = document.createElement('td');
  const select = document.createElement('select');
  select.innerHTML = `
    <option value=""></option>
    <option value="quiz">Quiz</option>
    <option value="lab">Lab</option>
    <option value="test">Test</option>
    <option value="other">Other</option>
  `;
  select.value = rowData.category || '';
  select.addEventListener('change', () => {
    rowData.category = select.value;
    // auto-set weight for quiz/lab/test
    if (select.value === 'quiz') {
      rowData.weight = '1';
      tr.cells[5].querySelector('input').value = '1';
    } else if (select.value === 'lab') {
      rowData.weight = '2';
      tr.cells[5].querySelector('input').value = '2';
    } else if (select.value === 'test') {
      rowData.weight = '5';
      tr.cells[5].querySelector('input').value = '5';
    }
    queueLocalStorageUpdate();
  });
  tdCat.appendChild(select);
  tr.appendChild(tdCat);

  // next fields
  tr.appendChild(buildTextCell(rowData, 'percentScore'));
  tr.appendChild(buildTextCell(rowData, 'pointsScored'));
  tr.appendChild(buildTextCell(rowData, 'totalPoints'));
  tr.appendChild(buildTextCell(rowData, 'weight'));

  // delete cell
  const tdDel = document.createElement('td');
  const delBtn = document.createElement('button');
  delBtn.classList.add('delete-button');
  delBtn.textContent = 'X';
  delBtn.addEventListener('click', () => {
    tr.remove();
    queueLocalStorageUpdate();
  });
  tdDel.appendChild(delBtn);
  tr.appendChild(tdDel);

  assessmentsTable.appendChild(tr);
}

// Helper: build a <td><input/></td>
function buildTextCell(rowData, field) {
  const td = document.createElement('td');
  const input = document.createElement('input');
  input.type = 'text';
  input.value = rowData[field];
  input.addEventListener('input', () => {
    rowData[field] = input.value;
    queueLocalStorageUpdate();
  });
  td.appendChild(input);
  return td;
}

let storageUpdateTimer = null;
function queueLocalStorageUpdate() {
  if (storageUpdateTimer) clearTimeout(storageUpdateTimer);
  storageUpdateTimer = setTimeout(() => {
    const titleText = classModalTitle.textContent;
    const segments = titleText.split(':');
    if (segments.length < 2) return;
    const course = segments[1].trim().toLowerCase();
    updateLocalStorage(course);
  }, 500);
}

function updateLocalStorage(course) {
  const rowDataArray = [];
  const trs = assessmentsTable.querySelectorAll('tr');
  trs.forEach(tr => {
    const tds = tr.querySelectorAll('td');
    if (tds.length < 7) return;
    const nameCell    = tds[0].querySelector('input');
    const catSelect   = tds[1].querySelector('select');
    const pctCell     = tds[2].querySelector('input');
    const pScrCell    = tds[3].querySelector('input');
    const tPtsCell    = tds[4].querySelector('input');
    const weightCell  = tds[5].querySelector('input');
    rowDataArray.push({
      name: (nameCell?.value ?? ''),
      category: (catSelect?.value ?? ''),
      percentScore: (pctCell?.value ?? ''),
      pointsScored: (pScrCell?.value ?? ''),
      totalPoints: (tPtsCell?.value ?? ''),
      weight: (weightCell?.value ?? '')
    });
  });
  localStorage.setItem(`assessments_${course}`, JSON.stringify(rowDataArray));
}

function calculateClassAverage(course) {
  updateLocalStorage(course);
  const storedData = localStorage.getItem(`assessments_${course}`);
  if (!storedData) {
    classResultDiv.textContent = 'No assessments found.';
    return;
  }

  const rows = JSON.parse(storedData);
  if (rows.length === 0) {
    classResultDiv.textContent = 'No assessments found.';
    return;
  }

  let totalWeight = 0;
  let weightedSum = 0;

  rows.forEach(r => {
    const w    = parseFloat(r.weight)       || 0;
    const pScr = parseFloat(r.pointsScored) || 0;
    const tPts = parseFloat(r.totalPoints)  || 0;
    const pct  = parseFloat(r.percentScore) || 0;
    if (w <= 0) return;

    let ratio = 0;
    if (tPts > 0 && pScr >= 0 && pScr <= tPts) {
      ratio = pScr / tPts; 
    } else if (pct > 0) {
      ratio = pct / 100.0; 
    } else {
      return;
    }

    weightedSum += (ratio * w);
    totalWeight += w;
  });

  if (totalWeight === 0) {
    classResultDiv.textContent = 'No valid data to calculate.';
    return;
  }

  lastComputedAverage = (weightedSum / totalWeight) * 100;
  classResultDiv.textContent = `Your current average for this class is: ${lastComputedAverage.toFixed(2)}%`;
  useAverageBtn.style.display = 'inline-block';
}

/*************************************************
 * Closing the Class Modal
 *************************************************/
classModalClose.addEventListener('click', () => {
  classModal.style.display = 'none';
});

// Also close if user clicks outside the modal
window.addEventListener('click', (e) => {
  if (e.target === classModal) {
    classModal.style.display = 'none';
  }
});
