import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { StatusBar } from 'expo-status-bar';
import ProductListScreen from './src/screens/ProductListScreen';
import AddProductScreen from './src/screens/AddProductScreen';
import EditProductScreen from './src/screens/EditProductScreen';
import { Product } from './src/types';

export type RootStackParamList = {
  ProductList: undefined;
  AddProduct: undefined;
  EditProduct: { product: Product };
};

const Stack = createStackNavigator<RootStackParamList>();

export default function App() {
  return (
    <NavigationContainer>
      <StatusBar style="auto" />
      <Stack.Navigator
        initialRouteName="ProductList"
        screenOptions={{
          headerStyle: {
            backgroundColor: '#667eea',
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}
      >
        <Stack.Screen 
          name="ProductList" 
          component={ProductListScreen}
          options={{ title: '📦 Inventory Dashboard' }}
        />
        <Stack.Screen 
          name="AddProduct" 
          component={AddProductScreen}
          options={{ title: '➕ Add Product' }}
        />
        <Stack.Screen 
          name="EditProduct" 
          component={EditProductScreen}
          options={{ title: '✏️ Edit Product' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}