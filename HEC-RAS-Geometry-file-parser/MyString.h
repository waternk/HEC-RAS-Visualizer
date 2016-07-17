#pragma once

#include <string>
#include <stdarg.h>
#include <algorithm>
#include <stdio.h>
#include <iostream>

using namespace std;

class MyString : public std::string
{
public:
	MyString() : string()
	{
	}

	MyString(const char *str) : string(str)
	{
	}

	MyString(const string &str) : string(str)
	{
	}

	void Format(const char *format, ...)
	{
		va_list argList;
		va_start(argList, format);

		FormatV(format, argList);

		va_end(argList);
	}

	void FormatV(const char *format, va_list &argList)
	{
		static char s[1000];
		vsprintf(s, format, argList);
		*this = s;
	}

	void ReleaseBuffer()
	{
		resize(0);
	}

	int GetLength()
	{
		return this->length();
	}

	void Delete(int position, int length)
	{
		this->erase(position, length);
	}

	operator const char *()
	{
		return this->data();
	}

	void Replace(char oldChar, char newChar)
	{
		std::replace(begin(), end(), oldChar, newChar);
	}

	string Left(int length)
	{
		return substr(0,length);
	}

	string Mid(int nFirst)
	{
		return substr(nFirst);
	}

	string Mid(int nFirst, int nCount)
	{
		return substr(nFirst, nCount);
	}

	size_t Find(string str)
	{
		return find(str);
	}

	void TrimLeft() 
	{
		this->erase(this->begin(), std::find_if(this->begin(), this->end(), std::ptr_fun<int, int>(std::isgraph)));
		//this->erase(this->begin(), std::find_if(this->begin(), this->end(), std::bind1st(std::not_equal_to<char>(), ' ')));
	}

	void TrimRight()
	{
		this->erase(std::find_if(this->rbegin(), this->rend(), std::ptr_fun<int, int>(std::isgraph)).base(), this->end());
		//this->erase(std::find_if(this->rbegin(), this->rend(), std::bind1st(std::not_equal_to<char>(), ' ')).base(), this->end());
	}

	void Trim()
	{
		this->TrimLeft();
		this->TrimRight();
	}

	void Remove(char c)
	{
		this->erase(std::remove(this->begin(), this->end(), c), this->end());
	}

};