var resizeRect = {
    left: 0,
    top: 0,
    w: 0,
    h: 0,
    locx: 0,
    locy: 0,
    ratio: 1
};

// modeFlag: 0 for rectangle, 1 for irregular quadrilateral
var modeFlag = 0;

$(function () {

    var lastSubmitMessage = {
        photoPath: "",
        initParam: [],
        quality: true,
        language: "",
        scene: [],
        nextPhoto: ""
    };

    var reSubmitFlag = false;

    var saveLastMessage = function () {
        reSubmitFlag = false;
        lastSubmitMessage.quality = $("input[name='quality']:checked").val();
        lastSubmitMessage.language = $("input[name='language']:checked").val();
        lastSubmitMessage.scene.length = 0;
        lastSubmitMessage.initParam.length = 0;
        var sceneSel = $("input[name='scene']:checked");
        var len = sceneSel.length;
        for (var i = 0; i < len; ++i)
        {
            lastSubmitMessage.scene.push($("input[name='scene']:checked")[i].value);
        }
        lastSubmitMessage.photoPath = $("#image").attr("src");
        //获取坐标位置记录
        var pointArr = $(".coorPoint");
        var textIpt = $(".textInput");
        var coorMes = [];
        len = textIpt.length;
        for (var i = 0; i < len; i++) {
            var obj = {};
            coorMes.length = 0;
            obj.element = '#RectContainer';
            //计算第i个矩形的点的坐标
            for (var j = 0; j < 4; ++j) {
                var text = pointArr[4 * i + j].innerHTML;
                var index = text.indexOf(',');
                var x = parseFloat(text.slice(1, index - 1));
                var y = parseFloat(text.slice(index + 1, -2));
                coorMes.push(x);
                coorMes.push(y);
            }
            var x1 = coorMes[0];
            var y1 = coorMes[1];
            var x2 = coorMes[2];
            var y2 = coorMes[3];
            var x3 = coorMes[4];
            var y3 = coorMes[5];
            var x4 = coorMes[6];
            var y4 = coorMes[7];
            obj.location = {
                left: parseInt(x1),
                top : parseInt(y1)
            };
            obj.width = parseInt(Math.sqrt((x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1)));
            obj.height = parseInt(Math.sqrt((x4 - x1) * (x4 - x1) + (y4 - y1) * (y4 - y1)));
            obj.angle = (Math.atan((y2 - y1) / (x2 - x1)) / Math.PI * 180).toFixed(2) + "deg";
            obj.textMessage = textIpt[i].value;
            lastSubmitMessage.initParam.push(obj);
        }
    }

    var showLastMessage = function () {
        reSubmitFlag = true;
        //先删除前一张图片的数据
        $(".delete").click();
        $("input[name=scene]:checkbox").each(function () {
            $(this).attr("checked", false);
        });

        $("#image").attr("src", lastSubmitMessage.photoPath);
        $("input[name=language][value=" + lastSubmitMessage.language.replace(" ", '') + "]").attr("checked", true); //设置语言
        $("input[name=quality][value=" + lastSubmitMessage.quality.replace(" ", '') + "]").attr("checked", true) //设置质量
        lastSubmitMessage.scene.forEach(function (v, i, a) {
            $("input[name=scene][value=" + v + "]").attr("checked", true) //设置质量

        })
    }
    var checkValid = function () {
        var result = [];
        var image = document.getElementById("image");
        var naturalW = image.naturalWidth;
        var w = image.width;
        var ratio = naturalW / w;
        var w = $("#RectContainer").width();
        var h = $("#RectContainer").height()
        /*检查表单信息完整与否*/
        if (!$("input[name='quality']").is(":checked")) {
            alert("请选择『图片质量』选项");
            return false;
        }
        if (!$("input[name='language']").is(":checked")) {
            alert("请选择『语言』选项");
            return false;
        }
        if (!$("input[name='scene']").is(":checked")) {
            alert("请选择『场景』选项");
            return false;
        }
        /*检查矩形框文本信息*/
        var textIpt = $(".textInput");
        var len = textIpt.length;
        for (var i = 0; i < len; i++) {
            if (textIpt[i].value != '') continue;
            alert("请补全文字标注信息");
            $(textIpt[i]).focus();
            return false;
        }

        /*检查坐标是否越界*/
        var pointArr = $(".coorPoint");
        len = pointArr.length;
        for (var i = 0; i < len; i++) {
            var text = pointArr[i].innerHTML;
            var index = text.indexOf(',');
            var x = parseFloat(text.slice(1, index - 1));
            var y = parseFloat(text.slice(index + 1, -2));
            if (x > w || x < 0 || y < 0 || y > h) {
                var order = Math.floor(i / 4);
                $(textIpt[order]).focus();
                alert("第" + parseInt(order + 1) + "个矩形位置越界，请调整");
                return false;
            }
            result.push(parseInt(x * ratio));
            result.push(parseInt(y * ratio));
        }

        return result;
    }

    var checkResizeData = function () {
        var result = [];
        /*先检查文本信息是否完整*/
        var textIpt = $("#resizeRecord").find("input");
        var len = textIpt.length;
        for (var i = 0; i < len; i++) {
            if (textIpt[i].value != '') continue;
            alert("请补全文字标注信息");
            $(textIpt[i]).focus();
            return false;
        }

        var w = $("#resizeRectContainer").width();
        var h = $("#resizeRectContainer").height();

        /*检查坐标是否越界*/
        var pointArr = $("#resizeRecord").find(".coorPoint");
        len = pointArr.length;
        for (var i = 0; i < len; i++) {
            var text = pointArr[i].innerHTML;
            var index = text.indexOf(',');
            var x = parseFloat(text.slice(1, index - 1));
            var y = parseFloat(text.slice(index + 1, -2));
            if (x > w || x < 0 || y < 0 || y > h) {
                var order = Math.floor(i / 4);
                $(textIpt[order]).focus();
                alert("第" + parseInt(order + 1) + "个矩形位置越界，请调整");
                return false;
            }
            result.push(parseFloat((x / resizeRect.ratio + resizeRect.left).toFixed(1)));
            result.push(parseFloat((y / resizeRect.ratio + resizeRect.top).toFixed(1)));
        }

        return result;
    }

    var clearRectData = function ()
    {
        var del = $(".delete");
        del.click();
        $("input[name='scene']").removeAttr("checked");
        $("input[name='quality']").removeAttr("checked");
        $("input[name='language']").removeAttr("checked");
    }

    $("#image").attr("src", window.initPath);

    function selectRectEvent(elem) {
        var selectRect = document.createElement('div');
        selectRect.setAttribute('class', 'selRect');
        $(elem).mousedown(function (event) {
            event.stopPropagation();
            if (!rsFlag) return;
            if (rsCnt != 0) return;
            rsStart = true;
            var oriLoc = elem.getBoundingClientRect();
            resizeRect.locx = event.clientX;
            resizeRect.locy = event.clientY;
            resizeRect.left = resizeRect.locx - oriLoc.left;
            resizeRect.top = resizeRect.locy - oriLoc.top;
            $(selectRect).css("left", resizeRect.left + "px");
            $(selectRect).css("top", resizeRect.top + "px");
            elem.appendChild(selectRect);
        }).mousemove(function (event) {
            event.stopPropagation();
            if (!rsStart) return;
            resizeRect.w = event.clientX - resizeRect.locx;
            resizeRect.h = event.clientY - resizeRect.locy;
            $(selectRect).css("width", resizeRect.w + "px");
            $(selectRect).css("height", resizeRect.h + "px");
        }).mouseup(function (event) {
            if (!rsStart) return;
            resizeRect.w = event.clientX - resizeRect.locx;
            resizeRect.h = event.clientY - resizeRect.locy;
            rsCnt = 1;
            rsStart = false;
            $("#clear").addClass("show");
            $("#btnExport").addClass("show");

        })
    }

    var rsFlag = false;
    var rsCnt = 0;
    var rsStart = false;

    var con = document.getElementById('RectContainer');
    var resizeCon = document.getElementById('resizeContainer');
    var resizeRectCon = document.getElementById('resizeRectContainer');

    /*绑定鼠标事件*/
    selectRectEvent(resizeCon);
    lib.bindevent(con, '#record');
    lib.bindevent(resizeRectCon, '#resizeRecord');

    $("#image").on('load', function () {
        var parentBound = this.offsetParent.getBoundingClientRect();
        var rectBound = this.getBoundingClientRect();
        var left = rectBound.left - parentBound.left;
        var top = rectBound.top - parentBound.top;
        con.setAttribute('style', "width:" + rectBound.width + "px;height:" + rectBound.height + "px;position: absolute;left:" + left + "px;top:" + top + "px;");
        resizeCon.setAttribute('style', "width:" + rectBound.width + "px;height:" + rectBound.height + "px;position: absolute;left:" + left + "px;top:" + top + "px;z-index:10;");
        if (reSubmitFlag)
        {
            //初始化上一张相片的矩形框
            lastSubmitMessage.initParam.forEach(function (v, i, a) {
                var rectmove = new lib.rectmove(v);
                rectmove.init();
            })
        }
    })

    $("#largeImage").on('load', function () {
        var parentBound = this.offsetParent.getBoundingClientRect();
        var rectBound = this.getBoundingClientRect();
        var left = rectBound.left - parentBound.left;
        var top = rectBound.top - parentBound.top;
        resizeRectCon.setAttribute('style', "width:" + rectBound.width + "px;height:" + rectBound.height + "px;position: absolute;left:" + left + "px;top:" + top + "px;");
    })

    /*提交按钮*/
    $("#submit").on('click', function () {
        var result = checkValid()
        if (!result) {
            return;
        } else {
            //判断是否是已提交图片
            var isResubmit = reSubmitFlag ? "true" : "false";
            saveLastMessage();
            var coorArr = [];
            var len = result.length / 8;
            for (var i = 0; i < len; ++i) {
                var tval = $(".textInput")[i].value;
                coorArr.push(result.slice(8 * i, 8 * i + 8).join(',') + "," + tval);
            }
            var coorData = coorArr.join(';');
            
            var sceneSel = $("input[name='scene']:checked");
            var len = sceneSel.length;
            var sceneData = 0;
            for (var i = 0; i < len; ++i) {
                sceneData += parseInt(sceneSel[i].value);
            }
            sceneData = ("0000000000" + sceneData.toString()).slice(-10);
            $.post('/setMessage/', {
                Message: coorData,
                PhotoPath: $("#image").attr("src").split("/").reverse()[0],
                Language: $("input[name='language']:checked").val(),
                Scene: sceneData,
                Quality: $("input[name='quality']:checked").val(),
                isResubmit: isResubmit
            }, function (data) {
                var status = parseInt(data.status);
                if (status == -5) {
                    //显示刚才未完成的相片
                    $("#image").attr("src", lastSubmitMessage.nextPhoto);
                    clearRectData();
                }
                else if (status >= 0)
                {
                    lastSubmitMessage.nextPhoto = data.nextImage;
                    $("#image").attr("src", data.nextImage);
                    clearRectData();
                    $("#imageCount").text(data.completeCount);
                    $("#rectCount").text(data.rectTotalRect);
                }
                else {
                    location.href = "/Error?s=" + data.status;
                }
                
            })
        }
    })

    /*开启或退出缩放按钮*/
    $("#btnResize").on('click', function () {
        $(".rectUnit").toggleClass("hidden");
        $("#resizeContainer").toggleClass("show");
        $("#btnResize").toggleClass('out');
        rsFlag = !rsFlag;
        if (!rsFlag) {
            $("#clear").click();
        }
    })

    /*清除按钮*/
    $("#clear").on('click', function () {
        rsCnt = 0;
        $("#clear").removeClass("show");
        $("#btnExport").removeClass("show");
        $(".selRect").remove();
    })

    /*导出截取base64图*/
    $("#btnExport").on('click', function () {
        var canvas = $("#canvas")[0];
        var image = document.getElementById("image");
        var ctx = canvas.getContext('2d');
        var naturalW = image.naturalWidth;
        var naturalH = image.naturalHeight;
        var W = image.width;
        var H = image.height;
        var ratio = naturalW / W;
        var cvsW, cvsH;

        if (resizeRect.w > resizeRect.h) {
            cvsW = 500;
            cvsH = 500 * resizeRect.h / resizeRect.w;
        } else {
            cvsW = 500 * resizeRect.w / resizeRect.h
            cvsH = 500;
        }

        /*等比例画图*/
        var sx = parseInt(resizeRect.left * ratio);
        var sy = parseInt(resizeRect.top * ratio);
        var sW = parseInt(resizeRect.w * ratio);
        var sH = parseInt(resizeRect.h * ratio);
        var width = parseInt(cvsW);
        var height = parseInt(cvsH);
        canvas.setAttribute('height', height);
        canvas.setAttribute('width', width);
        ctx.drawImage(image, sx, sy, sW, sH, 0, 0, width, height);
        var str = canvas.toDataURL("image/png");
        resizeRect.ratio = width / resizeRect.w;
        /*弹出mask层，并显示截取图片*/
        $("#mask").removeClass('hidden');
        $("#largeImage").attr("src", str);
    })

    /*保存并转换数据*/
    $("#saveRsRecord").on("click", function () {
        if ($("#resizeRecord .rectItem").length == 0) {
            $("#mask").addClass('hidden');
            $(".rectUnit").removeClass("hidden");
            $("#resizeContainer").removeClass('show');
            $("#btnResize").removeClass('out');
            rsFlag = false;
            $("#clear").click();
            return;
        }
        var result = checkResizeData();
        if (result == false) return;
        if (result.length % 8 != 0) return;

        var num = result.length / 8;
        var obj = {};
        for (var i = 0; i < num; i++) {
            var textValue = document.getElementById("resizeRecord").querySelectorAll("input")[i].value;
            var x1 = result[i * 8 + 0];
            var y1 = result[i * 8 + 1];
            var x2 = result[i * 8 + 2];
            var y2 = result[i * 8 + 3];
            var x3 = result[i * 8 + 4];
            var y3 = result[i * 8 + 5];
            var x4 = result[i * 8 + 6];
            var y4 = result[i * 8 + 7];
            var rectmove = new lib.rectmove({
                element: con,
                width: parseInt(Math.sqrt((x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1))),
                height: parseInt(Math.sqrt((x4 - x1) * (x4 - x1) + (y4 - y1) * (y4 - y1))),
                location: {
                    left: parseInt(x1),
                    top: parseInt(y1)
                },
                scale: 1.0,
                angle: (Math.atan((y2 - y1) / (x2 - x1)) / Math.PI * 180).toFixed(2) + "deg",
                textMessage: textValue
            });
            rectmove.init();
        }
        $("#mask").addClass('hidden');
        $(".rectUnit").removeClass("hidden");
        $("#resizeContainer").removeClass('show');
        $("#btnResize").removeClass('out');
        rsFlag = false;
        //删除在缩放模块的记录
        $("#resizeRecord .delete").click();


        $("#clear").click();
    })

    //相关快捷键操作
    $(document).keydown(function (e) {
        //keyCode:左方向键37,右方向键39，,tab键9， 回车键13
        var keyCode = e.keyCode;
        if (keyCode == 9) {
            //tab操作，自动聚焦到下一个矩形
            if (document.activeElement.type == "text") {
                //当前聚焦在输入框
                e.preventDefault();
                $(document.activeElement).parent().next().find("input").focus();
            } 
        }
    })

    //查看上一张
    $("#goBack").on('click', function () {
        if (lastSubmitMessage.photoPath == "")
        {
            alert("您未提交记录！");
            return;
        }
        showLastMessage();
    })
})