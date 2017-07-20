var checkedObj = (function () {
    var submitList = [];
    var index = 0;
    // console.log(window.checkedStatus);
    // var status = window.checkedStatus.toLowerCase() == "false" ? false : true;//标识所处阶段，false表示处于查阅阶段，true表示正常状态
    var status = window.checkedStatus == "false" ? false : true;//标识所处阶段，false表示处于查阅阶段，true表示正常状态
    return {
        add: function (path) {
            //增加数据，并返回当前数列长度
            if (!path) return submitList.length;
            if (submitList.indexOf(path) == -1) {
                submitList.push(path);
                status = true;
                index = submitList.length - 1;
            } else {
                status = false;
            }
            return submitList.length;
        },
        getCurIdx: function () {
            return index + 1;
        },
        getLength: function () {
            return submitList.length;
        },
        getPrev: function () {
            if (index < 0 || index >= submitList.length) return -1;
            if (index == 0) return -2;
            --index;
            status = false;
            return submitList[index];
        },
        getNext: function () {
            if (index < 0 || index >= submitList.length) return -1;
            if (index == submitList.length - 1) return -2;
            ++index;
            status = false;
            return submitList[index];
        },
        getStatus: function () {
            return status;
        },
        setStatus: function (flag) {
            status = flag;
        },
        initAllData: function (list) {
            if (list.length <= 0) return;
            submitList = list.slice(0);
            index = 0;
            status = false;
            return submitList[0];
        },

    }
})();

var manageStorage = (function () {
    var Email = $("#namePart span").text();
    var status = Email == "" ? false : true;
    return {
        isEmpty: function () {
            if (!status) return true;
            var data = localStorage[Email + "_todo"];
            if (data == undefined || data == "" || data.split('_').length == 0) return true;
            else return false;
        },
        get: function () {
            //获取第一张图片并删除该条记录
            if (this.isEmpty()) {
                return;
            }
            var data = localStorage[Email + "_todo"].split('_');
            var tmpMessage = data.splice(0, 1)[0].split(',');
            localStorage[Email + "_todo"] = data;
            return tmpMessage;
        },
        set: function (data) {
            //获取localStorage信息中第一个相片
            localStorage[Email + "_todo"] = data;
        }

    }
})()
var imageRatio;// 显示尺寸 / 原始尺寸

