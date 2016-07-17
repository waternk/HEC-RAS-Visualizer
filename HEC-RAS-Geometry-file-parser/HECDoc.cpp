
#include "HECDoc.h"

double CHECDoc::m_ManningMap[MAX_MANNING_COUNT][2]=
{
	{1.0,0.0575},
	{1.1,0.0575},
	{1.2,0.0575},
	{2.0,0.065},
	{2.1,0.065},
	{2.2,0.065},
	{3.0,0.0575},
	{3.1,0.0575},
	{3.2,0.0575},
	{4.0,0.0475},
	{4.1,0.0475},
	{4.2,0.0475},
	{5.0,0.0475},
	{5.1,0.0475},
	{5.2,0.0475},
	{6.0,0.045},
	{6.1,0.045},
	{6.2,0.045},
	{7.0,0.045},
	{7.1,0.045},
	{7.2,0.045},
	{8.0,0.035},
	{8.1,0.035},
	{8.2,0.035},
	{9.0,0.0275},
	{9.1,0.0275},
	{9.2,0.0275},
	{10.0,0.0275},
	{10.1,0.0275},
	{10.2,0.0275},
	{11.0,0.0275},
	{11.1,0.0275},
	{11.2,0.0275},
	{12.0,0.0275},
	{12.1,0.0275},
	{12.2,0.0275},
	{13.0,0.03},
	{13.1,0.03},
	{13.2,0.03},
	{14.0,0.03},
	{14.1,0.03},
	{14.2,0.03},
	{15.0,0.065},
	{16.0,0.07},
	{17.0,0.15},
	{18.0,0.075},
	{19.0,0.085},
	{20.0,0.09},
	{21.0,0.095},
	{22.0,0.1},
	{23.0,0.105},
	{24.0,0.11},
	{25.0,0.115},
	{26.0,0.12},
	{27.0,0.125},
	{28.0,0.13},
	{29.0,0.14},
	{30.0,0.15},
	{31.0,0.165},
	{32.0,0.027},
	{32.1,0.027},
	{32.2,0.027},
	{33.0,0.027},
	{33.1,0.027},
	{33.2,0.027},
	{34.0,0.028},
	{34.1,0.028},
	{34.2,0.028},
	{35.0,0.065},			
	{36.0,0.075},			
	{37.0,0.085},			
	{38.0,0.095},			
	{39.0,0.1},			
	{40.0,0.11},			
	{41.0,0.125},			
	{42.0,0.13},			
	{43.0,0.14},			
	{44.0,0.165},			
	{45.0,0.0265},
	{45.1,0.0265},
	{45.2,0.0265},	
	{46.0,0.0285},
	{46.1,0.0285},
	{46.2,0.0285},	
	{47.0,0.125},			
	{48.0,0.0325},			
	{49.0,0.1},			
	{50.0,0.11},			
	{51.0,0.14},			

};

CHECDoc::CHECDoc()
{

}

CHECDoc::~CHECDoc()
{

}

void CHECDoc::OnNewDocument()
{
	m_Junctions.Init();
	m_Reaches.Init();
	m_CrossSections.Init();

	//m_nManningCount = 89;
	m_nManningCount = 0;
}

void CHECDoc::DeleteContents()
{
	m_Junctions.DeleteContents();
	m_Reaches.DeleteContents();
	m_CrossSections.DeleteContents();
}

int CHECDoc::Load(MyFile &geometryFile)
{
	MyString sLine;
	int nActiveReachID = 0;
	double firstReachStation;
	bool firstReachStationCalculated;

	while( geometryFile.ReadString(sLine) )
	{
		if( sLine.Find("DUMMY") != std::string::npos)
		{
			nActiveReachID = 0;
			continue;
		}

		if( sLine.Left(10) == "Junct Name" )
		{
			CJunction Junction;
			Junction.m_nID = m_Junctions.GetNextID();
			Junction.m_sName = sLine.Mid(11);
			Junction.m_sName.TrimRight();
			Junction.Load(geometryFile);

			m_Junctions.Add(Junction);
		}
		else if	( sLine.Left(11) == "River Reach" )
		{
			CReach Reach;
			Reach.m_nID = m_Reaches.GetNextID();
			Reach.m_sName = sLine.Mid(12);
			Reach.m_sName = Reach.m_sName.substr(17);
			Reach.m_sName.Trim();
			//CParser::CleanString(Reach.m_sName);
			Reach.Load(geometryFile);

			m_Reaches.Add(Reach);

			nActiveReachID = Reach.m_nID;
			firstReachStationCalculated = false;
		}
		else if	( (sLine.Left(21) == "Type RM Length L Ch R") && (nActiveReachID > 0) )
		{
			MyString sValues = sLine.Mid(23);
			
			CParser::CleanString(sValues);
			
			int nTmp, type;
			//double dTmp, downstreamLength;
			//sscanf(sValues,"%d,%lf,%lf,%lf,%lf",&type,&dTmp,&dTmp,&downstreamLength,&dTmp);
			double dTmp, hecStation;
			
			sscanf(sValues,"%d,%lf,%lf,%lf,%lf",&type ,&hecStation, &dTmp, &dTmp, &dTmp);
			
			hecStation *= 1000.0;

			if( !firstReachStationCalculated )
			{
				firstReachStation = hecStation;
				firstReachStationCalculated = true;
			}

			CReach &Reach = m_Reaches.Get(nActiveReachID);
			
			switch( type )
			{
			case 1:	// Cross-section
				{
 					CCrossSection CrossSection;
					CrossSection.m_ReachID = nActiveReachID;
					CrossSection.m_HECStation = hecStation;
					CrossSection.Load(geometryFile);
					
					// Add first cross section if junction was added before
					if(Reach.m_CrossSectionIDs.GetCount()==0 && firstReachStation > hecStation)
					{
						// Create first cross-section of new reach
						CrossSection.m_nID = m_CrossSections.GetNextID();
						//CrossSection.m_dDownStreamLength = dStation;
						CrossSection.m_dStation = 0.0;
						m_CrossSections.Add(CrossSection);

						// Add first cross-section to new reach
						Reach.m_CrossSectionIDs.Add(CrossSection.m_nID);
					}

					CrossSection.m_nID = m_CrossSections.GetNextID();
					//CrossSection.m_dDownStreamLength = downstreamLength;
					CrossSection.m_dStation = firstReachStation-hecStation;
					m_CrossSections.Add(CrossSection);
					Reach.m_CrossSectionIDs.Add(CrossSection.m_nID);
					Reach.m_dLength = CrossSection.m_dStation;
				}
				break;

			case 5:	// Object
				{
					// Load data
					CJunction newJunction;
					newJunction.m_nID = m_Junctions.GetNextID();

					// Read description
					geometryFile.ReadString(sLine);
					if( sLine == "BEGIN DESCRIPTION:" )	//BEGIN DESCRIPTION:
					{
						geometryFile.ReadString(newJunction.m_sName);
					}

					// Create final cross-section of active reach
					CCrossSection CrossSection = m_CrossSections.GetAt(m_CrossSections.GetCount()-1);
					CrossSection.m_nID = m_CrossSections.GetNextID();
					//CrossSection.m_dDownStreamLength = 0;
					CrossSection.m_dStation = firstReachStation-hecStation;
					m_CrossSections.Add(CrossSection);

					// Add final cross-section to active reach
					Reach.m_CrossSectionIDs.Add(CrossSection.m_nID);
					Reach.m_dLength = CrossSection.m_dStation;

					// Create new reach
					CReach newReach;
					newReach.m_nID = m_Reaches.GetNextID();
					newReach.m_sName.Format("New reach %d", newReach.m_nID);

					nActiveReachID = newReach.m_nID;
					firstReachStation = hecStation;
					firstReachStationCalculated = true;

					// Add new reach
					m_Reaches.Add(newReach);

					// Redirect downstream junctions
					bool found = false;
					for(int i = 0; i < m_Junctions.GetCount(); i++)
					{
						CJunction &Junction = m_Junctions.GetAt(i);
						for(int j = 0; j < Junction.m_UpReaches.GetCount(); j++)
							if( Junction.m_UpReaches[j] == Reach.m_sName )
							{
								Junction.m_UpReaches[j] = newReach.m_sName;
								found = true;
								break;
							}
						if(found) break;
					}

					// Add junction
					newJunction.m_UpReaches.Add(Reach.m_sName);
					newJunction.m_DownReaches.Add(newReach.m_sName);
					m_Junctions.Add(newJunction);
				}
				break;
			}
		}

	}



	return(0);
}

