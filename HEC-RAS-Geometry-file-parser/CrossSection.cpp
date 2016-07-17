#include "CrossSection.h"

#define POINT_TOLERANCE 0.01

CCrossSection::CCrossSection()
{
	m_bLevee = false;

	m_sPrescFlowFile = "";
	m_sElevationFlowFile = "";

	m_Skip = false;
}

CCrossSection::~CCrossSection()
{

}

CCrossSection& CCrossSection::operator =(const CCrossSection &other)
{
	CHECEntity::operator=(other);

	m_ReachID = other.m_ReachID;
	//m_dDownStreamLength = other.m_dDownStreamLength;
	m_sDescription = other.m_sDescription;
	m_HECStation = other.m_HECStation;

	m_dStation = other.m_dStation;

	m_bLevee = other.m_bLevee;
	m_nLeveeInd = other.m_nLeveeInd;
	m_dLeveeOffset = other.m_dLeveeOffset;
	m_dLeveeElevation = other.m_dLeveeElevation;

	m_Points.RemoveAll();
	m_Points.Copy(other.m_Points);

	m_ManningPoints.RemoveAll();
	m_ManningPoints.Copy(other.m_ManningPoints);

	m_sPrescFlowFile = other.m_sPrescFlowFile;
	m_sElevationFlowFile = other.m_sElevationFlowFile;

	m_Skip = other.m_Skip;

	lobala_x = other.lobala_x;
	lobala_z = other.lobala_z;
	dobala_x = other.dobala_x;
	dobala_z = other.dobala_z;

	return(*this);
}

int CCrossSection::Load(MyFile &geometryFile)
{
	MyString sLine;
	int i;

	geometryFile.ReadString(sLine);

	if( sLine == "BEGIN DESCRIPTION:" )	//BEGIN DESCRIPTION:
	{
		geometryFile.ReadString(m_sDescription);
		//END DESCRIPTION:
		geometryFile.ReadString(sLine);
		while( sLine != "END DESCRIPTION:" )
		{
			m_sDescription += "\\n" + sLine;
			geometryFile.ReadString(sLine);
		}

		geometryFile.ReadString(sLine);
	}

	if ( sLine.Left(17) == "XS GIS Cut Line=2")
	{
		geometryFile.ReadString(sLine);
		sscanf(sLine.c_str(),"%16lf", &lobala_x);
		sLine.Delete(0,16);
		sscanf(sLine.c_str(),"%16lf", &lobala_z);
		sLine.Delete(0,16);
		sscanf(sLine.c_str(),"%16lf", &dobala_x);
		sLine.Delete(0,16);
		sscanf(sLine.c_str(),"%16lf", &dobala_z);
		sLine.Delete(0,16);
	}

	if( sLine.Left(9) == "Node Name" )
	{
		m_sName = sLine.Mid(10);
		m_sName.TrimRight();
	}

	//#Sta/Elev= 472
	do
	{
		geometryFile.ReadString(sLine);
	} while (sLine.Left(9)!= "#Sta/Elev");

	int nStationCount = atoi(sLine.Mid(10).c_str());
	m_Points.SetSize(nStationCount);

	sLine = "";
	for(i = 0; i < m_Points.GetCount(); i++)
	{
		CCrossSectionPoint &Point = m_Points[i];

		if( sLine.GetLength() < 8 ) geometryFile.ReadString(sLine);

		sscanf(sLine.Left(8).c_str(),"%8lf", &Point.m_dOffset);
		sLine.Delete(0,8);
		sscanf(sLine.Left(8).c_str(),"%8lf", &Point.m_dElevation);
		sLine.Delete(0,8);

		// Clean coincident points
		if( i > 0 )
		{
			CCrossSectionPoint &previousPoint = m_Points[i-1];
			if( fabs(Point.m_dOffset-previousPoint.m_dOffset) < POINT_TOLERANCE &&
				fabs(Point.m_dElevation-previousPoint.m_dElevation) < POINT_TOLERANCE )
			{
				m_Points.RemoveAt(i);
				i--;
			}
		}
	}

	//#Mann= 3 , 0 , 0
	int nManningCount;
	geometryFile.ReadString(sLine);
	sscanf(sLine.Mid(6).c_str(),"%u", &nManningCount);

    //-150     .03       0      50     .04       0   600.3     .05       0
	TManningPoint ManningPoint;
	m_ManningPoints.SetSize(nManningCount);
	sLine = "";
	for(i = 0; i < nManningCount; i++)
	{
		if( sLine.GetLength() < 8 ) geometryFile.ReadString(sLine);

		sscanf(sLine.Left(8).c_str(),"%8lf", &ManningPoint.m_dStartOffset);
		sLine.Delete(0,8);
		sscanf(sLine.Left(8).c_str(),"%8lf", &ManningPoint.m_dManning);
		sLine.Delete(0,8);
		sscanf(sLine.Left(8).c_str(),"%8lf", &ManningPoint.m_dTmp);
		sLine.Delete(0,8);

		m_ManningPoints[i] = ManningPoint;
	}

	geometryFile.ReadString(sLine);
	if( sLine.Left(6) == "Levee=" )
	{
		m_bLevee = true;
		sscanf(sLine.Mid(6).c_str(),"%d",&m_nLeveeInd);
		sscanf(sLine.Mid(sLine.Find("-1")+3).c_str(),"%lf,%lf",&m_dLeveeOffset,&m_dLeveeElevation);

		geometryFile.ReadString(sLine);
	}

	//Exp/Cntr=0.3,0.1
	geometryFile.ReadString(sLine);

	return(0);
}

