let schedule_table = new scheduleTable("user-schedule-table")
let common_times_table = new scheduleTable("common-times-table")

days = {0: "Måndag", 1 : "Tisdag", 2: "Onsdag", 3:"Torsdag", 4:"Fredag"}

function set_user_schedule(week_data){
    console.log(week_data)
    schedule_table.clear()
    for(let i = 0; i < week_data.length; i++){
        let processed = {"header": null, "data": [], "id": null}
        processed["header"] = schedule_table.build_header(days[i])
        let times_len = week_data[i].length
        
        for(let j = 0; j < times_len; j++){
            processed["data"].push(
                schedule_table.build_data(
                    [week_data[i][j].span[0], week_data[i][j].span[1]],
                    "orange",
                        (week_data[i][j].course + "<br>" + formatMinutes(week_data[i][j].span[0]) + "-" + formatMinutes(week_data[i][j].span[1])),
                        width="auto"
                )
                )
        }
        
        processed["id"] = "schedule-day-" + i
        schedule_table.fill_holes(processed, "black", "", "auto")
        console.log(processed)
        schedule_table.push_column(processed)
    }
    schedule_table.time_column()
    console.log(schedule_table.columns)
}

function set_common_times_schedule(week_data){
    for(i = 0; i < week_data.length; i++){
        common_times_table.add_comparison(week_data[i], "common-times-day" + i, "#AF6D7E", "#FF6848", days[i])
    }
    common_times_table.time_column()
}

$(document).ready(
    function(){
        
        set_user_schedule(user_schedules[current_week])
        $("#user-schedule-div").html(schedule_table.get_html());
        
        
        //Execute only if the user is logged in
        if(common_times.length != 0) {
            set_common_times_schedule(common_times[current_week]);
            console.log(common_times_table.get_html())
            $("#common-times-div").append(common_times_table.get_html());
        }
    }
    
)

function update_week(week){
    if(user_schedules[week] == null){
        $.post('/api/get-user-schedule', 
            {"user_public_id": user_public_id, "week": week}, 
            function(result) {
                user_schedules[week] = result
                set_user_schedule(result)
                schedule_table.update()  
            }
        )
        
    } else {
        set_user_schedule(user_schedules[week])
        schedule_table.update()
    }


    if(common_times.length != 0){
    }
}