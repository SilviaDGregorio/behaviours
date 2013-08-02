# Tutorial
# How to make a behaviours plugin

This tutorial follows the steps you should take to create a new plugin in behaviours, having as a reference the plugin "AisoyMov" that we created. This plugin creates an interface to control the movement of [Aisoy1](www.aisoy.es).

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

The next thing we want to do is compile the plugin to check that everything is fine.

## Compiling

*Behaviours* uses `CMake` to create the compiling system. To make it work, we need to create a file named *CMakeLists.txt* in the root of our plugin. This file tells CMake the sources, libraries and installation paths that the plugin needs.

```cmake
SET(SOURCES interface.cpp)

add_library(AisoyMov SHARED ${SOURCES})

install(TARGETS AisoyMov 
	LIBRARY DESTINATION lib/ab
)
	
install(DIRECTORY static/nodes static/js static/img
	DESTINATION share/ab/static/AisoyMov
)
```

Notice that we have added *static/js* and *static/img* to the install path. We will need them later to add javascript and images to our nodes.

Once we have this file created, we need to add our plugin to the *plugins* CMakeLists file:

```cmake
# plugins/CMakeLists.txt

add_subdirectory(basic)
add_subdirectory(python2)
add_subdirectory(AisoyMov)

```

And we can compile everything following the normal compilation instructions from [behaviours](https://github.com/davidmoreno/behaviours):

```bash
$ mkdir build
$ cd build
$ cmake ..
$ make 
$ make install
```

Now we are ready for adding some extra behaviour to the plugin.

## Adding Javascript

To have a plugin that actually does anything, we need to link a Javascript file to the XML definition. To do this, we create a file named *interface.js* in *static/js/* and we add the following line to our XML file, just before closing `node-description`:

```xml
<js>interface.js</js>
```

While the Javascript file is empty, the plugin works exactly the same, so we are going to add something to it.

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

## Adding movement nodes

The movement nodes are actions that will execute a python code. This code is predefined and will tell the wheels to go forward, backward, left or right.

To do this, we can use part of the *python2* plugin, so that it works exactly as a python2 plugin, but predefining our code.


Para realizar los movimientos debemos crear como hemos hecho con la Interfaz, una serie de ficheros con el comportamiento de nuestro nuevo nodo. Para entender mejor como funciona crearemos uno de los de movimiento explicando paso a paso como se realiza.

Lo primero de todo es crear los ficheros movement.cpp y movement.hpp donde tendremos la gestión de nuestro nodo.
Además de las funciones de creación del nodo tanto el de la interfaz como el de los movimientos. Para ello utilizaremos un fichero ab_module.cpp , _init_.py y nodes.py que que crean las funcionalidades de nuestro nodo. Son necesarias para el funcionamiento de nuestro plugin.
Se debe copiar y pegar estos tres ficheros en el directorio de nuestro plugin y en ab_module.cpp incluir la librería de nuestro plugin.
	
	//ab_module.cpp
	#include "movement.hpp"

Una vez hecho esto, pasamos a configurar el movement.cpp y el movement.hpp:

	//movement.hpp
	#pragma once

	#include <Python.h>
	#include <ab/object.h>

	namespace AB{
		namespace Interfaz{
			PyObject *object2pyobject(AB::Object &obj);
			Object to_object(PyObject *obj);
		}
	}

	//movement.cpp
	#include <ab/action.h>
	#include <ab/event.h>
	#include <ab/factory.h>
	#include <ab/manager.h>
	#include "movement.hpp"
	#include "interface.hpp"



	namespace AB{

		class Forward : public Action{
			std::string code;
			std::string nombre;
			std::string code_default;
			PyObject *compiled_code;
		public:
			Forward(const char* type);
	    virtual ~Forward();
			virtual void exec();
			
	    virtual AttrList attrList();
	    virtual Object attr(const std::string& name);
	    virtual void setAttr(const std::string& name, Object obj);
			
	    virtual void setManager(Manager* manager);
		};

		namespace Interfaz{
			PyObject *globals;
			PyObject *PyInit_ab(void);
			void python2_init();
			Manager *ab_module_manager=NULL;
		}
	}
Hemos creado nuestra clase Forward que será uno de los movimientos que tiene nuestro plugin. Además utilizamos Interfaz que se comunicará con ab_module.cpp para la creación de nodo.

	void python2_interpreter(FILE *fd){
		sleep(5);
		PyRun_InteractiveLoopFlags(fd, "__stdin__", (PyCompilerFlags*)NULL);
	}
	void ab_init(void){
		DEBUG("Loaded python2 plugin");

		AB::Factory::registerClass<AB::Forward>("forward");

		AB::Factory::registerClass<Interface>("interface");

		AB::Interfaz::python2_init();
		
		//new boost::thread(python2_interpreter, stdin);
	}
	void ab_finalize(void){
		Py_Finalize();
	}



	using namespace AB;
	using namespace AB::Interfaz;

	void AB::Interfaz::python2_init(){
		//TODO PyImport_AppendInittab("ab",PyInit_ab);
		//TODO Py_SetProgramName("behaviours");
		Py_Initialize();
		PyInit_ab();
		
		globals=PyDict_New();
		PyDict_SetItemString(globals, "__builtins__", PyEval_GetBuiltins());	
		
		PyEval_InitThreads();
		
		FILE *init_fd=fopen( AB_PREFIX "/share/ab/AisoyMov/__init__.py", "ro" );
		if (!init_fd){
			ERROR("Could not execute __init__ to set p a proper python2 environment");
		}
		else{
			PyObject *init_ret=PyRun_File(init_fd, "__init__.py", Py_file_input, globals, globals);
			Py_XDECREF(init_ret);
			
			fclose(init_fd);
		}
	}

	Forward::Forward(const char* type): Action(type)
	{
		//Inicialización de las variables
	}

	Forward::~Forward()
	{
		Py_XDECREF(compiled_code);
	}

	void Forward::exec()
	{
		if (code.size()==0)
			return;
		
		PyObject *locals=PyDict_New();
		Py_INCREF(globals);
		
		auto o=to_object(this) ;
		PyDict_SetItemString(locals, "self", object2pyobject( o ));
		
		PyObject *obj=PyEval_EvalCode( (PyCodeObject*)compiled_code, globals, locals);
		if (!obj)
			PyErr_Print();
		else{
			PyObject_Print(obj, stdout, Py_PRINT_RAW);
			Py_DECREF(obj);
		}
		Py_DECREF(globals);
		Py_DECREF(locals);
	}

	AttrList Forward::attrList()
	{
		auto attr=AB::Node::attrList();
		attr.push_back("code");
		attr.push_back("nombre");
		attr.push_back("code_default");
		return attr;
	}

	Object Forward::attr(const std::string& name)
	{
		if (name == "nombre")
		{
			return to_object(nombre);
		}
		else if(name == "code_default"){
			return to_object(code_default);
		}
		else //if(name=="code"){
			return to_object(code);
		
	}

	void Forward::setAttr(const std::string& name, Object obj)
	{
		if (name=="code"){
			code=object2string(obj);
			Py_XDECREF(compiled_code);
			compiled_code=Py_CompileString(code.c_str(), this->name().c_str(), Py_file_input);
			if (!compiled_code)
				PyErr_Print();
		}
		else if (name == "nombre")
		{
			nombre=object2string(obj);
		}
		else if( name =="code_default"){
			code_default=object2string(obj);
		}
		else
			return Action::setAttr(name, obj);
	}

	void Forward::setManager(Manager* manager)
	{
		AB::Node::setManager(manager);
		AB::Interfaz::ab_module_manager=manager;
	}


Seguidamente, necesitamos crear el XML con la definición de nuestro nuevo nodo. Vamos a crear el fichero movement.xml dentro de static/nodes

	//movement.xml
	<node-description id="forward">
		<name lang="en">Forward</name>
		<description lang="en">Executes some movement code</description>
		
		<type>action</type>
		<icon>test</icon>
		
		<icon src="python2action.png"/>
		
		<params>
			<param id="code">
				<type>text</type>
				<description lang="en">Code to be executed on action</description>
			</param>
		</params>

		<js>modules/movement.js</js>
		<js>extra/codemirror.js</js>
		<js>extra/codemirror_python.js</js>

	</node-description>

Donde debemos de tener especial cuidado en el nombre que le pongamos como id, ya que tiene que ser el mismo que le hayamos puesto en el .cpp cuando creamos el nodo en ab_init(void).
Como podemos ver, hemos utilizado varios javascript para nuestro forward que no utilizabamos en interfaz.
Uno de ellos es el propio de nuestro nodo. Codemirror.js y codemirror_python.js los utilizamos en la ventana que incorporará nuestro forward donde podremos escribir código en python. El codemirror.js ya está integrado en nuestro behaviours, pero el codemirror_python.js debemos de copiarlo en la carpeta extras/ de nuestro directorio.
El javascript que nos queda por comentar, es el propio de nuestro nodo. La plantilla sería la misma que en interfaz, pudiendo poner en function todo lo que nuestro nodo debe hacer.

	(function(){

			//Código para implementar la ventana de código

		var Forward=extend(Action, {paramOptions: [{type:Text,text:current_language.python_action_msg,default:print(hola)"},{type:String,text:'nombre',name:'nombre',show:true,default:"Forward"}]})
		Forward.prototype.configure=python_configure
		Forward.prototype.acceptConfigure=python_accept_configure
		main.behaviour.nodeFactory.add('forward',Forward)//Poner el mismo nombre utilizado en .cpp y en el xml "forward"
	}


Una vez realizados los pasos anteriores necesitamos modificar nuestro CMakeList.txt añadiendo los cambios. Para ello añadimos los dos nuevos .cpp que hemos creado y la ruta de enlace del _init_ y python.

	//CMakeList.txt
	SET(SOURCES interface.cpp movement.cpp ab_module.cpp )
	find_library(PYTHON2_LIB NAMES python2.7 PATH ${LIBPATH})
	find_path(PYTHON2_HEADER Python.h ${CMAKE_INCLUDE_PATH} /usr/include/python2.7)
	add_library(AisoyMov SHARED ${SOURCES})

	target_link_libraries(AisoyMov ${PYTHON2_LIB})
	include_directories(${PYTHON2_HEADER})
	link_directories(${PYTHON2_LIB})

	install(TARGETS AisoyMov 
		LIBRARY DESTINATION lib/ab
		)
		
	install(DIRECTORY static/nodes static/js static/img
		DESTINATION share/ab/static/AisoyMov
		)
	install(FILES __init__.py
		DESTINATION share/ab/AisoyMov
		)












----
Xcreate movement.cpp -> copy everything from python and modify to fit --> python2_init change name

Xcopypaste movement.hpp

Xcopypaste ab_module.cpp, __init__.py, Nodes.py

CMakeLists

Xcreate xml

Xcreate movement.js

Xcopypaste js/extras/codemirror



## BlockingAction