var plugin = function () {

    var play = new Object();
    var videoCount = 0;

    //兼容主流浏览器的requestNextAnimationFrame 和 cancelNextRequestAnimationFrame方法
    window.requestNextAnimationFrame = (function () {
        var originalWebkitRequestAnimationFrame = undefined,
            wrapper = undefined,
            callback = undefined,
            geckoVersion = 0,
            userAgent = navigator.userAgent,
            index = 0,
            self = this;

        if (window.webkitRequestAnimationFrame) {
            wrapper = function (time) {
                if (time === undefined) {
                    time = +new Date();
                }
                self.callback(time);
            };

            originalWebkitRequestAnimationFrame = window.webkitRequestAnimationFrame;

            window.webkitRequestAnimationFrame = function (callback, element) {
                self.callback = callback;

                originalWebkitRequestAnimationFrame(wrapper, element);
            }
        }

        if (window.mozRequestAnimationFrame) {
            index = userAgent.indexOf('rv:');

            if (userAgent.indexOf('Gecko') != -1) {
                geckoVersion = userAgent.substr(index + 3, 3);

                if (geckoVersion === '2.0') {
                    window.mozRequestAnimationFrame = undefined;
                }
            }
        }

        return window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || window.oRequestAnimationFrame || window.msRequestAnimationFrame || function (callback, element) {
            var start, finish;

            window.setTimeout(function () {
                start = +new Date();
                callback(start);
                finish = +new Date();
                self.timeout = 1000 / 60 - (finish - start);
            }, self.timeout);
        };
    }());

    window.cancelNextRequestAnimationFrame = window.cancelRequestAnimationFrame || window.webkitCancelAnimationFrame || window.webkitCancelRequestAnimationFrame || window.mozCancelRequestAnimationFrame || window.oCancelRequestAnimationFrame || window.msCancelRequestAnimationFrame || window.cancelAnimationFrame || clearTimeout;

    var animate;
    //初始化
    play.init = function () {

        play.innerHTML();

        $('.eJectContent').perfectScrollbar();

        play.screenW = window.screen.width;//屏幕宽度

        play.screenH = window.screen.height;//屏幕高度

        play.boxs = $('#faceBoxs').get(0);//播放器盒子

        play.boxsW = play.boxs.clientWidth;//盒子宽度

        play.boxsH = play.boxs.clientHeight;//盒子高度

        play.media = $('#faceMedia').get(0);//视频媒体
        play.media.onplay = function () {
            var vtype = videoT[videoCount].type;
            if (vtype == "4") {
                var id = videoT[videoCount].id;
                var action = "video start";
                $.post('/sign/' + id + '/action', {action: action}, function (data) {
                }, "json");
            }
        };

        play.media.onpause = function () {
            var vtype = videoT[videoCount].type;
            if (vtype == "4") {
                var id = videoT[videoCount].id;
                var action = "video pause";
                $.post('/sign/' + id + '/action', {action: action}, function (data) {
                }, "json");
            }
        };

        play.canvas = $('#faceCanvas').get(0);//播放视频的canvas

        play.canvasW = play.boxsW;//canvas宽度

        play.canvasH = play.boxsH;//canvas高度

        play.controlBox = $('#controlBox').get(0);//控制器盒子

        play.playBtn = $('#playBtn').get(0);//播放\暂停按钮

        play.currTime = $('#currTime');//显示当前时间00:00:00

        play.totalTime = $('#totalTime');//显示总时间00:00:00

        play.pregTimeBar = $('#pregTimeBar');//进度条

        play.progBtnBar = $('#progBtnBar').get(0);//进度条按钮

        play.OpenVolBtn = $('#OpenVolBtn').get(0);//开启/关闭静音

        play.volumeMask = $('#volumeMask').get(0);//音量调节器

        play.PreLoad = $('#PreLoad');//预加载进度条

        play.fullScreen = $('#FullScreen').get(0);//全屏按钮

        play.addBtn = $('#addBtn').get(0);//添加商品按钮

        // $( play.boxs ).css({ 'top':($(window).height() - play.boxsH ) / 2, 'left':($(window).width() - play.boxsW) / 2 });

        play.boxsT = $(play.boxs).position().top;//top值

        play.boxsL = $(play.boxs).position().left;//left值

        play.question = {};

        // play.answers = {length:0};

        play.answers = new Array();

        play.fn= new Object();
        play.drawImages("/static/images/zd.jpg");

        play.elmeEvent();
        play.playEvent();
        play.getVideo();
        //IE下禁止选择
        document.body.onselectstart = document.body.ondrag = function () {
            return false;
        };

    };
    //判断视频状态

    play.getVideo = function () {
        var myInterval = setInterval(function () {
            console.log("getVideo")
            if (play.media.readyState > 0) {

                play.totalTime.empty().append(play.formatSeconds(play.media.duration));

                clearInterval(myInterval);

                console.log('获取video状态ok');

                play.getData();
            }
        },500);
    };

    //获取已经标记的广告列表
    play.getData = function () {
        var id = videoT[videoCount].id;
        console.log(id)
        $.post('/sign/' + id + '/select-play-data', function (data) {

            play.ads = data;

            if (play.ads) {
                play.ads.forEach(function (value) {
                    var _currT = value.time,//获取媒体播放的当前时间
                        _totalT = play.media.duration,//获取媒体的总时长
                        _calcT = 100 * _currT / _totalT;//计算时间
                    $("#progBtnBar").append('<div class="dotBox" style="left:calc(' + _calcT + '% - 5px);"><span>' + value.title + '</span></div>');

                })

            }

        }, "json");

    }

    //在未播放前绘制图片
    play.drawImages = function (pic) {

        play.setCanvasWH();

        if (play.canvas.getContext) {

            var ctx = play.canvas.getContext("2d");

            var img = new Image();

            img.src = pic;

            img.onload = function () {

                ctx.drawImage(img, 0, 0);

            };

        }
        ;

    };

    //播放器控制事件
    play.playEvent = function () {

        console.log("playEvent")
        //预加载事件
        play.media.addEventListener("progress", function () {

            var _total = play.media.duration,

                _currt = play.media.buffered.length>0?play.media.buffered.end(0):0,

                res = 100 * _currt / _total;

            res = res > 90 ? 100 : res.toFixed(2);

            play.PreLoad.css('width', res + '%');

        }, false);

        //播放按钮
        play.playBtn.addEventListener('mouseup', function (e) {

            !play.isPlay ? play.media.play() : play.media.pause();

            e.stopPropagation();

        }, false);

        //全屏
        play.fullScreen.addEventListener('mouseup', function (e) {

            !play.IsFullScreen ? play.goFullScreen() : play.exitFullScreen();

            e.stopPropagation();

        }, false);


        //开启/关闭静音
        play.OpenVolBtn.addEventListener('mouseup', function (e) {

            play.media.muted = !play.media.muted;

            if (play.media.muted) {

                $(this).removeClass('icon-ion-android-volume-up').attr('class', 'icon-ion-android-volume-off Btn');

            } else {

                $(this).removeClass('icon-ion-android-volume-off').attr('class', 'icon-ion-android-volume-up Btn');

            }
            ;

            e.stopPropagation();

        }, false);

        //音量调节
        play.volumeMask.addEventListener('mouseup', function (e) {

            var _posi = Math.abs(e.pageY - $(play.volumeMask).offset().top),

                volume = parseInt(100 * _posi / $(play.volumeMask).height());

            $('#volume2').css('height', volume - 5 + '%');

            volume = ((100 - volume + 5) / 100) < 0 ? 0 : (100 - volume + 5) / 100;

            console.log('音量：' + volume);

            if (volume == 0) {

                $(play.OpenVolBtn).removeClass('icon-ion-android-volume-up').attr('class', 'icon-ion-android-volume-off Btn');

            } else {

                play.media.muted = false;

                $(play.OpenVolBtn).removeClass('icon-ion-android-volume-off').attr('class', 'icon-ion-android-volume-up Btn');

            }
            ;

            play.media.volume = volume;

            e.stopPropagation();

        }, false);

        //媒体自带播放事件
        play.media.addEventListener("play", function () {
            play.func_frame();

            play.isPlay = true;

            $(play.playBtn).removeClass('icon-ion-ios-play').attr('class', 'icon-ion-ios-pause');

            console.log('video play');

            $(play.addBtn).hide();

            play.isClick = false;

        }, false);

        //媒体自带暂停事件
        play.media.addEventListener("pause", function (e) {

            console.log('video pause');

            play.isPlay = false;

            $(play.playBtn).removeClass('icon-ion-ios-pause').attr('class', 'icon-ion-ios-play');

            window.cancelNextRequestAnimationFrame(animate);

            if (play.isClick) {

                play.calcPosition(play.clickX, play.clickY);

                // $( play.addBtn ).show().css({ left:play.calcX, top:play.calcY });
            }
            ;

        }, false);

        //媒体播放结束后调用
        play.media.addEventListener("ended", function () {
            console.log('已结束' + videoCount);
            var vtype = videoT[videoCount].type;
            if (vtype == "4") {
                var id = videoT[videoCount].id;
                var action = "video end";
                $.post('/sign/' + id + '/action', {action: action}, function (data) {
                }, "json");
            }
            videoCount++;
            if (videoCount < videoT.length) {
                var countdown=10;
                $(".rights").empty()
                $(".rights").slideDown(200);
                var myCountdown = setInterval(function () {
                    if (countdown == 0) {
                        $(".rights").slideUp(200);
                        clearInterval(myCountdown);
                        play.media.play();
                    }else{
                        $(".rights").empty().append("<p style='text-align: center;padding-top:50px;font-size: 100px;'>"+countdown+"</p>");
                        countdown--;
                    }
                },1000);
                $("#faceMedia").attr({"src": videoT[videoCount].path});
                play.media=$('#faceMedia').get(0);
                play.getVideo();
            } else {
                videoCount = 0;
                $("#faceMedia").attr({"src": videoT[videoCount].path});
                play.media = $('#faceMedia').get(0);
                play.getVideo();
            }
            vtype = videoT[videoCount].type;
            if (vtype == "2") {
                $('#rate-bar').css("display", "block");
            }else{
                $('#rate-bar').css("display", "none");
            }
            // play.drawImages("/static/images/end.jpg");

            $('.adshow').fadeOut(100, function () {

                $('.adshow').remove();

            });

        }, false);

        //播放时间被改变
        play.media.addEventListener("timeupdate", function () {
            var _currT = play.media.currentTime,//获取媒体播放的当前时间

                _totalT = play.media.duration,//获取媒体的总时长

                _calcT = 100 * _currT / _totalT;//计算时间

            play.currTime.empty().append(play.formatSeconds(_currT));

            play.pregTimeBar.css('width', _calcT + '%');

        }, false);

        //进度条被按下
        play.progBtnBar.addEventListener("mouseup", function (e) {

            play.timeDrag = true;

            play.updateBar(e.pageX);

            console.log('down:x:' + e.pageX);

            play.media.play();

            e.stopPropagation();

            var _time = Math.round(play.media.currentTime * 10) / 10;

            $('.adshow').each(function (i) {

                var _length = parseFloat($(this).attr('data-length'));

                if (_length > _time) {

                    $(this).remove();

                }

            });

        }, false);
        play.fn.updateAns=function (QID,val1,val2) {
            if(null==val1){
                play.answers[QID]?
                    (play.answers[QID].ans?
                        (play.answers[QID]={ans:play.answers[QID].ans,score:val2})
                        :(play.answers[QID]={score:val2}))
                    :(play.answers[QID]={score:val2});
            }
            if(null==val2){
                play.answers[QID]?
                    (play.answers[QID].score?
                        (play.answers[QID]={score:play.answers[QID].score,ans:val1})
                        :(play.answers[QID]={ans:val1}))
                    :(play.answers[QID]={ans:val1});
            }
        };
        play.fn.getAns=function () {
            var temp ={};
            for(var i = 1;i<=10;i++){
                temp["Q"+i]=play.answers[i]||"";
            }
            return temp;
        }
        play.fn.getAnsLength=function () {
            var length=0;
            for(var i = 1;i<=10;i++){
                play.answers[i]&&length++;
            }
            return length;
        }
    };

    //其他元素事件注册
    play.elmeEvent = function () {

        //屏蔽播放器的右键
        play.boxs.oncontextmenu = function () {

            return false;

        };

        //按下空格键的播放、暂停
        document.addEventListener('keydown', function (event) {

            if ($('#mask').is(':visible')) {
                return false;
            }

            var keycode = event.keyCode || event.which;

            play.isStop = play.media.paused;

            if (keycode == 32) {//空格

                if (play.isStop) {

                    if (!play.firstPlay) {

                        console.log('第一次播放！');

                        play.media.play();

                        play.firstPlay = true;

                        return false;

                    }
                    ;

                    play.media.play();

                } else {

                    play.media.pause();

                }
                ;

            }
            ;

            if (keycode == 37) {//键盘左键

                console.log('向前10s');

                var _currT = play.media.currentTime,

                    _totalT = play.media.duration;
                console.log(_currT);
                play.media.currentTime = (_currT - 10) < 0 ? 0 : (_currT - 10);
                console.log(play.media.currentTime);
                play.firstPlay = true;
                play.media.play();
            }
            ;

            if (keycode == 39) {//键盘右键

                console.log('向后10s');

                var _currT = play.media.currentTime,

                    _totalT = play.media.duration,

                    _res = _currT + 10;

                if (_res > _totalT) {

                    play.media.currentTime = parseInt(_totalT);

                } else {

                    play.media.currentTime = _res;

                };
                // play.media.play();

                play.firstPlay = true;

            }
            ;

        }, false);

        $("#faceCanvas").bind('mousedown', function (e) {

            //第一次点击：播放，以后则全部暂停
            if (!play.firstPlay) {

                play.media.play();

                play.firstPlay = true;

            } else {

                if (!play.media.paused) {
                    play.media.pause();
                } else {
                    play.media.play();
                }

            }

            play.clickX = e.pageX;

            play.clickY = e.pageY;

            play.isClick = true;

        });

        //移动时判断是否显示控制器
        $('#faceCanvas,#controlBox').bind('mousemove', function (e) {

            play.imouse = true;
            play.myX = e.pageX;
            play.myY = e.pageY;

            if (play.firstPlay && !play.start) {

                play.controlIsShow = true;

                var vtype = videoT[videoCount].type;
                if (vtype != "2") {
                    $(play.controlBox).slideDown(600);
                }

            }
            ;

        });

        //添加按钮被单击
        $(play.addBtn).bind('click', function (e) {
            var vtype = videoT[videoCount].type;
            if (vtype == "4") {
                var id = videoT[videoCount].id;
                var action = "click add btn";
                $.post('/sign/' + id + '/action', {action: action}, function (data) {
                }, "json");
            }

            if (!navigator.cookieEnabled) {

                alert('您的浏览器未开启cookie，无法进行标点！');

            } else {

                $('#mask').fadeIn(200);

                $('#panelBox').slideDown(200);

                $('.handadd').click();

            }

        });

        //素材库按钮被选择
        $('body').delegate('.source', {
            click: function () {

                $('.existing').addClass('selected').siblings().removeClass('selected');

                $('#showBox').empty();

                $.post('/sign/select-pro-data', function (data) {

                    if (!data) {

                        var _div = "<div class='person'>还没有数据哦！快去添加吧！</div>";

                        $('#showBox').append(_div);

                    } else {

                        var _div = "<div id='personAll'>";

                        $.each(data, function (key, val) {

                            var _desc = val['desc'].length > 53 ? val['desc'].substr(0, 53) + '...' : val['desc'];

                            var _type = '';
                            switch (parseInt(val['type'])) {
                                case 1 :
                                    _type = '音乐';
                                    break;
                                case 2 :
                                    _type = '人物';
                                    break;
                                case 3 :
                                    _type = '品牌';
                                    break;
                                case 4 :
                                    _type = '道具';
                                    break;
                                case 5 :
                                    _type = '话题';
                                    break;
                                case 6 :
                                    _type = '行为';
                                    break;
                            }

                            _div += "<div class='person person" + key + "' data-index='" + key + "'>";

                            _div += "<span class='Ptype'>" + _type + "</span>";

                            if (val['url']) {

                                _div += "<span class='title'>" + val['title'] + "</span>";

                            } else {

                                _div += "<span class='title'>" + val['title'] + "</span>";

                            }

                            _div += "<img class='okIcon' src='/static/images/bjsj_c.png'></div>";
                        });

                        _div += "</div><button id='cancel'>取消</button>";

                        $('#showBox').append(_div);
                    }

                    $('#personAll').perfectScrollbar();

                }, "json");
            }
        });

        //手动添加信息被选择
        $('.handadd').bind('click', function () {

            $(this).addClass('selected').siblings().removeClass('selected');

            var _html = '<table class="playTable" cellspacing="0" cellpadding="0" border="0"><tr style="height:40px;"><td><i class="big">•</i> 标题：</td><td style="position:relative"><input class="borderStyle title" type="text" maxlength="15" placeholder="标题内容不超过15字 (必填)" /><ul class="productType"><span style="height: 12px;line-height: 10px;position: absolute;text-align: right;top: 10px;width: 16px;">∨</span><li data-type="1" class="chekcLi">音乐</li><li data-type="2">人物</li><li data-type="3">品牌</li><li data-type="4">道具</li><li data-type="5">话题</li><li data-type="6">行为</li></ul><span class="source">素材库</span></td></tr><tr style="height:40px;"><td><i class="big">•</i> 链接：</td><td><input class="borderStyle url" type="url" placeholder="请添加有效http链接 (必填)"></td></tr><tr style="height:40px;"><td>时长：</td><td><div class="inputBox"><input class="borderStyle length" type="text" maxlength="1" value="3"><span class="elem">秒（1-9秒）</span></div></td></tr><tr style="height:90px;"><td colspan="2" style="text-align: center; width: 100%;"><label for="imgfile" style="display: inline-block"><img class="borderStyle file" src="/static/images/img2.jpg" alt=""><input type="file" id="imgfile"></label><textarea class="borderStyle desc" maxlength="500" placeholder="描述信息不超过500字"></textarea></td></tr><tr style="height:40px;"><td colspan="2" style="text-align:center;"><button id="submit">确定</button></td></tr></table>';

            $('#showBox').empty().append(_html);

        });

        //关闭按钮
        $('.close').bind('click', function () {
            // con
            var vtype = videoT[videoCount].type;
            if (vtype == "4") {
                var id = videoT[videoCount].id;
                var action = "click close btn";
                $.post('/sign/' + id + '/action', {action: action}, function (data) {
                }, "json");
            }

            $('#mask').fadeOut(200);

            $('#panelBox').slideUp(200);

            $('#eJectBox').slideUp(200);

            play.media.play();

        });

        // $('#mask').bind('click', function () {
        //
        //     $('.close').click();
        //
        // });

        //类型事件
        $('body').delegate('.productType', {

            mouseover: function () {

                $(this).css('height', 'auto');

            },
            mouseout: function () {

                $(this).css('height', '32px');

            }

        });

        //某个类型被点击
        $('body').delegate('.productType li', {

            click: function () {

                $(this).addClass('chekcLi').siblings('li').removeClass('chekcLi').closest('ul').prepend($(this));

                $(this).closest('ul').css('height', '32px');

            }

        });

        //选择某个素材
        $('body').delegate('.person', {
            click: function () {

                var index = $(this).closest('.person').attr('data-index');

                $.post('/sign/check-source', {index: index}, function (data) {
                    if (data) {

                        play.base64 = data.img;

                        $('.handadd').addClass('selected').siblings().removeClass('selected');

                        var _html = '<table class="playTable" cellspacing="0" cellpadding="0" border="0"><tr style="height:40px;"><td><i class="big">•</i> 标题：</td><td style="position:relative"><input class="borderStyle title" type="text" maxlength="15" value="' + data.title + '" placeholder="标题内容不超过15字 (必填)" /><ul class="productType"><span style="height: 12px;line-height: 10px;position: absolute;text-align: right;top: 10px;width: 16px;">∨</span><li data-type="1">音乐</li><li data-type="2">人物</li><li data-type="3">品牌</li><li data-type="4">道具</li><li data-type="5">话题</li><li data-type="6">行为</li></ul><span class="source">素材库</span></td></tr><tr style="height:40px;"><td><i class="big">•</i> 链接：</td><td><input class="borderStyle url" type="url" placeholder="请添加有效http链接 (必填)" value="' + data.url + '"></td></tr><tr style="height:40px;"><td>时长：</td><td><div class="inputBox"><input class="borderStyle length" type="text" maxlength="1" value="3"><span class="elem">秒（1-9秒）</span></div></td></tr><tr style="height:90px;"><td colspan="2" style="text-align: center; width: 100%;"><label for="imgfile" style="display: inline-block"><img class="borderStyle file" src="' + data.img + '" alt=""><input type="file" id="imgfile"></label><textarea class="borderStyle desc" maxlength="500" placeholder="描述信息不超过500字">' + data.desc + '</textarea></td></tr><tr style="height:40px;"><td colspan="2" style="text-align:center;"><button id="submit">确定</button></td></tr></table>';

                        $('#showBox').empty().append(_html);

                        $('li[data-type="' + data.type + '"]').click();

                    } else {

                        return false;

                    }

                }, "json");

            }
        });

        //取消按钮
        $('body').delegate('#cancel', {
            click: function () {
                $('.handadd').click();
            }
        });

        //logo点击跳转
        $('body').delegate('#faceLogo', {
            click: function () {
                var vtype = videoT[videoCount].type;
                if (vtype == "4") {
                    var id = videoT[videoCount].id;
                    var action = "click face logo";
                    $.post('/sign/' + id + '/action', {action: action}, function (data) {
                    }, "json");
                }
                window.location.href = '/home/login';
            }
        });

        //提交按钮
        $('body').delegate('#submit', {

            click: function () {

                if (!play.isClick) {

                    return false;

                }
                ;

                var data = {

                        type: $.trim($('.chekcLi').attr('data-type')),//类型

                        title: $.trim($('.title').val()),//标题

                        length: parseInt($('.length').val()),//时长

                        url: $.trim($('.url').val()),//http地址

                        desc: $.trim($('.desc').val()),//描述

                        base: play.base64,//图片编码

                        time: Math.round(play.media.currentTime * 10) / 10,//视频当前播放时间

                        topY: play.calcY,//top值

                        leftX: play.calcX//left值

                    },
                    len = data.desc.length;

                console.log(data);

                if (!data.title) {
                    alert('标题填写有误，请重新填写！');
                    $('.title').val('').focus();
                    return false;
                }

                if (!data.length) {
                    alert('时长填写有误，请重新填写！');
                    $('.length').val('3').focus();
                    return false;
                } else {
                    if (data.length > 10) {
                        data.length = 10;
                    }
                    ;
                }
                ;

                if (len > 500) {
                    alert('抱歉，描述信息不能超过500字！');
                    $('.desc').val(data.desc.substr(0, 500));
                    return false;
                }

                if (!play.isUrl(data.url)) {

                    alert('链接地址填写有误，请填写有效地址！');
                    $('.url').val('').focus();
                    return false;

                }
                ;

                var id = videoT[videoCount].id;
                $.post('/sign/' + id + '/insert-play-data', data, function (data) {

                    if (data) {

                        play.getData();

                        $('#mask').fadeOut(200);

                        $('#panelBox').slideUp(200);

                        play.media.currentTime = play.media.currentTime - 0.2;

                        play.media.play();

                    }

                }, "json");

            }

        });

        $('body').delegate('#imgfile', {

            change: function () {

                var _obj = $(this);

                var file = this.files[0];

                if (file.size > 2 * 1024 * 1024) {

                    alert("请上传小于2M的图片文件！");

                    return false;

                } else if (!/image\/\w+/.test(file.type)) {

                    alert("请上传jpg类型的文件！");

                    return false;

                } else {

                    var reader = new FileReader();

                    reader.readAsDataURL(file);

                    reader.onload = function (e) {

                        play.base64 = this.result;

                        console.log(play.base64);

                        _obj.siblings('img').attr("src", play.base64);

                    };

                }
                ;

            }

        });

        //设置时长
        $('body').delegate('.setBtn', {

            mouseenter: function () {

                $(this).animate({

                    'width': '100%'

                }, 100);

            },
            mouseleave: function () {

                $(this).animate({

                    'width': '20px'

                }, 100);

            }

        });

        $('body').delegate('.adshow', {

            mouseleave: function () {

                $(this).find('.adsTitle').fadeOut(300);
                var vtype = videoT[videoCount].type;
                if (vtype == "4") {
                    var id = videoT[videoCount].id;
                    var action = "mouse leave title";
                    $.post('/sign/' + id + '/action', {action: action}, function (data) {
                    }, "json");
                }
            }

        });

        $('body').delegate('.adsIcon', {

            mouseover: function () {
                var vtype = videoT[videoCount].type;
                if (vtype == "4") {
                    var id = videoT[videoCount].id;
                    var action = "mouse over title";
                    $.post('/sign/' + id + '/action', {action: action}, function (data) {
                    }, "json");
                }
                $(this).siblings('.adsTitle').fadeIn(300);

            }

        });

        //标题点击
        $('body').delegate('.adsTitle', {

            click: function () {
                console.log("adsTitleclick");
                var index = $(this).attr('data-index');
                var btnId = $(this).attr('data-id');
                var id = videoT[videoCount].id;
                var vtype = videoT[videoCount].type;
                $(".eJectRight>.typecommon").css({display:"block"});
                $(".eJectRight>.type3").css({display:"none"});
                if (vtype == "4") {
                    var action = "mouse click title";
                    $.post('/sign/' + id + '/action', {action: action}, function (data) {
                    }, "json");
                }else if(vtype == "3"){
                    $(".eJectRight>.type3").css({display:"block"});
                    $(".eJectRight>.typecommon").css({display:"none"});
                }

                play.media.pause();
                $.post('/sign/' + id + '/select-index-data', {index: index, btnId:btnId}, function (data) {

                    if (data) {

                        $('.eJectTitle').empty().append(data['title']);

                        play.question=JSON.parse(data['question']);

                        play.answers.splice(0,10);

                        $('.question').text("").text(play.question.Q1||"no question");

                        $('.question').attr({"data-index":1});

                        $('.rangeQ').val(10).change();

                        var _desc = data['desc'] == "" ? '您没有填写详情介绍!' : data['desc'];

                        // $('.eJectContent').empty().append(_desc);

                        var _img = data['img'] == '' || null ? '/static/images/bg_img.png' : data['img'];

                        $('.eJectImg').attr('src', _img);

                        $('.eJectJump').attr('href', data['url'])

                        $('#mask').fadeIn(200);

                        $('#eJectBox').slideDown(200);

                    } else {

                        return false;

                    }

                }, "json");

            }

        });
        $(".preQues").on('click',function (e) {
            console.log(play.answers);
            $(".answerText").css({display:"inline-block"});
            $('.rangeslider').css({display:"block"});
            $(".rangeText").css({display:"block"});
            var index = parseInt($('.question').attr('data-index'));
            if(index>1){
                index--;
                $('.question').text("").text(play.question["Q"+index]||"no question");
                $('.question').attr({"data-index":index});

            }else if(index=1){
                index--;
                $('.question').attr({"data-index":index});
                $('.question').text("end");
                $(".answerText").css({display:"none"});
                $('.rangeslider').css({display:"none"});
                $(".rangeText").css({display:"none"});
            }
            if(play.answers[index]){
                $(".answerText").val(play.answers[index].ans);
                $('.rangeQ').val(play.answers[index].score).change();
            }else{
                $('.rangeQ').val(10).change();
                $(".answerText").val("");
            }
        });
        $(".nextQues").on('click',function (e) {
            console.log(play.answers);
            $(".answerText").css({display:"inline-block"});
            $('.rangeslider').css({display:"block"});
            $(".rangeText").css({display:"block"});
            var index = parseInt($('.question').attr('data-index'));
            if(index<10){
                index++;
                $('.question').text("").text(play.question["Q"+index]||"no question");
                $('.question').attr({"data-index":index});
            }else if(index=10){
                index++;
                $('.question').attr({"data-index":index});
                $('.question').text("end");
                $(".answerText").css({display:"none"});
                $('.rangeslider').css({display:"none"})
                $(".rangeText").css({display:"none"});
            }
            if(play.answers[index]){
                $(".answerText").val(play.answers[index].ans);
                $('.rangeQ').val(play.answers[index].score).change();
            }else{
                $(".answerText").val("");
                $('.rangeQ').val(10).change();
            }
        });
        $(".answerText").on("change",function () {
            var index = parseInt($('.question').attr('data-index'));
            play.fn.updateAns(index,this.value,null);
            if(play.fn.getAnsLength()==10){
                $(".submitAns").click();
            }
        });
        $(".submitAns").on('click',function (e) {
            console.log(play.fn.getAns());
            $(".close").click();
            var id = videoT[videoCount].id;
            var btnId = $(".adsTitle").attr('data-id');
            $.post('/sign/' + id + '/Insert-answer-data', {btnId:btnId,ans:JSON.stringify(play.fn.getAns())}, function (data) {
                    // if(data){
                    //     $(".close").click();
                    // }
            }, "json");
        });
        $('.rangeQ').rangeslider({
            // Deactivate the feature detection
            polyfill: false,

            // Callback function
            onSlide: function (position, value) {
                console.log('onSlide');
                console.log('position: ' + position, 'value: ' + value);
                var index = parseInt($('.question').attr('data-index'));
                $(".rangeText").text(value);
                play.fn.updateAns(index,null,value);
                if(play.fn.getAnsLength()==10){
                    $(".submitAns").click();
                }
            },
        });
        $('.eJectClose').click(function () {
            var vtype = videoT[videoCount].type;
            if (vtype == "4") {
                var id = videoT[videoCount].id;
                var action = "close ads detail";
                $.post('/sign/' + id + '/action', {action: action}, function (data) {
                }, "json");
            }
            $('.close').click();
        });

    };

    play.expired = function () {

        var _time = Math.round(play.media.currentTime * 10) / 10;

        //遍历过期的ads，并删除
        $('.adshow').each(function (i) {

            var _length = parseFloat($(this).attr('data-length')) + 1;

            if (_time > _length) {

                $(this).fadeOut(500, function () {

                    $(this).remove();

                });

            }
            ;

        });

    };

    play.ierval = setInterval(function () {

        if (play.firstPlay) {//首次点击

            if (play.imouse) {//鼠标是否移动

                play.imouse = false;

                // console.log("鼠标移动过");
                var vtype = videoT[videoCount].type;
                if (vtype == "4") {
                    var id = videoT[videoCount].id;
                    var action = "mouse:" + play.myX + ":" + play.myY;
                    $.post('/sign/' + id + '/action', {action: action}, function (data) {
                    }, "json");
                }

                if (!play.controlIsShow) {//控制器是否显示

                    // console.log('开启');

                    play.controlIsShow = true;
                    var vtype = videoT[videoCount].type;

                    if (vtype != "2") {
                        $(play.controlBox).slideDown(600);
                    }
                }
                ;

            } else {

                // console.log("未移动");

                if (play.controlIsShow) {

                    // console.log('关闭');

                    play.controlIsShow = false;
                    // var vtype = videoT[videoCount].type;
                    // if(vtype == "2"){
                    $(play.controlBox).slideUp(600);
                    // }
                }
                ;

            }
            ;

        }
        ;

    }, 1000);

    //清除所有元素
    play.clearAll = function () {


    };

    //url地址验证
    play.isUrl = function (url) {

        var reg = /http(s)?:\/\/([\w-]+\.)+[\w-]+(\/[\w- .\/?%&=]*)?/;

        var objExp = new RegExp(reg);

        if (objExp.test(url) == true) {

            return true;

        } else {

            return false;

        }
        ;

    };

    //计算描点在视频中的百分比位置
    play.calcPosition = function (x, y) {

        var _left = $(play.boxs).offset().left,

            _top = $(play.boxs).offset().top,

            _h = $(play.boxs).height(),

            _w = $(play.boxs).width(),

            _x = x - _left,

            _y = y - _top;

        play.calcX = (100 * _x / _w) + '%';

        play.calcY = (100 * _y / _h) + '%';

    };

    //更新进度条
    play.updateBar = function (x) {

        var _docu = $(play.progBtnBar),

            _total = play.media.duration,

            position = x - _docu.offset().left,

            _res = 100 * position / _docu.width();

        if (_res > 100) {

            _res = 100;

        }
        ;

        if (_res < 0) {

            _res = 0;

        }
        ;

        console.log('set width');

        play.pregTimeBar.css('width', _res + '%');

        play.media.currentTime = _total * _res / 100;

    };

    //进入全屏
    play.goFullScreen = function () {

        //先清除选区
        play.clearAll();

        $(play.boxs).css({

            'width': play.screenW,

            'height': play.screenH,

            'top': '0',

            'left': '0'

        });

        play.canvasW = play.screenW;

        play.canvasH = play.screenH;

        play.copyVtoC();//重新绘制图像，解决暂停时放大、缩小一瞬间卡屏问题

        if (play.boxs.requestFullscreen) {

            play.boxs.requestFullscreen();

        } else if (play.boxs.webkitRequestFullScreen) {
            // 对 Chrome 特殊处理，
            // 参数 play.boxs.ALLOW_KEYBOARD_INPUT 使全屏状态中可以键盘输入。
            if (window.navigator.userAgent.toUpperCase().indexOf('CHROME') >= 0) {

                play.boxs.webkitRequestFullScreen(play.boxs.ALLOW_KEYBOARD_INPUT);

            } else {
                // Safari 浏览器中，如果方法内有参数，则 Fullscreen 功能不可用。
                play.boxs.webkitRequestFullScreen();

            }
            ;

        } else if (play.boxs.mozRequestFullScreen) {

            play.boxs.mozRequestFullScreen();

        } else if (play.boxs.msRequestFullscreen) {

            play.boxs.msRequestFullscreen();

        } else if (play.boxs.oRequestFullscreen) {

            play.boxs.oRequestFullscreen();

        }
        ;

        play.IsFullScreen = true;

        $(play.fullScreen).removeClass('icon-ion-arrow-expand').attr('class', 'icon-ion-arrow-shrink Btn');

        console.log('进入全屏');

    };

    //退出全屏
    play.exitFullScreen = function () {

        //先清除选区
        play.clearAll();

        $(play.boxs).css({

            'width': play.boxsW,

            'height': play.boxsH,

            'top': 0,

            'left': 0

        });

        play.canvasW = play.boxsW;

        play.canvasH = play.boxsH;

        play.copyVtoC();//重新绘制图像，解决暂停时放大、缩小一瞬间卡屏问题

        if (document.exitFullscreen) {

            document.exitFullscreen();

        } else if (document.msExitFullscreen) {

            document.msExitFullscreen();

        } else if (document.mozCancelFullScreen) {

            document.mozCancelFullScreen();

        } else if (document.oRequestFullscreen) {

            document.oCancelFullScreen();

        } else if (document.webkitExitFullscreen) {

            document.webkitExitFullscreen();

        }
        ;

        play.IsFullScreen = false;

        $(play.fullScreen).removeClass('icon-ion-arrow-shrink').attr('class', 'icon-ion-arrow-expand Btn');

        console.log('退出全屏');

    };

    //检测浏览器是否支持全屏,反应貌似比较慢，待测
    play.fullscreenEnabled = function () {

        var doc = document.documentElement;

        return ('requestFullscreen' in doc) || ('webkitRequestFullScreen' in doc) || ('mozRequestFullScreen' in doc && document.mozFullScreenEnabled) || false;

    };

    console.log('是否支持全屏：' + play.fullscreenEnabled());

    //（检测）返回当前全屏显示的DOM元素，如果为空，表示退出全屏
    play.fullscreenElement = function () {

        return document.fullscreenElement || document.webkitCurrentFullScreenElement || document.mozFullScreenElement || null;

    };

    $(document).bind('fullscreenchange mozfullscreenchange webkitfullscreenchange msfullscreenchange', function () {

        if (!play.fullscreenElement()) {

            play.exitFullScreen();

        }
        ;

        console.log('全屏事件监控区~');

    });

    //开启动画
    play.func_frame = function () {
        window.cancelNextRequestAnimationFrame(animate);
        animate = window.requestNextAnimationFrame(function () {
            play.copyVtoC();
            play.func_frame();
        });
    };

    //copy视屏到canvas
    play.copyVtoC = function () {

        play.setCanvasWH();

        var context = play.canvas.getContext("2d");

        var vtype = videoT[videoCount].type;
        context.drawImage(play.media, 0, 0, play.canvasW, play.canvasH);

        var _time = Math.round(play.media.currentTime * 10) / 10;
        if (play.ads) {

            //遍历ads，并展现
            $.each(play.ads, function (key, val) {
                if (_time == val['time']) {

                    // var _icon = '';

                    // switch(val['type']){

                    // 	case 1 : _icon = 'icon-ion-android-globe'; break;//百科

                    // 	case 2 : _icon = 'icon-ion-android-cart'; break;//商品

                    // 	case 3 : _icon = 'icon-ion-android-person'; break;//人物

                    // }
                    var _left = parseFloat(val['leftX']);

                    if (_left > 70) {

                        var style = "padding: 0 30px 0 10px;right: calc(" + _left + "% - 25px);",

                            loca = 'right:' + (100 - _left) + '%';

                    } else {

                        var style = "padding:0 10px 0 30px",

                            loca = 'left:' + _left + '%';

                    }

                    console.log(val['desc'] + ':' + val['img'] + ':' + key);

                    if (val['desc'] == '' && val['img'] == undefined) {
                        // if(val['desc'] == '' && val['img'] == null){
                        //if(val['img'] == null){

                        var docu = "<a style='" + loca + ";" + style /*+ "' href='" + val['url'] */+ "' data-index='" + key + "' data-id='" +val.id+"' class='adsTitle' target='_blank'>" + val['title'] + "</a>";

                    } else {

                        var docu = "<span style='" + loca + ";" + style + "' class='adsTitle' data-index='" + key + "'>" + val['title'] + "</span>";

                    }

                    // var docu = "<span style='"+loca+";"+style+"' class='adsTitle' data-index='"+key+"'>"+val['title']+"</span>";
                    var _div = "<div data-length='" + (val['length'] + val['time']) +  "' class='adshow adshow" + key + "' style='top:" + val['topY'] + ";" + loca + ";'><span class='adsIcon' style='background:url(\"/static/images/signIcon" + val['type'] + ".png\") no-repeat 100% 100% / 100% 100%;'></span>" + docu + "</div>";

                    if ($('.adshow' + key).length < 1&&vtype!="2") {
                        $('#faceBoxs').append(_div);
                        if(vtype=="3"){
                            // play.media.pause();
                            $('.adshow' + key +"> .adsTitle").click();
                        }
                    }
                    ;

                    $('.adshow' + key).fadeIn(1000);
                }
                ;

            });

        }
        ;

        play.expired();

    };

    //设置canvas宽高
    play.setCanvasWH = function () {

        $(play.canvas).attr({'width': play.canvasW, 'height': play.canvasH});

    };

    //格式化时间
    play.formatSeconds = function (value) {

        var h, i, s = parseInt(value);//时:分:秒

        if (s > 60) {

            i = parseInt(s / 60);

            s = parseInt(i % 60);

            if (i > 60) {

                h = parseInt(i / 60);

                i = parseInt(i % 60);

            }
            ;

        }
        ;

        h = !h ? '00' : (h < 10 ? '0' + h : h);

        i = !i ? '00' : (i < 10 ? '0' + i : i);

        s = !s ? '00' : (s < 10 ? '0' + s : s);

        return h + ':' + i + ':' + s;

    };

    play.innerHTML = function () {
        $("#appendStr").remove();
        // var _html = '<canvas id="faceCanvas"></canvas><div id="controlBox"><div id="controlBar"><div id="progBtnBar"><span id="PreLoad"></span><span id="pregTimeBar"></span></div><span id="playBtn" class="icon-ion-ios-play Btn"></span><span id="showTime"><b id="currTime">00:00:00</b> / <b id="totalTime">00:00:00</b></span><img id="faceLogo" class="Btn" src="/static/images/logo.png"></img><span id="FullScreen" class="icon-ion-arrow-expand Btn"></span><div id="volumeBox"><div id="volumeBar"><div id="volumeMask"><span id="volume"><span id="volume2"></span></span></div></div><span id="OpenVolBtn" class="icon-ion-android-volume-up Btn"></span></div></div></div><span id="addBtn"></span><div id="mask"></div><div id="eJectBox"><div class="eJectCloseBox"><span class="eJectClose">关闭</span></div><img class="eJectImg" src="/static/images/bg_img.png" /><div class="eJectRight"><span class="eJectTitle"></span><p class="eJectContent"></p><a href="" class="eJectJump" target="_blank">查看更多</a></div></div><div id="panelBox"><span class="close">关闭</span><span class="existing">素材库</span><span class="handadd">手动添加</span><div id="showBox"></div></div>';
        // var _html = '<div id="controlBox"><div id="controlBar"><div id="progBtnBar"><span id="PreLoad"></span><span id="pregTimeBar"></span></div><span id="playBtn" class="icon-ion-ios-play Btn"></span><span id="showTime"><b id="currTime">00:00:00</b> / <b id="totalTime">00:00:00</b></span><img id="faceLogo" class="Btn" src="/static/images/logo.png"></img><span id="FullScreen" class="icon-ion-arrow-expand Btn"></span><div id="volumeBox"><div id="volumeBar"><div id="volumeMask"><span id="volume"><span id="volume2"></span></span></div></div><span id="OpenVolBtn" class="icon-ion-android-volume-up Btn"></span></div></div></div><span id="addBtn"></span><div id="mask"></div><div id="eJectBox"><div class="eJectCloseBox"><span class="eJectClose">关闭</span></div><img class="eJectImg" src="/static/images/bg_img.png" /><div class="eJectRight"><span class="eJectTitle"></span><p class="eJectContent"></p><a href="" class="eJectJump" target="_blank">查看更多</a></div></div><div id="panelBox"><span class="close">关闭</span><span class="existing">素材库</span><span class="handadd">手动添加</span><div id="showBox"></div></div>';
        var _html = '<div id="appendStr"><div id="controlBox"><div id="controlBar"><div id="progBtnBar"><span id="PreLoad"></span><span id="pregTimeBar"></span></div><span id="playBtn" class="icon-ion-ios-play Btn"></span><span id="showTime"><b id="currTime">00:00:00</b> / <b id="totalTime">00:00:00</b></span><img id="faceLogo" class="Btn" src="/static/images/logo.png"></img><span id="FullScreen" class="icon-ion-arrow-expand Btn"></span><div id="volumeBox"><div id="volumeBar"><div id="volumeMask"><span id="volume"><span id="volume2"></span></span></div></div><span id="OpenVolBtn" class="icon-ion-android-volume-up Btn"></span></div></div></div><span id="addBtn"></span><div id="mask"></div><div id="eJectBox"><div class="eJectCloseBox"><!--<span class="eJectClose">关闭</span>--></div><img class="eJectImg" src="/static/images/bg_img.png" /><div class="eJectRight"><div class="type3"><span class="eJectTitle" style="text-align: center"></span><a class="btn preQues" style="float: left">&lt;</a><a class="btn nextQues" style="float: right">&gt;</a><p class="eJectContent ContentQ"><p class="question"></p><ul><li><a class="btn submitAns" style="display: none;">submit</a><div><input type="text" style="width: 95%" placeholder="input or slide the slider bar" class="answerText"></div><div><span style="color:white" class="rangeText"></span><input type="range" class="rangeQ" min="0" max="10" step="1" value="10"></div></li></ul></p><a href="" class="eJectJump" target="_blank">查看更多</a></div> <div class="typecommon"><span class="eJectTitle"></span><p class="eJectContent Content"></p><a href="" class="eJectJump" target="_blank">查看更多</a></div></div> <div id="panelBox"><span class="close">关闭</span></div></div>';
        $('#faceBoxs').append(_html);

    };

    window.addEventListener("load", play.init);
    return {videoCount: videoCount};
}();

$(function () {
    // $("#mask").fadeIn(200);
    $(".rightConfirm").on("click",function () {
        $(".rights").slideUp(200);
    });
    $("#faceMedia").attr({"src": videoT[0].path});

    $('input[type="range"]').rangeslider({

        // Deactivate the feature detection
        polyfill: false,

        // Callback function
        onSlide: function (position, value) {
            console.log('onSlide');
            console.log('position: ' + position, 'value: ' + value);
        },

        // Callback function
        onSlideEnd: function (position, value) {
            console.log('onSlideEnd');
            console.log('position: ' + position, 'value: ' + value);
            var id = videoT[plugin.videoCount].id;
            $.post('/sign/' + id + '/score', {score: value}, function (data) {
            }, "json");
        }
    });

    var vtype = videoT[plugin.videoCount].type;
    if (vtype == "2") {
        $('#rate-bar').css("display", "block")
    }

});

