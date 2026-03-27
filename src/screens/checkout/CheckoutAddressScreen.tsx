import React, { useRef, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { theme } from '../../theme';
import { useNavigation } from '@react-navigation/native';
import { WebView } from 'react-native-webview';
import * as Location from 'expo-location';

const HTML_CONTENT = `
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8"/>
<meta content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" name="viewport"/>
<title>Address Selection</title>
<script src="https://cdn.tailwindcss.com?plugins=forms,container-queries"></script>
<link href="https://fonts.googleapis.com/css2?family=Newsreader:ital,wght@0,400;0,700;1,400;1,700&family=Lexend:wght@300;400;500;600;700&display=swap" rel="stylesheet"/>
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet"/>
<link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
<script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
<script id="tailwind-config">
    tailwind.config = {
    theme: {
        extend: {
        colors: {
            "on-surface-variant": "#3e4946",
            "primary": "#005f52",
            "surface": "#faf9f3",
            "primary-container": "#007a6a",
            "surface-container-lowest": "#ffffff",
        },
        fontFamily: {
            "headline": ["Newsreader"],
            "body": ["Lexend"]
        }
        }
    }
    }
</script>
<style>
    body { -webkit-tap-highlight-color: transparent; }
    .material-symbols-outlined { font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24; }
    .marker-shadow { filter: drop-shadow(0 4px 6px rgba(0, 95, 82, 0.4)); }
    #map { width: 100%; height: 100%; }
    .suggestions { display: none; background: white; border-radius: 12px; margin-top: 8px; box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1); overflow: hidden; position: absolute; top: 100%; left: 0; right: 0; z-index: 1000; max-height: 250px; overflow-y: auto;}
    .suggestions.show { display: block; }
    .suggestion-item { padding: 12px 16px; cursor: pointer; border-bottom: 1px solid #f3f4f6; }
    .suggestion-item:last-child { border-bottom: none; }
    .s-name { font-weight: 600; color: #111827; }
    .s-detail { font-size: 13px; color: #6b7280; margin-top: 2px; }
    .leaflet-control-attribution { display: none !important; }
</style>
</head>
<body class="bg-surface text-on-surface font-body h-screen flex flex-col overflow-hidden m-0 p-0">
<main class="flex-grow flex flex-col relative h-full">

<!-- Map Section -->
<section class="relative flex-grow w-full z-0">
    <div id="map" class="absolute inset-0 z-0"></div>
    
    <!-- Static Center Marker Overlay -->
    <div class="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
        <div class="relative mb-10">
            <span class="material-symbols-outlined text-primary text-5xl marker-shadow" style="font-variation-settings: 'FILL' 1;">location_on</span>
            <div class="absolute -bottom-1 left-1/2 -translate-x-1/2 w-4 h-1.5 bg-primary/20 rounded-full blur-sm"></div>
        </div>
    </div>

    <!-- Search Overlay -->
    <div class="absolute top-4 left-4 right-4 z-[400]">
        <div class="relative w-full">
            <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <span class="material-symbols-outlined text-zinc-400">search</span>
            </div>
            <input type="text" id="searchInput" class="block w-full pl-12 pr-12 py-3.5 bg-white/95 backdrop-blur-md border-0 rounded-2xl shadow-lg ring-1 ring-zinc-200 text-zinc-900 placeholder:text-zinc-500 focus:ring-2 focus:ring-primary sm:text-base font-medium" placeholder="Search address (e.g. Bangsar)" autocomplete="off">
            <button onclick="useMyLocation()" class="absolute inset-y-0 right-0 pr-4 flex items-center active:scale-95 transition-transform" id="locationBtn">
                <span class="material-symbols-outlined text-primary text-2xl">my_location</span>
            </button>
            <div class="suggestions" id="suggestions"></div>
        </div>
    </div>

    <!-- Interactive Hint -->
    <div class="absolute bottom-6 left-0 right-0 flex justify-center z-[400] pointer-events-none">
        <div class="bg-surface-container-lowest/95 backdrop-blur-md px-5 py-2 rounded-full shadow-md border border-zinc-100 flex items-center gap-2">
            <span class="material-symbols-outlined text-primary text-xl">pinch</span>
            <span class="text-xs font-semibold tracking-tight">Pan map to adjust</span>
        </div>
    </div>
</section>

<!-- Bottom Address Card -->
<section class="bg-surface-container-lowest rounded-t-[2rem] shadow-[0_-12px_40px_rgba(0,0,0,0.06)] z-[500] flex flex-col pt-8 pb-8 px-6 -mt-4">
    <div class="flex justify-between items-start mb-2">
        <div class="inline-flex items-center px-3 py-1 bg-teal-100/50 text-teal-800 rounded-full text-xs font-bold tracking-widest uppercase">
            Delivery Location
        </div>
    </div>
    
    <h2 id="selectedAddressTitle" class="font-headline text-2xl text-on-surface leading-tight mb-2 italic line-clamp-1">Locating...</h2>
    <p id="selectedAddressDetail" class="text-sm text-on-surface-variant font-light leading-relaxed line-clamp-2 min-h-[40px]">Fetching your precise location...</p>
    
    <div class="mt-6">
        <button id="confirmBtn" onclick="confirmAddress()" disabled class="w-full h-[56px] bg-gradient-to-br from-primary to-primary-container text-white rounded-2xl font-bold text-lg shadow-xl active:scale-95 transition-transform flex items-center justify-center gap-2 disabled:opacity-50 disabled:active:scale-100">
            Confirm Location
            <span class="material-symbols-outlined">arrow_forward</span>
        </button>
    </div>
</section>

</main>

<script>
    const API_KEY = '97a2d65956004eed91725e0bcef86025';
    // Init map centered on KL
    const map = L.map('map', { zoomControl: false }).setView([3.1390, 101.6869], 16);

    L.tileLayer('https://maps.geoapify.com/v1/tile/osm-bright/{z}/{x}/{y}.png?apiKey=' + API_KEY, {
        attribution: 'Geoapify',
        maxZoom: 20
    }).addTo(map);

    let selectedCoords = { lat: 3.1390, lon: 101.6869 };
    let debounceTimer;
    let fullAddressText = '';
    let isInitialLoad = true;

    map.on('movestart', () => {
        document.getElementById('selectedAddressTitle').textContent = 'Updating...';
        document.getElementById('selectedAddressDetail').textContent = 'Pan map to pinpoint location';
        document.getElementById('confirmBtn').disabled = true;
    });

    map.on('moveend', () => {
        const center = map.getCenter();
        selectedCoords = { lat: center.lat, lon: center.lng };
        
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => {
            reverseGeocode(center.lat, center.lng);
        }, 600);
    });

    // Request location on load
    useMyLocation();

    async function reverseGeocode(lat, lon) {
        try {
            const url = \`https://api.geoapify.com/v1/geocode/reverse?lat=\${lat}&lon=\${lon}&lang=en&apiKey=\${API_KEY}\`;
            const res = await fetch(url);
            const data = await res.json();
            if (data.features && data.features.length > 0) {
                const props = data.features[0].properties;
                const title = props.address_line1 || props.name || props.street || 'Unknown Location';
                const detail = props.address_line2 || props.formatted || \`Lat: \${lat.toFixed(5)}, Lon: \${lon.toFixed(5)}\`;
                fullAddressText = props.formatted || \`\${title}, \${detail}\`;
                
                updateAddressUI(title, detail);
                // Only update the search bar if user didn't just type manually
                if(isInitialLoad) {
                    document.getElementById('searchInput').value = fullAddressText;
                    isInitialLoad = false;
                }
            } else {
                fullAddressText = \`Lat: \${lat.toFixed(5)}, Lon: \${lon.toFixed(5)}\`;
                updateAddressUI('Unknown Location', fullAddressText);
            }
        } catch {
            fullAddressText = \`Lat: \${lat.toFixed(5)}, Lon: \${lon.toFixed(5)}\`;
            updateAddressUI('Location Details Unavailable', fullAddressText);
        }
    }

    function updateAddressUI(title, detail) {
        document.getElementById('selectedAddressTitle').textContent = title;
        document.getElementById('selectedAddressDetail').textContent = detail;
        document.getElementById('confirmBtn').disabled = false;
    }

    // --- Search Autocomplete Logic ---
    const searchInput = document.getElementById('searchInput');
    let searchTimer;

    searchInput.addEventListener('input', (e) => {
        const query = e.target.value.trim();
        clearTimeout(searchTimer);
        if (!query) {
            clearSuggestions();
            return;
        }
        searchTimer = setTimeout(() => {
            performSearch(query);
        }, 500);
    });

    async function performSearch(query) {
        try {
            const url = \`https://api.geoapify.com/v1/geocode/search?text=\${encodeURIComponent(query)}&filter=countrycode:my&lang=en&limit=5&apiKey=\${API_KEY}\`;
            const res = await fetch(url);
            const data = await res.json();
            if (data.features && data.features.length > 0) {
                showSuggestions(data.features);
            } else {
                clearSuggestions();
            }
        } catch (err) {
            clearSuggestions();
        }
    }

    function showSuggestions(features) {
        const box = document.getElementById('suggestions');
        box.innerHTML = '';
        features.forEach(f => {
            const props = f.properties;
            const name = props.address_line1 || props.name || 'Unknown';
            const detail = props.address_line2 || props.formatted || '';
            const lat = f.geometry.coordinates[1];
            const lon = f.geometry.coordinates[0];

            const item = document.createElement('div');
            item.className = 'suggestion-item';
            item.innerHTML = \`
                <div class="s-name">\${name}</div>
                <div class="s-detail">\${detail}</div>
            \`;
            item.addEventListener('click', () => {
                const fullText = props.formatted || \`\${name}, \${detail}\`;
                searchInput.value = fullText;
                clearSuggestions();
                map.setView([lat, lon], 17); // This triggers moveend and reverseGeocode automatically
            });
            box.appendChild(item);
        });
        box.classList.add('show');
    }

    function clearSuggestions() {
        document.getElementById('suggestions').innerHTML = '';
        document.getElementById('suggestions').classList.remove('show');
    }

    // Hide suggestions when clicking outside
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.absolute.top-4')) clearSuggestions();
    });

    function useMyLocation() {
        if (!navigator.geolocation) {
           updateAddressUI('Error', 'Location not supported');
           return;
        }
        
        const loader = document.getElementById('selectedAddressTitle');
        const oldText = loader.textContent;
        loader.textContent = 'Locating you...';
        document.getElementById('confirmBtn').disabled = true;

        navigator.geolocation.getCurrentPosition((pos) => {
            isInitialLoad = true; // So search bar updates with the new geo
            map.flyTo([pos.coords.latitude, pos.coords.longitude], 17);
        }, (err) => {
            loader.textContent = oldText;
            document.getElementById('confirmBtn').disabled = false;
        }, { enableHighAccuracy: true });
    }

    function confirmAddress() {
        if (window.ReactNativeWebView) {
            window.ReactNativeWebView.postMessage(JSON.stringify({
                type: 'ADDRESS_CONFIRMED',
                address: fullAddressText,
                lat: selectedCoords.lat,
                lon: selectedCoords.lon
            }));
        }
    }
</script>
</body>
</html>
`;

export default function CheckoutAddressScreen() {
    const navigation = useNavigation<any>();
    const webViewRef = useRef<WebView>(null);

    useEffect(() => {
        // Pre-request location permissions so WebView logic works securely.
        (async () => {
            const { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                console.log('[Location] Permission not granted to app.');
            }
        })();
    }, []);

    const onMessage = (event: any) => {
        try {
            const data = JSON.parse(event.nativeEvent.data);
            if (data.type === 'ADDRESS_CONFIRMED') {
                // Navigate to Payment with selected address string!
                navigation.navigate('CheckoutPayment', {
                    delivery_address: data.address,
                });
            }
        } catch (err) {
            console.error('Failed to parse WebView message:', err);
        }
    };

    return (
        <View style={styles.container}>
            {/* Header */}
            <SafeAreaView edges={['top']} style={styles.header}>
                <View style={styles.headerContent}>
                    <Pressable
                        style={styles.backButton}
                        onPress={() => navigation.goBack()}
                    >
                        <MaterialIcons name="arrow-back-ios" size={20} color={theme.colors.textPrimary} />
                    </Pressable>
                    <Text style={styles.headerTitle}>Delivery Details</Text>
                </View>
            </SafeAreaView>

            {/* WebView UI */}
            <SafeAreaView edges={['bottom']} style={{ flex: 1, backgroundColor: '#ffffff' }}>
                <WebView
                    ref={webViewRef}
                    source={{ html: HTML_CONTENT }}
                    style={styles.webview}
                    onMessage={onMessage}
                    geolocationEnabled={true}
                    javaScriptEnabled={true}
                    domStorageEnabled={true}
                    startInLoadingState={true}
                />
            </SafeAreaView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f7faf8',
    },
    header: {
        backgroundColor: '#ffffff',
        borderBottomWidth: 1,
        borderBottomColor: '#e0e0e0',
    },
    headerContent: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 16,
    },
    backButton: {
        width: 48,
        height: 48,
        justifyContent: 'center',
        alignItems: 'flex-start',
    },
    headerTitle: {
        flex: 1,
        textAlign: 'center',
        fontSize: 20,
        fontWeight: 'bold',
        color: theme.colors.textPrimary,
        fontFamily: theme.typography.fontFamily.bold,
        paddingRight: 48, // to center title with back button on left
    },
    webview: {
        flex: 1,
        backgroundColor: 'transparent',
    }
});
