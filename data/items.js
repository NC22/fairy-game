var ITEM_FLAGS = {
    BLOCKING : 1,
    BREAK : 2,  
}

var IDEFS={
    gold:   {name:'Монеты',       color:'#b8901a',dark:'#705010',sk:'gold',   type:'gold',  val:5},
    potion: {name:'Зелье',        color:'#992299',dark:'#551155',sk:'potion', type:'potion',val:6},
    bow:    {name:'Лук',          color:'#7a4e2a',dark:'#4a2a10',sk:'bow',    type:'weapon',weapon:'bow'},
    arrows: {name:'Стрелы',       color:'#a07828',dark:'#604818',sk:'arrows', type:'ammo',  val:8},
    staff: {name:'Посох мага',       color:'#a07828',dark:'#604818',sk:'staff', type:'weapon',weapon:'staff'},
    chest:  {name:'Сундук',       color:'#7a4e2a',dark:'#4a2a10',sk:'chest', type:'chest', val:0},
    key_a:  {name:'Золотой ключ',    color:'#dd2288',dark:'#440022',sk:'key_a', type:'key',   keyId:'a'},
    key_b:  {name:'Лазурный ключ',color:'#2288dd',dark:'#002244',sk:'key_b', type:'key',   keyId:'b'},
    key_c:  {name:'Рубиновый ключ',color:'#22bb66',dark:'#00331a',sk:'key_c',type:'key',  keyId:'c'},
    
    tombstone:  {name:'Надгробный камень', sk:'tombstone',type:'tombstone', isDestructable:true, isStatic:true, isBlocking:false },
    door:  {name:'Дверь',sk:'door_clothed', sk_open:'door_open', type:'door', isDestructable:false, isStatic:true, isBlocking:true },
    box:  {name:'Ящик', sk:'box', type:'box', isDestructable:true, isStatic:true , isBlocking:true},
    barel:  {name:'Бочка', sk:'barel', type:'barel', isDestructable:true, isStatic:true, isBlocking:true },
    
    web_light:  {sk:'web_1', type:'web_light', isDestructable:false, isStatic:true, isBlocking:false, isPickable:false, },
};
