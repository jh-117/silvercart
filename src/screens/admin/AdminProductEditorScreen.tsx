import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, Pressable, ActivityIndicator, Alert, KeyboardAvoidingView, Platform, Switch, Image, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { theme } from '../../theme';
import { useNavigation, useRoute } from '@react-navigation/native';
import { createProduct, updateProduct, deleteProduct, Product } from '../../services/productService';

export default function AdminProductEditorScreen() {
    const navigation = useNavigation<any>();
    const route = useRoute<any>();
    const productToEdit: Product | undefined = route.params?.product;
    const isEditing = !!productToEdit;

    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: productToEdit?.name || '',
        category: productToEdit?.category || 'pharmacy',
        price: productToEdit?.price?.toString() || '',
        description: productToEdit?.description || '',
        image_url: productToEdit?.image_url || '',
        stock_status: productToEdit?.stock_status || 'in_stock',
        search_keywords: productToEdit?.search_keywords?.join(', ') || '',
    });

    const [showOnStorefront, setShowOnStorefront] = useState(productToEdit?.show_on_storefront ?? true);
    const [elderlyFriendly, setElderlyFriendly] = useState(productToEdit?.elderly_friendly ?? true);

    const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
    const [showStockDropdown, setShowStockDropdown] = useState(false);

    const handleSave = async () => {
        if (!formData.name || !formData.price || !formData.category) {
            Alert.alert('Error', 'Please fill in all required fields (Name, Price, Category).');
            return;
        }

        const priceNum = parseFloat(formData.price);
        if (isNaN(priceNum) || priceNum < 0) {
            Alert.alert('Error', 'Invalid price.');
            return;
        }

        try {
            setLoading(true);
            const payload = {
                name: formData.name,
                category: formData.category,
                price: priceNum,
                description: formData.description,
                image_url: formData.image_url,
                stock_status: formData.stock_status,
                search_keywords: formData.search_keywords.split(',').map((s: string) => s.trim()).filter(Boolean),
                show_on_storefront: showOnStorefront,
                elderly_friendly: elderlyFriendly,
            };

            if (isEditing) {
                await updateProduct(productToEdit.id, payload);
                Alert.alert('Success', 'Product updated successfully.', [{ text: 'OK', onPress: () => navigation.goBack() }]);
            } else {
                await createProduct(payload);
                Alert.alert('Success', 'Product created successfully.', [{ text: 'OK', onPress: () => navigation.goBack() }]);
            }
        } catch (error: any) {
            Alert.alert('Error', error.message || 'Failed to save product.');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = () => {
        if (!isEditing) return;
        Alert.alert('Delete Product', `Are you sure you want to delete "${formData.name}"?`, [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Delete',
                style: 'destructive',
                onPress: async () => {
                    try {
                        setLoading(true);
                        await deleteProduct(productToEdit.id);
                        Alert.alert('Deleted', 'Product was deleted.');
                        navigation.goBack();
                    } catch (error) {
                        setLoading(false);
                        Alert.alert('Error', 'Failed to delete product.');
                    }
                }
            }
        ]);
    };

    return (
        <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
            {/* Header */}
            <View style={styles.header}>
                <View style={styles.headerLeft}>
                    <Pressable onPress={() => navigation.goBack()} style={styles.iconButton}>
                        <MaterialIcons name="arrow-back-ios-new" size={20} color="#121717" />
                    </Pressable>
                    <Text style={styles.headerTitle}>{isEditing ? 'Edit Product' : 'Add New Item'}</Text>
                </View>
                {isEditing && (
                    <Pressable style={styles.updateBtnSmall} onPress={handleSave}>
                        <Text style={styles.updateBtnSmallText}>Update</Text>
                    </Pressable>
                )}
            </View>

            <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
                <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

                    {/* Title Section (if editing) */}
                    {isEditing && (
                        <View style={styles.titleSection}>
                            <Text style={styles.productTitle}>{formData.name}</Text>
                            <Text style={styles.productSubtitle}>SKU: {productToEdit.id.substring(0, 8).toUpperCase()} • Last edited recently</Text>
                        </View>
                    )}

                    {/* General Info Card */}
                    <View style={styles.card}>
                        <View style={styles.cardHeader}>
                            <MaterialIcons name="info" size={20} color={theme.colors.primary} />
                            <Text style={styles.cardHeaderTitle}>General Information</Text>
                        </View>

                        <View style={styles.formGroup}>
                            <Text style={styles.label}>Product Name</Text>
                            <TextInput
                                style={styles.input}
                                value={formData.name}
                                onChangeText={(val) => setFormData({ ...formData, name: val })}
                                placeholder="e.g. Ergonomic Walking Stick"
                                placeholderTextColor="#9CA3AF"
                            />
                        </View>

                        <View style={styles.formGroup}>
                            <Text style={styles.label}>Category</Text>
                            <Pressable style={styles.selectWrapper} onPress={() => setShowCategoryDropdown(true)}>
                                <View style={styles.input}>
                                    <Text style={{ fontSize: 16, color: formData.category ? '#121717' : '#9CA3AF', textTransform: 'capitalize' }}>
                                        {formData.category || 'Select category...'}
                                    </Text>
                                </View>
                                <MaterialIcons name="arrow-drop-down" size={24} color="#9CA3AF" style={styles.selectIcon} />
                            </Pressable>
                        </View>

                        <View style={styles.formGroup}>
                            <Text style={styles.label}>Description</Text>
                            <TextInput
                                style={[styles.input, styles.textArea]}
                                value={formData.description}
                                onChangeText={(val) => setFormData({ ...formData, description: val })}
                                placeholder="Provide a clear, detailed description of the item..."
                                multiline
                                numberOfLines={4}
                                textAlignVertical="top"
                                placeholderTextColor="#9CA3AF"
                            />
                        </View>
                    </View>

                    {/* Media Card */}
                    <View style={styles.card}>
                        <View style={styles.cardHeaderRow}>
                            <View style={styles.cardHeader}>
                                <MaterialIcons name="image" size={20} color={theme.colors.primary} />
                                <Text style={styles.cardHeaderTitle}>Product Media</Text>
                            </View>
                        </View>
                        <View style={styles.formGroup}>
                            <Text style={styles.label}>Image URL</Text>
                            <TextInput
                                style={styles.input}
                                value={formData.image_url}
                                onChangeText={(val) => setFormData({ ...formData, image_url: val })}
                                placeholder="https://..."
                                autoCapitalize="none"
                                placeholderTextColor="#9CA3AF"
                            />
                        </View>
                        {formData.image_url ? (
                            <View style={styles.mediaRow}>
                                <View style={styles.mediaImageBox}>
                                    <Image source={{ uri: formData.image_url }} style={styles.mediaImage} />
                                    <Pressable style={styles.mediaCloseBtn} onPress={() => setFormData({ ...formData, image_url: '' })}>
                                        <MaterialIcons name="close" size={16} color="#FFFFFF" />
                                    </Pressable>
                                </View>
                            </View>
                        ) : (
                            <View style={styles.mediaEmptyBox}>
                                <MaterialIcons name="add-photo-alternate" size={24} color="#9CA3AF" />
                                <Text style={styles.mediaEmptyText}>ADD NEW</Text>
                            </View>
                        )}
                    </View>

                    {/* Pricing & Stock Card */}
                    <View style={styles.card}>
                        <View style={styles.cardHeader}>
                            <MaterialIcons name="payments" size={20} color={theme.colors.primary} />
                            <Text style={styles.cardHeaderTitle}>Pricing & Stock</Text>
                        </View>

                        <View style={styles.gridRow}>
                            <View style={[styles.formGroup, { flex: 1 }]}>
                                <Text style={styles.label}>Price (RM)</Text>
                                <TextInput
                                    style={styles.input}
                                    value={formData.price}
                                    onChangeText={(val) => setFormData({ ...formData, price: val })}
                                    keyboardType="numeric"
                                    placeholder="0.00"
                                    placeholderTextColor="#9CA3AF"
                                />
                            </View>
                            <View style={[styles.formGroup, { flex: 1, paddingLeft: 12 }]}>
                                <Text style={styles.label}>Stock Status</Text>
                                <Pressable style={styles.selectWrapper} onPress={() => setShowStockDropdown(true)}>
                                    <View style={styles.input}>
                                        <Text style={{ fontSize: 16, color: formData.stock_status ? '#121717' : '#9CA3AF', textTransform: 'capitalize' }}>
                                            {formData.stock_status.replace('_', ' ') || 'Select status...'}
                                        </Text>
                                    </View>
                                    <MaterialIcons name="arrow-drop-down" size={24} color="#9CA3AF" style={styles.selectIcon} />
                                </Pressable>
                            </View>
                        </View>

                        <View style={styles.formGroup}>
                            <Text style={styles.label}>Search Keywords (comma separated)</Text>
                            <TextInput
                                style={styles.input}
                                value={formData.search_keywords}
                                onChangeText={(val) => setFormData({ ...formData, search_keywords: val })}
                                placeholder="cane, support, safety"
                                placeholderTextColor="#9CA3AF"
                            />
                        </View>
                    </View>

                    {/* Settings Card */}
                    <View style={styles.card}>
                        <View style={styles.settingRow}>
                            <View style={styles.settingLeft}>
                                <View style={styles.settingIconBoxBlue}>
                                    <MaterialIcons name="visibility" size={20} color="#3B82F6" />
                                </View>
                                <View>
                                    <Text style={styles.settingTitle}>Show on storefront</Text>
                                    <Text style={styles.settingSubtitle}>Product is visible to customers</Text>
                                </View>
                            </View>
                            <Switch
                                value={showOnStorefront}
                                onValueChange={setShowOnStorefront}
                                trackColor={{ false: '#E5E7EB', true: theme.colors.primary }}
                                thumbColor="#FFFFFF"
                            />
                        </View>
                        <View style={styles.divider} />
                        <View style={styles.settingRow}>
                            <View style={styles.settingLeft}>
                                <View style={styles.settingIconBoxOrange}>
                                    <MaterialIcons name="accessibility-new" size={20} color="#F97316" />
                                </View>
                                <View>
                                    <Text style={styles.settingTitle}>Elderly-Friendly Tag</Text>
                                    <Text style={styles.settingSubtitle}>Highlight for accessibility features</Text>
                                </View>
                            </View>
                            <Switch
                                value={elderlyFriendly}
                                onValueChange={setElderlyFriendly}
                                trackColor={{ false: '#E5E7EB', true: theme.colors.primary }}
                                thumbColor="#FFFFFF"
                            />
                        </View>
                    </View>

                    {isEditing && (
                        <Pressable style={styles.deleteBlock} onPress={handleDelete}>
                            <MaterialIcons name="delete-outline" size={20} color="#EF4444" />
                            <Text style={styles.deleteBlockText}>Delete Product</Text>
                        </Pressable>
                    )}

                </ScrollView>
            </KeyboardAvoidingView>

            {/* Bottom Actions */}
            <View style={styles.bottomBar}>
                <Pressable style={styles.saveBtn} onPress={handleSave} disabled={loading}>
                    {loading ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <>
                            <MaterialIcons name="save" size={20} color="#FFFFFF" />
                            <Text style={styles.saveBtnText}>{isEditing ? 'Update Product' : 'Save Product'}</Text>
                        </>
                    )}
                </Pressable>
            </View>
            {/* Modals for Dropdowns */}
            <Modal visible={showCategoryDropdown} transparent animationType="fade">
                <Pressable style={styles.modalOverlay} onPress={() => setShowCategoryDropdown(false)}>
                    <View style={styles.modalContent}>
                        <Text style={styles.cardHeaderTitle}>Select Category</Text>
                        <View style={{ height: 16 }} />
                        {['pharmacy', 'grocery'].map(cat => (
                            <Pressable key={cat} style={styles.modalOption} onPress={() => { setFormData({ ...formData, category: cat }); setShowCategoryDropdown(false); }}>
                                <Text style={[styles.modalOptionText, formData.category === cat && styles.modalOptionTextActive]}>
                                    {cat.charAt(0).toUpperCase() + cat.slice(1)}
                                </Text>
                                {formData.category === cat && <MaterialIcons name="check" size={20} color={theme.colors.primary} />}
                            </Pressable>
                        ))}
                    </View>
                </Pressable>
            </Modal>

            <Modal visible={showStockDropdown} transparent animationType="fade">
                <Pressable style={styles.modalOverlay} onPress={() => setShowStockDropdown(false)}>
                    <View style={styles.modalContent}>
                        <Text style={styles.cardHeaderTitle}>Select Stock Status</Text>
                        <View style={{ height: 16 }} />
                        {['in_stock', 'out_of_stock'].map(status => (
                            <Pressable key={status} style={styles.modalOption} onPress={() => { setFormData({ ...formData, stock_status: status }); setShowStockDropdown(false); }}>
                                <Text style={[styles.modalOptionText, formData.stock_status === status && styles.modalOptionTextActive]}>
                                    {status.replace('_', ' ').toUpperCase()}
                                </Text>
                                {formData.stock_status === status && <MaterialIcons name="check" size={20} color={theme.colors.primary} />}
                            </Pressable>
                        ))}
                    </View>
                </Pressable>
            </Modal>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.colors.backgroundLight },

    // Header
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: 'rgba(255,255,255,0.8)',
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(0,0,0,0.05)',
    },
    headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    iconButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F3F4F6',
    },
    headerTitle: { fontSize: 18, fontWeight: '700', color: '#121717', letterSpacing: -0.5 },
    updateBtnSmall: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        backgroundColor: `${theme.colors.primary}1A`,
        borderRadius: 8,
    },
    updateBtnSmallText: { fontSize: 14, fontWeight: '700', color: theme.colors.primary },

    scrollContent: { padding: 16, paddingBottom: 100 },

    // Title Section
    titleSection: { paddingVertical: 12, paddingHorizontal: 4, marginBottom: 8 },
    productTitle: { fontSize: 24, fontWeight: '700', color: '#121717', letterSpacing: -0.5 },
    productSubtitle: { fontSize: 14, color: '#6B7280', marginTop: 4 },

    // Card
    card: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 16,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: 'rgba(0,0,0,0.05)',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
    },
    cardHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
    cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 16, marginTop: -4 },
    cardHeaderTitle: { fontSize: 14, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5, color: '#121717' },

    // Forms
    formGroup: { marginBottom: 16 },
    label: { fontSize: 12, fontWeight: '600', textTransform: 'uppercase', color: '#6B7280', marginBottom: 8, marginLeft: 4 },
    input: {
        width: '100%',
        backgroundColor: '#F9FAFB',
        borderWidth: 1,
        borderColor: '#E5E7EB',
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 14,
        fontSize: 16,
        color: '#121717',
    },
    textArea: { height: 120 },
    gridRow: { flexDirection: 'row' },
    selectWrapper: { position: 'relative' },
    selectIcon: { position: 'absolute', right: 12, top: 14 },

    // Media
    mediaRow: { flexDirection: 'row', gap: 12 },
    mediaImageBox: {
        width: 96,
        height: 96,
        borderRadius: 12,
        position: 'relative',
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    mediaImage: { width: '100%', height: '100%', borderRadius: 12 },
    mediaCloseBtn: {
        position: 'absolute',
        top: -8,
        right: -8,
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: '#EF4444',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 3,
    },
    mediaEmptyBox: {
        width: 96,
        height: 96,
        borderRadius: 12,
        borderWidth: 2,
        borderColor: '#D1D5DB',
        borderStyle: 'dashed',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 4,
    },
    mediaEmptyText: { fontSize: 10, fontWeight: '700', color: '#9CA3AF' },

    // Settings
    settingRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 8 },
    settingLeft: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
    settingIconBoxBlue: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#EFF6FF', justifyContent: 'center', alignItems: 'center' },
    settingIconBoxOrange: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#FFF7ED', justifyContent: 'center', alignItems: 'center' },
    settingTitle: { fontSize: 14, fontWeight: '700', color: '#121717' },
    settingSubtitle: { fontSize: 12, color: '#6B7280' },
    divider: { height: 1, backgroundColor: '#F3F4F6', marginVertical: 8 },

    // Delete
    deleteBlock: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        padding: 16,
        borderRadius: 16,
        backgroundColor: '#FEF2F2',
        borderWidth: 1,
        borderColor: '#FEE2E2',
        marginBottom: 20,
    },
    deleteBlockText: { fontSize: 16, fontWeight: '700', color: '#EF4444' },

    // Bottom Bar
    bottomBar: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        padding: 16,
        paddingBottom: 32,
        backgroundColor: 'rgba(255,255,255,0.9)',
        borderTopWidth: 1,
        borderTopColor: 'rgba(0,0,0,0.05)',
    },
    saveBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        backgroundColor: theme.colors.primary,
        padding: 16,
        borderRadius: 16,
        shadowColor: theme.colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 4,
    },
    saveBtnText: { fontSize: 16, fontWeight: '700', color: '#FFFFFF' },
    // Dropdown Modals
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: '#FFFFFF',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        padding: 24,
        paddingBottom: 48,
    },
    modalOption: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
    },
    modalOptionText: { fontSize: 16, color: '#374151' },
    modalOptionTextActive: { fontWeight: '700', color: theme.colors.primary },
});
