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
	Platform,
} from 'react-native';
import {CameraView, useCameraPermissions} from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import {Ionicons} from '@expo/vector-icons';
import {usePlants} from '../context/PlantContext';
import {searchPlants, getPlantByName} from '../data/plantData';

export default function AddPlantScreen({navigation}) {
	const [plantName, setPlantName] = useState('');
	const [description, setDescription] = useState('');
	const [imageUri, setImageUri] = useState(null);
	const [showCamera, setShowCamera] = useState(false);
	const [cameraPermission, requestCameraPermission] = useCameraPermissions();
	const [searchResults, setSearchResults] = useState([]);
	const [showSearchResults, setShowSearchResults] = useState(false);
	const [selectedPlant, setSelectedPlant] = useState(null);
	const cameraRef = useRef(null);
	const {addPlant} = usePlants();

	useEffect(() => {
		if (plantName) {
			const results = searchPlants(plantName);
			setSearchResults(results);
			setShowSearchResults(true);
		} else {
			setSearchResults([]);
			setShowSearchResults(false);
		}
	}, [plantName]);

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

	const handleSelectPlant = (plant) => {
		setPlantName(plant.name);
		setSelectedPlant(plant);
		setDescription(plant.description || '');
		setShowSearchResults(false);
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
						scientificName: selectedPlant.scientificName,
						watering: selectedPlant.watering,
						wateringGeneralBenchmark:
							selectedPlant.wateringGeneralBenchmark,
						sunlight: selectedPlant.sunlight,
						description: description || selectedPlant.description,
						imageUri: imageUri,
				  }
				: {
						name: plantName,
						description: description,
						imageUri: imageUri,
						wateringGeneralBenchmark: {value: '7', unit: 'days'},
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
							navigation.navigate('HomeTab');
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
							<Text style={styles.cameraButtonText}>Cancel</Text>
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
		<View style={styles.container}>
			<View style={styles.header}>
				<TouchableOpacity
					style={styles.backButton}
					onPress={() => navigation.navigate('HomeTab')}
				>
					<Ionicons name="arrow-back" size={24} color="#333" />
				</TouchableOpacity>
				<Text style={styles.headerTitle}>Add Plant</Text>
				<TouchableOpacity
					style={styles.saveButton}
					onPress={handleAddPlant}
				>
					<Text style={styles.saveButtonText}>Save</Text>
				</TouchableOpacity>
			</View>

			<ScrollView style={styles.content}>
				{/* Image Section */}
				<View style={styles.imageSection}>
					{imageUri ? (
						<Image
							source={{uri: imageUri}}
							style={styles.previewImage}
						/>
					) : (
						<View style={styles.imagePlaceholder}>
							<Ionicons
								name="leaf-outline"
								size={100}
								color="#4CAF50"
							/>
						</View>
					)}
					<TouchableOpacity
						style={styles.cameraIconButton}
						onPress={handleTakePicture}
					>
						<View style={styles.cameraIcon}>
							<Ionicons name="camera" size={32} color="#FFFFFF" />
						</View>
					</TouchableOpacity>
				</View>

				{/* Form Section */}
				<View style={styles.form}>
					<Text style={styles.label}>Name</Text>
					<View style={styles.searchContainer}>
						<TextInput
							style={styles.input}
							value={plantName}
							onChangeText={setPlantName}
							placeholder="Rose"
							placeholderTextColor="#999"
						/>
						<View style={styles.searchIcon}>
							<Ionicons name="search" size={20} color="#999" />
						</View>
					</View>

					{/* Search Results Dropdown */}
					{showSearchResults && searchResults.length > 0 && (
						<View style={styles.searchResults}>
							{searchResults.slice(0, 5).map((plant) => (
								<TouchableOpacity
									key={plant.name}
									style={styles.searchResultItem}
									onPress={() => handleSelectPlant(plant)}
								>
									<Text style={styles.searchResultText}>
										{plant.name}
									</Text>
								</TouchableOpacity>
							))}
						</View>
					)}

					<Text style={styles.label}>Description</Text>
					<TextInput
						style={[styles.input, styles.textArea]}
						value={description}
						onChangeText={setDescription}
						placeholder="Add notes about your plant..."
						placeholderTextColor="#999"
						multiline
						numberOfLines={4}
					/>

					{selectedPlant && (
						<View style={styles.plantInfo}>
							<Text style={styles.plantInfoTitle}>
								Plant Information:
							</Text>
							{selectedPlant.scientificName && (
								<View style={styles.plantInfoRow}>
									<Ionicons
										name="flask-outline"
										size={16}
										color="#4CAF50"
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
										color="#4CAF50"
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
										color="#4CAF50"
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
							{selectedPlant.sunlight && (
								<View style={styles.plantInfoRow}>
									<Ionicons
										name="sunny-outline"
										size={16}
										color="#4CAF50"
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
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: '#FFFFFF',
	},
	header: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		paddingHorizontal: 20,
		paddingTop: 50,
		paddingBottom: 10,
	},
	backButton: {
		width: 40,
		height: 40,
		borderRadius: 20,
		backgroundColor: '#F5F5F5',
		justifyContent: 'center',
		alignItems: 'center',
	},
	headerTitle: {
		fontSize: 18,
		fontWeight: '600',
		color: '#333',
	},
	saveButton: {
		paddingHorizontal: 16,
		paddingVertical: 8,
		borderRadius: 20,
		backgroundColor: '#4CAF50',
	},
	saveButtonText: {
		fontSize: 16,
		fontWeight: '600',
		color: '#FFFFFF',
	},
	content: {
		flex: 1,
	},
	imageSection: {
		width: '100%',
		height: 400,
		position: 'relative',
	},
	previewImage: {
		width: '100%',
		height: '100%',
		resizeMode: 'cover',
	},
	imagePlaceholder: {
		width: '100%',
		height: '100%',
		backgroundColor: '#E8F5E9',
		justifyContent: 'center',
		alignItems: 'center',
	},
	cameraIconButton: {
		position: 'absolute',
		bottom: 30,
		alignSelf: 'center',
	},
	cameraIcon: {
		width: 70,
		height: 70,
		borderRadius: 35,
		backgroundColor: '#4CAF50',
		justifyContent: 'center',
		alignItems: 'center',
		shadowColor: '#000',
		shadowOffset: {width: 0, height: 4},
		shadowOpacity: 0.3,
		shadowRadius: 5,
		elevation: 8,
	},
	form: {
		padding: 20,
	},
	label: {
		fontSize: 16,
		fontWeight: '600',
		color: '#333',
		marginBottom: 8,
		marginTop: 12,
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
		marginTop: 5,
		maxHeight: 200,
		shadowColor: '#000',
		shadowOffset: {width: 0, height: 2},
		shadowOpacity: 0.1,
		shadowRadius: 4,
		elevation: 3,
	},
	searchResultItem: {
		padding: 15,
		borderBottomWidth: 1,
		borderBottomColor: '#F0F0F0',
	},
	searchResultText: {
		fontSize: 16,
		color: '#333',
	},
	plantInfo: {
		backgroundColor: '#F0F7F0',
		padding: 15,
		borderRadius: 12,
		marginTop: 15,
	},
	plantInfoTitle: {
		fontSize: 16,
		fontWeight: 'bold',
		color: '#4CAF50',
		marginBottom: 12,
	},
	plantInfoRow: {
		flexDirection: 'row',
		alignItems: 'center',
		marginBottom: 8,
		gap: 8,
	},
	plantInfoText: {
		fontSize: 14,
		color: '#666',
		flex: 1,
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
