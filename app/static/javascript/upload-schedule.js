let rudbeck_blocks = [
    [ //Block 1
        {
            "weekday": 0,
            "span": [500, 615]
        },
        {
            "weekday": 2,
            "span": [630, 690]
        },
        {
            "weekday": 3,
            "span": [835, 895]
        },
    ],
    [ //Block 2
        {
            "weekday": 0,
            "span": [630, 690]
        },
        {
            "weekday": 2,
            "span": [500, 615]
        },
        {
            "weekday": 3,
            "span": [905, 965]
        },
    ],
    [ //Block 3
        {
            "weekday": 0,
            "span": [700, 760]
        },
        {
            "weekday": 2,
            "span": [765, 825]
        },
        {
            "weekday": 3,
            "span": [700, 760]
        },
        {
            "weekday": 4,
            "span": [765, 815]
        },
    ],
    [ //Block 4
        {
            "weekday": 0,
            "span": [765, 825]
        },
        {
            "weekday": 2,
            "span": [700, 760]
        },
        {
            "weekday": 3,
            "span": [765, 825]
        },
        {
            "weekday": 4,
            "span": [700, 750]
        }, 
    ],
    [ //Block 5
        {
            "weekday": 0,
            "span": [835, 895]
        },
        {
            "weekday": 1,
            "span": [500, 615]
        },
        {
            "weekday": 4,
            "span": [630, 690]
        },
    ],
    [ //Block 6
        {
            "weekday": 0,
            "span": [905, 965]
        },
        {
            "weekday": 1,
            "span": [630, 690]
        },
        {
            "weekday": 4,
            "span": [500, 615]
        },
    ],
    [ //Block 7
        {
            "weekday": 1,
            "span": [785, 845]
        },
        {
            "weekday": 3,
            "span": [500, 615]
        },
        {
            "weekday": 4,
            "span": [905, 965]
        },
    ],
    [ //Block 8
        {
            "weekday": 1,
            "span": [855, 965]
        },
        {
            "weekday": 3,
            "span": [630, 690]
        },
        {
            "weekday": 4,
            "span": [835, 895]
        },
    ],
]

function course_sort_function(a, b){
    return a.span[0] - b.span[0]
}


schedule_type = ""

days = ["Måndag", "Tisdag", "Onsdag", "Torsdag", "Fredag"]
for(let block in rudbeck_blocks){
    console.log("Block: " + (parseInt(block) + 1))
    
    for(let instance in rudbeck_blocks[block]){
        console.log(days[rudbeck_blocks[block][instance].weekday] + ": " + formatMinutes(rudbeck_blocks[block][instance].span[0]) + "-" + formatMinutes(rudbeck_blocks[block][instance].span[1]))
    }
    console.log("\n")
}


function update_schedule_type(value)
{
    schedule_type = value
    if(schedule_type == "rbk-block"){
        $("#rbk-blocks").show()
    } else{
        $("#rbk-blocks").hide()
    }
}

//days = {0: "Måndag", 1 : "Tisdag", 2: "Onsdag", 3:"Torsdag", 4:"Fredag"}
let id_track = 0
function get_course_value(course){
    return course.weekday * 60 * 24 + course.begins
}

function clear_results(){
    for(let i = 0; i < 5; i++){
        $("#result-day-" + i + " .weekday-results").html('')
    }
}

function delete_form(form_id){
    console.log(form_id)
    $("#course-form-" + form_id).remove('')
}

function create_course_form(course){
    id_track++;

    let build = []
    build.push('<form id="course-form-' + id_track + '" class="form form-upper"><div class="form-group row">')
    build.push('<input class="form-weekday" type="hidden" value="')
    build.push(course.weekday)
    //console.log(course.weekday)
    build.push('"> <div class="col-xs-8">')
    build.push("<input placeholder='Skriv in kurs' type='text' value='")
    build.push(course.course)
    build.push("' class='input text-center warning-placeholder form-control form-course'></div> <div class='col-xs-4'><button type='button' onclick='delete_form(\"" + id_track + "\")' style='width: 100%' class='btn btn-danger'>Radera</button></div></div>")

    build.push("<div class='form-group row'>")
    build.push("<label for='begin-time' class='col-form-label col-xs-6'> Kursen börjar: </label>")
    build.push('<div class="col-xs-6">')
    build.push("<input ")

    if(course.span){
        build.push("value='")
        build.push(formatMinutes(course.span[0]))
        build.push("' ")
    }

    build.push("class='input form-control form-begins time-warning-placeholder' name='begin-time' type='time'>")
    build.push('</div>')
    //build.push("</div>")

    //build.push("<div class='form-group'>")
    build.push("<label class='col-form-label col-xs-6' for='end-time'> Kursen slutar: </label>")
    
    build.push('<div class="col-xs-6">')
    build.push("<input ")
    if(course.span){
        build.push("value='")
        build.push(formatMinutes(course.span[1]))
        build.push("' ")
    }
    build.push("class='input form-control form-ends' name='end-time' type='time'>")
    build.push("</div>")
    build.push("</div>")
    build.push("</form>")
    return build.join('')
}

function clear_rbk_blocks(){
    for(let block = 0; block < 8; block++){
        $("#rbk-block-input-" + block).val('')
    }
}

