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
function initDialCodes(){
  if(window.DIAL_CODES&&Array.isArray(window.DIAL_CODES)&&window.DIAL_CODES.length){
    populateFromJson(window.DIAL_CODES)
  }else{
    // 如果没有 dial_codes.js 或加载失败，使用默认数据
    const defaultCodes = [
  {"name": "中国", "en": "China", "code": "CN", "dial_code": "+86"},
  {"name": "中国香港", "en": "Hong Kong", "code": "HK", "dial_code": "+852"},
  {"name": "中国澳门", "en": "Macao", "code": "MO", "dial_code": "+853"},
  {"name": "中国台湾", "en": "Taiwan", "code": "TW", "dial_code": "+886"},
  {"name": "美国", "en": "United States", "code": "US", "dial_code": "+1"},
  {"name": "阿尔巴尼亚", "en": "Albania", "code": "AL", "dial_code": "+355"},
  {"name": "阿尔及利亚", "en": "Algeria", "code": "DZ", "dial_code": "+213"},
  {"name": "阿富汗", "en": "Afghanistan", "code": "AF", "dial_code": "+93"},
  {"name": "阿根廷", "en": "Argentina", "code": "AR", "dial_code": "+54"},
  {"name": "阿拉伯联合酋长国", "en": "United Arab Emirates", "code": "AE", "dial_code": "+971"},
  {"name": "阿鲁巴", "en": "Aruba", "code": "AW", "dial_code": "+297"},
  {"name": "阿曼", "en": "Oman", "code": "OM", "dial_code": "+968"},
  {"name": "阿塞拜疆", "en": "Azerbaijan", "code": "AZ", "dial_code": "+994"},
  {"name": "埃及", "en": "Egypt", "code": "EG", "dial_code": "+20"},
  {"name": "埃塞俄比亚", "en": "Ethiopia", "code": "ET", "dial_code": "+251"},
  {"name": "爱尔兰", "en": "Ireland", "code": "IE", "dial_code": "+353"},
  {"name": "爱沙尼亚", "en": "Estonia", "code": "EE", "dial_code": "+372"},
  {"name": "安道尔", "en": "Andorra", "code": "AD", "dial_code": "+376"},
  {"name": "安哥拉", "en": "Angola", "code": "AO", "dial_code": "+244"},
  {"name": "安圭拉", "en": "Anguilla", "code": "AI", "dial_code": "+1264"},
  {"name": "安提瓜和巴布达", "en": "Antigua and Barbuda", "code": "AG", "dial_code": "+1268"},
  {"name": "奥地利", "en": "Austria", "code": "AT", "dial_code": "+43"},
  {"name": "澳大利亚", "en": "Australia", "code": "AU", "dial_code": "+61"},
  {"name": "巴巴多斯", "en": "Barbados", "code": "BB", "dial_code": "+1246"},
  {"name": "巴布亚新几内亚", "en": "Papua New Guinea", "code": "PG", "dial_code": "+675"},
  {"name": "巴哈马", "en": "Bahamas", "code": "BS", "dial_code": "+1242"},
  {"name": "巴基斯坦", "en": "Pakistan", "code": "PK", "dial_code": "+92"},
  {"name": "巴拉圭", "en": "Paraguay", "code": "PY", "dial_code": "+595"},
  {"name": "巴林", "en": "Bahrain", "code": "BH", "dial_code": "+973"},
  {"name": "巴拿马", "en": "Panama", "code": "PA", "dial_code": "+507"},
  {"name": "巴西", "en": "Brazil", "code": "BR", "dial_code": "+55"},
  {"name": "白俄罗斯", "en": "Belarus", "code": "BY", "dial_code": "+375"},
  {"name": "百慕大", "en": "Bermuda", "code": "BM", "dial_code": "+1441"},
  {"name": "保加利亚", "en": "Bulgaria", "code": "BG", "dial_code": "+359"},
  {"name": "贝宁", "en": "Benin", "code": "BJ", "dial_code": "+229"},
  {"name": "比利时", "en": "Belgium", "code": "BE", "dial_code": "+32"},
  {"name": "秘鲁", "en": "Peru", "code": "PE", "dial_code": "+51"},
  {"name": "波多黎各", "en": "Puerto Rico", "code": "PR", "dial_code": "+1787"},
  {"name": "波兰", "en": "Poland", "code": "PL", "dial_code": "+48"},
  {"name": "波斯尼亚和黑塞哥维那", "en": "Bosnia and Herzegovina", "code": "BA", "dial_code": "+387"},
  {"name": "玻利维亚", "en": "Bolivia", "code": "BO", "dial_code": "+591"},
  {"name": "伯利兹", "en": "Belize", "code": "BZ", "dial_code": "+501"},
  {"name": "博茨瓦纳", "en": "Botswana", "code": "BW", "dial_code": "+267"},
  {"name": "不丹", "en": "Bhutan", "code": "BT", "dial_code": "+975"},
  {"name": "布基纳法索", "en": "Burkina Faso", "code": "BF", "dial_code": "+226"},
  {"name": "布隆迪", "en": "Burundi", "code": "BI", "dial_code": "+257"},
  {"name": "赤道几内亚", "en": "Equatorial Guinea", "code": "GQ", "dial_code": "+240"},
  {"name": "丹麦", "en": "Denmark", "code": "DK", "dial_code": "+45"},
  {"name": "德国", "en": "Germany", "code": "DE", "dial_code": "+49"},
  {"name": "东帝汶", "en": "East Timor", "code": "TL", "dial_code": "+670"},
  {"name": "多哥", "en": "Togo", "code": "TG", "dial_code": "+228"},
  {"name": "多米尼加共和国", "en": "Dominican Republic", "code": "DO", "dial_code": "+1809"},
  {"name": "多米尼克", "en": "Dominica", "code": "DM", "dial_code": "+1767"},
  {"name": "俄罗斯", "en": "Russia", "code": "RU", "dial_code": "+7"},
  {"name": "厄瓜多尔", "en": "Ecuador", "code": "EC", "dial_code": "+593"},
  {"name": "厄立特里亚", "en": "Eritrea", "code": "ER", "dial_code": "+291"},
  {"name": "法国", "en": "France", "code": "FR", "dial_code": "+33"},
  {"name": "法罗群岛", "en": "Faroe Islands", "code": "FO", "dial_code": "+298"},
  {"name": "法属波利尼西亚", "en": "French Polynesia", "code": "PF", "dial_code": "+689"},
  {"name": "菲律宾", "en": "Philippines", "code": "PH", "dial_code": "+63"},
  {"name": "斐济", "en": "Fiji", "code": "FJ", "dial_code": "+679"},
  {"name": "芬兰", "en": "Finland", "code": "FI", "dial_code": "+358"},
  {"name": "佛得角", "en": "Cape Verde", "code": "CV", "dial_code": "+238"},
  {"name": "冈比亚", "en": "Gambia", "code": "GM", "dial_code": "+220"},
  {"name": "刚果(布)", "en": "Congo", "code": "CG", "dial_code": "+242"},
  {"name": "刚果(金)", "en": "Democratic Republic of the Congo", "code": "CD", "dial_code": "+243"},
  {"name": "哥伦比亚", "en": "Colombia", "code": "CO", "dial_code": "+57"},
  {"name": "哥斯达黎加", "en": "Costa Rica", "code": "CR", "dial_code": "+506"},
  {"name": "格林纳达", "en": "Grenada", "code": "GD", "dial_code": "+1473"},
  {"name": "格陵兰", "en": "Greenland", "code": "GL", "dial_code": "+299"},
  {"name": "格鲁吉亚", "en": "Georgia", "code": "GE", "dial_code": "+995"},
  {"name": "古巴", "en": "Cuba", "code": "CU", "dial_code": "+53"},
  {"name": "瓜德罗普", "en": "Guadeloupe", "code": "GP", "dial_code": "+590"},
  {"name": "关岛", "en": "Guam", "code": "GU", "dial_code": "+1671"},
  {"name": "圭亚那", "en": "Guyana", "code": "GY", "dial_code": "+592"},
  {"name": "哈萨克斯坦", "en": "Kazakhstan", "code": "KZ", "dial_code": "+7"},
  {"name": "海地", "en": "Haiti", "code": "HT", "dial_code": "+509"},
  {"name": "韩国", "en": "South Korea", "code": "KR", "dial_code": "+82"},
  {"name": "荷兰", "en": "Netherlands", "code": "NL", "dial_code": "+31"},
  {"name": "黑山", "en": "Montenegro", "code": "ME", "dial_code": "+382"},
  {"name": "洪都拉斯", "en": "Honduras", "code": "HN", "dial_code": "+504"},
  {"name": "基里巴斯", "en": "Kiribati", "code": "KI", "dial_code": "+686"},
  {"name": "吉布提", "en": "Djibouti", "code": "DJ", "dial_code": "+253"},
  {"name": "吉尔吉斯斯坦", "en": "Kyrgyzstan", "code": "KG", "dial_code": "+996"},
  {"name": "几内亚", "en": "Guinea", "code": "GN", "dial_code": "+224"},
  {"name": "几内亚比绍", "en": "Guinea-Bissau", "code": "GW", "dial_code": "+245"},
  {"name": "加拿大", "en": "Canada", "code": "CA", "dial_code": "+1"},
  {"name": "加纳", "en": "Ghana", "code": "GH", "dial_code": "+233"},
  {"name": "加蓬", "en": "Gabon", "code": "GA", "dial_code": "+241"},
  {"name": "柬埔寨", "en": "Cambodia", "code": "KH", "dial_code": "+855"},
  {"name": "捷克共和国", "en": "Czech Republic", "code": "CZ", "dial_code": "+420"},
  {"name": "津巴布韦", "en": "Zimbabwe", "code": "ZW", "dial_code": "+263"},
  {"name": "喀麦隆", "en": "Cameroon", "code": "CM", "dial_code": "+237"},
  {"name": "卡塔尔", "en": "Qatar", "code": "QA", "dial_code": "+974"},
  {"name": "开曼群岛", "en": "Cayman Islands", "code": "KY", "dial_code": "+1345"},
  {"name": "科摩罗", "en": "Comoros", "code": "KM", "dial_code": "+269"},
  {"name": "科特迪瓦", "en": "Cote d'Ivoire", "code": "CI", "dial_code": "+225"},
  {"name": "科威特", "en": "Kuwait", "code": "KW", "dial_code": "+965"},
  {"name": "克罗地亚", "en": "Croatia", "code": "HR", "dial_code": "+385"},
  {"name": "肯尼亚", "en": "Kenya", "code": "KE", "dial_code": "+254"},
  {"name": "库克群岛", "en": "Cook Islands", "code": "CK", "dial_code": "+682"},
  {"name": "拉脱维亚", "en": "Latvia", "code": "LV", "dial_code": "+371"},
  {"name": "莱索托", "en": "Lesotho", "code": "LS", "dial_code": "+266"},
  {"name": "老挝", "en": "Laos", "code": "LA", "dial_code": "+856"},
  {"name": "黎巴嫩", "en": "Lebanon", "code": "LB", "dial_code": "+961"},
  {"name": "立陶宛", "en": "Lithuania", "code": "LT", "dial_code": "+370"},
  {"name": "利比里亚", "en": "Liberia", "code": "LR", "dial_code": "+231"},
  {"name": "利比亚", "en": "Libya", "code": "LY", "dial_code": "+218"},
  {"name": "列支敦士登", "en": "Liechtenstein", "code": "LI", "dial_code": "+423"},
  {"name": "留尼汪", "en": "Reunion", "code": "RE", "dial_code": "+262"},
  {"name": "卢森堡", "en": "Luxembourg", "code": "LU", "dial_code": "+352"},
  {"name": "卢旺达", "en": "Rwanda", "code": "RW", "dial_code": "+250"},
  {"name": "罗马尼亚", "en": "Romania", "code": "RO", "dial_code": "+40"},
  {"name": "马达加斯加", "en": "Madagascar", "code": "MG", "dial_code": "+261"},
  {"name": "马尔代夫", "en": "Maldives", "code": "MV", "dial_code": "+960"},
  {"name": "马耳他", "en": "Malta", "code": "MT", "dial_code": "+356"},
  {"name": "马拉维", "en": "Malawi", "code": "MW", "dial_code": "+265"},
  {"name": "马来西亚", "en": "Malaysia", "code": "MY", "dial_code": "+60"},
  {"name": "马里", "en": "Mali", "code": "ML", "dial_code": "+223"},
  {"name": "马其顿", "en": "North Macedonia", "code": "MK", "dial_code": "+389"},
  {"name": "马绍尔群岛", "en": "Marshall Islands", "code": "MH", "dial_code": "+692"},
  {"name": "马提尼克", "en": "Martinique", "code": "MQ", "dial_code": "+596"},
  {"name": "马约特", "en": "Mayotte", "code": "YT", "dial_code": "+262"},
  {"name": "毛里求斯", "en": "Mauritius", "code": "MU", "dial_code": "+230"},
  {"name": "毛里塔尼亚", "en": "Mauritania", "code": "MR", "dial_code": "+222"},
  {"name": "美国/加拿大", "en": "United States/Canada", "code": "US", "dial_code": "+1"},
  {"name": "美属萨摩亚", "en": "American Samoa", "code": "AS", "dial_code": "+1684"},
  {"name": "蒙古", "en": "Mongolia", "code": "MN", "dial_code": "+976"},
  {"name": "蒙特塞拉特", "en": "Montserrat", "code": "MS", "dial_code": "+1664"},
  {"name": "孟加拉国", "en": "Bangladesh", "code": "BD", "dial_code": "+880"},
  {"name": "密克罗尼西亚", "en": "Micronesia", "code": "FM", "dial_code": "+691"},
  {"name": "缅甸", "en": "Myanmar", "code": "MM", "dial_code": "+95"},
  {"name": "摩尔多瓦", "en": "Moldova", "code": "MD", "dial_code": "+373"},
  {"name": "摩洛哥", "en": "Morocco", "code": "MA", "dial_code": "+212"},
  {"name": "摩纳哥", "en": "Monaco", "code": "MC", "dial_code": "+377"},
  {"name": "莫桑比克", "en": "Mozambique", "code": "MZ", "dial_code": "+258"},
  {"name": "墨西哥", "en": "Mexico", "code": "MX", "dial_code": "+52"},
  {"name": "纳米比亚", "en": "Namibia", "code": "NA", "dial_code": "+264"},
  {"name": "南非", "en": "South Africa", "code": "ZA", "dial_code": "+27"},
  {"name": "南苏丹", "en": "South Sudan", "code": "SS", "dial_code": "+211"},
  {"name": "瑙鲁", "en": "Nauru", "code": "NR", "dial_code": "+674"},
  {"name": "尼泊尔", "en": "Nepal", "code": "NP", "dial_code": "+977"},
  {"name": "尼加拉瓜", "en": "Nicaragua", "code": "NI", "dial_code": "+505"},
  {"name": "尼日尔", "en": "Niger", "code": "NE", "dial_code": "+227"},
  {"name": "尼日利亚", "en": "Nigeria", "code": "NG", "dial_code": "+234"},
  {"name": "纽埃", "en": "Niue", "code": "NU", "dial_code": "+683"},
  {"name": "挪威", "en": "Norway", "code": "NO", "dial_code": "+47"},
  {"name": "帕劳", "en": "Palau", "code": "PW", "dial_code": "+680"},
  {"name": "葡萄牙", "en": "Portugal", "code": "PT", "dial_code": "+351"},
  {"name": "日本", "en": "Japan", "code": "JP", "dial_code": "+81"},
  {"name": "瑞典", "en": "Sweden", "code": "SE", "dial_code": "+46"},
  {"name": "瑞士", "en": "Switzerland", "code": "CH", "dial_code": "+41"},
  {"name": "萨尔瓦多", "en": "El Salvador", "code": "SV", "dial_code": "+503"},
  {"name": "萨摩亚", "en": "Samoa", "code": "WS", "dial_code": "+685"},
  {"name": "塞尔维亚", "en": "Serbia", "code": "RS", "dial_code": "+381"},
  {"name": "塞拉利昂", "en": "Sierra Leone", "code": "SL", "dial_code": "+232"},
  {"name": "塞内加尔", "en": "Senegal", "code": "SN", "dial_code": "+221"},
  {"name": "塞浦路斯", "en": "Cyprus", "code": "CY", "dial_code": "+357"},
  {"name": "塞舌尔", "en": "Seychelles", "code": "SC", "dial_code": "+248"},
  {"name": "沙特阿拉伯", "en": "Saudi Arabia", "code": "SA", "dial_code": "+966"},
  {"name": "圣巴泰勒米", "en": "Saint Barthelemy", "code": "BL", "dial_code": "+590"},
  {"name": "圣多美和普林西比", "en": "Sao Tome and Principe", "code": "ST", "dial_code": "+239"},
  {"name": "圣赫勒拿", "en": "Saint Helena", "code": "SH", "dial_code": "+290"},
  {"name": "圣基茨和尼维斯", "en": "Saint Kitts and Nevis", "code": "KN", "dial_code": "+1869"},
  {"name": "圣卢西亚", "en": "Saint Lucia", "code": "LC", "dial_code": "+1758"},
  {"name": "圣马力诺", "en": "San Marino", "code": "SM", "dial_code": "+378"},
  {"name": "圣皮埃尔和密克隆", "en": "Saint Pierre and Miquelon", "code": "PM", "dial_code": "+508"},
  {"name": "圣文森特和格林纳丁斯", "en": "Saint Vincent and the Grenadines", "code": "VC", "dial_code": "+1784"},
  {"name": "斯里兰卡", "en": "Sri Lanka", "code": "LK", "dial_code": "+94"},
  {"name": "斯洛伐克", "en": "Slovakia", "code": "SK", "dial_code": "+421"},
  {"name": "斯洛文尼亚", "en": "Slovenia", "code": "SI", "dial_code": "+386"},
  {"name": "斯威士兰", "en": "Eswatini", "code": "SZ", "dial_code": "+268"},
  {"name": "苏丹", "en": "Sudan", "code": "SD", "dial_code": "+249"},
  {"name": "苏里南", "en": "Suriname", "code": "SR", "dial_code": "+597"},
  {"name": "所罗门群岛", "en": "Solomon Islands", "code": "SB", "dial_code": "+677"},
  {"name": "索马里", "en": "Somalia", "code": "SO", "dial_code": "+252"},
  {"name": "塔吉克斯坦", "en": "Tajikistan", "code": "TJ", "dial_code": "+992"},
  {"name": "泰国", "en": "Thailand", "code": "TH", "dial_code": "+66"},
  {"name": "坦桑尼亚", "en": "Tanzania", "code": "TZ", "dial_code": "+255"},
  {"name": "汤加", "en": "Tonga", "code": "TO", "dial_code": "+676"},
  {"name": "特克斯和凯科斯群岛", "en": "Turks and Caicos Islands", "code": "TC", "dial_code": "+1649"},
  {"name": "特立尼达和多巴哥", "en": "Trinidad and Tobago", "code": "TT", "dial_code": "+1868"},
  {"name": "突尼斯", "en": "Tunisia", "code": "TN", "dial_code": "+216"},
  {"name": "图瓦卢", "en": "Tuvalu", "code": "TV", "dial_code": "+688"},
  {"name": "土耳其", "en": "Turkey", "code": "TR", "dial_code": "+90"},
  {"name": "土库曼斯坦", "en": "Turkmenistan", "code": "TM", "dial_code": "+993"},
  {"name": "托克劳", "en": "Tokelau", "code": "TK", "dial_code": "+690"},
  {"name": "瓦利斯和富图纳", "en": "Wallis and Futuna", "code": "WF", "dial_code": "+681"},
  {"name": "瓦努阿图", "en": "Vanuatu", "code": "VU", "dial_code": "+678"},
  {"name": "危地马拉", "en": "Guatemala", "code": "GT", "dial_code": "+502"},
  {"name": "委内瑞拉", "en": "Venezuela", "code": "VE", "dial_code": "+58"},
  {"name": "文莱", "en": "Brunei", "code": "BN", "dial_code": "+673"},
  {"name": "乌干达", "en": "Uganda", "code": "UG", "dial_code": "+256"},
  {"name": "乌克兰", "en": "Ukraine", "code": "UA", "dial_code": "+380"},
  {"name": "乌拉圭", "en": "Uruguay", "code": "UY", "dial_code": "+598"},
  {"name": "乌兹别克斯坦", "en": "Uzbekistan", "code": "UZ", "dial_code": "+998"},
  {"name": "西班牙", "en": "Spain", "code": "ES", "dial_code": "+34"},
  {"name": "希腊", "en": "Greece", "code": "GR", "dial_code": "+30"},
  {"name": "新加坡", "en": "Singapore", "code": "SG", "dial_code": "+65"},
  {"name": "新喀里多尼亚", "en": "New Caledonia", "code": "NC", "dial_code": "+687"},
  {"name": "新西兰", "en": "New Zealand", "code": "NZ", "dial_code": "+64"},
  {"name": "匈牙利", "en": "Hungary", "code": "HU", "dial_code": "+36"},
  {"name": "叙利亚", "en": "Syria", "code": "SY", "dial_code": "+963"},
  {"name": "牙买加", "en": "Jamaica", "code": "JM", "dial_code": "+1876"},
  {"name": "亚美尼亚", "en": "Armenia", "code": "AM", "dial_code": "+374"},
  {"name": "也门", "en": "Yemen", "code": "YE", "dial_code": "+967"},
  {"name": "伊拉克", "en": "Iraq", "code": "IQ", "dial_code": "+964"},
  {"name": "伊朗", "en": "Iran", "code": "IR", "dial_code": "+98"},
  {"name": "以色列", "en": "Israel", "code": "IL", "dial_code": "+972"},
  {"name": "意大利", "en": "Italy", "code": "IT", "dial_code": "+39"},
  {"name": "印度", "en": "India", "code": "IN", "dial_code": "+91"},
  {"name": "印度尼西亚", "en": "Indonesia", "code": "ID", "dial_code": "+62"},
  {"name": "英国", "en": "United Kingdom", "code": "GB", "dial_code": "+44"},
  {"name": "英属维尔京群岛", "en": "British Virgin Islands", "code": "VG", "dial_code": "+1284"},
  {"name": "约旦", "en": "Jordan", "code": "JO", "dial_code": "+962"},
  {"name": "越南", "en": "Vietnam", "code": "VN", "dial_code": "+84"},
  {"name": "赞比亚", "en": "Zambia", "code": "ZM", "dial_code": "+260"},
  {"name": "乍得", "en": "Chad", "code": "TD", "dial_code": "+235"},
  {"name": "直布罗陀", "en": "Gibraltar", "code": "GI", "dial_code": "+350"},
  {"name": "智利", "en": "Chile", "code": "CL", "dial_code": "+56"},
  {"name": "中非共和国", "en": "Central African Republic", "code": "CF", "dial_code": "+236"}
];
    populateFromJson(defaultCodes);
    console.error('dial_codes.js not loaded, using fallback.');
  }
}

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

