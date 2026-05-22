export type LogFiltersParams = {
    search?: string
    mode?: string
    status?: string
    image_attached?: string
    sort?: string
}

export const buildLogFilters = (
    searchQuery: string,
    modeFilter: string,
    statusFilter: string,
    imageFilter: string,
    sortOrder: string
): LogFiltersParams | undefined => {
    const filters: LogFiltersParams = {
        sort: sortOrder,
    }

    if (searchQuery.trim()) filters.search = searchQuery.trim()
    if (modeFilter !== "all") filters.mode = modeFilter
    if (statusFilter !== "all") filters.status = statusFilter
    if (imageFilter !== "all") filters.image_attached = imageFilter

    return filters
}

export const hasActiveLogFilters = (
    searchQuery: string,
    modeFilter: string,
    statusFilter: string,
    imageFilter: string
): boolean =>
    !!searchQuery.trim() ||
    modeFilter !== "all" ||
    statusFilter !== "all" ||
    imageFilter !== "all"
