import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MaterialIcons } from '@expo/vector-icons';
import { theme } from '../theme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { View, Text } from 'react-native';

import AdminDashboardScreen from '../screens/admin/AdminDashboardScreen';
import AdminOrdersScreen from '../screens/admin/AdminOrdersScreen';
import AdminOrderDetailScreen from '../screens/admin/AdminOrderDetailScreen';
import AdminInventoryScreen from '../screens/admin/AdminInventoryScreen';
import AdminProductEditorScreen from '../screens/admin/AdminProductEditorScreen';
import AdminInboxScreen from '../screens/admin/AdminInboxScreen';
import AdminTicketChatScreen from '../screens/admin/AdminTicketChatScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function DashboardStack() {
    return (
        <Stack.Navigator screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
            <Stack.Screen name="AdminDashboard" component={AdminDashboardScreen} />
            <Stack.Screen name="AdminOrderDetail" component={AdminOrderDetailScreen} />
        </Stack.Navigator>
    );
}

function OrdersStack() {
    return (
        <Stack.Navigator screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
            <Stack.Screen name="AdminOrders" component={AdminOrdersScreen} />
            <Stack.Screen name="AdminOrderDetail" component={AdminOrderDetailScreen} />
        </Stack.Navigator>
    );
}

function InventoryStack() {
    return (
        <Stack.Navigator screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
            <Stack.Screen name="AdminInventory" component={AdminInventoryScreen} />
            <Stack.Screen name="AdminProductEditor" component={AdminProductEditorScreen} />
        </Stack.Navigator>
    );
}

function InboxStack() {
    return (
        <Stack.Navigator screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
            <Stack.Screen name="AdminInbox" component={AdminInboxScreen} />
            <Stack.Screen name="AdminTicketChat" component={AdminTicketChatScreen} />
        </Stack.Navigator>
    );
}

export default function AdminNavigator() {
    const insets = useSafeAreaInsets();
    const bottomPad = Math.max(insets.bottom + 8, 20);

    return (
        <Tab.Navigator
            screenOptions={{
                headerShown: false,
                tabBarStyle: {
                    backgroundColor: '#1E293B',
                    borderTopColor: '#334155',
                    height: 64 + bottomPad,
                    paddingTop: 10,
                    paddingBottom: bottomPad,
                    borderTopWidth: 1,
                    elevation: 12,
                },
                tabBarActiveTintColor: '#38BDF8',
                tabBarInactiveTintColor: '#64748B',
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
                name="DashboardStack"
                component={DashboardStack}
                options={{
                    tabBarLabel: 'Dashboard',
                    tabBarIcon: ({ color }) => (
                        <MaterialIcons name="dashboard" size={28} color={color} />
                    ),
                }}
            />
            <Tab.Screen
                name="OrdersStack"
                component={OrdersStack}
                options={{
                    tabBarLabel: 'Orders',
                    tabBarIcon: ({ color }) => (
                        <MaterialIcons name="receipt-long" size={28} color={color} />
                    ),
                }}
            />
            <Tab.Screen
                name="InventoryStack"
                component={InventoryStack}
                options={{
                    tabBarLabel: 'Inventory',
                    tabBarIcon: ({ color }) => (
                        <MaterialIcons name="inventory" size={28} color={color} />
                    ),
                }}
            />
            <Tab.Screen
                name="InboxStack"
                component={InboxStack}
                options={{
                    tabBarLabel: 'Inbox',
                    tabBarIcon: ({ color }) => (
                        <MaterialIcons name="forum" size={28} color={color} />
                    ),
                }}
            />
        </Tab.Navigator>
    );
}
