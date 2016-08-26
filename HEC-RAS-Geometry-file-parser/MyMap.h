#pragma once

#include <map>

using namespace std;

template<class KEY_TYPE, class ARG_KEY_TYPE, class VALUE_TYPE, class ARG_VALUE_TYPE>
class MyMap : public map<KEY_TYPE,VALUE_TYPE>
{
public:
	bool Lookup(KEY_TYPE key, VALUE_TYPE &value)
	{
		typename map<KEY_TYPE,VALUE_TYPE>::iterator it;

		if( (it = this->find(key)) != this->end())
		{
			value = it->second;
			return true;
		}

		return false;
	}

	inline void RemoveKey()
	{
		this->clear();
	}

	inline void RemoveKey(int& key)
	{
		this->clear();
	}

	inline void RemoveAll()
	{
		this->clear();
	}

	inline void SetAt(KEY_TYPE key, ARG_VALUE_TYPE value)
	{
		(*this)[key] = value;
	}

	inline typename map<KEY_TYPE, VALUE_TYPE>::const_iterator GetStartPosition()	const
	{
		return this->begin();
	}

	inline void GetNextAssoc(typename map<KEY_TYPE, VALUE_TYPE>::const_iterator &it, KEY_TYPE &key, VALUE_TYPE &value) const
	{
		key = it->first;
		value = it->second;

		advance(it,1);
	}

	inline int GetCount()	{ return this->size(); }
};