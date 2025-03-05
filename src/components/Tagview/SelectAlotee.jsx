import React, { useState, useEffect } from "react";
import "./SelectAlotee.css";

const SelectAlotee = ({ setTaskAloteeName, index , taskAlloteeName, options, setTagAloteeName }) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedValue, setSelectedValue] = useState(null);

  useEffect(() => {
    // Set initial value from taskAlloteeName if available
    if (taskAlloteeName) {
      const existingAllottee = options.find(([id]) => id === taskAlloteeName);
      if (existingAllottee) {
        setSelectedValue({ id: existingAllottee[0], name: existingAllottee[1] });
      }
    }
  }, [taskAlloteeName, options]);

  const filteredData = options.filter(([id, name]) =>
    name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSelect = (id, name) => {
    setSelectedValue({ id, name });
    setTagAloteeName(id);
    setTaskAloteeName(id,index);
    setIsDropdownOpen(false);
    setSearchTerm("");
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && filteredData.length > 0) {
      handleSelect(filteredData[0][0], filteredData[0][1]);
    } else if (e.key === "Escape") {
      setIsDropdownOpen(false);
    }
  };

  return (
    <div className="dropdowncontainer">
      {/* Display selected value or initial allottee */}
      <div
        className={"dropdowndisplay selected"}
        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
      >
        {selectedValue ? selectedValue.name : taskAlloteeName || "Select Allottee ↓"}
      </div>

      {isDropdownOpen && (
        <div className="dropdownmenu">
          {/* Search Input */}
          <input
            type="text"
            className="dropdownsearch"
            placeholder="Search Allottee..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={handleKeyDown}
            autoFocus
          />

          {/* Dropdown Options */}
          <div className="dropdownoptions">
            {filteredData.length > 0 ? (
              filteredData.map(([id, name]) => (
                <div
                  key={id}
                  className="dropdownoption"
                  onClick={() => handleSelect(id, name)}
                >
                  {name}
                </div>
              ))
            ) : (
              <div className="dropdownoption no-results">No results found</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default SelectAlotee;
