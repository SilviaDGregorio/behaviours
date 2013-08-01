var codigo="";
(function(){
var python_configure = function(){
  this.configureDialogSetup()
  var that=this
  var tr=$('<tr>')
  var table=$('<table>').append(tr)
  var code=$('<textarea rows="20" id="code">')
  
  if (this.params.code)
    code.val(this.params.code)
 var cheat_sheet=$('<ul>')
 var state=main.behaviour.state
  for (var s in state){
    cheat_sheet.append($('<li>').html(s+'<a class="type" onclick="loadHelp(\''+state[s].type+'\')" href="#">'+state[s].type+'</span>'))
  }
  
  tr.append($('<td style="vertical-align: top;">').append(code))
  tr.append($('<td class="cheatsheet">').append("<h3>"+current_language.current_objects+"</h3>").append(cheat_sheet))
  
  $('#dialog #content').html(table)
 	
	var editor
	this.editor = CodeMirror.fromTextArea(code[0], {
		tabMode: "indent",
		matchBrackets: true,
		theme: "lesser-dark",
		extraKeys: {
				"F10": function() {
					$('.CodeMirror').toggleClass('CodeMirror-fullscreen')
					editor.refresh()
				},
				"Esc": function() {
					$('.CodeMirror').removeClass('CodeMirror-fullscreen')
					editor.refresh()
				}
		}
	});
	$('#custom_buttons').append('<a href="#" id="rollback" lid="rollback">Rollback</a>')
	$('#rollback').click(function(){
		codigo=that.params['code_default']
		that.editor.setValue(codigo)
		that.editor.refresh()})
	var editor=this.editor
	$(editor).focus()
	
	$(editor).find('.CodeMirror-scroll').attr('height: 100%;')
	
}

python_accept_configure = function(){
	if(codigo!=""){
		this.params['code']=codigo;
	}
	else{
		  this.params['code']=this.editor.getValue()
	}
	codigo="";
  this.update()
}


var Forward=extend(Action, {paramOptions: [{type:Text,text:current_language.python_action_msg,default:"import time\nclass mov:\n    def __init__(self):\n        import serial\n        self.freedom=serial.Serial('/dev/ttyACM0', 9600)\n        self.freedom.open()\n        self.command='p' #Stop\n\n    def startSerialSend_W(self):\n        self.command='w'\n        print 'Sending %s' % self.command\n        self.freedom.write(self.command+' \\r\\n')\n\n    def stopSerialSend(self):\n        self.command='p'\n        print 'Sending %s' % self.command\n        self.freedom.write(self.command+' \\r\\n')\n        \n    def close(self):\n        self.freedom.close()\n\na = mov()\na.startSerialSend_W()\ntime.sleep(1)\na.stopSerialSend()\na.close()",name:'code'},{type:String,text:'nombre',name:'code_default',default:"import time\nclass mov:\n    def __init__(self):\n        import serial\n        self.freedom=serial.Serial('/dev/ttyACM0', 9600)\n        self.freedom.open()\n        self.command='p' #Stop\n\n    def startSerialSend_W(self):\n        self.command='w'\n        print 'Sending %s' % self.command\n        self.freedom.write(self.command+' \\r\\n')\n\n    def stopSerialSend(self):\n        self.command='p'\n        print 'Sending %s' % self.command\n        self.freedom.write(self.command+' \\r\\n')\n        \n    def close(self):\n        self.freedom.close()\n\na = mov()\na.startSerialSend_W()\ntime.sleep(1)\na.stopSerialSend()\na.close()"},{type:String,text:'nombre',name:'nombre',show:true,default:"Forward"}]})
Forward.prototype.configure=python_configure
Forward.prototype.acceptConfigure=python_accept_configure
main.behaviour.nodeFactory.add('forward',Forward)
})()