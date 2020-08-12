let schedule_table = new scheduleTable("user-schedule-table")
let common_times_table = new scheduleTable("common-times-table")

days = {0: "Måndag", 1 : "Tisdag", 2: "Onsdag", 3:"Torsdag", 4:"Fredag"}

$(document).ready(
    function(){
        {
            let user_schedule = user_schedules[current_week]
            for(let i = 0; i < user_schedule.length; i++){
                let processed = {"header": null, "data": [], "id": null}
                processed["header"] = schedule_table.build_header(days[i])

                let times_len = user_schedule[i].length
                
                for(let j = 0; j < times_len; j++){
                    processed["data"].push(
                        schedule_table.build_data(
                                [user_schedule[i][j].span[0], user_schedule[i][j].span[1]],
                                "orange",
                                (user_schedule[i][j].course + "<br>" + formatMinutes(user_schedule[i][j].span[0]) + "-" + formatMinutes(user_schedule[i][j].span[1])),
                                width="auto"
                        )
                    )
                }
                        
                processed["id"] = "schedule-day-" + i
                schedule_table.fill_holes(processed, "black", "", "auto")
                schedule_table.push_column(processed)
                        
            }
            schedule_table.time_column()
            $("#user-schedule-div").html(schedule_table.get_html());
        }
        
        //Execute only if the user is logged in
        if(common_times.length != 0) {
            let common = common_times[current_week];
            console.log(common[current_week])
            console.log(current_week)

            for(i = 0; i < common.length; i++){
                common_times_table.add_comparison(common[i], "common-times-day" + i, "#AF6D7E", "#FF6848", days[i])
            }
            common_times_table.time_column()

            console.log(common_times_table.get_html())
            $("#common-times-div").append(common_times_table.get_html());
        }
    }
)