int CHECDoc::LoadProtocol(MyFile &protocolFile)
{
	MyString sLine;

	//Start time
	protocolFile.ReadString(sLine);
	protocolFile.ReadString(sLine);
	sscanf(sLine,"%d%d%d%f", &m_nStartYear, &m_nStartMonth, &m_nStartDay, &m_fStartHour);
	//End time
	protocolFile.ReadString(sLine);
	protocolFile.ReadString(sLine);
	sscanf(sLine,"%d%d%d%f", &m_nEndYear, &m_nEndMonth, &m_nEndDay, &m_fEndHour);

	//Restart
	protocolFile.ReadString(sLine);
	protocolFile.ReadString(sLine);
	sscanf(sLine,"%d", &m_nRestart);

	while(protocolFile.ReadString(sLine))
	{
		sLine.Trim();

		if( sLine.Left(1) == ";") continue;

		if		( sLine == "JT_INITIAL_ELEVATION" )
		{
			MyString sName;
			int nJunctionID;
			protocolFile.ReadString(sName);
			if( !m_Junctions.FindID(sName,nJunctionID) )
			{
				MyString msg;
				msg.Format("Junction %s does not exist.",sName.c_str());
				
				return(-1);
			}
			CJunction &Junction = m_Junctions.Get(nJunctionID);

			protocolFile.ReadString(sLine);
			sscanf(sLine,"%lf",&Junction.m_dInitialElevation);
		}
		else if	( sLine == "JT_INITIAL_UPSTREAM_ELEVATION" )
		{
			MyString sName;
			int nJunctionID;
			protocolFile.ReadString(sName);
			if( !m_Junctions.FindID(sName,nJunctionID) )
			{
				MyString msg;
				msg.Format("Junction %s does not exist.",sName.c_str());
				
				return(-1);
			}
			CJunction &Junction = m_Junctions.Get(nJunctionID);

			protocolFile.ReadString(sLine);
			sscanf(sLine,"%lf",&Junction.m_dInitialUpstreamElevation);
		}
		if		( sLine == "JT_LATERAL_INFLOW" )
		{
			MyString sName;
			int nJunctionID;
			protocolFile.ReadString(sName);
			if( !m_Junctions.FindID(sName,nJunctionID) )
			{
				MyString msg;
				msg.Format("Junction %s does not exist.",sName.c_str());
				
				return(-1);
			}
			CJunction &Junction = m_Junctions.Get(nJunctionID);

			protocolFile.ReadString(Junction.m_sLateralInflowFile);
			Junction.m_Type = CJunction::LATERAL_INFLOW;
		}
		if( sLine == "RT_INITIAL_FLOW" )
		{
			MyString sName;
			int nReachID;
			protocolFile.ReadString(sName);
			sName.Trim();
			//CParser::CleanString(sName);
			if( !m_Reaches.FindID(sName,nReachID) )
			{
				MyString msg;
				msg.Format("Reach %s does not exist.",sName.c_str());
				
				return(-1);
			}
			CReach &Reach = m_Reaches.Get(nReachID);

			protocolFile.ReadString(sLine);
			sscanf(sLine,"%lf",&Reach.m_dInitialFlow);
		}
		if( sLine == "RT_ADDNOD" )
		{
			MyString sName;
			int nReachID;
			protocolFile.ReadString(sName);
			//CParser::CleanString(sName);
			if( !m_Reaches.FindID(sName,nReachID) )
			{
				MyString msg;
				msg.Format("Reach %s does not exist.",sName.c_str());
				
				return(-1);
			}
			CReach &Reach = m_Reaches.Get(nReachID);

			protocolFile.ReadString(sLine);
			sscanf(sLine,"%d",&Reach.m_AddNode);
		}
		else if	( sLine == "BC_PRESCRIBED_FLOW" )
		{
			MyString sName;
			int crossSectionID;
			protocolFile.ReadString(sName);
			if( !m_CrossSections.FindID(sName,crossSectionID) )
			{
				MyString msg;
				msg.Format("CrossSection %s does not exist.",sName.c_str());
				
				return(-1);
			}
			CCrossSection &crossSection = m_CrossSections.Get(crossSectionID);

			protocolFile.ReadString(crossSection.m_sPrescFlowFile);
		}
		else if	( sLine == "BC_ELEVATION_FLOW" )
		{
			MyString sName;
			int crossSectionID;
			protocolFile.ReadString(sName);
			if( !m_CrossSections.FindID(sName,crossSectionID) )
			{
				MyString msg;
				msg.Format("CrossSection %s does not exist.",sName.c_str());
				
				return(-1);
			}
			CCrossSection &crossSection = m_CrossSections.Get(crossSectionID);

			protocolFile.ReadString(crossSection.m_sElevationFlowFile);
		}
		else if	( sLine == "SKIP_CROSS_SECTION" )
		{
			MyString sName;
			int crossSectionID;
			protocolFile.ReadString(sName);
			if( !m_CrossSections.FindID(sName,crossSectionID) )
			{
				MyString msg;
				msg.Format("CrossSection %s does not exist.",sName.c_str());
				
				return(-1);
			}
			CCrossSection &crossSection = m_CrossSections.Get(crossSectionID);
			crossSection.m_Skip = true;
		}
		else if	( sLine == "OUTPUT_UPSTREAM_ELEVATION" )
		{
			MyString sName;
			int nJunctionID;
			protocolFile.ReadString(sName);
			if( !m_Junctions.FindID(sName,nJunctionID) )
			{
				MyString msg;
				msg.Format("Junction %s does not exist.",sName.c_str());
				
				return(-1);
			}
			CJunction &Junction = m_Junctions.Get(nJunctionID);

			protocolFile.ReadString(Junction.m_sOutputUpElevFile);
		}
		else if	( sLine == "OUTPUT_DOWNSTREAM_ELEVATION" )
		{
			MyString sName;
			int nJunctionID;
			protocolFile.ReadString(sName);
			if( !m_Junctions.FindID(sName,nJunctionID) )
			{
				MyString msg;
				msg.Format("Junction %s does not exist.",sName.c_str());
				
				return(-1);
			}
			CJunction &Junction = m_Junctions.Get(nJunctionID);

			protocolFile.ReadString(Junction.m_sOutputDownElevFile);
		}
		else if	( sLine == "OUTPUT_FLOW" )
		{
			MyString sName;
			int nJunctionID;
			protocolFile.ReadString(sName);
			if( !m_Junctions.FindID(sName,nJunctionID) )
			{
				MyString msg;
				msg.Format("Junction %s does not exist.",sName.c_str());
				
				return(-1);
			}
			CJunction &Junction = m_Junctions.Get(nJunctionID);

			protocolFile.ReadString(Junction.m_sOutputFlowFile);
		}
		else if	( sLine == "OUTPUT_UPSTREAM_VELOCITY" )
		{
			MyString sName;
			int nJunctionID;
			protocolFile.ReadString(sName);
			if( !m_Junctions.FindID(sName,nJunctionID) )
			{
				MyString msg;
				msg.Format("Junction %s does not exist.",sName.c_str());
				
				return(-1);
			}
			CJunction &Junction = m_Junctions.Get(nJunctionID);

			protocolFile.ReadString(Junction.m_sOutputUpVelocityFile);
		}
		else if		( sLine == "OUTPUT_REACH_UPSTREAM_ELEVATION" )
		{
			MyString sName;
			int nReachID;
			protocolFile.ReadString(sName);
			sName.Trim();
			//CParser::CleanString(sName);
			if( !m_Reaches.FindID(sName,nReachID) )
			{
				MyString msg;
				msg.Format("Reach %s does not exist.",sName.c_str());
				
				return(-1);
			}
			CReach &Reach = m_Reaches.Get(nReachID);

			protocolFile.ReadString(Reach.m_sOutputUpElevFile);
		}
		else if( sLine == "OUTPUT_REACH_DOWNSTREAM_ELEVATION" )
		{
			MyString sName;
			int nReachID;
			protocolFile.ReadString(sName);
			sName.Trim();
			//CParser::CleanString(sName);
			if( !m_Reaches.FindID(sName,nReachID) )
			{
				MyString msg;
				msg.Format("Reach %s does not exist.",sName.c_str());
				
				return(-1);
			}
			CReach &Reach = m_Reaches.Get(nReachID);

			protocolFile.ReadString(Reach.m_sOutputDownElevFile);
		}
		else if	( sLine == "JT_IBAR_DAM" || sLine == "JT_FOCA_DAM" )
		{
			MyString sName;
			int nJunctionID;
			protocolFile.ReadString(sName);
			if( !m_Junctions.FindID(sName,nJunctionID) )
			{
				MyString msg;
				msg.Format("Junction %s does not exist.",sName.c_str());
				
				return(-1);
			}
			CJunction &Junction = m_Junctions.Get(nJunctionID);

			if		( sLine == "JT_IBAR_DAM" )	Junction.m_Type = CJunction::IBAR_DAM;
			else if	( sLine == "JT_FOCA_DAM" )	Junction.m_Type = CJunction::FOCA_DAM;
			protocolFile.ReadString(Junction.m_sFeatureParameterFile);
		}

	}

	return(0);
}

