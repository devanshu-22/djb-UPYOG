import React, { Fragment } from "react";
import { Link } from "react-router-dom";

const shouldRenderLinkCount = (count) => count !== undefined && count !== null && count !== "";

const ModuleLinksView = ({ links = [], moduleName }) => {
    return (
        <div className="expanded-content">
            <div className="content-header">
                <h2 className="content-title">{moduleName}</h2>
            </div>

            <div className="content-section-title">Quick Actions & Services</div>

            <div className="content-links-list">
                {links && links.length > 0 ? (
                    links.map((linkItem, index) => {
                        const label = linkItem.label;
                        const subLabel = linkItem.subLabel;
                        const count = linkItem.count;
                        const url = linkItem.link;

                        const Content = (
                            <div className="module-link-card">
                                <div className="link-card-info">
                                    <div className="link-card-copy">
                                        <span className="link-card-label">{label}</span>
                                        {subLabel ? <span className="link-card-sublabel">{subLabel}</span> : null}
                                    </div>
                                    {shouldRenderLinkCount(count) ? <span className="link-card-count">{count}</span> : null}
                                </div>
                                <div className="link-card-arrow">
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                        <polyline points="9 18 15 12 9 6"></polyline>
                                    </svg>
                                </div>
                            </div>
                        );

                        return (
                            <div key={index} className="link-wrapper">
                                {url ? (
                                    url.includes('digit-ui') ? <Link to={url}>{Content}</Link> : <a href={url}>{Content}</a>
                                ) : (
                                    <div style={{ cursor: 'default' }}>{Content}</div>
                                )}
                            </div>
                        );
                    })
                ) : (
                    <div className="no-links-msg">No actions available for this module.</div>
                )}
            </div>
        </div>
    );
};

export default ModuleLinksView;
