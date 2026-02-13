import './index.css';

const scroller = document.getElementById('scroller') as HTMLDivElement;
const logContainer = document.getElementById('log-container') as HTMLDivElement;
const emptyState = document.getElementById('empty-state') as HTMLDivElement;
const clearBtn = document.getElementById('clear-btn') as HTMLButtonElement;

const metricLeft = document.getElementById('metric-left') as HTMLSpanElement;
const metricRight = document.getElementById('metric-right') as HTMLSpanElement;
const metricTop = document.getElementById('metric-top') as HTMLSpanElement;
const metricBottom = document.getElementById('metric-bottom') as HTMLSpanElement;

let logs: { id: string; type: string; timestamp: string }[] = [];

function formatTime(date: Date) {
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

function renderLog(log: { id: string; type: string; timestamp: string }) {
  if (emptyState && emptyState.style.display !== 'none') {
    emptyState.style.display = 'none';
  }

  const row = document.createElement('div');
  row.className = 'flex items-start gap-3 animate-in fade-in slide-in-from-left-2 duration-200';
  
  const time = document.createElement('span');
  time.className = 'text-neutral-400 shrink-0 select-none';
  time.textContent = log.timestamp;
  
  const type = document.createElement('span');
  type.className = `font-medium ${log.type === 'scrollend' ? 'text-indigo-600' : 'text-amber-600'}`;
  type.textContent = log.type;
  
  row.appendChild(time);
  row.appendChild(type);
  
  logContainer.appendChild(row);
  
  // Auto scroll
  row.scrollIntoView({ behavior: 'smooth' });
}

function addLog(type: 'scroll' | 'scrollend') {
  const newLog = {
    id: crypto.randomUUID(),
    type,
    timestamp: formatTime(new Date()),
  };
  
  logs.push(newLog);
  if (logs.length > 50) {
    logs.shift();
    // Remove first child that isn't empty-state (if empty state is hidden)
    // Actually simpler to just remove the second child if empty state is first
    // Or just re-render. But appending is more performant.
    // Let's just remove the first log element.
    const firstLog = logContainer.querySelector('div:not(#empty-state)');
    if (firstLog) firstLog.remove();
  }
  
  renderLog(newLog);
}

function clearLogs() {
  logs = [];
  // Remove all divs except empty-state
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
