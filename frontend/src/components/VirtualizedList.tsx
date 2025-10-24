import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import {
  Box,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  CircularProgress,
  Typography,
  Fade,
} from '@mui/material';
import { FixedSizeList as List as VirtualList } from 'react-window';
import { usePerformance } from '../hooks/usePerformance';

interface VirtualizedListProps<T> {
  items: T[];
  height: number;
  itemHeight: number;
  renderItem: (props: { index: number; style: React.CSSProperties; data: T }) => React.ReactNode;
  onLoadMore?: () => void;
  hasNextPage?: boolean;
  loading?: boolean;
  emptyMessage?: string;
  overscanCount?: number;
  className?: string;
  style?: React.CSSProperties;
}

interface VirtualizedGridProps<T> {
  items: T[];
  height: number;
  width: number;
  itemHeight: number;
  itemWidth: number;
  renderItem: (props: { index: number; style: React.CSSProperties; data: T }) => React.ReactNode;
  onLoadMore?: () => void;
  hasNextPage?: boolean;
  loading?: boolean;
  emptyMessage?: string;
  overscanCount?: number;
  className?: string;
  style?: React.CSSProperties;
}

// Virtualized List Component
export const VirtualizedList = <T,>({
  items,
  height,
  itemHeight,
  renderItem,
  onLoadMore,
  hasNextPage = false,
  loading = false,
  emptyMessage = 'No items to display',
  overscanCount = 5,
  className,
  style,
}: VirtualizedListProps<T>) => {
  const [isAtBottom, setIsAtBottom] = useState(false);
  const listRef = useRef<VirtualList>(null);
  const { measureAsync, debounce } = usePerformance();

  // Debounced load more function
  const debouncedLoadMore = useCallback(
    debounce(() => {
      if (onLoadMore && hasNextPage && !loading) {
        onLoadMore();
      }
    }, 300),
    [onLoadMore, hasNextPage, loading, debounce]
  );

  // Check if user is near bottom
  const handleScroll = useCallback(
    ({ scrollTop, scrollHeight, clientHeight }: { scrollTop: number; scrollHeight: number; clientHeight: number }) => {
      const isNearBottom = scrollTop + clientHeight >= scrollHeight - 100;
      setIsAtBottom(isNearBottom);
      
      if (isNearBottom) {
        debouncedLoadMore();
      }
    },
    [debouncedLoadMore]
  );

  // Scroll to top
  const scrollToTop = useCallback(() => {
    if (listRef.current) {
      listRef.current.scrollToItem(0);
    }
  }, []);

  // Scroll to specific item
  const scrollToItem = useCallback((index: number) => {
    if (listRef.current) {
      listRef.current.scrollToItem(index);
    }
  }, []);

  // Memoized item renderer
  const ItemRenderer = useCallback(
    ({ index, style: itemStyle }: { index: number; style: React.CSSProperties }) => {
      const item = items[index];
      
      if (!item) {
        return (
          <div style={itemStyle}>
            <Box sx={{ p: 2, textAlign: 'center' }}>
              <CircularProgress size={24} />
            </Box>
          </div>
        );
      }

      return (
        <div style={itemStyle}>
          {renderItem({ index, style: itemStyle, data: item })}
        </div>
      );
    },
    [items, renderItem]
  );

  // Empty state
  if (items.length === 0 && !loading) {
    return (
      <Box
        sx={{
          height,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          ...style,
        }}
        className={className}
      >
        <Typography variant="body1" color="text.secondary">
          {emptyMessage}
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ position: 'relative', ...style }} className={className}>
      <VirtualList
        ref={listRef}
        height={height}
        itemCount={items.length}
        itemSize={itemHeight}
        itemData={items}
        onScroll={handleScroll}
        overscanCount={overscanCount}
      >
        {ItemRenderer}
      </VirtualList>
      
      {/* Loading indicator */}
      {loading && (
        <Fade in={loading}>
          <Box
            sx={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              display: 'flex',
              justifyContent: 'center',
              p: 2,
              backgroundColor: 'rgba(255, 255, 255, 0.9)',
            }}
          >
            <CircularProgress size={24} />
          </Box>
        </Fade>
      )}
    </Box>
  );
};

