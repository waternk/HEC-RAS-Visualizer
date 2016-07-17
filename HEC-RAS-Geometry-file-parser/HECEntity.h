#pragma once

#include "MyString.h"

class CHECEntity
{
public:
	CHECEntity& operator =(const CHECEntity &other);
	CHECEntity();
	virtual ~CHECEntity() = 0;

	int m_nID;
	MyString m_sName;
};
