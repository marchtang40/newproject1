const form = document.getElementById('login-form')
const phone = document.getElementById('phone')
const email = document.getElementById('email')
const countryCode = document.getElementById('country-code')
const password = document.getElementById('password')
const submit = document.getElementById('submit')
const toggle = document.getElementById('toggle-password')
const phoneError = document.querySelector('.error[data-for="phone"]')
const emailError = document.querySelector('.error[data-for="email"]')
const passwordError = document.querySelector('.error[data-for="password"]')
const modePhoneBtn = document.getElementById('mode-phone')
const modeEmailBtn = document.getElementById('mode-email')
const phoneField = document.querySelector('.phone-field')
const emailField = document.querySelector('.email-field')

function validatePassword(value){return typeof value==='string'&&value.length>=8}
function cleanDigits(v){return (v||'').replace(/\D+/g,'')}
function validateEmail(value){return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)}
const phoneRules={
  '+86':/^(1[3-9]\d{9})$/,
  '+1':/^[2-9]\d{9}$/,
  '+852':/^[5689]\d{7}$/,
  '+81':/^\d{10,11}$/,
  '+82':/^\d{9,10}$/,
  '+65':/^[689]\d{7}$/,
  '+44':/^\d{10}$/,
  '+49':/^\d{10,11}$/,
  '+33':/^\d{9}$/,
  '+91':/^[6-9]\d{9}$/,
  '+61':/^\d{9}$/
}
const dynamicRules={}
function validatePhone(cc,digits){const rule=dynamicRules[cc]||phoneRules[cc];return (rule?rule.test(digits):/^\d{4,15}$/.test(digits))}
let mode='phone'
function updateMode(next){mode=next;modePhoneBtn.classList.toggle('active',mode==='phone');modeEmailBtn.classList.toggle('active',mode==='email');if(mode==='phone'){phoneField.hidden=false;emailField.hidden=true}else{phoneField.hidden=true;emailField.hidden=false}showErrors();updateButtonState()}
function updateButtonState(){let ok=false;if(mode==='phone'){const digits=cleanDigits(phone.value);ok=validatePhone(countryCode.value,digits)}else{ok=validateEmail(email.value)}ok=ok&&validatePassword(password.value);submit.disabled=!ok}
function showErrors(){if(mode==='phone'){const digits=cleanDigits(phone.value);phoneError.textContent=digits&& !validatePhone(countryCode.value,digits)?'请输入有效手机号':'';emailError.textContent=''}else{emailError.textContent=email.value&& !validateEmail(email.value)?'请输入有效邮箱':'';phoneError.textContent=''}passwordError.textContent=password.value&& !validatePassword(password.value)?'至少 8 位字符':''}

phone.addEventListener('input',()=>{const v=cleanDigits(phone.value);if(phone.value!==v)phone.value=v;updateButtonState();showErrors()})
email.addEventListener('input',()=>{updateButtonState();showErrors()})
countryCode.addEventListener('change',()=>{updateButtonState();showErrors()})
password.addEventListener('input',()=>{updateButtonState();showErrors()})
toggle.addEventListener('click',()=>{const t=password.getAttribute('type')==='password'?'text':'password';password.setAttribute('type',t)})
modePhoneBtn.addEventListener('click',()=>updateMode('phone'))
modeEmailBtn.addEventListener('click',()=>updateMode('email'))

form.addEventListener('submit',(e)=>{e.preventDefault();updateButtonState();showErrors();if(submit.disabled)return;let data;if(mode==='phone'){const digits=cleanDigits(phone.value);data={mode:'phone',countryCode:countryCode.value,phone:digits,fullPhone:`${countryCode.value}${digits}`,password:password.value,remember:document.getElementById('remember').checked}}else{data={mode:'email',email:email.value,password:password.value,remember:document.getElementById('remember').checked}};console.log('login',data);submit.disabled=true;submit.textContent='登录中…';setTimeout(()=>{submit.disabled=false;submit.textContent='登录';alert('已提交演示数据');},800)})


