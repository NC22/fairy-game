    
    var wallsScale = 1.0;
    var SPRITES = {

        goblin:{img:null, imgSrc:'gobo.png', scale:1.4, ox : 0, oy : -8, ty : -16},
        spider:{img:null, imgSrc:'spider.png', scale:1.4, ox : 0, oy : -8, ty : -16},
        skeleton:{img:null, imgSrc:'skelet.png', scale:1.4, ox : 0, oy : -8, ty : -16},
        mice:{img:null, imgSrc:'mice.png', scale:1.4, ox : 0, oy : 0, ty : 0},
        bat:{img:null, imgSrc:'bat.png', scale:1.4, ox : 0, oy : 0, ty : 0},
        boss:{img:null, imgSrc:'dark_skull.png', scale:1.8, ox : -16, oy : -26, ty : -46},

        mentor:{img:null, imgSrc:'mentor.png', scale:1.4, ox : 0, oy : -8, ty : -26},
        
        gold:{img:null, imgSrc:'coin.png', scale:1.0, ox : 0, oy : 0},
        potion:{img:null, imgSrc:'heal_potion.png', scale:1.0, ox : 0, oy : 0},
        bow:{img:null, imgSrc:'bow.png', scale:1.0, ox : 0, oy : 0},
        staff:{img:null, imgSrc:'staff.png', scale:1.0, ox : 0, oy : 0},
        arrows:{img:null, imgSrc:'arrows.png', scale:1.0, ox : 0, oy : 0},
        chest_clothed:{img:null, imgSrc:'chest_clothed.png', scale:1.3, ox : 0, oy : -12},
        chest_opened:{img:null, imgSrc:'chest_open.png', scale:1.3, ox : 0, oy : -12},

        key_a:{img:null, imgSrc:'key1.png', scale:1.0, ox : 0, oy : 0},
        key_b:{img:null, imgSrc:'key1_2.png', scale:1.0, ox : 0, oy : 0},
        key_c:{img:null, imgSrc:'key1_1.png', scale:1.0, ox : 0, oy : 0},

        cage_front:{img:null, imgSrc:'cage/cage_front.png', scale:1.6, ox : 0, oy : -10},
        cage_back:{img:null, imgSrc:'cage/cage_front.png', scale:1.6, ox : 0, oy : -10},
        cage_a:{img:null, imgSrc:'cage/cage_a.png', scale:1.6, ox : 0, oy : -10},
        cage_b:{img:null, imgSrc:'cage/cage_b.png', scale:1.6, ox : 0, oy : -10},
        cage_c:{img:null, imgSrc:'cage/cage_c.png', scale:1.6, ox : 0, oy : -10},
        
        fairy_a:{img:null},
        fairy_b:{img:null},
        fairy_c:{img:null},

        npc:{img:null},
        player:{img:null},

        tombstone:{ img:null, imgSrc:'tombstone.png', scale:1.4, ox : 0, oy :-16, ty : -16},

        arrow:{ img:null, imgSrc:'arrow.png', scale:0.6, ox : 0, oy :0, ty : 0},
        cage:{img:null},
        
        
        avatar_mentor:{img:null, imgSrc:'avatar/mentor.png', scale:2.0, ox : 0, oy : 0},
        avatar_fialka_depressed_a:{img:null, imgSrc:'avatar/fialka_depressed_a.png', scale:2.0, ox : 0, oy : 0},
        avatar_fialka_depressed_b:{img:null, imgSrc:'avatar/fialka_depressed_b.png', scale:3.0, ox : 0, oy : 0},
        avatar_fialka_ehhh:{img:null, imgSrc:'avatar/fialka_ehhh.png', scale:3.0, ox : 0, oy : 0},
        
        
        
        
        
        door_clothed:{img:null, imgSrc:'door_closed.png', scale:0.75, ox : 0, oy : 0, scale_type : 1},
        door_open:{img:null, imgSrc:'door_open.png', scale:0.7, ox : 0, oy : 12, scale_type : 1},
        box:{img:null, imgSrc:'box.png', scale:0.76, ox : 0, oy : -10, scale_type : 1},
        barel:{img:null, imgSrc:'barel.png', scale:0.7, ox : 0, oy : 0, scale_type : 1},
        next_floor:{img:null, imgSrc:'next_floor.png', scale:0.7, ox : 0, oy : -16, scale_type : 1},
        
        
        light_v:{img:null, imgSrc:'light_v.png', scale:0.8, ox : 0, oy : 0},       
        light_h:{img:null, imgSrc:'light_h.png', scale:0.8, ox : 0, oy : 0},
        
        floor_a_1:{img:null, imgSrc:'floor/floor_a_1.png', scale:1, ox : 0, oy : 0},
        floor_a_2:{img:null, imgSrc:'floor/floor_a_2.png', scale:1, ox : 0, oy : 0},
        floor_b_1:{img:null, imgSrc:'floor/floor_b_1.png', scale:1, ox : 0, oy : 0},
        floor_b_2:{img:null, imgSrc:'floor/floor_b_2.png', scale:1, ox : 0, oy : 0},
        floor_b_3:{img:null, imgSrc:'floor/floor_b_3.png', scale:1, ox : 0, oy : 0},
        
        web_1:{img:null, imgSrc:'web1.png', scale:0.6, ox : 0, oy : 0},
        
        
        wall_h_up_a:{img:null, imgSrc:'wall/wall_h.png', scale:0.78, ox : 0, oy : 0},
        wall_h_up_b:{img:null, imgSrc:'wall/wall_h_hollow.png', scale:0.78, ox : 0, oy : 0},
        wall_h_up_c:{img:null, imgSrc:'wall/wall_h_c.png', scale:0.78, ox : 0, oy : 0},
        wall_h_up_d:{img:null, imgSrc:'wall/wall_h_d.png', scale:0.78, ox : 0, oy : 0},
        wall_h_up_e:{img:null, imgSrc:'wall/wall_h_e.png', scale:0.78, ox : 0, oy : 0},
        
        wall_dot:{img:null, imgSrc:'wall/wall_dot.png', scale:0.7, ox : 0, oy : 0},
        
        wall_v_a:{img:null, imgSrc:'wall/wall_v_a.png', scale:0.78, ox : 0, oy : 0},
        wall_v_b:{img:null, imgSrc:'wall/wall_v_b.png', scale:0.78, ox : 0, oy : 0},
        
        
        wall_h_bottom_a:{img:null, imgSrc:'wall/wall_h_bottom_a.png', scale:0.8, ox : 0, oy : 5},
        wall_h_bottom_b:{img:null, imgSrc:'wall/wall_h_bottom_b.png', scale:0.8, ox : 0, oy : 5},
        
        wall_up_corner_a:{img:null, imgSrc:'wall/wall_up_corner_exit.png', scale:0.8, ox : 0, oy : 0}, // лево вниз 
        wall_up_corner_b:{img:null, imgSrc:'wall/wall_up_corner_enter.png', scale:0.8, ox : 0, oy : 0}, // верх право add wall after wall_h 
        
        wall_down_corner_a:{img:null, imgSrc:'wall/corner_a_bottom.png', scale:0.8, ox : 0, oy : 5}, // лево вниз
        wall_down_corner_c:{img:null, imgSrc:'wall/corner_bottom_c.png', scale:0.8, ox : 6, oy : -6}, // лево вниз
        
        // corner_bottom_c - unused
        
        wall_down_corner_b:{img:null, imgSrc:'wall/corner_b_bottom.png', scale:0.8, ox : -22, oy : 5}, // лево верх
        after_corner_bottom_h_b:{img:null, imgSrc:'wall/after_corner_bottom_h_b.png', scale:0.8, ox : 0, oy : 0},
    };