#include "Junction.h"
#include "Parser.h"

int CJunction::m_ExternalNodeCount = 0;

CJunction::CJunction()
{
	m_Type = UNDEFINED;

	m_dInitialElevation = -1.0;
	m_dInitialUpstreamElevation = -1.0;

	m_sOutputUpElevFile = "";
	m_sOutputDownElevFile = "";
	m_sOutputFlowFile = "";
	m_sOutputUpVelocityFile = "";
	m_sFeatureParameterFile = "";
	m_sLateralInflowFile = "";
}

CJunction::~CJunction()
{

}

int CJunction::Load(MyFile &geometryFile)
{
	MyString sLine;
	MyString sName;

	//Junct Desc
	geometryFile.ReadString(sLine);
	m_sDescription = sLine.Mid(11,sLine.Find(",")-11);
	//Junct X Y & Text X Y
	geometryFile.ReadString(sLine);

	//Reaches
	while( geometryFile.ReadString(sLine) )
	{
		if( sLine.Find("DUMMY") != std::string::npos ) continue;

		if		( sLine.Left(14) == "Up River,Reach" )
		{
			sName = sLine.Mid(15);
			sName.Trim();
			//CParser::CleanString(sName);
			m_UpReaches.Add(sName);
		}
		else if	( sLine.Left(14) == "Dn River,Reach" )
		{
			sName = sLine.Mid(15);
			sName.Trim();
			//CParser::CleanString(sName);
			m_DownReaches.Add(sName);
		}
		else break;
	}

	//Junc L&A
	geometryFile.ReadString(sLine);

	//ParseDescription(m_sDescription);

	return(0);
}

//void CJunction::ParseDescription(MyString &description)
//{
//	//Set initial elevation if prescribed
//	if	( description.Find("JT_INITIAL_ELEVATION") >=0 )
//	{
//		MyString sElevation;
//		sElevation = description.Mid(description.Find("JT_INITIAL_ELEVATION")+20);
//		sscanf(sElevation,"%lf", &m_dInitialElevation);
//	}
//
//	//Set flow if prescribed
//	if	( description.Find("JT_PRESCRIBED_FLOW") >=0 )
//	{
//		m_sPrescFlowFile = description.Mid(description.Find("JT_PRESCRIBED_FLOW")+19);
//		m_sPrescFlowFile = m_sPrescFlowFile.Left(m_sPrescFlowFile.Find(")"));
//	}
//
//	//Set initial upsream elevation if prescribed
//	if	( description.Find("JT_INITIAL_UPSTREAM_ELEVATION") >= 0 )
//	{
//		MyString sInitialUpstreamElevation;
//		sInitialUpstreamElevation = description.Mid(description.Find("JT_INITIAL_UPSTREAM_ELEVATION")+29);
//		sscanf(sInitialUpstreamElevation,"%lf", &m_dInitialUpstreamElevation);
//	}
//}
//

CJunction& CJunction::operator =(const CJunction &other)
{
	CHECEntity::operator=(other);

	m_sDescription = other.m_sDescription;
	m_Type = other.m_Type;

	m_dInitialElevation = other.m_dInitialElevation;

	m_dInitialUpstreamElevation = other.m_dInitialUpstreamElevation;
	m_dInflow = other.m_dInflow;

	m_sOutputUpElevFile =  other.m_sOutputUpElevFile;
	m_sOutputDownElevFile = other.m_sOutputDownElevFile;
	m_sOutputFlowFile = other.m_sOutputFlowFile;
	m_sOutputUpVelocityFile = other.m_sOutputUpVelocityFile;
	m_sFeatureParameterFile = other.m_sFeatureParameterFile;
	m_sLateralInflowFile = other.m_sLateralInflowFile;


	m_UpReaches.RemoveAll();
	m_UpReaches.Copy(other.m_UpReaches);
	m_DownReaches.RemoveAll();
	m_DownReaches.Copy(other.m_DownReaches);

	m_DummyUpNode = other.m_DummyUpNode;
	m_DummyDownNode = other.m_DummyDownNode;
	m_InitialLateralInflow = other.m_InitialLateralInflow;

	return(*this);
}