double CCrossSection::GetElevation()
{
	if( m_Points.GetCount() == 0 )
	{
		//AfxMessageBox("GetElevation: Cross section has no points.");
		return(0.0);
	}

	double dMinElevation = m_Points[0].m_dElevation;
	for(int i = 1; i < (int)m_Points.GetCount(); i++)
	{
		CCrossSectionPoint &Point = m_Points[i];
		if( Point.m_dElevation < dMinElevation ) dMinElevation = Point.m_dElevation;
	}

	return( dMinElevation );
}


int CCrossSection::WriteToFEQX(MyFile &Dest, const CReach &reach, bool manningMarkers, double ManningMap[][2], int nManningCount)
{
	MyString sLine;
	int i;

	Dest.WriteString("FEQX\n");
	sLine.Format("; HEC station = %f: %s\n", m_HECStation, m_sName.c_str());
	Dest.WriteString(sLine);

	//TABLE#=
//	sLine.Format("TABLE#=%5u EXPAND SAVE12 NEWBETA\n", m_nID);
	sLine.Format("TABLE#=%5u\n", m_nID);
	Dest.WriteString(sLine);

	//STATION=
	sLine.Format("STATION=%10.3f\n", m_HECStation);
	Dest.WriteString(sLine);


	//NAVM=
	sLine.Format("NAVM=%5u\n", 0);
	Dest.WriteString(sLine);

	//NSUB    3     0.140     0.050     0.140
	if(!manningMarkers)
	{
		sLine.Format("NSUB%5u", m_ManningPoints.GetCount());
		Dest.WriteString(sLine);
		double dManning;
		for(i = 0; i < (int)m_ManningPoints.GetCount(); i++)
		{
			if( (i%6 == 0) && (i>0) )	Dest.WriteString("\n         ");

			if( nManningCount == 0 )
				dManning = m_ManningPoints[i].m_dManning;
			else
				dManning = GetManning( m_ManningPoints[i].m_dManning, ManningMap, nManningCount );

			sLine.Format("%10.3f", dManning);
			Dest.WriteString(sLine);
		}
		Dest.WriteString("\n");
	}
	else
	{
		assert(m_ManningPoints.GetCount()==3);
		sLine.Format("NSUB%5u", m_ManningPoints.GetCount());
		Dest.WriteString(sLine);
		MyString mask, bankMask;
		mask.Format("###%u###", reach.m_nID );
		bankMask.Format("###%u###", 100+reach.m_nID );
		sLine.Format("%10s%10s%10s\n", bankMask.c_str(), mask.c_str(), bankMask.c_str());
		Dest.WriteString(sLine);
	}

    //OFFSET ELEVATION SUBS
	Dest.WriteString("OFFSET ELEVATION SUBS\n");

	int nPointCount = m_Points.GetCount();
	CCrossSectionPoint Point;
	for(i = 0; i < nPointCount; i++)
	{
		Point = m_Points[i];

		if(m_bLevee)
		{
			if(m_nLeveeInd == 0 && Point.m_dOffset > m_dLeveeOffset)
			{
				Point.m_dOffset = m_Points[i-1].m_dOffset;
				Point.m_dElevation = m_dLeveeElevation;
				nPointCount = i+1;
			}
			else if (m_nLeveeInd == -1)
			{
				if(Point.m_dOffset < m_dLeveeOffset)
				{
					continue;
				}
				else
				{
					m_nLeveeInd=999;
					Point.m_dOffset = m_Points[i].m_dOffset;
					Point.m_dElevation = m_dLeveeElevation;
					i--;
				}
			}
		}


		int nSubSection = 0;
		while(nSubSection<m_ManningPoints.GetCount()-1 && m_ManningPoints[nSubSection+1].m_dStartOffset <= Point.m_dOffset) nSubSection++;

		if( i == nPointCount-1 ) nSubSection = -2;

		sLine.Format("%10.4f%10.4f%5d\n", Point.m_dOffset, Point.m_dElevation, nSubSection+1);
		Dest.WriteString(sLine);

	}

	if (m_nLeveeInd==999) m_nLeveeInd=-1;

	return(0);
}

