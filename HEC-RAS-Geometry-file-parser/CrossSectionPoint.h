class CCrossSectionPoint  
{
public:
	CCrossSectionPoint& operator =(const CCrossSectionPoint &other);
	CCrossSectionPoint();
	virtual ~CCrossSectionPoint();

	double m_dOffset;
	double m_dElevation;

};
