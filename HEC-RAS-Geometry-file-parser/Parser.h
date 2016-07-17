#pragma once

#include "MyString.h"

class CParser 
{
public:
	static void CleanString(MyString &String);
	static void RemoveCR(string &String);
	CParser();
	virtual ~CParser();

};
