import { useEffect, useRef } from 'react'
import Button from '@mui/material/Button'
import CircularProgress from '@mui/material/CircularProgress'
import TableRow from '@mui/material/TableRow'
import { EmptyRow, EmptyTableCell } from './TableStyles.style'

interface InfiniteLoadingRowProps {
  container: HTMLDivElement | null
  colSpan: number
  hasNextPage: boolean
  isFetching: boolean
  isError: boolean
  enabled: boolean
  onLoadMore: () => Promise<unknown>
}

export const InfiniteLoadingRow = ({ container, colSpan, hasNextPage, isFetching, isError, enabled, onLoadMore }: InfiniteLoadingRowProps) => {
  const rowRef = useRef<HTMLTableRowElement>(null)

  useEffect(() => {
    if (!container || !rowRef.current || !enabled || !hasNextPage || isFetching || isError) return
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        observer.disconnect()
        void onLoadMore().catch(() => undefined)
      }
    }, { root: container, rootMargin: '0px 0px 200px 0px' })
    observer.observe(rowRef.current)
    return () => observer.disconnect()
  }, [container, enabled, hasNextPage, isFetching, isError, onLoadMore])

  if (!hasNextPage) return null
  return (
    <TableRow ref={rowRef}>
      <EmptyTableCell colSpan={colSpan}>
        <EmptyRow>
          {isError
            ? <Button onClick={() => void onLoadMore()}>Retry loading more</Button>
            : <CircularProgress size={24} aria-label="Loading more rows" />}
        </EmptyRow>
      </EmptyTableCell>
    </TableRow>
  )
}
