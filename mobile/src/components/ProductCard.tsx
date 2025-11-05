import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Product } from '../types';

interface ProductCardProps {
  product: Product;
  onEdit: () => void;
  onDelete: () => void;
  formatRupees: (amount: number) => string;
}

const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onEdit,
  onDelete,
  formatRupees,
}) => {
  const getStockStatus = (stock: number) => {
    if (stock === 0) return { status: 'Out of Stock', color: '#e74c3c', bgColor: '#fde8e8' };
    if (stock < 10) return { status: 'Low Stock', color: '#f39c12', bgColor: '#fef5e7' };
    return { status: 'In Stock', color: '#27ae60', bgColor: '#e8f6f3' };
  };

  const stockInfo = getStockStatus(product.stock);

  return (
    <View style={styles.card}>
      
      <View style={styles.header}>
        <View style={styles.productInfo}>
          <Text style={styles.productName} numberOfLines={2}>
            {product.name}
          </Text>
          <View style={styles.categoryContainer}>
            <Text style={styles.productCategory}>
              {product.category || 'Uncategorized'}
            </Text>
          </View>
        </View>
        
       
        <View style={[styles.stockBadge, { backgroundColor: stockInfo.bgColor }]}>
          <Text style={[styles.stockBadgeText, { color: stockInfo.color }]}>
            {stockInfo.status}
          </Text>
        </View>
      </View>

     
      <View style={styles.details}>
        <View style={styles.detailItem}>
          <Text style={styles.detailLabel}>Price</Text>
          <Text style={styles.price}>{formatRupees(product.price)}</Text>
        </View>
        
        <View style={styles.detailItem}>
          <Text style={styles.detailLabel}>Stock</Text>
          <View style={styles.stockContainer}>
            <Text style={[
              styles.stockQuantity,
              { color: stockInfo.color }
            ]}>
              {product.stock} units
            </Text>
          </View>
        </View>
        
        <View style={styles.detailItem}>
          <Text style={styles.detailLabel}>Added</Text>
          <Text style={styles.date}>
            {new Date(product.created_at).toLocaleDateString('en-IN', {
              day: '2-digit',
              month: 'short',
            })}
          </Text>
        </View>
      </View>

    
      <View style={styles.actions}>
        <TouchableOpacity
          style={[styles.button, styles.editButton]}
          onPress={onEdit}
        >
          <Text style={styles.buttonText}>✏️ Edit</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.button, styles.deleteButton]}
          onPress={onDelete}
        >
          <Text style={styles.buttonText}>🗑️ Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    marginHorizontal: 16,
    marginBottom: 12,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#667eea',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  productInfo: {
    flex: 1,
    marginRight: 12,
  },
  productName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2c3e50',
    marginBottom: 8,
    lineHeight: 24,
  },
  categoryContainer: {
    backgroundColor: '#f8f9ff',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  productCategory: {
    fontSize: 13,
    color: '#667eea',
    fontWeight: '500',
  },
  stockBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    minWidth: 80,
    alignItems: 'center',
  },
  stockBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  details: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
    padding: 16,
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
  },
  detailItem: {
    alignItems: 'center',
    flex: 1,
  },
  detailLabel: {
    fontSize: 12,
    color: '#7f8c8d',
    fontWeight: '500',
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  price: {
    fontSize: 16,
    fontWeight: '700',
    color: '#27ae60',
  },
  stockContainer: {
    alignItems: 'center',
  },
  stockQuantity: {
    fontSize: 14,
    fontWeight: '600',
  },
  date: {
    fontSize: 12,
    color: '#7f8c8d',
    fontWeight: '500',
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    minWidth: 100,
    justifyContent: 'center',
  },
  editButton: {
    backgroundColor: '#3498db',
    shadowColor: '#3498db',
  },
  deleteButton: {
    backgroundColor: '#e74c3c',
    shadowColor: '#e74c3c',
  },
  buttonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 4,
  },
});

export default ProductCard;