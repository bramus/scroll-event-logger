import './index.css';

const scroller = document.getElementById('scroller');
const logContainer = document.getElementById('log-container');
const emptyState = document.getElementById('empty-state');
const clearBtn = document.getElementById('clear-btn');

const metricLeft = document.getElementById('metric-left');
const metricRight = document.getElementById('metric-right');
const metricTop = document.getElementById('metric-top');
const metricBottom = document.getElementById('metric-bottom');

let logs = [];

function formatTime(date) {
  return date.toLocaleTimeString('en-US', {
    hour12: false,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    fractionalSecondDigits: 3,
  });
}

function updateMetrics() {
  if (!scroller) return;
  const { scrollLeft, scrollTop, scrollWidth, clientWidth, scrollHeight, clientHeight } = scroller;
  
  metricLeft.textContent = `${Math.round(scrollLeft)}px`;
  metricTop.textContent = `${Math.round(scrollTop)}px`;
  metricRight.textContent = `${Math.round(scrollWidth - clientWidth - scrollLeft)}px`;
  metricBottom.textContent = `${Math.round(scrollHeight - clientHeight - scrollTop)}px`;
}

function renderLog(log) {
  if (emptyState && emptyState.style.display !== 'none') {
    emptyState.style.display = 'none';
  }

  const row = document.createElement('div');
  row.className = 'log-entry';
  
  const time = document.createElement('span');
  time.className = 'log-time';
  time.textContent = log.timestamp;
  
  const type = document.createElement('span');
  type.className = `log-type ${log.type}`;
  type.textContent = log.type;
  
  row.appendChild(time);
  row.appendChild(type);
  
  logContainer.appendChild(row);
  
  // Auto scroll
  row.scrollIntoView({ behavior: 'smooth' });
}

function addLog(type) {
  const newLog = {
    id: crypto.randomUUID(),
    type,
    timestamp: formatTime(new Date()),
  };
  
  logs.push(newLog);
  if (logs.length > 50) {
    logs.shift();
    const firstLog = logContainer.querySelector('div:not(#empty-state)');
    if (firstLog) firstLog.remove();
  }
  
  renderLog(newLog);
}

function clearLogs() {
  logs = [];
  const rows = logContainer.querySelectorAll('div:not(#empty-state)');
  rows.forEach(row => row.remove());
  if (emptyState) emptyState.style.display = 'flex';
}

// Event Listeners
if (scroller) {
  scroller.addEventListener('scroll', () => {
    addLog('scroll');
    updateMetrics();
  });

  scroller.addEventListener('scrollend', () => {
    addLog('scrollend');
    updateMetrics();
  });
}

if (clearBtn) {
  clearBtn.addEventListener('click', clearLogs);
}

// Initial call
updateMetrics();
