import React, { useEffect, useRef, useState } from "react";
import {
  useGlobalFilter,
  usePagination,
  useRowSelect,
  useSortBy,
  useTable,
} from "react-table";
import { ArrowBack, ArrowForward, ArrowToFirst, ArrowToLast } from "./svgindex";

const noop = () => { };

const getSearchableText = (obj) => {
  if (obj === null || obj === undefined) return "";
  if (typeof obj !== "object") return String(obj).toLowerCase();
  return Object.values(obj).map(getSearchableText).join(" ");
};

/* ─── Design Tokens ─────────────────────────────────────────────────────────── */
const T = {
  accent: "#2563eb",
  accentDark: "#1d4ed8",
  accentLight: "#eff6ff",
  accentMid: "#bfdbfe",
  surface: "#ffffff",
  surfaceAlt: "#f8fafc",
  surfaceHover: "#f0f4ff",
  border: "#e2e8f0",
  borderStrong: "#cbd5e1",
  textPrimary: "#0f172a",
  textSecondary: "#475569",
  textMuted: "#94a3b8",
  warn: "#f59e0b",
  warnLight: "#fffbeb",
  warnBorder: "#fde68a",
  warnDark: "#b45309",
  fontBody: "'DM Sans', 'Segoe UI', ui-sans-serif, sans-serif",
  fontMono: "'JetBrains Mono', 'Fira Code', ui-monospace, monospace",
};

/* ─── Icons ──────────────────────────────────────────────────────────────────── */
const IconSortNeutral = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.3 }}>
    <path d="M7 16V4m0 0L3 8m4-4 4 4" /><path d="M17 8v12m0 0 4-4m-4 4-4-4" />
  </svg>
);
const IconSortAsc = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 19V5m0 0-7 7m7-7 7 7" />
  </svg>
);
const IconSortDesc = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 5v14m0 0 7-7m-7 7-7-7" />
  </svg>
);

const IconSearch = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);

const IconClose = ({ color = "currentColor" }) => (
  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

/* ─── Pagination Button ─────────────────────────────────────────────────────── */
const PagBtn = ({ onClick, disabled, title, children, active = false }) => {
  const [hovered, setHovered] = useState(false);
  const base = {
    display: "inline-flex", alignItems: "center", justifyContent: "center",
    width: 30, height: 30, borderRadius: 5,
    cursor: disabled ? "not-allowed" : "pointer",
    fontFamily: T.fontMono, fontSize: 12, fontWeight: 600,
    lineHeight: 0, opacity: disabled ? 0.35 : 1,
    transition: "all 0.15s",
  };
  if (active) {
    return (
      <button onClick={onClick} disabled={disabled} title={title} style={{ ...base, background: T.accent, border: `1.5px solid ${T.accent}`, color: "#fff", boxShadow: "0 2px 6px rgba(37,99,235,0.30)" }}>
        {children}
      </button>
    );
  }
  return (
    <button
      onClick={onClick} disabled={disabled} title={title}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        ...base,
        background: hovered && !disabled ? T.accentLight : T.surface,
        border: `1.5px solid ${hovered && !disabled ? T.accentMid : T.borderStrong}`,
        color: hovered && !disabled ? T.accent : T.textSecondary,
      }}
    >
      {children}
    </button>
  );
};

