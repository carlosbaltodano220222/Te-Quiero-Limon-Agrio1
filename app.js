const STORAGE_EMPLOYEES = 'sica_simple_employees';
const STORAGE_ATTENDANCE = 'sica_simple_attendance';

const sampleEmployees = [
  { id: 1, name: 'Ana López', code: 'EMP-001', branch: 'Managua', role: 'Administración' },
  { id: 2, name: 'Luis Martínez', code: 'EMP-002', branch: 'Masachapa', role: 'Auxiliar' },
  { id: 3, name: 'María González', code: 'EMP-003', branch: 'León', role: 'Recepción' }
];

let employees = loadData(STORAGE_EMPLOYEES, sampleEmployees);
let attendance = loadData(STORAGE_ATTENDANCE, []);

function loadData(key, fallback) {
  try {
    const stored = localStorage.getItem(key);
    return stored === null ? fallback : JSON.parse(stored);
  } catch (error) {
    return fallback;
  }
}

function saveData() {
  localStorage.setItem(STORAGE_EMPLOYEES, JSON.stringify(employees));
  localStorage.setItem(STORAGE_ATTENDANCE, JSON.stringify(attendance));
}

function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>"']/g, character => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  })[character]);
}

function showView(name) {
  document.querySelectorAll('.view').forEach(section => {
    section.classList.toggle('hidden', section.id !== `view-${name}`);
  });
  document.querySelectorAll('.nav-button').forEach(button => {
    button.classList.toggle('active', button.dataset.view === name);
  });
  renderAll();
}

document.querySelectorAll('.nav-button').forEach(button => {
  button.addEventListener('click', () => showView(button.dataset.view));
});

document.getElementById('employee-form').addEventListener('submit', event => {
  event.preventDefault();
  const name = document.getElementById('employee-name').value.trim();
  const code = document.getElementById('employee-code').value.trim();
  const branch = document.getElementById('employee-branch').value;
  const role = document.getElementById('employee-role').value.trim();

  if (employees.some(employee => employee.code.toLowerCase() === code.toLowerCase())) {
    alert('Ya existe un empleado con ese código.');
    return;
  }

  employees.push({ id: Date.now(), name, code, branch, role });
  saveData();
  event.target.reset();
  renderAll();
  alert('Empleado guardado.');
});

function deleteEmployee(id) {
  const employee = employees.find(item => item.id === id);
  if (!employee) return;
  if (!confirm(`¿Eliminar a ${employee.name} de la lista de empleados? Los registros de asistencia anteriores se conservarán.`)) return;
  employees = employees.filter(item => item.id !== id);
  saveData();
  renderAll();
}

// Expose this small handler for the delete buttons rendered in the table.
window.deleteEmployee = deleteEmployee;

document.getElementById('attendance-form').addEventListener('submit', event => {
  event.preventDefault();
  const employeeId = Number(document.getElementById('attendance-employee').value);
  const employee = employees.find(item => item.id === employeeId);
  const type = document.getElementById('attendance-type').value;
  const note = document.getElementById('attendance-note').value.trim();

  if (!employee) {
    alert('Primero registre o seleccione un empleado.');
    return;
  }

  attendance.push({
    id: Date.now(),
    employeeId: employee.id,
    employeeName: employee.name,
    employeeCode: employee.code,
    branch: employee.branch,
    type,
    datetime: new Date().toISOString(),
    note
  });
  saveData();
  document.getElementById('attendance-note').value = '';
  renderAll();
  alert('Asistencia guardada.');
});

function formatDateTime(value) {
  return new Date(value).toLocaleString('es-NI', {
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit'
  });
}

function getSortedAttendance() {
  return [...attendance].sort((a, b) => new Date(b.datetime) - new Date(a.datetime));
}

function renderEmployees() {
  document.getElementById('employee-count').textContent = `Total de empleados: ${employees.length}`;
  const body = document.getElementById('employees-table');
  if (!employees.length) {
    body.innerHTML = '<tr><td colspan="5">No hay empleados registrados.</td></tr>';
  } else {
    body.innerHTML = employees.map(employee => `
      <tr>
        <td>${escapeHtml(employee.name)}</td>
        <td>${escapeHtml(employee.code)}</td>
        <td>${escapeHtml(employee.branch)}</td>
        <td>${escapeHtml(employee.role)}</td>
        <td><button type="button" onclick="deleteEmployee(${employee.id})">Eliminar</button></td>
      </tr>`).join('');
  }

  const select = document.getElementById('attendance-employee');
  const selected = select.value;
  select.innerHTML = '<option value="">Seleccione un empleado</option>' + employees.map(employee =>
    `<option value="${employee.id}">${escapeHtml(employee.name)} - ${escapeHtml(employee.branch)}</option>`
  ).join('');
  if (employees.some(employee => String(employee.id) === selected)) select.value = selected;
}

function renderAttendance() {
  const body = document.getElementById('attendance-table');
  const records = getSortedAttendance().slice(0, 10);
  if (!records.length) {
    body.innerHTML = '<tr><td colspan="5">Todavía no hay asistencias registradas.</td></tr>';
    return;
  }
  body.innerHTML = records.map(record => `
    <tr>
      <td>${escapeHtml(record.employeeName)}</td>
      <td>${escapeHtml(record.branch)}</td>
      <td>${escapeHtml(record.type)}</td>
      <td>${escapeHtml(formatDateTime(record.datetime))}</td>
      <td>${escapeHtml(record.note || '-')}</td>
    </tr>`).join('');
}

function localDateKey(value) {
  const date = new Date(value);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function filteredReports() {
  const date = document.getElementById('report-date').value;
  return getSortedAttendance().filter(record => !date || localDateKey(record.datetime) === date);
}

function renderReports() {
  document.getElementById('report-employee-count').textContent = employees.length;
  document.getElementById('report-attendance-count').textContent = attendance.length;
  const body = document.getElementById('reports-table');
  const records = filteredReports();
  if (!records.length) {
    body.innerHTML = '<tr><td colspan="6">No hay registros para mostrar.</td></tr>';
    return;
  }
  body.innerHTML = records.map(record => `
    <tr>
      <td>${escapeHtml(record.employeeName)}</td>
      <td>${escapeHtml(record.employeeCode)}</td>
      <td>${escapeHtml(record.branch)}</td>
      <td>${escapeHtml(record.type)}</td>
      <td>${escapeHtml(formatDateTime(record.datetime))}</td>
      <td>${escapeHtml(record.note || '-')}</td>
    </tr>`).join('');
}

document.getElementById('report-date').addEventListener('change', renderReports);
document.getElementById('clear-filter').addEventListener('click', () => {
  document.getElementById('report-date').value = '';
  renderReports();
});

document.getElementById('export-csv').addEventListener('click', () => {
  const records = filteredReports();
  if (!records.length) {
    alert('No hay registros para descargar.');
    return;
  }
  const columns = ['Empleado', 'Código', 'Sucursal', 'Movimiento', 'Fecha y hora', 'Observación'];
  const rows = records.map(record => [
    record.employeeName, record.employeeCode, record.branch, record.type,
    formatDateTime(record.datetime), record.note || ''
  ]);
  const csv = [columns, ...rows].map(row => row.map(value =>
    `"${String(value).replace(/"/g, '""')}"`
  ).join(',')).join('\r\n');
  const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'reporte_asistencia.csv';
  link.click();
  URL.revokeObjectURL(url);
});

function renderAll() {
  renderEmployees();
  renderAttendance();
  renderReports();
}

saveData();
renderAll();
