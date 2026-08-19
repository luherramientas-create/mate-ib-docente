import { watchAuth, loginWithGoogle, logout, loadActiveStudents, loadStudentReport, QUESTION_IDS } from './firebase.js';

const $ = (s) => document.querySelector(s);
const state = { students:[], reports:new Map(), section:'11-A', user:null };

function setAuthMessage(text){ $('#login-message').textContent = text || ''; }
function showDashboard(show){ $('#login-panel').hidden=show; $('#dashboard').hidden=!show; }
function formatDate(ts){
  if(!ts) return '—';
  const date = ts.toDate ? ts.toDate() : new Date(ts.seconds ? ts.seconds*1000 : ts);
  return Number.isNaN(date.getTime()) ? '—' : date.toLocaleString('es-CR',{dateStyle:'short',timeStyle:'short'});
}
function formatTime(seconds){
  if(seconds===null || seconds===undefined || seconds==='') return '—';
  const n=Number(seconds); if(!Number.isFinite(n)) return String(seconds);
  if(n<60) return `${n.toFixed(0)} s`;
  return `${Math.floor(n/60)} min ${Math.round(n%60)} s`;
}
function qStatus(q, attempts){
  if(q?.completed) return ['🟢','Completada'];
  if(q?.inProgress || attempts.length) return ['🟡','En progreso'];
  return ['⚪','Sin iniciar'];
}
function questionProgress(report, qid){
  const q=report.questions[qid]||{}; const attempts=report.attempts.filter(a=>a.questionId===qid); return qStatus(q,attempts);
}
function overallProgress(report){
  const done=QUESTION_IDS.filter(id=>questionProgress(report,id)[1]==='Completada').length;
  return Math.round(done/QUESTION_IDS.length*100);
}

async function loadSection(){
  $('#students-loading').textContent=`Cargando estudiantes activos de ${state.section}…`;
  $('#students-body').innerHTML='';
  state.students=[]; state.reports.clear();
  try{
    state.students=await loadActiveStudents(state.section);
    if(!state.students.length){ $('#students-loading').textContent='No se encontraron estudiantes activos.'; return; }
    $('#students-loading').textContent=`${state.students.length} estudiantes activos`;
    for(const student of state.students){
      const report=await loadStudentReport(student.id);
      state.reports.set(student.id,report);
      renderStudentRow(student,report);
    }
  }catch(error){
    console.error(error);
    $('#students-loading').textContent='No fue posible consultar Firebase. Revisa Authentication y las Security Rules.';
  }
}

function renderStudentRow(student,report){
  const tr=document.createElement('tr');
  const button=document.createElement('button'); button.className='student-link'; button.textContent=student.name; button.addEventListener('click',()=>showStudent(student));
  const nameTd=document.createElement('td'); nameTd.appendChild(button); tr.appendChild(nameTd);
  const pTd=document.createElement('td'); pTd.textContent=`${overallProgress(report)}%`; tr.appendChild(pTd);
  QUESTION_IDS.forEach(qid=>{ const td=document.createElement('td'); const [icon,label]=questionProgress(report,qid); td.className='status'; td.title=label; td.textContent=icon; tr.appendChild(td); });
  $('#students-body').appendChild(tr);
}

function showStudent(student){
  const report=state.reports.get(student.id); if(!report) return;
  $('#student-name').textContent=student.name;
  $('#student-meta').textContent=`Sección ${state.section} · Progreso general ${overallProgress(report)}%`;
  const body=$('#attempts-body'); body.innerHTML='';
  const rows=[...report.attempts].sort((a,b)=>(a.questionId+a.subquestionId+a.attemptNumber).localeCompare(b.questionId+b.subquestionId+b.attemptNumber,undefined,{numeric:true}));
  if(!rows.length){ body.innerHTML='<tr><td colspan="8">No hay intentos registrados.</td></tr>'; }
  rows.forEach(a=>{
    const tr=document.createElement('tr');
    const values=[a.questionId,a.subquestionId,a.answer ?? '—',a.correct?'✅':'❌',a.attemptNumber ?? '—',a.hintsUsed ?? 0,a.score ?? '—',formatTime(a.timeSpent)];
    values.forEach((v,i)=>{const td=document.createElement('td'); td.textContent=String(v); if(i===7) td.title=`Registrado: ${formatDate(a.createdAt)}`; tr.appendChild(td);});
    body.appendChild(tr);
  });
  $('#student-detail').hidden=false;
  $('#student-detail').scrollIntoView({behavior:'smooth',block:'start'});
}

$('#login-google').addEventListener('click',async()=>{
  setAuthMessage('Abriendo acceso de Google…');
  try{ await loginWithGoogle(); }catch(error){ console.error(error); setAuthMessage(`No fue posible iniciar sesión: ${error.code || error.message}`); }
});
$('#logout').addEventListener('click',()=>logout());
$('#section-select').addEventListener('change',e=>{state.section=e.target.value; loadSection();});
$('#close-detail').addEventListener('click',()=>{$('#student-detail').hidden=true; window.scrollTo({top:0,behavior:'smooth'});});

watchAuth(async(user)=>{
  state.user=user||null;
  if(!user){ $('#auth-status').textContent='No autenticado'; showDashboard(false); return; }
  $('#auth-status').textContent=user.email || 'Docente autenticado';
  showDashboard(true);
  setAuthMessage('');
  await loadSection();
});
