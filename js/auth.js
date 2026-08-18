function showMessage(text,type="error"){
  const box=document.querySelector("#formMessage");if(!box)return;
  box.textContent=text;box.className=`form-message ${type}`;box.hidden=false;
}
function rememberLogin(result){
  localStorage.setItem("wiki-auth-token",result.token);
  const user=result.user,users=getUsers(),index=users.findIndex(item=>item.id===user.id);
  if(index>=0)users[index]=user;else users.push(user);
  localStorage.setItem("wiki-users",JSON.stringify(users));setCurrentUser(user);return user;
}
const loginForm=document.querySelector("#loginForm");
if(new URLSearchParams(location.search).get("passwordChanged")==="1")showMessage("密码修改成功，请使用新密码重新登录。","success");
if(loginForm)loginForm.addEventListener("submit",async event=>{
  event.preventDefault();const button=loginForm.querySelector('button[type="submit"]');if(button.disabled)return;button.disabled=true;button.textContent="正在登录…";const data=new FormData(loginForm),email=data.get("email").trim().toLowerCase(),password=data.get("password");showMessage("正在验证账号…","success");
  try{if(location.protocol==="file:")await syncUsersWithProject();const response=await fetch(wikiApiUrl("/api/auth/login"),{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({email,password})});const result=await response.json();if(!response.ok)throw new Error(result.error||"登录失败");const user=rememberLogin(result),requestedNext=new URLSearchParams(location.search).get("next"),safeNext=/^[a-z0-9-]+\.html(?:\?.*)?$/i.test(requestedNext||"")?requestedNext:null;showMessage(user.mustChangePassword?"临时密码验证成功，请立即设置新密码":"登录成功，正在跳转…","success");setTimeout(()=>location.href=user.mustChangePassword?"change-password.html":safeNext||(["admin","super_admin"].includes(user.role)?"admin.html":"index.html"),500);}catch(error){showMessage(error.message.includes("fetch")?"Smart Wiki 服务器未启动":error.message);button.disabled=false;button.textContent="登录";}
});
const registerForm=document.querySelector("#registerForm");
if(registerForm)registerForm.addEventListener("submit",async event=>{
  event.preventDefault();const data=new FormData(registerForm),name=data.get("name").trim(),email=data.get("email").trim().toLowerCase(),password=data.get("password"),confirmPassword=data.get("confirm");
  if(name.length<2)return showMessage("昵称至少需要 2 个字符");if(password.length<6)return showMessage("密码至少需要 6 个字符");if(password!==confirmPassword)return showMessage("两次输入的密码不一致");
  try{if(location.protocol==="file:")await syncUsersWithProject();const response=await fetch(wikiApiUrl("/api/auth/register"),{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({name,email,password})});const result=await response.json();if(!response.ok)throw new Error(result.error||"注册失败");const user=rememberLogin(result);showMessage(user.role==="super_admin"?"注册成功，你已成为超级管理员":"注册成功，正在返回首页…","success");setTimeout(()=>location.href=user.role==="super_admin"?"admin.html":"index.html",500);}catch(error){showMessage(error.message.includes("fetch")?"Smart Wiki 服务器未启动":error.message);}
});
if(location.protocol==="file:")syncUsersWithProject().then(users=>showMessage(`旧账户迁移完成：已写入 ${users.length} 个用户。`,"success")).catch(()=>showMessage("迁移失败：Smart Wiki 服务器尚未启动"));
