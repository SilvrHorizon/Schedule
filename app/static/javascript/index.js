TRACK_BEGINS = hourMinuteToMinutes([8, 00])


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

class scheduleTable{
    constructor(id, classes = "", header_size=30){
        this.render_start = hourMinuteToMinutes([8, 20])
        this.render_end = hourMinuteToMinutes([18, 0])
        this.id = id;
        this.header_size = header_size
        this.columns = []
        this.additional_classes = classes;
        this.break_points = []
        this.break_points.push(this.render_start)
        this.break_points.push(this.render_end)
        this.opening_tag = ["<table id=\"", id, "\"class=\" py-0 my-0 ", classes, "\" style=\"border: 2px dotted #FFFFFF; width: 100%;\">"];
        
        this.time_column_data = {"data": [], "header": null}
        this.use_time_column = false
        this.time_column_horizontal_lines = true
        this.time_column_intervals = 30
        this.time_column_break_points = []
    }

    //Tabledata
    /*
    tid, färg, text 

    */
    
    /*
    row ----------------------- 
    */

    
    time_column(enable = true, intervals=60, horizontal_lines=true){
        this.use_time_column = enable;
        this.time_column_intervals = intervals
        this.time_column_horizontal_lines = horizontal_lines

        let render_length = this.render_end - this.render_start;
        this.time_column_data["header"] = this.build_header("Tider")
        /*
        console.log(render_length)
        console.log("intervals: " + intervals)
        console.log(Math.floor(render_length / intervals))
        */

        this.time_column_break_points = []
        for(let i = 0; i < Math.floor(render_length / intervals); i++){

            let begin =  i * intervals + this.render_start;
            let end = (i + 1) * intervals + this.render_start; 
            
            this.time_column_data["data"].push(
                this.build_data(
                    [begin, end], 
                    "gray", 
                    (formatMinutes(begin) + "-" + formatMinutes(end)),
                    "12em"
                )
            )
            this.time_column_break_points.push(end)
            this.add_break_point(end);
        }

        
        this.time_column_data["data"].push(
            this.build_data(
                [intervals * (Math.floor(render_length / intervals)) + this.render_start , this.render_end],
                "gray",
                "",
                "12em"
            )
        )

        console.log(this.time_column_data)
        
    }

    
    add_column(at_index, column){
        if(column.data.length > 0){
            for(let i in column.data){
                for(let time in column.data[i].span){
                    time = column.data[i].span[time]
                    
                    this.add_break_point(time)
                }
            }
            this.columns.push(column)
        }
    }

    add_break_point(time){
        //This can be greatly improved e.g bin search
        if(!(this.break_points.includes(time))){
            this.break_points.push(time)
        }
    }

    

    get_tr(size){
        return "<tr class=\"no-y\" style=\"border: none; line-height: " + size + "px\" height=\"" + size + "px\">";
    }

    get_td(row_span, color="white", width="", extra_styles=""){
        let build = []
        build.push("<td ")
        
        build.push("class=\"text-center\"style=\"white-space: nowrap; border-right: solid 1px #000; padding-right: 3px; padding-left: 3px; background-color: ")
        build.push(color)
        
        if(width != ""){
            build.push("; width: ")
            build.push(width)
        }
        build.push("; ")
        build.push(extra_styles)
        build.push("\"")
        build.push("\" rowspan=\"")
        build.push(row_span)
        build.push("\">")
        return build.join('')
    }

    get_th(bg_color="white"){
        let build = ["<th "]
        build.push("class=\"text-center\" style=\"white-space: nowarp; border-right: solid 1px #000; padding-right: 3px; padding-left: 3px; background-color: ")
        build.push(bg_color)
        build.push("\">")
        return build.join('')

    }


    break_empty_columns(){
        for(let i = 0; i < this.columns.length; i++){
            
            let keeper = this.time_column_break_points.slice(0)
            for(let j = 0; j < this.columns[i].data.length; j++){
                let data = this.columns[i].data[j]

                if(data.text){
                    console.log("Skipping: " + data.text)
                    continue;
                }
                
                /*
                console.log("processing: ")
                console.log(data.span)
                */

                while(keeper[0] <= data.span[0]){
                    console.log(keeper.shift())
                }

                if(data.span[1] > keeper[0]){
                    this.columns[i].data.splice(j + 1,0,
                        this.build_data(
                            [keeper[0], data.span[1]],
                            data.bg_color,
                            "",
                            data.width
                        ) 
                    )
                    this.columns[i].data[j].span[1] = keeper[0]
                    keeper.shift()
                }
            }
        }

    }

