
require(['node','jquery','main'],function(node, $, main){
  var min=0.1
  var max=100
  var slidervalue=0.5
  var timeout_configure = function(){

    var that = this
    this.configureDialogSetup()
    var p=this.paramOptions
    var ul=$('<ul>')
    var li=$('<li>')
    var i=0

    ul.append(li)
    inpt=$('<div>').attr('id',i)
    li.append(inpt)
    var slider=$('<div>').slider({value:512, max:1024})
    inpt.append(slider)
    var value_=$('<div>').attr('min',min).attr('max',max).attr('id','label'+i)
    var updateSlide = function(event, ui){
      var lbl=$(event.currentTarget).next()
      var val=ui.value
      if (lbl.attr('max') && lbl.attr('min')){
        val=(val/1024.0) * (Number(lbl.attr('max'))-Number(lbl.attr('min'))) + Number(lbl.attr('min'))
      }
      val=Math.round(val*100)/100.0
      lbl.text(val)

    }

    slider.bind('slide', updateSlide)
    slider.bind('slidechange', updateSlide)

    value_.text($("#"+this.id+" #param").text())

    inpt.append(value_)
    inpt.val = function(n){
      if (n==null){
        n=Number($(this).find('#label'+i).text())
        return n
      }
      var iN=Math.ceil((n-Number(p[i].min))/(p[i].max-p[i].min) *1024)
          //console.log("set slider to "+n+" "+iN)
          $(this).find('div:first').slider('value',iN )
        }








      $('#dialog #title').html(current_language.configuration_of+this.type+' <span class="name">(object id '+this.id+')</span>')
      $('#dialog #content').html(ul)
      $('#dialog #content #0 .ui-slider-handle').css('left',slidervalue+'%')

    }

    timeout_accept_configure = function(){

      this.params=this.getParams()

      this.update()
    }
    timeout_realtime_update = function(){
      this.params=this.getParams()      
    }

    timeout_getParams = function(){
      var that= this
      var p=this.paramOptions
      if (p){
        var params={}
        for(var i in p){
          if(this.id.indexOf(this.type)==-1){

            var val=$('#dialog #content #'+i).val()
            if(i==0){
              val=$('#dialog #content #'+i+' #label0').text()
              slidervalue=val
            }

            if(val){
              params[p[i].name]=val 
              if(p[i].name=="timeout"){
               $('#dialog #content #'+i+' .ui-slider-handle').css('left',val+'%')
             }
          }
        }
      }
      return params;
    }
    return {}

  }

  timeout_update=function(){
    if (!this.params)
      return    
      
  
    var txt=[]
    for(var i=0;i<this.paramOptions.length;i++){
      if(this.paramOptions[i].name=="timeout"){
        var t=this.params[this.paramOptions[i].name];
        if(!t){
          t=$("#"+this.id+" #param").text()
        }
        txt.push(t);

      }

    }

      txt=txt.join(' · ')
      this.width=txt.length*25*2

      $('#'+this.id+' text#param').text(txt)
      
      $('#'+this.id+' rect').attr('width',this.width)
  }

  
  var timeoutEvent=node.extend(node.Event, {paramOptions: [{type:Number,min:0.1,max:100,default:0.5,name:"timeout"}]})



  timeoutEvent.prototype.configure=timeout_configure
  timeoutEvent.prototype.acceptConfigure=timeout_accept_configure
  timeoutEvent.prototype.realtime_update=timeout_realtime_update
  timeoutEvent.prototype.update=timeout_update
  timeoutEvent.prototype.getParams=timeout_getParams


  main.behaviour.nodeFactory.add('timeout',timeoutEvent)
})()
