var resizeRect = {
    left: 0,
    // top: 0,
    // w: 0,
    // h: 0,
    // locx: 0,
    // locy: 0,
    ratio: 1 //the ratio of image resize size over image visible size
};

// var resizeRatio; //the ratio of image resize size over image visible size

var imageRatio; //the ratio of image visible size over image natural size

// modeFlag: 0 for rectangle, 1 for irregular quadrilateral
// var modeFlag = 0;

$(function(){
	function getInitParam(message, textValue){
		var x = message[0];
		var y = message[1];
		var w = message[2];
		var h = message[3];
		return {
			element: "#RectContainer",
			width: parseInt(w),
			height: parseInt(h),
			location: {
				left: parseInt(x),
				top: parseInt(y)
			},
			scale: 1.0,
			textMessage: textValue
		}
	}

	function initRectsFromMessage(ele, message){
        var imgW = ele.width;
        var imgNaturalW = ele.naturalWidth;
        imageRatio = imgW / imgNaturalW;
        // console.log(ele.width/ele.naturalWidth, ele.height/ele.naturalHeight);
        var pointAry = message.split("!")[0].split(';');
	    var cols = pointAry.length;
	    // var rectOrder = 0;
	    for(var col=0;col<cols;col++){
		    // var rectColAry = [];

		    //update workingCol
		    workingCol = col;

	    	var pointStr = pointAry[col];
	    	var coor = pointStr.split(",");
	    	for(var i=0;i<coor.length/4;i++){
                // workingIdx = i; //updated at event newRectinit
                var tmpcoor = [];
                for(var j=0;j<4;j++){
                    tmpcoor.push(parseInt(coor[j+i*4]) * imageRatio);
                } 
                var initParam = getInitParam(tmpcoor, ' ');
                var rectmove = new lib.rectmove(initParam);
                rectmove.init();
	   			// rectColAry.push(rectmove);
	   			// rectColAry.push(rectOrder);
	   			// debugger;
	    	}
	    	// rectColsManager.push(rectColAry);
	   		// debugger;
		}
	}

    //add label to label container and resize label container
	function initLabelFromMessage(message){
		var labelCon = document.getElementById('labelContainer');
        var rsLabelCon = $("#resizeLabelContainer");
		var labelAry = message.split('!')[1].split(';');
		for(var col=0;col<labelAry.length;col++){
			var labelP = document.createElement('p');
			labelP.innerHTML = (col+1) + "." + labelAry[col];
			labelP.setAttribute('style', 'cursor:pointer');
			labelP.setAttribute('onmouseenter', 'this.style.backgroundColor="gray"');
			labelP.setAttribute('onmouseleave', 'this.style.backgroundColor=""');
			$(labelP).data('pIdx', col);
			labelCon.appendChild(labelP);
            rsLabelCon.append($(labelP).clone(true));
   			// debugger;
		}
		// debugger;
		// rectColsManager["0"]["0"].recordUnit.children[1].click();
		$("#labelContainer>p").on("click", function(){
    		updateInputFromLabel($(this).data().pIdx);
    	});
        $("#resizeLabelContainer>p").on("click", function(){
            updateInputFromLabel($(this).data().pIdx);
        });
	}

    //focus on the first rect
    function focusOnFirstRect() {
        //select the first input and update lastRectOrder
        if(lastRectOrder!=-1){
            //not empty
            $(".rectItem>input:first").focus();
            lastRectOrder = 0;
            workingCol = 0;
            workingIdx = 0;
        }
    }

    //update inputs from Label Click
	function updateInputFromLabel(pIdx) {
		// debugger;
        //from working column info update input
        if(!(workingCol in rectColsManager)){
            //clicked on container or just new a list, alert and return;
            alert("请选择标签输入的列.");
            return;
        }else{
            //update the input from the working column
            updateOneColOfInput(pIdx, workingCol);
            $("#labelContainer>p:gt("+pIdx+")").each(function (idx) {
                //update next cols with label
                //check if the last col
                if((workingCol+idx)==rectColsManager.length-1){
                    //the last col
                    return false;
                }else{
                    //update next col
                    updateOneColOfInput($(this).data().pIdx, workingCol+1+idx);
                    // debugger;
                }
            });
        }
	}

    //update one column of input
    function updateOneColOfInput(pIdx, col) {
        //update input of col with content in pIdx
        var labelStr = $("#labelContainer>p").eq(pIdx).text().split(".", 2)[1];
        for (var i = 0; i < labelStr.length; i++) {
            // console.log(labelStr[i]);
            if(i==rectColsManager[col].length){
                //inputs are less than label or no input in this column
                return;
            }else{
                //update input with single word
                $(".rectItem[data-order="+rectColsManager[col][i]+"] > input").val(labelStr[i]);
                // $(".rectItem[data-order="+rectColsManager[workingCol][i]+"] > input").focus();
                // debugger;
            }
        }
    }

 	//return the column information from the rect order
    function getColInfoFromOrder(rectOrder) {
    	// var colNum = 0;
    	for (var i = rectColsManager.length - 1; i >= 0; i--) {
    		var idx = rectColsManager[i].indexOf(rectOrder);
    		if(idx!=-1){
    			return [i,idx];
    		}
    	}
    	return [-1, -1];
    }

    //move rects to element container, records to recordelem
    //flag: 0 for moving to resizecontainer, 1 for moving to rectcontainer
    function moveRectsToContainer(col, element, recordelem, flag) {
    	if(element.nodeType != document.ELEMENT_NODE && typeof element == 'string'){
    		// debugger;
 			element = document.querySelector(element);
 		}
 		if(recordelem.nodeType != document.ELEMENT_NODE && typeof recordelem == 'string'){
 			recordelem = document.querySelector(recordelem);
 		}
 		// debugger;
    	//move the working column of rects to resize container
    	if(col == -1){
    		//choose no column, update workingCol and return
            //only happens when showing resize layer from clicking of resize button
            workingCol = rectColsManager.length;
            workingIdx = -1;
    		return;
    	}else{
    		//move the rects in column
    		for(var i=0;i<rectColsManager[col].length;i++){
    			// debugger;
                var order = rectColsManager[col][i];
    			var selectedRect = $(".rectUnit[data-order=" + order + "]");
    			var oriWidth = $(selectedRect).width();
    			var oriHeight = $(selectedRect).height();
    			var oriLoc = $(selectedRect).position();
    			$(selectedRect).appendTo(element);
    			$(".rectItem[data-order=" + order + "]").appendTo(recordelem);
                if (!flag) {
                    var newWidth = oriWidth * resizeRect.ratio;
                    var newHeight = oriHeight * resizeRect.ratio;
                    var newTop = oriLoc.top * resizeRect.ratio;
                    var newLeft = (oriLoc.left  - resizeRect.left) * resizeRect.ratio;
                }else{
                    var newWidth = oriWidth / resizeRect.ratio;
                    var newHeight = oriHeight / resizeRect.ratio;
                    var newTop = oriLoc.top / resizeRect.ratio;
                    var newLeft = oriLoc.left / resizeRect.ratio + resizeRect.left;
                }
                $(selectedRect).css({
    				width: newWidth,
    				height: newHeight,
    				top: newTop,
    				left: newLeft,
    			});
                lib.updateRectParam(order, newWidth, newHeight, 1, {top:newTop, left:newLeft});
    		}
    	}
    }

    //show the image on resize layer
    function showImageOnResizeLayer() {
        var canvas = $('#canvas')[0];
        var image = document.getElementById("image");
        var ctx = canvas.getContext('2d');
        var aWidth = $(window).width();
        var aHeight = $(window).height();
        var cvsW, cvsH;

        //draw on canvas
        var startx = parseInt(0); //start location on initial image
        var starty = parseInt(0);
        var endx = parseInt(0);
        var sW = parseInt(200); //the size on initial image
        var sH = parseInt(image.naturalHeight);

        //get the position need to crop
        if(lastRectOrder!=-1){
            //clicked on rect
            var selectedRect = $(".rectUnit[data-order="+lastRectOrder+"]");
            startx  = ($(selectedRect).position().left/imageRatio-100>0)?($(selectedRect).position().left/imageRatio-100):0;
            endx = (($(selectedRect).position().left+$(selectedRect).width())/imageRatio+100<image.naturalWidth)?(($(selectedRect).position().left+$(selectedRect).width())/imageRatio+100):image.naturalWidth;
            sW = endx - startx;
            // debugger;
        }else if(lastClientX!=-1){
            //clicked on container
            startx  = (lastClientX/imageRatio-100>0)?(lastClientX/imageRatio-100):0;
            endx = (lastClientX/imageRatio+100<image.naturalWidth)?(lastClientX/imageRatio+100):image.naturalWidth;
            sW = endx - startx;
        }else{
            alert("缩放显示发生错误!");
            // debugger;
        }

        //the startx in view container
        resizeRect.left = startx * imageRatio;

        // set canvas size
        var scrollbarWidth = 20;
        cvsH = aHeight - scrollbarWidth;
        cvsW = sW / image.naturalHeight * cvsH;

        var width = parseInt(cvsW);
        var height = parseInt(cvsH);
        canvas.setAttribute("height", height);
        canvas.setAttribute("width", width);
        ctx.drawImage(image, startx, starty, sW, sH, 0, 0, width, height);
        var cvsURL = canvas.toDataURL("image/png");
        //the ration cvs over view size
        resizeRect.ratio = cvsH/image.height;
        //work on mask layer
        $("#mask").css({
            width: aWidth - scrollbarWidth + "px",
            height: cvsH + "px",
        });
        $("#mask").removeClass('hidden');

        $("#largeImage").attr("src", cvsURL);
    }

    //check the data on the resizeRectContainer
    var checkResizeData = function () {
        // var result = [];
        /*先检查文本信息是否完整*/
        var textIpt = $("#resizeRecord").find("input");
        var len = textIpt.length;
        for (var i = 0; i < len; i++) {
            textIpt[i].value = textIpt[i].value.trim();
            if (textIpt[i].value != '') continue;
            alert("请补全文字标注信息");
            $(textIpt[i]).focus();
            return false;
        }

    };

    //show the view page working state
    var updateWorkState = function (col, idx) {
        $("#workStateCol").text(col);
        $("#workStateIdx").text(idx);
    };

    //show the state of insertion
    var updateInsertState = function (flag) {
        insertFlag = flag;
        if(flag==0){
            $("#insertState").text("在后插入");
        }else{
            $("#insertState").text("在前插入");
        }  
    };

    //update state showing and lastRectOrder from working state
    var updateResizeWorkState = function () {
        //update the work state with the var workingCol
        $("#rsWorkStateCol").text(parseInt(workingCol)+1);
        $("#rsWorkStateIdx").text(parseInt(workingIdx)+1);

        if(workingIdx != -1){
            //focus lastRectOrder to working state
            lastRectOrder = rectColsManager[workingCol][workingIdx];
        }
    };

    //check the data before submit to server
    var checkSubmitValid = function () {
        var result = [];
        // var image = document.getElementById("image");
        var containerWidth = $("#RectContainer").width();
        var containerHeight = $("#RectContainer").height();
        
        //check empty inputs and illegal labels
        var textIpt = $(".textInput");
        if(textIpt.length==0){
            //no labeling info
            alert("无标注信息，无法提交");
            return false;
        }
        //checking input
        for (var i = 0; i < textIpt.length; i++) {
            textIpt[i].value = textIpt[i].value.trim();
            if(textIpt[i].value == ''){
                alert("请补全文字标注信息");
                $(textIpt[i]).focus();
                return false;
            }else if(textIpt[i].value.indexOf(";")!=-1||textIpt[i].value.indexOf("；")!=-1){
                alert('输入含有非法字符";"');
                $(textIpt[i]).focus();
                return false;
            }else if(textIpt[i].value.indexOf("?")!=-1||textIpt[i].value.indexOf("？")!=-1){
                alert('输入含有非法字符"?"');
                $(textIpt[i]).focus();
                return false;
            }else if(textIpt[i].value.indexOf("!")!=-1||textIpt[i].value.indexOf("！")!=-1){
                alert('输入含有非法字符"!"');
                $(textIpt[i]).focus();
                return false;
            }else if(textIpt[i].value.length > 1){
                alert('多于1个字符，请检查');
                $(textIpt[i]).focus();
                return false;
            }
        }

        //check if exists empty column
        //check the coordinate if in container
        var curOrder=0;
        var containerWidth = $("#RectContainer").width();
        var containerHeight = $("#RectContainer").height();
        var coordinateStr = "";
        var labelStr = "";
        for (var i = 0; i < rectColsManager.length; i++) {
            if(rectColsManager[i].length == 0){
                //empty column
                rectColsManager.splice(i, 1);
                alert("含有空白列，已删除1列!");
            }else{
                //check coordinate and convert to result, one column
                for (var j = 0; j < rectColsManager[i].length; j++) {
                    curOrder = rectColsManager[i][j];
                    // console.log(curOrder);
                    var curRect = $(".rectUnit[data-order="+curOrder+"]");
                    var curIpt = $(".rectItem[data-order="+curOrder+"]");
                    var rectLeft = $(curRect).position().left;
                    var rectTop = $(curRect).position().top;
                    var rectWidth = $(curRect).width();
                    var rectHeight = $(curRect).height();
                    if((rectLeft<0)||(rectLeft+rectWidth)>containerWidth||(rectTop<0)||(rectTop+rectHeight)>containerHeight){
                        //out of size
                        alert("标注框超出范围，请检查");
                        $(curIpt).find("input").focus();
                        return false;
                    }else{
                        //all the data has been checked, coordinate and input, one rect
                        //compute and convert to result
                        coordinateStr += (rectLeft/imageRatio).toFixed(2) + "," + (rectTop/imageRatio).toFixed(2) + "," + (rectWidth/imageRatio).toFixed(2) + "," + (rectHeight/imageRatio).toFixed(2) + ",";
                        labelStr += $(curIpt).find("input")[0].value;
                        // debugger;
                    }
                }
                //column ends
                coordinateStr = coordinateStr.slice(0, -1) + ";"; //remove the last "," and add ";"
                labelStr += ";"; //add ";"
            }
        }


        // result = false;
        result = coordinateStr.slice(0, -1) + "!" + labelStr.slice(0, -1); //remove the last ";" in coordinateStr and labelStr
        return result;
    };

    //clear all data existed
    var clearRectData = function ()
    {
        //remove rects
        var del = $(".delete");
        del.click();
        //remove labelP
        $("#labelContainer>p").remove();
        $("#resizeLabelContainer>p").remove();
    };

	var rectColsManager = []; //for managing the order of rect as col
	var lastRectOrder = -1; //the order of rect that the user last click on
	var lastClientX = -1; //the X of container that the user last click on
	var lastClientY = -1; //the Y of container that the user last click on
	var workingCol = -1; //record which column the user working at, should be ofen updated
    var workingIdx = -1; //record the index of rect in column
    var insertFlag = 0; //0 for inserting after on default, 1 for inserting before

	var con = document.getElementById('RectContainer');
	// lib.bindevent(con, "#record");
	lib.bindViewEvent(con, "#record");

    var resizeRectCon = document.getElementById('resizeRectContainer');
    lib.bindevent(resizeRectCon, '#resizeRecord');

	$("#image").attr("src", window.initPath);

	$("#image").on('load', function () {
        var parentBound = this.offsetParent.getBoundingClientRect();
        var rectBound = this.getBoundingClientRect();
        var left = rectBound.left - parentBound.left;
        var top = rectBound.top - parentBound.top;
        con.setAttribute('style', "width:" + rectBound.width + "px;height:" + rectBound.height + "px;position: absolute;left:" + left + "px;top:" + top + "px;");
        // resizeCon.setAttribute('style', "width:" + rectBound.width + "px;height:" + rectBound.height + "px;position: absolute;left:" + left + "px;top:" + top + "px;z-index:10;");
        if (this.src.indexOf("finished.jpg") >= 0) return;
	    initRectsFromMessage(this, window.message);
        //after initialization rects, focus on the first one
        focusOnFirstRect();
	    initLabelFromMessage(window.message);
        // debugger;
    });

	//when the user click on rect
    $("#RectContainer").bind('logRectOrder', function(event, triggeredOrder){
    	//mark down the rect order and update workingCol
    	lastRectOrder = triggeredOrder;
    	var colInfo = getColInfoFromOrder(triggeredOrder);
        workingCol = colInfo[0];
        workingIdx = colInfo[1];
    	// debugger;
        //update the work state
        // $("#workStateCol").text(parseInt(colInfo[0])+1);
        // $("#workStateIdx").text(parseInt(colInfo[1])+1);
        updateWorkState(parseInt(colInfo[0])+1, parseInt(colInfo[1])+1);
        updateResizeWorkState();
    });

    // when the user click on the container but not on rect
    $("#RectContainer").bind("logClientXY", function (event, lClientX, lClientY) {
    	//mark down client coordinate
        lastClientX = lClientX;
    	lastClientY = lClientY;
    	lastRectOrder = -1;
    	workingCol = -1;
        workingIdx = -1;
    	// debugger;
        //update the work state
        // $("#workStateCol").text(0);
        // $("#workStateIdx").text(0);
        updateWorkState(0, 0);
    });

    $("#RectContainer").bind("delRectMove", function(event, rectOrder){
        // lastRectOrder = rectOrder;
        var colInfo = getColInfoFromOrder(rectOrder);
        workingCol = colInfo[0];
        workingIdx = colInfo[1];
        //remove the record in manager
        rectColsManager[workingCol].splice(workingIdx, 1);
        //update work state
        workingIdx--;
        if(workingIdx==-1){
            //the rects before in the whole column have been deleted
            lastRectOrder = -1;
            lastClientX = 0;
            lastClientY = 0;
        }else{
            lastRectOrder = rectColsManager[workingCol][workingIdx];
        }
        updateWorkState(parseInt(workingCol)+1, parseInt(workingIdx)+1);
        updateResizeWorkState();
    	// debugger;
    });

    // when the new rect init
    $("#resizeRectContainer").bind("newRectInit", function(event, rectOrder){
        if(workingCol in rectColsManager){
    		//the column num has existed, append the rect
    		// rectColsManager[workingCol].push(rectOrder);
            if(rectColsManager[workingCol].length==0){
                //the user deleted all the rects before
                rectColsManager[workingCol].push(rectOrder);
                workingIdx = 0;
            }else{
                //some rects already exists
                // var colInfo = getColInfoFromOrder(lastRectOrder);
                if(workingIdx==-1){
                    //the rect selected before has been deleted
                    //push or unshift the rect to the column 
                    if(insertFlag==0){
                        //push the rect to the column
                        rectColsManager[workingCol].push(rectOrder);
                        workingIdx = rectColsManager[workingCol].length - 1;
                    }else{
                        rectColsManager[workingCol].unshift(rectOrder);
                        workingIdx = 0;
                    }
                }else{
                    //add the new rect to the column corelated to last selected rect
                    if(insertFlag==0){
                        //add the new rect after
                        if(workingIdx==rectColsManager[workingCol].length-1){
                            rectColsManager[workingCol].push(rectOrder);
                        }else{
                            rectColsManager[workingCol].splice(workingIdx+1, 0, rectOrder);
                        }
                        workingIdx += 1;
                    }else{
                        //add the new rect before
                        rectColsManager[workingCol].splice(workingIdx, 0, rectOrder);
                    }
                }
            }
    	}else{
    		//the column num has not existed yet, 
    		//new an array and append to rectColsManager
    		var colAry = new Array();
    		colAry.push(rectOrder);
    		rectColsManager.push(colAry);
            workingIdx = 0;
    	}
    	// debugger;
        updateResizeWorkState();
    });

    /*开启或退出缩放按钮*/
    $("#btnResize").on('click', function () {
        showImageOnResizeLayer();
    });

    //show the large image on the mask layer
    $("#largeImage").on('load', function () {
        //set the size of container with the relative position
        var parentBound = this.offsetParent.getBoundingClientRect();
        var rectBound = this.getBoundingClientRect();
        var left = rectBound.left - parentBound.left;
        var top = rectBound.top - parentBound.top;
        resizeRectCon.setAttribute('style', "width:" + rectBound.width + "px;height:" + rectBound.height + "px;position: absolute;left:" + left + "px;top:" + top + "px;");

        //set the size of resize record container
        var recordConHeight = $("#resizeRecordPart").offset().top + $("#resizeRecordPart").height() - $("#resizeRecord").offset().top;
        $("#resizeRecord").css("max-height", recordConHeight + "px");

        //move the rect to the resize layer
        moveRectsToContainer(workingCol, "#resizeRectContainer", "#resizeRecord", 0);
        //updateResizeWorkState with the workingCol
        updateResizeWorkState();
        updateInsertState(0);
    });

    /*保存并转换数据*/
    $("#saveRsRecord").on("click", function () {
        if ($("#resizeRecord .rectItem").length == 0) {
            //no rects before return
            $("#mask").addClass('hidden');
            //check the column num
            if(workingCol in rectColsManager){
                rectColsManager.splice(workingCol, 1);
                workingCol = -1;
                workingIdx = -1;
            }
            return;
        }
        var result = checkResizeData();
        if (result == false) return;
        
        //move the rects back to view page
        moveRectsToContainer(workingCol, "#RectContainer", "#record", 1);
        $("#mask").addClass('hidden');
        // $(".rectItem>input").last().focus();
        updateWorkState(0, 0);

    });

    //click on insert before btn
    $("#insertBeforeBtn").bind("click", function () {
        //refresh the flag and showing state
        updateInsertState(1);
    });

    //click on insert after btn
    $("#insertAfterBtn").bind("click", function () {
        //refresh the flag and showing state
        updateInsertState(0);
    });

    //delete column
    $("#delColBtn").bind("click", function () {
        //delete all the rect existed
        $("#resizeRecord .rectItem .delete").click();

        //update the woring state
        workingIdx = -1;
        updateResizeWorkState();
        // debugger;
    });

    //add a new column
    $("#newColBtn").bind("click", function () {
        //new an empty array for new column
        var colAry = new Array();
        // rectColsManager.push(colAry);
        //check workingCol if effective
        if(workingCol in rectColsManager){
            //columns existed
            if(rectColsManager[workingCol].length==0){
                //the column is empty, new column will now change working column
                return;
            }else{
                //this column is not empty
                //update workingCol according to insertFlag
                if(insertFlag == 0){
                    //insert after
                    if(workingCol==rectColsManager.length-1){
                        rectColsManager.push(colAry);
                    }else{
                        rectColsManager.splice(workingCol+1, 0, colAry);
                    }

                    //check the resize record
                    var result = checkResizeData();
                    if (result == false) return;


                    //move the rects back to view page using flag 1
                    moveRectsToContainer(workingCol, "#RectContainer", "#record", 1);
                    workingCol += 1;
                }else{
                    //check the resize record
                    var result = checkResizeData();
                    if (result == false) return;

                    //insert before
                    rectColsManager.splice(workingCol, 0, colAry);

                    //move the rects back to view page using flag 1
                    moveRectsToContainer(workingCol+1, "#RectContainer", "#record", 1);
                }
            }

        }else{
            //workingCol already new and equals to rectColsManager.length-1
            rectColsManager.push(colAry);
        }

        //update working state
        workingIdx = 0;
        updateResizeWorkState();
    });

    //show the pre column of rects
    $("#preColBtn").bind("click", function () {
        //check workCol if 0
        if(workingCol == 0){
            alert("已经是第一列了");
            return;
        }else if(workingCol in rectColsManager){
            if(rectColsManager[workingCol].length==0){
                //rects in this columns have been all deleted
                rectColsManager.splice(workingCol, 1);
                alert("当前列为空，已删除");
            }else{
                //check the resize record
                var result = checkResizeData();
                if (result == false) return;

                //move rects back to view page first
                moveRectsToContainer(workingCol, "#RectContainer", "#record", 1);  
            }

            //update workingState
            workingCol -= 1;
            workingIdx = 0;

            //update lastRectOrder
            lastRectOrder = rectColsManager[workingCol][workingIdx];

            //reshow the image
            showImageOnResizeLayer();
        }else{
            //update workingState
            workingCol -= 1;
            workingIdx = 0;

            //update lastRectOrder
            lastRectOrder = rectColsManager[workingCol][workingIdx];

            //reshow the image
            showImageOnResizeLayer();
        }
    });

    //show the next column of rects
    $("#nextColBtn").bind("click", function () {
        //check workCol if last
        if(workingCol == rectColsManager.length - 1 || !(workingCol in rectColsManager)){
            alert("已经是最后一列了");
            return;
        }else if(rectColsManager[workingCol].length==0){
            //rects in this columns have been all deleted
            rectColsManager.splice(workingCol, 1);
            alert("当前列为空，已删除");

            //update workingState
            workingIdx = 0;

            //update lastRectOrder
            lastRectOrder = rectColsManager[workingCol][workingIdx];

            //reshow the image
            showImageOnResizeLayer();
        }else{
            //check the resize record
            var result = checkResizeData();
            if (result == false) return;

            //move rects back to view page
            moveRectsToContainer(workingCol, "#RectContainer", "#record", 1);

            //update workingState
            workingCol += 1;
            workingIdx = 0;

            //update lastRectOrder
            lastRectOrder = rectColsManager[workingCol][workingIdx];

            //reshow the image
            showImageOnResizeLayer();
        }
    });

    //submit operation
    $("#submit").bind("click", function () {
        //check the data if effective
        var result = checkSubmitValid();
        if(!result){
            return;
        }else{
            //upload the result
            // console.log(result);
            $.post('/setMessage/',{
                Message: result,
                PhotoPath: $("#image").attr("src").split("/").reverse()[0],
            }, function (data) {
                //callback function
                var status = parseInt(data.status);
                if(status == -5){
                    //error happens
                    alert("错误");
                    return;
                }else if(status == -2){
                    //server busy
                    alert("服务器忙,请稍后再试");
                    return;
                }else if(status>=0){
                    //clear all the old data
                    clearRectData();
                    //update all data
                    window.message = data.message;
                    $("#image").attr("src", data.nextImage);
                    $("#imageCount").text(data.completeCount);
                    $("#rectCount").text(data.rectTotalRect);
                    $("#bookInfo").text(data.bookName+"第"+data.volume+"章第"+data.page+"页");
                    // debugger;
                }else{
                    location.href = "/Error?s=" + data.status;
                }
            });
        }
    });




    //相关快捷键操作
    $(document).keydown(function (e) {
        //keyCode:左方向键37,右方向键39，,tab键9， 回车键13, Delete46
        var keyCode = e.keyCode;
        if (keyCode == 9) {
            //tab操作，自动聚焦到下一个矩形
            if (document.activeElement.type == "text") {
                //当前聚焦在输入框
                e.preventDefault();
                $(document.activeElement).parent().next().find("input").focus();
            } 
        }else if(keyCode == 46){
            //delete current input
            if(document.activeElement.type == "text"){
                //current focus in the input
                e.preventDefault();
                $(document.activeElement).next().click();
            }
        }
    });
});