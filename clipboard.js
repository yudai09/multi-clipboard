var clipboard = new Clipboard();



function Clipboard(){
    //temporary buffer of strings managed at background script
    var killring = new Array();
    var largebox;
    var expandbox;
    var focused_element;
    //setup style sheet
    this.genLargebox=function(pos_left,pos_top){

	var divElement = document.createElement("div");

	divElement.style.cssText = 
	    "border:solid 1px #2d2d2d;"+
	    "text-align:center;"+
	    "background:#0000FF;"+
	    "padding:10px 10px 10px 10px;"+
	    "-moz-border-radius: 5px;"+
	    "-webkit-border-radius: 5px;"+
	    "border-radius: 5px;"+
	    "position: absolute;"+
	    "left: "+pos_left+"px;"+
	    "top: "+pos_top+"px;"+
	    "z-index: 999998;"+
	    "-moz-box-shadow:10px  10px 5px #000000;"+
	    "-webkit-box-shadow:10px  10px 5px #000000;"+
	    "box-shadow:10px  10px 5px #000000;"+
	    "opacity: 0.93;";

	return divElement;
    }
    //setup style sheet
    this.genExpandbox = function(pos_left,pos_top,height,width){

	var divElement = document.createElement("div");

	divElement.style.cssText = 
	    "border:solid 1px #2d2d2d;"+
	    "text-align:center;"+
	    "background:#FFFFFF;"+
	    "padding:5px 5px 5px 5px;"+
	    "-moz-border-radius: 5px;"+
	    "-webkit-border-radius: 5px;"+
	    "border-radius: 5px;"+
	    "position: absolute;"+
	    "left: "+pos_left+"px;"+
	    "top: "+pos_top+"px;"+
	    "z-index: 999998;"+
	    "-moz-box-shadow:10px  10px 5px #000000;"+
	    "-webkit-box-shadow:10px  10px 5px #000000;"+
	    "box-shadow:10px  10px 5px #000000;"+
	    "opacity: 0.93;";

	if(height > 0)
	    divElement.style.cssText+="height: "+height+"px;";

	if(width > 0)	    
	    divElement.style.cssText+="width: "+width+"px;";

	return divElement;
    }

    this.genInnerbox = function(height,width,margin,index,str){

	var box=document.createElement("div");
	var numbox=document.createElement("div");
	var strbox=document.createElement("div");

	numbox.innerHTML = " "+index+" ";
	numbox.style.float="left";
	numbox.style.background="black";
	numbox.style.color="white";
	
	numbox.style.border=""+margin+"px groove #006";
	numbox.style.borderColor="gray";
	strbox.innerHTML = str;
	strbox.style.float="right";
	strbox.style.background="white";
	strbox.style.color="black";
	
	strbox.style.overflow="hidden";
	strbox.style.border=""+margin+"px groove #006";
	strbox.style.borderColor="blue";

	// position for each element
	if(width > 0){
	    numbox.style.width="32px";
	    strbox.style.width=""+width+"px";
	}
	if(height > 0){
	    numbox.style.height=""+height+"px";
	    strbox.style.height=""+height+"px";
	}
	box.appendChild(numbox);
	box.appendChild(strbox);

	numbox.style.fontSize = ""+(height-3)+"px";
	strbox.style.fontSize = ""+(height-3)+"px";
	numbox.style.textAlign = "center";
	strbox.style.textAlign = "center";

	// when a candidate string is clicked, expand the text to show the details. 
	strbox.addEventListener("mousedown",function(e){
	    console.log("mousedown at a candidte");
	    var focused = e.srcElement;
	    var rect = focused.getClientRects()[0];
	    // this.genExpandbox = function(pos_left,pos_top,height,width)
	    if(expandbox!=null)
		document.body.removeChild(expandbox);
	    expandbox = clipboard.genExpandbox(rect.left+100, rect.top, -1, 400);
	    var innerText = document.createElement("div");
	    // var srcURL = document.createElement("div");
	    innerText.innerHTML = focused.innerHTML;
	    // srcURL.innerHTML = "copied at <a href=google.com>google.com</a>"
	    // srcURL.style.background = "#6495ED";
	    expandbox.appendChild(innerText);
	    // expand.appendChild(srcURL);
	    console.log("rect(left,top) = ( "+rect.left+", "+rect.top+" )");
	    document.body.appendChild(expandbox);
	},true);
	return box;
    }
    //clipboard yank (paste)
    this.yank=function(){
	focused_element=getFocusedElement();
	//do nothing if there are no focused text area 
	if(focused_element.type!="textarea" && focused_element.type!="text" && focused_element.type!="password" ){
	    console.log(focused_element.type);
	    return;
	}		
	//blur focused element to prevent the element inputed command strings 
	focused_element.blur();
	focused_element.readOnly=true;
	focused_element.blur();
	//when following codes are executed and refocus the 'focused_element'.
	focused_element.addEventListener("focus"
					 ,function(e){
					     focused_element.removeEventListener("focus",this,false);
					     function first_input_event(event){
						 focused_element.readOnly=false;
						 focused_element.focus();
						 console.log("event 1");
						 focused_element.removeEventListener("keydown",first_input_event,false);
					     }
					     focused_element.addEventListener("keydown",first_input_event,false);
					     console.log("focused");}
					 ,false);
	//1 retrieve all killed strings from background page
	//2 let user select one of the strings.
	//3 insert the selected string into the focused element.
	chrome.extension.sendRequest(new Message("get_all"), this.showCandidates);
    }
    this.showCandidates = function(response){

	console.log("MESSAGE::"+response);

	if(!response){
	    console.log("no return");
	    return;
	}

	console.log("get:"+response);

	this.killring = new Array();//necessary for set collect size.
	this.killring = response.slice(0);//copy

	var brect=focused_element.getClientRects()[0];
	var pos_left = brect.left+window.scrollX;
	var pos_top	 = brect.top+window.scrollY;

	largebox = clipboard.genLargebox(pos_left,pos_top);
	for(var index=0;;index++){
	    var str;

	    obj = response.pop();

	    if(!obj)
		break;

	    var width = 400;
	    var margin = 2;
	    var height = 16;
	    var innerHTML = obj.string+"<BR><BR>"+"copied @ <a href="+obj.url+">"+obj.url+"</a>";
	    var innerBox = clipboard.genInnerbox(height,width,margin,index,innerHTML);
	    largebox.appendChild(innerBox);
	}

	document.body.appendChild(largebox);
	window.removeEventListener("keydown", captureKeydown,false);
	window.addEventListener("keydown", captureKeydown_yank,false);

    };

    function captureKeydown_yank(e){
	console.log("capturekey");
	e.stopPropagation();
	var string = decodePressedKey(e); 
	if(string){
	    if(string=="ESC"){
		clipboard.yank_finish(null);
		return;
	    }
	    var selected_num = parseInt(string);
	    var selected_str = this.killring[this.killring.length-selected_num-1].string;
	    clipboard.yank_finish(selected_str);
	}
    }

    this.yank_cleanUp=function(){
	if(largebox)
	    document.body.removeChild(largebox);
	if(expandbox)
	    document.body.removeChild(expandbox);
	largebox=expandbox=null;

	focused_element.focus();
	window.removeEventListener("keydown", captureKeydown_yank,false);
	window.addEventListener("keydown", captureKeydown,false);
    }

    this.yank_finish=function(str){
	if(str){
	    //selected area
	    var elem = focused_element;
	    var p_begin = elem.selectionStart;
	    var end   = elem.length;
	    var string = elem.value;
	    var mae = string.substr(0,p_begin);
	    var usiro = string.substr(p_begin,end);
	    elem.value = mae+str+usiro;
	}
	this.yank_cleanUp();
    };

    this.kill=function(){
	var selection = window.getSelection();
	var rangecount = selection.rangeCount;
	var msg = "";
	if (rangecount) {
	    for (var i = 0 ; i < rangecount ; i++) {
		var range = selection.getRangeAt(i);
		//i don't know how to retrieve all element at selected area
		//but no problem 
		msg+=""+range.toString();
	    }
	}
	if(msg==""){
	    return;
	}
	chrome.extension.sendRequest(new Message("push",msg), function(response){
	    console.log("MESSAGE::"+response);
	    var res= response;
	    return res;
	});
    }
    function getFocusedElement(){
	return document.activeElement;
    }
}