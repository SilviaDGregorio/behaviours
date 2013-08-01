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
