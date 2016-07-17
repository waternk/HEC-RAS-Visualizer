#pragma once

#include <string>
#include <stdio.h>
#include "Parser.h"

using namespace std;

class MyFile
{
public:
	bool ReadString(string &str)
	{
		const int bufSize = 1000;
		static char buffer[bufSize];
		if( fgets(buffer, bufSize, _file) == NULL ) return false;

		char *withoutEndOfLine = strtok(buffer, "\n");

		if( withoutEndOfLine != NULL ) str = withoutEndOfLine;
		else str = "";

		CParser::RemoveCR(str);
		return true;
	};

	bool Open(string fileName, string flags)
	{
		_path = fileName;
		_file = fopen(fileName.c_str(), flags.c_str());

		if( _file != NULL ) return true;

		return false;
	}

	operator FILE *()
	{
		return _file;
	}

	void WriteString(const string &str)
	{
		fprintf(_file, "%s", str.c_str());
	}

	void Close()
	{
		fclose(_file);
	}

	long int GetPosition()
	{
		return ftell(_file);
	}

	void Seek(long int offset, long int origin)
	{
		fseek(_file, offset, origin);
	}

	inline string GetFilePath()
	{
		return _path;
	}

protected:
	string _path;
	FILE *_file;
};