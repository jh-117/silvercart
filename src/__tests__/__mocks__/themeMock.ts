/**
 * Shared mock for src/theme to be imported across all screen-level tests.
 * Mirrors the full structure of src/theme/index.ts.
 */
export const theme = {
    colors: {
        primary: '#007A6A',
        secondary: '#2E7D32',
        accent: '#E0F2F1',
        trustGreen: '#E7F3F1',
        trustGreenDark: '#1B4D44',
        textPrimary: '#222222',
        textSecondary: '#666666',
        textDisabled: '#999999',
        background: '#fafafa',
        backgroundAlt: '#FFF9E6',
        backgroundLight: '#F5F5F5',
        surface: '#FFFFFF',
        success: '#2D6A4F',
        error: '#C62828',
        warning: '#F57C00',
        info: '#1976D2',
        white: '#FFFFFF',
        black: '#000000',
        textMain: '#222222',
        textMuted: '#666666',
        borderLight: '#E0E0E0',
        eggshell: '#F9F8F2',
        charcoal: '#30363D',
    },
    typography: {
        fontFamily: {
            regular: 'System',
            medium: 'System',
            semibold: 'System',
            bold: 'System',
        },
        fontSize: {
            h1: 32, h2: 28, h3: 24, h4: 20,
            bodyLarge: 20, body: 18, caption: 16,
        },
        fontWeight: {
            regular: '400',
            semibold: '600',
            bold: '700',
        },
        lineHeight: { heading: 1.2, body: 1.5 },
    },
    spacing: {
        xs: 4, sm: 8, md: 16, lg: 24, xl: 32, xxl: 48,
    },
};
