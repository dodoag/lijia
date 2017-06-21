/*! perfect-scrollbar - v0.4.10
 * http://noraesae.github.com/perfect-scrollbar/
 * Copyright (c) 2014 Hyeonje Alex Jun; Licensed MIT */
(function(e) { "use strict"; "function" == typeof define && define.amd ? define(["jquery"], e) : "object" == typeof exports ? e(require("jquery")) : e(jQuery) })(function(e) { "use strict";
    var t = { wheelSpeed: 10, wheelPropagation: !1, minScrollbarLength: null, useBothWheelAxes: !1, useKeyboard: !0, suppressScrollX: !1, suppressScrollY: !1, scrollXMarginOffset: 0, scrollYMarginOffset: 0, includePadding: !1 },
        o = function() {
            var e = 0;
            return function() {
                var t = e;
                return e += 1, ".perfect-scrollbar-" + t } }();
    e.fn.perfectScrollbar = function(n, r) {
        return this.each(function() {
            var l = e.extend(!0, {}, t),
                s = e(this);
            if ("object" == typeof n ? e.extend(!0, l, n) : r = n, "update" === r) return s.data("perfect-scrollbar-update") && s.data("perfect-scrollbar-update")(), s;
            if ("destroy" === r) return s.data("perfect-scrollbar-destroy") && s.data("perfect-scrollbar-destroy")(), s;
            if (s.data("perfect-scrollbar")) return s.data("perfect-scrollbar");
            s.addClass("ps-container");
            var a, i, c, u, d, p, f, h, v, g, b = e("<div class='ps-scrollbar-x-rail'></div>").appendTo(s),
                m = e("<div class='ps-scrollbar-y-rail'></div>").appendTo(s),
                w = e("<div class='ps-scrollbar-x'></div>").appendTo(b),
                T = e("<div class='ps-scrollbar-y'></div>").appendTo(m),
                L = parseInt(b.css("bottom"), 10),
                y = L === L,
                S = y ? null : parseInt(b.css("top"), 10),
                I = parseInt(m.css("right"), 10),
                x = I === I,
                M = x ? null : parseInt(m.css("left"), 10),
                P = "rtl" === s.css("direction"),
                X = o(),
                D = function(e, t) {
                    var o = e + t,
                        n = u - v;
                    g = 0 > o ? 0 : o > n ? n : o;
                    var r = parseInt(g * (p - u) / (u - v), 10);
                    s.scrollTop(r), y ? b.css({ bottom: L - r }) : b.css({ top: S + r }) },
                Y = function(e, t) {
                    var o = e + t,
                        n = c - f;
                    h = 0 > o ? 0 : o > n ? n : o;
                    var r = parseInt(h * (d - c) / (c - f), 10);
                    s.scrollLeft(r), x ? m.css({ right: I - r }) : m.css({ left: M + r }) },
                k = function(e) {
                    return l.minScrollbarLength && (e = Math.max(e, l.minScrollbarLength)), e },
                C = function() {
                    var e = { width: c, display: a ? "inherit" : "none" };
                    e.left = P ? s.scrollLeft() + c - d : s.scrollLeft(), y ? e.bottom = L - s.scrollTop() : e.top = S + s.scrollTop(), b.css(e);
                    var t = { top: s.scrollTop(), height: u, display: i ? "inherit" : "none" };
                    x ? t.right = P ? d - s.scrollLeft() - I - T.outerWidth() : I - s.scrollLeft() : t.left = P ? s.scrollLeft() + 2 * c - d - M - T.outerWidth() : M + s.scrollLeft(), m.css(t), w.css({ left: h, width: f }), T.css({ top: g, height: v }) },
                j = function() { c = l.includePadding ? s.innerWidth() : s.width(), u = l.includePadding ? s.innerHeight() : s.height(), d = s.prop("scrollWidth"), p = s.prop("scrollHeight"), !l.suppressScrollX && d > c + l.scrollXMarginOffset ? (a = !0, f = k(parseInt(c * c / d, 10)), h = parseInt(s.scrollLeft() * (c - f) / (d - c), 10)) : (a = !1, f = 0, h = 0, s.scrollLeft(0)), !l.suppressScrollY && p > u + l.scrollYMarginOffset ? (i = !0, v = k(parseInt(u * u / p, 10)), g = parseInt(s.scrollTop() * (u - v) / (p - u), 10)) : (i = !1, v = 0, g = 0, s.scrollTop(0)), g >= u - v && (g = u - v), h >= c - f && (h = c - f), C() },
                O = function() {
                    var t, o;
                    w.bind("mousedown" + X, function(e) { o = e.pageX, t = w.position().left, b.addClass("in-scrolling"), e.stopPropagation(), e.preventDefault() }), e(document).bind("mousemove" + X, function(e) { b.hasClass("in-scrolling") && (Y(t, e.pageX - o), e.stopPropagation(), e.preventDefault()) }), e(document).bind("mouseup" + X, function() { b.hasClass("in-scrolling") && b.removeClass("in-scrolling") }), t = o = null },
                W = function() {
                    var t, o;
                    T.bind("mousedown" + X, function(e) { o = e.pageY, t = T.position().top, m.addClass("in-scrolling"), e.stopPropagation(), e.preventDefault() }), e(document).bind("mousemove" + X, function(e) { m.hasClass("in-scrolling") && (D(t, e.pageY - o), e.stopPropagation(), e.preventDefault()) }), e(document).bind("mouseup" + X, function() { m.hasClass("in-scrolling") && m.removeClass("in-scrolling") }), t = o = null },
                E = function(e, t) {
                    var o = s.scrollTop();
                    if (0 === e) {
                        if (!i) return !1;
                        if (0 === o && t > 0 || o >= p - u && 0 > t) return !l.wheelPropagation }
                    var n = s.scrollLeft();
                    if (0 === t) {
                        if (!a) return !1;
                        if (0 === n && 0 > e || n >= d - c && e > 0) return !l.wheelPropagation }
                    return !0 },
                H = function() { l.wheelSpeed /= 10;
                    var e = !1;
                    s.bind("mousewheel" + X, function(t, o, n, r) {
                        var c = t.deltaX * t.deltaFactor || n,
                            u = t.deltaY * t.deltaFactor || r;
                        e = !1, l.useBothWheelAxes ? i && !a ? (u ? s.scrollTop(s.scrollTop() - u * l.wheelSpeed) : s.scrollTop(s.scrollTop() + c * l.wheelSpeed), e = !0) : a && !i && (c ? s.scrollLeft(s.scrollLeft() + c * l.wheelSpeed) : s.scrollLeft(s.scrollLeft() - u * l.wheelSpeed), e = !0) : (s.scrollTop(s.scrollTop() - u * l.wheelSpeed), s.scrollLeft(s.scrollLeft() + c * l.wheelSpeed)), j(), e = e || E(c, u), e && (t.stopPropagation(), t.preventDefault()) }), s.bind("MozMousePixelScroll" + X, function(t) { e && t.preventDefault() }) },
                A = function() {
                    var t = !1;
                    s.bind("mouseenter" + X, function() { t = !0 }), s.bind("mouseleave" + X, function() { t = !1 });
                    var o = !1;
                    e(document).bind("keydown" + X, function(n) {
                        if (t && !e(document.activeElement).is(":input,[contenteditable]")) {
                            var r = 0,
                                l = 0;
                            switch (n.which) {
                                case 37:
                                    r = -30;
                                    break;
                                case 38:
                                    l = 30;
                                    break;
                                case 39:
                                    r = 30;
                                    break;
                                case 40:
                                    l = -30;
                                    break;
                                case 33:
                                    l = 90;
                                    break;
                                case 32:
                                case 34:
                                    l = -90;
                                    break;
                                case 35:
                                    l = -u;
                                    break;
                                case 36:
                                    l = u;
                                    break;
                                default:
                                    return }
                            s.scrollTop(s.scrollTop() - l), s.scrollLeft(s.scrollLeft() + r), o = E(r, l), o && n.preventDefault() } }) },
                q = function() {
                    var e = function(e) { e.stopPropagation() };
                    T.bind("click" + X, e), m.bind("click" + X, function(e) {
                        var t = parseInt(v / 2, 10),
                            o = e.pageY - m.offset().top - t,
                            n = u - v,
                            r = o / n;
                        0 > r ? r = 0 : r > 1 && (r = 1), s.scrollTop((p - u) * r) }), w.bind("click" + X, e), b.bind("click" + X, function(e) {
                        var t = parseInt(f / 2, 10),
                            o = e.pageX - b.offset().left - t,
                            n = c - f,
                            r = o / n;
                        0 > r ? r = 0 : r > 1 && (r = 1), s.scrollLeft((d - c) * r) }) },
                F = function() {
                    var t = function(e, t) { s.scrollTop(s.scrollTop() - t), s.scrollLeft(s.scrollLeft() - e), j() },
                        o = {},
                        n = 0,
                        r = {},
                        l = null,
                        a = !1;
                    e(window).bind("touchstart" + X, function() { a = !0 }), e(window).bind("touchend" + X, function() { a = !1 }), s.bind("touchstart" + X, function(e) {
                        var t = e.originalEvent.targetTouches[0];
                        o.pageX = t.pageX, o.pageY = t.pageY, n = (new Date).getTime(), null !== l && clearInterval(l), e.stopPropagation() }), s.bind("touchmove" + X, function(e) {
                        if (!a && 1 === e.originalEvent.targetTouches.length) {
                            var l = e.originalEvent.targetTouches[0],
                                s = {};
                            s.pageX = l.pageX, s.pageY = l.pageY;
                            var i = s.pageX - o.pageX,
                                c = s.pageY - o.pageY;
                            t(i, c), o = s;
                            var u = (new Date).getTime(),
                                d = u - n;
                            d > 0 && (r.x = i / d, r.y = c / d, n = u), e.preventDefault() } }), s.bind("touchend" + X, function() { clearInterval(l), l = setInterval(function() {
                            return .01 > Math.abs(r.x) && .01 > Math.abs(r.y) ? (clearInterval(l), void 0) : (t(30 * r.x, 30 * r.y), r.x *= .8, r.y *= .8, void 0) }, 10) }) },
                z = function() { s.bind("scroll" + X, function() { j() }) },
                B = function() { s.unbind(X), e(window).unbind(X), e(document).unbind(X), s.data("perfect-scrollbar", null), s.data("perfect-scrollbar-update", null), s.data("perfect-scrollbar-destroy", null), w.remove(), T.remove(), b.remove(), m.remove(), b = m = w = T = a = i = c = u = d = p = f = h = L = y = S = v = g = I = x = M = P = X = null },
                K = function(t) { s.addClass("ie").addClass("ie" + t);
                    var o = function() {
                            var t = function() { e(this).addClass("hover") },
                                o = function() { e(this).removeClass("hover") };
                            s.bind("mouseenter" + X, t).bind("mouseleave" + X, o), b.bind("mouseenter" + X, t).bind("mouseleave" + X, o), m.bind("mouseenter" + X, t).bind("mouseleave" + X, o), w.bind("mouseenter" + X, t).bind("mouseleave" + X, o), T.bind("mouseenter" + X, t).bind("mouseleave" + X, o) },
                        n = function() { C = function() {
                                var e = { left: h + s.scrollLeft(), width: f };
                                y ? e.bottom = L : e.top = S, w.css(e);
                                var t = { top: g + s.scrollTop(), height: v };
                                x ? t.right = I : t.left = M, T.css(t), w.hide().show(), T.hide().show() } };
                    6 === t && (o(), n()) },
                Q = "ontouchstart" in window || window.DocumentTouch && document instanceof window.DocumentTouch,
                N = function() {
                    var e = navigator.userAgent.toLowerCase().match(/(msie) ([\w.]+)/);
                    e && "msie" === e[1] && K(parseInt(e[2], 10)), j(), z(), O(), W(), q(), Q && F(), s.mousewheel && H(), l.useKeyboard && A(), s.data("perfect-scrollbar", s), s.data("perfect-scrollbar-update", j), s.data("perfect-scrollbar-destroy", B) };
            return N(), s }) } }),
