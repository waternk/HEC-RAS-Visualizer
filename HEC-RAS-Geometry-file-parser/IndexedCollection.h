#pragma once

#include <cassert>
#include <vector>
#include "MyMap.h"

template <class TYPE>
class CIndexedCollection  
{
public:
	CIndexedCollection();
	virtual ~CIndexedCollection();

	int Init();
	int DeleteContents();
	

	inline int GetNextID()
	{
		return(m_nMaxID+1);
	}


	inline int GetIndex(int ID)
	{
		int nIndex;

		#ifndef _DEBUG
			m_Map.Lookup(ID,nIndex);
		#else
			if(!m_Map.Lookup(ID,nIndex))
			{
				MyString str;
				str.Format("CIndexedCollection::Get internal error: Item %d does not exist!", ID);
				//AfxMessageBox(str,MB_ICONEXCLAMATION);
			}
		#endif

		return(nIndex);
	}
	inline TYPE& Get(int ID)
	{
		return ( *( (TYPE*)m_List[ GetIndex(ID) ] ) );
	}

	inline TYPE& GetAt(int nIndex)
	{
		assert(nIndex>=0);
		assert( nIndex < (int)m_List.size() );
		return ( *( (TYPE*)m_List[nIndex] ) );
	}

	int Add(const TYPE &NewObject,bool Reindex = true)
	{
		m_List.push_back( NewObject.Clone() );
		if(Reindex) m_Map[NewObject.m_nID] = m_List.size()-1;

		if( NewObject.m_nID > m_nMaxID ) m_nMaxID = NewObject.m_nID;

		return(0);
	}

	int Remove(int ID,bool Reindex = true)
	{
		int nIndex = GetIndex(ID);

		delete m_List[nIndex];
		m_List.RemoveAt(nIndex);

		if(Reindex)
		{
			m_Map.RemoveKey(ID);

			int nCount = m_List.size();
			for(int i = nIndex; i < nCount; i++)
				m_Map.SetAt( GetAt(i).m_nID, i);
		}

		return(0);
	}

	inline int RemoveAll()
	{
		int nCount = m_List.size();
		for(int i = 0; i < nCount; i++)
			delete m_List[i];

		m_List.clear();
		m_Map.RemoveAll();
		return(0);
	}

	inline int GetCount()
	{
		return( m_List.size() );
	}

	inline bool IsExist(int nID)
	{
		int nIndex;
		return( m_Map.Lookup(nID,nIndex) );
	}

	CIndexedCollection<TYPE>& operator=(const CIndexedCollection<TYPE> &other)
	{
		m_List.RemoveAll();
		m_List.SetSize( other.m_List.size() );
		m_Map.RemoveAll();

		for(int i = 0; i < (int)other.m_List.size(); i++)
		{
			m_List[i] = ((TYPE*)other.m_List[i])->Clone();
			m_Map[((TYPE*)m_List[i])->m_nID] = i;
		}

		m_nMaxID = other.m_nMaxID;

		return(*this);
	}

protected:
	vector<TYPE*> m_List;
	MyMap<int,int,int,int> m_Map; // relation between element ID and it's position in m_List

	int m_nMaxID;

};

template <class TYPE>
CIndexedCollection<TYPE>::CIndexedCollection()
{

}

template <class TYPE>
CIndexedCollection<TYPE>::~CIndexedCollection()
{
	DeleteContents();
}

template <class TYPE>
int CIndexedCollection<TYPE>::Init()
{
	m_nMaxID=0;

	return(0);
}

template <class TYPE>
int CIndexedCollection<TYPE>::DeleteContents()
{
	RemoveAll();

	return(0);
}