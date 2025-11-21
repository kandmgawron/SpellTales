// Color palette
export const Colors = {
  // Main colors
  primary: '#666',
  primaryText: '#fff',
  
  // Dark mode
  dark: {
    background: '#1a1a1a',
    surface: '#333',
    text: '#fff',
    textSecondary: '#ccc',
    border: '#444',
    inputBackground: '#333',
    modalBackground: 'rgba(0,0,0,0.3)',
  },
  
  // Light mode  
  light: {
    background: '#fff',
    surface: '#f5f5f5',
    text: '#000',
    textSecondary: '#666',
    border: '#e0e0e0',
    inputBackground: '#fff',
    modalBackground: 'rgba(255,255,255,0.9)',
  },
};

// Typography
export const Typography = {
  titleFont: 'Nunito_600SemiBold',
  headingFont: 'Nunito_600SemiBold', 
  titleSize: 32,
  headingSize: 24,
  bodySize: 16,
  captionSize: 14,
};

// Create global styles function
export const createGlobalStyles = (darkMode) => {
  const theme = darkMode ? Colors.dark : Colors.light;
  
  return {
    // Layout
    container: {
      flex: 1,
      backgroundColor: theme.surface,
      padding: 20,
      borderRadius: 12,
    },
    
    screenContainer: {
      flex: 1,
      backgroundColor: 'transparent',
      padding: 20,
      paddingTop: 60,
    },
    
    screenHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 20,
      gap: 10,
    },
    
    formContainer: {
      backgroundColor: 'rgba(0,0,0,0.3)',
      padding: 30,
      borderRadius: 20,
      margin: 20,
    },
    
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 20,
      gap: 10,
    },
    
    headerButtons: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      flex: 1,
    },
    
    leftSpacer: {
      flex: 1,
    },
    
    rightButtons: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    
    // Typography
    title: {
      fontSize: Typography.titleSize,
      fontFamily: Typography.titleFont,
      color: '#ffffff',
      textAlign: 'center',
      marginBottom: 10,
      textShadow: '-1px -1px 1px #000',
    },
    
    heading: {
      fontSize: Typography.headingSize,
      fontFamily: Typography.headingFont,
      color: '#ffffff',
      marginBottom: 15,
      fontWeight: 'bold',
      textAlign: 'left',
      textShadow: '-1px -1px 1px #000',
    },
    
    cardTitle: {
      fontSize: 18,
      fontFamily: Typography.headingFont,
      color: theme.text,
      fontWeight: 'bold',
      marginBottom: 12,
    },
    
    bodyText: {
      fontSize: Typography.bodySize,
      color: theme.text,
      lineHeight: 24,
    },
    
    welcomeText: {
      fontSize: Typography.bodySize,
      color: '#ffffff',
      textAlign: 'center',
      marginBottom: 10,
      lineHeight: 24,
    },
    
    // Buttons - Simplified System
    primaryButton: {
      backgroundColor: '#4CAF50',
      paddingVertical: 12,
      paddingHorizontal: 30,
      borderRadius: 10,
      width: '100%',
      alignItems: 'center',
      marginBottom: 15,
    },
    
    outlineButton: {
      backgroundColor: 'transparent',
      borderWidth: 1,
      borderColor: theme.text,
      paddingVertical: 12,
      paddingHorizontal: 30,
      borderRadius: 10,
      width: '100%',
      alignItems: 'center',
      marginBottom: 15,
    },
    
    dangerButton: {
      backgroundColor: '#DC2626',
      paddingVertical: 12,
      paddingHorizontal: 30,
      borderRadius: 10,
      width: '100%',
      alignItems: 'center',
      marginBottom: 15,
    },
    
    dangerButtonText: {
      color: '#fff',
      fontSize: 18,
      fontWeight: 'bold',
    },
    
    linkButton: {
      backgroundColor: 'transparent',
      paddingVertical: 10,
      paddingHorizontal: 15,
      alignItems: 'center',
    },
    
    buttonText: {
      color: '#fff',
      fontSize: 18,
      fontWeight: 'bold',
    },
    
    outlineButtonText: {
      color: theme.text,
      fontSize: 18,
      fontWeight: '500',
    },
    
    linkButtonText: {
      color: theme.text,
      fontSize: 16,
      textDecorationLine: 'underline',
    },
    
    buttonDisabled: {
      opacity: 0.6,
    },
    
    // Filter styles
    filterContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
      marginTop: 15,
      alignItems: 'center',
    },
    
    filterLabel: {
      color: theme.text,
      fontSize: 14,
      fontWeight: '600',
      marginRight: 8,
    },
    
    filterBtn: {
      backgroundColor: darkMode ? '#374151' : '#E2E8F0',
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 8,
      borderWidth: 2,
      borderColor: 'transparent',
    },
    
    filterBtnActive: {
      backgroundColor: darkMode ? '#1a4a1a' : '#e8f5e8',
      borderColor: '#4CAF50',
    },
    
    filterBtnText: {
      color: theme.text,
      fontSize: 12,
      fontWeight: '600',
    },
    
    profileTag: {
      backgroundColor: darkMode ? '#7C3AED' : '#A78BFA',
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 12,
    },
    
    profileTagText: {
      color: '#fff',
      fontSize: 11,
      fontWeight: '600',
    },
    
    // Inputs
    textInput: {
      backgroundColor: darkMode ? '#333333' : '#f5f5f5',
      color: darkMode ? '#ffffff' : '#000000',
      padding: 15,
      borderRadius: 10,
      marginBottom: 10,
      borderWidth: 1,
      borderColor: darkMode ? '#444444' : '#e0e0e0',
      fontSize: 16,
      width: '100%',
    },
    
    textInputAuth: {
      backgroundColor: darkMode ? '#333333' : '#f5f5f5',
      padding: 15,
      borderRadius: 10,
      marginBottom: 15,
      fontSize: 16,
      color: darkMode ? '#ffffff' : '#000000',
      width: '100%',
    },
    
    // Sections
    formSection: {
      backgroundColor: theme.modalBackground,
      padding: 20,
      borderRadius: 10,
      marginBottom: 20,
      gap: 10,
    },
    
    // Story display
    storyContainer: {
      backgroundColor: theme.surface,
      padding: 20,
      borderRadius: 10,
      marginBottom: 20,
    },
    
    card: {
      backgroundColor: theme.surface,
      borderRadius: 8,
      marginBottom: 12,
      borderWidth: 1,
      borderColor: darkMode ? '#4A5568' : '#E2E8F0',
      overflow: 'hidden',
    },
    
    storyText: {
      fontSize: 16,
      color: theme.text,
      lineHeight: 24,
      textAlign: 'left',
    },
    
    // Background
    backgroundImage: {
      flex: 1,
      width: '100%',
      height: '100%',
    },
    
    backgroundImageStyle: {
      opacity: 0.6,
      position: 'absolute',
      top: 0,
      left: 0,
      bottom: 0,
      right: 0,
    },
    
    scrollContainer: {
      paddingTop: 60,
    },
    
    // Menu styles
    menuContainer: {
      zIndex: 1000,
    },
    
    offlineBanner: {
      backgroundColor: '#FF9800',
      padding: 8,
      paddingTop: 50,
      alignItems: 'center',
      zIndex: 9999,
    },
    
    offlineBannerText: {
      color: '#000',
      fontSize: 14,
      fontWeight: '600',
    },
    
    menuButton: {
      padding: 10,
      borderRadius: 20,
      backgroundColor: theme.inputBackground,
    },
    
    menuIcon: {
      fontSize: 20,
      color: theme.text,
    },
    
    overlay: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.3)',
      justifyContent: 'flex-start',
      alignItems: 'flex-end',
      paddingTop: 100,
      paddingRight: 20,
    },
    
    dropdown: {
      backgroundColor: theme.surface,
      borderRadius: 10,
      padding: 10,
      minWidth: 200,
      boxShadow: '0px 2px 3.84px rgba(0, 0, 0, 0.25)',
      elevation: 5,
    },
    
    menuItem: {
      paddingVertical: 12,
      paddingHorizontal: 16,
      backgroundColor: theme.inputBackground,
      borderBottomWidth: 1,
      borderBottomColor: theme.border,
    },
    
    submenuItem: {
      backgroundColor: darkMode ? '#222' : '#e8e8e8',
    },
    
    menuItemDisabled: {
      opacity: 0.5,
    },
    
    menuItemText: {
      fontSize: 16,
      color: theme.text,
    },
    
    menuItemTextDisabled: {
      color: theme.textSecondary,
    },
    
    menuItemTextLocked: {
      color: theme.textSecondary,
    },
    
    // Dropdown styles
    genreDropdown: {
      backgroundColor: theme.inputBackground,
      padding: 15,
      borderRadius: 10,
      marginBottom: 15,
      borderWidth: 1,
      borderColor: theme.border,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      width: '100%',
    },
    
    dropdown: {
      backgroundColor: theme.surface,
      borderRadius: 10,
      padding: 10,
      minWidth: 200,
      boxShadow: '0px 2px 3.84px rgba(0, 0, 0, 0.25)',
      elevation: 5,
    },
    
    dropdownText: {
      fontSize: 16,
      color: theme.text,
    },
    
    dropdownArrow: {
      fontSize: 16,
      color: theme.text,
    },
    
    // AuthScreen styles
    authBackgroundImage: {
      flex: 1,
    },
    
    authContainer: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.7)',
    },
    
    authInnerContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 20,
      paddingTop: typeof window !== 'undefined' && window.innerHeight < 700 ? 40 : 100,
    },
    
    welcomeContainer: {
      flex: 1,
      justifyContent: 'space-between',
      alignItems: 'center',
      width: '100%',
      maxWidth: 400,
      paddingVertical: 40,
    },
    
    authTitle: {
      fontSize: 48,
      fontWeight: 'bold',
      color: '#fff',
      marginBottom: 10,
      textAlign: 'center',
    },
    
    authSubtitle: {
      fontSize: 18,
      color: '#fff',
      marginBottom: 30,
      textAlign: 'center',
    },
    
    descriptionContainer: {
      width: '100%',
      paddingHorizontal: 20,
      marginBottom: 20,
    },
    
    descriptionText: {
      fontSize: 14,
      color: '#fff',
      marginBottom: 12,
      lineHeight: 20,
    },
    
    buttonContainer: {
      width: '100%',
      alignItems: 'center',
    },
    
    authFormContainer: {
      width: '100%',
      maxWidth: 300,
      alignItems: 'center',
    },
    
    formTitle: {
      fontSize: 32,
      fontWeight: 'bold',
      color: '#fff',
      marginBottom: 40,
      textAlign: 'center',
    },
    
    authInput: {
      backgroundColor: 'rgba(255,255,255,0.9)',
      padding: 15,
      borderRadius: 10,
      marginBottom: 15,
      fontSize: 16,
      width: '100%',
    },
    
    // ErrorBoundary styles
    errorContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 20,
      backgroundColor: '#f5f5f5',
    },
    
    errorTitle: {
      fontSize: 24,
      fontWeight: 'bold',
      color: '#333',
      marginBottom: 16,
      textAlign: 'center',
    },
    
    errorMessage: {
      fontSize: 16,
      color: '#666',
      textAlign: 'center',
      marginBottom: 24,
      lineHeight: 24,
    },
    
    // ErrorScreen styles
    errorScreenContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: '#F0F4F8',
      padding: 20,
    },
    
    errorScreenTitle: {
      fontSize: 24,
      fontWeight: 'bold',
      color: '#E53E3E',
      marginBottom: 10,
    },
    
    errorScreenMessage: {
      fontSize: 16,
      color: '#4A5568',
      textAlign: 'center',
      marginBottom: 30,
      lineHeight: 22,
    },
    
    // LoadingScreen styles
    loadingContainer: {
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: 'transparent',
      zIndex: 9999,
    },
    
    loadingBackgroundImage: {
      opacity: 0.1,
    },
    
    loadingMessage: {
      marginTop: 20,
      fontSize: 18,
      color: '#ffffff',
      textAlign: 'center',
      fontFamily: 'System',
    },
    
    // SplashScreen styles
    splashContainer: {
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      backgroundColor: '#ffffff',
    },
    
    splashLogo: {
      width: '100%',
      height: '100%',
    },
    
    // Common component styles
    section: {
      backgroundColor: theme.surface,
      padding: 20,
      borderRadius: 12,
      marginBottom: 20,
    },
    
    subtitle: {
      fontSize: 16,
      color: '#ffffff',
      marginBottom: 10,
      lineHeight: 24,
      textShadow: '-1px -1px 1px #000',
    },
    
    description: {
      fontSize: 14,
      color: theme.textSecondary,
      lineHeight: 20,
      marginBottom: 15,
    },
    
    // Modal styles
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.5)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    
    modalContainer: {
      backgroundColor: theme.surface,
      padding: 20,
      borderRadius: 12,
      width: '90%',
      maxWidth: 400,
    },
    
    modalTitle: {
      fontSize: 20,
      fontWeight: 'bold',
      color: theme.text,
      marginBottom: 15,
      textAlign: 'center',
    },
    
    modalText: {
      fontSize: 16,
      color: theme.text,
      marginBottom: 20,
      textAlign: 'center',
    },
    
    // Password modal
    passwordInput: {
      backgroundColor: theme.inputBackground,
      color: theme.text,
      padding: 12,
      borderRadius: 8,
      marginBottom: 15,
      borderWidth: 1,
      borderColor: theme.border,
      fontSize: 16,
    },
    
    // Navigation
    navButton: {
      backgroundColor: theme.surface,
      padding: 12,
      borderRadius: 8,
      marginBottom: 10,
    },
    
    navButtonText: {
      color: theme.text,
      fontSize: 16,
      fontWeight: '600',
    },
    
    backButton: {
      padding: 10,
      marginBottom: 10,
    },
    
    backButtonText: {
      color: theme.text,
      fontSize: 16,
    },
    
    homeButton: {
      backgroundColor: darkMode ? '#444' : '#e0e0e0',
      padding: 8,
      borderRadius: 5,
    },
    
    homeButtonText: {
      color: theme.text,
      fontSize: 14,
    },
    
    // Icon button (for visual creator and age rating)
    iconButton: {
      backgroundColor: darkMode ? '#333' : '#f8f9fa',
      borderWidth: 2,
      borderColor: darkMode ? '#555' : '#e0e0e0',
      borderRadius: 12,
      padding: 10,
      alignItems: 'center',
      minHeight: 80,
      justifyContent: 'center',
    },
    
    iconButtonSelected: {
      borderColor: '#4CAF50',
      backgroundColor: darkMode ? '#1a4a1a' : '#e8f5e8',
    },
    
    iconButtonText: {
      fontSize: 11,
      fontWeight: 'bold',
      color: theme.text,
      textAlign: 'center',
    },
  };
};
