'use strict';

function Emel_SetTooltipPos_SpanChild(parent)
{
	// var x = (parent.clientX + 20) + 'px';
	// var y = (parent.clientY + 20) + 'px';
	// 
	// var child = this.querySelector("span");
	// 
	// child.style.top  = y;
	// child.style.left = x;
	
	Emel_SetTooltipPos_Child(parent, this.querySelector("span")) 
}

function Emel_SetTooltipPos_ClassChild(parent) 
{
	// var x = (parent.clientX + 20) + 'px';
	// var y = (parent.clientY + 20) + 'px';
	// 
	// var child = this.querySelector(".emel-tooltiptext");
	// 
	// child.style.top  = y;
	// child.style.left = x;
	 
	Emel_SetTooltipPos_Child(parent, this.querySelector(".emel-tooltiptext")) 
}

function Emel_SetTooltipPos_Child(parent, child) 
{
	var x = (parent.clientX + 20);
	var y = (parent.clientY + 20);

	var maxX = document.body.clientWidth  - child.clientWidth	+ 20;
	var maxY = document.body.clientHeight - child.clientHeight	+ 20;
	
	if (x > maxX)
	{
		x = maxX;
	}
	
	if (y > maxY)
	{
		y = maxY;
	}
	
	child.style.top  = y + 'px';
	child.style.left = x + 'px';
}

function SetEmelTooltipRelEvents() 
{
	var emel_tooltips = document.querySelectorAll('.emel-tooltip-span-rel');
	for (var i = 0; i < emel_tooltips.length; i++) 
	{
		var child = emel_tooltips[i].querySelector("span");
		
		if (child == undefined)
		{
			console.log('Emel_SetTooltipPos_SpanChild does not set! (not found `.emel-tooltip-span-rel span`)');
		}
		else
		{
			emel_tooltips[i].onmousemove = Emel_SetTooltipPos_SpanChild;	
		}
	}	
	
	emel_tooltips = document.querySelectorAll('.emel-tooltip-class-rel');
	for (var i = 0; i < emel_tooltips.length; i++) 
	{
		var child = emel_tooltips[i].querySelector(".emel-tooltiptext");
		
		if (child == undefined)
		{
			console.log('Emel_SetTooltipPos_SpanChild does not set! (not found `.emel-tooltip-class-rel .emel-tooltiptext`)');
		}
		else
		{
			emel_tooltips[i].onmousemove = Emel_SetTooltipPos_ClassChild;	
		}
	}	
	
	emel_tooltips = document.querySelectorAll('[emel-tooltip-data-rel]');
	for (var i = 0; i < emel_tooltips.length; i++) 
	{
		var child = emel_tooltips[i].querySelector(".emel-tooltiptext");
		
		if (child == undefined)
		{
			var newSpan = document.createElement("SPAN");
			
			newSpan.className = "emel-tooltiptext";
			newSpan.innerText = emel_tooltips[i].getAttribute("emel-tooltip-data-rel");
			
			emel_tooltips[i].appendChild(newSpan);
		}
		
		emel_tooltips[i].onmousemove = Emel_SetTooltipPos_ClassChild;	
	}	
	
	emel_tooltips = null;
}

window.GetWindowInnerDimensions = function ()
{
    var retObj =
    {
        width   : window.innerWidth,
        height  : window.innerHeight
    };

    return retObj;
};

//

