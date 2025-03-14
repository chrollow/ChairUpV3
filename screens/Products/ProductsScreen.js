import React, { useContext, useState, useEffect } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  FlatList, 
  Image, 
  TouchableOpacity,
  SafeAreaView,
  TextInput,
  Modal,
  TouchableWithoutFeedback
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ProductContext } from '../../Context/Store/ProductGlobal';
import Slider from '@react-native-community/slider';
import SimpleDrawer from '../../components/SimpleDrawer';

const ProductsScreen = ({ navigation }) => {
  const { stateProducts } = useContext(ProductContext);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredProducts, setFilteredProducts] = useState(stateProducts.products || []);
  const [showFilters, setShowFilters] = useState(false);
  const [showDrawer, setShowDrawer] = useState(false);
  const [minPrice, setMinPrice] = useState(0);
  const [maxPrice, setMaxPrice] = useState(500);
  
  // Find product price range
  const productMaxPrice = stateProducts.products && stateProducts.products.length > 0 ? 
    Math.max(...stateProducts.products.map(p => p.price || 0), 0) + 50 : 500;
  const productMinPrice = stateProducts.products && stateProducts.products.length > 0 ?
    Math.min(...stateProducts.products.map(p => p.price || 0), 0) : 0;
  
  useEffect(() => {
    // Initialize price range
    setMinPrice(productMinPrice);
    setMaxPrice(productMaxPrice);
  }, [productMinPrice, productMaxPrice]);
  
  // Filter products based on search query and price range
  useEffect(() => {
    if (!stateProducts.products) return;
    
    const filtered = stateProducts.products.filter(item => {
      // Check if name includes search query (case insensitive)
      const matchesSearch = !searchQuery || 
        (item.name && item.name.toLowerCase().includes(searchQuery.toLowerCase()));
      
      // Check if price is within range
      const itemPrice = item.price || 0;
      const matchesPrice = itemPrice >= minPrice && itemPrice <= maxPrice;
      
      return matchesSearch && matchesPrice;
    });
    
    setFilteredProducts(filtered);
  }, [searchQuery, minPrice, maxPrice, stateProducts.products]);
  
  const toggleFilters = () => {
    setShowFilters(!showFilters);
  };
  
  const toggleDrawer = () => {
    setShowDrawer(!showDrawer);
  };
  
  const handleResetFilters = () => {
    setSearchQuery('');
    setMinPrice(productMinPrice);
    setMaxPrice(productMaxPrice);
  };

  const renderProductItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.productItem}
      onPress={() => navigation.navigate('ProductDetail', { productId: item.id, name: item.name })}
    >
      <Image 
        source={{ uri: item.image }} 
        style={styles.productImage}
      />
      <View style={styles.productInfo}>
        <Text style={styles.productName}>{item.name}</Text>
        <Text style={styles.productPrice}>${item.price}</Text>
        <View style={styles.ratingContainer}>
          {[1, 2, 3, 4, 5].map(star => (
            <Ionicons 
              key={star}
              name={star <= (item.rating || 0) ? "star" : "star-outline"} 
              size={16} 
              color="#FFD700" 
            />
          ))}
          <Text style={styles.ratingText}>({item.numReviews || 0})</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={toggleDrawer}>
          <Ionicons name="menu-outline" size={24} color="#4a6da7" />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate('Cart')}>
          <Ionicons name="cart-outline" size={24} color="#4a6da7" />
        </TouchableOpacity>
      </View>
      
      <View style={styles.searchFilterContainer}>
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color="#888" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search chairs..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery ? (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={20} color="#888" />
            </TouchableOpacity>
          ) : null}
        </View>
        
        <TouchableOpacity style={styles.filterButton} onPress={toggleFilters}>
          <Ionicons name="filter" size={20} color="#fff" />
        </TouchableOpacity>
      </View>
      
      {filteredProducts.length > 0 ? (
        <FlatList
          data={filteredProducts}
          renderItem={renderProductItem}
          keyExtractor={item => item.id?.toString() || Math.random().toString()}
          numColumns={2}
          contentContainerStyle={styles.productList}
        />
      ) : (
        <View style={styles.noResultsContainer}>
          <Ionicons name="sad-outline" size={50} color="#ccc" />
          <Text style={styles.noResultsText}>No products found</Text>
          <TouchableOpacity style={styles.resetButton} onPress={handleResetFilters}>
            <Text style={styles.resetButtonText}>Reset Filters</Text>
          </TouchableOpacity>
        </View>
      )}
      
      {/* Filter Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={showFilters}
        onRequestClose={() => setShowFilters(false)}
      >
        <TouchableWithoutFeedback onPress={() => setShowFilters(false)}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback>
              <View style={styles.modalContent}>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>Filter</Text>
                  <TouchableOpacity onPress={() => setShowFilters(false)}>
                    <Ionicons name="close" size={24} color="#333" />
                  </TouchableOpacity>
                </View>
                
                <View style={styles.filterSection}>
                  <Text style={styles.filterLabel}>Price Range</Text>
                  <View style={styles.priceLabels}>
                    <Text>${Math.round(minPrice)}</Text>
                    <Text>${Math.round(maxPrice)}</Text>
                  </View>
                  
                  {/* Min price slider */}
                  <Text>Minimum Price</Text>
                  <Slider
                    style={styles.slider}
                    minimumValue={productMinPrice}
                    maximumValue={productMaxPrice}
                    value={minPrice}
                    onValueChange={setMinPrice}
                    step={10}
                    minimumTrackTintColor="#4a6da7"
                    maximumTrackTintColor="#d3d3d3"
                  />
                  
                  {/* Max price slider */}
                  <Text>Maximum Price</Text>
                  <Slider
                    style={styles.slider}
                    minimumValue={productMinPrice}
                    maximumValue={productMaxPrice}
                    value={maxPrice}
                    onValueChange={setMaxPrice}
                    step={10}
                    minimumTrackTintColor="#4a6da7"
                    maximumTrackTintColor="#d3d3d3"
                  />
                </View>
                
                <View style={styles.filterActions}>
                  <TouchableOpacity 
                    style={[styles.actionButton, styles.resetFilterButton]}
                    onPress={handleResetFilters}
                  >
                    <Text style={styles.resetFilterText}>Reset</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={[styles.actionButton, styles.applyButton]}
                    onPress={() => setShowFilters(false)}
                  >
                    <Text style={styles.applyText}>Apply</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
      
      {/* Simple Drawer */}
      <SimpleDrawer
        isVisible={showDrawer}
        onClose={toggleDrawer}
        navigation={navigation}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  searchFilterContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 15,
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingHorizontal: 10,
    marginRight: 10,
    height: 40,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: '100%',
    fontSize: 16,
  },
  filterButton: {
    backgroundColor: '#4a6da7',
    borderRadius: 8,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  productList: {
    paddingHorizontal: 10,
    paddingBottom: 20,
  },
  productItem: {
    flex: 1,
    margin: 8,
    borderRadius: 10,
    backgroundColor: '#fff',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    overflow: 'hidden',
  },
  productImage: {
    height: 150,
    width: '100%',
  },
  productInfo: {
    padding: 10,
  },
  productName: {
    fontWeight: 'bold',
    fontSize: 14,
    marginBottom: 5,
  },
  productPrice: {
    color: '#4a6da7',
    fontWeight: 'bold',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 5,
  },
  ratingText: {
    fontSize: 12,
    color: '#888',
    marginLeft: 5,
  },
  noResultsContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  noResultsText: {
    fontSize: 16,
    color: '#888',
    marginTop: 10,
    marginBottom: 20,
  },
  resetButton: {
    backgroundColor: '#4a6da7',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  resetButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  filterSection: {
    marginBottom: 20,
  },
  filterLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  slider: {
    height: 40,
    marginBottom: 20,
  },
  priceLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  filterActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    flex: 1,
    height: 45,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  resetFilterButton: {
    backgroundColor: '#f5f5f5',
    marginRight: 10,
  },
  resetFilterText: {
    color: '#666',
    fontWeight: 'bold',
  },
  applyButton: {
    backgroundColor: '#4a6da7',
    marginLeft: 10,
  },
  applyText: {
    color: '#fff',
    fontWeight: 'bold',
  }
});

export default ProductsScreen;