import React, { Fragment, useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";

const CollapsibleModuleSidebar = ({ links = [], moduleName = "Dashboard", Icon }) => {
    const [isCollapsed, setIsCollapsed] = useState(true);
    const [isMobileOpen, setIsMobileOpen] = useState(false);
    const location = useLocation();

    useEffect(() => {
        setIsMobileOpen(false);
    }, [location.pathname]);

    const handleNavClick = () => {
        if (isMobileOpen) setIsMobileOpen(false);
    };

    const renderNavLink = (linkItem, index, extraClass = "") => {
        const isActive = location.pathname === linkItem.link;
        const initials = linkItem.label.substring(0, 2).toUpperCase();

        const LinkContent = (
            <div className="nav-item-content">
                <div className="nav-icon-wrapper">
                    {linkItem.icon ? linkItem.icon : <span className="fallback-initial">{initials}</span>}
                </div>
                <span className="nav-text">{linkItem.label}</span>
            </div>
        );

        const className = `nav-item ${isActive ? "active" : ""} ${extraClass}`;

        return (
            <div
                key={index}
                className={className}
                title={isCollapsed ? linkItem.label : ""}
                onClick={handleNavClick}
            >
                {linkItem.link ? (
                    linkItem.link.includes("digit-ui") ? (
                        <Link to={linkItem.link} className="nav-link">
                            {LinkContent}
                        </Link>
                    ) : (
                        <a href={linkItem.link} className="nav-link">
                            {LinkContent}
                        </a>
                    )
                ) : (
                    <div className="nav-link disabled">{LinkContent}</div>
                )}
            </div>
        );
    };

    return (
        <div className="module-sidebar-wrapper">
            {/* Mobile toggle button - hidden on desktop via CSS */}
            <button
                className={`mobile-sidebar-toggle module-sidebar-toggle ${isMobileOpen ? "open" : ""}`}
                onClick={() => setIsMobileOpen((prev) => !prev)}
                aria-label={isMobileOpen ? "Close module menu" : "Open module menu"}
                aria-expanded={isMobileOpen}
                aria-controls="module-sidebar"
                type="button"
            >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="module-sidebar-toggle-icon" aria-hidden="true">
                    <path d="M9 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <span className="module-sidebar-toggle-label">{moduleName}</span>
            </button>

            <div
                className={`module-sidebar-backdrop ${isMobileOpen ? "open" : ""}`}
                onClick={() => setIsMobileOpen(false)}
                aria-hidden={!isMobileOpen}
            />

            <Fragment>
                {/* Horizontal nav bar - visible only on mobile */}
                <nav className="mobile-horiz-nav" aria-label={`${moduleName} navigation`}>
                    {links.map((linkItem, index) => {
                        const isActive = location.pathname === linkItem.link;
                        if (linkItem.link) {
                            return linkItem.link.includes("digit-ui") ? (
                                <Link
                                    key={index}
                                    to={linkItem.link}
                                    className={`horiz-pill ${isActive ? "active" : ""}`}
                                    onClick={handleNavClick}
                                >
                                    {linkItem.label}
                                </Link>
                            ) : (
                                <a
                                    key={index}
                                    href={linkItem.link}
                                    className={`horiz-pill ${isActive ? "active" : ""}`}
                                    onClick={handleNavClick}
                                >
                                    {linkItem.label}
                                </a>
                            );
                        }
                        return (
                            <span
                                key={index}
                                className="horiz-pill disabled"
                            >
                                {linkItem.label}
                            </span>
                        );
                    })}
                </nav>

                {/* Desktop/slide-in sidebar */}
                <aside
                    id="module-sidebar"
                    className={`premium-sidebar ${isCollapsed ? "collapsed" : "expanded"} ${isMobileOpen ? "mobile-open" : ""}`}
                >
                    {/* Header Section */}
                    <div className="sidebar-header">
                        <div className="brand-container">
                            <div className="brand-icon">
                                {Icon || <div className="default-icon"></div>}
                            </div>
                            <h2 className="brand-name">{moduleName}</h2>
                        </div>

                        <button
                            className="collapse-toggle"
                            onClick={() => setIsCollapsed(!isCollapsed)}
                            aria-label="Toggle Sidebar"
                            type="button"
                        >
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                {isCollapsed ? (
                                    <path d="M13 17l5-5-5-5M6 17l5-5-5-5" />
                                ) : (
                                    <path d="M11 17l-5-5 5-5M18 17l-5-5 5-5" />
                                )}
                            </svg>
                        </button>

                        <button
                            className="mobile-close-btn"
                            onClick={() => setIsMobileOpen(false)}
                            aria-label="Close module menu"
                            type="button"
                        >
                            X
                        </button>
                    </div>

                    {/* Navigation Section */}
                    <nav className="sidebar-nav">
                        {links.map((linkItem, index) => renderNavLink(linkItem, index))}
                    </nav>
                </aside>
            </Fragment>
        </div>
    );
};

export default CollapsibleModuleSidebar;