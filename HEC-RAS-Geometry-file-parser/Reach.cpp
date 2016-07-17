
#include "Reach.h"
#include "CrossSection.h"

CReach::CReach()
{
	m_dInitialFlow = 0.0;
	m_AddNode = 0;
	m_sOutputUpElevFile = "";
	m_sOutputDownElevFile = "";
}

CReach::~CReach()
{

}

int CReach::Load(MyFile &geometryFile)
{
	MyString sLine;

	//Reach XY
	geometryFile.ReadString(sLine);
	int nXY = atoi(sLine.Mid(9).c_str());
	// XY
	for(int i = 0; i < nXY/4; i++)
		geometryFile.ReadString(sLine);

	//Rch Text X Y=7444765.0427921,4960585.553334
	geometryFile.ReadString(sLine);
	//Reverse River Text= 0 
	geometryFile.ReadString(sLine);

	return(0);
}

CReach& CReach::operator =(const CReach &other)
{
	CHECEntity::operator=(other);

	m_CrossSectionIDs.RemoveAll();
	m_CrossSectionIDs.Copy(other.m_CrossSectionIDs);

	m_dLength = other.m_dLength;
	m_dInitialFlow = other.m_dInitialFlow;

	m_AddNode = other.m_AddNode;

	m_sOutputUpElevFile = other.m_sOutputUpElevFile;
	m_sOutputDownElevFile = other.m_sOutputDownElevFile;

	return(*this);
}

int CReach::WriteToFEQ(MyFile &Dest, CHECEntityCollection<CCrossSection> &CrossSections)
{
	MyString sLine;

	//BNUM
	sLine.Format("; %s\n", m_sName.c_str());
	Dest.WriteString(sLine);

	sLine.Format("BNUM=%5u INERTIA= 1.0 CFRATE= 0.0 WINDFAC= 1.0 ADDNOD= %5d\n", m_nID, m_AddNode);
	Dest.WriteString(sLine);

	// NODE NodeId__  XNUM   STATION ELEVATION   KA   KD HTAB  AZM   
	Dest.WriteString(" NODE NodeId__  XNUM   STATION ELEVATION   KA   KD HTAB  AZM 10 11 12 13 CCXNUM\n");

	//Nodes
	MyString sNodeLabel;
	for(int i = 0; i < (int)m_CrossSectionIDs.GetCount(); i++)
	{
		CCrossSection &CrossSection = CrossSections.Get( m_CrossSectionIDs[i] );

		if(CrossSection.m_Skip) Dest.WriteString(";");

		if		(i == 0)									sNodeLabel = " UPSTREAM ";
		else if	(i == (int)m_CrossSectionIDs.GetCount()-1 )	sNodeLabel = " DNSTREAM ";
		else												sNodeLabel = "          ";

		
		if( CrossSection.m_sDescription.Find("CCXNUM") != std::string::npos )
		{
			int nCCXNUM;
			MyString sCCXNUM;
			sCCXNUM = CrossSection.m_sDescription.Mid(CrossSection.m_sDescription.Find("CCXNUM")+7);
			sscanf(sCCXNUM,"%u",&nCCXNUM);

			sLine.Format("%5u%10s%5u%10.2f%10.2f                                 %6u\n",
			1000*m_nID+CrossSection.m_nID,
			sNodeLabel.c_str(),
			CrossSection.m_nID,
			CrossSection.m_dStation,
			CrossSection.GetElevation(),
				nCCXNUM);
		}
		else
		{
			sLine.Format("%5u%10s%5u%10.2f%10.2f\n",
				1000*m_nID+CrossSection.m_nID,
				sNodeLabel.c_str(),
				CrossSection.m_nID,
				CrossSection.m_dStation,
				CrossSection.GetElevation());
		}

		Dest.WriteString(sLine);
	}

   //   -1 
	Dest.WriteString("   -1\n");

	return(0);
}

int CReach::WriteToCSV(MyFile &CrossSectionDest, MyFile &CrossSectionPointDest, CHECEntityCollection<CCrossSection> &CrossSections)
{
	MyString sLine;
	
	for(int i = 0; i < (int)m_CrossSectionIDs.GetCount(); i++)
	{
		CCrossSection &CrossSection = CrossSections.Get( m_CrossSectionIDs[i] );

		sLine.Format("%10d,%10d,%10d,%s,%10d,%10.3f,%10.3f,%10.3f\n",
			CrossSection.m_nID, CrossSection.m_nID, m_nID, CrossSection.m_sDescription.c_str(), 0, CrossSection.m_dStation, 0.0, 0.0);
		//printf("%10d,%10d,%10d,%s,%10d,%10.3f,%10.3f,%10.3f\n", CrossSection.m_nID, CrossSection.m_nID, m_nID, CrossSection.m_sDescription.c_str(), 0, CrossSection.m_dStation, 0.0, 0.0);
		CrossSectionDest.WriteString(sLine);

		CrossSection.WriteToCSV(CrossSectionPointDest);
		
	}

	return(0);
}

