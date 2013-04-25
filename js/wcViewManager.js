var wcViewManager = ['$http', '$templateCache', '$route', '$compile', '$controller', '$document', '$window', '$timeout', 'wcOptions', '$location', 'l',
               function($http,   $templateCache,   $route,   $compile, $controller, doc, win, wait, opts, loc, l) {
                   
    var touchMan = false;
                   
    var Screens = {
        
        stack:      [],
        history:    [],
        
        add:    function(name,el) {
            Screens.stack.push(el);
            Screens.history.push(name);
        },
        
        destroyLastScope:   function() {
            if (Screens.lastScope) {
                Screens.lastScope.$destroy();
                Screens.lastScope = null;
            }
        },
        
        clearContent:   function() {
            if(!Screens.stack.length)   return false;
            Screens.stack[Screens.stack.length-1].html('');
            Screens.destroyLastScope();
        },
        
        update: function() {
            
            var locals = $route.current && $route.current.locals,
                template = locals && locals.$template, name='', 
                ok = template && Screens.lastName!=loc.url();
            
			if(ok)
				Screens.lastName = name = loc.url();
            
            if (ok && Screens.history.indexOf(name)==-1) {
            
                var newScreen = doc[0].createElement('div');
                newScreen.className = 'wcScreen';
                var element = angular.element(newScreen);
                
                Screens.parentElement.append(element);
                
                if(touchMan)  touchMan.destroy();
                touchMan = new TouchHandler(element);
                
                element.html(template); 
                Screens.destroyLastScope();
                
                var link = $compile(element.contents()),
                current = $route.current,
                controller;
                
                Screens.lastScope = current.scope = Screens.scope.$new();
                Screens.lastScope.$screens = Screens.stack.length;
                if (current.controller) {
                    locals.$scope = Screens.lastScope;
                    controller = $controller(current.controller, locals);
                    element.contents().data('$ngControllerController', controller);
                }
                
                link(Screens.lastScope);
                touchMan.init();
                Screens.lastScope.$emit('$viewContentLoaded');
                Screens.lastScope.$eval(Screens.onloadExp);
                
                wait(function() {
                    element.addClass('inView'); 
                }, 10);
                
                element[0].id = 'wcScreen'+(Screens.stack.length+1);
                
                Screens.add(name,element);
            
            } else if(ok) {
                
                var lastScreen = Screens.stack.pop(),
                    lastRoute = Screens.history.pop();
                
                lastScreen.remove();
                if(touchMan)  touchMan.destroy();
                
                touchMan = new TouchHandler(Screens.stack[Screens.stack.length-1]);
                touchMan.init();
                
            } /*else
                Screens.clearContent();*/
            
            /*if(ok)  l.log('Stack', Screens.history);
            else    l.log('Skipped', Screens.history);*/
        }
        
    };
                   
    var TouchHandler = function(el) {
        this.defaults();
        this.screen = el;
    };
                   
    TouchHandler.prototype.defaults = function() {
        var th = this;
        th.isOpen= false;
        th.start=  {};
        th.end=    {};
        th.lastPos=1000;
        th.diff=   0;
        th.down=   0;
        th.up=     0;
        th.screen= false;
        th.screenW=0;
        th.waiting=false;
        th.focused=false;
        th.anchor= 70;
        th.menuW=  350;
        th.threshold= 20;
        th.peakGap = 52;
        th.touchTime= 200; // milli
        th.phases= {
            'focus':    'mousedown',
            'unfocus':  'mouseup',
            'follow':   'mousemove'
        };
        th.listeners=[];
    };
                   
    TouchHandler.prototype.init = function() {
        var that = this;
        if(opts && opts.containerId) {
            var container = doc[0].getElementById(opts.containerId);
            if(container)   this.screen = angular.element(container);
        }
        
        win.onresize = function() {
            that.checkScreen.apply(that, arguments);
        };
        
        win.onresize();
        
        this.screen.bind("touchstart", this.touchHandler, true);
        this.screen.bind("touchmove", this.touchHandler, true);
        this.screen.bind("touchend", this.touchHandler, true);
        
        var btn = this.screen[0].getElementsByClassName('webCascadesTouch'),
            img = this.screen[0].getElementsByClassName('webCascadesBtn');
        
        this.anchorBtn = angular.element(img);
        this.anchorTouch = angular.element(btn);
        this.listen('focus', this.anchorTouch);
    };
                   
    TouchHandler.prototype.checkScreen = function() {
        this.screenW = win.innerWidth;
        for(i=0; i<Screens.stack.length; i++)
            Screens.stack[i].css('width', this.screenW+'px');

        return win.innerWidth;
    };
                   
    TouchHandler.prototype.touchHandler = function(ev) {
        var touch = ev.changedTouches[0],
            type = "";
        
        switch(ev.type)
        {
            case "touchstart": type="mousedown"; break;
            case "touchmove":  type="mousemove"; break;        
            case "touchend":   type="mouseup"; break;
            default: return;
        }
    
        var simulatedEvent = document.createEvent("MouseEvent");
        simulatedEvent.initMouseEvent(type, true, true, window, 1, 
                                  touch.screenX, touch.screenY, 
                                  touch.clientX, touch.clientY, false, 
                                  false, false, false, 0/*left*/, null);
    
        touch.target.dispatchEvent(simulatedEvent);
        if(ev.target.nodeName!="A")
            ev.preventDefault();
    };
                   
    TouchHandler.prototype.listen = function(phase,el) {
        var that = this;
        if(!this[phase])  l.log('No phase '+ phase);
        if(this.listeners.indexOf(this.phases[phase])!=-1) return false;
        if(el) {
            el.bind(this.phases[phase], function() {
                that[phase].apply(that, arguments);
            });
        }
        
        this.listeners.push(this.phases[phase]);
    };
                   
    TouchHandler.prototype.overlay = function(x) {
        var that = this;
        if(this.isBack) return false;
        if(typeof x !== 'number') {
            x = this.screenW - (this.lastPos || 0);
        }
        if(x>(this.screenW/2)) {
            if(!this.overlayDiv) {
                this.overlayDiv = doc[0].createElement('div');
                this.overlayDiv.id = 'webCascadesOverlay';
                this.screen[0].appendChild(this.overlayDiv);
            }
            //var opacity = ((x-this.screenW/2) / this.screenW/2)/0.9;
            var opacity = 0.5;
            var oel = angular.element(this.overlayDiv);
            wait(function() {
                oel.css('opacity', opacity);
            }, 10);
            oel.bind('mousedown', function() {
                that.close(true);
            });
        } else {
            var oel = angular.element(this.overlayDiv);
            oel.unbind('mousedown');
            oel.remove();
            this.overlayDiv = false;
        }
    };
                   
    TouchHandler.prototype.setFocused = function(is) {
        this.anchorBtn.removeClass('cascading');
        if(is) {
            this.focused = true;
            this.anchorBtn.addClass('pressed');
            this.anchorBtn.addClass('focused');
        } else {
            this.focused = false;
            this.anchorBtn.removeClass('pressed');
        }
    };
        
    TouchHandler.prototype.focus = function(start) {
        var that = this;
        this.setFocused(true);
        this.start = start;
        this.down = Date.now();
        this.isBack = this.anchorTouch.hasClass('webCascadesBackBar');
        this.waiting = wait(function() {
            that.screen.addClass('animating');
            that.listen('follow', that.anchorTouch);
        }, 150);
        this.listen('unfocus', that.anchorTouch);        
    };

    TouchHandler.prototype.follow = function(end) {
        if(!this.focused) return false;
        if(this.isBack && !this.isCascading) {
            for(i=Screens.stack.length-1; i>=0; i--)
                Screens.stack[i].css('left', (i>0 ? this.screenW+10 : this.peakGap)+'px');
            var hubBtn = Screens.stack[0][0].getElementsByClassName('webCascadesBtn');
            if(hubBtn.length)   angular.element(hubBtn[0]).addClass('cascading');
        }
        this.end = end;
        this.diff = this.end.x-this.start.x;
        if(this.diff<0)   this.diff = this.end.x - (this.anchor/2);
        this.lastPos = this.diff;
        if(this.diff<0)   this.diff = 0;
        if(this.diff>(this.screenW-this.anchor))
            this.diff = this.screenW-this.anchor;
        this.screen.css('left', this.diff+"px");
        //this.overlay(this.diff);
    };
                   
    TouchHandler.prototype.unfocus = function() {
        this.setFocused(false);
        this.up = Date.now();
        var time = this.up-this.down;
        this.lastPos = parseInt(this.screen.css('left'));
        this.screen.removeClass('animating');
        if(time<this.touchTime) {
            if(this.lastPos>0)   this.close(true);
            else        this.open(true);
        }
        else {
            if(this.lastPos>this.threshold)  {
                if(this.lastPos < this.start.x)
                    this.close(false);
                else
                    this.open(false);
            }
            else        this.close(false);
        }
        if(this.waiting) wait.cancel(this.waiting);
    };
        
    TouchHandler.prototype.open = function(click) {
        if(this.isBack) {
            // back in history
            this.screen.css('left', (this.screenW+10)+'px');
            this.screen.bind('webkitTransitionEnd', function(ev) {
                if(Screens.stack.length<=1) {
					window.location = window.location.protocol + '//' + window.location.host;
                }
                wait(function() {
                    loc.path(Screens.history[Screens.history.length-2]);
                },10);
            });
            return true;
        }
        if(this.screenW<(this.menuW+this.anchor))
            this.screen.css('left', (this.screenW-this.anchor)+'px');
        else
            this.screen.css('left', this.menuW+'px');
        this.isOpen = true;
        this.overlay(this.screenW);
    };
    
    TouchHandler.prototype.close = function(click) {
        this.screen.css('left', 0);
        this.anchorBtn.removeClass('focused');
        this.isOpen = false;
        this.overlay(0);
    };
                   
    TouchHandler.prototype.destroy = function() {
        var touches = ['touchstart','touchmove','touchend'];
        for(touch in touches) {
            this.screen.unbind(touches[touch]);
        }
        
        for(listener in this.listeners) {
            this.anchorTouch.unbind(this.listeners[listener]);
        }
    };

  return {
    restrict: 'A',
    terminal: true,
    link: function(scope, parentElement, attr) {
        Screens.onloadExp = attr.onload || '';
        Screens.scope = scope;
        Screens.parentElement = parentElement;
        Screens.attr = attr;
        scope.$on('$routeChangeSuccess', Screens.update);
    }
  };
}];
