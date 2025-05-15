let tab= document.getElementsByTagName("td");
let lines = document.getElementsByTagName("tr");
let caption = document.querySelector("#turn-indicator");
let step = 0;
let dead_pieces = new Array();
let target_list = new Array();
let blacks = new Array();
let whites = new Array();
let wrooks = new Array();
let brooks = new Array();
let ennemy = "noir";
let friend = "";
let target = null;
let target_line = 0;
let self_line = 0;
let dif = 0;
let l = 0;
let current_turn = "blanc";
let selected_piece = null;
let bg_color = "";
let wking = null;
let bking = null;

let playing = true;

const reload = document.querySelector("#reload");
const back = document.querySelector("#back");

document.addEventListener("DOMContentLoaded", ()=>{
    jeu();
    start();
});

reload.addEventListener("click", ()=>window.location.reload());
back.addEventListener("click", ()=>window.location.href = "./");

function start (){
    for (i=0; i<tab.length; i++){
        tab[i].addEventListener("click", function () {
            if (playing) click(this);
        });
    }
    brooks = [tab[0], tab[7]];
    wrooks = [tab[56], tab[63]];
    caption.innerHTML = "Tour des " + current_turn + "s";
}

function jeu(){
    for (i=0; i<tab.length; i++){
        if (inside("b", tab[i].classList)){
            change_color(tab[i], "black", false);
        }else{
            change_color(tab[i], "rgb(48, 45, 44)", false);
        }
        click_event(tab[i], current_turn);
    }
}

function pawn_move(obj, test = false){
    if (inside("wpawn", obj.classList)){
        step = (inside("first", obj.classList) ? -2 : -1);
        ennemy = "noir";
    }else if (inside("bpawn", obj.classList)){
        step = (inside("first", obj.classList) ? 2 : 1);
        ennemy = "blanc";
    }

    let next_box = parseInt(obj.parentNode.classList[0]);
    l = 0;
    let h = ((step > 0) ? 1 : -1);

    while (l < Math.abs(step)){
        next_box += h;
        l ++;
        for (i=0; i<lines.length; i++){
            if (next_box.toString() == lines[i].classList[0]){

                if (l == 1){
                    check_pawn_side(lines[i], obj, 0, test);
                    check_pawn_side(lines[i], obj, -2, test);
                }    

                target = lines[i].children[parseInt(obj.classList[0]) - 1];
                if (check_if_target_exists(target)){
                    if (!isOccupied(target)){
                        if (test){
                            target_list.push(target);
                        }else{
                            change_color(target, "#58eb58");
                        }            
                    }
                    else if (l == 1){
                        l = 2;
                    }
                }
            }
        }
    }    
}

function fool_move (obj, test = false){
    ennemy = (inside("wfool", obj.classList)) ? "noir" : "blanc";
    friend = (inside("wfool", obj.classList)) ? "blanc" : "noir";
    self_line = parseInt(obj.parentNode.classList[0]);
    l = 0;
    fool_direction(obj, self_line, true, true, test);
    fool_direction(obj, self_line, true, false, test);
    fool_direction(obj, self_line, false, true, test);
    fool_direction(obj, self_line, false, false, test);
}

function rook_move (obj, test = false){
    ennemy = (inside("wrook", obj.classList)) ? "noir" : "blanc";
    friend = (inside("wrook", obj.classList)) ? "blanc" : "noir";
    self_line = parseInt(obj.parentNode.classList[0]);
    l = 0;
    rook_direction(obj, self_line, 'v', true, test);
    rook_direction(obj, self_line, 'v', false, test);
    rook_direction(obj, self_line, 'h', true, test);
    rook_direction(obj, self_line, 'h', false, test);
}

function queen_move (obj, test = false){
    ennemy = (inside("wqueen", obj.classList)) ? "noir" : "blanc";
    friend = (inside("wqueen", obj.classList)) ? "blanc" : "noir";
    self_line = parseInt(obj.parentNode.classList[0]);
    l = 0;

    // Oblique move
    fool_direction(obj, self_line, true, true, test);
    fool_direction(obj, self_line, true, false, test);
    fool_direction(obj, self_line, false, true, test);
    fool_direction(obj, self_line, false, false, test);

    // Vertical move
    rook_direction(obj, self_line, 'v', true, test);
    rook_direction(obj, self_line, 'v', false, test);
    rook_direction(obj, self_line, 'h', true, test);
    rook_direction(obj, self_line, 'h', false, test);
}

function king_move (obj, test = false){
    ennemy = (inside("wking", obj.classList)) ? "noir" : "blanc";
    friend = (inside("wking", obj.classList)) ? "blanc" : "noir";
    self_line = parseInt(obj.parentNode.classList[0]);
    l = 0;

    for (i = self_line - 2; i <= self_line; i++){
        king_direction(obj, i, -2, test);
        king_direction(obj, i, -1, test);
        king_direction(obj, i, 0, test);
    }

    // Rocks move
    if (!test){
        if (inside("first", obj.classList)){
            if (inside("blanc", obj.classList)){
                if (inside("first", wrooks[0].classList)) rocks_move(self_line, 'l');
                if (inside("first", wrooks[1].classList)) rocks_move(self_line, 'r');
            }
            if (inside("noir", obj.classList)){
                if (inside("first", brooks[0].classList)) rocks_move(self_line, 'l');
                if (inside("first", brooks[1].classList)) rocks_move(self_line, 'r');
            }
        }
    }
}

