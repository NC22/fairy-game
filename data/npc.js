
// ---- NPC template additions ----
// patch NPC_TMPL to add id + spriteKey

var NPC_NAMES = {
    mentor : 'Дух наставника',
    fialka : 'Фиалка',
};


var NPC_TMPL = [
    {id:'mentor',  name: NPC_NAMES['mentor'], color:'#6688cc', spriteKey:'mentor', blocking : 1, healCoast : 3},
    {id:'fialka',  name: NPC_NAMES['fialka'], color:'#6688cc', spriteKey:'mentor', blocking : 1,}
];

// ============================================================
//  NPC DIALOGUE SCRIPTS
// ============================================================
var NPC_SCRIPTS = {
  mentor: [
    // node 0
    { idx : 0, speaker:'mentor', speakerColor:'#88aaff', avatar:'mentor',
      text:'О, настоящий путник! Сюда редко захаживают обычные люди, наверное тебе интересно было бы узнать поподробней об этом месте ? Ведь так?',
      next: 10 },
      
    { idx : 10, speaker:'fialka', speakerColor:'#88aaff', avatar:'fialka_depressed_b',
      text:'А можно мне просто домой ? Я не знаю как я здесь оказалась...',
      next: 11 },
      
    { idx : 11, speaker:'mentor', speakerColor:'#88aaff', avatar:'mentor',
      text:'Самая умная чтоли? Нет. Сперва пройди испытания',
      next: 12 },
      
    { idx : 12, speaker:'fialka', speakerColor:'#88aaff', avatar:'fialka_ehhh',
      text:'Эхх...',
      next: 1 },
      
    // node 1 - choices
    { idx : 1, speaker:'mentor', speakerColor:'#88aaff', avatar:'mentor',
      text:'Что-то хочешь у меня узнать?', choices:[
        { text:'Расскажи мне об этом месте', next:2 },
        { text:'Можешь меня вылечить?', next:20 },
        { text:'Ладно, как-нибудь сама разберусь...', next:6 }
      ]},
    // node 2
    { idx : 2, speaker:'mentor', speakerColor:'#88aaff', avatar:'mentor',
      text:'На сколько я знаю в этом подземелье заточено три феи, монстры заперли их в клетках, которые без ключа не открыть. Клетки с феями на разных этажах и подпитываются их жизненными силами',
      next: 3 },
    // node 3
    { idx : 3, speaker:'mentor', speakerColor:'#88aaff', avatar:'mentor',
      text:'Ключи можно найти у сильных монстров или в сундуках. Если ты чувствуешь что слабее какого-то монстра, то иногда лучше просто не вступать в битву если не уверена',
      next: 4 },
    // node 4
    { idx : 4, speaker:'mentor', speakerColor:'#88aaff', avatar:'mentor',
      text:'Клетки с феями могут быть на любых этажах подземелья. К каждой подходит только определенный ключ. Я помогу тебе вернутся если ты вдруг пропустишь фею на одном из этажей',
      next: 5 },
    // node 5
    { idx : 5, speaker:'mentor', speakerColor:'#88aaff', avatar:'mentor',
      text:'Если тебе удастся освободить фею, некоторое время она будет тебе помогать, уничтожая всех врагов в радиусе видимости. Если тебе удастся освободить всех трех фей, я дам тебе дальнейшие указания',
      next: 1 },
      
    // node 6
    { idx : 6,  speaker:'mentor', speakerColor:'#88aaff', avatar:'mentor',
      text:'Хм. Дело твое, надеюсь ты знаешь что делаешь, возвращайся в любое время.',
      next: null },
    { idx : 20, speaker:'mentor', speakerColor:'#88aaff', avatar:'mentor',
      text:'Если хочешь, я могу помочь, но не бесплатно.', choices:[
        { text:'Да, вот (-' + NPC_TMPL[0].healCoast + ' монет)', action:function(env){
            var pl = env.player;
            if (!pl) return 21;
            if (pl.gold < NPC_TMPL[0].healCoast) return 21;
            pl.gold -= NPC_TMPL[0].healCoast;
            pl.hp = pl.maxHp;
            env.addLog('Наставник исцелил тебя за ' + NPC_TMPL[0].healCoast + ' монет', 'pick');
            return 22;
          } },
        { text:'Пока не надо', next:1 }
      ]},

    { idx : 21, speaker:'mentor', speakerColor:'#88aaff', avatar:'mentor',
      text:'Боюсь у тебя недостаточно золота, прощай.',
      next: 1 },

    { idx : 22, speaker:'mentor', speakerColor:'#88aaff', avatar:'mentor',
      text:'Готово. Тебе должно стать получше',
      next: 1 },

  ]
};
