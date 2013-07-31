# Tutorial
# How to make a behaviours plugin

This tutorial follows the steps you should take to create a new plugin in behaviours, having as a reference the plugin "AisoyMov" that we created. This plugin creates an interface to control the movement of [Aisoy1](www.aisoy.es)

## Boilerplate: taking the basic plugin

Instead of creating our plugin from scratch, we can use the [Basic plugin](https://github.com/davidmoreno/behaviours/tree/master/plugins/basic) as a boilerplate.

The server side of the plugin is just a class named *TestBasic* derived from Action, so we are going to change its name to fit our needs:

```c++
// basic.hpp
class Interface : public AB::Action{
public:
	Interface(const char* type);
	virtual void exec();
};

// basic.cpp
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

## Adding JS (creating the object and params)

To have a plugin that actually does anything, we need to link a Javascript file to the XML definition. To do this, we create a file named *interface.js* in *static/js/* and we add the following line to our XML file, just before closing `node-description`:

```xml
<js>interface.js</js>
```

While the Javascript file is empty, the plugin works exactly the same, so we are going to add something to it.



## Customizing the interface (overwriting functions)
## Adding movement nodes
## BlockingAction
## CMakeLists

Add it to the plugins/CMakeLists.txt 

##### Hay que hacer un diff para ver los cambios exactos en el CMakeLists
