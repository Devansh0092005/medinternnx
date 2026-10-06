const coursesFallback=[
{id:1,icon:"🧪",name:"Pharmacovigilance",description:"Learn how medicines are monitored for safety.",duration:"4 weeks",level:"Beginner",topics:["ADRs","Case processing","Safety databases","Signal detection","PV reporting & compliance"],modules:["PV fundamentals","Adverse Drug Reactions","Case processing workflow","Signal detection","Final practical task"]},
{id:2,icon:"🔬",name:"Clinical Research",description:"Build a foundation in clinical trials and GCP.",duration:"4 weeks",level:"Beginner",topics:["Trial phases","Good Clinical Practice","Study documents","Patient safety","Clinical data basics"],modules:["Clinical research fundamentals","Trial phases","GCP and ethics","Study documents","Final practical task"]},
{id:3,icon:"✍️",name:"Medical Writing",description:"Develop practical scientific and healthcare communication skills.",duration:"4 weeks",level:"Beginner",topics:["Scientific writing","Literature review","Abstracts","Referencing","Healthcare communication"],modules:["Medical writing basics","Literature review","Scientific structure","Referencing","Final writing task"]},
{id:4,icon:"📋",name:"Regulatory Affairs",description:"Explore drug regulations, submissions and compliance.",duration:"4 weeks",level:"Beginner",topics:["Regulatory pathways","Dossier basics","Drug labeling","Compliance","Submission lifecycle"],modules:["Regulatory fundamentals","Drug development pathway","Dossier basics","Labeling and compliance","Final practical task"]},
{id:5,icon:"🏥",name:"Hospital Administration",description:"Learn practical hospital operations and quality concepts.",duration:"4 weeks",level:"Beginner",topics:["Hospital operations","Quality management","Patient services","Documentation","Healthcare management"],modules:["Hospital operations","Patient services","Quality management","Documentation","Final practical task"]},
{id:6,icon:"🤖",name:"AI in Healthcare",description:"Discover responsible AI applications across healthcare.",duration:"4 weeks",level:"Beginner",topics:["AI fundamentals","Healthcare use cases","Clinical decision support","Medical data","Responsible AI"],modules:["AI fundamentals","Healthcare use cases","Clinical decision support","Medical data","Responsible AI task"]}
];