// Virtualized Grid Component
export const VirtualizedGrid = <T,>({
  items,
  height,
  width,
  itemHeight,
  itemWidth,
  renderItem,
  onLoadMore,
  hasNextPage = false,
  loading = false,
  emptyMessage = 'No items to display',
  overscanCount = 5,
  className,
  style,
}: VirtualizedGridProps<T>) => {
  const [isAtBottom, setIsAtBottom] = useState(false);
  const gridRef = useRef<any>(null);
  const { measureAsync, debounce } = usePerformance();

  // Calculate grid dimensions
  const columnCount = Math.floor(width / itemWidth);
  const rowCount = Math.ceil(items.length / columnCount);

  // Debounced load more function
  const debouncedLoadMore = useCallback(
    debounce(() => {
      if (onLoadMore && hasNextPage && !loading) {
        onLoadMore();
      }
    }, 300),
    [onLoadMore, hasNextPage, loading, debounce]
  );

  // Check if user is near bottom
  const handleScroll = useCallback(
    ({ scrollTop, scrollHeight, clientHeight }: { scrollTop: number; scrollHeight: number; clientHeight: number }) => {
      const isNearBottom = scrollTop + clientHeight >= scrollHeight - 100;
      setIsAtBottom(isNearBottom);
      
      if (isNearBottom) {
        debouncedLoadMore();
      }
    },
    [debouncedLoadMore]
  );

  // Scroll to top
  const scrollToTop = useCallback(() => {
    if (gridRef.current) {
      gridRef.current.scrollToItem({ rowIndex: 0, columnIndex: 0 });
    }
  }, []);

  // Scroll to specific item
  const scrollToItem = useCallback((index: number) => {
    if (gridRef.current) {
      const rowIndex = Math.floor(index / columnCount);
      const columnIndex = index % columnCount;
      gridRef.current.scrollToItem({ rowIndex, columnIndex });
    }
  }, [columnCount]);

  // Memoized item renderer
  const ItemRenderer = useCallback(
    ({ rowIndex, columnIndex, style: itemStyle }: { rowIndex: number; columnIndex: number; style: React.CSSProperties }) => {
      const index = rowIndex * columnCount + columnIndex;
      const item = items[index];
      
      if (!item) {
        return (
          <div style={itemStyle}>
            <Box sx={{ p: 2, textAlign: 'center' }}>
              <CircularProgress size={24} />
            </Box>
          </div>
        );
      }

      return (
        <div style={itemStyle}>
          {renderItem({ index, style: itemStyle, data: item })}
        </div>
      );
    },
    [items, renderItem, columnCount]
  );

  // Empty state
  if (items.length === 0 && !loading) {
    return (
      <Box
        sx={{
          height,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          ...style,
        }}
        className={className}
      >
        <Typography variant="body1" color="text.secondary">
          {emptyMessage}
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ position: 'relative', ...style }} className={className}>
      {/* Grid implementation would go here */}
      {/* For now, using a simple list as placeholder */}
      <VirtualList
        ref={gridRef}
        height={height}
        itemCount={rowCount}
        itemSize={itemHeight}
        itemData={items}
        onScroll={handleScroll}
        overscanCount={overscanCount}
      >
        {({ index, style: itemStyle }) => (
          <div style={itemStyle}>
            <Box sx={{ display: 'flex', gap: 1 }}>
              {Array.from({ length: columnCount }, (_, colIndex) => {
                const itemIndex = index * columnCount + colIndex;
                const item = items[itemIndex];
                
                if (!item) return null;
                
                return (
                  <Box key={itemIndex} sx={{ width: itemWidth, height: itemHeight }}>
                    {renderItem({ index: itemIndex, style: {}, data: item })}
                  </Box>
                );
              })}
            </Box>
          </div>
        )}
      </VirtualList>
      
      {/* Loading indicator */}
      {loading && (
        <Fade in={loading}>
          <Box
            sx={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              display: 'flex',
              justifyContent: 'center',
              p: 2,
              backgroundColor: 'rgba(255, 255, 255, 0.9)',
            }}
          >
            <CircularProgress size={24} />
          </Box>
        </Fade>
      )}
    </Box>
  );
};

// Infinite Scroll Hook
export const useInfiniteScroll = <T>(
  fetchMore: () => Promise<T[]>,
  initialItems: T[] = []
) => {
  const [items, setItems] = useState<T[]>(initialItems);
  const [loading, setLoading] = useState(false);
  const [hasNextPage, setHasNextPage] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const loadMore = useCallback(async () => {
    if (loading || !hasNextPage) return;

    setLoading(true);
    setError(null);

    try {
      const newItems = await fetchMore();
      
      if (newItems.length === 0) {
        setHasNextPage(false);
      } else {
        setItems(prev => [...prev, ...newItems]);
      }
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, [fetchMore, loading, hasNextPage]);

  const reset = useCallback(() => {
    setItems(initialItems);
    setLoading(false);
    setHasNextPage(true);
    setError(null);
  }, [initialItems]);

  return {
    items,
    loading,
    hasNextPage,
    error,
    loadMore,
    reset,
  };
};

export default VirtualizedList;