int CJunction::WriteToNetworkMatrix(MyFile &Dest, CHECEntityCollection<CReach> &Reaches)
{
	MyString sLine;

	Dest.WriteString( MyString("; ")+m_sName+"\n" );

	if( m_Type == UNDEFINED )
	{
		//if		( m_sPrescFlowFile!="" && m_UpReaches.GetSize()==0)
		//{
		//	MyString sDown;
		//	int nDownID;
		//	bool bFound;
		//	bFound = Reaches.FindID(m_DownReaches[0],nDownID);
		//	ASSERT(bFound);

		//	sDown.Format("U%u",nDownID);

		//	sLine.Format("%5u%5u%5s%4u %5u\n", 6, 1, sDown, 1, 99000+nDownID);
		//	Dest.WriteString(sLine);
		//}
		//else 
		if	( m_UpReaches.GetCount()==2 && m_DownReaches.GetCount()==1 )	//Usce 2 u 1
		{
			MyString sUp1,sUp2,sDown;
			int nUp1ID,nUp2ID,nDownID;
			bool bFound;
			bFound = Reaches.FindID(m_UpReaches[0],nUp1ID);
			bFound = Reaches.FindID(m_UpReaches[1],nUp2ID);
			bFound = Reaches.FindID(m_DownReaches[0],nDownID);

			sUp1.Format("D%u",nUp1ID);
			sUp2.Format("D%u",nUp2ID);
			sDown.Format("U%u",nDownID);

			sLine.Format("%5u%5s%5s\n", 3, sUp1.c_str(), sDown.c_str());
			Dest.WriteString(sLine);
			sLine.Format("%5u%5s%5s\n", 3, sUp1.c_str(), sUp2.c_str());
			Dest.WriteString(sLine);
			sLine.Format("%5u%5u%5s%5s%5s\n", 2, 3, sUp1.c_str(), sUp2.c_str(), sDown.c_str());
			Dest.WriteString(sLine);
		}
		else if	( m_UpReaches.GetCount()==3 && m_DownReaches.GetCount()==1 )	//Usce 3 u 1
		{
			MyString sUp1,sUp2,sUp3,sDown;
			int nUp1ID,nUp2ID,nUp3ID,nDownID;
			bool bFound;
			bFound = Reaches.FindID(m_UpReaches[0],nUp1ID);
			bFound = Reaches.FindID(m_UpReaches[1],nUp2ID);
			bFound = Reaches.FindID(m_UpReaches[2],nUp3ID);
			bFound = Reaches.FindID(m_DownReaches[0],nDownID);

			sUp1.Format("D%u",nUp1ID);
			sUp2.Format("D%u",nUp2ID);
			sUp3.Format("D%u",nUp3ID);
			sDown.Format("U%u",nDownID);

			sLine.Format("%5u%5s%5s\n", 3, sUp1.c_str(), sDown.c_str());
			Dest.WriteString(sLine);
			sLine.Format("%5u%5s%5s\n", 3, sUp1.c_str(), sUp2.c_str());
			Dest.WriteString(sLine);
			sLine.Format("%5u%5s%5s\n", 3, sUp1.c_str(), sUp3.c_str());
			Dest.WriteString(sLine);
			sLine.Format("%5u%5u%5s%5s%5s%5s\n", 2, 4, sUp1.c_str(), sUp2.c_str(), sUp3.c_str(), sDown.c_str());
			Dest.WriteString(sLine);
		}
		else if	( m_UpReaches.GetCount()==1 && m_DownReaches.GetCount()==2 )	//Racva 1 u 2
		{
			MyString sUp,sDown1,sDown2;
			int nUpID,nDown1ID,nDown2ID;
			bool bFound;
			bFound = Reaches.FindID(m_UpReaches[0],nUpID);
			bFound = Reaches.FindID(m_DownReaches[0],nDown1ID);
			bFound = Reaches.FindID(m_DownReaches[1],nDown2ID);

			sUp.Format("D%u",nUpID);
			sDown1.Format("U%u",nDown1ID);
			sDown2.Format("U%u",nDown2ID);

			sLine.Format("%5u%5s%5s\n", 3, sUp.c_str(), sDown1.c_str());
			Dest.WriteString(sLine);
			sLine.Format("%5u%5s%5s\n", 3, sDown1.c_str(), sDown2.c_str());
			Dest.WriteString(sLine);
			sLine.Format("%5u%5u%5s%5s%5s\n", 2, 3, sUp.c_str(), sDown1.c_str(), sDown2.c_str());
			Dest.WriteString(sLine);
		}
		else if	( m_UpReaches.GetCount()==1 && m_DownReaches.GetCount()==1)	//Na toku 1 u 1
		{
			MyString sUp,sDown;
			int nUpID,nDownID;
			bool bFound;
			bFound = Reaches.FindID(m_UpReaches[0],nUpID);
			bFound = Reaches.FindID(m_DownReaches[0],nDownID);

			sUp.Format("D%u",nUpID);
			sDown.Format("U%u",nDownID);

			sLine.Format("%5u%5s%5s\n", 3, sUp.c_str(), sDown.c_str());
			Dest.WriteString(sLine);
			sLine.Format("%5u%5u%5s%5s\n", 2, 2, sUp.c_str(), sDown.c_str());
			Dest.WriteString(sLine);
		}
		//else if	( m_DownReaches.GetSize() == 0 )	
		//{
		//	MyString sUp;
		//	int nUpID;
		//	bool bFound;
		//	bFound = Reaches.FindID(m_UpReaches[0],nUpID);

		//	sUp.Format("D%u",nUpID);

		//	sLine.Format("%5u%5u%5s%5d%4s %5u%33.1f\n", 4, 2, sUp, -1, sUp, 99999, 0.0);
		//	Dest.WriteString(sLine);
		//}
	}
	//else if	( m_sDescription.Find("JT_HE_DJERDAP1") >= 0 )	//Djerdap1
	//{
	//	MyString sUp,sDown;
	//	int nUpID,nDownID;
	//	bool bFound;
	//	bFound = Reaches.FindID(m_UpReaches[0],nUpID);
	//	bFound = Reaches.FindID(m_DownReaches[0],nDownID);

	//	sUp.Format("D%u",nUpID);
	//	sDown.Format("U%u",nDownID);

	//	sLine.Format("%5u%5u%5s%5s\n", 2, 2, sUp, sDown);
	//	Dest.WriteString(sLine);
	//	sLine.Format("%5u%5u%5s%5s%4s %5u\n", 16, 1, sUp, sDown, sUp, 99000+nDownID);
	//	Dest.WriteString(sLine);
	//}
	//else if	( m_sDescription.Find("JT_HE_DJERDAP2") >= 0 )	//Djerdap2
	//{
	//	MyString sUp,sDown;
	//	int nUpID,nDownID;
	//	bool bFound;
	//	bFound = Reaches.FindID(m_UpReaches[0],nUpID);
	//	bFound = Reaches.FindID(m_DownReaches[0],nDownID);

	//	sUp.Format("D%u",nUpID);
	//	sDown.Format("U%u",nDownID);

	//	sLine.Format("%5u%5u%5s%5s\n", 2, 2, sUp, sDown);
	//	Dest.WriteString(sLine);
	//	sLine.Format("%5u%5u%5s%5s%4s %5u\n", 16, 2, sUp, sDown, sUp, 99000+nDownID);
	//	Dest.WriteString(sLine);
	//}
	//else if	( m_sDescription.Find("JT_HE_GOGOS") >= 0 )	//Gogos
	//{
	//	MyString sUp,sDown;
	//	int nUpID,nDownID;
	//	bool bFound;
	//	bFound = Reaches.FindID(m_UpReaches[0],nUpID);
	//	bFound = Reaches.FindID(m_DownReaches[0],nDownID);

	//	sUp.Format("D%u",nUpID);
	//	sDown.Format("U%u",nDownID);

	//	sLine.Format("%5u%5u%5s%5s\n", 2, 2, sUp, sDown);
	//	Dest.WriteString(sLine);
	//	sLine.Format("%5u%5u%5s%5s%4s %5u\n", 16, 3, sUp, sDown, sUp, 99000+nDownID);
	//	Dest.WriteString(sLine);
	//}
	else if	( m_Type == IBAR_DAM || m_Type == FOCA_DAM )
	{
		MyString sUp,sDown,sFeedForward;
		int nUpID,nDownID;
		bool bFound;
		bFound = Reaches.FindID(m_UpReaches[0],nUpID);
		bFound = Reaches.FindID(m_DownReaches[0],nDownID);

		sUp.Format("D%u",nUpID);
		sDown.Format("U%u",nDownID);
		sFeedForward.Format("U%u",nUpID);

		sLine.Format("%5u%5u%5s%5s\n", 2, 2, sUp.c_str(), sDown.c_str());
		Dest.WriteString(sLine);
		sLine.Format("%5u%5u%5s%5s%5s%5s\n", m_Type, 1, sUp.c_str(), sDown.c_str(), sUp.c_str(), sFeedForward.c_str());
		Dest.WriteString(sLine);

		Dest.WriteString(m_sFeatureParameterFile+"\n");
	}
	else if	( m_Type == LATERAL_INFLOW )
	{
		MyString sUp,sDown;
		int nUpID,nDownID;
		bool bFound;
		bFound = Reaches.FindID(m_UpReaches[0],nUpID);
		bFound = Reaches.FindID(m_DownReaches[0],nDownID);

		sUp.Format("D%u",nUpID);
		sDown.Format("U%u",nDownID);
		m_DummyUpNode.Format("F%u",++m_ExternalNodeCount);
		m_DummyDownNode.Format("F%u",++m_ExternalNodeCount);

		sLine.Format("%5u%5s%5s\n", 15, m_DummyUpNode.c_str(), m_DummyDownNode.c_str());
		Dest.WriteString(sLine);
		sLine.Format("%5u%5u%5s%5s%5s\n", 2, 3, sUp.c_str(), sDown.c_str(), m_DummyDownNode.c_str());
		Dest.WriteString(sLine);
		sLine.Format("%5u%5s%5s\n", 3, sUp.c_str(), sDown.c_str());
		Dest.WriteString(sLine);
		sLine.Format("%5u%5s%5s\n", 3, sUp.c_str(), m_DummyDownNode.c_str());
		Dest.WriteString(sLine);

		// Prescribed inflow
		sLine.Format("%5u%5u%5s%4u %5u\n", 6, 1, m_DummyUpNode.c_str(), 1, 99000+nDownID);
		Dest.WriteString(sLine);
	}
	else
	{
		//AfxMessageBox("Unknown junction type.");
	}

	return(0);
}