int CHECDoc::ExportFEQ(MyString &sSourceFolder, MyString &sDestFolder, MyFile &Dest, bool initialFlowMarkers)
{
	int i;
	MyString sLine;

	Dest.WriteString("Unsteady Flow Simulation\n");
	Dest.WriteString("Single Branch System\n");
	Dest.WriteString("Kragujevac, 2006\n");
#ifdef WRITE_COMMENTS
	Dest.WriteString(";\n");
	Dest.WriteString(";NBRA gives the number of branches in the model.\n");
#endif
	Dest.WriteString("RUN CONTROL BLOCK\n");


	//Branches Count
	sLine.Format("NBRA=%5u\n",m_Reaches.GetCount());
	Dest.WriteString(sLine);

#ifdef WRITE_COMMENTS
	Dest.WriteString(";\n");
	Dest.WriteString(";NEX gives the number of exterior nodes in the model.\n");
#endif
	Dest.WriteString("NEX=00002\n");
	Dest.WriteString("SOPER=NO\n");
	Dest.WriteString("POINT=NO\n");
	Dest.WriteString("DIFFUS=NO  \n");
	Dest.WriteString("WIND=NO\n");
	Dest.WriteString("UNDERFLOW=NO\n");
	Dest.WriteString("ZL=0.0\n");

	//Start time
#ifdef WRITE_COMMENTS
	Dest.WriteString(";STIME is the starting time.  year/ month, day/ hour\n");
#endif
	sLine.Format("STIME=%4u/%2u/%2u:%6.3f\n", m_nStartYear,m_nStartMonth,m_nStartDay,m_fStartHour);
	Dest.WriteString(sLine);

	//End time
#ifdef WRITE_COMMENTS
	Dest.WriteString(";ETIME is the ending time in same form as STIME\n");
#endif
	sLine.Format("ETIME=%4u/%2u/%2u:%6.3f\n", m_nEndYear,m_nEndMonth,m_nEndDay,m_fEndHour);
	Dest.WriteString(sLine);

	Dest.WriteString("GRAV=9.8\n");
	Dest.WriteString("NODEID=YES\n");
	Dest.WriteString("SSEPS=0.1\n");
	Dest.WriteString("PAGE=   20\n");
#ifdef WRITE_COMMENTS
	Dest.WriteString(";     EPSSYS=0.05 requires that the corrections for any variable(flow or\n");
	Dest.WriteString(";     depth be less than 5 per cent of the value being corrected.\n");
#endif
	Dest.WriteString("EPSSYS= 0.010\n");
	Dest.WriteString("MKNT=    5\n");
#ifdef WRITE_COMMENTS
	Dest.WriteString(";     PRTINT gives the frequency of full system output.  We have requested\n");
	Dest.WriteString(";     full output at every time step.\n");
#endif
	Dest.WriteString("; Print results every PRTINT step\n");
	Dest.WriteString("PRTINT=00001\n");
	Dest.WriteString("; Printing information (0=enabled, 1=disabled)\n");
	Dest.WriteString("MINPRT=0\n");
	Dest.WriteString("GEQOPT=STDX\n");
	Dest.WriteString("EPSB=0.000005\n");
	Dest.WriteString("MAXIT=   30\n");
#ifdef WRITE_COMMENTS
	Dest.WriteString(";SFAC=5280.\n");
#endif
	Dest.WriteString("SFAC=1.0\n");
#ifdef WRITE_COMMENTS
	Dest.WriteString(";     QSMALL is added to the absolute value of each flow when computing\n");
	Dest.WriteString(";     the relative correction.  Prevents zero divide and prevents\n");
	Dest.WriteString(";     trying to obtain small corrections for flows which are too small\n");
	Dest.WriteString(";     for concern.   In this case 0.01 is a small value of QSMALL and\n");
	Dest.WriteString(";     a value nearer 0.5 of 1.0 would be more appropriate in a real\n");
	Dest.WriteString(";     application.\n");
#endif
	Dest.WriteString("QSMALL=     0.010\n");
#ifdef WRITE_COMMENTS
	Dest.WriteString(";     The following two lines specify the number of frozen time steps\n");
	Dest.WriteString(";     and their length.  The values are used from right to left.\n");
#endif
	if(!m_nRestart)
		Dest.WriteString("IFRZ=    1  1800.0\n");
	else
		Dest.WriteString("IFRZ=    0\n");

#ifdef WRITE_COMMENTS
	Dest.WriteString(";     The following line is used for time step control.  The maximum\n");
	Dest.WriteString(";     time step is 1800 seconds.  The minimum time step is 1 second.\n");
	Dest.WriteString(";     If the weighted sum of the number of iterations gets larger than\n");
	Dest.WriteString(";     3.2 then FEQ multiplies the current time step by 0.5 to get the\n");
	Dest.WriteString(";     new time step.  If the weighted sum of the number of iterations\n");
	Dest.WriteString(";     gets smaller than 2.8 FEQ doubles the current time step for the\n");
	Dest.WriteString(";     new time step.  If the weighted sum of the number of iterations\n");
	Dest.WriteString(";     is between 2.8 and 3.2 FEQ leaves the current time step unchanged.\n");
	Dest.WriteString(";     In computing the weighted sum of the number of iterations to\n");
	Dest.WriteString(";     convergence, FEQ applies a weight of 0.7 to the current weighted\n");
	Dest.WriteString(";     and a weight of 1.0 - .70 = .3 to the current number of iterations\n");
	Dest.WriteString(";     to completion.  The starting value for the weighted sum of\n");
	Dest.WriteString(";     iterations to convergence is 3.0.\n");
#endif
	Dest.WriteString("MAXDT=   300.0  MINDT=     1.0  AUTO= 0.70  SITER=  2.8  HIGH= 3.20  LOW= 3.00  HFAC= 2.00  LFAC= 0.50\n");
	Dest.WriteString("MRE=    0.20\n");
	Dest.WriteString("FAC=    0.00\n");
	Dest.WriteString("DWT=0.05\n");
	Dest.WriteString("BWT=0.50\n");
	Dest.WriteString("CHKGEO=NO\n");
	Dest.WriteString("ISTYLE=NEW\n");
	Dest.WriteString("EXTTOL= 0.0\n");
	Dest.WriteString("SQREPS=1.E30\n");

	if(!m_nRestart)
		Dest.WriteString("PUTFC=Restart.out\n");
	else
		Dest.WriteString("GETIC=Restart.out\n");

	Dest.WriteString("BRANCH DESCRIPTION TABLES\n");


	//Branches
	for(i = 0; i < m_Reaches.GetCount(); i++)
	{
		CReach &Reach = m_Reaches.GetAt(i);
		Reach.WriteToFEQ(Dest,m_CrossSections);
	}
	

	//NETWORK-MATRIX CONTROL
	Dest.WriteString("NEW NETWORK-MATRIX CONTROL INPUT\n");
	Dest.WriteString("CODE  N1  N2  N3  N4  N5  N6  N7  N8  N9  N10    F1     F2     F3     F4     F5\n");

	for(i = 0; i < m_Reaches.GetCount(); i++)
	{
		CReach &Reach = m_Reaches.GetAt(i);
		Dest.WriteString(MyString("; ")+Reach.m_sName+"\n");
		sLine.Format("%5u%5u\n",1,Reach.m_nID);
		Dest.WriteString(sLine);
	}

	CJunction::m_ExternalNodeCount = 0;

	for(i = 0; i < m_Junctions.GetCount(); i++)
	{
		CJunction &Junction = m_Junctions.GetAt(i);

		Junction.WriteToNetworkMatrix(Dest, m_Reaches);
	}
	for(i = 0; i < m_CrossSections.GetCount(); i++)
	{
		CCrossSection &crossSection = m_CrossSections.GetAt(i);

		crossSection.WriteToNetworkMatrix(Dest, m_Reaches);
	}
	Dest.WriteString("   -1\n");

	
	//INPUT OUTPUT FILES
	Dest.WriteString("BNODE= U1\n");
	Dest.WriteString("SPECIAL OUTPUT LOCATIONS\n");
#ifdef WRITE_COMMENTS
	Dest.WriteString(";     The special output goes into a separate file to provide a more\n");
	Dest.WriteString(";     compact record of what happened at the locations you selected\n");
#endif
	Dest.WriteString("UNIT=    3specout.wsq\n");
	Dest.WriteString("  BRA NODE\n");

	Dest.WriteString("   -1\n");
	Dest.WriteString("INPUT FILE SPECIFICATION\n");
	Dest.WriteString(" UNIT NAME\n");
	Dest.WriteString("   -1\n");

	WriteOutputFiles(Dest);


	//PRESCRIBED FLOWS
	Dest.WriteString("FUNCTION TABLES\n");
	Dest.WriteString("FILE=CrossSections.tab\n");
//	Dest.WriteString("FILE=CC.tab\n");
//	Dest.WriteString("FILE=HH.tab\n");
//	Dest.WriteString("FILE=99999.tab\n");
	WritePrescribedFlows(sSourceFolder, sDestFolder, Dest);
	WriteElevationFlow(sSourceFolder, sDestFolder, Dest);
	Dest.WriteString("TABID=    -1\n");

	WriteFreeNodes(Dest);

	if(!m_nRestart)
	{
		//BACKWATER ANALYSIS
		WriteBackwaterAnalysis(Dest, initialFlowMarkers);
	}

	return(0);
}

