import React, { useState } from "react";
import './SearchableDropdown.css';

const SearchableDropdown = ({ data, setInputValue }) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedValue, setSelectedValue] = useState("");

  const filteredData = data.filter(([id, name]) =>
    name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSelect = (id, name) => {
    setSelectedValue(name);
    setInputValue(id);
    setIsDropdownOpen(false);
    setSearchTerm("");
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && filteredData.length > 0) {
      handleSelect(filteredData[0][0], filteredData[0][1]); // Select the first result
    } else if (e.key === "Escape") {
      setIsDropdownOpen(false); // Close dropdown on Escape
    }
  };

  return (
    <div className="dropdown-container">
      {/* Display selected value */}
      <div
        className="dropdown-display"
        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
      >
        {selectedValue ? selectedValue : "Select Allottee"}
      </div>

      {isDropdownOpen && (
        <div className="dropdown-menu">
          {/* Search Input */}
          <input
            type="text"
            className="dropdown-search"
            placeholder="Search Allottee..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={handleKeyDown} // Listen for Enter key
            autoFocus
          />

          {/* Dropdown Options */}
          <div className="dropdown-options">
            {filteredData.length > 0 ? (
              filteredData.map(([id, name]) => (
                <div
                  key={id}
                  className="dropdown-option"
                  onClick={() => handleSelect(id, name)}
                >
                  {name}
                </div>
              ))
            ) : (
              <div className="dropdown-option">No results found</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchableDropdown;
