var clipboard = new Clipboard();

function Clipboard(){
	//temporary buffer of strings managed at background script
	var killring = new Array();
	var largebox;
	var focused_element;
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
		chrome.extension.sendRequest(new Message("get_all"), function(response){
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
			var width = 200;
			var margin = 2;
			var height = 14;
			largebox = document.createElement("div");
			largebox.style.position="absolute";
			largebox.style.left=""+pos_left+"px";
			largebox.style.top=""+pos_top+"px";
			largebox.style.zIndex="999999";
			for(var index=0;;index++){
				var str;
				str = response.pop();
				if(!str)break;
				var box=document.createElement("div");
				var numbox=document.createElement("div");
				var strbox=document.createElement("div");
				
				numbox.innerHTML = " "+index+" ";
				numbox.style.float="left";
				numbox.style.background="blue";
				numbox.style.color="white";
				numbox.style.width="12px";//16*2;
				numbox.style.height=""+height+"px";
				
				numbox.style.border=""+margin+"px groove #006";
				numbox.style.borderColor="black";
				strbox.innerHTML = str;
				strbox.style.float="right";
				strbox.style.background="white";
				strbox.style.color="black";
				
				strbox.style.height=""+height+"px";
				strbox.style.width=""+width+"px";
				strbox.style.overflow="hidden";
				
				strbox.style.border=""+margin+"px groove #006";
				
				box.appendChild(numbox);
				box.appendChild(strbox);

				numbox.style.fontSize = "12px";
				strbox.style.fontSize = "12px";

				largebox.appendChild(box);
				pos_top+=height+margin;
				
			}
			document.body.appendChild(largebox);
			window.removeEventListener("keydown", captureKeydown,false);
			window.addEventListener("keydown", captureKeydown_yank,false);
		});
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
			var selected_str = this.killring[this.killring.length-selected_num-1];
			clipboard.yank_finish(selected_str);
		}
	}

	this.yank_cleanUp=function(){
		document.body.removeChild(largebox);
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