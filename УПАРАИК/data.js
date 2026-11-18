'use strict';
const artists = [
  ['toly','Toly Summer',18,'19:00','КЗ «Дружба»',1500,'Рэп',1240887],
  ['friendly','Friendly Thug 52 Ngg',21,'20:00','Арена-Сити',5000,'Рэп',1137204],
  ['zivert','Zivert',28,'21:00','Мега Арена',4000,'Поп',987519],
  ['mayot','Mayot & OG Buda',25,'19:00','КЗ «Дружба»',3500,'Рэп',742630],
  ['aquarium','Аквариум',23,'19:00','КЗ «Дружба»',2500,'Рок',689451],
  ['basta','Баста',29,'19:00','Мега Арена',3200,'Рэп',653907],
  ['macan','Macan',30,'20:00','Арена-Сити',2500,'Рэп',611284],
  ['kino','Кино',2,'20:00','КЗ «Москва»',2000,'Рок',573901],
  ['splin','Сплин',5,'19:00','КЗ «Москва»',2300,'Рок',521776],
  ['zemfira','Земфира',8,'20:00','Мега Арена',4200,'Рок',497320]
];
const concerts = artists.map(([id,name,day,time,venue,price,genre,count],i)=>({
  id,name,day,time,venue,price,genre,count,
  date: new Date(2026,i<7?10:11,day,12)
}));
const byId = id => concerts.find(c=>c.id===id);
const fmt = n => Number(n).toLocaleString('ru-RU');
const rub = n => fmt(n)+' ₽';
const dateText = c => c.date.toLocaleDateString('ru-RU',{day:'numeric',month:'long',year:'numeric'}).replace(' г.','');
const photo = c => 'assets/'+c.id+'.jpg';
const escapeText = s => String(s).replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
class LocalAccount {
  read(key,initial){try{return JSON.parse(localStorage.getItem('afisha.v3.'+key))??initial;}catch{return initial;}}
  save(key,value){localStorage.setItem('afisha.v3.'+key,JSON.stringify(value));}
  get tickets(){return this.read('tickets',[]);}
  get profile(){return this.read('profile',{name:'RKS',email:'rks@mail.ru',phone:'+7 999 123-45-67'});}
  get favorites(){return this.read('favorites',[]);}
  toggle(id){const ids=new Set(this.favorites);if(ids.has(id))ids.delete(id);else ids.add(id);this.save('favorites',[...ids]);}
  reserve(id,seats,total){this.save('tickets',[...this.tickets,{key:crypto.randomUUID(),id,seats,total}]);}
  cancel(key){this.save('tickets',this.tickets.filter(t=>t.key!==key));}
}