int CCrossSection::WriteToCSV(MyFile &CrossSectionPointDest)
{
	MyString sLine;
	int i;

	for(i = 0; i < (int)m_Points.GetCount(); i++)
	{
		CCrossSectionPoint &Point = m_Points[i];

		sLine.Format("%10u,%10u,%10.3f,%10.3f,%10u\n", m_nID, i+1, Point.m_dOffset, Point.m_dElevation, m_nID);
		CrossSectionPointDest.WriteString(sLine);
	}

	return(0);
}

double CCrossSection::GetManning(double m_dManningCode, double ManningMap[][2], int nManningCount)
{
	int i;
/*
	for(i = 0; i < nManningCount; i++)
	{
		if( ManningMap[i][0] == m_dManningCode ) return(ManningMap[i][1]);
	}
*/
	return(1.0);
	assert(false);

	return(0);

}

int CCrossSection::WriteToNetworkMatrix(MyFile &Dest, CHECEntityCollection<CReach> &Reaches)
{
	MyString sLine;

	CReach &reach = Reaches.Get(m_ReachID);

	if		( m_sPrescFlowFile!="")
	{
		Dest.WriteString( MyString("; ")+m_sName+"\n" );
		MyString sDown;

		sDown.Format("U%u",m_ReachID);

		sLine.Format("%5u%5u%5s%4u %5u\n", 6, 1, sDown.c_str(), 1, 99000+m_ReachID);
		Dest.WriteString(sLine);
	}
	else if	( m_sElevationFlowFile !="" )
	{
		Dest.WriteString( MyString("; ")+m_sName+"\n" );
		MyString sUp;

		sUp.Format("D%u", m_ReachID);

		sLine.Format("%5u%5u%5s%5d%4s %5u%33.1f\n", 4, 2, sUp.c_str(), -1, sUp.c_str(), 99999, 0.0);
		Dest.WriteString(sLine);
	}

	return(0);
}
