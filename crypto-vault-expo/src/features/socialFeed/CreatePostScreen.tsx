import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  TextInput, 
  KeyboardAvoidingView, 
  Platform, 
  ScrollView, 
  Image,
  Alert,
  ActivityIndicator,
  Modal,
  FlatList,
  Dimensions
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { MaterialCommunityIcons, Ionicons, FontAwesome5 } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAppSelector } from 'src/core/redux/hooks';
import { launchImageLibrary } from 'react-native-image-picker';
import Toast from 'react-native-toast-message';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import * as Location from 'expo-location';
import { BASE_URL } from '../../../env.config';

const { width, height } = Dimensions.get('window');

const MOCK_LOCATIONS = [
  { id: '1', name: 'Hồ Hoàn Kiếm', address: 'Hoàn Kiếm, Hà Nội', latitude: 21.0285, longitude: 105.8542 },
  { id: '2', name: 'Landmark 81', address: 'Bình Thạnh, TP. Hồ Chí Minh', latitude: 10.7951, longitude: 106.7218 },
  { id: '3', name: 'Phố cổ Hội An', address: 'Hội An, Quảng Nam', latitude: 15.8801, longitude: 108.3273 },
  { id: '4', name: 'Cầu Rồng', address: 'Đà Nẵng', latitude: 16.0611, longitude: 108.2274 },
  { id: '5', name: 'Bãi biển Mỹ Khê', address: 'Đà Nẵng', latitude: 16.0734, longitude: 108.2497 },
  { id: '6', name: 'Chợ Bến Thành', address: 'Quận 1, TP. Hồ Chí Minh', latitude: 10.7719, longitude: 106.6983 },
  { id: '7', name: 'Vịnh Hạ Long', address: 'Quảng Ninh', latitude: 20.9101, longitude: 107.1839 },
  { id: '8', name: 'Sapa', address: 'Lào Cai', latitude: 22.3364, longitude: 103.8438 },
];

