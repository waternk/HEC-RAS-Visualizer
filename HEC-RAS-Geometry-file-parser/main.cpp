#include <iostream>
#include "MyFile.h"
#include "MyString.h"
#include "HecDoc.h"
#include <stdio.h>

int main(int argc, char** argv)
{
    MyString filePath = argv[1];

    MyString sCrossSectionDestFileName = "CrossSection.csv";
	MyString sCrossSectionPointDestFileName = "CrossSectionPoints.csv";

    MyFile GeometryFile, CrossSectionDest, CrossSectionPointDest;

    GeometryFile.Open(filePath, "r");
    CrossSectionDest.Open(sCrossSectionDestFileName, "w");
    CrossSectionPointDest.Open(sCrossSectionPointDestFileName, "w");

    CHECDoc HECDoc;
    HECDoc.OnNewDocument();
    HECDoc.Load(GeometryFile);
    HECDoc.ExportCSV(CrossSectionDest, CrossSectionPointDest);

    FILE *in = fopen("finalno.txt", "w");

    for(int i = 0; i < HECDoc.m_Reaches.GetCount(); i++)
    {
        CReach& reach = HECDoc.m_Reaches.GetAt(i);
        fprintf(in, "reach\n");
        fprintf(in, "%s\n", reach.m_sName.c_str());
        //cout << reach.m_sName << endl; //naziv reach-a
        for (int j = 0; j < reach.m_CrossSectionIDs.GetCount(); j++)
        {
            int& ccsID = reach.m_CrossSectionIDs.ElementAt(j);
            CCrossSection ccsObj = HECDoc.m_CrossSections.Get(ccsID);
            fprintf(in, "presek\n");
            fprintf(in, "%lf\n", ccsObj.m_dStation);
            fprintf(in, "%lf %lf\n", ccsObj.lobala_x, ccsObj.lobala_z);
            fprintf(in, "%lf %lf\n", ccsObj.dobala_x, ccsObj.dobala_z);
            //cout << ccsObj.m_dStation << endl; //stacionaza preseka
            //cout << ccsObj.lobala_x << ", " << ccsObj.lobala_z << ", " << ccsObj.dobala_x << ", " << ccsObj.dobala_z << endl; //obale koordinate
            for (int k = 0; k < ccsObj.m_Points.GetCount(); k++)
            {
                CCrossSectionPoint& ccsp = ccsObj.m_Points.ElementAt(k);
                //cout << ccsp.m_dOffset << ", " <<  cout << ccsp.m_dElevation << endl; // x, y
                fprintf(in, "%lf %lf\n", ccsp.m_dOffset, ccsp.m_dElevation);
            }
        }
    }

    GeometryFile.Close();
    CrossSectionDest.Close();
    CrossSectionPointDest.Close();

    fclose(in);
    return 0;
}
