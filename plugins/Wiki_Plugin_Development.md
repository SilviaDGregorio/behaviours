Behaviours internals can be expanded via plugins developed in C++ and HTML5.

Plugins may have two sides: a server side and/or a client side. On the server side plugins can be programmed in C++; on the client side using HTML5 and Behaviour specific files loaded by the client, as node definition XMLs.

There is a simple example at https://github.com/davidmoreno/behaviours/tree/master/plugins/basic . A more complex example is the Python3 plugin: https://github.com/davidmoreno/behaviours/tree/master/plugins/python3 .

Through this document we will refer to the installation path, normally _/usr/_ as _$ABPATH_.

# Directory tree

In order to create a plugin in behaviours, you have to follow a specific directory structure:

Inside the `plugins` directory, create another directory named as the plugin. In this directory, create the C++ files and a `static` folder with three subfolders:

* nodes: Contains xml files with the plugin's nodes' parameters.
* js: Contains javascript files that define the plugin's behaviour in the client side
* img: Contains the images that nodes will use as icons. By default, a node will use as icon an image in png format with the same name as the node.

![Directory tree](https://github.com/fawques/behaviours/raw/62b5115a883e2fc14c340696823a305458edaa6c/plugins/Interfaz/static/img/plugin1.png)

# Plugins server side 

These plugins have access to all the C++ server internals, and can add new nodes to the node factory, as well as modify and add features to the server itself.

C++ Plugins are compiled as shared objects (.so) and installed at _$ABPATH/lib/ab/_.

For each node we create, we will have to create a class representing our node, with the functions needed for it to work and linked with the interface. This class must inherit from either `AB::Action`, `AB::BlockingAction` or `AB::Event`.

As described in [[CPP node basics]], a node must implement the function `exec` or `check` to let the server execute it, and the functions `attrList`, `attr` and `setAttr` to manage attributes.

At load time the `ab_init()` function is called. This function must apear only once in the whole plugin. From this function you can register new nodes types, and/or modify internal processes. In this chapter we will focus on adding new nodes, as is the most common operation; if need for deeper changes arises, reading the source code is recommended. For example, in the aforementioned basic plugin we have:

```c++
    AB::Factory::registerClass<TestBasic>("testbasic");
```

Here we register a new node type with visible name _"testbasic"_, attached to the class TestBasic. In other words when the user creates a node of type "testbasic" it is really instantiating the class TestBasic. TestBasic, as created in this plugin just have the exec method. 

## BlockingAction

Nodes derived from BlockingAction can stop the execution chain and resume it later. This can be done by calling its parent's `exec` method:

```c++
	void Example::exec()
	{
	  INFO("At this point, the server is not stopped yet");
	  AB::BlockingAction::exec();
	  INFO("At this point, the server has been signaled and has resumed");
	}
```

If we want to resume the execution, we must call the function `manager.notifystart`, passing the BlockingAction node as parameter.

# Plugins client side

The client side of the plugins is related to the HTML5 interface, and some files must be created: nodes must be defined in _XML_ files, and then can be modified in _JS_ files linked from the _XML_.

## XML

For each new node we need a xml file describing the interface, for example basic has _$ABPATH/share/ab/static/basictest/nodes/basic.xml_:

```xml
    <node-description id="testbasic">
	    <name lang="en">Test Basic</name>
	    <description lang="en">Just shows a message on console</description>

	    <type>action</type>
		<icon>test</icon>
		<js>example.js</js>
	</node-description>
```

Where the parameter `id`, inside the tag `node-description`, is the identifier of the node. This id is important because it will be used to reference the node throughout the plugin.

`<name>` indicates the name which will appear in the interface, according to the language selected at the navigator.

`<type>` must contain `action` or `event` according to the node type.

At the end of `<node-description>`, `<js>` tags may appear. They will link to the javascript files in the `js` folder.

See [[XML node description]] for more information on this XML file.

## Javascript

Javascript files can access every data stored in the client side of the node, and modify it at will. This means that you can modify the behaviour and look of the node, and overwrite the _XML_ definition.

To change the node behaviour, we must create an object extending from either _Action_ or _Event_ and register it in the `nodeFactory`.

```js
	var Example=extend(Action)
	main.behaviour.nodeFactory.add('xml_id',Example)
```

All nodes (both Actions and Events) inherit from a same class Node. This class has several predefined functions, which can be overwritten in the plugin's nodes:

* `configure`
This function shows a configuration dialog when we create a new node or click on an existing one. By default it lets you edit the parameters.
* `acceptConfigure`
This function sets the configuration parameters modified in configure.
* `activate`
When the node is activated by the interface, this function is executed.
* `deactivate`
When the node is deactivated, this function is executed.
* `setName`
This function changes the node's name, the name by default is `node_` followed by its node number (for example, the first node created will be named _node_0000000000000001_).
* `paint`
This function creates the visual look of the node in the interface.
* `update`
* `getParams`
* `realtime_update`
* `paramOptions`
* `params`
* `t`
* `remove`

The default configuration dialog for a node without parameters shows this:

![Default configuration dialog](https://github.com/fawques/behaviours/raw/62b5115a883e2fc14c340696823a305458edaa6c/plugins/Interfaz/static/img/plugin2.png)  

If we want to give the node a more personalized behaviour, we will have to write javascript code overwriting the previous functions.

For each parameter we want our node to have, we must write it when creating the javascript object. If we take as a reference the webservice plugin, we can see that it has two configuration parameters.

![Custom configuration dialog](https://github.com/fawques/behaviours/raw/62b5115a883e2fc14c340696823a305458edaa6c/plugins/Interfaz/static/img/plugin3.png)

In the webservice javascript code, the object is created as follows:

	var WebService=extend(Action, {paramOptions: 
		[   {type:String, text:'url', name:'url', default:"http://localhost:8081"},
        	{type:String, text:'name', name:'service', default:"webservice"} ]})

Where paramOptions is an array of parameters, and each parameter contains at least:

* `type`: can be Array, Number, Text or any other thing. If it is one of the predefined types, the default configuration menu will show a predefined look (if it is an Array, a dropdown; if it is a Number, a slider; and if it is a Text, a textarea). If the type is not one of the predefined ones, it will show a simple textbox.
* `text`: name of the parameter that will be shown in the configuration menu.
* `default`: default value of the parameter.

Once the node parameters are set, we can interact with them using the former functions. If we do not want the default behaviour of these functions, we need to overwrite them, for example:

	WebService.prototype.activate=function(){
    	var text=this.svggroup.find('text')
    	text.attr('fill','#00ff00')
	}

Webservice overwrites the `activate` function allowing the node to light up and change its color when it is activated.

## Content priorities

On the client side all content is static, and must be installed at _$ABPATH/share/ab/static/[priority-pluginname]_. The static content is searched through all the static folders at _$ABPATH/share/ab/static/_, looking first at highest lexicographical order directories. This means  that if we have these two files:

    $ABPATH/share/ab/static/00-base/index.html
    $ABPATH/share/ab/static/99-plugin/index.html

And the HTML5 interface looks for _/static/index.html_, the server will return the file at _$ABPATH/share/ab/static/99-plugin/index.html_. 

This way, forcing priorities all the HTML5 interface can be changed.