int CHECDoc::ExportFEQUTL(MyString &sDefaultsFolder, MyFile &Dest, bool manningMarkers)
{
	int i;
	MyString sLine;

	//Open default FEQ file
	MyFile DefaultFile;
	MyString sDefaultFileName = sDefaultsFolder + "DefaultFEQUTL.txt";
	
	if( !DefaultFile.Open( sDefaultFileName, "r" ) )
	{
		//AfxMessageBox("Default file open error.");
		return(1);
	}

	for(i = 0; i < 66; i++)
	{
		DefaultFile.ReadString(sLine);
		Dest.WriteString(sLine+"\n");
	}

	for(i = 0; i < m_CrossSections.GetCount(); i++)
	{
		CCrossSection &CrossSection = m_CrossSections.GetAt(i);

		CrossSection.WriteToFEQX(Dest, m_Reaches.Get(CrossSection.m_ReachID), manningMarkers, m_ManningMap, m_nManningCount);
	}


	DefaultFile.Close();

	return(0);
}

int CHECDoc::GetReachOrder(MyArray<int,int> &ReachOrder)
{
	ReachOrder.RemoveAll();

	// Find last downstream reach
	int i;
	int lastReachID;
	for(i = 0; i < m_CrossSections.GetCount(); i++)
	{
		CCrossSection &crossSection = m_CrossSections.GetAt(i);

		if( crossSection.m_sElevationFlowFile != "" )
		{
			ReachOrder.Add(crossSection.m_ReachID);
			break;
		}
	}
	if( i == m_CrossSections.GetCount() )
	{
		ERROR("There is no downstream boundary condition.");
		return -1;
	}

	MyMap<int,int,int,int> m_UsedJunction;
	int nTmp;
int aaa=0;
	while( (int)ReachOrder.GetCount() <  m_Reaches.GetCount() && aaa < 1000)
	{
		aaa++;
		for(int i = 0; i < m_Junctions.GetCount(); i++)
		{
			CJunction &Junction = m_Junctions.GetAt(i);

			if( m_UsedJunction.Lookup(Junction.m_nID,nTmp) ) continue;

			bool bIsLast = true;
			for(int j = 0; j < (int)Junction.m_DownReaches.GetCount(); j++)
			{
				//Get Reach ID
				CReach &Reach = GetReach(Junction.m_DownReaches[j]);

				//Check if reach is proccessed
				bool bReachExist = false;
				for(int k = 0; k < (int)ReachOrder.GetCount(); k++) 
					if( ReachOrder[k] == Reach.m_nID )
					{
						bReachExist = true;
						break;
					}

				if( !bReachExist )
				{
					bIsLast = false;
					break;
				}
			}

			if( bIsLast )
			{
				for(int j = 0; j < (int)Junction.m_UpReaches.GetCount(); j++)
				{
					CReach &Reach = GetReach(Junction.m_UpReaches[j]);
					
					//Check if reach is proccessed
					bool bReachExist = false;
					for(int k = 0; k < (int)ReachOrder.GetCount(); k++) 
						if( ReachOrder[k] == Reach.m_nID )
						{
							bReachExist = true;
							break;
						}

					if( !bReachExist )	ReachOrder.Add(Reach.m_nID);
				}

				m_UsedJunction[Junction.m_nID] = 1;

				break;
			}
		}
	}

	return(0);
}

