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

test_data = [
    {
        "span": [0, 10],
        "bg_color": "gray",
        "text": "INTEDÄR",
        "header": false,
    },
    {
        "span": [10, 40],
        "bg_color": "red",
        "text": "MAT",
        "header": false,
        
    },
    {
        "span": [40, 100],
        "bg_color": "green",
        "text": "RAST",
        "header": false,
    }
    
]

test_data2 = [
    {
        "span": [0, 20],
        "bg_color": "gray",
        "text": "INTEDÄR2",
        "header": false,
    },
    {
        "span": [20, 70],
        "bg_color": "red",
        "text": "MAT2",
        "header": false,
        
    },
    {
        "span": [70,90],
        "bg_color": "green",
        "text": "RAST2",
        "header": false,
    },
    {
        "span": [90, 100],
        "bg_color": "gray",
        "text": "SAKSAK2",
        "header": false,
    }
    
]

test_data3 = [
    {
        "span": [0,20],
        "bg_color": "white",
        "text": "0-20",
        "header": true
    },
    {
        "span": [20,40],
        "bg_color": "gray",
        "text": "20-40",
        "header": true
    },{
        "span": [40,60],
        "bg_color": "white",
        "text": "40-60",
        "header": true
    },{
        "span": [60,80],
        "bg_color": "gray",
        "text": "60-80",
        "header": true
    },
    {
        "span": [80,100],
        "bg_color": "white",
        "text": "80-100",
        "header": true
    },

]

class scheduleTable{
    constructor(id, classes){
        this.render_start = hourMinuteToMinutes([8, 20])
        this.render_end = hourMinuteToMinutes([18, 0])
        this.id = id;
        this.data = []
        this.additional_classes = classes;
        this.break_points = []
        this.break_points.push(this.render_start)
        this.break_points.push(this.render_end)
        this.opening_tag = ["<table id=\"", id, "\"class=\" py-0 my-0 ", classes, "\" style=\"border-collapse: collapse;\">"];
    }

    //Tabledata
    /*
    tid, färg, text 

    */
    
    /*
    row ----------------------- 
    */

    
    add_column(at_index, column){
        if(column.length > 0){
            for(let i in column){
                for(let time in column[i].span){
                    time = column[i].span[time]
                    if(time > this.render_end){
                        time = this.render_end;
                    } else if(time < this.render_start){
                        time = this.render_start;
                    }
                    //This can be greatly improved
                    if(!(this.break_points.includes(time))){
                        this.break_points.push(time)
                    }
                }
            }

            //could cause problems
            column[column.length - 1].span[1] = this.render_end

            this.data.push(column)
        }
    }

    get_tr(size){
        return "<tr class=\"no-y\" style=\"border: none; line-height: " + size + "px\" height=\"" + size + "px\">";
    }

    get_td_open(row_span, color="white", header=false){
        let build = []
        if(!header){
            build.push("<td ")
        } else {
            build.push("<th ")
        }
        build.push("class=\"text-center\"style=\"white-space: nowrap; border-right: solid 1px #000; padding-right: 3px; padding-left: 3px; background-color: ")
        build.push(color)
        build.push("\" rowspan=\"")
        build.push(row_span)
        build.push("\">")
        return build.join('')
    }

    get_html() {
        this.break_points.sort(function(a, b){return a-b;})
        let rows = []
        let build = [this.opening_tag]
        
        let compare_indexes = [];
        
        for(let i = 0; i < this.data.length; i++){
            compare_indexes.push(0)
        }
        console.log("break_points: " + this.break_points)
        for(let i in this.data){
            console.log("Data: ")
            console.log(this.data[i])
        }

        for(let i = 0; i < this.break_points.length - 1; i++){
            let row = [this.get_tr(this.break_points[i + 1] - this.break_points[i])]
            
            for(let j = 0; j < compare_indexes.length; j++){
                if(compare_indexes[j] < this.data[j].length){
                    let td_data = this.data[j][compare_indexes[j]];
                    if(td_data.span[0] == this.break_points[i]){
                        row.push(this.get_td_open(this.break_points.indexOf(td_data.span[1]) - i, td_data.bg_color, td_data.header))
                        row.push(td_data.text)
                        if(td_data.header){
                            row.push("</th>")
                        } else {
                            row.push("</td>")
                        }
                        compare_indexes[j]++;
                    }

                }
            }
            rows.push(row.join(''))

        }

        build.push(rows.join(''))
        build.push("</table>")

        return build.join('')
    }

    build_data(span, bg_color="gray", text = "", header=false){
        return (
            {
                "span": [span[0], span[1]],
                "bg_color": bg_color,
                "text": text,
                "header": header
            }
        )
    }
}

let schedule_table = new scheduleTable("primary-table", "table-dark");
//schedule_table.add_column(0, test_data3)
//schedule_table.add_column(0, test_data)
//schedule_table.add_column(0, test_data2)


