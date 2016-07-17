#ifdef _WINDOWS
	#define ERROR(message)	AfxMessageBox(message);
#else
	#define ERROR(message)	printf(message);
#endif
