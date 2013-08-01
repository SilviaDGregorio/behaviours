SET(SOURCES interface.cpp)

add_library(AisoyMov SHARED ${SOURCES})

install(TARGETS AisoyMov 
	LIBRARY DESTINATION lib/ab
	)
	
install(DIRECTORY static/nodes static/js static/img
	DESTINATION share/ab/static/AisoyMov
	)