function knight_move (obj, test = false){
    ennemy = (inside("wknight", obj.classList)) ? "noir" : "blanc";
    friend = (inside("wknight", obj.classList)) ? "blanc" : "noir";
    self_line = parseInt(obj.parentNode.classList[0]);
    l = 0;

    // Haut et bas
    knight_direction (obj, self_line, -3, 0, 2, test);
    knight_direction (obj, self_line, 1, 0, 2, test);

    // Gauche et droite
    knight_direction (obj, self_line, -2, 1, 4, test);
    knight_direction (obj, self_line, 0, 1, 4, test);
}




// ********************************** PAWN FUNCTIONS **********************************

function check_pawn_side (line, obj, index, test){
    target = line.children[parseInt(obj.classList[0]) + index];
    if (check_if_target_exists(target)){
        if(isOccupied(target, ennemy)){
            if (test){
                target_list.push(target);
            }else{
                change_color(target, "#58eb58");
            }
        }
    }
} //Pawn

function check_fool_side (target, test, n = 1){
    if (check_if_target_exists(target) && (l == 0)){
        if(!isOccupied(target)){
            if (test){
                target_list.push(target);
            }else{
                change_color(target, "#58eb58");
            }
        }else if (isOccupied(target, friend)){
            l = n;
        }else if (isOccupied(target, ennemy)){
            if (test){
                target_list.push(target);
            }else{
                change_color(target, "#58eb58");
            }
            l = n;
        }
    }
} //Fool

function fool_dir (obj, self_line, i, horizontal, test){
    dif = Math.abs(self_line - i);
    if (dif != 0){
        if (horizontal){
            target = lines[i - 1].children[parseInt(obj.classList[0]) + dif - 1];
        }else{
            target = lines[i - 1].children[parseInt(obj.classList[0]) - dif - 1];
        }
        check_fool_side(target, test);
    }
} //Fool

function fool_direction (obj, self_line, vertical = true, horizontal = true, test){
    l = 0;
    if (vertical){
        for (i = self_line; i > 0; i--){        
            fool_dir(obj, self_line, i, horizontal, test);
        }
    }else{
        for (i = self_line; i <= lines.length; i++){    
            fool_dir(obj, self_line, i, horizontal, test);
        }
    }
} //Fool

function rook_direction (obj, self_line, dir = 'v', b = true, test){
    l = 0;
    let line = lines[self_line - 1].children;
    if ((dir == 'v') && b){
        for (i = self_line - 1; i > 0; i--){
            check_fool_side(lines[i - 1].children[parseInt(obj.classList[0]) - 1], test);
        }
    }
    if ((dir == 'v') && !b){
        for (i = self_line + 1; i <= lines.length; i++){
            check_fool_side(lines[i - 1].children[parseInt(obj.classList[0]) - 1], test);
        }
    }
    if ((dir == 'h') && b){
        for (i = parseInt(obj.classList[0]); i < line.length; i++){
            check_fool_side(line[i], test);
        }
    }
    if ((dir == 'h') && !b){
        for (i = parseInt(obj.classList[0]); i > 0; i--){
            check_fool_side(line[i - 2], test);
        }
    }
} //Rook

function king_direction (obj, i, index, test){
    l = 0;
    if (lines[i]){
        target = lines[i].children[parseInt(obj.classList[0]) + index];
        check_fool_side(target, test);
    }
}

function knight_direction (obj, self_line, index, rank, step, test){
    if (lines[self_line + index]){
        target = lines[self_line + index].children[parseInt(obj.classList[0]) + rank ];
        check_fool_side (target, test, 0);
        target = lines[self_line + index].children[parseInt(obj.classList[0]) + rank - step];
        check_fool_side (target, test, 0);
    }
}

function rocks_move (self_line, side){
    i = 5;
    if (side == 'r'){
        target = lines[self_line - 1].children[i];
        while ((!isOccupied(target)) && (i < 7)){
            if (i == 6){
                change_color(target, "#8034e4");
            }
            i++;
            target = lines[self_line - 1].children[i];
        }
    }
    if (side == 'l'){
        target = lines[self_line - 1].children[i-2];
        while ((!isOccupied(target)) && (i > 2)){
            if (i == 3){
                change_color(target, "#8034e4");
            }
            i--;
            target = lines[self_line - 1].children[i-2];
        }
    }
}

// ********************************** ADDITIONAL FUNCTIONS **********************************

function change_color(obj, color = "aqua", cursor = true){
    if (cursor){
        obj.style.cursor= "pointer";
    }else{
        obj.style.cursor= "auto";
    }
    obj.style.backgroundColor = color;
}

