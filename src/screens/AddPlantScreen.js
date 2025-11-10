import React, {useState, useEffect, useRef} from 'react';
import {
	View,
	Text,
	StyleSheet,
	TextInput,
	TouchableOpacity,
	Alert,
	ScrollView,
	Image,
	KeyboardAvoidingView,
	Platform,
	ActivityIndicator,
} from 'react-native';
import {CameraView, useCameraPermissions} from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import {Ionicons} from '@expo/vector-icons';
import {usePlants} from '../context/PlantContext';

export default function AddPlantScreen({navigation}) {
	const [plantName, setPlantName] = useState('');
	const [description, setDescription] = useState('');
	const [imageUri, setImageUri] = useState(null);
	const [showCamera, setShowCamera] = useState(false);
	const [cameraPermission, requestCameraPermission] = useCameraPermissions();
	const [searchResults, setSearchResults] = useState([]);
	const [showSearchResults, setShowSearchResults] = useState(false);
	const [selectedPlant, setSelectedPlant] = useState(null);
	const [searchLoading, setSearchLoading] = useState(false);
	const cameraRef = useRef(null);
	const searchTimeout = useRef(null);
	const {addPlant, searchPlantCatalog, getPlantDetails} = usePlants();

	useEffect(() => {
		// Don't search if a plant is already selected
		if (selectedPlant) {
			setShowSearchResults(false);
			return;
		}

		// Debounce search to avoid too many API calls
		if (searchTimeout.current) {
			clearTimeout(searchTimeout.current);
		}
		if (plantName && plantName.length >= 3) {
			setSearchLoading(true);
			searchTimeout.current = setTimeout(async () => {
				try {
					const results = await searchPlantCatalog(plantName);
					setSearchResults(results);
					setShowSearchResults(true);
				} catch (error) {
					console.error('Search error:', error);
					setSearchResults([]);
				} finally {
					setSearchLoading(false);
				}
			}, 500);
		} else {
			setSearchResults([]);
			setShowSearchResults(false);
			setSearchLoading(false);
		}
		return () => {
			if (searchTimeout.current) {
				clearTimeout(searchTimeout.current);
			}
		};
	}, [plantName, selectedPlant]); // Add selectedPlant to dependencies

	const handleTakePicture = async () => {
		if (!cameraPermission?.granted) {
			const {granted} = await requestCameraPermission();
			if (!granted) {
				Alert.alert(
					'Permission Required',
					'Camera permission is required to take photos',
				);
				return;
			}
		}
		setShowCamera(true);
	};

	const handleCapture = async () => {
		if (cameraRef.current) {
			try {
				const photo = await cameraRef.current.takePictureAsync({
					quality: 0.7,
				});
				setImageUri(photo.uri);
				setShowCamera(false);
			} catch (error) {
				console.error('Error taking picture:', error);
				Alert.alert('Error', 'Failed to take picture');
			}
		}
	};

	const handlePickImage = async () => {
		const {status} =
			await ImagePicker.requestMediaLibraryPermissionsAsync();
		if (status !== 'granted') {
			Alert.alert(
				'Permission Required',
				'Media library permission is required',
			);
			return;
		}

		const result = await ImagePicker.launchImageLibraryAsync({
			mediaTypes: ImagePicker.MediaTypeOptions.Images,
			allowsEditing: true,
			aspect: [4, 3],
			quality: 0.7,
		});

		if (!result.canceled) {
			setImageUri(result.assets[0].uri);
		}
	};

	const handleSelectPlant = async (plant) => {
		// Set a placeholder immediately to prevent useEffect from searching
		setSelectedPlant({
			name: plant.name,
			scientificName: plant.scientificName,
		});

		// Clear search state immediately
		setShowSearchResults(false);
		setSearchLoading(false);
		if (searchTimeout.current) {
			clearTimeout(searchTimeout.current);
		}

		// Update plant name
		setPlantName(plant.name);

		try {
			// Fetch detailed plant information
			const details = await getPlantDetails(plant.id);
			setSelectedPlant(details);
		} catch (error) {
			console.error('Error fetching plant details:', error);
			// selectedPlant already has basic info from above
		}
	};

	const handleAddPlant = async () => {
		if (!plantName) {
			Alert.alert('Missing Information', 'Please enter a plant name.', [
				{text: 'OK'},
			]);
			return;
		}

		try {
			const plantData = selectedPlant
				? {
						name: plantName,
						scientificName: selectedPlant.scientificName || [],
						watering: selectedPlant.watering,
						wateringGeneralBenchmark:
							selectedPlant.wateringGeneralBenchmark,
						sunlight: selectedPlant.sunlight || [],
						description:
							description || selectedPlant.description || '',
						imageUri: imageUri,
				  }
				: {
						name: plantName,
						description: description,
						imageUri: imageUri,
						wateringGeneralBenchmark: {value: '7', unit: 'days'},
						scientificName: [],
						sunlight: [],
				  };

			await addPlant(plantData);

			Alert.alert(
				'Success',
				`${plantName} has been added successfully!`,
				[
					{
						text: 'OK',
						onPress: () => {
							setPlantName('');
							setDescription('');
							setImageUri(null);
							setSelectedPlant(null);
							navigation.goBack();
						},
					},
				],
			);
		} catch (error) {
			console.error('Error adding plant:', error);
			Alert.alert('Error', 'Failed to add plant');
		}
	};

	if (showCamera) {
		return (
			<View style={styles.cameraContainer}>
				<CameraView style={styles.camera} ref={cameraRef} facing="back">
					<View style={styles.cameraControls}>
						<TouchableOpacity
							style={styles.cameraButton}
							onPress={() => setShowCamera(false)}
						>
							<Text style={styles.cameraButtonText}>Close</Text>
						</TouchableOpacity>
						<TouchableOpacity
							style={styles.captureButton}
							onPress={handleCapture}
						>
							<View style={styles.captureButtonInner} />
						</TouchableOpacity>
						<View style={styles.cameraButton} />
					</View>
				</CameraView>
			</View>
		);
	}

	return (
		<KeyboardAvoidingView
			style={styles.container}
			behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
			keyboardVerticalOffset={0}
		>
			{/* Modal Header */}
			<View style={styles.modalHeader}>
				<TouchableOpacity
					style={styles.closeButton}
					onPress={() => navigation.goBack()}
				>
					<Ionicons name="close" size={28} color="#333" />
				</TouchableOpacity>
				<Text style={styles.modalTitle}>Add Plant</Text>
				<TouchableOpacity
					style={styles.saveButton}
					onPress={handleAddPlant}
				>
					<Text style={styles.saveButtonText}>Save</Text>
				</TouchableOpacity>
			</View>

			<ScrollView
				style={styles.scrollContent}
				contentContainerStyle={styles.scrollContentContainer}
				showsVerticalScrollIndicator={false}
				keyboardShouldPersistTaps="handled"
			>
				{/* Image Card */}
				<TouchableOpacity
					style={styles.imageCard}
					onPress={handleTakePicture}
				>
					{imageUri ? (
						<Image
							source={{uri: imageUri}}
							style={styles.imageCardImage}
						/>
					) : (
						<View style={styles.imageCardPlaceholder}>
							<Ionicons
								name="camera-outline"
								size={40}
								color="#4CAF50"
							/>
							<Text style={styles.imageCardText}>Add Photo</Text>
						</View>
					)}
				</TouchableOpacity>

				{/* Form Section */}
				<View style={styles.form}>
					<View style={styles.inputGroup}>
						<Text style={styles.label}>Plant Name *</Text>
						<View style={styles.searchContainer}>
							<TextInput
								style={styles.input}
								value={plantName}
								onChangeText={(text) => {
									setPlantName(text);
									// Clear selected plant when user types
									if (
										selectedPlant &&
										text !== selectedPlant.name
									) {
										setSelectedPlant(null);
									}
								}}
								placeholder="e.g., Rose, Monstera"
								placeholderTextColor="#999"
							/>
							<View style={styles.searchIcon}>
								{searchLoading ? (
									<ActivityIndicator
										size="small"
										color="#4CAF50"
									/>
								) : (
									<Ionicons
										name="search"
										size={20}
										color="#999"
									/>
								)}
							</View>
						</View>

						{/* Search Results Dropdown */}
						{showSearchResults && searchResults.length > 0 && (
							<View style={styles.searchResults}>
								{searchResults.slice(0, 5).map((plant) => (
									<TouchableOpacity
										key={plant.id}
										style={styles.searchResultItem}
										onPress={() => handleSelectPlant(plant)}
									>
										<Text style={styles.searchResultText}>
											{plant.name}
										</Text>
										{plant.scientificName &&
											plant.scientificName.length > 0 && (
												<Text
													style={
														styles.searchResultScientific
													}
												>
													{plant.scientificName[0]}
												</Text>
											)}
									</TouchableOpacity>
								))}
							</View>
						)}

						{showSearchResults &&
							searchResults.length === 0 &&
							!searchLoading &&
							plantName.length >= 2 && (
								<View style={styles.noResults}>
									<Text style={styles.noResultsText}>
										No plants found. You can still add "
										{plantName}" manually.
									</Text>
								</View>
							)}
					</View>

					<View style={styles.inputGroup}>
						<Text style={styles.label}>Notes</Text>
						<TextInput
							style={[styles.input, styles.textArea]}
							value={description}
							onChangeText={setDescription}
							placeholder="Add care notes, location, etc."
							placeholderTextColor="#999"
							multiline
							numberOfLines={4}
						/>
					</View>

					{selectedPlant && (
						<View style={styles.plantInfo}>
							<View style={styles.plantInfoHeader}>
								<Ionicons
									name="information-circle"
									size={20}
									color="#4CAF50"
								/>
								<Text style={styles.plantInfoTitle}>
									Plant Care Info
								</Text>
							</View>

							{selectedPlant.scientificName &&
								selectedPlant.scientificName.length > 0 && (
									<View style={styles.plantInfoRow}>
										<Ionicons
											name="flask-outline"
											size={16}
											color="#666"
										/>
										<Text style={styles.plantInfoText}>
											{selectedPlant.scientificName.join(
												', ',
											)}
										</Text>
									</View>
								)}

							{selectedPlant.watering && (
								<View style={styles.plantInfoRow}>
									<Ionicons
										name="water-outline"
										size={16}
										color="#666"
									/>
									<Text style={styles.plantInfoText}>
										{selectedPlant.watering}
									</Text>
								</View>
							)}

							{selectedPlant.wateringGeneralBenchmark && (
								<View style={styles.plantInfoRow}>
									<Ionicons
										name="calendar-outline"
										size={16}
										color="#666"
									/>
									<Text style={styles.plantInfoText}>
										Water every{' '}
										{
											selectedPlant
												.wateringGeneralBenchmark.value
										}{' '}
										{
											selectedPlant
												.wateringGeneralBenchmark.unit
										}
									</Text>
								</View>
							)}

							{selectedPlant.sunlight &&
								selectedPlant.sunlight.length > 0 && (
									<View style={styles.plantInfoRow}>
										<Ionicons
											name="sunny-outline"
											size={16}
											color="#666"
										/>
										<Text style={styles.plantInfoText}>
											{selectedPlant.sunlight.join(', ')}
										</Text>
									</View>
								)}
						</View>
					)}
				</View>
			</ScrollView>
		</KeyboardAvoidingView>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: '#FFFFFF',
	},
	modalHeader: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		paddingHorizontal: 20,
		paddingTop: 60,
		paddingBottom: 20,
		backgroundColor: '#FFFFFF',
		borderBottomWidth: 1,
		borderBottomColor: '#F0F0F0',
	},
	closeButton: {
		width: 40,
		height: 40,
		justifyContent: 'center',
		alignItems: 'center',
	},
	modalTitle: {
		fontSize: 20,
		fontWeight: '700',
		color: '#333',
	},
	saveButton: {
		paddingHorizontal: 20,
		paddingVertical: 10,
		borderRadius: 20,
		backgroundColor: '#4CAF50',
	},
	saveButtonText: {
		fontSize: 16,
		fontWeight: '600',
		color: '#FFFFFF',
	},
	scrollContent: {
		flex: 1,
	},
	scrollContentContainer: {
		paddingHorizontal: 20,
		paddingTop: 20,
		paddingBottom: 40,
	},
	imageCard: {
		width: '100%',
		height: 200,
		borderRadius: 16,
		overflow: 'hidden',
		marginBottom: 24,
		backgroundColor: '#F5F5F5',
		borderWidth: 2,
		borderColor: '#E0E0E0',
		borderStyle: 'dashed',
	},
	imageCardImage: {
		width: '100%',
		height: '100%',
		resizeMode: 'cover',
	},
	imageCardPlaceholder: {
		width: '100%',
		height: '100%',
		justifyContent: 'center',
		alignItems: 'center',
		backgroundColor: '#F9F9F9',
	},
	imageCardText: {
		fontSize: 16,
		color: '#4CAF50',
		marginTop: 8,
		fontWeight: '500',
	},
	form: {
		gap: 20,
	},
	inputGroup: {
		gap: 8,
	},
	label: {
		fontSize: 15,
		fontWeight: '600',
		color: '#333',
	},
	searchContainer: {
		flexDirection: 'row',
		alignItems: 'center',
		position: 'relative',
	},
	input: {
		flex: 1,
		backgroundColor: '#F9F9F9',
		borderWidth: 1,
		borderColor: '#E0E0E0',
		borderRadius: 12,
		padding: 15,
		fontSize: 16,
		color: '#333',
	},
	searchIcon: {
		position: 'absolute',
		right: 15,
	},
	textArea: {
		minHeight: 100,
		textAlignVertical: 'top',
	},
	searchResults: {
		backgroundColor: '#FFFFFF',
		borderWidth: 1,
		borderColor: '#E0E0E0',
		borderRadius: 12,
		marginTop: 8,
		maxHeight: 200,
		shadowColor: '#000',
		shadowOffset: {width: 0, height: 2},
		shadowOpacity: 0.1,
		shadowRadius: 4,
		elevation: 3,
		overflow: 'hidden',
	},
	searchResultItem: {
		padding: 15,
		borderBottomWidth: 1,
		borderBottomColor: '#F5F5F5',
	},
	searchResultText: {
		fontSize: 16,
		color: '#333',
		fontWeight: '500',
	},
	searchResultScientific: {
		fontSize: 13,
		color: '#999',
		marginTop: 2,
		fontStyle: 'italic',
	},
	noResults: {
		backgroundColor: '#FFF9E6',
		padding: 12,
		borderRadius: 8,
		marginTop: 8,
	},
	noResultsText: {
		fontSize: 14,
		color: '#666',
		textAlign: 'center',
	},
	plantInfo: {
		backgroundColor: '#F0F7F0',
		padding: 16,
		borderRadius: 12,
		gap: 12,
	},
	plantInfoHeader: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 8,
		marginBottom: 4,
	},
	plantInfoTitle: {
		fontSize: 15,
		fontWeight: '600',
		color: '#4CAF50',
	},
	plantInfoRow: {
		flexDirection: 'row',
		alignItems: 'flex-start',
		gap: 10,
	},
	plantInfoText: {
		fontSize: 14,
		color: '#666',
		flex: 1,
		lineHeight: 20,
	},
	cameraContainer: {
		flex: 1,
	},
	camera: {
		flex: 1,
	},
	cameraControls: {
		flex: 1,
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'flex-end',
		paddingBottom: 40,
		paddingHorizontal: 30,
	},
	cameraButton: {
		width: 80,
		padding: 15,
	},
	cameraButtonText: {
		fontSize: 18,
		color: '#FFFFFF',
		fontWeight: 'bold',
	},
	captureButton: {
		width: 80,
		height: 80,
		borderRadius: 40,
		backgroundColor: '#FFFFFF',
		justifyContent: 'center',
		alignItems: 'center',
	},
	captureButtonInner: {
		width: 65,
		height: 65,
		borderRadius: 32.5,
		backgroundColor: '#4CAF50',
	},
});
