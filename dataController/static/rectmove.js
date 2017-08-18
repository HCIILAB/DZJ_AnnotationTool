;(function (win, doc, lib) {
	/**
     * @namespace lib
     */

     //check the obj is plain object or not, but it is already implemented in jQuery
    function isPlainObject(obj) {
        return obj != null && typeof obj == 'object' && Object.getPrototypeOf(obj) == Object.prototype;
    }

	var ua = navigator.userAgent;
    var isFirefox = !!ua.match(/Firefox/i);
    var isIEMobile = !!ua.match(/IEMpbile/i);
    var cssPrefix = isFirefox ? '-moz-' : isIEMobile ? '-ms' : '-webkit-';
    var stylePrefix = isFirefox ? 'Moz' : isIEMobile ? 'ms' : 'webkit';

    var _bindRectMove = {}; /*保存rectmove变量*/
    // var _bindResizeRectMove = {}; //save the resize rect temporarily

    //update the rect info
    function UpdateRectParam(order, width, height, scale, location){
    	_bindRectMove[order]._refreshParam(width, height, scale, location);
    }

    /*矩形事件绑定*/
    function BindEvent(element, recordElement) {
    	//get the element from selector
        if (element.nodeType != document.ELEMENT_NODE && typeof element == 'string') {
            element = document.querySelector(element);
        }
        var clickFlag = -1; //0 for click, 1 for move, 
        var flag = -1; //0 for rect or container, 1 for border, -1 for nothing
        var winFlag = -1; //flag for window, 0 for rect in window, 1 for border in window
        var idx = "-1"; //4-7 for each border
        var currentElem = null; //pointing to border, rect or container
        //when clicking on border, use currentParent to point to rect
        var currentParent = null;
        var containerSize; //for getting the location of container
        var loc; //rect location
        var rect = { //for temporary storage
            left: 0, // position absolute in the container
            top: 0,
            w: 0,
            h: 0,
            locx: 0, // the click location
            locy: 0
        };

        var rectElem = document.createElement('div');
        rectElem.setAttribute("class", "drawRect");
        var order;
        $(element).mousedown(function (event) {
        	//mousedown inside container
            currentElem = event.target; // container or rect or border
            order = currentElem.getAttribute("data-order"); //not null only when mousedown on rect
            
            //update currentParent
            currentParent = currentElem.offsetParent;

            containerSize = element.getBoundingClientRect();
            clickFlag = 0; //0 for mousedown
            if (!currentElem.classList.contains("borderpoint")) {
            	//mousedown on container, or rect, rect overlap allowed
            	//append a rect to the container
                flag = 0;
                winFlag = 0;
                idx = "-1";
                // var oriLoc = element.getBoundingClientRect();
                rect.locx = event.clientX;
                rect.locy = event.clientY;
                rect.left = rect.locx - containerSize.left;
                rect.top = rect.locy - containerSize.top;
                rect.w = 0;
                rect.h = 0;
                $(rectElem).css("left", rect.left + "px");
                $(rectElem).css("top", rect.top + "px");
                $(rectElem).css("width", 0);
                $(rectElem).css("height", 0);
                element.appendChild(rectElem);
            }
            else {
            	// mousedown on border
                flag = 1;
                winFlag = 1; // doubt here
                idx = currentElem.getAttribute("data-idx");
                currentParent = currentElem.offsetParent; // pointing to rect
                // loc = currentParent.querySelector(".pt1").getBoundingClientRect();
                loc = currentParent.getBoundingClientRect();
            };
        }).mousemove(function (event) {
            event.stopPropagation();
            if (clickFlag == 0 || clickFlag == 1) {
                clickFlag = 1;
            }
            if (flag == -1) return;  // not clicked on container first
            if (flag == 0) {
                /*初始化矩形阶段*/
                rect.w = event.clientX - rect.locx;
                rect.h = event.clientY - rect.locy;
                //update if the rect larger than 10
                if (rect.w >= 1 && rect.h >=1 ) {
                    $(rectElem).addClass("show");
                    $(rectElem).css("width", rect.w + "px");
                    $(rectElem).css("height", rect.h + "px");
                }
            } else if (flag == 1) {
                var clx = event.clientX;
                var cly = event.clientY;
                var x, y; //effective location of client click
                if (clx < containerSize.left) {
                	// move outside the container
                    x = containerSize.left;
                } else if (clx > containerSize.left + containerSize.width) {
                    x = containerSize.left + containerSize.width;
                } else {
                    x = clx;
                };
                if (cly < containerSize.top) {
                    y = containerSize.top;
                } else if (cly > containerSize.top + containerSize.height) {
                    y = containerSize.top + containerSize.height;
                } else {
                    y = cly;
                }
                //get the rect
                var rm = _bindRectMove[parseInt(currentParent.getAttribute("data-order"))];
                var tk;
                switch (idx) {
                    case "1":
                        loc = currentParent.getBoundingClientRect();
                        var change = _getChangeParam(loc.left, loc.top, x, y, idx, currentParent);
                        rm.upmove(change.dh);
                        rm._refreshParam(change.width, change.height, change.scale, rm._getLocation());
                        break;
                    case "2":
                        loc = currentParent.getBoundingClientRect();
                        // debugger;
                        var change = _getChangeParam(loc.right, loc.bottom, x, y, idx, currentParent);
                        rm.rightmove(change.dw);
                        rm._refreshParam(change.width, change.height, change.scale, rm._getLocation());
                        break;
                    case "3":
                        loc = currentParent.getBoundingClientRect();
                        var change = _getChangeParam(loc.left, loc.bottom, x, y, idx, currentParent);
                        rm.downmove(change.dh);
                        rm._refreshParam(change.width, change.height, change.scale, rm._getLocation());
                        break;
                    case "4":
                        loc = currentParent.getBoundingClientRect();
                        var change = _getChangeParam(loc.left, loc.top, x, y, idx, currentParent);
                        rm.leftmove(change.dw);
                        rm._refreshParam(change.width, change.height, change.scale, rm._getLocation());
                        break;
                    default:
                        flag = false;
                        return;
                }
            }
        }).mouseup(function (event) {
            event.stopPropagation();
            winFlag = -1;
            if (flag == -1) return;
            if(clickFlag == 0) {
            	if(!order && currentParent){
            		//click on border
            		order = currentParent.getAttribute("data-order");
            		// debugger;	
            	}
            	if(order){
            		_bindRectMove[order].focus();
            	}
            }
            if (flag == 0) {
                flag == -1;
                rect.w = event.clientX - rect.locx;
                rect.h = event.clientY - rect.locy;
                var rectmove = new lib.rectmove({
                    element: element,
                    width: rect.w,
                    height: rect.h,
                    location: {
                        left: rect.left,
                        top: rect.top
                    },
                    recordElement: recordElement
                });
                $(rectElem).remove();
                rectmove.init();
                return;
            } else if (flag == 1) {
                flag = -1;
                var rm = _bindRectMove[parseInt(currentParent.getAttribute("data-order"))];
                // rm._computeCoordinate();
                rm._justifyCoordinate();
                // rm._computeCoordinate();
                rm.focus();
                return;
            }
        });

        $(window).mousemove(function (event) {
            if (winFlag == 0) {
                /*初始化矩形阶段*/
                rect.w = (event.clientX > containerSize.width + containerSize.left) ? containerSize.width + containerSize.left - rect.locx : event.clientX - rect.locx;
                rect.h = (event.clientY > containerSize.height + containerSize.top) ? containerSize.height + containerSize.top - rect.locy : event.clientY - rect.locy;
                $(rectElem).css("width", rect.w + "px");
                $(rectElem).css("height", rect.h + "px");
            } else if (winFlag == 1) {
                var rm = _bindRectMove[parseInt(currentParent.getAttribute("data-order"))]
                var lx = event.clientX;
                var ly = event.clientY;
                var x, y;
                if (lx < containerSize.left) {
                    x = containerSize.left;
                } else if (lx > containerSize.left + containerSize.width) {
                    x = containerSize.left + containerSize.width;
                } else {
                    x = lx;
                };
                if (ly < containerSize.top) {
                    y = containerSize.top;
                } else if (ly > containerSize.top + containerSize.height) {
                    y = containerSize.top + containerSize.height;
                } else {
                    y = ly;
                }

                var change = _getChangeParam(loc.left, loc.top, x, y, idx, currentParent);
                switch (idx) {
                    case "1":
                        loc = currentParent.getBoundingClientRect();
                        var change = _getChangeParam(loc.left, loc.top, x, y, idx, currentParent);
                        rm.upmove(change.dh);
                        rm._refreshParam(change.width, change.height, change.scale, rm._getLocation());
                        break;
                    case "2":
                        loc = currentParent.getBoundingClientRect();
                        var change = _getChangeParam(loc.right, loc.top, x, y, idx, currentParent);
                        rm.rightmove(change.dw);
                        rm._refreshParam(change.width, change.height, change.scale, rm._getLocation());
                        break;
                    case "3":
                        loc = currentParent.getBoundingClientRect();
                        var change = _getChangeParam(loc.left, loc.bottom, x, y, idx, currentParent);
                        rm.downmove(change.dh);
                        rm._refreshParam(change.width, change.height, change.scale, rm._getLocation());
                        break;
                    case "4":
                        loc = currentParent.getBoundingClientRect();
                        var change = _getChangeParam(loc.left, loc.top, x, y, idx, currentParent);
                        rm.leftmove(change.dw);
                        rm._refreshParam(change.width, change.height, change.scale, rm._getLocation());
                        break;
                    default:
                        flag = false;
                        return;
                }
            }
        }).mouseup(function (event) {
            if (winFlag == 0) {
                winFlag = -1;
                rect.w = (event.clientX > containerSize.width + containerSize.left) ? containerSize.width + containerSize.left - rect.locx : event.clientX - rect.locx;
                rect.h = (event.clientY > containerSize.height + containerSize.top) ? containerSize.height + containerSize.top - rect.locy : event.clientY - rect.locy;
                var rectmove = new lib.rectmove({
                    element: element,
                    width: rect.w,
                    height: rect.h,
                    location: {
                        left: rect.left,
                        top: rect.top
                    },
                    recordElement: recordElement
                });
                $(rectElem).remove();
                rectmove.init();
                return;
            } else if (flag == 1) {
                winFlag = -1;
                flag = -1;
                var rm = _bindRectMove[parseInt(currentParent.getAttribute("data-order"))];
                // rm._computeCoordinate();
                rm._justifyCoordinate();
                // rm._computeCoordinate();
                return;
            }
        });
    }

    function BindViewEvent(element, recordElement){
 		if(element.nodeType != document.ELEMENT_NODE && typeof element == 'string'){
 			element = doc.querySelector(element);
 		}   	
 		
 		$(element).click(function (event) {
 			var currentElem = event.target;
 			var order = currentElem.getAttribute("data-order");
 			var currentParent = null;
 			if(order){
 				// console.log("rect");
 				_bindRectMove[order].focus();
 				return;
 			}else if(currentElem.classList.contains("borderpoint")){	
				currentParent = currentElem.offsetParent;
				order = currentParent.getAttribute("data-order");
				_bindRectMove[order].focus();	
 				return;
 			}else{
 				// console.log("container", event.clientX, event.clientY);
 				// $.event.trigger("logRectOrder", -1);
 				var rectLoc = currentElem.getBoundingClientRect();
 				$.event.trigger("logClientXY", [event.clientX - rectLoc.left, event.clientY - rectLoc.top]);
 				return;
 			}
 		});
    }

    /*计算原始rect的宽，高，缩放比例和旋转角度*/
    function _getParam(elem) {
        // var str = $(elem).css("transform").slice(7);
        // var a = str.split(', ')[0];
        // var b = str.split(', ')[1];
        var left = $(elem).css("left").slice(0, -2);
        var top = $(elem).css("top").slice(0, -2);
        return {
            // scale: Math.sqrt(a * a + b * b).toFixed(2),
            // rotate: (Math.atan(b / a) / Math.PI * 180).toFixed(2) + "deg",
            width: $(elem).css("width").slice(0, -2),
            height: $(elem).css("height").slice(0, -2),
            left: left,
            top: top
        }
    }


    /*计算调整后的各参数
     * @param x1,y1表示第一个点的坐标，x2,y2表示移动的点的坐标，type表示移动点的类型, elem表示对应的矩形
     * type=1-4 for 4 border, 1 for top, 2 for right and so on
     */
    function _getChangeParam(x1, y1, x2, y2, type, elem) {
        var self = this;
        var param = _getParam(elem);
        var width = param.width;
        var height = param.height;
        // var dist = Math.sqrt((x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1));
        // var theta = parseFloat(param.rotate.slice(0, -3)) / 180 * Math.PI;

        switch (type) {
            case "1":
                  //left,top和height改变
                var dx = x2 - x1;
                var dy = y2 - y1;
                // if (dx < 0) return {
                //     // height: parseFloat(param.height) + dh,
                //     height: parseFloat(param.height) - dy,
                //     width: param.width,
                //     // scale: param.scale,
                //     // rotate: theta * 180 / Math.PI.toFixed(2),
                //     dh: 0
                // };

                // var ty = dx * Math.tan(theta);
                // var dh = (ty - dy) * Math.cos(theta);
                return {
                    // height: parseFloat(param.height) + dh,
                    height: parseFloat(param.height) - dy,
                    width: param.width,
                    // scale: param.scale,
                    // rotate: theta * 180 / Math.PI.toFixed(2),
                    dh: -dy
                };
                break;
            case "2":
                //width改变
                var dx = x2 - x1;
                var dy = y2 - y1;
                // debugger;
                // if(dy < 0) return {
                //    height: parseFloat(param.height),
                //    width: param.width,
                //    // scale: param.scale,
                //    // rotate: theta * 180 / Math.PI.toFixed(2),
                //    dw: 0
                // };
                // console.log(dx, dy);
                //var dw = (dx + dy * Math.tan(theta)) * Math.cos(theta);
                // var dw = dy * Math.sin(theta) + dx * Math.cos(theta) - parseInt(param.width);
                return {
                    height: param.height,
                    // width: parseFloat(param.width) + dw,
                    width: parseFloat(param.width) + dx,
                    // scale: param.scale,
                    // rotate: theta * 180 / Math.PI.toFixed(2),
                    dw: dx
                }
                break;
            case "3":
                //height改变
                var dx = x2 - x1;
                var dy = y2 - y1;
                // if (dx < 0) return {
                //     height: parseFloat(param.height),
                //     width: param.width,
                //     // scale: param.scale,
                //     // rotate: theta * 180 / Math.PI.toFixed(2),
                //     dh: 0
                // };

                // var ty = dx * Math.tan(theta);
                // var dh = (ty - dy) * Math.cos(theta);
                return {
                    height: parseFloat(param.height) + dy,
                    width: param.width,
                    // scale: param.scale,
                    // rotate: theta * 180 / Math.PI.toFixed(2),
                    dh: -dy
                };
                break;
            case "4":
                  //left,top和width改变
                var dx = x2 - x1;
                var dy = y2 - y1;
                // if(dy < 0) return {
                //     height: parseFloat(param.height),
                //     width: param.width,
                //     scale: param.scale,
                //     rotate: theta * 180 / Math.PI.toFixed(2),
                //     dw: 0
                // };
                // var dw = dy * Math.sin(theta) + dx * Math.cos(theta);
                return {
                    height: param.height,
                    width: parseFloat(param.width) - dx,
                    // scale: param.scale,
                    // rotate: theta * 180 / Math.PI.toFixed(2),
                    dw: dx
                }
        }
    }

    //
    // function _getResizeScale(x1, y1, x2, y2, width, height) {
    //     var scale;
    //     var state;
    //     tmpy1 = -y1;
    //     tmpy2 = -y2;
    //     tmpheight = -height;
    //     if (x1 == 0) x1 = 0.0001;
    //     if (x1 == width) x1 = x1 - 0.0001;
    //     var k1 = tmpy1 / x1;
    //     var k2 = (0 - tmpy1) / (width - x1);
    //     var k3 = (tmpheight - tmpy1) / (width - x1);
    //     var k4 = (tmpheight - tmpy1) / (0 - x1);
    //     if (x2 >= 0 && x2 <= width && y2 >= 0 && y2 <= height) return 1;
    //     if (x2 == x1 && y2 < 0) {
    //         return (y1 - y2) / y1;
    //     } else if (x2 == x1 && y2 > height) {
    //         return (y2 - y1) / (height - y1);
    //     }
    //     var k = (tmpy2 - tmpy1) / (x2 - x1);
    //     if (x2 > x1) {
    //         // if(k == 0) return (x2 - x1) / (width - x1);
    //         if (k < k3) { state = 2; }
    //         else if (k < k2) { state = 1; }
    //         else state = 0;
    //     } else {
    //         if (k < k1) { state = 0; }
    //         else if (k < k4) { state = 3; }
    //         else { state = 2; }
    //     }
    //     switch (state) {
    //         case 0:
    //             scale = y1 / (y1 - y2);
    //             break;
    //         case 1:
    //             scale = (width - x1) / (x2 - x1);
    //             break;
    //         case 2:
    //             scale = (height - y1) / (y2 - y1);
    //             break;
    //         case 3:
    //             scale = x1 / (x1 - x2);
    //             break;
    //         default:
    //             return 1;
    //             break;
    //     }
    //     /*小数两位向上取整*/
    //     // scale = parseFloat(scale.toFixed(1)) + 0.1;
    //     return scale;

    // }

    /**
     * 计算坐标
     * @param { } [elem] [对应矩形dom]
    */

    /**
     * @class lib.rectmove
     * aram {(string|HTMLElement)} element 一个DOM元素，或者是它的CSS选择器
     * @param {object} options 配置参数
     * width: 矩形的宽
     * height: 矩形的高
     * location: 矩形的初始位置
     */

    function RectMove(element, options) {
        if (!options && isPlainObject(element)) {
            options = element;
            element = options.element;
        }
        options = options || {};
        //element is a string for selector or not
        if (element.nodeType != doc.ELEMENT_NODE && typeof element == 'string') {
            element = doc.querySelector(element);
        }
        var recordElement = options.recordElement || '#record';
        var self = this;
        self.element = element;
        self.recordContainer = doc.querySelector(recordElement);
        self.initWidth = options.width || 0;
        self.initHeight = options.height || 0;
        self.location = options.location || { left: 100, top: 100 };
        self.scale = options.scale || 1.0;
        self.textMessage = options.textMessage || "";
        // self.coordinate = {
        //     pt1: { x: 0, y: 0 },
        //     pt2: { x: 0, y: 0 },
        //     pt3: { x: 0, y: 0 },
        //     pt4: { x: 0, y: 0 },
        // };
        self.order = 0; //for rect controlling, each rect has an distinct order
        // self.containerSize = element.getBoundingClientRect();
        // self.recordUnit = null;
    }

    RectMove.prototype = {
        /* @lends RectMove.prototype */
        constructor: RectMove,

        /**
         * 初始化实例
         * @function lib.rectmove#init
         */
        init: function () {
            var self = this;
            var element = self.element;
            var elementStyle = element.style;
            // XXX: 解决闪动问题
            elementStyle[stylePrefix + 'Transform'] = 'translateZ(0)'; // XXX: 解决闪动问题
            elementStyle['transform'] = 'translateZ(0)';

            //如果initWidth/initHeight = 0 则不操作
            if (self.initWidth == 0 || self.initHeight == 0) return;
            if (self.initWidth < 5 && self.initHeight < 5) return;
            if ($(".rectUnit").length == 0) {
                self.order = 0;
            } else {
                // self.order = parseInt($(".rectUnit").last()[0].getAttribute("data-order")) + 1;
                var max_order = 0;
                $(".rectUnit").each(function(){
                	var tmporder = parseInt($(this)[0].getAttribute("data-order"));
                	max_order = tmporder > max_order ? tmporder : max_order;
                });
                self.order = max_order + 1;
            }
            var fragment = document.createDocumentFragment();
            var rectUnit = document.createElement("div");
            rectUnit.setAttribute("class", "rectUnit");
            rectUnit.setAttribute('data-order', self.order);
            var styleText = "width:" + self.initWidth + "px;height:" + self.initHeight + "px;left:" + self.location.left + "px;top:" + self.location.top + "px;";
            rectUnit.setAttribute("style", styleText);
            for (var i = 1; i < 5; i++) {
                // var elem = document.createElement("div");
                var borElem = document.createElement("div");
                // elem.setAttribute("class", "pt" + i + " point");
                // elem.innerHTML = i;
                // elem.setAttribute("data-idx", i);
                borElem.setAttribute("class", "bdpt" + i + " borderpoint");
                borElem.setAttribute("data-idx", i );
                // rectUnit.appendChild(elem);
                rectUnit.appendChild(borElem);
            }
            fragment.appendChild(rectUnit);
            element.appendChild(fragment);
            self.rectUnit = rectUnit;
            _bindRectMove[self.order] = self;

            var recordUnit = document.createElement('div');
            var fragment1 = document.createDocumentFragment();
            recordUnit.setAttribute('class', 'rectItem');
            // for (var i = 0; i < 4; i++) {
            //     var span = document.createElement('span');
            //     span.setAttribute('class', 'coorPoint');
            //     fragment1.appendChild(span);
            // }
            var ipt = document.createElement('input');
            ipt.setAttribute('type', 'text');
            ipt.setAttribute('class', 'textInput');
            ipt.value = self.textMessage;
            //var btn = document.createElement('button');
            //btn.setAttribute('class','save');
            //btn.innerHTML = "保存";
            var btn1 = document.createElement('button');
            btn1.setAttribute('class', 'delete');
            btn1.innerHTML = "删除";
            fragment1.appendChild(ipt);
            //fragment1.appendChild(btn);
            fragment1.appendChild(btn1);
            recordUnit.appendChild(fragment1);
            recordUnit.setAttribute("data-order", self.order);
            self.recordContainer.appendChild(recordUnit);
            self.recordUnit = recordUnit;
            self.input = ipt;
            // self._computeCoordinate();
            $(ipt).focus(function () {
                $(self.rectUnit).addClass('sel');
            }).blur(function () {
                $(self.rectUnit).removeClass('sel');
            });

            $(btn1).on('click', function (e) {
                self.delete();
            });

            $(ipt).focus();

            $.event.trigger("newRectInit", self.order);
        },

        _refreshParam: function (width, height, scale, location) {
            var self = this;
            self.initWidth = width;
            self.initHeight = height;
            self.scale = scale;
            self.location = location;
            // self.angle = angle;
        },

        _justifyCoordinate: function () {
            var self = this;
            // var width = self.containerSize.width;
            // var height = self.containerSize.height;
            // var scale2, scale3, scale4, scale;
            // scale2 = _getResizeScale(self.coordinate.pt1.x, self.coordinate.pt1.y, self.coordinate.pt2.x, self.coordinate.pt2.y, width, height);
            // scale3 = _getResizeScale(self.coordinate.pt1.x, self.coordinate.pt1.y, self.coordinate.pt3.x, self.coordinate.pt3.y, width, height);
            // scale4 = _getResizeScale(self.coordinate.pt1.x, self.coordinate.pt1.y, self.coordinate.pt4.x, self.coordinate.pt4.y, width, height);
            // scale = Math.min(scale2, scale3, scale4);
            self.scale *= 1.0;
            $(self.rectUnit).css("transform", "rotate(" + 0 + "deg) scale(" + self.scale + ")");
            self._refreshParam(self.initWidth, self.initHeight, self.scale, self.location);
        },

        _getLocation: function(){
        	var self = this;
        	return self.location;
        },

        delete: function () {
            var self = this;
        	$.event.trigger("delRectMove", self.order);
            $(self.rectUnit).remove();
            $(self.recordUnit).remove();
            delete _bindRectMove[self.order];
            delete self;
            return;
        },

        focus: function () {
            var self = this;
            $(self.input).focus();
            $.event.trigger("logRectOrder", self.order);
        },

        upmove: function (dh) {
            //dh表示高度方向的偏移量,dh>0表示向上移
            var self = this;
            // var param = _getParam(self.rectUnit);
            // var theta = parseFloat(param.rotate.slice(0, -3)) / 180 * Math.PI;
            // var dleft = dh * Math.sin(theta);
            // var dtop = -dh * Math.cos(theta);
            var dleft = 0;
            var dtop = -dh;
            self.initHeight = parseFloat(self.initHeight) + dh;
            self.location.left += dleft;
            self.location.top += dtop;
            $(self.rectUnit).css("height", self.initHeight + "px");
            $(self.rectUnit).css("left", self.location.left + "px");
            $(self.rectUnit).css("top", self.location.top + "px");
        },
        downmove: function (dh) {
            //dh表示高度方向的偏移量,dh>0表示向上移
            var self = this;
            self.initHeight = parseFloat(self.initHeight) - dh;
            $(self.rectUnit).css("height", self.initHeight + "px");

        },
        rightmove: function (dw) {
            //dw表示宽度方向的偏移量，dw>0表示右移
            var self = this;
            self.initWidth = parseFloat(self.initWidth) + dw;
            $(self.rectUnit).css("width", self.initWidth + "px");
        },
        leftmove: function(dw){
            //dw表示宽度方向的偏移量，dw>0表示右移
            var self = this;
            var param = _getParam(self.rectUnit);
            // var theta = parseFloat(param.rotate.slice(0, -3)) / 180 * Math.PI;
            // var dtop = dw * Math.sin(theta);
            // var dleft = dw * Math.cos(theta);
            var dtop = 0;
            var dleft = dw;
            self.initWidth = parseFloat(self.initWidth) - dw;
            self.location.left += dleft;
            self.location.top += dtop;
            $(self.rectUnit).css("width", self.initWidth + "px");
            $(self.rectUnit).css("left", self.location.left + "px");
            $(self.rectUnit).css("top", self.location.top + "px");
        }
    }

    lib.rectmove = RectMove;
    lib.bindevent = BindEvent;
    lib.bindViewEvent = BindViewEvent;
    lib.bindrect = _bindRectMove;
    lib.updateRectParam = UpdateRectParam;

})(window, document, window['lib'] || (window['lib'] = {}));