function populateFromJson(list){
  const prev=countryCode.value
  const items=(Array.isArray(list)?list:[]).map(it=>({code:(it.dial_code||'').toString().replace(/^\++/,'+'),name:it.name||it.name_zh||it.en||it.name_en||''})).filter(it=>it.code&&it.code!=='+' )
  const map=new Map()
  items.forEach(it=>{if(!map.has(it.code))map.set(it.code,it.name)})
  const pinned=['+86','+852','+853','+886','+1','+81','+82','+65','+44','+49','+33','+91','+61']
  const pinnedItems=pinned.filter(c=>map.has(c)).map(c=>({code:c,name:map.get(c)}))
  const others=[]
  map.forEach((name,code)=>{if(!pinned.includes(code))others.push({code,name})})
  others.sort((a,b)=>{const ac=parseInt(a.code.replace('+',''));const bc=parseInt(b.code.replace('+',''));return ac-bc||a.name.localeCompare(b.name)})
  // 1. 初始化选中
  if(prev && items.some(it=>it.code===prev)){countryCode.value=prev}
  if(!countryCode.value){countryCode.value='+86'}

  // --- 初始化自定义下拉框逻辑 ---
  const container = document.getElementById('custom-country-select');
  const trigger = container.querySelector('.select-trigger');
  const triggerText = container.querySelector('.trigger-text');
  const dropdown = container.querySelector('.select-dropdown');
  const searchInput = container.querySelector('.search-input');
  const optionsList = container.querySelector('.options-list');
  const hiddenInput = document.getElementById('country-code'); // 与原生select ID保持一致以便逻辑复用

  // 渲染列表函数
  const renderList = (filterText = '') => {
    optionsList.innerHTML = '';
    const filter = filterText.toLowerCase();
    
    // 过滤数据
    const filterGroup = (list) => list.filter(item => {
      return item.code.includes(filter) || item.name.toLowerCase().includes(filter);
    });

    const filteredPinned = filterGroup(pinnedItems);
    const filteredOthers = filterGroup(others);

    if (filteredPinned.length > 0) {
      const label = document.createElement('div');
      label.className = 'option-group-label';
      label.textContent = '常用';
      optionsList.appendChild(label);
      filteredPinned.forEach(item => optionsList.appendChild(createOption(item)));
    }

    if (filteredOthers.length > 0) {
      const label = document.createElement('div');
      label.className = 'option-group-label';
      label.textContent = '全部国家';
      optionsList.appendChild(label);
      filteredOthers.forEach(item => optionsList.appendChild(createOption(item)));
    }
    
    if (filteredPinned.length === 0 && filteredOthers.length === 0) {
      const empty = document.createElement('div');
      empty.className = 'option-item';
      empty.textContent = '无匹配结果';
      empty.style.color = 'var(--muted)';
      empty.style.justifyContent = 'center';
      optionsList.appendChild(empty);
    }
  };

  const createOption = (item) => {
    const div = document.createElement('div');
    div.className = `option-item ${item.code === hiddenInput.value ? 'selected' : ''}`;
    div.dataset.value = item.code;
    div.dataset.name = item.name;
    div.innerHTML = `
      <span class="option-code">${item.code}</span>
      <span class="option-name">${item.name}</span>
    `;
    div.addEventListener('click', () => selectItem(item));
    return div;
  };

  const selectItem = (item) => {
    hiddenInput.value = item.code;
    triggerText.textContent = item.code;
    closeDropdown();
    // 触发change事件以兼容已有校验逻辑
    const event = new Event('change');
    hiddenInput.dispatchEvent(event);
  };

  const openDropdown = () => {
    dropdown.hidden = false;
    trigger.setAttribute('aria-expanded', 'true');
    renderList(''); // 重置列表
    searchInput.value = '';
    searchInput.focus();
    // 高亮当前选中
    const selected = optionsList.querySelector('.selected');
    if(selected) selected.scrollIntoView({block: 'center'});
  };

  const closeDropdown = () => {
    dropdown.hidden = true;
    trigger.setAttribute('aria-expanded', 'false');
  };

  // 事件绑定
  trigger.addEventListener('click', (e) => {
    e.stopPropagation();
    dropdown.hidden ? openDropdown() : closeDropdown();
  });

  searchInput.addEventListener('input', (e) => {
    renderList(e.target.value);
  });
  
  // 点击外部关闭
  document.addEventListener('click', (e) => {
    if (!container.contains(e.target)) closeDropdown();
  });

  // 初始化显示
  triggerText.textContent = hiddenInput.value;
}
function initDialCodes(){if(window.DIAL_CODES&&Array.isArray(window.DIAL_CODES)&&window.DIAL_CODES.length){populateFromJson(window.DIAL_CODES)}else{populateCountries()}}

initDialCodes()
updateMode('phone')

// --- 注册页面逻辑 ---
const loginCard = document.getElementById('login-card');
const registerCard = document.getElementById('register-card');
const goToRegisterBtn = document.getElementById('go-to-register');
const cancelRegisterBtn = document.getElementById('cancel-register');

// 切换视图
goToRegisterBtn.addEventListener('click', (e) => {
  e.preventDefault();
  loginCard.hidden = true;
  registerCard.hidden = false;
});

cancelRegisterBtn.addEventListener('click', () => {
  registerCard.hidden = true;
  loginCard.hidden = false;
});

// 注册表单校验
const regForm = document.getElementById('register-form');
const regEmail = document.getElementById('reg-email');
const regCode = document.getElementById('reg-code');
const regPass = document.getElementById('reg-password');
const regRePass = document.getElementById('reg-repassword');
const agreeTerms = document.getElementById('agree-terms');
const regSubmit = document.getElementById('register-submit');
const sendCodeBtn = document.getElementById('send-code-btn');
const togglePassBtns = document.querySelectorAll('.toggle-password-btn');