const CreatePostScreen = () => {
  const navigation = useNavigation<any>();
  const mapRef = useRef<MapView>(null);
  
  const [postText, setPostText] = useState('');
  const [selectedImages, setSelectedImages] = useState<any[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<any>(null);
  const [isPosting, setIsPosting] = useState(false);
  const [isCheckInVisible, setIsCheckInVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  const [userLocation, setUserLocation] = useState<any>(null);
  const [mapRegion, setMapRegion] = useState({
    latitude: 21.0285,
    longitude: 105.8542,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  });
  const [pickedLocation, setPickedLocation] = useState<any>(null);

  const { user } = useAppSelector(state => state.auth);

  useEffect(() => {
    if (isCheckInVisible) {
      (async () => {
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert('Permission denied', 'Allow location access to use Check-in');
          return;
        }

        let location = await Location.getCurrentPositionAsync({});
        const region = {
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        };
        setUserLocation(location.coords);
        setMapRegion(region);
        setPickedLocation({
          name: 'Vị trí hiện tại',
          latitude: location.coords.latitude,
          longitude: location.coords.longitude
        });
      })();
    }
  }, [isCheckInVisible]);

  const handlePost = async () => {
    if (isPostDisabled || isPosting) return;

    setIsPosting(true);
    
    try {
      const payload = {
        type: 'text',
        content: postText,
        images: selectedImages.map(img => img.uri),
        location: selectedLocation,
        user_id: user?.id || 'usr-master',
        user_name: user?.email?.split('@')[0] || 'User',
      };

      const response = await fetch(`${BASE_URL}feed/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`Server returned ${response.status}`);
      }

      const data = await response.json();

      if (data.success) {
        Toast.show({
          type: 'success',
          text1: 'Thành công',
          text2: 'Bài viết của bạn đã được đăng!',
        });
        navigation.goBack();
      } else {
        throw new Error(data.error || 'Failed to create post');
      }
    } catch (error: any) {
      console.error('Post creation error:', error);
      Toast.show({
        type: 'error',
        text1: 'Lỗi',
        text2: error.message || 'Không thể đăng bài viết. Vui lòng thử lại.',
      });
    } finally {
      setIsPosting(false);
    }
  };

  const handleSelectImage = async () => {
    const result = await launchImageLibrary({
      mediaType: 'photo',
      selectionLimit: 5,
      quality: 0.8,
    });

    if (result.assets) {
      setSelectedImages(prev => [...prev, ...result.assets!]);
    }
  };

  const removeImage = (index: number) => {
    setSelectedImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleMockAction = (title: string) => {
    Alert.alert(title, 'Tính năng này đang được phát triển. Vui lòng quay lại sau!');
  };

  const onRegionChangeComplete = async (region: any) => {
    setMapRegion(region);
    try {
      const address = await Location.reverseGeocodeAsync({
        latitude: region.latitude,
        longitude: region.longitude
      });
      
      if (address.length > 0) {
        const place = address[0];
        setPickedLocation({
          name: place.name || place.street || 'Vị trí đã chọn',
          address: `${place.subregion || ''}, ${place.region || ''}`,
          latitude: region.latitude,
          longitude: region.longitude
        });
      }
    } catch (e) {
      console.log('Reverse geocode error:', e);
    }
  };

  const selectLocation = (loc: any) => {
    setSelectedLocation(loc);
    setIsCheckInVisible(false);
    setSearchQuery('');
  };

  const filteredLocations = MOCK_LOCATIONS.filter(loc => 
    loc.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    loc.address.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const isPostDisabled = postText.trim().length === 0 && selectedImages.length === 0 && !selectedLocation;

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView 
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.header}>
          <TouchableOpacity 
            onPress={() => navigation.goBack()} 
            style={styles.headerLeft}
            disabled={isPosting}
          >
            <MaterialCommunityIcons name="close" size={28} color="#121212" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Tạo bài viết</Text>
          <TouchableOpacity 
            onPress={handlePost} 
            disabled={isPostDisabled || isPosting}
            style={[styles.postButton, (isPostDisabled || isPosting) && styles.postButtonDisabled]}
          >
            {isPosting ? (
              <ActivityIndicator size="small" color="#848E9C" />
            ) : (
              <Text style={[styles.postButtonText, isPostDisabled && styles.postButtonTextDisabled]}>Đăng</Text>
            )}
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} keyboardShouldPersistTaps="handled">
          <View style={styles.userInfo}>
            <View style={styles.avatarPlaceholder}>
               <MaterialCommunityIcons name="account" size={30} color="#848E9C" />
            </View>
            <View style={styles.userNameContainer}>
              <View style={styles.userLine}>
                <Text style={styles.userName}>{user?.email?.split('@')[0] || 'User'}</Text>
                {selectedLocation && (
                  <View style={styles.locationTag}>
                    <Text style={styles.locationSeparator}> đang ở </Text>
                    <Text style={styles.locationName}>{selectedLocation.name}</Text>
                    <TouchableOpacity onPress={() => setSelectedLocation(null)}>
                      <MaterialCommunityIcons name="close-circle" size={14} color="#65676B" style={{ marginLeft: 4 }} />
                    </TouchableOpacity>
                  </View>
                )}
              </View>
              <View style={styles.privacyBadge}>
                <FontAwesome5 name="globe-asia" size={10} color="#65676B" />
                <Text style={styles.privacyText}>Công khai</Text>
                <MaterialCommunityIcons name="menu-down" size={14} color="#65676B" />
              </View>
            </View>
          </View>

          <TextInput
            style={styles.textInput}
            placeholder="Bạn đang nghĩ gì?"
            placeholderTextColor="#848E9C"
            multiline
            autoFocus
            value={postText}
            onChangeText={setPostText}
            editable={!isPosting}
          />

          {selectedImages.length > 0 && (
            <View style={styles.imageGrid}>
              {selectedImages.map((img, index) => (
                <View key={index} style={styles.imageWrapper}>
                  <Image source={{ uri: img.uri }} style={styles.selectedImage} />
                  <TouchableOpacity 
                    style={styles.removeImageBtn}
                    onPress={() => removeImage(index)}
                  >
                    <MaterialCommunityIcons name="close-circle" size={24} color="rgba(0,0,0,0.6)" />
                  </TouchableOpacity>
                </View>
              ))}
              {selectedImages.length < 5 && (
                <TouchableOpacity style={styles.addImageBtn} onPress={handleSelectImage}>
                  <MaterialCommunityIcons name="plus" size={32} color="#848E9C" />
                </TouchableOpacity>
              )}
            </View>
          )}
        </ScrollView>

        <View style={styles.bottomActions}>
          <TouchableOpacity style={styles.actionItem} onPress={handleSelectImage}>
            <MaterialCommunityIcons name="image-multiple" size={24} color="#45BD62" />
            <Text style={styles.actionText}>Ảnh/video</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionItem} onPress={() => handleMockAction('Gắn thẻ người khác')}>
            <Ionicons name="person-add" size={24} color="#1877F2" />
            <Text style={styles.actionText}>Gắn thẻ người khác</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionItem} onPress={() => handleMockAction('Cảm xúc/hoạt động')}>
            <MaterialCommunityIcons name="emoticon-happy-outline" size={24} color="#F7B928" />
            <Text style={styles.actionText}>Cảm xúc/hoạt động</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionItem} onPress={() => setIsCheckInVisible(true)}>
            <MaterialCommunityIcons name="map-marker-radius" size={24} color="#F5533D" />
            <Text style={styles.actionText}>Check in</Text>
          </TouchableOpacity>
        </View>

        {/* Check-in Modal */}
        <Modal
          visible={isCheckInVisible}
          animationType="slide"
          onRequestClose={() => setIsCheckInVisible(false)}
        >
          <SafeAreaView style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <TouchableOpacity onPress={() => setIsCheckInVisible(false)}>
                <Ionicons name="chevron-back" size={28} color="#121212" />
              </TouchableOpacity>
              <Text style={styles.modalTitle}>Tìm kiếm địa điểm</Text>
              <View style={{ width: 28 }} />
            </View>
            
            <View style={styles.searchContainer}>
              <Ionicons name="search" size={20} color="#848E9C" />
              <TextInput
                style={styles.searchInput}
                placeholder="Bạn đang ở đâu?"
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity onPress={() => setSearchQuery('')}>
                  <MaterialCommunityIcons name="close-circle" size={18} color="#848E9C" />
                </TouchableOpacity>
              )}
            </View>

            <View style={styles.mapWrapper}>
              <MapView
                style={styles.map}
                provider={Platform.OS === 'android' ? PROVIDER_GOOGLE : undefined}
                initialRegion={mapRegion}
                onRegionChangeComplete={onRegionChangeComplete}
                showsUserLocation
                showsMyLocationButton
              >
                {/* Standard marker showing the picked point */}
                {pickedLocation && (
                  <Marker
                    coordinate={{
                      latitude: mapRegion.latitude,
                      longitude: mapRegion.longitude,
                    }}
                  />
                )}
              </MapView>
              
              <View style={styles.pickedLocationInfo}>
                <Text style={styles.pickedLocationName} numberOfLines={1}>
                  {pickedLocation?.name || 'Đang chọn vị trí...'}
                </Text>
                <Text style={styles.pickedLocationAddress} numberOfLines={1}>
                  {pickedLocation?.address || ''}
                </Text>
                <TouchableOpacity 
                  style={styles.confirmLocationBtn}
                  onPress={() => selectLocation(pickedLocation)}
                >
                  <Text style={styles.confirmLocationText}>Xác nhận vị trí này</Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.suggestionsList}>
              <Text style={styles.suggestionsTitle}>Gợi ý địa điểm</Text>
              <FlatList
                data={filteredLocations}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                  <TouchableOpacity 
                    style={styles.locationItem}
                    onPress={() => selectLocation(item)}
                  >
                    <View style={styles.locationIcon}>
                      <MaterialCommunityIcons name="map-marker" size={24} color="#F5533D" />
                    </View>
                    <View>
                      <Text style={styles.locationItemName}>{item.name}</Text>
                      <Text style={styles.locationItemAddress}>{item.address}</Text>
                    </View>
                  </TouchableOpacity>
                )}
                ListEmptyComponent={
                  <View style={styles.emptyContainer}>
                    <Text style={styles.emptyText}>Không tìm thấy địa điểm nào</Text>
                  </View>
                }
              />
            </View>
          </SafeAreaView>
        </Modal>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default CreatePostScreen;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F2F2F7',
  },
  headerLeft: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#121212',
  },
  postButton: {
    backgroundColor: '#FCD535',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  postButtonDisabled: {
    backgroundColor: '#F2F2F7',
  },
  postButtonText: {
    color: '#121212',
    fontWeight: 'bold',
    fontSize: 14,
  },
  postButtonTextDisabled: {
    color: '#B0B8C1',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatarPlaceholder: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F2F2F7',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  userNameContainer: {
    justifyContent: 'center',
  },
  userName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#121212',
    marginBottom: 4,
  },
  privacyBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F2F2F7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    alignSelf: 'flex-start',
    marginTop: 2,
  },
  privacyText: {
    fontSize: 12,
    color: '#65676B',
    fontWeight: '600',
    marginLeft: 4,
    marginRight: 2,
  },
  textInput: {
    fontSize: 18,
    color: '#121212',
    minHeight: 150,
    textAlignVertical: 'top',
  },
  bottomActions: {
    borderTopWidth: 1,
    borderTopColor: '#F2F2F7',
    paddingVertical: 8,
  },
  actionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  actionText: {
    fontSize: 16,
    color: '#121212',
    marginLeft: 12,
  },
  imageGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 16,
    gap: 8,
  },
  imageWrapper: {
    width: '31%',
    aspectRatio: 1,
    position: 'relative',
  },
  selectedImage: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
  },
  removeImageBtn: {
    position: 'absolute',
    top: -8,
    right: -8,
    zIndex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
  },
  addImageBtn: {
    width: '31%',
    aspectRatio: 1,
    borderRadius: 8,
    backgroundColor: '#F2F2F7',
    alignItems: 'center',
    justifyContent: 'center',
    borderStyle: 'dashed',
    borderWidth: 1,
    borderColor: '#848E9C',
  },
  userLine: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  locationTag: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationSeparator: {
    fontSize: 14,
    color: '#65676B',
  },
  locationName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#121212',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F2F2F7',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#121212',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F2F2F7',
    margin: 16,
    paddingHorizontal: 12,
    borderRadius: 20,
    height: 40,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#121212',
    marginLeft: 8,
  },
  locationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F2F2F7',
  },
  locationIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F2F2F7',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  locationItemName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#121212',
  },
  locationItemAddress: {
    fontSize: 12,
    color: '#65676B',
    marginTop: 2,
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#848E9C',
  },
  mapWrapper: {
    height: 300,
    width: '100%',
    position: 'relative',
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  pickedLocationInfo: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(255,255,255,0.95)',
    padding: 16,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  pickedLocationName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#121212',
  },
  pickedLocationAddress: {
    fontSize: 14,
    color: '#65676B',
    marginVertical: 4,
  },
  confirmLocationBtn: {
    backgroundColor: '#FCD535',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  confirmLocationText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#121212',
  },
  suggestionsList: {
    flex: 1,
    paddingTop: 16,
  },
  suggestionsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#121212',
    paddingHorizontal: 16,
    marginBottom: 8,
  },
});
