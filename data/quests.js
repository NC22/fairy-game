var QUEST_TMPL=[
    {id:'kg',title:'Охота на гоблинов',desc:'Убей %n гоблинов',  target:'goblin', count:3,reward:{gold:8, xp:15},track:'kill'},
    {id:'ko',title:'Орки шалят',       desc:'Убей %n орков',     target:'orc',    count:2,reward:{gold:12,xp:20},track:'kill'},
    {id:'kb',title:'Очисти пещеру',    desc:'Убей %n мышей',     target:'bat',    count:4,reward:{gold:6, xp:12},track:'kill'},
    {id:'kbo',title:'Легендарный враг',desc:'Убей Владыку',      target:'boss',   count:1,reward:{gold:20,xp:50},track:'kill'},
    {id:'fg',title:'Нужно золото',     desc:'Собери %n монет',   target:'gold',   count:15,reward:{hp:4, xp:20},track:'gold'},
];

// ---- Sprite registry ----