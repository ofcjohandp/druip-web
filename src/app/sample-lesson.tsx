import { View, Text, StyleSheet } from 'react-native';

export default function SampleLessonScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Sample Lesson</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#FFFFFF' },
  text: { fontSize: 18, color: '#1A1A1A' },
});
