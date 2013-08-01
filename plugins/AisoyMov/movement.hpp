#pragma once

#include <Python.h>
#include <ab/object.h>

namespace AB{
	namespace Interfaz{
		PyObject *object2pyobject(AB::Object &obj);
		Object to_object(PyObject *obj);
	}
}
