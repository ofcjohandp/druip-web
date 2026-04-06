import { FlatList, FlatListProps } from 'react-native';

/**
 * SEED-06: Pre-configured FlatList with windowing optimizations.
 * Use this for all content lists (topic cards, lesson lists, notes).
 * Do NOT use for the active question card in study sessions — render a single card instead.
 */
export function WindowedFlatList<T>(props: FlatListProps<T>) {
  return (
    <FlatList<T>
      windowSize={5}
      removeClippedSubviews={true}
      initialNumToRender={5}
      maxToRenderPerBatch={5}
      {...props}
    />
  );
}
