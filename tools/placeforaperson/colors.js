function colortime(){
    var base = "https://www.thecolorapi.com";
    var randomColor = [getRandomColorVal(15, 200), getRandomColorVal(10, 155), getRandomColorVal(100, 255)];
    var modes = ["monochrome", "monochrome-dark"];
    var scheme = "/scheme?rgb=rgb(" + randomColor[0] + "," + randomColor[1] + "," + randomColor[2];
    var mode = ")&mode=" + modes[Math.floor(Math.random() * (modes.length))];
    var count = "&count=2";
    var request = new XMLHttpRequest();
    var url = base + scheme + mode + count;
    console.log(url);
    var p;
    var data = {
        model : "default",
    };

    request.open('GET', url, true);
    request.send(JSON.stringify(data));

    

    request.onreadystatechange = function(){
        if (request.readyState == 4 && request.status == 200){
            var palette = JSON.parse(request.response);
            p = palette;
            console.log(p);


            // STYLE THE PAGE
            document.getElementById("theBuilding").style.color = p.colors[0].hex.value;
            document.body.style.backgroundColor = p.colors[1].hex.value;

            //STYLE THE BUTTON
            document.getElementById("theButtonText").style.color = p.colors[0].hex.value;
            document.getElementById("theButton").style.backgroundColor = p.colors[1].hex.value;
            document.getElementById("theButton").style.borderColor = p.colors[0].hex.value;

        } else {
        }

        
        
    };
}

function getRandomColorVal(min, max){
    return Math.floor(Math.random() * (max-min) + min);
}