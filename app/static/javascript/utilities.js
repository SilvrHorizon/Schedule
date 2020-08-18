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

function extractMinutesFromString(string){
    console.log(parseInt(string.substr(0,2)))
    console.log(parseInt(string.substr(3,5)))
    return parseInt(string.substr(0,2)) * 60 + parseInt(string.substr(3,5))
}