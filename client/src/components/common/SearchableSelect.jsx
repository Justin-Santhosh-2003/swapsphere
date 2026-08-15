import { useState, useEffect, useRef } from "react";
import "./SearchableSelect.css";

export default function SearchableSelect({
  options = [],
  value = "",
  onChange,
  placeholder = "Select an option...",
  searchPlaceholder = "Type to search...",
  disabled = false,
  className = ""
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const containerRef = useRef(null);
  const searchInputRef = useRef(null);

  // Normalize options to array of { value, label, icon, badge }
  const normalizedOptions = options.map((opt) => {
    if (typeof opt === "string") {
      return { value: opt, label: opt };
    }
    return {
      value: opt.value ?? opt._id ?? opt.name,
      label: opt.label ?? opt.name,
      icon: opt.icon,
      badge: opt.badge
    };
  });

  const selectedOption = normalizedOptions.find((opt) => opt.value === value);

  const filteredOptions = normalizedOptions.filter((opt) => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    const labelMatch = opt.label.toLowerCase().includes(term);
    const valueMatch = opt.value.toString().toLowerCase().includes(term);
    return labelMatch || valueMatch;
  });

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Focus search input when dropdown opens
  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isOpen]);

  const handleSelect = (val) => {
    onChange(val);
    setIsOpen(false);
    setSearchTerm("");
  };

  const handleClear = (e) => {
    e.stopPropagation();
    onChange("");
    setSearchTerm("");
  };

  return (
    <div
      ref={containerRef}
      className={`searchable-select-container ${disabled ? "disabled" : ""} ${className}`}
    >
      <div
        className={`searchable-select-trigger ${isOpen ? "open" : ""}`}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        tabIndex={disabled ? -1 : 0}
      >
        <div className="trigger-content text-truncate">
          {selectedOption ? (
            <span className="selected-label">
              {selectedOption.icon && <span className="me-2">{selectedOption.icon}</span>}
              {selectedOption.label}
              {selectedOption.badge && (
                <span className="badge bg-light text-muted border ms-2 small">
                  {selectedOption.badge}
                </span>
              )}
            </span>
          ) : (
            <span className="placeholder-text">{placeholder}</span>
          )}
        </div>

        <div className="trigger-actions d-flex align-items-center gap-1">
          {value && !disabled && (
            <button
              type="button"
              className="btn-clear-value"
              onClick={handleClear}
              title="Clear selection"
            >
              ×
            </button>
          )}
          <span className={`arrow-icon ${isOpen ? "up" : "down"}`}>▼</span>
        </div>
      </div>

      {isOpen && !disabled && (
        <div className="searchable-select-dropdown shadow-lg">
          <div className="dropdown-search-box">
            <span className="search-icon">🔍</span>
            <input
              ref={searchInputRef}
              type="text"
              className="dropdown-search-input"
              placeholder={searchPlaceholder}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onClick={(e) => e.stopPropagation()}
            />
            {searchTerm && (
              <button
                type="button"
                className="btn-clear-search"
                onClick={() => setSearchTerm("")}
              >
                ×
              </button>
            )}
          </div>

          <div className="dropdown-options-list">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((opt) => (
                <div
                  key={opt.value}
                  className={`dropdown-option-item ${opt.value === value ? "selected" : ""}`}
                  onClick={() => handleSelect(opt.value)}
                >
                  {opt.icon && <span className="option-icon me-2">{opt.icon}</span>}
                  <span className="option-label text-truncate">{opt.label}</span>
                  {opt.badge && (
                    <span className="badge bg-light text-muted border ms-auto small">
                      {opt.badge}
                    </span>
                  )}
                </div>
              ))
            ) : (
              <div className="no-options-found">No matching options found</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
