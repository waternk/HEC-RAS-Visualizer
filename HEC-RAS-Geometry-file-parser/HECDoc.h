#pragma once

#include "HECEntityCollection.h"
#include "Junction.h"
#include "Reach.h"
#include "CrossSection.h"
#include "Parser.h"
#include "Errors.h"
#include <cassert>

#define MAX_MANNING_COUNT 100

class CHECDoc  
{
public:
	int CalculateInitialElevations();
	void SetManningMap(double ManningMap[][2], int nManningCount);
	int ExportCSV(MyFile &CrossSectionDest, MyFile &CrossSectionPointDest);
	int ExportFEQUTL(MyString &sDefaultsFolder, MyFile &Dest, bool manningMarkers);
	int ExportFEQ(MyString &sSourceFolder, MyString &sDestFolder, MyFile &Dest, 	bool initialFlowMarkers);
	int LoadProtocol(MyFile &protocolFile);
	int Load(MyFile &Source);
	void DeleteContents();
	void OnNewDocument();
	CHECDoc();
	virtual ~CHECDoc();
	CHECEntityCollection<CJunction> m_Junctions;
	CHECEntityCollection<CReach> m_Reaches;
	CHECEntityCollection<CCrossSection> m_CrossSections;

protected:
	int WriteOutputFiles(MyFile &Dest);
	bool CalculateUpstreamElevations(CJunction &Junction, double dDownElevation, double dDownLength, double &dUpElevation, double &dUpLength);
	int CalculateInitialFlows(MyArray<int,int> &ReachOrder);
	CJunction* GetUpJunction(const MyString &sReachName);
	CJunction* GetDownJunction(const MyString &sReachName);
	CReach & GetReach(const MyString &sName);
	int WriteElevationFlow(MyString &sSourceFolder, MyString &sDestFolder, MyFile &Dest);
	int WritePrescribedFlows(MyString &sSourceFolder, MyString &sDestFolder, MyFile &Dest);
	int WriteFreeNodes(MyFile &Dest);
	int WriteBackwaterAnalysis(MyFile &Dest, bool initialFlowMarkers);
	int GetReachOrder(MyArray<int,int> &ReachOrder);

	

	static double m_ManningMap[MAX_MANNING_COUNT][2];
	int m_nManningCount;

	int m_nStartYear, m_nStartMonth, m_nStartDay;
	float m_fStartHour;
	int m_nEndYear, m_nEndMonth, m_nEndDay;
	float m_fEndHour;

	int m_nRestart;
};
