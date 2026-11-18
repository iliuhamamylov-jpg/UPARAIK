'use strict';
const $ = s => document.querySelector(s);
const paths = {
  user:'<circle cx="12" cy="8" r="4"/><path d="M4 22v-2a8 8 0 0 1 16 0v2"/>',
  search:'<circle cx="10" cy="10" r="7"/><path d="m15 15 6 6"/>',
  arrow:'<path d="M3 12h17m-6-6 6 6-6 6"/>',
  pin:'<path d="M19 10c0 5-7 12-7 12S5 15 5 10a7 7 0 1 1 14 0Z"/><circle cx="12" cy="10" r="2"/>',
  cal:'<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M7 2v6m10-6v6M3 11h18"/>',
  bookmark:'<path d="M5 3h14v18l-7-5-7 5z"/>',
  left:'<path d="m15 5-7 7 7 7"/>',right:'<path d="m9 5 7 7-7 7"/>',
  close:'<path d="m5 5 14 14M19 5 5 19"/>'
};
const icon = name => `<svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">${paths[name]}</svg>`;
const action=(label,attr,cls='')=>`<button type="button" class="${cls}" ${attr}>${label}</button>`;
const circle=(glyph,label,attr)=>action(icon(glyph),`aria-label="${label}" ${attr}`,'circle');
const pill=(label,attr)=>action(label,attr,'pill');
const links=[['home','index.html','Главная'],['catalog','concerts.html','Афиша концертов'],['profile','profile.html','Личный кабинет']];
const account=new LocalAccount();
class Interface {
 constructor(){
   this.page=document.body.dataset.page;
   this.slide=0;this.offset=0;this.day=new Date(2026,10,18,12);
   this.panel=$('#panel');this.featured=['aquarium','toly','friendly','mayot','zivert'];
   this.top=['toly','friendly','mayot','zivert','aquarium','kino'];
   const brand='<a class="logo" href="index.html" aria-label="Афиша, главная"><i></i>АФИША</a>';
   const nav='<nav>'+links.map(([p,url,title])=>`<a href="${url}" ${p===this.page?'aria-current="page"':''}>${title}</a>`).join('')+'</nav>';
   $('#header').innerHTML=brand+'<small class="slogan">КОНЦЕРТЫ<br>В ГОРОДЕ</small>'+nav+`<div class="tools"><a aria-label="Поиск концертов" href="concerts.html?search=1">${icon('search')}</a><a aria-label="Профиль" href="profile.html">${icon('user')}</a></div>`;
   $('#footer').innerHTML=`<div>${brand}${nav}</div><small>© 2026 Афиша. Все права защищены.</small>`;
   if(this.page==='home' && ['#concerts','#profile'].includes(location.hash)){location.replace(location.hash==='#concerts'?'concerts.html':'profile.html');return;}
   if(this.page==='home')this.home();else if(this.page==='catalog')this.catalog();else this.profile();
   document.addEventListener('click',e=>this.click(e));
   this.panel.addEventListener('click',e=>{if(e.target===this.panel && !e.target.closest('.sheet'))this.panel.close();});
 }
 mark(c){const on=account.favorites.includes(c.id);return action(icon('bookmark'),`data-fav="${c.id}" aria-label="Избранное: ${c.name}" aria-pressed="${on}"`,'mark');}
 card(c,rank=0){return `<article class="card ${rank?'rank-card':''}"><img src="${photo(c)}" alt="" loading="lazy"><div class="shade"></div><div class="card-top">${rank?'<strong>'+String(rank).padStart(2,'0')+'</strong>':'<span class="badge">'+(this.page==='catalog'?c.genre:'Концерт')+'</span>'}${this.mark(c)}</div><div class="card-info">${rank?'':'<small>'+dateText(c)+'</small>'}<h3><button data-open="${c.id}">${c.name}</button></h3>${rank?'<small>▲ '+fmt(c.count)+' бронирований</small>':`<p>${icon('pin')} ${c.venue}</p><span class="price">от ${rub(c.price)}</span>`}</div></article>`;}
 heading(title,note='',link=''){return `<div class="heading"><h2>${title}</h2>${note?'<p>'+note+'</p>':''}${link?'<a href="concerts.html">'+link+' '+icon('arrow')+'</a>':''}</div>`;}
 home(){
   $('#main').innerHTML=`<section class="hero" id="hero"></section><section class="block">${this.heading('Топ-событий','','Все события')}<div class="grid" id="top"></div><div class="carousel-nav">${circle('left','Предыдущие события','data-top="-1"')}${circle('right','Следующие события','data-top="1"')}</div></section><section class="block">${this.heading('Календарь<br>концертов','Выберите дату и узнайте, какие концерты пройдут в этот день','Вся афиша')}<div class="cal-layout" id="calendar"></div></section><section class="block">${this.heading('Топ-10<br>исполнителей','Самые популярные артисты по количеству бронирований')}<div class="rank-first">${concerts.slice(0,3).map((c,i)=>this.card(c,i+1)).join('')}</div><div class="rank-rest">${concerts.slice(3).map((c,i)=>this.card(c,i+4)).join('')}</div></section>`;
   this.hero();this.topCards();this.calendar();
 }
 hero(){const c=byId(this.featured[this.slide]);$('#hero').innerHTML=`<img class="hero-photo" src="${photo(c)}" alt=""><div class="hero-shade"></div><div class="hero-copy"><span>К О Н Ц Е Р Т</span><h1>${c.name}</h1><p>${icon('cal')} ${dateText(c)} <i></i> ${icon('pin')} ${c.venue}</p>${action('Купить билет '+icon('arrow'),`data-open="${c.id}"`,'hero-buy')}</div>${circle('left','Предыдущий концерт','data-slide="-1"')}${circle('right','Следующий концерт','data-slide="1"')}<div class="progress"><b>0${this.slide+1}</b> / 05　${this.featured.map((_,i)=>action('',`data-goto="${i}" aria-label="Слайд ${i+1}"`,i===this.slide?'on':'')).join('')}</div>`;}
 topCards(){$('#top').innerHTML=Array.from({length:4},(_,i)=>this.card(byId(this.top[(this.offset+i)%this.top.length]))).join('');}
 calendar(){const d=this.day,y=d.getFullYear(),m=d.getMonth();const start=(new Date(y,m,1).getDay()+6)%7;const matches=concerts.filter(c=>c.date.toDateString()===d.toDateString());
 $('#calendar').innerHTML=`<div class="calendar-box"><div class="month">${circle('left','Предыдущий месяц','data-month="-1"')}<b>${d.toLocaleDateString('ru-RU',{month:'long',year:'numeric'}).replace(' г.','')}</b>${circle('right','Следующий месяц','data-month="1"')}</div><div class="days">${'ПН ВТ СР ЧТ ПТ СБ ВС'.split(' ').map(s=>'<small>'+s+'</small>').join('')}${'<i></i>'.repeat(start)}${Array.from({length:new Date(y,m+1,0).getDate()},(_,i)=>action(i+1,`data-day="${i+1}"`,[i+1===d.getDate()?'active':'',concerts.some(c=>c.date.getFullYear()===y&&c.date.getMonth()===m&&c.day===i+1)?'has-show':''].join(' '))).join('')}</div></div><div><h3>Концерты ${d.toLocaleDateString('ru-RU',{day:'numeric',month:'long'})}</h3>${matches.length?matches.map(c=>this.row(c)).join(''):'<p>На эту дату концертов пока нет.</p>'}</div>`;}
 row(c){return `<button class="event-row" data-open="${c.id}"><img src="${photo(c)}" alt=""><span><small>КОНЦЕРТ</small><strong>${c.name}</strong>${c.time} · ${c.venue}</span><b>от ${rub(c.price)}</b></button>`;}
 catalog(){
   const choices=(key,values)=>values.map(s=>`<label><input name="${key}" type="checkbox" value="${s}"> ${s}</label>`).join('');
   $('#main').innerHTML=`<section class="block catalog"><div class="heading"><h1>Каталог<br>концертов</h1><p>Все концерты города<br>в одном месте</p><select aria-label="Сортировка" id="sort"><option value="date">По дате</option><option value="price">По цене</option></select></div><div class="catalog-layout"><form id="filters"><div class="between"><h2>Фильтры</h2><button type="reset">Сбросить</button></div><fieldset><legend>Дата</legend><input aria-label="Дата концерта" name="date" type="date"></fieldset><fieldset><legend>Жанр</legend>${choices('genre',['Рэп','Рок','Поп'])}</fieldset><fieldset><legend>Площадка</legend>${choices('venue',[...new Set(concerts.map(c=>c.venue))])}</fieldset><fieldset><legend>Стоимость</legend><label>До <output id="limit">10 000</output> ₽<input type="range" min="1000" max="10000" step="100" name="price" value="10000"></label></fieldset></form><div><label class="search">${icon('search')}<input type="search" id="query" placeholder="Поиск концертов, артистов или площадок"></label><div id="results" class="results"></div></div></div></section>`;
   $('#filters').oninput=$('#query').oninput=$('#sort').onchange=()=>this.filter();
   $('#filters').onreset=()=>{ $('#query').value='';setTimeout(()=>this.filter(),0);};this.filter();if(location.search)$('#query').focus();
 }
 filter(){const f=new FormData($('#filters')),q=$('#query').value.trim().toLowerCase();$('#limit').textContent=fmt(f.get('price'));
 const items=concerts.filter(c=>(c.name+' '+c.venue).toLowerCase().includes(q)&&(!f.get('date')||new Date(f.get('date')+'T12:00:00').toDateString()===c.date.toDateString())&&['genre','venue'].every(k=>!f.has(k)||f.getAll(k).includes(c[k]))&&c.price<=Number(f.get('price'))).sort((a,b)=>a[$('#sort').value]-b[$('#sort').value]);
 $('#results').innerHTML=items.map(c=>this.card(c)).join('')||'<p>По этим условиям концертов нет.</p>';}
 profile(){const p=account.profile;$('#main').innerHTML=`<section class="block profile"><div class="profile-banner"><h1>Профиль</h1><p>Управление личными данными и настройками</p><div class="identity"><img src="assets/avatar.jpg" alt=""><strong>${escapeText(p.name)}</strong><span>Email<b>${escapeText(p.email)}</b></span><span>Телефон<b>${escapeText(p.phone)}</b></span>${pill('Редактировать','data-edit')}</div></div><h2>Мои билеты</h2>${account.tickets.map(t=>{const c=byId(t.id);return `<article class="ticket"><img src="${photo(c)}" alt=""><div><h3>${c.name}</h3><p>${dateText(c)} · ${c.time} · ${c.venue}</p></div>${pill('Посмотреть билет',`data-ticket="${t.key}"`)}</article>`;}).join('')||'<div class="empty">У вас пока нет билетов. <a href="concerts.html">Выбрать концерт →</a></div>'}<h2>Избранное</h2><div class="grid">${account.favorites.map(byId).filter(Boolean).map(c=>this.card(c)).join('')||'<p>Сохраните концерт закладкой на афише.</p>'}</div></section>`;}
 modal(html,wide=false){this.panel.classList.toggle('wide',wide);this.panel.innerHTML='<div class="sheet">'+circle('close','Закрыть','data-close')+html+'</div>';if(!this.panel.open)this.panel.showModal();}
 poster(c){return `<div class="poster"><img src="${photo(c)}" alt=""><div><span class="badge">Концерт</span><strong>${c.name}</strong></div></div>`;}
 detail(id){const c=byId(id);this.current=c;this.modal(this.poster(c)+`<div class="sheet-body"><h2 id="panel-title">Концерт ${c.name}</h2><p>Большой сольный концерт. Живой звук и главные хиты.</p><dl><div><dt>Дата</dt><dd>${dateText(c)}</dd></div><div><dt>Время</dt><dd>${c.time}</dd></div><div><dt>Площадка</dt><dd>${c.venue}</dd></div></dl><h3>Об артисте</h3><p>${c.name} · ${c.genre}</p><div class="buy-row"><b>от ${rub(c.price)}</b>${pill('Выбрать место '+icon('arrow'),'data-seats')}</div></div>`);}
 seatPrice(n){return this.current.price+(11-Math.floor(n/16))*100;}
 seatLabel(n){return 'Ряд '+(1+Math.floor(n/16))+', место '+(n%16+1);}
 seats(){const c=this.current,occupied=new Set(account.tickets.filter(t=>t.id===c.id).flatMap(t=>t.seats));let grid='';for(let r=0;r<12;r++){grid+='<div class="seat-line"><small>'+(r+1)+'</small>';for(let s=0;s<16;s++){let n=r*16+s,used=occupied.has(n)||(n*19+7)%17<3;grid+=action('',`data-seat="${n}" aria-label="${this.seatLabel(n)}, ${rub(this.seatPrice(n))}" aria-pressed="${this.selected.has(n)}" ${used?'disabled':''}`,'seat');}grid+='</div>';}
 const selected=[...this.selected];this.modal(this.poster(c)+`<div class="sheet-body"><h2 id="panel-title">Выбор мест</h2><small>1　Выбор мест　　 2　Подтверждение　　 3　Готово</small><div class="seat-layout"><div class="hall"><div class="stage">С Ц Е Н А</div>${grid}<p class="legend">■ Свободно　 <em>■ Выбрано</em>　 × Занято</p></div><aside><h3>Выбранные места</h3>${selected.map(n=>'<p>'+this.seatLabel(n)+' · '+rub(this.seatPrice(n))+'</p>').join('')||'<p>Выберите место на схеме.</p>'}<hr><b>Итого　${rub(this.total())}</b>${pill('Продолжить','data-confirm '+(!selected.length?'disabled':''))}</aside></div></div>`,true);}
 total(){return [...this.selected].reduce((t,n)=>t+this.seatPrice(n),0);}
 form(){const p=account.profile;this.modal(`<form id="edit" class="sheet-body"><h2 id="panel-title">Личные данные</h2>${[['name','Имя','text'],['email','Email','email'],['phone','Телефон','tel']].map(([k,l,t])=>`<label>${l}<input type="${t}" name="${k}" required maxlength="100" value="${escapeText(p[k])}"></label>`).join('')}<button class="pill">Сохранить</button></form>`);$('#edit').onsubmit=e=>{e.preventDefault();account.save('profile',Object.fromEntries(new FormData(e.target)));this.panel.close();this.profile();};}
 click(e){const b=e.target.closest('button');if(!b)return;const d=b.dataset;
 if('open'in d)this.detail(d.open);
 if('close'in d)this.panel.close();
 if('fav'in d){account.toggle(d.fav);document.querySelectorAll('[data-fav="'+d.fav+'"]').forEach(el=>el.setAttribute('aria-pressed',account.favorites.includes(d.fav)));if(this.page==='profile')this.profile();}
 if('slide'in d||'goto'in d){this.slide='goto'in d?+d.goto:(this.slide+Number(d.slide)+5)%5;this.hero();}
 if('top'in d){this.offset=(this.offset+Number(d.top)+this.top.length)%this.top.length;this.topCards();}
 if('day'in d||'month'in d){if(d.day)this.day.setDate(+d.day);else this.day=new Date(this.day.getFullYear(),this.day.getMonth()+Number(d.month),1,12);this.calendar();}
 if('edit'in d)this.form();
 if('seats'in d){this.selected=new Set();this.seats();}
 if('seat'in d){const n=+d.seat;if(this.selected.has(n))this.selected.delete(n);else this.selected.add(n);this.seats();this.panel.querySelector('[data-seat="'+n+'"]').focus();}
 if('confirm'in d)this.modal(`<div class="sheet-body"><h2 id="panel-title">Подтверждение брони</h2><h3>${this.current.name}</h3><p>${dateText(this.current)} · ${this.current.venue}</p><p>${[...this.selected].map(n=>this.seatLabel(n)).join('<br>')}</p><div class="buy-row"><b>${rub(this.total())}</b>${pill('Забронировать','data-book')}</div></div>`);
 if('book'in d){account.reserve(this.current.id,[...this.selected],this.total());this.modal('<div class="sheet-body"><h2 id="panel-title">Места забронированы</h2><a class="pill" href="profile.html">Открыть мои билеты</a></div>');}
 if('ticket'in d){const t=account.tickets.find(t=>t.key===d.ticket),c=byId(t.id);this.modal(this.poster(c)+`<div class="sheet-body"><h2 id="panel-title">Ваш билет</h2><h3>${c.name}</h3><p>${dateText(c)} · ${c.time}<br>${c.venue}</p><p>${t.seats.map(n=>this.seatLabel(n)).join('<br>')}</p><b>${rub(t.total)}</b><hr>${pill('Отменить бронь',`data-cancel="${t.key}"`)}</div>`);}
 if('cancel'in d){account.cancel(d.cancel);this.panel.close();this.profile();}
 }
}
new Interface();