function(e) { "function" == typeof define && define.amd ? define(["jquery"], e) : "object" == typeof exports ? module.exports = e : e(jQuery) }(function(e) {
    function t(t) {
        var s = t || window.event,
            a = i.call(arguments, 1),
            c = 0,
            u = 0,
            d = 0,
            p = 0;
        if (t = e.event.fix(s), t.type = "mousewheel", "detail" in s && (d = -1 * s.detail), "wheelDelta" in s && (d = s.wheelDelta), "wheelDeltaY" in s && (d = s.wheelDeltaY), "wheelDeltaX" in s && (u = -1 * s.wheelDeltaX), "axis" in s && s.axis === s.HORIZONTAL_AXIS && (u = -1 * d, d = 0), c = 0 === d ? u : d, "deltaY" in s && (d = -1 * s.deltaY, c = d), "deltaX" in s && (u = s.deltaX, 0 === d && (c = -1 * u)), 0 !== d || 0 !== u) {
            if (1 === s.deltaMode) {
                var f = e.data(this, "mousewheel-line-height");
                c *= f, d *= f, u *= f } else if (2 === s.deltaMode) {
                var h = e.data(this, "mousewheel-page-height");
                c *= h, d *= h, u *= h }
            return p = Math.max(Math.abs(d), Math.abs(u)), (!l || l > p) && (l = p, n(s, p) && (l /= 40)), n(s, p) && (c /= 40, u /= 40, d /= 40), c = Math[c >= 1 ? "floor" : "ceil"](c / l), u = Math[u >= 1 ? "floor" : "ceil"](u / l), d = Math[d >= 1 ? "floor" : "ceil"](d / l), t.deltaX = u, t.deltaY = d, t.deltaFactor = l, t.deltaMode = 0, a.unshift(t, c, u, d), r && clearTimeout(r), r = setTimeout(o, 200), (e.event.dispatch || e.event.handle).apply(this, a) } }

    function o() { l = null }

    function n(e, t) {
        return u.settings.adjustOldDeltas && "mousewheel" === e.type && 0 === t % 120 }
    var r, l, s = ["wheel", "mousewheel", "DOMMouseScroll", "MozMousePixelScroll"],
        a = "onwheel" in document || document.documentMode >= 9 ? ["wheel"] : ["mousewheel", "DomMouseScroll", "MozMousePixelScroll"],
        i = Array.prototype.slice;
    if (e.event.fixHooks)
        for (var c = s.length; c;) e.event.fixHooks[s[--c]] = e.event.mouseHooks;
    var u = e.event.special.mousewheel = { version: "3.1.9", setup: function() {
            if (this.addEventListener)
                for (var o = a.length; o;) this.addEventListener(a[--o], t, !1);
            else this.onmousewheel = t;
            e.data(this, "mousewheel-line-height", u.getLineHeight(this)), e.data(this, "mousewheel-page-height", u.getPageHeight(this)) }, teardown: function() {
            if (this.removeEventListener)
                for (var e = a.length; e;) this.removeEventListener(a[--e], t, !1);
            else this.onmousewheel = null }, getLineHeight: function(t) {
            return parseInt(e(t)["offsetParent" in e.fn ? "offsetParent" : "parent"]().css("fontSize"), 10) }, getPageHeight: function(t) {
            return e(t).height() }, settings: { adjustOldDeltas: !0 } };
    e.fn.extend({ mousewheel: function(e) {
            return e ? this.bind("mousewheel", e) : this.trigger("mousewheel") }, unmousewheel: function(e) {
            return this.unbind("mousewheel", e) } }) });