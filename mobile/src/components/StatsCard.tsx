import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface StatsCardProps {
  title: string;
  value: string;
  icon: string;
  color: string;
}

const StatsCard: React.FC<StatsCardProps> = ({ title, value, icon, color }) => {
  return (
    <View style={styles.card}>
      <View style={styles.content}>
        <View style={[styles.iconContainer, { backgroundColor: color }]}>
          <Text style={styles.icon}>{icon}</Text>
        </View>
        <View style={styles.textContainer}>
          <Text style={styles.value} numberOfLines={1}>
            {value}
          </Text>
          <Text style={styles.title} numberOfLines={2}>
            {title}
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    marginRight: 12,
    width: 160, // Fixed width for consistent alignment
    height: 100, // Fixed height for consistent alignment
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    borderLeftWidth: 4,
    borderLeftColor: '#667eea',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  icon: {
    fontSize: 20,
    color: 'white',
    fontWeight: 'bold',
  },
  textContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  value: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2c3e50',
    marginBottom: 4,
  },
  title: {
    fontSize: 12,
    color: '#7f8c8d',
    fontWeight: '500',
    lineHeight: 14,
  },
});

export default StatsCard;