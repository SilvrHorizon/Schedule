TRACK_BEGINS = hourMinuteToMinutes([8, 00])
saved = "";
NOT_SCHOOL = "gray"
NOTHING_COLOR = "red"
SOMETHING_COLOR = "green"

let schedule_table = scheduleTable("primary-table", "table-dark")

$( document ).ready(function () {
    saved = $.getJSON('/api/friends-today', 
    function(data, status) {
        $("#common_times_table").append(schedule_table.html());
        

        /* 
        console.log(data);
        console.log(status);

        build = "<table style=\"padding: 0px; margin: 0px\">"
        
        build += "<tr id=\"0\">"
        beginTime = data[0]["common_free_time"][0][0]
        console.log(beginTime)
        build += "<td style=\"height:" + ((beginTime - TRACK_BEGINS))  +  "px; background-color: " + NOT_SCHOOL + ";\">"
        build += formatMinutes(data[0]["common_free_time"][0][0]) + "-" + formatMinutes(data[0]["common_free_time"][0][1]) 
        build += "</td>"

        for(let i = 0; i < data[0]["common_free_time"].length; i++){
            height = data[0]["common_free_time"][i][1] - data[0]["common_free_time"][i][0];
            build += "<tr id=\"" + ((i * 2) + 1) + "\">"
            build += "<td style=\"height:" + height + "px; background-color: " + SOMETHING_COLOR + ";\">"
            build += formatMinutes(data[0]["common_free_time"][i][0]) + "-" + formatMinutes(data[0]["common_free_time"][i][1])
            build += "</td>"
            build += "</tr>"

            let index = i + 1 
            if(index >= data[0]["common_free_time"].length){
                index = i
            }
            
            height = data[0]["common_free_time"][index][0]  - data[0]["common_free_time"][i][1]
            
            build += "<tr id=\"" + (i * 2 + 2) + "\">"
            build += "<td style=\"height:" + height + "px; background-color: " + NOTHING_COLOR + ";\">"
            //build += formatMinutes(data[0]["common_free_time"][i][0]) + "-" + formatMinutes(data[0]["common_free_time"][i][1])
            build += "</td>"
            build += "</tr>"
        }

        build += "</tr>"
        
        //for()
        
        build += "</table>"
        $("#common_times_table").append(build);
        */
    }
    )
});

class scheduleTable{
    
    constructor(id, classes){
        this.id = id;
        this.additional_classes = classes;
        this.html = ["<table id=\"", id, "\" class=\"", classes, "\">"];
    }

    html(){
        html.append('</table>')
        return html;

    }


}

function hourMinuteToMinutes(time){
    return time[0] * 60 + time[1]
}

function minutesToHourMinute(time){
    return [Math.floor(time / 60), time % 60] 
}

function formatMinutes(minutes){
    let hour_minute = minutesToHourMinute(minutes)
    hour_minute = [("00" + hour_minute[0]),("00" + hour_minute[1])]
    hour_minute = [hour_minute[0].substr(hour_minute[0].length - 2), hour_minute[1].substr(hour_minute[1].length - 2)]
    return  hour_minute[0] + ":" + hour_minute[1]

}