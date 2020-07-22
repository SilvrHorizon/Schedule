TRACK_BEGINS = hourMinuteToMinutes([8, 00])
saved = "";
NOTHING_COLOR = "red"
SOMETHING_COLOR = "green"

$( document ).ready(function () {
    saved = $.getJSON('/api/friends-today', 
    function(data, status) {
        console.log(data);
        console.log(status);

        build = "<table style=\"padding: 0px; margin: 0px\">"
        
        build += "<tr>"
        beginTime = data[0]["common_free_time"][0][0]
        console.log(beginTime)
        build += "<td style=\"height:" + ((beginTime - TRACK_BEGINS) * 2)  +  "px; background-color: " + NOTHING_COLOR + ";\">"
        build += formatMinutes(data[0]["common_free_time"][0][0]) + "-" + formatMinutes(data[0]["common_free_time"][0][1]) 
        build += "</td>"

        for(let i = 0; i < data[0]["common_free_time"].length; i++){
            height = data[0]["common_free_time"][i][1] - data[0]["common_free_time"][i][0];
            height *= 2
            build += "<tr>"
            build += "<td style=\"height:" + height + "px; background-color: " + SOMETHING_COLOR + ";\">"
            build += formatMinutes(data[0]["common_free_time"][i][0]) + "-" + formatMinutes(data[0]["common_free_time"][i][1])
            build += "</td>"
            build += "</tr>"

            let index = i + 1 
            if(index >= data[0]["common_free_time"].length){
                index = i
            }
            height *= 2
            height = data[0]["common_free_time"][index][0]  - data[0]["common_free_time"][i][1]
            
            build += "<tr>"
            build += "<td style=\"height:" + height + "px; background-color: " + NOTHING_COLOR + ";\">"
            //build += formatMinutes(data[0]["common_free_time"][i][0]) + "-" + formatMinutes(data[0]["common_free_time"][i][1])
            build += "</td>"
            build += "</tr>"
            

        }

        build += "</tr>"
        
        //for()
        
        build += "</table>"
        $("#common_times_table").append(build)
    }
    )
});

function hourMinuteToMinutes(time){
    return time[0] * 60 + time[1]
}

function minutesToHourMinute(time){
    return [Math.floor(time / 60), time % 60] 
}

function formatMinutes(minutes){
    let thing = minutesToHourMinute(minutes)
    return thing[0] + ":" + thing[1]

}