class EmelBlazorContextMenuExtend
{
    constructor(element)
    {
        var contextMenu = element;

        var hasPointerEvents = (('PointerEvent' in window) || (window.navigator && 'msPointerEnabled' in window.navigator));                // check if we're using a touch screen
        var isTouch = (('ontouchstart' in window) || (navigator.MaxTouchPoints > 0) || (navigator.msMaxTouchPoints > 0));
        
        var mouseDown = hasPointerEvents ? 'pointerdown' : isTouch ? 'touchstart' : 'mousedown';                                            // switch to pointer events or touch events if using a touch screen
        var mouseUp   = hasPointerEvents ? 'pointerup'   : isTouch ? 'touchend'   : 'mouseup';
        var mouseMove = hasPointerEvents ? 'pointermove' : isTouch ? 'touchmove'  : 'mousemove';

        var startX = -1;                                                                                                                    // mouse x position when clicked
        var startY = -1;                                                                                                                    // mouse y position when clicked

        const maxDiffX = 10;                                                                                                                // max number of X pixels the mouse can move during press before it is canceled
        const maxDiffY = 10;                                                                                                                // max number of Y pixels the mouse can move during press before it is canceled

        //
        
        contextMenu.addEventListener(mouseUp,       mouseUpHandler,   true);                                                                // hook events that start BlazorContextMenu, if ellapted time is enought.
        contextMenu.addEventListener(mouseMove,     mouseMoveHandler, true);
        contextMenu.addEventListener('wheel',       clearSavedPos,    true);
        contextMenu.addEventListener('scroll',      clearSavedPos,    true);
        contextMenu.addEventListener('mouseleave',  clearSavedPos,    true);

        contextMenu.addEventListener(mouseDown,     mouseDownHandler, true);                                                                // hook events that start the observe
    }

    clearSavedPos()
    {
        startX = -1;
        startY = -1;
    }

    mouseDownHandler(e)
    {
        startX = e.clientX;
        startY = e.clientY;
    }

    mouseUpHandler(e) {
        if ((startX >= 0) && (startY >= 0))
        {
            console.log("EmelBlazorContextMenuExtend: " + e.target.id + " | " + startX + "-" + e.x + ", " + startY + "-" + e.y);
        }

        clearSavedPos();
    }

    mouseMoveHandler(e)
    {
        var diffX = Math.abs(startX - e.clientX);                                                                                           // calculate total number of pixels the pointer has moved
        var diffY = Math.abs(startY - e.clientY);

        // if pointer has moved more than allowed, cancel the long-press timer and therefore the event
        if (diffX >= maxDiffX || diffY >= maxDiffY)
        {
            clearSavedPos();
        }
    }
}

function isBoolean(val)
{
    return val === false || val === true;
}

var emelBlazorContextMenuItems = new List();

function CreateEmelBlazorContextMenuExtends(onlyForApple)
{
    if (typeof onlyForApple === 'undefined')
    {
        onlyForApple = false;
    }
    else if (! isBoolean(onlyForApple))
    {
        if (typeof onlyForApple === 'string')
        {
            onlyForApple = ! onlyForApple.isEmpty();
        }
        else
        {
            onlyForApple = false;
        }
    }

    if (onlyForApple)
    {
        var isSafari = navigator.vendor && navigator.vendor.indexOf('Apple') > -1 &&
                       navigator.userAgent &&
                       navigator.userAgent.indexOf('CriOS') == -1 &&
                       navigator.userAgent.indexOf('FxiOS') == -1;

        var isAppleGadget = navigator.userAgent.match(/iPad/i) || navigator.userAgent.match(/iPhone/i);

        if (! isSafari || ! isAppleGadget)
        {
            return;
        }
    }
    
    emelBlazorContextMenuItems = new List();

    var elements = document.getElementsByClassName("blazor-context-menu");

    elements.foreach(e => { emelBlazorContextMenuItems.add(new EmelBlazorContextMenuExtend(e)); } );
}

function List()                                                                                                                                     // https://learnersbucket.com/tutorials/data-structures/list-data-structure-in-javascript/
{
    this.listSize = 0;                                                                                                                              //Initialize the list
    this.items = [];
    
    this.add = (element) =>                                                                                                                         // Add item to the list
    {
        this.items[this.listSize++] = element;
    }
}


/*
<body>
	.......
	<script src="css/emel.css.js"></script>
	
	<script>
		SetEmelTooltipRelEvents();
	</script>
</body>
*/