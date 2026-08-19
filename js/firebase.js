import { initializeApp } from 'https://www.gstatic.com/firebasejs/12.1.0/firebase-app.js';
import { getFirestore, collection, getDocs, doc, getDoc, query, where } from 'https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js';
import { getAuth, GoogleAuthProvider, signInWithPopup, signInWithEmailAndPassword, signOut, onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js';

const firebaseConfig = { apiKey:'AIzaSyCjE7kpwMZcFRVJsJcWPIQwEzgH-YrcXk0', authDomain:'registro-edu-aa4c8.firebaseapp.com', projectId:'registro-edu-aa4c8', storageBucket:'registro-edu-aa4c8.firebasestorage.app', messagingSenderId:'1032924835108', appId:'1:1032924835108:web:f21d00c988d9898b3497b1' };
const app=initializeApp(firebaseConfig); export const db=getFirestore(app); export const auth=getAuth(app);
const provider=new GoogleAuthProvider(); provider.setCustomParameters({prompt:'select_account'});
const INSTITUTION_PATH=['instituciones','liceoCariari','cursosLectivos','2026','modalidades','bachilleratoInternacional','niveles','11','secciones'];
// Canonical assessment root shared with mate-ib:
// evaluaciones/{year}/funcionesExponenciales/{studentId}/preguntas/{questionId}/...
const ASSESSMENT_PATH=['evaluaciones','2026','funcionesExponenciales'];
const QUESTION_IDS=['P01','P02','P03','P04','P05','P06','P07','P08'];
export function watchAuth(callback){return onAuthStateChanged(auth,callback)}
export async function loginWithGoogle(){return signInWithPopup(auth,provider)}
export async function loginWithEmail(email,password){return signInWithEmailAndPassword(auth,email,password)}
export async function logout(){return signOut(auth)}
export async function loadActiveStudents(section){const ref=collection(db,...INSTITUTION_PATH,section,'estudiantes');const snap=await getDocs(query(ref,where('estado','==','activo')));return snap.docs.map(d=>{const x=d.data();return{id:d.id,name:[x.nombre,x.ap1,x.ap2].filter(Boolean).join(' '),cedulaDisplay:x.cedulaDisplay||x.cedula||''}}).sort((a,b)=>a.name.localeCompare(b.name,'es'))}
async function loadQuestionProgress(studentId,questionId){const ref=doc(db,...ASSESSMENT_PATH,studentId,'preguntas',questionId);const snap=await getDoc(ref);return snap.exists()?snap.data():null}
async function loadQuestionAttempts(studentId,questionId){const subsRef=collection(db,...ASSESSMENT_PATH,studentId,'preguntas',questionId,'subpreguntas');const subs=await getDocs(subsRef);const rows=[];for(const sub of subs.docs){const attemptsRef=collection(db,...ASSESSMENT_PATH,studentId,'preguntas',questionId,'subpreguntas',sub.id,'intentos');const attempts=await getDocs(attemptsRef);attempts.forEach(d=>rows.push({...d.data(),subquestionId:sub.id,attemptDocId:d.id}))}return rows.sort((a,b)=>(a.createdAt?.seconds||0)-(b.createdAt?.seconds||0))}
export async function loadStudentReport(studentId){const report={questions:{},attempts:[]};for(const questionId of QUESTION_IDS){const progress=await loadQuestionProgress(studentId,questionId);const attempts=await loadQuestionAttempts(studentId,questionId);report.questions[questionId]=progress||{completedParts:{},inProgress:false,completed:false};report.attempts.push(...attempts.map(a=>({...a,questionId})))}return report}
export{QUESTION_IDS};