    get_html() {
        this.break_points.sort(function(a, b){return a-b;})
        let rows = []
        let build = [this.opening_tag]
        
        
        if(this.use_time_column){
            if(this.time_column_horizontal_lines){
                this.break_empty_columns()
            }
            this.columns.unshift(this.time_column_data)
        }



        let compare_indexes = [];
        
        for(let i = 0; i < this.columns.length; i++){
            compare_indexes.push(0)
        }


        console.log("break_points: " + this.break_points)
        for(let i in this.columns){
            console.log("Data: ")
            console.log(this.columns[i])
        }


        build.push(this.get_tr(this.header_size))
        for(let i in this.columns){
            build.push(this.get_th(this.columns[i].header.bg_color))
            build.push(this.columns[i].header.text)
            build.push('</th>')
        }
        build.push("</tr>")

        for(let i = 0; i < this.break_points.length - 1; i++){
            let row = [this.get_tr(this.break_points[i + 1] - this.break_points[i])]
            
            for(let j = 0; j < compare_indexes.length; j++){
                if(compare_indexes[j] < this.columns[j].data.length){
                    let td_data = this.columns[j].data[compare_indexes[j]];
                    if(td_data.span[0] == this.break_points[i]){
                        let extra_styles = ""
                        if(td_data.text == "" && this.time_column_horizontal_lines){
                            extra_styles += "border-bottom: 1px solid white"
                        }
                        row.push(this.get_td(this.break_points.indexOf(td_data.span[1]) - i, td_data.bg_color, width=td_data.width, extra_styles=extra_styles))
                        

                        row.push(td_data.text)
                        row.push("</td>")
                        compare_indexes[j]++;
                    }

                }
            }
            rows.push(row.join(''))

        }

        build.push(rows.join(''))
        build.push("</table>")

        //To avoid side effects
        if(this.use_time_column){
            this.columns.shift(1)
        }

        return build.join('')
    }
    
    build_header(text="", bg_color="", width=""){
        return {
            "text": text,
            "bg_color": bg_color,
            "width": width
        }
    }

    build_data(span, bg_color="gray", text = "", width=""){
        return (
            {
                "span": [span[0], span[1]],
                "bg_color": bg_color,
                "text": text,
                "width": width
            }
        )
    }
}

let schedule_table = new scheduleTable("primary-table", "table-dark");
//schedule_table.add_column(0, test_data3)
//schedule_table.add_column(0, test_data)
//schedule_table.add_column(0, test_data2)


$( document ).ready(function () {
    let occupied_color = "#151E3F"
    let free_color = "#5DA9E9"     

    let render_length = schedule_table.render_end - schedule_table.render_start
    
    /*
    {
        let interval = 20;
        let processed = {"header": schedule_table.build_header("Tider"), "data": []}
        for(let i = 0; i < Math.floor(render_length / interval); i++){
            processed["data"].push(schedule_table.build_data(
                [
                    schedule_table.render_start + i * interval, 
                    schedule_table.render_start + (i+1) * interval,
                ],
                occupied_color,
                (
                    formatMinutes(schedule_table.render_start + i * interval) + "-" + formatMinutes(schedule_table.render_start + (i+1) * interval)
                ),
                width="6em"
            ))
        }
        schedule_table.add_column(0, processed)
    }*/

    schedule_table.time_column()

    

    for(let i in loaded_schedules){
        if(loaded_schedules[i].times.length <= 0){
            continue;
        }

        let times_len = loaded_schedules[i].times.length;

        let processed = {"header": null, "data": []}

        processed["header"] = schedule_table.build_header(loaded_schedules[i].first_name + "<br />" + loaded_schedules[i].last_name)
        if(loaded_schedules[i].times[0][0] != schedule_table.render_start){
            processed["data"].push(schedule_table.build_data([schedule_table.render_start, loaded_schedules[i].times[0][0]], occupied_color, text="", width="auto"))
        }

        for(let span = 0; span < times_len - 1; span++){
            console.log("looping")
            processed["data"].push(
                schedule_table.build_data(
                    [loaded_schedules[i].times[span][0], loaded_schedules[i].times[span][1]],
                    free_color,
                    (formatMinutes(loaded_schedules[i].times[span][0]) + "-" + formatMinutes(loaded_schedules[i].times[span][1])),
                    width="auto"
                )
            )

            processed["data"].push(
                schedule_table.build_data(
                    [loaded_schedules[i].times[span][1], loaded_schedules[i].times[span + 1][0]],
                    occupied_color,
                    text="",
                    width="auto"
                )
            )

        }

        processed["data"].push(
            schedule_table.build_data(
                [loaded_schedules[i].times[times_len - 1][0], loaded_schedules[i].times[times_len - 1][1]],
                free_color,
                ((formatMinutes(loaded_schedules[i].times[times_len - 1][0]) + "-" + formatMinutes(loaded_schedules[i].times[times_len -1][1]))),
                text="",
                width="auto"
                
            )
        )
        if(loaded_schedules[i].times[times_len-1][1] < schedule_table.render_end){
            processed["data"].push(schedule_table.build_data([loaded_schedules[i].times[times_len-1][1], schedule_table.render_end], occupied_color, "", width="auto"))
        }

        schedule_table.add_column(0, processed)
    }

    //console.log(schedule_table.get_html())
    $("#common_times_table").append(schedule_table.get_html());
});
