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
        this.render_start = hourMinuteToMinutes([8,  0])
        this.render_end = hourMinuteToMinutes([22, 0])
        this.id = id;
        this.header_size = header_size
        this.columns = []
        this.additional_classes = classes;
        this.break_points = []
        this.break_points.push(this.render_start)
        this.break_points.push(this.render_end)
        this.opening_tag = ["<table id=\"", id, "\"class=\" py-0 my-0 ", classes, "\" style=\"border: 2px dotted #FFFFFF; width: 100%;\">"];
        this.column_ids = {}

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

        this.time_column_break_points = []
        for(let i = 0; i < Math.floor(render_length / intervals); i++){

            let begin =  i * intervals + this.render_start;
            let end = (i + 1) * intervals + this.render_start; 
            
            this.time_column_data["data"].push(
                this.build_data(
                    [begin, end], 
                    "gray", 
                    (formatMinutes(begin) + "-" + formatMinutes(end)),
                    "6em"
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
                "6em"
            )
        )

        console.log(this.time_column_data)
        
    }
    
    remove_by_id(id){
        for(let i = this.column_ids[id] + 1; i < this.columns.length; i++){
            this.column_ids[column[i].id]--;
        }
        delete this.column_ids[id]
    }

    push_column(column){
        this.add_column(this.columns.length, column)
    }
    
    add_column(at_index, column){
        console.log(column)

        if(column.data.length > 0){
            for(let i = column.data.length -1; i >= 0; i--){
                if(column.data[i].span[1] <= this.render_start){
                    column.data.splice(i, 1);
                    continue;
                }

                if(column.data[i].span[0] >= this.render_end){
                    column.data.splice(i,1)
                    continue;
                }

                if(column.data[i].span[0] < this.render_start){
                    column.data[i].span[0] = this.render_start;
                }

                if(column.data[i].span[1] > this.render_end){
                    column.data[i].span[1] = this.render_end;
                }

                for(let time in column.data[i].span){
                    time = column.data[i].span[time]
                    
                    this.add_break_point(time)
                }
            }

            this.columns.splice(at_index,0, column)

            this.column_ids[column.id] = at_index;
            for(let i = at_index + 1; i < this.columns.length; i++){
                this.column_ids[this.columns[i].id]++;
            }
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
                    continue;
                }

                while(keeper[0] <= data.span[0]){
                    keeper.shift()
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
                        row.push(this.get_td(this.break_points.indexOf(td_data.span[1]) - i, td_data.bg_color, td_data.width, extra_styles=extra_styles))
                        

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

    fill_holes(column, fill_color, fill_text, width=""){
        console.log(column.id)
        let data = column.data
        if(data.length == 0){
            data[0] = this.build_data([this.render_start, this.render_end], fill_color, fill_text, width=width);
            return column;
            //return //[this.build_data([this.render_start, this.render_end], fill_color, fill_text, width=width)]
        }

        if(data[0].span[0] > this.render_start){
            data.splice(0,0, this.build_data([this.render_start, data[0].span[0]], fill_color, fill_text, width))
        }

        let prev_end = data[0].span[1]
        for(let i = 1; i < data.length; i++){
            if(data[i].span[0] > prev_end){
                data.splice(i, 0, this.build_data([prev_end, data[i].span[0]], fill_color, fill_text, width));
                i++;
            }
            prev_end = data[i].span[1]
        }

        if(data[data.length -1].span[1] < this.render_end){
            data.splice(data.length, 0, this.build_data([data[data.length -1].span[1], this.render_end], fill_color, fill_text, width));
        }
        return column;
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

$( document ).ready(function () {
    let occupied_color = "#151E3F"
    let free_color = "#5DA9E9"     

    let render_length = schedule_table.render_end - schedule_table.render_start

    schedule_table.time_column()

    

    for(let i in loaded_schedules){

        let times_len = loaded_schedules[i].times.length;
        let processed = {"header": null, "data": [], "id": null}
        processed["header"] = schedule_table.build_header(loaded_schedules[i].first_name + "<br />" + loaded_schedules[i].last_name)
        
        for(let span = 0; span < times_len; span++){
            let color = free_color;
            
            if(loaded_schedules[i].times[span][1] <= loaded_schedules[i].begins){
                color = "yellow"
            }

            if(loaded_schedules[i].times[span][0] >= loaded_schedules[i].ends){
                color = "orange"
            }

            processed["data"].push(
                schedule_table.build_data(
                    [loaded_schedules[i].times[span][0], loaded_schedules[i].times[span][1]],
                    color,
                    (formatMinutes(loaded_schedules[i].times[span][0]) + "-" + formatMinutes(loaded_schedules[i].times[span][1])),
                    width="auto"
                )
            )

        }

        processed["id"] = i
        schedule_table.fill_holes(processed, occupied_color, "", "auto")
        schedule_table.push_column(processed)
    }

    //console.log(schedule_table.get_html())
    $("#common_times_table").append(schedule_table.get_html());
});