/* ─── Main Table ────────────────────────────────────────────────────────────── */
const Table = ({
  className = "table",
  t,
  data,
  columns,
  getCellProps,
  currentPage = 0,
  pageSizeLimit = 10,
  disableSort = true,
  autoSort = true,
  initSortId = "",
  onSearch = false,
  manualPagination = true,
  totalRecords,
  onNextPage,
  onPrevPage,
  globalSearch,
  onSort = noop,
  onPageSizeChange,
  onLastPage,
  onFirstPage,
  isPaginationRequired = true,
  sortParams = [],
  showAutoSerialNo = false,
  customTableWrapperClassName = "",
  styles = {},
  tableTopComponent,
  tableRef,
  isReportTable = false,
  inboxStyles,
  tableTitle,
}) => {
  const [hoveredRow, setHoveredRow] = useState(null);
  const [internalSearch, setInternalSearch] = useState("");
  const [searchFocused, setSearchFocused] = useState(false);

  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    rows,         // all rows (after filtering/sorting, before pagination)
    prepareRow,
    page,         // current page rows
    canPreviousPage,
    canNextPage,
    pageOptions,
    pageCount,
    gotoPage,
    nextPage,
    previousPage,
    setPageSize,
    setGlobalFilter,
    state: { pageIndex, pageSize, sortBy, globalFilter },
  } = useTable(
    {
      columns,
      data,
      initialState: {
        pageIndex: currentPage,
        pageSize: pageSizeLimit,
        sortBy: autoSort ? [{ id: initSortId, desc: false }] : sortParams,
      },
      // ── Keep ALL original pagination logic exactly as it was ──────────────
      pageCount: totalRecords > 0 ? Math.ceil(totalRecords / pageSizeLimit) : -1,
      manualPagination: manualPagination,
      disableMultiSort: false,
      disableSortBy: disableSort,
      manualSortBy: autoSort ? false : true,
      autoResetPage: false,
      autoResetSortBy: false,
      disableSortRemove: true,
      disableGlobalFilter: false,
      globalFilter: globalSearch || ((rows, columnIds, filterValue) => {
        if (!filterValue) return rows;
        const lowerVal = String(filterValue).toLowerCase();
        return rows.filter((row) => {
          const rowText = getSearchableText(row.original);
          return rowText.includes(lowerVal);
        });
      }),
      useControlledState: (state) => {
        return React.useMemo(() => ({
          ...state,
          pageIndex: manualPagination ? currentPage : state.pageIndex,
        }));
      },
      // ─────────────────────────────────────────────────────────────────────
    },
    useGlobalFilter,
    useSortBy,
    usePagination,
    useRowSelect
  );

  // Keep original onSort behaviour
  useEffect(() => { onSort(sortBy); }, [onSort, sortBy]);

  // Integrated Search box
  useEffect(() => {
    if (onSearch !== false && typeof onSearch === "string") {
      setGlobalFilter(onSearch);
    } else {
      setGlobalFilter(internalSearch || undefined);
    }
  }, [onSearch, internalSearch, setGlobalFilter]);

  const tref = useRef();

  // ── Pagination display values — original logic, untouched ────────────────
  const rangeStart = pageIndex * pageSize + 1;
  const rangeEnd = manualPagination
    ? (currentPage + 1) * pageSizeLimit > totalRecords
      ? totalRecords
      : (currentPage + 1) * pageSizeLimit
    : pageIndex * pageSize + page?.length;
  const totalLabel = totalRecords
    ? `of ${manualPagination ? totalRecords : rows.length}`
    : "";

  return (
    <div style={{
      fontFamily: T.fontBody,
      background: T.surface,
      border: `1px solid ${T.border}`,
      borderRadius: 12,
      boxShadow: "0 1px 3px rgba(15,23,42,0.06), 0 1px 2px rgba(15,23,42,0.04)",
      width: "100%",
    }}>

      {/* ── Top Bar ──────────────────────────────────────────────────────── */}
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "12px 16px", borderBottom: `1px solid ${T.border}`,
        background: T.surfaceAlt, gap: 12, flexWrap: "wrap",
      }}>
        {/* Left: title + total badge */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
          {tableTitle && (
            <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: T.textPrimary, letterSpacing: "-0.015em" }}>
              {tableTitle}
            </h3>
          )}
          {totalRecords !== undefined && (
            <div style={{
              display: "inline-flex", alignItems: "center", gap: 6,
              background: T.accent, color: "#fff", borderRadius: 999,
              padding: "3px 10px 3px 5px", fontSize: 11, fontWeight: 600,
              boxShadow: "0 1px 4px rgba(37,99,235,0.28)",
            }}>
              <span style={{ background: "rgba(255,255,255,0.22)", borderRadius: 999, padding: "1px 7px", fontSize: 11, fontWeight: 700, fontFamily: T.fontMono }}>
                {totalRecords}
              </span>
              <span style={{ fontSize: 10, opacity: 0.88, textTransform: "uppercase", letterSpacing: "0.06em" }}>
                {t ? t("CS_TOTAL_RECORDS") : "Total Records"}
              </span>
            </div>
          )}
        </div>

        {/* Right: internal search box + tableTopComponent */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
          <div style={{ position: "relative", display: "inline-flex", alignItems: "center" }}>
            <span style={{ position: "absolute", left: 9, color: searchFocused ? T.accent : T.textMuted, lineHeight: 0, pointerEvents: "none" }}>
              <IconSearch />
            </span>
            <input
              placeholder={t ? t("CS_COMMON_SEARCH") : "Search table…"}
              value={internalSearch}
              onChange={(e) => setInternalSearch(e.target.value)}
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setSearchFocused(false)}
              style={{
                border: `1.5px solid ${searchFocused ? T.accent : T.borderStrong}`,
                borderRadius: 6, padding: "6px 10px 6px 30px",
                fontSize: 13, fontFamily: T.fontBody,
                color: T.textPrimary, background: T.surface, outline: "none",
                width: 200,
                boxShadow: searchFocused ? "0 0 0 3px rgba(37,99,235,0.10)" : "none",
                transition: "border-color 0.15s, box-shadow 0.15s",
              }}
            />
            {internalSearch && (
              <button
                onClick={() => setInternalSearch("")}
                style={{ position: "absolute", right: 7, background: "none", border: "none", cursor: "pointer", padding: 2, lineHeight: 0, color: T.textMuted, display: "flex", alignItems: "center" }}
              >
                <IconClose />
              </button>
            )}
          </div>
          {tableTopComponent || null}
        </div>
      </div>

      {/* ── Table Scroll Wrapper ─────────────────────────────────────────── */}
      <div
        ref={tref}
        className={customTableWrapperClassName}
        style={{
          width: "100%", overflowX: "auto", WebkitOverflowScrolling: "touch",
          ...(tref.current && tref.current.offsetWidth < tref.current.scrollWidth ? inboxStyles : {}),
        }}
      >
        <table
          className={className}
          {...getTableProps()}
          style={{ width: "100%", borderCollapse: "collapse", borderSpacing: 0, fontSize: 13.5, color: T.textPrimary, fontFamily: T.fontBody, ...styles }}
          ref={tableRef}
        >
          {/* ── Head ────────────────────────────────────────────────────── */}
          <thead>
            {headerGroups.map((headerGroup) => (
              <tr {...headerGroup.getHeaderGroupProps()} style={{ background: T.surfaceAlt }}>

                {showAutoSerialNo && (
                  <th style={{ width: 48, padding: "12px 8px", textAlign: "center", borderBottom: `2px solid ${T.borderStrong}`, fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em", color: T.textSecondary, whiteSpace: "nowrap", verticalAlign: "top" }}>
                    {typeof showAutoSerialNo === "string" ? t(showAutoSerialNo) : t("TB_SNO")}
                  </th>
                )}

                {headerGroup.headers.map((column) => {
                  const isSorted = column.isSorted;
                  const headerProps = column.getHeaderProps(column.getSortByToggleProps());
                  const mergedStyle = {
                    ...(headerProps.style || {}),
                    position: "relative",
                    padding: "12px 14px",
                    verticalAlign: "top",
                    borderBottom: `2px solid ${T.borderStrong}`,
                    whiteSpace: "nowrap",
                    userSelect: "none",
                    cursor: column.canSort ? "pointer" : "default",
                    background: isSorted ? T.accentLight : T.surfaceAlt,
                    transition: "background 0.15s",
                  };

                  return (
                    <th
                      {...headerProps}
                      title={column.canSort ? "Click to sort" : ""}
                      style={mergedStyle}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: 5, justifyContent: "center" }}>
                        <span style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em", color: isSorted ? T.accentDark : T.textSecondary, transition: "color 0.15s" }}>
                          {column.render("Header")}
                        </span>
                        {column.canSort && (
                          <span style={{ lineHeight: 0, color: isSorted ? T.accent : T.textMuted }}>
                            {isSorted ? (column.isSortedDesc ? <IconSortDesc /> : <IconSortAsc />) : <IconSortNeutral />}
                          </span>
                        )}
                      </div>
                    </th>
                  );
                })}
              </tr>
            ))}
          </thead>

          {/* ── Body ────────────────────────────────────────────────────── */}
          <tbody {...getTableBodyProps()}>
            {page.length === 0 ? (
              <tr>
                <td colSpan={columns.length + (showAutoSerialNo ? 1 : 0)} style={{ padding: "48px 20px", textAlign: "center" }}>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
                    <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke={T.textMuted} strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.4 }}>
                      <rect x="3" y="3" width="18" height="18" rx="2" /><line x1="3" y1="9" x2="21" y2="9" /><line x1="9" y1="21" x2="9" y2="9" />
                    </svg>
                    <p style={{ margin: 0, fontSize: 14, fontWeight: 500, color: T.textMuted }}>
                      {t ? t("CS_NO_DATA") : "No records found"}
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              page.map((row, i) => {
                prepareRow(row);
                const isHovered = hoveredRow === i;
                return (
                  <tr
                    {...row.getRowProps()}
                    onMouseEnter={() => setHoveredRow(i)}
                    onMouseLeave={() => setHoveredRow(null)}
                    style={{
                      background: isHovered ? T.surfaceHover : i % 2 === 0 ? T.surface : T.surfaceAlt,
                      borderBottom: `1px solid ${T.border}`,
                      transition: "background 0.12s",
                    }}
                  >
                    {showAutoSerialNo && (
                      <td style={{ padding: "13px 8px", textAlign: "center", verticalAlign: "middle" }}>
                        <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 22, height: 22, background: T.border, borderRadius: 4, fontSize: 10, fontWeight: 700, color: T.textMuted, fontFamily: T.fontMono }}>
                          {pageIndex * pageSize + i + 1}
                        </span>
                      </td>
                    )}
                    {row.cells.map((cell) => {
                      const cellProps = getCellProps ? getCellProps(cell) : {};
                      return (
                        <td
                          {...cell.getCellProps([cellProps])}
                          style={{
                            padding: "13px 14px", verticalAlign: "middle",
                            fontSize: 13.5, color: T.textPrimary, lineHeight: 1.45,
                            whiteSpace: "nowrap",
                            ...(cellProps && cellProps.style ? cellProps.style : {}),
                          }}
                        >
                          {cell.attachment_link ? (
                            <a href={cell.attachment_link} style={{ color: T.accent, textDecoration: "none", fontWeight: 500, borderBottom: `1px solid ${T.accentMid}` }}>
                              {cell.render("Cell")}
                            </a>
                          ) : (
                            cell.render("Cell")
                          )}
                        </td>
                      );
                    })}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* ── Pagination — original logic, modernised UI ───────────────────── */}
      {isPaginationRequired && (
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "flex-end",
          gap: 12, padding: "12px 16px",
          borderTop: `1px solid ${T.border}`,
          background: T.surfaceAlt, flexWrap: "wrap",
          fontFamily: T.fontBody,
          color: T.textSecondary,
        }}>
          {/* Rows per page */}
          <span style={{ fontSize: 12, color: T.textMuted, whiteSpace: "nowrap" }}>
            {t ? t("CS_COMMON_ROWS_PER_PAGE") : "Rows per page"} :
          </span>
          <div style={{ position: "relative", display: "inline-flex", alignItems: "center" }}>
            <select
              value={pageSize}
              onChange={manualPagination ? onPageSizeChange : (e) => setPageSize(Number(e.target.value))}
              style={{
                appearance: "none", WebkitAppearance: "none",
                background: T.surface, border: `1.5px solid ${T.borderStrong}`,
                borderRadius: 5, padding: "5px 26px 5px 9px",
                fontSize: 12.5, fontFamily: T.fontBody, fontWeight: 600,
                color: T.textPrimary, cursor: "pointer", outline: "none",
                marginRight: 8,
              }}
            >
              {[10, 20, 30, 40, 50].map((ps) => (
                <option key={ps} value={ps}>{ps}</option>
              ))}
            </select>
            <span style={{ position: "absolute", right: 15, pointerEvents: "none", lineHeight: 0, color: T.textMuted }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </span>
          </div>

          {/* Record range — original display logic */}
          <span style={{ fontSize: 12.5 }}>
            <strong style={{ fontFamily: T.fontMono, fontWeight: 700, color: T.textPrimary, fontSize: 12 }}>
              {pageIndex * pageSize + 1}
            </strong>
            {"–"}
            <strong style={{ fontFamily: T.fontMono, fontWeight: 700, color: T.textPrimary, fontSize: 12 }}>
              {rangeEnd}
            </strong>
            {" "}
            {totalLabel}
          </span>

          {/* ── Navigation — original conditions, modernised buttons ─────── */}
          {/* First page */}
          {!manualPagination && pageIndex !== 0 && (
            <PagBtn title="First page" onClick={() => gotoPage(0)}>
              <ArrowToFirst />
            </PagBtn>
          )}
          {canPreviousPage && manualPagination && onFirstPage && (
            <PagBtn title="First page" onClick={() => onFirstPage()}>
              <ArrowToFirst />
            </PagBtn>
          )}

          {/* Previous */}
          {canPreviousPage && (
            <PagBtn title="Previous page" onClick={() => manualPagination ? onPrevPage() : previousPage()}>
              <ArrowBack />
            </PagBtn>
          )}

          {/* Next */}
          {canNextPage && (
            <PagBtn title="Next page" onClick={() => manualPagination ? onNextPage() : nextPage()}>
              <ArrowForward />
            </PagBtn>
          )}

          {/* Last page */}
          {!manualPagination && pageIndex !== pageCount - 1 && (
            <PagBtn title="Last page" onClick={() => gotoPage(pageCount - 1)}>
              <ArrowToLast />
            </PagBtn>
          )}
          {rows.length === pageSizeLimit && canNextPage && manualPagination && onLastPage && (
            <PagBtn title="Last page" onClick={() => onLastPage()}>
              <ArrowToLast />
            </PagBtn>
          )}
        </div>
      )}
    </div>
  );
};

export default Table;