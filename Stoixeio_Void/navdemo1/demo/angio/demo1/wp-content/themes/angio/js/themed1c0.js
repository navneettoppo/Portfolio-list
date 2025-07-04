var theme = (function($) {

    "use strict";

    let globals = {
        isMobile: false,
        lightMode: false,
        isEditor: false,
        isElementorOnLoad: false,
        path: themeVars.path,
        scenes: []
    };

    /* Run scripts
     -------------------------------- */

    // If document is ready VJS
    document.addEventListener("DOMContentLoaded", function() {
        theme.init();
    });

    // Elementor
    if ($('body').hasClass('elementor-page')) {
        globals.isElementorOnLoad = true;
    }

    return {

       globals : globals,

        /* Init
         -------------------------------- */
        init: function() {
            this.tools.init();
            this.menu.init();
            this.layerMenu.init();

            // FX
            this.fx.init();
            this.cursor.init();
            this.magnet.init('.magneto,.header__logo a');
            this.smoothScroll.init();

            this.prototypes();
            this.events.init();

            // Small Helpers
            this.helpers.scrollTop();
            this.helpers.sidebar();

            // Plugins
            this.plugins.disqus();

            // AX Loader
            this.AXloader.init();

        },

        reload: function() {

        	if (globals.isElementorOnLoad == true) {
                $('.elementor-element').each(function() {
                    elementorFrontend.elementsHandler.runReadyTrigger($(this));
                });
            }
            
            // FX
            this.fx.init();
            this.cursor.update('#ajax-content a[href], #ajax-content .fx-cursor, #ajax-content input[type="submit"]');
            this.magnet.update('.magneto,input[type="submit"]');
            this.smoothScroll.update();

            this.helpers.sidebar();

            this.plugins.disqus();
        },

        visible: function() {
            // Add to body visible class
            document.body.classList.add('is-visible');

            // Update events when page is visible
            this.events.update();

        },

        /* ==================================================
          Tools
        ================================================== */

        tools: {

            init: function() {
                let tools = theme.tools;
                tools.checkMobile();
                tools.checkIE();
                tools.checkCssMixBlend();

                window.addEventListener('resize', tools.appHeight);
				tools.appHeight();

                // Elementor preview
                if (document.location.href.indexOf("elementor-preview") != -1) {
                    theme.globals.isEditor = true;
                }
            },

            appHeight: () => {

            	document.querySelector(':root').style.setProperty('--vh', window.innerHeight/100 + 'px');

            },
            checkMobile: function() {
                if (navigator.userAgent.match(/Android/i) || navigator.userAgent.match(/webOS/i) || navigator.userAgent.match(/iPhone/i) || navigator.userAgent.match(/iPad/i) || navigator.userAgent.match(/iPod/i) || navigator.userAgent.match(/BlackBerry/i) || navigator.userAgent.match(/Windows Phone/i)) {
                    document.querySelector('html').classList.add('is-mobile');
                    theme.globals.isMobile = true;
                } else {
                    document.querySelector('html').classList.add('no-mobile');
                }
                if (('ontouchstart'in window) || (navigator.MaxTouchPoints > 0) || (navigator.msMaxTouchPoints > 0)) {
                    document.querySelector('html').classList.add('is-touch');
                    theme.globals.isMobile = true;
                } else {
                    document.querySelector('html').classList.add('no-touch');
                }

            },
            checkIE: function() {
                if (/MSIE 10/i.test(navigator.userAgent) || /MSIE 9/i.test(navigator.userAgent)) {
                    // This is internet explorer 10
                    document.querySelector('html').classList.add('is-ie', 'ie-old');
                    theme.globals.lightMode = true;
                }
                if (/rv:11.0/i.test(navigator.userAgent)) {
                    // This is internet explorer 9 or 11
                    document.querySelector('html').classList.add('is-ie', 'ie-11');
                    theme.globals.lightMode = true;
                }
                if (/Edge\/\d./i.test(navigator.userAgent)) {
                    // This is Microsoft Edge
                    document.querySelector('html').classList.add('is-ie', 'ie-edge');
                    theme.globals.lightMode = true;
                }
            },

            checkCssMixBlend: function() {
                if (typeof window.getComputedStyle(document.body).mixBlendMode === 'undefined') {
                    document.querySelector('html').classList.add("mix-blend-mode-no");
                }
            }

        },

        /* ==================================================
          Theme FX
        ================================================== */
        fx: {

            plane: null,
            planes: null,

            init: function() {

                // Kill listeners
                theme.fx.kill();

                // Toolkit FXs
                if (typeof themeToolkit !== "undefined") {
                    themeToolkit.parallaxSlider.init();

                    // Light mode
                    if (theme.globals.lightMode === false) {

                        // Run effects
                        themeToolkit.glitchGL.init();
                        themeToolkit.glitchSlider.init();
                        themeToolkit.magicWave.init();
                    }

                }
                // Text FXs
                theme.fx.charFX();
                theme.fx.wordFX();

                // ScrollMagic
                if (document.body.classList.contains('is-scroll-animations')) {
                	theme.fx.scrollMagic();
            	}

                // Perspective FX
                if (document.querySelector('.fx-perspective .fx-perspective__image')) {
                    theme.fx.plane = document.querySelector('.fx-perspective .fx-perspective__image');
                    addEventListener('mousemove', theme.fx.perspective, false);
                }

                // Smooth Move FX
                if (document.querySelector('.fx-smooth-move-layer')) {

                    theme.fx.planes = document.querySelectorAll('.fx-smooth-move-layer');

                    for (let plane of theme.fx.planes) {
                        plane.moveX = 40;
                        plane.moveY = 40;
                        if (plane.getAttribute('data-move-x')) {
                            plane.moveX = parseFloat(plane.getAttribute('data-move-x'));
                        }
                        if (plane.getAttribute('data-move-y')) {
                            plane.moveY = parseFloat(plane.getAttribute('data-move-y'));
                        }

                    }

                    addEventListener('mousemove', theme.fx.smoothMove, false);
                }

                // Button style 2
                let links = document.querySelectorAll('.randomtype');
                theme.fx.randomType.init(links);

                // Add link 2 effect
                let linksStyle3 = document.querySelectorAll('.js-create-b-style-3 a:not(.done)');

                if (linksStyle3.length) {
                    for (let link of linksStyle3) {
                        if (link !== null) {
                            link.classList.add('b-style-3', 'done');
                            let title = link.innerHTML;
                            link.innerHTML = '<span class="g" data-g="' + title + '">' + title + '</span>';
                        }
                    }
                }

            },

            // Random Type FX
            randomType: {

                running: false,
                links: null,
                buttonRandomTimeout: null,
                letters: 'azertyuiopqsdfghjklmwxcvbn,;:=ù`^^@&é"(§è!çà)-"<?.//+',

                init: function(links) {
                    let that = theme.fx.randomType;

                    // Don't bind events on mobiles
                    if ( theme.globals.isMobile ) {
                    	return
                    };

                    // Destroy old events
                    if (that.running) {
                        that.kill();
                    }

                    // Are there any links?
                    if (links.length) {
                        that.links = links;
                        for (let link of that.links) {

                            link.addEventListener('mouseenter', that.enter);
                            link.addEventListener('mouseleave', that.leave);
                        }
                        that.running = true;
                    } else {
                        that.running = false;
                    }
                },
                // Mouse Enter
                enter: function() {
                	let el = this;
                	let textEl = this.querySelector('.randomtype__text');
                	if ( textEl ) {
                		el = textEl;
                	}
                    theme.fx.randomType.add(el);
                },
                // Mouse Leave
                leave: function() {
                	let el = this;
                	let textEl = this.querySelector('.randomtype__text');
                	if ( textEl ) {
                		el = textEl;
                	}
                    theme.fx.randomType.clear(el);
                },

                // Add FX To Button
                add: function(el) {
                    let that = theme.fx.randomType;
                    let initText = el.innerText;

                    if (!el.initText) {
                        el.initText = initText;
                    }

                    el.currentLetter = 1;
                    el.stopNow = false;
                    el.classList.add('done');
                    that.randomize(el);
                    setTimeout(function() {
                        el.stopNow = true;
                    }, 500);

                },

                randomize: function(el) {

                    let that = theme.fx.randomType;
                    if (el.stopNow) {
                        let newValue = el.initText.substring(0, el.currentLetter);
                        el.currentLetter++;
                        if (el.currentLetter === el.initText.length) {
                            that.clear(el);
                        } else {
                            for (let i = el.currentLetter; i < el.initText.length; i++) {
                                newValue += that.letters.charAt(Math.floor(Math.random() * that.letters.length));
                            }
                            el.innerText = newValue;
                            el.buttonRandomTimeout = setTimeout(function() {
                                that.randomize(el)
                            }, 40)
                        }
                    } else {
                        let newValue = '';
                        for (let i = 0; i < el.initText.length; i++) {
                            newValue += that.letters.charAt(Math.floor(Math.random() * that.letters.length));
                        }
                        el.innerText = newValue;
                        el.buttonRandomTimeout = setTimeout(function() {
                            that.randomize(el)
                        }, 40)
                    }
                },

                // Clear Text
                clear: function(el) {
                    let that = theme.fx.randomType;
                    el.currentLetter = 0;
                    el.thisHasToStop = false;
                    clearTimeout(el.buttonRandomTimeout);
                    el.innerText = el.initText;

                },

                kill: function() {
                    let that = theme.fx.randomType;
                    for (let link of that.links) {
                        link.removeEventListener('mouseenter', that.enter);
                        link.removeEventListener('mouseleave', that.leave);
                    }

                }

            },

            // Autotype
            autoType: function(el) {
            	if ( el.classList.contains('autotype-started') ) {
            		return;
            	}
                let text = el.textContent;
                let elHeight = el.getBoundingClientRect();
                elHeight = elHeight.height;
                el.style.height = elHeight +"px";
                text = text.replace('&nbsp;', ' ');
                el.textContent = '';
                el.classList.add('autotype-started');
                let i = 0;
                let consoleTyper = setInterval(function() {
                    if (i !== text.length - 1) {
                        i += 1;
                        el.textContent = text.substr(0, i);
                    } else {
                        el.textContent = text;
                        el.classList.add('done');
                        clearInterval(consoleTyper);
                        el.style.height = 'auto';
                    }
                }, 60);
            },

            charFX: function() {

                // Text Fx
                let textFX = document.querySelectorAll('.fx-text');

                if (textFX.length) {
                    for (let t of textFX) {
                        if (t.classList.contains('ready') === false) {
                            t.classList.add('ready');
                            let html = t.innerHTML;
                            html = html.replace("<br />", "~");
                            html = html.replace("<br>", "~");
                            html = html.replace(/&gt;/g, '>');
                            let l = html.split("");
                            let newContent = '';
                            for (let d = 0; d < l.length; d++) {
                                if (l[d] === " ") {
                                    newContent += " ";
                                } else {
                                    if (l[d] === "~") {
                                        newContent += "<br />";
                                    } else {
                                        newContent += '<p><span class="trans-10" style="-webkit-transition-delay: ' + (d / 32) + "s; transition-delay: " + (d / 32) + 's;-webkit-animation-delay: ' + (d / 32) + "s; animation-delay: " + (d / 32) + 's;">' + l[d] + "</span></p>";
                                    }
                                }
                            }

                            t.innerHTML = newContent;

                        }

                    }

                }

            },

            wordFX: function() {

                // Text Fx
                let textFX = document.querySelectorAll('.fx-text-word');

                if (textFX.length) {

                    for (let t of textFX) {

                        if (t.classList.contains('ready') === false) {

                            t.classList.add('ready');
                            let html = t.innerHTML;
                            let w = html.split(" ");
                            let newContent = '';

                            for (let c = 0; c < w.length; c++) {
                                if (w[c] === " ") {
                                    newContent += " ";
                                } else {
                                    if (w[c] === "<br>" || w[c] === "<br />") {
                                        newContent += "<br />";
                                    } else {
                                        newContent += '<p><span class="trans-15" style="-webkit-transition-delay: ' + (c / 14) + "s; transition-delay: " + (c / 14) + 's;-webkit-animation-delay: ' + (c / 14) + "s; animation-delay: " + (c / 14) + 's;">' + w[c] + "</span></p>";
                                    }
                                }
                            }

                            t.innerHTML = newContent;
                        }

                    }

                }

            },

            // Parallax Scroll
            scrollMagic: function(y) {
                // Light mode
                if (theme.globals.lightMode) {
                    return;
                }
                let scrollElems = document.querySelectorAll('.fx-parallax-scroll');

                if (scrollElems.length) {

                    let controller = new ScrollMagic.Controller();
                    let duration = '100%';
                    let triggerHook = 0;
                    let action = null;
                    let speed = 1;
                    let offset = -150;
                    let animObj = {};
                    let nr = 0;

                    for (let el of scrollElems) {
                        nr++;
                        animObj = {
                            yPercent: 15,
                            opacity: 0,
                            ease: Linear.easeNone
                        };
                        if (el.getAttribute('data-duration')) {
                            duration = el.getAttribute('data-duration');
                        }
                        if (el.getAttribute('data-offset')) {
                            offset = el.getAttribute('data-offset');
                        }
                        if (el.getAttribute('data-trigger-hook')) {
                            triggerHook = el.getAttribute('data-trigger-hook');
                        }

                        if (el.getAttribute('data-anim-obj')) {
                            let parsedObj = JSON.parse(el.getAttribute('data-anim-obj'));

                            if (parsedObj) {
                                animObj = parsedObj;
                                speed = parseFloat(parsedObj.duration);
                            }
                        }

                        action = gsap.to(el, speed, animObj);

                        theme.globals.scenes['fxParallax' + nr] = new ScrollMagic.Scene({
                            triggerElement: el,
                            offset: offset,
                            duration: duration,
                            triggerHook: triggerHook
                        }).setTween(action).addTo(controller);

                    }

                }

            },

            perspective: function(e) {
                var decimalX = e.clientX / window.innerWidth - 0.5;
                var decimalY = e.clientY / window.innerHeight - 0.5;
                gsap.to(theme.fx.plane, 1, {
                    rotationY: 10 * decimalX,
                    rotationX: 10 * decimalY,
                    ease: Quad.easeOut,
                    transformPerspective: 900,
                    transformOrigin: "center"
                });
                gsap.to(theme.fx.plane, 1, {
                    y: 40 * decimalY,
                    x: 40 * decimalX,
                    ease: 'power3.out'
                });
            },

            smoothMove: function(e) {
                var decimalX = e.clientX / window.innerWidth - 0.5;
                var decimalY = e.clientY / window.innerHeight - 0.5;

                for (let plane of theme.fx.planes) {
                    gsap.to(plane, 1, {
                        y: plane.moveY * decimalY,
                        x: plane.moveX * decimalX,
                        ease: 'power3.out'
                    });
                }

            },

            kill: function() {
                theme.fx.planes = null;
                removeEventListener('mousemove', theme.fx.perspective, false);
                removeEventListener('mousemove', theme.fx.smoothMove, false);

            }

        },

        /* ==================================================
          AXloader
        ================================================== */
        AXloader: {

            init: function() {
                if (themeVars.ajaxed === '0') {
                    theme.visible();
                    return;
                }
                let reloadContainers = theme.AXloader.ajaxSplit(themeVars.reloadContainers);
                let blacklistLinks = theme.AXloader.ajaxSplit(themeVars.blacklistLinks);
                let blacklistSelectors = theme.AXloader.ajaxSplit(themeVars.blacklistSelectors);
                let reloadScripts = theme.AXloader.ajaxSplit(themeVars.reloadScripts);
                let permalinks = (themeVars.permalinks === 1) ? true : false;
                AXloader.init({
					baseUrl           : themeVars.baseUrl,
					dir               : themeVars.dir,
					reloadContainers  : reloadContainers,
					permalinks        : permalinks,
					blacklistSelectors: blacklistSelectors,
					blacklistLinks    : blacklistLinks,
					reloadScripts     : reloadScripts,
					jsFragments       : ['var wpcf7', '{"@context"', 'window.lodash ='],
					searchForms       : '#searchform',
					startDelay        : 1200,
					callbacksWait     : true,
					nav               : '.js-desktop-menu',
					headerContainer   : '#header',
					progress          : theme.AXloader.loadProgress,
					start             : theme.AXloader.loadStart,
					startJS           : theme.AXloader.startJS,
					end               : theme.AXloader.loadEnd,
					redirect          : theme.AXloader.redirectStart,
					scroll            : theme.AXloader.scroll,

                });

            },

            ajaxSplit: function(a) {
                if (a === '') {
                    return [];
                } else {
                    return a.split(',');
                }
            },

            loadProgress: function() {
                let progress = Math.floor(this);
                let bar = document.querySelector('.loader__progress');
                let bytesContainer = document.querySelector('.loader__bytes');
                let rand = Math.floor(1000 + Math.random() * 9000);
                if (bytesContainer) {
                    if (progress === 100) {
                        rand = '0000';
                    }
                    bytesContainer.textContent = progress + '.' + rand;
                }
                if (bar) {
                    bar.style.width = progress + '%';
                }
            },

            scroll: function(data) {
                let pos = 0;
                if (data.el !== 0) {
                    pos = data.el.getBoundingClientRect().top + window.scrollY - data.offset
                }

                if (isNaN(pos) === false) {
                    if (theme.smoothScroll.scrollbar) {
                        let s = theme.smoothScroll.scrollbar;
                        s.scrollTo(0, pos, 0);
                    } else {
                        theme.helpers.scrollToPos(pos, 'y', 0, 0);
                    }
                }
            },
            loadStart: function(callback) {
                let html = document.querySelector('html');
                let ax = theme.AXloader;
                let delay = 0;
                let enableLoader = true;
                let loaderDelay = 0;

                // FX Holder
                let holder = document.querySelector('#fx-load-holder');

                // Add body classes
                html.classList.add('ax--loading');

                // Remove Cursor classes
                if (document.body.classList.contains("is-cursor-effects")) {
                    theme.cursor.clear();

                }

                // If layer menu is open set delay at 1s
                if (document.body.classList.contains('menu-open')) {
                    delay = 1;
                }
                theme.layerMenu.closeMenuLayer();

                // First load
                if (this.firstLoad) {
                    html.classList.add('ax--firstload');
                    ax.loadStartCommon(()=>{
                        callback();
                    }
                    , 0);

                    // Loader is disabled
                } else if (enableLoader === false) {

                    ax.loadStartCommon(()=>{
                        callback();
                    }
                    , delay);

                    // Ajax loader is enabled
                } else {

                    // If are any FXs
                    let trigger = null;
                    if (theme.globals.lightMode === false && this.trigger !== null && this.trigger !== false && this.trigger.classList.contains('fx-load')) {
                        trigger = this.trigger;

                        // Full screen image
                        let img = trigger.parentNode.querySelector('.fx-load-img');

                        if (trigger.getAttribute('data-img-id')) {
                            let imgID = trigger.getAttribute('data-img-id');
                            if (document.getElementById(imgID)) {
                                img = document.getElementById(imgID)
                            }

                        }

                        // Clear
                        holder.removeAttribute('style');

                        if (img) {

                            // FX Load
                            //
                            // Full Size image effect
                            if (trigger.classList.contains('fx-load-fz')) {
                                // Disable loader because window is filled with an image
                                enableLoader = false;

                                let imgRect = img.getBoundingClientRect();
                                let src = img.src;

                                // Add new
                                gsap.set(holder, {
                                    visibility: 'visible',
                                    top: imgRect.y + 'px',
                                    left: imgRect.x + 'px',
                                    width: imgRect.width + 'px',
                                    height: imgRect.height + 'px',
                                    backgroundImage: "url('" + src + "')"
                                });

                                gsap.to(holder, {
                                    duration: 0.5,
                                    top: 0,
                                    left: 0,
                                    width: '100vw',
                                    height: '100vh',
                                    ease: 'power3.out'
                                });
                                if (trigger.classList.contains('fx-load-scroll-after')) {
                                    holder.classList.add('fx-load-scroll-after');
                                }

                                holder.classList.add('fx-load-ready');

                            }

                            // Fit image size effect
                            if (trigger.classList.contains('fx-load-fi')) {

                                let triggerRect = trigger.getBoundingClientRect();
                                let src = img.src;
                                let viewportHeight = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight;
                                let viewportWidth = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
                                let elementTop = 0;
                                let direction = 'y';

                                //
                                // Special scripts for beats
                                //
                                let modID = trigger.getAttribute('data-mod-id');
                                let mod = document.getElementById(modID);

                                // Delay for whole aniamtion
                                delay = 1.6;
                                if (mod) {
                                    loaderDelay = 1600;
                                    modID = '#' + modID;
                                    let scrollTo = 0;
                                    let img = document.querySelector(modID + ' .gthumb__img');

                                    if (document.querySelector('.fs-scroll--h')) {
                                        elementTop = theme.events.scrollPos.x + triggerRect.x;
                                        scrollTo = elementTop - ((viewportWidth - triggerRect.width) / 2);
                                        direction = 'x';
                                    } else {
                                        elementTop = theme.events.scrollPos.y + triggerRect.y;
                                        scrollTo = elementTop - ((viewportHeight - triggerRect.height) / 2);
                                    }

                                    theme.helpers.scrollToPos(scrollTo, direction, 1, 0, function() {


                                        if (document.querySelector('.fs-scroll--h')) {
                                            gsap.to(img, {
                                                duration: 0.3,
                                                x: 0,
                                                ease: 'power3.out'
                                            });
                                        } else {
                                            gsap.to(img, {
                                                duration: 0.3,
                                                y: 0,
                                                ease: 'power3.out'
                                            });
                                        }

                                    });

                                }

                                setTimeout(()=>{

                                    // Gent new cordinates
                                    triggerRect = trigger.getBoundingClientRect();

                                    // Add new
                                    gsap.set(holder, {
                                        visibility: 'visible',
                                        top: triggerRect.y + 'px',
                                        left: triggerRect.x + 'px',
                                        width: triggerRect.width + 'px',
                                        height: triggerRect.height + 'px',
                                        backgroundImage: "url('" + src + "')"
                                    });

                                    let onCenter = {
                                        xPercent: -50,
                                        yPercent: -50,
                                        left: "50%",
                                        top: "50%",
                                    };
                                    gsap.to(holder, {
                                        duration: 0.5,
                                        xPercent: 0,
                                        yPercent: 0,
                                        top: triggerRect.y + 'px',
                                        left: triggerRect.x + 'px',
                                        width: triggerRect.width,
                                        height: triggerRect.height,
                                        ease: 'power3.out'
                                    });

                                    if (trigger.classList.contains('fx-load-scroll-after')) {
                                        holder.classList.add('fx-load-scroll-after');
                                    }

                                    holder.classList.add('fx-load-ready', 'fx-load-fi');

                                }
                                , loaderDelay);

                            }

                        }

                    }

                    setTimeout(()=>{
                        ax.showLoader(true);

                        ax.loadStartCommon(()=>{
                            callback();
                        }
                        , delay);

                    }
                    , loaderDelay);

                }

            },

            loadStartCommon: function(callback, timer=0) {

                // Sidebar
                const sidebar = document.querySelector('.is-sidebar-ready #sidebar');
                if (sidebar) {
                    document.body.classList.remove('is-sidebar-ready', 'is-sidebar-open');
                    setTimeout(()=>{
                        sidebar.parentNode.removeChild(sidebar)
                    }
                    , 400);
                }

                // Remove Menu hover clases
                const menu = document.querySelector('.js-desktop-menu');
                if (menu) {
                    menu.classList.remove('is-hover');
                }

                // Search field
                if (document.querySelector('#s')) {
                    document.querySelector('#s').value = '';
                }

                /* Fire Event */
                document.dispatchEvent(new CustomEvent('AXStart',{
                    'type': 'AX'
                }));

                // Timer in second
                timer = timer * 1000;
                setTimeout(()=>{
                    // Callback
                    if (callback && typeof (callback) === "function") {
                        callback();
                    }
                }
                , timer)
            },

            startJS: function() {

                /* Fire Event */
                document.dispatchEvent(new CustomEvent('AXStartJS',{
                    'type': 'AX'
                }));
            },

            loadEnd: function(callback) {
                let ax = theme.AXloader;
                let doVisible = true;
                let html = document.querySelector('html');
                // FX
                let holder = document.querySelector('#fx-load-holder');
                let fxDelay = 0;

                // App BG
                let app = document.querySelector('#app');
                let oldAppBg = app.style.backgroundImage;
                let bgContainer = document.querySelector('[data-app-bg]');
                let newAppBg = '';
                if (bgContainer) {
                    newAppBg = bgContainer.getAttribute('data-app-bg');
                }
                if ( oldAppBg !== newAppBg ) {
                    if ( newAppBg == '' ) {
                        app.classList.remove('is-bg');
                        app.style.backgroundImage = '';        
                    } else {
                        app.classList.add('is-bg');
                        app.style.backgroundImage = 'url("'+newAppBg+'")';
                    }
                   
                }

                // Loader
                let loaderHolder = document.querySelector('.loader');
      
                
                // Toggle fullscreen class
                if (document.body.classList.contains('is-fullscreen')) {
                    document.documentElement.classList.add('is-fullscreen');
                } else {
                    document.documentElement.classList.remove('is-fullscreen');
                }

                // First Load
                if (html.classList.contains('ax--firstload')) {
                    if (loaderHolder) {
                        setTimeout(e=>{
                            loaderHolder.classList.remove('glitch-appear');
                            loaderHolder.classList.add('glitch-disappear');

                            setTimeout(e=>{
                                if (doVisible === true) {
                                    theme.visible();
                                }

                                html.classList.remove('ax--firstload');
                                gsap.set('.loader', {
                                    display: 'none'
                                });

                                setTimeout(e=>{
                                    let header = document.getElementById('header');
                                    let footer = document.getElementById('footer');
                                    header.classList.add('glitch-appear');
                                    footer.classList.add('glitch-appear');
                                    setTimeout(e=>{
                                        header.classList.remove('glitch-appear');
                                        header.classList.add('done');

                                    }
                                    , 400);
                                }
                                , 500);

                            }
                            , 500);

                        }
                        , 500);

                    } else {
                    	html.classList.remove('ax--firstload');
                        theme.visible();
                    }

                } else {
                    /* Set Active Layer Menu */
                    theme.layerMenu.setCurrent(window.location.href);

                    /* Reload theme scripts */
                    theme.reload();
                    if ( loaderHolder === null ) {
                    	doVisible = false;
                	  	holder.removeAttribute('style');
                        holder.classList.remove('fx-load-ready');
                        // Scroll
                        if (holder.classList.contains('fx-load-scroll-after')) {
                            theme.helpers.scrollToPos(100, 'y', 1, 100);
                            holder.classList.remove('fx-load-scroll-after');
                        }
                        theme.visible();
                    }

                    // If are any FXs
                    if (theme.globals.lightMode === false) {
                        if (holder.classList.contains('fx-load-ready')) {

                            document.body.classList.add('is-fx-load');

                            if (holder.classList.contains('fx-load-fi')) {
                                let img = document.querySelector('.fx-load-fi-target');
                                if (img) {

                                    let imgRect = img.getBoundingClientRect();
                                    let src = img.src;

                                    gsap.to(holder, {
                                        duration: 0.8,
                                        xPercent: 0,
                                        left: imgRect.x + 'px',
                                        yPercent: 0,
                                        top: imgRect.y + 'px',
                                        x: 0,
                                        y: 0,
                                        width: imgRect.width,
                                        height: imgRect.height,
                                        ease: 'power2.out'
                                    });

                                    // Set delay to clear holder styles
                                    fxDelay = 600;
                                }

                            }

                        }
                    }

                    if (doVisible === true) {

                        // Remove Holder effects
                        setTimeout(()=>{

                            // hide Loader
                            gsap.to('.loader', {
                                opacity: 0,
                                duration: 0.5,
                                delay: 0,
                                ease: 'power3.out',
                                onComplete: function() {
                                    holder.removeAttribute('style');
                                    holder.classList.remove('fx-load-ready');
                                    // Scroll
                                    if (holder.classList.contains('fx-load-scroll-after')) {
                                        theme.helpers.scrollToPos(100, 'y', 1, 100);
                                        holder.classList.remove('fx-load-scroll-after');
                                    }
                                    gsap.set('.loader', {
                                        visibility: 'hidden'
                                    });
                                    theme.visible();
                                }
                            });

                        }
                        , fxDelay);

                    }

                }

                html.classList.remove('ax--loading');
                ax.showLoader(false);

                /* Fire Event */
                document.dispatchEvent(new CustomEvent('AXEnd',{
                    'type': 'AX'
                }));

                // Callback
                if (callback && typeof (callback) === "function") {
                    callback();
                }
            },

            redirectStart: function(url) {

                if (url !== false && url !== undefined) {
                    window.location.href = url;
                }

            },

            showLoader: function(show) {
                let pageTrans = document.querySelector('.page-trans');
                if (pageTrans) {

                    if (show) {
                        pageTrans.classList.add('glitch-appear');
                        pageTrans.classList.remove('disappear');
                    } else {
                        pageTrans.classList.remove('glitch-appear');
                        pageTrans.classList.add('disappear');
                    }

                }

            },

        },

        /* ==================================================
          Dropdown Navigation v.1.1
        ================================================== */
        menu: {
            init: function() {
                theme.menu.dropdown();
            },

            dropdown: function() {
                const m = theme.menu;
                const ul = document.querySelectorAll('.js-desktop-menu ul li');
                for (let li of ul) {
                    li.data = {};
                    li.addEventListener('mouseenter', m.showChildren);
                    li.addEventListener('mouseleave', m.hideChildren);
                    if ( theme.globals.isMobile ) {
                    	li.addEventListener('click', m.hideChildren);
            		}
                }

            },
            showChildren: function(e) {
                let li = this;
                let ul = li.querySelector('ul');
                const menu = document.querySelector('.js-desktop-menu');
                menu.classList.add('is-hover');

                if (ul) {
                    li.classList.add('active');
                    ul.style.display = 'block';
                    gsap.killTweensOf( ul );
                    gsap.to(ul, {
                        opacity: 1,
                        x: 0,
                        duration: 0.3,
                        ease: 'power1.out'
                    });

                    let rect = ul.getBoundingClientRect();
                    let posLeft = rect.left;
                    let width = rect.width;
                    let windowWidth = window.innerWidth;
                    let isEntirelyVisible = (posLeft + width <= windowWidth);

                    if (li.classList.contains('super-menu') === false) {
                        if (!isEntirelyVisible) {
                            ul.classList.add('edge');
                        } else {
                            ul.classList.remove('edge');
                        }
                    }
                }
            },
            hideChildren: function(e) {
                const menu = document.querySelector('.js-desktop-menu');
                menu.classList.remove('is-hover');
                let li = this;
                let ul = li.querySelector('ul');
                if (ul) {
                    gsap.to(ul, {
                        opacity: 0,
                        x: 0,
                        duration: 0.3,
                        ease: 'power1.out',
                        onComplete: function() {
                            li.classList.remove('active');
                            ul.classList.remove('show-list');
                            ul.classList.remove('edge');
                            ul.style.display = "none";
                        }
                    });
                }

            },

        },

        /* ==================================================
          Navigation
        ================================================== */
        layerMenu: {

            data: {
                status: 'closed',
                menuAnim: null,
                menuStack: ['open-menu-main']

            },
            init: function() {

                // Init button aniamtion
                theme.layerMenu.data.menuAnim = gsap.timeline({
                    repeat: 0,
                    repeatDelay: 0,
                    delay: 0.4,
                    paused: true
                });

                theme.layerMenu.data.menuAnim.to('.menu-button .dot-row._1 .dot._2 span', 0.4, {
                    opacity: '0',
                    ease: Power2.easeOut
                }, 0);
                theme.layerMenu.data.menuAnim.to('.menu-button .dot-row._2 .dot._1 span', 0.4, {
                    opacity: '0',
                    ease: Power2.easeOut
                }, 0);
                theme.layerMenu.data.menuAnim.to('.menu-button .dot-row._2 .dot._3 span', 0.4, {
                    opacity: '0',
                    ease: Power2.easeOut
                }, 0);
                theme.layerMenu.data.menuAnim.to('.menu-button .dot-row._3 .dot._2 span', 0.4, {
                    opacity: '0',
                    ease: Power2.easeOut
                }, 0);
                theme.layerMenu.data.menuAnim.to('.menu-button .dots-wrap', 0.4, {
                    rotate: '-90',
                    ease: Power2.easeOut
                }, 0.4);
                theme.layerMenu.data.menuAnim.to('.menu-button .dot-row._1 .dot._1', 0.4, {
                    rotate: '-45',
                    ease: Power2.easeOut
                }, 0.4);
                theme.layerMenu.data.menuAnim.to('.menu-button .dot-row._3 .dot._1', 0.4, {
                    rotate: '45',
                    ease: Power2.easeOut
                }, 0.4);
                theme.layerMenu.data.menuAnim.to('.menu-button .dot-row._1 .dot._3', 0.4, {
                    rotate: '45',
                    ease: Power2.easeOut
                }, 0.4);
                theme.layerMenu.data.menuAnim.to('.menu-button .dot-row._3 .dot._3', 0.4, {
                    rotate: '-45',
                    ease: Power2.easeOut
                }, 0.4);
                theme.layerMenu.data.menuAnim.to('.menu-button .dot-row._1 .dot._1 span', 0.4, {
                    scaleX: 1,
                    scaleY: 2.5,
                    transformOrigin: "50% 0",
                    ease: Power2.easeOut
                }, 0.8);
                theme.layerMenu.data.menuAnim.to('.menu-button .dot-row._1 .dot._3 span', 0.4, {
                    scaleX: 1,
                    scaleY: 2.5,
                    transformOrigin: "50% 0",
                    ease: Power2.easeOut
                }, 0.8);
                theme.layerMenu.data.menuAnim.to('.menu-button .dot-row._3 .dot._1 span', 0.4, {
                    scaleX: 1,
                    scaleY: 2.5,
                    transformOrigin: "50% 100%",
                    ease: Power2.easeOut
                }, 0.8);
                theme.layerMenu.data.menuAnim.to('.menu-button .dot-row._3 .dot._3 span', 0.4, {
                    scaleX: 1,
                    scaleY: 2.5,
                    transformOrigin: "50% 100%",
                    ease: Power2.easeOut
                }, 0.8);
                theme.layerMenu.data.menuAnim.to('.menu-button .dot-row._2 .dot._2 span', 0.4, {
                    opacity: '0',
                    ease: Power2.easeOut
                }, 0.8);

                // Init Functions
                theme.layerMenu.layerNav();
                theme.layerMenu.menuButton();

                // Hud
                if (!theme.globals.isMobile && document.body.classList.contains('is-hud')) {
                    addEventListener('mousemove', theme.layerMenu.hud, false);
                }
            },

            hud: function(e) {
                let decimalX = e.clientX / window.innerWidth - 0.5;
                let decimalY = e.clientY / window.innerHeight - 0.5;
                let decimalXR = Math.round( -decimalX * 20 );
                let decimalYR = Math.round( -decimalY * 20 );

                gsap.to('#header, .footer__inner', 1, {
                    x: decimalXR,
                    y: decimalYR,
                    transformStyle: "preserve3d",
                    ease: Linear.easeNone,
                    force3D:false
                });

            },

            setCurrent: function(url) {
                let activeLink = document.querySelector('.js-layer-menu-nav ul a.active');
                if (activeLink) {
                    activeLink.classList.remove('active');
                }
                let currentLink = document.querySelector('.js-layer-menu-nav ul a[href="' + url + '"]');
                if (currentLink) {
                    currentLink.classList.add('active');
                }
            },

            menuButton: function() {
                let button = document.querySelector('.js-menu-button');

                button.addEventListener('click', e=>{
                    // Prevent link default
                    e.preventDefault();

                    if (theme.layerMenu.data.status === 'open') {
                        theme.layerMenu.closeMenuLayer(e);
                    } else if (theme.layerMenu.data.status === 'closed') {
                        theme.layerMenu.openMenuLayer(e);
                    }
                }
                );

            },

            openMenuLayer: function(e) {
                if (theme.layerMenu.data.status === 'closed') {

                    theme.layerMenu.data.status = 'opening';

                    document.body.classList.add('menu-open');

                    // Button Anim
                    theme.layerMenu.data.menuAnim.play();

                    gsap.set('.js-layer-menu', {
                        visibility: 'visible',
                        onComplete: function() {

                            let bg = document.querySelector('.js-layer-menu-bg');
                            bg.classList.add('glitch-appear');
                            bg.classList.remove('glitch-disappear');

                            setTimeout(e=>{
                                let menu = document.querySelector('.js-layer-menu-nav .is-open');
                                menu.classList.add('glitch-appear');
                                menu.classList.remove('glitch-disappear');
                                setTimeout(e=>{
                                    theme.layerMenu.data.status = 'open';
                                }
                                , 400);

                            }
                            , 600);

                        }
                    });
                }
            },

            closeMenuLayer: function(e) {
                if (theme.layerMenu.data.status === 'open') {

                    theme.layerMenu.data.status = 'closing';

                    // Button Anim
                    theme.layerMenu.data.menuAnim.reverse();

                    let menu = document.querySelector('.js-layer-menu-nav .is-open');
                    menu.classList.add('glitch-disappear');
                    menu.classList.remove('glitch-appear');

                    setTimeout(e=>{
                        let bg = document.querySelector('.js-layer-menu-bg');
                        bg.classList.add('glitch-disappear');
                        bg.classList.remove('glitch-appear');
                        setTimeout(e=>{
                            gsap.set('.js-layer-menu', {
                                visibility: 'hidden'
                            });

                            // Reset Layers
                            let firstLayer = theme.layerMenu.data.menuStack[0];
                            let openMenu = document.querySelector('.js-layer-menu-nav .is-open');
                            let menuToOpen = document.getElementById(firstLayer);
                            theme.layerMenu.data.menuStack = [firstLayer];
                            openMenu.classList.remove('is-open');
                            menuToOpen.classList.add('is-open');
                            document.body.classList.remove('menu-open');
                            // Menu is closed
                            theme.layerMenu.data.status = 'closed';

                        }
                        , 600);
                    }
                    , 600);

                }
            },

            layerNav: function() {

                // Set open class for the main menu
                let subMenuLi = document.querySelectorAll('.js-layer-menu-nav li.menu-item-has-children, .js-layer-menu-nav li.page_item_has_children');
                let menuContainer = document.querySelector('.js-layer-menu-nav');
                let index = 0;

                // Set open class for the main menu
                let mainMenu = menuContainer.querySelector('div');
                mainMenu.classList.add('is-open', 'menu-main__layer');
                mainMenu.setAttribute('id', 'open-menu-main');

                // Menu has childs
                if (subMenuLi.length) {
                    for (let li of subMenuLi) {
                        index++;

                        let id = 'layer-menu-id-' + index;
                        li.setAttribute('id', id);
                        let a = li.querySelector('a');
                        let listTitle = a.innerHTML;
                        let ul = li.querySelector('ul');
                        let firstLi = ul.querySelector('li');
                        id = 'open-' + id;

                        if (a.getAttribute('href') === '#') {
                            a.setAttribute('data-open-menu', id);
                        } else {
                    	 
                    	 	// Add extra toggle button/icon
	                        let slideTrigger = document.createElement('span');
	                        slideTrigger.setAttribute('data-open-menu', id);
	                        slideTrigger.setAttribute('class', 'menu-main__toggle fx-cursor');
	                        slideTrigger.setAttribute('data-cursor-class', 'hover')
	                        li.insertBefore(slideTrigger, a.nextSibling);

                        }

                        // Create Back link
                        let backLi = document.createElement('li');
                        let backLink = document.createElement('div');
                        backLink.innerHTML = '<div class="rt-arrow rt-arrow--left"><span></span></div><div class="submenu__back-title">' + listTitle + '</div>';
                        backLi.setAttribute('class', 'submenu__back fx-cursor rt-arrow--left-trigger');
                        backLi.setAttribute('data-cursor-class', 'hover')
                        backLi.appendChild(backLink);

                        // Add back link to new list
                        ul.insertBefore(backLi, firstLi);

                        // Create new submenu layer
                        let subMenuLayer = document.createElement('div');
                        subMenuLayer.setAttribute('class', 'menu-main__layer submenu');
                        subMenuLayer.setAttribute('id', id);
                        subMenuLayer.appendChild(li.querySelector('ul'));

                        // Add submenu layer to main menu container
                        menuContainer.appendChild(subMenuLayer);

                    }

                    // Add events to open and close subnam
                    let openLinks = document.querySelectorAll('[data-open-menu]');
                    let backLinks = document.querySelectorAll('.submenu__back');

                    for (let link of openLinks) {
                        link.addEventListener('click', e=>{
                            e.preventDefault();
                            let menuToOpen = e.target.getAttribute('data-open-menu');
                            theme.layerMenu.data.menuStack.push(menuToOpen);
                            theme.layerMenu.switchLayer(menuToOpen);
                        }
                        );
                    }

                    for (let link of backLinks) {
                        link.addEventListener('click', e=>{
                            e.preventDefault();
                            if (typeof theme.layerMenu.data.menuStack !== 'undefined' && theme.layerMenu.data.menuStack.length > 0) {
                                theme.layerMenu.data.menuStack.splice(-1, 1);
                                let menuToOpen = theme.layerMenu.data.menuStack[theme.layerMenu.data.menuStack.length - 1];
                                theme.layerMenu.switchLayer(menuToOpen);
                            }
                        }
                        );
                    }

                }

            },

            switchLayer: function(menu) {

                let menuToCLose = document.querySelector('.js-layer-menu-nav .is-open');
                let menuToOpen = document.getElementById(menu);

                menuToCLose.classList.add('glitch-disappear');
                menuToCLose.classList.remove('glitch-appear');
                setTimeout(e=>{

                    menuToCLose.classList.remove('is-open');
                    menuToOpen.classList.add('is-open');

                    menuToOpen.classList.add('glitch-appear');
                    menuToOpen.classList.remove('glitch-disappear');

                }
                , 400);

            },

        },

        /* ==================================================
          Cursor Actions
        ================================================== */
        cursor: {
            mouse: {
                x: 0,
                y: 0
            },
            pos: {
                x: 0,
                y: 0
            },
            ratio: 0.15,
            ball: document.querySelector('#cursor'),
            init: function() {

                if (theme.globals.isEditor) {
                    document.body.classList.remove("is-cursor-effects");
                    return;
                }
                if (theme.globals.isMobile) {
                    return
                }

                if (!document.body.classList.contains("is-cursor-effects")) {
                    return;
                }

                let c = theme.cursor;
                gsap.set(c.ball, {
                    xPercent: -50,
                    yPercent: -50
                });
                document.addEventListener("mousemove", c.mouseMove);
                gsap.ticker.add(c.updatePosition);

                // Hover actions
                c.hoverables('a[href], .fx-cursor, input[type="submit"]');

                // Remove cursor old actions classes 
                document.addEventListener('click', e => {
                    c.ball.classList = '';
                });

                // Add extra class when mouse button is pressed
                document.addEventListener("mousedown", e=>{
                    theme.cursor.ball.classList.add('drag');
                }
                );

                document.addEventListener("mouseup", e=>{
                    theme.cursor.ball.classList.remove('drag');
                }
                );

            },
            updatePosition: function() {
                let c = theme.cursor;
                c.pos.x += (c.mouse.x - c.pos.x) * c.ratio;
                c.pos.y += (c.mouse.y - c.pos.y) * c.ratio;
                gsap.set(c.ball, {
                    x: c.pos.x,
                    y: c.pos.y
                });

            },
            mouseMove: function(e) {
                let c = theme.cursor;
                c.mouse.x = e.clientX;
                c.mouse.y = e.clientY;
            },
            hoverables: function(sel) {
                let c = theme.cursor;
                let txt = '';
                let hoverables = document.querySelectorAll(sel);
                let extraClass = null;
                let cursorBody = document.querySelector('.cursor__body-inner');
                var state = null;
                let textHolder = document.querySelector('.cursor__body-text');

                let hoverImages = document.querySelectorAll('.fx-hover-image');
                if (hoverImages.length > 0) {
                    // Add special holder for images preview
                    var imgHolder = document.querySelector('.cursor__body-image');

                    if (imgHolder === null) {

                        imgHolder = document.createElement('img');
                        imgHolder.className = 'cursor__body-image';
                        cursorBody.appendChild(imgHolder);
                    }

                }

                // Listeners
                for (let i = 0; i < hoverables.length; i++) {

                    let t = hoverables[i];

                    hoverables[i].addEventListener('mouseenter', e=>{

                        if (t.classList.contains('fx-cursor')) {

                            if (t.getAttribute('data-cursor-class')) {
                                extraClass = t.getAttribute('data-cursor-class');
                            }
                            if (t.classList.contains('fx-cursor-close')) {
                                extraClass = 'close';
                            }
                            c.ball.classList.add(extraClass);

                            if (extraClass === 'text') {

                                txt = t.getAttribute('data-cursor-text');

                                textHolder.textContent = txt;

                            }

                            if (t.classList.contains('fx-hover-image')) {
                                let imgHover = t.querySelector('img');
                                if (imgHover) {
                                    imgHolder.src = imgHover.src;
                                    gsap.set(imgHolder, {
                                        visibility: 'visible'
                                    });
                                    gsap.set(imgHolder, {
                                        opacity: 0
                                    });
                                    gsap.to(imgHolder, {
                                        opacity: 1,
                                        duration: 0.3,
                                        ease: 'power3.out'
                                    });
                                }
                            }
                        } else {
                            extraClass = null;
                            c.ball.classList.add('hover');
                        }
                        state = 'over';

                    }
                    );

                    hoverables[i].addEventListener('mouseleave', e=>{
                        let t = e.target;
                        c.ball.classList = '';

                        if (extraClass = 'text') {

                            textHolder.textContent = '';

                        }

                        if (t.classList.contains('fx-hover-image')) {
                            let imgHover = t.querySelector('img');
                            if (imgHover) {
                                setTimeout(e=>{
                                    if (imgHolder.src == imgHover.src && state === 'out') {
                                        gsap.set(imgHolder, {
                                            visibility: 'hidden'
                                        });
                                    }
                                    state = 'out'
                                }
                                , 300);
                                gsap.to(imgHolder, {
                                    opacity: 0,
                                    duration: 0.3,
                                    ease: 'power3.out'
                                });
                            }

                        }

                    }
                    );
                }
            },

            clear: function() {
                if (!document.body.classList.contains("is-cursor-effects")) {
                    return;
                }
                let c = theme.cursor;
                c.ball.classList = '';
                let textHolder = document.querySelector('.cursor__body-text');
                let ballImage = theme.cursor.ball.querySelector('.cursor__body-image');

                if (textHolder) {
                    textHolder.textContent = '';
                }
                if (ballImage) {
                    ballImage.removeAttribute('style');
                }

            },
            update: function(sel) {
                if (theme.globals.isEditor) {
                    return;
                }
                if (theme.globals.isMobile) {
                    return;
                }

                if (!document.body.classList.contains("is-cursor-effects")) {
                    return;
                }
                let c = theme.cursor;
                c.clear();
                c.hoverables(sel);

            }
        },

        /* ==================================================
          Magnet Effect
        ================================================== */
        magnet: {
            ball: document.querySelector('#cursor'),
            mouse: {
                x: 0,
                y: 0
            },
            active: false,
            pos: {
                x: 0,
                y: 0
            },
            animSpeed: 0.5,
            movmentSpeed: 3,
            targetBorder: 20,
            init: function(sel) {

                // Light mode
                if (theme.globals.lightMode) {
                    return;
                }
                if (!theme.globals.isMobile) {
                    if (document.body.classList.contains("is-cursor-effects")) {
                        let m = theme.magnet;
                        document.addEventListener("mousemove", m.mouseMove);
                        m.create(sel);
                    }
                }
            },
            create: function(sel) {
                let m = theme.magnet;
                let magnets = document.querySelectorAll(sel);

                for (let magnet of magnets) {

                    // Don't duplicate magneto
                    if (!magnet.classList.contains('magneto--ready')) {

                        // create wrapper container
                        let wrapper = document.createElement('div');
                        magnet.classList.add('magneto--ready');
                        wrapper.classList.add('magneto-wrapper');
                        wrapper.style.cssText = "display: inline-block; position: relative";

                        // insert wrapper before magnet in the DOM tree
                        magnet.parentNode.insertBefore(wrapper, magnet);

                        // move magnet into wrapper
                        let w = wrapper.appendChild(magnet);
                        wrapper.addEventListener("mouseover", e=>{
                            gsap.to(wrapper, 0.3, {
                                scale: 1.1
                            });
                            m.active = true;

                        }
                        );
                        wrapper.addEventListener("mouseout", e=>{
                            let traget = e.target;
                            gsap.to(wrapper, 0.3, {
                                scale: 1
                            });
                            gsap.to(magnet, theme.magnet.animSpeed, {
                                x: 0,
                                y: 0
                            });
                            m.active = false;

                        }
                        );
                        wrapper.addEventListener("mousemove", e=>{
                            m.magnetCursor(e, wrapper, theme.magnet.movmentSpeed);
                            m.callMagneto(e, wrapper, magnet);

                        }
                        );
                    }
                }
            },
            mouseMove: function(e) {
                let m = theme.magnet;
                m.mouse.x = e.clientX;
                m.mouse.y = e.clientY;
            },
            callMagneto: function(e, parent, child) {
                theme.magnet.magnetMove(e, parent, child, theme.magnet.targetBorder);
            },
            magnetMove: function(e, parent, target, movement) {
                var boundingRect = parent.getBoundingClientRect();
                var relX = e.clientX - boundingRect.left;
                var relY = e.clientY - boundingRect.top;
                gsap.to(target, theme.magnet.animSpeed, {
                    x: (relX - boundingRect.width / 2) / boundingRect.width * movement,
                    y: (relY - boundingRect.height / 2) / boundingRect.height * movement,
                    ease: Power2.easeOut
                });
            },
            magnetCursor: function(e, parent, movement) {
                let m = theme.magnet;
                var rect = parent.getBoundingClientRect();
                var relX = e.pageX - rect.left;
                var relY = e.pageY - rect.top;
                m.pos.x = rect.left + rect.width / 2 + (relX - rect.width / 2) / movement;
                m.pos.y = rect.top + rect.height / 2 + (relY - rect.height / 2) / movement;
                m.pos.x = Math.round( m.pos.x );
                m.pos.y = Math.round( m.pos.y );
                gsap.to(m.ball, theme.magnet.animSpeed, {
                    x: m.pos.x,
                    y: m.pos.y,
                });
            },
            update: function(sel) {
                if (!theme.globals.isMobile) {
                    // Light mode
                    if (theme.globals.lightMode) {
                        return;
                    }
                    if (document.body.classList.contains("is-cursor-effects")) {
                        theme.magnet.create(sel);
                    }
                }

            },
        },

        /* ==================================================
          Window Events
        ================================================== */
        events: {

            scrollPos: null,
            resize: null,
            waypoints: {},
            fullScreenWrap: null,

            // Methods
            init: function() {

                // obj path
                let ev = theme.events;

                // Admin Bar fixed
                let WPBar = document.querySelector('#wpadminbar');
                if (WPBar) {
                    WPBar.style.position = 'fixed';
                }

                // Set global resize event
                ev.resize = window.document.createEvent('UIEvents');
                ev.resize.initUIEvent('resize', true, false, window, 0);

                /* Scroll / Resize Events */
                if (document.body.classList.contains("is-smoothscroll") === false) {
                    window.addEventListener('scroll', ev.scrollListener);
                }

                window.addEventListener('resize', ev.resizeListener);

            },

            scrollActions: function(pos) {
                let y = pos.y;
                let x = pos.x;
                let header = document.querySelector('#header');

                theme.events.scrollPos = {
                    y: y,
                    x: x
                }

                // Hide header
                if (y > 200) {
                    header.classList.add('header--scrolled');
                } else {
                    header.classList.remove('header--scrolled');
                }

                // Waypoints
                if (theme.events.waypoints[0]) {
                    let waypoints = theme.events.waypoints;
                    let winHeight = window.innerHeight;
                    let winWidth = window.innerWidth;
                    let delay = 0.1;
                    let delayStep = 0.2;
                    let target = null;
                    let timer = 0;

                    for (let i in waypoints) {
                        let top = y + winHeight;
                        let left = x + winWidth;
                        timer = 0;
                        if (top >= waypoints[i].posY && left >= waypoints[i].posX) {

                            // Avoid animation restart
                            if (waypoints[i].el.classList.contains('done') === false ) {
                            	
                                delay = delay + delayStep;
                                if (waypoints[i].el.classList.contains('waypoint-delay')) {
                                    target = waypoints[i].el;
                                    target.style.transitionDelay = delay + "s";
                                } else if (waypoints[i].el.querySelector('.waypoint-delay')) {
                                    target = waypoints[i].el.querySelector('.waypoint-delay');
                                    target.style.transitionDelay = delay + "s";
                                }

                                // Pause 
                                if ( waypoints[i].el.classList.contains('waypoint-pause') ) {
                                	timer = waypoints[i].el.getAttribute('data-timer');
                                	waypoints[i].el.classList.add('wp-timer-start');
                                }
                                
                            	setTimeout(e=> {
                            		waypoints[i].el.classList.add('done');

                        		  	// If Target is stagger animation container
                        		  	if (document.body.classList.contains('is-scroll-animations')) {
		                                if (waypoints[i].el.classList.contains('anim-stagger')) {
		                                    let s = waypoints[i].el;
		                                    let staggerEls = s.querySelectorAll('.stagger-item');
		                                    let tl = gsap.timeline({
		                                        repeat: 0,
		                                        repeatDelay: 0,
		                                        delay: 0
		                                    });
		                                    let staggerObj = {
		                                        duration: 0.3,
		                                        opacity: 1,
		                                        y: 0,
		                                        ease: 'power3.out'
		                                    };
		                                    let speed = 0.5;
		                                    if (s.getAttribute('data-stagger')) {
		                                        var parsedObj = JSON.parse(s.getAttribute('data-stagger'));
		                                        if (parsedObj) {
		                                            staggerObj = parsedObj;
		                                            speed = parsedObj.duration;
		                                        }
		                                    }
		                                    tl.staggerTo(staggerEls, speed, staggerObj, 0.1);
		                                }
		                            }

                        		  	// Extra effects
	                                if (waypoints[i].el.classList.contains('autotype')) {
	                                    theme.fx.autoType(waypoints[i].el);
	                                } else if (waypoints[i].el.classList.contains('randomtype-on-scroll')) {
	                                    theme.fx.randomType.add(waypoints[i].el);
	                                }
                            	},timer);

                              

                            }
                        }
                    }

                }

            },

            // Scroll Listener
            scrollListener: function() {
                let x = window.pageXOffset || document.documentElement.scrollLeft;
                let y = window.pageYOffset || document.documentElement.scrollTop;
                let obj = {
                    x: x,
                    y: y
                }

                theme.events.scrollActions(obj);
            },

            // Fullscreen Scroll Listener
            FSscrollListener: function() {
                let y = theme.events.fullScreenWrap.scrollTop;
                let x = theme.events.fullScreenWrap.scrollLeft;
                let obj = {
                    x: x,
                    y: y
                }
                theme.events.scrollActions(obj);
            },

            // Resize Listener
            resizeListener: function() {},

            // Waypoints
            getWaypoints: function() {
                let ev = theme.events;
                let w = document.querySelectorAll('.is-waypoint:not(.done)');

                if (w.length > 0) {
                    for (let i = 0; i < w.length; i++) {
                        let rect = w[i].getBoundingClientRect();
                        ev.waypoints[i] = {
                            posX: rect.left,
                            posY: rect.top,
                            el: w[i]
                        }
                    }
                } else {
                    ev.waypoints = {};
                }
            },

            // Update events
            update: function() {
                let ev = theme.events;

                ev.getWaypoints();

                if (document.querySelector('#fs-scroll')) {
                    ev.fullScreenWrap = document.querySelector('#fs-scroll');
                    ev.fullScreenWrap.addEventListener('scroll', ev.FSscrollListener);
                }

                // Run scroll function with initial parameteres
                ev.scrollActions({
                    x: 0,
                    y: 0
                });

            },

        },

        /* ==================================================
          SmoothScroll
        ================================================== */

        smoothScroll: {

            scrollbar: null,
            scrollbarFullScreen: null,
            init: function() {
                if (document.body.classList.contains("is-smoothscroll")) {
                    theme.smoothScroll.main();
                    theme.smoothScroll.fullscreen();
                }
                else if (document.querySelector('.fs-scroll--h')) {
                	theme.smoothScroll.fullscreen();
                }
                
            },
            listener: function(status) {
                if (document.body.classList.contains('is-fullscreen') === false) {
                    for (let scene in theme.globals.scenes) {
                        theme.globals.scenes[scene].refresh();
                    }

                    // Trigger resize event
                    window.dispatchEvent(theme.events.resize);

                    // Trigger scroll actions
                    let obj = {
                        x: status.offset.x,
                        y: status.offset.y
                    }
                    theme.events.scrollActions(obj);
                }
            },
            listenerFS: function(status) {
                if (document.body.classList.contains('is-fullscreen')) {

                    for (let scene in theme.globals.scenes) {
                        theme.globals.scenes[scene].refresh();
                    }

                    // Trigger resize event
                    window.dispatchEvent(theme.events.resize);

                    // Trigger scroll actions
                    let obj = {
                        x: status.offset.x,
                        y: status.offset.y
                    }
                    theme.events.scrollActions(obj);
                }
            },
            main: function() {
                if (document.querySelector('#app')) {
                    let app = document.querySelector('#app');
                    let scrollbar = window.Scrollbar;

                    let options = {
                        damping: 0.05,
                        renderByPixel: true,
                    };

                    theme.smoothScroll.scrollbar = Scrollbar.init(app, options);
                    theme.smoothScroll.scrollbar.addListener(theme.smoothScroll.listener);
                }

            },

            fullscreen: function() {

                if (document.querySelector('#fs-scroll')) {

                    let scrollbarFs = null;
                    let options = {
                        damping: 0.05,
                        renderByPixel: true,
                        plugins: {
                        },
                    };

                    let fs = document.querySelector('#fs-scroll');
                    scrollbarFs = window.Scrollbar;

                    if (document.querySelector('.fs-scroll--h')) {
                        InvertDeltaPlugin.pluginName = 'invertDelta';
                        InvertDeltaPlugin.defaultOptions = {
                            events: []
                        }
                        scrollbarFs.use(InvertDeltaPlugin);
                        options.plugins['invertDelta'] = {
                            events: [/wheel/]
                        }
                    }
                    theme.smoothScroll.scrollbarFullScreen = Scrollbar.init(fs, options);
                    theme.smoothScroll.scrollbarFullScreen.addListener(theme.smoothScroll.listenerFS);
                }

            },

            update: function() {
                theme.smoothScroll.fullscreen();

            }
        },

        /* ==================================================
          Small Helpers
        ================================================== */
        helpers: {

            sidebar: function() {
                let sidebar = document.querySelector('#sidebar');
                if (sidebar) {

                    let toggle = (e)=>{
                        e.preventDefault();
                        let body = document.body;
                        body.classList.toggle('is-sidebar-open');
                    }

                    document.body.appendChild(sidebar);
                    setTimeout(()=>{
                        document.body.classList.add('is-sidebar-ready')
                    }
                    , 100);

                    let sidebar_trigger = document.querySelector('#sidebar__trigger');
                    let close_layer = document.querySelector('.sidebar__layer');
                    sidebar_trigger.addEventListener('click', toggle);
                    close_layer.addEventListener('click', toggle);
                    theme.cursor.update('.sidebar__layer');

                }
            },

            scrollTop: function() {

                if (document.querySelector('.scroll-top')) {
                    let topButton = document.querySelector('.scroll-top');
                    topButton.addEventListener('click', e=>{
                        theme.helpers.scrollToPos(0, 'y', 0.5, 0);

                    }
                    );
                }

            },

            scrollToPos: function(pos, direction="y", duration=0.5, delay=0, callback) {

                setTimeout(()=>{

                    if (isNaN(pos) === false) {

                        let s = null;
                        let scrollObj = null;

                        if (theme.smoothScroll.scrollbar) {
                            duration = duration * 1000;

                            // Fullscreen
                            if (document.querySelector('#fs-scroll')) {
                                s = theme.smoothScroll.scrollbarFullScreen;

                                // Classic
                            } else {
                                s = theme.smoothScroll.scrollbar;
                            }
                            if (direction === 'x') {
                                s.scrollTo(pos, 0, duration);
                            } else {
                                s.scrollTo(0, pos, duration);
                            }

                        } else {

                            if (direction === 'x') {
                                scrollObj = {
                                    x: pos,
                                    autoKill: false
                                }
                            } else {
                                scrollObj = {
                                    y: pos,
                                    autoKill: false
                                }
                            }

                            gsap.to(window, {
                                duration: duration,
                                scrollTo: scrollObj,
                                ease: "power2"
                            });
                        }
                    }

                }
                , delay);

                // Set new delay for callback delay
                delay = (duration * 1000) + delay;

                // Callbac
                setTimeout(()=>{

                    // Callback
                    if (callback && typeof (callback) === "function") {
                        callback();
                    }

                }
                , delay);

            },

        },

        /* ==================================================
          Vendors Plugins
        ================================================== */
        plugins: {

            // Disqus
            disqus: function() {
                let disqus = document.querySelector('#disqus_thread');
                if (disqus) {

                    let disqusIdentifier = document.querySelector('#disqus_thread').getAttribute('data-post_id')
                      , disqusShortname = document.querySelector('#disqus_thread').getAttribute('data-disqus_shortname')
                      , disqusTitle = document.querySelector('#disqus_title').textContent
                      , disqusUrl = window.location.href
                      , protocol = location.protocol;
                    /* * * Disqus Reset Function * * */
                    if (typeof DISQUS !== 'undefined') {
                        DISQUS.reset({
                            reload: true,
                            config: function() {
                                this.page.identifier = disqusIdentifier;
                                this.page.url = disqusUrl;
                                this.page.title = disqusTitle;
                            }
                        });
                    } else {
                        let dsq = document.createElement('script');
                        dsq.type = 'text/javascript';
                        dsq.async = true;
                        dsq.src = protocol + '//' + disqusShortname + '.disqus.com/embed.js';
                        (document.getElementsByTagName('head')[0] || document.getElementsByTagName('body')[0]).appendChild(dsq);
                    }
                }
            }

        },

        /* ==================================================
          Prototypes
        ================================================== */
        prototypes: function() {}

    }

}(jQuery));