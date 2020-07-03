function sortByTime(dict) {
    var sortedDay = [];
    var sortedHour = [];
    for(var key in dict) {
        var time = key.split(" ");
        if(time[1]=="day")
            sortedDay[sortedDay.length] = parseInt(time[0],10);
        else
            sortedHour[sortedHour.length] = parseInt(time[0],10);
    }
    sortedDay.sort((a,b)=>a-b);
    sortedHour.sort((a,b)=>a-b);

    var tempDict = {};
    for(var i = 0; i < sortedHour.length; i++) {
        var key = [sortedHour[i],"hr"].join(" ")
        tempDict[key] = dict[key];
    }
    for(var i = 0; i < sortedDay.length; i++) {
        var key = [sortedDay[i],"day"].join(" ")
        tempDict[key] = dict[key];
    }
    return tempDict;
}

function getTimestamps(data){
    // for adding regulation timestamps in select
    var timestamps= {};
    if(data.nodes.length > 0){
        const props = Object.keys(data.nodes[0].attributes);
        for(const prop of props){
            if(prop.substring(0,3) === "fc_"){
                var val = "reg_"+prop.substring(3);
                var txt = prop.substring(3).match(/[a-zA-Z]+|[0-9]+/g).join(" ");
                timestamps[txt]=val;
            }
        }
        timestamps = sortByTime(timestamps);
    }
    return timestamps;
}

function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

function QueryStringToJSON() {            
    var pairs = location.search.slice(1).split('&');
    
    var result = {};
    pairs.forEach(function(pair) {
        pair = pair.split('=');
        result[pair[0]] = decodeURIComponent(pair[1] || '');
    });

    return JSON.parse(JSON.stringify(result));
}