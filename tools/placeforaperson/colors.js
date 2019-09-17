function colortime(){
    var url = "http://colormind.io/api/";
    var data = {
        model : "default",
    }

    var c1 = 0;
    var c2 = 1;
    var p = [];

    var http = new XMLHttpRequest();

    http.onreadystatechange = function() {
        if(http.readyState == 4 && http.status == 200) {
            var palette = JSON.parse(http.responseText).result;
            p = palette;

            c1 = Math.floor(Math.random()*p.length);
            c2 = Math.floor(Math.random()*p.length);
            console.log(p[c1], p[c2]);

            while (Math.abs(p[c1][0] - p[c2][0]) < 30 && Math.abs(p[c1][1] - p[c2][1]) < 30 && Math.abs(p[c1][2] - p[c2][2]) < 30){
                console.log("oh no!");
                c2 = Math.floor(Math.random()*p.length);
                console.log(p[c1], p[c2]);
            }
        }

        //STYLE THE PAGE
        document.getElementById("theBuilding").style.color = "rgba(" + p[c1][0] + "," + p[c1][1] + "," + p[c1][2];
        document.body.style.backgroundColor = "rgba(" + p[c2][0] + "," + p[c2][1] + "," + p[c2][2];

        //STYLE THE BUTTON
        document.getElementById("theButtonText").style.color = "rgba(" + p[c1][0] + "," + p[c1][1] + "," + p[c1][2];
        document.getElementById("theButton").style.backgroundColor = "rgba(" + p[c2][0] + "," + p[c2][1] + "," + p[c2][2];
        document.getElementById("theButton").style.borderColor = "rgba(" + p[c1][0] + "," + p[c1][1] + "," + p[c1][2];
    };

    //console.log(p);
    http.open("POST", url, true);
    http.send(JSON.stringify(data));
}