let schedule_table = new scheduleTable("primary-table", "table-dark");

function hide_user(id){
    schedule_table.remove_by_id(id);
    loaded_users[id].shown = false;
    $("#schedule-button-" + id).removeClass('btn-primary').addClass('btn-warning')
}

function show_user(id){
    schedule = loaded_schedules[id];

    if(schedule == null){

        //TODO remember to insert the correct week and weekday
        let response = $.ajax({
            type: 'POST',
            url: '/api/get-common-times',
            data: {week: current_week, day: current_day, user_public_id: id},
            dataType: 'application/JSON',
            async:false
        });

        let json = $.parseJSON(response.responseText)
        if(json.status != 'success'){
            alert('Ett fel uppstod. Status kod: ' + json.status + "\n var vänlig och kontakta en administratör")
        }


        schedule = json.result
        loaded_schedules[id] = schedule
    }

    schedule_table.add_comparison(schedule, id, standard_free_color, standard_occupied_color)
    loaded_users[id].shown = true;
    $("#schedule-button-" + id).removeClass('btn-warning').addClass('btn-primary')
}

function toggle_user(id){
    if(loaded_users[id].shown){
        hide_user(id);
    } else {
        show_user(id)
    }
    schedule_table.update()
}



$( document ).ready(function () {

    for(let i in loaded_users){

        //Check if if the loaded user has a loaded schedule
        if(loaded_schedules[i] != null){
            loaded_users[i]["shown"] = true;
            $("#schedule-button-" + i).removeClass('btn-warning').addClass('btn-primary')
        } else {
            loaded_users[i]["shown"] = false;
        }
    } 

    let render_length = schedule_table.render_end - schedule_table.render_start

    schedule_table.time_column()

    for(let i in loaded_schedules){
        schedule_table.add_comparison(loaded_schedules[i], i, standard_free_color, standard_occupied_color)
    }


    
    $("#common_times_div").html(schedule_table.get_html()) 
    
    $.post(
        '/api/get-user-schedule',
        {
            user_public_id: my_id,
            week: current_week,
            day: current_day
        },
        function(result){
            console.log("read below")
            result = result[0]
            console.log(result)

            build = {"header": null, "data": [], "id": "my_schedule_column"}
            build["header"] = schedule_table.build_header("Mitt schema")

            for(let i in result){
                build["data"].push(schedule_table.build_data(result[i].span, "#151E3F", result[i].course + "<br>" + formatMinutes(result[i].span[0]) + "-" + formatMinutes(result[i].span[1])))
            }
            schedule_table.fill_holes(build, "#5DA9E9")
            schedule_table.add_column(0, build)
            schedule_table.update()
        }
    )


});

function deselect_all(){
    for(let id in loaded_users){
        if(loaded_users[id].shown){
            hide_user(id);
        }
    }
    schedule_table.update()
}