int CHECDoc::WritePrescribedFlows(MyString &sSourceFolder, MyString &sDestFolder, MyFile &Dest)
{
	MyString sLine;
	int i;

	for(i = 0; i < m_CrossSections.GetCount(); i++)
	{
		CCrossSection &crossSection = m_CrossSections.GetAt(i);

		if( crossSection.m_sPrescFlowFile!="" )
		{
			CReach &reach = m_Reaches.Get(crossSection.m_ReachID);
			MyString sDesc = crossSection.m_sDescription;

			MyFile TableSource, TableDest;
			if( !TableSource.Open( sSourceFolder+crossSection.m_sPrescFlowFile, "r") )
			{
				//AfxMessageBox("Cannot open file "+sSourceFolder+crossSection.m_sPrescFlowFile+" for reading.");
				return(1);
			}
			MyString sTableDest;
			int nTableID = 99000+crossSection.m_ReachID;
			sTableDest.Format("%u.tab", nTableID);
			if(	!TableDest.Open(sDestFolder+sTableDest , "w") ) 
			{
				//AfxMessageBox("Cannot open file "+sTableDest+" for writing.");
				return(1);
			}

			TableSource.ReadString(sLine);
			sLine.Format("TABID=%5u\n", nTableID);
			TableDest.WriteString(sLine);

			for(int j = 0; j <4; j++)
			{
				TableSource.ReadString(sLine);
				TableDest.WriteString(sLine+"\n");
			}

			//Initial flow
			int nTmp;
			double dTmp;
			sscanf(sLine,"%u%u%u%lf%lf",&nTmp,&nTmp,&nTmp,&dTmp,&reach.m_dInitialFlow);

			while( TableSource.ReadString(sLine) ) TableDest.WriteString(sLine+"\n");

			TableSource.Close();
			TableDest.Close();

			Dest.WriteString("FILE="+sTableDest+"\n");
		}
	}

	for(i = 0; i < m_Junctions.GetCount(); i++)
	{
		CJunction &junction = m_Junctions.GetAt(i);

		if( junction.m_Type == CJunction::LATERAL_INFLOW )
		{
			int reachID;
			bool found = m_Reaches.FindID(junction.m_DownReaches[0], reachID);
			//CReach &reach = m_Reaches.Get(reachID);

			MyFile TableSource, TableDest;
			if( !TableSource.Open( sSourceFolder+junction.m_sLateralInflowFile, "r" ) )
			{
				//AfxMessageBox("Cannot open file "+sSourceFolder+junction.m_sLateralInflowFile+" for reading.");
				return(1);
			}
			MyString sTableDest;
			int nTableID = 99000+reachID;
			sTableDest.Format("%u.tab", nTableID);
			if(	!TableDest.Open(sDestFolder+sTableDest , "w") ) 
			{
				//AfxMessageBox("Cannot open file "+sTableDest+" for writing.");
				return(1);
			}

			TableSource.ReadString(sLine);
			sLine.Format("TABID=%5u\n", nTableID);
			TableDest.WriteString(sLine);

			for(int j = 0; j <4; j++)
			{
				TableSource.ReadString(sLine);
				TableDest.WriteString(sLine+"\n");
			}

			//Initial flow
			int nTmp;
			double dTmp;
			sscanf(sLine,"%u%u%u%lf%lf",&nTmp,&nTmp,&nTmp,&dTmp,&junction.m_InitialLateralInflow);
	
			while( TableSource.ReadString(sLine) ) TableDest.WriteString(sLine+"\n");

			TableSource.Close();
			TableDest.Close();

			Dest.WriteString("FILE="+sTableDest+"\n");
		}
	}

	return(0);
}

