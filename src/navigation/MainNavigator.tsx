import React from 'react';
import { View, Text } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MaterialIcons } from '@expo/vector-icons';
import { theme } from '../theme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useCart } from '../contexts/CartContext';

// Screens
import HomeScreen from '../screens/main/HomeScreen';
import CartScreen from '../screens/main/CartScreen';
import OrdersScreen from '../screens/orders/OrdersScreen';
import ProfileScreen from '../screens/profile/ProfileScreen';

const Tab = createBottomTabNavigator();

function CartTabIcon({ color }: { color: string }) {
    const { itemCount } = useCart();
    return (
        <View>
            <MaterialIcons name="shopping-cart" size={28} color={color} />
            {itemCount > 0 && (
                <View style={{
                    position: 'absolute',
                    right: -4, top: -4,
                    backgroundColor: theme.colors.primary,
                    borderRadius: 8,
                    minWidth: 16, height: 16,
                    justifyContent: 'center', alignItems: 'center',
                    borderWidth: 1.5, borderColor: theme.colors.white,
                    paddingHorizontal: 2,
                }}>
                    <Text style={{ color: 'white', fontSize: 9, fontWeight: 'bold' }}>
                        {itemCount > 99 ? '99+' : itemCount}
                    </Text>
                </View>
            )}
        </View>
    );
}


export default function MainNavigator() {
    const insets = useSafeAreaInsets();
    const bottomPad = Math.max(insets.bottom + 8, 20);
    return (
        <Tab.Navigator
            screenOptions={{
                headerShown: false,
                tabBarStyle: {
                    backgroundColor: theme.colors.white,
                    borderTopColor: theme.colors.borderLight,
                    height: 64 + bottomPad,
                    paddingTop: 10,
                    paddingBottom: bottomPad,
                    borderTopWidth: 1,
                    elevation: 10,
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: -4 },
                    shadowOpacity: 0.1,
                    shadowRadius: 10,
                },
                tabBarActiveTintColor: theme.colors.primary,
                tabBarInactiveTintColor: theme.colors.textMuted,
                tabBarLabelStyle: {
                    fontSize: 10,
                    fontWeight: '700',
                    marginTop: 4,
                    textTransform: 'uppercase',
                    letterSpacing: 1,
                    fontFamily: theme.typography.fontFamily.bold,
                },
            }}
        >
            <Tab.Screen
                name="Home"
                component={HomeScreen}
                options={{
                    tabBarLabel: 'Home',
                    tabBarIcon: ({ color, size }) => (
                        <MaterialIcons name="home" size={30} color={color} />
                    ),
                }}
            />
            <Tab.Screen
                name="Orders"
                component={OrdersScreen}
                options={{
                    tabBarLabel: 'Orders',
                    tabBarIcon: ({ color, size }) => (
                        <MaterialIcons name="receipt-long" size={28} color={color} />
                    ),
                }}
            />
            <Tab.Screen
                name="Cart"
                component={CartScreen}
                options={{
                    tabBarLabel: 'Cart',
                    tabBarIcon: ({ color }) => <CartTabIcon color={color} />,
                }}
            />
            <Tab.Screen
                name="Profile"
                component={ProfileScreen}
                options={{
                    tabBarLabel: 'Profile',
                    tabBarIcon: ({ color, size }) => (
                        <MaterialIcons name="person" size={28} color={color} />
                    ),
                }}
            />
        </Tab.Navigator>
    );
}
