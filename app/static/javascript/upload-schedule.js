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
    console.log(course.weekday)
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
            console.log(course.course + " " + course.weekday)
            console.log(course.span[0] + " " + course.span[1])
            success = false;
            alert("En (eller flera) av kurserna slutar tidigare än vad den börjar!")
            break;
        }

        console.log(course.span)
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
                data: JSON.stringify({week_number: parseInt($("#week-select").val()), courses: courses}),
                
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

    console.log(courses)
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
                clear_results()

                let data = result.result
                console.log(data);
                
                for(let i in data){
                    console.log(data[i])
                    $("#result-day-" + data[i].weekday + " .weekday-results").append(create_course_form(data[i]))
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
    $.post(
        "/api/get-user-schedule",
        {
            user_public_id: user_public_id,
            week: parseInt(selected_week)
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
    }
)