int CHECDoc::WriteElevationFlow(MyString &sSourceFolder, MyString &sDestFolder, MyFile &Dest)
{
	MyString sLine;
	int i;

	for(i = 0; i < m_CrossSections.GetCount(); i++)
	{
		CCrossSection &crossSection = m_CrossSections.GetAt(i);

		if( crossSection.m_sElevationFlowFile!="" )
		{
			MyString sDesc = crossSection.m_sDescription;

			MyFile TableSource, TableDest;
			if( !TableSource.Open( sSourceFolder+crossSection.m_sElevationFlowFile, "r" ) )
			{
				//AfxMessageBox("Cannot open file "+sSourceFolder+crossSection.m_sElevationFlowFile+" for reading.");
				return(1);
			}
			MyString sTableDest;
			int nTableID = 99999;
			sTableDest.Format("%u.tab", nTableID);
			if(	!TableDest.Open(sDestFolder+sTableDest , "w") ) 
			{
				//AfxMessageBox("Cannot open file "+sTableDest+" for writing.");
				return(1);
			}

			TableSource.ReadString(sLine);
			sLine.Format("TABID=%5u\n", nTableID);
			TableDest.WriteString(sLine);

			while( TableSource.ReadString(sLine) ) TableDest.WriteString(sLine+"\n");

			TableSource.Close();
			TableDest.Close();

			Dest.WriteString("FILE="+sTableDest+"\n");
		}
	}

	return(0);
}

int CHECDoc::WriteFreeNodes(MyFile &Dest)
{
	MyString sLine;
	int i;

	bool foundLateralFlow = false;
	for(i = 0; i < m_Junctions.GetCount(); i++)
	{
		CJunction &junction = m_Junctions.GetAt(i);

		if( junction.m_Type == CJunction::LATERAL_INFLOW )
		{
			foundLateralFlow = true;
			break;
		}
	}

	if( foundLateralFlow )
	{
		Dest.WriteString("FREE NODE INITIAL CONDITIONS\n");
		Dest.WriteString(" NODE     NAME      DEPTH     DISCH       ELV\n");

		for(i = 0; i < m_Junctions.GetCount(); i++)
		{
			CJunction &junction = m_Junctions.GetAt(i);

			if( junction.m_Type == CJunction::LATERAL_INFLOW )
			{
				sLine.Format("%5s %8s %10.2f%10.2f%10.2f\n",junction.m_DummyUpNode.c_str(), junction.m_DummyUpNode.c_str(), 0.0, 0.0, 0.0);
				Dest.WriteString(sLine);
				sLine.Format("%5s %8s %10.2f%10.2f%10.2f\n",junction.m_DummyDownNode.c_str(), junction.m_DummyDownNode.c_str(), 0.0, 0.0, 0.0);
				Dest.WriteString(sLine);
			}
		}
	}

	return(0);
}

