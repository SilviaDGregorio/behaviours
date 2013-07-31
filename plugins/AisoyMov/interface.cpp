/**
 * Behaviours - UML-like graphic programming language
 * Copyright (C) 2013 Coralbits SL & AISoy Robotics.
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as
 * published by the Free Software Foundation, either version 3 of the
 * License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 **/

#include "interface.hpp"
#include <ab/plugin.hpp>
#include <ab/factory.h>
#include <ab/log.h>

using namespace AB;

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