function isOccupied (obj, color = ""){
    if (color == ""){
        if (!inside("blanc", obj.classList) && !inside("noir", obj.classList)){
            return false;
        }
        return true;
    }else{
        if (inside(color, obj.classList)){
            return true;
        }
        return false;
    }
}

function check_if_target_exists(target){
    if (target){
        return true;
    }else{
        return false;
    }
}

function click_event (obj, elt){
    if(inside(elt, obj.classList)){
        obj.style.cursor= "pointer";
    }else{
        obj.style.cursor= "auto";
    }
}

function inside(elt, list){
    for (j=0; j<list.length; j++){
        if (list[j] == elt){
            return true
        }
    }
    return false
}

function click (obj){
    if (document.title == "vs IA - Chess Titans" && current_turn == "noir")
        return;

    bg_color = obj.style.backgroundColor;
    jeu();
    switch (bg_color){
        case 'black':
        case 'rgb(48, 45, 44)':
        case 'aqua':
            if(inside(current_turn, obj.classList)){
                change_color(obj);
                selected_piece = obj;
                move(obj);
            }
        break;

        case "rgb(88, 235, 88)":
            switch_piece(selected_piece, obj);
            king_alarm ();
            if (playing){
                if (current_turn == "blanc"){
                    current_turn = "noir";
                    try { playAI(); } catch (_) {}
                }
                else current_turn = "blanc";
                caption.innerHTML = "Tour des " + current_turn + "s";
            }
        break;

        case "rgb(128, 52, 228)":
            if (obj.classList[0] == "2"){
                let rook = (self_line == 1) ? brooks[0] : wrooks[0];
                switch_piece(selected_piece, obj);
                switch_piece(rook, lines[self_line - 1].children[2]);
                king_alarm ();
                if (playing){
                    if (current_turn == "blanc"){
                        current_turn = "noir";
                        try { playAI(); } catch (_) {}
                    }
                    else current_turn = "blanc";
                    caption.innerHTML = "Tour des " + current_turn + "s";
                }
            }
            if (obj.classList[0] == "7"){
                let rook = (self_line == 1) ? brooks[1] : wrooks[1];
                switch_piece(selected_piece, obj);
                switch_piece(rook, lines[self_line - 1].children[5]);
                king_alarm ();
                if (playing){
                    if (current_turn == "blanc"){
                        current_turn = "noir";
                        try { playAI(); } catch (_) {}
                    }
                    else current_turn = "blanc";
                    caption.innerHTML = "Tour des " + current_turn + "s";
                }
            }
        break;
    }
}

function target_l (obj){
    move(obj, true);
    if (inside(wking, target_list)){
        wking.style.backgroundColor = "rgb(151, 151, 53)";
    }
    if (inside(bking, target_list)){
        bking.style.backgroundColor = "rgb(151, 151, 53)";
    }
}

function move (obj, test = false){
    if (inside("rook", obj.classList)) rook_move(obj, test);
    if (inside("fool", obj.classList)) fool_move(obj, test);
    if (inside("queen", obj.classList)) queen_move(obj, test);
    if (inside("knight", obj.classList)) knight_move(obj, test);
    if (inside("pawn", obj.classList)) pawn_move(obj, test);
    if (inside("king", obj.classList)) king_move(obj, test);
}

function king_alarm (){
    target_list = [];
    blacks = [];
    whites = [];
    for (i=0; i<tab.length; i++){
        if (inside("blanc", tab[i].classList)){
            whites.push(tab[i]);
        }
        if (inside("noir", tab[i].classList)){
            blacks.push(tab[i]);
        }
        if (inside("wking", tab[i].classList)){
            wking = tab[i];
        }
        if (inside("bking", tab[i].classList)){
            bking = tab[i];
        }
    }        
    if (current_turn == "blanc"){
        whites.forEach(elt => {
            target_l(elt);
        });
    }else{
        blacks.forEach(elt => {
            target_l(elt);
        });
    }
}

function switch_piece (source, target){
    source.classList.remove("first");
    if (isOccupied(target)){
        dead_pieces.push(target.classList[3]);
        if (inside("king", target.classList)){
            playing = false;
            target.style.backgroundColor = "rgb(151, 151, 53)";
            caption.innerHTML = "Les " + current_turn + "s ont gagné";
            reload.style.display = "block";
        }
        for (j = 2; j < 6; j++){
            if (target.classList[2]) target.classList.remove(target.classList[2]);
        }
    }

    // De pion à dame
    let line = parseInt(target.parentNode.classList[0]);
    if ((line == 1 || line == 8) && inside("pawn", source.classList)){
        target.classList.add(source.classList[2], source.classList[2][0] + "queen", "queen")
        for (j = 2; j < 6; j++)
            if (source.classList[2])
                source.classList.remove(source.classList[2]);
    } else
        for (j = 2; j < 6; j++)
            if (source.classList[2]){
                target.classList.add(source.classList[2]);
                source.classList.remove(source.classList[2]);
            }
}