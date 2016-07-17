#ifndef REACH_H
#pragma once

#define REACH_H

#include <stdlib.h>
#include "HECEntity.h"
#include "HECEntityCollection.h"
#include "MyArray.h"
#include "MyFile.h" 


class CCrossSection;

class CReach : public CHECEntity  
{
public:
	int WriteToCSV(MyFile &CrossSectionDest, MyFile &CrossSectionPointDest, CHECEntityCollection<CCrossSection> &CrossSections);
	int WriteToFEQ(MyFile &Dest, CHECEntityCollection<CCrossSection> &CrossSections);
	int Load(MyFile &geometryFile);
	CReach& operator =(const CReach &other);
	CReach(const CReach &other)
	{
		(*this) = other;
	}
	CReach();
	virtual ~CReach();

	inline CReach* Clone() const
	{
		return( new CReach(*this) );
	}

	MyArray<int, int&> m_CrossSectionIDs;

	double m_dLength;
	double m_dInitialFlow;
	int m_AddNode;
	MyString m_sOutputUpElevFile;
	MyString m_sOutputDownElevFile;

};
#endif