$( document ).ready(function () {
    /*
    {
        "span": [0,20],
        "bg_color": "white",
        "text": "0-20",
        "header": true
    },
    */

    let header_size = 30
    let occupied_color = "#151E3F"
    let free_color = "#5DA9E9"     
    
    {
        let render_length = schedule_table.render_end - schedule_table.render_start
        let processed = []
        processed.push(schedule_table.build_data([schedule_table.render_start, schedule_table.render_start + header_size], occupied_color, "Tider"))
        
        for(let i = 0; i < Math.floor(render_length / 60); i++){
            processed.push(schedule_table.build_data(
                [
                    schedule_table.render_start + header_size + i * 60, 
                    schedule_table.render_start + header_size + (i+1) * 60,
                ],
                occupied_color,
                (
                    formatMinutes(schedule_table.render_start + i * 60) + "-" + formatMinutes(schedule_table.render_start + (i+1) * 60)
                )
            ))
    
        }
        schedule_table.add_column(0, processed)
    }  

    for(let i in loaded_schedules){
        if(loaded_schedules[i].times.length <= 0){
            continue;
        }

        let processed = []
        let times_len = loaded_schedules[i].times.length;


        processed.push(schedule_table.build_data([schedule_table.render_start, schedule_table.render_start + header_size], occupied_color, loaded_schedules[i].first_name + "<br>" + loaded_schedules[i].last_name))
        
        processed.push(schedule_table.build_data([schedule_table.render_start + header_size, loaded_schedules[i].times[0][0] + header_size], occupied_color))
        for(let span = 0; span < times_len - 1; span++){
            console.log("looping")
            processed.push(
                schedule_table.build_data(
                    [loaded_schedules[i].times[span][0] + header_size, loaded_schedules[i].times[span][1] + header_size],
                    free_color,
                    (formatMinutes(loaded_schedules[i].times[span][0]) + "-" + formatMinutes(loaded_schedules[i].times[span][1]))
                )
            )

            processed.push(
                schedule_table.build_data(
                    [loaded_schedules[i].times[span][1] + header_size, loaded_schedules[i].times[span + 1][0] + header_size],
                    occupied_color,
                )
            )

            /*   
            processed.push(schedule_table.build_data([loaded_schedules[i].times[span][0] + header_size, loaded_schedules[i].times[span][1] + header_size], "green", "inner-green"))
            processed.push(schedule_table.build_data([loaded_schedules[i].times[span][1] + header_size, loaded_schedules[i].times[span + 1][0] + header_size], "red", "inner-red"))
            */
        }
        processed.push(
            schedule_table.build_data(
                [loaded_schedules[i].times[times_len - 1][0] + header_size, loaded_schedules[i].times[times_len - 1][1]  + header_size],
                free_color,
                ((formatMinutes(loaded_schedules[i].times[times_len - 1][0]) + "-" + formatMinutes(loaded_schedules[i].times[times_len -1][1])))
            )
        )
        //processed.push(schedule_table.build_data([loaded_schedules[i].times[times_len-1][0] + header_size, loaded_schedules[i].times[times_len-1][1] + header_size, "green", "last"]))
        if(loaded_schedules[i].times[times_len-1][1] < schedule_table.render_end){
            processed.push(schedule_table.build_data([loaded_schedules[i].times[times_len-1][1] + header_size, schedule_table.render_end], occupied_color, ""))
        }

        schedule_table.add_column(0, processed)

    }

    /*
    for(let i in loaded_schedules){   
        //let i = '0a7fb852-8cb0-43ef-a2fe-a64f0208d10d'
        console.log(loaded_schedules)
        let header_size = 30

        
        if(loaded_schedules[i].times.length > 0){
        
            for(let span = 1; span < loaded_schedules[i].times.length - 1; span++){   
            if(span == 0){
                processed.push(
                    {
                        "span": [schedule_table.render_start, schedule_table.render_start + header_size],
                        "bg_color": "gray",
                        "text": (loaded_schedules[i].first_name + "<br>" + loaded_schedules[i].last_name),
                        "header": true
                    }
                )
                processed.push(
                    {
                        "span" : [schedule_table.render_start + header_size, loaded_schedules[i].times[span][0] + header_size],
                        "bg_color": "red",
                        "text": "",
                        "header": false
                    }
                );
            }
            processed.push(
                {
                    "span" : [loaded_schedules[i].times[span][0] + header_size, loaded_schedules[i].times[span][1] + header_size],
                    "bg_color": "green",
                    "text": "test",
                    "header": false
                }
            )

            processed.push(
                {
                    "span" : [loaded_schedules[i].times[span][1] + header_size, loaded_schedules[i].times[span + 1][0] + header_size],
                    "bg_color": "red",
                    "text": "",
                    "header": false
                }
            )
        }
    
    processed.push(
        {
            "span" : [loaded_schedules[i].times[loaded_schedules[i].times.length - 1][0] + header_size, loaded_schedules[i].times[loaded_schedules[i].times.length - 1][1] + header_size],
            "bg_color": "green",
            "text": "test",
            "header": false
        }
    )
    processed.push(
        {
            "span" : [loaded_schedules[i].times[loaded_schedules[i].times.length - 1][1] + header_size, schedule_table.render_end + header_size],
            "bg_color": "red",
            "text": "",
            "header": false
        }
    )
    schedule_table.add_column(0, processed)
    processed = []
    }
    }
    */
    console.log(schedule_table.get_html())
    $("#common_times_table").append(schedule_table.get_html());
});
