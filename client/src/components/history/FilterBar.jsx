import React from 'react';
import { SearchIcon, FilterIcon, ArrowUpDownIcon, XIcon } from '../common/Icons';
import './FilterBar.css';

const FilterBar = ({ filters = {}, onFilterChange }) => {
  const updateFilter = (key, value) => {
    onFilterChange({
      ...filters,
      [key]: value
    });
  };

  const clearAllFilters = () => {
    onFilterChange({
      search: '',
      status: '',
      sortBy: 'newest'
    });
  };

  const hasActiveFilters = filters.search || filters.status || filters.sortBy !== 'newest';

  return (
    <div className="filter-bar">
      <div className="filter-group filter-search">
        <label htmlFor="meeting-search" className="filter-label">
          <SearchIcon size={14} />
          Search
        </label>
        <div className="search-input-wrapper">
          <SearchIcon size={16} className="search-input-icon" />
          <input
            id="meeting-search"
            type="text"
            placeholder="Search meetings..."
            value={filters.search || ''}
            onChange={(event) => updateFilter('search', event.target.value)}
            className="search-input"
          />
          {filters.search && (
            <button
              type="button"
              className="search-clear"
              onClick={() => updateFilter('search', '')}
              aria-label="Clear search"
            >
              <XIcon size={14} />
            </button>
          )}
        </div>
      </div>

      <div className="filter-group">
        <label htmlFor="meeting-status" className="filter-label">
          <FilterIcon size={14} />
          Status
        </label>
        <select
          id="meeting-status"
          value={filters.status || ''}
          onChange={(event) => updateFilter('status', event.target.value)}
          className="filter-select"
        >
          <option value="">All Statuses</option>
          <option value="COMPLETED">Completed</option>
          <option value="PROCESSING">Processing</option>
          <option value="FAILED">Failed</option>
          <option value="UPLOADED">Uploaded</option>
        </select>
      </div>

      <div className="filter-group">
        <label htmlFor="meeting-sort" className="filter-label">
          <ArrowUpDownIcon size={14} />
          Sort By
        </label>
        <select
          id="meeting-sort"
          value={filters.sortBy || 'newest'}
          onChange={(event) => updateFilter('sortBy', event.target.value)}
          className="filter-select"
        >
          <option value="newest">Newest First</option>
          <option value="oldest">Oldest First</option>
          <option value="title">Title A-Z</option>
          <option value="duration">Duration</option>
        </select>
      </div>

      {hasActiveFilters && (
        <button
          type="button"
          className="btn btn-outline btn-clear-filters"
          onClick={clearAllFilters}
        >
          <XIcon size={14} />
          Clear All
        </button>
      )}
    </div>
  );
};

export default FilterBar;