import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../../App';
import { Product, Stats } from '../types';
import { productAPI } from '../services/api';
import ProductCard from '../components/ProductCard';
import StatsCard from '../components/StatsCard';
import SearchBar from '../components/SearchBar';

type ProductListScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  'ProductList'
>;

type Props = {
  navigation: ProductListScreenNavigationProp;
  route: RouteProp<RootStackParamList, 'ProductList'>;
};

const ProductListScreen: React.FC<Props> = ({ navigation }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [connectionError, setConnectionError] = useState(false);
  const [stats, setStats] = useState<Stats>({
    totalProducts: 0,
    totalStock: 0,
    totalValue: 0,
    lowStockItems: 0,
  });

  useEffect(() => {
    loadProducts();
  }, []);

  useEffect(() => {
    filterProducts();
    calculateStats();
  }, [products, searchQuery]);

  const loadProducts = async () => {
    try {
      setLoading(true);
      setConnectionError(false);
      const response = await productAPI.getAll();
      setProducts(response.data.data);
    } catch (error: any) {
      console.error('Error loading products:', error);
      setConnectionError(true);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadProducts();
  };

  const filterProducts = () => {
    if (!searchQuery) {
      setFilteredProducts(products);
      return;
    }

    const filtered = products.filter(
      (product) =>
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.category?.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredProducts(filtered);
  };

  const calculateStats = () => {
    const totalProducts = products.length;
    const totalStock = products.reduce((sum, product) => sum + product.stock, 0);
    const totalValue = products.reduce((sum, product) => sum + product.price * product.stock, 0);
    const lowStockItems = products.filter((product) => product.stock < 10).length;

    setStats({
      totalProducts,
      totalStock,
      totalValue,
      lowStockItems,
    });
  };

  const handleDeleteProduct = (id: number) => {
    Alert.alert(
      'Delete Product',
      'Are you sure you want to delete this product?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => deleteProduct(id),
        },
      ]
    );
  };

  const deleteProduct = async (id: number) => {
    try {
      await productAPI.delete(id);
      Alert.alert('Success', 'Product deleted successfully');
      loadProducts();
    } catch (error) {
      Alert.alert('Error', 'Failed to delete product');
      console.error('Error deleting product:', error);
    }
  };

  const formatRupees = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const formatCompact = (amount: number) => {
    if (amount >= 10000000) {
      return `₹${(amount / 10000000).toFixed(1)}Cr`;
    } else if (amount >= 100000) {
      return `₹${(amount / 100000).toFixed(1)}L`;
    } else if (amount >= 1000) {
      return `₹${(amount / 1000).toFixed(1)}K`;
    }
    return `₹${amount}`;
  };

  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#667eea" />
        <Text style={styles.loadingText}>Loading your inventory...</Text>
      </View>
    );
  }

  if (connectionError) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorIcon}>⚠️</Text>
        <Text style={styles.errorTitle}>Connection Error</Text>
        <Text style={styles.errorMessage}>
          Cannot connect to the server.{'\n\n'}
          Please check:{'\n'}
          • Backend server is running{'\n'}
          • Correct IP address in settings{'\n'}
          • Both devices on same network
        </Text>
        <TouchableOpacity style={styles.retryButton} onPress={loadProducts}>
          <Text style={styles.retryButtonText}>Try Again</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
    
      <View style={styles.statsSection}>
        <Text style={styles.statsTitle}>Dashboard Overview</Text>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.statsScrollContent}
        >
          <StatsCard
            title="Total Products"
            value={stats.totalProducts.toString()}
            icon="📊"
            color="#3498db"
          />
          <StatsCard
            title="Total Stock"
            value={stats.totalStock.toString()}
            icon="📦"
            color="#2ecc71"
          />
          <StatsCard
            title="Inventory Value"
            value={formatCompact(stats.totalValue)}
            icon="💰"
            color="#f39c12"
          />
          <StatsCard
            title="Low Stock Items"
            value={stats.lowStockItems.toString()}
            icon="⚠️"
            color="#e74c3c"
          />
        </ScrollView>
   </View>


      <View style={styles.searchSection}>
        <SearchBar
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Search products by name or category..."
        />
      </View>


      <View style={styles.productsSection}>
        <Text style={styles.productsTitle}>
          Products ({filteredProducts.length})
        </Text>
        <FlatList
          data={filteredProducts}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <ProductCard
              product={item}
              onEdit={() => navigation.navigate('EditProduct', { product: item })}
              onDelete={() => handleDeleteProduct(item.id)}
              formatRupees={formatRupees}
            />
          )}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyIcon}>📦</Text>
              <Text style={styles.emptyTitle}>
                {searchQuery ? 'No products found' : 'No products available'}
              </Text>
              <Text style={styles.emptySubtitle}>
                {searchQuery ? 'Try adjusting your search' : 'Tap the + button to add your first product'}
              </Text>
            </View>
          }
          contentContainerStyle={styles.listContent}
          style={styles.list}
          showsVerticalScrollIndicator={false}
        />
      </View>


      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('AddProduct')}
      >
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  statsSection: {
    backgroundColor: 'white',
    paddingVertical: 20,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  statsTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2c3e50',
    marginBottom: 16,
  },
  statsScrollContent: {
    paddingRight: 16,
    alignItems: 'center',
  },
  searchSection: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  productsSection: {
    flex: 1,
    paddingTop: 16,
  },
  productsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 12,
    marginHorizontal: 16,
  },
  list: {
    flex: 1,
  },
  listContent: {
    paddingBottom: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    padding: 20,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    padding: 20,
  },
  errorIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#2c3e50',
    textAlign: 'center',
    marginBottom: 8,
  },
  errorMessage: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 20,
  },
  retryButton: {
    backgroundColor: '#667eea',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
    minHeight: 300,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
    opacity: 0.5,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2c3e50',
    textAlign: 'center',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#7f8c8d',
    textAlign: 'center',
    lineHeight: 20,
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    backgroundColor: '#667eea',
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#667eea',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  fabText: {
    color: 'white',
    fontSize: 28,
    fontWeight: '300',
  },
});

export default ProductListScreen;