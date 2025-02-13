let githubprojects = [
  'schmelto/100-days-of-code',
  'schmelto/NewsApp',
  'schmelto/Portfolio',
  'schmelto/ImpactHackathon',
  'schmelto/schmelto',
  'schmelto/abap',
];

var githubissues = document.getElementById('githubissues');
var githublabels = document.getElementById('githublabels');

// get issues as promis
function getIssues(project) {
  return new Promise((resolve, reject) => {
    fetch(`https://api.github.com/repos/${project}/issues`)
      .then((response) => response.json())
      .then((issues) => {
        resolve(issues);
      })
      .catch((err) => {
        reject(err);
      });
  });
}

let all_issues = [];
// add label array with one all label

let all_labels = [
  {
    id: 1,
    color: '2E2A2A',
    name: 'all',
  },
];

githubprojects.forEach((project) => {
  getIssues(project).then((issues) => {
    // push all issues to array
    all_issues.push(...issues);
    // get all labels
    issues.forEach((issue) => {
      console.log(issue.labels);
      all_labels.push(...issue.labels);
    });
  });
});

// await promis and create html
Promise.all(githubprojects.map(getIssues)).then(() => {
  // create labels
  all_labels.forEach((label) => {
    // only if not already in list
    if (
      !githublabels.querySelector(
        `span[style="background-color: #${label.color}; color: ${invertColor(
          label.color,
          true
        )}; margin-right: 5px"]`
      )
    ) {
      githublabels.innerHTML += `<span class="badge" style="background-color: #${
        label.color
      }; color: ${invertColor(label.color, true)}; margin-right: 5px">${
        label.name
      }</span>`;
    }
  });

  // initialy set label with inner html"all" to actice
  githublabels
    .querySelector(
      `span[style="background-color: #2E2A2A; color: ${invertColor(
        '2E2A2A',
        true
      )}; margin-right: 5px"]`
    )
    .classList.add('active');

  all_issues.forEach((issue) => {
    if (!issue.pull_request) {
      githubissues.innerHTML += createIssueCard(issue);
    }
  });

  // when click on label show only issues with that label and hightlight label
  githublabels.addEventListener('click', (e) => {
    let label = e.target.innerText;
    let label_issues = all_issues.filter((issue) => {
      return issue.labels.some((label_issue) => {
        return label_issue.name === label;
      });
    });
    githubissues.innerHTML = '';
    // if no label is selected show all issues
    if (label_issues.length === 0 || label_issues[0].name == 'all') {
      label_issues = all_issues;
    }

    label_issues.forEach((issue) => {
      if (!issue.pull_request) {
        githubissues.innerHTML += createIssueCard(issue);
      }
    });
    githublabels.querySelectorAll('span').forEach((label) => {
      label.classList.remove('active');
    });
    e.target.classList.add('active');
  });
});

function createIssueCard(issue) {
  let labelstring = addLabels(issue.labels);
  let repo = issue.repository_url.replace(`https://api.github.com/repos/`, '');
  let issueCard = `
  <div class="flex-card">
    <a href="${issue.html_url}" target="_blank" rel="noopener">
      <div class="card">
        <div class="card-body">
          <h5 class="card-title"><img class="rounded-circle" alt="${issue.user.login}" src="${issue.user.avatar_url}"
          data-holder-rendered="true" style="height: 30px; margin-right: 5px">${issue.title}</h5>
          <h6 class="card-subtitle mb-2 text-muted">${repo}</h6>
          <p class="card-text">${labelstring}</p>
        </div>
      </div>
    </a>
  </div>`;

  return issueCard;
}

function addLabels(labels) {
  let labelstring = '';
  labels.forEach((label) => {
    labelstring += `<span class="badge" style="background-color: #${
      label.color
    }; color: ${invertColor(label.color, true)}; margin-right: 5px">${
      label.name
    }</span>`;
  });
  return labelstring;
}

function invertColor(hex, bw) {
  hex = `#` + hex;
  if (hex.indexOf('#') === 0) {
    hex = hex.slice(1);
  }
  // convert 3-digit hex to 6-digits.
  if (hex.length === 3) {
    hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
  }
  if (hex.length !== 6) {
    throw new Error('Invalid HEX color.');
  }
  var r = parseInt(hex.slice(0, 2), 16),
    g = parseInt(hex.slice(2, 4), 16),
    b = parseInt(hex.slice(4, 6), 16);
  if (bw) {
    // https://stackoverflow.com/a/3943023/112731
    return r * 0.299 + g * 0.587 + b * 0.114 > 186 ? '#000000' : '#FFFFFF';
  }
  // invert color components
  r = (255 - r).toString(16);
  g = (255 - g).toString(16);
  b = (255 - b).toString(16);
  // pad each with zeros and return
  return '#' + padZero(r) + padZero(g) + padZero(b);
}
function padZero(str, len) {
  len = len || 2;
  var zeros = new Array(len).join('0');
  return (zeros + str).slice(-len);
}