$(function () {
    function setPageData(data) {
        try{
            //先删除前一张图片的数据
            $(".delete").click();
            $("input[name=scene]:checkbox").each(function () {
                $(this).attr("checked", false);
            })
            //图片加载
            var image = $("#image")[0];
            image.src = data.photoPath;

            if (data.IsChecked) {
                $("#checkStatus").addClass('checked');
                $("#checkStatus").removeClass('unchecked');
            }
            else {
                $("#checkStatus").addClass('unchecked');
                $("#checkStatus").removeClass('checked');
            }
            if (markedData.photoPath == "/static/res/finished.jpg") {
                return;
            }
            //页面加载完成时显示标记情况
            $("input[name=language][value=" + data.Language.replace(" ", '') + "]").attr("checked", true); //设置语言
            $("input[name=quality][value=" + data.Quality.replace(" ", '') + "]").attr("checked", true) //设置质量

            //设置场景
            var scene = data.Scene.replace(" ", '').slice(-4);
            for (var i = 0; i < 4; ++i) {
                if (scene[i] == '0') continue;
                var tmpstr;
                switch (i) {
                    case 1: tmpstr = "0100"; break;
                    case 2: tmpstr = "0010"; break;
                    case 3: tmpstr = "0001"; break;
                    default: tmpstr = "1000"; break;
                }
                $("input[name=scene][value=" + tmpstr + "]").attr("checked", true) //设置质量
            }
        } catch (err)
        {
            document.cookie = "storeFlag=0";
        }

    }
    //页面加载初始化
    setPageData(markedData);

    function getInitParam(message, textValue) {
        //message为坐标转换后的数组
        var x1 = message[0];
        var y1 = message[1];
        var x2 = message[2];
        var y2 = message[3];
        var x3 = message[4];
        var y3 = message[5];
        var x4 = message[6];
        var y4 = message[7];
        return {
            element: '#RectContainer',
            width: parseInt(Math.sqrt((x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1))),
            height: parseInt(Math.sqrt((x4 - x1) * (x4 - x1) + (y4 - y1) * (y4 - y1))),
            location: {
                left: parseInt(x1),
                top: parseInt(y1)
            },
            scale: 1.0,
            angle: (Math.atan((y2 - y1) / (x2 - x1)) / Math.PI * 180).toFixed(2) + "deg",
            textMessage: textValue
        }
    }


    var checkValid = function () {
        var result = [];
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
            result.push(parseInt(x / imageRatio));
            result.push(parseInt(y / imageRatio));
        }

        return result;
    }

    var clearRectData = function () {
        var del = $(".delete");
        del.click();
        $("input[name='scene']").removeAttr("checked");
        $("input[name='quality']").removeAttr("checked");
        $("input[name='language']").removeAttr("checked");
    }
    var con = document.getElementById('RectContainer');

    /*绑定鼠标事件*/
    lib.bindevent(con, '#record');

    $("#image").on('load', function () {

        var parentBound = this.offsetParent.getBoundingClientRect();
        var rectBound = this.getBoundingClientRect();
        var left = rectBound.left - parentBound.left;
        var top = rectBound.top - parentBound.top;
        var imgW = this.width;
        var imgNaturalW = this.naturalWidth;
        imageRatio = imgW / imgNaturalW; //显示尺寸/原始尺寸
        con.setAttribute('style', "width:" + rectBound.width + "px;height:" + rectBound.height + "px;position: absolute;left:" + left + "px;top:" + top + "px;");
        if (this.src.indexOf("finished.jpg") >= 0) return;
        var pointArray = markedData.Message.split(';');
        var len = pointArray.length;
        for (var i = 0; i < len; ++i) {
            var coor = pointArray[i].split(',');
            var tmpcoor = [];
            for (var j = 0; j < 8; ++j) {
                tmpcoor.push(parseInt(coor[j]) * imageRatio);
            }
            var initParam = getInitParam(tmpcoor, coor[8]);
            var rectmove = new lib.rectmove(initParam);
            rectmove.init();
        }

    })
    /*提交按钮*/
    $("#confirm").on('click', function () {
        if ($("#image").attr("src").indexOf("finished.jpg") >= 0) return;
        var result = checkValid()
        if (!result) {
            return;
        } else {
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

            $.post('/setCheckMessage/', {
                Message: coorData,
                PhotoPath: $("#image").attr("src").split("/").reverse()[0],
                Language: $("input[name='language']:checked").val(),
                Scene: sceneData,
                Quality: $("input[name='quality']:checked").val(),
            }, function (data) {
                var status = parseInt(data.status);
                if (status >= 0) {
                    //添加检查数据成功
                    checkedObj.add($("#image").attr("src"));
                    //更新检查情况
                    $("#checkedCount").text(data.checkedNum);
                    $("#toCheckedCount").text(data.toCheckedNum);
                    //判断该相片是否是第一次被检查,flag为true则是第一次检查，否则为再次检查
                    var flag = $("#checkStatus")[0].classList.contains("unchecked");
                    checkedObj.setStatus(flag);
                    if (!checkedObj.getStatus()) {
                        //当如果是在查阅已检查的相片阶段
                        $("#getNext").click();
                    } else {
                        //当处于添加新检查数据的情况
                        //检查localStorage中是否有待检查的照片

                        //对storage进行操作
                        var tmpdata = localStorage.getItem($("#namePart span").text() + "_todo");
                        var todoList = tmpdata.split('_');

                        if (tmpdata == undefined || tmpdata == "" || todoList.length == 0) {
                            //storage中存储的数据为空，向服务器获取更新数据

                            $.post('/getTodoList/', {}, function (newData) {
                                var st = newData.status;
                                if (st == "0") {
                                    tmpdata = newData.message;
                                    todoList = tmpdata.split('_');
                                    var tmpMessage = todoList.splice(0, 1)[0].split(',');
                                    if (todoList.length == 0) {
                                        document.cookie = "storeFlag=0";
                                    }
                                    localStorage.setItem($("#namePart span").text() + "_todo", todoList.join(';'));

                                    markedData.Quality = tmpMessage[1];
                                    markedData.Language = tmpMessage[2];
                                    markedData.Scene = tmpMessage[3];
                                    markedData.Message = tmpMessage[4];
                                    markedData.IsChecked = false;
                                    markedData.photoPath = tmpMessage[0];
                                    setPageData(markedData);
                                } else {
                                    document.cookie = "storeFlag=0";
                                    if (st == "-1") {
                                        alert("请先登录！");
                                        location.href = "/login";
                                    } else if (st == "-2") {
                                        alert("您已检查完所有已标记相片,可点击”查看已检查图片“按钮查阅您已检查相片！");
                                        $("#image").attr("src", "/static/res/finished.jpg");
                                        $(".delete").click();
                                    } else {
                                        location.href = "/Error?s=" + data.status;
                                    }
                                }
                            })
                        }
                        else {
                            var tmpMessage = todoList.splice(0, 1)[0].split(',');
                            if (todoList.length == 0) {
                                document.cookie = "storeFlag=0";
                            }
                            localStorage.setItem($("#namePart span").text() + "_todo", todoList.join('_'));
                            markedData.Quality = tmpMessage[1];
                            markedData.Language = tmpMessage[2];
                            markedData.Scene = tmpMessage[3];
                            markedData.Message = tmpMessage.slice(4).join(',');
                            markedData.IsChecked = false;
                            markedData.photoPath = tmpMessage[0];
                            setPageData(markedData);
                        }
                    }
                }
                else {
                    //添加数据失败
                    document.cookie = "storeFlag=0";
                    location.href = "/Error?s=" + data.status;
                }
            })
        }
    })

    //查看上一张
    $("#getPrev").on('click', function () {
        var path = checkedObj.getPrev();
        if (path == -1) return;
        if (path == -2) {
            alert("没有更多了!");
            return;
        }
        $.post("/getCheckedDetail/", { photoPath: path.split('/').reverse()[0] }, function (data) {
            if (data.status != 0) return;
            markedData = {
                Message: data.Message,
                photoPath: data.PhotoPath,
                Language: data.Language,
                Scene: data.Scene,
                Quality: data.Quality,
                IsChecked: true
            };
            setPageData(markedData);
            $("#curIdx").text(checkedObj.getCurIdx());

        })
    })

    //查看下一张
    $("#getNext").on('click', function () {
        var path = checkedObj.getNext();
        if (path == -1) return;
        if (path == -2) {
            alert("已是最后一张，点击“继续检查”按钮可以继续开始检查工作！");
            return;
        }
        $.post("/getCheckedDetail/", { photoPath: path.split("/").reverse()[0] }, function (data) {
            if (data.status != 0) return;
            markedData = {
                Message: data.Message,
                photoPath: data.PhotoPath,
                Language: data.Language,
                Scene: data.Scene,
                Quality: data.Quality,
                IsChecked: true
            };
            setPageData(markedData);
            $("#curIdx").text(checkedObj.getCurIdx());
        })
    })

    //查看所有已检查的照片
    $("#getChecked").on('click', function () {
        $("#getUnChecked").removeClass('btnhid');
        $("#chengeIdx").removeClass('btnhid');
        $("#getUnChecked").addClass('btnshow');
        $("#chengeIdx").addClass('btnshow');
        $("#indexStatus").addClass("show");

        //保存当前的数据信息

        $.post("/getAllChecked/", {}, function (data) {
            if (data.status == -1) {
                alert("请先登录");
                return;
            }
            if (data.status == -2) {
                alert("该帐号并未开始检查工作！");
                $("#getUnChecked").addClass('btnhid');
                $("#chengeIdx").addClass('btnhid');
                $("#getUnChecked").removeClass('btnshow');
                $("#chengeIdx").removeClass('btnshow');
                return;
            }
            var list = data.path.split(',');
            var tmppath = checkedObj.initAllData(list);
            $.post("/getCheckedDetail/", { photoPath: tmppath.split('/').reverse()[0] }, function (data) {
                if (data.status != 0) return;
                markedData = {
                    Message: data.Message,
                    photoPath: data.PhotoPath,
                    Language: data.Language,
                    Scene: data.Scene,
                    Quality: data.Quality,
                    IsChecked: true
                };
                setPageData(markedData);
                $("#curIdx").text("1");
                $("#totalIdx").text(checkedObj.getLength());
            })
        });
    })

    //继续检查图片
    $("#getUnChecked").on('click', function () {
        $("#getUnChecked").addClass('btnhid');
        $("#chengeIdx").addClass('btnhid');
        $("#getUnChecked").removeClass('btnshow');
        $("#chengeIdx").removeClass('btnshow');
        if ($("#toCheckedCount").text() == 0) {
            alert("您已检查完所有已标定图片！");
            return;
        }
        else {
            document.cookie = "storeFlag=0";
            location.reload();
        }
    })

    $(document).keydown(function (e) {
        var keyCode = e.keyCode;
        if (keyCode == 13) {
            //数据提交操作
            $("#confirm").click();
        }
    })
})
