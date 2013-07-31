SET(SOURCES interface.cpp)

add_library(AisoyMov SHARED ${SOURCES})

install(TARGETS AisoyMov 
	LIBRARY DESTINATION lib/ab
	)
	
install(DIRECTORY static/nodes
	DESTINATION share/ab/static/AisoyMov
	)
