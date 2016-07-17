#include "HECEntity.h"

CHECEntity::CHECEntity()
{

}

CHECEntity::~CHECEntity()
{

}

CHECEntity& CHECEntity::operator =(const CHECEntity &other)
{
	m_nID = other.m_nID;
	m_sName = other.m_sName;

	return(*this);
}
