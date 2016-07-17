#include "Parser.h"

CParser::CParser()
{

}

CParser::~CParser()
{

}

void CParser::CleanString(MyString &String)
{
	String.Remove('\t');
	String.Remove(' ');
}

void CParser::RemoveCR(string &String)
{
	String.erase( std::remove(String.begin(), String.end(), '\r'), String.end() );
}
