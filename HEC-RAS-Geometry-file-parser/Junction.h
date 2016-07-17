
#include "HECEntity.h"
#include "HECEntityCollection.h"
#include "Reach.h"

class CJunction : public CHECEntity  
{
public:
	typedef enum JunctionType
	{
		UNDEFINED,
		IBAR_DAM = 17,
		FOCA_DAM = 18,
		LATERAL_INFLOW
	} JunctionType;

public:
	void ParseDescription(MyString &description);
	int WriteToNetworkMatrix(MyFile &Dest, CHECEntityCollection<CReach> &Reaches);
	int Load(MyFile &geometryFile);
	CJunction& operator =(const CJunction &other);
	CJunction(const CJunction &other)
	{
		(*this) = other;
	}
	CJunction();
	virtual ~CJunction();
	
	inline CJunction* Clone() const
	{
		return( new CJunction(*this) );
	}


	MyString m_sDescription;
	MyArray<MyString,MyString&> m_UpReaches;
	MyArray<MyString,MyString&> m_DownReaches;

	double m_dInitialElevation;
	double m_dInitialUpstreamElevation;
	double m_dInflow;
	MyString m_sOutputUpElevFile;
	MyString m_sOutputDownElevFile;
	MyString m_sOutputFlowFile;
	MyString m_sOutputUpVelocityFile;
	MyString m_sFeatureParameterFile;
	MyString m_sLateralInflowFile;

	MyString m_DummyUpNode, m_DummyDownNode;
	double m_InitialLateralInflow;

	JunctionType m_Type;

	static int m_ExternalNodeCount;


};