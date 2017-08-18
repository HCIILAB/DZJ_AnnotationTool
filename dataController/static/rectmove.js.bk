; (function (win, doc, lib) {
    /**
     * @namespace lib
     */

    function isPlainObject(obj) {
        return obj != null && typeof obj == 'object' && Object.getPrototypeOf(obj) == Object.prototype;
    }
    var ua = navigator.userAgent;
    var isFirefox = !!ua.match(/Firefox/i);
    var isIEMobile = !!ua.match(/IEMpbile/i);
    var cssPrefix = isFirefox ? '-moz-' : isIEMobile ? '-ms' : '-webkit-';
    var stylePrefix = isFirefox ? 'Moz' : isIEMobile ? 'ms' : 'webkit';

    var _bindRectMove = {}; /*保存rectmove变量*/

    /*计算原始rect的宽，高，缩放比例和旋转角度*/
    function _getParam(elem) {
        var str = $(elem).css("transform").slice(7);
        var a = str.split(', ')[0];
        var b = str.split(', ')[1];
        var left = $(elem).css("left").slice(0, -2);
        var top = $(elem).css("top").slice(0, -2);
        return {
            scale: Math.sqrt(a * a + b * b).toFixed(2),
            rotate: (Math.atan(b / a) / Math.PI * 180).toFixed(2) + "deg",
            width: $(elem).css("width"),
            height: $(elem).css("height"),
            left: left,
            top: top
        }
    }

    /*计算调整后的各参数
     * @param x1,y1表示第一个点的坐标，x2,y2表示移动的点的坐标，type表示移动点的类型, elem表示对应的矩形
     * type=1-5是x1,y1表示第一点的坐标，7则代表第四点的坐标
     */
    function _getChangeParam(x1, y1, x2, y2, type, elem) {
        var self = this;
        var param = _getParam(elem);
        var width = param.width.slice(0, -2);
        var height = param.height.slice(0, -2);
        var dist = Math.sqrt((x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1));
        var theta = parseFloat(param.rotate.slice(0, -3)) / 180 * Math.PI;

        switch (type) {
            case "2":
                var rotate = Math.atan((y2 - y1) / (x2 - x1)) / Math.PI * 180;
                return {
                    width: dist / param.scale,
                    height: param.height,
                    rotate: rotate,
                    scale: param.scale,
                    left: param.left,
                    top: param.top
                };
                break;
            case "3":
                var oriDist = Math.sqrt(width * width + height * height);
                var scale = dist / oriDist;
                var oriDeg = Math.atan2(height, width);
                var Deg = Math.atan((y2 - y1) / (x2 - x1));
                var rotate = (Deg - oriDeg) / Math.PI * 180;
                return {
                    width: width,
                    height: height,
                    scale: scale.toFixed(2),
                    rotate: rotate.toFixed(2),
                    left: param.left,
                    top: param.top
                };
                break;
            case "4":
                var rotate = -Math.atan((x2 - x1) / (y2 - y1)) / Math.PI * 180;
                return {
                    height: dist / param.scale,
                    width: param.width,
                    scale: param.scale,
                    rotate: rotate.toFixed(2),
                    left: param.left,
                    top: param.top
                }
                break;
            case "5":
                  //left,top和height改变
                var dx = x2 - x1;
                var dy = y2 - y1;
                if (dx < 0) return {
                    height: parseFloat(param.height) + dh,
                    width: param.width,
                    scale: param.scale,
                    rotate: theta * 180 / Math.PI.toFixed(2),
                    dh: 0
                };

                var ty = dx * Math.tan(theta);
                var dh = (ty - dy) * Math.cos(theta);
                return {
                    height: parseFloat(param.height) + dh,
                    width: param.width,
                    scale: param.scale,
                    rotate: theta * 180 / Math.PI.toFixed(2),
                    dh: dh
                };
                break;
            case "6":
                //width改变
                var dx = x2 - x1;
                var dy = y2 - y1;
                //if(dy < 0) return {
                //    height: parseFloat(param.height),
                //    width: param.width,
                //    scale: param.scale,
                //    rotate: theta * 180 / Math.PI.toFixed(2),
                //    dw: 0
                //};
                //console.log(dx, dy, dw);
                //var dw = (dx + dy * Math.tan(theta)) * Math.cos(theta);
                var dw = dy * Math.sin(theta) + dx * Math.cos(theta) - parseInt(param.width);
                return {
                    height: param.height,
                    width: parseFloat(param.width) + dw,
                    scale: param.scale,
                    rotate: theta * 180 / Math.PI.toFixed(2),
                    dw: dw
                }
                break;
            case "7":
                //height改变
                var dx = x2 - x1;
                var dy = y2 - y1;
                if (dx < 0) return {
                    height: parseFloat(param.height),
                    width: param.width,
                    scale: param.scale,
                    rotate: theta * 180 / Math.PI.toFixed(2),
                    dh: 0
                };

                var ty = dx * Math.tan(theta);
                var dh = (ty - dy) * Math.cos(theta);
                return {
                    height: parseFloat(param.height) - dh,
                    width: param.width,
                    scale: param.scale,
                    rotate: theta * 180 / Math.PI.toFixed(2),
                    dh: dh
                };
                break;
            case "8":
                  //left,top和width改变
                var dx = x2 - x1;
                var dy = y2 - y1;
                if(dy < 0) return {
                    height: parseFloat(param.height),
                    width: param.width,
                    scale: param.scale,
                    rotate: theta * 180 / Math.PI.toFixed(2),
                    dw: 0
                };
                var dw = dy * Math.sin(theta) + dx * Math.cos(theta);
                return {
                    height: param.height,
                    width: parseFloat(param.width) - dw,
                    scale: param.scale,
                    rotate: theta * 180 / Math.PI.toFixed(2),
                    dw: dw
                }
        }
    }

    function _getResizeScale(x1, y1, x2, y2, width, height) {
        var scale;
        var state;
        tmpy1 = -y1;
        tmpy2 = -y2;
        tmpheight = -height;
        if (x1 == 0) x1 = 0.0001;
        if (x1 == width) x1 = x1 - 0.0001;
        var k1 = tmpy1 / x1;
        var k2 = (0 - tmpy1) / (width - x1);
        var k3 = (tmpheight - tmpy1) / (width - x1);
        var k4 = (tmpheight - tmpy1) / (0 - x1);
        if (x2 >= 0 && x2 <= width && y2 >= 0 && y2 <= height) return 1;
        if (x2 == x1 && y2 < 0) {
            return (y1 - y2) / y1;
        } else if (x2 == x1 && y2 > height) {
            return (y2 - y1) / (height - y1);
        }
        var k = (tmpy2 - tmpy1) / (x2 - x1);
        if (x2 > x1) {
            // if(k == 0) return (x2 - x1) / (width - x1);
            if (k < k3) { state = 2; }
            else if (k < k2) { state = 1; }
            else state = 0;
        } else {
            if (k < k1) { state = 0; }
            else if (k < k4) { state = 3; }
            else { state = 2; }
        }
        switch (state) {
            case 0:
                scale = y1 / (y1 - y2);
                break;
            case 1:
                scale = (width - x1) / (x2 - x1);
                break;
            case 2:
                scale = (height - y1) / (y2 - y1);
                break;
            case 3:
                scale = x1 / (x1 - x2);
                break;
            default:
                return 1;
                break;
        }
        /*小数两位向上取整*/
        // scale = parseFloat(scale.toFixed(1)) + 0.1;
        return scale;

    }
    /*矩形事件绑定*/
    function BindEvent(element, recordElement) {
        if (element.nodeType != document.ELEMENT_NODE && typeof element == 'string') {
            element = document.querySelector(element);
        }
        var flag = -1;
        var winFlag = -1;
        var clickFlag = -1;
        var idx = "-1";
        var currentElem = null;
        var currentParent = null;
        var containerSize;
        var loc;
        var rect = {
            left: 0,
            top: 0,
            w: 0,
            h: 0,
            locx: 0,
            locy: 0
        };


        var rectElem = document.createElement('div');
        rectElem.setAttribute("class", "drawRect");
        var order;
        $(element).mousedown(function (event) {
            currentElem = event.target;
            order = currentElem.getAttribute("data-order");
            containerSize = element.getBoundingClientRect();
            clickFlag = 0;
            if (!currentElem.classList.contains("point") && !currentElem.classList.contains("borderpoint")) {
                flag = 0;
                winFlag = 0;
                idx = "-1";
                var oriLoc = element.getBoundingClientRect();
                rect.locx = event.clientX;
                rect.locy = event.clientY;
                rect.left = rect.locx - oriLoc.left;
                rect.top = rect.locy - oriLoc.top;
                rect.w = 0;
                rect.h = 0;
                $(rectElem).css("left", rect.left + "px");
                $(rectElem).css("top", rect.top + "px");
                $(rectElem).css("width", 0);
                $(rectElem).css("height", 0);
                element.appendChild(rectElem);
            }
            else {
                flag = 1;
                winFlag = 1;
                idx = currentElem.getAttribute("data-idx");
                currentParent = currentElem.offsetParent;
                loc = currentParent.querySelector(".pt1").getBoundingClientRect();
            };
        }).mousemove(function (event) {
            event.stopPropagation();
            if (clickFlag == 0 || clickFlag == 1) {
                clickFlag = 1;
            }
            if (flag == -1) return;
            if (flag == 0) {
                /*初始化矩形阶段*/
                rect.w = event.clientX - rect.locx;
                rect.h = event.clientY - rect.locy;
                if (rect.w > 10 && rect.h > 10) {
                    $(rectElem).addClass("show");
                    $(rectElem).css("width", rect.w + "px");
                    $(rectElem).css("height", rect.h + "px");
                }
            } else if (flag == 1) {
                // var x = event.clientX;
                // var y = event.clientY;
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
                var rm = _bindRectMove[parseInt(currentParent.getAttribute("data-order"))];
                var tk;
                switch (idx) {
                    case "2":
                        var change = _getChangeParam(loc.left, loc.top, x, y, idx, currentParent);
                        $(currentParent).css("width", change.width + "px");
                        $(currentParent).css("transform", "rotate(" + change.rotate + "deg) scale(" + change.scale + ")");
                        rm._refreshParam(change.width, change.height, change.scale, change.rotate);
                        break;
                    case "3":
                        var change = _getChangeParam(loc.left, loc.top, x, y, idx, currentParent);
                        $(currentParent).css("transform", "rotate(" + change.rotate + "deg) scale(" + change.scale + ")");
                        rm._refreshParam(change.width, change.height, change.scale, change.rotate);
                        break;
                    case "4":
                        var change = _getChangeParam(loc.left, loc.top, x, y, idx, currentParent);
                        $(currentParent).css("height", change.height + "px");
                        $(currentParent).css("transform", "rotate(" + change.rotate + "deg) scale(" + change.scale + ")");
                        rm._refreshParam(change.width, change.height, change.scale, change.rotate);
                        break;
                    case "5":
                        loc = currentParent.querySelector(".pt1").getBoundingClientRect();
                        var change = _getChangeParam(loc.left, loc.top, x, y, idx, currentParent);
                        rm.upmove(change.dh);
                        rm._refreshParam(change.width, change.height, change.scale, change.rotate);
                        break;
                    case "6":
                        loc = currentParent.querySelector(".pt1").getBoundingClientRect();
                        var change = _getChangeParam(loc.left, loc.top, x, y, idx, currentParent);
                        rm.rightmove(change.dw);
                        rm._refreshParam(change.width, change.height, change.scale, change.rotate);
                    case "7":
                        loc = currentParent.querySelector(".pt4").getBoundingClientRect();
                        var change = _getChangeParam(loc.left, loc.top, x, y, idx, currentParent);
                        rm.downmove(change.dh);
                        rm._refreshParam(change.width, change.height, change.scale, change.rotate);
                        break;
                    case "8":
                        loc = currentParent.querySelector(".pt1").getBoundingClientRect();
                        var change = _getChangeParam(loc.left, loc.top, x, y, idx, currentParent);
                        rm.leftmove(change.dw);
                        rm._refreshParam(change.width, change.height, change.scale, change.rotate);
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
                _bindRectMove[order].focus();
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
                rm._computeCoordinate();
                rm._justifyCoordinate();
                rm._computeCoordinate();
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
                    case "2":
                        $(currentParent).css("width", change.width + "px");
                        $(currentParent).css("transform", "rotate(" + change.rotate + "deg) scale(" + change.scale + ")");
                        rm._refreshParam(change.width, change.height, change.scale, change.rotate);
                        break;
                    case "3":
                        // currentParent.style = "transform: rotate("+change.rotate+"deg) scale(" + change.scale + ")";
                        $(currentParent).css("transform", "rotate(" + change.rotate + "deg) scale(" + change.scale + ")");
                        rm._refreshParam(change.width, change.height, change.scale, change.rotate);
                        break;
                    case "4":
                        $(currentParent).css("height", change.height + "px");
                        $(currentParent).css("transform", "rotate(" + change.rotate + "deg) scale(" + change.scale + ")");
                        rm._refreshParam(change.width, change.height, change.scale, change.rotate);
                        break;
                    case "5":
                        loc = currentParent.querySelector(".pt1").getBoundingClientRect();
                        var change = _getChangeParam(loc.left, loc.top, x, y, idx, currentParent);
                        rm.upmove(change.dh);
                        rm._refreshParam(change.width, change.height, change.scale, change.rotate);
                        break;
                    case "6":
                        loc = currentParent.querySelector(".pt2").getBoundingClientRect();
                        var change = _getChangeParam(loc.left, loc.top, x, y, idx, currentParent);
                        rm.rightmove(change.dw);
                        rm._refreshParam(change.width, change.height, change.scale, change.rotate);
                    case "7":
                        loc = currentParent.querySelector(".pt4").getBoundingClientRect();
                        var change = _getChangeParam(loc.left, loc.top, x, y, idx, currentParent);
                        rm.downmove(change.dh);
                        rm._refreshParam(change.width, change.height, change.scale, change.rotate);
                        break;
                    case "8":
                        loc = currentParent.querySelector(".pt1").getBoundingClientRect();
                        var change = _getChangeParam(loc.left, loc.top, x, y, idx, currentParent);
                        rm.leftmove(change.dw);
                        rm._refreshParam(change.width, change.height, change.scale, change.rotate);
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
                rm._computeCoordinate();
                rm._justifyCoordinate();
                rm._computeCoordinate();
                return;
            }
        });
    }


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
        self.angle = options.angle || "0deg";
        self.textMessage = options.textMessage || "";
        self.coordinate = {
            pt1: { x: 0, y: 0 },
            pt2: { x: 0, y: 0 },
            pt3: { x: 0, y: 0 },
            pt4: { x: 0, y: 0 },
        };
        self.order = 0;
        self.containerSize = element.getBoundingClientRect();
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
            elementStyle[stylePrefix + 'Transform'] = 'translateZ(0)'; // XXX: 解决闪动问题
            elementStyle['transform'] = 'translateZ(0)';

            //如果initWidth/initHeight = 0 则不操作
            if (self.initWidth == 0 || self.initHeight == 0) return;
            if ($(".rectUnit").length == 0) {
                self.order = 0;
            } else {
                self.order = parseInt($(".rectUnit").last()[0].getAttribute("data-order")) + 1;
            }
            var fragment = document.createDocumentFragment();
            var rectUnit = document.createElement("div");
            rectUnit.setAttribute("class", "rectUnit");
            rectUnit.setAttribute('data-order', self.order);
            var styleText = "width:" + self.initWidth + "px;height:" + self.initHeight + "px;left:" + self.location.left + "px;top:" + self.location.top + "px;transform:rotate(" + self.angle + ")";
            rectUnit.setAttribute("style", styleText);
            for (var i = 1; i < 5; i++) {
                var elem = document.createElement("div");
                var borElem = document.createElement("div");
                elem.setAttribute("class", "pt" + i + " point");
                elem.innerHTML = i;
                elem.setAttribute("data-idx", i);
                borElem.setAttribute("class", "bdpt" + i + " borderpoint");
                borElem.setAttribute("data-idx", i + 4);
                rectUnit.appendChild(elem);
                rectUnit.appendChild(borElem);
            }
            fragment.appendChild(rectUnit);
            element.appendChild(fragment);
            self.rectUnit = rectUnit;
            _bindRectMove[self.order] = self;

            var recordUnit = document.createElement('div');
            var fragment1 = document.createDocumentFragment();
            recordUnit.setAttribute('class', 'rectItem');
            for (var i = 0; i < 4; i++) {
                var span = document.createElement('span');
                span.setAttribute('class', 'coorPoint');
                fragment1.appendChild(span);
            }
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
            self.recordContainer.appendChild(recordUnit);
            self.recordUnit = recordUnit;
            self.input = ipt;
            self._computeCoordinate();
            $(ipt).focus(function () {
                $(self.rectUnit).find('.point').addClass('sel');
            }).blur(function () {
                $(self.rectUnit).find('.point').removeClass('sel');
            });

            $(btn1).on('click', function (e) {
                self.delete();
            });

            $(ipt).focus();
        },

        _computeCoordinate: function () {
            var self = this;
            var pt1 = self.rectUnit.querySelector(".pt1").getBoundingClientRect();
            var pt2 = self.rectUnit.querySelector(".pt2").getBoundingClientRect();
            var pt3 = self.rectUnit.querySelector(".pt3").getBoundingClientRect();
            var pt4 = self.rectUnit.querySelector(".pt4").getBoundingClientRect();
            var oriLoc = self.element.getBoundingClientRect();
            self.coordinate.pt1.x = pt1.left - oriLoc.left + pt1.width / 2 - self.scale; //取圆心的位置，并要减去border的宽度（原始为1，需要乘以scale数）
            self.coordinate.pt1.y = pt1.top - oriLoc.top + pt1.height / 2 - self.scale;
            self.coordinate.pt2.x = pt2.left - oriLoc.left + pt2.width / 2 - self.scale;
            self.coordinate.pt2.y = pt2.top - oriLoc.top + pt2.height / 2 - self.scale;
            self.coordinate.pt3.x = pt3.left - oriLoc.left + pt3.width / 2 - self.scale;
            self.coordinate.pt3.y = pt3.top - oriLoc.top + pt3.height / 2 - self.scale;
            self.coordinate.pt4.x = pt4.left - oriLoc.left + pt4.width / 2 - self.scale;
            self.coordinate.pt4.y = pt4.top - oriLoc.top + pt4.height / 2 - self.scale;
            self._refreshData();
        },

        _refreshParam: function (width, height, scale, angle) {
            var self = this;
            self.initWidth = width;
            self.initHeight = height;
            self.scale = scale;
            self.angle = angle;
        },

        _refreshData: function () {
            var self = this;
            var coorArray = $(self.recordUnit).find(".coorPoint");
            for (var i = 0; i < 4; i++) {
                coorArray[i].innerHTML = '(' + self.coordinate['pt' + parseInt(i + 1)].x.toFixed(1) + ',' + self.coordinate['pt' + parseInt(i + 1)].y.toFixed(1) + ')';
            }
        },

        _justifyCoordinate: function () {
            var self = this;
            var width = self.containerSize.width;
            var height = self.containerSize.height;
            var scale2, scale3, scale4, scale;
            scale2 = _getResizeScale(self.coordinate.pt1.x, self.coordinate.pt1.y, self.coordinate.pt2.x, self.coordinate.pt2.y, width, height);
            scale3 = _getResizeScale(self.coordinate.pt1.x, self.coordinate.pt1.y, self.coordinate.pt3.x, self.coordinate.pt3.y, width, height);
            scale4 = _getResizeScale(self.coordinate.pt1.x, self.coordinate.pt1.y, self.coordinate.pt4.x, self.coordinate.pt4.y, width, height);
            scale = Math.min(scale2, scale3, scale4);
            self.scale *= scale;
            $(self.rectUnit).css("transform", "rotate(" + self.angle + "deg) scale(" + self.scale + ")");
            self._refreshParam(self.initWidth, self.initHeight, self.scale, self.rotate);
        },

        delete: function () {
            var self = this;
            $(self.rectUnit).remove();
            $(self.recordUnit).remove();
            delete _bindRectMove[self.order];
            delete self;
            return;
        },

        focus: function () {
            var self = this;
            $(self.input).focus();
        },

        upmove: function (dh) {
            //dh表示高度方向的偏移量,dh>0表示向上移
            var self = this;
            var param = _getParam(self.rectUnit);
            var theta = parseFloat(param.rotate.slice(0, -3)) / 180 * Math.PI;
            var dleft = dh * Math.sin(theta);
            var dtop = -dh * Math.cos(theta);
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
            //dh表示高度方向的偏移量,dh>0表示向上移
            var self = this;
            var param = _getParam(self.rectUnit);
            var theta = parseFloat(param.rotate.slice(0, -3)) / 180 * Math.PI;
            var dtop = dw * Math.sin(theta);
            var dleft = dw * Math.cos(theta);
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
    lib.bindrect = _bindRectMove;

})(window, document, window['lib'] || (window['lib'] = {}));
