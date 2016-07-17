
#include "CrossSectionPoint.h"

CCrossSectionPoint::CCrossSectionPoint()
{

}

CCrossSectionPoint::~CCrossSectionPoint()
{

}

CCrossSectionPoint& CCrossSectionPoint::operator =(const CCrossSectionPoint &other)
{
	m_dOffset = other.m_dOffset;
	m_dElevation = other.m_dElevation;

	return(*this);
}
