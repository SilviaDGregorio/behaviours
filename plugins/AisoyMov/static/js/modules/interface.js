(function()
    {

	var InterfaceAction=extend(Action, {paramOptions:[
        {type:String,text:'forwards',name:'forwards'},
        {type:String,text:'backwards',name:'backwards'},
        {type:String,text:'left',name:'left'},
        {type:String,text:'right',name:'right'},
        {type:String,text:'name',name:'name',default:"Interface"}
      ]})
	//var InterfaceAction=extend(Action);

	main.behaviour.nodeFactory.add('interface',InterfaceAction)
})();
