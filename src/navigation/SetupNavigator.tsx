import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import ProfileSetupScreen from '../screens/auth/ProfileSetupScreen';
import AddTrustedContactScreen from '../screens/profile/AddTrustedContactScreen';

const Stack = createNativeStackNavigator();

export default function SetupNavigator() {
    return (
        <Stack.Navigator screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
            <Stack.Screen name="ProfileSetup" component={ProfileSetupScreen} />
            <Stack.Screen name="AddTrustedContact" component={AddTrustedContactScreen} initialParams={{ isSetupFlow: true }} />
        </Stack.Navigator>
    );
}
