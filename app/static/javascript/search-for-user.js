function follow(id){
    post_follow(id, 1)
    show_is_following(id, true)
    show_is_starred(id, false)
}

function unfollow(id){
    post_follow(id, 0)
    show_is_following(id, false)
    show_is_starred(id, false)
}

function star(id){
    post_follow(id, 2)
    show_is_following(id, true)
    show_is_starred(id, true)
}

function unstar(id){
    post_follow(id, 1)
    show_is_following(id, true)
    show_is_starred(id, false)
}

function show_is_starred(id, state=true){
    if(!state){
        $("#star-" + id).show()
        $("#unstar-" + id).hide()
    } else {
        $("#star-" + id).hide()
        $("#unstar-" + id).show()
    }

}

function show_is_following(id, state=true){
    if(!state){
        $("#follow-" + id).show()
        $("#unfollow-" + id).hide()
    } else {
        $("#follow-" + id).hide()
        $("#unfollow-" + id).show()
    }
}

function post_follow(id, level){
    return $.post("/api/follow-user", 
        {"user_public_id": id, "priority_level": level},
        function(result){
            console.log(result);
        })
}
