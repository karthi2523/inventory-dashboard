import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  Modal,
  FlatList,
  StyleSheet,
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../../App';
import { ProductFormData } from '../types';
import { productAPI } from '../services/api';
import { PREDEFINED_CATEGORIES } from '../constants/categories';

type EditProductScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  'EditProduct'
>;

type Props = {
  navigation: EditProductScreenNavigationProp;
  route: RouteProp<RootStackParamList, 'EditProduct'>;
};

const EditProductScreen: React.FC<Props> = ({ navigation, route }) => {
  const { product } = route.params;
  const [formData, setFormData] = useState<ProductFormData>({
    name: product.name,
    category: product.category || '',
    price: product.price.toString(),
    stock: product.stock.toString(),
  });
  const [loading, setLoading] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [errors, setErrors] = useState({
    name: '',
    price: '',
    stock: '',
  });

  const validateForm = () => {
    const newErrors = {
      name: '',
      price: '',
      stock: '',
    };

    if (!formData.name.trim()) {
      newErrors.name = 'Product name is required';
    }

    if (!formData.price || parseFloat(formData.price) <= 0) {
      newErrors.price = 'Valid price is required';
    }

    if (!formData.stock || parseInt(formData.stock) < 0) {
      newErrors.stock = 'Valid stock quantity is required';
    }

    setErrors(newErrors);
    return !newErrors.name && !newErrors.price && !newErrors.stock;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      Alert.alert('Error', 'Please fix the errors before submitting');
      return;
    }

    setLoading(true);
    try {
      await productAPI.update(product.id, formData);
      Alert.alert('Success', 'Product updated successfully!', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (error) {
      Alert.alert('Error', 'Failed to update product');
      console.error('Error updating product:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCategorySelect = (category: string) => {
    setFormData(prev => ({ ...prev, category }));
    setShowCategoryModal(false);
  };

  const clearCategory = () => {
    setFormData(prev => ({ ...prev, category: '' }));
  };

  const handleInputChange = (field: keyof ProductFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
 
    if (errors[field as keyof typeof errors]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.form}>

          <View style={styles.header}>
            <Text style={styles.title}>Edit Product</Text>
            <Text style={styles.subtitle}>Update the product details</Text>
          </View>


          <View style={styles.inputGroup}>
            <Text style={styles.label}>
              Product Name <Text style={styles.required}>*</Text>
            </Text>
            <TextInput
              style={[
                styles.input,
                errors.name ? styles.inputError : null
              ]}
              placeholder="Enter product name"
              placeholderTextColor="#999"
              value={formData.name}
              onChangeText={(text) => handleInputChange('name', text)}
            />
            {errors.name ? <Text style={styles.errorText}>{errors.name}</Text> : null}
          </View>


          <View style={styles.inputGroup}>
            <Text style={styles.label}>Category</Text>
            <TouchableOpacity
              style={styles.categorySelector}
              onPress={() => setShowCategoryModal(true)}
            >
              <Text style={formData.category ? styles.categorySelected : styles.categoryPlaceholder}>
                {formData.category || 'Select a category (optional)'}
              </Text>
              <Text style={styles.dropdownIcon}>▼</Text>
            </TouchableOpacity>
            {formData.category ? (
              <TouchableOpacity style={styles.clearCategory} onPress={clearCategory}>
                <Text style={styles.clearCategoryText}>Clear</Text>
              </TouchableOpacity>
            ) : null}
          </View>


          <View style={styles.row}>
            <View style={[styles.inputGroup, styles.flex]}>
              <Text style={styles.label}>
                Price (₹) <Text style={styles.required}>*</Text>
              </Text>
              <TextInput
                style={[
                  styles.input,
                  errors.price ? styles.inputError : null
                ]}
                placeholder="0.00"
                placeholderTextColor="#999"
                keyboardType="decimal-pad"
                value={formData.price}
                onChangeText={(text) => handleInputChange('price', text)}
              />
              {errors.price ? <Text style={styles.errorText}>{errors.price}</Text> : null}
            </View>

            <View style={[styles.inputGroup, styles.flex, styles.stockInput]}>
              <Text style={styles.label}>
                Stock <Text style={styles.required}>*</Text>
              </Text>
              <TextInput
                style={[
                  styles.input,
                  errors.stock ? styles.inputError : null
                ]}
                placeholder="0"
                placeholderTextColor="#999"
                keyboardType="number-pad"
                value={formData.stock}
                onChangeText={(text) => handleInputChange('stock', text)}
              />
              {errors.stock ? <Text style={styles.errorText}>{errors.stock}</Text> : null}
            </View>
          </View>


          <TouchableOpacity
            style={[styles.submitButton, loading ? styles.submitButtonDisabled : null]}
            onPress={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text style={styles.submitButtonText}>Update Product</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>

      <Modal
        visible={showCategoryModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Select Category</Text>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setShowCategoryModal(false)}
            >
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
          </View>

          <FlatList
            data={PREDEFINED_CATEGORIES}
            keyExtractor={(item) => item}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[
                  styles.categoryItem,
                  formData.category === item ? styles.categoryItemSelected : null
                ]}
                onPress={() => handleCategorySelect(item)}
              >
                <Text style={[
                  styles.categoryItemText,
                  formData.category === item ? styles.categoryItemTextSelected : null
                ]}>
                  {item}
                </Text>
                {formData.category === item && (
                  <Text style={styles.checkmark}>✓</Text>
                )}
              </TouchableOpacity>
            )}
            ItemSeparatorComponent={() => <View style={styles.separator} />}
            style={styles.categoryList}
          />

          <TouchableOpacity
            style={styles.customCategoryButton}
            onPress={() => {
              setShowCategoryModal(false);
            }}
          >
            <Text style={styles.customCategoryText}>
              + Add Custom Category (type manually)
            </Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </View>
  );
};


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  scrollView: {
    flex: 1,
  },
  form: {
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
    marginTop: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#2c3e50',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#7f8c8d',
    textAlign: 'center',
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 8,
  },
  required: {
    color: '#e74c3c',
  },
  input: {
    backgroundColor: 'white',
    borderWidth: 2,
    borderColor: '#e9ecef',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#2c3e50',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  inputError: {
    borderColor: '#e74c3c',
  },
  errorText: {
    color: '#e74c3c',
    fontSize: 14,
    marginTop: 5,
  },
  categorySelector: {
    backgroundColor: 'white',
    borderWidth: 2,
    borderColor: '#e9ecef',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  categoryPlaceholder: {
    color: '#999',
    fontSize: 16,
  },
  categorySelected: {
    color: '#2c3e50',
    fontSize: 16,
    fontWeight: '500',
  },
  dropdownIcon: {
    color: '#7f8c8d',
    fontSize: 12,
  },
  clearCategory: {
    alignSelf: 'flex-end',
    marginTop: 8,
  },
  clearCategoryText: {
    color: '#667eea',
    fontSize: 14,
    fontWeight: '500',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  flex: {
    flex: 1,
  },
  stockInput: {
    marginLeft: 12,
  },
  submitButton: {
    backgroundColor: '#667eea',
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 10,
    elevation: 4,
    shadowColor: '#667eea',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  submitButtonDisabled: {
    opacity: 0.7,
  },
  submitButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  // Modal Styles
  modalContainer: {
    flex: 1,
    backgroundColor: 'white',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#2c3e50',
  },
  closeButton: {
    padding: 4,
  },
  closeButtonText: {
    fontSize: 20,
    color: '#7f8c8d',
    fontWeight: '300',
  },
  categoryList: {
    flex: 1,
  },
  categoryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: 'white',
  },
  categoryItemSelected: {
    backgroundColor: '#f8f9ff',
  },
  categoryItemText: {
    fontSize: 16,
    color: '#2c3e50',
  },
  categoryItemTextSelected: {
    color: '#667eea',
    fontWeight: '500',
  },
  checkmark: {
    color: '#667eea',
    fontSize: 16,
    fontWeight: 'bold',
  },
  separator: {
    height: 1,
    backgroundColor: '#f1f2f6',
    marginLeft: 16,
  },
  customCategoryButton: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#e9ecef',
    alignItems: 'center',
  },
  customCategoryText: {
    color: '#667eea',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default EditProductScreen;