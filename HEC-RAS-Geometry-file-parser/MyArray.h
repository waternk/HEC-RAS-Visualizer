#pragma once

#include <vector>

using namespace std;

template<class TYPE, class ARG_TYPE>
class MyArray : public vector<TYPE>
{
    public:
	inline int Add(TYPE &element)
	{
		this->push_back(element);
		return this->size()-1;
	}

	inline TYPE& ElementAt(int index)
	{
		return (*this)[index];
	}

	inline void RemoveAt(int index)
	{
		this->erase(this->begin()+index);
	}

	inline void InsertAt(int index, TYPE &element)
	{
		this->insert(this->begin()+index,element);
	}

	inline int GetCount() const
	{
		return this->size();
	}

	inline int GetUpperBound() const
	{
		return this->size()-1;
	}

	inline void RemoveAll()	{this->clear(); }

	inline void Copy(const MyArray &other)	{	*this = other; }

	inline void SetSize(int size)
	{
		this->resize(size);
	}

	inline void SetSize(int size, int grow_by)
	{
		this->resize(size);
	}
};
