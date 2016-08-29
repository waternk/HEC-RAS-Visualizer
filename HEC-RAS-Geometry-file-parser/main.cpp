#include <iostream>
#include "MyFile.h"
#include "MyString.h"
#include "HecDoc.h"
#include <stdio.h>

void printReachHeader(CReach& reach, FILE *out)
{
    fprintf(out, "reach\n");
    fprintf(out, "%s\n", reach.m_sName.c_str());
}

void printCrossSectionHeader(CCrossSection ccsObj, FILE *out)
{
    fprintf(out, "presek\n");
    fprintf(out, "%lf\n", ccsObj.m_dStation);
    fprintf(out, "%lf %lf\n", ccsObj.lobala_x, ccsObj.lobala_z);
    fprintf(out, "%lf %lf\n", ccsObj.dobala_x, ccsObj.dobala_z);    
}

void printCrossSectionPoints(CCrossSection ccsObj, FILE *out)
{
    for (int k = 0; k < ccsObj.m_Points.GetCount(); k++)
    {
        CCrossSectionPoint& ccsp = ccsObj.m_Points.ElementAt(k);
        fprintf(out, "%lf %lf\n", ccsp.m_dOffset, ccsp.m_dElevation);
    }
}

int main(int argc, char** argv)
{
    MyString filePath = argv[1];
    MyFile GeometryFile;
    GeometryFile.Open(filePath, "r");
    CHECDoc HECDoc;
    HECDoc.OnNewDocument();
    HECDoc.Load(GeometryFile);
    FILE *out = fopen("finalno.txt", "w");

    for(int i = 0; i < HECDoc.m_Reaches.GetCount(); i++)
    {
        CReach& reach = HECDoc.m_Reaches.GetAt(i);
        printReachHeader(reach, out);
        for (int j = 0; j < reach.m_CrossSectionIDs.GetCount(); j++)
        {
            int& ccsID = reach.m_CrossSectionIDs.ElementAt(j);
            CCrossSection ccsObj = HECDoc.m_CrossSections.Get(ccsID);
            printCrossSectionHeader(ccsObj, out);
            printCrossSectionPoints(ccsObj, out);
        }
    }
    GeometryFile.Close();
    fclose(out);
    return 0;
}
