var corpusTools = [
    "making art",
    "playing music",
    "windy days",
    "planets",
    "painting",
    "stargazing",
    
    
    ];

var corpusSites = [
    "poets",
    "weirdos",
    "sculptors",
    "architects",
    "swamp witches",
    "garage bands",
    "dancers",
    "writers",
    "builders",
    "synth nerds",
    "clarinet players",
    "polar bears",
    "squarespace defectors",
    "mech pilots",
    "bakers",
    "adventurers"
];
var blanks = [];
var randoms = [];

function blanksSetup(){


    blanks = document.getElementsByClassName("blank");
    console.log(blanks);

    // generate unique random numbers
    // while (randoms.length < blanks.length){
    // var r = floor(random() * corpus.length);
    // if (randoms.indexOf(r) == -1) randoms.push(r);
    // }

    // use them to get words from the corpus to fill in the blanks
    for (var i=0;i<blanks.length;i++){
        
        blanks[i].setAttribute("onclick", "setCaret(this);");
        blanks[i].setAttribute("onkeydown", "setCaret(this)");
        // if (blanks[i].id == "tools"){
        //     blanks[i].innerHTML = corpusTools[floor(random(0, corpusTools.length))];
        // } else {
        //     blanks[i].innerHTML = corpusSites[floor(random(0, corpusSites.length))];
        // }
    }

    newTool();
    newSite();



}

function newTool(){
    blanks[0].innerHTML = corpusTools[floor(random(0, corpusTools.length))];
}

function newSite(){
    blanks[1].innerHTML = corpusSites[floor(random(0, corpusSites.length))];
}

function setCaret(_element) {
    var el = _element;
    console.log(el);
    var range = document.createRange();
    var sel = window.getSelection();
    
    range.setStart(el.childNodes[0], el.childNodes[0].length);
    range.collapse(true);
    
    sel.removeAllRanges();
    sel.addRange(range);
}