function submit_schedule(){
    let all_forms =  $(".form-upper");
    courses = [];
    let success = true;

    for(let i = 0 ; i <  all_forms.length; i++){
        let form = $(all_forms[i])

        let course = {"span" :[
            extractMinutesFromString($(form).find(".form-begins").val()),
            extractMinutesFromString($(form).find(".form-ends").val())
        ],
        "course": $(form).find(".form-course").val(),
        "weekday": parseInt($(form).find(".form-weekday").val())
        }

        if(course.span[0] > course.span[1]){
            success = false;
            alert("En (eller flera) av kurserna slutar tidigare än vad den börjar!")
            break;
        }

        if(isNaN(course.span[0]) || isNaN(course.span[1])){
            success = false
            alert("Du har inte fyllt i tiderna för en eller flera av klasserna");
            break;
        }

        if(course.course == ""){
            success = false
            alert("Du har inte fyllt i namnet på en av kurserna. Vänligen fyll i det innan du skickar in ditt schema")
            break;
        }

        courses.push(course)
    }

    if(success){
        $.ajax(
            {
                url: "/upload-schedule",
                type: "POST",
                dataType: "json",
                contentType: "application/json",
                data: JSON.stringify({week_number: selected_week, courses: courses}),
                
                success: function(result){
                    if(!result.success){
                        alert(result.error)
                    } else {
                        alert('Ändringar sparade')
                    }
                },

                fail: function(error){
                    alert(error)
                }
            },
        )
        
    }
}


function update_forms_by_rbk_blocks(blocks = null){
    clear_results()

    if(blocks == null){
        blocks = {};
        for(let i = 0; i < 8; i++){
            blocks[i] = ($("#rbk-block-input-" + i).val())
        }
    }

    let courses = []

    for(let i in blocks){
        if(blocks[i] == ""){
            continue;
        }
        console.log(blocks[i])
        console.log(i)

        for(let instance in rudbeck_blocks[i]){
            console.log(rudbeck_blocks[i][instance])
            courses.push({weekday: rudbeck_blocks[i][instance].weekday, span: rudbeck_blocks[i][instance].span, course: blocks[i]})
        }

         
    }

    courses.sort(course_sort_function)

    for(let course in courses){
        course = courses[course]
        $("#result-day-" + course.weekday + " .weekday-results").append(create_course_form(course))
    }
}

$("#parse-form").submit(
    function(e){
        e.preventDefault();
        let form = $('#parse-form')[0];
        let formData = new FormData(form)

        $("#parse-form-row").hide()
        $("#result-block").hide()
        $("#loading-row").show()

        $.ajax({
            url: "/api/parse-schedule",
            data: formData,
            processData: false,
            contentType: false,
            type: 'POST',
            success: function (result) {
                $("#loading-row").hide()
                $("#result-block").show()
                $("#parse-form-row").show()
                clear_rbk_blocks()
                clear_results()

                let data = result.result
                
                if(schedule_type == "rbk-block"){
                    
                    let blocks_remaining = [ //No loop for performance, and I can't be bothered to add a loop for something that only changes about once a year
                        0,1,2,3,4,5,6,7
                    ]

                    let found_blocks = {}

                    for(let course in data){
                        course = data[course]
                        if(course.course == ""){
                            continue;
                        }

                        for(let i in blocks_remaining){
                            let block_instance = rudbeck_blocks[blocks_remaining[i]]

                            for(let k in block_instance){
                                if(block_instance[k].weekday == parseInt(course.weekday)){
                                    if(block_instance[k].span[0] === course.span[0]){
                                        if(block_instance[k].span[1] === course.span[1]){
                                            //console.log("Kurs: " + course.course + " i block " + blocks_remaining[i])
                                            found_blocks[blocks_remaining[i]] = course.course
                                            //blocks_remaining.splice(i, 1)
                                            break;
                                        }    
                                    }
                                }
                            }
                        } 
                    }
                    console.log(found_blocks)
                    for(let i in found_blocks){
                        $("#rbk-block-input-" + i).val(found_blocks[i])
                    }

                    update_forms_by_rbk_blocks()

                } else { 
                    for(let i in data){
                        console.log(data[i])
                        $("#result-day-" + data[i].weekday + " .weekday-results").append(create_course_form(data[i]))
                    }
                }
            },
            error: function (e) {
                console.log(e)
                alert("Fel: " + e.statusText) 
                console.log(e)
            }
        });
    }
)

function add_course_field(weekday){
    $("#result-day-" + weekday + " .weekday-results").append(
        create_course_form({course: null, weekday: weekday})
    )
}

function load_week(selected_week){
    console.log(selected_week)

    $.post(
        "/api/get-user-schedule",
        {
            user_public_id: user_public_id,
            week: selected_week
        },
        function(result){
            console.log( result)
            clear_results()
            for(let i in result){
                for(j in result[i]){
                    result[i][j]["weekday"] = i;
                    console.log(result[i][j])
                    $("#result-day-" + i + " .weekday-results").append(create_course_form(result[i][j]))
                }
            }
        }
    )
}

$(document).ready(
    function(){
        load_week(selected_week)
        update_schedule_type($("#schedule-type-select").val())
    }
)