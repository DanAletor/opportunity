import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import Logo from "@/components/Logo";
import OpportunityCard from "@/components/OpportunityCard";
import Pagination from "@/components/Pagination";
import type { Opportunity } from "@shared/schema";

interface OpportunitiesResponse {
  opportunities: Opportunity[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

interface UserPreferences {
  discipline: string;
  location: string;
  availability: string;
}

export default function Home() {
  const [currentPage, setCurrentPage] = useState(1);

  const { data: opportunitiesData, isLoading: opportunitiesLoading } = useQuery<OpportunitiesResponse>({
    queryKey: [`/api/opportunities?page=${currentPage}&limit=5`],
  });

  const { data: preferences } = useQuery<UserPreferences>({
    queryKey: ['/api/preferences'],
  });

  const handleViewOpportunity = (opportunity: Opportunity) => {
    console.log(`Viewing opportunity: ${opportunity.title}`);
    alert(`Viewing opportunity: ${opportunity.title}`);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  if (opportunitiesLoading) {
    return (
      <div className="container-custom">
        <div className="text-center">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container-custom">
      <Logo />

      {/* Header Section */}
      <div className="text-center mb-5">
        <h1 className="main-title">Opportunity-Sourcing AI</h1>
        <p className="subtitle">
          Automatically discover and recommend relevant<br />
          opportunities to creative professionals.
        </p>
      </div>

      {/* Your Preferences Section */}
      <div className="mb-5">
        <h2 className="section-title">Your Preferences</h2>
        <div className="d-flex flex-wrap">
          {preferences && (
            <>
              <span className="preference-tag">Discipline: {preferences.discipline}</span>
              <span className="preference-tag">Location: {preferences.location}</span>
              <span className="preference-tag">Availability: {preferences.availability}</span>
            </>
          )}
        </div>
      </div>

      {/* Recommended Opportunities Section */}
      <div className="mb-5">
        <h2 className="section-title">Recommended Opportunities</h2>
        
        {opportunitiesData?.opportunities.map((opportunity) => (
          <OpportunityCard
            key={opportunity.id}
            opportunity={opportunity}
            onViewOpportunity={handleViewOpportunity}
          />
        ))}

        {opportunitiesData?.opportunities.length === 0 && (
          <div className="text-center py-5">
            <p className="text-muted">No opportunities found.</p>
          </div>
        )}
      </div>

      {/* Pagination */}
      {opportunitiesData && opportunitiesData.pagination.totalPages > 1 && (
        <Pagination
          currentPage={currentPage}
          totalPages={opportunitiesData.pagination.totalPages}
          onPageChange={handlePageChange}
        />
      )}
    </div>
  );
}