int CHECDoc::WriteBackwaterAnalysis(MyFile &Dest, bool initialFlowMarkers)
{
	MyString sLine;
	int i;

	Dest.WriteString("BACKWATER ANALYSIS\n");

	MyArray<int,int> ReachOrder;
	GetReachOrder(ReachOrder);

	CalculateInitialFlows(ReachOrder);

	for(i = 0; i < (int)ReachOrder.GetCount(); i++)
	{
		CReach &Reach = m_Reaches.Get(ReachOrder[i]);

		//BRANCH NUMBER=
		Dest.WriteString(MyString("; ")+Reach.m_sName+"\n");
		sLine.Format("BRANCH NUMBER=%5d\n", -((int)Reach.m_nID));
		Dest.WriteString(sLine);

		//DISCHARGE=
		if( !initialFlowMarkers )
			sLine.Format("DISCHARGE=%10.2f\n", Reach.m_dInitialFlow);
		else
		{
			MyString mask;
			mask.Format("###%u###", Reach.m_nID );
			sLine.Format("DISCHARGE=%10s\n", mask.c_str());
		}

		Dest.WriteString(sLine);
	}

	CalculateInitialElevations();

	//BRA CODE ELEVATION EXN#
	Dest.WriteString("  BRA CODE ELEVATION EXN#\n");

	for(i = 0; i < (int)ReachOrder.GetCount(); i++)
	{
		CReach &Reach = m_Reaches.Get(ReachOrder[i]);

		int upJunctionID, downJunctionID;
		CJunction *upJunction = GetUpJunction(Reach.m_sName);
		CJunction *downJunction = GetDownJunction(Reach.m_sName);

		MyString sDownReachUpJunction;
		if( downJunction )
		{
			CReach &DownReach = GetReach(downJunction->m_DownReaches[0]);
			sDownReachUpJunction.Format("U%u",DownReach.m_nID);
		}

		int nCode = 0;
		double dElevation = 0.0;
		MyString sUpJunctionElevation;

		if	( !downJunction )
		{
			if(upJunction && upJunction->m_dInitialElevation >= 0.0)
			{
				nCode = 30;
				sUpJunctionElevation.Format("%10.2f",upJunction->m_dInitialElevation);
			}
			else nCode = 3;

			dElevation = 215.0;
			sDownReachUpJunction = "";
		}
		
		if	( upJunction && upJunction->m_dInitialElevation >= 0.0 && downJunction)
		{
			nCode = 10;
			dElevation = 0.0;

			sUpJunctionElevation.Format("%10.2f",upJunction->m_dInitialElevation);
		}

		if	( downJunction && downJunction->m_dInitialUpstreamElevation >= 0 )
		{
			nCode = 1;
			dElevation = downJunction->m_dInitialUpstreamElevation;
			sDownReachUpJunction = "";
		}

		Dest.WriteString(MyString("; ")+Reach.m_sName+"\n");
		sLine.Format("%5u%5u%10.2f%5s%10s\n", Reach.m_nID, nCode, dElevation, sDownReachUpJunction.c_str(), sUpJunctionElevation.c_str());
		Dest.WriteString(sLine);
	}

	Dest.WriteString("   -1\n");

	return(0);
}

CReach & CHECDoc::GetReach(const MyString &sName)
{
	//Get Reach ID
	int nID;
	bool bFound = m_Reaches.FindID(sName,nID);
	assert(bFound);

	return( m_Reaches.Get(nID) );
}

CJunction* CHECDoc::GetDownJunction(const MyString &sReachName)
{
	for(int i = 0; i < m_Junctions.GetCount(); i++)
	{
		CJunction &Junction = m_Junctions.GetAt(i);
		
		for(int j = 0; j < (int)Junction.m_UpReaches.GetCount(); j++)
			if( Junction.m_UpReaches[j] == sReachName )	return( &Junction );
	}

	return( NULL );
}

CJunction* CHECDoc::GetUpJunction(const MyString &sReachName)
{
	for(int i = 0; i < m_Junctions.GetCount(); i++)
	{
		CJunction &Junction = m_Junctions.GetAt(i);
		
		for(int j = 0; j < (int)Junction.m_DownReaches.GetCount(); j++)
			if( Junction.m_DownReaches[j] == sReachName )	return( &Junction );
	}

	return( NULL );
}

int CHECDoc::CalculateInitialFlows(MyArray<int,int> &ReachOrder)
{
	int i;
	double dInflow;

	for(i = 0; i < m_Junctions.GetCount(); i++)
	{
		CJunction &junction = m_Junctions.GetAt(i);
		if(junction.m_Type == CJunction::LATERAL_INFLOW )
			junction.m_dInflow = junction.m_InitialLateralInflow;
		else
			junction.m_dInflow = 0.0;
	}

	for(i = 0; i < (int)ReachOrder.GetCount(); i++)
	{
		CReach &Reach = m_Reaches.Get(ReachOrder[ReachOrder.GetUpperBound()-i]);

		CJunction *upJunction = GetUpJunction(Reach.m_sName);
		if( upJunction )
		{
			dInflow = upJunction->m_dInflow / upJunction->m_DownReaches.GetCount();
		}
		else dInflow = Reach.m_dInitialFlow;

		CJunction *downJunction = GetDownJunction(Reach.m_sName);
		if( downJunction )
		{
			downJunction->m_dInflow += dInflow;
		}

		if( Reach.m_dInitialFlow == 0.0) Reach.m_dInitialFlow = dInflow;
	}

	return(0);
}