let sb=null,user=null,courses=[],enrollments=[],progress=[];
function courseContent(courseName){
  return (window.MEDINTERNX_CONTENT && window.MEDINTERNX_CONTENT[courseName]) || [];
}
function moduleTitle(courseName,index,course){
  const content=courseContent(courseName)[index];
  if(content) return content.title;
  const mods=Array.isArray(course.modules)?course.modules:JSON.parse(course.modules||"[]");
  return typeof mods[index]==="object" ? (mods[index].title||`Module ${index+1}`) : mods[index];
}
function moduleContent(courseName,index,course){
  const content=courseContent(courseName)[index];
  if(content) return content;
  const mods=Array.isArray(course.modules)?course.modules:JSON.parse(course.modules||"[]");
  const raw=mods[index];
  return {title: typeof raw==="object" ? (raw.title||`Module ${index+1}`) : raw, lesson:"Learning content for this module will be updated soon.", objectives:[], activity:"Review the module topic and complete the practical task.", quiz:"Knowledge check: What is the main purpose of this module?"};
}
function configured(){return window.MEDINTERNX_SUPABASE_URL && !window.MEDINTERNX_SUPABASE_URL.includes("YOUR_") && window.MEDINTERNX_SUPABASE_KEY && !window.MEDINTERNX_SUPABASE_KEY.includes("YOUR_")}
async function init(){
 if(!configured()){courses=coursesFallback;renderCourses();setMsg("loginMsg","Add your Supabase values in config.js to enable real accounts.","#b26a00");return}
 sb=window.supabase.createClient(window.MEDINTERNX_SUPABASE_URL,window.MEDINTERNX_SUPABASE_KEY);
 const {data}=await sb.auth.getSession(); user=data.session?.user||null;
 sb.auth.onAuthStateChange((_e,s)=>{user=s?.user||null;refreshUI()});
 await refreshUI();
}
async function refreshUI(){
 document.getElementById("navLogin").classList.toggle("hidden",!!user);
 document.getElementById("navRegister").classList.toggle("hidden",!!user);
 document.getElementById("navLogout").classList.toggle("hidden",!user);
 if(sb){await loadCourses(); if(user) await loadDashboard(); else showLoggedOut()}
}
async function loadCourses(){
 const {data,error}=await sb.from("courses").select("*").order("id");
 courses=error||!data?.length?coursesFallback:data;
 renderCourses();
}
function renderCourses(){
 const q=(document.getElementById("search")?.value||"").toLowerCase();
 const list=courses.filter(c=>(c.name+" "+c.description).toLowerCase().includes(q));
 document.getElementById("courseGrid").innerHTML=list.map(c=>`<article class="course"><div class="icon">${c.icon}</div><h3>${c.name}</h3><p>${c.description}</p><div class="tags"><span class="tag">${c.duration}</span><span class="tag">${c.level}</span><span class="tag">Free</span></div><button class="btn" onclick="openCourse(${c.id})">${user?'View & enroll':'View course'}</button></article>`).join("");
}
async function openCourse(id){
 const c=courses.find(x=>Number(x.id)===Number(id)); if(!c)return;
 const mods=Array.isArray(c.modules)?c.modules:JSON.parse(c.modules||"[]");
 const content=courseContent(c.name);
 document.getElementById("courseDetails").innerHTML=`<span class="eyebrow">FREE INTERNSHIP</span><h2>${c.icon} ${c.name}</h2><p>${c.description}</p><div class="detail-grid"><div><b>Duration</b>${c.duration}</div><div><b>Level</b>${c.level}</div><div><b>Topics</b>${(c.topics||[]).join(", ")}</div><div><b>Modules</b>${mods.length}</div></div><h3>Learning modules</h3>${mods.map((m,i)=>`<div class="module-box module-link"><span><b>${i+1}. ${moduleTitle(c.name,i,c)}</b><small>${content[i]?.lesson||"Open this module to study the lesson and practical task."}</small></span><button class="btn btn-outline" onclick="openLesson(${c.id},${i})">Learn</button></div>`).join("")}<br><button class="btn btn-lg" onclick="enroll(${c.id})">${user?'Enroll / unlock course':'Register to unlock'}</button>`;
 openModal("courseModal");
}
function openLesson(courseId,index){
 const c=courses.find(x=>Number(x.id)===Number(courseId)); if(!c)return;
 const m=moduleContent(c.name,index,c);
 const objectives=Array.isArray(m.objectives)?m.objectives:(m.objectives?[m.objectives]:[]);
 document.getElementById("lessonDetails").innerHTML=`<span class="eyebrow">${c.icon} ${c.name}</span><h2>Module ${index+1}: ${m.title}</h2><div class="lesson-section"><h3>📖 Lesson</h3><p>${m.lesson||"Lesson material will appear here."}</p></div><div class="lesson-section"><h3>🎯 Learning objectives</h3><ul>${objectives.map(x=>`<li>${x}</li>`).join("")}</ul></div><div class="lesson-section"><h3>💡 Practical task</h3><p>${m.activity||"Complete the practical activity for this module."}</p></div><div class="lesson-section quiz"><h3>📝 Knowledge check</h3><p>${m.quiz||"Review the lesson and test your understanding."}</p></div><button class="btn" onclick="closeModal('lessonModal');${user?`openCourse(${c.id})`:`openAuth('register')`}">Back to course</button>`;
 closeModal("courseModal"); openModal("lessonModal");
}
async function enroll(courseId){
 if(!user){closeModal("courseModal");openAuth("register");return}
 const {data:existing}=await sb.from("enrollments").select("*").eq("user_id",user.id).eq("course_id",courseId).maybeSingle();
 if(existing){closeModal("courseModal");document.getElementById("dashboard").scrollIntoView();return}
 const {error}=await sb.from("enrollments").insert({user_id:user.id,course_id:courseId});
 if(error){alert(error.message);return}
 closeModal("courseModal");await loadDashboard();document.getElementById("dashboard").scrollIntoView();
}
async function loadDashboard(){
 const {data:e}=await sb.from("enrollments").select("*, courses(*)").eq("user_id",user.id).order("enrolled_at",{ascending:false});
 enrollments=e||[];
 const ids=enrollments.map(x=>x.id);
 progress=ids.length?(await sb.from("module_progress").select("*").in("enrollment_id",ids)).data||[]:[];
 const {data:p}=await sb.from("profiles").select("*").eq("id",user.id).maybeSingle();
 document.getElementById("dashTitle").textContent=`Welcome, ${p?.full_name||user.email}`;
 document.getElementById("dashSub").textContent="Your enrolled internship and saved progress.";
 if(!enrollments.length){document.getElementById("dashboardContent").innerHTML=`<div class="empty">You haven't enrolled yet. <a href="#courses">Choose an internship</a>.</div>`;return}
 document.getElementById("dashboardContent").innerHTML=enrollments.map(e=>{
   const c=e.courses; const mods=Array.isArray(c.modules)?c.modules:JSON.parse(c.modules||"[]");
   const done=progress.filter(p=>p.enrollment_id===e.id&&p.completed).length; const pct=Math.round(done/mods.length*100);
   return `<div class="enroll"><div class="dash-top"><div><h3>${c.icon} ${c.name}</h3><p>${c.duration} • ${done}/${mods.length} modules complete</p></div><b>${pct}%</b></div><div class="progress"><div class="bar" style="width:${pct}%"></div></div>${mods.map((m,i)=>{const ok=progress.some(p=>p.enrollment_id===e.id&&p.module_index===i&&p.completed);return `<div class="module-row"><span><b>${i+1}. ${moduleTitle(c.name,i,c)}</b><small>${ok?'Completed':'Study the lesson before marking complete'}</small></span><div class="module-actions"><button class="btn btn-outline" onclick="openLesson(${c.id},${i})">Learn</button><button class="${ok?'btn btn-outline':'btn'}" onclick="toggleModule(${e.id},${i},${ok})">${ok?'✓ Completed':'Mark complete'}</button></div></div>`}).join("")}${pct===100?`<div class="success"><h3>🎉 Internship completed!</h3><p>Your certificate options are now unlocked. The e-certificate fee is shown only at this stage.</p><button class="btn" onclick="certificateInfo()">View certificate options</button></div>`:""}</div><hr>`;
 }).join("");
}
async function toggleModule(enrollmentId,index,currently){
 if(currently){return}
 const {error}=await sb.from("module_progress").upsert({enrollment_id:enrollmentId,module_index:index,completed:true,completed_at:new Date().toISOString()},{onConflict:"enrollment_id,module_index"});
 if(error){alert(error.message);return}
 const e=enrollments.find(x=>x.id===enrollmentId); const c=e.courses; const mods=Array.isArray(c.modules)?c.modules:JSON.parse(c.modules||"[]");
 const count=(await sb.from("module_progress").select("*",{count:"exact",head:true}).eq("enrollment_id",enrollmentId).eq("completed",true)).count||0;
 if(count>=mods.length) await sb.from("enrollments").update({completed_at:new Date().toISOString()}).eq("id",enrollmentId).eq("user_id",user.id);
 await loadDashboard();
}
function certificateInfo(){alert("Certificate options unlocked after successful completion. Connect your payment provider when you are ready to collect the ₹49 e-certificate fee.");}
function showLoggedOut(){document.getElementById("dashTitle").textContent="Login to see your dashboard";document.getElementById("dashSub").textContent="Your enrolled internship and saved progress will appear here.";document.getElementById("dashboardContent").innerHTML='<div class="empty">Please register or login to access your student dashboard.</div>'}
async function register(e){
 e.preventDefault(); if(!sb){setMsg("regMsg","First add your Supabase URL and key in config.js.","#b26a00");return}
 const name=document.getElementById("regName").value.trim(),email=document.getElementById("regEmail").value.trim(),password=document.getElementById("regPassword").value;
 setMsg("regMsg","Creating account...","#49617a");
 const {data,error}=await sb.auth.signUp({email,password,options:{data:{full_name:name}}});
 if(error){setMsg("regMsg",error.message,"#c0392b");return}
 if(data.user){await sb.from("profiles").upsert({id:data.user.id,full_name:name})}
 setMsg("regMsg",data.session?"Account created. You can now enroll in a course.":"Account created. Check your email if email confirmation is enabled, then login.","#087c76");
 if(data.session){setTimeout(()=>{closeModal("authModal");refreshUI()},700)}
}
async function login(e){
 e.preventDefault(); if(!sb){setMsg("loginMsg","First add your Supabase URL and key in config.js.","#b26a00");return}
 const {error}=await sb.auth.signInWithPassword({email:document.getElementById("loginEmail").value.trim(),password:document.getElementById("loginPassword").value});
 if(error){setMsg("loginMsg",error.message,"#c0392b");return}
 closeModal("authModal");await refreshUI();document.getElementById("dashboard").scrollIntoView();
}
async function logout(){await sb.auth.signOut();await refreshUI();window.scrollTo({top:0,behavior:"smooth"})}
function openAuth(tab){openModal("authModal");document.getElementById("registerForm").classList.toggle("hidden",tab!=="register");document.getElementById("loginForm").classList.toggle("hidden",tab==="register")}
function openModal(id){document.getElementById(id).classList.add("show")}
function closeModal(id){document.getElementById(id).classList.remove("show")}
function setMsg(id,text,color){const x=document.getElementById(id);x.textContent=text;x.style.color=color}
document.getElementById("navRegister").onclick=()=>openAuth("register");document.getElementById("heroRegister").onclick=()=>openAuth("register");document.getElementById("navLogin").onclick=()=>openAuth("login");document.getElementById("navLogout").onclick=logout;
document.getElementById("tabRegister").onclick=()=>openAuth("register");document.getElementById("tabLogin").onclick=()=>openAuth("login");
document.getElementById("registerForm").onsubmit=register;document.getElementById("loginForm").onsubmit=login;document.getElementById("search").oninput=renderCourses;
window.addEventListener("click",e=>{if(e.target.classList.contains("modal"))e.target.classList.remove("show")});
init();