function validateRegForm() {
  const isEmailValid = validateEmail(regEmail.value);
  const isCodeValid = regCode.value.length === 6;
  const isPassValid = validatePassword(regPass.value);
  const isRePassValid = regRePass.value === regPass.value && isPassValid;
  const isTermsChecked = agreeTerms.checked;
  const isNicknameValid = document.getElementById('reg-nickname').value.trim().length > 0;
  
  // 实时显示错误提示
  document.querySelector('.error[data-for="reg-email"]').textContent = regEmail.value && !isEmailValid ? '请输入有效邮箱' : '';
  document.querySelector('.error[data-for="code"]').textContent = regCode.value && !isCodeValid ? '验证码需为6位' : '';
  document.querySelector('.error[data-for="reg-password"]').textContent = regPass.value && !isPassValid ? '密码至少8位' : '';
  document.querySelector('.error[data-for="repassword"]').textContent = regRePass.value && regRePass.value !== regPass.value ? '两次密码不一致' : '';
  document.querySelector('.error[data-for="nickname"]').textContent = document.getElementById('reg-nickname').value && !isNicknameValid ? '昵称不能为空' : '';

  regSubmit.disabled = !(isEmailValid && isCodeValid && isPassValid && isRePassValid && isTermsChecked && isNicknameValid);
}

// 实时校验事件
[regEmail, regCode, regPass, regRePass, document.getElementById('reg-nickname')].forEach(input => {
  input.addEventListener('input', validateRegForm);
});
agreeTerms.addEventListener('change', validateRegForm);

// 发送验证码倒计时
let countdown = 0;
sendCodeBtn.addEventListener('click', () => {
  if (countdown > 0) return;
  if (!validateEmail(regEmail.value)) {
    alert('请输入有效的邮箱地址');
    return;
  }
  
  // 模拟发送
  alert(`验证码已发送至 ${regEmail.value}\n（测试验证码：123456）`);
  countdown = 60;
  sendCodeBtn.disabled = true;
  sendCodeBtn.textContent = `${countdown}s`;
  
  const timer = setInterval(() => {
    countdown--;
    if (countdown <= 0) {
      clearInterval(timer);
      sendCodeBtn.disabled = false;
      sendCodeBtn.textContent = '获取验证码';
    } else {
      sendCodeBtn.textContent = `${countdown}s`;
    }
  }, 1000);
});

// 密码显隐切换
togglePassBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    const input = btn.previousElementSibling;
    const type = input.getAttribute('type') === 'password' ? 'text' : 'password';
    input.setAttribute('type', type);
  });
});

// 注册提交
regForm.addEventListener('submit', (e) => {
  e.preventDefault();
  if (regSubmit.disabled) return;
  
  const data = {
    nickname: document.getElementById('reg-nickname').value,
    email: regEmail.value,
    code: regCode.value,
    password: regPass.value,
    timestamp: new Date().toISOString()
  };

  // 1. 验证码校验
  if (data.code !== '123456') {
    alert('验证码错误，请输入 123456');
    return;
  }
  
  // 2. 存储注册数据 (localStorage)
  try {
    const existingUsers = JSON.parse(localStorage.getItem('registered_users') || '[]');
    // 检查邮箱是否已存在
    if (existingUsers.some(u => u.email === data.email)) {
      alert('该邮箱已被注册');
      return;
    }
    
    // 存储除了验证码之外的信息
    const userData = {
      nickname: data.nickname,
      email: data.email,
      password: data.password, // 实际项目中不应明文存储
      timestamp: data.timestamp
    };
    
    existingUsers.push(userData);
    localStorage.setItem('registered_users', JSON.stringify(existingUsers));
    
    // 方便调试，打印所有用户
    console.log('当前已注册用户:', existingUsers);
  } catch (err) {
    console.error('存储失败', err);
    alert('注册失败，请重试');
    return;
  }
  
  console.log('register success', data);
  regSubmit.disabled = true;
  regSubmit.textContent = '注册中...';
  
  setTimeout(() => {
    regSubmit.disabled = false;
    regSubmit.textContent = '注册';
    alert(`注册成功！\n昵称: ${data.nickname}\n邮箱: ${data.email}\n请登录`);
    
    // 自动填充登录邮箱
    updateMode('email');
    email.value = data.email;
    
    // 切换回登录页
    registerCard.hidden = true;
    loginCard.hidden = false;
    
    // 重置注册表单
    regForm.reset();
  }, 1000);
});

// 暴露一个全局函数用于查询用户数据 (控制台调试用)
window.queryUsers = () => {
  const users = JSON.parse(localStorage.getItem('registered_users') || '[]');
  console.table(users);
  return users;
};

// 绑定调试按钮事件
const debugBtn = document.getElementById('debug-users-btn');
if (debugBtn) {
  debugBtn.addEventListener('click', () => {
    const users = window.queryUsers();
    if (users.length === 0) {
      alert('暂无注册用户');
    } else {
      const msg = users.map((u, i) => `${i + 1}. ${u.nickname} (${u.email})`).join('\n');
      alert(`已注册用户 (${users.length}人):\n${msg}\n\n详细信息请查看控制台 (F12 -> Console)`);
    }
  });
}

