/** UI state supplied by a view container; independent of the query library. */
export interface TableLoadingState {
  isLoading: boolean
  isError: boolean
  pagination: {
    hasNextPage: boolean
    isFetching: boolean
    isError: boolean
    enabled: boolean
    /** Requests the next page; the container owns errors and query state. */
    onLoadMore: () => Promise<unknown>
  }
}
