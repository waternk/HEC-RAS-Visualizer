#pragma once

#ifndef CROSS_SECTION_H
#define CROSS_SECTION_H

#include "HECEntity.h"
#include "CrossSectionPoint.h"
#include "HECEntityCollection.h"
#include "Reach.h"
#include "MyFile.h"
#include <math.h>
#include <cassert>

class CCrossSection : public CHECEntity  
{
public:
	typedef struct
	{
		double m_dStartOffset;
		double m_dManning;
		double m_dTmp;
	} TManningPoint;

public:
	CCrossSection& operator =(const CCrossSection &other);
	CCrossSection(const CCrossSection &other)
	{
		(*this) = other;
	}
	CCrossSection();
	virtual ~CCrossSection();

	inline CCrossSection* Clone() const
	{
		return( new CCrossSection(*this) );
	}


public:
	int WriteToNetworkMatrix(MyFile &Dest, CHECEntityCollection<CReach> &Reaches);
	int WriteToCSV(MyFile &CrossSectionPointDest);
	int WriteToFEQX(MyFile &Dest, const CReach &reach, bool manningMarkers, double ManningMap[][2]=NULL, int nManningCount = 0);
	double GetElevation();
	int Load(MyFile &geometryFile);

	int m_ReachID;
	//double m_dDownStreamLength;
	MyString m_sDescription;
	double m_HECStation;

	double m_dStation;
	bool m_bLevee;
	int m_nLeveeInd;
	double m_dLeveeOffset, m_dLeveeElevation;
	
	MyArray<CCrossSectionPoint, CCrossSectionPoint&> m_Points;
	MyArray<TManningPoint, TManningPoint&> m_ManningPoints;

	MyString m_sPrescFlowFile;
	MyString m_sElevationFlowFile;

	bool m_Skip;
	double lobala_x, lobala_z, dobala_x, dobala_z;
protected:
	static double GetManning(double m_dManningCode, double ManningMap[][2], int nManningCount);

};

#endif