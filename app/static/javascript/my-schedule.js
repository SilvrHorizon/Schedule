let schedule_table = new scheduleTable("schedule-table")
days = {0: "Måndag", 1 : "Tisdag", 2: "Onsdag", 3:"Torsdag", 4:"Fredag"}

function go_to_edit_page(){
    window.location.href = window.location.origin + "/upload-schedule/" + $("#week-select").val()
}

function show_week(week){
    $.post(
        '/api/get-user-schedule',
        {
            user_public_id: user_public_id,
            week: week
        },
        function (response){
            selected_week = week
            console.log("changin")
            $("#form-redirect-value").val(selected_week)
            console.log(response)
            show_schedule(response)
            schedule_table.update()
            
        }
    )
}

$(document).ready(
    function(){
        $("#schedule-table-div").append(schedule_table.get_html())
        show_week(selected_week)
        schedule_table.update()
    }
)


function show_schedule(week_data){
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
        console.log("processed: ")
        console.log(processed)
        schedule_table.push_column(processed)
    }
    schedule_table.time_column()
    console.log(schedule_table.columns)
}