int CHECDoc::ExportCSV(MyFile &CrossSectionDest, MyFile &CrossSectionPointDest)
{
	int i;

	CrossSectionDest.WriteString("OBJECTID,HydroID,ReachCode,CSCode,JunctionID,ProfileM,ShpStacionaza,NetStacionaza\n");
	CrossSectionPointDest.WriteString("OBJECTID,PointIndex,CrossM,Elevation,CS_HydroID\n");
	
	//Reaches
	for(i = 0; i < m_Reaches.GetCount(); i++)
	{
		CReach &Reach = m_Reaches.GetAt(i);
		Reach.WriteToCSV(CrossSectionDest,CrossSectionPointDest,m_CrossSections);
	}

	return(0);
}

void CHECDoc::SetManningMap(double ManningMap[][2], int nManningCount)
{
	int i;

	for(i = 0; i < nManningCount; i++)
	{
		m_ManningMap[i][0] = ManningMap[i][0];
		m_ManningMap[i][1] = ManningMap[i][1];
	}
}

int CHECDoc::CalculateInitialElevations()
{
	int i;

	for(i = 0; i < m_Junctions.GetCount(); i++)
	{
		CJunction &Junction = m_Junctions.GetAt(i);

		if( Junction.m_dInitialElevation >= 0.0 )
		{
			double dUpElevation, dUpLength;
			if(Junction.m_dInitialUpstreamElevation > 0.0)
				CalculateUpstreamElevations(Junction,Junction.m_dInitialUpstreamElevation,0.0,dUpElevation, dUpLength);
			else
			CalculateUpstreamElevations(Junction,Junction.m_dInitialElevation,0.0,dUpElevation, dUpLength);
		}
	}

	return(0);
}

bool CHECDoc::CalculateUpstreamElevations(CJunction &Junction, double dDownElevation, double dDownLength, double &dUpElevation, double &dUpLength)
{
	int i;
	bool bFoundUpElevation = false;

	for(i = 0; i < (int)Junction.m_UpReaches.GetCount(); i++)
	{
		CReach &Reach = GetReach(Junction.m_UpReaches[i]);

		CJunction *upJunction = GetUpJunction(Reach.m_sName);
		if( !upJunction ) continue;

		if( upJunction->m_dInitialElevation >= 0.0 )
		{
			dUpElevation = upJunction->m_dInitialElevation;
			dUpLength = dDownLength + Reach.m_dLength;

			return(true);
		}
		else
		{
			if( CalculateUpstreamElevations(*upJunction, dDownElevation, dDownLength+Reach.m_dLength, dUpElevation, dUpLength) )
			{
				upJunction->m_dInitialElevation = dDownElevation + (dUpElevation-dDownElevation)*(dDownLength+Reach.m_dLength)/dUpLength;

				dUpElevation = upJunction->m_dInitialElevation;
				dUpLength = dDownLength+Reach.m_dLength;

				bFoundUpElevation = true;
			}
		}

	}

	return(bFoundUpElevation);
}

int CHECDoc::WriteOutputFiles(MyFile &Dest)
{
	MyString sLine;
	int i;

	Dest.WriteString("OUTPUT FILE SPECIFICATION\n");
	Dest.WriteString(" UNIT  BRA NODE ITEM TYPE NAME------------------------------------------------------------\n");

	for(i = 0; i < m_Junctions.GetCount(); i++)
	{
		CJunction &Junction = m_Junctions.GetAt(i);

		if(Junction.m_sOutputDownElevFile != "")
		{
			CReach &Reach = GetReach(Junction.m_DownReaches[0]);
			MyString sNode;

			sNode.Format("U%d",Reach.m_nID);

			sLine.Format("          %5s ELEV  PNT %s\n",sNode.c_str(),Junction.m_sOutputDownElevFile.c_str());
			Dest.WriteString(sLine);
		}
		if(Junction.m_sOutputUpElevFile != "")
		{
			CReach &Reach = GetReach(Junction.m_UpReaches[0]);
			MyString sNode;

			sNode.Format("D%d",Reach.m_nID);

			sLine.Format("          %5s ELEV  PNT %s\n",sNode.c_str(),Junction.m_sOutputUpElevFile.c_str());
			Dest.WriteString(sLine);
		}
		if(Junction.m_sOutputFlowFile != "")
		{
			CReach &Reach = GetReach(Junction.m_DownReaches[0]);
			MyString sNode;

			sNode.Format("U%d",Reach.m_nID);

			sLine.Format("          %5s FLOW  PNT %s\n",sNode.c_str(),Junction.m_sOutputFlowFile.c_str());
			Dest.WriteString(sLine);
		}
		if(Junction.m_sOutputUpVelocityFile != "")
		{
			if( Junction.m_UpReaches.GetCount() != 1 )
			{
				MyString msg;
				msg.Format("Upstream velocity output can be requested only for junctions with one upstream reach.\nJunction %s",Junction.m_sName.c_str());
				
				return -1;
			}
			CReach &Reach = GetReach(Junction.m_UpReaches[0]);
			MyString sNode;

			sNode.Format("D%d",Reach.m_nID);

			sLine.Format("          %5s VELO  PNT %s\n",sNode.c_str(),Junction.m_sOutputUpVelocityFile.c_str());
			Dest.WriteString(sLine);
		}
	}

	for(i = 0; i < m_Reaches.GetCount(); i++)
	{
		CReach &Reach = m_Reaches.GetAt(i);

		if(Reach.m_sOutputUpElevFile != "")
		{
			MyString sNode;
			sNode.Format("U%d",Reach.m_nID);

			sLine.Format("          %5s ELEV  PNT %s\n", sNode.c_str(), Reach.m_sOutputUpElevFile.c_str());
			Dest.WriteString(sLine);
		}

		if(Reach.m_sOutputDownElevFile != "")
		{
			MyString sNode;
			sNode.Format("D%d",Reach.m_nID);

			sLine.Format("          %5s ELEV  PNT %s\n", sNode.c_str(), Reach.m_sOutputDownElevFile.c_str());
			Dest.WriteString(sLine);
		}
	}
	
	Dest.WriteString("   -1\n");

	return(0);
}