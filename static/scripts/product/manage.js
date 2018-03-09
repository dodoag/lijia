var changeIsExp={}
var isExpOnChange= function (id,that) {
    changeIsExp[id]=that.checked?1:0
}
var submitIsExp = function(){
    if(JSON.stringify(changeIsExp) == "{}"){
        alert("Nothing to update")
    }else{
        $.post('/manage/update-video-data', changeIsExp,function (resp) {
            console.log(resp);
            if(resp){
                changeIsExp={}
                location.reload();
            }
        }, "json");
    }
}



$(function() {
})