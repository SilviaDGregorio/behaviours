# Tutorial
# How to make a behaviours plugin

This tutorial follows the steps you should take to create a new plugin in behaviours, having as a reference the plugin "AisoyMov" that we created. This plugin creates an interface to control the movement of [Aisoy1](www.aisoy.es)

## Boilerplate: taking the basic plugin

Instead of creating our plugin from scratch, we can use the [Basic plugin](https://github.com/davidmoreno/behaviours/tree/master/plugins/basic) as a boilerplate.

The server side of the plugin is just a class named *TestBasic* derived from Action, so we are going to change its name to fit our needs:

```c++
// interface.hpp
class Interface : public AB::Action{
public:
	Interface(const char* type);
	virtual void exec();
};

// interface.cpp
void ab_init(void){
	DEBUG("Loaded ab init at basic example");
	AB::Factory::registerClass<Interface>("interface");
}

Interface::Interface(const char* type): Action(type)
{}

void Interface::exec()
{
	INFO("Exec interface %p",this);
}
```

The client side of the plugin is a XML file with the interface definition:

```xml
<node-description id="interface">
	<name lang="en">Interface</name>
	<description lang="en">Just shows a message on console</description>

	<type>action</type>
	<icon>test</icon>
</node-description>
```

As we can see, *ab_init* registers the *Interface* class and links it with the node with id *interface*.

Now we are ready for adding some extra behaviour to the plugin.

## Adding Javascript

To have a plugin that actually does anything, we need to link a Javascript file to the XML definition. To do this, we create a file named *interface.js* in *static/js/* and we add the following line to our XML file, just before closing `node-description`:

```xml
<js>interface.js</js>
```

While the Javascript file is empty, the plugin works exactly the same, so we are going to add something to it.

Remember also to add the js folder to *CMakeLists.txt*, as we will cover in the [] section

We can overwrite our current XML file just by writing a couple of lines in *interface.js*:

```js
var InterfaceAction=extend(Action)
main.behaviour.nodeFactory.add('interface',InterfaceAction)
```

This has not changed the behaviour yet, but it allows us to do whatever we want with the node.

Now we can, for example, show a dialog when the node is activated:

```js
var showInterface=function(){
	main.showDialog()
	// [ ... ] whatever we want it to show
}

var InterfaceAction=extend(Action)

InterfaceAction.prototype.activate=showInterface //<------- we overwrite the "activate" function

main.behaviour.nodeFactory.add('interface',InterfaceAction)
```

## Parameters

Our interface needs to control Aisoy1's movement, so we need to have 4 actions that make the movements. We will create these later, but now we need to add attributes to the node so that we can call those actions later.

To add attributes to the node, we need to write some functions in the server side, so that the server knows what attributes should expect and how to handle them. We also need to change the object creation, adding the attributes' type and default values.

In our *Interface* class (in the server), we need to overwrite the functions `attr`, `setAttr` and `attrList`; and tell them that we need five attributes:
* forwards -> will contain the action that will execute a forward movement.
* backwards -> will contain the action that will execute a backward movement.
* left -> will contain the action that will execute a left movement.
* right -> will contain the action that will execute a right movement.
* name -> will contain the name that the node will show.

These functions should be overwritten always in the same way, so you just need to copy&paste, and change the attributes' names. After adding these functions, *Interface* will look like this:

```c++
//interface.hpp
class Interface : public AB::Action{
public:
	Interface(const char* type);

	virtual void setAttr(const std::string& name, AB::Object obj);
    virtual AB::Object attr(const std::string& name);
    virtual AB::AttrList attrList();
	
	virtual void exec();
private:
	std::string forwards;
	std::string backwards;
	std::string left;
	std::string right;
	std::string name;
};

//interface.cpp
using namespace AB; // this is for the to_object and object2string functions

void ab_init(void){
	DEBUG("Loaded ab init at basic example");
	AB::Factory::registerClass<Interface>("interface");
}

Interface::Interface(const char* type): Action(type)
{
	forwards = "";
	backwards = "";
	left = "";
	right = "";
	name = "Interface";	
}

void Interface::exec()
{
	INFO("Exec interface %p",this);
}

AB::AttrList Interface::attrList()
{
  AB::AttrList l;
  l.push_back("forwards");
  l.push_back("backwards");
  l.push_back("left");
  l.push_back("right");
  l.push_back("name");
  return l;
}

void Interface::setAttr(const std::string &k, AB::Object s)
{
	if(k == "forwards"){
	  forwards=object2string(s);
	}
	else if (k == "backwards")
	{
		backwards=object2string(s);
	}else if (k == "left")
	{
		left=object2string(s);
	}else if (k == "right")
	{
		right=object2string(s);
	}else if (k == "name")
	{
		name=object2string(s);
	}
	else Action::setAttr(k,s);
}

AB::Object Interface::attr(const std::string &k)
{
	if (k == "forwards")
	{
		return to_object(forwards);
	}
	else if (k == "backwards")
	{
		return to_object(backwards);
	}
	else if (k == "left")
	{
		return to_object(left);
	}
   	else if (k == "right")
	{
		return to_object(right);
	}else if (k == "name")
	{
		return to_object(name);
	}
	else return Action::attr(k);
}
```

Be careful about the `namespace` part, you need it to call the conversion functions.

Now we need to tell the interface that this node has those attributes. We do so by passing the constructor an argument with a list called *paramOptions*, where we will list the attributes and their types.

```js
var InterfaceAction=extend(Action, {paramOptions:[
    {type:String,text:'forwards',name:'forwards'},
    {type:String,text:'backwards',name:'backwards'},
    {type:String,text:'left',name:'left'},
    {type:String,text:'right',name:'right'},
    {type:String,text:'name',name:'name',default:"Interface"}
  ]})
```
The last attribute should be the name because the system uses the value of the last parameter as name.

Each attribute in *paramOptions* should have, at least, the following items:
* `type`: can be Array, Number, Text or any other thing. If it is one of the predefined types, the default configuration menu will show a predefined look (if it is an Array, a dropdown; if it is a Number, a slider; and if it is a Text, a textarea). If the type is not one of the predefined ones, it will show a simple textbox.
* `text`: name of the parameter that will be shown in the configuration menu.
* `name`: name of the parameter that the server expects.
* `default`: default value of the parameter.

## Icons

If we want the node to have an icon, we must store a PNG file named as the node id in the folder *static/img*. In our node, it will be *static/img/interface.png*. A good size for the icon is 32x32 pixels.

Remember also to add the img folder to *CMakeLists.txt*, as we will cover in the [] section

## Adding movement nodes
## BlockingAction
## CMakeLists

Add it to the plugins/CMakeLists.txt 

##### Hay que hacer un diff para ver los cambios exactos en el CMakeLists
