import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import Logo from "@/components/Logo";
import OpportunityCard from "@/components/OpportunityCard";
import Pagination from "@/components/Pagination";
import { apiRequest } from "@/lib/queryClient";
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
}

const continents = ['All', 'Africa', 'Asia', 'Europe', 'North America', 'South America', 'Oceania'];

export default function Home() {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedContinent, setSelectedContinent] = useState('All');
  const queryClient = useQueryClient();

  const buildQueryKey = () => {
    const params = new URLSearchParams();
    params.set('page', currentPage.toString());
    params.set('limit', '5');
    if (searchQuery.trim()) params.set('search', searchQuery.trim());
    if (selectedContinent !== 'All') params.set('continent', selectedContinent);
    return `/api/opportunities?${params.toString()}`;
  };

  const { data: opportunitiesData, isLoading: opportunitiesLoading } = useQuery<OpportunitiesResponse>({
    queryKey: ['/api/opportunities', currentPage, searchQuery, selectedContinent],
    queryFn: () => fetch(buildQueryKey()).then(res => res.json()),
  });

  const { data: preferences } = useQuery<UserPreferences>({
    queryKey: ['/api/preferences'],
  });

  const refreshMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/opportunities/refresh', { method: 'POST' });
      if (!response.ok) throw new Error('Failed to refresh');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/opportunities'] });
    },
  });

  const handleViewOpportunity = (opportunity: Opportunity) => {
    console.log(`Viewing opportunity: ${opportunity.title}`);
    alert(`Viewing opportunity: ${opportunity.title}`);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1); // Reset to first page when searching
  };

  const handleContinentChange = (continent: string) => {
    setSelectedContinent(continent);
    setCurrentPage(1); // Reset to first page when filtering
  };

  const handleRefresh = () => {
    refreshMutation.mutate();
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
            </>
          )}
        </div>
      </div>

      {/* Search and Filter Section */}
      <div className="search-container">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h3 className="section-title mb-0">Find Opportunities</h3>
          <button 
            className="refresh-btn"
            onClick={handleRefresh}
            disabled={refreshMutation.isPending}
          >
            <i className="fas fa-sync-alt me-2"></i>
            {refreshMutation.isPending ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>
        
        <form onSubmit={handleSearch} className="mb-3">
          <div className="row">
            <div className="col-md-12">
              <input
                type="text"
                className="form-control search-input"
                placeholder="Search opportunities by title, description, type, location, or organization..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </form>

        <div>
          <label className="form-label fw-semibold mb-2">Filter by Continent:</label>
          <div className="continent-filter">
            {continents.map((continent) => (
              <button
                key={continent}
                type="button"
                className={`continent-btn ${selectedContinent === continent ? 'active' : ''}`}
                onClick={() => handleContinentChange(continent)}
              >
                {continent}
              </button>
            ))}
          </div>
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
