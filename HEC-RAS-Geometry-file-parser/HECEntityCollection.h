#pragma once

#ifndef INDEXED_COLLECTION_H
#define INDEXED_COLLECTION_H

#include "IndexedCollection.h"
#include "MyString.h"

template<class TYPE>
class CHECEntityCollection : public CIndexedCollection<TYPE>  
{
public:
	CHECEntityCollection()
	{
	};

	virtual ~CHECEntityCollection()
	{
	};

	bool FindID(const MyString &sName, int &nID)
	{
		for(int i = 0; i < this->GetCount(); i++)
		{
			TYPE& Element = this->GetAt(i);
			//TRACE(Element.m_sName);
			if( Element.m_sName == sName )
			{
				nID = Element.m_nID;
				return(true);
			}
		}
		return(false);
	}

};
#endif