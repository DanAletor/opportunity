import type { Opportunity } from "@shared/schema";

interface OpportunityCardProps {
  opportunity: Opportunity;
  onViewOpportunity?: (opportunity: Opportunity) => void;
}

export default function OpportunityCard({ opportunity, onViewOpportunity }: OpportunityCardProps) {
  const handleViewClick = (e: React.MouseEvent) => {
    e.preventDefault();
    onViewOpportunity?.(opportunity);
  };

  const getIconForType = (type: string) => {
    switch (type.toLowerCase()) {
      case 'grant':
        return 'fas fa-hand-holding-usd';
      case 'exhibition':
        return 'fas fa-palette';
      case 'residency':
        return 'fas fa-home';
      case 'workshop':
        return 'fas fa-users';
      case 'project':
        return 'fas fa-project-diagram';
      case 'mentorship':
        return 'fas fa-user-graduate';
      case 'exchange':
        return 'fas fa-exchange-alt';
      default:
        return 'fas fa-tag';
    }
  };

  const getLocationIcon = (location: string) => {
    if (!location) return 'fas fa-map-marker-alt';
    return location.toLowerCase().includes('international') ? 'fas fa-globe' : 'fas fa-map-marker-alt';
  };

  return (
    <div className="opportunity-card">
      <div className="row">
        <div className="col-lg-9">
          <h3 className="opportunity-title">{opportunity.title}</h3>
          <p className="opportunity-description">{opportunity.description}</p>
          <div className="opportunity-meta">
            <span className="meta-item">
              <i className={getIconForType(opportunity.type)}></i>
              <span>{opportunity.type}</span>
            </span>
            <span className="meta-item">
              <i className="fas fa-calendar"></i>
              <span>Deadline: {opportunity.deadline}</span>
            </span>
            <span className="meta-item">
              <i className={getLocationIcon(opportunity.location || '')}></i>
              <span>{opportunity.location || 'Location TBD'}</span>
            </span>
            <span className="meta-item">
              <i className="fas fa-globe-americas"></i>
              <span>{opportunity.continent || 'Global'}</span>
            </span>
            {opportunity.organization && (
              <span className="meta-item">
                <i className="fas fa-building"></i>
                <span>{opportunity.organization}</span>
              </span>
            )}
          </div>
        </div>
        <div className="col-lg-3 d-flex align-items-center justify-content-end">
          <a 
            href={opportunity.link || '#'} 
            target={opportunity.link ? "_blank" : "_self"}
            rel={opportunity.link ? "noopener noreferrer" : ""}
            className="view-opportunity-btn"
            onClick={!opportunity.link ? handleViewClick : undefined}
          >
            {opportunity.link ? 'Apply Now' : 'View Details'}
          </a>
        </div>
      </div>
    </div>
  );
}
